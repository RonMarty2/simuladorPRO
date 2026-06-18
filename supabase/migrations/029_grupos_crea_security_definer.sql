-- ============================================================================
-- Migración 029 · creación de grupos sin falsos rechazos de RLS
-- ============================================================================
--
-- La policy anterior consultaba cursos e inscripciones directamente. Esas
-- subconsultas también quedaban sujetas a RLS y podían devolver FALSE aunque
-- el alumno estuviera inscrito y el curso tuviera los grupos habilitados.
-- El helper SECURITY DEFINER comprueba los datos reales y mantiene todas las
-- restricciones de seguridad de la policy original.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.puede_crear_grupo_en_curso(curso_id_param UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM cursos c
    JOIN inscripciones i ON i.curso_id = c.id
    WHERE c.id = curso_id_param
      AND i.estudiante_id = auth.uid()
      AND c.grupo_habilitado = TRUE
  );
$$;

COMMENT ON FUNCTION public.puede_crear_grupo_en_curso(UUID) IS
  'Indica si el usuario actual está inscrito y puede crear grupos en el curso.';

DROP POLICY IF EXISTS "grupos_estudiante_crea" ON grupos;
CREATE POLICY "grupos_estudiante_crea"
  ON grupos FOR INSERT
  TO authenticated
  WITH CHECK (
    nota IS NULL
    AND comentario_docente IS NULL
    AND revisado_en IS NULL
    AND public.puede_crear_grupo_en_curso(curso_id)
  );

