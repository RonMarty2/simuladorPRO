import type {
  ItemInversion,
  Proyecto,
  CategoriaCostoDirecto,
} from "@/types/proyecto";
import { nuevoId } from "@/lib/proyecto-factory";
import { conColchonDeCaja } from "./colchon-caja";
import { construirFlujoCaja } from "./flujo-proyecto";

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

/**
 * Ajusta la demanda de un ejemplo (cantidades de todos sus productos) por un
 * factor. Se usa para calibrar los ejemplos de la galería a rentabilidades
 * creíbles sin reescribir cada serie: el factor está en el registro del final.
 */
export function calibrarDemanda(p: Proyecto, factor: number): Proyecto {
  return {
    ...p,
    productos: p.productos.map((pr) => ({
      ...pr,
      cantidades: pr.cantidades.map((c) =>
        c >= 10 ? Math.round(c * factor) : Math.round(c * factor * 100) / 100
      ) as typeof pr.cantidades,
    })),
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
  | "costo_beneficio"
  | "marketing"
  | "social"
  | "eventos"
  | "alquiler"
  | "tecnologia";

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
  /** Qué aprende el alumno con este ejemplo: qué se mide y el supuesto clave. */
  ensena?: string;
  /** Resultado esperado de la evaluación, para ejemplos pensados como caso de decisión. */
  veredicto?: "viable" | "marginal" | "rechazo";
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
  marketing: { titulo: "Marketing y campañas", emoji: "📣", descripcion: "Planes y campañas evaluados por las ventas adicionales que generan." },
  social: { titulo: "Proyectos sociales y públicos", emoji: "🏫", descripcion: "Escuelas, salud, agua: el beneficio se traduce a bolivianos con supuestos explícitos." },
  eventos: { titulo: "Eventos y proyectos puntuales", emoji: "🎪", descripcion: "Festivales, ferias y producciones con ingresos concentrados." },
  tecnologia: { titulo: "Tecnología y plataformas", emoji: "📱", descripcion: "Apps y plataformas: costo de desarrollo alto, ingreso por comisión y escala." },
  alquiler: { titulo: "Alquiler y renta", emoji: "🏢", descripcion: "Inmuebles y activos que generan renta: gran inversión inicial y flujo estable." },
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
    personal: [puesto("Chef ejecutivo", 1, 9000), puesto("Cocineros", 3, 4000), puesto("Meseros", 5, 3300), puesto("Cajero/anfitrión", 2, 3300), puesto("Administrador", 1, 6500), puesto("Limpieza", 2, 3300)],
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
    personal: [puesto("Barista", 2, 3300), puesto("Cajero/mesero", 1, 3300), puesto("Administrador", 1, 5000)],
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
    personal: [puesto("Cocinero", 1, 3500), puesto("Asistente/cajero", 1, 3300)],
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
    personal: [puesto("Panadero/maestro", 1, 4500), puesto("Asistente de panadería", 2, 3300), puesto("Vendedor/despacho", 1, 3300)],
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
    personal: [puesto("Jefe de planta", 1, 8000), puesto("Operarios", 8, 3300), puesto("Control de calidad", 2, 4000), puesto("Almacén y logística", 2, 3300), puesto("Administración y ventas", 3, 4500)],
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
    personal: [puesto("Jefe de planta", 1, 7000), puesto("Operarios de línea", 6, 3300), puesto("Control de calidad", 1, 4500), puesto("Distribución", 2, 3300), puesto("Ventas", 2, 4000)],
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
    personal: [puesto("Diseñador", 1, 6000), puesto("Tejedoras", 8, 3300), puesto("Confeccionistas", 4, 3300), puesto("Calidad y empaque", 2, 3300), puesto("Ventas y exportación", 2, 4500)],
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
    personal: [puesto("Gerente comercial", 1, 8000), puesto("Vendedores de ruta", 5, 3500), puesto("Choferes de reparto", 2, 3500), puesto("Personal de depósito", 4, 3300), puesto("Administración", 2, 3800)],
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
    personal: [puesto("Gerente", 1, 7500), puesto("Atención y ventas (chat)", 2, 3500), puesto("Almacén y picking", 2, 3300), puesto("Marketing y contenido", 1, 4500), puesto("Diseño y fotos", 1, 4000)],
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
    personal: [puesto("Encargado", 1, 5500), puesto("Vendedores", 3, 3300), puesto("Chofer/repartidor", 1, 3300), puesto("Cajero", 1, 3300)],
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
    personal: [puesto("Encargada", 1, 4500), puesto("Operarias de lavado", 4, 3300), puesto("Planchadoras", 2, 3300), puesto("Chofer/repartidor", 1, 3300), puesto("Atención al cliente", 1, 3300)],
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
    personal: [puesto("Estilistas senior", 3, 4000), puesto("Manicuristas", 2, 3300), puesto("Recepcionista/cajera", 1, 3300), puesto("Auxiliar de limpieza", 1, 3300)],
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
    personal: [puesto("Personal trainers", 6, 3800), puesto("Recepción", 3, 3300), puesto("Limpieza/mantenimiento", 3, 3300), puesto("Gerente", 1, 7000), puesto("Community manager", 1, 3500)],
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
    personal: [puesto("Conductor/productor", 1, 4000), puesto("Editor de audio", 1, 3300)],
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
    personal: [puesto("Gerente del hostal", 1, 6500), puesto("Recepcionistas (3 turnos)", 3, 3300), puesto("Camareras/limpieza", 4, 3300), puesto("Cocinero/desayunos", 1, 4000), puesto("Mantenimiento", 1, 3300)],
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
    personal: [puesto("Ingeniero agrónomo", 1, 7000), puesto("Jornaleros (temporada)", 12, 3300), puesto("Operadores maquinaria", 2, 3500), puesto("Administración y exportación", 2, 4500)],
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
    personal: [puesto("Ingeniero agrónomo", 1, 6500), puesto("Técnicos de cultivo", 3, 3300), puesto("Personal de cosecha y empaque", 3, 3300), puesto("Ventas y distribución", 1, 4000)],
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
  const cb = { beneficioAnualBase: 520000, crecimientoAnual: 0.08 };
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
// COSTO-BENEFICIO / PROYECTOS PARTICULARES (tanda 1)
// ============================================================================

/** Serie de beneficio anual con crecimiento, para los proyectos costo-beneficio. */
function beneficioAnual(base: number, crecimiento: number) {
  const precios = [0, 1, 2, 3, 4].map(
    (i) => Math.round(base * Math.pow(1 + crecimiento, i))
  ) as [number, number, number, number, number];
  return { cb: { beneficioAnualBase: base, crecimientoAnual: crecimiento }, precios };
}

/** Financiamiento 100% propio (aporte o donación) con tasa social de descuento. */
function finSocial(tasa: number): Pick<Proyecto, "financiamiento" | "capmV2"> {
  return {
    financiamiento: {
      porcentajePropio: 1,
      porcentajePrestamo: 0,
      tasaInteresAnual: 0.1,
      plazoMeses: 60,
      costoOportunidadAccionista: tasa,
      prestamoCapitalTrabajo: { porcentajePropio: 1, porcentajePrestamo: 0, tasaInteresAnual: 0.1, plazoMeses: 48 },
    },
    capmV2: { tasaLibreRiesgo: 0.04, beta: (tasa - 0.04) / 0.08, primaMercado: 0.08 },
  };
}

function planMarketingRestaurante(): Proyecto {
  // Beneficio = margen bruto de las ventas adicionales atribuidas a la campaña
  // (ventas extra × margen de contribución), NO las ventas totales del local.
  const { cb, precios } = beneficioAnual(215000, 0.06);
  const idBen = nuevoId();
  return {
    ...base(),
    nombre: "Plan de marketing digital para un restaurante",
    ubicacion: "Cochabamba",
    descripcion: "Un restaurante existente invierte en marca, sitio web con reservas, contenido en redes y pauta pagada. El beneficio es el margen de las ventas ADICIONALES que trae el plan (clientes nuevos y mayor frecuencia), no las ventas del local.",
    sector: "servicios",
    modeloIngreso: "costo_beneficio",
    costoBeneficioV2: cb,
    inversiones: {
      terreno: [],
      obrasCiviles: [],
      maquinaria: [inv("Equipo de foto y video para contenido", "set", 1, 14000, 4)],
      mobiliario: [],
      activoDiferido: [inv("Estrategia y rediseño de marca", "global", 1, 15000, 5), inv("Sitio web con reservas en línea", "global", 1, 18000, 5)],
    },
    capitalTrabajo: 10000,
    personal: [puesto("Community manager", 1, 3500), puesto("Diseñador (medio tiempo)", 1, 2000)],
    costosDirectos: [],
    costosAdministracion: [gasto("Herramientas y software de marketing", 800)],
    costosComercializacion: [gasto("Pauta pagada en redes", 3800), gasto("Alianzas con influencers locales", 1200)],
    productos: [{ id: idBen, nombre: "Margen de ventas adicionales atribuidas al plan", unidadMedida: "año", cantidades: [1, 1, 1, 1, 1], precios }],
    ...finCapm(1.1),
    crecimientoIngresosAnual: 0.06, crecimientoCostosAnual: 0.04,
    tasasCrecCantidad: [0, 0, 0, 0], tasasCrecPrecio: [0, 0, 0, 0],
  };
}

function campanaMasivaTv(): Proyecto {
  const { cb, precios } = beneficioAnual(440000, 0.0);
  const idBen = nuevoId();
  return {
    ...base(),
    nombre: "Campaña masiva en TV y vallas para una marca local",
    ubicacion: "La Paz y El Alto",
    descripcion: "Una marca regional de lácteos compra espacios en televisión y vallas en las dos ciudades. El costo es alto y fijo, mientras que el efecto sobre las ventas es incierto y se diluye cuando termina la pauta. Ejemplo de RECHAZO: la campaña no recupera su costo.",
    sector: "servicios",
    modeloIngreso: "costo_beneficio",
    costoBeneficioV2: cb,
    inversiones: {
      terreno: [],
      obrasCiviles: [],
      maquinaria: [],
      mobiliario: [inv("Vallas publicitarias (instalación)", "valla", 6, 16000, 3)],
      activoDiferido: [inv("Producción de spots de TV", "spot", 2, 45000, 3), inv("Agencia: estrategia y plan de medios", "global", 1, 30000, 3)],
    },
    capitalTrabajo: 20000,
    personal: [puesto("Coordinador de campaña", 1, 6000)],
    costosDirectos: [],
    costosAdministracion: [gasto("Seguimiento y medición", 1500)],
    costosComercializacion: [gasto("Pauta en TV (paquete mensual)", 18000), gasto("Alquiler de espacios en vallas", 6000)],
    productos: [{ id: idBen, nombre: "Margen de ventas adicionales atribuidas a la campaña", unidadMedida: "año", cantidades: [1, 1, 1, 1, 1], precios }],
    ...finCapm(1.2),
    crecimientoIngresosAnual: 0, crecimientoCostosAnual: 0.04,
    tasasCrecCantidad: [0, 0, 0, 0], tasasCrecPrecio: [0, 0, 0, 0],
  };
}

function postaSalud(): Proyecto {
  // Beneficio social monetizado: atenciones × valor por atención (traslado
  // evitado + jornada laboral no perdida + complicaciones prevenidas).
  const { cb, precios } = beneficioAnual(560000, 0.03);
  const idBen = nuevoId();
  return {
    ...base(),
    nombre: "Posta de salud comunitaria",
    ubicacion: "Municipio rural de Potosí",
    descripcion: "Construcción y operación de una posta de salud para 4.000 habitantes que hoy viajan más de 3 horas al hospital. No genera ingresos: el beneficio se estima en bolivianos como traslados evitados, jornadas de trabajo no perdidas y complicaciones prevenidas. Financiamiento 100% propio (gobierno municipal) y tasa social de descuento.",
    sector: "servicios",
    modeloIngreso: "costo_beneficio",
    costoBeneficioV2: cb,
    inversiones: {
      terreno: [inv("Terreno cedido por la comunidad (valor estimado)", "lote", 1, 30000, null)],
      obrasCiviles: [inv("Construcción de la posta (consultorio, sala de partos, farmacia)", "obra", 1, 360000, 30)],
      maquinaria: [inv("Equipamiento médico básico", "set", 1, 90000, 10), inv("Panel solar y refrigeración de vacunas", "set", 1, 45000, 10)],
      mobiliario: [inv("Mobiliario clínico", "set", 1, 25000, 10)],
      activoDiferido: [inv("Estudios, licencias y capacitación inicial", "global", 1, 20000, 5)],
    },
    capitalTrabajo: 25000,
    personal: [puesto("Médico general", 1, 7000), puesto("Enfermera", 1, 4200), puesto("Auxiliar y promotor de salud", 1, 3300)],
    costosDirectos: [],
    costosAdministracion: [gasto("Medicamentos e insumos", 6000), gasto("Servicios básicos y mantenimiento", 1500)],
    costosComercializacion: [],
    productos: [{ id: idBen, nombre: "Beneficio social anual (traslados, jornadas y complicaciones evitados)", unidadMedida: "año", cantidades: [1, 1, 1, 1, 1], precios }],
    ...finSocial(0.08),
    crecimientoIngresosAnual: 0.03, crecimientoCostosAnual: 0.03,
    tasasCrecCantidad: [0, 0, 0, 0], tasasCrecPrecio: [0, 0, 0, 0],
  };
}

function festivalMusica(): Proyecto {
  const idEntrada = nuevoId(), idBarra = nuevoId(), idAuspicio = nuevoId();
  return {
    ...base(),
    nombre: "Festival de música «Altiplano Vivo»",
    ubicacion: "Oruro",
    descripcion: "Festival anual de 3 días. Ingresos concentrados: entradas, consumo en barras y auspicios. Los cachets de artistas son el costo dominante y casi no se pueden reducir. Ejemplo MARGINAL: el proyecto rinde apenas por encima del costo del capital y depende de llenar el aforo.",
    sector: "servicios",
    modeloIngreso: "unidades",
    inversiones: {
      terreno: [],
      obrasCiviles: [],
      maquinaria: [inv("Escenario, sonido e iluminación", "set", 1, 180000, 8)],
      mobiliario: [inv("Carpas, vallas y baños portátiles propios", "set", 1, 60000, 6)],
      activoDiferido: [inv("Permisos, seguros y marca del festival", "global", 1, 25000, 5)],
    },
    capitalTrabajo: 90000,
    personal: [puesto("Productor general", 1, 7000), puesto("Coordinador logístico", 1, 4500)],
    costosDirectos: [
      directo(idEntrada, "insumo_directo", "Seguridad, sanitarios y logística por asistente", "entrada", 1, 22),
      directo(idBarra, "mercaderia", "Bebidas y comida para reventa", "consumo", 1, 21),
    ],
    costosAdministracion: [gasto("Cachets de artistas y hospedaje", 880000, "año"), gasto("Permisos municipales y seguros", 28000, "año")],
    costosComercializacion: [gasto("Campaña de promoción del festival", 120000, "año")],
    productos: [
      { id: idEntrada, nombre: "Entradas (3 días)", unidadMedida: "entrada", cantidades: serie(8000, 0.05), precios: serie(140, 0.04, 2) },
      { id: idBarra, nombre: "Consumo en barras y comida", unidadMedida: "consumo", cantidades: serie(14000, 0.05), precios: serie(40, 0.04, 2) },
      { id: idAuspicio, nombre: "Auspicios de marcas", unidadMedida: "auspicio", cantidades: [5, 5, 6, 6, 7], precios: serie(40000, 0.05, 2) },
    ],
    ...finCapm(1.3),
    crecimientoIngresosAnual: 0.05, crecimientoCostosAnual: 0.04,
    tasasCrecCantidad: [5, 5, 5, 5], tasasCrecPrecio: [4, 4, 4, 4],
  };
}

function edificioAlquiler(): Proyecto {
  const idDepto = nuevoId(), idParqueo = nuevoId();
  return {
    ...base(),
    nombre: "Edificio de 8 departamentos en alquiler",
    ubicacion: "Santa Cruz, zona Equipetrol",
    descripcion: "Compra de terreno y construcción de un edificio para alquilar. Inversión grande y flujo estable pero lento: el terreno conserva su valor y el edificio se deprecia. Ejemplo MARGINAL: la renta cubre el costo de capital sin sobrar mucho; la plusvalía del terreno es parte del retorno.",
    sector: "servicios",
    modeloIngreso: "unidades",
    inversiones: {
      terreno: [inv("Terreno de 300 m²", "m²", 300, 1800, null)],
      obrasCiviles: [inv("Construcción del edificio (8 departamentos)", "depto", 8, 70000, 30)],
      maquinaria: [inv("Ascensor y sistema contra incendios", "set", 1, 60000, 15)],
      mobiliario: [],
      activoDiferido: [inv("Planos, permisos y licencias municipales", "global", 1, 30000, 5)],
    },
    capitalTrabajo: 30000,
    personal: [puesto("Portero / encargado", 1, 3300), puesto("Administrador (medio tiempo)", 1, 1500)],
    costosDirectos: [],
    costosAdministracion: [gasto("Mantenimiento general", 2200), gasto("Servicios comunes (luz, agua de áreas comunes)", 1400), gasto("Impuesto a la propiedad y seguros", 14000, "año")],
    costosComercializacion: [gasto("Publicidad y corretaje de alquileres", 900)],
    productos: [
      { id: idDepto, nombre: "Alquiler de departamentos (mes-depto ocupado)", unidadMedida: "mes", cantidades: [84, 86, 88, 90, 90], precios: serie(4250, 0.04, 2) },
      { id: idParqueo, nombre: "Alquiler de parqueos", unidadMedida: "mes", cantidades: [84, 84, 90, 90, 90], precios: serie(300, 0.03, 2) },
    ],
    ...finCapm(0.8),
    crecimientoIngresosAnual: 0.04, crecimientoCostosAnual: 0.04,
    tasasCrecCantidad: [2, 2, 2, 0], tasasCrecPrecio: [4, 4, 4, 4],
  };
}

function camaraFrioCooperativa(): Proyecto {
  // Beneficio = pérdida que se evita (merma de producto) valorada a precio de venta.
  const { cb, precios } = beneficioAnual(290000, 0.04);
  const idBen = nuevoId();
  return {
    ...base(),
    nombre: "Cámara de frío para una cooperativa frutícola",
    ubicacion: "Valles de Tarija",
    descripcion: "La cooperativa pierde cerca de 25% de su fruta por falta de refrigeración. La cámara de frío no vende nada nuevo: el beneficio son las pérdidas que se EVITAN, valoradas al precio de venta. Ejemplo VIABLE con beneficio medible a partir de datos de merma.",
    sector: "agricultura",
    modeloIngreso: "costo_beneficio",
    costoBeneficioV2: cb,
    inversiones: {
      terreno: [],
      obrasCiviles: [inv("Galpón aislado para la cámara", "obra", 1, 70000, 20)],
      maquinaria: [inv("Cámara de frío (equipo y compresores)", "set", 1, 190000, 12), inv("Grupo electrógeno de respaldo", "set", 1, 40000, 10)],
      mobiliario: [inv("Cajas plásticas y estantes", "set", 1, 15000, 6)],
      activoDiferido: [inv("Estudio técnico y permisos", "global", 1, 10000, 5)],
    },
    capitalTrabajo: 20000,
    personal: [puesto("Operario de cámara", 1, 3300)],
    costosDirectos: [],
    costosAdministracion: [gasto("Energía eléctrica de la cámara", 3200), gasto("Mantenimiento de equipos", 900)],
    costosComercializacion: [],
    productos: [{ id: idBen, nombre: "Fruta que ya no se pierde (valorada a precio de venta)", unidadMedida: "año", cantidades: [1, 1, 1, 1, 1], precios }],
    ...finCapm(0.8),
    crecimientoIngresosAnual: 0.04, crecimientoCostosAnual: 0.04,
    tasasCrecCantidad: [0, 0, 0, 0], tasasCrecPrecio: [0, 0, 0, 0],
  };
}

// ============================================================================
// TANDA 2
// ============================================================================

function flotaElectrica(): Proyecto {
  // Beneficio = combustible y mantenimiento que se dejan de gastar con vans
  // eléctricas, vs. el mismo servicio con vans a gasolina.
  const { cb, precios } = beneficioAnual(400000, 0.03);
  const idBen = nuevoId();
  return {
    ...base(),
    nombre: "Reemplazo de flota de reparto por vehículos eléctricos",
    ubicacion: "Santa Cruz",
    descripcion: "Una empresa de reparto cambia 6 vans diésel por eléctricas. El beneficio es el ahorro en combustible y mantenimiento y supone diésel a cerca de Bs 18 por litro (precio para grandes consumidores en 2026, a verificar); con el precio subsidiado de Bs 9,80 el ahorro sería casi la mitad y el proyecto no se pagaría. Ejemplo MARGINAL: la inversión es alta y el resultado depende del precio del combustible, de los kilómetros recorridos y de cuánto se recupere al vender las vans viejas.",
    sector: "servicios",
    modeloIngreso: "costo_beneficio",
    costoBeneficioV2: cb,
    inversiones: {
      terreno: [],
      obrasCiviles: [inv("Instalación eléctrica de carga en el patio", "obra", 1, 45000, 15)],
      maquinaria: [inv("Vans eléctricas de reparto", "van", 6, 140000, 8), inv("Cargadores rápidos", "cargador", 3, 22000, 10)],
      mobiliario: [],
      activoDiferido: [inv("Capacitación de conductores y estudio de rutas", "global", 1, 15000, 5)],
    },
    capitalTrabajo: 20000,
    personal: [],
    costosDirectos: [],
    costosAdministracion: [gasto("Energía para carga", 3800), gasto("Seguro de baterías y vehículos", 3500), gasto("Mantenimiento preventivo", 1500)],
    costosComercializacion: [],
    productos: [{ id: idBen, nombre: "Ahorro anual en combustible y mantenimiento", unidadMedida: "año", cantidades: [1, 1, 1, 1, 1], precios }],
    ...finCapm(0.9),
    crecimientoIngresosAnual: 0.03, crecimientoCostosAnual: 0.04,
    tasasCrecCantidad: [0, 0, 0, 0], tasasCrecPrecio: [0, 0, 0, 0],
  };
}

function podcastAuspicios(): Proyecto {
  const pub = { audienciaMensual: 40000, crecimientoMensual: 0.03, impresionesPorUsuario: 8, cpm: 85 };
  // 40000 oyentes × 8 menciones × 12 meses = 3840 miles/año, creciendo.
  const miles: [number, number, number, number, number] = [2400, 3200, 4000, 4800, 5400];
  const idMencion = nuevoId();
  return {
    ...base(),
    nombre: "Podcast de negocios con auspicios «Emprender Bolivia»",
    ubicacion: "Cochabamba (online)",
    descripcion: "Podcast semanal gratuito para el oyente que vive de auspicios: menciones leídas por el conductor. Modelo PUBLICIDAD por audiencia × CPM. Un CPM alto es posible porque el público es de nicho y la mención es personal. Ejemplo VIABLE si la audiencia crece; todo depende de ella.",
    sector: "servicios",
    modeloIngreso: "publicidad",
    publicidadV2: pub,
    inversiones: {
      terreno: [],
      obrasCiviles: [inv("Acondicionamiento acústico del estudio", "obra", 1, 8000, 8)],
      maquinaria: [inv("Micrófonos, interfaz y cámara", "set", 1, 14000, 5), inv("Computadora y software de edición", "set", 1, 10000, 5)],
      mobiliario: [],
      activoDiferido: [inv("Marca, web y diseño de portadas", "global", 1, 6000, 5)],
    },
    capitalTrabajo: 15000,
    personal: [puesto("Conductor / productor", 1, 4000), puesto("Editor de audio y video", 1, 3300)],
    costosDirectos: [directo(idMencion, "comision_venta", "Comisión de agencia por mil impresiones", "mil impresiones", 1, 13)],
    costosAdministracion: [gasto("Hosting de audio y plataformas", 700), gasto("Internet", 250)],
    costosComercializacion: [gasto("Promoción en redes", 1500), gasto("Invitados y producción de episodios", 1200)],
    productos: [{ id: idMencion, nombre: "Menciones de auspiciantes", unidadMedida: "mil impresiones", cantidades: miles, precios: [pub.cpm, pub.cpm, pub.cpm, pub.cpm, pub.cpm] }],
    ...finCapm(1.2),
    crecimientoIngresosAnual: 0.12, crecimientoCostosAnual: 0.04,
    tasasCrecCantidad: [0, 0, 0, 0], tasasCrecPrecio: [0, 0, 0, 0],
  };
}

function radioComunitaria(): Proyecto {
  const pub = { audienciaMensual: 12000, crecimientoMensual: 0.01, impresionesPorUsuario: 12, cpm: 60 };
  // 12000 × 12 × 12 meses = 1728 miles/año.
  const miles: [number, number, number, number, number] = [1728, 1800, 1900, 2000, 2100];
  const idCunia = nuevoId();
  return {
    ...base(),
    nombre: "Radio comunitaria rural «Voz del Valle»",
    ubicacion: "Valle de Sacaba, Cochabamba",
    descripcion: "Emisora FM de comunidad que informa en quechua y castellano. Su audiencia es chica y la pauta local paga poco (CPM bajo). Ejemplo de RECHAZO como negocio: no cubre sus costos con publicidad. Su valor es social y por eso estos proyectos viven de subvención o aportes; el simulador solo mide el flujo de dinero.",
    sector: "servicios",
    modeloIngreso: "publicidad",
    publicidadV2: pub,
    inversiones: {
      terreno: [],
      obrasCiviles: [inv("Cabina y estudio", "obra", 1, 35000, 15)],
      maquinaria: [inv("Transmisor FM y antena", "set", 1, 60000, 10), inv("Consola, micrófonos y computadora", "set", 1, 25000, 6)],
      mobiliario: [inv("Mobiliario del estudio", "set", 1, 6000, 10)],
      activoDiferido: [inv("Licencia ATT y trámites", "global", 1, 20000, 5)],
    },
    capitalTrabajo: 15000,
    personal: [puesto("Director / locutor", 1, 3500), puesto("Locutor y productor", 1, 3300), puesto("Operador técnico", 1, 3300)],
    costosDirectos: [directo(idCunia, "comision_venta", "Comisión de venta de pauta", "mil impresiones", 1, 4)],
    costosAdministracion: [gasto("Energía y mantenimiento del transmisor", 1800), gasto("Derechos de autor musicales", 700)],
    costosComercializacion: [gasto("Venta de pauta local", 900)],
    productos: [{ id: idCunia, nombre: "Cuñas de comercios locales", unidadMedida: "mil impresiones", cantidades: miles, precios: [pub.cpm, pub.cpm, pub.cpm, pub.cpm, pub.cpm] }],
    ...finCapm(1.0),
    crecimientoIngresosAnual: 0.04, crecimientoCostosAnual: 0.04,
    tasasCrecCantidad: [0, 0, 0, 0], tasasCrecPrecio: [0, 0, 0, 0],
  };
}

function agenciaMarketing(): Proyecto {
  const idRetainer = nuevoId(), idProyecto = nuevoId();
  return {
    ...base(),
    nombre: "Agencia de marketing digital «Pixel Andino»",
    ubicacion: "La Paz",
    descripcion: "Agencia pequeña que vende servicios a otras empresas: contratos mensuales de manejo de redes y proyectos puntuales (web, campañas). Casi no tiene activos: su costo principal es el equipo humano. Ejemplo VIABLE y de baja inversión; el riesgo está en perder clientes grandes.",
    sector: "servicios",
    modeloIngreso: "unidades",
    inversiones: {
      terreno: [],
      obrasCiviles: [],
      maquinaria: [inv("Computadoras y equipo de producción", "set", 1, 45000, 4)],
      mobiliario: [inv("Mobiliario de oficina", "set", 1, 12000, 8)],
      activoDiferido: [inv("Marca, web y portafolio inicial", "global", 1, 12000, 5)],
    },
    capitalTrabajo: 40000,
    personal: [puesto("Director de cuentas", 1, 6500), puesto("Diseñador", 2, 3800), puesto("Community managers", 2, 3300), puesto("Ejecutivo comercial", 1, 4000)],
    costosDirectos: [
      directo(idRetainer, "insumo_directo", "Herramientas y pauta gestionada por cliente-mes", "cliente-mes", 1, 350),
      directo(idProyecto, "insumo_directo", "Freelancers y producción por proyecto", "proyecto", 1, 3500),
    ],
    costosAdministracion: [gasto("Alquiler de oficina", 3500), gasto("Servicios básicos e internet", 900), gasto("Software y licencias de diseño", 1300), gasto("Contabilidad", 1000)],
    costosComercializacion: [gasto("Prospección y eventos", 1500)],
    productos: [
      { id: idRetainer, nombre: "Contratos mensuales de redes (clientes-mes)", unidadMedida: "cliente-mes", cantidades: [108, 150, 192, 228, 252], precios: serie(3800, 0.03, 2) },
      { id: idProyecto, nombre: "Proyectos puntuales", unidadMedida: "proyecto", cantidades: [24, 28, 32, 36, 40], precios: serie(9000, 0.03, 2) },
    ],
    ...finCapm(1.1),
    crecimientoIngresosAnual: 0.1, crecimientoCostosAnual: 0.04,
    tasasCrecCantidad: [0, 0, 0, 0], tasasCrecPrecio: [3, 3, 3, 3],
  };
}

function appDelivery(): Proyecto {
  const idComision = nuevoId(), idEnvio = nuevoId();
  return {
    ...base(),
    nombre: "App de delivery para barrios «Pedilo»",
    ubicacion: "Sucre",
    descripcion: "Plataforma que conecta comercios de barrio con repartidores. Ingreso por comisión sobre cada pedido. El desarrollo es el gran costo inicial; después cada pedido adicional casi no cuesta. Ejemplo ARRIESGADO: sin volumen suficiente no cubre el equipo, pero con volumen escala muy rápido.",
    sector: "servicios",
    modeloIngreso: "unidades",
    inversiones: {
      terreno: [],
      obrasCiviles: [],
      maquinaria: [inv("Equipos del equipo técnico y servidores", "set", 1, 40000, 4)],
      mobiliario: [inv("Mobiliario de oficina", "set", 1, 10000, 8)],
      activoDiferido: [inv("Desarrollo de la app y panel de comercios", "global", 1, 160000, 4), inv("Lanzamiento y registro de marca", "global", 1, 25000, 4)],
    },
    capitalTrabajo: 60000,
    personal: [puesto("Desarrollador", 2, 7500), puesto("Soporte y operaciones", 2, 3500), puesto("Ejecutivo de comercios", 2, 3800), puesto("Gerente general", 1, 8000)],
    costosDirectos: [
      directo(idComision, "comision_venta", "Pasarela de pago y soporte por pedido", "pedido", 1, 1.6),
      directo(idEnvio, "mercaderia", "Subsidio a repartidor por envío", "envío", 1, 2.5),
    ],
    costosAdministracion: [gasto("Alquiler de oficina", 3000), gasto("Servidores en la nube", 2200), gasto("Contabilidad y legal", 1500), gasto("Servicios e internet", 800)],
    costosComercializacion: [gasto("Marketing de lanzamiento y descuentos", 9000), gasto("Activaciones en comercios", 2000)],
    productos: [
      { id: idComision, nombre: "Comisión por pedido (18% sobre un pedido medio de Bs 45)", unidadMedida: "pedido", cantidades: [60000, 135000, 230000, 310000, 390000], precios: serie(8.1, 0.0, 2) },
      { id: idEnvio, nombre: "Cargo por envío", unidadMedida: "envío", cantidades: [60000, 135000, 230000, 310000, 390000], precios: serie(4.0, 0.0, 2) },
    ],
    ...finCapm(1.6),
    crecimientoIngresosAnual: 0.3, crecimientoCostosAnual: 0.05,
    tasasCrecCantidad: [0, 0, 0, 0], tasasCrecPrecio: [0, 0, 0, 0],
  };
}

function capacitacionJovenes(): Proyecto {
  // Beneficio social: egresados que consiguen empleo × diferencia de ingreso
  // atribuible al curso (NO todo su sueldo), año a año.
  const { cb, precios } = beneficioAnual(700000, 0.02);
  const idBen = nuevoId();
  return {
    ...base(),
    nombre: "Programa de capacitación técnica para jóvenes",
    ubicacion: "El Alto",
    descripcion: "Un centro forma a 120 jóvenes al año en oficios (electricidad, soldadura, gastronomía). El beneficio social es la diferencia de ingresos que logran los egresados gracias al curso, no su sueldo completo. Ejemplo MARGINAL: el resultado depende de qué porcentaje consigue empleo y de cuánto se atribuya al programa.",
    sector: "servicios",
    modeloIngreso: "costo_beneficio",
    costoBeneficioV2: cb,
    inversiones: {
      terreno: [],
      obrasCiviles: [inv("Adecuación de talleres y aulas", "obra", 1, 140000, 20)],
      maquinaria: [inv("Equipos y herramientas de taller", "set", 1, 130000, 8)],
      mobiliario: [inv("Mobiliario de aulas", "set", 1, 28000, 10)],
      activoDiferido: [inv("Diseño curricular y acreditación", "global", 1, 30000, 5)],
    },
    capitalTrabajo: 30000,
    personal: [puesto("Instructores", 3, 4800), puesto("Coordinadora académica", 1, 5000), puesto("Administrativo", 1, 3300)],
    costosDirectos: [],
    costosAdministracion: [gasto("Materiales de práctica", 5500), gasto("Servicios básicos y mantenimiento", 2200)],
    costosComercializacion: [gasto("Convocatoria y seguimiento de egresados", 1200)],
    productos: [{ id: idBen, nombre: "Mayor ingreso de los egresados atribuible al programa", unidadMedida: "año", cantidades: [1, 1, 1, 1, 1], precios }],
    ...finSocial(0.08),
    crecimientoIngresosAnual: 0.02, crecimientoCostosAnual: 0.03,
    tasasCrecCantidad: [0, 0, 0, 0], tasasCrecPrecio: [0, 0, 0, 0],
  };
}

function peliculaNacional(): Proyecto {
  // Proyecto de UNA sola vez: la película se produce el año 1 y vende después.
  // Los ingresos se concentran en pocos años y luego se agotan.
  const idTaquilla = nuevoId(), idStreaming = nuevoId(), idFestival = nuevoId();
  return {
    ...base(),
    nombre: "Largometraje de ficción «La Ruta del Illimani»",
    ubicacion: "La Paz",
    descripcion: "Producción de una película: rodaje y posproducción antes del estreno (inversión inicial), luego estreno en salas, venta a plataformas de streaming y festivales. Ingresos concentrados en pocos años y casi nulos después. Ejemplo MARGINAL con riesgo muy alto: unas pocas películas dan mucho y la mayoría no recupera la inversión.",
    sector: "servicios",
    modeloIngreso: "unidades",
    inversiones: {
      terreno: [],
      obrasCiviles: [],
      maquinaria: [inv("Cámaras, lentes y equipo de luz y sonido", "set", 1, 240000, 6)],
      mobiliario: [],
      activoDiferido: [inv("Guion, derechos y desarrollo", "global", 1, 90000, 5), inv("Rodaje (elenco, locaciones y producción)", "global", 1, 520000, 5), inv("Posproducción, música y color", "global", 1, 140000, 5)],
    },
    capitalTrabajo: 60000,
    personal: [puesto("Productor ejecutivo (medio tiempo)", 1, 4000)],
    costosDirectos: [
      directo(idTaquilla, "comision_venta", "Porcentaje de la sala por entrada", "entrada", 1, 14),
    ],
    costosAdministracion: [gasto("Oficina y administración", 800), gasto("Derechos, seguros y contabilidad", 900)],
    costosComercializacion: [gasto("Distribución, copias y promoción", 30000, "año")],
    productos: [
      { id: idTaquilla, nombre: "Entradas en salas", unidadMedida: "entrada", cantidades: [40000, 10000, 0, 0, 0], precios: [36, 36, 36, 36, 36] },
      { id: idStreaming, nombre: "Licencias y catálogo en plataformas de streaming", unidadMedida: "licencia", cantidades: [0, 2, 2, 2, 2], precios: [260000, 260000, 150000, 110000, 90000] },
      { id: idFestival, nombre: "Premios y venta a festivales", unidadMedida: "venta", cantidades: [3, 4, 2, 1, 0], precios: [30000, 30000, 30000, 30000, 30000] },
    ],
    ...finCapm(1.4),
    crecimientoIngresosAnual: 0, crecimientoCostosAnual: 0.03,
    tasasCrecCantidad: [0, 0, 0, 0], tasasCrecPrecio: [0, 0, 0, 0],
  };
}

// ============================================================================
// TANDA 3
// ============================================================================

function coworking(): Proyecto {
  const sus = { suscriptoresIniciales: 30, altasMensuales: 8, churnMensual: 0.05, cuotaMensual: 650 };
  const baseAnual: [number, number, number, number, number] = [40, 70, 90, 100, 100];
  const precioAnual = sus.cuotaMensual * 12;
  const idPuesto = nuevoId();
  return {
    ...base(),
    nombre: "Coworking «Nodo Central»",
    ubicacion: "Santa Cruz, centro",
    descripcion: "Espacio de trabajo compartido que alquila puestos por mes a freelancers y emprendedores. Modelo SUSCRIPCIÓN: el alquiler del local es el costo fijo dominante, y la ocupación determina todo. Ejemplo VIABLE si se llena sobre el 60% del aforo.",
    sector: "servicios",
    modeloIngreso: "suscripcion",
    suscripcionV2: sus,
    inversiones: {
      terreno: [],
      obrasCiviles: [inv("Adecuación de 400 m² (divisiones, cocina, salas)", "obra", 1, 120000, 10)],
      maquinaria: [inv("Internet de alta velocidad, redes y climatización", "set", 1, 45000, 6)],
      mobiliario: [inv("Escritorios, sillas, salas de reunión y cocina", "set", 1, 90000, 8)],
      activoDiferido: [inv("Marca, web y sistema de reservas", "global", 1, 20000, 5)],
    },
    capitalTrabajo: 40000,
    personal: [puesto("Community manager", 1, 4000), puesto("Recepción", 1, 3300), puesto("Limpieza", 1, 3300)],
    costosDirectos: [directo(idPuesto, "comision_venta", "Comisión de pasarela y soporte por socio/año", "socio/año", 1, Math.round(precioAnual * 0.04))],
    costosAdministracion: [gasto("Alquiler del local", 16000), gasto("Servicios básicos", 4500), gasto("Internet corporativo", 2500), gasto("Mantenimiento", 1500)],
    costosComercializacion: [gasto("Marketing y eventos de comunidad", 3000)],
    productos: [{ id: idPuesto, nombre: "Membresía de puesto fijo/flexible", unidadMedida: "socio/año", cantidades: baseAnual, precios: [precioAnual, precioAnual, precioAnual, precioAnual, precioAnual] }],
    ...finCapm(),
    crecimientoIngresosAnual: 0.1, crecimientoCostosAnual: 0.04,
    tasasCrecCantidad: [0, 0, 0, 0], tasasCrecPrecio: [0, 0, 0, 0],
  };
}

function parqueo(): Proyecto {
  const idAbono = nuevoId(), idHora = nuevoId();
  return {
    ...base(),
    nombre: "Estacionamiento céntrico «Park Plaza»",
    ubicacion: "La Paz, zona central",
    descripcion: "Parqueo para 80 vehículos en un terreno alquilado: abonos mensuales para oficinistas y cobro por hora para visitantes. Pocos activos y poca gente, pero el alquiler del terreno pesa. Ejemplo VIABLE con riesgo bajo.",
    sector: "servicios",
    modeloIngreso: "unidades",
    inversiones: {
      terreno: [],
      obrasCiviles: [inv("Pavimentado, señalización e iluminación", "obra", 1, 150000, 15)],
      maquinaria: [inv("Barreras, cámaras y sistema de cobro", "set", 1, 60000, 6)],
      mobiliario: [inv("Casetas y cerco", "set", 1, 20000, 8)],
      activoDiferido: [inv("Permisos municipales y contrato de terreno", "global", 1, 15000, 5)],
    },
    capitalTrabajo: 20000,
    personal: [puesto("Cajeros (turnos)", 3, 3300), puesto("Supervisor", 1, 3800)],
    costosDirectos: [],
    costosAdministracion: [gasto("Alquiler del terreno", 14000), gasto("Energía e internet", 1200), gasto("Seguro y mantenimiento", 1500)],
    costosComercializacion: [gasto("Promoción y convenios con edificios", 1000)],
    productos: [
      { id: idAbono, nombre: "Abonos mensuales", unidadMedida: "abono-mes", cantidades: [660, 720, 756, 768, 768], precios: serie(450, 0.03, 2) },
      { id: idHora, nombre: "Cobro por hora", unidadMedida: "hora", cantidades: [30000, 32000, 34000, 35000, 36000], precios: serie(6, 0.03, 2) },
    ],
    ...finCapm(0.8),
    crecimientoIngresosAnual: 0.04, crecimientoCostosAnual: 0.04,
    tasasCrecCantidad: [0, 0, 0, 0], tasasCrecPrecio: [3, 3, 3, 3],
  };
}

function aguaPotableRural(): Proyecto {
  // Beneficio social: horas de acarreo ahorradas + enfermedades hídricas evitadas.
  const { cb, precios } = beneficioAnual(380000, 0.02);
  const idBen = nuevoId();
  return {
    ...base(),
    nombre: "Sistema de agua potable para una comunidad rural",
    ubicacion: "Provincia Tarata, Cochabamba",
    descripcion: "Captación, tanque y red de distribución para 300 familias que hoy acarrean agua. El beneficio social se valora como horas de acarreo ahorradas (sobre todo de mujeres y niños) más enfermedades de origen hídrico evitadas. Financiamiento 100% propio (gobierno municipal) con tasa social. Ejemplo VIABLE socialmente.",
    sector: "servicios",
    modeloIngreso: "costo_beneficio",
    costoBeneficioV2: cb,
    inversiones: {
      terreno: [],
      obrasCiviles: [inv("Captación, tanque de almacenamiento y caseta", "obra", 1, 380000, 30), inv("Red de distribución y conexiones domiciliarias", "obra", 1, 300000, 25)],
      maquinaria: [inv("Bombas, tratamiento y cloración", "set", 1, 90000, 10)],
      mobiliario: [],
      activoDiferido: [inv("Estudio, diseño y capacitación comunitaria", "global", 1, 40000, 5)],
    },
    capitalTrabajo: 15000,
    personal: [puesto("Operador del sistema", 1, 3300)],
    costosDirectos: [],
    costosAdministracion: [gasto("Energía de bombeo", 2500), gasto("Cloro y análisis del agua", 1200), gasto("Mantenimiento de la red", 1500)],
    costosComercializacion: [],
    productos: [{ id: idBen, nombre: "Beneficio social anual (horas de acarreo y salud)", unidadMedida: "año", cantidades: [1, 1, 1, 1, 1], precios }],
    ...finSocial(0.08),
    crecimientoIngresosAnual: 0.02, crecimientoCostosAnual: 0.03,
    tasasCrecCantidad: [0, 0, 0, 0], tasasCrecPrecio: [0, 0, 0, 0],
  };
}

function tratamientoAgua(): Proyecto {
  // Beneficio = agua que se deja de comprar + multas ambientales evitadas.
  const { cb, precios } = beneficioAnual(476000, 0.03);
  const idBen = nuevoId();
  return {
    ...base(),
    nombre: "Planta de tratamiento y reúso de agua industrial",
    ubicacion: "El Alto (curtiembre)",
    descripcion: "Una curtiembre trata y reutiliza su agua residual. El beneficio es el agua que deja de comprar más las multas ambientales que evita. Ejemplo MARGINAL: parte del beneficio (la multa) es un riesgo que quizás nunca se materialice; si se descarta, el proyecto no se paga.",
    sector: "servicios",
    modeloIngreso: "costo_beneficio",
    costoBeneficioV2: cb,
    inversiones: {
      terreno: [],
      obrasCiviles: [inv("Obra civil de pozas y estanques", "obra", 1, 260000, 20)],
      maquinaria: [inv("Equipos de tratamiento (filtros, bombas, dosificadores)", "set", 1, 520000, 12)],
      mobiliario: [],
      activoDiferido: [inv("Estudio de impacto y licencia ambiental", "global", 1, 60000, 5)],
    },
    capitalTrabajo: 25000,
    personal: [puesto("Operador de planta", 1, 4000)],
    costosDirectos: [],
    costosAdministracion: [gasto("Insumos químicos", 5500), gasto("Energía eléctrica", 4000), gasto("Análisis de laboratorio", 1500), gasto("Mantenimiento", 1800)],
    costosComercializacion: [],
    productos: [{ id: idBen, nombre: "Agua no comprada y multas ambientales evitadas", unidadMedida: "año", cantidades: [1, 1, 1, 1, 1], precios }],
    ...finCapm(0.8),
    crecimientoIngresosAnual: 0.03, crecimientoCostosAnual: 0.04,
    tasasCrecCantidad: [0, 0, 0, 0], tasasCrecPrecio: [0, 0, 0, 0],
  };
}

function programaFidelizacion(): Proyecto {
  // Beneficio = margen de las compras EXTRA que genera el programa, no de todas
  // las compras de los clientes inscritos (muchas se habrían hecho igual).
  const { cb, precios } = beneficioAnual(280000, 0.02);
  const idBen = nuevoId();
  return {
    ...base(),
    nombre: "Programa de fidelización con tarjeta de puntos",
    ubicacion: "Tarija (supermercado de barrio)",
    descripcion: "Un supermercado lanza una tarjeta de puntos con descuentos. El beneficio es el margen de las compras ADICIONALES, pero el programa también regala descuentos a clientes que habrían comprado igual. Ejemplo MARGINAL: el costo del descuento se come buena parte de la ganancia.",
    sector: "comercio",
    modeloIngreso: "costo_beneficio",
    costoBeneficioV2: cb,
    inversiones: {
      terreno: [],
      obrasCiviles: [],
      maquinaria: [inv("Lectores y terminales en cajas", "set", 1, 25000, 5)],
      mobiliario: [],
      activoDiferido: [inv("Software de fidelización y base de clientes", "global", 1, 45000, 4), inv("Tarjetas y lanzamiento", "global", 1, 15000, 3)],
    },
    capitalTrabajo: 10000,
    personal: [puesto("Encargado del programa", 1, 3500)],
    costosDirectos: [],
    costosAdministracion: [gasto("Licencia y soporte del software", 1200)],
    costosComercializacion: [gasto("Descuentos y premios canjeados", 9500), gasto("Comunicación a socios (SMS y redes)", 1500)],
    productos: [{ id: idBen, nombre: "Margen de compras adicionales atribuibles al programa", unidadMedida: "año", cantidades: [1, 1, 1, 1, 1], precios }],
    ...finCapm(1.0),
    crecimientoIngresosAnual: 0.02, crecimientoCostosAnual: 0.04,
    tasasCrecCantidad: [0, 0, 0, 0], tasasCrecPrecio: [0, 0, 0, 0],
  };
}

function seguridadAlmacen(): Proyecto {
  // Beneficio = robos y mermas que se evitan, valorados a costo de reposición.
  const { cb, precios } = beneficioAnual(207000, 0.0);
  const idBen = nuevoId();
  return {
    ...base(),
    nombre: "Sistema de seguridad para un almacén",
    ubicacion: "Santa Cruz (almacén de electrodomésticos)",
    descripcion: "Cámaras, alarma y control de acceso en un almacén que pierde mercadería por robo y merma interna. El beneficio son las pérdidas evitadas, que se estiman con los inventarios de años anteriores. Ejemplo VIABLE: la inversión es baja frente a la pérdida, pero hay que comprobar que la pérdida sea real y atribuible.",
    sector: "comercio",
    modeloIngreso: "costo_beneficio",
    costoBeneficioV2: cb,
    inversiones: {
      terreno: [],
      obrasCiviles: [inv("Cableado y adecuaciones", "obra", 1, 20000, 10)],
      maquinaria: [inv("Cámaras, grabadores y alarma perimetral", "set", 1, 95000, 6), inv("Control de acceso biométrico", "set", 1, 30000, 6)],
      mobiliario: [],
      activoDiferido: [inv("Diseño del sistema e instalación", "global", 1, 15000, 5)],
    },
    capitalTrabajo: 8000,
    personal: [puesto("Operador de monitoreo", 1, 3300)],
    costosDirectos: [],
    costosAdministracion: [gasto("Servicio de monitoreo y soporte", 1800), gasto("Mantenimiento de equipos", 800)],
    costosComercializacion: [],
    productos: [{ id: idBen, nombre: "Robos y mermas evitados (a costo de reposición)", unidadMedida: "año", cantidades: [1, 1, 1, 1, 1], precios }],
    ...finCapm(0.9),
    crecimientoIngresosAnual: 0, crecimientoCostosAnual: 0.04,
    tasasCrecCantidad: [0, 0, 0, 0], tasasCrecPrecio: [0, 0, 0, 0],
  };
}

function mantenimientoPreventivo(): Proyecto {
  // Beneficio = horas de parada no programada que se evitan × margen por hora.
  const { cb, precios } = beneficioAnual(359000, 0.03);
  const idBen = nuevoId();
  return {
    ...base(),
    nombre: "Mantenimiento preventivo con sensores en una fábrica",
    ubicacion: "Cochabamba (planta de embutidos)",
    descripcion: "Sensores y un plan de mantenimiento preventivo en lugar de reparar cuando algo falla. El beneficio son las horas de parada no programada que se evitan, valoradas por lo que la planta deja de producir. Ejemplo VIABLE con inversión pequeña frente al beneficio.",
    sector: "produccion",
    modeloIngreso: "costo_beneficio",
    costoBeneficioV2: cb,
    inversiones: {
      terreno: [],
      obrasCiviles: [],
      maquinaria: [inv("Sensores de vibración y temperatura", "set", 1, 120000, 7)],
      mobiliario: [inv("Taller y herramientas de diagnóstico", "set", 1, 25000, 8)],
      activoDiferido: [inv("Software de gestión de mantenimiento", "global", 1, 35000, 4), inv("Capacitación de técnicos", "global", 1, 20000, 3)],
    },
    capitalTrabajo: 10000,
    personal: [puesto("Técnicos de mantenimiento", 2, 4200)],
    costosDirectos: [],
    costosAdministracion: [gasto("Repuestos de mantenimiento preventivo", 4000), gasto("Licencia del software", 1000)],
    costosComercializacion: [],
    productos: [{ id: idBen, nombre: "Producción que ya no se pierde por paradas no programadas", unidadMedida: "año", cantidades: [1, 1, 1, 1, 1], precios }],
    ...finCapm(1.0),
    crecimientoIngresosAnual: 0.03, crecimientoCostosAnual: 0.04,
    tasasCrecCantidad: [0, 0, 0, 0], tasasCrecPrecio: [0, 0, 0, 0],
  };
}

function feriaComercial(): Proyecto {
  const idStand = nuevoId(), idEntrada = nuevoId(), idAuspicio = nuevoId();
  return {
    ...base(),
    nombre: "Feria comercial anual «ExpoPyme»",
    ubicacion: "Santa Cruz (recinto ferial)",
    descripcion: "Feria de 4 días para pequeñas empresas: venta de stands, entradas y auspicios. Ingresos concentrados y casi todos los costos son del recinto y la producción. Ejemplo VIABLE: el stand es un ingreso casi puro, pero depende de convencer a los expositores año tras año.",
    sector: "servicios",
    modeloIngreso: "unidades",
    inversiones: {
      terreno: [],
      obrasCiviles: [],
      maquinaria: [inv("Sistema de acreditación, sonido y pantallas", "set", 1, 90000, 6)],
      mobiliario: [inv("Estructuras modulares de stands y señalética", "set", 1, 140000, 6)],
      activoDiferido: [inv("Marca, web y plataforma de registro", "global", 1, 30000, 5)],
    },
    capitalTrabajo: 70000,
    personal: [puesto("Director de la feria", 1, 8000), puesto("Coordinador comercial", 1, 4500)],
    costosDirectos: [
      directo(idStand, "insumo_directo", "Montaje, electricidad y limpieza por stand", "stand", 1, 700),
      directo(idEntrada, "insumo_directo", "Seguridad y control por visitante", "entrada", 1, 3),
    ],
    costosAdministracion: [gasto("Alquiler del recinto ferial", 150000, "año"), gasto("Permisos, seguros y contabilidad", 30000, "año")],
    costosComercializacion: [gasto("Campaña de promoción de la feria", 100000, "año")],
    productos: [
      { id: idStand, nombre: "Venta de stands", unidadMedida: "stand", cantidades: [150, 170, 190, 205, 220], precios: serie(2800, 0.04, 2) },
      { id: idEntrada, nombre: "Entradas de visitantes", unidadMedida: "entrada", cantidades: [18000, 21000, 24000, 26000, 28000], precios: serie(20, 0.03, 2) },
      { id: idAuspicio, nombre: "Auspicios de marcas", unidadMedida: "auspicio", cantidades: [5, 5, 6, 6, 7], precios: serie(30000, 0.04, 2) },
    ],
    ...finCapm(1.2),
    crecimientoIngresosAnual: 0.07, crecimientoCostosAnual: 0.04,
    tasasCrecCantidad: [0, 0, 0, 0], tasasCrecPrecio: [4, 4, 4, 4],
  };
}

function salonEventos(): Proyecto {
  const idSalon = nuevoId(), idCatering = nuevoId();
  return {
    ...base(),
    nombre: "Salón de eventos y matrimonios «Terraza Jardín»",
    ubicacion: "Cochabamba, zona Tiquipaya",
    descripcion: "Terreno propio con salón, jardín y cocina para matrimonios y eventos corporativos. Alquiler del salón más servicio de comida y bebida. Ejemplo MARGINAL: gran inversión en obra y terreno, ingresos estacionales (fines de semana y fechas altas) y mucha dependencia de la ocupación.",
    sector: "servicios",
    modeloIngreso: "unidades",
    inversiones: {
      terreno: [inv("Terreno de 1.200 m²", "m²", 1200, 1000, null)],
      obrasCiviles: [inv("Salón principal, cocina y baños", "obra", 1, 650000, 25), inv("Jardín, iluminación y estacionamiento", "obra", 1, 120000, 15)],
      maquinaria: [inv("Cocina industrial y refrigeración", "set", 1, 95000, 10)],
      mobiliario: [inv("Mesas, sillas, mantelería y vajilla", "set", 1, 110000, 6), inv("Sonido e iluminación", "set", 1, 45000, 6)],
      activoDiferido: [inv("Licencias, marca y permisos", "global", 1, 25000, 5)],
    },
    capitalTrabajo: 45000,
    personal: [puesto("Administrador de eventos", 1, 6000), puesto("Cocineros", 2, 3500), puesto("Meseros y apoyo", 4, 3300), puesto("Mantenimiento y limpieza", 2, 3300)],
    costosDirectos: [directo(idCatering, "insumo_directo", "Comida y bebida por invitado", "invitado", 1, 55)],
    costosAdministracion: [gasto("Servicios básicos", 4500), gasto("Mantenimiento del salón y jardín", 3500), gasto("Seguros e impuestos", 3000), gasto("Contabilidad", 1200)],
    costosComercializacion: [gasto("Publicidad y ferias de novios", 3500)],
    productos: [
      { id: idSalon, nombre: "Alquiler del salón (evento)", unidadMedida: "evento", cantidades: [80, 88, 94, 98, 100], precios: serie(8500, 0.04, 2) },
      { id: idCatering, nombre: "Servicio de comida y bebida", unidadMedida: "invitado", cantidades: [12000, 13200, 14100, 14700, 15000], precios: serie(120, 0.04, 2) },
    ],
    ...finCapm(1.0),
    crecimientoIngresosAnual: 0.05, crecimientoCostosAnual: 0.04,
    tasasCrecCantidad: [0, 0, 0, 0], tasasCrecPrecio: [4, 4, 4, 4],
  };
}

function lanzamientoProducto(): Proyecto {
  // El efecto de una campaña de lanzamiento se desvanece: el beneficio cae
  // cada año (crecimiento negativo), a diferencia de un negocio estable.
  const { cb, precios } = beneficioAnual(380000, -0.2);
  const idBen = nuevoId();
  return {
    ...base(),
    nombre: "Campaña de lanzamiento de una nueva línea de snacks",
    ubicacion: "Cochabamba y Santa Cruz",
    descripcion: "Una empresa lanza una línea nueva con degustaciones, redes y promociones en supermercados. El beneficio es el margen de las ventas adicionales, que es alto el primer año y se desvanece cuando termina la promoción. Ejemplo MARGINAL: un mal cálculo es suponer que el efecto dura todos los años.",
    sector: "produccion",
    modeloIngreso: "costo_beneficio",
    costoBeneficioV2: cb,
    inversiones: {
      terreno: [],
      obrasCiviles: [],
      maquinaria: [],
      mobiliario: [inv("Góndolas y exhibidores en supermercados", "set", 1, 60000, 3)],
      activoDiferido: [inv("Diseño de marca y empaque", "global", 1, 40000, 3), inv("Producción de contenido y material", "global", 1, 30000, 3)],
    },
    capitalTrabajo: 40000,
    personal: [puesto("Jefe de producto (medio tiempo)", 1, 3200)],
    costosDirectos: [],
    costosAdministracion: [gasto("Medición y seguimiento", 1500)],
    costosComercializacion: [gasto("Degustaciones y promotoras", 3000), gasto("Pauta en redes y exhibición", 3000)],
    productos: [{ id: idBen, nombre: "Margen de ventas adicionales por la campaña", unidadMedida: "año", cantidades: [1, 1, 1, 1, 1], precios }],
    ...finCapm(1.2),
    crecimientoIngresosAnual: -0.2, crecimientoCostosAnual: 0.04,
    tasasCrecCantidad: [0, 0, 0, 0], tasasCrecPrecio: [0, 0, 0, 0],
  };
}

function softwareSaaS(): Proyecto {
  const sus = { suscriptoresIniciales: 20, altasMensuales: 14, churnMensual: 0.03, cuotaMensual: 320 };
  const baseAnual: [number, number, number, number, number] = [60, 150, 260, 360, 440];
  const precioAnual = sus.cuotaMensual * 12;
  const idPlan = nuevoId();
  return {
    ...base(),
    nombre: "Software de gestión para pymes «OrdenaYa»",
    ubicacion: "Santa Cruz (remoto)",
    descripcion: "Plataforma en la nube de facturación e inventario con suscripción mensual. El desarrollo es el gran costo inicial; cada cliente nuevo casi no cuesta. Ejemplo ARRIESGADO: sin cierto número de clientes no cubre al equipo, pero con volumen el margen es muy alto.",
    sector: "servicios",
    modeloIngreso: "suscripcion",
    suscripcionV2: sus,
    inversiones: {
      terreno: [],
      obrasCiviles: [],
      maquinaria: [inv("Equipos del equipo técnico", "set", 1, 45000, 4)],
      mobiliario: [inv("Mobiliario de oficina", "set", 1, 10000, 8)],
      activoDiferido: [inv("Desarrollo de la plataforma (versión 1)", "global", 1, 200000, 4), inv("Marca, web y registro", "global", 1, 25000, 4)],
    },
    capitalTrabajo: 60000,
    personal: [puesto("Desarrolladores", 2, 8000), puesto("Soporte al cliente", 1, 3500), puesto("Ejecutivo comercial", 1, 4500), puesto("Gerente general", 1, 8000)],
    costosDirectos: [directo(idPlan, "comision_venta", "Pasarela de pago y soporte por cliente/año", "cliente/año", 1, Math.round(precioAnual * 0.05))],
    costosAdministracion: [gasto("Servidores en la nube", 2800), gasto("Oficina e internet", 2500), gasto("Contabilidad y legal", 1500)],
    costosComercializacion: [gasto("Publicidad digital y demos", 6000), gasto("Eventos y alianzas con contadores", 2000)],
    productos: [{ id: idPlan, nombre: "Suscripción anual por empresa", unidadMedida: "cliente/año", cantidades: baseAnual, precios: [precioAnual, precioAnual, precioAnual, precioAnual, precioAnual] }],
    ...finCapm(1.6),
    crecimientoIngresosAnual: 0.3, crecimientoCostosAnual: 0.05,
    tasasCrecCantidad: [0, 0, 0, 0], tasasCrecPrecio: [0, 0, 0, 0],
  };
}

function reforestacionCarbono(): Proyecto {
  // Proyecto de horizonte largo evaluado en 5 años: los árboles recién empiezan
  // a capturar carbono de forma significativa pasado ese plazo.
  const idBono = nuevoId(), idMadera = nuevoId();
  return {
    ...base(),
    nombre: "Reforestación con venta de bonos de carbono",
    ubicacion: "Beni (200 hectáreas)",
    descripcion: "Plantación de especies nativas que vende bonos de carbono y madera de raleo. Ejemplo de RECHAZO a 5 años: los árboles capturan poco al inicio y los ingresos grandes llegan mucho después. Enseña que el horizonte de evaluación cambia la decisión: a 20 años el mismo proyecto podría ser viable.",
    sector: "agricultura",
    modeloIngreso: "unidades",
    inversiones: {
      terreno: [inv("Tierras (200 hectáreas)", "ha", 200, 3500, null)],
      obrasCiviles: [inv("Vivero, camino y campamento", "obra", 1, 90000, 15)],
      maquinaria: [inv("Maquinaria y herramientas forestales", "set", 1, 110000, 8)],
      mobiliario: [],
      activoDiferido: [inv("Plantines y plantación inicial", "global", 1, 160000, 5), inv("Certificación del proyecto de carbono", "global", 1, 70000, 5)],
    },
    capitalTrabajo: 30000,
    personal: [puesto("Ingeniero forestal", 1, 6500), puesto("Jornaleros", 4, 3300)],
    costosDirectos: [],
    costosAdministracion: [gasto("Monitoreo y verificación anual", 40000, "año"), gasto("Mantenimiento de la plantación", 3500), gasto("Seguro y contabilidad", 1500)],
    costosComercializacion: [gasto("Intermediación de bonos", 1500)],
    productos: [
      { id: idBono, nombre: "Bonos de carbono vendidos (tCO2)", unidadMedida: "tCO2", cantidades: [400, 1500, 3200, 5200, 7500], precios: serie(110, 0.03, 2) },
      { id: idMadera, nombre: "Madera de raleo", unidadMedida: "m³", cantidades: [0, 0, 150, 350, 600], precios: serie(650, 0.03, 2) },
    ],
    ...finCapm(0.9),
    crecimientoIngresosAnual: 0.1, crecimientoCostosAnual: 0.04,
    tasasCrecCantidad: [0, 0, 0, 0], tasasCrecPrecio: [3, 3, 3, 3],
  };
}

// ============================================================================
// REGISTRO EXPORTADO
// ============================================================================

const PLANTILLAS_SIN_COLCHON: PlantillaMeta[] = [
  // Gastronomía
  { clave: "restaurante", titulo: "Restaurante temático", emoji: "🍽️", categoria: "gastronomia", sector: "Servicios", modelo: "unidades", modeloLabel: "Servicios", escala: "Grande", resumen: "Platos, bebidas, postres y salón de eventos.", crear: restaurante },
  { clave: "cafeteria", titulo: "Cafetería de especialidad", emoji: "☕", categoria: "gastronomia", sector: "Servicios", modelo: "unidades", modeloLabel: "Servicios", escala: "Mediano", resumen: "Café de origen, postres y almuerzos ligeros.", crear: cafeteria },
  { clave: "foodtruck", titulo: "Food truck móvil", emoji: "🚐", categoria: "gastronomia", sector: "Servicios", modelo: "unidades", modeloLabel: "Servicios", escala: "Pequeño", resumen: "Hamburguesas gourmet que rotan por ferias y eventos.", crear: () => calibrarDemanda(foodTruck(), 0.65) },
  { clave: "panaderia", titulo: "Panadería artesanal", emoji: "🥖", categoria: "gastronomia", sector: "Producción", modelo: "unidades", modeloLabel: "Producción", escala: "Mediano", resumen: "Pan integral, galletas y tortas por encargo.", crear: panaderiaArtesanal },

  // Producción
  { clave: "fabrica", titulo: "Fábrica de snacks", emoji: "🏭", categoria: "produccion", sector: "Producción", modelo: "unidades", modeloLabel: "Producción", escala: "Grande", resumen: "Granola, barras y mantequilla de maní industrial.", crear: () => calibrarDemanda(fabricaSnacks(), 0.46) },
  { clave: "embotelladora", titulo: "Embotelladora de jugos", emoji: "🧃", categoria: "produccion", sector: "Producción", modelo: "unidades", modeloLabel: "Producción", escala: "Mediano", resumen: "Jugos naturales pasteurizados con cadena de frío.", crear: () => calibrarDemanda(embotelladoraJugos(), 0.34) },
  { clave: "muebles", titulo: "Taller de muebles", emoji: "🪑", categoria: "produccion", sector: "Producción", modelo: "unidades", modeloLabel: "Producción", escala: "Mediano", resumen: "Carpintería a medida: sillas, mesas, closets.", ensena: "Un taller con buena demanda apenas supera el costo del capital. Compara con la fábrica de snacks: misma lógica de producción, pero aquí el margen por unidad es mucho menor.", veredicto: "marginal", crear: () => calibrarDemanda(tallerMuebles(), 1.07) },
  { clave: "textil", titulo: "Taller textil de alpaca", emoji: "🧶", categoria: "produccion", sector: "Producción", modelo: "unidades", modeloLabel: "Producción", escala: "Mediano", resumen: "Sweaters, bufandas y gorros para exportación.", crear: () => calibrarDemanda(textilSweaters(), 0.78) },

  // Comercio
  { clave: "distribuidora", titulo: "Distribuidora mayorista", emoji: "📦", categoria: "comercio", sector: "Comercio", modelo: "unidades", modeloLabel: "Comercio", escala: "Grande", resumen: "Compra y reventa al por mayor a tiendas de barrio.", crear: distribuidora },
  { clave: "tiendaonline", titulo: "Tienda online", emoji: "🛒", categoria: "comercio", sector: "Comercio", modelo: "unidades", modeloLabel: "Comercio", escala: "Mediano", resumen: "E-commerce de electrónica, hogar y accesorios.", crear: () => calibrarDemanda(tiendaOnline(), 0.45) },
  { clave: "ferreteria", titulo: "Ferretería de barrio", emoji: "🔧", categoria: "comercio", sector: "Comercio", modelo: "unidades", modeloLabel: "Comercio", escala: "Mediano", resumen: "Herramientas, materiales de construcción y pintura.", crear: () => calibrarDemanda(ferreteria(), 0.42) },

  // Servicios
  { clave: "lavanderia", titulo: "Lavandería industrial", emoji: "🧺", categoria: "servicios", sector: "Servicios", modelo: "unidades", modeloLabel: "Servicios", escala: "Mediano", resumen: "Lavado, tintorería y planchado, hogares + hoteles.", crear: () => calibrarDemanda(lavanderia(), 1.375) },
  { clave: "peluqueria", titulo: "Salón de belleza", emoji: "💇", categoria: "servicios", sector: "Servicios", modelo: "unidades", modeloLabel: "Servicios", escala: "Pequeño", resumen: "Corte, color, manicure y tratamientos.", crear: () => calibrarDemanda(peluqueria(), 0.49) },
  { clave: "consultora", titulo: "Consultora de negocios", emoji: "💼", categoria: "servicios", sector: "Servicios", modelo: "unidades", modeloLabel: "Servicios", escala: "Pequeño", resumen: "Estrategia, marketing y capacitación para PYMES.", crear: () => calibrarDemanda(consultoria(), 0.49) },

  // Suscripciones
  { clave: "gimnasio", titulo: "Gimnasio con membresías", emoji: "💪", categoria: "suscripcion", sector: "Servicios", modelo: "suscripcion", modeloLabel: "Suscripción", escala: "Grande", resumen: "Base recurrente de socios con altas y churn.", crear: () => calibrarDemanda(gimnasio(), 0.92) },
  { clave: "academia", titulo: "Academia online", emoji: "🎓", categoria: "suscripcion", sector: "Servicios", modelo: "suscripcion", modeloLabel: "Suscripción", escala: "Mediano", resumen: "Cursos de programación con membresía mensual.", crear: () => calibrarDemanda(academiaOnline(), 1.31) },
  { clave: "podcast", titulo: "Podcast con membresía", emoji: "🎙️", categoria: "suscripcion", sector: "Servicios", modelo: "suscripcion", modeloLabel: "Suscripción", escala: "Pequeño", resumen: "Episodios extra y comunidad para suscriptores.", crear: () => calibrarDemanda(podcastPremium(), 0.79) },

  // Medios
  { clave: "medio", titulo: "Medio digital", emoji: "📰", categoria: "medios", sector: "Servicios", modelo: "publicidad", modeloLabel: "Publicidad", escala: "Grande", resumen: "Portal de noticias que vive de pauta. Audiencia × CPM.", ensena: "Un portal de noticias necesita mucha audiencia para vivir de pauta. Con el tráfico del ejemplo no recupera lo invertido: observa qué audiencia haría falta para equilibrar.", veredicto: "rechazo", crear: () => calibrarDemanda(medioDigital(), 1.38) },
  { clave: "radio", titulo: "Programa radial", emoji: "📻", categoria: "medios", sector: "Servicios", modelo: "publicidad", modeloLabel: "Publicidad", escala: "Mediano", resumen: "Matutino FM + streaming con cuñas y menciones.", crear: () => calibrarDemanda(programaRadial(), 0.6) },
  { clave: "youtube", titulo: "Canal de YouTube", emoji: "📹", categoria: "medios", sector: "Servicios", modelo: "publicidad", modeloLabel: "Publicidad", escala: "Mediano", resumen: "Viajes, cultura y noticias. AdSense + brand deals.", crear: () => calibrarDemanda(canalYoutube(), 0.31) },

  // Turismo
  { clave: "turismo", titulo: "Operadora de turismo", emoji: "🏔️", categoria: "turismo", sector: "Servicios", modelo: "unidades", modeloLabel: "Rutas turísticas", escala: "Grande", resumen: "Uyuni, Amazonía, city tours y trekking.", crear: () => calibrarDemanda(operadoraTurismo(), 0.47) },
  { clave: "hostal", titulo: "Hostal boutique", emoji: "🏨", categoria: "turismo", sector: "Servicios", modelo: "unidades", modeloLabel: "Hospitalidad", escala: "Mediano", resumen: "Casa colonial restaurada con 12 habitaciones.", crear: hostalBoutique },

  // Agricultura
  { clave: "quinua", titulo: "Cultivo de quinua", emoji: "🌾", categoria: "agricultura", sector: "Agricultura", modelo: "unidades", modeloLabel: "Agricultura", escala: "Grande", resumen: "Quinua real orgánica para exportación.", crear: () => calibrarDemanda(cultivoQuinua(), 0.345) },
  { clave: "hidroponico", titulo: "Invernadero hidropónico", emoji: "🌱", categoria: "agricultura", sector: "Agricultura", modelo: "unidades", modeloLabel: "Agricultura tecnificada", escala: "Mediano", resumen: "Lechuga, tomate y hierbas premium para gourmet.", crear: () => calibrarDemanda(invernaderoHidroponico(), 0.68) },

  // Costo-beneficio
  { clave: "solar", titulo: "Planta solar industrial", emoji: "☀️", categoria: "costo_beneficio", sector: "Servicios", modelo: "costo_beneficio", modeloLabel: "Costo-beneficio", escala: "Grande", resumen: "Paneles solares evaluados por ahorro vs inversión.", ensena: "En Bolivia la electricidad está subsidiada, lo que reduce el ahorro de los paneles. Un buen proyecto técnico puede no ser buen negocio si el precio de lo que se ahorra es bajo.", veredicto: "rechazo", crear: plantaSolar },
  { clave: "digitalizacion", titulo: "Digitalización de empresa", emoji: "💻", categoria: "costo_beneficio", sector: "Servicios", modelo: "costo_beneficio", modeloLabel: "Costo-beneficio", escala: "Mediano", resumen: "ERP, CRM y e-commerce evaluado por ahorro + ventas.", ensena: "Una digitalización rara vez se paga sola en 5 años. Mira qué parte del beneficio son ahorros seguros y qué parte son ventas hipotéticas.", veredicto: "marginal", crear: digitalizacionEmpresa },
  { clave: "camarafrio", titulo: "Cámara de frío para cooperativa", emoji: "🧊", categoria: "costo_beneficio", sector: "Agricultura", modelo: "costo_beneficio", modeloLabel: "Pérdidas evitadas", escala: "Mediano", resumen: "No vende nada nuevo: el beneficio es la fruta que deja de perderse.", ensena: "El beneficio no siempre es ingreso: puede ser una pérdida que se evita. Se mide con datos de merma y se valora al precio de venta.", veredicto: "viable", crear: camaraFrioCooperativa },

  // Marketing
  { clave: "marketingresto", titulo: "Plan de marketing para un restaurante", emoji: "📣", categoria: "marketing", sector: "Servicios", modelo: "costo_beneficio", modeloLabel: "Ventas adicionales", escala: "Pequeño", resumen: "Marca, web y pauta evaluadas por el margen de las ventas extra.", ensena: "Se evalúa el margen de las ventas ADICIONALES atribuidas al plan, no las ventas del negocio. El supuesto de atribución es el punto más frágil: conviene probar qué pasa si rinde la mitad.", veredicto: "viable", crear: planMarketingRestaurante },
  { clave: "campanatv", titulo: "Campaña masiva en TV y vallas", emoji: "📺", categoria: "marketing", sector: "Servicios", modelo: "costo_beneficio", modeloLabel: "Ventas adicionales", escala: "Mediano", resumen: "Costo alto y fijo, efecto incierto: no recupera lo gastado.", ensena: "Un proyecto puede ser un buen negocio y la campaña igual no convenir. Muestra el criterio de rechazo: VAN negativo y TIR bajo el costo del capital.", veredicto: "rechazo", crear: campanaMasivaTv },

  // Social
  { clave: "postasalud", titulo: "Posta de salud comunitaria", emoji: "🏥", categoria: "social", sector: "Servicios", modelo: "costo_beneficio", modeloLabel: "Beneficio social", escala: "Mediano", resumen: "Sin ingresos: el beneficio son traslados y jornadas evitadas.", ensena: "En proyectos sociales el beneficio se traduce a bolivianos con supuestos explícitos y se descuenta con una tasa social (menor que la de una empresa), con financiamiento propio.", veredicto: "viable", crear: postaSalud },

  // Eventos
  { clave: "festival", titulo: "Festival de música anual", emoji: "🎪", categoria: "eventos", sector: "Servicios", modelo: "unidades", modeloLabel: "Evento", escala: "Mediano", resumen: "Ingresos concentrados y cachets como costo dominante.", ensena: "Con costos fijos altos, el resultado depende de llenar el aforo. Prueba bajar la asistencia un 20% y mira qué pasa con el VAN.", veredicto: "marginal", crear: festivalMusica },

  // Alquiler
  { clave: "edificio", titulo: "Edificio de departamentos en alquiler", emoji: "🏢", categoria: "alquiler", sector: "Servicios", modelo: "unidades", modeloLabel: "Renta", escala: "Grande", resumen: "Inversión grande, flujo estable y lento.", ensena: "Rentabilidad modesta con riesgo bajo: compara con una tasa de depósito. El valor residual del terreno pesa mucho en el resultado final.", veredicto: "marginal", crear: edificioAlquiler },

  // Tanda 2
  { clave: "flotaelectrica", titulo: "Flota de reparto eléctrica", emoji: "🔌", categoria: "costo_beneficio", sector: "Servicios", modelo: "costo_beneficio", modeloLabel: "Ahorro de costos", escala: "Mediano", resumen: "Cambiar vans diésel por eléctricas: ahorro vs inversión.", ensena: "Un ahorro anual atractivo puede no justificar una inversión grande. Prueba subir el precio del combustible y observa cuándo el proyecto pasa a ser viable.", veredicto: "marginal", crear: flotaElectrica },
  { clave: "podcastauspicios", titulo: "Podcast con auspicios", emoji: "🎧", categoria: "medios", sector: "Servicios", modelo: "publicidad", modeloLabel: "Publicidad", escala: "Pequeño", resumen: "Gratis para el oyente, vive de menciones de marcas.", ensena: "Compara con el podcast de membresías: aquí el ingreso depende de audiencia × CPM, y el CPM sube cuando el público es de nicho. Todo depende de que la audiencia crezca.", veredicto: "viable", crear: podcastAuspicios },
  { clave: "radiocomunitaria", titulo: "Radio comunitaria rural", emoji: "📡", categoria: "medios", sector: "Servicios", modelo: "publicidad", modeloLabel: "Publicidad", escala: "Pequeño", resumen: "Audiencia chica y pauta barata: no cubre sus costos.", ensena: "Un proyecto con mucho valor social puede ser inviable como negocio. Discute cómo se financiaría: subvención, aportes o cambio de modelo.", veredicto: "rechazo", crear: radioComunitaria },
  { clave: "agenciamkt", titulo: "Agencia de marketing digital", emoji: "🎯", categoria: "servicios", sector: "Servicios", modelo: "unidades", modeloLabel: "Servicios", escala: "Pequeño", resumen: "Contratos mensuales y proyectos; casi sin activos.", ensena: "En servicios profesionales el costo es el equipo, no los activos. La inversión es baja y el riesgo está en perder clientes: prueba bajar los contratos mensuales.", veredicto: "viable", crear: agenciaMarketing },
  { clave: "appdelivery", titulo: "App de delivery para barrios", emoji: "📱", categoria: "tecnologia", sector: "Servicios", modelo: "unidades", modeloLabel: "Comisión por pedido", escala: "Mediano", resumen: "Desarrollo caro, ingreso por comisión y escala.", ensena: "Costo inicial alto y costo marginal bajo: el resultado depende del volumen de pedidos. Prueba con la mitad de los pedidos para ver el riesgo.", veredicto: "marginal", crear: appDelivery },
  { clave: "capacitacion", titulo: "Capacitación técnica para jóvenes", emoji: "🎓", categoria: "social", sector: "Servicios", modelo: "costo_beneficio", modeloLabel: "Beneficio social", escala: "Mediano", resumen: "El beneficio es el mayor ingreso de los egresados.", ensena: "Cuánto del beneficio se atribuye al programa es el supuesto clave. Cambia el porcentaje y compara el VAN con el de la posta de salud.", veredicto: "marginal", crear: capacitacionJovenes },
  { clave: "pelicula", titulo: "Película nacional", emoji: "🎬", categoria: "eventos", sector: "Servicios", modelo: "unidades", modeloLabel: "Proyecto puntual", escala: "Grande", resumen: "Un año de producción e ingresos concentrados en pocos años.", ensena: "Un proyecto de una sola vez tiene ingresos que se agotan: aquí no hay flujo estable. Muestra por qué el periodo de recuperación y el riesgo importan.", veredicto: "marginal", crear: peliculaNacional },

  // Tanda 3
  { clave: "coworking", titulo: "Coworking", emoji: "🧑‍💻", categoria: "suscripcion", sector: "Servicios", modelo: "suscripcion", modeloLabel: "Suscripción", escala: "Mediano", resumen: "Puestos de trabajo compartidos con membresía mensual.", ensena: "Con alquiler fijo alto, la ocupación decide todo. Prueba bajar la ocupación al 50% y mira cuándo deja de convenir.", veredicto: "viable", crear: () => calibrarDemanda(coworking(), 1.375) },
  { clave: "parqueo", titulo: "Estacionamiento céntrico", emoji: "🅿️", categoria: "alquiler", sector: "Servicios", modelo: "unidades", modeloLabel: "Renta", escala: "Pequeño", resumen: "Abonos mensuales y cobro por hora en terreno alquilado.", ensena: "Un negocio de pocos activos y poca gente, pero con el alquiler del terreno como costo fijo dominante. Compara con el edificio de departamentos: ahí el terreno es propio.", veredicto: "viable", crear: () => calibrarDemanda(parqueo(), 1.185) },
  { clave: "aguapotable", titulo: "Agua potable para comunidad rural", emoji: "💧", categoria: "social", sector: "Servicios", modelo: "costo_beneficio", modeloLabel: "Beneficio social", escala: "Grande", resumen: "Horas de acarreo y salud, valoradas en bolivianos.", ensena: "El beneficio mezcla tiempo ahorrado y salud: cada uno necesita su supuesto explícito. Discute cuánto vale una hora de acarreo y quién debería pagar el proyecto.", veredicto: "viable", crear: aguaPotableRural },
  { clave: "tratamientoagua", titulo: "Planta de tratamiento de agua", emoji: "♻️", categoria: "costo_beneficio", sector: "Producción", modelo: "costo_beneficio", modeloLabel: "Ahorro de costos", escala: "Mediano", resumen: "Ahorro de agua y multas evitadas en una curtiembre.", ensena: "Una parte del beneficio es una multa que quizás nunca ocurra. Prueba quitarla del beneficio y observa si el proyecto se sostiene solo con el ahorro de agua.", veredicto: "marginal", crear: tratamientoAgua },
  { clave: "fidelizacion", titulo: "Programa de fidelización", emoji: "💳", categoria: "marketing", sector: "Comercio", modelo: "costo_beneficio", modeloLabel: "Ventas adicionales", escala: "Pequeño", resumen: "Tarjeta de puntos: el descuento come parte de la ganancia.", ensena: "No todas las compras de los clientes inscritos son extra: muchas se habrían hecho igual y aun así se les regala el descuento. Ese costo es lo que decide el resultado.", veredicto: "marginal", crear: programaFidelizacion },
  { clave: "seguridad", titulo: "Seguridad para un almacén", emoji: "🔒", categoria: "costo_beneficio", sector: "Comercio", modelo: "costo_beneficio", modeloLabel: "Pérdidas evitadas", escala: "Pequeño", resumen: "Cámaras y alarma contra robos y mermas.", ensena: "Compara con la cámara de frío: ambas evitan pérdidas. La diferencia es qué tan seguro es el dato de la pérdida; con inventarios reales el supuesto es más firme.", veredicto: "viable", crear: seguridadAlmacen },
  { clave: "mantenimiento", titulo: "Mantenimiento preventivo", emoji: "🛠️", categoria: "costo_beneficio", sector: "Producción", modelo: "costo_beneficio", modeloLabel: "Pérdidas evitadas", escala: "Pequeño", resumen: "Sensores para evitar paradas no programadas.", ensena: "Una inversión chica puede evitar una pérdida grande. El beneficio se valora como producción que no se pierde por parada, con el margen por hora de la planta.", veredicto: "viable", crear: mantenimientoPreventivo },
  { clave: "feria", titulo: "Feria comercial anual", emoji: "🏬", categoria: "eventos", sector: "Servicios", modelo: "unidades", modeloLabel: "Evento", escala: "Mediano", resumen: "Stands, entradas y auspicios en un recinto alquilado.", ensena: "El stand es un ingreso casi puro: cada expositor adicional aporta casi todo su precio. Prueba bajar los stands vendidos un 20% y compara con el festival de música.", veredicto: "viable", crear: () => calibrarDemanda(feriaComercial(), 0.824) },
  { clave: "salonmatrimonios", titulo: "Salón de eventos y matrimonios", emoji: "💍", categoria: "alquiler", sector: "Servicios", modelo: "unidades", modeloLabel: "Evento", escala: "Grande", resumen: "Terreno, salón y cocina con ingresos estacionales.", ensena: "Mucha inversión en obra y terreno con ingresos que dependen de la ocupación. El terreno conserva valor; el salón se deprecia. Mira cuánto pesa cada cosa en el resultado final.", veredicto: "marginal", crear: () => calibrarDemanda(salonEventos(), 0.848) },
  { clave: "lanzamiento", titulo: "Campaña de lanzamiento de producto", emoji: "🚀", categoria: "marketing", sector: "Producción", modelo: "costo_beneficio", modeloLabel: "Ventas adicionales", escala: "Mediano", resumen: "Efecto fuerte el primer año que se desvanece después.", ensena: "El beneficio de una campaña cae año a año. Es un error común proyectarlo constante: cambia el crecimiento del beneficio y mira cuánto se mueve el VAN.", veredicto: "marginal", crear: lanzamientoProducto },
  { clave: "saas", titulo: "Software para pymes (SaaS)", emoji: "☁️", categoria: "tecnologia", sector: "Servicios", modelo: "suscripcion", modeloLabel: "Suscripción", escala: "Mediano", resumen: "Desarrollo caro, clientes que pagan cada mes.", ensena: "Costo inicial alto y costo marginal casi cero: la escala lo es todo. Prueba con la mitad de los clientes y observa cuánto empeora el resultado.", veredicto: "marginal", crear: () => calibrarDemanda(softwareSaaS(), 1.528) },
  { clave: "reforestacion", titulo: "Reforestación con bonos de carbono", emoji: "🌳", categoria: "agricultura", sector: "Agricultura", modelo: "unidades", modeloLabel: "Largo plazo", escala: "Grande", resumen: "Ingresos que llegan recién después del horizonte de evaluación.", ensena: "El horizonte de 5 años perjudica a proyectos de maduración lenta. Un proyecto puede ser bueno a 20 años y rechazado a 5: la decisión depende de cuánto tiempo se mire.", veredicto: "rechazo", crear: reforestacionCarbono },
];

// Los ejemplos pensados como viables no deben quedarse sin caja en el año 1: si el
// capital de trabajo no alcanza, se sube lo justo. Los de VAN negativo se dejan como están.
export const PLANTILLAS: PlantillaMeta[] = PLANTILLAS_SIN_COLCHON.map((pl) => ({
  ...pl,
  crear: () => {
    const p = pl.crear();
    return construirFlujoCaja(p).indicadores.van > 0 ? conColchonDeCaja(p) : p;
  },
}));
