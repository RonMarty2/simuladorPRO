# Plan: un simulador con una esencia propia para cada tipo de proyecto

> Plan vivo. Se retoma desde aquí, junto con `BITACORA.md` (§10 "Retomar aquí").
> Creado: 2026-10-22. Cada vez que se termine un paso, marcar la casilla y
> anotar la fecha y el commit.

## 1. Objetivo (palabras del owner)

El simulador debe servir para **distintos tipos de proyecto**, y las situaciones
y la forma de evaluar cambian según el tipo. Un proyecto de productos no se
evalúa como uno de costo-beneficio, uno social, uno de marketing o uno de
suscripción: cada uno tiene su propia esencia. Debe preparar al alumno para las
situaciones reales de SU tipo, con ejemplos de datos simulados o genéricos.

Acuerdos del owner durante el trabajo:
- Cada tipo se investiga con rigor (autores, metodologías, ejemplos reales), uno
  por uno, sin apuro.
- No solo importan los proyectos que ganan plata: marketing, comunicación,
  ONG, salud o educación públicas también necesitan análisis económico.
- "El Patrón" es el nombre popular del servicio de enviar flores a alguien con
  una persona vestida de charro ("el patrón te mandó"). La ficha
  `eventos-servicios-sorpresa.md` lo trata; el mapa dice que no encontró fuente
  y debe corregirse (ver paso 0.2).
- Las 9 etapas del constructor y las fórmulas financieras NO se cambian sin su OK.
- Español neutro con tuteo. Explicaciones cortas, con pasos numerados.
- Preocupación por el gasto de tokens: no leer archivos enteros sin necesidad.

## 2. Qué existe hoy

**Investigación (local, NO subida a GitHub)**: carpeta `docs/metodologia/`
(sincronizada por Synology). Mapa `00-taxonomia-tipos.md` (24 tipos: 14 con
ingreso, 10 sin ingreso directo) y 20 fichas en `docs/metodologia/tipos/`:
ahorro-eficiencia, comunicacion-institucional, eventos-servicios-sorpresa,
marketing, publicidad-medios, servicios-software-a-medida, social-ong,
suscripcion-saas, producto-unidades, alquiler-activos, hoteleria-turismo,
plataforma-marketplace, franquicia-licencia, concesion-infraestructura,
educacion-privada, salud-privada, agro-campana, microcredito-finanzas,
educacion-publica, salud-publica.
Cada ficha tiene 10 secciones: valor, indicadores, evaluación económica, errores
típicos, 12 a 15 situaciones con 4 decisiones en dilema, variables propias del
motor, ejemplos reales con enlace, fuentes con nivel A/B/C, no confirmado y
cifras a validar localmente. Las magnitudes marcadas "estimación" son del
agente investigador y deben calibrarse con datos de Bolivia.

**Producto**: 51 plantillas de ejemplo en 14 categorías (`lib/plantillas.ts`,
campo `categoria`) y 4 modelos de ingreso (unidades, suscripción, publicidad,
costo-beneficio). Motor de eventos en `lib/motor-eventos.ts`; 50 eventos
generales en migración 006 (31 valen para todos).

**Base nueva (commit 597ac05, publicada)**: cada proyecto lleva `tipoNegocio`
(la categoría de su plantilla). Un evento con `'tipo:xxx'` en
`sectores_afectados` solo llega a proyectos de ese tipo (función
`eventoAplicaAProyecto`, usada por el motor y por el lanzador del docente).
Proyectos sin `tipoNegocio` (libres o viejos) solo reciben eventos por sector.
Migraciones 034 (turismo, 10 eventos) y 035 (suscripción, 10 eventos): aplicadas
en Supabase el 2026-10-22. Prueba automática
`eventos-por-tipo-sql.test.ts` valida toda migración `NNN_eventos_*.sql`
posterior a la 033.

## 3. Mapa: ficha investigada -> categoría del producto

| Ficha | Categoría(s) de plantilla | Estado de eventos |
|---|---|---|
| hoteleria-turismo | turismo | HECHO (034) |
| suscripcion-saas | suscripcion | HECHO (035) |
| producto-unidades | gastronomia, produccion, comercio | HECHO (036) |
| publicidad-medios | medios | HECHO (037) |
| eventos-servicios-sorpresa | eventos | HECHO (038) |
| marketing (+ comunicacion-institucional) | marketing | HECHO (039 y 046, aplicadas) |
| social-ong + educacion-publica + salud-publica | social | HECHO (040 social-ong aplicado; 047 educacion y salud publicas aplicada) |
| ahorro-eficiencia | costo_beneficio | HECHO (041) |
| alquiler-activos | alquiler | HECHO (042, aplicada) |
| agro-campana | agricultura | HECHO (043, aplicada) |
| servicios-software-a-medida | servicios (generales); lo de software queda para tecnologia | HECHO (044, aplicada) |
| plataforma-marketplace | tecnologia (app delivery y SaaS) | HECHO (045, aplicada) |
| salud-privada, educacion-privada, franquicia-licencia, concesion-infraestructura, microcredito-finanzas | (no existe categoría ni plantilla) | falta crear plantillas |
| B6 cultural, B7 TI interna, B8 infraestructura pública, B9 cumplimiento | (sin ficha todavía) | falta investigar |

