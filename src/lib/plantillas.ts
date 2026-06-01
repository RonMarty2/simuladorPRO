import type {
  ItemInversion,
  Proyecto,
  CategoriaCostoDirecto,
} from "@/types/proyecto";
import { nuevoId } from "@/lib/proyecto-factory";

/**
 * GALERÍA DE PLANTILLAS DE EJEMPLO ("mega proyectos") — vitrina pedagógica.
 *
 * Proyectos de referencia COMPLETOS agrupados por categoría. Cada uno llena
 * todas las categorías posibles (terreno, obras, maquinaria, mobiliario,
 * activo diferido, varios productos, personal amplio, todos los tipos de
 * costo, financiamiento + CAPM) para que el alumno explore EL UNIVERSO de
 * negocios que el simulador puede modelar.
 *
 * El docente las usa en clase: cada ejemplo es una historia distinta del
 * mismo motor. Comparar 3 cafeterías muestra cómo el tamaño cambia los
 * indicadores. Comparar restaurante vs food truck muestra estructura de
 * costos. Comparar podcast vs radio muestra modelos de ingreso recurrente
 * vs publicidad.
 *
 * IMPORTANTE: SOLO LECTURA. No se guardan, no se mezclan con los proyectos
 * del estudiante. Se exploran en la Galería.
 */

// ============================================================================
// HELPERS
// ============================================================================

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

function finCapm(beta = 1.0): Pick<Proyecto, "financiamiento" | "capmV2"> {
  return {
    financiamiento: {
      porcentajePropio: 0.6,
      porcentajePrestamo: 0.4,
      tasaInteresAnual: 0.13,
      plazoMeses: 60,
      costoOportunidadAccionista: 0.04 + beta * 0.08,
      prestamoCapitalTrabajo: {
        porcentajePropio: 0.7,
        porcentajePrestamo: 0.3,
        tasaInteresAnual: 0.11,
        plazoMeses: 48,
      },
    },
    capmV2: { tasaLibreRiesgo: 0.04, beta, primaMercado: 0.08 },
  };
}

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

// ============================================================================
// METADATOS
// ============================================================================

export type CategoriaPlantilla =
  | "gastronomia"
  | "produccion"
  | "comercio"
  | "servicios"
  | "suscripcion"
  | "medios"
  | "turismo"
  | "agricultura"
  | "costo_beneficio";

export interface PlantillaMeta {
  clave: string;
  titulo: string;
  emoji: string;
  categoria: CategoriaPlantilla;
  sector: string;
  modelo: string;
  modeloLabel: string;
  /** Etiqueta de tamaño/complejidad. */
  escala: "Pequeño" | "Mediano" | "Grande";
  resumen: string;
  crear: () => Proyecto;
}

export const CATEGORIAS: Record<CategoriaPlantilla, { titulo: string; emoji: string; descripcion: string }> = {
  gastronomia: { titulo: "Gastronomía", emoji: "🍽️", descripcion: "Restaurantes, cafeterías, food trucks, panaderías." },
  produccion: { titulo: "Producción industrial", emoji: "🏭", descripcion: "Fabricación de productos físicos: alimentos, textiles, muebles." },
  comercio: { titulo: "Comercio", emoji: "📦", descripcion: "Compra y reventa: tiendas, distribuidoras, e-commerce." },
  servicios: { titulo: "Servicios profesionales", emoji: "🛠️", descripcion: "Lavanderías, peluquerías, consultoras, talleres." },
  suscripcion: { titulo: "Suscripciones y membresías", emoji: "🔄", descripcion: "Modelos recurrentes: gimnasios, academias, podcast premium." },
  medios: { titulo: "Medios y publicidad", emoji: "📺", descripcion: "Portales, programas radiales, canales de YouTube." },
  turismo: { titulo: "Turismo y hospitalidad", emoji: "🏔️", descripcion: "Operadoras de turismo, hostales, ecoturismo." },
  agricultura: { titulo: "Agricultura", emoji: "🌾", descripcion: "Cultivos, invernaderos, agroindustria." },
  costo_beneficio: { titulo: "Proyectos costo-beneficio", emoji: "⚖️", descripcion: "Inversiones que se evalúan por ahorro/beneficio incremental." },
};

// ============================================================================
// GASTRONOMÍA
// ============================================================================

function restaurante(): Proyecto {
  const idPlato = nuevoId(), idBebida = nuevoId(), idPostre = nuevoId(), idEvento = nuevoId();
  return {
    ...base(),
    nombre: "Restaurante temático «Sabores de Bolivia»",
    ubicacion: "Cochabamba, zona Recoleta",
    descripcion: "Restaurante de cocina boliviana de autor con salón de eventos. Vende platos, bebidas, postres y alquiler para eventos. Ejemplo GRANDE de servicios gastronómicos.",
    sector: "servicios",
    modeloIngreso: "unidades",
    inversiones: {
      terreno: [inv("Terreno propio para el local", "m²", 200, 1200, null)],
      obrasCiviles: [inv("Construcción del salón principal", "obra", 1, 180000, 20), inv("Cocina industrial y baños", "obra", 1, 70000, 20)],
      maquinaria: [inv("Cocina industrial, hornos y planchas", "set", 1, 60000, 10), inv("Refrigeración y congeladores", "set", 1, 35000, 10), inv("Lavavajillas y campana extractora", "set", 1, 18000, 10)],
      mobiliario: [inv("Mesas, sillas y barra", "set", 1, 45000, 10), inv("Vajilla, cubertería y cristalería", "set", 1, 20000, 5), inv("Sonido y ambientación", "set", 1, 15000, 8)],
      activoDiferido: [inv("Licencias, registro sanitario y constitución", "global", 1, 12000, 5), inv("Diseño de marca y menú", "global", 1, 8000, 5)],
    },
    capitalTrabajo: 150000,
    personal: [puesto("Chef ejecutivo", 1, 9000), puesto("Cocineros", 3, 4000), puesto("Meseros", 5, 2800), puesto("Cajero/anfitrión", 2, 3000), puesto("Administrador", 1, 6500), puesto("Limpieza", 2, 2600)],
    costosDirectos: [
      directo(idPlato, "insumo_directo", "Ingredientes por plato principal", "plato", 1, 22),
      directo(idBebida, "mercaderia", "Bebidas (compra para reventa)", "bebida", 1, 8),
      directo(idPostre, "insumo_directo", "Ingredientes por postre", "porción", 1, 9),
      directo(idEvento, "insumo_directo", "Insumos por evento (decoración, extras)", "evento", 1, 1200),
    ],
    costosAdministracion: [gasto("Servicios básicos (luz, gas, agua)", 6000), gasto("Internet y software de gestión", 900), gasto("Contabilidad y asesoría legal", 2500), gasto("Seguros del local", 1200), gasto("Mantenimiento de equipos", 1500)],
    costosComercializacion: [gasto("Marketing digital y redes", 3500), gasto("Plataformas de delivery (comisión)", 2000), gasto("Material promocional", 1500)],
    productos: [
      { id: idPlato, nombre: "Plato principal", unidadMedida: "plato", cantidades: serie(36000, 0.07), precios: serie(55, 0.04, 2) },
      { id: idBebida, nombre: "Bebidas", unidadMedida: "bebida", cantidades: serie(30000, 0.07), precios: serie(18, 0.04, 2) },
      { id: idPostre, nombre: "Postres", unidadMedida: "porción", cantidades: serie(12000, 0.06), precios: serie(25, 0.04, 2) },
      { id: idEvento, nombre: "Alquiler para eventos", unidadMedida: "evento", cantidades: serie(48, 0.1), precios: serie(4500, 0.05, 2) },
    ],
    ...finCapm(1.1),
    crecimientoIngresosAnual: 0.07, crecimientoCostosAnual: 0.04,
    tasasCrecCantidad: [7, 7, 6, 6], tasasCrecPrecio: [4, 4, 4, 4],
  };
}

function cafeteria(): Proyecto {
  const idCafe = nuevoId(), idPostre = nuevoId(), idSandwich = nuevoId();
  return {
    ...base(),
    nombre: "Cafetería de especialidad «Grano Andino»",
    ubicacion: "La Paz, zona Sopocachi",
    descripcion: "Cafetería de barrio con café de origen, postres y almuerzos ligeros. Ejemplo MEDIANO de servicios gastronómicos con ticket promedio bajo y alto volumen.",
    sector: "servicios",
    modeloIngreso: "unidades",
    inversiones: {
      terreno: [],
      obrasCiviles: [inv("Adecuación y remodelación del local", "obra", 1, 40000, 10)],
      maquinaria: [inv("Cafetera espresso profesional + molinos", "set", 1, 35000, 8), inv("Refrigeración y equipos de cocina", "set", 1, 20000, 8)],
      mobiliario: [inv("Mesas, sillas, barra y decoración", "set", 1, 18000, 10)],
      activoDiferido: [inv("Licencias e instalación", "global", 1, 7000, 5)],
    },
    capitalTrabajo: 50000,
    personal: [puesto("Barista", 2, 3200), puesto("Cajero/mesero", 1, 2800), puesto("Administrador", 1, 5000)],
    costosDirectos: [
      directo(idCafe, "insumo_directo", "Café en grano, leche, vaso e insumos", "taza", 1, 6),
      directo(idPostre, "insumo_directo", "Ingredientes por postre", "porción", 1, 6),
      directo(idSandwich, "insumo_directo", "Ingredientes por sándwich", "plato", 1, 11),
    ],
    costosAdministracion: [gasto("Alquiler", 4500), gasto("Servicios básicos", 1800), gasto("Internet y software", 350)],
    costosComercializacion: [gasto("Redes y promociones", 800)],
    productos: [
      { id: idCafe, nombre: "Café de especialidad", unidadMedida: "taza", cantidades: serie(21600, 0.06), precios: serie(18, 0.03, 2) },
      { id: idPostre, nombre: "Postres", unidadMedida: "porción", cantidades: serie(10800, 0.06), precios: serie(16, 0.03, 2) },
      { id: idSandwich, nombre: "Sándwich/almuerzo", unidadMedida: "plato", cantidades: serie(7200, 0.05), precios: serie(28, 0.03, 2) },
    ],
    ...finCapm(),
    crecimientoIngresosAnual: 0.06, crecimientoCostosAnual: 0.04,
    tasasCrecCantidad: [6, 6, 6, 6], tasasCrecPrecio: [3, 3, 3, 3],
  };
}

