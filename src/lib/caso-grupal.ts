import type { Proyecto, VersionProyecto } from "@/types/proyecto";
import type { Curso } from "./cursos-supabase";
import { crearProyectoVacio, type ModeloIngreso } from "./proyecto-factory";
import { obtenerMiGrupo, unirseAGrupo, type Grupo } from "./grupos-supabase";
import { supabase } from "./supabase";
import { esModoLocal } from "./modo-local";
import {
  guardarProyecto,
  insertarProyecto,
  listarProyectosGrupales,
  proyectoAFilaSupabase,
} from "./proyecto-supabase";

/**
 * "Pasar a caso grupal": copia el contenido de un caso INDIVIDUAL (o libre /
 * caso del curso) al proyecto compartido de un grupo, o crea el grupo con esa
 * copia si el estudiante todavía no tiene grupo en el curso.
 * El caso individual NUNCA se modifica.
 */

/** Estados que, en la copia grupal, vuelven a "completo" (no hay simulación copiada). */
const ESTADOS_AVANZADOS: Proyecto["estado"][] = ["completo", "simulando", "finalizado"];

/** Quita el sufijo " — entrega" que se agrega al tomar un caso del curso. */
export function limpiarNombreCaso(nombre: string): string {
  return (nombre ?? "")
    .replace(/\s*[—–-]\s*entrega\s*$/i, "")
    .trim() || "Proyecto";
}

/** Arma un nombre claro para el proyecto grupal que muestre el grupo y el caso. */
export function nombreProyectoGrupalConCaso(nombreGrupo: string, nombreCaso: string): string {
  const grupoLimpio = nombreGrupo.trim();
  const casoLimpio = limpiarNombreCaso(nombreCaso);
  if (!grupoLimpio) return `${casoLimpio} · proyecto grupal`;
  if (grupoLimpio.toLowerCase() === casoLimpio.toLowerCase()) {
    return `${casoLimpio} · proyecto grupal`;
  }
  return `${grupoLimpio} · ${casoLimpio}`;
}

/**
 * Construye el proyecto grupal resultante: datos del individual + identidad
 * (id, grupo, curso, nombre, dueño) del proyecto del grupo. Función pura.
 */
export function construirCasoGrupal(
  origen: Proyecto,
  destino: Proyecto,
  opciones?: { nombre?: string }
): Proyecto {
  // Copia profunda para que editar el grupal nunca toque objetos del individual.
  const copia: Proyecto = JSON.parse(JSON.stringify(origen));
  const ahora = new Date().toISOString();
  return {
    ...copia,
    // Identidad del proyecto del grupo (no cambia):
    id: destino.id,
    estudiante_id: destino.estudiante_id,
    curso_id: destino.curso_id,
    grupo_id: destino.grupo_id,
    nombre: opciones?.nombre ?? destino.nombre,
    tipo: "proyecto_grupal",
    paso_inicio_estudiante: destino.paso_inicio_estudiante ?? null,
    esSemanaE: destino.esSemanaE,
    nivelSemanaE: destino.nivelSemanaE,
    creado_en: destino.creado_en,
    actualizado_en: ahora,
    // Se conserva el vínculo con el caso del curso, si el individual lo tenía.
    caso_origen_id: origen.caso_origen_id ?? destino.caso_origen_id ?? null,
    // Trazabilidad: de qué caso individual salió esta copia.
    copiadoDeProyectoId: origen.id,
    estado: ESTADOS_AVANZADOS.includes(origen.estado) ? "completo" : "construyendo",
  };
}

/** Proyecto compartido del grupo del estudiante en el curso indicado (o del caso). */
export async function buscarCasoDelGrupo(
  origen: Proyecto,
  cursoIdOverride?: string
): Promise<Proyecto | null> {
  const cursoId = cursoIdOverride ?? origen.curso_id;
  const grupales = await listarProyectosGrupales(origen.estudiante_id);
  if (cursoId) {
    const delCurso = grupales.find(
      (g) => g.curso_id === cursoId && g.tipo === "proyecto_grupal"
    );
    if (delCurso) return delCurso;
  }
  return grupales.find((g) => g.tipo === "proyecto_grupal") ?? null;
}

/** Copia el caso individual al proyecto del grupo y lo guarda. */
export async function pasarCasoAGrupo(
  origen: Proyecto,
  destino: Proyecto,
  opciones?: { nombreGrupo?: string }
): Promise<Proyecto> {
  if (origen.id === destino.id) {
    throw new Error("El caso individual y el del grupo son el mismo proyecto.");
  }
  const baseGrupo =
    opciones?.nombreGrupo ??
    destino.nombre.replace(/\s*·\s*proyecto grupal\s*$/i, "").trim();
  const nuevoNombre = baseGrupo
    ? nombreProyectoGrupalConCaso(baseGrupo, origen.nombre)
    : destino.nombre;

  const resultado = construirCasoGrupal(origen, destino, { nombre: nuevoNombre });
  if (esModoLocal()) {
    await guardarProyecto(resultado);
    return resultado;
  }
  // Update con verificación: si la base filtra la fila (sin permiso) responde sin
  // error y 0 filas; no queremos decirle "Listo" al estudiante en ese caso.
  const { data, error } = await supabase
    .from("proyectos")
    .update(proyectoAFilaSupabase(resultado))
    .eq("id", destino.id)
    .select("id");
  if (error) throw error;
  if (!data || data.length === 0) {
    throw new Error(
      "No se pudo guardar la copia en el caso del grupo. Revisa que sigas siendo parte del grupo."
    );
  }
  return resultado;
}

