# 📖 BITÁCORA · Simulador de Proyectos de Inversión (SIMPRO)

> **Documento vivo** que describe el proyecto de punta a punta. Diseñado para
> que cualquier humano o IA pueda tomar el proyecto en frío y entender qué es,
> cómo está hecho, en qué estado está, y qué decisiones se tomaron y por qué.
>
> **Última actualización**: 2026-10-23 (noche) — mecánica propia por tipo dentro de la simulación para los 19 tipos (migraciones 054 a 060), golpes de eventos que se diluyen y eventos generales por rubro (ver `PLAN-TIPOS-DE-PROYECTO.md` y "Retomar aquí" en §10)
> **Mantenedor**: Ronald Martínez Jimenes (`ronaldmartinezjimenes@gmail.com`)
> **Lee primero**: secciones 1, 2, 3, 7 para onboarding rápido. Para implementar:
> §13 (schema), §14 (ciclos de vida), §15 (motores) y §16 (recetas).

---

## 1. Idea del producto · qué es y para quién

**SIMPRO** es una **plataforma educativa web** que permite a estudiantes
universitarios bolivianos **construir un proyecto de inversión completo en 9
etapas** (datos generales, demanda, inversiones, personal, costos, gastos,
financiamiento, capital de trabajo, resumen) y luego **simular su evolución
durante 5 años** enfrentando eventos económicos reales del contexto boliviano
(inflación, sequía, devaluación, etc.).

**Usuarios primarios**:
- **Estudiante** — construye un proyecto, lo entrega por etapas para que el
  docente lo califique, simula y compite en el podio del curso.
- **Docente** — crea cursos, publica casos de ejemplo, califica entregas,
  lanza eventos en vivo durante las clases, ve el progreso de su grupo.
- **Admin** — gestión de usuarios, ver/editar todo el sistema.

**Contexto pedagógico**: pensado para una materia tipo "Análisis Financiero"
o "Formulación de Proyectos" en universidades bolivianas. Los eventos del
motor de simulación están localizados (SENASAG, dólar paralelo, sequía
altiplano, etc.). La moneda es BOB y el lenguaje, español rioplatense neutro.

**Tamaño actual**: ~30 alumnos por curso, varios cursos por docente.
Arquitectura preparada para escalar a cientos.

---

## 2. Stack técnico

| Capa | Tecnología |
|------|------------|
| **Frontend** | React 18 + TypeScript + Vite |
| **Routing** | React Router v6 (lazy-loaded con Suspense) |
| **Estado global** | Zustand (auth, proyecto, simulación) |
| **Estilos** | Tailwind CSS + clsx + tailwind-merge |
| **Iconos** | lucide-react |
| **Gráficos** | recharts (chunk separado, solo carga al simular) |
| **Excel export** | xlsx-js-style (dinámico, solo al click admin) |
| **Form** | react-hook-form + Zod |
| **PWA** | vite-plugin-pwa con Workbox (auto-update OTA) |
| **Tests** | Vitest (211 tests al día de hoy) |
| **Backend** | Supabase (Postgres + Auth + Storage + Edge Functions) |
| **Auth** | Supabase Auth (email/password + Google OAuth con PKCE) |
| **Hosting** | Vercel (deploy automático desde main) |
| **Monitoreo (opcional)** | Sentry — gated por `VITE_SENTRY_DSN` |
| **Email (opcional)** | Resend desde Edge Function `notificar-nota` |

---

## 3. Estado actual · 100% operativo

✅ **Live en producción**: `https://simulador-pro-seven.vercel.app`
✅ **Base de datos**: Supabase project `syfbgauvictgykdptamb` (region `us-east-2`)
✅ **PWA instalable** en Android, iOS y desktop (con auto-update OTA)
✅ **Tests verdes** (266/266), TypeScript clean, build OK
✅ **Seguridad RLS**: todas las tablas protegidas, escalada de privilegios
   bloqueada por trigger (migración 018)
✅ **Migraciones SQL** aplicadas hasta la 033 (ver §6)

**Pendientes opcionales** (gated, app funciona sin ellos — ver §10):
- Activar Sentry (5 min): crear cuenta y agregar `VITE_SENTRY_DSN` a Vercel.
- Activar emails de calificación (15 min): cuenta Resend + deploy de la
  Edge Function `notificar-nota` (`supabase/functions/notificar-nota/README.md`).

---

## 4. Features (mapa funcional)

### 4.1 Para el ESTUDIANTE

| Feature | Ruta | Archivo principal |
|---------|------|-------------------|
| Login (email + Google) | `/login` | `routes/login.tsx` |
| Registro | `/registro` | `routes/registro.tsx` (sin selector rol — siempre estudiante) |
| Panel personal | `/estudiante` | `routes/dashboard-estudiante.tsx` |
| Constructor proyecto (9 pasos) | `/construir` | `routes/construir-proyecto.tsx` + `components/constructor/pasos/*` |
| Galería de 51 ejemplos | `/ejemplos` | `routes/galeria-ejemplos.tsx` + `lib/plantillas.ts` |
| Simular (5 años, eventos) | `/simular` | `routes/simular-proyecto.tsx` |
| Escenarios + análisis de riesgo (veredicto, tornado, Montecarlo, tabla precio × demanda) | `/escenarios` | `routes/escenarios.tsx` + `components/escenarios/PanelEscenarios.tsx` + `AnalisisRiesgo.tsx` + `lib/analisis-riesgo.ts` |
| Presentar proyecto (14 diapositivas, incluye escenarios y simulación de riesgo) | `/presentar/:id` | `routes/presentar-proyecto.tsx` + `components/presentacion/VisorPitch.tsx` + `lib/presentacion-proyecto.ts` |
| Mis entregas | `/mis-entregas` | `routes/mis-entregas.tsx` |
| Evaluación final | `/evaluacion` | `routes/evaluacion-final.tsx` |
| Mi perfil | `/perfil` | `routes/mi-perfil.tsx` |

**Tipos de proyecto que puede tener un alumno**:
- 🎓 **Caso del curso** (`entrega_estudiante`): copia del caso que publicó el docente.
- 📁 **Individual** (`libre`): proyecto propio del alumno.
- 🤝 **Grupal** (`proyecto_grupal`): compartido con su grupo.

**Modelos de ingreso disponibles** en el constructor:
- `unidades` — productos × cantidad × precio (default).
- `suscripcion` — base recurrente con altas y churn. **Multi-plan**: el alumno
  puede tener varios planes (básico/VIP/premium) cada uno con su cuota, churn
  y altas; la proyección suma todos. Ver §7.12.
- `publicidad` — audiencia × CPM.
- `costo_beneficio` — evaluación por beneficio incremental.

### 4.2 Para el DOCENTE

| Feature | Lugar | Archivo principal |
|---------|-------|-------------------|
| Panel + lista de cursos | `/docente` | `routes/dashboard-docente.tsx` |
| Crear curso (con flags simulación) | botón en panel | `routes/dashboard-docente.tsx` |
| **Podio del curso** | tab "Podio" | `components/curso/PodioCurso.tsx` |
| Ranking (simulación en vivo) | tab "Ranking" | `components/docente/RankingCurso.tsx` |
| Lista de inscritos | tab "Inscritos" | inline en `dashboard-docente.tsx` |
| **Entregas + revisión** | tab "Entregas" | `components/docente/EntregasCurso.tsx` |
| Grupos | tab "Grupos" | `components/curso/GruposDocente.tsx` |
| Casos del curso | tab "Casos" | `components/curso/CasosCurso.tsx` |
| **🎲 Lanzar situación en vivo** | tab "Lanzar situación" | `components/docente/LanzadorEventos.tsx` |
| Galería de 51 ejemplos | `/ejemplos` | `routes/galeria-ejemplos.tsx` |
| Catálogo de eventos | `/eventos` | `routes/catalogo-eventos.tsx` |

**3 modales de revisión** (todos en `components/docente/`):
1. `ModalRevisarEntrega` — revisar UNA entrega individual. Si el alumno tiene
   OTRAS pendientes del mismo proyecto, ofrece un checkbox (marcado por
   defecto) para aplicar la misma nota+comentario+decisión a todas. Ver §7.13.
2. `ModalRevisionMasiva` — revisar varias etapas con tabs (nota distinta por etapa).
3. `ModalCalificarTodoIgual` — MISMA nota+comentario para todas las pendientes
   (botón desde la tarjeta del alumno, sin abrir tab por tab).

### 4.3 Para el ADMIN

| Feature | Ruta |
|---------|------|
| Panel admin | `/admin` |
| Cambiar rol de usuarios | inline en admin |
| (Capacidad RLS) | ver todo, modificar todo (vía `es_admin_actual()`) |

### 4.4 Sistema de simulación

**3 modos** seteables al crear el curso (`cursos.modo_simulacion`):

| Modo | Comportamiento |
|------|----------------|
| `automatico` | El motor sortea eventos cada turno según probabilidad. Para tarea en casa. |
| `docente_dispara` | El motor no mete eventos solos. Espera que el docente lance desde la pestaña "🎲 Lanzar situación". |
| `curado` | El docente pre-elige una lista de eventos al crear el curso. Se aplican en orden. |

**Lanzador en vivo** (independiente del modo): cualquier docente puede
disparar un evento manualmente desde su panel. El alumno lo ve aparecer en
≤8 segundos con borde ámbar y banner "SITUACIÓN LANZADA POR TU DOCENTE EN
VIVO". Tres filtros:
- **Alcance**: a qué tipo de proyecto (caso curso / individual / grupal / todos).
- **Sectorial**: solo a alumnos cuyo proyecto coincida con `eventos.sectores_afectados`, salvo que el docente fuerce con un toggle.
- **Tipos simulables del curso**: el docente decide qué tipos se pueden simular (config del curso).

**Dashboard de respuestas**: cada disparo en el historial es clickeable y
muestra el desglose A/B/C/D con barras (qué eligió el alumno).

---

## 5. Estructura de carpetas (alto nivel)

```
/home/user/simuladorPRO/
├── src/
│   ├── App.tsx                    Routes con React.lazy (code-splitting)
│   ├── main.tsx                   Bootstrap: orientation lock, Sentry, PWA OTA
│   ├── routes/                    Una por pantalla (13 archivos)
│   ├── components/
│   │   ├── auth/                  Login, BotonGoogle, ProtectedRoute
│   │   ├── constructor/           Wizard de 9 pasos + FichaPedagogica
│   │   │   └── pasos/             Paso1Datos, Paso2Proyeccion, ..., Paso9Resumen
│   │   ├── curso/                 GruposEstudiante, GruposDocente, CasosCurso, PodioCurso
│   │   ├── docente/               RankingCurso, EntregasCurso, ModalRevisar*,
│   │   │                          LanzadorEventos, DetalleEntregaPasoAPaso
│   │   └── layout/                RootLayout, BadgeRevisionesNuevas,
│   │                              BotonInstalarApp, CreditoAutor
│   ├── lib/                       Lógica pura, queries Supabase, helpers
│   │   ├── supabase.ts            cliente con PKCE
│   │   ├── auth-helpers.ts        registro, login, OAuth, procesar callback
│   │   ├── cursos-supabase.ts     CRUD de cursos, ranking, inscripciones
│   │   ├── proyecto-supabase.ts   CRUD de proyectos, entregas, casos del curso
│   │   ├── grupos-supabase.ts     CRUD de grupos y miembros
│   │   ├── simulacion-supabase.ts simulaciones y turnos
│   │   ├── eventos-supabase.ts    catálogo de eventos
│   │   ├── lanzador-eventos.ts    disparar eventos a un curso + dashboard
│   │   ├── podio-supabase.ts      top 3 individual + grupal + tu posición + racha
│   │   ├── plantillas.ts          51 plantillas de ejemplo (con veredicto y "qué enseña")
│   │   ├── proyecto-factory.ts    crearProyectoVacio + 6 ejemplos del paseo
│   │   ├── flujo-proyecto.ts      motor de flujo de caja (VAN/TIR/Payback/WACC)
│   │   ├── calculo-financiero.ts  funciones puras V1
│   │   ├── calculo-financiero-v2.ts  V2 (sensibilidad, montecarlo, equilibrio)
│   │   ├── motor-eventos.ts       motor de simulación turno a turno
│   │   ├── notas.ts               cálculo de nota final ponderada
│   │   ├── exportar-excel.ts      export xlsx (admin, dinámico)
│   │   ├── sentry.ts              init (gated)
│   │   └── pwa-update.ts          registro SW + OTA con recarga única
│   ├── hooks/
│   │   ├── useAutoGuardado.ts     debounce 1s, persiste el proyecto en BD
│   │   ├── useIntervaloVisible.ts polling solo con pestaña visible
│   │   └── useEsDispositivoMobil.ts UA + screen.width + standalone
│   ├── stores/                    Zustand
│   │   ├── auth-store.ts          sesión, perfil, login, register, OAuth
│   │   ├── proyecto-store.ts      proyecto activo + acciones de edición
│   │   └── simulacion-store.ts    simulación activa + turnos + evento forzado
│   └── types/                     interfaces TS
│       ├── proyecto.ts            Proyecto, Producto, Item, etc.
│       ├── evento.ts              Evento, OpcionDecision, Modificadores
│       ├── simulacion.ts          Simulacion, EstadoSimulacion, TurnoHistorial
│       └── usuario.ts             Perfil, DatosRegistro
├── supabase/
│   ├── migrations/                23 archivos numerados (ver §6)
│   └── functions/
│       └── notificar-nota/        Edge Function (opcional) + README de activación
├── public/                        Iconos PWA, favicon, manifest se genera con plugin
├── vite.config.ts                 PWA config (manualChunks, workbox, manifest)
├── pwa-assets.config.ts           Generación de iconos desde SVG fuente
├── tailwind.config.js             Theme custom (HSL vars)
├── package.json                   Dependencias
├── BITACORA.md                    ESTE ARCHIVO
└── README.md                      (mínimo, ver BITACORA)
```

