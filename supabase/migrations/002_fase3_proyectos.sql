-- ============================================================================
-- FASE 3 — Tabla de proyectos
-- El proyecto se guarda completo como JSONB; solo los metadatos viven como
-- columnas SQL para indexar y filtrar.
-- ============================================================================

CREATE TABLE proyectos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estudiante_id UUID NOT NULL REFERENCES perfiles(id) ON DELETE CASCADE,
  curso_id UUID NOT NULL REFERENCES cursos(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  datos JSONB NOT NULL,
  estado TEXT NOT NULL DEFAULT 'construyendo'
    CHECK (estado IN ('construyendo', 'completo', 'simulando', 'finalizado')),
  creado_en TIMESTAMPTZ DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_proyectos_estudiante ON proyectos(estudiante_id);
CREATE INDEX idx_proyectos_curso ON proyectos(curso_id);
CREATE INDEX idx_proyectos_estado ON proyectos(estado);

-- Trigger para auto-actualizar actualizado_en en cada UPDATE
CREATE OR REPLACE FUNCTION public.tocar_actualizado_en()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.actualizado_en = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_proyectos_actualizado_en
  BEFORE UPDATE ON proyectos
  FOR EACH ROW EXECUTE FUNCTION public.tocar_actualizado_en();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE proyectos ENABLE ROW LEVEL SECURITY;

-- Estudiante: CRUD completo sobre sus propios proyectos
CREATE POLICY "proyectos_estudiante_propio"
  ON proyectos FOR ALL
  TO authenticated
  USING (estudiante_id = auth.uid())
  WITH CHECK (estudiante_id = auth.uid());

-- Docente: lectura de proyectos de estudiantes inscritos en sus cursos
CREATE POLICY "proyectos_docente_lee_curso"
  ON proyectos FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cursos
      WHERE cursos.id = proyectos.curso_id
        AND cursos.docente_id = auth.uid()
    )
  );
