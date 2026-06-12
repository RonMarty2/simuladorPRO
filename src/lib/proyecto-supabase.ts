import { supabase } from "./supabase";
import type {
  Entrega,
  EstadoEntrega,
  PromedioEstudiante,
  Proyecto,
  SugerenciaAutomatica,
} from "@/types/proyecto";

/**
 * Divide un Proyecto en columnas SQL + JSONB para guardarlo en la tabla
 * `proyectos`. Los campos del dominio que no son metadatos (inversiones,
 * costos, productos, etc.) van comprimidos en `datos`.
 */
function aFilaSupabase(p: Proyecto) {
  const {
    id,
    estudiante_id,
    curso_id,
    grupo_id,
    nombre,
    estado,
    tipo,
    caso_origen_id,
    paso_inicio_estudiante,
    creado_en,
    actualizado_en,
    ...resto
  } = p;
  return {
    id,
    estudiante_id,
    curso_id,
    grupo_id: grupo_id ?? null,
    nombre,
    estado,
    tipo: tipo ?? "libre",
    caso_origen_id: caso_origen_id ?? null,
    paso_inicio_estudiante: paso_inicio_estudiante ?? null,
    datos: { ...resto, creado_en, actualizado_en },
  };
}

function deFilaSupabase(fila: any): Proyecto {
  return {
    ...(fila.datos ?? {}),
    id: fila.id,
    estudiante_id: fila.estudiante_id,
    curso_id: fila.curso_id,
    grupo_id: fila.grupo_id ?? null,
    nombre: fila.nombre,
    estado: fila.estado,
    tipo: fila.tipo ?? "libre",
    caso_origen_id: fila.caso_origen_id ?? null,
    paso_inicio_estudiante: fila.paso_inicio_estudiante ?? null,
    creado_en: fila.datos?.creado_en ?? fila.creado_en,
    actualizado_en: fila.datos?.actualizado_en ?? fila.actualizado_en,
  } as Proyecto;
}

/**
 * Wrap defensivo: si la promesa no resuelve en `ms`, lanza error claro.
 * Evita pantallas de "Cargando..." infinitas cuando Supabase no responde
 * por red caída, sesión caducada, o problema de RLS.
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

/**
 * Lista los proyectos del estudiante autenticado, más reciente primero.
 *
 * Implementa retry automático: si la primera query se cuelga (problema
 * conocido cuando se navega a /construir antes de que el cliente
 * Supabase termine de sincronizar la sesión), reintenta una vez con un
 * timeout más largo. Esto evita que el usuario tenga que apretar F5
 * manualmente.
 */
export async function listarMisProyectos(estudianteId: string): Promise<Proyecto[]> {
  const hacerQuery = () =>
    supabase
      .from("proyectos")
      .select("*")
      .eq("estudiante_id", estudianteId)
      .order("actualizado_en", { ascending: false });

  let resp;
  try {
    resp = await conTimeout(hacerQuery(), 5000, "listando tus proyectos");
  } catch (primerError) {
    // Reintento con timeout más generoso
    try {
      resp = await conTimeout(hacerQuery(), 10000, "listando tus proyectos (reintento)");
    } catch {
      // Si el reintento también falla, propagar el primer error (más descriptivo)
      throw primerError;
    }
  }

  const { data, error } = resp;
  if (error) throw error;
  return (data ?? []).map(deFilaSupabase);
}

/**
 * Lista los proyectos GRUPALES que el estudiante puede editar (uno por cada
 * grupo al que pertenece). El proyecto compartido es propiedad del docente, por
 * eso no aparece en `listarMisProyectos`; las RLS de miembro permiten leerlo.
 */
export async function listarProyectosGrupales(estudianteId: string): Promise<Proyecto[]> {
  const { data: mm, error: e1 } = await supabase
    .from("grupo_miembros")
    .select("grupo_id")
    .eq("estudiante_id", estudianteId);
  if (e1) throw e1;
  const gids = (mm ?? []).map((m: any) => m.grupo_id);
  if (gids.length === 0) return [];
  const { data, error } = await supabase.from("proyectos").select("*").in("grupo_id", gids);
  if (error) throw error;
  return (data ?? []).map(deFilaSupabase);
}

