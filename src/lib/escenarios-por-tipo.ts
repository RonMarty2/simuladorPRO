import {
  DEFAULT_OPTIMISTA,
  DEFAULT_PESIMISTA,
  type EscenariosConfig,
  type ModificadoresEscenario,
} from "./escenarios";

/**
 * Escenarios optimista y pesimista propios de cada tipo de negocio.
 *
 * Los escenarios genéricos (precios -15%, demanda -25%, costos +20%) son los mismos
 * para una clínica y para un cultivo de quinua. Aquí cada tipo cambia las variables
 * que de verdad lo golpean: ocupación en turismo, mora y fondeo en microcrédito,
 * precio internacional y clima en agricultura, cobranza lenta en salud, etc.
 *
 * Orden de prioridad al resolver: genérico < tipo < lo que el docente configuró
 * para el curso. Las magnitudes son criterios del equipo basados en las situaciones
 * de las fichas de `docs/metodologia/tipos/`; no son datos auditados de Bolivia.
 */

export interface EscenarioDeTipo {
  pesimista: Partial<ModificadoresEscenario>;
  optimista: Partial<ModificadoresEscenario>;
  /** Qué pasa en el pesimista de este tipo, en una frase. */
  motivoPesimista: string;
  motivoOptimista: string;
}

export const ESCENARIOS_POR_TIPO: Record<string, EscenarioDeTipo> = {
  gastronomia: {
    pesimista: { demandaMul: 0.8, precioMul: 0.95, costoDirectoMul: 1.2, personalMul: 1.08 },
    optimista: { demandaMul: 1.12, precioMul: 1.05, costoDirectoMul: 0.97 },
    motivoPesimista: "Menos clientes por un competidor o una crisis de consumo, insumos que suben y un salario mínimo más alto.",
    motivoOptimista: "El local se llena, aguantas un precio un poco mayor y negocias mejor con tus proveedores.",
  },
  produccion: {
    pesimista: { demandaMul: 0.8, costoDirectoMul: 1.25, inversionMul: 1.12, capitalTrabajoMul: 1.15 },
    optimista: { demandaMul: 1.12, costoDirectoMul: 0.95 },
    motivoPesimista: "La materia prima importada sube con el dólar, la maquinaria cuesta más y vendes menos de lo que la planta puede producir.",
    motivoOptimista: "Vendes cerca de la capacidad de la planta y compras la materia prima en mejores condiciones.",
  },
  comercio: {
    pesimista: { demandaMul: 0.78, costoDirectoMul: 1.25, capitalTrabajoMul: 1.2 },
    optimista: { demandaMul: 1.12, costoDirectoMul: 0.95 },
    motivoPesimista: "La mercadería importada sube con el dólar, vendes menos y el stock inmoviliza más plata.",
    motivoOptimista: "El tráfico responde, la mercadería rota más rápido y compras con mejor descuento.",
  },
  servicios: {
    pesimista: { demandaMul: 0.8, precioMul: 0.92, personalMul: 1.1, capitalTrabajoMul: 1.15 },
    optimista: { demandaMul: 1.15, precioMul: 1.05 },
    motivoPesimista: "Pierdes clientes, bajas precios para retenerlos, los sueldos suben y cobras más tarde.",
    motivoOptimista: "Tu cartera de clientes crece y puedes subir tarifas sin perderlos.",
  },
  suscripcion: {
    pesimista: { demandaMul: 0.7, precioMul: 0.95, costoGeneralMul: 1.1 },
    optimista: { demandaMul: 1.2, precioMul: 1.03 },
    motivoPesimista: "Entran menos socios y se van más rápido de lo que supusiste.",
    motivoOptimista: "Entran más socios y se quedan más tiempo.",
  },
  medios: {
    pesimista: { precioMul: 0.7, demandaMul: 0.85, costoGeneralMul: 1.1 },
    optimista: { precioMul: 1.1, demandaMul: 1.25 },
    motivoPesimista: "El precio por mil baja 30% (anunciante que se va o algoritmo que cambia) y la audiencia crece menos.",
    motivoOptimista: "Un contenido se viraliza y los anunciantes pagan mejor.",
  },
  turismo: {
    pesimista: { demandaMul: 0.65, precioMul: 0.92, costoGeneralMul: 1.1 },
    optimista: { demandaMul: 1.15, precioMul: 1.05 },
    motivoPesimista: "Un bloqueo, una alerta de viaje o una temporada baja larga dejan sin huéspedes por semanas y obligan a bajar tarifas.",
    motivoOptimista: "Buena temporada, más reservas directas y tarifas más altas.",
  },
  agricultura: {
    pesimista: { demandaMul: 0.6, precioMul: 0.7, costoDirectoMul: 1.35, capitalTrabajoMul: 1.2 },
    optimista: { demandaMul: 1.1, precioMul: 1.15, costoDirectoMul: 0.95 },
    motivoPesimista: "Una sequía o una helada te quita parte de la cosecha, el precio internacional cae y los insumos importados suben.",
    motivoOptimista: "Buen clima, buen rendimiento y un precio internacional favorable.",
  },
  costo_beneficio: {
    pesimista: { precioMul: 0.62, costoGeneralMul: 1.15 },
    optimista: { precioMul: 1.05 },
    motivoPesimista: "El ahorro real medido es cerca de 60% del prometido (equipo que falla o menos uso) y el mantenimiento cuesta más.",
    motivoOptimista: "El equipo rinde como en la oferta y el ahorro se sostiene.",
  },
  marketing: {
    pesimista: { precioMul: 0.5, costoGeneralMul: 1.1 },
    optimista: { precioMul: 1.15 },
    motivoPesimista: "Solo la mitad de las ventas atribuidas a la campaña es realmente adicional: el resto se habría vendido igual.",
    motivoOptimista: "La campaña genera más ventas nuevas de las previstas.",
  },
  social: {
    pesimista: { precioMul: 0.7, personalMul: 1.1, costoGeneralMul: 1.15, capitalTrabajoMul: 1.2 },
    optimista: { precioMul: 1.1, costoGeneralMul: 0.95 },
    motivoPesimista: "El beneficio social valorado resulta menor al supuesto, retener personal en zona rural cuesta más y los desembolsos se atrasan.",
    motivoOptimista: "El servicio llega a más gente y el beneficio valorado se confirma.",
  },
  eventos: {
    pesimista: { demandaMul: 0.7, precioMul: 0.95, costoDirectoMul: 1.15, capitalTrabajoMul: 1.15 },
    optimista: { demandaMul: 1.15, precioMul: 1.05 },
    motivoPesimista: "Asiste menos público (lluvia, paro, moda que pasa) y los costos del evento ya estaban comprometidos.",
    motivoOptimista: "El evento se llena y consigues más auspicios.",
  },
  alquiler: {
    pesimista: { demandaMul: 0.85, precioMul: 0.9, inversionMul: 1.15, tasaInteresDeltaPp: 0.04 },
    optimista: { demandaMul: 1.05, precioMul: 1.05 },
    motivoPesimista: "Hay más vacancia, las rentas de mercado bajan, la obra se pasa del presupuesto y la tasa del crédito sube.",
    motivoOptimista: "Casi sin vacancia y con rentas que suben con el mercado.",
  },
  tecnologia: {
    pesimista: { demandaMul: 0.55, costoGeneralMul: 1.15, personalMul: 1.08 },
    optimista: { demandaMul: 1.3 },
    motivoPesimista: "La base de usuarios crece a la mitad de lo previsto mientras la nube y las herramientas en dólares suben.",
    motivoOptimista: "La plataforma despega más rápido de lo previsto.",
  },
  salud_privada: {
    pesimista: { demandaMul: 0.8, precioMul: 0.9, costoDirectoMul: 1.3, capitalTrabajoMul: 1.5 },
    optimista: { demandaMul: 1.1, precioMul: 1.03 },
    motivoPesimista: "Las aseguradoras bajan tarifas, hay menos pacientes, los insumos importados suben y las cajas pagan a 90 días o más.",
    motivoOptimista: "Los consultorios y las camas se llenan mejor y las cajas pagan a tiempo.",
  },
  educacion_privada: {
    pesimista: { demandaMul: 0.88, precioMul: 0.95, personalMul: 1.12, capitalTrabajoMul: 1.1 },
    optimista: { demandaMul: 1.05, precioMul: 1.03 },
    motivoPesimista: "Menos reinscripciones por la inflación, pensión congelada por el Ministerio y un salario mínimo más alto.",
    motivoOptimista: "El colegio llena sus cupos y la pensión puede ajustarse.",
  },
  franquicia: {
    pesimista: { demandaMul: 0.75, costoDirectoMul: 1.1, precioMul: 0.97 },
    optimista: { demandaMul: 1.12, costoDirectoMul: 0.97 },
    motivoPesimista: "Tu local vende menos que el promedio de la red que te mostraron, pero la regalía y los insumos obligatorios no bajan.",
    motivoOptimista: "La marca atrae más clientes de lo previsto en tu zona.",
  },
  concesion: {
    pesimista: { precioMul: 0.9, costoGeneralMul: 1.2, inversionMul: 1.1, tasaInteresDeltaPp: 0.04 },
    optimista: { precioMul: 1.08, costoGeneralMul: 0.97 },
    motivoPesimista: "El regulador congela la tarifa mientras los costos suben con la inflación y el crédito se encarece.",
    motivoOptimista: "El regulador autoriza el ajuste de tarifa a tiempo.",
  },
  microcredito: {
    pesimista: { costoDirectoMul: 1.35, demandaMul: 0.85, precioMul: 0.92 },
    optimista: { costoDirectoMul: 0.92, demandaMul: 1.1 },
    motivoPesimista: "La mora y el costo de fondeo suben, el tope de tasas achata lo que cobras y colocas menos créditos.",
    motivoOptimista: "La mora se mantiene baja y el fondeo cuesta menos.",
  },
};

