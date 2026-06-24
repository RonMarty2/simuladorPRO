-- ============================================================================
-- Migracion 032 - Semana E oculta hasta que Ronald la publique
-- ============================================================================
--
-- Objetivo:
--   * Semana E queda instalada, pero no se abre automaticamente.
--   * Los eventos Semana E existentes pasan a "archivado" para ocultarlos.
--   * Solo el admin ronaldmartinezjimenes@gmail.com puede crear/publicar/ocultar
--     eventos Semana E.
--   * Los cursos normales no cambian.
--
-- En la app:
--   estado = 'archivado' -> Semana E oculta
--   estado = 'activo'    -> Semana E publicada
-- ============================================================================

-- 1) Ocultar cualquier Semana E que haya quedado activa por pruebas previas.
UPDATE cursos
SET estado = 'archivado'
WHERE es_semana_e = TRUE
  AND estado = 'activo';

-- 2) Helper estricto: solo Ronald + es_admin=true.
CREATE OR REPLACE FUNCTION public.es_admin_semana_e_actual()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM perfiles
    WHERE id = auth.uid()
      AND es_admin = TRUE
      AND lower(email) = 'ronaldmartinezjimenes@gmail.com'
  );
$$;

COMMENT ON FUNCTION public.es_admin_semana_e_actual() IS
  'Devuelve TRUE solo para el admin Ronald que puede crear/publicar/ocultar Semana E.';

-- 3) Proteger INSERT/UPDATE de Semana E.
CREATE OR REPLACE FUNCTION public.proteger_semana_e_admin_ronald()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.es_semana_e IS TRUE AND NOT public.es_admin_semana_e_actual() THEN
      RAISE EXCEPTION 'Solo el administrador autorizado puede crear eventos Semana E';
    END IF;
    RETURN NEW;
  END IF;

  IF NEW.es_semana_e IS DISTINCT FROM OLD.es_semana_e THEN
    IF NOT public.es_admin_semana_e_actual() THEN
      RAISE EXCEPTION 'Solo el administrador autorizado puede convertir cursos a Semana E';
    END IF;
  END IF;

  IF (OLD.es_semana_e IS TRUE OR NEW.es_semana_e IS TRUE)
     AND NEW.estado IS DISTINCT FROM OLD.estado THEN
    IF NOT public.es_admin_semana_e_actual() THEN
      RAISE EXCEPTION 'Solo el administrador autorizado puede publicar u ocultar Semana E';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_proteger_semana_e_admin_ronald ON cursos;
CREATE TRIGGER trg_proteger_semana_e_admin_ronald
BEFORE INSERT OR UPDATE OF es_semana_e, estado ON cursos
FOR EACH ROW
EXECUTE FUNCTION public.proteger_semana_e_admin_ronald();

-- 4) Actualizar la lectura/inscripcion publica: Semana E solo existe para
-- estudiantes si esta activa.
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
      AND estado = 'activo'
  );
$$;

DROP POLICY IF EXISTS "cursos_semana_e_lectura_publica" ON cursos;
CREATE POLICY "cursos_semana_e_lectura_publica"
  ON cursos FOR SELECT
  TO authenticated
  USING (es_semana_e = TRUE AND estado = 'activo');

