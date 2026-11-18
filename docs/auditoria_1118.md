# Auditoría del simulador - 2026-11-18

Hecha con agy (5 auditorías de lectura) más un script propio. Cada hallazgo está marcado:
**CONFIRMADO** = lo comprobé yo en el código; **SIN VERIFICAR** = lo dijo agy y falta comprobar.
Línea base: 745 tests pasan. `npm run build` falla SOLO en esta PC (faltan archivos de tipos en `node_modules` de `@vitejs/plugin-react` y `vite-plugin-pwa`, parece sincronización de Synology; probar `npm ci`).

## CRITICO

| # | Qué | Dónde | Estado |
|---|-----|-------|--------|
| C1 | Cualquiera puede hacerse docente: el registro público manda `estudiante` solo desde la pantalla, pero el trigger de la base acepta `rol = docente` si se llama directo a la API de Supabase | `migrations/012_admin_y_google_oauth.sql:145-152` | CONFIRMADO |
| C2 | TIR sin raíz real muestra un porcentaje sin sentido (devuelve la última tasa de Newton en vez de "sin TIR") | `lib/calculo-financiero.ts:426-427` | CONFIRMADO |
| C3 | Préstamo con plazo mayor a 60 meses: entra en el año 0 y el saldo pendiente al año 5 no se descuenta del flujo | `lib/flujo-proyecto.ts:122` | CONFIRMADO, pero es una simplificación DOCUMENTADA: la pantalla permite hasta 240 meses y avisa "al cierre del año 5 todavía queda saldo" (`Paso9Financiamiento.tsx:452`). NO se limita a 60 (pisaría proyectos existentes). Queda como mejora opcional: cobrar el saldo al final del año 5, lo que cambiaría el VAN de proyectos ya hechos. |
| C4 | Un alumno puede inscribirse en cualquier curso sin código, y ver todos los cursos activos con su código y docente | `001_fase1_auth.sql:141-151` | CONFIRMADO el texto de las políticas |
| C5 | Unirse a un grupo lleno o a varios grupos del mismo curso (la política no valida cupo ni unicidad) | `013_grupos_y_ponderacion.sql` | SIN VERIFICAR |
| C6 | Un alumno puede mover su proyecto a un curso o grupo ajeno (política `FOR ALL` sin restringir) | `002_fase3_proyectos.sql` | SIN VERIFICAR |

## IMPORTANTE

- `avanzarTurnoConDecision` modifica el estado original cuando no hay evento; el "estado antes" del turno queda alterado. `lib/motor-eventos.ts:1112` CONFIRMADO.
- `parsearConsecuencia` acepta `*abc`, `+%` y devuelve NaN, que contaminaría la caja. `lib/motor-eventos.ts:445-458` CONFIRMADO (depende de que el dato malo exista en la tabla de eventos).
- `catalogo-eventos.tsx:32-36` hace `return` antes de los hooks de React: falla si el perfil carga tarde. CONFIRMADO.
- Pantalla huérfana: `routes/laboratorio-diseno.tsx` no está enlazada desde ninguna parte. CONFIRMADO.
- La 062 (docente edita proyectos) no restringe columnas: el docente podría cambiar `estudiante_id` o `grupo_id`. SIN VERIFICAR.
- `flujo-proyecto.ts` rehace amortización e impuestos que ya existen en `calculo-financiero.ts` (riesgo de que se desalineen). CONFIRMADO.
- Dos simulaciones Monte Carlo con fórmula de percentil distinta (12 y 14 intervalos). SIN VERIFICAR.
- Guardado de proyectos grupales sin control de versión y que sobrescribe si falla la lectura remota (`proyecto-supabase.ts:256-306`). SIN VERIFICAR.
- El logout no limpia el proyecto ni la simulación en memoria (`auth-store.ts`). SIN VERIFICAR.
- Auto-limpieza de grupos vacíos podría borrar un grupo recién creado antes de que entre su primer miembro (`grupos-supabase.ts:188-195`; el código existe, la carrera no está probada y el commit c28d14f pudo haberlo corregido). A VERIFICAR.
- `GAO`, `GAF`, `RBC` pueden dar NaN o Infinity con EBIT 0. SIN VERIFICAR.
- Entregas que no validan que el proyecto sea del alumno (`018_endurecimiento_seguridad.sql`). SIN VERIFICAR.

## Navegación y visual (SIN VERIFICAR todos, falta revisión en pantalla)

- Ruta comodín `*` fuera del layout: quien escribe una URL mala queda sin menú (`App.tsx:166-173`).
- `evaluacion-final.tsx` toma siempre el primer proyecto y no ofrece selector; sin botón cuando no hay simulación.
- Pantallas que tragan el error de carga (`dashboard-estudiante.tsx:91`, `dashboard-docente.tsx:43`) y dejan la pantalla vacía.
- Botones táctiles bajo 44 px: menú móvil (`RootLayout.tsx:134`) y modal de confirmar (`ui/confirmar.tsx`).
- Mezcla de voseo y tuteo en `evaluacion-final.tsx` y `dashboard-docente.tsx`.

## Redundancia (medida con script)

- 132 exports sin uso fuera de su archivo (la mayoría tipos; lista completa en el scratchpad de la sesión).
- Tasas fiscales escritas a mano: 0.13 en 4 archivos, 0.03 en 6, 0.25 en 8. Falta una constante central.
- Sin tests propios: `flujo-proyecto`, `iva-proyecto`, `colchon-caja`, `estacionalidad`, `finanzas/sensibilidad`. `flujo-proyecto` es el corazón del VAN.

## Decisiones de Ronald

1. **IVA en el flujo:** agy marca que los montos con IVA entran al estado de resultados y además se resta el IVA en caja. ¿Los precios y costos que carga el alumno son con IVA o sin IVA?
2. **Plazo del préstamo:** A) limitar a 60 meses en la pantalla (recomendada, simple); B) calcular y liquidar el saldo al final del año 5.
3. **Qué corregir primero:** A) seguridad (C1, C4, C5, C6) con una migración nueva 063 (recomendada, hay alumnos reales); B) cálculos (C2, C3).
4. **Pruebas en pantalla:** hace falta entrar con una cuenta de prueba (docente y alumno) para revisar celular de 375 px y el modo revisión docente; yo no puedo iniciar sesión.

## Qué NO se hizo

No se cambió código. No se aplicó la 062 en la base real. Faltan por revisar con agente visual las pantallas en celular.
