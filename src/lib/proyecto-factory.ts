import type {
  ItemInversion,
  Producto,
  Proyecto,
  VersionProyecto,
} from "@/types/proyecto";

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
  version?: VersionProyecto;
}): Proyecto {
  const ahora = new Date().toISOString();
  return {
    id: params.id ?? nuevoId(),
    estudiante_id: params.estudiante_id,
    curso_id: params.curso_id ?? null,
    version: params.version ?? "v1",
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

// Helpers para el proyecto de ejemplo --------------------------------------

/** Crea un ItemInversion con sus campos derivados ya calculados. */
function itemInv(
  descripcion: string,
  unidadMedida: string,
  cantidad: number,
  costoUnitario: number,
  vidaUtilAnios: number | null
): ItemInversion {
  const costoTotal = cantidad * costoUnitario;
  return {
    id: nuevoId(),
    descripcion,
    unidadMedida,
    cantidad,
    costoUnitario,
    costoTotal,
    vidaUtilAnios,
    depreciacionAnual: vidaUtilAnios ? costoTotal / vidaUtilAnios : 0,
    // Igual que el resto de la app: al crear (0 años) el residual = costo total.
    valorResidual: costoTotal,
  };
}

/** Proyecta 5 valores aplicando una tasa compuesta y redondeo opcional. */
function serie5(
  base: number,
  tasa: number,
  decimales = 0
): [number, number, number, number, number] {
  const f = Math.pow(10, decimales);
  const out = [0, 1, 2, 3, 4].map(
    (i) => Math.round(base * Math.pow(1 + tasa, i) * f) / f
  );
  return out as [number, number, number, number, number];
}

/**
 * Crea un proyecto de EJEMPLO completamente lleno: una cafetería de
 * especialidad en Cochabamba, en versión V2 (extendida). Sirve para ver todos
 * los indicadores (incluidos los avanzados de V2) funcionando con datos
 * realistas, sin tener que cargar nada a mano. No persiste.
 */
export function crearProyectoEjemploCafeteriaV2(params: {
  estudiante_id: string;
  curso_id?: string | null;
  nombre?: string;
}): Proyecto {
  const ahora = new Date().toISOString();
  const idCafe = nuevoId();
  const idPostre = nuevoId();
  const idSandwich = nuevoId();

  return {
    id: nuevoId(),
    estudiante_id: params.estudiante_id,
    curso_id: params.curso_id ?? null,
    version: "v2",
    tipo: "libre",
    nombre: params.nombre ?? "cafeteriav2",
    ubicacion: "Cochabamba, zona Recoleta",
    descripcion:
      "Cafetería de especialidad: café de origen, postres y almuerzos ligeros. Proyecto de ejemplo en versión extendida (V2).",
    sector: "servicios",

    inversiones: {
      terreno: [],
      obrasCiviles: [
        itemInv("Adecuación y remodelación del local", "obra", 1, 40000, 10),
      ],
      maquinaria: [
        itemInv("Cafetera espresso profesional + molinos", "set", 1, 35000, 8),
        itemInv("Refrigeración y equipos de cocina", "set", 1, 20000, 8),
      ],
      mobiliario: [
        itemInv("Mesas, sillas, barra y decoración", "set", 1, 18000, 10),
      ],
      activoDiferido: [
        itemInv("Licencias, instalación y puesta en marcha", "global", 1, 7000, 5),
      ],
    },
    capitalTrabajo: 90000,
    mesesBufferCapitalTrabajo: 3,

    personal: [
      { id: nuevoId(), puesto: "Barista", cantidad: 2, sueldoMensual: 3200 },
      { id: nuevoId(), puesto: "Cajero / mesero", cantidad: 1, sueldoMensual: 2800 },
      { id: nuevoId(), puesto: "Administrador", cantidad: 1, sueldoMensual: 5000 },
    ],

    costosDirectos: [
      {
        id: nuevoId(),
        productoId: idCafe,
        categoria: "insumo_directo",
        descripcion: "Café en grano, leche, vaso e insumos por taza",
        unidadMedida: "taza",
        cantidadPorUnidad: 1,
        costoUnitario: 6,
      },
      {
        id: nuevoId(),
        productoId: idPostre,
        categoria: "insumo_directo",
        descripcion: "Ingredientes por postre",
        unidadMedida: "porción",
        cantidadPorUnidad: 1,
        costoUnitario: 6,
      },
      {
        id: nuevoId(),
        productoId: idSandwich,
        categoria: "insumo_directo",
        descripcion: "Ingredientes por almuerzo ligero / sándwich",
        unidadMedida: "plato",
        cantidadPorUnidad: 1,
        costoUnitario: 11,
      },
    ],

    costosAdministracion: [
      { id: nuevoId(), descripcion: "Alquiler del local", unidadMedida: "mes", cantidad: 1, costoUnitario: 4500 },
      { id: nuevoId(), descripcion: "Servicios básicos (luz, agua, gas)", unidadMedida: "mes", cantidad: 1, costoUnitario: 1800 },
      { id: nuevoId(), descripcion: "Internet y software de caja", unidadMedida: "mes", cantidad: 1, costoUnitario: 350 },
    ],
    costosComercializacion: [
      { id: nuevoId(), descripcion: "Redes sociales y promociones", unidadMedida: "mes", cantidad: 1, costoUnitario: 800 },
    ],
    imprevistosPorcentaje: 0.05,

    productos: [
      {
        id: idCafe,
        nombre: "Café de especialidad",
        unidadMedida: "taza",
        cantidades: serie5(21600, 0.06),
        precios: serie5(18, 0.03, 2),
      },
      {
        id: idPostre,
        nombre: "Postres y reposterría",
        unidadMedida: "porción",
        cantidades: serie5(10800, 0.06),
        precios: serie5(16, 0.03, 2),
      },
      {
        id: idSandwich,
        nombre: "Almuerzo ligero / sándwich",
        unidadMedida: "plato",
        cantidades: serie5(7200, 0.05),
        precios: serie5(28, 0.03, 2),
      },
    ],

    financiamiento: {
      // Préstamo de activo fijo: 35% financiado
      porcentajePropio: 0.65,
      porcentajePrestamo: 0.35,
      tasaInteresAnual: 0.13,
      plazoMeses: 60,
      // Ke derivado del CAPM de abajo: 5% + 1.1 × 8% = 13.8%
      costoOportunidadAccionista: 0.138,
      // Préstamo de capital de trabajo: 30% financiado
      prestamoCapitalTrabajo: {
        porcentajePropio: 0.7,
        porcentajePrestamo: 0.3,
        tasaInteresAnual: 0.11,
        plazoMeses: 48,
      },
    },

    // CAPM (V2): Ke = Rf 5% + β 1.1 × prima 8% = 13.8%
    capmV2: { tasaLibreRiesgo: 0.05, beta: 1.1, primaMercado: 0.08 },

    crecimientoIngresosAnual: 0.06,
    crecimientoCostosAnual: 0.04,
    tasasCrecCantidad: [6, 6, 6, 6],
    tasasCrecPrecio: [3, 3, 3, 3],

    estado: "completo",
    creado_en: ahora,
    actualizado_en: ahora,
  };
}