/** Upsert: inserta si no existe, actualiza si ya existe. */
export async function guardarProyecto(p: Proyecto): Promise<void> {
  const fila = aFilaSupabase(p);
  // El proyecto GRUPAL lo crea el docente (insertarProyecto). Los miembros solo
  // tienen permiso de UPDATE (no INSERT), así que para no romper su autoguardado
  // acá siempre EDITAMOS (update), nunca upsert.
  if (p.tipo === "proyecto_grupal") {
    const { error } = await supabase.from("proyectos").update(fila).eq("id", p.id);
    if (error) throw error;
    return;
  }
  const { error } = await supabase.from("proyectos").upsert(fila, { onConflict: "id" });
  if (error) throw error;
}

/** Inserta un proyecto nuevo (usado al crear el proyecto compartido de un grupo). */
export async function insertarProyecto(p: Proyecto): Promise<void> {
  const fila = aFilaSupabase(p);
  const { error } = await supabase.from("proyectos").insert(fila);
  if (error) throw error;
}

/** Elimina un proyecto (cascada borra simulaciones/turnos asociados en FASE 6). */
export async function eliminarProyecto(id: string): Promise<void> {
  const { error } = await supabase.from("proyectos").delete().eq("id", id);
  if (error) throw error;
}

// ============================================================================
// CASOS DEL CURSO (plantillas creadas por el docente)
// ============================================================================

/**
 * Convierte un proyecto del docente en un CASO DEL CURSO.
 * El proyecto queda marcado como tipo='caso_curso' y se asocia al curso.
 * `pasoInicioEstudiante` (1..9) define desde qué paso debe trabajar el alumno.
 */
export async function guardarComoCasoDelCurso(
  proyectoId: string,
  cursoId: string,
  pasoInicioEstudiante: number
): Promise<void> {
  const { error } = await supabase
    .from("proyectos")
    .update({
      tipo: "caso_curso",
      curso_id: cursoId,
      paso_inicio_estudiante: pasoInicioEstudiante,
    })
    .eq("id", proyectoId);
  if (error) throw error;
}

/**
 * Publica una PLANTILLA de la galería como caso del curso. La plantilla es un
 * Proyecto en memoria (no persiste); esta función lo "instancia" en la base
 * marcado como tipo='caso_curso' del docente, asociado al curso elegido. Cada
 * llamada inserta un caso NUEVO con ids frescos (la plantilla regenera todos
 * los ids al construirse), así el docente puede publicarla varias veces sin
 * colisiones.
 */
export async function publicarPlantillaComoCaso(params: {
  plantilla: Proyecto;
  docenteId: string;
  cursoId: string;
  pasoInicioEstudiante: number;
  nombre?: string;
}): Promise<Proyecto> {
  const ahora = new Date().toISOString();
  const proy: Proyecto = {
    ...params.plantilla,
    estudiante_id: params.docenteId,
    curso_id: params.cursoId,
    grupo_id: null,
    tipo: "caso_curso",
    paso_inicio_estudiante: params.pasoInicioEstudiante,
    estado: "completo",
    nombre: params.nombre ?? params.plantilla.nombre,
    creado_en: ahora,
    actualizado_en: ahora,
  };
  await insertarProyecto(proy);
  return proy;
}

/** Lista los casos del curso disponibles (creados por el docente del curso). */
export async function listarCasosDelCurso(cursoId: string): Promise<Proyecto[]> {
  const { data, error } = await conTimeout(
    supabase
      .from("proyectos")
      .select("*")
      .eq("curso_id", cursoId)
      .eq("tipo", "caso_curso")
      .order("actualizado_en", { ascending: false }),
    10000,
    "listando casos del curso"
  );
  if (error) throw error;
  return (data ?? []).map(deFilaSupabase);
}

/**
 * Un estudiante toma un caso del curso → se le crea un proyecto nuevo
 * "entrega_estudiante" que es copia del caso, pero con los pasos posteriores
 * a `paso_inicio_estudiante` VACIADOS para que el estudiante los complete.
 *
 * Devuelve el proyecto nuevo del estudiante.
 */
