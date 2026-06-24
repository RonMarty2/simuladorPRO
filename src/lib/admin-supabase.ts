/**
 * Helpers de Supabase para el panel de admin.
 *
 * Solo el usuario con perfiles.es_admin=TRUE puede usarlos efectivamente
 * gracias a las políticas RLS de la migración 012.
 */

import { supabase } from "./supabase";
import type { Perfil, Rol } from "@/types/usuario";

export interface PerfilExtendido extends Perfil {
  proyectos_count?: number;
  inscripciones_count?: number;
}

/** Lista todos los perfiles del sistema (solo admin). */
export async function listarTodosLosUsuarios(): Promise<Perfil[]> {
  const { data, error } = await supabase
    .from("perfiles")
    .select("*")
    .order("creado_en", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Perfil[];
}

/** Cambia el rol de un usuario (estudiante ↔ docente). */
export async function cambiarRolUsuario(userId: string, nuevoRol: Rol): Promise<void> {
  const { error } = await supabase
    .from("perfiles")
    .update({ rol: nuevoRol })
    .eq("id", userId);
  if (error) throw error;
}

/** Marca o desmarca a un usuario como admin. */
export async function setearAdmin(userId: string, esAdmin: boolean): Promise<void> {
  const { error } = await supabase
    .from("perfiles")
    .update({ es_admin: esAdmin })
    .eq("id", userId);
  if (error) throw error;
}

/** Lista todos los cursos del sistema (admin ve todo). */
export async function listarTodosLosCursos() {
  const { data, error } = await supabase
    .from("cursos")
    .select("*")
    .order("creado_en", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

/** Cambia el estado de un curso desde el panel admin. */
export async function cambiarEstadoCursoComoAdmin(cursoId: string, estado: string) {
  const { data, error } = await supabase
    .from("cursos")
    .update({ estado })
    .eq("id", cursoId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Lista todos los proyectos del sistema (admin ve todo). */
export async function listarTodosLosProyectos() {
  const { data, error } = await supabase
    .from("proyectos")
    .select("id, nombre, tipo, estudiante_id, curso_id, estado, creado_en, actualizado_en")
    .order("actualizado_en", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

/** Estadísticas globales rápidas. */
export async function obtenerEstadisticasGlobales() {
  const [perfiles, cursos, proyectos, entregas] = await Promise.all([
    supabase.from("perfiles").select("rol, es_admin"),
    supabase.from("cursos").select("id"),
    supabase.from("proyectos").select("id, tipo"),
    supabase.from("entregas").select("id, estado"),
  ]);

  const totalDocentes = (perfiles.data ?? []).filter((p) => p.rol === "docente").length;
  const totalEstudiantes = (perfiles.data ?? []).filter((p) => p.rol === "estudiante").length;
  const totalAdmins = (perfiles.data ?? []).filter((p) => p.es_admin).length;

  return {
    totalUsuarios: perfiles.data?.length ?? 0,
    totalDocentes,
    totalEstudiantes,
    totalAdmins,
    totalCursos: cursos.data?.length ?? 0,
    totalProyectos: proyectos.data?.length ?? 0,
    totalCasosCurso: (proyectos.data ?? []).filter((p: any) => p.tipo === "caso_curso").length,
    totalEntregas: entregas.data?.length ?? 0,
    entregasPendientes: (entregas.data ?? []).filter((e: any) => e.estado === "pendiente").length,
  };
}

/**
 * Reasigna un proyecto a otro usuario (útil para "migrar" el proyecto de
 * una cuenta vieja a la cuenta admin).
 */
export async function reasignarProyecto(proyectoId: string, nuevoUsuarioId: string): Promise<void> {
  const { error } = await supabase
    .from("proyectos")
    .update({ estudiante_id: nuevoUsuarioId })
    .eq("id", proyectoId);
  if (error) throw error;
}

/**
 * Clona CUALQUIER proyecto del sistema a la cuenta del admin como proyecto
 * LIBRE (deja el original intacto en su dueño). Útil para que el admin se
 * "traiga" el proyecto de otro docente y lo use/adapte sin afectar al original.
 */
export async function clonarProyectoAMiCuenta(
  proyectoId: string,
  miUserId: string
): Promise<void> {
  const { data, error } = await supabase
    .from("proyectos")
    .select("*")
    .eq("id", proyectoId)
    .single();
  if (error) throw error;
  const ahora = new Date().toISOString();
  const nuevaFila = {
    id: crypto.randomUUID(),
    estudiante_id: miUserId,
    curso_id: null,
    grupo_id: null,
    nombre: `${(data as any).nombre} (copia)`,
    estado: "construyendo",
    tipo: "libre",
    caso_origen_id: null,
    paso_inicio_estudiante: null,
    datos: { ...((data as any).datos ?? {}), creado_en: ahora, actualizado_en: ahora },
  };
  const { error: e2 } = await supabase.from("proyectos").insert(nuevaFila);
  if (e2) throw e2;
}

/** Borra un curso (cascade: inscripciones, proyectos y entregas asociados). */
export async function borrarCursoComoAdmin(cursoId: string): Promise<void> {
  const { error } = await supabase.from("cursos").delete().eq("id", cursoId);
  if (error) throw error;
}
