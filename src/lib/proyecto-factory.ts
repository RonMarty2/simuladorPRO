import { proyectarPublicidad, proyectarSuscriptores } from "@/lib/calculo-financiero";
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

// Financiamiento + CAPM por defecto compartido para los ejemplos.
function finCapmEjemplo(): Pick<Proyecto, "financiamiento" | "capmV2"> {
  return {
    financiamiento: {
      porcentajePropio: 0.65,
      porcentajePrestamo: 0.35,
      tasaInteresAnual: 0.13,
      plazoMeses: 60,
      costoOportunidadAccionista: 0.12, // = CAPM 4% + 1.0 × 8%
      prestamoCapitalTrabajo: {
        porcentajePropio: 0.7,
        porcentajePrestamo: 0.3,
        tasaInteresAnual: 0.11,
        plazoMeses: 48,
      },
    },
    capmV2: { tasaLibreRiesgo: 0.04, beta: 1.0, primaMercado: 0.08 },
  };
}

/**
 * EJEMPLO — PRODUCCIÓN (V2): panadería de quinoa.
 * Hace y vende unidades físicas. Costos directos = materia prima + insumos +
 * empaque por unidad. Mismo motor "unidades × precio", vocabulario de producción.
 */
export function crearProyectoEjemploPanaderiaV2(params: {
  estudiante_id: string;
  curso_id?: string | null;
  nombre?: string;
}): Proyecto {
  const ahora = new Date().toISOString();
  const idPan = nuevoId();
  const idGalleta = nuevoId();
  return {
    id: nuevoId(),
    estudiante_id: params.estudiante_id,
    curso_id: params.curso_id ?? null,
    version: "v2",
    tipo: "libre",
    nombre: params.nombre ?? "panaderiav2",
    ubicacion: "Cochabamba, zona sur",
    descripcion: "Panadería de productos de quinoa: pan y galletas integrales. Ejemplo de PRODUCCIÓN (se fabrica el producto).",
    sector: "produccion",
    inversiones: {
      terreno: [],
      obrasCiviles: [itemInv("Adecuación del local y horno fijo", "obra", 1, 25000, 10)],
      maquinaria: [
        itemInv("Horno industrial", "und", 1, 28000, 10),
        itemInv("Amasadora y batidora", "set", 1, 12000, 10),
      ],
      mobiliario: [itemInv("Vitrinas, mesones y estantería", "set", 1, 10000, 8)],
      activoDiferido: [itemInv("Registro sanitario, licencias e instalación", "global", 1, 5000, 5)],
    },
    capitalTrabajo: 50000,
    mesesBufferCapitalTrabajo: 3,
    personal: [
      { id: nuevoId(), puesto: "Panadero", cantidad: 2, sueldoMensual: 3000 },
      { id: nuevoId(), puesto: "Vendedor / despacho", cantidad: 1, sueldoMensual: 2800 },
    ],
    costosDirectos: [
      { id: nuevoId(), productoId: idPan, categoria: "materia_prima", descripcion: "Harina de quinoa y trigo", unidadMedida: "und", cantidadPorUnidad: 1, costoUnitario: 1.2 },
      { id: nuevoId(), productoId: idPan, categoria: "insumo", descripcion: "Levadura, sal, energía del horno", unidadMedida: "und", cantidadPorUnidad: 1, costoUnitario: 0.3 },
      { id: nuevoId(), productoId: idGalleta, categoria: "materia_prima", descripcion: "Ingredientes de galletas", unidadMedida: "paquete", cantidadPorUnidad: 1, costoUnitario: 5 },
      { id: nuevoId(), productoId: idGalleta, categoria: "empaque", descripcion: "Bolsa y etiqueta", unidadMedida: "paquete", cantidadPorUnidad: 1, costoUnitario: 1 },
    ],
    costosAdministracion: [
      { id: nuevoId(), descripcion: "Alquiler del local", unidadMedida: "mes", cantidad: 1, costoUnitario: 3000 },
      { id: nuevoId(), descripcion: "Servicios (gas, luz, agua)", unidadMedida: "mes", cantidad: 1, costoUnitario: 2500 },
      { id: nuevoId(), descripcion: "Internet y administración", unidadMedida: "mes", cantidad: 1, costoUnitario: 250 },
    ],
    costosComercializacion: [
      { id: nuevoId(), descripcion: "Redes y degustaciones", unidadMedida: "mes", cantidad: 1, costoUnitario: 500 },
    ],
    imprevistosPorcentaje: 0.05,
    productos: [
      { id: idPan, nombre: "Pan de quinoa", unidadMedida: "unidad", cantidades: serie5(120000, 0.05), precios: serie5(3.5, 0.03, 2) },
      { id: idGalleta, nombre: "Galletas integrales", unidadMedida: "paquete", cantidades: serie5(24000, 0.05), precios: serie5(12, 0.03, 2) },
    ],
    ...finCapmEjemplo(),
    crecimientoIngresosAnual: 0.05,
    crecimientoCostosAnual: 0.04,
    tasasCrecCantidad: [5, 5, 5, 5],
    tasasCrecPrecio: [3, 3, 3, 3],
    estado: "completo",
    creado_en: ahora,
    actualizado_en: ahora,
  };
}