---

## 6. Migraciones SQL · qué hace cada una

> **Todas aplicadas en producción**. Si necesitás reaplicar desde cero, correlas
> en orden. Cada una es idempotente (`IF NOT EXISTS` donde aplica).

| # | Archivo | Qué agrega |
|---|---------|------------|
| 001 | `fase1_auth.sql` | `perfiles`, `cursos`, `inscripciones` + RLS básico |
| 002 | `fase3_proyectos.sql` | `proyectos` (datos JSONB) + RLS |
| 003 | `fix_rls_recursion.sql` | Funciones SECURITY DEFINER para evitar recursión |
| 004 | `curso_opcional.sql` | `proyectos.curso_id` puede ser NULL (proyectos libres) |
| 005 | `fase5_eventos.sql` | Tabla `eventos` |
| 006 | `fase5_eventos_seed.sql` | Carga ~50 eventos bolivianos reales |
| 007 | `fase6_simulaciones.sql` | `simulaciones` + `turnos_historial` |
| 008 | `docente_lee_simulaciones.sql` | RLS para que el docente vea sims de sus alumnos |
| 009 | `casos_curso_y_entregas.sql` | `entregas`, tipo `caso_curso`, `paso_inicio_estudiante` |
| 010 | `modos_simulacion.sql` | `cursos.modo_simulacion` y `eventos_curados` |
| 011 | `fix_rls_recursion_casos.sql` | Más helpers DEFINER para casos |
| 012 | `admin_y_google_oauth.sql` | `perfiles.es_admin` + trigger Google OAuth |
| 013 | `grupos_y_ponderacion.sql` | `grupos`, `grupo_miembros`, pesos individual/grupal |
| 014 | `curso_permite_proyecto_libre.sql` | Flag para deshabilitar proyectos libres |
| 015 | `grupos_liderados_por_estudiante.sql` | Estudiante crea/se une a grupos |
| 016 | `entregas_por_paso.sql` | `entregas.paso_entregado` + unique (proy, paso, intento) |
| 017 | `entregas_grupales_distribuidas.sql` | View `promedio_estudiante` reparte nota grupal |
| 018 | `endurecimiento_seguridad.sql` | **CRÍTICO** — trigger que impide auto-promoción a admin |
| 019 | `normalizar_universidad.sql` | UPPER+TRIM en `perfiles.universidad` |
| 020 | `universidad_en_curso.sql` | `cursos.universidad` (la universidad la define el curso) |
| 021 | `indices_consultas_calientes.sql` | Índices compuestos para entregas y grupos |
| 022 | `lanzador_eventos_docente.sql` | `eventos_disparados` + `simulaciones.evento_forzado_id` |
| 023 | `tipos_proyecto_simulables.sql` | `cursos.simulacion_caso_curso/individual/grupal` |
| 024 | `entregas_miembros_grupo_leen.sql` | Policy SELECT adicional: miembros del grupo leen entregas del proyecto compartido |
| 025 | `proyecto_actividad.sql` | Tabla de actividad por usuario + RLS. Audit de quién editó/entregó proyectos grupales. |
| 026 | `escenarios_config_por_curso.sql` | Columna `cursos.escenarios_config` (JSONB). El docente ajusta los % de Optimista/Pesimista por curso. NULL = defaults del código. |
| 027 | `curso_semana_e.sql` | Columna `cursos.es_semana_e` (BOOL). Modo evento universitario: oculta entregas/notas/podio, muestra banner + checklist al estudiante. |
| 034 | `eventos_turismo.sql` | 10 eventos exclusivos del tipo turismo (`sectores_afectados = ['tipo:turismo']`). Aplicada el 2026-10-22. |
| 035 | `eventos_suscripcion.sql` | 10 eventos exclusivos del tipo suscripción (`'tipo:suscripcion'`). Aplicada el 2026-10-22. |
| 036 | `eventos_productos.sql` | 12 eventos de gastronomía, producción y comercio (`'tipo:gastronomia'`, etc.). Aplicada el 2026-10-22. |
| 037 | `eventos_medios.sql` | 10 eventos de medios y publicidad. Aplicada el 2026-10-22. |
| 038 | `eventos_eventos.sql` | 10 eventos de eventos y servicios con fechas pico. Aplicada el 2026-10-22. |
| 039 | `eventos_marketing.sql` | 11 eventos de marketing y campañas. Aplicada el 2026-10-22. |
| 040 | `eventos_social.sql` | 11 eventos de proyectos sociales y ONG. Aplicada el 2026-10-22. |
| 041 | `eventos_costo_beneficio.sql` | 11 eventos de costo-beneficio (ahorro y eficiencia). Aplicada el 2026-10-22. |
| 042 | `eventos_alquiler.sql` | 11 eventos de alquiler y renta de activos. Aplicada el 2026-10-23. |
| 043 | `eventos_agricultura.sql` | 11 eventos de agricultura y agroindustria. Aplicada el 2026-10-23. |
| 044 | `eventos_servicios.sql` | 7 eventos de servicios (solo situaciones válidas para cualquier servicio; lo de software va en tecnología). Aplicada el 2026-10-23. |
| 045 | `eventos_tecnologia.sql` | 8 eventos de tecnología (válidos para SaaS y app de delivery). Aplicada el 2026-10-23. |
| 046 | `eventos_comunicacion.sql` | 7 eventos de comunicación institucional para el tipo marketing (MKT012-MKT018). Aplicada el 2026-10-23. |
| 047 | `eventos_educacion_salud.sql` | 8 eventos de educación y salud públicas para el tipo social (SOC012-SOC019). Aplicada el 2026-10-23. |
| 048 | `eventos_salud_privada.sql` | 11 eventos de salud privada (SAL001-SAL011). Aplicada el 2026-10-23. |
| 049 | `eventos_educacion_privada.sql` | 9 eventos de educación privada, de colegio (EDP001-EDP009). Aplicada el 2026-10-23. |
| 050 | `eventos_franquicia.sql` | 10 eventos de franquicia, lado franquiciado (FRA001-FRA010). Aplicada el 2026-10-23. |
| 051 | `eventos_concesion.sql` | 10 eventos de concesión de infraestructura, red de agua (CON001-CON010). Aplicada el 2026-10-23. |
| 052 | `eventos_microcredito.sql` | 11 eventos de microcrédito (MIC001-MIC011). Aplicada el 2026-10-23. |
| 053 | `cobranza_en_eventos.sql` | UPDATE de las opciones de SAL001, SAL011, SRV001 y SOC001: ahora mueven `dias_cobro`. Aplicada el 2026-10-23. |
| 033 | `docente_lanza_evento_rpc.sql` | Función SECURITY DEFINER `lanzar_evento_a_simulaciones(uuid[], text)`: el docente solo podía LEER simulaciones, el UPDATE de `evento_forzado_id` no afectaba filas ("llegó a 0 alumnos"). La función solo escribe ese campo en simulaciones activas de cursos del docente. Aplicada el 2026-10-18. (028-032: Semana E y grupos, ver archivos.) |

---

## 7. Decisiones de diseño · el "porqué" detrás del código

> Esta sección documenta las decisiones que NO son obvias desde el código. Si
> en algún momento parece "raro" cómo está hecho algo, primero buscá acá.

