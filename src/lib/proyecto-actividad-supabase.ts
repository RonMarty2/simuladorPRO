import { supabase } from "./supabase";

export type TipoActividad = "edito" | "entrego" | "simulo";

export interface ActividadProyecto {
  id: string;
  proyecto_id: string;
  usuario_id: string;
  tipo: TipoActividad;
  paso: number;
  momento: string;
  dia: string;
}

export interface ActividadConPerfil extends ActividadProyecto {
  perfil: { nombre: string; apellido: string; email: string } | null;
}

/**
 * Registra actividad de un usuario sobre un proyecto. Deduplica por
 * (proyecto, usuario, tipo, paso, día): el upsert solo "renueva" el momento
 * si ya hubo actividad ese día con esos parámetros.
 *
 * Errores se silencian: el log de actividad no debe trabar nunca un guardado
 * o una entrega.
 */
export async function registrarActividad(
  proyectoId: string,
  usuarioId: string,
  tipo: TipoActividad,
  paso: number = 0
): Promise<void> {
  try {
    const ahora = new Date();
    const hoyIso = ahora.toISOString().slice(0, 10);
    await supabase.from("proyecto_actividad").upsert(
      {
        proyecto_id: proyectoId,
        usuario_id: usuarioId,
        tipo,
        paso,
        momento: ahora.toISOString(),
        dia: hoyIso,
      },
      { onConflict: "proyecto_id,usuario_id,tipo,paso,dia" }
    );
  } catch {
    // Audit silencioso. Ningún flujo crítico depende de esto.
  }
}

/** Lee toda la actividad de un proyecto con el perfil del autor (para mostrar
 *  nombre y apellido al docente). Ordenada por momento DESC. */
export async function listarActividadProyecto(
  proyectoId: string
): Promise<ActividadConPerfil[]> {
  const { data, error } = await supabase
    .from("proyecto_actividad")
    .select("*, perfiles:usuario_id(nombre, apellido, email)")
    .eq("proyecto_id", proyectoId)
    .order("momento", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    ...row,
    perfil: row.perfiles
      ? {
          nombre: row.perfiles.nombre,
          apellido: row.perfiles.apellido,
          email: row.perfiles.email,
        }
      : null,
  })) as ActividadConPerfil[];
}

/**
 * Resume la actividad por miembro: para cada estudiante devuelve la última
 * edición (con paso) y si llegó a entregar al menos una vez. Útil para que
 * el docente vea "Sofía editó Paso 5 hace 2 días + entregó" en un vistazo.
 */
export interface ResumenActividadMiembro {
  usuarioId: string;
  nombre: string;
  apellido: string;
  email: string;
  ultimaEdicion: { momento: string; paso: number } | null;
  entrego: boolean;
  diasActivos: number;
}

export function resumirActividadPorMiembro(
  actividad: ActividadConPerfil[],
  miembros: { id: string; nombre: string; apellido: string; email: string }[]
): ResumenActividadMiembro[] {
  return miembros.map((m) => {
    const propias = actividad.filter((a) => a.usuario_id === m.id);
    const ediciones = propias.filter((a) => a.tipo === "edito");
    const ultima = ediciones[0]
      ? { momento: ediciones[0].momento, paso: ediciones[0].paso }
      : null;
    const entrego = propias.some((a) => a.tipo === "entrego");
    const diasActivos = new Set(propias.map((a) => a.dia)).size;
    return {
      usuarioId: m.id,
      nombre: m.nombre,
      apellido: m.apellido,
      email: m.email,
      ultimaEdicion: ultima,
      entrego,
      diasActivos,
    };
  });
}
