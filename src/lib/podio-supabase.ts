import { supabase } from "./supabase";

/**
 * Podio del curso (FASE 18):
 *  - Top 3 individuales por promedio de notas de entregas.
 *  - Top 3 grupos por nota grupal asignada por el docente.
 *  - Tu posición (si sos estudiante).
 *  - Tu racha (entregas consecutivas SIN reprobar).
 *
 * Se calcula en una sola función para minimizar round-trips.
 * Devuelve {topIndividuales: [], topGrupales: [], miRacha: 0, ...} si el curso
 * todavía no tiene suficientes datos; el componente decide si mostrar o no.
 */

export interface FilaPodio {
  estudiante_id: string;
  nombre: string;
  apellido: string;
  iniciales: string;
  nota: number;
  etapas_revisadas: number;
}

export interface FilaPodioGrupo {
  grupo_id: string;
  nombre: string;
  iniciales: string;
  nota: number;
  integrantes: number;
  es_mi_grupo: boolean;
}

export interface MiPosicion {
  puesto: number;
  nota: number;
  total: number;
  /** Puntos para entrar al top 5 (null si ya está en el top 5). */
  para_top5: number | null;
}

export interface MiGrupoPosicion {
  grupo_id: string;
  nombre: string;
  puesto: number;
  nota: number;
  total: number;
  integrantes: number;
  /** Puntos para llegar al 1.° (null si ya es 1.°). */
  para_oro: number | null;
}

export interface PodioCurso {
  topIndividuales: FilaPodio[];
  miPosicion: MiPosicion | null;
  totalEstudiantesCalificados: number;

  topGrupales: FilaPodioGrupo[];
  miGrupo: MiGrupoPosicion | null;
  totalGruposCalificados: number;

  /** Entregas consecutivas SIN reprobar (0 si no aplica). */
  miRacha: number;
}

function iniciales(nombre: string, apellido: string): string {
  const a = (nombre ?? "").trim()[0] ?? "";
  const b = (apellido ?? "").trim()[0] ?? "";
  return (a + b).toUpperCase() || "??";
}

/** Iniciales de un nombre de grupo (primeras letras de las palabras, max 2). */
function inicialesGrupo(nombre: string): string {
  const palabras = (nombre ?? "").trim().split(/\s+/).filter(Boolean);
  if (palabras.length === 0) return "??";
  if (palabras.length === 1) return palabras[0].slice(0, 2).toUpperCase();
  return (palabras[0][0] + palabras[1][0]).toUpperCase();
}

