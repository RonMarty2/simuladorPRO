-- ============================================================================
-- Permitir que un estudiante construya un proyecto sin estar inscrito todavía
-- en un curso (FASE 4 puede ejecutarse antes que el panel del docente de
-- FASE 8). curso_id pasa a ser nullable. La RLS sigue funcionando porque
-- estudiante_id = auth.uid() es el chequeo principal.
-- ============================================================================

ALTER TABLE proyectos ALTER COLUMN curso_id DROP NOT NULL;
