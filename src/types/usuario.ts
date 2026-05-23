export type Rol = "docente" | "estudiante";

export interface Perfil {
  id: string;
  nombre: string;
  apellido: string;
  rol: Rol;
  email: string;
  universidad: string | null;
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
