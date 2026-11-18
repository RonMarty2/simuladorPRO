-- ============================================================================
-- Migración 066 · Miembros de grupo pueden crear y jugar simulaciones grupales
-- ============================================================================
--
-- ANTES: `public.es_mi_proyecto` y `public.es_mi_simulacion` (migración 007)
--        solo verificaban `p.estudiante_id = auth.uid()`. En un
--        `proyecto_grupal`, cualquier integrante del grupo distinto al creador
--        recibía `new row violates row-level security policy for table
--        "simulaciones"` al intentar iniciar o avanzar la simulación.
--
-- AHORA: ambos helpers reconocen también a cualquier miembro registrado en
--        `grupo_miembros` para proyectos de tipo `proyecto_grupal`, manteniendo
--        intacto el aislamiento de proyectos individuales.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.es_mi_proyecto(proyecto_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM proyectos p
    WHERE p.id = proyecto_uuid
      AND (
        p.estudiante_id = auth.uid()
        OR (
          p.tipo = 'proyecto_grupal'
          AND p.grupo_id IS NOT NULL
          AND EXISTS (
            SELECT 1
            FROM grupo_miembros gm
            WHERE gm.grupo_id = p.grupo_id
              AND gm.estudiante_id = auth.uid()
          )
        )
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.es_mi_simulacion(sim_uuid uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM simulaciones s
    JOIN proyectos p ON p.id = s.proyecto_id
    WHERE s.id = sim_uuid
      AND (
        p.estudiante_id = auth.uid()
        OR (
          p.tipo = 'proyecto_grupal'
          AND p.grupo_id IS NOT NULL
          AND EXISTS (
            SELECT 1
            FROM grupo_miembros gm
            WHERE gm.grupo_id = p.grupo_id
              AND gm.estudiante_id = auth.uid()
          )
        )
      )
  );
$$;
