-- ============================================================================
-- FASE 13 — Proyectos GRUPALES + ponderación de la nota final
--
-- Resumen del modelo:
--   * El docente crea GRUPOS dentro de un curso, cada uno con un cupo máximo y
--     un PROYECTO COMPARTIDO (predefinido por el docente; los alumnos lo llenan).
--   * Los estudiantes inscritos se UNEN a un grupo (hasta llenar el cupo) y
--     editan todos el mismo proyecto compartido (último guardado gana).
--   * El docente evalúa el proyecto grupal y le pone UNA nota a todo el grupo.
--   * La NOTA FINAL del estudiante = peso_individual × promedio_individual
--                                   + peso_grupal    × nota_grupal
--     Los pesos los define el docente por curso.
-- ============================================================================

-- ─── 1. Ponderación a nivel curso ──────────────────────────────────────────
-- Pesos en decimal (0..1). Por defecto 50/50. La nota final pondera el
-- promedio de entregas individuales contra la nota del proyecto grupal.
ALTER TABLE cursos
  ADD COLUMN peso_individual NUMERIC NOT NULL DEFAULT 0.5
    CHECK (peso_individual >= 0 AND peso_individual <= 1),
  ADD COLUMN peso_grupal NUMERIC NOT NULL DEFAULT 0.5
    CHECK (peso_grupal >= 0 AND peso_grupal <= 1);

COMMENT ON COLUMN cursos.peso_individual IS
  'Peso (0..1) del promedio de entregas individuales en la nota final del estudiante.';
COMMENT ON COLUMN cursos.peso_grupal IS
  'Peso (0..1) de la nota del proyecto grupal en la nota final del estudiante.';

-- ─── 2. Tabla `grupos` ─────────────────────────────────────────────────────
CREATE TABLE grupos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  curso_id UUID NOT NULL REFERENCES cursos(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  cupo_max INT NOT NULL DEFAULT 4 CHECK (cupo_max >= 1 AND cupo_max <= 50),
  -- Proyecto compartido del grupo (lo crea el docente, lo editan los miembros).
  proyecto_id UUID NULL REFERENCES proyectos(id) ON DELETE SET NULL,
  -- Evaluación del grupo (la pone el docente; la ven todos los miembros).
  nota INT NULL CHECK (nota IS NULL OR (nota BETWEEN 0 AND 100)),
  comentario_docente TEXT NULL,
  revisado_en TIMESTAMPTZ NULL,
  creado_en TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_grupos_curso ON grupos(curso_id);
CREATE INDEX idx_grupos_proyecto ON grupos(proyecto_id);

COMMENT ON TABLE grupos IS
  'Grupo de trabajo dentro de un curso. Tiene un proyecto compartido y una nota grupal.';

-- ─── 3. Tabla `grupo_miembros` ─────────────────────────────────────────────
CREATE TABLE grupo_miembros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grupo_id UUID NOT NULL REFERENCES grupos(id) ON DELETE CASCADE,
  estudiante_id UUID NOT NULL REFERENCES perfiles(id) ON DELETE CASCADE,
  unido_en TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(grupo_id, estudiante_id)
);

CREATE INDEX idx_grupo_miembros_grupo ON grupo_miembros(grupo_id);
CREATE INDEX idx_grupo_miembros_estudiante ON grupo_miembros(estudiante_id);

COMMENT ON TABLE grupo_miembros IS
  'Integrantes de cada grupo. El cupo máximo se valida en la app antes de insertar.';

-- ─── 4. Proyecto compartido: nuevo tipo + vínculo al grupo ─────────────────
ALTER TABLE proyectos
  ADD COLUMN grupo_id UUID NULL REFERENCES grupos(id) ON DELETE CASCADE;

CREATE INDEX idx_proyectos_grupo ON proyectos(grupo_id);

-- Ampliar el CHECK de `tipo` para incluir 'proyecto_grupal'.
ALTER TABLE proyectos DROP CONSTRAINT IF EXISTS proyectos_tipo_check;
ALTER TABLE proyectos
  ADD CONSTRAINT proyectos_tipo_check
  CHECK (tipo IN ('libre', 'caso_curso', 'entrega_estudiante', 'proyecto_grupal'));

