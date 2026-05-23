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
  | "insumo"
  | "suministro"
  | "empaque"
  | "mano_obra";

export interface CostoDirecto {
  id: string;
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

export interface Financiamiento {
  porcentajePropio: number; // 0..1
  porcentajePrestamo: number; // 0..1
  tasaInteresAnual: number; // 0..1
  plazoMeses: number;
  costoOportunidadAccionista: number; // Koa, 0..1
}

export interface Proyecto {
  id: string;
  estudiante_id: string;
  curso_id: string | null;

  // Datos generales
  nombre: string;
  ubicacion: string;
  descripcion: string;
  sector: Sector;

  // Inversiones (cada categoría es una lista)
  inversiones: Record<CategoriaInversion, ItemInversion[]>;
  capitalTrabajo: number;

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

  // Crecimiento proyectado
  crecimientoIngresosAnual: number; // 0..1
  crecimientoCostosAnual: number; // 0..1

  // Metadatos
  estado: EstadoProyecto;
  creado_en: string;
  actualizado_en: string;
}
