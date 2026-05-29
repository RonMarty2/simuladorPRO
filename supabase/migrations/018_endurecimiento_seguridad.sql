-- ============================================================================
-- FASE 18 — ENDURECIMIENTO DE SEGURIDAD (pre-lanzamiento)
--
-- Cierra 3 huecos de RLS que permitirían a un estudiante malicioso (usando
-- la anon key directamente, sin pasar por la app) hacer trampa o escalar
-- privilegios:
--
--   1. 🔴 ESCALADA DE PRIVILEGIOS: el estudiante podía hacer
--         UPDATE perfiles SET rol='docente', es_admin=true WHERE id=auth.uid()
--      porque la política perfiles_self_update no restringía qué columnas se
--      pueden cambiar (el comentario decía "excepto rol" pero no lo aplicaba).
--
--   2. 🔴 FALSIFICACIÓN DE NOTAS (vía INSERT): el estudiante podía insertar una
--      entrega con estado='aprobada' y nota=100, inflando su promedio real
--      (la vista promedio_estudiante cuenta entregas.nota).
--
--   3. 🟡 FALSIFICACIÓN DEL PODIO (vía INSERT de grupo): el estudiante podía
--      crear un grupo con nota=100 y aparecer como campeón en el podio.
--
-- Las rutas legítimas de la app NO se rompen: entregarProyecto() ya inserta
-- estado='pendiente' sin nota, y crearGrupoEstudiante() no setea nota.
-- ============================================================================


-- ─── 1. Bloquear escalada de privilegios en perfiles ────────────────────────
-- Estrategia: un trigger BEFORE UPDATE que, si el que actualiza NO es admin,
-- fuerza rol y es_admin a sus valores anteriores. A prueba de balas: no
-- importa qué mande el cliente, estos dos campos no cambian salvo que un
-- admin lo haga (desde el panel admin). El resto de campos (nombre, apellido,
-- email, universidad) se siguen pudiendo editar normalmente.

CREATE OR REPLACE FUNCTION public.proteger_campos_sensibles_perfil()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.es_admin_actual() THEN
    NEW.rol := OLD.rol;
    NEW.es_admin := OLD.es_admin;
  END IF;
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.proteger_campos_sensibles_perfil() IS
  'Impide que un usuario no-admin cambie su propio rol o es_admin. Se ejecuta BEFORE UPDATE en perfiles.';

DROP TRIGGER IF EXISTS trg_proteger_perfil ON perfiles;
CREATE TRIGGER trg_proteger_perfil
  BEFORE UPDATE ON perfiles
  FOR EACH ROW
  EXECUTE FUNCTION public.proteger_campos_sensibles_perfil();


-- ─── 2. Impedir que el estudiante inserte entregas YA calificadas ───────────
-- El estudiante solo puede crear entregas 'pendiente' y sin nota. El docente
-- (o el admin) asigna nota/estado vía UPDATE (políticas existentes).

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
  );


-- ─── 3. Impedir que el estudiante cree un grupo YA calificado ───────────────
-- Mantiene la validación original (inscrito + grupo habilitado) y agrega que
-- el grupo nazca sin nota. La nota grupal la pone el docente vía UPDATE.

DROP POLICY IF EXISTS "grupos_estudiante_crea" ON grupos;
CREATE POLICY "grupos_estudiante_crea"
  ON grupos FOR INSERT
  TO authenticated
  WITH CHECK (
    nota IS NULL
    AND comentario_docente IS NULL
    AND revisado_en IS NULL
    AND EXISTS (
      SELECT 1 FROM cursos c
      JOIN inscripciones i ON i.curso_id = c.id
      WHERE c.id = grupos.curso_id
        AND i.estudiante_id = auth.uid()
        AND c.grupo_habilitado = TRUE
    )
  );
