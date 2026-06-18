-- ============================================================================
-- Migracion 026 - Sincronizar cupo de grupos existentes con el curso
--
-- El cupo definido en cursos.grupo_cupo_max se copia a grupos.cupo_max cuando
-- los estudiantes crean un grupo. Si el docente cambia el cupo despues, los
-- grupos ya creados deben reflejar ese nuevo limite para permitir mas miembros.
-- ============================================================================

-- Corrige datos existentes que quedaron con un cupo anterior.
UPDATE grupos g
SET cupo_max = c.grupo_cupo_max
FROM cursos c
WHERE c.id = g.curso_id
  AND g.cupo_max IS DISTINCT FROM c.grupo_cupo_max;

CREATE OR REPLACE FUNCTION sincronizar_cupo_grupos_del_curso()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE grupos
  SET cupo_max = NEW.grupo_cupo_max
  WHERE curso_id = NEW.id
    AND cupo_max IS DISTINCT FROM NEW.grupo_cupo_max;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sincronizar_cupo_grupos_del_curso ON cursos;
CREATE TRIGGER trg_sincronizar_cupo_grupos_del_curso
AFTER UPDATE OF grupo_cupo_max ON cursos
FOR EACH ROW
WHEN (OLD.grupo_cupo_max IS DISTINCT FROM NEW.grupo_cupo_max)
EXECUTE FUNCTION sincronizar_cupo_grupos_del_curso();