/**
 * Si el estudiante ya pertenece a un grupo en el curso, busca su proyecto
 * grupal (o lo crea si faltaba) y vuelca ahí todos los datos del caso origen.
 */
export async function pasarCasoAGrupoExistente(params: {
  origen: Proyecto;
  grupo: Grupo;
  estudianteId: string;
}): Promise<Proyecto> {
  const { origen, grupo, estudianteId } = params;
  const grupales = await listarProyectosGrupales(estudianteId);
  const existente =
    grupales.find((g) => g.grupo_id === grupo.id) ??
    grupales.find((g) => g.curso_id === grupo.curso_id && g.tipo === "proyecto_grupal") ??
    null;

  if (existente) {
    return pasarCasoAGrupo(origen, existente, { nombreGrupo: grupo.nombre });
  }

  // Si el grupo existía sin fila en `proyectos`, la creamos ahora con los datos del caso.
  const ahora = new Date().toISOString();
  const baseDestino: Proyecto = {
    ...crearProyectoVacio({
      estudiante_id: estudianteId,
      nombre: nombreProyectoGrupalConCaso(grupo.nombre, origen.nombre),
      curso_id: grupo.curso_id,
      version: origen.version ?? "v2",
      modeloIngreso: (origen.modeloIngreso as ModeloIngreso) ?? "unidades",
    }),
    grupo_id: grupo.id,
    tipo: "proyecto_grupal",
    creado_en: ahora,
    actualizado_en: ahora,
  };
  const nuevo = construirCasoGrupal(origen, baseDestino, {
    nombre: nombreProyectoGrupalConCaso(grupo.nombre, origen.nombre),
  });
  await insertarProyecto(nuevo);
  return nuevo;
}

/**
 * Crea un grupo nuevo en el curso indicado y le carga inmediatamente una copia
 * completa del caso `origen` como proyecto grupal compartido.
 */
export async function crearGrupoConCaso(params: {
  origen: Proyecto;
  curso: Curso;
  estudianteId: string;
  nombreGrupo: string;
}): Promise<Proyecto> {
  const { origen, curso, estudianteId } = params;
  const nombreGrupoLimpio = params.nombreGrupo.trim() || limpiarNombreCaso(origen.nombre);

  // ¿Ya pertenece a un grupo en este curso? Si ya tiene grupo, copiamos ahí directamente.
  const yaTengo = await obtenerMiGrupo(estudianteId, curso.id);
  if (yaTengo) {
    return pasarCasoAGrupoExistente({ origen, grupo: yaTengo, estudianteId });
  }

  const { data: grupoCreado, error: errorGrupo } = await supabase
    .from("grupos")
    .insert({
      curso_id: curso.id,
      nombre: nombreGrupoLimpio,
      cupo_max: curso.grupo_cupo_max ?? 10,
    })
    .select()
    .single();
  if (errorGrupo) throw errorGrupo;
  const grupo = grupoCreado as Grupo;

  const ahora = new Date().toISOString();
  const esqueletoDestino: Proyecto = {
    ...crearProyectoVacio({
      estudiante_id: estudianteId,
      nombre: nombreProyectoGrupalConCaso(nombreGrupoLimpio, origen.nombre),
      curso_id: curso.id,
      version: (origen.version ?? (curso.grupo_version as VersionProyecto) ?? "v2"),
      modeloIngreso:
        (origen.modeloIngreso as ModeloIngreso) ??
        (curso.grupo_modelo as ModeloIngreso) ??
        "unidades",
    }),
    grupo_id: grupo.id,
    tipo: "proyecto_grupal",
    creado_en: ahora,
    actualizado_en: ahora,
  };

  const proyectoGrupal = construirCasoGrupal(origen, esqueletoDestino, {
    nombre: nombreProyectoGrupalConCaso(nombreGrupoLimpio, origen.nombre),
  });

  await insertarProyecto(proyectoGrupal);

  const { error: errorMiembro } = await supabase
    .from("grupo_miembros")
    .insert({ grupo_id: grupo.id, estudiante_id: estudianteId });
  if (errorMiembro) throw errorMiembro;

  return proyectoGrupal;
}

/**
 * Une al estudiante a un grupo existente del curso y copia el caso `origen` al
 * proyecto compartido de ese grupo.
 */
export async function unirseAGrupoYPasarCaso(params: {
  origen: Proyecto;
  grupo: Grupo;
  estudianteId: string;
}): Promise<Proyecto> {
  await unirseAGrupo(params.grupo.id, params.estudianteId);
  return pasarCasoAGrupoExistente(params);
}

/**
 * Garantiza que un grupo tenga su proyecto grupal creado y devuelve su ID.
 * Útil si un grupo quedó creado sin fila en `proyectos`.
 */
export async function asegurarProyectoDeGrupo(params: {
  grupo: Grupo;
  curso: Curso;
  estudianteId: string;
}): Promise<string> {
  const { grupo, curso, estudianteId } = params;
  if (grupo.proyecto_id) return grupo.proyecto_id;
  const grupales = await listarProyectosGrupales(estudianteId);
  const existente = grupales.find((g) => g.grupo_id === grupo.id);
  if (existente) return existente.id;

  const proyecto = crearProyectoVacio({
    estudiante_id: estudianteId,
    nombre: `${grupo.nombre} · proyecto grupal`,
    curso_id: curso.id,
    version: (curso.grupo_version as VersionProyecto) ?? "v2",
    modeloIngreso: (curso.grupo_modelo as ModeloIngreso) ?? "unidades",
  });
  proyecto.tipo = "proyecto_grupal";
  proyecto.grupo_id = grupo.id;
  await insertarProyecto(proyecto);
  return proyecto.id;
}
