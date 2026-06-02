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

/**
 * Tipo de proyecto al que va el evento. Mapea los tipos que el alumno usa
 * (caso/individual/grupal) a las condiciones reales sobre proyectos.tipo y
 * proyectos.caso_origen_id.
 */
export type AlcanceLanzamiento = "todos" | "caso" | "individual" | "grupal";

type ProyectoMin = {
  id: string;
  tipo: string;
  caso_origen_id: string | null;
  /** datos.sector del proyecto (JSONB). Lo extraemos en la query. */
  sector?: string | null;
};

/** Filtra una lista de proyectos según el alcance. */
function filtrarPorAlcance(proyectos: ProyectoMin[], alcance: AlcanceLanzamiento): ProyectoMin[] {
  return proyectos.filter((p) => {
    if (p.tipo === "caso_curso") return false; // plantilla del docente, nunca
    if (alcance === "todos") return true;
    if (alcance === "grupal") return p.tipo === "proyecto_grupal";
    if (alcance === "caso") return !!p.caso_origen_id;
    return p.tipo === "libre" && !p.caso_origen_id;
  });
}

/**
 * Filtra los proyectos por relevancia sectorial del evento. Si el evento
 * incluye 'todos' en sectores_afectados, devuelve todos. Si no, devuelve solo
 * los proyectos cuyo sector está en la lista del evento.
 */
function filtrarPorSector(
  proyectos: ProyectoMin[],
  sectoresAfectados: string[]
): ProyectoMin[] {
  if (sectoresAfectados.includes("todos")) return proyectos;
  return proyectos.filter((p) => p.sector && sectoresAfectados.includes(p.sector));
}

export interface ConteoSimulacionesCurso {
  /** Simulaciones activas del curso que cumplen el alcance (caso/individual/grupal). */
  totalDelAlcance: number;
  /** De esas, cuántas pertenecen a proyectos en los sectores afectados por el evento. */
  enSectoresAfectados: number;
}

/**
 * Cuenta cuántas simulaciones activas hay en el curso, separando "del alcance"
 * y "en sectores afectados por el evento". Si no se pasa el evento, solo
 * cuenta por alcance (enSectoresAfectados = totalDelAlcance).
 */
export async function contarSimulacionesActivasDelCurso(
  cursoId: string,
  alcance: AlcanceLanzamiento = "todos",
  sectoresAfectados?: string[]
): Promise<ConteoSimulacionesCurso> {
  // Traemos proyectos + sector del JSONB datos.
  const { data: proyectos, error: e1 } = await supabase
    .from("proyectos")
    .select("id, tipo, caso_origen_id, datos")
    .eq("curso_id", cursoId);
  if (e1) throw e1;
  const conSector: ProyectoMin[] = ((proyectos ?? []) as any[]).map((p) => ({
    id: p.id,
    tipo: p.tipo,
    caso_origen_id: p.caso_origen_id,
    sector: p.datos?.sector ?? null,
  }));
  const delAlcance = filtrarPorAlcance(conSector, alcance);
  const idsAlcance = delAlcance.map((p) => p.id);

  let totalDelAlcance = 0;
  let enSectoresAfectados = 0;

  if (idsAlcance.length > 0) {
    // Simulaciones activas de los del alcance (con su proyecto_id para
    // cruzar con sectores).
    const { data: sims, error: e2 } = await supabase
      .from("simulaciones")
      .select("proyecto_id")
      .in("proyecto_id", idsAlcance)
      .eq("estado", "activa");
    if (e2) throw e2;
    const activas = (sims ?? []) as { proyecto_id: string }[];
    totalDelAlcance = activas.length;

    if (sectoresAfectados && sectoresAfectados.length > 0) {
      const idsAfectados = new Set(
        filtrarPorSector(delAlcance, sectoresAfectados).map((p) => p.id)
      );
      enSectoresAfectados = activas.filter((s) => idsAfectados.has(s.proyecto_id)).length;
    } else {
      enSectoresAfectados = totalDelAlcance;
    }
  }

  return { totalDelAlcance, enSectoresAfectados };
}

/**
 * Dispara un evento a todas las simulaciones activas del curso. Devuelve la
 * cantidad afectada y el id del registro de auditoría.
 */
