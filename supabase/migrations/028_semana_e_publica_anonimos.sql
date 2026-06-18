-- ============================================================================
-- Migración 028 · Semana E pública: usuarios anónimos pueden entrar
-- ============================================================================
--
-- Para el evento "Semana E" queremos que CUALQUIERA entre sin necesidad de
-- crear cuenta. Supabase soporta `signInAnonymously()` que genera un user
-- con UUID válido y session real, pero por defecto NUESTRAS policies de RLS
-- exigen `auth.uid()` con datos de perfil completos.
--
-- Esta migración agrega:
--  • Helper `es_curso_semana_e(uuid)` para que las policies miren rápido si
--    el curso destino es público de evento.
--  • Policies adicionales (NO reemplazan las existentes — Postgres OR-ea):
--      - Cualquier autenticado puede LEER cursos Semana E (por id) para
--        validar antes de inscribirse.
--      - Cualquier autenticado puede INSCRIBIRSE a un curso Semana E.
--
-- IMPORTANTE: aparte de correr esta SQL, hay que ENCENDER "Anonymous sign-ins"
-- en Supabase Dashboard → Authentication → Providers → Anonymous.
-- ============================================================================

-- Helper: ¿el curso es Semana E?
CREATE OR REPLACE FUNCTION es_curso_semana_e(curso_id_param UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM cursos
    WHERE id = curso_id_param
      AND es_semana_e = TRUE
  );
$$;

-- Lectura pública de cursos Semana E por id (para que el flujo anon valide).
DROP POLICY IF EXISTS "cursos_semana_e_lectura_publica" ON cursos;
CREATE POLICY "cursos_semana_e_lectura_publica"
  ON cursos FOR SELECT
  TO authenticated
  USING (es_semana_e = TRUE);

-- Cualquier usuario autenticado (incluido anonymous) puede inscribirse a un
-- curso Semana E. La policy original sigue cubriendo los cursos normales.
DROP POLICY IF EXISTS "inscripciones_semana_e_publica" ON inscripciones;
CREATE POLICY "inscripciones_semana_e_publica"
  ON inscripciones FOR INSERT
  TO authenticated
  WITH CHECK (
    estudiante_id = auth.uid()
    AND es_curso_semana_e(curso_id)
  );
