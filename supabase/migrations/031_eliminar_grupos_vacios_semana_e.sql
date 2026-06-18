-- ============================================================================
-- Migración 031 · eliminar equipos vacíos exclusivamente en Semana E
-- ============================================================================
-- Cuando un estudiante salía, antes solo se borraba su membresía. Si era el
-- último integrante quedaban un grupo 0/N y su proyecto como registros
-- huérfanos visibles para el docente.

CREATE OR REPLACE FUNCTION public.salir_grupo_semana_e(p_grupo_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_usuario_id UUID := auth.uid();
  v_es_semana_e BOOLEAN;
  v_elimino_grupo BOOLEAN := FALSE;
BEGIN
  IF v_usuario_id IS NULL THEN
    RAISE EXCEPTION 'Debes iniciar sesión para salir del equipo'
      USING ERRCODE = '42501';
  END IF;

  SELECT c.es_semana_e
  INTO v_es_semana_e
  FROM grupos g
  JOIN cursos c ON c.id = g.curso_id
  WHERE g.id = p_grupo_id
  FOR UPDATE OF g;

  IF v_es_semana_e IS DISTINCT FROM TRUE THEN
    RAISE EXCEPTION 'Esta operación solo está disponible para Semana E'
      USING ERRCODE = '42501';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM grupo_miembros
    WHERE grupo_id = p_grupo_id
      AND estudiante_id = v_usuario_id
  ) THEN
    RAISE EXCEPTION 'No perteneces a este equipo'
      USING ERRCODE = '42501';
  END IF;

  DELETE FROM grupo_miembros
  WHERE grupo_id = p_grupo_id
    AND estudiante_id = v_usuario_id;

  IF NOT EXISTS (
    SELECT 1 FROM grupo_miembros WHERE grupo_id = p_grupo_id
  ) THEN
    -- proyectos.grupo_id usa ON DELETE CASCADE, por lo que también desaparece
    -- el proyecto compartido y todos sus datos dependientes.
    DELETE FROM grupos WHERE id = p_grupo_id;
    v_elimino_grupo := TRUE;
  END IF;

  RETURN v_elimino_grupo;
END;
$$;

REVOKE ALL ON FUNCTION public.salir_grupo_semana_e(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.salir_grupo_semana_e(UUID) TO authenticated;

-- Limpieza única de los fantasmas que ya quedaron de pruebas anteriores.
-- Se limita estrictamente a cursos marcados como Semana E.
DELETE FROM grupos g
USING cursos c
WHERE c.id = g.curso_id
  AND c.es_semana_e = TRUE
  AND NOT EXISTS (
    SELECT 1 FROM grupo_miembros gm WHERE gm.grupo_id = g.id
  );
