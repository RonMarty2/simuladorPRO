/**
 * Tipos del dominio de un proyecto de inversión.
 *
 * Un Proyecto se serializa completo a JSONB en la tabla `proyectos.datos`.
 * Solo los campos `id`, `estudiante_id`, `curso_id`, `nombre`, `estado` y
 * `creado_en` viven como columnas SQL; el resto va dentro del JSONB.
 */

export type Sector =
  | "produccion"
  | "comercio"
  | "servicios"
  | "agricultura"
  | "mixto";

export type EstadoProyecto =
  | "construyendo"
  | "completo"
  | "simulando"
  | "finalizado";

export type CategoriaInversion =
  | "terreno"
  | "obrasCiviles"
  | "maquinaria"
  | "mobiliario"
  | "activoDiferido";

export interface ItemInversion {
  id: string;
  descripcion: string;
  unidadMedida: string;
  cantidad: number;
  costoUnitario: number;
  costoTotal: number;
  vidaUtilAnios: number | null; // null = no se deprecia (terreno)
  depreciacionAnual: number;
  valorResidual: number;
}

export interface PuestoTrabajo {
  id: string;
  puesto: string;
  cantidad: number;
  sueldoMensual: number;
}

export type CategoriaCostoDirecto =
  // Legacy / Producción
  | "insumo"
  | "suministro"
  | "empaque"
  | "mano_obra"
  // Producción adicional
  | "materia_prima"
  // Comercio
  | "mercaderia"
  | "comision_venta"
  // Servicios
  | "insumo_directo"
  // Agricultura
  | "semilla"
  | "fertilizante"
  | "riego_combustible"
  | "mano_obra_agricola"
  // Catch-all
  | "otro";

export interface CostoDirecto {
  id: string;
  /**
   * Producto al que pertenece este costo directo (cantidadPorUnidad se aplica
   * por cada unidad DE ESTE PRODUCTO producida). Si es null/undefined, el
   * costo es legado y aplica genéricamente a la suma de unidades.
   */
  productoId?: string | null;
  categoria: CategoriaCostoDirecto;
  descripcion: string;
  unidadMedida: string;
  cantidadPorUnidad: number;
  costoUnitario: number;
}

export interface CostoGeneral {
  id: string;
  descripcion: string;
  unidadMedida: "mes" | "año";
  cantidad: number;
  costoUnitario: number;
}

export interface Producto {
  id: string;
  nombre: string;
  unidadMedida: string;
  /** Cantidad proyectada para cada uno de los 5 años. cantidades[0] = año 1. */
  cantidades: [number, number, number, number, number];
  /** Precio de venta para cada año. precios[0] = año 1. */
  precios: [number, number, number, number, number];
  /** @deprecated reemplazado por `precios` (un valor por año). Se mantiene solo para datos legados. */
  precioVenta?: number;
}

/**
 * Configuración de un préstamo independiente. Tasas típicas en Bolivia:
 *   - Préstamo de activo fijo: 10-14% anual, plazo 5-10 años.
 *   - Préstamo de capital de trabajo: 8-12% anual, plazo 3-5 años.
 */
export interface PrestamoConfig {
  porcentajePropio: number; // 0..1
  porcentajePrestamo: number; // 0..1
  tasaInteresAnual: number; // 0..1
  plazoMeses: number;
}

/**
 * Financiamiento del proyecto. Los campos raíz (porcentajePropio,
 * porcentajePrestamo, tasaInteresAnual, plazoMeses) representan el
 * préstamo para ACTIVO FIJO (compatibilidad con proyectos antiguos).
 *
 * `prestamoCapitalTrabajo` es opcional — si no existe, se asume que NO hay
 * préstamo bancario para el capital operativo (todo aporte propio).
 */
