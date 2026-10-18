-- ============================================================================
-- Migracion 033 - El docente puede lanzar un evento a las simulaciones de su curso
-- ============================================================================
--
-- Problema: el lanzador (migracion 022) hace UPDATE simulaciones SET
-- evento_forzado_id, pero el docente solo tenia permiso de LECTURA sobre
-- simulaciones (008). El UPDATE no afectaba ninguna fila y el aviso decia
-- "llego a 0 alumnos".
--
-- Solucion: funcion SECURITY DEFINER que SOLO escribe evento_forzado_id, y solo
-- en simulaciones activas de proyectos de cursos del docente que la llama.
-- No se abre una politica UPDATE general (el docente no puede tocar el resto
-- de columnas de la simulacion del alumno).
-- ============================================================================

CREATE OR REPLACE FUNCTION public.lanzar_evento_a_simulaciones(
  p_proyecto_ids uuid[],
  p_evento_id text
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  afectadas integer;
BEGIN
  UPDATE simulaciones s
  SET evento_forzado_id = p_evento_id
  WHERE s.proyecto_id = ANY (p_proyecto_ids)
    AND s.estado = 'activa'
    AND public.es_simulacion_de_mi_curso(s.proyecto_id);

  GET DIAGNOSTICS afectadas = ROW_COUNT;
  RETURN afectadas;
END;
$$;

REVOKE ALL ON FUNCTION public.lanzar_evento_a_simulaciones(uuid[], text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.lanzar_evento_a_simulaciones(uuid[], text) TO authenticated;