export async function tomarCasoDelCurso(
  casoId: string,
  estudianteId: string
): Promise<Proyecto> {
  // 1. Cargar el caso original
  const { data: casoFila, error: errCargar } = await supabase
    .from("proyectos")
    .select("*")
    .eq("id", casoId)
    .single();
  if (errCargar) throw errCargar;
  const caso = deFilaSupabase(casoFila);

  if (caso.tipo !== "caso_curso") {
    throw new Error("Ese proyecto no es un caso del curso.");
  }

  // 2. Generar la copia para el estudiante
  const pasoInicio = caso.paso_inicio_estudiante ?? 1;
  const datosVacios = vaciarPasosDesde(caso, pasoInicio);

  const ahora = new Date().toISOString();
  const copia: Proyecto = {
    ...datosVacios,
    id: crypto.randomUUID(),
    estudiante_id: estudianteId,
    curso_id: caso.curso_id,
    nombre: `${caso.nombre} — entrega`,
    estado: "construyendo",
    tipo: "entrega_estudiante",
    caso_origen_id: caso.id,
    paso_inicio_estudiante: pasoInicio,
    creado_en: ahora,
    actualizado_en: ahora,
  };

  // 3. Guardar
  await guardarProyecto(copia);
  return copia;
}

/**
 * Vacía los pasos del proyecto desde `pasoInicio` en adelante.
 * Conserva los datos de los pasos anteriores (que vienen del docente).
 *
 * Mapeo paso → campos del proyecto:
 *  Paso 1: nombre, ubicacion, descripcion, sector
 *  Paso 2: productos (cantidades, precios), tasasCrec*
 *  Paso 3: inversiones
 *  Paso 4: personal, aportesPatronalesOverride
 *  Paso 5: costosDirectos
 *  Paso 6: costosAdministracion, costosComercializacion, imprevistosPorcentaje
 *  Paso 7: financiamiento
 *  Paso 8: capitalTrabajo, mesesBufferCapitalTrabajo
 *  Paso 9: derivado, no se vacía
 */
export function vaciarPasosDesde(caso: Proyecto, pasoInicio: number): Proyecto {
  const out: Proyecto = { ...caso };

  if (pasoInicio <= 1) {
    out.ubicacion = "";
    out.descripcion = "";
  }
  if (pasoInicio <= 2) {
    out.productos = [];
    out.tasasCrecCantidad = [0, 0, 0, 0];
    out.tasasCrecPrecio = [0, 0, 0, 0];
  }
  if (pasoInicio <= 3) {
    out.inversiones = {
      terreno: [],
      obrasCiviles: [],
      maquinaria: [],
      mobiliario: [],
      activoDiferido: [],
    };
  }
  if (pasoInicio <= 4) {
    out.personal = [];
    out.aportesPatronalesOverride = undefined;
  }
  if (pasoInicio <= 5) {
    out.costosDirectos = [];
  }
  if (pasoInicio <= 6) {
    out.costosAdministracion = [];
    out.costosComercializacion = [];
    out.imprevistosPorcentaje = 0.05;
  }
  if (pasoInicio <= 7) {
    out.financiamiento = {
      porcentajePropio: 1,
      porcentajePrestamo: 0,
      tasaInteresAnual: 0.12,
      plazoMeses: 60,
      costoOportunidadAccionista: 0.15,
      prestamoCapitalTrabajo: {
        porcentajePropio: 1,
        porcentajePrestamo: 0,
        tasaInteresAnual: 0.1,
        plazoMeses: 60,
      },
    };
  }
  if (pasoInicio <= 8) {
    out.capitalTrabajo = 0;
    out.mesesBufferCapitalTrabajo = 3;
  }
  return out;
}

// ============================================================================
// ENTREGAS (historial de revisiones)
// ============================================================================

export interface IndicadoresEntrega {
  van: number;
  tir: number;
  wacc: number;
  payback: number;
}

/**
 * El estudiante "entrega" su proyecto para revisión del docente.
 * Crea una fila en `entregas` con un snapshot del JSONB y los indicadores
 * actuales. El número de intento se autoincrementa por proyecto.
 *
 * Devuelve la entrega creada (con la sugerencia automática ya calculada).
 */
