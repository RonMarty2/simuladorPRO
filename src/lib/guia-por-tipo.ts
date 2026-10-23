/**
 * Guía por tipo de negocio para el constructor.
 *
 * Dice, para cada tipo, qué suele llevar un proyecto de ese rubro (inversiones,
 * costos directos, gastos, personal) y si el terreno es usual. Sirve para que el
 * alumno no arme todos los proyectos con la misma estructura: un restaurante
 * normalmente alquila su local, una clínica concentra la inversión en equipos y
 * un microcrédito casi no tiene activos pero necesita plata para prestar.
 *
 * IMPORTANTE: es una guía del equipo, escrita con el conocimiento general de
 * cada rubro y lo que dicen las fichas de `docs/metodologia/tipos/`. No son
 * datos auditados de Bolivia: validarla con empresarios y gremios del rubro
 * (Fase 5 del plan).
 */

import type { CategoriaPlantilla } from "./plantillas";

export type UsoTerreno = "usual" | "depende" | "raro";

export interface GuiaTipo {
  titulo: string;
  /** ¿Es normal que un proyecto de este tipo compre terreno? */
  terreno: UsoTerreno;
  notaTerreno: string;
  inversiones: string[];
  costosDirectos: string[];
  gastos: string[];
  personal: string[];
  /** Preguntas o errores típicos que conviene mirar en este rubro. */
  cuidado: string[];
}

