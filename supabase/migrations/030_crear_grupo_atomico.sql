-- ============================================================================
-- Migración 030 · creación atómica de grupo, proyecto y primer integrante
-- ============================================================================
-- Evita que las tres escrituras del flujo se evalúen con políticas RLS
-- distintas y deja la operación completa dentro de una sola transacción.

CREATE OR REPLACE FUNCTION public.crear_grupo_estudiante_atomico(
  p_curso_id UUID,
  p_nombre_grupo TEXT,
  p_proyecto_id UUID,
  p_proyecto_nombre TEXT,
  p_proyecto_datos JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_usuario_id UUID := auth.uid();
  v_grupo_id UUID;
  v_cupo_max INTEGER;
BEGIN
  IF v_usuario_id IS NULL THEN
    RAISE EXCEPTION 'Debes iniciar sesión para crear un grupo'
      USING ERRCODE = '42501';
  END IF;

  IF NULLIF(BTRIM(p_nombre_grupo), '') IS NULL THEN
    RAISE EXCEPTION 'El grupo necesita un nombre'
      USING ERRCODE = '22023';
  END IF;

  SELECT c.grupo_cupo_max
  INTO v_cupo_max
  FROM cursos c
  JOIN inscripciones i
    ON i.curso_id = c.id
   AND i.estudiante_id = v_usuario_id
  WHERE c.id = p_curso_id
    AND c.es_semana_e = TRUE
    AND c.grupo_habilitado = TRUE
    AND c.estado = 'activo';

  IF v_cupo_max IS NULL THEN
    RAISE EXCEPTION 'No estás inscrito o el curso no permite crear grupos'
      USING ERRCODE = '42501';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM grupo_miembros gm
    JOIN grupos g ON g.id = gm.grupo_id
    WHERE gm.estudiante_id = v_usuario_id
      AND g.curso_id = p_curso_id
  ) THEN
    RAISE EXCEPTION 'Ya perteneces a un grupo de este curso'
      USING ERRCODE = '23505';
  END IF;

  INSERT INTO grupos (curso_id, nombre, cupo_max)
  VALUES (p_curso_id, BTRIM(p_nombre_grupo), v_cupo_max)
  RETURNING id INTO v_grupo_id;

  INSERT INTO proyectos (
    id,
    estudiante_id,
    curso_id,
    grupo_id,
    nombre,
    datos,
    estado,
    tipo
  )
  VALUES (
    p_proyecto_id,
    v_usuario_id,
    p_curso_id,
    v_grupo_id,
    p_proyecto_nombre,
    COALESCE(p_proyecto_datos, '{}'::JSONB),
    'construyendo',
    'proyecto_grupal'
  );

  INSERT INTO grupo_miembros (grupo_id, estudiante_id)
  VALUES (v_grupo_id, v_usuario_id);

  RETURN v_grupo_id;
END;
$$;

REVOKE ALL ON FUNCTION public.crear_grupo_estudiante_atomico(
  UUID, TEXT, UUID, TEXT, JSONB
) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.crear_grupo_estudiante_atomico(
  UUID, TEXT, UUID, TEXT, JSONB
) TO authenticated;