/**
 * EJEMPLO — SUSCRIPCIÓN (V2): podcast con membresías.
 * Modelo de ingreso recurrente: una base de suscriptores que crece con altas y
 * baja con churn. Los ingresos NO son "unidades × precio" sino la base activa ×
 * cuota. El producto portador se calcula con proyectarSuscriptores.
 */
export function crearProyectoEjemploPodcastV2(params: {
  estudiante_id: string;
  curso_id?: string | null;
  nombre?: string;
}): Proyecto {
  const ahora = new Date().toISOString();
  const sus = {
    suscriptoresIniciales: 150,
    altasMensuales: 40,
    churnMensual: 0.04,
    cuotaMensual: 35,
  };
  const proy = proyectarSuscriptores(sus, 5);
  const cantidades = proy.map((a) => Math.round(a.promedioSuscriptores)) as [
    number, number, number, number, number,
  ];
  const precioAnual = sus.cuotaMensual * 12;
  const idSus = nuevoId();
  return {
    id: nuevoId(),
    estudiante_id: params.estudiante_id,
    curso_id: params.curso_id ?? null,
    version: "v2",
    tipo: "libre",
    nombre: params.nombre ?? "podcastv2",
    ubicacion: "La Paz (online)",
    descripcion: "Podcast con membresías de pago. Ejemplo de modelo de ingreso por SUSCRIPCIÓN (base recurrente con altas y churn).",
    sector: "servicios",
    modeloIngreso: "suscripcion",
    suscripcionV2: sus,
    inversiones: {
      terreno: [],
      obrasCiviles: [itemInv("Acondicionamiento acústico del estudio", "obra", 1, 8000, 8)],
      maquinaria: [
        itemInv("Micrófonos, interfaz y audífonos", "set", 1, 12000, 5),
        itemInv("Computadora y software de edición", "set", 1, 10000, 5),
      ],
      mobiliario: [itemInv("Mobiliario del estudio", "set", 1, 4000, 8)],
      activoDiferido: [itemInv("Marca, web y configuración de plataforma", "global", 1, 4000, 5)],
    },
    capitalTrabajo: 20000,
    mesesBufferCapitalTrabajo: 3,
    personal: [
      { id: nuevoId(), puesto: "Conductor / productor", cantidad: 1, sueldoMensual: 4000 },
      { id: nuevoId(), puesto: "Editor de audio", cantidad: 1, sueldoMensual: 3000 },
    ],
    costosDirectos: [
      // Comisión de la pasarela de cobro por cada suscriptor-año (≈5% de la cuota anual).
      { id: nuevoId(), productoId: idSus, categoria: "comision_venta", descripcion: "Comisión de la plataforma de cobro", unidadMedida: "suscriptor/año", cantidadPorUnidad: 1, costoUnitario: Math.round(precioAnual * 0.05 * 100) / 100 },
    ],
    costosAdministracion: [
      { id: nuevoId(), descripcion: "Hosting de audio y plataforma de membresías", unidadMedida: "mes", cantidad: 1, costoUnitario: 800 },
      { id: nuevoId(), descripcion: "Internet y herramientas", unidadMedida: "mes", cantidad: 1, costoUnitario: 250 },
    ],
    costosComercializacion: [
      { id: nuevoId(), descripcion: "Pauta para captar suscriptores", unidadMedida: "mes", cantidad: 1, costoUnitario: 1500 },
    ],
    imprevistosPorcentaje: 0.05,
    productos: [
      { id: idSus, nombre: "Suscripción", unidadMedida: "suscriptor/año", cantidades, precios: [precioAnual, precioAnual, precioAnual, precioAnual, precioAnual] },
    ],
    ...finCapmEjemplo(),
    crecimientoIngresosAnual: 0.06,
    crecimientoCostosAnual: 0.04,
    tasasCrecCantidad: [0, 0, 0, 0],
    tasasCrecPrecio: [0, 0, 0, 0],
    estado: "completo",
    creado_en: ahora,
    actualizado_en: ahora,
  };
}

