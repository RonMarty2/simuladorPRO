import type {
  ItemInversion,
  Proyecto,
  CategoriaCostoDirecto,
} from "@/types/proyecto";
import { nuevoId } from "@/lib/proyecto-factory";

/**
 * GALERÍA DE PLANTILLAS DE EJEMPLO ("mega proyectos").
 *
 * Proyectos de referencia COMPLETOS: cada uno llena todas las categorías
 * posibles (terreno, obras, maquinaria, mobiliario, activo diferido, varios
 * productos, personal amplio, todos los tipos de costo, financiamiento + CAPM)
 * para que el alumno vea TODO lo que el simulador puede modelar. Así, cuando
 * arme el suyo (que será más simple), entiende el universo de opciones.
 *
 * IMPORTANTE: estas plantillas son SOLO LECTURA. No se guardan, no se mezclan
 * con los proyectos del estudiante. Se exploran en la Galería de ejemplos.
 */

// ── Helpers locales ─────────────────────────────────────────────────────────

/** ItemInversion con campos derivados (costoTotal, depreciación, residual). */
function inv(
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
    valorResidual: costoTotal,
  };
}

/** Serie de 5 años con crecimiento compuesto. */
function serie(
  base: number,
  tasa: number,
  dec = 0
): [number, number, number, number, number] {
  const f = Math.pow(10, dec);
  return [0, 1, 2, 3, 4].map(
    (i) => Math.round(base * Math.pow(1 + tasa, i) * f) / f
  ) as [number, number, number, number, number];
}

function gasto(descripcion: string, costoUnitario: number, unidad: "mes" | "año" = "mes") {
  return { id: nuevoId(), descripcion, unidadMedida: unidad, cantidad: 1, costoUnitario };
}

function puesto(p: string, cantidad: number, sueldoMensual: number) {
  return { id: nuevoId(), puesto: p, cantidad, sueldoMensual };
}

function directo(
  productoId: string | null,
  categoria: CategoriaCostoDirecto,
  descripcion: string,
  unidadMedida: string,
  cantidadPorUnidad: number,
  costoUnitario: number
) {
  return { id: nuevoId(), productoId, categoria, descripcion, unidadMedida, cantidadPorUnidad, costoUnitario };
}

