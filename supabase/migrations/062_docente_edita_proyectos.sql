-- Permite al docente del curso (y al admin) actualizar proyectos de sus
-- estudiantes cuando usa el Modo Revisión Docente ("Editar al estudiante").
-- Las entregas históricas en `entregas.snapshot_datos` permanecen intactas.

DROP POLICY IF EXISTS "proyectos_docente_actualiza_curso" ON proyectos;

CREATE POLICY "proyectos_docente_actualiza_curso"
  ON proyectos FOR UPDATE
  TO authenticated
  USING (public.es_docente_del_curso(curso_id) OR public.es_admin_actual())
  WITH CHECK (public.es_docente_del_curso(curso_id) OR public.es_admin_actual());