/**
 * EJEMPLO — PUBLICIDAD (V2): canal/programa que vive de pauta publicitaria.
 * El ingreso = audiencia × impresiones × CPM. No vende un producto, vende
 * espacios a anunciantes.
 */
export function crearProyectoEjemploPublicidadV2(params: {
  estudiante_id: string;
  curso_id?: string | null;
  nombre?: string;
}): Proyecto {
  const ahora = new Date().toISOString();
  const pub = {
    audienciaMensual: 8000,
    crecimientoMensual: 0.06,
    impresionesPorUsuario: 6,
    cpm: 45,
  };
  const proy = proyectarPublicidad(pub, 5);
  const cantidades = proy.map((a) => Math.round(a.impresionesAnio / 1000)) as [
    number, number, number, number, number,
  ];
  const idPub = nuevoId();
  return {
    id: nuevoId(),
    estudiante_id: params.estudiante_id,
    curso_id: params.curso_id ?? null,
    version: "v2",
    tipo: "libre",
    nombre: params.nombre ?? "canalv2",
    ubicacion: "Santa Cruz (digital)",
    descripcion: "Canal/programa que vive de la pauta publicitaria. Ejemplo de modelo de ingreso por PUBLICIDAD (audiencia × CPM).",
    sector: "servicios",
    modeloIngreso: "publicidad",
    publicidadV2: pub,
    inversiones: {
      terreno: [],
      obrasCiviles: [itemInv("Set y acondicionamiento", "obra", 1, 10000, 8)],
      maquinaria: [
        itemInv("Cámaras, luces y audio", "set", 1, 25000, 5),
        itemInv("Computo y edición", "set", 1, 12000, 5),
      ],
      mobiliario: [itemInv("Mobiliario del set", "set", 1, 4000, 8)],
      activoDiferido: [itemInv("Marca, canal y configuración", "global", 1, 3000, 5)],
    },
    capitalTrabajo: 25000,
    mesesBufferCapitalTrabajo: 3,
    personal: [
      { id: nuevoId(), puesto: "Conductor", cantidad: 1, sueldoMensual: 4000 },
      { id: nuevoId(), puesto: "Productor / community", cantidad: 1, sueldoMensual: 3000 },
    ],
    costosDirectos: [
      // La red publicitaria (Google/Meta) se queda ~30% de lo cobrado por mil impresiones.
      { id: nuevoId(), productoId: idPub, categoria: "comision_venta", descripcion: "Comisión de la red publicitaria", unidadMedida: "mil impresiones", cantidadPorUnidad: 1, costoUnitario: Math.round(pub.cpm * 0.3 * 100) / 100 },
    ],
    costosAdministracion: [
      { id: nuevoId(), descripcion: "Streaming, hosting y herramientas", unidadMedida: "mes", cantidad: 1, costoUnitario: 600 },
      { id: nuevoId(), descripcion: "Internet", unidadMedida: "mes", cantidad: 1, costoUnitario: 300 },
    ],
    costosComercializacion: [
      { id: nuevoId(), descripcion: "Pauta para crecer audiencia", unidadMedida: "mes", cantidad: 1, costoUnitario: 1000 },
    ],
    imprevistosPorcentaje: 0.05,
    productos: [
      { id: idPub, nombre: "Publicidad", unidadMedida: "mil impresiones", cantidades, precios: [pub.cpm, pub.cpm, pub.cpm, pub.cpm, pub.cpm] },
    ],
    ...finCapmEjemplo(),
    crecimientoIngresosAnual: 0.06,
    crecimientoCostosAnual: 0.04,
    tasasCrecCantidad: [0, 0, 0, 0],
    tasasCrecPrecio: [0, 0, 0, 0],
    estado: "completo",
    creado_en: ahora,
    actualizado_en: ahora,
  };
}