export async function entregarProyecto(
  proyecto: Proyecto,
  indicadores: IndicadoresEntrega,
  referencia: { van: number; tir: number; wacc: number; payback: number } | null,
  pasoEntregado: number | null = null,
  /** ID del estudiante que ENTREGA. En proyectos grupales no es lo mismo que
   *  `proyecto.estudiante_id` (ese es el creador del grupo). El RLS exige
   *  `estudiante_id = auth.uid()`, así que el llamador pasa SU id. */
  estudianteIdSubmitter?: string
): Promise<Entrega> {
  if (!proyecto.curso_id) {
    throw new Error("El proyecto no está asociado a un curso. No se puede entregar.");
  }

  // 1. Calcular el próximo número de intento para este (proyecto, paso).
  // Cada paso tiene su propia secuencia de intentos. Para proyectos grupales,
  // los intentos son COMPARTIDOS entre todos los miembros (filtramos por
  // proyecto_id, no por estudiante_id).
  let q = supabase
    .from("entregas")
    .select("numero_intento")
    .eq("proyecto_id", proyecto.id)
    .order("numero_intento", { ascending: false })
    .limit(1);
  q = pasoEntregado == null ? q.is("paso_entregado", null) : q.eq("paso_entregado", pasoEntregado);
  const { data: maxIntento } = await q.maybeSingle();
  const proximoIntento = (maxIntento?.numero_intento ?? 0) + 1;

  // 2. Calcular sugerencia automática
  const sugerencia = obtenerSugerenciaAutomatica(indicadores, referencia);

  // 3. Insertar. `estudiante_id` debe ser el del usuario que ENTREGA (RLS lo
  // exige). En proyectos grupales eso es el miembro que sube, no el creador
  // del grupo. Si no se pasó, caemos al dueño (libre/entrega_estudiante).
  const filaEntrega = {
    proyecto_id: proyecto.id,
    estudiante_id: estudianteIdSubmitter ?? proyecto.estudiante_id,
    curso_id: proyecto.curso_id,
    numero_intento: proximoIntento,
    paso_entregado: pasoEntregado,
    estado: "pendiente" as EstadoEntrega,
    snapshot_datos: proyecto,
    van: indicadores.van,
    tir: indicadores.tir,
    wacc: indicadores.wacc,
    payback: indicadores.payback,
    sugerencia_automatica: sugerencia.sugerencia,
    sugerencia_nota: sugerencia.nota,
    sugerencia_razones: sugerencia.razones,
  };

  const { data, error } = await supabase
    .from("entregas")
    .insert(filaEntrega)
    .select()
    .single();
  if (error) throw error;
  return data as Entrega;
}

