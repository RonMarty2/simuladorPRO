/**
 * Motor de eventos — FASE 6
 *
 * Funciones puras que:
 *   1. Inicializan el estado de simulación desde un proyecto
 *   2. Seleccionan qué evento aparece este turno (probabilístico)
 *   3. Aplican las consecuencias de la decisión del estudiante al estado
 *   4. Procesan la operación mensual (ingresos, costos, caja)
 *
 * El parser de consecuencias soporta el formato JSON usado en los eventos:
 *   "*1.10"  → multiplicador
 *   "+5%"    → porcentaje (suma)
 *   "-10%"   → porcentaje (resta)
 *   "+5000"  → suma absoluta
 *   "-3000"  → resta absoluta
 *   1.5      → setear absoluto
 */

import type { Evento, OpcionDecision } from "@/types/evento";
import type { EstadoSimulacion, Frecuencia } from "@/types/simulacion";
import type { Proyecto } from "@/types/proyecto";
import {
  calcularAportesPatronales,
  calcularCuotaPrestamoFrancesa,
  obtenerTasasAportes,
} from "./calculo-financiero";
import { construirFlujoCaja } from "./flujo-proyecto";

// ============================================================================
// INICIALIZACIÓN
// ============================================================================

export function inicializarEstadoDesdeProyecto(proyecto: Proyecto): EstadoSimulacion {
  const inversionTotal =
    Object.values(proyecto.inversiones)
      .flat()
      .reduce((acc, it) => acc + it.costoTotal, 0) + proyecto.capitalTrabajo;
  const deudaInicial = inversionTotal * proyecto.financiamiento.porcentajePrestamo;
  const cajaInicial = proyecto.capitalTrabajo;

  return {
    caja: cajaInicial,
    deuda: deudaInicial,
    precio_venta_multiplicador: 1,
    demanda_multiplicador: 1,
    costos_multiplicador: 1,
    reputacion: 0.5,
    ingresos_acumulados: 0,
    costos_acumulados: 0,
    utilidad_acumulada: 0,
    ultimo_evento: null,
    ultima_decision: null,
    ultimo_feedback: null,
    delta_caja: 0,
    delta_ingresos: 0,
  };
}

// ============================================================================
// CONFIGURACIÓN DE FRECUENCIA
// ============================================================================

export function turnosTotalesPorFrecuencia(freq: Frecuencia, anios = 5): number {
  if (freq === "mensual") return anios * 12;
  if (freq === "trimestral") return anios * 4;
  return anios * 2; // semestral
}

export function mesesPorTurno(freq: Frecuencia): number {
  if (freq === "mensual") return 1;
  if (freq === "trimestral") return 3;
  return 6;
}

// ============================================================================
// SELECCIÓN DE EVENTO DEL TURNO
// ============================================================================

/**
 * Selecciona el evento del turno usando probabilidad.
 * Si ningún evento cae, devuelve null (turno tranquilo).
 *
 * Filtra eventos cuyo turno_minimo no se alcanzó y los que afectan otros sectores.
 */
export type ModoSimulacionMotor = "automatico" | "docente_dispara" | "curado";

export interface ConfigSeleccionEvento {
  /** Modo de la simulación. Default 'automatico'. */
  modoSimulacion?: ModoSimulacionMotor;
  /** Si modo='curado': lista ordenada de IDs de eventos a aplicar. */
  eventosCurados?: string[] | null;
  /** Tipo de negocio del proyecto (para eventos propios de un tipo). */
  tipoNegocio?: string | null;
}

/**
 * Regla de relevancia de un evento para un proyecto.
 * - "todos" aplica a cualquiera.
 * - Tokens "tipo:xxx": el evento es propio de ese tipo de negocio y solo aplica
 *   si el proyecto es de ese tipo (el sector se ignora).
 * - Sin tokens de tipo: la regla de siempre, por sector.
 */
