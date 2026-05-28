-- ============================================================================
-- FASE 17 — Las entregas GRUPALES cuentan para todos los miembros del grupo
--
-- Cuando un alumno del grupo entrega el proyecto compartido, esa entrega
-- (calificada por el docente) tiene que aportar al promedio individual de
-- TODOS los integrantes del grupo (no solo del que clickeó "Entregar").
--
-- Para lograrlo sin duplicar filas, se reescribe la vista promedio_estudiante:
--   - Entregas de proyectos individuales (sin grupo_id): cuentan SOLO para
--     el estudiante que entregó.
--   - Entregas de proyectos grupales (con grupo_id): cuentan para CADA miembro
--     del grupo en el momento de la consulta.
-- ============================================================================

DROP VIEW IF EXISTS promedio_estudiante;

CREATE VIEW promedio_estudiante AS
WITH entregas_por_estudiante AS (
  -- Entregas individuales: solo cuentan para el alumno que entregó
  SELECT
    e.estudiante_id,
    e.curso_id,
    e.id AS entrega_id,
    e.nota,
    e.estado,
    e.entregado_en
  FROM entregas e
  JOIN proyectos p ON p.id = e.proyecto_id
  WHERE p.grupo_id IS NULL

  UNION

  -- Entregas grupales: cuentan para cada miembro del grupo
  SELECT
    gm.estudiante_id,
    e.curso_id,
    e.id AS entrega_id,
    e.nota,
    e.estado,
    e.entregado_en
  FROM entregas e
  JOIN proyectos p ON p.id = e.proyecto_id
  JOIN grupo_miembros gm ON gm.grupo_id = p.grupo_id
  WHERE p.grupo_id IS NOT NULL
)
SELECT
  estudiante_id,
  curso_id,
  COUNT(*) FILTER (WHERE nota IS NOT NULL) AS entregas_revisadas,
  COUNT(*) FILTER (WHERE estado = 'pendiente') AS entregas_pendientes,
  ROUND(AVG(nota) FILTER (WHERE nota IS NOT NULL), 2) AS promedio_nota,
  MAX(nota) FILTER (WHERE nota IS NOT NULL) AS mejor_nota,
  MIN(nota) FILTER (WHERE nota IS NOT NULL) AS peor_nota,
  MAX(entregado_en) AS ultima_entrega_en
FROM entregas_por_estudiante
GROUP BY estudiante_id, curso_id;

COMMENT ON VIEW promedio_estudiante IS
  'Promedio simple de notas por estudiante por curso. Una entrega grupal aporta su nota al promedio de TODOS los miembros del grupo.';
