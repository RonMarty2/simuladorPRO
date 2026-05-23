import { supabase } from "./supabase";
import type { Evento } from "@/types/evento";

/** Lista todos los eventos activos, ordenados por código. */
export async function listarEventos(): Promise<Evento[]> {
  const { data, error } = await supabase
    .from("eventos")
    .select("*")
    .eq("activo", true)
    .order("codigo");
  if (error) throw error;
  return (data ?? []) as Evento[];
}

/** Lista eventos por categoría. */
export async function listarEventosPorCategoria(categoria: string): Promise<Evento[]> {
  const { data, error } = await supabase
    .from("eventos")
    .select("*")
    .eq("activo", true)
    .eq("categoria", categoria)
    .order("codigo");
  if (error) throw error;
  return (data ?? []) as Evento[];
}