export async function dispararEventoAlCurso(params: {
  cursoId: string;
  eventoId: string;
  docenteId: string;
  alcance?: AlcanceLanzamiento;
  /** Sectores afectados por el evento (de eventos.sectores_afectados). */
  sectoresAfectados?: string[];
  /**
   * Si es true, se manda a TODOS los del alcance aunque no estén en los
   * sectores afectados. Por defecto false: solo a los sectorialmente
   * relevantes.
   */
  forzarATodos?: boolean;
  nota?: string | null;
}): Promise<{ afectadas: number; disparoId: string }> {
  const alcance = params.alcance ?? "todos";
  // 1) Buscar proyectos del curso con su tipo, caso_origen_id y sector.
  const { data: proyectos, error: e1 } = await supabase
    .from("proyectos")
    .select("id, tipo, caso_origen_id, datos")
    .eq("curso_id", params.cursoId);
  if (e1) throw e1;
  const conSector: ProyectoMin[] = ((proyectos ?? []) as any[]).map((p) => ({
    id: p.id,
    tipo: p.tipo,
    caso_origen_id: p.caso_origen_id,
    sector: p.datos?.sector ?? null,
  }));
  let candidatos = filtrarPorAlcance(conSector, alcance);
  // Filtro sectorial salvo que el docente fuerce el envío a todos.
  if (!params.forzarATodos && params.sectoresAfectados && params.sectoresAfectados.length > 0) {
    candidatos = filtrarPorSector(candidatos, params.sectoresAfectados);
  }
  const proyectoIds = candidatos.map((p) => p.id);

  let afectadas = 0;
  if (proyectoIds.length > 0) {
    // 2) Setear evento_forzado_id en las simulaciones activas de esos
    // proyectos. Postgres devuelve la cantidad con count='exact'.
    const { error: e2, count } = await supabase
      .from("simulaciones")
      .update({ evento_forzado_id: params.eventoId }, { count: "exact" })
      .in("proyecto_id", proyectoIds)
      .eq("estado", "activa");
    if (e2) throw e2;
    afectadas = count ?? 0;
  }

  // 3) Insertar registro de auditoría con alcance y modo sectorial.
  const modoSec = params.forzarATodos ? "forzado" : "sectorial";
  const notaCompleta = `alcance=${alcance}·${modoSec}${params.nota ? ` · ${params.nota}` : ""}`;
  const { data: disparo, error: e3 } = await supabase
    .from("eventos_disparados")
    .insert({
      curso_id: params.cursoId,
      evento_id: params.eventoId,
      disparado_por: params.docenteId,
      simulaciones_afectadas: afectadas,
      nota: notaCompleta,
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

// ============================================================================
// DASHBOARD DE RESPUESTAS: qué decidió cada alumno ante un evento lanzado
// ============================================================================

export interface RespuestasEvento {
  /** Cuántos alumnos YA respondieron (tomaron una decisión sobre ese evento). */
  totalRespondieron: number;
  /** Desglose por letra de opción: { A: 12, B: 4, ... } */
  porLetra: Record<string, number>;
  /** Texto de cada opción (para mostrar junto al conteo). */
  textosPorLetra: Record<string, string>;
}

/**
 * Lee turnos_historial para saber qué decidieron los alumnos del curso ante
 * un evento específico. Cruza: proyectos del curso → simulaciones → turnos.
 * Filtra en JS los turnos cuya decision_tomada.evento_id == eventoId y agrupa
 * por la letra de la opción elegida.
 */
export async function obtenerRespuestasEvento(
  cursoId: string,
  eventoId: string
): Promise<RespuestasEvento> {
  const vacio: RespuestasEvento = {
    totalRespondieron: 0,
    porLetra: {},
    textosPorLetra: {},
  };

  // 1) proyectos del curso
  const { data: proyectos, error: e1 } = await supabase
    .from("proyectos")
    .select("id")
    .eq("curso_id", cursoId);
  if (e1) throw e1;
  const proyectoIds = (proyectos ?? []).map((p: any) => p.id);
  if (proyectoIds.length === 0) return vacio;

  // 2) simulaciones de esos proyectos (activas o finalizadas — la decisión
  //    pudo tomarse y luego seguir)
  const { data: sims, error: e2 } = await supabase
    .from("simulaciones")
    .select("id")
    .in("proyecto_id", proyectoIds);
  if (e2) throw e2;
  const simIds = (sims ?? []).map((s: any) => s.id);
  if (simIds.length === 0) return vacio;

  // 3) turnos de esas simulaciones con su decisión
  const { data: turnos, error: e3 } = await supabase
    .from("turnos_historial")
    .select("decision_tomada")
    .in("simulacion_id", simIds);
  if (e3) throw e3;

  const porLetra: Record<string, number> = {};
  const textosPorLetra: Record<string, string> = {};
  let total = 0;
  for (const t of (turnos ?? []) as any[]) {
    const dec = t.decision_tomada;
    if (!dec || dec.evento_id !== eventoId || !dec.opcion) continue;
    const letra = dec.opcion.letra ?? "?";
    porLetra[letra] = (porLetra[letra] ?? 0) + 1;
    if (!textosPorLetra[letra]) textosPorLetra[letra] = dec.opcion.texto ?? "";
    total++;
  }

  return { totalRespondieron: total, porLetra, textosPorLetra };
}
