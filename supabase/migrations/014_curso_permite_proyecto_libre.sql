-- ============================================================================
-- FASE 14 — Opción por curso: "el estudiante elige y arma su propio proyecto"
--
-- Hasta ahora, dentro de un curso el estudiante solo podía TOMAR un caso que el
-- docente dejaba fijo (tipo y modelo predefinidos). Esta bandera permite que el
-- docente habilite que cada estudiante CREE su propio proyecto individual,
-- eligiendo el tipo de análisis (V1/V2) y el modelo de ingreso que mejor se
-- ajuste a su idea — pero siempre dentro del curso (no proyectos sueltos).
--
-- Default TRUE: la opción más flexible. El docente puede desmarcarla si quiere
-- que todos trabajen sobre su caso/plantilla.
-- ============================================================================

ALTER TABLE cursos
  ADD COLUMN permite_proyecto_libre BOOLEAN NOT NULL DEFAULT TRUE;

COMMENT ON COLUMN cursos.permite_proyecto_libre IS
  'Si TRUE, los estudiantes del curso pueden crear su propio proyecto individual (eligen V1/V2 y modelo de ingreso). Si FALSE, solo trabajan los casos del docente.';
