import { supabase } from "./supabase";

export type FrecuenciaCurso = "mensual" | "trimestral" | "semestral";
export type EstadoCurso = "activo" | "cerrado" | "archivado";

/**
 * Modo de simulación del curso:
 *  - automatico       — el sistema sortea eventos aleatorios según probabilidad (default)
 *  - docente_dispara  — el docente lanza cada evento manualmente desde su panel
 *  - curado           — el docente preselecciona los eventos que se van a aplicar
 */
export type ModoSimulacion = "automatico" | "docente_dispara" | "curado";

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
  modo_simulacion?: ModoSimulacion;
  eventos_curados?: string[] | null;
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

/**
 * Wrap defensivo: si una promise no resuelve en `ms` lanza error.
 * Sirve para no dejar al usuario con el botón "Cargando..." infinito
 * si Supabase no responde por red caída o sesión caducada.
 */
function conTimeout<T>(promise: PromiseLike<T>, ms: number, motivo: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const id = setTimeout(() => {
      reject(new Error(`Tiempo agotado: ${motivo} (>${ms / 1000}s). Revisa tu conexión o recarga la página.`));
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

export async function crearCurso(params: {
  docente_id: string;
  nombre: string;
  materia: string;
  paralelo?: string;
  frecuencia_turnos: FrecuenciaCurso;
  duracion_anios?: number;
  modo_simulacion?: ModoSimulacion;
  eventos_curados?: string[];
}): Promise<Curso> {
  // Reintentar si el código colisiona (muy improbable pero por las dudas)
  for (let intento = 0; intento < 5; intento++) {
    const codigo = generarCodigoCurso();
    const { data, error } = await conTimeout(
      supabase
        .from("cursos")
        .insert({
          docente_id: params.docente_id,
          nombre: params.nombre,
          materia: params.materia,
          paralelo: params.paralelo ?? null,
          frecuencia_turnos: params.frecuencia_turnos,
          duracion_anios: params.duracion_anios ?? 5,
          modo_simulacion: params.modo_simulacion ?? "automatico",
          eventos_curados: params.eventos_curados ?? null,
          codigo,
        })
        .select()
        .single(),
      15000,
      "creando curso"
    );
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

// ============================================================================
// RANKING DEL CURSO (FASE 8 — completa)
// ============================================================================
export interface FilaRanking {
  estudiante_id: string;
  nombre_completo: string;
  universidad: string | null;
  tiene_proyecto: boolean;
  nombre_proyecto: string | null;
  estado_proyecto: string | null;
  // Simulación
  tiene_simulacion: boolean;
  turno_actual: number;
  turnos_totales: number;
  estado_simulacion: "activa" | "finalizada" | "quebrada" | null;
  caja: number;
  utilidad_acumulada: number;
  ingresos_acumulados: number;
  reputacion: number;
}

/**
 * Devuelve el ranking de estudiantes de un curso, con su proyecto y simulación
 * actual. Por defecto ordenado por utilidad acumulada (desc).
 */
export async function obtenerRankingCurso(cursoId: string): Promise<FilaRanking[]> {
  // 1. Inscritos
  const inscritos = await listarInscritosDeCurso(cursoId);
  if (inscritos.length === 0) return [];

  const estudianteIds = inscritos.map((i) => i.estudiante_id);

  // 2. Proyectos de esos estudiantes para este curso (o sin curso)
  const { data: proyectos, error: errProyectos } = await supabase
    .from("proyectos")
    .select("id, estudiante_id, nombre, estado")
    .in("estudiante_id", estudianteIds);
  if (errProyectos) throw errProyectos;

  // 3. Simulaciones (la más reciente por estudiante)
  const proyectoIds = (proyectos ?? []).map((p: any) => p.id);
  let simulaciones: any[] = [];
  if (proyectoIds.length > 0) {
    const { data, error } = await supabase
      .from("simulaciones")
      .select("proyecto_id, turno_actual, turnos_totales, estado, estado_actual, iniciada_en")
      .in("proyecto_id", proyectoIds)
      .order("iniciada_en", { ascending: false });
    if (error) throw error;
    simulaciones = data ?? [];
  }

  // 4. Armar el ranking
  const ranking: FilaRanking[] = inscritos.map((insc) => {
    const proyecto = (proyectos ?? []).find((p: any) => p.estudiante_id === insc.estudiante_id);
    const simulacion = proyecto
      ? simulaciones.find((s: any) => s.proyecto_id === proyecto.id)
      : null;
    const estado = simulacion?.estado_actual ?? {};
    return {
      estudiante_id: insc.estudiante_id,
      nombre_completo: `${insc.nombre} ${insc.apellido}`.trim(),
      universidad: insc.universidad,
      tiene_proyecto: !!proyecto,
      nombre_proyecto: proyecto?.nombre ?? null,
      estado_proyecto: proyecto?.estado ?? null,
      tiene_simulacion: !!simulacion,
      turno_actual: simulacion?.turno_actual ?? 0,
      turnos_totales: simulacion?.turnos_totales ?? 0,
      estado_simulacion: simulacion?.estado ?? null,
      caja: estado.caja ?? 0,
      utilidad_acumulada: estado.utilidad_acumulada ?? 0,
      ingresos_acumulados: estado.ingresos_acumulados ?? 0,
      reputacion: estado.reputacion ?? 0,
    };
  });

  // Ordenar: primero los que tienen simulación, después por utilidad acumulada
  ranking.sort((a, b) => {
    if (a.tiene_simulacion !== b.tiene_simulacion) {
      return a.tiene_simulacion ? -1 : 1;
    }
    return b.utilidad_acumulada - a.utilidad_acumulada;
  });

  return ranking;
}

// ============================================================================
// EXPORTAR RANKING A CSV (compatible con Excel)
// ============================================================================
export function rankingACSV(
  curso: Pick<Curso, "nombre" | "codigo" | "materia">,
  ranking: FilaRanking[]
): string {
  // BOM para que Excel reconozca UTF-8
  const bom = "﻿";
  const cabecera = [
    "Puesto",
    "Estudiante",
    "Universidad",
    "Proyecto",
    "Turno",
    "Turnos totales",
    "Estado simulación",
    "Caja (Bs)",
    "Ingresos acum. (Bs)",
    "Utilidad acum. (Bs)",
    "Reputación (%)",
  ];
  const filas = ranking.map((f, idx) => [
    idx + 1,
    `"${f.nombre_completo}"`,
    `"${f.universidad ?? ""}"`,
    `"${f.nombre_proyecto ?? ""}"`,
    f.turno_actual,
    f.turnos_totales,
    f.estado_simulacion ?? "sin iniciar",
    f.caja.toFixed(2),
    f.ingresos_acumulados.toFixed(2),
    f.utilidad_acumulada.toFixed(2),
    (f.reputacion * 100).toFixed(0),
  ]);
  const titulo = `"${curso.nombre} - ${curso.materia} (cód. ${curso.codigo})"`;
  const fecha = `"Exportado: ${new Date().toLocaleString("es-BO")}"`;
  const lineas = [titulo, fecha, "", cabecera.join(","), ...filas.map((r) => r.join(","))];
  return bom + lineas.join("\n");
}

// ============================================================================
// DETALLE DE PROYECTO DE UN ESTUDIANTE (para vista del docente)
// ============================================================================
export interface DetalleProyectoEstudiante {
  proyecto: {
    id: string;
    nombre: string;
    datos: any; // Proyecto JSONB completo
  };
  simulacion: any | null;
  historial: any[];
}

export async function obtenerDetalleProyectoEstudiante(
  cursoId: string,
  estudianteId: string
): Promise<DetalleProyectoEstudiante | null> {
  // 1. Proyecto del estudiante en este curso
  const { data: proyecto, error: e1 } = await supabase
    .from("proyectos")
    .select("id, nombre, datos")
    .eq("estudiante_id", estudianteId)
    .eq("curso_id", cursoId)
    .maybeSingle();
  if (e1 || !proyecto) return null;

  // 2. Simulación activa o última
  const { data: simulacion } = await supabase
    .from("simulaciones")
    .select("*")
    .eq("proyecto_id", proyecto.id)
    .order("iniciada_en", { ascending: false })
    .limit(1)
    .maybeSingle();

  // 3. Historial de decisiones (si hay simulación)
  let historial: any[] = [];
  if (simulacion) {
    const { data } = await supabase
      .from("turnos_historial")
      .select("numero_turno, eventos_aplicados, decision_tomada, estado_despues")
      .eq("simulacion_id", simulacion.id)
      .order("numero_turno");
    historial = data ?? [];
  }

  return { proyecto, simulacion, historial };
}

export function descargarCSV(contenido: string, nombreArchivo: string) {
  const blob = new Blob([contenido], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombreArchivo;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