function foodTruck(): Proyecto {
  const idHambur = nuevoId(), idPapas = nuevoId(), idBebida = nuevoId();
  return {
    ...base(),
    nombre: "Food truck «BurgerMóvil»",
    ubicacion: "Santa Cruz, ferias y eventos",
    descripcion: "Food truck de hamburguesas gourmet que rota por ferias, eventos corporativos y zonas universitarias. Ejemplo PEQUEÑO con inversión mínima y operación móvil.",
    sector: "servicios",
    modeloIngreso: "unidades",
    inversiones: {
      terreno: [],
      obrasCiviles: [],
      maquinaria: [inv("Trailer/camión equipado con cocina", "unidad", 1, 95000, 10), inv("Plancha, freidora y refrigeración", "set", 1, 25000, 8), inv("Generador eléctrico", "unidad", 1, 12000, 8)],
      mobiliario: [inv("Mesas plegables, sillas y carpa", "set", 1, 8000, 5)],
      activoDiferido: [inv("Permisos municipales y SENASAG móvil", "global", 1, 5000, 5), inv("Marca y wrap del trailer", "global", 1, 7000, 5)],
    },
    capitalTrabajo: 25000,
    personal: [puesto("Cocinero", 1, 3500), puesto("Asistente/cajero", 1, 2800)],
    costosDirectos: [
      directo(idHambur, "insumo_directo", "Pan, carne, queso, verduras por hamburguesa", "und", 1, 14),
      directo(idPapas, "insumo_directo", "Papas y aceite por porción", "porción", 1, 4),
      directo(idBebida, "mercaderia", "Bebidas compradas para reventa", "und", 1, 6),
    ],
    costosAdministracion: [gasto("Combustible y mantenimiento del trailer", 2500), gasto("GLP y servicios", 1200), gasto("Permisos por evento", 1500)],
    costosComercializacion: [gasto("Redes sociales y promociones", 600)],
    productos: [
      { id: idHambur, nombre: "Hamburguesa gourmet", unidadMedida: "und", cantidades: serie(14400, 0.08), precios: serie(35, 0.04, 2) },
      { id: idPapas, nombre: "Papas fritas", unidadMedida: "porción", cantidades: serie(10800, 0.08), precios: serie(15, 0.04, 2) },
      { id: idBebida, nombre: "Bebidas", unidadMedida: "und", cantidades: serie(14400, 0.08), precios: serie(12, 0.03, 2) },
    ],
    ...finCapm(1.2),
    crecimientoIngresosAnual: 0.08, crecimientoCostosAnual: 0.05,
    tasasCrecCantidad: [8, 8, 7, 7], tasasCrecPrecio: [4, 4, 4, 4],
  };
}

function panaderiaArtesanal(): Proyecto {
  const idPan = nuevoId(), idGalleta = nuevoId(), idTorta = nuevoId();
  return {
    ...base(),
    nombre: "Panadería artesanal «Pan de Quinoa»",
    ubicacion: "Cochabamba, zona sur",
    descripcion: "Panadería de barrio que produce y vende pan integral, galletas y tortas por encargo. Ejemplo MEDIANO de producción + venta directa al consumidor.",
    sector: "produccion",
    modeloIngreso: "unidades",
    inversiones: {
      terreno: [],
      obrasCiviles: [inv("Adecuación del local y horno fijo", "obra", 1, 25000, 10)],
      maquinaria: [inv("Horno industrial", "und", 1, 28000, 10), inv("Amasadora y batidora", "set", 1, 12000, 10), inv("Cámara de fermentación", "und", 1, 8000, 10)],
      mobiliario: [inv("Vitrinas, mesones y estantería", "set", 1, 10000, 8)],
      activoDiferido: [inv("Registro sanitario y licencias", "global", 1, 5000, 5)],
    },
    capitalTrabajo: 45000,
    personal: [puesto("Panadero/maestro", 1, 4500), puesto("Asistente de panadería", 2, 3000), puesto("Vendedor/despacho", 1, 2800)],
    costosDirectos: [
      directo(idPan, "materia_prima", "Harina, levadura, sal, agua", "und", 1, 1.2),
      directo(idPan, "insumo", "Energía del horno y empaque", "und", 1, 0.5),
      directo(idGalleta, "materia_prima", "Ingredientes de galletas", "paquete", 1, 5),
      directo(idGalleta, "empaque", "Bolsa y etiqueta", "paquete", 1, 1),
      directo(idTorta, "materia_prima", "Ingredientes premium por torta", "torta", 1, 45),
    ],
    costosAdministracion: [gasto("Alquiler", 3000), gasto("Gas, luz y agua", 2500), gasto("Internet y administración", 300)],
    costosComercializacion: [gasto("Redes y degustaciones", 500), gasto("Volantes y pedidos por encargo", 300)],
    productos: [
      { id: idPan, nombre: "Pan integral", unidadMedida: "und", cantidades: serie(120000, 0.05), precios: serie(3.5, 0.03, 2) },
      { id: idGalleta, nombre: "Galletas artesanales", unidadMedida: "paquete", cantidades: serie(24000, 0.06), precios: serie(12, 0.03, 2) },
      { id: idTorta, nombre: "Tortas por encargo", unidadMedida: "torta", cantidades: serie(960, 0.1), precios: serie(150, 0.04, 2) },
    ],
    ...finCapm(),
    crecimientoIngresosAnual: 0.06, crecimientoCostosAnual: 0.04,
    tasasCrecCantidad: [5, 5, 6, 6], tasasCrecPrecio: [3, 3, 3, 3],
  };
}

// ============================================================================
// PRODUCCIÓN
// ============================================================================

function fabricaSnacks(): Proyecto {
  const idGranola = nuevoId(), idBarra = nuevoId(), idMantequilla = nuevoId();
  return {
    ...base(),
    nombre: "Fábrica de snacks andinos «AndeFoods»",
    ubicacion: "Cochabamba, parque industrial Santiváñez",
    descripcion: "Planta industrial que produce granola, barras energéticas y mantequilla de maní. Ejemplo GRANDE de producción con economías de escala.",
    sector: "produccion",
    modeloIngreso: "unidades",
    inversiones: {
      terreno: [inv("Terreno industrial", "m²", 500, 600, null)],
      obrasCiviles: [inv("Galpón de producción", "obra", 1, 220000, 20), inv("Almacén MP y PT", "obra", 1, 80000, 20)],
      maquinaria: [inv("Línea de tostado y mezclado", "línea", 1, 120000, 10), inv("Empacadora automática", "und", 2, 45000, 10), inv("Molino y prensa de maní", "set", 1, 38000, 10), inv("Caldera y sistema de vapor", "und", 1, 30000, 12)],
      mobiliario: [inv("Mesas de acero y estantería", "set", 1, 25000, 10), inv("Laboratorio de control de calidad", "set", 1, 30000, 8)],
      activoDiferido: [inv("Registro sanitario y códigos de barra", "global", 1, 15000, 5), inv("Diseño de marca y empaques", "global", 1, 12000, 5)],
    },
    capitalTrabajo: 200000,
    personal: [puesto("Jefe de planta", 1, 8000), puesto("Operarios", 8, 3000), puesto("Control de calidad", 2, 4000), puesto("Almacén y logística", 2, 3200), puesto("Administración y ventas", 3, 4500)],
    costosDirectos: [
      directo(idGranola, "materia_prima", "Avena, quinua, miel y frutos secos", "bolsa", 1, 6),
      directo(idGranola, "empaque", "Bolsa metalizada y etiqueta", "bolsa", 1, 1.2),
      directo(idGranola, "mano_obra", "MOD por bolsa", "bolsa", 1, 0.8),
      directo(idBarra, "materia_prima", "Cereales, amaranto y endulzante", "barra", 1, 2.5),
      directo(idBarra, "empaque", "Envoltura individual", "barra", 1, 0.4),
      directo(idMantequilla, "materia_prima", "Maní seleccionado y aceite", "frasco", 1, 9),
      directo(idMantequilla, "empaque", "Frasco de vidrio y tapa", "frasco", 1, 2.5),
    ],
    costosAdministracion: [gasto("Energía eléctrica industrial", 9000), gasto("Gas industrial y agua", 4000), gasto("Mantenimiento de maquinaria", 3500), gasto("Contabilidad y seguros", 3000), gasto("Sistema ERP", 1200)],
    costosComercializacion: [gasto("Distribución y flota", 6000), gasto("Marketing y degustaciones", 3000), gasto("Comisión a supermercados", 4000)],
    productos: [
      { id: idGranola, nombre: "Granola andina 400g", unidadMedida: "bolsa", cantidades: serie(180000, 0.08), precios: serie(18, 0.03, 2) },
      { id: idBarra, nombre: "Barra energética", unidadMedida: "barra", cantidades: serie(420000, 0.08), precios: serie(6, 0.03, 2) },
      { id: idMantequilla, nombre: "Mantequilla de maní 250g", unidadMedida: "frasco", cantidades: serie(96000, 0.07), precios: serie(28, 0.03, 2) },
    ],
    ...finCapm(),
    crecimientoIngresosAnual: 0.08, crecimientoCostosAnual: 0.04,
    tasasCrecCantidad: [8, 8, 7, 7], tasasCrecPrecio: [3, 3, 3, 3],
  };
}

function embotelladoraJugos(): Proyecto {
  const idNaranja = nuevoId(), idMulti = nuevoId(), idVerde = nuevoId();
  return {
    ...base(),
    nombre: "Embotelladora de jugos naturales «Pura Fruta»",
    ubicacion: "Santa Cruz, zona industrial",
    descripcion: "Planta que extrae, pasteuriza y embotella jugos 100% naturales. Ejemplo MEDIANO de producción con alta rotación y cadena de frío.",
    sector: "produccion",
    modeloIngreso: "unidades",
    inversiones: {
      terreno: [],
      obrasCiviles: [inv("Adecuación de planta con piso sanitario", "obra", 1, 150000, 20), inv("Cámara fría", "obra", 1, 80000, 15)],
      maquinaria: [inv("Línea de extracción y pasteurización", "línea", 1, 180000, 10), inv("Embotelladora y tapadora", "línea", 1, 120000, 10), inv("Etiquetadora automática", "und", 1, 35000, 10)],
      mobiliario: [inv("Estantería y racks de cámara fría", "set", 1, 20000, 10)],
      activoDiferido: [inv("Registro sanitario y análisis iniciales", "global", 1, 18000, 5), inv("Marca y diseño de envases", "global", 1, 15000, 5)],
    },
    capitalTrabajo: 150000,
    personal: [puesto("Jefe de planta", 1, 7000), puesto("Operarios de línea", 6, 3000), puesto("Control de calidad", 1, 4500), puesto("Distribución", 2, 3000), puesto("Ventas", 2, 4000)],
    costosDirectos: [
      directo(idNaranja, "materia_prima", "Naranja seleccionada", "botella", 1, 3),
      directo(idNaranja, "empaque", "Botella PET y tapa", "botella", 1, 1.5),
      directo(idMulti, "materia_prima", "Mix de frutas y vitaminas", "botella", 1, 4),
      directo(idMulti, "empaque", "Botella PET y etiqueta", "botella", 1, 1.8),
      directo(idVerde, "materia_prima", "Espinaca, manzana, piña y jengibre", "botella", 1, 6),
      directo(idVerde, "empaque", "Botella premium y etiqueta", "botella", 1, 2.5),
    ],
    costosAdministracion: [gasto("Energía (cadena de frío)", 8000), gasto("Agua industrial", 2500), gasto("Mantenimiento y limpieza", 3000), gasto("Sistema ERP y contabilidad", 1800)],
    costosComercializacion: [gasto("Flota refrigerada de reparto", 5500), gasto("Comisión a puntos de venta", 3500), gasto("Marketing y degustaciones", 2500)],
    productos: [
      { id: idNaranja, nombre: "Jugo de naranja 500ml", unidadMedida: "botella", cantidades: serie(240000, 0.08), precios: serie(12, 0.03, 2) },
      { id: idMulti, nombre: "Jugo multifrutas 500ml", unidadMedida: "botella", cantidades: serie(180000, 0.08), precios: serie(15, 0.03, 2) },
      { id: idVerde, nombre: "Jugo verde detox 500ml", unidadMedida: "botella", cantidades: serie(72000, 0.1), precios: serie(22, 0.04, 2) },
    ],
    ...finCapm(),
    crecimientoIngresosAnual: 0.08, crecimientoCostosAnual: 0.04,
    tasasCrecCantidad: [8, 8, 8, 8], tasasCrecPrecio: [3, 3, 3, 3],
  };
}

