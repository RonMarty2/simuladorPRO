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

  // Metadatos
  estado: EstadoProyecto;
  creado_en: string;
  actualizado_en: string;
}
