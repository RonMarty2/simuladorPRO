-- ============================================================================
-- Migración 065 - El estudiante no puede mover su proyecto a un curso o grupo ajeno
-- ============================================================================
-- Antes (002): la política "proyectos_estudiante_propio" (FOR ALL) deja al
-- estudiante cambiar curso_id y grupo_id de su proyecto a cualquier valor.
-- Ahora, si un usuario autenticado cambia curso_id o grupo_id:
--   * admin y docente del curso: permitido.
--   * estudiante: el curso nuevo debe ser uno donde esta inscrito y el grupo
--     nuevo (si hay) debe ser uno donde es miembro y que sea de ese curso.
-- No cambia datos existentes. Las funciones SECURITY DEFINER (RPC) no se ven
-- afectadas. Reversible: DROP TRIGGER trg_proyectos_valida_curso_grupo ON proyectos;
-- ============================================================================

CREATE OR REPLACE FUNCTION public.validar_cambio_curso_grupo_proyecto()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Sin cambio en curso/grupo: nada que validar.
  IF NEW.curso_id IS NOT DISTINCT FROM OLD.curso_id
     AND NEW.grupo_id IS NOT DISTINCT FROM OLD.grupo_id THEN
    RETURN NEW;
  END IF;

  -- Solo se controla al usuario final; RPC SECURITY DEFINER y SQL editor pasan.
  IF current_user <> 'authenticated' OR auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  IF public.es_admin_actual()
     OR (NEW.curso_id IS NOT NULL AND public.es_docente_del_curso(NEW.curso_id))
     OR (OLD.curso_id IS NOT NULL AND public.es_docente_del_curso(OLD.curso_id)) THEN
    RETURN NEW;
  END IF;

  IF NEW.curso_id IS DISTINCT FROM OLD.curso_id AND NEW.curso_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM inscripciones i
      WHERE i.curso_id = NEW.curso_id AND i.estudiante_id = auth.uid()
    ) THEN
      RAISE EXCEPTION 'No podes mover el proyecto a un curso donde no estas inscrito';
    END IF;
  END IF;

  IF NEW.grupo_id IS DISTINCT FROM OLD.grupo_id AND NEW.grupo_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM grupo_miembros gm
      JOIN grupos g ON g.id = gm.grupo_id
      WHERE gm.grupo_id = NEW.grupo_id
        AND gm.estudiante_id = auth.uid()
        AND (NEW.curso_id IS NULL OR g.curso_id = NEW.curso_id)
    ) THEN
      RAISE EXCEPTION 'No podes asignar el proyecto a un grupo del que no sos miembro';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_proyectos_valida_curso_grupo ON proyectos;
CREATE TRIGGER trg_proyectos_valida_curso_grupo
  BEFORE UPDATE ON proyectos
  FOR EACH ROW EXECUTE FUNCTION public.validar_cambio_curso_grupo_proyecto();