function tallerMuebles(): Proyecto {
  const idSilla = nuevoId(), idMesa = nuevoId(), idMueble = nuevoId();
  return {
    ...base(),
    nombre: "Taller de muebles a medida «MaderaViva»",
    ubicacion: "Cochabamba, zona sur",
    descripcion: "Carpintería que diseña y fabrica muebles personalizados (sillas, mesas, muebles de cocina). Ejemplo MEDIANO de producción artesanal con alto valor agregado.",
    sector: "produccion",
    modeloIngreso: "unidades",
    inversiones: {
      terreno: [],
      obrasCiviles: [inv("Adecuación del taller con extracción de polvo", "obra", 1, 35000, 15)],
      maquinaria: [inv("Sierra, cepilladora y router CNC", "set", 1, 120000, 10), inv("Lijadora, taladros y herramienta menor", "set", 1, 30000, 8), inv("Cabina de pintura y barnizado", "und", 1, 25000, 10)],
      mobiliario: [inv("Mesas de trabajo y estantería", "set", 1, 15000, 10), inv("Showroom y mobiliario de exhibición", "set", 1, 20000, 10)],
      activoDiferido: [inv("Software de diseño 3D y CNC", "global", 1, 12000, 5), inv("Marca, fotos y catálogo", "global", 1, 8000, 5)],
    },
    capitalTrabajo: 70000,
    personal: [puesto("Maestro carpintero", 1, 6500), puesto("Carpinteros", 3, 4000), puesto("Diseñador/asistente CAD", 1, 4500), puesto("Ventas y atención", 1, 3500)],
    costosDirectos: [
      directo(idSilla, "materia_prima", "Madera, tornillería y barniz por silla", "und", 1, 180),
      directo(idSilla, "mano_obra", "MOD por silla", "und", 1, 80),
      directo(idMesa, "materia_prima", "Madera, herrajes y barniz por mesa", "und", 1, 550),
      directo(idMesa, "mano_obra", "MOD por mesa", "und", 1, 220),
      directo(idMueble, "materia_prima", "Materiales por mueble grande (closet, kitchen)", "und", 1, 2200),
      directo(idMueble, "mano_obra", "MOD por mueble grande", "und", 1, 1100),
    ],
    costosAdministracion: [gasto("Alquiler del taller", 3500), gasto("Energía (CNC y herramientas)", 1800), gasto("Internet y telefonía", 400), gasto("Contabilidad", 800)],
    costosComercializacion: [gasto("Pauta en redes y catálogo", 1500), gasto("Comisión de showroom", 800)],
    productos: [
      { id: idSilla, nombre: "Silla a medida", unidadMedida: "und", cantidades: serie(840, 0.08), precios: serie(550, 0.04, 2) },
      { id: idMesa, nombre: "Mesa a medida", unidadMedida: "und", cantidades: serie(240, 0.08), precios: serie(1800, 0.04, 2) },
      { id: idMueble, nombre: "Mueble grande (closet, cocina)", unidadMedida: "und", cantidades: serie(48, 0.1), precios: serie(7500, 0.04, 2) },
    ],
    ...finCapm(),
    crecimientoIngresosAnual: 0.08, crecimientoCostosAnual: 0.04,
    tasasCrecCantidad: [8, 8, 8, 8], tasasCrecPrecio: [4, 4, 4, 4],
  };
}

function textilSweaters(): Proyecto {
  const idSweater = nuevoId(), idBufanda = nuevoId(), idGorro = nuevoId();
  return {
    ...base(),
    nombre: "Taller textil de alpaca «AltaFibra»",
    ubicacion: "El Alto, La Paz",
    descripcion: "Confección de sweaters, bufandas y gorros de alpaca para mercado local y exportación. Ejemplo MEDIANO de producción textil con materia prima nativa.",
    sector: "produccion",
    modeloIngreso: "unidades",
    inversiones: {
      terreno: [],
      obrasCiviles: [inv("Adecuación del taller", "obra", 1, 28000, 15)],
      maquinaria: [inv("Máquinas tejedoras industriales", "und", 8, 18000, 10), inv("Máquinas remalladoras y corte", "set", 1, 35000, 10), inv("Lavadora y secadora industrial", "und", 1, 22000, 10)],
      mobiliario: [inv("Mesas de corte y tendido", "set", 1, 15000, 10), inv("Estantería de almacenamiento", "set", 1, 8000, 10)],
      activoDiferido: [inv("Registro de marca y certificaciones de exportación", "global", 1, 15000, 5), inv("Diseño de colecciones y catálogo", "global", 1, 10000, 5)],
    },
    capitalTrabajo: 80000,
    personal: [puesto("Diseñador", 1, 6000), puesto("Tejedoras", 8, 3200), puesto("Confeccionistas", 4, 3000), puesto("Calidad y empaque", 2, 2800), puesto("Ventas y exportación", 2, 4500)],
    costosDirectos: [
      directo(idSweater, "materia_prima", "Hilo de alpaca por sweater", "und", 1, 80),
      directo(idSweater, "mano_obra", "MOD por sweater", "und", 1, 35),
      directo(idSweater, "empaque", "Etiqueta y bolsa premium", "und", 1, 8),
      directo(idBufanda, "materia_prima", "Hilo por bufanda", "und", 1, 30),
      directo(idBufanda, "mano_obra", "MOD por bufanda", "und", 1, 12),
      directo(idGorro, "materia_prima", "Hilo por gorro", "und", 1, 18),
      directo(idGorro, "mano_obra", "MOD por gorro", "und", 1, 8),
    ],
    costosAdministracion: [gasto("Alquiler", 4000), gasto("Energía y servicios", 2000), gasto("Internet y administración", 600), gasto("Contabilidad y exportación", 1500)],
    costosComercializacion: [gasto("Comisión a ferias y tiendas exportadoras", 4500), gasto("Marketing y catálogo digital", 1800)],
    productos: [
      { id: idSweater, nombre: "Sweater de alpaca", unidadMedida: "und", cantidades: serie(7200, 0.08), precios: serie(280, 0.04, 2) },
      { id: idBufanda, nombre: "Bufanda de alpaca", unidadMedida: "und", cantidades: serie(9600, 0.08), precios: serie(95, 0.04, 2) },
      { id: idGorro, nombre: "Gorro de alpaca", unidadMedida: "und", cantidades: serie(14400, 0.08), precios: serie(55, 0.04, 2) },
    ],
    ...finCapm(1.1),
    crecimientoIngresosAnual: 0.08, crecimientoCostosAnual: 0.04,
    tasasCrecCantidad: [8, 8, 8, 8], tasasCrecPrecio: [4, 4, 4, 4],
  };
}

// ============================================================================
// COMERCIO
// ============================================================================

function distribuidora(): Proyecto {
  const idAbarrotes = nuevoId(), idLimpieza = nuevoId(), idBebidas = nuevoId();
  return {
    ...base(),
    nombre: "Distribuidora mayorista «El Surtidor»",
    ubicacion: "Santa Cruz de la Sierra",
    descripcion: "Distribuidora que compra al por mayor y revende a tiendas de barrio. Ejemplo GRANDE de comercio: alto volumen, margen ajustado.",
    sector: "comercio",
    modeloIngreso: "unidades",
    inversiones: {
      terreno: [inv("Terreno para depósito y patio de carga", "m²", 800, 500, null)],
      obrasCiviles: [inv("Galpón depósito con andén de carga", "obra", 1, 150000, 20)],
      maquinaria: [inv("Montacargas y transpaletas", "set", 1, 55000, 10), inv("Camiones de reparto (2 unidades)", "vehículo", 2, 120000, 8)],
      mobiliario: [inv("Racks industriales y estantería", "set", 1, 40000, 10), inv("Sistema de inventario", "set", 1, 25000, 5)],
      activoDiferido: [inv("Licencias, NIT y constitución", "global", 1, 8000, 5), inv("Sistema ERP de distribución", "global", 1, 18000, 5)],
    },
    capitalTrabajo: 350000,
    personal: [puesto("Gerente comercial", 1, 8000), puesto("Vendedores de ruta", 5, 3500), puesto("Choferes de reparto", 2, 3500), puesto("Personal de depósito", 4, 2800), puesto("Administración", 2, 3800)],
    costosDirectos: [
      directo(idAbarrotes, "mercaderia", "Costo de abarrotes (compra mayorista)", "caja", 1, 180),
      directo(idLimpieza, "mercaderia", "Costo de productos de limpieza", "caja", 1, 95),
      directo(idBebidas, "mercaderia", "Costo de bebidas y gaseosas", "caja", 1, 140),
    ],
    costosAdministracion: [gasto("Combustible y mantenimiento de flota", 8000), gasto("Servicios básicos", 2500), gasto("Contabilidad, seguros e impuestos", 4000), gasto("Sistema y telefonía", 1500)],
    costosComercializacion: [gasto("Comisiones de venta por ruta", 7000), gasto("Promociones y POP", 2500)],
    productos: [
      { id: idAbarrotes, nombre: "Caja de abarrotes surtida", unidadMedida: "caja", cantidades: serie(60000, 0.07), precios: serie(215, 0.03, 2) },
      { id: idLimpieza, nombre: "Caja de limpieza", unidadMedida: "caja", cantidades: serie(30000, 0.07), precios: serie(118, 0.03, 2) },
      { id: idBebidas, nombre: "Caja de bebidas", unidadMedida: "caja", cantidades: serie(48000, 0.08), precios: serie(168, 0.03, 2) },
    ],
    ...finCapm(),
    crecimientoIngresosAnual: 0.07, crecimientoCostosAnual: 0.04,
    tasasCrecCantidad: [7, 7, 7, 7], tasasCrecPrecio: [3, 3, 3, 3],
  };
}

function tiendaOnline(): Proyecto {
  const idElectro = nuevoId(), idHogar = nuevoId(), idAcc = nuevoId();
  return {
    ...base(),
    nombre: "Tienda online «BoliviaMart»",
    ubicacion: "La Paz, oficina + depósito",
    descripcion: "E-commerce que vende electrónica, hogar y accesorios con envío nacional. Ejemplo MEDIANO de comercio digital con marketing como costo principal.",
    sector: "comercio",
    modeloIngreso: "unidades",
    inversiones: {
      terreno: [],
      obrasCiviles: [inv("Adecuación de mini-depósito", "obra", 1, 25000, 10)],
      maquinaria: [inv("Estaciones de empaque y báscula", "set", 1, 12000, 8), inv("Equipos de cómputo y red", "set", 1, 18000, 5)],
      mobiliario: [inv("Racks de almacenamiento", "set", 1, 15000, 10), inv("Mobiliario de oficina", "set", 1, 8000, 10)],
      activoDiferido: [inv("Plataforma e-commerce (Shopify+devs)", "global", 1, 30000, 5), inv("Marca, fotos profesionales y SEO inicial", "global", 1, 18000, 5)],
    },
    capitalTrabajo: 120000,
    personal: [puesto("Gerente", 1, 7500), puesto("Atención y ventas (chat)", 2, 3500), puesto("Almacén y picking", 2, 2800), puesto("Marketing y contenido", 1, 4500), puesto("Diseño y fotos", 1, 4000)],
    costosDirectos: [
      directo(idElectro, "mercaderia", "Costo de electrónica importada", "und", 1, 850),
      directo(idElectro, "comision_venta", "Comisión pasarela de pago", "und", 1, 35),
      directo(idHogar, "mercaderia", "Costo de productos para hogar", "und", 1, 180),
      directo(idHogar, "comision_venta", "Comisión pasarela", "und", 1, 12),
      directo(idAcc, "mercaderia", "Costo de accesorios", "und", 1, 35),
      directo(idAcc, "comision_venta", "Comisión pasarela", "und", 1, 3),
    ],
    costosAdministracion: [gasto("Alquiler de oficina/depósito", 3500), gasto("Hosting, dominio y herramientas SaaS", 1800), gasto("Internet", 400), gasto("Contabilidad", 1200)],
    costosComercializacion: [gasto("Pauta en Meta y Google Ads", 9000), gasto("Influencers y contenido", 2500), gasto("Envíos subsidiados", 3500)],
    productos: [
      { id: idElectro, nombre: "Electrónica (audífonos, accesorios)", unidadMedida: "und", cantidades: serie(2400, 0.15), precios: serie(1400, 0.03, 2) },
      { id: idHogar, nombre: "Productos para el hogar", unidadMedida: "und", cantidades: serie(7200, 0.15), precios: serie(320, 0.03, 2) },
      { id: idAcc, nombre: "Accesorios de moda", unidadMedida: "und", cantidades: serie(14400, 0.15), precios: serie(65, 0.03, 2) },
    ],
    ...finCapm(1.3),
    crecimientoIngresosAnual: 0.15, crecimientoCostosAnual: 0.06,
    tasasCrecCantidad: [15, 15, 12, 10], tasasCrecPrecio: [3, 3, 3, 3],
  };
}

