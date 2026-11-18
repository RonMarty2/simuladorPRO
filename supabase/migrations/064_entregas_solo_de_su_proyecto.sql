-- ============================================================================
-- Migración 064 - Entregas solo sobre un proyecto propio o de su grupo
-- ============================================================================
-- Antes (018): el estudiante podía insertar una entrega con cualquier
-- proyecto_id. Ahora el proyecto debe ser suyo o del grupo del que es miembro.
-- Mantiene las demás condiciones de 018 (pendiente, sin nota, sin comentario).
-- No cambia datos existentes. Reversible: volver a crear la política de 018.
-- ============================================================================

DROP POLICY IF EXISTS "entregas_estudiante_inserta_propio" ON entregas;
CREATE POLICY "entregas_estudiante_inserta_propio"
  ON entregas FOR INSERT
  TO authenticated
  WITH CHECK (
    estudiante_id = auth.uid()
    AND estado = 'pendiente'
    AND nota IS NULL
    AND comentario_docente IS NULL
    AND revisado_en IS NULL
    AND EXISTS (
      SELECT 1 FROM proyectos p
      WHERE p.id = entregas.proyecto_id
        AND (
          p.estudiante_id = auth.uid()
          OR (
            p.grupo_id IS NOT NULL
            AND EXISTS (
              SELECT 1 FROM grupo_miembros gm
              WHERE gm.grupo_id = p.grupo_id AND gm.estudiante_id = auth.uid()
            )
          )
        )
    )
  );