### 7.1 Modelo de datos: 1 JSONB en vez de 9 tablas
El proyecto del alumno (inversiones, personal, costos, etc.) va **completo en
`proyectos.datos` (JSONB)**, no en tablas relacionales. Razón:
- Cada estudiante tiene su versión, sin compartir referencias.
- Hace el `snapshot_datos` de la entrega trivial (copia del JSONB).
- Simplifica los cálculos del motor (recorre arrays en JS, no JOINs).
- Trade-off: no se puede hacer queries sobre el contenido (ej. "alumnos con
  más de 5 productos"). No es necesario para el caso de uso.

### 7.2 Seguridad: trigger para campos sensibles del perfil
La política RLS `perfiles_self_update` solo valida `auth.uid() = id`. Sin
trigger, un alumno con la anon key podía hacer `UPDATE perfiles SET es_admin=true`.
La migración 018 agrega `proteger_campos_sensibles_perfil` que fuerza `rol` y
`es_admin` a sus valores anteriores si el usuario NO es admin. **No quitar.**

### 7.3 Registro siempre como estudiante
El formulario de registro NO permite elegir rol (se hardcodea `estudiante`).
Para crear un docente, un admin lo promueve desde `/admin`. Evita que un alumno
se equivoque y quede afuera del ranking.

### 7.4 Universidad en el curso, no en el perfil
Antes cada alumno escribía su universidad y aparecían 3 variantes
("ucatec/Ucatec/UCATEC"). Ahora el docente la define al crear el curso. La
columna `perfiles.universidad` se mantiene por compat pero no se llena.

### 7.5 Polling en lugar de Realtime
Para 30 usuarios, el polling consciente de visibilidad
(`useIntervaloVisible`) consume lo mismo que websockets pero con 0 superficie
de fallo nueva. Si la app crece a cientos, migrar a Supabase Realtime.

### 7.6 Lanzador OTA: `evento_forzado_id` en `simulaciones`
Cuando el docente dispara un evento, no usamos un "queue" de mensajes, sino
que escribimos el `evento_id` directo en `simulaciones.evento_forzado_id` de
los proyectos afectados. El alumno hace polling cada 8s y lo lee. Al avanzar
turno, el motor lo limpia. Más simple que un sistema de notificaciones real.

### 7.7 Service Worker generado por Workbox + OTA con recarga única
El SW se genera en el build (no se edita a mano — se regenera siempre). El
`vite-plugin-pwa` ya maneja el `controllerchange` para que la recarga sea ÚNICA.
Configuración en `vite.config.ts` (skipWaiting + clientsClaim) + registro
manual en `src/lib/pwa-update.ts`.

### 7.8 PWA solo en móvil
El banner "Instalar app" se muestra solo si el UA es Android/iOS. En desktop
Chrome ya tiene su propio botón "Instalar" en la barra y nuestro banner sobra.
Implementación en `components/layout/BotonInstalarApp.tsx`.

### 7.9 Sentry y Email: gated
Ambos están instalados pero **no se activan sin configuración del owner**:
- Sentry: requiere `VITE_SENTRY_DSN` en Vercel.
- Email: requiere desplegar la Edge Function `notificar-nota` con `RESEND_API_KEY`
  + crear el Database Webhook sobre `entregas` UPDATE.
La razón: ambos requieren cuentas externas (Sentry, Resend). El código está
listo, se "enciende" con 5-15 min de setup del owner.

### 7.10 Tipos simulables por curso
El docente decide qué tipos (caso/individual/grupal) se pueden simular en su
curso. Defaults: caso=ON, individual=OFF, grupal=ON. Esto es porque
típicamente el docente quiere que todos analicen el mismo caso, no el
proyecto personal de cada uno.

### 7.11 InputNumero: redondeo a 4 decimales en blur
Evita el error típico del alumno que pega `0.733333` (resultado de 22/30 sin
redondear). Cubre cualquier precisión legítima del simulador.

### 7.12 Suscripciones multi-plan (FASE 24)
Antes el modelo de suscripción solo permitía UN plan único (suscriptores,
altas, churn, cuota). Ahora `suscripcionV2.planes?: PlanSuscripcion[]` es
opcional; cada plan tiene sus 4 parámetros independientes. El motor financiero
no se tocó: el store genera **un producto portador por plan** (cantidades =
promedio de suscriptores año a año, precio anual = cuota × 12) y los suma.

**Retro-compat total**: proyectos viejos sin `planes[]` se leen como "Plan
único" vía `lib/planes-suscripcion.ts::obtenerPlanesSuscripcion`. Las 26
plantillas (gimnasio, podcast, etc.) no necesitaron cambios porque caen al
fallback legacy. Los campos planos (`suscriptoresIniciales`, etc.) se
sincronizan con el primer plan para no romper código viejo.

**UI**: `PanelSuscripcion` en `Paso2Proyeccion.tsx` ahora muestra una tarjeta
por plan con LTV/techo/ingreso año 1 propios + tabla agregada que suma todo.

### 7.13 Revisión batch desde el modal individual
El docente abre la Etapa 1 de un alumno, califica y cierra. La tarjeta del
alumno no se va de "Pendientes" porque las Etapas 2 y 3 siguen pendientes.
Antes había que abrir tab por tab.

Ahora, si el modal individual detecta que el mismo alumno+proyecto tiene
otras pendientes, muestra un checkbox **marcado por defecto** "Aplicar
también a N etapa(s) pendiente(s) del alumno". Al confirmar, se ejecuta
`Promise.allSettled` con `revisarEntrega` por cada una. La tarjeta
desaparece de "Pendientes" con un solo clic.

Implementación: `EntregasCurso` calcula `otrasPendientes` filtrando las del
mismo grupo (excluyendo la abierta) y se las pasa al `ModalRevisarEntrega`.

---

## 8. Variables de entorno

### En el cliente (Vite, expuestas al browser)
```env
VITE_SUPABASE_URL=https://syfbgauvictgykdptamb.supabase.co
VITE_SUPABASE_ANON_KEY=...                  # anon key pública (RLS protege)
VITE_SENTRY_DSN=                            # OPCIONAL — vacío = Sentry off
```

### En las Edge Functions de Supabase (no expuestas)
```env
RESEND_API_KEY=re_...                       # cuenta de envío de emails
EMAIL_FROM=...                              # opcional, default onboarding@resend.dev
SUPABASE_URL=...                            # auto-disponible
SUPABASE_SERVICE_ROLE_KEY=...               # auto-disponible
```

### En Vercel
Las `VITE_*` se setean en Settings → Environment Variables → Production.
El deploy es automático desde la rama `main`.

---

## 9. Cómo desplegar · paso a paso

### Frontend (Vercel)
1. `git push origin main` → Vercel detecta y buildea.
2. ~1-2 min después, el deploy queda live.
3. Los alumnos con PWA instalada reciben la actualización automática al abrir
   la app (OTA implementado en `pwa-update.ts`).

### Backend (Supabase) — solo si hay nueva migración
1. Abrir Supabase Dashboard → SQL Editor.
2. Pegar el contenido del archivo nuevo en `supabase/migrations/NNN_*.sql`.
3. Run. Verificar que no hay errores (las migraciones son idempotentes).

### Edge Functions (opcional, para email)
Ver `supabase/functions/notificar-nota/README.md`. Requiere CLI de Supabase.

---

## 10. Roadmap · ideas evaluadas, pendientes, descartadas

### Activables ya (solo falta config del owner)
- [ ] **Sentry** → crear cuenta en sentry.io, pegar DSN en Vercel. ~5 min.
- [ ] **Email de nota nueva** → crear cuenta Resend, deploy de la Edge
      Function `notificar-nota`, crear webhook. ~15 min.

### Hecho recientemente
- [x] **Múltiples planes de suscripción** (`9cfc1dc`, 2026-06-09) — Básico,
      VIP, Premium o los que sumes, cada uno con su churn/cuota/altas. Retro-
      compat total con proyectos y plantillas viejas. Ver §7.12.
- [x] **Revisión batch desde el modal individual** (`72fcedd`, 2026-06-09) —
      Calificar todas las pendientes del alumno desde el modal de UNA etapa.
      Ver §7.13.

- [x] **Sesión 2026-10-14** (`ff4b7ed`, `7e78c1c`, `584b49e`):
      - Semana E escondida del panel docente con el flag `SEMANA_E_OCULTA`
        (`lib/permisos-admin.ts`). El código se conserva; se sigue gestionando
        desde la pestaña Admin. Para mostrarla de nuevo: flag en `false`.
      - Botón "Ver como estudiante" / "Volver a docente" en `RootLayout`
        (store: `alternarVistaEstudiante`, `perfilReal`). Solo visual, en
        memoria; `BotonEntregar` queda desactivado en esa vista.
      - Modo local nunca se activa en el build de producción salvo
        `VITE_LOCAL_MODE=true` (evita perder datos si faltan variables).
      - ErrorBoundary "Limpiar todo" conserva `simulador.local.*`.
      - Entregas "Por etapa": sin "Calificar todo igual" (mezcla alumnos).
      - `local/sincronizar.sh|.bat`: confirmación al subir desde `main`.
      - Review con `/code-review`; skills recomendadas guardadas en memoria.

- [x] **Sesión 2026-10-18** (`be812ff`, `2c6c5dd`) — prueba con 4 "estudiantes"
      simulados (novato, intermedio, experto en finanzas, técnico) en modo local:
      - `InputNumero` y los inputs de Paso2Proyeccion acotan valores
        (`lib/acotar-numero.ts`: tope ±1e12, tasas de crecimiento -100..1000,
        cantidades/costos >= 0). Evita "BsNaN" y desbordes.
      - TIR no calculable (0 exacto del motor) se muestra "—" y payback < 0
        como "∞" (`tirCalculable`, Paso9Resumen y PanelEscenarios).
      - Ruta inexistente ya no deja pantalla en blanco (`Hub` redirige a
        /login o al panel). Doble clic en "Empezar a construir" protegido.
      - `leerProyectosLocal` descarta entradas inválidas. Errores legibles en
        presentar proyecto y en simulación (modo local).
      - Paso 1: nombre marcado como obligatorio; botón de empezar explica por qué
        está deshabilitado.
      - Workflow `keep-alive-supabase.yml`: consulta a la base cada 2 días para
        evitar la pausa del plan gratuito. Usa los secrets `SUPABASE_URL` y
        `SUPABASE_ANON_KEY` (ya cargados en GitHub).
      - `deploy-edge-functions.yml` toma `WEBAPP_API_KEY` del secret de GitHub
        (antes estaba en texto plano; la clave vieja sigue en el historial de
        git pero fue reemplazada por una nueva).
      - Simulador (`motor-eventos.ts > calcularBaseProyecto`): los costos de
        insumos ahora se calculan POR PRODUCTO como en el constructor (antes
        sumaba todos los costos directos y los multiplicaba por las unidades de
        todos los productos, inflando los costos en proyectos con varios
        productos). Test de consistencia: `motor-simulacion-consistencia.test.ts`.
        Nota: el simulador no incluye imprevistos ni IT 3% (simplificacion).
      - UX y velocidad (prueba con 4 agentes UX, sin cambiar etapas ni fórmulas):
        Resumen avisa "Resultado provisional" cuando faltan datos en pasos 3-6
        (`lib/datos-faltantes.ts`); stepper y barra Anterior/Siguiente fijos en
        el constructor, "Borrar proyecto" fuera de la barra, scroll al inicio al
        cambiar de paso; celular: campos 16px/40px, `inputMode="decimal"`,
        `.h-app` (100dvh), texto 9px -> 11px; `vercel.json` con cache inmutable
        de /assets; recharts ya no es chunk manual (no se precarga en el
        arranque); confirmaciones al entregar, abandonar simulación y lanzar
        evento; barras de gráficos en verde/rojo según signo.
      - Textos: voseo pasado a español neutro (tuteo) en toda la UI; tildes de
        "crédito fiscal", "válida", "publicación", "código".
      - Stepper: pasos recorridos sin datos (3-6) se marcan en ámbar con "!" y el
        % completado los descuenta. Escenarios también avisa "Resultado
        provisional". Texto de 10px pasó a 11px.
      - BUG encontrado probando en producción (2026-10-18): el lanzador de
        situaciones decía "llegó a 0 alumnos" porque el docente solo tenía
        SELECT sobre `simulaciones` (008) y el UPDATE de `evento_forzado_id`
        no afectaba filas. Migración 033: función SECURITY DEFINER
        `lanzar_evento_a_simulaciones` (solo escribe evento_forzado_id en
        simulaciones activas de cursos del docente). El cliente usa `rpc` y avisa
        si hay 0 afectadas. 033 YA APLICADA en Supabase (2026-10-18).
      - Prueba end-to-end en producción (2026-10-18, cuentas docente y alumno del
        owner): entrega individual y grupal, calificación (revisión por etapa,
        "calificar todo igual", entrega grupal), podio, simulación 60 meses,
        lanzador de eventos (tras 033), grupos (unirse), catálogo, ejemplos,
        Admin y Excel. TIR no calculable / "No recupera" también en la revisión
        del docente y en Mis entregas. Sin errores de consola.

- [x] **Sesión 2026-10-19** (`73e279e`, `13f9f72`, `89df3f4`, `2705e33` + CI y dependencias):
      Motivo: el owner usaba solo el constructor; Escenarios y Simular existían
      pero la app no llevaba a ellos ("No hay proyecto activo", sin acceso desde
      el proyecto). Se hicieron cuatro fases, sin migraciones ni cambios de
      fórmulas:
      - Fase 1 (recorrido): `AccionesProyecto` suma "Escenarios" y "Simular 5
        años" (cargan el proyecto al store antes de navegar; ocultos en Semana
        E). La barra del constructor ahora se ve también en celular. Escenarios
        sin proyecto activo ofrece elegir uno. "Simular" en el menú del docente.
      - Fase 2 (análisis): `lib/analisis-riesgo.ts` (funciones puras sobre
        `aplicarModificadores` + `construirFlujoCaja`): `calcularTornado`
        (±10% por variable), `tablaPrecioDemanda`, `simularMontecarlo`
        (triangular entre pesimista, base y optimista del curso; semilla fija
        = reproducible; 1000 corridas en Escenarios, 500 en la presentación) y
        `emitirVeredicto` (Robusto / Sensible / Riesgoso / Inviable según la
        probabilidad de VAN > 0: 80% / 50% / 20%). UI en
        `components/escenarios/AnalisisRiesgo.tsx`. Tests en
        `analisis-riesgo.test.ts`. Nota: la BITÁCORA anterior mencionaba
        Montecarlo pero no existía en el código hasta ahora.
      - Fase 3 (simulación): `routes/simular-proyecto.tsx` suma
        `PantallaInicio` (bienvenida antes del primer turno, solo si
        `turno_actual === 0` y sin historial) e `InformeFinal` (noticias
        enfrentadas, decisión elegida, mejor y peor turno, enlace a
        Escenarios). Solo front: el motor y la BD no se tocaron. No probado de
        punta a punta porque la simulación exige Supabase (no corre en modo
        local); sí se probó el render con datos de prueba.
      - Fase 4 (presentación): diapositivas `escenarios` ("Tres futuros
        posibles") y `montecarlo` ("¿Qué tan seguro es?") en nivel medio y
        avanzado (no en Semana E básica). Etiquetas "NN · …" ahora se numeran
        solas en `construirModeloPitch`. Usa los % optimista/pesimista por
        defecto (la presentación no lee la config del curso). El Montecarlo de
        la presentación corre en segundo plano al abrirla.
      - Verificado: `construirFlujoCaja` y `construirFlujoCajaProyecto` dan el
        mismo VAN/TIR (uno envuelve al otro), así que Escenarios, presentación
        y constructor no se contradicen.
      - GitHub: nuevo `.github/workflows/ci.yml` (tests + build en cada push a
        main y en cada PR, Node 22, `npm ci`). Dependencias actualizadas dentro
        de sus rangos (`npm update --ignore-scripts`): @remix-run/router 1.23.4,
        react-router-dom 6.30.6, nanoid, postcss, supabase-js 2.118, sentry
        10.76. Se usó `env -u npm_config_allow_scripts` porque ese entorno
        bloquea `npm update`. El lockfile se regeneró con npm 10 porque el CI
        (Node 22) rechazaba el generado por npm 11 (faltaba esbuild).
      - Unida la rama `claude/mejoras-pedagogicas` (4 mejoras, sin migraciones):
        diagnóstico pedagógico en vivo y boletín de autoevaluación en el Paso 9
        (`lib/diagnostico-pedagogico.ts`, `lib/boletin-proyecto.ts`), post-mortem
        al terminar la simulación (`lib/postmortem-simulacion.ts`,
        `PanelPostmortem`, convive con `InformeFinal` y repite algo de
        información) y pestaña "Diagnóstico" en el curso del docente
        (`DiagnosticoCurso`, usa `listarProyectosDelCurso` con
        `select("*")`). 293 tests. Falta revisar cómo se ven en producción.
      - Rama `claude/financial-admin-review-iXwmO`: su contenido ya está en
        main; se puede borrar (decisión del owner en GitHub).
      - Hallazgo previo, no causado por esta sesión: en modo local de desarrollo
        (`npm run dev` sin `.env`), abrir `/construir` con un proyecto cargado
        en localStorage congela el navegador; ocurre también con el código del
        2026-10-18. No se investigó (producción usa Supabase y funciona).

- [x] **Sesión 2026-10-21** (`c3e549a`) — dos hallazgos reportados por el owner:
      - Proyecto grupal huérfano (grupo borrado al borrar el curso): Mi panel lo
        listaba pero `construir-proyecto.tsx` lo descartaba y caía en
        `EmpezarProyecto` sin salida. Ahora el constructor acepta los
        `proyecto_grupal` propios sin membresía vigente (se pueden abrir y
        borrar). Efecto: también reaparecen proyectos de grupos de los que el
        alumno salió (antes se ocultaban a propósito).
      - "Caso individual" no se podía quitar de un curso: `permite_proyecto_libre`
        solo se fijaba al crearlo (el texto prometía "lo puedes cambiar después"
        sin UI). Casilla "Caso individual" en la cabecera del curso del docente
        (`alternarProyectoIndividual`). Ojo: los "Tipos de proyecto simulables"
        del Lanzador solo afectan la pantalla Simular, no el panel del alumno.
        Sin migraciones; 293 tests. No probado en producción.
      - Barra lateral de escritorio plegable (`RootLayout`): botón con ícono de
        panel en la cabecera, preferencia en `localStorage`
        (`simulador.lateralOculto`). No cambia el menú móvil. Commit `75cb318`.

- [x] **Sesión 2026-10-21 (2)** (`5958962`, `3e2fd3a`, `e98bf1b`) — galería de
      ejemplos y punto de equilibrio. Pedido del owner: que el alumno pueda
      editar un ejemplo, que los ejemplos sean variados y creíbles, y que el
      equilibrio no mezcle productos.
      - Caso del curso: NO es un fallo. `tomarCasoDelCurso` hace una copia
        congelada al tomarlo y el caso ya tomado no se vuelve a ofrecer; si el
        docente cambia el paso de inicio después, la copia vieja no se
        actualiza. El owner decidió dejarlo así. Para probar: borrar la entrega
        y volver a tomar el caso. Sin verificar contra la base.
      - Botón "Usar como base" en `/ejemplos` (solo alumno): crea un proyecto
        libre propio (`tipo: "libre"`, sin curso) y lo abre en el constructor.
        El ejemplo original no cambia. Código en `VisorPlantilla`.
      - `lib/plantillas.ts`: 51 ejemplos (antes 26). 25 nuevos repartidos por
        CÓMO SE MIDE EL BENEFICIO: ventas por unidades, cobro recurrente,
        publicidad, ahorro de costos, ventas adicionales de una acción de
        marketing, pérdidas evitadas, beneficio social, proyectos puntuales,
        alquiler. Categorías nuevas: marketing, social, eventos, alquiler,
        tecnologia. `PlantillaMeta` suma `ensena` (qué aprende el alumno) y
        `veredicto` ("viable" | "marginal" | "rechazo"); la galería los muestra
        como etiqueta y recuadro "Qué enseña este ejemplo". Los ejemplos de
        rechazo son intencionales (campaña masiva de TV, radio comunitaria,
        reforestación a 5 años, planta solar, medio digital).
      - Recalibración de los 26 viejos: 15 tenían TIR de 85% a 811% y plazos de
        recuperación de 0,1 a 0,5 años; 6 daban VAN negativo sin explicación.
        `calibrarDemanda(p, factor)` escala las cantidades de todos los
        productos; el factor está en el registro del final del archivo (se halló
        con el motor para dejar la TIR en 25-60%, o 10-15% en los marginales).
        Limitación: en los de suscripción/publicidad los campos de entrada
        (`suscripcionV2`, `publicidadV2`) no se reescalan y pueden no cuadrar
        del todo con el flujo.
      - Los MONTOS de los 25 ejemplos nuevos son estimaciones de la IA, no
        validadas contra precios de Bolivia: el owner debe revisarlas.
      - Hallazgo del motor: un beneficio que decae (campaña) o ingresos que se
        agotan (película) con costos fijos constantes dan flujos negativos en
        los últimos años y la TIR sale absurda (billones por ciento). Se
        resolvió bajando costos fijos o agregando ingresos de cola.
      - Punto de equilibrio por producto: `lib/equilibrio-por-producto.ts`
        (`calcularEquilibrioPorProducto`). El agregado de siempre sumaba
        unidades de productos distintos sobre un precio promedio. Ahora se
        mantiene la mezcla de ventas del año 1: φ = costos fijos / contribución
        total, y unidades de equilibrio = unidades del año 1 × φ. En
        costo-beneficio devuelve el beneficio anual mínimo. Aplicado en la
        diapositiva "Punto de equilibrio" (`VisorPitch`, eje X en % del volumen
        del año 1) y en la tarjeta PE del Paso 9. NO se cambió el Excel
        (`exportar-excel.ts`) ni el laboratorio de viabilidad
        (`laboratorio-viabilidad.ts`): siguen con el cálculo agregado.
      - Validación posterior (mismo día): visto en producción (51 ejemplos,
        "Qué enseña", diapositiva de equilibrio por producto). Salario mínimo
        2026 en Bolivia = Bs 3.300 (+20%; fuentes citan DS 5503 o DS 5516, a
        confirmar): 52 sueldos de jornada completa de las plantillas estaban por
        debajo y se subieron a 3.300 (los "medio tiempo" no), lo que obligó a
        reajustar 5 ejemplos (lavandería, quinua, salón, parqueo, edificio).
        Diésel: Bs 9,80 al público y cerca de Bs 18 a grandes consumidores
        (agosto-septiembre 2026, fuentes con contradicciones): el ejemplo de la
        flota eléctrica ahora supone diésel a ~Bs 18. Alquileres, sueldos de
        oficios y costos de obra NO se pudieron validar (sin fuente online).
      - El botón "Usar como base" NO se probó en producción: exige una sesión
        de estudiante real y la IA no inicia sesión.
      - Ojo de caché: el service worker del navegador sirvió la galería vieja
        (39 ejemplos) hasta desregistrarlo y recargar; los usuarios la verán
        actualizada por el OTA (§7.7) tras recargar.
      - 373 tests (antes 293). Sin migraciones.

### Retomar aquí (cierre de sesión 2026-10-23) — LEER PRIMERO `PLAN-TIPOS-DE-PROYECTO.md`
RESUMEN DE LA SESION DEL 2026-10-23 (ultimo estado, leer esto primero)
Pedido del owner: que cada tipo de proyecto sea unico y tenga su propia manera de evaluar su viabilidad, no solo
noticias distintas. Resultado, todo publicado en `main` (ultimo commit 1efd6d3), 720 tests en verde, build OK:
1. Motor: los golpes de los eventos ya no se acumulan 60 meses; se diluyen 10% por mes
   (`DECAIMIENTO_MENSUAL_MULTIPLICADORES`). Jugando bien quiebra ~2%, al azar ~40% en promedio.
2. Eventos generales acotados por rubro: `lib/eventos-por-rubro.ts` (tablas `TIPOS_POR_EVENTO_GENERAL` y
   `TIPOS_EXCLUIDOS_POR_EVENTO`). Solo para proyectos con `tipoNegocio`.
3. Mecanica propia por tipo en `lib/motor-eventos.ts` (cada variable es opcional en `EstadoSimulacion`; las
   simulaciones viejas siguen con el calculo comun; sin eventos se reproduce el plan del constructor):
   suscripcion = socios vivos | microcredito = mora | turismo/agricultura/eventos = temporadas
   (`lib/estacionalidad.ts`) | social = fondos de un tercero y beneficio que no es caja | costo-beneficio y marketing =
   beneficio logrado vs esperado | alquiler, educacion, concesion, medios, franquicia, tecnologia, servicios =
   ocupacion con inercia + impagos | salud privada = impagos y glosas | gastronomia, produccion, comercio = merma.
   El detalle por tipo, los alias de eventos y los eventos nuevos estan mas abajo (lista "MECANICA PROPIA POR TIPO").
4. Pantalla del alumno (`routes/simular-proyecto.tsx`): tarjetas segun el rubro (Socios activos, Mora, Temporada,
   Fondos recibidos, Beneficio social, Cobertura, Beneficio logrado, Ocupacion/Audiencia/Marca/Usuarios, Impagos, Merma).
5. Migraciones 054 a 060 (71 eventos nuevos): todas aplicadas en Supabase por el owner. No se modifico ninguna anterior.
6. Plantillas: gimnasio con marketing realista (CAC Bs 333); festival recalibrado (factor 1,12; necesita Bs 1,07 millones de
   capital de trabajo porque sus ingresos llegan juntos); el colchon de caja (`conColchonDeCaja`) deja 60% de margen.
7. Prueba en la app real como estudiante: hostal, gimnasio, microcredito, posta de salud, estacionamiento, restaurante y
   camara de frio. Sin ver en pantalla: turismo con temporadas, medios, franquicia, tecnologia, eventos, educacion,
   concesion (solo por tests). Quedaron copias de prueba en la cuenta de estudiante del owner.
PENDIENTE: (a) calibrar los coeficientes y calendarios con datos de Bolivia (son criterio del equipo); (b) modelar
inventario en bodega y plazo de pago a proveedores; (c) decidir la dureza del juego (al azar quiebran entre 40% y 70%
los negocios sanos; subir `DECAIMIENTO_MENSUAL_MULTIPLICADORES` a 0,15 o 0,20 la baja); (d) ver en pantalla los tipos
que faltan; (e) los 4 tipos sin ficha (cultural, TI interna, infraestructura publica, cumplimiento normativo);
(f) decidir si `docs/metodologia/` se sube a GitHub.
Lo que sigue es el estado anterior de la sesion (se conserva como historia):
Estado: Fases 1.2, 2 y 3 del plan COMPLETAS para todas las categorías con plantilla. Migraciones
036 a 052 aplicadas en Supabase; la tabla `eventos` tiene 238 filas (50 generales y
188 propios por tipo, 034 a 052). Publicado en `main` (ead8e79). 513 tests en verde,
build OK. Sin cambios de app para el alumno: solo eventos nuevos en la base. Recetas y reglas operativas: plan §5 y §6.

Hecho también: 1.2 (el lanzador del docente muestra el nombre del tipo) y las fichas
de comunicación, educación y salud públicas ya tienen eventos (046, 047).
Fase 3 hecha: 5 plantillas nuevas en la galería (clínica, colegio, franquicia, concesión
de agua, microcrédito; categorías salud_privada, educacion_privada, franquicia, concesion,
microcredito) con sus eventos propios (048 a 052). Sus cifras son estimaciones del equipo,
no datos auditados: calibrarlas con gremios (sección 10 de cada ficha).
Fase 4 (camino A, panel de indicadores sin tocar fórmulas) HECHA para todos los tipos:
`lib/indicadores-por-tipo.ts` + `components/constructor/PanelIndicadoresTipo.tsx`, mostrado en el
resumen final del constructor (Paso9Resumen) según `tipoNegocio`. Hay paneles de turismo,
suscripción, salud privada, microcrédito, social, alquiler, medios, ahorro, marketing y un panel
general (gastronomía, producción, comercio, servicios, tecnología, educación privada, franquicia,
concesión, agricultura y eventos); las 56 plantillas tienen panel. Campos opcionales nuevos:
`Proyecto.capacidadAnual`, `Proyecto.beneficiarios` y `Producto.capacidadAnual`. Los umbrales de
color y los días ilustrativos (cobrar a 45 o 90 días, stock de 10 a 60 días) son criterios del
equipo, no datos de Bolivia: calibrarlos en la Fase 5. El hostal se recalibró (70% de ocupación).
Lección: el comando `npx tsc --noEmit -p .` de la raíz NO revisa tipos; la compuerta real es
`npm run build`. Falta (4.3): llevar estos indicadores también al diagnóstico pedagógico y al
boletín. Siguiente: Fase 5 (calibración con datos de Bolivia y prueba en la app real de un
proyecto de cada tipo, que requiere sesión de estudiante).
Motor de la simulación (cambiado el 2026-10-23, simulaciones en curso incluidas):
- Ahora SÍ se aplica el golpe (`modificadores`) del evento antes de la decisión, al 60%
  (`INTENSIDAD_GOLPE_EVENTO` en `lib/motor-eventos.ts`). Antes solo valían las opciones y hasta
  los ejemplos de rechazo terminaban ganando. Al alumno se le muestra el golpe antes de decidir.
- La reputación mueve la demanda (`factorReputacion`: 50% = neutral, 0% = mitad, 100% = +50%).
- La capacidad declarada (`capacidadAnual`) pone tope a las ventas.
- Cobro a crédito: `dias_cobro` y `cuentas_por_cobrar` en el estado; más de 30 días retiene caja.
  Eventos pueden mover `dias_cobro` (alias `dias_cobro`, `plazo_cobro`, `cobranza`).
- Los multiplicadores acumulados tienen tope (`LIMITES_MULTIPLICADORES`).
- Control permanente de equilibrio en `motor-eventos-golpe.test.ts`: viables bien jugados casi no
  quiebran, rechazos bien jugados fracasan.
- Los golpes se diluyen (2026-10-23, tarde): `DECAIMIENTO_MENSUAL_MULTIPLICADORES = 0.1` en
  `lib/motor-eventos.ts`. Cada mes precio, demanda y costos vuelven 10% hacia 1. Antes se acumulaban
  60 meses (costos x1,4 a x1,7 y quiebra de 80 a 100% sin decidir nada). Medido en las 56 plantillas
  (20 partidas, evento mensual al 40%): proyectos no-rechazo quiebran 2% decidiendo bien y 39% al
  azar (con 0,03: 3% y 61%; con 0,06: 3% y 51%). El azar aun es mas duro que el 24% que se medio
  antes; subir el decaimiento a 0,15 o 0,20 es una decision de dificultad (borra tambien efectos
  que el alumno elige). Campana de TV (70%) y panel solar (40%) fracasan menos de lo ideal.
- Eventos generales acotados por rubro: `lib/eventos-por-rubro.ts` (tabla `TIPOS_POR_EVENTO_GENERAL` y
  `TIPOS_EXCLUIDOS_POR_EVENTO`, solo para proyectos con `tipoNegocio`; los viejos no cambian). Cubre
  EVT004, 006, 017, 018, 019, 024, 027, 028, 035, 036, 038, 043, 044 y 045. Criterio del equipo, sin
  validar con gremios; puede haber otros eventos generales que no calcen con algun rubro.
- Gimnasio: marketing 14.000 y promociones 6.000 al mes (CAC de Bs 333, LTV:CAC de 14 a 1; VAN 263.000).
- MECANICA PROPIA POR TIPO dentro de la simulacion (2026-10-23, tarde; el owner pidio que cada tipo tenga su
  propia manera de evaluar viabilidad, no solo noticias). Cada variable es opcional en `EstadoSimulacion`
  (las simulaciones viejas siguen con el calculo comun) y sin eventos reproduce exactamente el plan del
  constructor. Hecho:
  * Suscripcion (`socios`, `churn_multiplicador`, `construirPlanSocios`): socios con altas y bajas mes a mes;
    el precio, la reputacion y la demanda mueven las bajas. Eventos SUS011-016 (migracion 054).
  * Microcredito (`mora_multiplicador`, `construirPlanMora`, `COEF_MORA`): la mora sube si se coloca apurado o
    cae la reputacion y pesa en la prevision. Eventos MIC012-017 (migracion 055).
  * Turismo y agricultura (`lib/estacionalidad.ts`, `factor_estacional`): temporadas; el total anual es el del
    plan, la caja sube y baja. Agricultura tiene ademas calendario propio de costos (se gasta al sembrar).
    Se asume que el primer mes es enero.
  * Social (`presupuesto_multiplicador`, `beneficio_social_acumulado`, `cobertura`): antes el beneficio social
    entraba a la caja como si fuera plata; ahora lo financia un tercero y el beneficio no es caja. Eventos
    SOC012-017 (migracion 056).
  * Costo-beneficio y marketing (`eficacia_multiplicador`, alias `ahorro`): beneficio logrado frente al
    esperado. Eventos CBN012-015 y MKT012-015 (migracion 057).
  * Alquiler, salud privada, educacion privada y concesion (`ocupacion_relativa`, `impagos_multiplicador`):
    los contratos y matriculas se mueven con inercia (la ocupacion sigue a la demanda con retraso) y una parte
    de lo facturado no se cobra (morosidad de inquilinos, glosas, pensiones, tarifas). Eventos ALQ012-015,
    SAL012-015, EDP010-012 y CON011-013 (migracion 058).
  * Medios (audiencia e anunciantes morosos), franquicia (fuerza de la marca), tecnologia (usuarios activos):
    reutilizan `ocupacion_relativa` e `impagos_multiplicador` con inercia 0,12 (alias `audiencia`, `marca`,
    `usuarios_activos`); las suscripciones SaaS usan sus socios. Eventos: calendario propio en
    `lib/estacionalidad.ts` (casi todo se vende en julio y agosto, gastos desde meses antes). Eventos
    MED011-013, EVE011-013, FRA011-013, TEC009-011 (migracion 059).
    El festival paso a necesitar mucho mas capital de trabajo (de 443.000 a 1.074.000) porque el motor ahora ve
    que los ingresos llegan juntos: se recalibro (factor 1,12) para que siga siendo marginal. El colchon de
    caja (`conColchonDeCaja`) ahora deja 60% de margen en vez de 25%. Festival y feria quiebran casi siempre
    jugando al azar (son un solo golpe al año).
  * Gastronomia, produccion y comercio (`merma_multiplicador`, alias `merma`, `desperdicio`, `robos`): lo que se
    compra y se pierde encarece los insumos; la merma sube sola si cae la demanda (mercaderia que se echa a
    perder) y pesa mas en gastronomia (8%) que en produccion (4%) o comercio (2,5%). Servicios reutiliza la
    cartera de clientes con inercia e impagos. Eventos PRD013-016 y SRV008-010 (migracion 060).
  Con esto los 19 tipos tienen mecanica propia dentro de la simulacion. Migraciones 054 a 059 aplicadas en
  Supabase el 2026-10-23; 060 pendiente de pegar por el owner.
  Siguen sin modelar: inventario en bodega (cuanta plata queda parada en stock) y plazo de pago a proveedores.
  Los coeficientes de cada mecanica son criterio del equipo, sin validar con gremios.
- Recorrido en la app real despues de la mecanica propia (2026-10-23, noche): posta de salud (tarjetas "Fondos recibidos"
  y "Fondos menos gastos"), estacionamiento ("Ocupacion contratada" e "Inquilinos morosos"), restaurante ("Merma"; llego
  PRD013 de la 060) y camara de frio ("Beneficio logrado"; llegaron CBN012/014/015 de la 057). Las migraciones 054 a 060
  estan aplicadas. Se acotaron mas eventos generales (EVT025/026/047/048/050) para social, costo-beneficio y concesion.
  Quedan sin ver en pantalla: turismo con temporadas, medios, franquicia, tecnologia, eventos, educacion, concesion.
- Prueba en la app real (como estudiante, 2026-10-23): hostal, gimnasio (suscripcion, eventos SUS
  llegan: turnos 41, 45, 55) y microcredito. Faltan 16 tipos. Al jugar siempre la opcion A el
  microcredito quebro en el mes 15; no es error de calculo (sin eventos gana Bs 47.000 al mes).
Pendientes del owner: verificar en la app que llegan eventos TUR/SUS, decidir si se investigan los 4
tipos sin ficha y si `docs/metodologia/` se sube a GitHub.

### Retomar aquí (cierre de sesión 2026-10-22)
Objetivo del owner: un simulador con distintos tipos de proyecto, donde las
situaciones y la forma de evaluar cambian según el tipo (productos, costo-beneficio,
social, marketing, suscripción, turismo...), con ejemplos de datos simulados.

Hecho el 2026-10-22:
- Investigación rigurosa de 20 de 24 tipos (carpeta local `docs/metodologia/`,
  NO subida a GitHub; sincronizada por Synology): mapa `00-taxonomia-tipos.md` y
  20 fichas en `tipos/`, cada una con 12 a 15 situaciones con dilema, variables
  propias, ejemplos reales, fuentes con nivel y cifras a validar en Bolivia.
  Faltan 4 tipos sin ficha: cultural, TI interna, infraestructura pública,
  cumplimiento normativo (decidir con el owner si vale el gasto).
- Base técnica (commit 597ac05, publicada): `Proyecto.tipoNegocio` (lo estampan
  las plantillas con su categoría) y filtro de eventos por tipo
  (`eventoAplicaAProyecto`). Proyectos sin tipo reciben solo eventos por sector.
- Migraciones 034 (turismo) y 035 (suscripción): 20 eventos propios, aplicadas
  en Supabase. 436 tests en verde, build OK.
- Pendiente de verificar con el owner: abrir un proyecto del hostal boutique y
  ver que llegan eventos TUR0xx (y uno de suscripción con SUS0xx).

Siguiente: Fase 2 del plan (eventos para el resto de las categorías), luego
plantillas nuevas (clínica, colegio, franquicia, agua, microcrédito) y, con OK
del owner, variables e indicadores propios por tipo (Fase 4: cambia motor y
fórmulas). Lección operativa: la IA no ejecuta SQL en producción ni hace push sin
OK; copia el SQL, el owner pega y pulsa Run (detalle en el plan, §6).

### Retomar aquí (cierre de sesión 2026-10-19)
Estado: producción al día, 293 tests, build OK, migración 033 aplicada. Sesión
2026-10-19: ver el bloque de arriba (recorrido, análisis de riesgo,
simulación, presentación, CI).

Pendientes del OWNER en GitHub (la IA no puede o no debe hacerlos): (a) activar
protección de la rama `main` exigiendo que pase el CI (Settings > Branches);
(b) decidir qué hacer con las ramas `claude/financial-admin-review-iXwmO` (39
commits detrás de main, 4 propios) y `claude/mejoras-pedagogicas` (19 detrás,
4 propios); (c) confirmar si el repo es público: la clave vieja
`WEBAPP_API_KEY` sigue en el historial de git aunque ya se rotó.

Avisos de seguridad que quedan (`npm audit --omit=dev`): tailwindcss 3 y su
cadena (braces, micromatch…) y fast-glob: solo herramientas de build, no llegan
al navegador; arreglarlo exige tailwindcss 4 (cambio mayor, no hecho).
react-router: aviso de hidratación SSR, la app es SPA, exige react-router 7
(mayor). xlsx: sin parche; la app solo escribe Excel (`xlsx-js-style`), no
lee archivos de terceros.

Ideas sin hacer de la sesión 2026-10-19: rediseño visual de las diapositivas
viejas (el owner las encontró "simplonas": falta saber si es diseño, contenido
o interactividad), modo oscuro para proyector, "qué hubiera pasado con otras
decisiones" en la simulación (exige reejecutar el motor), tornado/Montecarlo
en el resumen del constructor (Paso 9), usar la config de escenarios del curso
en la presentación.

--- Estado del cierre anterior (2026-10-18) ---
Probado end-to-end en producción con las cuentas del owner (docente
`ronaldmartinezjimenes@gmail.com`, alumno `rnd261190@gmail.com`).

Datos de prueba que quedaron en producción (el owner dijo que los alumnos del
curso PROYECTOS II ya no están vigentes y el curso se borrará): notas de la
cuenta alumno en etapas 1-4 y entrega grupal "GRUPO PRUEBA" (90), cuenta alumno
1.º en el podio con 73, un evento EVT001 lanzado a 8 simulaciones. Nada se
borra desde la IA: el docente borra el curso con "Borrar curso" (pide escribir
el código) y la cascada elimina inscripciones, proyectos, entregas, grupos,
simulaciones y turnos. Las cuentas de alumno y sus proyectos libres sin curso
NO se borran.

Preguntas abiertas para el owner (preguntar al retomar):
1. ¿Hacemos los rediseños grandes? (panel del alumno con una sola lista y
   "Continuar mi proyecto"; constructor a dos columnas; paso final "Revisar y
   entregar"; pestañas del docente agrupadas). No se tocó nada de esto.
2. Criterio financiero con la cátedra: IVA como costo en el flujo, doble
   beneficio de deuda en el VAN (WACC + flujo neto de intereses), préstamo >60
   meses sin cancelar saldo, SD con valor terminal, punto de equilibrio
   duplicado, tasa 0 -> 10%.
3. ¿Se cambia la clave `WEBAPP_API_KEY` en algún programa externo que use
   `export-artifact`? Se rotó (secret de GitHub); la vieja sigue en el
   historial de git.
4. Pendientes técnicos sin hacer: `select("*")` en listas de proyectos,
   modo oscuro (407 `dark:` sin activar), Semana E oculta (decisión previa),
   probar en un celular físico, aviso de versión nueva en vez de recarga OTA.
Reglas del owner confirmadas: las etapas (9) y las fórmulas no se cambian sin
su OK; español neutro con tuteo; la IA no ejecuta SQL de permisos ni borra
datos: prepara y el owner hace el clic final.

### Pendiente para después (hallazgos del review sin resolver)
- [ ] Ideas UX NO implementadas (cambian la forma de usar, requieren OK del
      owner): panel del alumno con una sola lista, "Continuar mi proyecto",
      constructor a dos columnas con tarjeta "Tu proyecto hoy", paso final
      "Revisar y entregar", agrupar pestañas del docente, consultas sin
      select("*"), aviso de versión nueva en vez de recarga OTA (§7.7).
- [ ] **Criterio financiero a decidir con la cátedra** (hallazgos del experto
      simulado, `lib/flujo-proyecto.ts`): (1) el flujo resta el IVA neto como
      costo sin sumar el IVA cobrado ni restar el pagado; (2) el VAN con deuda
      descuenta al WACC un flujo ya neto de intereses (doble beneficio de la
      deuda); (3) préstamo > 60 meses no cancela el saldo en el año 5; (4) SD
      usa el flujo del año 5 con residual y capital de trabajo; (5) dos puntos
      de equilibrio con definiciones distintas; (6) tasa 0 se reemplaza por 10%;
      (7) `evaluacion-final.tsx` cuenta doble capital de trabajo y residual.
- [ ] Vida útil por defecto = 1 año en inversiones; avisar o dejar vacío.
- [ ] Jerga sin explicar (VAN, WACC, "Sistema francés", "Factura IVA"): tooltips.
- [ ] Probar en producción el lado del alumno (inscripción, entrega, simulación,
      podio) con una cuenta de estudiante de prueba.
- [ ] Sentry Replay con `maskAllText:false` y `vercel.json` sin headers de
      seguridad (CSP, X-Frame-Options).
- [ ] **Modo local incompleto**: `obtenerProyectoPorId` (presentar proyecto) y
      lecturas de cursos/grupos/entregas siguen llamando a Supabase.
- [ ] **Botón "Salir" en modo local** no hace nada útil (redirige a /login y
      vuelve al panel).
- [ ] Extraer los bloques `es_semana_e` de `dashboard-docente.tsx` y
      `GruposEstudiante.tsx` a componentes aparte (`/simplify`).
- [ ] Skills propias: "preparar release" (tests + build + review + push) y
      "nueva migración Supabase 024+".
- [ ] "Ver como estudiante" no bloquea otras escrituras además de entregar.

### En consideración (no implementado)
- [ ] **Detección automática de plagio** (proyectos muy similares entre
      alumnos). Para cursos grandes.
- [ ] **Notificaciones push** vía Service Worker (Android).
- [ ] **Realtime** vía Supabase para reducir el polling. Solo si crece a
      cientos de usuarios concurrentes.

### Descartadas con justificación
- ❌ **App nativa con Capacitor** — PWA cumple las mismas necesidades a
      costo cero. Capacitor agregaría costo de App Store ($99/año Apple +
      $25 Google) y revisión sin beneficio real.
- ❌ **React Native** — duplicaría el código base sin agregar valor.
- ❌ **IA que arme el proyecto entero por el alumno** — mata el aprendizaje.

---

## 11. Cómo trabajar con esta bitácora · protocolo

### Cuando termines un cambio significativo
Después de un commit que agrega/cambia features visibles o decisiones de
diseño, **pedile a la IA que actualice la bitácora**:

> "Actualizá la bitácora con el cambio del commit `XXXXXXX`."

La IA debe:
1. Leer el commit (`git show XXXXXXX`).
2. Identificar QUÉ sección de la bitácora se ve afectada:
   - Nueva feature → §4 (Features) + tal vez §7 (Decisiones).
   - Nueva migración → §6 (Migraciones).
   - Cambio de arquitectura → §7 (Decisiones).
   - Pendiente resuelto → mover de §10 a §3.
3. Proponer el cambio y **pedir tu autorización** antes de escribirlo.
4. Actualizar el `Última actualización` del header con la fecha + hash.

### Cuando arranques una sesión nueva
Comenzá con:

> "Leé `BITACORA.md` y dame un resumen del estado del proyecto."

La IA tendrá contexto completo en 30 segundos.

### Cuando otra IA tome el proyecto
Compartile `BITACORA.md` + las migraciones + `package.json`. Con eso puede
levantar el proyecto y entender las decisiones sin perderse.

### Cuando algo "raro" del código te confunda
Buscá en §7 (Decisiones de diseño). Si NO está documentado, pedile a la IA:

> "¿Por qué está hecho así X? Si tiene una razón no obvia, agregala a §7."

---

## 12. Glosario rápido

| Término | Significado |
|---------|-------------|
| **Caso del curso** | Proyecto plantilla que el docente publica para que los alumnos lo tomen. `tipo='caso_curso'`. |
| **Entrega del estudiante** | Copia que un alumno hizo de un caso del curso. `tipo='entrega_estudiante'`. |
| **Proyecto libre** | Proyecto que el alumno arma desde cero. `tipo='libre'`. |
| **Proyecto grupal** | Proyecto compartido por miembros de un grupo. `tipo='proyecto_grupal'`. |
| **Etapa / Paso** | Una de las 9 fases del constructor (1-9). |
| **Evento forzado** | Evento que el docente disparó al curso vía el Lanzador. Se aplica al próximo turno del alumno. |
| **Modo simulación** | `automatico` / `docente_dispara` / `curado` — define cuándo aparecen eventos. |
| **Alcance** | A qué tipos de proyecto va un disparo: todos/caso/individual/grupal. |
| **Sectores afectados** | Lista en `eventos.sectores_afectados`; cruce con `proyectos.sector`. |
| **Racha** | Entregas consecutivas APROBADAS sin reprobar (campo del podio). |
| **OTA** | Over-the-air — actualización automática de la PWA al abrirla. |
| **PKCE** | Proof Key for Code Exchange — flow OAuth seguro que usa Supabase Auth. |
| **RLS** | Row Level Security de Postgres — protege qué filas ve cada usuario. |

---

## 13. Schema de base de datos · forma final de cada tabla

> Esta sección es la "foto" de la BD después de aplicar las 23 migraciones. Si
> necesitás cambiar el schema, **NO modifiques migraciones aplicadas** — creá
> una nueva (024+) y agregala acá.

### 13.1 Tablas

| Tabla | PK | Columnas clave | Para qué |
|-------|----|----------------|----------|
| **perfiles** | `id` (UUID, FK auth.users) | `nombre`, `apellido`, `rol` (docente\|estudiante), `email`, `universidad`, `es_admin` (BOOL) | 1:1 con auth.users. Rol, universidad y flag admin. |
| **cursos** | `id` | `docente_id` (FK perfiles), `nombre`, `codigo` (UNIQUE), `materia`, `paralelo`, `frecuencia_turnos`, `duracion_anios`, `estado`, `modo_simulacion`, `eventos_curados` (UUID[]), `peso_individual`, `peso_grupal`, `universidad`, `grupo_habilitado`, `grupo_cupo_max`, `grupo_modelo`, `permite_proyecto_libre`, `simulacion_caso_curso/individual/grupal` (BOOL) | Cursos del docente. Define modo de simulación, configuración de grupos y pesos de evaluación. |
| **inscripciones** | `id` | `curso_id`, `estudiante_id`, UNIQUE(curso_id, estudiante_id) | Alumno ↔ curso. |
| **proyectos** | `id` | `estudiante_id`, `curso_id` (NULL si libre), `grupo_id` (NULL si individual), `nombre`, `datos` (JSONB), `tipo` (libre\|caso_curso\|entrega_estudiante\|proyecto_grupal), `caso_origen_id` (FK proyectos), `paso_inicio_estudiante`, `estado`, `actualizado_en` | Proyecto del alumno o caso del docente. TODO el contenido del proyecto va en `datos` JSONB. |
| **simulaciones** | `id` | `proyecto_id`, `turno_actual`, `turnos_totales`, `frecuencia`, `estado` (activa\|finalizada\|quebrada), `estado_actual` (JSONB), `evento_forzado_id` (TEXT, NULL) | Una corrida de simulación. `evento_forzado_id` lo escribe el lanzador del docente. |
| **turnos_historial** | `id` | `simulacion_id`, `numero_turno`, `estado_antes` (JSONB), `eventos_aplicados` (JSONB), `decision_tomada` (JSONB), `estado_despues` (JSONB), UNIQUE(simulacion_id, numero_turno) | Log de cada turno: snapshot antes y después + qué pasó. |
| **eventos** | `id` | `codigo` (UNIQUE), `titulo`, `descripcion`, `categoria`, `tipo` (curado\|automatico), `probabilidad`, `turno_minimo`, `sectores_afectados` (TEXT[]), `modificadores` (JSONB), `opciones_decision` (JSONB), `activo` | Catálogo de ~50 eventos bolivianos. Modificadores + árbol de decisión en JSONB. |
| **entregas** | `id` | `proyecto_id`, `estudiante_id`, `curso_id`, `numero_intento`, `paso_entregado` (1..9 o NULL), `estado` (pendiente\|aprobada\|reprobada), `snapshot_datos` (JSONB), `van`, `tir`, `wacc`, `payback`, `sugerencia_automatica`, `sugerencia_nota`, `sugerencia_razones` (JSONB), `nota` (0..100), `comentario_docente`, `entregado_en`, `revisado_en`, UNIQUE(proyecto_id, paso_entregado, numero_intento) | Una entrega = snapshot del proyecto + revisión del docente. Soporta entregas por paso y reintentos. |
| **grupos** | `id` | `curso_id`, `nombre`, `cupo_max`, `proyecto_id` (FK proyectos, NULL, deprecado), `nota`, `comentario_docente`, `revisado_en` | Grupos del curso. Cada miembro comparte el proyecto_grupal. |
| **grupo_miembros** | `id` | `grupo_id`, `estudiante_id`, UNIQUE(grupo_id, estudiante_id) | Membresía. El alumno entra y sale. |
| **eventos_disparados** | `id` | `curso_id`, `evento_id`, `disparado_por`, `disparado_en`, `simulaciones_afectadas` (INT), `nota` | Auditoría de qué evento disparó el docente y a cuántos. Source de verdad para el dashboard de respuestas. |

### 13.2 Vistas

| Vista | Para qué |
|-------|----------|
| **promedio_estudiante** | Promedio por alumno+curso. Cuenta entregas individuales + cada entrega grupal acreditada a todos los miembros del grupo. Solo revisadas (nota IS NOT NULL). |

### 13.3 Índices "calientes" (migración 021)

| Índice | Para qué |
|--------|----------|
| `idx_entregas_est_curso_fecha` (estudiante_id, curso_id, entregado_en DESC) | "Mis entregas" y podio. |
| `idx_entregas_proyecto_paso` (proyecto_id, paso_entregado) | Calcular próximo `numero_intento`. |
| `idx_entregas_estado` (estado) | Filtros pendiente/revisada del docente. |
| `idx_simulaciones_estado` (estado) | Buscar simulaciones activas. |
| Resto: FKs comunes (proyecto_id, curso_id, etc.). | |

### 13.4 RLS · resumen por tabla

> Toda tabla con datos sensibles tiene RLS activado. Si una IA va a tocar
> RLS, **lea esta tabla y la migración 003/011/018** antes.

| Tabla | Quién puede leer | Quién puede escribir |
|-------|------------------|----------------------|
| **perfiles** | Uno mismo · su docente · sus compañeros de grupo · admin | Uno mismo (excepto `rol` y `es_admin`, ver §7.2) · admin |
| **cursos** | Docente dueño · alumno inscrito · cualquiera buscando por código · admin | Docente dueño · admin |
| **inscripciones** | Estudiante (las suyas) · docente del curso · admin | Estudiante (insert/delete propias) · admin |
| **proyectos** | Dueño · docente del curso · alumno inscrito (caso del curso) · miembros del grupo · admin | Dueño · miembros del grupo · docente (grupal) · admin |
| **simulaciones** | Dueño · docente del curso · admin | Dueño · admin |
| **turnos_historial** | Dueño de la simulación | Dueño |
| **eventos** | Cualquier autenticado (los activos) | (Solo admin/seed) |
| **entregas** | Submitter · miembros del grupo (si proyecto_grupal, migración 024) · docente del curso · admin | Estudiante crea (forzando estado=pendiente, sin nota) · docente revisa · admin |
| **grupos** | Alumnos inscritos · docente del curso | Docente del curso · estudiante crea (con restricciones) |
| **grupo_miembros** | Alumnos del mismo curso · docente | Estudiante entra/sale del suyo · docente |
| **eventos_disparados** | Docente · alumno inscrito · admin | Docente del curso · admin |

### 13.5 Funciones SECURITY DEFINER (helpers RLS)

| Función | Devuelve TRUE si… |
|---------|-------------------|
| `es_docente_del_curso(uuid)` | `auth.uid()` es el docente del curso. |
| `esta_inscrito_en_curso(uuid)` | `auth.uid()` está inscrito. |
| `es_mi_estudiante(uuid)` | El estudiante está inscrito en algún curso de `auth.uid()`. |
| `es_mi_proyecto(uuid)` | `auth.uid()` es dueño del proyecto. |
| `es_mi_simulacion(uuid)` | `auth.uid()` es dueño del proyecto de la simulación. |
| `es_simulacion_de_mi_curso(uuid)` | `auth.uid()` es el docente del curso del proyecto. |
| `es_admin_actual()` | El perfil de `auth.uid()` tiene `es_admin=TRUE`. |

Existen para **evitar recursión** entre policies (la causa típica de "stack depth exceeded" en Postgres). NO inlinear las queries en las policies — siempre llamar a estas helpers.

### 13.6 Triggers

| Trigger | Tabla | Función | Para qué |
|---------|-------|---------|----------|
| `on_auth_user_created` | `auth.users` | `crear_perfil_al_registrarse()` | Crea row en `perfiles` cuando alguien se registra (email/password o Google OAuth). |
| `trg_proyectos_actualizado_en` | `proyectos` | `tocar_actualizado_en()` | BEFORE UPDATE: `actualizado_en = NOW()`. |
| `trg_proteger_perfil` | `perfiles` | `proteger_campos_sensibles_perfil()` | **CRÍTICO** (018) BEFORE UPDATE: si el usuario NO es admin, fuerza `rol` y `es_admin` a los valores previos. Bloquea escalada de privilegios. |

---

## 14. Ciclos de vida y stores

### 14.1 Sesión / Auth · cómo entra y sale un usuario

```
Registro email/password
  → supabase.auth.signUp() + metadata (nombre, apellido, rol="estudiante", universidad)
  → trigger BD crea row en `perfiles`
  → auth-store recibe SIGNED_IN, setea session+user+perfil
  → sesión activa

Registro / Login con Google OAuth
  → click "Iniciar sesión con Google"
  → supabase.auth.signInWithOAuth(provider="google") con PKCE
  → callback ?code=… → exchangeCodeForSession()
  → procesarCallbackOAuthSiAplica() limpia URL
  → trigger BD crea perfil con metadata Google (given_name, family_name)
  → sincronizarNombreConGoogle() rellena nombre/apellido si están vacíos
  → sesión activa

Login email/password
  → signInWithPassword → onAuthStateChange dispara SIGNED_IN
  → recargar perfil + setear session/user/perfil

Logout
  → signOut() → SIGNED_OUT → store se limpia
  → Supabase Auth limpia sus tokens (localStorage)
```

**Funciones principales** (`src/lib/auth-helpers.ts`):
`registrarUsuario`, `iniciarSesion`, `iniciarSesionConGoogle`,
`procesarCallbackOAuthSiAplica`, `obtenerPerfil` (con timeout + retry),
`obtenerPerfilConReintentos`, `cerrarSesion`, `actualizarMiPerfil`,
`sincronizarNombreConGoogle`.

**Roles**: `estudiante` (default) → `docente` (admin promueve) → `admin` (flag `es_admin`).

### 14.2 Proyecto · borrador → entrega

```
Crear proyecto vacío (proyecto-factory.ts::crearProyectoVacio)
  → proyecto-store.inicializar(estudiante_id, nombre, curso_id?, version, modeloIngreso)
  → useAutoGuardado() detecta cambios y dispara debounce (1s)
  → guardarProyecto() upsert en `proyectos` (columnas SQL + JSONB datos)

Estudiante completa 9 pasos
  → cada acción del store (agregarInversion, editarPuesto, ...) actualiza
    `proyecto.actualizado_en` → el hook reactivo persiste

Entregar UNA etapa (o todo)
  → entregarProyecto(proyecto, indicadores, referenciaDelDocente, pasoEntregado?)
  → calcula sugerenciaAutomatica() comparando indicadores
  → INSERT en `entregas` con:
      snapshot_datos = JSONB completo, estado = 'pendiente',
      sugerencia_*, numero_intento = next por (proyecto, paso)
  → estudiante ve "pendiente" hasta que docente revise

Docente revisa
  → revisarEntrega(id, "aprobada"|"reprobada", nota, comentario)
  → UPDATE `entregas` con estado + nota + comentario_docente + revisado_en

Si reproba
  → alumno hace cambios → entrega de nuevo → numero_intento++
  → cada intento es una row nueva en `entregas` (historial completo)

4 tipos de proyecto:
  libre               · arrancado desde cero (alumno)
  caso_curso          · plantilla del docente (publicada)
  entrega_estudiante  · copia de un caso (vaciarPasosDesde(pasoInicio))
  proyecto_grupal     · compartido entre miembros del grupo
```

### 14.3 Simulación · arranque → cierre

```
Estudiante abre "Simular"
  → simulacion-store.inicializar(proyecto, frecuencia="mensual")
  → busca activa; si no hay, crea nueva en `simulaciones`
    {turno_actual=0, turnos_totales=duracion_anios×fr, estado="activa"}

Cada turno
  → prepararSiguienteTurno(proyecto):
      • si simulacion.evento_forzado_id ≠ NULL → usar ESE evento (docente disparó)
      • si no → seleccionarEventoTurno(turno+1, sector, modo, eventosCurados)
  → estudiante elige opción (A/B/C/D)
  → decidirYAvanzar(proyecto, opcion):
      • avanzarTurnoConDecision aplica evento → aplica decisión
      → recalcula caja, ingresos, costos, reputación
      • si caja ≤ 0 → estado="quebrada"
      • si turno_actual+1 >= turnos_totales → estado="finalizada"
      • UPDATE simulaciones + INSERT turnos_historial

Estados finales:
  finalizada · llegó al último turno
  quebrada   · caja se agotó antes
```

### 14.4 Nota final del alumno

```
Nota individual = promedio de entregas revisadas del alumno (estado != pendiente, nota IS NOT NULL)
Nota grupal     = nota del proyecto_grupal del grupo del alumno (si fue revisado)

Final = (pesoIndividual × ind + pesoGrupal × grupal) / (pesoIndividual + pesoGrupal)

Renormalización (lib/notas.ts::calcularNotaFinal):
  Si solo hay individual → final = individual (pesos se renormalizan a [1, 0])
  Si solo hay grupal     → final = grupal
  Si no hay ninguna      → final = null (no se castiga al alumno por algo que el docente
                                          aún no calificó)
```

### 14.5 Los 3 stores Zustand

#### `useAuthStore` (`src/stores/auth-store.ts`)
- **Guarda**: `user`, `session`, `perfil`, `cargando`, `inicializado`.
- **Acciones**: `inicializar()` (boot), `registrar`, `login`, `logout`,
  `recargarPerfil`.
- **Persistencia**: Supabase Auth maneja la sesión (cookies + refresh token).
  El listener `onAuthStateChange` sincroniza el store.

#### `useProyectoStore` (`src/stores/proyecto-store.ts`)
- **Guarda**: el `proyecto` activo (Proyecto | null).
- **Acciones (>50)**: ciclo de vida (`inicializar`, `cargar`, `limpiar`),
  datos generales, inversiones, personal, costos directos, costos de
  administración y comercialización, financiamiento, CAPM, suscripción
  (multi-plan), publicidad, costo-beneficio, tasas de crecimiento, estado.
- **Persistencia**: cada acción toca `actualizado_en` → el hook
  `useAutoGuardado` debouncea 1s y upsertea en BD.

#### `useSimulacionStore` (`src/stores/simulacion-store.ts`)
- **Guarda**: `simulacion`, `eventos`, `historial`, `eventoActual`, `curso`,
  flags `cargando` y `error`.
- **Acciones**: `inicializar(proyecto, frecuencia)`,
  `prepararSiguienteTurno(proyecto)`, `decidirYAvanzar(proyecto, opcion)`,
  `abandonar()`, `refrescarSiHayEventoForzado(proyecto)`.
- **Persistencia**: **manual**. Cada `decidirYAvanzar` llama a
  `actualizarSimulacion` + `registrarTurno`. No hay autosave.

---

## 15. Motores · cómo funcionan por dentro

### 15.1 Motor financiero (`calculo-financiero.ts` + `flujo-proyecto.ts`)

| Función | Calcula | Fórmula condensada |
|---------|---------|--------------------|
| `calcularVAN` | Valor Actual Neto | `Σ flujo[t] / (1+r)^t` |
| `calcularTIR` | Tasa Interna de Retorno | raíz de VAN(x)=0 (Newton-Raphson) |
| `calcularPayback` | Payback simple (años) | acum(flujos) cruza 0 con interpolación lineal |
| `calcularPaybackDescontado` | Payback con TVM | acum(VP de flujos) cruza 0 |
| `calcularWACC` | Costo promedio de capital | `(D/V)·kd·(1-T) + (E/V)·ke` |
| `calcularCostoCapitalCAPM` | Ke vía CAPM | `Rf + β·(Rm - Rf)` |
| `calcularIR` | Índice de rentabilidad | `VP(flujos positivos) / inversión inicial` |
| `calcularRBC` | Relación beneficio/costo | `VP(ingresos) / VP(costos)` |
| `calcularPuntoEquilibrio` (V2) | Q en break-even | `Q* = CF / (P − Cv)` |
| `calcularSensibilidad` (V2) | VAN ante variación de variable | evalúa VAN para ±20%, ±10%, 0% |
| `simularMonteCarlo` (V2) | Distribución de VAN | N iteraciones con ingresos/costos triangulares |

**V1 vs V2**: V1 son VAN/TIR/Payback simple/RBC (en `flujo-proyecto.ts`). V2
agrega Payback descontado, sensibilidad one-way, CAPM, GAO/GAF/GAT, punto
de equilibrio y Monte Carlo. Todo son **funciones puras** sin estado.

#### Los 4 modelos de ingreso · cómo cada uno arma los productos portadores

Todos convergen en `productos[]` con `cantidades[5]` y `precios[5]`, que
`flujo-proyecto.construirFlujoCaja()` consume sin discriminar.
Inicialización: `proyecto-factory.ts::aplicarModeloIngresoInicial()`.

1. **`unidades`** (default) — productos reales. `cantidades` y `precios`
   manuales del Paso 2. Ingreso anual = Σ cantidad[i] × precio[i].

2. **`suscripcion`** — base recurrente con altas y churn.
   `proyectarSuscriptores({suscriptoresIniciales, altasMensuales, churnMensual, cuotaMensual}, 5)`
   simula mes a mes `S(m) = S(m-1)·(1−churn) + altas` y devuelve promedio
   anual. Producto portador: `cantidades = promedio[i]`, `precios = cuota × 12`.
   **Multi-plan (FASE 24, §7.12)**: un producto portador por plan; se suman.

3. **`publicidad`** — audiencia × CPM.
   `proyectarPublicidad({audienciaMensual, crecimientoMensual, impresionesPorUsuario, cpm}, 5)`
   proyecta audiencia, calcula impresiones = audiencia × impr/usuario × 12.
   Producto portador: `cantidades = impresiones/1000`, `precios = CPM`.

4. **`costo_beneficio`** — sin ventas reales, justifica por beneficio
   incremental estimado. Producto portador: `cantidades = [1,1,1,1,1]`,
   `precios = beneficioBase × (1+g)^i`.

### 15.1b Análisis de riesgo (`lib/analisis-riesgo.ts`)
Funciones puras que reutilizan `aplicarModificadores` (`lib/escenarios.ts`) y
`construirFlujoCaja`; nunca tocan el proyecto original.
- `calcularTornado(proyecto, variacion = 0.1)`: mueve de a una variable
  (precio, demanda, costos directos, gastos generales, sueldos, inversión) y
  devuelve filas ordenadas por amplitud del VAN.
- `tablaPrecioDemanda(proyecto, cambios)`: matriz de VAN 5 × 5.
- `simularMontecarlo(proyecto, { corridas, semilla, optimista, pesimista,
  onProgreso })`: asíncrona (cede el hilo cada 25 corridas). Cada variable se
  sortea con distribución triangular (mínimo, 1, máximo) entre los
  modificadores pesimista y optimista del curso. Devuelve probabilidad de VAN
  > 0, probabilidad de viabilidad (VAN > 0 y TIR > WACC), media, percentiles
  5/50/95, mínimo, máximo e histograma.
- `emitirVeredicto(tornado, montecarlo | null)`: texto simple para el alumno.
- `crearAleatorio(semilla)` (mulberry32) y `muestraTriangular`: reproducible.
Usos: `AnalisisRiesgo.tsx` (Escenarios) y `VisorPitch.tsx` (presentación).

### 15.2 Motor de simulación (`motor-eventos.ts` + `lanzador-eventos.ts`)

**Un turno en alto nivel**:
1. **Leer estado**: `EstadoSimulacion` con caja, deuda, multiplicadores
   (precio, demanda, costos), reputación.
2. **Elegir evento**: si `evento_forzado_id` está seteado → ese.
   Sino, `seleccionarEventoTurno(turno, sector, modo, curados)` sortea por
   probabilidad (o devuelve null si modo=docente_dispara).
3. **Mostrar opciones**: cada `OpcionDecision` tiene texto + feedback +
   modificadores propios.
4. **Aplicar consecuencias** (`aplicarDecisionAEstado`): parsea JSONB
   `modificadores` del evento + de la opción. Sintaxis del parser:
   - `*1.2` (multiplicador), `+5000` (suma), `-3000` (resta), `+5%` / `-5%`
     (porcentaje), número pelado (setea absoluto). Reputación se clampa [0,1].
   - Campos modificables: `caja`, `deuda`, `precio_venta`, `demanda`,
     `costos_*` (alias a costos_multiplicador), `reputacion`, `ingresos_acumulados`.
5. **Operar el turno**: `aplicarOperacionDelTurno()` calcula ingresos/costos
   del período con los multiplicadores actualizados, aplica impuesto 25%,
   actualiza caja y acumulados. Guarda en `turnos_historial`.

**Evento auto vs forzado**:
- **Auto**: motor sortea por `probabilidad`. Default.
- **Forzado**: docente dispara via `dispararEventoAlCurso()` →
  setea `evento_forzado_id` en cada `simulaciones` afectada. Motor lo
  consume y lo limpia con `limpiarEventoForzado()` tras usarse.

**Lanzador (`lib/lanzador-eventos.ts::dispararEventoAlCurso`)**:
- Filtra por **alcance**: `todos | caso | individual | grupal`.
- Filtra por **sectores**: cruce con `eventos.sectores_afectados` (a no ser
  que el docente fuerce con un toggle "ignorar sectores").
- Cruce con **tipos simulables del curso** (`simulacion_caso_curso/individual/grupal`).
- Busca simulaciones **activas** y setea `evento_forzado_id`. Auditoría en
  `eventos_disparados`.

**Los 3 modos del curso**:
- **`automatico`** (default): el motor sortea solo. Para tarea en casa.
- **`docente_dispara`**: el motor NO mete eventos solos. Espera al lanzador.
- **`curado`**: el motor aplica una lista predefinida (`cursos.eventos_curados`)
  en orden, ignorando probabilidades. Narrativa scripted.

---

## 16. Recetas · cómo hacer X

> Cada receta cita los archivos exactos a tocar. Si una receta cambia,
> actualizala acá.

### 16.1 Agregar un nuevo modelo de ingreso (ej. "freemium")
1. `src/types/proyecto.ts`: agregar `"freemium"` al type `ModeloIngreso` y
   definir la interface `FreemiumV2` con sus parámetros.
2. `src/lib/calculo-financiero.ts`: implementar `proyectarFreemium(params, 5)`
   que devuelva `[{cantidad, precio, ingresoAnual}]` por año.
3. `src/lib/proyecto-factory.ts::aplicarModeloIngresoInicial`: agregar el
   caso `"freemium"` que cree el producto portador.
4. `src/stores/proyecto-store.ts`: agregar acción `setFreemiumV2(cambios)`.
5. `src/components/constructor/pasos/Paso2Proyeccion.tsx`: agregar un panel
   tipo `PanelSuscripcion` para los inputs.
6. `src/components/docente/DetalleEntregaPasoAPaso.tsx`: agregar bloque para
   mostrar los parámetros al docente.
7. Tests en `src/lib/calculo-financiero.test.ts` para la nueva proyección.

### 16.2 Agregar un nuevo evento al catálogo
1. SQL nuevo en `supabase/migrations/024_evento_xxx.sql`:
   ```sql
   INSERT INTO eventos (codigo, titulo, descripcion, categoria, tipo,
     probabilidad, turno_minimo, sectores_afectados, modificadores, opciones_decision)
   VALUES ('codigo_unico', '...', '...', '...', 'automatico', 0.10, 3,
     ARRAY['comercio','servicios']::TEXT[], '{"costos":"+10%"}'::JSONB,
     '[{"letra":"A","texto":"...", "modificadores":{...}}]'::JSONB);
   ```
2. Correr en Supabase SQL Editor.
3. (No requiere cambios de código — el motor lee del catálogo.)

**Eventos propios de un tipo de proyecto (desde 2026-10-22)**: poner
`ARRAY['tipo:turismo']` (la categoría de la plantilla, campo `tipoNegocio` del
proyecto) en `sectores_afectados`. Solo llegarán a proyectos de ese tipo; el
sector se ignora. Modelo: `034_eventos_turismo.sql`. Regla: `eventoAplicaAProyecto`
en `motor-eventos.ts` (también la usa el lanzador del docente). La prueba
`eventos-por-tipo-sql.test.ts` valida cada migración `NNN_eventos_*.sql`. Receta
completa en `PLAN-TIPOS-DE-PROYECTO.md` §5.

### 16.3 Agregar un paso al wizard del constructor (10 pasos en vez de 9)
1. Crear `src/components/constructor/pasos/Paso10X.tsx`.
2. Registrarlo en `src/routes/construir-proyecto.tsx` (lista de pasos).
3. Si tiene datos propios: agregar campos a `types/proyecto.ts` y acciones
   al `proyecto-store.ts`.
4. Actualizar `lib/proyecto-supabase.ts::entregarProyecto` si el paso es
   entregable independiente.
5. Si afecta el flujo de caja, modificar `lib/flujo-proyecto.ts`.
6. Actualizar `DetalleEntregaPasoAPaso.tsx` con la vista para el docente.
7. Tests en `lib/calculo-financiero.test.ts` o `lib/flujo-proyecto.test.ts`.

### 16.4 Cambiar el peso individual/grupal del curso
1. UI del docente al crear curso: `routes/dashboard-docente.tsx` (formulario).
2. El cambio se guarda en `cursos.peso_individual` y `cursos.peso_grupal`.
3. `lib/notas.ts::calcularNotaFinal` los aplica y renormaliza si falta una.

### 16.5 Agregar una nueva migración SQL
1. Crear archivo `supabase/migrations/024_descripcion_corta.sql`.
2. Hacerla **idempotente**: `CREATE TABLE IF NOT EXISTS`, `ALTER TABLE … ADD COLUMN IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`, `DO $$ BEGIN ... EXCEPTION WHEN duplicate_object ... END $$;` para policies.
3. Correr en Supabase Dashboard → SQL Editor.
4. Agregar la fila a §6 de la BITACORA.

### 16.6 Agregar una feature al panel del docente
1. Componente nuevo en `src/components/docente/MiFeature.tsx`.
2. Registrar como tab en `src/routes/dashboard-docente.tsx`.
3. Si lee/escribe BD: agregar funciones a `lib/cursos-supabase.ts` o
   `lib/proyecto-supabase.ts` (NO meter `from()` en el componente).
4. Si la query nueva necesita RLS especial: nueva migración con policy.

### 16.7 Correr el dev server localmente
```
npm install
npm run dev              # http://localhost:5173
npm test -- --run        # 201 tests
npm run build            # producción (validación)
```
Env vars locales en `.env.local`: `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.

### 16.8 Desplegar
Ver §9. Resumen: `git push origin main` → Vercel buildea y deploya en ~2 min.

### 16.9 Forzar que la PWA se actualice en los alumnos
No hace falta hacer nada. `lib/pwa-update.ts` registra el SW con
`immediate: true` y llama `reg.update()` al recuperar foco / cada 60s. El
nuevo build se aplica con UNA recarga en el próximo refresh del alumno.

### 16.10 Calificación masiva — dónde mirar
- **Tab por tab (nota distinta)**: `ModalRevisionMasiva` desde la tarjeta
  del alumno → botón ámbar "Revisar las N pendientes".
- **Misma nota a todo**: `ModalCalificarTodoIgual` desde la tarjeta →
  botón verde "Calificar todo igual".
- **Desde adentro del modal individual**: checkbox "Aplicar a las N
  pendientes del alumno" — `ModalRevisarEntrega` con prop `otrasPendientes`
  (ver §7.13).

### 16.11 Donde modificar el ranking del podio
`lib/podio-supabase.ts` — query del top 3 + posición personal + racha.
La métrica "racha" cuenta entregas consecutivas APROBADAS sin reprobar.

### 16.12 Activar Sentry o emails
Ver §3 y §7.9. Ambos son gated: requieren config externa del owner.

---

**Fin de la bitácora.** Si encontrás algo desactualizado o faltante, decímelo
con autorización para actualizar.
