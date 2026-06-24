import { supabase } from "./supabase";
import { normalizarUniversidad } from "./utils";
import { nombrePerfilEsProvisional } from "./perfil";
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
        universidad: normalizarUniversidad(datos.universidad),
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
 * Detecta si la app está corriendo como PWA standalone (instalada en el
 * celular) en vez de en una pestaña normal de browser. Importa para OAuth:
 * en standalone hay que asegurarse de que el callback vuelva a la PWA, no
 * abra un browser nuevo.
 */
function enModoStandalone(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia?.("(display-mode: standalone)").matches) return true;
  if ((window.navigator as any).standalone === true) return true; // iOS
  return false;
}

/**
 * Inicia sesión con Google OAuth. Redirige al usuario a Google y vuelve
 * a la app después con la sesión iniciada.
 *
 * En PWA standalone (app instalada) el callback puede caer en el browser
 * externo en lugar de la PWA — para mitigar eso, el manifest declara
 * launch_handler:navigate-existing y el callback se procesa explícitamente
 * en `procesarCallbackOAuthSiAplica()` al inicializar el auth-store.
 */
export async function iniciarSesionConGoogle(opciones?: { volverA?: string }) {
  // En la URL agregamos un marcador para identificar el callback al volver.
  // Sirve al `procesarCallbackOAuthSiAplica()` para saber que tiene que
  // intercambiar el code aunque detectSessionInUrl no lo haya hecho solo.
  // `volverA` permite mandarlo a una ruta específica después del login
  // (ej. /semanae para auto-inscribirse al evento).
  const ruta = opciones?.volverA ?? "/";
  const redirectTo = `${window.location.origin}${ruta}?oauth=1`;
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo,
      // En standalone forzamos que el browser tome control completo de la
      // navegación (sin custom tab) para que el callback no se quede en otro
      // contexto. En browser normal Supabase decide la mejor estrategia.
      skipBrowserRedirect: false,
      queryParams: {
        prompt: "select_account",
      },
    },
  });
  if (error) throw error;
  return data;
}

/**
 * Si la URL actual tiene un `?code=` (callback OAuth de PKCE) o un fragmento
 * `#access_token=...` (callback de implicit flow), intercambia ese code por
 * una sesión y limpia la URL. Esto se llama al inicializar la app para
 * cubrir el caso PWA standalone donde `detectSessionInUrl` a veces no se
 * dispara solo.
 *
 * Es idempotente: si no hay callback en la URL, no hace nada.
 */
export async function procesarCallbackOAuthSiAplica(): Promise<void> {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  const code = url.searchParams.get("code");
  const hash = window.location.hash;
  const tieneCode = !!code;
  const tieneAccessToken = hash.includes("access_token=");

  if (!tieneCode && !tieneAccessToken) return;

  try {
    if (tieneCode && code) {
      // PKCE: intercambiamos el code por una sesión real.
      await supabase.auth.exchangeCodeForSession(code).catch((e) => {
        console.warn("[oauth] exchangeCodeForSession falló:", e?.message);
      });
    }
    // Limpiar la URL para que no quede `?code=...&oauth=1` ni el hash.
    // Usamos replaceState para no agregar entrada al history.
    const limpia = `${url.origin}${url.pathname}`;
    window.history.replaceState({}, document.title, limpia);
  } catch (e) {
    console.warn("[oauth] procesarCallback error:", e);
  }
  // Nota: enModoStandalone se usa en el log para diagnóstico.
  if (enModoStandalone()) {
    console.info("[oauth] callback procesado en modo PWA standalone");
  }
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

/**
 * Cache local del perfil: ante caídas intermitentes de Supabase preferimos
 * servir un perfil viejo (hasta 30 días) antes que tirar al alumno a la
 * pantalla de error. Se rehidrata en cada login exitoso.
 */
const CACHE_PERFIL_KEY = (userId: string) => `simulador.perfil.${userId}`;
const CACHE_PERFIL_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function leerPerfilCacheado(userId: string): Perfil | null {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(CACHE_PERFIL_KEY(userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { perfil: Perfil; guardado_en: number };
    if (!parsed?.perfil) return null;
    if (Date.now() - parsed.guardado_en > CACHE_PERFIL_TTL_MS) return null;
    return parsed.perfil;
  } catch {
    return null;
  }
}

function guardarPerfilCacheado(userId: string, perfil: Perfil): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(
      CACHE_PERFIL_KEY(userId),
      JSON.stringify({ perfil, guardado_en: Date.now() })
    );
  } catch {
    // Cuota llena u otro fallo del storage: no bloqueamos al usuario.
  }
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
      // Fallback: perfil cacheado de un login anterior. Cuando Supabase
      // responde lento o falla intermitente preferimos mostrar el perfil
      // viejo y dejar al alumno seguir trabajando antes que tirarlo a la
      // pantalla "No pudimos cargar tu perfil". Si nunca se cacheó nada,
      // el throw original sigue subiendo.
      const cacheado = leerPerfilCacheado(userId);
      if (cacheado) {
        console.warn("[auth] obtenerPerfil cayó al cache local de emergencia");
        return cacheado;
      }
      throw primerError;
    }
  }

  const { data, error } = resp;
  if (error) throw error;
  const perfil = (data as Perfil | null) ?? null;
  if (perfil) guardarPerfilCacheado(userId, perfil);
  return perfil;
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

