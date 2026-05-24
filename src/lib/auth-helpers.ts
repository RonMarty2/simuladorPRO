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

/**
 * Inicia sesión con Google OAuth. Redirige al usuario a Google y vuelve
 * a la app después con la sesión iniciada. El callback es manejado
 * automáticamente por Supabase (la URL queda con un fragment #access_token=…
 * que la librería detecta y procesa).
 */
export async function iniciarSesionConGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/`,
      queryParams: {
        // Forzar al usuario a elegir cuenta cada vez, incluso si ya está
        // logueado en una sola cuenta de Google en el navegador.
        prompt: "select_account",
      },
    },
  });
  if (error) throw error;
  return data;
}

export async function cerrarSesion() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Wrap defensivo: si la promesa no resuelve en `ms`, rechaza con error claro
 * para no dejar al usuario con la pantalla "Cargando..." pegada.
 */
function conTimeout<T>(promise: PromiseLike<T>, ms: number, motivo: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const id = setTimeout(() => {
      reject(new Error(`Tiempo agotado: ${motivo} (>${ms / 1000}s)`));
    }, ms);
    Promise.resolve(promise).then(
      (v) => {
        clearTimeout(id);
        resolve(v);
      },
      (e) => {
        clearTimeout(id);
        reject(e);
      }
    );
  });
}

export async function obtenerPerfil(userId: string): Promise<Perfil | null> {
  // Retry interno: la primera query a Supabase suele colgarse justo después
  // de un login (OAuth o no). Reintentar una vez resuelve la mayoría.
  const hacerQuery = () =>
    supabase
      .from("perfiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

  let resp;
  try {
    resp = await conTimeout(hacerQuery(), 5000, "cargando tu perfil");
  } catch (primerError) {
    try {
      resp = await conTimeout(hacerQuery(), 8000, "cargando tu perfil (reintento)");
    } catch {
      throw primerError;
    }
  }

  const { data, error } = resp;
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

/**
 * Actualiza nombre y apellido del perfil del usuario autenticado.
 * Cualquiera puede editar su propio perfil (RLS: perfiles_propietario_actualiza).
 */
export async function actualizarMiPerfil(
  userId: string,
  cambios: { nombre?: string; apellido?: string; universidad?: string | null }
): Promise<void> {
  const { error } = await supabase
    .from("perfiles")
    .update(cambios)
    .eq("id", userId);
  if (error) throw error;
}

/**
 * Si el perfil tiene nombre vacío o el default "Sin nombre", lo sincroniza
 * con los datos que vienen en la metadata de Google OAuth.
 * Se llama después de cada login para mantener nombres consistentes.
 */
export async function sincronizarNombreConGoogle(
  userId: string,
  perfilActual: Perfil | null,
  metadataGoogle: Record<string, any> | undefined
): Promise<void> {
  if (!perfilActual || !metadataGoogle) return;

  const nombreActual = perfilActual.nombre?.trim() ?? "";
  const apellidoActual = perfilActual.apellido?.trim() ?? "";

  // Solo sincronizar si el nombre actual es vacío o el default
  const nombreEsDefault =
    !nombreActual ||
    nombreActual === "Sin nombre" ||
    nombreActual.toLowerCase() === perfilActual.email.split("@")[0].toLowerCase();

  if (!nombreEsDefault) return;

  const nombreGoogle =
    metadataGoogle.given_name?.trim() ||
    metadataGoogle.name?.split(" ")[0]?.trim();
  const apellidoGoogle =
    metadataGoogle.family_name?.trim() ||
    metadataGoogle.name?.split(" ").slice(1).join(" ").trim();

  if (!nombreGoogle) return;

  const cambios: { nombre?: string; apellido?: string } = {};
  if (nombreGoogle && nombreGoogle !== nombreActual) cambios.nombre = nombreGoogle;
  if (apellidoGoogle && apellidoGoogle !== apellidoActual) cambios.apellido = apellidoGoogle;

  if (Object.keys(cambios).length === 0) return;

  await actualizarMiPerfil(userId, cambios).catch((e) => {
    console.warn("No se pudo sincronizar nombre con Google:", e);
  });
}
