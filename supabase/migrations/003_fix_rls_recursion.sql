-- ============================================================================
-- FIX: recursión infinita en políticas RLS de perfiles/cursos/inscripciones
--
-- Causa: las políticas hacían EXISTS sobre otras tablas RLS-protegidas, que
-- a su vez chequeaban otras tablas RLS, formando un ciclo.
--
-- Solución: extraer los EXISTS a funciones SECURITY DEFINER que bypasean RLS
-- al consultar las tablas internamente (el chequeo de seguridad sigue siendo
-- correcto porque cada función usa auth.uid()).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- HELPER 1: ¿auth.uid() es docente del curso `curso_uuid`?
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.es_docente_del_curso(curso_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM cursos
    WHERE id = curso_uuid AND docente_id = auth.uid()
  );
$$;

-- ----------------------------------------------------------------------------
-- HELPER 2: ¿auth.uid() está inscrito en el curso `curso_uuid`?
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.esta_inscrito_en_curso(curso_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM inscripciones
    WHERE curso_id = curso_uuid AND estudiante_id = auth.uid()
  );
$$;

-- ----------------------------------------------------------------------------
-- HELPER 3: ¿`estudiante_uuid` está inscrito en algún curso de auth.uid()?
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.es_mi_estudiante(estudiante_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM inscripciones i
    JOIN cursos c ON c.id = i.curso_id
    WHERE i.estudiante_id = estudiante_uuid
      AND c.docente_id = auth.uid()
  );
$$;

-- ============================================================================
-- PERFILES — recrear política recursiva
-- ============================================================================
DROP POLICY IF EXISTS "perfiles_docente_ve_inscritos" ON perfiles;

CREATE POLICY "perfiles_docente_ve_inscritos"
  ON perfiles FOR SELECT
  TO authenticated
  USING (public.es_mi_estudiante(id));

-- ============================================================================
-- CURSOS — recrear política recursiva
-- ============================================================================
DROP POLICY IF EXISTS "cursos_estudiante_inscrito" ON cursos;

CREATE POLICY "cursos_estudiante_inscrito"
  ON cursos FOR SELECT
  TO authenticated
  USING (public.esta_inscrito_en_curso(id));

-- ============================================================================
-- INSCRIPCIONES — recrear política recursiva
-- ============================================================================
DROP POLICY IF EXISTS "inscripciones_docente_ve" ON inscripciones;

CREATE POLICY "inscripciones_docente_ve"
  ON inscripciones FOR SELECT
  TO authenticated
  USING (public.es_docente_del_curso(curso_id));

-- ============================================================================
-- PROYECTOS — preventivamente reemplazar EXISTS por helper (no daba error
-- todavía pero por consistencia y evitar futuras recursiones)
-- ============================================================================
DROP POLICY IF EXISTS "proyectos_docente_lee_curso" ON proyectos;

CREATE POLICY "proyectos_docente_lee_curso"
  ON proyectos FOR SELECT
  TO authenticated
  USING (public.es_docente_del_curso(curso_id));