export function eventoAplicaAProyecto(
  sectoresAfectados: string[],
  sector: string | null | undefined,
  tipoNegocio?: string | null
): boolean {
  if (sectoresAfectados.includes("todos")) return true;
  const tipos = sectoresAfectados.filter((s) => s.startsWith("tipo:"));
  if (tipos.length > 0) return !!tipoNegocio && tipos.includes("tipo:" + tipoNegocio);
  return !!sector && sectoresAfectados.includes(sector);
}

export function seleccionarEventoTurno(
  turnoActual: number,
  sectorProyecto: string,
  eventos: Evento[],
  eventosYaUsados: string[] = [],
  rng: () => number = Math.random,
  config: ConfigSeleccionEvento = {}
): Evento | null {
  const modo = config.modoSimulacion ?? "automatico";

  // ── Modo 'docente_dispara': el motor no propone, el docente decide
  if (modo === "docente_dispara") return null;

  // ── Modo 'curado': aplicar la lista en orden, ignorar probabilidades
  if (modo === "curado" && config.eventosCurados && config.eventosCurados.length > 0) {
    // Cuántos eventos ya se aplicaron de la lista curada
    const aplicadosDeLista = config.eventosCurados.filter((id) =>
      eventosYaUsados.includes(id)
    ).length;
    // Siguiente evento de la lista
    const siguienteId = config.eventosCurados[aplicadosDeLista];
    if (!siguienteId) return null; // la lista se agotó
    const candidato = eventos.find((e) => e.id === siguienteId);
    if (!candidato) return null;
    // Verifica turno mínimo del evento (puede que el docente lo puso muy temprano)
    if (turnoActual < candidato.turno_minimo) return null;
    return candidato;
  }

  // ── Modo 'automatico' (lo de siempre): muestreo probabilístico
  const candidatos = eventos.filter(
    (e) =>
      turnoActual >= e.turno_minimo &&
      !eventosYaUsados.includes(e.id) &&
      eventoAplicaAProyecto(e.sectores_afectados, sectorProyecto, config.tipoNegocio)
  );
  if (candidatos.length === 0) return null;

  // Sumar probabilidades, normalizar y elegir
  const probTotal = candidatos.reduce((acc, e) => acc + e.probabilidad, 0);
  if (probTotal === 0) return null;

  // Probabilidad de que ALGÚN evento aparezca = min(0.4, suma): ~2 noticias por año en modo mensual
  const probAlgunEvento = Math.min(0.4, probTotal);
  if (rng() > probAlgunEvento) return null;

  // Ahora elegir cuál, ponderado por probabilidad individual
  let r = rng() * probTotal;
  for (const e of candidatos) {
    r -= e.probabilidad;
    if (r <= 0) return e;
  }
  return candidatos[candidatos.length - 1];
}

// ============================================================================
// PARSER DE CONSECUENCIAS
// ============================================================================

interface ConsecuenciaParseada {
  operacion: "multiplicar" | "sumar" | "restar" | "porcentaje" | "setear";
  valor: number;
}

export function parsearConsecuencia(raw: number | string): ConsecuenciaParseada | null {
  if (typeof raw === "number") return { operacion: "setear", valor: raw };
  const s = raw.trim();
  if (s.startsWith("*")) {
    return { operacion: "multiplicar", valor: parseFloat(s.slice(1)) };
  }
  if (s.startsWith("+") && s.endsWith("%")) {
    return { operacion: "porcentaje", valor: parseFloat(s.slice(1, -1)) / 100 };
  }
  if (s.startsWith("-") && s.endsWith("%")) {
    return { operacion: "porcentaje", valor: -parseFloat(s.slice(1, -1)) / 100 };
  }
  if (s.startsWith("+")) {
    return { operacion: "sumar", valor: parseFloat(s.slice(1)) };
  }
  if (s.startsWith("-")) {
    return { operacion: "restar", valor: parseFloat(s.slice(1)) };
  }
  const num = parseFloat(s);
  if (!isNaN(num)) return { operacion: "setear", valor: num };
  return null;
}

