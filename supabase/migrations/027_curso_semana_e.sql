-- ============================================================================
-- Migración 027 · Modo "Semana E" para cursos especiales
-- ============================================================================
--
-- El docente puede marcar un curso como "Semana E" (evento de viabilidad de
-- proyectos universitarios sin calificaciones). Al activarlo:
--   - El estudiante NO ve entregas, notas, podio ni evaluación.
--   - Se le muestra un banner de bienvenida con checklist paso a paso.
--   - El constructor oculta el botón "Entregar etapa".
--   - El simulador queda más limpio (sin catálogo de eventos en el sidebar).
--
-- El flag NO afecta cursos existentes: default = FALSE.
-- ============================================================================

ALTER TABLE cursos
  ADD COLUMN IF NOT EXISTS es_semana_e BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN cursos.es_semana_e IS
  'Si TRUE, el curso es un evento Semana E: UI simplificada sin entregas/notas.';