function ferreteria(): Proyecto {
  const idHerram = nuevoId(), idConstruct = nuevoId(), idPintura = nuevoId();
  return {
    ...base(),
    nombre: "Ferretería de barrio «Construye Fácil»",
    ubicacion: "Cochabamba, zona sud",
    descripcion: "Ferretería tradicional con herramientas, materiales de construcción y pintura. Ejemplo MEDIANO de comercio especializado con inventario diverso.",
    sector: "comercio",
    modeloIngreso: "unidades",
    inversiones: {
      terreno: [],
      obrasCiviles: [inv("Adecuación y techado del local", "obra", 1, 45000, 15)],
      maquinaria: [inv("Camioneta de reparto", "vehículo", 1, 75000, 8), inv("Sierra y herramienta de corte", "set", 1, 12000, 10)],
      mobiliario: [inv("Estantería metálica y mostradores", "set", 1, 28000, 10), inv("Caja registradora y POS", "set", 1, 8000, 5)],
      activoDiferido: [inv("Licencias y registro", "global", 1, 4000, 5), inv("Cartel, marca y sistema de inventario", "global", 1, 10000, 5)],
    },
    capitalTrabajo: 180000,
    personal: [puesto("Encargado", 1, 5500), puesto("Vendedores", 3, 3200), puesto("Chofer/repartidor", 1, 3000), puesto("Cajero", 1, 2800)],
    costosDirectos: [
      directo(idHerram, "mercaderia", "Costo de herramientas (taladros, llaves)", "und", 1, 95),
      directo(idConstruct, "mercaderia", "Costo de materiales (cemento, fierro)", "und", 1, 55),
      directo(idPintura, "mercaderia", "Costo de pintura y barniz", "galón", 1, 75),
    ],
    costosAdministracion: [gasto("Alquiler del local", 4500), gasto("Servicios básicos", 800), gasto("Combustible camioneta", 1500), gasto("Contabilidad", 800)],
    costosComercializacion: [gasto("Pauta local y volantes", 600), gasto("Comisión por reparto a obras", 1200)],
    productos: [
      { id: idHerram, nombre: "Herramientas", unidadMedida: "und", cantidades: serie(7200, 0.06), precios: serie(165, 0.03, 2) },
      { id: idConstruct, nombre: "Materiales de construcción", unidadMedida: "und", cantidades: serie(28800, 0.07), precios: serie(95, 0.03, 2) },
      { id: idPintura, nombre: "Pintura y barniz", unidadMedida: "galón", cantidades: serie(4800, 0.06), precios: serie(135, 0.03, 2) },
    ],
    ...finCapm(),
    crecimientoIngresosAnual: 0.06, crecimientoCostosAnual: 0.04,
    tasasCrecCantidad: [6, 7, 6, 6], tasasCrecPrecio: [3, 3, 3, 3],
  };
}

// ============================================================================
// SERVICIOS PROFESIONALES
// ============================================================================

function lavanderia(): Proyecto {
  const idLavado = nuevoId(), idTintoreria = nuevoId(), idPlanchado = nuevoId();
  return {
    ...base(),
    nombre: "Lavandería industrial «AguaClara»",
    ubicacion: "La Paz, zona Miraflores",
    descripcion: "Lavandería con servicio a domicilio para hogares y contratos con hoteles. Ejemplo MEDIANO de servicios con maquinaria especializada.",
    sector: "servicios",
    modeloIngreso: "unidades",
    inversiones: {
      terreno: [],
      obrasCiviles: [inv("Adecuación del local y red de agua", "obra", 1, 40000, 15)],
      maquinaria: [inv("Lavadoras industriales (4 und)", "und", 4, 22000, 10), inv("Secadoras a gas (3 und)", "und", 3, 15000, 10), inv("Planchadora calandra y mesas", "set", 1, 18000, 10), inv("Equipo de tintorería en seco", "und", 1, 35000, 10)],
      mobiliario: [inv("Mostrador, estantería y carros", "set", 1, 15000, 10), inv("Camioneta para servicio a domicilio", "vehículo", 1, 65000, 8)],
      activoDiferido: [inv("Licencias y registro", "global", 1, 4000, 5), inv("Marca y sistema de tickets", "global", 1, 8000, 5)],
    },
    capitalTrabajo: 45000,
    personal: [puesto("Encargada", 1, 4500), puesto("Operarias de lavado", 4, 2800), puesto("Planchadoras", 2, 2700), puesto("Chofer/repartidor", 1, 3000), puesto("Atención al cliente", 1, 2800)],
    costosDirectos: [
      directo(idLavado, "insumo", "Detergente, suavizante por kg", "kg", 1, 3.5),
      directo(idLavado, "insumo", "Gas y energía por kg", "kg", 1, 1.8),
      directo(idTintoreria, "insumo", "Solvente y químicos por prenda", "und", 1, 12),
      directo(idPlanchado, "insumo", "Almidón y energía por prenda", "und", 1, 1.2),
    ],
    costosAdministracion: [gasto("Alquiler", 3500), gasto("Agua (alto consumo)", 2500), gasto("Gas industrial", 1800), gasto("Internet y POS", 400)],
    costosComercializacion: [gasto("Pauta digital y volantes", 800), gasto("Promociones a hoteles (descuento)", 1500)],
    productos: [
      { id: idLavado, nombre: "Lavado por kg", unidadMedida: "kg", cantidades: serie(36000, 0.08), precios: serie(15, 0.04, 2) },
      { id: idTintoreria, nombre: "Tintorería en seco", unidadMedida: "prenda", cantidades: serie(4800, 0.07), precios: serie(45, 0.04, 2) },
      { id: idPlanchado, nombre: "Planchado", unidadMedida: "prenda", cantidades: serie(14400, 0.07), precios: serie(8, 0.04, 2) },
    ],
    ...finCapm(),
    crecimientoIngresosAnual: 0.08, crecimientoCostosAnual: 0.04,
    tasasCrecCantidad: [8, 8, 7, 7], tasasCrecPrecio: [4, 4, 4, 4],
  };
}

function peluqueria(): Proyecto {
  const idCorte = nuevoId(), idTinte = nuevoId(), idManicure = nuevoId(), idTrat = nuevoId();
  return {
    ...base(),
    nombre: "Salón de belleza «Estilo Boliviano»",
    ubicacion: "Santa Cruz, zona Equipetrol",
    descripcion: "Salón unisex con corte, color, manicure y tratamientos. Ejemplo PEQUEÑO-MEDIANO de servicios con alta rotación y ticket medio.",
    sector: "servicios",
    modeloIngreso: "unidades",
    inversiones: {
      terreno: [],
      obrasCiviles: [inv("Adecuación del salón", "obra", 1, 35000, 10)],
      maquinaria: [inv("Lavacabezas y sillones hidráulicos", "set", 1, 25000, 10), inv("Secadores, planchas y herramientas", "set", 1, 12000, 5), inv("Estación de manicure y pedicure", "set", 1, 8000, 8)],
      mobiliario: [inv("Mobiliario de espera y decoración", "set", 1, 18000, 10), inv("Vitrinas para productos", "set", 1, 6000, 8)],
      activoDiferido: [inv("Licencias y marca", "global", 1, 6000, 5), inv("Sistema de citas y POS", "global", 1, 4000, 5)],
    },
    capitalTrabajo: 28000,
    personal: [puesto("Estilistas senior", 3, 4000), puesto("Manicuristas", 2, 3000), puesto("Recepcionista/cajera", 1, 3000), puesto("Auxiliar de limpieza", 1, 2500)],
    costosDirectos: [
      directo(idCorte, "insumo", "Productos y tijeras por corte", "servicio", 1, 8),
      directo(idTinte, "insumo", "Tintura y oxidante por servicio", "servicio", 1, 45),
      directo(idManicure, "insumo", "Esmaltes y productos por servicio", "servicio", 1, 15),
      directo(idTrat, "insumo", "Mascarillas y productos premium", "servicio", 1, 35),
    ],
    costosAdministracion: [gasto("Alquiler", 5500), gasto("Servicios básicos", 800), gasto("Internet y sistema citas", 350), gasto("Música y suscripciones", 300)],
    costosComercializacion: [gasto("Instagram, TikTok y promociones", 1500), gasto("Programa de fidelidad y descuentos", 800)],
    productos: [
      { id: idCorte, nombre: "Corte de cabello", unidadMedida: "servicio", cantidades: serie(6000, 0.07), precios: serie(55, 0.04, 2) },
      { id: idTinte, nombre: "Tinte/color", unidadMedida: "servicio", cantidades: serie(2400, 0.07), precios: serie(250, 0.04, 2) },
      { id: idManicure, nombre: "Manicure/pedicure", unidadMedida: "servicio", cantidades: serie(4800, 0.07), precios: serie(80, 0.04, 2) },
      { id: idTrat, nombre: "Tratamientos capilares", unidadMedida: "servicio", cantidades: serie(1800, 0.08), precios: serie(180, 0.04, 2) },
    ],
    ...finCapm(),
    crecimientoIngresosAnual: 0.07, crecimientoCostosAnual: 0.04,
    tasasCrecCantidad: [7, 7, 7, 7], tasasCrecPrecio: [4, 4, 4, 4],
  };
}

