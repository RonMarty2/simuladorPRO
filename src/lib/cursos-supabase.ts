import { supabase } from "./supabase";
import { normalizarUniversidad } from "./utils";

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
  /** Universidad a la que pertenece el curso (la define el docente al crearlo). */
  universidad?: string | null;
  modo_simulacion?: ModoSimulacion;
  eventos_curados?: string[] | null;
  /** Peso (0..1) del promedio individual en la nota final. Default 0.5. */
  peso_individual?: number;
  /** Peso (0..1) de la nota grupal en la nota final. Default 0.5. */
  peso_grupal?: number;
  /** Si TRUE, el estudiante puede crear su propio proyecto individual en el curso. */
  permite_proyecto_libre?: boolean;
  /** Config del proyecto grupal del curso. */
  grupo_habilitado?: boolean;
  grupo_cupo_max?: number;
  grupo_modelo?: string;
  grupo_version?: string;
  grupo_consigna?: string | null;
  creado_en: string;
}

/** Guarda la configuración del proyecto grupal del curso (lo define el docente). */
export async function actualizarConfigGrupal(
  cursoId: string,
  cfg: {
    grupo_habilitado: boolean;
    grupo_cupo_max: number;
    grupo_modelo: string;
    grupo_version: string;
    grupo_consigna: string | null;
  }
): Promise<void> {
  const { error } = await conTimeout(
    supabase.from("cursos").update(cfg).eq("id", cursoId),
    10000,
    "guardando la configuración del proyecto grupal"
  );
  if (error) throw error;
}

/** Habilita/deshabilita que los estudiantes creen su propio proyecto en el curso. */
export async function actualizarPermiteProyectoLibre(
  cursoId: string,
  permite: boolean
): Promise<void> {
  const { error } = await conTimeout(
    supabase.from("cursos").update({ permite_proyecto_libre: permite }).eq("id", cursoId),
    10000,
    "guardando la opción de proyecto del estudiante"
  );
  if (error) throw error;
}

/** Actualiza los pesos de ponderación de la nota final del curso. */
export async function actualizarPesosCurso(
  cursoId: string,
  pesoIndividual: number,
  pesoGrupal: number
): Promise<void> {
  const { error } = await conTimeout(
    supabase
      .from("cursos")
      .update({ peso_individual: pesoIndividual, peso_grupal: pesoGrupal })
      .eq("id", cursoId),
    10000,
    "guardando ponderación del curso"
  );
  if (error) throw error;
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
  const hacerQuery = () =>
    supabase
      .from("cursos")
      .select("*")
      .eq("docente_id", docenteId)
      .order("creado_en", { ascending: false });

  let resp;
  try {
    resp = await conTimeout(hacerQuery(), 5000, "listando tus cursos");
  } catch (primerError) {
    try {
      resp = await conTimeout(hacerQuery(), 10000, "listando tus cursos (reintento)");
    } catch {
      throw primerError;
    }
  }

  const { data, error } = resp;
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
  universidad?: string;
  frecuencia_turnos: FrecuenciaCurso;
  duracion_anios?: number;
  modo_simulacion?: ModoSimulacion;
  eventos_curados?: string[];
  permite_proyecto_libre?: boolean;
}): Promise<Curso> {
  const universidad = normalizarUniversidad(params.universidad);
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
          universidad,
          frecuencia_turnos: params.frecuencia_turnos,
          duracion_anios: params.duracion_anios ?? 5,
          modo_simulacion: params.modo_simulacion ?? "automatico",
          eventos_curados: params.eventos_curados ?? null,
          permite_proyecto_libre: params.permite_proyecto_libre ?? true,
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

/**
 * Borra un curso del docente. DESTRUCTIVO: por las reglas ON DELETE CASCADE de
 * la base, también se eliminan las inscripciones, los proyectos y las entregas
 * asociadas a ese curso. La política RLS `cursos_docente_propio` garantiza que
 * un docente solo puede borrar sus propios cursos.
 */
export async function eliminarCurso(cursoId: string): Promise<void> {
  const { error } = await conTimeout(
    supabase.from("cursos").delete().eq("id", cursoId),
    15000,
    "borrando curso"
  );
  if (error) throw error;
}

export async function buscarCursoPorCodigo(codigo: string): Promise<Curso | null> {
  const hacerQuery = () =>
    supabase
      .from("cursos")
      .select("*")
      .eq("codigo", codigo.toUpperCase())
      .eq("estado", "activo")
      .maybeSingle();

  let resp;
  try {
    resp = await conTimeout(hacerQuery(), 5000, "buscando curso por código");
  } catch (primerError) {
    try {
      resp = await conTimeout(hacerQuery(), 10000, "buscando curso por código (reintento)");
    } catch {
      throw primerError;
    }
  }
  const { data, error } = resp;
  if (error) throw error;
  return (data as Curso | null) ?? null;
}

export async function inscribirseACurso(params: {
  curso_id: string;
  estudiante_id: string;
}): Promise<void> {
  const { error } = await conTimeout(
    supabase.from("inscripciones").insert({
      curso_id: params.curso_id,
      estudiante_id: params.estudiante_id,
    }),
    10000,
    "inscribiéndote al curso"
  );
  if (error) throw error;
}

export async function listarMisInscripciones(estudianteId: string): Promise<
  Array<{ curso: Curso; inscrito_en: string }>
> {
  const hacerQuery = () =>
    supabase
      .from("inscripciones")
      .select("inscrito_en, curso_id")
      .eq("estudiante_id", estudianteId);

  let resp;
  try {
    resp = await conTimeout(hacerQuery(), 5000, "listando tus inscripciones");
  } catch (primerError) {
    try {
      resp = await conTimeout(hacerQuery(), 10000, "listando tus inscripciones (reintento)");
    } catch {
      throw primerError;
    }
  }
  const { data: inscripciones, error } = resp;
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
  /** Última edición del proyecto del estudiante (o null si no tiene proyecto). */
  ultima_actividad_en: string | null;
  /** Fecha de inscripción al curso (fallback cuando no hay actividad de proyecto). */
  inscrito_en: string;
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

  // 2. Proyectos de esos estudiantes. Traemos actualizado_en para mostrar
  // "última actividad" en el ranking.
  const { data: proyectos, error: errProyectos } = await supabase
    .from("proyectos")
    .select("id, estudiante_id, nombre, estado, actualizado_en")
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
      ultima_actividad_en: proyecto?.actualizado_en ?? null,
      inscrito_en: insc.inscrito_en,
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
