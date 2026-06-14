-- ============================================================================
-- Migración 025 · Actividad por usuario en proyectos (audit de grupales)
-- ============================================================================
--
-- Para grupos: necesitamos saber QUIÉN del grupo trabajó en el proyecto
-- compartido. Hoy el JSONB se reescribe en cada autoguardado y no hay rastro
-- de autor. Con esta tabla, cada usuario deja UN registro por día por paso
-- (deduplicado) cuando edita, y un registro extra cuando entrega.
--
-- DESCRIPCIÓN:
--   tipo='edito'    → upsert dedup por (proyecto, usuario, paso, día)
--   tipo='entrego'  → upsert dedup por (proyecto, usuario, paso, día)
--   tipo='simulo'   → reservado para más adelante
--
-- COSTO: una fila por miembro por día por paso. Para 6 alumnos x 9 pasos x
-- 30 días de curso = 1620 filas por grupo. Insignificante.
-- ============================================================================

CREATE TABLE IF NOT EXISTS proyecto_actividad (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proyecto_id UUID NOT NULL REFERENCES proyectos(id) ON DELETE CASCADE,
  usuario_id  UUID NOT NULL REFERENCES perfiles(id) ON DELETE CASCADE,
  tipo        TEXT NOT NULL CHECK (tipo IN ('edito', 'entrego', 'simulo')),
  paso        SMALLINT NOT NULL DEFAULT 0,  -- 0 = sin paso específico
  momento     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  dia         DATE NOT NULL DEFAULT CURRENT_DATE,
  UNIQUE (proyecto_id, usuario_id, tipo, paso, dia)
);

CREATE INDEX IF NOT EXISTS idx_proy_actividad_proyecto_momento
  ON proyecto_actividad (proyecto_id, momento DESC);

CREATE INDEX IF NOT EXISTS idx_proy_actividad_usuario
  ON proyecto_actividad (usuario_id);

-- RLS
ALTER TABLE proyecto_actividad ENABLE ROW LEVEL SECURITY;

-- LECTURA:
--  • el dueño propio (mi actividad)
--  • cualquier miembro del grupo del proyecto (ven a sus compañeros)
--  • el docente del curso del proyecto
--  • admin
DROP POLICY IF EXISTS "proy_act_lee" ON proyecto_actividad;
CREATE POLICY "proy_act_lee"
  ON proyecto_actividad FOR SELECT
  TO authenticated
  USING (
    usuario_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM proyectos p
      JOIN grupo_miembros gm ON gm.grupo_id = p.grupo_id
      WHERE p.id = proyecto_actividad.proyecto_id
        AND gm.estudiante_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM proyectos p
      JOIN cursos c ON c.id = p.curso_id
      WHERE p.id = proyecto_actividad.proyecto_id
        AND c.docente_id = auth.uid()
    )
    OR es_admin_actual()
  );

-- INSERT: cada usuario registra SU propia actividad sobre proyectos
-- de los que es dueño o donde es miembro del grupo.
DROP POLICY IF EXISTS "proy_act_inserta" ON proyecto_actividad;
CREATE POLICY "proy_act_inserta"
  ON proyecto_actividad FOR INSERT
  TO authenticated
  WITH CHECK (
    usuario_id = auth.uid()
    AND (
      EXISTS (
        SELECT 1 FROM proyectos p
        WHERE p.id = proyecto_actividad.proyecto_id
          AND p.estudiante_id = auth.uid()
      )
      OR EXISTS (
        SELECT 1 FROM proyectos p
        JOIN grupo_miembros gm ON gm.grupo_id = p.grupo_id
        WHERE p.id = proyecto_actividad.proyecto_id
          AND gm.estudiante_id = auth.uid()
      )
    )
  );

-- UPDATE: necesario para el upsert (bumps momento al editar de nuevo el mismo día).
DROP POLICY IF EXISTS "proy_act_actualiza" ON proyecto_actividad;
CREATE POLICY "proy_act_actualiza"
  ON proyecto_actividad FOR UPDATE
  TO authenticated
  USING (usuario_id = auth.uid())
  WITH CHECK (usuario_id = auth.uid());
