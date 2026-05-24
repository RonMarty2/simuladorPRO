export type Rol = "docente" | "estudiante";

export interface Perfil {
  id: string;
  nombre: string;
  apellido: string;
  rol: Rol;
  email: string;
  universidad: string | null;
  /** Flag de super-usuario. Independiente del rol — un admin sigue siendo
   *  docente o estudiante a la vez. Solo lo seteamos manualmente vía SQL. */
  es_admin?: boolean;
  creado_en: string;
}

export interface DatosRegistro {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  rol: Rol;
  universidad?: string;
}
