import { supabase } from "./supabase";
import type { DatosRegistro, Perfil } from "@/types/usuario";

export async function registrarUsuario(datos: DatosRegistro) {
  const { data, error } = await supabase.auth.signUp({
    email: datos.email,
    password: datos.password,
    options: {
      data: {
        nombre: datos.nombre,
        apellido: datos.apellido,
        rol: datos.rol,
        universidad: datos.universidad ?? null,
      },
    },
  });
  if (error) throw error;
  return data;
}

export async function iniciarSesion(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function cerrarSesion() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function obtenerPerfil(userId: string): Promise<Perfil | null> {
  const { data, error } = await supabase
    .from("perfiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return (data as Perfil | null) ?? null;
}

export async function obtenerPerfilConReintentos(
  userId: string,
  intentos = 3,
  delayMs = 300
): Promise<Perfil | null> {
  for (let i = 0; i < intentos; i++) {
    const perfil = await obtenerPerfil(userId);
    if (perfil) return perfil;
    if (i < intentos - 1) await new Promise((r) => setTimeout(r, delayMs));
  }
  return null;
}
