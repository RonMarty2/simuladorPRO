-- ============================================================================
-- FIX: el docente debe poder leer las simulaciones de los proyectos de sus
-- estudiantes inscritos (para mostrar el ranking en vivo).
-- ============================================================================

CREATE OR REPLACE FUNCTION public.es_simulacion_de_mi_curso(sim_proyecto_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM proyectos p
    JOIN cursos c ON c.id = p.curso_id
    WHERE p.id = sim_proyecto_id
      AND c.docente_id = auth.uid()
  );
$$;

CREATE POLICY "simulaciones_docente_lee"
  ON simulaciones FOR SELECT
  TO authenticated
  USING (public.es_simulacion_de_mi_curso(proyecto_id));
