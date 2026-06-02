-- ============================================================================
-- FASE 22 — LANZADOR DE SITUACIONES EN VIVO (docente dispara eventos al curso)
--
-- El modo 'docente_dispara' estaba declarado pero sin implementación. Esta
-- migración agrega la infraestructura para que el docente pueda elegir un
-- evento del catálogo y dispararlo a TODOS los alumnos con simulación activa
-- en un curso, en tiempo real.
--
-- Cómo funciona:
--  1. El docente clickea "Lanzar" en un evento.
--  2. Se inserta un registro en eventos_disparados (auditoría).
--  3. Se setea evento_forzado_id en TODAS las simulaciones activas de ese
--     curso.
--  4. El alumno, al refrescar/cargar, ve ese evento en lugar del sorteo
--     normal del motor.
--  5. Cuando el alumno decide y avanza, evento_forzado_id se limpia.
-- ============================================================================

-- ─── 1. Auditoría de disparos ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS eventos_disparados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  curso_id UUID NOT NULL REFERENCES cursos(id) ON DELETE CASCADE,
  evento_id TEXT NOT NULL,
  disparado_por UUID NOT NULL REFERENCES perfiles(id) ON DELETE CASCADE,
  disparado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  simulaciones_afectadas INT NOT NULL DEFAULT 0,
  nota TEXT NULL
);

CREATE INDEX IF NOT EXISTS idx_eventos_disparados_curso_fecha
  ON eventos_disparados (curso_id, disparado_en DESC);

COMMENT ON TABLE eventos_disparados IS
  'Histórico de eventos que un docente disparó a todo su curso (modo docente_dispara). Es solo auditoría — la lógica real vive en simulaciones.evento_forzado_id.';

-- ─── 2. Campo de evento forzado en simulaciones ──────────────────────────────
ALTER TABLE simulaciones
  ADD COLUMN IF NOT EXISTS evento_forzado_id TEXT NULL;

COMMENT ON COLUMN simulaciones.evento_forzado_id IS
  'Si está seteado, el motor del alumno usa ESE evento en el próximo turno en lugar del sorteo aleatorio. Lo limpia al avanzar el turno.';

-- ─── 3. RLS — eventos_disparados ────────────────────────────────────────────
ALTER TABLE eventos_disparados ENABLE ROW LEVEL SECURITY;

-- El docente del curso puede insertar disparos.
CREATE POLICY "eventos_disparados_docente_inserta"
  ON eventos_disparados FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM cursos
      WHERE cursos.id = eventos_disparados.curso_id
        AND cursos.docente_id = auth.uid()
    )
  );

-- El docente del curso puede leer su histórico.
CREATE POLICY "eventos_disparados_docente_lee"
  ON eventos_disparados FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cursos
      WHERE cursos.id = eventos_disparados.curso_id
        AND cursos.docente_id = auth.uid()
    )
  );

-- Los alumnos inscritos pueden leer el histórico (transparencia).
CREATE POLICY "eventos_disparados_alumno_lee"
  ON eventos_disparados FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM inscripciones
      WHERE inscripciones.curso_id = eventos_disparados.curso_id
        AND inscripciones.estudiante_id = auth.uid()
    )
  );

-- Admin puede ver y limpiar todo.
CREATE POLICY "eventos_disparados_admin_todo"
  ON eventos_disparados FOR ALL
  TO authenticated
  USING (public.es_admin_actual())
  WITH CHECK (public.es_admin_actual());