// Map de aliases a campos de EstadoSimulacion
const aliasACampo: Record<string, keyof EstadoSimulacion> = {
  caja: "caja",
  deuda: "deuda",
  precio_venta: "precio_venta_multiplicador",
  precio: "precio_venta_multiplicador",
  demanda: "demanda_multiplicador",
  costos: "costos_multiplicador",
  costos_generales: "costos_multiplicador",
  costos_produccion: "costos_multiplicador",
  costos_admin: "costos_multiplicador",
  costos_administracion: "costos_multiplicador",
  costos_comercializacion: "costos_multiplicador",
  costos_logistica: "costos_multiplicador",
  costos_importacion: "costos_multiplicador",
  costos_personal: "costos_multiplicador",
  costo_insumos: "costos_multiplicador",
  costos_servicios: "costos_multiplicador",
  costo_servicios: "costos_multiplicador",
  costo_combustible: "costos_multiplicador",
  costo_marketing: "costos_multiplicador",
  costo_personal: "costos_multiplicador",
  costo_devoluciones: "costos_multiplicador",
  inversion: "deuda",
  ingresos: "ingresos_acumulados",
  ingreso_envio: "ingresos_acumulados",
  ingreso_extra: "caja",
  margen: "precio_venta_multiplicador",
  reputacion: "reputacion",
  costo: "costos_multiplicador",
  costos_fijos: "costos_multiplicador",
  // Percepción del cliente y del equipo: se reflejan en la reputación
  calidad: "reputacion",
  servicio: "reputacion",
  clima_laboral: "reputacion",
  reputacion_local: "reputacion",
  clientes_recurrentes: "reputacion",
};

// "+1500" en estos campos es un pago en Bs: sale de la caja una sola vez
const PAGOS_EN_CAJA = new Set(["interes_pagado", "indemnizaciones", "comision_pagada"]);

function aplicarConsecuenciaAlEstado(
  estado: EstadoSimulacion,
  campo: string,
  raw: number | string
): EstadoSimulacion {
  const parsed = parsearConsecuencia(raw);
  if (!parsed) return estado;
  if (PAGOS_EN_CAJA.has(campo) && parsed.operacion === "sumar") {
    return { ...estado, caja: estado.caja - parsed.valor };
  }
  const claveEstado = aliasACampo[campo];
  if (!claveEstado) return estado;

  // "+1500" sobre un costo es un monto en Bs, no un factor: se paga una vez
  // desde la caja. Sumarlo al multiplicador lo dejaba en ~1500 y quebraba el negocio.
  if (
    claveEstado === "costos_multiplicador" &&
    (parsed.operacion === "sumar" || parsed.operacion === "restar") &&
    parsed.valor >= 10
  ) {
    const signo = parsed.operacion === "sumar" ? -1 : 1;
    return { ...estado, caja: estado.caja + signo * parsed.valor };
  }

  const valorActual = estado[claveEstado] as number;
  let nuevo = valorActual;

  switch (parsed.operacion) {
    case "multiplicar":
      nuevo = valorActual * parsed.valor;
      break;
    case "porcentaje":
      nuevo = valorActual * (1 + parsed.valor);
      break;
    case "sumar":
      nuevo = valorActual + parsed.valor;
      break;
    case "restar":
      nuevo = valorActual - parsed.valor;
      break;
    case "setear":
      nuevo = parsed.valor;
      break;
  }

  // Reputación se clampa entre 0 y 1
  if (claveEstado === "reputacion") {
    nuevo = Math.max(0, Math.min(1, nuevo));
  }

  return { ...estado, [claveEstado]: nuevo };
}

// ============================================================================
// APLICAR DECISIÓN
// ============================================================================

export function aplicarDecisionAEstado(
  estado: EstadoSimulacion,
  evento: Evento,
  opcion: OpcionDecision
): EstadoSimulacion {
  let nuevo = { ...estado };
  for (const [campo, valor] of Object.entries(opcion.consecuencias)) {
    nuevo = aplicarConsecuenciaAlEstado(nuevo, campo, valor);
  }
  nuevo.ultimo_evento = evento.titulo;
  nuevo.ultima_decision = `${opcion.letra}. ${opcion.texto}`;
  nuevo.ultimo_feedback = opcion.feedback_corto;
  return nuevo;
}