/** Guarda el nombre elegido al entrar por primera vez a Semana E. */
export async function confirmarNombreSemanaE(
  userId: string,
  datos: { nombre: string; apellido?: string }
): Promise<void> {
  const nombre = datos.nombre.trim();
  const apellido = datos.apellido?.trim() ?? "";
  if (nombre.length < 2) {
    throw new Error("Escribí un nombre de al menos 2 caracteres.");
  }

  await actualizarMiPerfil(userId, { nombre, apellido });

  // La marca vive en Auth metadata para que la pregunta aparezca una sola vez
  // sin agregar una columna específica del evento a la tabla perfiles.
  const { error } = await supabase.auth.updateUser({
    data: { semana_e_nombre_confirmado: true },
  });
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
  const nombreEsDefault = nombrePerfilEsProvisional(perfilActual);

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

/** Inscribe la sesión de Google actual al evento Semana E activo. */
export async function entrarAEventoSemanaE(opciones?: {
  cursoId?: string;
}): Promise<{ userId: string; cursoId: string }> {
  // 1. Semana E usa una cuenta Google persistente. No creamos usuarios
  // anónimos acá: así nadie vuelve a terminar con un nombre Invitado-xxxxxx.
  const { data: sesionActual } = await supabase.auth.getSession();
  const userId = sesionActual.session?.user?.id;
  if (!userId) {
    throw new Error("Inicia sesión con Google para entrar a Semana E.");
  }

  // 2. Encontrar el curso Semana E. Si el llamador pasó un cursoId, usamos
  // ese; si no, buscamos el primero que sea es_semana_e=TRUE (asumimos un
  // único evento activo).
  let cursoId = opciones?.cursoId ?? null;
  if (!cursoId) {
    const { data: cursos } = await supabase
      .from("cursos")
      .select("id")
      .eq("es_semana_e", true)
      .eq("estado", "activo")
      .order("creado_en", { ascending: false })
      .limit(1);
    cursoId = cursos?.[0]?.id ?? null;
  }
  if (!cursoId) {
    throw new Error("No hay ningún evento Semana E activo. Pedile al docente que cree uno.");
  }

  // 3. Auto-inscripción al curso. Si ya estaba inscripto (porque el usuario
  // refrescó), ignoramos el error de unique constraint. Cualquier otro error
  // se muestra acá, antes de que termine convertido en un error RLS al crear
  // el grupo.
  const { error: errIns } = await supabase
    .from("inscripciones")
    .insert({ curso_id: cursoId, estudiante_id: userId });
  if (errIns && !errIns.message.toLowerCase().includes("duplicate")) {
    throw new Error(`No se pudo inscribirte al evento: ${errIns.message}`);
  }

  return { userId, cursoId };
}