export interface Financiamiento {
  porcentajePropio: number; // 0..1 — % propio del préstamo de ACTIVO FIJO
  porcentajePrestamo: number; // 0..1 — % financiado del préstamo de ACTIVO FIJO
  tasaInteresAnual: number; // 0..1 — tasa anual del préstamo de ACTIVO FIJO
  plazoMeses: number; // plazo del préstamo de ACTIVO FIJO
  costoOportunidadAccionista: number; // Koa, 0..1

  /** Configuración opcional del préstamo para CAPITAL DE TRABAJO. */
  prestamoCapitalTrabajo?: PrestamoConfig;
}

export type TipoProyecto =
  | "libre"
  | "caso_curso"
  | "entrega_estudiante"
  | "proyecto_grupal";

/**
 * Versión del modelo de indicadores del proyecto.
 *  - 'v1' (default): indicadores clásicos (VAN, TIR, Payback, IR, TRC, SD, RBC, WACC).
 *  - 'v2': v1 + análisis avanzado (punto de equilibrio, payback descontado,
 *    sensibilidad, apalancamiento y flujo del inversionista).
 *
 * Es opcional: los proyectos sin el campo se tratan como 'v1', por lo que
 * nada de lo existente cambia de comportamiento.
 */
export type VersionProyecto = "v1" | "v2";

export interface Proyecto {
  id: string;
  estudiante_id: string;
  curso_id: string | null;

  /** Si está seteado, este proyecto es el proyecto COMPARTIDO de ese grupo. */
  grupo_id?: string | null;

  /** Versión de indicadores. Ausente o 'v1' = comportamiento clásico. */
  version?: VersionProyecto;

  /**
   * Modelo de cómo entra el ingreso. Ausente o 'unidades' = clásico
   * (productos con cantidad × precio). Los demás derivan los `productos` de
   * sus parámetros propios, sin tocar el motor de flujo.
   *  - 'suscripcion'      base de suscriptores recurrentes (altas/churn).
   *  - 'publicidad'       audiencia × CPM.
   *  - 'costo_beneficio'  no vende; se evalúa por el beneficio incremental.
   */
  modeloIngreso?: "unidades" | "suscripcion" | "publicidad" | "costo_beneficio";

  /** Parámetros del modelo de suscripción (solo si modeloIngreso='suscripcion'). */
  suscripcionV2?: {
    suscriptoresIniciales: number;
    altasMensuales: number;
    churnMensual: number;
    cuotaMensual: number;
  };

  /** Parámetros del modelo de publicidad (solo si modeloIngreso='publicidad'). */
  publicidadV2?: {
    audienciaMensual: number;
    crecimientoMensual: number;
    impresionesPorUsuario: number;
    cpm: number;
  };

  /** Parámetros de costo-beneficio (solo si modeloIngreso='costo_beneficio'). */
  costoBeneficioV2?: {
    beneficioAnualBase: number;
    crecimientoAnual: number;
  };

  /**
   * Tipo del proyecto:
   *  - 'libre'              proyecto creado libremente por un estudiante
   *  - 'caso_curso'         plantilla creada por el docente (no se simula)
   *  - 'entrega_estudiante' copia de un caso_curso que un estudiante trabaja
   */
  tipo?: TipoProyecto;

  /**
   * Si tipo='entrega_estudiante', apunta al proyecto 'caso_curso' del docente.
   * Si tipo='caso_curso' o 'libre', es null.
   */
  caso_origen_id?: string | null;

  /**
   * Desde qué paso (1..9) debe empezar a completar el estudiante.
   * Pasos anteriores llegan con los datos del docente; pasos >= a este número
   * llegan vacíos.
   * Solo aplica si tipo='caso_curso' (se hereda al clonar a 'entrega_estudiante').
   */
  paso_inicio_estudiante?: number | null;

  // Datos generales
  nombre: string;
  ubicacion: string;
  descripcion: string;
  sector: Sector;

  // Inversiones (cada categoría es una lista)
  inversiones: Record<CategoriaInversion, ItemInversion[]>;
  capitalTrabajo: number; // valor derivado (se persiste para uso del Paso 7 y del flujo de caja)

