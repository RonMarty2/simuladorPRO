import { supabase } from "./supabase";
import { insertarProyecto, proyectoAFilaSupabase } from "./proyecto-supabase";
import { crearProyectoVacio, type ModeloIngreso } from "./proyecto-factory";
import { obtenerNivelSemanaE, type NivelSemanaE } from "./semana-e";
import type { Proyecto, VersionProyecto } from "@/types/proyecto";

export interface Grupo {
  id: string;
  curso_id: string;
  nombre: string;
  cupo_max: number;
  proyecto_id: string | null;
  nota: number | null;
  comentario_docente: string | null;
  revisado_en: string | null;
  creado_en: string;
}

export interface MiembroGrupo {
  estudiante_id: string;
  nombre: string;
  apellido: string;
  email: string;
}

export interface GrupoConMiembros extends Grupo {
  miembros: MiembroGrupo[];
  nivel_semana_e: NivelSemanaE | null;
}

function conTimeout<T>(promise: PromiseLike<T>, ms: number, motivo: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const id = setTimeout(
      () => reject(new Error(`Tiempo agotado: ${motivo} (>${ms / 1000}s).`)),
      ms
    );
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

/**
 * Un ESTUDIANTE crea un grupo y se vuelve el primer integrante. El formato del
 * proyecto (modelo + versión + cupo) lo definió el docente en el curso.
 * Los cursos normales conservan el flujo histórico. Solo Semana E usa una RPC
 * transaccional para evitar los falsos rechazos RLS observados en el evento.
 */
export async function crearGrupoEstudiante(params: {
  cursoId: string;
  creadorId: string;
  nombre: string;
  cupoMax: number;
  esSemanaE: boolean;
  nivelSemanaE?: NivelSemanaE;
  version: VersionProyecto;
  modeloIngreso: ModeloIngreso;
}): Promise<void> {
  const proyecto: Proyecto = crearProyectoVacio({
    estudiante_id: params.creadorId,
    nombre: `${params.nombre} · proyecto grupal`,
    curso_id: params.cursoId,
    version: params.version,
    nivelSemanaE: params.esSemanaE ? params.nivelSemanaE : undefined,
    modeloIngreso: params.modeloIngreso,
  });
  proyecto.tipo = "proyecto_grupal";

  // Los cursos normales mantienen el flujo histórico sin ningún cambio.
  if (!params.esSemanaE) {
    const { data: grupo, error: errorGrupo } = await conTimeout(
      supabase
        .from("grupos")
        .insert({
          curso_id: params.cursoId,
          nombre: params.nombre,
          cupo_max: params.cupoMax,
        })
        .select()
        .single(),
      15000,
      "creando el grupo"
    );
    if (errorGrupo) throw errorGrupo;
    const grupoId = (grupo as Grupo).id;

    proyecto.grupo_id = grupoId;
    await insertarProyecto(proyecto);

    const { error: errorMiembro } = await supabase
      .from("grupo_miembros")
      .insert({ grupo_id: grupoId, estudiante_id: params.creadorId });
    if (errorMiembro) throw errorMiembro;
    return;
  }

  // Semana E usa una única transacción para resistir los falsos rechazos RLS
  // observados en el evento, sin alterar proyectos o cursos convencionales.
  // Forzamos una renovación justo antes de la RPC: después de una recarga de
  // la PWA el store podía mostrar el perfil mientras PostgREST aún enviaba la
  // llamada con el rol anon, haciendo que auth.uid() llegara como NULL.
  const { data: sesionRenovada, error: errorSesion } =
    await supabase.auth.refreshSession();
  if (errorSesion || !sesionRenovada.session?.user) {
    throw new Error("Tu sesión no terminó de activarse. Salí, vuelve a ingresar con Google e inténtalo otra vez.");
  }

  const filaProyecto = proyectoAFilaSupabase(proyecto);

  const { error } = await conTimeout(
    supabase.rpc("crear_grupo_estudiante_atomico", {
      p_curso_id: params.cursoId,
      p_nombre_grupo: params.nombre,
      p_proyecto_id: proyecto.id,
      p_proyecto_nombre: proyecto.nombre,
      p_proyecto_datos: filaProyecto.datos,
    }),
    15000,
    "creando el grupo"
  );
  if (error) throw error;
}

/** Lista los grupos de un curso con integrantes y el id de su proyecto. */
export async function listarGruposDeCurso(cursoId: string): Promise<GrupoConMiembros[]> {
  const { data: grupos, error } = await conTimeout(
    supabase.from("grupos").select("*").eq("curso_id", cursoId).order("creado_en"),
    10000,
    "listando grupos"
  );
  if (error) throw error;
  if (!grupos || grupos.length === 0) return [];

  const ids = grupos.map((g: any) => g.id);
  const [{ data: miembros, error: e2 }, { data: proys, error: e3 }] = await Promise.all([
    supabase
      .from("grupo_miembros")
      .select("grupo_id, estudiante_id, perfiles(nombre, apellido, email)")
      .in("grupo_id", ids),
    supabase.from("proyectos").select("id, grupo_id, datos").in("grupo_id", ids),
  ]);
  if (e2) throw e2;
  if (e3) throw e3;

  return (grupos as Grupo[]).map((g) => ({
    ...g,
    // El proyecto del grupo se resuelve por grupo_id (más confiable que proyecto_id).
    proyecto_id: (proys ?? []).find((p: any) => p.grupo_id === g.id)?.id ?? g.proyecto_id ?? null,
    nivel_semana_e: obtenerNivelSemanaE(
      (proys ?? []).find((p: any) => p.grupo_id === g.id)?.datos?.nivelSemanaE
    ),
    miembros: (miembros ?? [])
      .filter((m: any) => m.grupo_id === g.id)
      .map((m: any) => ({
        estudiante_id: m.estudiante_id,
        nombre: m.perfiles?.nombre ?? "",
        apellido: m.perfiles?.apellido ?? "",
        email: m.perfiles?.email ?? "",
      })),
  }));
}

/** Define la ruta pedagógica de un proyecto Semana E ya creado. */
export async function configurarNivelProyectoSemanaE(
  proyectoId: string,
  nivel: NivelSemanaE,
  version: VersionProyecto
): Promise<void> {
  const { data, error: errorLectura } = await supabase
    .from("proyectos")
    .select("datos")
    .eq("id", proyectoId)
    .single();
  if (errorLectura) throw errorLectura;

  const datosActuales = (data?.datos as Record<string, unknown> | null) ?? {};
  const { error } = await supabase
    .from("proyectos")
    .update({ datos: { ...datosActuales, nivelSemanaE: nivel, version } })
    .eq("id", proyectoId);
  if (error) throw error;
}

/** Lista los grupos de un curso para el estudiante (con conteo de cupo). */
export async function listarGruposParaEstudiante(
  cursoId: string
): Promise<GrupoConMiembros[]> {
  // Misma data; las RLS ya limitan lo que el estudiante puede ver.
  return listarGruposDeCurso(cursoId);
}

/** El grupo al que pertenece el estudiante en un curso (o null). */
export async function obtenerMiGrupo(
  estudianteId: string,
  cursoId: string
): Promise<Grupo | null> {
  const { data: filas, error } = await supabase
    .from("grupo_miembros")
    .select("grupo_id, grupos!inner(*)")
    .eq("estudiante_id", estudianteId)
    .eq("grupos.curso_id", cursoId);
  if (error) throw error;
  const fila = (filas ?? [])[0] as any;
  return fila ? (fila.grupos as Grupo) : null;
}

/**
 * El estudiante se une a un grupo. Valida cupo y que no esté ya en otro grupo
 * del mismo curso (ambas validaciones a nivel app; el race es despreciable en
 * un aula).
 */
export async function unirseAGrupo(grupoId: string, estudianteId: string): Promise<void> {
  // Grupo destino (para conocer curso y cupo)
  const { data: grupo, error: eg } = await supabase
    .from("grupos")
    .select("id, curso_id, cupo_max")
    .eq("id", grupoId)
    .single();
  if (eg) throw eg;

  // ¿Ya está en un grupo de este curso?
  const yaTengo = await obtenerMiGrupo(estudianteId, (grupo as any).curso_id);
  if (yaTengo) {
    if (yaTengo.id === grupoId) return; // ya está en este grupo
    throw new Error("Ya estás en otro grupo de este curso. Salí de ese grupo primero.");
  }

  // ¿Hay cupo?
  const { count, error: ec } = await supabase
    .from("grupo_miembros")
    .select("id", { count: "exact", head: true })
    .eq("grupo_id", grupoId);
  if (ec) throw ec;
  if ((count ?? 0) >= (grupo as any).cupo_max) {
    throw new Error("Ese grupo ya está lleno.");
  }

  const { error } = await supabase
    .from("grupo_miembros")
    .insert({ grupo_id: grupoId, estudiante_id: estudianteId });
  if (error) throw error;
}

/** El estudiante sale de un grupo. */
export async function salirDeGrupo(grupoId: string, estudianteId: string): Promise<void> {
  const { error } = await supabase
    .from("grupo_miembros")
    .delete()
    .eq("grupo_id", grupoId)
    .eq("estudiante_id", estudianteId);
  if (error) throw error;
}

/** El docente borra un grupo (cascada: borra miembros y el proyecto compartido). */
export async function eliminarGrupo(grupoId: string): Promise<void> {
  const { error } = await conTimeout(
    supabase.from("grupos").delete().eq("id", grupoId),
    15000,
    "borrando el grupo"
  );
  if (error) throw error;
}

/** El docente califica el proyecto grupal (nota 0..100 + comentario). */
export async function calificarGrupo(
  grupoId: string,
  nota: number,
  comentario: string
): Promise<void> {
  const { error } = await supabase
    .from("grupos")
    .update({
      nota,
      comentario_docente: comentario,
      revisado_en: new Date().toISOString(),
    })
    .eq("id", grupoId);
  if (error) throw error;
}