/**
 * EJEMPLO — COSTO-BENEFICIO (V2): plan de marketing interno.
 * No vende nada propio: es un gasto que busca generar ventas adicionales en el
 * negocio. Se evalúa comparando el beneficio incremental estimado contra su costo.
 */
export function crearProyectoEjemploPlanMarketingV2(params: {
  estudiante_id: string;
  curso_id?: string | null;
  nombre?: string;
}): Proyecto {
  const ahora = new Date().toISOString();
  const cb = { beneficioAnualBase: 180000, crecimientoAnual: 0.05 };
  const precios = [0, 1, 2, 3, 4].map(
    (i) => Math.round(cb.beneficioAnualBase * Math.pow(1 + cb.crecimientoAnual, i) * 100) / 100
  ) as [number, number, number, number, number];
  const idBen = nuevoId();
  return {
    id: nuevoId(),
    estudiante_id: params.estudiante_id,
    curso_id: params.curso_id ?? null,
    version: "v2",
    tipo: "libre",
    nombre: params.nombre ?? "planmarketingv2",
    ubicacion: "Cochabamba",
    descripcion: "Plan de marketing interno de una empresa. No vende nada propio; se evalúa por el BENEFICIO INCREMENTAL (ventas extra) que genera vs. su costo (costo-beneficio).",
    sector: "servicios",
    modeloIngreso: "costo_beneficio",
    costoBeneficioV2: cb,
    inversiones: {
      terreno: [],
      obrasCiviles: [],
      maquinaria: [],
      mobiliario: [],
      activoDiferido: [
        itemInv("Diseño de marca y material gráfico", "global", 1, 15000, 5),
        itemInv("Web / landing y configuración", "global", 1, 8000, 5),
      ],
    },
    capitalTrabajo: 10000,
    mesesBufferCapitalTrabajo: 2,
    personal: [
      { id: nuevoId(), puesto: "Encargado de marketing", cantidad: 1, sueldoMensual: 4500 },
    ],
    costosDirectos: [],
    costosAdministracion: [
      { id: nuevoId(), descripcion: "Herramientas y software de marketing", unidadMedida: "mes", cantidad: 1, costoUnitario: 500 },
    ],
    costosComercializacion: [
      { id: nuevoId(), descripcion: "Pauta en redes y medios (el plan en sí)", unidadMedida: "mes", cantidad: 1, costoUnitario: 8000 },
    ],
    imprevistosPorcentaje: 0.05,
    productos: [
      { id: idBen, nombre: "Beneficio incremental estimado", unidadMedida: "año", cantidades: [1, 1, 1, 1, 1], precios },
    ],
    ...finCapmEjemplo(),
    crecimientoIngresosAnual: 0.05,
    crecimientoCostosAnual: 0.04,
    tasasCrecCantidad: [0, 0, 0, 0],
    tasasCrecPrecio: [0, 0, 0, 0],
    estado: "completo",
    creado_en: ahora,
    actualizado_en: ahora,
  };
}