/** Lista las entregas de un estudiante (su propio historial). */
export async function listarMisEntregas(estudianteId: string): Promise<Entrega[]> {
  const { data, error } = await supabase
    .from("entregas")
    .select("*")
    .eq("estudiante_id", estudianteId)
    .order("entregado_en", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Entrega[];
}

/** Lista las entregas PENDIENTES de un curso (para el docente). */
export async function listarEntregasPendientes(cursoId: string): Promise<Entrega[]> {
  const { data, error } = await supabase
    .from("entregas")
    .select("*")
    .eq("curso_id", cursoId)
    .eq("estado", "pendiente")
    .order("entregado_en", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Entrega[];
}

/** Lista TODAS las entregas de un curso (revisadas + pendientes), con el
 * perfil (nombre/apellido/email) del estudiante que entregó para mostrar nombres
 * reales en el panel del docente. */
export async function listarEntregasDelCurso(cursoId: string): Promise<Entrega[]> {
  const { data, error } = await supabase
    .from("entregas")
    .select("*, perfiles:estudiante_id(nombre, apellido, email)")
    .eq("curso_id", cursoId)
    .order("entregado_en", { ascending: false });
  if (error) throw error;
  // Aplanamos el perfil en un campo `perfil` para usarlo en el UI.
  return (data ?? []).map((row: any) => ({
    ...row,
    perfil: row.perfiles
      ? {
          nombre: row.perfiles.nombre,
          apellido: row.perfiles.apellido,
          email: row.perfiles.email,
        }
      : null,
  })) as Entrega[];
}

/** El docente revisa una entrega: pone nota, comentario y estado. */
export async function revisarEntrega(
  entregaId: string,
  estado: "aprobada" | "reprobada",
  nota: number,
  comentario: string
): Promise<void> {
  const { error } = await supabase
    .from("entregas")
    .update({
      estado,
      nota,
      comentario_docente: comentario,
      revisado_en: new Date().toISOString(),
    })
    .eq("id", entregaId);
  if (error) throw error;
}

/** Obtiene el promedio acumulado del estudiante en un curso (de la vista SQL). */
export async function obtenerPromedioEstudiante(
  estudianteId: string,
  cursoId: string
): Promise<PromedioEstudiante | null> {
  const { data, error } = await supabase
    .from("promedio_estudiante")
    .select("*")
    .eq("estudiante_id", estudianteId)
    .eq("curso_id", cursoId)
    .maybeSingle();
  if (error) throw error;
  return (data as PromedioEstudiante) ?? null;
}

// ============================================================================
// SUGERENCIA AUTOMÁTICA (función pura — sin Supabase)
// ============================================================================

const TOLERANCIA = 0.15; // ±15% por defecto

/**
 * Compara los indicadores del estudiante contra el caso del docente y sugiere
 * aprobar/reprobar/duda con una nota tentativa.
 *
 * Reglas duras (descartan aprobación):
 *   - VAN < 0 → reprobar (no importa lo demás)
 *   - TIR < WACC → reprobar
 *
 * Reglas blandas (descuentan nota):
 *   - Cada indicador (VAN, TIR, Payback) fuera de ±TOLERANCIA descuenta puntos
 *   - Nota = 100 × (1 − promedio_de_desvíos_normalizados)
 *
 * Si no hay referencia (la primera vez o si el docente no marcó caso), solo
 * aplica las reglas duras y da una nota base de 70 si pasan.
 */
export function obtenerSugerenciaAutomatica(
  estudiante: IndicadoresEntrega,
  referencia: { van: number; tir: number; wacc: number; payback: number } | null
): {
  sugerencia: SugerenciaAutomatica;
  nota: number;
  razones: string[];
} {
  const razones: string[] = [];

  // ── Reglas duras ─────────────────────────────────────────────────────────
  if (estudiante.van <= 0) {
    razones.push(`VAN negativo (${estudiante.van.toFixed(0)}): el proyecto destruye valor`);
    return { sugerencia: "reprobar", nota: 30, razones };
  }
  if (estudiante.tir <= estudiante.wacc) {
    razones.push(
      `TIR (${(estudiante.tir * 100).toFixed(1)}%) ≤ WACC (${(estudiante.wacc * 100).toFixed(
        1
      )}%): proyecto no rentable`
    );
    return { sugerencia: "reprobar", nota: 40, razones };
  }

  // Si no hay referencia: aprobar con nota base
  if (!referencia) {
    razones.push("VAN > 0 y TIR > WACC. No hay caso de referencia para comparar.");
    return { sugerencia: "aprobar", nota: 70, razones };
  }

  // ── Reglas blandas: comparar contra referencia ───────────────────────────
  const desviacionRel = (estu: number, ref: number) => {
    if (Math.abs(ref) < 0.0001) return 0;
    return Math.abs((estu - ref) / ref);
  };

  const desvVan = desviacionRel(estudiante.van, referencia.van);
  const desvTir = desviacionRel(estudiante.tir, referencia.tir);
  const desvPayback = desviacionRel(estudiante.payback, referencia.payback);

  const dentro = (d: number) => d <= TOLERANCIA;
  const okVan = dentro(desvVan);
  const okTir = dentro(desvTir);
  const okPayback = dentro(desvPayback);

  razones.push(
    `VAN: ${okVan ? "✓" : "✗"} desvío ${(desvVan * 100).toFixed(1)}% vs referencia (tol. ${(
      TOLERANCIA * 100
    ).toFixed(0)}%)`
  );
  razones.push(
    `TIR: ${okTir ? "✓" : "✗"} desvío ${(desvTir * 100).toFixed(1)}% vs referencia`
  );
  razones.push(
    `Payback: ${okPayback ? "✓" : "✗"} desvío ${(desvPayback * 100).toFixed(1)}% vs referencia`
  );

  const desvioPromedio = (desvVan + desvTir + desvPayback) / 3;
  const notaBruta = 100 * (1 - Math.min(1, desvioPromedio));
  const nota = Math.round(Math.max(0, Math.min(100, notaBruta)));

  let sugerencia: SugerenciaAutomatica;
  if (okVan && okTir && okPayback) {
    sugerencia = "aprobar";
  } else if (!okVan || !okTir) {
    sugerencia = "duda";
  } else {
    sugerencia = "aprobar";
  }

  return { sugerencia, nota, razones };
}
