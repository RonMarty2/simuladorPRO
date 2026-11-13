import type { Proyecto } from "@/types/proyecto";
import { supabase } from "./supabase";
import { esModoLocal } from "./modo-local";
import {
  guardarProyecto,
  listarProyectosGrupales,
  proyectoAFilaSupabase,
} from "./proyecto-supabase";

/**
 * "Pasar a caso grupal": copia el contenido de un caso INDIVIDUAL al proyecto
 * compartido de un grupo, para que los compañeros no tengan que volver a anotar
 * los datos. El caso individual NUNCA se modifica.
 *
 * El proyecto del grupo ya existe (se crea vacío al formar el grupo) y los
 * miembros solo tienen permiso de UPDATE sobre él, por eso la copia reemplaza
 * el contenido del proyecto del grupo en vez de insertar uno nuevo.
 */

/** Estados que, en la copia grupal, vuelven a "completo" (no hay simulación copiada). */
const ESTADOS_AVANZADOS: Proyecto["estado"][] = ["completo", "simulando", "finalizado"];

/**
 * Construye el proyecto grupal resultante: datos del individual + identidad
 * (id, grupo, curso, nombre, dueño) del proyecto del grupo. Función pura.
 */
export function construirCasoGrupal(origen: Proyecto, destino: Proyecto): Proyecto {
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
    nombre: destino.nombre,
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

/** Proyecto compartido del grupo del estudiante en el curso del caso (o null). */
export async function buscarCasoDelGrupo(origen: Proyecto): Promise<Proyecto | null> {
  if (!origen.curso_id) return null;
  const grupales = await listarProyectosGrupales(origen.estudiante_id);
  return (
    grupales.find((g) => g.curso_id === origen.curso_id && g.tipo === "proyecto_grupal") ?? null
  );
}

/** Copia el caso individual al proyecto del grupo y lo guarda. */
export async function pasarCasoAGrupo(origen: Proyecto, destino: Proyecto): Promise<Proyecto> {
  if (origen.id === destino.id) {
    throw new Error("El caso individual y el del grupo son el mismo proyecto.");
  }
  if (origen.curso_id !== destino.curso_id) {
    throw new Error("El grupo es de otro curso.");
  }
  const resultado = construirCasoGrupal(origen, destino);
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
    throw new Error("No se pudo guardar la copia en el caso del grupo. Revisa que sigas siendo parte del grupo.");
  }
  return resultado;
}