function consultoria(): Proyecto {
  const idEstrat = nuevoId(), idMkt = nuevoId(), idCap = nuevoId();
  return {
    ...base(),
    nombre: "Consultora de negocios «PymeBoost»",
    ubicacion: "La Paz, oficina + remoto",
    descripcion: "Consultora boutique en estrategia, marketing y capacitación para PYMES. Ejemplo PEQUEÑO de servicios profesionales: muy baja inversión, alto margen.",
    sector: "servicios",
    modeloIngreso: "unidades",
    inversiones: {
      terreno: [],
      obrasCiviles: [inv("Adecuación de oficina coworking", "obra", 1, 15000, 10)],
      maquinaria: [inv("Laptops, proyector y equipos", "set", 1, 28000, 5)],
      mobiliario: [inv("Mobiliario de oficina", "set", 1, 12000, 10)],
      activoDiferido: [inv("Web profesional y marca", "global", 1, 15000, 5), inv("Licencias de software (CRM, encuestas, BI)", "global", 1, 18000, 3)],
    },
    capitalTrabajo: 35000,
    personal: [puesto("Socio director", 1, 12000), puesto("Consultores senior", 2, 8000), puesto("Analistas", 3, 5000), puesto("Ejecutivo comercial", 1, 5500), puesto("Asistente administrativa", 1, 3500)],
    costosDirectos: [
      directo(idEstrat, "insumo_directo", "Materiales, viajes y subcontrataciones por proyecto", "proyecto", 1, 3500),
      directo(idMkt, "insumo_directo", "Pauta de prueba y diseño por servicio", "proyecto", 1, 1800),
      directo(idCap, "insumo_directo", "Materiales y catering por curso", "curso", 1, 800),
    ],
    costosAdministracion: [gasto("Alquiler de coworking", 3500), gasto("Internet y telefonía", 600), gasto("Contabilidad y legal", 1500), gasto("Software empresarial (HubSpot etc.)", 1800)],
    costosComercializacion: [gasto("LinkedIn Ads y contenido", 2500), gasto("Networking y eventos", 1500)],
    productos: [
      { id: idEstrat, nombre: "Consultoría estratégica (proyecto)", unidadMedida: "proyecto", cantidades: serie(36, 0.1), precios: serie(28000, 0.05, 2) },
      { id: idMkt, nombre: "Plan de marketing", unidadMedida: "proyecto", cantidades: serie(60, 0.1), precios: serie(15000, 0.05, 2) },
      { id: idCap, nombre: "Curso/taller corporativo", unidadMedida: "curso", cantidades: serie(96, 0.1), precios: serie(8500, 0.05, 2) },
    ],
    ...finCapm(0.9),
    crecimientoIngresosAnual: 0.1, crecimientoCostosAnual: 0.05,
    tasasCrecCantidad: [10, 10, 10, 10], tasasCrecPrecio: [5, 5, 5, 5],
  };
}

// ============================================================================
// SUSCRIPCIONES
// ============================================================================

function gimnasio(): Proyecto {
  const sus = { suscriptoresIniciales: 300, altasMensuales: 60, churnMensual: 0.05, cuotaMensual: 250 };
  const baseAnual: [number, number, number, number, number] = [520, 760, 980, 1120, 1200];
  const precioAnual = sus.cuotaMensual * 12;
  const idMembresia = nuevoId();
  return {
    ...base(),
    nombre: "Gimnasio «FitAndes» con membresías",
    ubicacion: "La Paz, zona Sopocachi",
    descripcion: "Gimnasio premium con membresías mensuales. Modelo SUSCRIPCIÓN: base recurrente de socios con altas y churn. Ejemplo GRANDE.",
    sector: "servicios",
    modeloIngreso: "suscripcion",
    suscripcionV2: sus,
    inversiones: {
      terreno: [],
      obrasCiviles: [inv("Adecuación 600 m² (vestuarios, duchas)", "obra", 1, 160000, 15)],
      maquinaria: [inv("Máquinas de musculación y peso libre", "set", 1, 180000, 8), inv("Cardio (cintas, elípticas)", "set", 1, 120000, 6), inv("Equipo de clases grupales", "set", 1, 35000, 6)],
      mobiliario: [inv("Lockers, recepción y mobiliario", "set", 1, 40000, 10), inv("Control de acceso y cámaras", "set", 1, 25000, 5)],
      activoDiferido: [inv("Licencias, marca y app de socios", "global", 1, 20000, 5)],
    },
    capitalTrabajo: 90000,
    personal: [puesto("Personal trainers", 6, 3800), puesto("Recepción", 3, 2800), puesto("Limpieza/mantenimiento", 3, 2600), puesto("Gerente", 1, 7000), puesto("Community manager", 1, 3500)],
    costosDirectos: [directo(idMembresia, "comision_venta", "Comisión de pasarela por socio/año", "socio/año", 1, Math.round(precioAnual * 0.04))],
    costosAdministracion: [gasto("Alquiler", 18000), gasto("Servicios básicos (alto consumo)", 7000), gasto("Mantenimiento de máquinas", 4000), gasto("Software de gestión", 1500), gasto("Seguros", 2000)],
    costosComercializacion: [gasto("Marketing digital", 6000), gasto("Promociones de temporada", 2000)],
    productos: [{ id: idMembresia, nombre: "Membresía anual", unidadMedida: "socio/año", cantidades: baseAnual, precios: [precioAnual, precioAnual, precioAnual, precioAnual, precioAnual] }],
    ...finCapm(),
    crecimientoIngresosAnual: 0.1, crecimientoCostosAnual: 0.04,
    tasasCrecCantidad: [0, 0, 0, 0], tasasCrecPrecio: [0, 0, 0, 0],
  };
}

function academiaOnline(): Proyecto {
  const sus = { suscriptoresIniciales: 80, altasMensuales: 35, churnMensual: 0.04, cuotaMensual: 180 };
  const baseAnual: [number, number, number, number, number] = [320, 540, 760, 920, 1050];
  const precioAnual = sus.cuotaMensual * 12;
  const idAcc = nuevoId();
  return {
    ...base(),
    nombre: "Academia online de programación «CódigoBol»",
    ubicacion: "100% remoto, sede en Cochabamba",
    descripcion: "Plataforma de cursos de programación con membresía mensual: acceso a todos los cursos, mentorías y bolsa de empleo. Modelo SUSCRIPCIÓN — escalable, marginal-cero.",
    sector: "servicios",
    modeloIngreso: "suscripcion",
    suscripcionV2: sus,
    inversiones: {
      terreno: [],
      obrasCiviles: [inv("Estudio de grabación insonorizado", "obra", 1, 15000, 8)],
      maquinaria: [inv("Cámaras, iluminación y audio", "set", 1, 25000, 5), inv("Estaciones de edición y servidores", "set", 1, 35000, 5)],
      mobiliario: [inv("Mobiliario de oficina y estudio", "set", 1, 8000, 8)],
      activoDiferido: [inv("Plataforma LMS y app (desarrollo)", "global", 1, 60000, 5), inv("Marca, branding y contenido fundador", "global", 1, 25000, 5)],
    },
    capitalTrabajo: 40000,
    personal: [puesto("Director de contenido", 1, 9000), puesto("Instructores en planta", 3, 6000), puesto("Mentores (medio tiempo)", 4, 3500), puesto("Editor de video", 1, 4500), puesto("Marketing y community", 2, 4000)],
    costosDirectos: [directo(idAcc, "comision_venta", "Comisión pasarela por suscriptor/año", "suscriptor/año", 1, Math.round(precioAnual * 0.05))],
    costosAdministracion: [gasto("Hosting LMS y video (Vimeo, AWS)", 4500), gasto("Software (Notion, Slack, Zoom)", 1200), gasto("Coworking ocasional", 1500), gasto("Contabilidad", 1000)],
    costosComercializacion: [gasto("Pauta digital (Meta, YouTube)", 8000), gasto("Influencers y afiliados", 3000), gasto("Eventos online", 1000)],
    productos: [{ id: idAcc, nombre: "Membresía anual", unidadMedida: "suscriptor/año", cantidades: baseAnual, precios: [precioAnual, precioAnual, precioAnual, precioAnual, precioAnual] }],
    ...finCapm(1.2),
    crecimientoIngresosAnual: 0.18, crecimientoCostosAnual: 0.06,
    tasasCrecCantidad: [0, 0, 0, 0], tasasCrecPrecio: [0, 0, 0, 0],
  };
}

function podcastPremium(): Proyecto {
  const sus = { suscriptoresIniciales: 150, altasMensuales: 40, churnMensual: 0.04, cuotaMensual: 35 };
  const baseAnual: [number, number, number, number, number] = [400, 700, 950, 1150, 1300];
  const precioAnual = sus.cuotaMensual * 12;
  const idSus = nuevoId();
  return {
    ...base(),
    nombre: "Podcast con membresía «Voces Bolivia»",
    ubicacion: "La Paz (online)",
    descripcion: "Podcast con contenido gratis + membresía premium (episodios extra, comunidad, contenido sin pauta). Modelo SUSCRIPCIÓN — ejemplo PEQUEÑO con creator economy.",
    sector: "servicios",
    modeloIngreso: "suscripcion",
    suscripcionV2: sus,
    inversiones: {
      terreno: [],
      obrasCiviles: [inv("Acondicionamiento acústico del estudio", "obra", 1, 8000, 8)],
      maquinaria: [inv("Micrófonos, interfaz y audífonos", "set", 1, 12000, 5), inv("Computadora y software de edición", "set", 1, 10000, 5)],
      mobiliario: [inv("Mobiliario del estudio", "set", 1, 4000, 8)],
      activoDiferido: [inv("Marca, web y plataforma de membresías", "global", 1, 4000, 5)],
    },
    capitalTrabajo: 20000,
    personal: [puesto("Conductor/productor", 1, 4000), puesto("Editor de audio", 1, 3000)],
    costosDirectos: [directo(idSus, "comision_venta", "Comisión pasarela", "suscriptor/año", 1, Math.round(precioAnual * 0.05))],
    costosAdministracion: [gasto("Hosting de audio y plataforma", 800), gasto("Internet", 250)],
    costosComercializacion: [gasto("Pauta para captar suscriptores", 1500), gasto("Colaboraciones con otros creators", 500)],
    productos: [{ id: idSus, nombre: "Membresía premium", unidadMedida: "suscriptor/año", cantidades: baseAnual, precios: [precioAnual, precioAnual, precioAnual, precioAnual, precioAnual] }],
    ...finCapm(1.1),
    crecimientoIngresosAnual: 0.12, crecimientoCostosAnual: 0.04,
    tasasCrecCantidad: [0, 0, 0, 0], tasasCrecPrecio: [0, 0, 0, 0],
  };
}

// ============================================================================
// MEDIOS Y PUBLICIDAD
// ============================================================================

function medioDigital(): Proyecto {
  const pub = { audienciaMensual: 120000, crecimientoMensual: 0.05, impresionesPorUsuario: 8, cpm: 50 };
  const milesImpresiones: [number, number, number, number, number] = [13800, 24000, 38000, 54000, 70000];
  const idEspacio = nuevoId();
  return {
    ...base(),
    nombre: "Medio digital «Noticias Bolivia Hoy»",
    ubicacion: "Santa Cruz (operación digital)",
    descripcion: "Portal de noticias y contenido que vive de pauta publicitaria. Modelo PUBLICIDAD — ejemplo GRANDE: audiencia × CPM.",
    sector: "servicios",
    modeloIngreso: "publicidad",
    publicidadV2: pub,
    inversiones: {
      terreno: [],
      obrasCiviles: [inv("Adecuación de redacción y set", "obra", 1, 25000, 10)],
      maquinaria: [inv("Cámaras, luces, micrófonos y set", "set", 1, 45000, 5), inv("Servidores, computadoras y edición", "set", 1, 60000, 5)],
      mobiliario: [inv("Mobiliario de redacción", "set", 1, 18000, 10)],
      activoDiferido: [inv("Desarrollo del portal y app", "global", 1, 50000, 5), inv("Marca, dominio y SEO inicial", "global", 1, 15000, 5)],
    },
    capitalTrabajo: 80000,
    personal: [puesto("Periodistas/redactores", 5, 4000), puesto("Editores de video y diseño", 3, 4200), puesto("Desarrollador/soporte", 1, 6500), puesto("Ejecutivo de ventas", 2, 4000), puesto("Director editorial", 1, 8000)],
    costosDirectos: [directo(idEspacio, "comision_venta", "Comisión de la red publicitaria", "mil impresiones", 1, Math.round(pub.cpm * 0.3))],
    costosAdministracion: [gasto("Hosting, CDN y herramientas SaaS", 4000), gasto("Internet y telefonía", 800), gasto("Contabilidad", 1500), gasto("Agencias de noticias y fotos", 2500)],
    costosComercializacion: [gasto("Pauta propia para crecer audiencia", 8000), gasto("Eventos y alianzas", 2000)],
    productos: [{ id: idEspacio, nombre: "Espacio publicitario", unidadMedida: "mil impresiones", cantidades: milesImpresiones, precios: [pub.cpm, pub.cpm, pub.cpm, pub.cpm, pub.cpm] }],
    ...finCapm(1.3),
    crecimientoIngresosAnual: 0.15, crecimientoCostosAnual: 0.05,
    tasasCrecCantidad: [0, 0, 0, 0], tasasCrecPrecio: [0, 0, 0, 0],
  };
}

