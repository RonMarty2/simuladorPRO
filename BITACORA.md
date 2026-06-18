# 📖 BITÁCORA · Simulador de Proyectos de Inversión (SIMPRO)

> **Documento vivo** que describe el proyecto de punta a punta. Diseñado para
> que cualquier humano o IA pueda tomar el proyecto en frío y entender qué es,
> cómo está hecho, en qué estado está, y qué decisiones se tomaron y por qué.
>
> **Última actualización**: 2026-06-09 — `76fceb5` (+ §13–§16 agregadas)
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
✅ **Tests verdes** (201/201), TypeScript clean, build OK
✅ **Seguridad RLS**: todas las tablas protegidas, escalada de privilegios
   bloqueada por trigger (migración 018)
✅ **23 migraciones SQL** aplicadas (ver §6)

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
| Galería de 26 ejemplos | `/ejemplos` | `routes/galeria-ejemplos.tsx` + `lib/plantillas.ts` |
| Simular (5 años, eventos) | `/simular` | `routes/simular-proyecto.tsx` |
| Escenarios (análisis de sensibilidad) | `/escenarios` | `routes/escenarios.tsx` |
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
| Galería de 26 ejemplos | `/ejemplos` | `routes/galeria-ejemplos.tsx` |
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
│   │   ├── plantillas.ts          26 plantillas mega de ejemplo
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
