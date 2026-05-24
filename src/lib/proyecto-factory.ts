import type { Producto, Proyecto } from "@/types/proyecto";

/**
 * Migra un producto antiguo al shape actual.
 * - cantidadAnio1 → cantidades[5]
 * - precioVenta único → precios[5]
 */
export function migrarProducto(prod: any): Producto {
  const cantidades: [number, number, number, number, number] =
    Array.isArray(prod.cantidades) && prod.cantidades.length === 5
      ? prod.cantidades
      : (() => {
          const base = Number(prod.cantidadAnio1 ?? 0);
          return [base, base, base, base, base];
        })();
  const precios: [number, number, number, number, number] =
    Array.isArray(prod.precios) && prod.precios.length === 5
      ? prod.precios
      : (() => {
          const base = Number(prod.precioVenta ?? 0);
          return [base, base, base, base, base];
        })();
  return {
    id: prod.id,
    nombre: prod.nombre,
    unidadMedida: prod.unidadMedida,
    cantidades,
    precios,
    precioVenta: prod.precioVenta,
  };
}

/**
 * Genera un ID único. Usa crypto.randomUUID si está disponible (browsers
 * modernos y Node 19+); fallback a timestamp + random para entornos viejos.
 */
export function nuevoId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Crea un proyecto vacío con valores por defecto razonables para el contexto
 * boliviano. No persiste — la persistencia es responsabilidad del caller.
 */
export function crearProyectoVacio(params: {
  id?: string;
  estudiante_id: string;
  curso_id?: string | null;
  nombre: string;
}): Proyecto {
  const ahora = new Date().toISOString();
  return {
    id: params.id ?? nuevoId(),
    estudiante_id: params.estudiante_id,
    curso_id: params.curso_id ?? null,
    nombre: params.nombre,
    ubicacion: "",
    descripcion: "",
    sector: "produccion",
    inversiones: {
      terreno: [],
      obrasCiviles: [],
      maquinaria: [],
      mobiliario: [],
      activoDiferido: [],
    },
    capitalTrabajo: 0,
    mesesBufferCapitalTrabajo: 3,
    personal: [],
    costosDirectos: [],
    costosAdministracion: [],
    costosComercializacion: [],
    imprevistosPorcentaje: 0.05, // sugerencia inicial: 5%
    productos: [],
    financiamiento: {
      // Préstamo de ACTIVO FIJO (campos raíz)
      porcentajePropio: 1,
      porcentajePrestamo: 0,
      tasaInteresAnual: 0.12, // sugerencia inicial: 12% anual
      plazoMeses: 60, // 5 años (típico activo fijo PYME Bolivia)
      costoOportunidadAccionista: 0.15, // Koa sugerido: 15%
      // Préstamo de CAPITAL DE TRABAJO (separado)
      prestamoCapitalTrabajo: {
        porcentajePropio: 1,
        porcentajePrestamo: 0,
        tasaInteresAnual: 0.10, // sugerencia inicial: 10% anual (más barato que activo)
        plazoMeses: 60, // 5 años
      },
    },
    crecimientoIngresosAnual: 0.05,
    crecimientoCostosAnual: 0.03,
    tasasCrecCantidad: [0, 0, 0, 0],
    tasasCrecPrecio: [0, 0, 0, 0],
    estado: "construyendo",
    creado_en: ahora,
    actualizado_en: ahora,
  };
}
