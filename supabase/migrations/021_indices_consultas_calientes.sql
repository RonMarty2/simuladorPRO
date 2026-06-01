-- ============================================================================
-- FASE 21 — Índices compuestos para las consultas calientes
--
-- Las pantallas "Mis entregas", el Podio y la revisión masiva filtran entregas
-- por (estudiante_id, curso_id) y ordenan por entregado_en. Hoy solo hay
-- índices de columna única, así que Postgres escanea uno y filtra el resto.
-- Estos índices compuestos hacen esas consultas directas.
--
-- IF NOT EXISTS: seguro de re-ejecutar; no rompe si ya existen.
-- ============================================================================

-- Entregas por (estudiante, curso) ordenadas por fecha — usado en Mis entregas,
-- podio (racha) y promedios.
CREATE INDEX IF NOT EXISTS idx_entregas_est_curso_fecha
  ON entregas (estudiante_id, curso_id, entregado_en DESC);

-- Entregas por (proyecto, paso) — usado al calcular el próximo numero_intento
-- en cada entrega por etapa.
CREATE INDEX IF NOT EXISTS idx_entregas_proyecto_paso
  ON entregas (proyecto_id, paso_entregado);

-- Miembros por grupo — usado en el podio grupal y al listar integrantes.
CREATE INDEX IF NOT EXISTS idx_grupo_miembros_grupo
  ON grupo_miembros (grupo_id, estudiante_id);