/**
 * EJEMPLO — COMERCIO (V2): tienda de barrio / minimarket.
 * Compra y revende (alto volumen, bajo margen). El costo directo es la
 * MERCADERÍA que se revende. Mismo motor, vocabulario de comercio.
 */
export function crearProyectoEjemploTiendaV2(params: {
  estudiante_id: string;
  curso_id?: string | null;
  nombre?: string;
}): Proyecto {
  const ahora = new Date().toISOString();
  const idVenta = nuevoId();
  return {
    id: nuevoId(),
    estudiante_id: params.estudiante_id,
    curso_id: params.curso_id ?? null,
    version: "v2",
    tipo: "libre",
    nombre: params.nombre ?? "tiendav2",
    ubicacion: "El Alto, zona comercial",
    descripcion: "Minimarket de barrio: compra y reventa de abarrotes. Ejemplo de COMERCIO (alto volumen, bajo margen).",
    sector: "comercio",
    inversiones: {
      terreno: [],
      obrasCiviles: [itemInv("Adecuación del local", "obra", 1, 22000, 10)],
      maquinaria: [itemInv("Refrigeradores y congelador", "set", 1, 20000, 10)],
      mobiliario: [itemInv("Estantería y góndolas", "set", 1, 15000, 10)],
      activoDiferido: [itemInv("Caja registradora y sistema de inventario", "set", 1, 8000, 5)],
    },
    capitalTrabajo: 80000,
    mesesBufferCapitalTrabajo: 2,
    personal: [
      { id: nuevoId(), puesto: "Cajero/a", cantidad: 1, sueldoMensual: 2800 },
      { id: nuevoId(), puesto: "Repositor / almacén", cantidad: 1, sueldoMensual: 2600 },
    ],
    costosDirectos: [
      { id: nuevoId(), productoId: idVenta, categoria: "mercaderia", descripcion: "Costo de la mercadería revendida", unidadMedida: "venta", cantidadPorUnidad: 1, costoUnitario: 26 },
      { id: nuevoId(), productoId: idVenta, categoria: "empaque", descripcion: "Bolsas y empaque", unidadMedida: "venta", cantidadPorUnidad: 1, costoUnitario: 0.5 },
    ],
    costosAdministracion: [
      { id: nuevoId(), descripcion: "Alquiler del local", unidadMedida: "mes", cantidad: 1, costoUnitario: 4000 },
      { id: nuevoId(), descripcion: "Servicios básicos", unidadMedida: "mes", cantidad: 1, costoUnitario: 1200 },
      { id: nuevoId(), descripcion: "Internet y sistema", unidadMedida: "mes", cantidad: 1, costoUnitario: 300 },
    ],
    costosComercializacion: [
      { id: nuevoId(), descripcion: "Promociones y letrero", unidadMedida: "mes", cantidad: 1, costoUnitario: 600 },
    ],
    imprevistosPorcentaje: 0.04,
    productos: [
      { id: idVenta, nombre: "Venta promedio (canasta de abarrotes)", unidadMedida: "venta", cantidades: serie5(60000, 0.06), precios: serie5(35, 0.03, 2) },
    ],
    ...finCapmEjemplo(),
    crecimientoIngresosAnual: 0.06,
    crecimientoCostosAnual: 0.04,
    tasasCrecCantidad: [6, 6, 6, 6],
    tasasCrecPrecio: [3, 3, 3, 3],
    estado: "completo",
    creado_en: ahora,
    actualizado_en: ahora,
  };
}
