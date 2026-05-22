-- ============================================================================
-- FASE 1 — Autenticación y estructura base
-- Tablas: perfiles, cursos, inscripciones
-- Incluye Row Level Security (RLS) según spec del simulador
-- ============================================================================

-- ----------------------------------------------------------------------------
-- TABLA: perfiles
-- Extiende auth.users con datos del dominio (rol, universidad, etc.)
-- ----------------------------------------------------------------------------
CREATE TABLE perfiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  rol TEXT NOT NULL CHECK (rol IN ('docente', 'estudiante')),
  email TEXT UNIQUE NOT NULL,
  universidad TEXT,
  creado_en TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- TABLA: cursos
-- Un docente crea cursos; los estudiantes se inscriben por código.
-- ----------------------------------------------------------------------------
CREATE TABLE cursos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  docente_id UUID NOT NULL REFERENCES perfiles(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  codigo TEXT UNIQUE NOT NULL,
  materia TEXT NOT NULL,
  paralelo TEXT,
  frecuencia_turnos TEXT NOT NULL CHECK (frecuencia_turnos IN ('mensual', 'trimestral', 'semestral')),
  duracion_anios INTEGER DEFAULT 5,
  estado TEXT DEFAULT 'activo' CHECK (estado IN ('activo', 'cerrado', 'archivado')),
  creado_en TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cursos_docente ON cursos(docente_id);
CREATE INDEX idx_cursos_codigo ON cursos(codigo);

-- ----------------------------------------------------------------------------
-- TABLA: inscripciones
-- Relación N:N entre estudiantes y cursos.
-- ----------------------------------------------------------------------------
CREATE TABLE inscripciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  curso_id UUID NOT NULL REFERENCES cursos(id) ON DELETE CASCADE,
  estudiante_id UUID NOT NULL REFERENCES perfiles(id) ON DELETE CASCADE,
  inscrito_en TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(curso_id, estudiante_id)
);

CREATE INDEX idx_inscripciones_curso ON inscripciones(curso_id);
CREATE INDEX idx_inscripciones_estudiante ON inscripciones(estudiante_id);

-- ============================================================================
-- TRIGGER: crear perfil automáticamente al registrarse un usuario
-- Lee nombre/apellido/rol/universidad desde raw_user_meta_data
-- ============================================================================
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
    COALESCE(NEW.raw_user_meta_data ->> 'rol', 'estudiante'),
    NEW.email,
    NEW.raw_user_meta_data ->> 'universidad'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_nuevo_usuario();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE inscripciones ENABLE ROW LEVEL SECURITY;

-- ---- perfiles -------------------------------------------------------------
-- Cualquier usuario autenticado lee su propio perfil
CREATE POLICY "perfiles_self_select"
  ON perfiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Cualquier usuario autenticado actualiza su propio perfil (excepto rol)
CREATE POLICY "perfiles_self_update"
  ON perfiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Docentes leen perfiles de estudiantes inscritos en sus cursos
CREATE POLICY "perfiles_docente_ve_inscritos"
  ON perfiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM inscripciones i
      JOIN cursos c ON c.id = i.curso_id
      WHERE i.estudiante_id = perfiles.id
        AND c.docente_id = auth.uid()
    )
  );

-- ---- cursos --------------------------------------------------------------
-- Docente ve y modifica sus propios cursos
CREATE POLICY "cursos_docente_propio"
  ON cursos FOR ALL
  TO authenticated
  USING (docente_id = auth.uid())
  WITH CHECK (docente_id = auth.uid());

-- Estudiante ve cursos en los que está inscrito
CREATE POLICY "cursos_estudiante_inscrito"
  ON cursos FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM inscripciones
      WHERE inscripciones.curso_id = cursos.id
        AND inscripciones.estudiante_id = auth.uid()
    )
  );

-- Estudiante puede buscar curso por código para inscribirse (lectura mínima)
CREATE POLICY "cursos_buscar_por_codigo"
  ON cursos FOR SELECT
  TO authenticated
  USING (estado = 'activo');

-- ---- inscripciones -------------------------------------------------------
-- Estudiante crea su propia inscripción
CREATE POLICY "inscripciones_estudiante_crea"
  ON inscripciones FOR INSERT
  TO authenticated
  WITH CHECK (estudiante_id = auth.uid());

-- Estudiante ve sus propias inscripciones
CREATE POLICY "inscripciones_estudiante_ve"
  ON inscripciones FOR SELECT
  TO authenticated
  USING (estudiante_id = auth.uid());

-- Docente ve inscripciones a sus cursos
CREATE POLICY "inscripciones_docente_ve"
  ON inscripciones FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cursos
      WHERE cursos.id = inscripciones.curso_id
        AND cursos.docente_id = auth.uid()
    )
  );

-- Estudiante puede borrar su propia inscripción
CREATE POLICY "inscripciones_estudiante_borra"
  ON inscripciones FOR DELETE
  TO authenticated
  USING (estudiante_id = auth.uid());