COMMENT ON COLUMN proyectos.grupo_id IS
  'Si está seteado, este proyecto es el proyecto COMPARTIDO de ese grupo (tipo=proyecto_grupal).';

-- ─── 5. RLS: grupos ────────────────────────────────────────────────────────
ALTER TABLE grupos ENABLE ROW LEVEL SECURITY;

-- Docente del curso: control total de sus grupos.
CREATE POLICY "grupos_docente_curso"
  ON grupos FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM cursos c WHERE c.id = grupos.curso_id AND c.docente_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM cursos c WHERE c.id = grupos.curso_id AND c.docente_id = auth.uid())
  );

-- Estudiante inscrito en el curso: puede VER los grupos (para unirse / ver nota).
CREATE POLICY "grupos_estudiante_inscrito_lee"
  ON grupos FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM inscripciones i
      WHERE i.curso_id = grupos.curso_id AND i.estudiante_id = auth.uid()
    )
  );

-- ─── 6. RLS: grupo_miembros ────────────────────────────────────────────────
-- (Ninguna política consulta grupo_miembros para evitar recursión.)
ALTER TABLE grupo_miembros ENABLE ROW LEVEL SECURITY;

-- Estudiante se une (solo a sí mismo, y solo a grupos de cursos donde está inscrito).
CREATE POLICY "grupo_miembros_estudiante_se_une"
  ON grupo_miembros FOR INSERT
  TO authenticated
  WITH CHECK (
    estudiante_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM grupos g
      JOIN inscripciones i ON i.curso_id = g.curso_id
      WHERE g.id = grupo_miembros.grupo_id AND i.estudiante_id = auth.uid()
    )
  );

-- Estudiante se sale de su propio grupo.
CREATE POLICY "grupo_miembros_estudiante_se_sale"
  ON grupo_miembros FOR DELETE
  TO authenticated
  USING (estudiante_id = auth.uid());

-- Estudiante ve los integrantes de grupos de cursos en los que está inscrito.
CREATE POLICY "grupo_miembros_estudiante_lee"
  ON grupo_miembros FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM grupos g
      JOIN inscripciones i ON i.curso_id = g.curso_id
      WHERE g.id = grupo_miembros.grupo_id AND i.estudiante_id = auth.uid()
    )
  );

-- Docente del curso ve los integrantes.
CREATE POLICY "grupo_miembros_docente_lee"
  ON grupo_miembros FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM grupos g
      JOIN cursos c ON c.id = g.curso_id
      WHERE g.id = grupo_miembros.grupo_id AND c.docente_id = auth.uid()
    )
  );

-- ─── 7. RLS: proyectos — acceso de los miembros al proyecto compartido ─────
-- El proyecto grupal lo INSERTA el docente (estudiante_id = docente = auth.uid()),
-- cubierto por la política existente "proyectos_estudiante_propio". Acá damos a
-- los MIEMBROS permiso de leer y editar el proyecto compartido de su grupo.
CREATE POLICY "proyectos_miembro_grupo_lee"
  ON proyectos FOR SELECT
  TO authenticated
  USING (
    grupo_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM grupo_miembros gm
      WHERE gm.grupo_id = proyectos.grupo_id AND gm.estudiante_id = auth.uid()
    )
  );

CREATE POLICY "proyectos_miembro_grupo_edita"
  ON proyectos FOR UPDATE
  TO authenticated
  USING (
    grupo_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM grupo_miembros gm
      WHERE gm.grupo_id = proyectos.grupo_id AND gm.estudiante_id = auth.uid()
    )
  )
  WITH CHECK (
    grupo_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM grupo_miembros gm
      WHERE gm.grupo_id = proyectos.grupo_id AND gm.estudiante_id = auth.uid()
    )
  );

-- ─── 8. RLS: perfiles — ver a los COMPAÑEROS de mi grupo ────────────────────
-- Hoy un estudiante solo lee su propio perfil. Para mostrar los integrantes del
-- grupo necesita leer el perfil de sus compañeros (no de todo el curso).
CREATE POLICY "perfiles_companeros_de_grupo"
  ON perfiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM grupo_miembros mio
      JOIN grupo_miembros otro ON otro.grupo_id = mio.grupo_id
      WHERE mio.estudiante_id = auth.uid() AND otro.estudiante_id = perfiles.id
    )
  );
