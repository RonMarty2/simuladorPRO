import type { User } from "@supabase/supabase-js";
import type { Perfil, Rol } from "@/types/usuario";
import type { Proyecto } from "@/types/proyecto";

/**
 * ============================================================================
 * MODO LOCAL · usar el simulador sin Supabase ni credenciales
 * ============================================================================
 *
 * Cuando corrés la app en tu compu sin configurar Supabase (sin `.env.local`),
 * la app entra en "modo local":
 *
 *   - No pide login. Te crea un usuario ficticio.
 *   - Podés entrar como DOCENTE o ESTUDIANTE y cambiar de rol cuando quieras
 *     (selector flotante abajo a la derecha).
 *   - Los proyectos se guardan en el navegador (localStorage), así no perdés
 *     el trabajo aunque cierres la pestaña.
 *
 * Lo que NO hay en modo local (necesita backend real): multiusuario de verdad,
 * sincronización entre dispositivos y el panel de admin con datos reales.
 *
 * En producción (Vercel con sus variables cargadas) esto queda DESACTIVADO
 * automáticamente: `esModoLocal()` devuelve false porque hay URL real.
 * ============================================================================
 */

const URL_SUPABASE = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const FLAG_LOCAL = import.meta.env.VITE_LOCAL_MODE as string | undefined;

/** Placeholder que trae `.env.example` — cuenta como "sin configurar". */
function urlEsPlaceholder(u: string | undefined): boolean {
  return !u || u.includes("tu-proyecto") || u.trim() === "";
}

/**
 * ¿Estamos en modo local (sin Supabase)?
 *   - VITE_LOCAL_MODE=true  → fuerza modo local.
 *   - VITE_LOCAL_MODE=false → fuerza modo online (aunque falten credenciales).
 *   - Sin flag → local si no hay URL de Supabase configurada.
 */
export function esModoLocal(): boolean {
  if (FLAG_LOCAL === "true") return true;
  if (FLAG_LOCAL === "false") return false;
  return urlEsPlaceholder(URL_SUPABASE);
}

// ----------------------------------------------------------------------------
// Rol y perfil ficticio
// ----------------------------------------------------------------------------

const CLAVE_ROL = "simulador.local.rol";
const CLAVE_PROYECTOS = "simulador.local.proyectos";

/** ID estable del usuario local. Compartido entre roles: un proyecto creado
 *  como docente también aparece cuando cambiás a estudiante (misma persona). */
export const ID_USUARIO_LOCAL = "local-user-0000-0000-0000-000000000000";

export function leerRolLocal(): Rol {
  try {
    const r = localStorage.getItem(CLAVE_ROL);
    if (r === "docente" || r === "estudiante") return r;
  } catch {
    // ignore
  }
  return "estudiante";
}

export function guardarRolLocal(rol: Rol): void {
  try {
    localStorage.setItem(CLAVE_ROL, rol);
  } catch {
    // ignore
  }
}

/** Usuario ficticio con la forma mínima que usa la app (id + email). */
export function usuarioLocal(): User {
  return {
    id: ID_USUARIO_LOCAL,
    email: "local@simulador.test",
    app_metadata: {},
    user_metadata: {},
    aud: "authenticated",
    created_at: "2020-01-01T00:00:00.000Z",
  } as unknown as User;
}

/** Perfil ficticio con el rol pedido. `es_admin` en true para que en local
 *  no quede nada oculto (el panel admin en sí necesita backend). */
export function perfilLocal(rol: Rol): Perfil {
  return {
    id: ID_USUARIO_LOCAL,
    nombre: rol === "docente" ? "Docente" : "Estudiante",
    apellido: "(local)",
    rol,
    email: "local@simulador.test",
    universidad: null,
    es_admin: true,
    creado_en: "2020-01-01T00:00:00.000Z",
  };
}

// ----------------------------------------------------------------------------
// Persistencia de proyectos en localStorage
// ----------------------------------------------------------------------------

export function leerProyectosLocal(): Proyecto[] {
  try {
    const raw = localStorage.getItem(CLAVE_PROYECTOS);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? (arr as Proyecto[]) : [];
  } catch {
    return [];
  }
}

function escribirProyectosLocal(proyectos: Proyecto[]): void {
  try {
    localStorage.setItem(CLAVE_PROYECTOS, JSON.stringify(proyectos));
  } catch {
    // ignore (cuota llena, modo privado, etc.)
  }
}

/** Upsert por id. */
export function guardarProyectoLocal(p: Proyecto): void {
  const proyectos = leerProyectosLocal();
  const idx = proyectos.findIndex((x) => x.id === p.id);
  if (idx >= 0) proyectos[idx] = p;
  else proyectos.push(p);
  escribirProyectosLocal(proyectos);
}

export function eliminarProyectoLocal(id: string): void {
  escribirProyectosLocal(leerProyectosLocal().filter((p) => p.id !== id));
}
