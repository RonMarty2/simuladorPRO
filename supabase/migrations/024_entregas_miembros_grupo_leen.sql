-- ============================================================================
-- Migración 024 · Miembros del grupo leen las entregas del proyecto compartido
-- ============================================================================
--
-- ANTES: la policy "entregas_estudiante_lee_propio" exige `estudiante_id =
--        auth.uid()`. En un proyecto grupal solo UN miembro entrega (el que
--        aprieta el botón), y los demás miembros NO podían ver esa entrega
--        en su listado de "Mis entregas".
--
-- AHORA: agregamos una policy adicional que permite a CUALQUIER miembro del
--        grupo leer las entregas del proyecto grupal de ese grupo. La policy
--        original sigue intacta (las entregas individuales siguen privadas);
--        Postgres OR-ea las policies del mismo comando, así que el efecto
--        es aditivo y nunca abre más de la cuenta.
--
-- IMPACTO: solo SELECT. INSERT/UPDATE/DELETE quedan como estaban.
-- ============================================================================

DROP POLICY IF EXISTS "entregas_miembro_grupo_lee" ON entregas;
CREATE POLICY "entregas_miembro_grupo_lee"
  ON entregas FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM proyectos p
      JOIN grupo_miembros gm ON gm.grupo_id = p.grupo_id
      WHERE p.id = entregas.proyecto_id
        AND p.tipo = 'proyecto_grupal'
        AND gm.estudiante_id = auth.uid()
    )
  );
