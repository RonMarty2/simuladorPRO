-- ============================================================================
-- Migración 029 · grupos_estudiante_crea más robusta (SECURITY DEFINER)
-- ============================================================================
--
-- Bug reportado: estudiantes que ya estaban inscritos (incluso con
-- cursos.grupo_habilitado = TRUE confirmado por SQL) seguían recibiendo
-- "new row violates row-level security policy for table 'grupos'" al crear
-- su grupo en Semana E.
--
-- Causa: la policy "grupos_estudiante_crea" (migraciones 015 y 018) hace un
-- EXISTS que lee `cursos` y `inscripciones` directamente. Esas lecturas
-- TAMBIÉN están sujetas a las RLS policies de esas tablas para el rol que
-- ejecuta el INSERT. Si por cualquier motivo (orden de policies, timing del
-- INSERT en `inscripciones`, sesión recién creada) ese rol no puede leer su
-- propia fila de `inscripciones` o la fila de `cursos` en el momento exacto
-- del INSERT, el EXISTS devuelve falso aunque los datos sean correctos.
--
-- Fix: mover el chequeo a una función SECURITY DEFINER (mismo patrón que
-- `esta_inscrito_en_curso` y `es_docente_del_curso`), que lee esas tablas con
-- privilegios de owner, sin pasar por RLS. Así el resultado depende solo de
-- los datos, no de qué pueda leer el rol `authenticated` en ese instante.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.puede_crear_grupo_en_curso(curso_id_param UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM cursos c
    JOIN inscripciones i ON i.curso_id = c.id
    WHERE c.id = curso_id_param
      AND i.estudiante_id = auth.uid()
      AND c.grupo_habilitado = TRUE
  );
$$;

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