export const GUIA_POR_TIPO: Record<CategoriaPlantilla, GuiaTipo> = {
  gastronomia: {
    titulo: "Gastronomía",
    terreno: "raro",
    notaTerreno:
      "Casi todos los restaurantes, cafeterías y food trucks alquilan su local o su punto. Comprar terreno para un restaurante es una decisión inmobiliaria, no gastronómica: si lo haces, justifícalo.",
    inversiones: ["Adecuación del local (cocina, salón, baños)", "Equipos de cocina y refrigeración", "Mobiliario y vajilla", "Licencias y registro sanitario"],
    costosDirectos: ["Insumos por plato (carne, verduras, lácteos)", "Empaques y descartables", "Bebidas"],
    gastos: ["Alquiler del local", "Servicios básicos y gas", "Contabilidad y licencias", "Marketing y redes", "Comisiones de apps de delivery"],
    personal: ["Cocineros y ayudantes", "Meseros", "Cajero y administrador"],
    cuidado: ["¿Cuántos clientes caben por turno?", "El alquiler y el costo de insumos pesan más que cualquier equipo"],
  },
  produccion: {
    titulo: "Producción industrial",
    terreno: "depende",
    notaTerreno:
      "Un taller pequeño suele alquilar un galpón. Una fábrica con maquinaria pesada puede comprar terreno, pero la decisión debe pesar contra alquilar.",
    inversiones: ["Galpón o adecuación", "Maquinaria de producción", "Equipos de empaque y control de calidad", "Registros sanitarios y permisos"],
    costosDirectos: ["Materia prima", "Empaque", "Mano de obra directa", "Energía de planta"],
    gastos: ["Alquiler del galpón (si no es propio)", "Mantenimiento de máquinas", "Transporte y distribución", "Seguros"],
    personal: ["Operarios", "Supervisor de producción", "Administración y ventas"],
    cuidado: ["Capacidad de la planta frente a lo que proyectas vender", "Cuánto stock de materia prima inmovilizas"],
  },
  comercio: {
    titulo: "Comercio",
    terreno: "raro",
    notaTerreno:
      "Una tienda, ferretería o comercio online alquila su local o no necesita. Un depósito propio solo se justifica con mucho volumen y se puede reemplazar por alquiler.",
    inversiones: ["Adecuación del local", "Estanterías, vitrinas y caja", "Sistema de inventario y punto de venta", "Stock inicial (capital de trabajo)"],
    costosDirectos: ["Costo de la mercadería vendida", "Fletes de compra", "Comisión de pasarela de pago"],
    gastos: ["Alquiler del local", "Servicios básicos", "Marketing y publicidad", "Transporte y entregas"],
    personal: ["Vendedores", "Encargado de almacén", "Administrador"],
    cuidado: ["El stock inicial pesa más que los equipos", "Margen bruto y rotación de inventario"],
  },
  servicios: {
    titulo: "Servicios profesionales",
    terreno: "raro",
    notaTerreno:
      "Un negocio de servicios (lavandería, salón de belleza, consultora, agencia) casi nunca compra terreno: alquila una oficina o un local.",
    inversiones: ["Equipos propios del servicio (lavadoras, sillones, computadoras)", "Adecuación del local u oficina", "Software y licencias"],
    costosDirectos: ["Insumos por servicio (detergente, productos, materiales)", "Subcontratos por proyecto", "Comisiones de venta"],
    gastos: ["Alquiler", "Servicios básicos", "Marketing", "Contabilidad y licencias"],
    personal: ["Personal que presta el servicio (es el costo principal)", "Recepción y administración"],
    cuidado: ["Los sueldos pesan más que los equipos", "Si te pagan a 30 o 60 días, necesitas capital de trabajo"],
  },
  suscripcion: {
    titulo: "Suscripciones y membresías",
    terreno: "raro",
    notaTerreno:
      "Un gimnasio, coworking o academia alquila el local. Lo que mueve el negocio es la base de socios, no el inmueble.",
    inversiones: ["Adecuación del local", "Equipos o mobiliario del servicio", "Plataforma o app de socios", "Control de acceso"],
    costosDirectos: ["Comisión de la pasarela de pago por socio", "Soporte y contenido por suscriptor"],
    gastos: ["Alquiler", "Servicios básicos", "Marketing de captación", "Software de gestión"],
    personal: ["Instructores o anfitriones", "Recepción", "Gerente"],
    cuidado: ["¿Cuántos socios necesitas para cubrir los costos fijos?", "Cuántos se dan de baja cada mes pesa más que cuántos entran"],
  },
  medios: {
    titulo: "Medios y publicidad",
    terreno: "raro",
    notaTerreno: "Un medio digital, programa o canal no necesita terreno: invierte en equipos de producción y en contenido.",
    inversiones: ["Equipos de grabación y edición", "Plataforma web o estudio", "Licencias de software"],
    costosDirectos: ["Producción por contenido", "Comisión de la plataforma o red de anuncios", "Alojamiento y transmisión"],
    gastos: ["Equipo de ventas de publicidad", "Marketing propio", "Alquiler de estudio u oficina"],
    personal: ["Conductores o creadores", "Productores y editores", "Ventas de publicidad"],
    cuidado: ["Tu audiencia vive en una plataforma ajena", "Los anunciantes grandes pagan con atraso"],
  },
  turismo: {
    titulo: "Turismo y hospitalidad",
    terreno: "depende",
    notaTerreno:
      "Un hostal o hotel propio sí implica inmueble (a veces ya construido). Una operadora de tours o una agencia no necesita terreno: invierte en vehículos y equipos.",
    inversiones: ["Inmueble o adecuación (hostal)", "Vehículos y equipo de campo (operadora)", "Mobiliario y habitaciones", "Registro turístico y licencias"],
    costosDirectos: ["Insumos por noche vendida (amenities, desayuno)", "Costo por pasajero en tours (alojamiento, comidas, entradas)"],
    gastos: ["Comisiones de plataformas de reserva", "Servicios básicos", "Marketing y web", "Mantenimiento del inmueble"],
    personal: ["Recepción y limpieza", "Guías y choferes", "Gerente o coordinador"],
    cuidado: ["La ocupación y la temporada manejan todo", "Un bloqueo o una alerta de viaje puede dejarte sin huéspedes por semanas"],
  },
  agricultura: {
    titulo: "Agricultura",
    terreno: "usual",
    notaTerreno:
      "La tierra es un insumo central. Comprarla inmoviliza mucha plata: también es común arrendarla o trabajar en tierra familiar. Si es propia o heredada, valórala igual: tiene un costo de oportunidad.",
    inversiones: ["Tierra o derecho de uso", "Riego, invernaderos o cercos", "Maquinaria y herramientas", "Almacén o galpón de poscosecha"],
    costosDirectos: ["Semilla o plantines", "Fertilizantes y agroquímicos", "Mano de obra de campaña", "Combustible y transporte de cosecha"],
    gastos: ["Alquiler de tierra (si es arrendada)", "Certificaciones (orgánico, SENASAG)", "Seguros", "Asistencia técnica"],
    personal: ["Jornaleros de campaña", "Encargado de finca", "Administrador"],
    cuidado: ["Entre sembrar y vender pasan meses: capital de trabajo para toda la campaña", "El clima y el precio internacional pueden dejarte con pérdida un año"],
  },
  costo_beneficio: {
    titulo: "Proyectos de ahorro y eficiencia",
    terreno: "raro",
    notaTerreno:
      "Un proyecto de ahorro mejora algo que ya existe (la planta, la flota, el edificio). Rara vez requiere terreno nuevo.",
    inversiones: ["Equipo que genera el ahorro (paneles, sensores, software)", "Instalación y puesta en marcha", "Capacitación del personal"],
    costosDirectos: [],
    gastos: ["Mantenimiento y repuestos del equipo", "Medición y verificación del ahorro", "Seguro del equipo"],
    personal: ["Técnico de operación y mantenimiento"],
    cuidado: ["El ahorro real suele ser menor al prometido", "Un equipo pierde rendimiento cada año"],
  },
  marketing: {
    titulo: "Marketing y campañas",
    terreno: "raro",
    notaTerreno: "Una campaña o un plan de marketing no necesita terreno: el costo está en producción, medios y equipo.",
    inversiones: ["Producción de la campaña (spots, diseño, web)", "Herramientas de medición", "Material de marca"],
    costosDirectos: [],
    gastos: ["Pauta en medios", "Agencia o freelancers", "Promociones y descuentos", "Medición de resultados"],
    personal: ["Responsable de marketing"],
    cuidado: ["¿Cuántas ventas habrían ocurrido sin la campaña?", "El efecto se desvanece cuando dejas de pautar"],
  },
  social: {
    titulo: "Proyectos sociales y públicos",
    terreno: "depende",
    notaTerreno:
      "Es común que la comunidad o el municipio cedan el terreno. Si lo recibes cedido, pon su valor estimado como inversión para no subestimar el costo del proyecto.",
    inversiones: ["Construcción o adecuación del local", "Equipamiento del servicio", "Capacitación inicial"],
    costosDirectos: [],
    gastos: ["Medicamentos, insumos o materiales", "Servicios básicos y mantenimiento", "Seguimiento y evaluación"],
    personal: ["Personal técnico del servicio", "Promotores comunitarios"],
    cuidado: ["¿Quién paga el servicio cuando se acaba el financiamiento?", "El beneficio se valora con supuestos: explícalos"],
  },
  eventos: {
    titulo: "Eventos y proyectos puntuales",
    terreno: "raro",
    notaTerreno: "Un festival, una feria o una producción alquila el recinto. Comprar terreno para un evento puntual casi nunca tiene sentido.",
    inversiones: ["Producción y montaje", "Equipos de sonido, luces y escenario", "Permisos y seguros"],
    costosDirectos: ["Cachets y artistas", "Logística y seguridad por evento", "Alimentos y bebidas"],
    gastos: ["Alquiler del recinto", "Publicidad y promoción", "Permisos municipales"],
    personal: ["Equipo de producción", "Personal eventual del día del evento"],
    cuidado: ["Casi todo el gasto sale antes de vender la primera entrada", "Si el evento se cae, el gasto ya está hecho"],
  },
  alquiler: {
    titulo: "Alquiler y renta",
    terreno: "usual",
    notaTerreno: "En un negocio de renta el inmueble es el proyecto: el terreno y la construcción son la inversión principal.",
    inversiones: ["Terreno", "Construcción o compra del inmueble", "Acabados y mobiliario de las unidades"],
    costosDirectos: [],
    gastos: ["Impuestos al inmueble", "Mantenimiento y reparaciones", "Seguros", "Administración y cobranza"],
    personal: ["Administrador", "Portero o mantenimiento"],
    cuidado: ["La vacancia entre inquilinos", "Parte del retorno es la plusvalía, que no se cobra hasta vender"],
  },
  tecnologia: {
    titulo: "Tecnología y plataformas",
    terreno: "raro",
    notaTerreno: "Una plataforma o un software no necesita terreno: la inversión es desarrollo, equipos y nube.",
    inversiones: ["Desarrollo de la plataforma o software", "Equipos del equipo técnico", "Registro de marca y dominios"],
    costosDirectos: ["Comisión de pagos por transacción", "Nube y servidores por usuario"],
    gastos: ["Marketing de captación", "Soporte al cliente", "Herramientas y licencias", "Alquiler de oficina o coworking"],
    personal: ["Desarrolladores", "Soporte", "Ventas"],
    cuidado: ["Gastas casi todo antes de vender: ¿cuánto aguantas sin ingresos?", "Los costos en dólares (nube, licencias) suben con el tipo de cambio"],
  },
  salud_privada: {
    titulo: "Salud privada",
    terreno: "depende",
    notaTerreno:
      "Muchas clínicas arrancan en un edificio alquilado y adecuado; comprar el inmueble es otra decisión. Lo que más pesa es el equipamiento médico.",
    inversiones: ["Adecuación del edificio (quirófano, consultorios)", "Equipos de imagen y laboratorio", "Equipamiento de internación", "Habilitación del SEDES"],
    costosDirectos: ["Honorarios médicos por consulta", "Reactivos, placas y descartables", "Medicamentos y alimentación por día-cama"],
    gastos: ["Alquiler del edificio", "Gases medicinales y servicios", "Seguro de responsabilidad médica", "Convenios con cajas y aseguradoras"],
    personal: ["Enfermeras y auxiliares", "Técnicos de laboratorio e imagen", "Administración y facturación"],
    cuidado: ["Cajas de salud y aseguradoras pagan a 60, 90 o más días", "Un equipo caro necesita volumen para pagarse"],
  },
  educacion_privada: {
    titulo: "Educación privada",
    terreno: "depende",
    notaTerreno:
      "Un colegio propio sí suele tener terreno y aulas, pero muchos arrancan en un edificio alquilado. Revisa cuál de los dos tiene sentido para tu tamaño.",
    inversiones: ["Terreno y aulas (si es propio)", "Laboratorio y sala de computación", "Mobiliario escolar", "Autorización del Ministerio"],
    costosDirectos: ["Material didáctico por alumno", "Refrigerio o almuerzo si lo ofreces"],
    gastos: ["Alquiler (si no es propio)", "Servicios básicos", "Capacitación docente", "Promoción de inscripciones"],
    personal: ["Docentes (el costo principal)", "Dirección y administración", "Portería y limpieza"],
    cuidado: ["Pagas 12 meses de sueldos y cobras 10 pensiones", "La pensión está regulada por el Ministerio"],
  },
  franquicia: {
    titulo: "Franquicias",
    terreno: "raro",
    notaTerreno:
      "Quien compra una franquicia alquila el local que cumple con el manual de la marca. El inmueble propio no es parte del negocio de franquiciado.",
    inversiones: ["Derecho de franquicia (entrada)", "Adecuación del local según el manual", "Equipos exigidos por la marca", "Capacitación inicial"],
    costosDirectos: ["Insumos comprados al franquiciante", "Regalía y aporte de marketing sobre las ventas"],
    gastos: ["Alquiler del local", "Servicios", "Marketing local"],
    personal: ["Gerente del local", "Personal de atención"],
    cuidado: ["La regalía se paga aunque pierdas", "Lo que vende el promedio de la red no es lo que vas a vender tú"],
  },
  concesion: {
    titulo: "Concesiones de infraestructura",
    terreno: "raro",
    notaTerreno:
      "En una concesión el Estado normalmente aporta los derechos sobre el suelo o la vía; el concesionario invierte en la obra y la red.",
    inversiones: ["Obra civil o red", "Equipos (bombas, medidores, plantas)", "Estudios y licencia de la concesión"],
    costosDirectos: ["Energía e insumos por unidad de servicio"],
    gastos: ["Mantenimiento de la red", "Regulación y seguros", "Cobranza y atención al usuario"],
    personal: ["Operadores y técnicos", "Facturación y atención"],
    cuidado: ["La tarifa la autoriza el regulador, no tú", "La inversión dura décadas, pero tú evalúas 5 años"],
  },
  microcredito: {
    titulo: "Microcrédito y finanzas",
    terreno: "raro",
    notaTerreno: "Una cooperativa o financiera alquila oficina. Lo que inmoviliza plata no son los activos sino la cartera que prestas.",
    inversiones: ["Adecuación de oficina y bóveda", "Sistema de gestión de cartera", "Autorización del regulador"],
    costosDirectos: ["Costo de fondeo (lo que pagas por la plata que prestas)", "Previsión por mora", "Cobranza"],
    gastos: ["Alquiler de oficina", "Auditoría y cumplimiento", "Promoción"],
    personal: ["Oficiales de crédito", "Cajeros", "Administración y cumplimiento"],
    cuidado: ["La mora decide el negocio", "Necesitas capital para prestar antes de cobrar el primer interés"],
  },
};