export async function obtenerPodioCurso(
  cursoId: string,
  miEstudianteId: string | null
): Promise<PodioCurso> {
  // 1. Promedios individuales del curso (solo los que tienen nota)
  const { data: promedios, error: e1 } = await supabase
    .from("promedio_estudiante")
    .select("estudiante_id, promedio_nota, entregas_revisadas")
    .eq("curso_id", cursoId)
    .not("promedio_nota", "is", null)
    .order("promedio_nota", { ascending: false });
  if (e1) throw e1;

  const filasPromedio = (promedios ?? []) as Array<{
    estudiante_id: string;
    promedio_nota: number;
    entregas_revisadas: number;
  }>;

  // 2. Perfiles de esos estudiantes (1 query)
  const estudianteIds = filasPromedio.map((p) => p.estudiante_id);
  const mapaPerfiles: Record<string, { nombre: string; apellido: string }> = {};
  if (estudianteIds.length > 0) {
    const { data: perfiles, error: e2 } = await supabase
      .from("perfiles")
      .select("id, nombre, apellido")
      .in("id", estudianteIds);
    if (e2) throw e2;
    for (const p of perfiles ?? []) {
      mapaPerfiles[(p as any).id] = {
        nombre: (p as any).nombre ?? "",
        apellido: (p as any).apellido ?? "",
      };
    }
  }

  // 3. Grupos del curso con nota
  const { data: grupos, error: e3 } = await supabase
    .from("grupos")
    .select("id, nombre, nota")
    .eq("curso_id", cursoId)
    .not("nota", "is", null)
    .order("nota", { ascending: false });
  if (e3) throw e3;

  const filasGrupos = (grupos ?? []) as Array<{
    id: string;
    nombre: string;
    nota: number;
  }>;

  // 4. Miembros de TODOS los grupos (con o sin nota) — necesario para saber
  //    cuál es mi grupo y contar integrantes de los del podio.
  const { data: todosGrupos } = await supabase
    .from("grupos")
    .select("id")
    .eq("curso_id", cursoId);
  const todosGrupoIds = (todosGrupos ?? []).map((g: any) => g.id);

  const mapaIntegrantes: Record<string, number> = {};
  let miGrupoId: string | null = null;
  if (todosGrupoIds.length > 0) {
    const { data: miembros, error: e4 } = await supabase
      .from("grupo_miembros")
      .select("grupo_id, estudiante_id")
      .in("grupo_id", todosGrupoIds);
    if (e4) throw e4;
    for (const m of (miembros ?? []) as any[]) {
      mapaIntegrantes[m.grupo_id] = (mapaIntegrantes[m.grupo_id] ?? 0) + 1;
      if (miEstudianteId && m.estudiante_id === miEstudianteId) {
        miGrupoId = m.grupo_id;
      }
    }
  }

  // 5. Racha del estudiante (si está logueado y es estudiante)
  let miRacha = 0;
  if (miEstudianteId) {
    const { data: misEntregas } = await supabase
      .from("entregas")
      .select("estado, nota, entregado_en")
      .eq("estudiante_id", miEstudianteId)
      .eq("curso_id", cursoId)
      .order("entregado_en", { ascending: false })
      .limit(15);
    for (const e of (misEntregas ?? []) as any[]) {
      if (e.estado === "pendiente") continue; // se ignora, no rompe ni suma
      if (e.estado === "reprobada") break;
      miRacha++;
    }
  }

  // ===== ARMAR RESULTADOS =====

  const topIndividuales: FilaPodio[] = filasPromedio.slice(0, 3).map((p) => {
    const perfil = mapaPerfiles[p.estudiante_id];
    const nombre = perfil?.nombre ?? "";
    const apellido = perfil?.apellido ?? "";
    return {
      estudiante_id: p.estudiante_id,
      nombre,
      apellido,
      iniciales: iniciales(nombre, apellido),
      nota: Number(p.promedio_nota),
      etapas_revisadas: Number(p.entregas_revisadas),
    };
  });

  let miPosicion: MiPosicion | null = null;
  if (miEstudianteId) {
    const idx = filasPromedio.findIndex((p) => p.estudiante_id === miEstudianteId);
    if (idx >= 0) {
      const miNota = Number(filasPromedio[idx].promedio_nota);
      const top5 = filasPromedio.slice(0, 5);
      const notaTop5 = top5.length === 5 ? Number(top5[4].promedio_nota) : null;
      const enTop5 = idx < 5;
      miPosicion = {
        puesto: idx + 1,
        nota: miNota,
        total: filasPromedio.length,
        para_top5: enTop5 || notaTop5 === null ? null : Math.max(0, notaTop5 - miNota),
      };
    }
  }

  const topGrupales: FilaPodioGrupo[] = filasGrupos.slice(0, 3).map((g) => ({
    grupo_id: g.id,
    nombre: g.nombre,
    iniciales: inicialesGrupo(g.nombre),
    nota: Number(g.nota),
    integrantes: mapaIntegrantes[g.id] ?? 0,
    es_mi_grupo: !!miGrupoId && miGrupoId === g.id,
  }));

  let miGrupo: MiGrupoPosicion | null = null;
  if (miGrupoId) {
    const idx = filasGrupos.findIndex((g) => g.id === miGrupoId);
    if (idx >= 0) {
      const g = filasGrupos[idx];
      const oro = filasGrupos.length > 0 ? Number(filasGrupos[0].nota) : 0;
      const miNota = Number(g.nota);
      miGrupo = {
        grupo_id: g.id,
        nombre: g.nombre,
        puesto: idx + 1,
        nota: miNota,
        total: filasGrupos.length,
        integrantes: mapaIntegrantes[g.id] ?? 0,
        para_oro: idx === 0 ? null : Math.max(0, oro - miNota),
      };
    }
  }

  return {
    topIndividuales,
    miPosicion,
    totalEstudiantesCalificados: filasPromedio.length,
    topGrupales,
    miGrupo,
    totalGruposCalificados: filasGrupos.length,
    miRacha,
  };
}
