-- ============================================================================
-- Migración 026 · Config de escenarios económicos por curso
-- ============================================================================
--
-- El Modo Escenarios (Fase A.1) trae 3 escenarios: Optimista, Base y Pesimista
-- con valores hardcodeados pensados para el contexto boliviano. Esta migración
-- permite que cada docente AJUSTE esos valores por curso, sin pedirle al equipo
-- de desarrollo que toque el código.
--
-- ESTRUCTURA del JSONB (todos los campos opcionales — si falta, se usa el
-- default del código):
--   {
--     "optimista": {
--       "precioMul": 1.10,
--       "demandaMul": 1.15,
--       "costoDirectoMul": 0.95,
--       "costoGeneralMul": 0.95,
--       "personalMul": 1.00,
--       "inversionMul": 1.00,
--       "capitalTrabajoMul": 1.00,
--       "tasaInteresDeltaPp": -0.02
--     },
--     "pesimista": { ... mismos campos, valores duros }
--   }
--
-- IMPACTO: ninguno sobre datos existentes. Cursos sin config siguen usando
-- los defaults del código. Si la columna queda NULL, el frontend cae al
-- comportamiento de Fase A.1.
-- ============================================================================

ALTER TABLE cursos
  ADD COLUMN IF NOT EXISTS escenarios_config JSONB DEFAULT NULL;

COMMENT ON COLUMN cursos.escenarios_config IS
  'Config de modificadores Optimista/Pesimista para el modo Escenarios. NULL = defaults del código.';
