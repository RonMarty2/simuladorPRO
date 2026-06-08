# 📖 BITÁCORA · Simulador de Proyectos de Inversión (SIMPRO)

> **Documento vivo** que describe el proyecto de punta a punta. Diseñado para
> que cualquier humano o IA pueda tomar el proyecto en frío y entender qué es,
> cómo está hecho, en qué estado está, y qué decisiones se tomaron y por qué.
>
> **Última actualización**: 2026-06-01 — `e7b5209`
> **Mantenedor**: Ronald Martínez Jimenes (`ronaldmartinezjimenes@gmail.com`)
> **Lee primero**: secciones 1, 2, 3, 7 (orden de prioridad para un onboarding rápido).

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
| **Tests** | Vitest (196 tests al día de hoy) |
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
✅ **Tests verdes** (196/196), TypeScript clean, build OK
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
| Mis entregas | `/mis-entregas` | `routes/mis-entregas.tsx` |
| Evaluación final | `/evaluacion` | `routes/evaluacion-final.tsx` |
| Mi perfil | `/perfil` | `routes/mi-perfil.tsx` |

**Tipos de proyecto que puede tener un alumno**:
- 🎓 **Caso del curso** (`entrega_estudiante`): copia del caso que publicó el docente.
- 📁 **Individual** (`libre`): proyecto propio del alumno.
- 🤝 **Grupal** (`proyecto_grupal`): compartido con su grupo.

**Modelos de ingreso disponibles** en el constructor:
- `unidades` — productos × cantidad × precio (default).
- `suscripcion` — base recurrente con altas y churn.
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
1. `ModalRevisarEntrega` — revisar UNA entrega individual.
2. `ModalRevisionMasiva` — revisar varias etapas con tabs (nota distinta por etapa).
3. `ModalCalificarTodoIgual` — MISMA nota+comentario para todas las pendientes.

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

### En consideración (no implementado)
- [ ] **Múltiples planes de suscripción** (Básico/Pro/Premium con sus
      propias bases, churn y cuotas). Pausado en `e7b5209` — el cambio del
      type fue revertido para no dejar nada roto. Requiere: type change,
      helpers, UI del Paso 2, motor, plantillas. ~3-4 horas.
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

**Fin de la bitácora.** Si encontrás algo desactualizado o faltante, decímelo
con autorización para actualizar.
