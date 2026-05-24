-- ============================================================================
-- FASE 9 — Modos de simulación del curso
--
-- El docente puede elegir cómo se aplican los eventos económicos a sus
-- estudiantes:
--   • automatico       — sistema sortea eventos aleatorios (default, lo de hoy)
--   • docente_dispara  — el docente lanza cada evento manualmente
--   • curado           — el docente elige los eventos exactos a aplicar
-- ============================================================================

ALTER TABLE cursos
  ADD COLUMN modo_simulacion TEXT NOT NULL DEFAULT 'automatico'
    CHECK (modo_simulacion IN ('automatico', 'docente_dispara', 'curado')),
  ADD COLUMN eventos_curados UUID[] NULL;

COMMENT ON COLUMN cursos.modo_simulacion IS
  'Cómo se aplican los eventos económicos en la simulación. automatico=aleatorio. docente_dispara=el docente lanza cada uno. curado=lista fija de eventos elegidos por el docente.';
COMMENT ON COLUMN cursos.eventos_curados IS
  'Si modo_simulacion=curado, arreglo de UUIDs de la tabla eventos que se van a aplicar (en orden). NULL para los otros modos.';
