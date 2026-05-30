-- ============================================================================
-- FASE 20 — La universidad vive en el CURSO, no en el perfil del estudiante
--
-- Antes cada estudiante escribía su universidad al registrarse en texto
-- libre. Resultado: 3 variantes de la misma ('ucatec', 'Ucatec', 'UCATEC')
-- en el panel de inscritos del docente.
--
-- A partir de ahora el docente define la universidad al crear el curso.
-- Todos los inscritos heredan esa universidad para esa clase. Una sola
-- fuente de verdad, sin variantes.
--
-- La columna perfiles.universidad sigue existiendo (por compatibilidad y
-- por si la app la quiere mostrar en el perfil del alumno), pero ya NO
-- se llena en el registro nuevo.
-- ============================================================================

ALTER TABLE cursos
  ADD COLUMN IF NOT EXISTS universidad TEXT NULL;

COMMENT ON COLUMN cursos.universidad IS
  'Universidad a la que pertenece este curso (definida por el docente al crearlo). Reemplaza el campo libre por estudiante en perfiles.universidad.';