Nota: la categoría `tecnologia` mezcla SaaS (suscripción) y app de delivery
(comisión). Si hace falta, filtrar por modelo además de por categoría.

## 4. Fases y pasos (marcar al completar)

### Fase 0. Cierre de la investigación
- [x] 0.1 20 de 24 fichas escritas (2026-10-22).
- [x] 0.2 (2026-10-22, hecho) Corregir "El Patrón" en `00-taxonomia-tipos.md` (sección 8.1) con la
      definición del owner y revisar que `eventos-servicios-sorpresa.md` lo cubra.
- [ ] 0.3 Investigar los 4 tipos que faltan (B6 cultural, B7 TI interna, B8
      infraestructura pública, B9 cumplimiento normativo). DECIDIR con el
      owner si vale el gasto (cada ficha cuesta unos 150.000 a 200.000 tokens
      con un agente; son los tipos menos probables en sus cursos).
- [ ] 0.4 Decidir con el owner si `docs/metodologia/` se sube a GitHub (antes
      confirmar si el repo es público; ver bitácora, pendientes del owner).

### Fase 1. Base técnica
- [x] 1.1 `tipoNegocio` en el proyecto y filtro de eventos por tipo (597ac05).
- [x] 1.2 (2026-10-23, hecho) Mostrar bien los eventos de tipo en el lanzador del docente
      (`LanzadorEventos.tsx` muestra la etiqueta cruda `tipo:turismo`).
- [ ] 1.3 Que un proyecto libre (sin plantilla) elija su tipo en el constructor
      (hoy solo las plantillas lo estampan). Cambia UI: pedir OK.

### Fase 2. Eventos propios por tipo (capa 1, no toca fórmulas)
Un paso por fila de la tabla del §3. Procedimiento por tipo en el §5.
- [x] 2.1 turismo (034)   - [x] 2.2 suscripcion (035)
- [x] 2.3 gastronomia + produccion + comercio (producto-unidades): migracion 036, 12 eventos. APLICADA 2026-10-22.
- [x] 2.4 medios (037, 10 eventos, APLICADA 2026-10-22)   - [x] 2.5 eventos (038, 10 eventos, APLICADA 2026-10-22)   - [x] 2.6 marketing (039, 11 eventos, APLICADA 2026-10-22)   - [x] 2.7 social (040, 11 eventos de social-ong, APLICADA 2026-10-22; faltan usar las fichas educacion-publica y salud-publica)
- [x] 2.8 costo_beneficio (041, 11 eventos, APLICADA 2026-10-22)   - [x] 2.9 alquiler (042, 11 eventos, APLICADA 2026-10-23)   - [x] 2.10 agricultura (043, 11 eventos, APLICADA 2026-10-23)
- [x] 2.11 servicios (044, 7 eventos, APLICADA 2026-10-23)   - [x] 2.12 tecnologia (045, 8 eventos, APLICADA 2026-10-23)

### Fase 3. Plantillas de ejemplo nuevas (datos simulados)
Para los tipos sin categoría: clínica privada, colegio o instituto privado,
franquicia (comprar una), cooperativa de agua (concesión), cooperativa de
microcrédito. Cada una con su escenario y su `ensena`/`veredicto` como las
actuales, y luego sus eventos (como la Fase 2).
- [x] 3.1 salud privada   - [x] 3.2 educación privada   - [x] 3.3 franquicia
- [x] 3.4 concesión de infraestructura   - [x] 3.5 microcrédito (2026-10-23: las 5 plantillas creadas y calibradas; sus eventos propios: migraciones 048 a 052, 51 eventos, APLICADAS el 2026-10-23)