// ============================================================================
// AVANZAR OPERACIÓN MENSUAL/TRIMESTRAL/SEMESTRAL
// ============================================================================

export interface MetricasProyectoBase {
  ingresosAnuales: number;
  costosAnualesFijos: number; // personal + admin + comercialización
  costoInsumosPorUnidad: number;
  cantidadAnualUnidades: number;
  cuotaPrestamoMensual: number;
  capitalInicial: number;
  /**
   * Plan año por año tomado del flujo del constructor (crecimiento, suscripciones,
   * publicidad, costo-beneficio). Sin esto el simulador repetía el año 1 cinco veces
   * y los proyectos que crecen quebraban aunque su VAN fuera positivo.
   */
  porAnio?: { ingresos: number; costosInsumos: number; costosFijos: number }[];
}

export function calcularBaseProyecto(p: Proyecto): MetricasProyectoBase {
  const tasasAportes = obtenerTasasAportes(p.aportesPatronalesOverride);
  const personal = p.personal.reduce(
    (acc, x) => acc + calcularAportesPatronales(x.sueldoMensual, tasasAportes).costoTotalAnual * x.cantidad,
    0
  );
  const admin = p.costosAdministracion.reduce(
    (acc, c) => acc + c.cantidad * c.costoUnitario * (c.unidadMedida === "mes" ? 12 : 1),
    0
  );
  const comerc = p.costosComercializacion.reduce(
    (acc, c) => acc + c.cantidad * c.costoUnitario * (c.unidadMedida === "mes" ? 12 : 1),
    0
  );
  const ingresosAnuales = p.productos.reduce(
    (acc, prod: any) => {
      const cant = prod.cantidades?.[0] ?? prod.cantidadAnio1 ?? 0;
      const precio = prod.precios?.[0] ?? prod.precioVenta ?? 0;
      return acc + cant * precio;
    },
    0
  );
  const cantidadAnualUnidades = p.productos.reduce(
    (acc, prod: any) => acc + (prod.cantidades?.[0] ?? prod.cantidadAnio1 ?? 0),
    0
  );
  // Costos directos POR PRODUCTO (igual que flujo-proyecto): cada costo se aplica
  // solo a las unidades de su producto; los costos legados sin producto aplican
  // a la suma de unidades. Se expresa como costo promedio por unidad para
  // mantener la forma de MetricasProyectoBase.
  const costoUnitDe = (productoId: string | null) =>
    p.costosDirectos
      .filter((c) => (c.productoId ?? null) === productoId)
      .reduce((acc, c) => acc + c.cantidadPorUnidad * c.costoUnitario, 0);
  const costoInsumosAnual =
    p.productos.reduce(
      (acc, prod: any) => acc + (prod.cantidades?.[0] ?? prod.cantidadAnio1 ?? 0) * costoUnitDe(prod.id),
      0
    ) +
    cantidadAnualUnidades * costoUnitDe(null);
  const costoInsumosPorUnidad =
    cantidadAnualUnidades > 0 ? costoInsumosAnual / cantidadAnualUnidades : 0;
  const inversionTotal =
    Object.values(p.inversiones)
      .flat()
      .reduce((acc, it) => acc + it.costoTotal, 0) + p.capitalTrabajo;
  const montoPrestamo = inversionTotal * p.financiamiento.porcentajePrestamo;
  const flujo = construirFlujoCaja(p);
  const cuotaPrestamoMensual = calcularCuotaPrestamoFrancesa(
    montoPrestamo,
    p.financiamiento.tasaInteresAnual,
    p.financiamiento.plazoMeses
  );

  return {
    ingresosAnuales,
    costosAnualesFijos: personal + admin + comerc,
    costoInsumosPorUnidad,
    cantidadAnualUnidades,
    cuotaPrestamoMensual,
    capitalInicial: p.capitalTrabajo,
    porAnio: [0, 1, 2, 3, 4].map((i) => ({
      ingresos: flujo.ingresos[i],
      costosInsumos: flujo.costosProduccion[i],
      costosFijos:
        flujo.personal[i] + flujo.gastosAdmin[i] + flujo.gastosComerc[i] + flujo.imprevistos[i],
    })),
  };
}