/** Financiamiento + CAPM estándar (compartido). */
function finCapm(): Pick<Proyecto, "financiamiento" | "capmV2"> {
  return {
    financiamiento: {
      porcentajePropio: 0.6,
      porcentajePrestamo: 0.4,
      tasaInteresAnual: 0.13,
      plazoMeses: 60,
      costoOportunidadAccionista: 0.12,
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

/** Base común a todas las plantillas (campos administrativos). */
function base(): Pick<Proyecto, "id" | "estudiante_id" | "curso_id" | "version" | "tipo" | "estado" | "creado_en" | "actualizado_en" | "mesesBufferCapitalTrabajo" | "imprevistosPorcentaje"> {
  const ahora = new Date().toISOString();
  return {
    id: nuevoId(),
    estudiante_id: "ejemplo",
    curso_id: null,
    version: "v2",
    tipo: "libre",
    estado: "completo",
    creado_en: ahora,
    actualizado_en: ahora,
    mesesBufferCapitalTrabajo: 3,
    imprevistosPorcentaje: 0.05,
  };
}

// ── Metadatos de cada plantilla (para la galería) ────────────────────────────

export interface PlantillaMeta {
  clave: string;
  titulo: string;
  emoji: string;
  sector: string;
  modelo: string;
  /** Etiqueta corta del modelo de ingreso para el chip. */
  modeloLabel: string;
  resumen: string;
  /** Constructor que genera el Proyecto completo (solo lectura). */
  crear: () => Proyecto;
}

// ============================================================================
// 1) SERVICIOS — Restaurante temático completo
// ============================================================================
function restaurante(): Proyecto {
  const idPlato = nuevoId();
  const idBebida = nuevoId();
  const idPostre = nuevoId();
  const idEvento = nuevoId();
  return {
    ...base(),
    nombre: "Restaurante temático «Sabores de Bolivia»",
    ubicacion: "Cochabamba, zona Recoleta",
    descripcion:
      "Restaurante de cocina boliviana de autor con salón de eventos. Modelo SERVICIOS: vende platos, bebidas, postres y alquiler de eventos. Ejemplo COMPLETO con todas las categorías llenas.",
    sector: "servicios",
    modeloIngreso: "unidades",
    inversiones: {
      terreno: [inv("Terreno propio para el local", "m²", 200, 1200, null)],
      obrasCiviles: [
        inv("Construcción y adecuación del salón principal", "obra", 1, 180000, 20),
        inv("Cocina industrial y baños", "obra", 1, 70000, 20),
      ],
      maquinaria: [
        inv("Cocina industrial, hornos y planchas", "set", 1, 60000, 10),
        inv("Refrigeración y congeladores", "set", 1, 35000, 10),
        inv("Lavavajillas y campana extractora", "set", 1, 18000, 10),
      ],
      mobiliario: [
        inv("Mesas, sillas y barra del salón", "set", 1, 45000, 10),
        inv("Vajilla, cubertería y cristalería", "set", 1, 20000, 5),
        inv("Equipo de sonido y ambientación", "set", 1, 15000, 8),
      ],
      activoDiferido: [
        inv("Licencias, registro sanitario y constitución", "global", 1, 12000, 5),
        inv("Diseño de marca, menú e identidad", "global", 1, 8000, 5),
      ],
    },
    capitalTrabajo: 150000,
    personal: [
      puesto("Chef ejecutivo", 1, 9000),
      puesto("Cocineros", 3, 4000),
      puesto("Meseros", 5, 2800),
      puesto("Cajero / anfitrión", 2, 3000),
      puesto("Administrador", 1, 6500),
      puesto("Personal de limpieza", 2, 2600),
    ],
    costosDirectos: [
      directo(idPlato, "insumo_directo", "Ingredientes por plato principal", "plato", 1, 22),
      directo(idBebida, "mercaderia", "Bebidas (compra para reventa)", "bebida", 1, 8),
      directo(idPostre, "insumo_directo", "Ingredientes por postre", "porción", 1, 9),
      directo(idEvento, "insumo_directo", "Insumos por evento (decoración, extras)", "evento", 1, 1200),
    ],
    costosAdministracion: [
      gasto("Servicios básicos (luz, gas, agua)", 6000),
      gasto("Internet, telefonía y software de gestión", 900),
      gasto("Contabilidad y asesoría legal", 2500),
      gasto("Seguros del local", 1200),
      gasto("Mantenimiento de equipos", 1500),
    ],
    costosComercializacion: [
      gasto("Marketing digital y redes sociales", 3500),
      gasto("Plataformas de delivery (comisión fija)", 2000),
      gasto("Material promocional y eventos", 1500),
    ],
    productos: [
      { id: idPlato, nombre: "Plato principal", unidadMedida: "plato", cantidades: serie(36000, 0.07), precios: serie(55, 0.04, 2) },
      { id: idBebida, nombre: "Bebidas", unidadMedida: "bebida", cantidades: serie(30000, 0.07), precios: serie(18, 0.04, 2) },
      { id: idPostre, nombre: "Postres", unidadMedida: "porción", cantidades: serie(12000, 0.06), precios: serie(25, 0.04, 2) },
      { id: idEvento, nombre: "Alquiler para eventos", unidadMedida: "evento", cantidades: serie(48, 0.1), precios: serie(4500, 0.05, 2) },
    ],
    ...finCapm(),
    crecimientoIngresosAnual: 0.07,
    crecimientoCostosAnual: 0.04,
    tasasCrecCantidad: [7, 7, 6, 6],
    tasasCrecPrecio: [4, 4, 4, 4],
  };
}

// ============================================================================
// 2) RUTAS TURÍSTICAS — Operadora de turismo (servicios)
// ============================================================================
function operadoraTurismo(): Proyecto {
  const idUyuni = nuevoId();
  const idAmazonia = nuevoId();
  const idCity = nuevoId();
  const idTrekking = nuevoId();
  return {
    ...base(),
    nombre: "Operadora de turismo «Bolivia Mágica»",
    ubicacion: "La Paz, con operación nacional",
    descripcion:
      "Operadora de paquetes turísticos: Salar de Uyuni, Amazonía, city tours y trekking. Modelo SERVICIOS por RUTAS turísticas: cada paquete es un producto con su precio y volumen anual.",
    sector: "servicios",
    modeloIngreso: "unidades",
    inversiones: {
      terreno: [],
      obrasCiviles: [inv("Adecuación de oficina central y agencia", "obra", 1, 35000, 15)],
      maquinaria: [
        inv("Flota de vehículos 4x4 (3 unidades)", "vehículo", 3, 95000, 8),
        inv("Equipo de camping y trekking", "set", 1, 40000, 5),
        inv("Equipo de comunicación y GPS", "set", 1, 12000, 5),
      ],
      mobiliario: [
        inv("Mobiliario de oficina y recepción", "set", 1, 18000, 10),
        inv("Computadoras y sistema de reservas", "set", 1, 22000, 5),
      ],
      activoDiferido: [
        inv("Licencias turísticas y registro VICEMINTUR", "global", 1, 10000, 5),
        inv("Web de reservas, marca y catálogo", "global", 1, 15000, 5),
      ],
    },
    capitalTrabajo: 120000,
    personal: [
      puesto("Guías turísticos bilingües", 4, 4500),
      puesto("Choferes profesionales", 3, 3800),
      puesto("Agente de ventas / reservas", 2, 3500),
      puesto("Coordinador de operaciones", 1, 6000),
      puesto("Administrador / contador", 1, 6000),
    ],
    costosDirectos: [
      directo(idUyuni, "insumo_directo", "Alojamiento, comidas y entradas por pax", "pax", 1, 850),
      directo(idAmazonia, "insumo_directo", "Lodge, transporte fluvial y comidas por pax", "pax", 1, 1100),
      directo(idCity, "insumo_directo", "Entradas, refrigerio y transporte por pax", "pax", 1, 120),
      directo(idTrekking, "insumo_directo", "Equipo, comida y porteadores por pax", "pax", 1, 450),
    ],
    costosAdministracion: [
      gasto("Alquiler de oficina central", 4500),
      gasto("Combustible y mantenimiento de flota", 8000),
      gasto("Servicios básicos e internet", 1200),
      gasto("Seguros de pasajeros y vehículos", 3500),
      gasto("Contabilidad y licencias anuales", 2000),
    ],
    costosComercializacion: [
      gasto("Comisión de agencias y OTAs (Booking, etc.)", 6000),
      gasto("Marketing digital y ferias de turismo", 4000),
      gasto("Material promocional multiidioma", 1000),
    ],
    productos: [
      { id: idUyuni, nombre: "Tour Salar de Uyuni (3 días)", unidadMedida: "pax", cantidades: serie(1800, 0.08), precios: serie(1600, 0.05, 2) },
      { id: idAmazonia, nombre: "Expedición Amazonía (4 días)", unidadMedida: "pax", cantidades: serie(900, 0.08), precios: serie(2200, 0.05, 2) },
      { id: idCity, nombre: "City tour La Paz", unidadMedida: "pax", cantidades: serie(4200, 0.07), precios: serie(250, 0.04, 2) },
      { id: idTrekking, nombre: "Trekking Cordillera Real", unidadMedida: "pax", cantidades: serie(1100, 0.07), precios: serie(900, 0.05, 2) },
    ],
    ...finCapm(),
    crecimientoIngresosAnual: 0.08,
    crecimientoCostosAnual: 0.04,
    tasasCrecCantidad: [8, 8, 7, 7],
    tasasCrecPrecio: [5, 5, 4, 4],
  };
}

// ============================================================================
// 3) PRODUCCIÓN — Fábrica de alimentos
// ============================================================================
function fabricaAlimentos(): Proyecto {
  const idGranola = nuevoId();
  const idBarra = nuevoId();
  const idMantequilla = nuevoId();
  return {
    ...base(),
    nombre: "Fábrica de snacks andinos «AndeFoods»",
    ubicacion: "Cochabamba, parque industrial Santiváñez",
    descripcion:
      "Planta que produce granola, barras energéticas y mantequilla de maní a partir de insumos andinos. Modelo PRODUCCIÓN: se fabrican unidades físicas con materia prima, insumos, mano de obra y empaque.",
    sector: "produccion",
    modeloIngreso: "unidades",
    inversiones: {
      terreno: [inv("Terreno industrial", "m²", 500, 600, null)],
      obrasCiviles: [
        inv("Galpón de producción con piso sanitario", "obra", 1, 220000, 20),
        inv("Almacén de materia prima y producto terminado", "obra", 1, 80000, 20),
      ],
      maquinaria: [
        inv("Línea de tostado y mezclado", "línea", 1, 120000, 10),
        inv("Empacadora automática", "und", 2, 45000, 10),
        inv("Molino y prensa de maní", "set", 1, 38000, 10),
        inv("Caldera y sistema de vapor", "und", 1, 30000, 12),
      ],
      mobiliario: [
        inv("Mesas de acero inoxidable y estantería", "set", 1, 25000, 10),
        inv("Laboratorio de control de calidad", "set", 1, 30000, 8),
      ],
      activoDiferido: [
        inv("Registro sanitario SENASAG y códigos de barra", "global", 1, 15000, 5),
        inv("Diseño de marca y empaques", "global", 1, 12000, 5),
      ],
    },
    capitalTrabajo: 200000,
    personal: [
      puesto("Jefe de planta", 1, 8000),
      puesto("Operarios de producción", 8, 3000),
      puesto("Control de calidad", 2, 4000),
      puesto("Almacén y logística", 2, 3200),
      puesto("Administración y ventas", 3, 4500),
    ],
    costosDirectos: [
      directo(idGranola, "materia_prima", "Avena, quinua, miel y frutos secos", "bolsa", 1, 6),
      directo(idGranola, "empaque", "Bolsa metalizada y etiqueta", "bolsa", 1, 1.2),
      directo(idGranola, "mano_obra", "Mano de obra directa por bolsa", "bolsa", 1, 0.8),
      directo(idBarra, "materia_prima", "Cereales, amaranto y endulzante", "barra", 1, 2.5),
      directo(idBarra, "empaque", "Envoltura individual", "barra", 1, 0.4),
      directo(idMantequilla, "materia_prima", "Maní seleccionado y aceite", "frasco", 1, 9),
      directo(idMantequilla, "empaque", "Frasco de vidrio y tapa", "frasco", 1, 2.5),
    ],
    costosAdministracion: [
      gasto("Energía eléctrica industrial", 9000),
      gasto("Gas industrial y agua", 4000),
      gasto("Mantenimiento de maquinaria", 3500),
      gasto("Contabilidad, seguros y licencias", 3000),
      gasto("Internet, sistema ERP y telefonía", 1200),
    ],
    costosComercializacion: [
      gasto("Distribución y flota de reparto", 6000),
      gasto("Marketing y degustaciones", 3000),
      gasto("Comisión a supermercados", 4000),
    ],
    productos: [
      { id: idGranola, nombre: "Granola andina 400g", unidadMedida: "bolsa", cantidades: serie(180000, 0.08), precios: serie(18, 0.03, 2) },
      { id: idBarra, nombre: "Barra energética", unidadMedida: "barra", cantidades: serie(420000, 0.08), precios: serie(6, 0.03, 2) },
      { id: idMantequilla, nombre: "Mantequilla de maní 250g", unidadMedida: "frasco", cantidades: serie(96000, 0.07), precios: serie(28, 0.03, 2) },
    ],
    ...finCapm(),
    crecimientoIngresosAnual: 0.08,
    crecimientoCostosAnual: 0.04,
    tasasCrecCantidad: [8, 8, 7, 7],
    tasasCrecPrecio: [3, 3, 3, 3],
  };
}

// ============================================================================
// 4) COMERCIO — Distribuidora mayorista
// ============================================================================
function distribuidora(): Proyecto {
  const idAbarrotes = nuevoId();
  const idLimpieza = nuevoId();
  const idBebidas = nuevoId();
  return {
    ...base(),
    nombre: "Distribuidora mayorista «El Surtidor»",
    ubicacion: "Santa Cruz de la Sierra",
    descripcion:
      "Distribuidora que compra al por mayor y revende a tiendas de barrio. Modelo COMERCIO: alto volumen, margen ajustado. El costo directo es la mercadería que se revende.",
    sector: "comercio",
    modeloIngreso: "unidades",
    inversiones: {
      terreno: [inv("Terreno para depósito y patio de carga", "m²", 800, 500, null)],
      obrasCiviles: [inv("Galpón depósito con andén de carga", "obra", 1, 150000, 20)],
      maquinaria: [
        inv("Montacargas y transpaletas", "set", 1, 55000, 10),
        inv("Camiones de reparto (2 unidades)", "vehículo", 2, 120000, 8),
      ],
      mobiliario: [
        inv("Racks industriales y estantería", "set", 1, 40000, 10),
        inv("Equipo de cómputo y sistema de inventario", "set", 1, 25000, 5),
      ],
      activoDiferido: [
        inv("Licencias, NIT y constitución de empresa", "global", 1, 8000, 5),
        inv("Sistema ERP de distribución", "global", 1, 18000, 5),
      ],
    },
    capitalTrabajo: 350000,
    personal: [
      puesto("Gerente comercial", 1, 8000),
      puesto("Vendedores de ruta", 5, 3500),
      puesto("Choferes de reparto", 2, 3500),
      puesto("Personal de depósito", 4, 2800),
      puesto("Administración y facturación", 2, 3800),
    ],
    costosDirectos: [
      directo(idAbarrotes, "mercaderia", "Costo de abarrotes (compra mayorista)", "caja", 1, 180),
      directo(idLimpieza, "mercaderia", "Costo de productos de limpieza", "caja", 1, 95),
      directo(idBebidas, "mercaderia", "Costo de bebidas y gaseosas", "caja", 1, 140),
    ],
    costosAdministracion: [
      gasto("Combustible y mantenimiento de flota", 8000),
      gasto("Servicios básicos del depósito", 2500),
      gasto("Contabilidad, seguros e impuestos", 4000),
      gasto("Sistema, internet y telefonía", 1500),
    ],
    costosComercializacion: [
      gasto("Comisiones de venta por ruta", 7000),
      gasto("Promociones y material de punto de venta", 2500),
    ],
    productos: [
      { id: idAbarrotes, nombre: "Caja de abarrotes surtida", unidadMedida: "caja", cantidades: serie(60000, 0.07), precios: serie(215, 0.03, 2) },
      { id: idLimpieza, nombre: "Caja de limpieza", unidadMedida: "caja", cantidades: serie(30000, 0.07), precios: serie(118, 0.03, 2) },
      { id: idBebidas, nombre: "Caja de bebidas", unidadMedida: "caja", cantidades: serie(48000, 0.08), precios: serie(168, 0.03, 2) },
    ],
    ...finCapm(),
    crecimientoIngresosAnual: 0.07,
    crecimientoCostosAnual: 0.04,
    tasasCrecCantidad: [7, 7, 7, 7],
    tasasCrecPrecio: [3, 3, 3, 3],
  };
}

// ============================================================================
// 5) SUSCRIPCIÓN — Gimnasio con membresías
// ============================================================================
function gimnasio(): Proyecto {
  const sus = { suscriptoresIniciales: 300, altasMensuales: 60, churnMensual: 0.05, cuotaMensual: 250 };
  // Proyección simple de la base promedio por año (sin importar el motor: damos
  // valores realistas ya calculados para la plantilla de solo lectura).
  const baseAnual: [number, number, number, number, number] = [520, 760, 980, 1120, 1200];
  const precioAnual = sus.cuotaMensual * 12;
  const idMembresia = nuevoId();
  return {
    ...base(),
    nombre: "Gimnasio «FitAndes» con membresías",
    ubicacion: "La Paz, zona Sopocachi",
    descripcion:
      "Gimnasio premium con membresías mensuales. Modelo SUSCRIPCIÓN: base recurrente de socios que crece con altas y baja con churn. El ingreso es la base activa × cuota anual.",
    sector: "servicios",
    modeloIngreso: "suscripcion",
    suscripcionV2: sus,
    inversiones: {
      terreno: [],
      obrasCiviles: [inv("Adecuación de 600 m² (pisos, vestuarios, duchas)", "obra", 1, 160000, 15)],
      maquinaria: [
        inv("Máquinas de musculación y peso libre", "set", 1, 180000, 8),
        inv("Cardio (cintas, elípticas, bicicletas)", "set", 1, 120000, 6),
        inv("Equipo de clases grupales y funcional", "set", 1, 35000, 6),
      ],
      mobiliario: [
        inv("Lockers, recepción y mobiliario", "set", 1, 40000, 10),
        inv("Sistema de control de acceso y cámaras", "set", 1, 25000, 5),
      ],
      activoDiferido: [
        inv("Licencias, marca y app de socios", "global", 1, 20000, 5),
      ],
    },
    capitalTrabajo: 90000,
    personal: [
      puesto("Instructores / personal trainers", 6, 3800),
      puesto("Recepción y atención", 3, 2800),
      puesto("Limpieza y mantenimiento", 3, 2600),
      puesto("Gerente del gimnasio", 1, 7000),
      puesto("Community manager / ventas", 1, 3500),
    ],
    costosDirectos: [
      directo(idMembresia, "comision_venta", "Comisión de pasarela de pago por socio/año", "socio/año", 1, Math.round(precioAnual * 0.04)),
    ],
    costosAdministracion: [
      gasto("Alquiler del local", 18000),
      gasto("Servicios básicos (alto consumo)", 7000),
      gasto("Mantenimiento de máquinas", 4000),
      gasto("Software de gestión y música", 1500),
      gasto("Seguros y licencias", 2000),
    ],
    costosComercializacion: [
      gasto("Marketing digital y campañas de captación", 6000),
      gasto("Promociones de temporada", 2000),
    ],
    productos: [
      { id: idMembresia, nombre: "Membresía anual", unidadMedida: "socio/año", cantidades: baseAnual, precios: [precioAnual, precioAnual, precioAnual, precioAnual, precioAnual] },
    ],
    ...finCapm(),
    crecimientoIngresosAnual: 0.1,
    crecimientoCostosAnual: 0.04,
    tasasCrecCantidad: [0, 0, 0, 0],
    tasasCrecPrecio: [0, 0, 0, 0],
  };
}

// ============================================================================
// 6) PUBLICIDAD — Medio digital
// ============================================================================
function medioDigital(): Proyecto {
  const pub = { audienciaMensual: 120000, crecimientoMensual: 0.05, impresionesPorUsuario: 8, cpm: 50 };
  // Impresiones anuales / 1000 (en miles), valores realistas ya proyectados.
  const milesImpresiones: [number, number, number, number, number] = [13800, 24000, 38000, 54000, 70000];
  const idEspacio = nuevoId();
  return {
    ...base(),
    nombre: "Medio digital «Noticias Bolivia Hoy»",
    ubicacion: "Santa Cruz (operación 100% digital)",
    descripcion:
      "Portal de noticias y contenido que vive de la pauta publicitaria. Modelo PUBLICIDAD: el ingreso es audiencia × impresiones × CPM (precio por mil impresiones). No vende producto, vende espacios.",
    sector: "servicios",
    modeloIngreso: "publicidad",
    publicidadV2: pub,
    inversiones: {
      terreno: [],
      obrasCiviles: [inv("Adecuación de redacción y set", "obra", 1, 25000, 10)],
      maquinaria: [
        inv("Cámaras, luces, micrófonos y set", "set", 1, 45000, 5),
        inv("Servidores, computadoras y edición", "set", 1, 60000, 5),
      ],
      mobiliario: [inv("Mobiliario de redacción", "set", 1, 18000, 10)],
      activoDiferido: [
        inv("Desarrollo del portal web y app", "global", 1, 50000, 5),
        inv("Marca, dominio y posicionamiento inicial", "global", 1, 15000, 5),
      ],
    },
    capitalTrabajo: 80000,
    personal: [
      puesto("Periodistas / redactores", 5, 4000),
      puesto("Editores de video y diseño", 3, 4200),
      puesto("Desarrollador / soporte web", 1, 6500),
      puesto("Ejecutivo de ventas publicitarias", 2, 4000),
      puesto("Director editorial", 1, 8000),
    ],
    costosDirectos: [
      directo(idEspacio, "comision_venta", "Comisión de la red publicitaria (Google/Meta)", "mil impresiones", 1, Math.round(pub.cpm * 0.3)),
    ],
    costosAdministracion: [
      gasto("Hosting, CDN y herramientas SaaS", 4000),
      gasto("Internet y telefonía", 800),
      gasto("Contabilidad y licencias", 1500),
      gasto("Agencias de noticias y fotos", 2500),
    ],
    costosComercializacion: [
      gasto("Pauta propia para crecer audiencia", 8000),
      gasto("Eventos y alianzas de marca", 2000),
    ],
    productos: [
      { id: idEspacio, nombre: "Espacio publicitario", unidadMedida: "mil impresiones", cantidades: milesImpresiones, precios: [pub.cpm, pub.cpm, pub.cpm, pub.cpm, pub.cpm] },
    ],
    ...finCapm(),
    crecimientoIngresosAnual: 0.15,
    crecimientoCostosAnual: 0.05,
    tasasCrecCantidad: [0, 0, 0, 0],
    tasasCrecPrecio: [0, 0, 0, 0],
  };
}

// ============================================================================
// 7) COSTO-BENEFICIO — Proyecto de eficiencia energética
// ============================================================================
function eficienciaEnergetica(): Proyecto {
  const cb = { beneficioAnualBase: 320000, crecimientoAnual: 0.05 };
  const precios = [0, 1, 2, 3, 4].map(
    (i) => Math.round(cb.beneficioAnualBase * Math.pow(1 + cb.crecimientoAnual, i))
  ) as [number, number, number, number, number];
  const idBeneficio = nuevoId();
  return {
    ...base(),
    nombre: "Planta solar para empresa industrial",
    ubicacion: "Oruro (techo industrial)",
    descripcion:
      "Instalación de paneles solares para reducir la factura eléctrica de una fábrica. Modelo COSTO-BENEFICIO: no vende nada; se evalúa por el AHORRO/beneficio incremental anual contra la inversión y los costos de operación.",
    sector: "servicios",
    modeloIngreso: "costo_beneficio",
    costoBeneficioV2: cb,
    inversiones: {
      terreno: [],
      obrasCiviles: [inv("Estructura de soporte y montaje en techo", "obra", 1, 90000, 25)],
      maquinaria: [
        inv("Paneles fotovoltaicos (sistema 200 kWp)", "sistema", 1, 700000, 25),
        inv("Inversores y sistema de monitoreo", "set", 1, 120000, 15),
        inv("Banco de baterías", "set", 1, 180000, 10),
      ],
      mobiliario: [],
      activoDiferido: [
        inv("Estudio de ingeniería y permisos", "global", 1, 40000, 5),
        inv("Trámites de interconexión a la red", "global", 1, 20000, 5),
      ],
    },
    capitalTrabajo: 30000,
    personal: [
      puesto("Técnico de mantenimiento", 1, 5500),
      puesto("Supervisor energético (medio tiempo)", 1, 3000),
    ],
    costosDirectos: [],
    costosAdministracion: [
      gasto("Mantenimiento y limpieza de paneles", 3000),
      gasto("Monitoreo, seguros y garantías", 2500),
    ],
    costosComercializacion: [],
    productos: [
      { id: idBeneficio, nombre: "Ahorro anual en factura eléctrica", unidadMedida: "año", cantidades: [1, 1, 1, 1, 1], precios },
    ],
    ...finCapm(),
    crecimientoIngresosAnual: 0.05,
    crecimientoCostosAnual: 0.03,
    tasasCrecCantidad: [0, 0, 0, 0],
    tasasCrecPrecio: [0, 0, 0, 0],
  };
}

// ============================================================================
// 8) AGRICULTURA — Cultivo de quinua
// ============================================================================
function cultivoQuinua(): Proyecto {
  const idQuinua = nuevoId();
  const idSubproducto = nuevoId();
  return {
    ...base(),
    nombre: "Cultivo y exportación de quinua real",
    ubicacion: "Potosí, altiplano sur",
    descripcion:
      "Producción agrícola de quinua real orgánica para exportación, más venta de subproductos. Modelo AGRICULTURA: usa categorías de semilla, fertilizante, riego/combustible y mano de obra agrícola.",
    sector: "agricultura",
    modeloIngreso: "unidades",
    inversiones: {
      terreno: [inv("Terreno agrícola habilitado", "hectárea", 50, 8000, null)],
      obrasCiviles: [
        inv("Sistema de riego por aspersión", "sistema", 1, 120000, 15),
        inv("Galpón de acopio y secado", "obra", 1, 60000, 20),
      ],
      maquinaria: [
        inv("Tractor y arado", "set", 1, 140000, 10),
        inv("Trilladora y seleccionadora", "set", 1, 80000, 10),
        inv("Equipo de empacado al vacío", "und", 1, 30000, 8),
      ],
      mobiliario: [inv("Oficina de campo y básculas", "set", 1, 15000, 10)],
      activoDiferido: [
        inv("Certificación orgánica y de exportación", "global", 1, 35000, 5),
        inv("Estudio de suelos y constitución", "global", 1, 12000, 5),
      ],
    },
    capitalTrabajo: 140000,
    personal: [
      puesto("Ingeniero agrónomo", 1, 7000),
      puesto("Jornaleros de campo (temporada)", 12, 2500),
      puesto("Operadores de maquinaria", 2, 3500),
      puesto("Administración y exportación", 2, 4500),
    ],
    costosDirectos: [
      directo(idQuinua, "semilla", "Semilla certificada de quinua real", "quintal", 1, 35),
      directo(idQuinua, "fertilizante", "Abono orgánico y bioinsumos", "quintal", 1, 28),
      directo(idQuinua, "riego_combustible", "Combustible de maquinaria y riego", "quintal", 1, 22),
      directo(idQuinua, "mano_obra_agricola", "Jornales de siembra y cosecha por quintal", "quintal", 1, 40),
      directo(idSubproducto, "mano_obra_agricola", "Procesamiento de subproductos", "quintal", 1, 18),
    ],
    costosAdministracion: [
      gasto("Energía, agua y servicios de campo", 3000),
      gasto("Mantenimiento de maquinaria y riego", 3500),
      gasto("Certificaciones anuales y análisis", 2500),
      gasto("Administración y logística de exportación", 4000),
    ],
    costosComercializacion: [
      gasto("Flete a puerto y trámites de exportación", 6000),
      gasto("Ferias internacionales y comisiones", 3000),
    ],
    productos: [
      { id: idQuinua, nombre: "Quinua real orgánica (exportación)", unidadMedida: "quintal", cantidades: serie(9000, 0.06), precios: serie(620, 0.04, 2) },
      { id: idSubproducto, nombre: "Subproductos (harina, hojuelas)", unidadMedida: "quintal", cantidades: serie(2400, 0.06), precios: serie(380, 0.04, 2) },
    ],
    ...finCapm(),
    crecimientoIngresosAnual: 0.06,
    crecimientoCostosAnual: 0.04,
    tasasCrecCantidad: [6, 6, 6, 6],
    tasasCrecPrecio: [4, 4, 4, 4],
  };
}

// ── Registro exportado ───────────────────────────────────────────────────────

export const PLANTILLAS: PlantillaMeta[] = [
  {
    clave: "restaurante",
    titulo: "Restaurante temático",
    emoji: "🍽️",
    sector: "Servicios",
    modelo: "unidades",
    modeloLabel: "Servicios",
    resumen: "Platos, bebidas, postres y salón de eventos. Todas las categorías llenas.",
    crear: restaurante,
  },
  {
    clave: "turismo",
    titulo: "Operadora de turismo",
    emoji: "🏔️",
    sector: "Servicios",
    modelo: "unidades",
    modeloLabel: "Rutas turísticas",
    resumen: "Paquetes: Salar de Uyuni, Amazonía, city tours y trekking.",
    crear: operadoraTurismo,
  },
  {
    clave: "fabrica",
    titulo: "Fábrica de alimentos",
    emoji: "🏭",
    sector: "Producción",
    modelo: "unidades",
    modeloLabel: "Producción",
    resumen: "Granola, barras y mantequilla de maní. Materia prima + insumos + empaque.",
    crear: fabricaAlimentos,
  },
  {
    clave: "distribuidora",
    titulo: "Distribuidora mayorista",
    emoji: "📦",
    sector: "Comercio",
    modelo: "unidades",
    modeloLabel: "Comercio",
    resumen: "Compra y reventa al por mayor. Alto volumen, margen ajustado.",
    crear: distribuidora,
  },
  {
    clave: "gimnasio",
    titulo: "Gimnasio con membresías",
    emoji: "💪",
    sector: "Servicios",
    modelo: "suscripcion",
    modeloLabel: "Suscripción",
    resumen: "Base de socios recurrente con altas y churn. Ingreso por cuota.",
    crear: gimnasio,
  },
  {
    clave: "medio",
    titulo: "Medio digital",
    emoji: "📱",
    sector: "Servicios",
    modelo: "publicidad",
    modeloLabel: "Publicidad",
    resumen: "Portal de noticias que vive de la pauta. Audiencia × CPM.",
    crear: medioDigital,
  },
  {
    clave: "solar",
    titulo: "Planta solar industrial",
    emoji: "☀️",
    sector: "Servicios",
    modelo: "costo_beneficio",
    modeloLabel: "Costo-beneficio",
    resumen: "Paneles solares evaluados por el ahorro anual vs. la inversión.",
    crear: eficienciaEnergetica,
  },
  {
    clave: "quinua",
    titulo: "Cultivo de quinua",
    emoji: "🌾",
    sector: "Agricultura",
    modelo: "unidades",
    modeloLabel: "Agricultura",
    resumen: "Quinua real orgánica para exportación. Semilla, fertilizante, riego.",
    crear: cultivoQuinua,
  },
];