function programaRadial(): Proyecto {
  const pub = { audienciaMensual: 80000, crecimientoMensual: 0.02, impresionesPorUsuario: 20, cpm: 60 };
  // Cuñas: 80000 × 20 × 12 = 19.2M impresiones/año (en miles: 19200)
  const milesImpresiones: [number, number, number, number, number] = [19200, 22000, 25000, 28000, 31000];
  const idCunia = nuevoId(), idMencion = nuevoId();
  return {
    ...base(),
    nombre: "Programa radial «Mañana en La Paz»",
    ubicacion: "La Paz, emisión FM + streaming",
    descripcion: "Programa matutino de 4 horas en una FM local + streaming online. Modelo PUBLICIDAD por cuñas y menciones patrocinadas. Ejemplo MEDIANO de medios tradicionales.",
    sector: "servicios",
    modeloIngreso: "publicidad",
    publicidadV2: pub,
    inversiones: {
      terreno: [],
      obrasCiviles: [inv("Adecuación acústica del estudio", "obra", 1, 18000, 10)],
      maquinaria: [inv("Consola, micrófonos y procesadores", "set", 1, 35000, 8), inv("Computadoras y software de emisión", "set", 1, 18000, 5), inv("Equipo de streaming y transmisión", "set", 1, 12000, 5)],
      mobiliario: [inv("Mobiliario del estudio y producción", "set", 1, 8000, 10)],
      activoDiferido: [inv("Licencia ATT, registro de marca", "global", 1, 25000, 5), inv("Web del programa y app", "global", 1, 15000, 5)],
    },
    capitalTrabajo: 35000,
    personal: [puesto("Conductor principal", 1, 8000), puesto("Co-conductor", 1, 5000), puesto("Productor", 1, 5500), puesto("Operador técnico", 1, 4000), puesto("Ejecutivo de ventas", 2, 4500), puesto("Community/contenido", 1, 3500)],
    costosDirectos: [
      directo(idCunia, "comision_venta", "Comisión agencias por cuña", "mil impresiones", 1, Math.round(pub.cpm * 0.15)),
      directo(idMencion, "comision_venta", "Comisión por mención patrocinada", "mil impresiones", 1, Math.round(pub.cpm * 0.15)),
    ],
    costosAdministracion: [gasto("Alquiler espacio en FM (host fee)", 8000), gasto("Energía e internet alto ancho de banda", 1500), gasto("Streaming y hosting", 1200), gasto("Licencias musicales SOBODAYCOM", 2000)],
    costosComercializacion: [gasto("Pauta cruzada en redes", 2500), gasto("Eventos y activaciones", 1500)],
    productos: [
      { id: idCunia, nombre: "Cuñas publicitarias", unidadMedida: "mil impresiones", cantidades: milesImpresiones, precios: [pub.cpm, pub.cpm, pub.cpm, pub.cpm, pub.cpm] },
      { id: idMencion, nombre: "Menciones patrocinadas", unidadMedida: "mil impresiones", cantidades: [4800, 5500, 6300, 7100, 8000], precios: [pub.cpm * 2, pub.cpm * 2, pub.cpm * 2, pub.cpm * 2, pub.cpm * 2] },
    ],
    ...finCapm(1.1),
    crecimientoIngresosAnual: 0.06, crecimientoCostosAnual: 0.04,
    tasasCrecCantidad: [0, 0, 0, 0], tasasCrecPrecio: [0, 0, 0, 0],
  };
}

function canalYoutube(): Proyecto {
  const pub = { audienciaMensual: 250000, crecimientoMensual: 0.08, impresionesPorUsuario: 15, cpm: 35 };
  const milesImpresiones: [number, number, number, number, number] = [54000, 90000, 145000, 220000, 310000];
  const idMonet = nuevoId(), idMarca = nuevoId();
  return {
    ...base(),
    nombre: "Canal de YouTube «Bolivia al Día»",
    ubicacion: "Cochabamba, producción remota",
    descripcion: "Canal de YouTube con contenido de viajes, cultura y noticias bolivianas. Modelo PUBLICIDAD: monetización AdSense + marcas patrocinadoras. Ejemplo MEDIANO de creator economy.",
    sector: "servicios",
    modeloIngreso: "publicidad",
    publicidadV2: pub,
    inversiones: {
      terreno: [],
      obrasCiviles: [inv("Adecuación de set interior", "obra", 1, 10000, 10)],
      maquinaria: [inv("Cámaras 4K, drone y gimbal", "set", 1, 45000, 5), inv("Iluminación profesional", "set", 1, 12000, 5), inv("Audio (mics, grabadora, lavaliers)", "set", 1, 8000, 5), inv("Estación de edición potente", "set", 1, 25000, 5)],
      mobiliario: [inv("Mobiliario de set y oficina", "set", 1, 6000, 10)],
      activoDiferido: [inv("Marca, intro y plantillas gráficas", "global", 1, 12000, 5), inv("Software (Premiere, After, etc.)", "global", 1, 8000, 3)],
    },
    capitalTrabajo: 30000,
    personal: [puesto("Conductor/host", 1, 7000), puesto("Editor de video", 2, 4500), puesto("Productor/director", 1, 5500), puesto("Camarógrafo", 1, 4000), puesto("Community manager", 1, 3500)],
    costosDirectos: [
      directo(idMonet, "comision_venta", "Comisión YouTube AdSense (Google se queda 45%)", "mil impresiones", 1, Math.round(pub.cpm * 0.45)),
      directo(idMarca, "comision_venta", "Comisión agencia por brand deal", "mil impresiones", 1, Math.round(pub.cpm * 0.2)),
    ],
    costosAdministracion: [gasto("Hosting de respaldo y software", 1200), gasto("Internet alto ancho de banda", 600), gasto("Contabilidad", 800)],
    costosComercializacion: [gasto("Pauta para crecer suscriptores", 3500), gasto("Colaboraciones y viajes", 2500), gasto("Miniaturas y SEO de YouTube", 800)],
    productos: [
      { id: idMonet, nombre: "Monetización AdSense", unidadMedida: "mil impresiones", cantidades: milesImpresiones, precios: [pub.cpm, pub.cpm, pub.cpm, pub.cpm, pub.cpm] },
      { id: idMarca, nombre: "Brand deals patrocinados", unidadMedida: "mil impresiones", cantidades: [5400, 9000, 14500, 22000, 31000], precios: [pub.cpm * 2.5, pub.cpm * 2.5, pub.cpm * 2.5, pub.cpm * 2.5, pub.cpm * 2.5] },
    ],
    ...finCapm(1.4),
    crecimientoIngresosAnual: 0.25, crecimientoCostosAnual: 0.05,
    tasasCrecCantidad: [0, 0, 0, 0], tasasCrecPrecio: [0, 0, 0, 0],
  };
}

// ============================================================================
// TURISMO
// ============================================================================

function operadoraTurismo(): Proyecto {
  const idUyuni = nuevoId(), idAmazonia = nuevoId(), idCity = nuevoId(), idTrekking = nuevoId();
  return {
    ...base(),
    nombre: "Operadora de turismo «Bolivia Mágica»",
    ubicacion: "La Paz, con operación nacional",
    descripcion: "Operadora de paquetes turísticos: Salar de Uyuni, Amazonía, city tours y trekking. Ejemplo GRANDE de turismo organizado con flota propia.",
    sector: "servicios",
    modeloIngreso: "unidades",
    inversiones: {
      terreno: [],
      obrasCiviles: [inv("Adecuación de oficina y agencia", "obra", 1, 35000, 15)],
      maquinaria: [inv("Flota 4x4 (3 unidades)", "vehículo", 3, 95000, 8), inv("Equipo de camping y trekking", "set", 1, 40000, 5), inv("Equipo de comunicación y GPS", "set", 1, 12000, 5)],
      mobiliario: [inv("Mobiliario de oficina", "set", 1, 18000, 10), inv("Sistema de reservas y cómputo", "set", 1, 22000, 5)],
      activoDiferido: [inv("Licencias turísticas VICEMINTUR", "global", 1, 10000, 5), inv("Web de reservas y catálogo", "global", 1, 15000, 5)],
    },
    capitalTrabajo: 120000,
    personal: [puesto("Guías bilingües", 4, 4500), puesto("Choferes profesionales", 3, 3800), puesto("Agente de ventas/reservas", 2, 3500), puesto("Coordinador de operaciones", 1, 6000), puesto("Administrador/contador", 1, 6000)],
    costosDirectos: [
      directo(idUyuni, "insumo_directo", "Alojamiento, comidas y entradas por pax", "pax", 1, 850),
      directo(idAmazonia, "insumo_directo", "Lodge, transporte fluvial y comidas", "pax", 1, 1100),
      directo(idCity, "insumo_directo", "Entradas y transporte por pax", "pax", 1, 120),
      directo(idTrekking, "insumo_directo", "Equipo, comida y porteadores", "pax", 1, 450),
    ],
    costosAdministracion: [gasto("Alquiler de oficina", 4500), gasto("Combustible y mantenimiento de flota", 8000), gasto("Servicios básicos", 1200), gasto("Seguros de pasajeros y vehículos", 3500), gasto("Contabilidad y licencias", 2000)],
    costosComercializacion: [gasto("Comisión OTAs (Booking, etc.)", 6000), gasto("Marketing digital y ferias", 4000), gasto("Material promocional multiidioma", 1000)],
    productos: [
      { id: idUyuni, nombre: "Tour Salar de Uyuni (3 días)", unidadMedida: "pax", cantidades: serie(1800, 0.08), precios: serie(1600, 0.05, 2) },
      { id: idAmazonia, nombre: "Expedición Amazonía (4 días)", unidadMedida: "pax", cantidades: serie(900, 0.08), precios: serie(2200, 0.05, 2) },
      { id: idCity, nombre: "City tour La Paz", unidadMedida: "pax", cantidades: serie(4200, 0.07), precios: serie(250, 0.04, 2) },
      { id: idTrekking, nombre: "Trekking Cordillera Real", unidadMedida: "pax", cantidades: serie(1100, 0.07), precios: serie(900, 0.05, 2) },
    ],
    ...finCapm(1.2),
    crecimientoIngresosAnual: 0.08, crecimientoCostosAnual: 0.04,
    tasasCrecCantidad: [8, 8, 7, 7], tasasCrecPrecio: [5, 5, 4, 4],
  };
}

