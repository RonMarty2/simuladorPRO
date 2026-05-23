import { supabase } from "./supabase";

export type FrecuenciaCurso = "mensual" | "trimestral" | "semestral";
export type EstadoCurso = "activo" | "cerrado" | "archivado";

export interface Curso {
  id: string;
  docente_id: string;
  nombre: string;
  codigo: string;
  materia: string;
  paralelo: string | null;
  frecuencia_turnos: FrecuenciaCurso;
  duracion_anios: number;
  estado: EstadoCurso;
  creado_en: string;
}

export interface InscripcionConPerfil {
  id: string;
  estudiante_id: string;
  inscrito_en: string;
  nombre: string;
  apellido: string;
  email: string;
  universidad: string | null;
}

function generarCodigoCurso(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // sin 0/O/1/I/L
  let out = "";
  for (let i = 0; i < 6; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export async function listarMisCursos(docenteId: string): Promise<Curso[]> {
  const { data, error } = await supabase
    .from("cursos")
    .select("*")
    .eq("docente_id", docenteId)
    .order("creado_en", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Curso[];
}

export async function crearCurso(params: {
  docente_id: string;
  nombre: string;
  materia: string;
  paralelo?: string;
  frecuencia_turnos: FrecuenciaCurso;
  duracion_anios?: number;
}): Promise<Curso> {
  // Reintentar si el código colisiona (muy improbable pero por las dudas)
  for (let intento = 0; intento < 5; intento++) {
    const codigo = generarCodigoCurso();
    const { data, error } = await supabase
      .from("cursos")
      .insert({
        docente_id: params.docente_id,
        nombre: params.nombre,
        materia: params.materia,
        paralelo: params.paralelo ?? null,
        frecuencia_turnos: params.frecuencia_turnos,
        duracion_anios: params.duracion_anios ?? 5,
        codigo,
      })
      .select()
      .single();
    if (!error) return data as Curso;
    if (!error.message.toLowerCase().includes("codigo")) throw error;
  }
  throw new Error("No se pudo generar código único para el curso");
}

export async function buscarCursoPorCodigo(codigo: string): Promise<Curso | null> {
  const { data, error } = await supabase
    .from("cursos")
    .select("*")
    .eq("codigo", codigo.toUpperCase())
    .eq("estado", "activo")
    .maybeSingle();
  if (error) throw error;
  return (data as Curso | null) ?? null;
}

export async function inscribirseACurso(params: {
  curso_id: string;
  estudiante_id: string;
}): Promise<void> {
  const { error } = await supabase.from("inscripciones").insert({
    curso_id: params.curso_id,
    estudiante_id: params.estudiante_id,
  });
  if (error) throw error;
}

export async function listarMisInscripciones(estudianteId: string): Promise<
  Array<{ curso: Curso; inscrito_en: string }>
> {
  const { data: inscripciones, error } = await supabase
    .from("inscripciones")
    .select("inscrito_en, curso_id")
    .eq("estudiante_id", estudianteId);
  if (error) throw error;

  if (!inscripciones || inscripciones.length === 0) return [];

  const cursoIds = inscripciones.map((i) => i.curso_id);
  const { data: cursos, error: errCursos } = await supabase
    .from("cursos")
    .select("*")
    .in("id", cursoIds);
  if (errCursos) throw errCursos;

  return inscripciones.map((i) => ({
    inscrito_en: i.inscrito_en,
    curso: cursos!.find((c) => c.id === i.curso_id) as Curso,
  }));
}

export async function listarInscritosDeCurso(cursoId: string): Promise<InscripcionConPerfil[]> {
  const { data, error } = await supabase
    .from("inscripciones")
    .select("id, estudiante_id, inscrito_en, perfiles(nombre, apellido, email, universidad)")
    .eq("curso_id", cursoId);
  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    id: row.id,
    estudiante_id: row.estudiante_id,
    inscrito_en: row.inscrito_en,
    nombre: row.perfiles?.nombre ?? "",
    apellido: row.perfiles?.apellido ?? "",
    email: row.perfiles?.email ?? "",
    universidad: row.perfiles?.universidad ?? null,
  }));
}