/**
 * Aplica un período de operación (mes/trimestre/semestre) al estado, calculando
 * ingresos y costos del período y actualizando caja, acumulados, etc.
 */
export function aplicarOperacionDelTurno(
  estado: EstadoSimulacion,
  base: MetricasProyectoBase,
  freq: Frecuencia,
  turno = 0
): EstadoSimulacion {
  const meses = mesesPorTurno(freq);
  // Año del plan al que pertenece este turno (turno = índice desde 0)
  const anio = Math.min(4, Math.floor((turno * meses) / 12));
  const plan = base.porAnio?.[anio];
  const ingresosAnio = plan ? plan.ingresos : base.ingresosAnuales;
  const insumosAnio = plan
    ? plan.costosInsumos
    : base.cantidadAnualUnidades * base.costoInsumosPorUnidad;
  const fijosAnio = plan ? plan.costosFijos : base.costosAnualesFijos;

  const ingresoMes =
    (ingresosAnio / 12) * estado.precio_venta_multiplicador * estado.demanda_multiplicador;
  const costoInsumosMes =
    (insumosAnio / 12) * estado.demanda_multiplicador * estado.costos_multiplicador;
  const costoFijoMes = (fijosAnio / 12) * estado.costos_multiplicador;
  const cuotaMes = base.cuotaPrestamoMensual;

  const ingresoPeriodo = ingresoMes * meses;
  const costoPeriodo = (costoInsumosMes + costoFijoMes + cuotaMes) * meses;
  const utilidadPeriodo = ingresoPeriodo - costoPeriodo;
  const impuestoPeriodo = Math.max(0, utilidadPeriodo) * 0.25;
  const utilidadDespuesImp = utilidadPeriodo - impuestoPeriodo;

  return {
    ...estado,
    caja: estado.caja + utilidadDespuesImp,
    delta_caja: utilidadDespuesImp,
    delta_ingresos: ingresoPeriodo,
    ingresos_acumulados: estado.ingresos_acumulados + ingresoPeriodo,
    costos_acumulados: estado.costos_acumulados + costoPeriodo + impuestoPeriodo,
    utilidad_acumulada: estado.utilidad_acumulada + utilidadDespuesImp,
  };
}

// ============================================================================
// AVANZAR TURNO COMPLETO
// ============================================================================

export interface ResultadoTurno {
  estadoAntes: EstadoSimulacion;
  estadoDespues: EstadoSimulacion;
  eventosAplicados: Evento[];
  decision: { evento_id: string; opcion: OpcionDecision } | null;
  quiebra: boolean;
}

export function avanzarTurnoConDecision(
  estado: EstadoSimulacion,
  base: MetricasProyectoBase,
  freq: Frecuencia,
  evento: Evento | null,
  decision: OpcionDecision | null,
  turno = 0
): ResultadoTurno {
  let nuevo = estado;
  let decisionOut: ResultadoTurno["decision"] = null;

  // 1. Aplicar consecuencias de la decisión (si hay)
  if (evento && decision) {
    nuevo = aplicarDecisionAEstado(nuevo, evento, decision);
    decisionOut = { evento_id: evento.id, opcion: decision };
  } else {
    nuevo.ultimo_evento = null;
    nuevo.ultima_decision = null;
    nuevo.ultimo_feedback = null;
  }

  // 2. Calcular operación del período
  nuevo = aplicarOperacionDelTurno(nuevo, base, freq, turno);

  const quiebra = nuevo.caja < 0;

  return {
    estadoAntes: estado,
    estadoDespues: nuevo,
    eventosAplicados: evento ? [evento] : [],
    decision: decisionOut,
    quiebra,
  };
}