function hostalBoutique(): Proyecto {
  const idSimple = nuevoId(), idDoble = nuevoId(), idSuite = nuevoId();
  return {
    ...base(),
    nombre: "Hostal boutique «Casa Andina»",
    ubicacion: "Sucre, casco histórico",
    descripcion: "Hostal boutique de 12 habitaciones con desayuno incluido y servicio de tours. Ejemplo MEDIANO de hospitalidad con factor de ocupación.",
    sector: "servicios",
    modeloIngreso: "unidades",
    inversiones: {
      terreno: [inv("Casa colonial restaurada (terreno+inmueble)", "inmueble", 1, 950000, null)],
      obrasCiviles: [inv("Restauración patrimonial y baños", "obra", 1, 180000, 25)],
      maquinaria: [inv("Lavandería interna y planchado", "set", 1, 25000, 10), inv("Cocina industrial y refri", "set", 1, 35000, 10), inv("Calefacción y caldera", "und", 1, 30000, 15)],
      mobiliario: [inv("Mobiliario de habitaciones (12)", "set", 1, 85000, 10), inv("Mobiliario de comedor y salones", "set", 1, 30000, 10), inv("Decoración y obras de arte locales", "set", 1, 25000, 15)],
      activoDiferido: [inv("Registro hotelero y permisos", "global", 1, 12000, 5), inv("Marca, web y plataformas (Booking, Airbnb)", "global", 1, 18000, 5)],
    },
    capitalTrabajo: 60000,
    personal: [puesto("Gerente del hostal", 1, 6500), puesto("Recepcionistas (3 turnos)", 3, 3000), puesto("Camareras/limpieza", 4, 2800), puesto("Cocinero/desayunos", 1, 4000), puesto("Mantenimiento", 1, 3000)],
    costosDirectos: [
      directo(idSimple, "insumo_directo", "Amenities, ropa cama y desayuno", "noche", 1, 35),
      directo(idDoble, "insumo_directo", "Amenities y desayuno doble", "noche", 1, 55),
      directo(idSuite, "insumo_directo", "Amenities premium y desayuno suite", "noche", 1, 90),
    ],
    costosAdministracion: [gasto("Servicios básicos", 4500), gasto("Internet y TV", 800), gasto("Mantenimiento del edificio", 2000), gasto("Seguros y licencias", 1500), gasto("Contabilidad", 1200)],
    costosComercializacion: [gasto("Comisión OTAs (Booking 15%, Airbnb 15%)", 5500), gasto("Marketing directo", 1500)],
    productos: [
      { id: idSimple, nombre: "Habitación simple", unidadMedida: "noche", cantidades: serie(1460, 0.05), precios: serie(280, 0.05, 2) },
      { id: idDoble, nombre: "Habitación doble", unidadMedida: "noche", cantidades: serie(2190, 0.05), precios: serie(420, 0.05, 2) },
      { id: idSuite, nombre: "Suite premium", unidadMedida: "noche", cantidades: serie(730, 0.05), precios: serie(780, 0.05, 2) },
    ],
    ...finCapm(1.1),
    crecimientoIngresosAnual: 0.06, crecimientoCostosAnual: 0.04,
    tasasCrecCantidad: [5, 5, 5, 5], tasasCrecPrecio: [5, 5, 5, 5],
  };
}

// ============================================================================
// AGRICULTURA
// ============================================================================

function cultivoQuinua(): Proyecto {
  const idQuinua = nuevoId(), idSubproducto = nuevoId();
  return {
    ...base(),
    nombre: "Cultivo y exportación de quinua real",
    ubicacion: "Potosí, altiplano sur",
    descripcion: "Producción agrícola de quinua real orgánica para exportación, más venta de subproductos. Ejemplo GRANDE de agricultura con certificación orgánica.",
    sector: "agricultura",
    modeloIngreso: "unidades",
    inversiones: {
      terreno: [inv("Terreno agrícola habilitado", "hectárea", 50, 8000, null)],
      obrasCiviles: [inv("Sistema de riego por aspersión", "sistema", 1, 120000, 15), inv("Galpón de acopio y secado", "obra", 1, 60000, 20)],
      maquinaria: [inv("Tractor y arado", "set", 1, 140000, 10), inv("Trilladora y seleccionadora", "set", 1, 80000, 10), inv("Equipo de empacado al vacío", "und", 1, 30000, 8)],
      mobiliario: [inv("Oficina de campo y básculas", "set", 1, 15000, 10)],
      activoDiferido: [inv("Certificación orgánica", "global", 1, 35000, 5), inv("Estudio de suelos", "global", 1, 12000, 5)],
    },
    capitalTrabajo: 140000,
    personal: [puesto("Ingeniero agrónomo", 1, 7000), puesto("Jornaleros (temporada)", 12, 2500), puesto("Operadores maquinaria", 2, 3500), puesto("Administración y exportación", 2, 4500)],
    costosDirectos: [
      directo(idQuinua, "semilla", "Semilla certificada de quinua real", "quintal", 1, 35),
      directo(idQuinua, "fertilizante", "Abono orgánico y bioinsumos", "quintal", 1, 28),
      directo(idQuinua, "riego_combustible", "Combustible y riego", "quintal", 1, 22),
      directo(idQuinua, "mano_obra_agricola", "Jornales de siembra y cosecha", "quintal", 1, 40),
      directo(idSubproducto, "mano_obra_agricola", "Procesamiento de subproductos", "quintal", 1, 18),
    ],
    costosAdministracion: [gasto("Energía, agua y servicios", 3000), gasto("Mantenimiento maquinaria y riego", 3500), gasto("Certificaciones anuales", 2500), gasto("Administración y logística", 4000)],
    costosComercializacion: [gasto("Flete a puerto y trámites", 6000), gasto("Ferias internacionales", 3000)],
    productos: [
      { id: idQuinua, nombre: "Quinua real orgánica (exportación)", unidadMedida: "quintal", cantidades: serie(9000, 0.06), precios: serie(620, 0.04, 2) },
      { id: idSubproducto, nombre: "Subproductos (harina, hojuelas)", unidadMedida: "quintal", cantidades: serie(2400, 0.06), precios: serie(380, 0.04, 2) },
    ],
    ...finCapm(),
    crecimientoIngresosAnual: 0.06, crecimientoCostosAnual: 0.04,
    tasasCrecCantidad: [6, 6, 6, 6], tasasCrecPrecio: [4, 4, 4, 4],
  };
}

function invernaderoHidroponico(): Proyecto {
  const idLechuga = nuevoId(), idTomate = nuevoId(), idHierbas = nuevoId();
  return {
    ...base(),
    nombre: "Invernadero hidropónico «VerdeAlto»",
    ubicacion: "El Alto, La Paz",
    descripcion: "Producción hidropónica de hortalizas premium para restaurantes y supermercados gourmet. Ejemplo MEDIANO de agricultura tecnificada con alta rotación.",
    sector: "agricultura",
    modeloIngreso: "unidades",
    inversiones: {
      terreno: [inv("Terreno con acceso a red eléctrica", "m²", 1500, 250, null)],
      obrasCiviles: [inv("Estructura de invernadero (3 módulos)", "módulo", 3, 75000, 15), inv("Reservorio y red hidráulica", "sistema", 1, 35000, 15)],
      maquinaria: [inv("Sistema NFT hidropónico completo", "sistema", 1, 90000, 10), inv("Control climático y sensores", "set", 1, 25000, 8), inv("Bombas y filtros", "set", 1, 18000, 8)],
      mobiliario: [inv("Oficina de campo y empacado", "set", 1, 12000, 10)],
      activoDiferido: [inv("Capacitación técnica e implementación", "global", 1, 20000, 5), inv("Certificaciones de calidad", "global", 1, 8000, 5)],
    },
    capitalTrabajo: 50000,
    personal: [puesto("Ingeniero agrónomo", 1, 6500), puesto("Técnicos de cultivo", 3, 3000), puesto("Personal de cosecha y empaque", 3, 2800), puesto("Ventas y distribución", 1, 4000)],
    costosDirectos: [
      directo(idLechuga, "semilla", "Semilla certificada de lechuga premium", "unidad", 1, 0.3),
      directo(idLechuga, "fertilizante", "Solución nutritiva NFT", "unidad", 1, 0.4),
      directo(idLechuga, "empaque", "Bandeja y film", "unidad", 1, 0.5),
      directo(idTomate, "semilla", "Semilla de tomate cherry premium", "kg", 1, 0.6),
      directo(idTomate, "fertilizante", "Nutrientes específicos", "kg", 1, 1.2),
      directo(idHierbas, "semilla", "Semillas de albahaca, menta", "atado", 1, 0.4),
      directo(idHierbas, "fertilizante", "Nutrientes para aromáticas", "atado", 1, 0.3),
    ],
    costosAdministracion: [gasto("Energía eléctrica (control climático)", 3500), gasto("Agua", 800), gasto("Mantenimiento del sistema", 1500), gasto("Internet y sistema de monitoreo", 400)],
    costosComercializacion: [gasto("Flota refrigerada de reparto", 2500), gasto("Marketing a chefs y supermercados", 800)],
    productos: [
      { id: idLechuga, nombre: "Lechuga premium hidropónica", unidadMedida: "unidad", cantidades: serie(120000, 0.08), precios: serie(8, 0.03, 2) },
      { id: idTomate, nombre: "Tomate cherry", unidadMedida: "kg", cantidades: serie(18000, 0.08), precios: serie(28, 0.03, 2) },
      { id: idHierbas, nombre: "Hierbas aromáticas", unidadMedida: "atado", cantidades: serie(36000, 0.08), precios: serie(6, 0.03, 2) },
    ],
    ...finCapm(0.9),
    crecimientoIngresosAnual: 0.08, crecimientoCostosAnual: 0.04,
    tasasCrecCantidad: [8, 8, 8, 8], tasasCrecPrecio: [3, 3, 3, 3],
  };
}

// ============================================================================
// COSTO-BENEFICIO
// ============================================================================

function plantaSolar(): Proyecto {
  const cb = { beneficioAnualBase: 320000, crecimientoAnual: 0.05 };
  const precios = [0, 1, 2, 3, 4].map(
    (i) => Math.round(cb.beneficioAnualBase * Math.pow(1 + cb.crecimientoAnual, i))
  ) as [number, number, number, number, number];
  const idBeneficio = nuevoId();
  return {
    ...base(),
    nombre: "Planta solar para empresa industrial",
    ubicacion: "Oruro (techo industrial)",
    descripcion: "Instalación de paneles solares para reducir la factura eléctrica de una fábrica. Modelo COSTO-BENEFICIO: ahorro anual vs. inversión.",
    sector: "servicios",
    modeloIngreso: "costo_beneficio",
    costoBeneficioV2: cb,
    inversiones: {
      terreno: [],
      obrasCiviles: [inv("Estructura de soporte en techo", "obra", 1, 90000, 25)],
      maquinaria: [inv("Paneles fotovoltaicos (200 kWp)", "sistema", 1, 700000, 25), inv("Inversores y monitoreo", "set", 1, 120000, 15), inv("Banco de baterías", "set", 1, 180000, 10)],
      mobiliario: [],
      activoDiferido: [inv("Estudio de ingeniería y permisos", "global", 1, 40000, 5), inv("Trámites de interconexión", "global", 1, 20000, 5)],
    },
    capitalTrabajo: 30000,
    personal: [puesto("Técnico de mantenimiento", 1, 5500), puesto("Supervisor energético (medio tiempo)", 1, 3000)],
    costosDirectos: [],
    costosAdministracion: [gasto("Mantenimiento y limpieza de paneles", 3000), gasto("Monitoreo, seguros y garantías", 2500)],
    costosComercializacion: [],
    productos: [{ id: idBeneficio, nombre: "Ahorro anual en factura eléctrica", unidadMedida: "año", cantidades: [1, 1, 1, 1, 1], precios }],
    ...finCapm(0.7),
    crecimientoIngresosAnual: 0.05, crecimientoCostosAnual: 0.03,
    tasasCrecCantidad: [0, 0, 0, 0], tasasCrecPrecio: [0, 0, 0, 0],
  };
}

