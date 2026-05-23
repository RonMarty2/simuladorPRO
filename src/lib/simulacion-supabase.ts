import { supabase } from "./supabase";
import type { EstadoSimulacion, Frecuencia, Simulacion, TurnoHistorial } from "@/types/simulacion";

export async function crearSimulacion(params: {
  proyecto_id: string;
  turnos_totales: number;
  frecuencia: Frecuencia;
  estado_inicial: EstadoSimulacion;
}): Promise<Simulacion> {
  const { data, error } = await supabase
    .from("simulaciones")
    .insert({
      proyecto_id: params.proyecto_id,
      turnos_totales: params.turnos_totales,
      frecuencia: params.frecuencia,
      estado_actual: params.estado_inicial,
      estado: "activa",
      turno_actual: 0,
    })
    .select()
    .single();
  if (error) throw error;
  return data as Simulacion;
}

export async function obtenerSimulacionActiva(proyecto_id: string): Promise<Simulacion | null> {
  const { data, error } = await supabase
    .from("simulaciones")
    .select("*")
    .eq("proyecto_id", proyecto_id)
    .eq("estado", "activa")
    .order("iniciada_en", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return (data as Simulacion | null) ?? null;
}

export async function actualizarSimulacion(
  id: string,
  cambios: Partial<Pick<Simulacion, "turno_actual" | "estado" | "estado_actual" | "finalizada_en">>
): Promise<void> {
  const { error } = await supabase.from("simulaciones").update(cambios).eq("id", id);
  if (error) throw error;
}

export async function registrarTurno(turno: Omit<TurnoHistorial, "id" | "procesado_en">): Promise<void> {
  const { error } = await supabase.from("turnos_historial").insert({
    simulacion_id: turno.simulacion_id,
    numero_turno: turno.numero_turno,
    estado_antes: turno.estado_antes,
    eventos_aplicados: turno.eventos_aplicados,
    decision_tomada: turno.decision_tomada,
    estado_despues: turno.estado_despues,
  });
  if (error) throw error;
}

export async function obtenerHistorial(simulacion_id: string): Promise<TurnoHistorial[]> {
  const { data, error } = await supabase
    .from("turnos_historial")
    .select("*")
    .eq("simulacion_id", simulacion_id)
    .order("numero_turno");
  if (error) throw error;
  return (data ?? []) as TurnoHistorial[];
}