### Fase 4. Esencia propia: variables e indicadores por tipo (REQUIERE OK DEL OWNER)
Hoy el estado de la simulación tiene solo caja, deuda, precio, demanda, costos y
reputación. Cada tipo necesita las suyas (ocupación y ADR en turismo; socios y
bajas en suscripción; mora en microcrédito; beneficiarios y costo por
beneficiario en lo social; ventas incrementales en marketing) y su manera de
evaluarse (la sección 3 y la 6 de cada ficha lo detallan). Esto cambia el motor
y los resultados.
- [x] 4.1 (2026-10-23) Propuesta presentada: `docs/metodologia/FASE-4-PROPUESTA.md`. El owner eligió el Camino A (panel de indicadores, sin tocar fórmulas) y empezar por turismo.
- [ ] 4.2 Implementar de a un tipo. Hecho: turismo (2026-10-23: `lib/indicadores-por-tipo.ts` y `PanelIndicadoresTipo`, en el resumen final del constructor; campo opcional `capacidadAnual`; solo el hostal lo trae). Siguen: suscripción, salud privada, microcrédito, social, alquiler, el resto.
- [ ] 4.3 Indicadores propios en resultados y diagnóstico pedagógico.

### Fase 5. Calibración y cierre
- [ ] 5.1 Calibrar las cifras "estimación" con datos de Bolivia (docentes,
      gremios, empresarios; cada ficha lista a quién preguntar en su sección 10).
- [ ] 5.2 Actualizar `BITACORA.md` (§6 migraciones, §15.2 motor, §16.2 recetas).
- [ ] 5.3 Probar en la app real un proyecto de cada tipo (ver memoria
      "probar todos los tipos").

## 5. Procedimiento para cada tipo en la Fase 2 (receta probada con 034 y 035)

1. Leer SOLO la sección 5 de la ficha (empieza en `## 5. SITUACIONES`;
   buscar con grep el número de línea y leer ese tramo, no el archivo entero).
2. Elegir 8 a 10 situaciones. Escribir `supabase/migrations/0NN_eventos_<tipo>.sql`
   copiando el formato de `034_eventos_turismo.sql`: código `XXX001`...,
   `sectores_afectados ARRAY['tipo:<categoria>']` (varias categorías si
   corresponde), 4 opciones A-D con dilema real, `ON CONFLICT (codigo) DO NOTHING`,
   sin apóstrofes dentro del JSON (la prueba lee el SQL con una expresión regular).
3. Consecuencias SOLO con variables que el motor ya maneja: `caja`, `deuda`,
   `demanda`, `precio_venta`, `costos` (y alias: `costos_comercializacion`,
   `costos_servicios`, `costos_importacion`...), `reputacion`. Porcentajes
   como "+6%"/"-4%", multiplicadores como "*0.9". Ver `aliasACampo` en
   `motor-eventos.ts`.
4. `npx vitest run src/lib/eventos-por-tipo-sql.test.ts` (valida forma y que cada
   consecuencia mueva algo), luego `npx tsc --noEmit -p .` y `npm test -- --run`.
5. Commit local. Antes de publicar, `npm run build`.
6. Aplicar el SQL en Supabase (ver §6) y recién después hacer push a `main`
   con el OK del owner.

## 6. Reglas operativas aprendidas (importante)

- **La IA no ejecuta SQL en Supabase ni hace push a `main` sin OK**: el
  sistema bloquea escribir en el editor SQL de producción. La IA copia el SQL al
  portapapeles y abre la página
  `https://supabase.com/dashboard/project/syfbgauvictgykdptamb/sql/new` en el
  navegador "RONMARTY"; el owner pega con Ctrl+V y pulsa Run.
- El portapapeles se pisa fácil. Lo que funcionó: abrir el SQL en el Bloc de
  notas, Ctrl+A, Ctrl+C, hacer clic en la línea 1 del editor (NO en la caja
  "Generate" de la IA de Supabase; si aparece, pulsar Esc) y Ctrl+V.
- Los archivos del repo usan saltos de línea CRLF; al editar por script, tenerlo
  en cuenta (reemplazar `\n` por `\r\n`).
- `rg` no está disponible en el entorno; usar grep por Bash.
- Costo de referencia de un agente investigador: 140.000 a 230.000 tokens y 6 a
  10 minutos. Hacer el trabajo en línea (sin agentes) cuesta menos.
- Estado de pruebas al 2026-10-22: 436 tests en verde, build OK.

## 7. Cómo retomar en una sesión nueva

1. Leer `CLAUDE.md`, `BITACORA.md` (§10 "Retomar aquí") y este plan.
2. `git log --oneline -5` y `git status`: lo último publicado es 597ac05 más el
   commit que actualiza esta documentación.
3. Mirar qué casillas del §4 están sin marcar; seguir en orden (Fase 2 primero).
4. Preguntar al owner solo lo que pide OK explícito (Fase 4, UI nueva, subir los
   docs). Todo lo demás: decidir y avisar.