function digitalizacionEmpresa(): Proyecto {
  // El beneficio = ahorros operativos (menos personal manual, errores) +
  // ventas adicionales del e-commerce. En empresas medianas suele rondar
  // 30-40% del costo de la inversión por año.
  const cb = { beneficioAnualBase: 480000, crecimientoAnual: 0.08 };
  const precios = [0, 1, 2, 3, 4].map(
    (i) => Math.round(cb.beneficioAnualBase * Math.pow(1 + cb.crecimientoAnual, i))
  ) as [number, number, number, number, number];
  const idBen = nuevoId();
  return {
    ...base(),
    nombre: "Digitalización completa de empresa familiar",
    ubicacion: "Santa Cruz (empresa con 50 empleados)",
    descripcion: "Proyecto interno para digitalizar una empresa: ERP, CRM, e-commerce, automatización de procesos. Modelo COSTO-BENEFICIO evaluado por el ahorro operativo + ventas adicionales.",
    sector: "servicios",
    modeloIngreso: "costo_beneficio",
    costoBeneficioV2: cb,
    inversiones: {
      terreno: [],
      obrasCiviles: [inv("Adecuación de sala de servidores", "obra", 1, 12000, 10)],
      maquinaria: [inv("Servidores y equipos de red", "set", 1, 35000, 5), inv("Computadoras y dispositivos", "set", 1, 80000, 4)],
      mobiliario: [],
      activoDiferido: [
        inv("Implementación ERP (Odoo/SAP)", "global", 1, 120000, 5),
        inv("Implementación CRM (HubSpot/Salesforce)", "global", 1, 60000, 5),
        inv("Desarrollo de e-commerce", "global", 1, 45000, 5),
        inv("Capacitación del personal", "global", 1, 25000, 3),
      ],
    },
    capitalTrabajo: 20000,
    personal: [puesto("CTO / responsable de tecnología", 1, 9000), puesto("Soporte técnico", 1, 4500)],
    costosDirectos: [],
    costosAdministracion: [gasto("Licencias SaaS (ERP, CRM, otros)", 6000), gasto("Hosting cloud y backups", 1500), gasto("Soporte de proveedores", 2000)],
    costosComercializacion: [],
    productos: [{ id: idBen, nombre: "Ahorro operativo + ventas digitales adicionales", unidadMedida: "año", cantidades: [1, 1, 1, 1, 1], precios }],
    ...finCapm(0.9),
    crecimientoIngresosAnual: 0.08, crecimientoCostosAnual: 0.04,
    tasasCrecCantidad: [0, 0, 0, 0], tasasCrecPrecio: [0, 0, 0, 0],
  };
}

// ============================================================================
// REGISTRO EXPORTADO
// ============================================================================

export const PLANTILLAS: PlantillaMeta[] = [
  // Gastronomía
  { clave: "restaurante", titulo: "Restaurante temático", emoji: "🍽️", categoria: "gastronomia", sector: "Servicios", modelo: "unidades", modeloLabel: "Servicios", escala: "Grande", resumen: "Platos, bebidas, postres y salón de eventos.", crear: restaurante },
  { clave: "cafeteria", titulo: "Cafetería de especialidad", emoji: "☕", categoria: "gastronomia", sector: "Servicios", modelo: "unidades", modeloLabel: "Servicios", escala: "Mediano", resumen: "Café de origen, postres y almuerzos ligeros.", crear: cafeteria },
  { clave: "foodtruck", titulo: "Food truck móvil", emoji: "🚐", categoria: "gastronomia", sector: "Servicios", modelo: "unidades", modeloLabel: "Servicios", escala: "Pequeño", resumen: "Hamburguesas gourmet que rotan por ferias y eventos.", crear: foodTruck },
  { clave: "panaderia", titulo: "Panadería artesanal", emoji: "🥖", categoria: "gastronomia", sector: "Producción", modelo: "unidades", modeloLabel: "Producción", escala: "Mediano", resumen: "Pan integral, galletas y tortas por encargo.", crear: panaderiaArtesanal },

  // Producción
  { clave: "fabrica", titulo: "Fábrica de snacks", emoji: "🏭", categoria: "produccion", sector: "Producción", modelo: "unidades", modeloLabel: "Producción", escala: "Grande", resumen: "Granola, barras y mantequilla de maní industrial.", crear: fabricaSnacks },
  { clave: "embotelladora", titulo: "Embotelladora de jugos", emoji: "🧃", categoria: "produccion", sector: "Producción", modelo: "unidades", modeloLabel: "Producción", escala: "Mediano", resumen: "Jugos naturales pasteurizados con cadena de frío.", crear: embotelladoraJugos },
  { clave: "muebles", titulo: "Taller de muebles", emoji: "🪑", categoria: "produccion", sector: "Producción", modelo: "unidades", modeloLabel: "Producción", escala: "Mediano", resumen: "Carpintería a medida: sillas, mesas, closets.", crear: tallerMuebles },
  { clave: "textil", titulo: "Taller textil de alpaca", emoji: "🧶", categoria: "produccion", sector: "Producción", modelo: "unidades", modeloLabel: "Producción", escala: "Mediano", resumen: "Sweaters, bufandas y gorros para exportación.", crear: textilSweaters },

  // Comercio
  { clave: "distribuidora", titulo: "Distribuidora mayorista", emoji: "📦", categoria: "comercio", sector: "Comercio", modelo: "unidades", modeloLabel: "Comercio", escala: "Grande", resumen: "Compra y reventa al por mayor a tiendas de barrio.", crear: distribuidora },
  { clave: "tiendaonline", titulo: "Tienda online", emoji: "🛒", categoria: "comercio", sector: "Comercio", modelo: "unidades", modeloLabel: "Comercio", escala: "Mediano", resumen: "E-commerce de electrónica, hogar y accesorios.", crear: tiendaOnline },
  { clave: "ferreteria", titulo: "Ferretería de barrio", emoji: "🔧", categoria: "comercio", sector: "Comercio", modelo: "unidades", modeloLabel: "Comercio", escala: "Mediano", resumen: "Herramientas, materiales de construcción y pintura.", crear: ferreteria },

  // Servicios
  { clave: "lavanderia", titulo: "Lavandería industrial", emoji: "🧺", categoria: "servicios", sector: "Servicios", modelo: "unidades", modeloLabel: "Servicios", escala: "Mediano", resumen: "Lavado, tintorería y planchado, hogares + hoteles.", crear: lavanderia },
  { clave: "peluqueria", titulo: "Salón de belleza", emoji: "💇", categoria: "servicios", sector: "Servicios", modelo: "unidades", modeloLabel: "Servicios", escala: "Pequeño", resumen: "Corte, color, manicure y tratamientos.", crear: peluqueria },
  { clave: "consultora", titulo: "Consultora de negocios", emoji: "💼", categoria: "servicios", sector: "Servicios", modelo: "unidades", modeloLabel: "Servicios", escala: "Pequeño", resumen: "Estrategia, marketing y capacitación para PYMES.", crear: consultoria },

  // Suscripciones
  { clave: "gimnasio", titulo: "Gimnasio con membresías", emoji: "💪", categoria: "suscripcion", sector: "Servicios", modelo: "suscripcion", modeloLabel: "Suscripción", escala: "Grande", resumen: "Base recurrente de socios con altas y churn.", crear: gimnasio },
  { clave: "academia", titulo: "Academia online", emoji: "🎓", categoria: "suscripcion", sector: "Servicios", modelo: "suscripcion", modeloLabel: "Suscripción", escala: "Mediano", resumen: "Cursos de programación con membresía mensual.", crear: academiaOnline },
  { clave: "podcast", titulo: "Podcast con membresía", emoji: "🎙️", categoria: "suscripcion", sector: "Servicios", modelo: "suscripcion", modeloLabel: "Suscripción", escala: "Pequeño", resumen: "Episodios extra y comunidad para suscriptores.", crear: podcastPremium },

  // Medios
  { clave: "medio", titulo: "Medio digital", emoji: "📰", categoria: "medios", sector: "Servicios", modelo: "publicidad", modeloLabel: "Publicidad", escala: "Grande", resumen: "Portal de noticias que vive de pauta. Audiencia × CPM.", crear: medioDigital },
  { clave: "radio", titulo: "Programa radial", emoji: "📻", categoria: "medios", sector: "Servicios", modelo: "publicidad", modeloLabel: "Publicidad", escala: "Mediano", resumen: "Matutino FM + streaming con cuñas y menciones.", crear: programaRadial },
  { clave: "youtube", titulo: "Canal de YouTube", emoji: "📹", categoria: "medios", sector: "Servicios", modelo: "publicidad", modeloLabel: "Publicidad", escala: "Mediano", resumen: "Viajes, cultura y noticias. AdSense + brand deals.", crear: canalYoutube },

  // Turismo
  { clave: "turismo", titulo: "Operadora de turismo", emoji: "🏔️", categoria: "turismo", sector: "Servicios", modelo: "unidades", modeloLabel: "Rutas turísticas", escala: "Grande", resumen: "Uyuni, Amazonía, city tours y trekking.", crear: operadoraTurismo },
  { clave: "hostal", titulo: "Hostal boutique", emoji: "🏨", categoria: "turismo", sector: "Servicios", modelo: "unidades", modeloLabel: "Hospitalidad", escala: "Mediano", resumen: "Casa colonial restaurada con 12 habitaciones.", crear: hostalBoutique },

  // Agricultura
  { clave: "quinua", titulo: "Cultivo de quinua", emoji: "🌾", categoria: "agricultura", sector: "Agricultura", modelo: "unidades", modeloLabel: "Agricultura", escala: "Grande", resumen: "Quinua real orgánica para exportación.", crear: cultivoQuinua },
  { clave: "hidroponico", titulo: "Invernadero hidropónico", emoji: "🌱", categoria: "agricultura", sector: "Agricultura", modelo: "unidades", modeloLabel: "Agricultura tecnificada", escala: "Mediano", resumen: "Lechuga, tomate y hierbas premium para gourmet.", crear: invernaderoHidroponico },

  // Costo-beneficio
  { clave: "solar", titulo: "Planta solar industrial", emoji: "☀️", categoria: "costo_beneficio", sector: "Servicios", modelo: "costo_beneficio", modeloLabel: "Costo-beneficio", escala: "Grande", resumen: "Paneles solares evaluados por ahorro vs inversión.", crear: plantaSolar },
  { clave: "digitalizacion", titulo: "Digitalización de empresa", emoji: "💻", categoria: "costo_beneficio", sector: "Servicios", modelo: "costo_beneficio", modeloLabel: "Costo-beneficio", escala: "Mediano", resumen: "ERP, CRM y e-commerce evaluado por ahorro + ventas.", crear: digitalizacionEmpresa },
];
