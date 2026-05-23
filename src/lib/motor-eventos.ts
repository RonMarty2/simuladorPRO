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
} from "./calculo-financiero";

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
export function seleccionarEventoTurno(
  turnoActual: number,
  sectorProyecto: string,
  eventos: Evento[],
  eventosYaUsados: string[] = [],
  rng: () => number = Math.random
): Evento | null {
  const candidatos = eventos.filter(
    (e) =>
      turnoActual >= e.turno_minimo &&
      !eventosYaUsados.includes(e.id) &&
      (e.sectores_afectados.includes("todos") ||
        e.sectores_afectados.includes(sectorProyecto))
  );
  if (candidatos.length === 0) return null;

  // Sumar probabilidades, normalizar y elegir
  const probTotal = candidatos.reduce((acc, e) => acc + e.probabilidad, 0);
  if (probTotal === 0) return null;

  // Boost: probabilidad de que ALGÚN evento aparezca = min(0.7, suma)
  const probAlgunEvento = Math.min(0.7, probTotal);
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
};

function aplicarConsecuenciaAlEstado(
  estado: EstadoSimulacion,
  campo: string,
  raw: number | string
): EstadoSimulacion {
  const parsed = parsearConsecuencia(raw);
  if (!parsed) return estado;
  const claveEstado = aliasACampo[campo];
  if (!claveEstado) return estado;

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
}

export function calcularBaseProyecto(p: Proyecto): MetricasProyectoBase {
  const personal = p.personal.reduce(
    (acc, x) => acc + calcularAportesPatronales(x.sueldoMensual).costoTotalAnual * x.cantidad,
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
    (acc, prod) => acc + (prod.cantidades?.[0] ?? 0) * prod.precioVenta,
    0
  );
  const cantidadAnualUnidades = p.productos.reduce(
    (acc, prod) => acc + (prod.cantidades?.[0] ?? 0),
    0
  );
  const costoInsumosPorUnidad = p.costosDirectos.reduce(
    (acc, c) => acc + c.cantidadPorUnidad * c.costoUnitario,
    0
  );
  const inversionTotal =
    Object.values(p.inversiones)
      .flat()
      .reduce((acc, it) => acc + it.costoTotal, 0) + p.capitalTrabajo;
  const montoPrestamo = inversionTotal * p.financiamiento.porcentajePrestamo;
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
  };
}

/**
 * Aplica un período de operación (mes/trimestre/semestre) al estado, calculando
 * ingresos y costos del período y actualizando caja, acumulados, etc.
 */
export function aplicarOperacionDelTurno(
  estado: EstadoSimulacion,
  base: MetricasProyectoBase,
  freq: Frecuencia
): EstadoSimulacion {
  const meses = mesesPorTurno(freq);

  const ingresoMes =
    (base.ingresosAnuales / 12) *
    estado.precio_venta_multiplicador *
    estado.demanda_multiplicador;
  const costoInsumosMes =
    (base.cantidadAnualUnidades / 12) *
    base.costoInsumosPorUnidad *
    estado.demanda_multiplicador *
    estado.costos_multiplicador;
  const costoFijoMes = (base.costosAnualesFijos / 12) * estado.costos_multiplicador;
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
  decision: OpcionDecision | null
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
  nuevo = aplicarOperacionDelTurno(nuevo, base, freq);

  const quiebra = nuevo.caja < 0;

  return {
    estadoAntes: estado,
    estadoDespues: nuevo,
    eventosAplicados: evento ? [evento] : [],
    decision: decisionOut,
    quiebra,
  };
}