export interface EscenariosResueltos {
  optimista: ModificadoresEscenario;
  pesimista: ModificadoresEscenario;
  /** Si los escenarios son propios del tipo del proyecto (y no los genéricos). */
  delTipo: EscenarioDeTipo | null;
}

/**
 * Resuelve optimista y pesimista: genérico, luego el del tipo de negocio, luego lo
 * que el docente configuró para el curso (esto último siempre gana).
 */
export function resolverEscenarios(
  config: EscenariosConfig | null | undefined,
  tipoNegocio?: string | null
): EscenariosResueltos {
  const delTipo = tipoNegocio ? (ESCENARIOS_POR_TIPO[tipoNegocio] ?? null) : null;
  return {
    optimista: { ...DEFAULT_OPTIMISTA, ...(delTipo?.optimista ?? {}), ...(config?.optimista ?? {}) },
    pesimista: { ...DEFAULT_PESIMISTA, ...(delTipo?.pesimista ?? {}), ...(config?.pesimista ?? {}) },
    delTipo,
  };
}

const ETIQUETA: Record<string, string> = {
  precioMul: "Precios",
  demandaMul: "Ventas (cantidades)",
  costoDirectoMul: "Costos directos",
  costoGeneralMul: "Gastos generales",
  personalMul: "Sueldos",
  inversionMul: "Inversión inicial",
  capitalTrabajoMul: "Capital de trabajo",
};

/** Cambios de un escenario en texto ("Ventas -40%, Precios -30%"), para mostrar al alumno. */
export function resumenCambios(mods: ModificadoresEscenario): string {
  const partes: string[] = [];
  for (const [campo, etiqueta] of Object.entries(ETIQUETA)) {
    const v = (mods as unknown as Record<string, number>)[campo];
    if (typeof v === "number" && Math.abs(v - 1) > 0.001) {
      partes.push(`${etiqueta} ${v > 1 ? "+" : ""}${Math.round((v - 1) * 100)}%`);
    }
  }
  if (mods.tasaInteresDeltaPp) {
    partes.push(`Tasa del crédito ${mods.tasaInteresDeltaPp > 0 ? "+" : ""}${Math.round(mods.tasaInteresDeltaPp * 100)} pp`);
  }
  return partes.join(", ");
}