  /**
   * Meses de buffer del capital de trabajo (cuánto tiempo el negocio puede
   * operar sin generar ingresos). Default 3 meses. Este es el ÚNICO input
   * editable del Paso 8; `capitalTrabajo` se deriva de aquí.
   */
  mesesBufferCapitalTrabajo?: number;

  // Personal
  personal: PuestoTrabajo[];

  // Costos
  costosDirectos: CostoDirecto[];
  costosAdministracion: CostoGeneral[];
  costosComercializacion: CostoGeneral[];
  imprevistosPorcentaje: number; // 0..1

  // Ingresos
  productos: Producto[];

  // Financiamiento
  financiamiento: Financiamiento;

  // Crecimiento proyectado (legacy — tasa global única)
  crecimientoIngresosAnual: number; // 0..1
  crecimientoCostosAnual: number; // 0..1

  // Tasas de crecimiento por año (aplican a TODOS los productos por igual)
  // 4 valores en % — del año 1 al 2, 2 al 3, 3 al 4, 4 al 5
  tasasCrecCantidad?: [number, number, number, number];
  tasasCrecPrecio?: [number, number, number, number];

  /**
   * Override opcional de las tasas de aportes patronales (Bolivia).
   * Si se deja vacío, se usan las tasas vigentes de la Ley General del
   * Trabajo 2025 (riesgo prof 1.71%, salud 10%, vivienda 2%,
   * aguinaldo 8.33%, indemnización 8.33% → total 30.37%).
   *
   * Valores en proporción decimal (0.1071 = 10.71%).
   */
  aportesPatronalesOverride?: {
    riesgoProfesional?: number;
    seguroSalud?: number;
    provisionVivienda?: number;
    previsionAguinaldo?: number;
    previsionIndemnizacion?: number;
  };

  /**
   * Parámetros del CAPM para calcular el costo del capital propio (Ke).
   * Solo se usa en proyectos V2. Si está presente, el Koa
   * (costoOportunidadAccionista) se deriva de aquí: Ke = Rf + β·(Rm − Rf).
   * Valores en decimal (0.04 = 4%).
   */
  capmV2?: {
    tasaLibreRiesgo: number;
    beta: number;
    primaMercado: number;
  };

  // Metadatos
  estado: EstadoProyecto;
  creado_en: string;
  actualizado_en: string;
}

// ============================================================================
// ENTREGAS (revisiones del docente sobre el trabajo de los estudiantes)
// ============================================================================

export type EstadoEntrega = "pendiente" | "aprobada" | "reprobada";
export type SugerenciaAutomatica = "aprobar" | "reprobar" | "duda";

export interface Entrega {
  id: string;
  proyecto_id: string;
  estudiante_id: string;
  curso_id: string;
  numero_intento: number;
  /** Paso (1..9) que se entrega. NULL = entrega del proyecto entero (legacy). */
  paso_entregado?: number | null;
  /** Perfil del estudiante que entregó (cargado en el panel docente). */
  perfil?: { nombre: string; apellido: string; email: string } | null;
  estado: EstadoEntrega;

  /** Snapshot completo del proyecto al momento de entregar */
  snapshot_datos: Proyecto;

  /** Indicadores calculados al momento de entregar (cache para listas) */
  van: number | null;
  tir: number | null;
  wacc: number | null;
  payback: number | null;

  /** Sugerencia automática del sistema (basada en VAN, TIR, etc) */
  sugerencia_automatica: SugerenciaAutomatica | null;
  sugerencia_nota: number | null; // 0..100
  sugerencia_razones: string[] | null;

  /** Decisión del docente (null hasta que revisa) */
  nota: number | null;
  comentario_docente: string | null;

  entregado_en: string;
  revisado_en: string | null;
}

export interface PromedioEstudiante {
  estudiante_id: string;
  curso_id: string;
  entregas_revisadas: number;
  entregas_pendientes: number;
  promedio_nota: number | null;
  mejor_nota: number | null;
  peor_nota: number | null;
  ultima_entrega_en: string | null;
}
