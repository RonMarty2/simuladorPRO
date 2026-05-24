-- ============================================================================
-- ADMIN del sistema + soporte para login con Google OAuth
--
-- 1. Agrega columna `es_admin` a `perfiles` (flag separado del rol; un admin
--    también puede ser docente o estudiante simultáneamente).
-- 2. Función helper SECURITY DEFINER `es_admin_actual()` para usar en RLS
--    sin recursión.
-- 3. Políticas RLS que permiten al admin ver y modificar TODO.
-- 4. Mejora el trigger `crear_perfil_al_registrarse` para que también
--    funcione cuando el usuario se registra con Google OAuth (que envía
--    metadata distinta: name, given_name, family_name).
-- ============================================================================

-- ─── 1. Columna es_admin ────────────────────────────────────────────────────
ALTER TABLE perfiles
  ADD COLUMN es_admin BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX idx_perfiles_es_admin ON perfiles(es_admin) WHERE es_admin = TRUE;

COMMENT ON COLUMN perfiles.es_admin IS
  'Flag de super-usuario. Independiente del rol. Un admin puede ver y modificar todo el sistema.';

-- ─── 2. Función helper ──────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.es_admin_actual()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT COALESCE(
    (SELECT es_admin FROM perfiles WHERE id = auth.uid()),
    FALSE
  );
$$;

COMMENT ON FUNCTION public.es_admin_actual() IS
  'Devuelve TRUE si el usuario autenticado tiene es_admin=TRUE. Pensada para usarse en políticas RLS sin recursión.';

-- ─── 3. Políticas RLS para admin ────────────────────────────────────────────
-- Estas políticas se SUMAN a las existentes (Postgres aplica OR entre
-- políticas SELECT). No quitan ningún permiso a docente/estudiante normal.

-- Admin ve todos los perfiles
CREATE POLICY "perfiles_admin_ve_todo"
  ON perfiles FOR SELECT
  TO authenticated
  USING (public.es_admin_actual());

-- Admin puede actualizar cualquier perfil (cambiar rol, marcar admin, etc.)
CREATE POLICY "perfiles_admin_actualiza"
  ON perfiles FOR UPDATE
  TO authenticated
  USING (public.es_admin_actual())
  WITH CHECK (public.es_admin_actual());

-- Admin ve todos los cursos
CREATE POLICY "cursos_admin_ve_todo"
  ON cursos FOR SELECT
  TO authenticated
  USING (public.es_admin_actual());

-- Admin puede actualizar/borrar cursos (ej. limpiar cursos zombie)
CREATE POLICY "cursos_admin_modifica"
  ON cursos FOR UPDATE
  TO authenticated
  USING (public.es_admin_actual())
  WITH CHECK (public.es_admin_actual());

CREATE POLICY "cursos_admin_borra"
  ON cursos FOR DELETE
  TO authenticated
  USING (public.es_admin_actual());

-- Admin ve todos los proyectos
CREATE POLICY "proyectos_admin_ve_todo"
  ON proyectos FOR SELECT
  TO authenticated
  USING (public.es_admin_actual());

-- Admin ve todas las entregas y puede revisarlas
CREATE POLICY "entregas_admin_ve_todo"
  ON entregas FOR SELECT
  TO authenticated
  USING (public.es_admin_actual());

CREATE POLICY "entregas_admin_revisa"
  ON entregas FOR UPDATE
  TO authenticated
  USING (public.es_admin_actual())
  WITH CHECK (public.es_admin_actual());

-- Admin ve todas las inscripciones
CREATE POLICY "inscripciones_admin_ve_todo"
  ON inscripciones FOR SELECT
  TO authenticated
  USING (public.es_admin_actual());

CREATE POLICY "inscripciones_admin_borra"
  ON inscripciones FOR DELETE
  TO authenticated
  USING (public.es_admin_actual());

-- ─── 4. Trigger mejorado para soportar Google OAuth ─────────────────────────
-- Google envía metadata con campos diferentes al registro normal:
--   - name (nombre completo)
--   - given_name (nombre de pila)
--   - family_name (apellido)
--   - picture (URL avatar)
-- El trigger ahora prueba los campos en orden de preferencia.
CREATE OR REPLACE FUNCTION public.crear_perfil_al_registrarse()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_nombre TEXT;
  v_apellido TEXT;
  v_rol rol_tipo;
BEGIN
  -- Nombre: registro normal → Google given_name → primera palabra de name → email → fallback
  v_nombre := COALESCE(
    NULLIF(NEW.raw_user_meta_data->>'nombre', ''),
    NULLIF(NEW.raw_user_meta_data->>'given_name', ''),
    NULLIF(SPLIT_PART(NEW.raw_user_meta_data->>'name', ' ', 1), ''),
    NULLIF(SPLIT_PART(NEW.email, '@', 1), ''),
    'Sin nombre'
  );

  -- Apellido: registro normal → Google family_name → resto del 'name' → vacío
  v_apellido := COALESCE(
    NULLIF(NEW.raw_user_meta_data->>'apellido', ''),
    NULLIF(NEW.raw_user_meta_data->>'family_name', ''),
    NULLIF(
      TRIM(SUBSTRING(NEW.raw_user_meta_data->>'name' FROM POSITION(' ' IN NEW.raw_user_meta_data->>'name'))),
      ''
    ),
    ''
  );

  -- Rol: lo que mandó el registro o 'estudiante' por defecto
  v_rol := COALESCE(
    NULLIF(NEW.raw_user_meta_data->>'rol', ''),
    'estudiante'
  )::rol_tipo;

  INSERT INTO public.perfiles (id, email, nombre, apellido, rol, universidad)
  VALUES (
    NEW.id,
    NEW.email,
    v_nombre,
    v_apellido,
    v_rol,
    NEW.raw_user_meta_data->>'universidad'
  );
  RETURN NEW;
END;
$$;
