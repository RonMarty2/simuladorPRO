-- 063_registro_siempre_estudiante.sql
-- Cierra una escalada de privilegios: el trigger de registro tomaba el rol desde
-- raw_user_meta_data, que el cliente controla. Cualquiera podia registrarse llamando
-- directo a la API de Supabase con {rol: 'docente'} y quedar como docente.
--
-- Desde ahora TODO registro nace como 'estudiante'. Los docentes se promueven desde el
-- panel /admin (UPDATE de perfiles.rol, que ya esta protegido por la 018).
--
-- Alcance: solo afecta registros NUEVOS. Los perfiles existentes no se tocan.
-- Se redefinen las DOS funciones porque hoy hay dos definiciones en las migraciones
-- (001: handle_nuevo_usuario; 012: crear_perfil_al_registrarse) y no se sabe con certeza
-- cual esta conectada al trigger on_auth_user_created en la base real.
-- Es idempotente: se puede ejecutar mas de una vez.

CREATE OR REPLACE FUNCTION public.handle_nuevo_usuario()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.perfiles (id, nombre, apellido, rol, email, universidad)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'nombre', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'apellido', ''),
    'estudiante',
    NEW.email,
    NEW.raw_user_meta_data ->> 'universidad'
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.crear_perfil_al_registrarse()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_nombre TEXT;
  v_apellido TEXT;
BEGIN
  v_nombre := COALESCE(
    NULLIF(NEW.raw_user_meta_data->>'nombre', ''),
    NULLIF(NEW.raw_user_meta_data->>'given_name', ''),
    NULLIF(SPLIT_PART(NEW.raw_user_meta_data->>'name', ' ', 1), ''),
    NULLIF(SPLIT_PART(NEW.email, '@', 1), ''),
    'Sin nombre'
  );

  v_apellido := COALESCE(
    NULLIF(NEW.raw_user_meta_data->>'apellido', ''),
    NULLIF(NEW.raw_user_meta_data->>'family_name', ''),
    NULLIF(
      TRIM(SUBSTRING(NEW.raw_user_meta_data->>'name' FROM POSITION(' ' IN NEW.raw_user_meta_data->>'name'))),
      ''
    ),
    ''
  );

  -- El rol NUNCA se toma del cliente: siempre estudiante.
  INSERT INTO public.perfiles (id, email, nombre, apellido, rol, universidad)
  VALUES (
    NEW.id,
    NEW.email,
    v_nombre,
    v_apellido,
    'estudiante',
    NEW.raw_user_meta_data->>'universidad'
  );
  RETURN NEW;
END;
$$;
