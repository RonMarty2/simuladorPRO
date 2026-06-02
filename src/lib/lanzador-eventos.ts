import { supabase } from "./supabase";

/**
 * Lanzador de eventos en vivo (modo "docente_dispara").
 *
 * El docente elige un evento del catálogo y lo dispara a TODOS los alumnos
 * con simulación activa en un curso. Internamente:
 *   1. Identifica las simulaciones activas de los proyectos del curso.
 *   2. Setea simulaciones.evento_forzado_id = eventoId en todas.
 *   3. Inserta un registro de auditoría en eventos_disparados.
 *
 * Cuando el alumno entra/refresca, el motor lee evento_forzado_id y lo aplica
 * en lugar del sorteo aleatorio. Al avanzar, se limpia.
 */

export interface EventoDisparado {
  id: string;
  curso_id: string;
  evento_id: string;
  disparado_por: string;
  disparado_en: string;
  simulaciones_afectadas: number;
  nota: string | null;
}

/** Cuenta cuántos alumnos del curso tienen simulación activa AHORA. */
export async function contarSimulacionesActivasDelCurso(cursoId: string): Promise<number> {
  // 1) Proyectos del curso (libres del alumno + grupales + entrega_estudiante)
  const { data: proyectos, error: e1 } = await supabase
    .from("proyectos")
    .select("id")
    .eq("curso_id", cursoId);
  if (e1) throw e1;
  const proyectoIds = (proyectos ?? []).map((p: any) => p.id);
  if (proyectoIds.length === 0) return 0;

  // 2) Simulaciones activas de esos proyectos
  const { count, error: e2 } = await supabase
    .from("simulaciones")
    .select("id", { count: "exact", head: true })
    .in("proyecto_id", proyectoIds)
    .eq("estado", "activa");
  if (e2) throw e2;
  return count ?? 0;
}

/**
 * Dispara un evento a todas las simulaciones activas del curso. Devuelve la
 * cantidad afectada y el id del registro de auditoría.
 */
export async function dispararEventoAlCurso(params: {
  cursoId: string;
  eventoId: string;
  docenteId: string;
  nota?: string | null;
}): Promise<{ afectadas: number; disparoId: string }> {
  // 1) Buscar proyectos del curso
  const { data: proyectos, error: e1 } = await supabase
    .from("proyectos")
    .select("id")
    .eq("curso_id", params.cursoId);
  if (e1) throw e1;
  const proyectoIds = (proyectos ?? []).map((p: any) => p.id);

  let afectadas = 0;
  if (proyectoIds.length > 0) {
    // 2) Setear evento_forzado_id en TODAS las simulaciones activas de esos
    // proyectos. Postgres devuelve la cantidad con count='exact'.
    const { error: e2, count } = await supabase
      .from("simulaciones")
      .update({ evento_forzado_id: params.eventoId }, { count: "exact" })
      .in("proyecto_id", proyectoIds)
      .eq("estado", "activa");
    if (e2) throw e2;
    afectadas = count ?? 0;
  }

  // 3) Insertar registro de auditoría
  const { data: disparo, error: e3 } = await supabase
    .from("eventos_disparados")
    .insert({
      curso_id: params.cursoId,
      evento_id: params.eventoId,
      disparado_por: params.docenteId,
      simulaciones_afectadas: afectadas,
      nota: params.nota ?? null,
    })
    .select()
    .single();
  if (e3) throw e3;

  return { afectadas, disparoId: (disparo as any).id };
}

/** Lista el histórico de disparos del curso, más reciente primero. */
export async function listarEventosDisparadosDelCurso(
  cursoId: string,
  limite = 20
): Promise<EventoDisparado[]> {
  const { data, error } = await supabase
    .from("eventos_disparados")
    .select("*")
    .eq("curso_id", cursoId)
    .order("disparado_en", { ascending: false })
    .limit(limite);
  if (error) throw error;
  return (data ?? []) as EventoDisparado[];
}

/**
 * Limpia el evento_forzado_id de una simulación específica. Se llama después
 * de que el alumno aplicó el evento y avanzó el turno, para que no se aplique
 * dos veces.
 */
export async function limpiarEventoForzado(simulacionId: string): Promise<void> {
  const { error } = await supabase
    .from("simulaciones")
    .update({ evento_forzado_id: null })
    .eq("id", simulacionId);
  if (error) throw error;
}
