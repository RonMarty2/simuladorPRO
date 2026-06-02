-- ============================================================================
-- FASE 23 — TIPOS DE PROYECTO SIMULABLES EN EL CURSO
--
-- El docente define qué tipos de proyecto se pueden simular en su curso. El
-- selector "Simular" del alumno respeta esa configuración: solo aparecen los
-- proyectos cuyo tipo está habilitado. El lanzador de eventos también filtra
-- el alcance según estos flags.
--
-- Defaults pedagógicos:
--   - Caso del curso: TRUE (el típico — todos analizan el mismo).
--   - Individual: FALSE (el alumno construye, pero no simula su propio
--     proyecto a menos que el docente lo habilite).
--   - Grupal: TRUE (cuando el grupo está habilitado, es esperable simularlo).
-- ============================================================================

ALTER TABLE cursos
  ADD COLUMN IF NOT EXISTS simulacion_caso_curso BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS simulacion_individual BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS simulacion_grupal BOOLEAN NOT NULL DEFAULT TRUE;

COMMENT ON COLUMN cursos.simulacion_caso_curso IS
  'Si TRUE, los alumnos pueden simular el caso del curso (entrega_estudiante con caso_origen_id).';
COMMENT ON COLUMN cursos.simulacion_individual IS
  'Si TRUE, los alumnos pueden simular su proyecto individual (libre, sin caso_origen_id ni grupo_id).';
COMMENT ON COLUMN cursos.simulacion_grupal IS
  'Si TRUE, los alumnos pueden simular el proyecto grupal del grupo al que pertenecen.';