/** Etiquetas de los tipos para el selector, en el orden en que se muestran. */
export const TIPOS_PARA_SELECTOR = Object.entries(GUIA_POR_TIPO).map(([clave, g]) => ({
  clave: clave as CategoriaPlantilla,
  titulo: g.titulo,
}));

/** Sector económico que corresponde por defecto a cada tipo de negocio. */
export const SECTOR_POR_TIPO: Record<CategoriaPlantilla, "produccion" | "comercio" | "servicios" | "agricultura"> = {
  gastronomia: "servicios",
  produccion: "produccion",
  comercio: "comercio",
  servicios: "servicios",
  suscripcion: "servicios",
  medios: "servicios",
  turismo: "servicios",
  agricultura: "agricultura",
  costo_beneficio: "servicios",
  marketing: "servicios",
  social: "servicios",
  eventos: "servicios",
  alquiler: "servicios",
  tecnologia: "servicios",
  salud_privada: "servicios",
  educacion_privada: "servicios",
  franquicia: "comercio",
  concesion: "servicios",
  microcredito: "servicios",
};

/** ¿Tiene sentido el terreno para este proyecto? Devuelve la guía solo si el tipo lo marca como raro. */
export function terrenoAtipico(tipoNegocio: string | undefined, terrenoTotal: number): GuiaTipo | null {
  if (!tipoNegocio || terrenoTotal <= 0) return null;
  const guia = (GUIA_POR_TIPO as Record<string, GuiaTipo>)[tipoNegocio];
  return guia && guia.terreno === "raro" ? guia : null;
}
