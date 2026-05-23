import { supabase } from "./supabase";
import type { Proyecto } from "@/types/proyecto";

/**
 * Divide un Proyecto en columnas SQL + JSONB para guardarlo en la tabla
 * `proyectos`. Los campos del dominio que no son metadatos (inversiones,
 * costos, productos, etc.) van comprimidos en `datos`.
 */
function aFilaSupabase(p: Proyecto) {
  const { id, estudiante_id, curso_id, nombre, estado, creado_en, actualizado_en, ...resto } = p;
  return {
    id,
    estudiante_id,
    curso_id,
    nombre,
    estado,
    datos: { ...resto, creado_en, actualizado_en },
  };
}

function deFilaSupabase(fila: any): Proyecto {
  return {
    ...(fila.datos ?? {}),
    id: fila.id,
    estudiante_id: fila.estudiante_id,
    curso_id: fila.curso_id,
    nombre: fila.nombre,
    estado: fila.estado,
    creado_en: fila.datos?.creado_en ?? fila.creado_en,
    actualizado_en: fila.datos?.actualizado_en ?? fila.actualizado_en,
  } as Proyecto;
}

/** Lista los proyectos del estudiante autenticado, más reciente primero. */
export async function listarMisProyectos(estudianteId: string): Promise<Proyecto[]> {
  const { data, error } = await supabase
    .from("proyectos")
    .select("*")
    .eq("estudiante_id", estudianteId)
    .order("actualizado_en", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(deFilaSupabase);
}

/** Upsert: inserta si no existe, actualiza si ya existe. */
export async function guardarProyecto(p: Proyecto): Promise<void> {
  const fila = aFilaSupabase(p);
  const { error } = await supabase.from("proyectos").upsert(fila, { onConflict: "id" });
  if (error) throw error;
}

/** Elimina un proyecto (cascada borra simulaciones/turnos asociados en FASE 6). */
export async function eliminarProyecto(id: string): Promise<void> {
  const { error } = await supabase.from("proyectos").delete().eq("id", id);
  if (error) throw error;
}
