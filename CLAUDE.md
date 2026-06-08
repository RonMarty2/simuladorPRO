# 📌 Instrucciones para IAs trabajando en este proyecto

**LEÉ PRIMERO `BITACORA.md`** — contiene la idea del producto, stack, estado
actual, decisiones de diseño y el mapa completo de features. Sin ese contexto
es muy probable que sugieras cambios que ya están hechos o que rompan
decisiones intencionales.

## Quick reference

- **Producto**: Simulador educativo de proyectos de inversión bolivianos.
- **Stack**: React + Vite + TS + Tailwind + Zustand + Supabase + Vercel PWA.
- **Lenguaje del código y UI**: español rioplatense neutro, moneda BOB.
- **Tests**: `npm test -- --run` (196 al día de hoy, deben mantenerse verdes).
- **Build**: `npm run build` (debe pasar sin warnings TypeScript).
- **Producción**: `https://simulador-pro-seven.vercel.app`.

## Reglas al trabajar

1. **NO instales librerías nuevas** sin justificación clara y aprobación.
2. **NO hagas refactors masivos** salvo que el owner lo pida explícitamente.
3. **NO modifiques migraciones ya aplicadas** (001-023). Si necesitás un
   cambio de schema, creá una nueva migración (024+).
4. **Mantené retro-compat** con datos existentes. Hay alumnos usando la app.
5. **Tests obligatorios** después de cualquier cambio en `lib/`.
6. **Cuando termines algo significativo**, ofrecé actualizar `BITACORA.md`
   pidiendo autorización al owner (ver §11 de la bitácora).

## Reglas de comunicación con el owner

- Sin emojis salvo que él los use primero.
- Sin "absolutamente", "perfecto", "excelente" como muletillas.
- Explicaciones cortas y directas; el owner es práctico y no técnico.
- Si te pide algo que rompe algo, decílo claro antes de hacerlo.
- Si una decisión es del owner (no técnica), preguntá; si es técnica y
  reversible, decidí vos y avisá qué hiciste.
