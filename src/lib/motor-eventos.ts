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
import { eventoCompatibleConTipo } from "./eventos-por-rubro";
import { obtenerPlanesSuscripcion } from "./planes-suscripcion";
import { DIAS_COBRO_POR_TIPO } from "./guia-extra-por-tipo";
import type { CategoriaPlantilla } from "./plantillas";

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
    dias_cobro: DIAS_COBRO_POR_TIPO[proyecto.tipoNegocio as CategoriaPlantilla] ?? 30,
    cuentas_por_cobrar: 0,
    ...estadoInicialSuscripcion(proyecto),
    ...estadoInicialMicrocredito(proyecto),
  };
}

// ============================================================================
// SUSCRIPCIÓN: socios que entran y salen mes a mes
// ============================================================================

/** Plan de socios mes a mes (60 meses) y bajas normales, tomados del constructor. */
export interface PlanSocios {
  /** Socios que el plan espera tener al empezar cada mes. */
  sociosPlan: number[];
  /** Fracción de socios que se da de baja cada mes en el plan. */
  churnBase: number;
}

export function construirPlanSocios(p: Proyecto): PlanSocios | null {
  if (p.modeloIngreso !== "suscripcion") return null;
  const planes = obtenerPlanesSuscripcion(p);
  if (planes.length === 0) return null;
  const porAnio = [0, 1, 2, 3, 4].map((i) =>
    p.productos.reduce((acc, prod) => acc + Number(prod.cantidades?.[i] ?? 0), 0)
  );
  if (!(porAnio[0] > 0)) return null;

  const peso = (x: (typeof planes)[number]) => x.suscriptoresIniciales + x.altasMensuales;
  const pesoTotal = planes.reduce((a, x) => a + peso(x), 0);
  const churnBase =
    pesoTotal > 0 ? planes.reduce((a, x) => a + peso(x) * x.churnMensual, 0) / pesoTotal : 0.05;
  const socios0 = planes.reduce((a, x) => a + x.suscriptoresIniciales, 0);

  // Cada año pone un punto a mitad de año; entre puntos se interpola.
  const puntos: [number, number][] = [
    [-1, socios0 > 0 ? socios0 : porAnio[0]],
    ...porAnio.map((c, i) => [i * 12 + 5.5, c > 0 ? c : porAnio[0]] as [number, number]),
  ];
  const valorEn = (k: number) => {
    if (k >= puntos[puntos.length - 1][0]) return puntos[puntos.length - 1][1];
    for (let i = 1; i < puntos.length; i++) {
      const [x1, y1] = puntos[i];
      if (k <= x1) {
        const [x0, y0] = puntos[i - 1];
        return y0 + ((y1 - y0) * (k - x0)) / (x1 - x0);
      }
    }
    return puntos[puntos.length - 1][1];
  };
  return {
    sociosPlan: Array.from({ length: 61 }, (_, k) => Math.max(1, valorEn(k))),
    churnBase: Math.max(0.001, Math.min(0.5, churnBase)),
  };
}

function estadoInicialSuscripcion(
  p: Proyecto
): Pick<EstadoSimulacion, "socios" | "churn_multiplicador"> | Record<string, never> {
  const plan = construirPlanSocios(p);
  return plan ? { socios: plan.sociosPlan[0], churn_multiplicador: 1 } : {};
}

// ============================================================================
// MICROCRÉDITO: la mora es una variable viva
// ============================================================================

/** Cuánto del costo directo del crédito es previsión por mora, y la mora prevista del plan. */
export interface PlanMora {
  /** Parte del costo directo anual que es previsión por mora (0 a 1). */
  parteDelCosto: number;
  /** Mora prevista como fracción de la cartera, si el crédito declara su monto. */
  moraBase?: number;
}

export function construirPlanMora(p: Proyecto): PlanMora | null {
  if (p.tipoNegocio !== "microcredito") return null;
  const esMora = (d: string) => /mora|previsi/i.test(d);
  let moraAnual = 0;
  let totalAnual = 0;
  let moraBase: number | undefined;
  for (const prod of p.productos) {
    const unidades = Number(prod.cantidades?.[0] ?? 0);
    for (const c of p.costosDirectos ?? []) {
      if ((c.productoId ?? null) !== prod.id) continue;
      const monto = c.cantidadPorUnidad * c.costoUnitario * unidades;
      totalAnual += monto;
      if (esMora(c.descripcion)) {
        moraAnual += monto;
        const credito = prod.nombre.match(/Bs\s?([\d.]+)/);
        const valor = credito ? Number(credito[1].replace(/\./g, "")) : 0;
        if (valor > 0) moraBase = (c.cantidadPorUnidad * c.costoUnitario) / valor;
      }
    }
  }
  if (!(moraAnual > 0) || !(totalAnual > 0)) return null;
  return { parteDelCosto: moraAnual / totalAnual, moraBase };
}

function estadoInicialMicrocredito(
  p: Proyecto
): Pick<EstadoSimulacion, "mora_multiplicador" | "mora_base"> | Record<string, never> {
  const plan = construirPlanMora(p);
  if (!plan) return {};
  return { mora_multiplicador: 1, ...(plan.moraBase !== undefined ? { mora_base: plan.moraBase } : {}) };
}

/**
 * La mora del mes que viene: crece cuando colocas mucho más de lo previsto (los créditos
 * apurados se deterioran meses después) y cuando tu reputación cae; con el tiempo se va
 * recuperando despacio.
 */
function moraDelSiguienteMes(estado: EstadoSimulacion): number {
  const actual = estado.mora_multiplicador ?? 1;
  const crecimientoApurado = Math.max(0, estado.demanda_multiplicador - 1.1) * COEF_MORA.crecimiento;
  const reputacionBaja = Math.max(0, 0.5 - estado.reputacion) * COEF_MORA.reputacion;
  const siguiente = actual + crecimientoApurado + reputacionBaja;
  return 1 + (siguiente - 1) * (1 - COEF_MORA.recuperacion);
}

/** Qué tanto mueve cada cosa a la mora. Criterio del equipo, sin validar con gremios. */
export const COEF_MORA = { crecimiento: 0.25, reputacion: 0.2, recuperacion: 0.03 };

/**
 * Un mes de un negocio de suscripción. Los socios son un inventario vivo:
 *  - bajas = socios x bajas del plan, que suben si el precio sube, la reputación cae o la
 *    demanda se enfría;
 *  - altas = las que pide el plan para llegar a sus cifras, movidas por la demanda y la reputación.
 * Los ingresos y los costos por socio siguen a los socios: con 10% menos socios que el plan
 * entra 10% menos plata. Sin eventos ni decisiones el resultado es exactamente el del plan.
 */
/** Qué tanto mueve cada cosa a las bajas y a las altas. Criterio del equipo, sin validar con gremios. */
export const COEF_SUSCRIPCION = { precio: 1.5, demanda: 0.8, recuperacion: 0.04 };

function pasoSuscripcionMes(
  estado: EstadoSimulacion,
  plan: PlanSocios,
  k: number,
  limite: number | undefined
) {
  const socios = estado.socios ?? plan.sociosPlan[Math.min(k, 60)];
  const planHoy = plan.sociosPlan[Math.min(k, 60)];
  const planSig = plan.sociosPlan[Math.min(k + 1, 60)];
  const rep = Math.max(0, Math.min(1, estado.reputacion));
  const pm = estado.precio_venta_multiplicador;
  const dm = estado.demanda_multiplicador;

  const fRep = Math.max(0.5, Math.min(1.5, 1.5 - rep));
  const fPrecio = pm > 1 ? 1 + COEF_SUSCRIPCION.precio * (pm - 1) : 1 + 0.5 * (pm - 1);
  const fDemanda =
    dm < 1 ? 1 + COEF_SUSCRIPCION.demanda * (1 - dm) : Math.max(0.7, 1 - 0.5 * (dm - 1));
  const churn = Math.max(
    0.002,
    Math.min(0.6, plan.churnBase * (estado.churn_multiplicador ?? 1) * fRep * fPrecio * fDemanda)
  );
  const altasPlan = Math.max(0, planSig - planHoy * (1 - plan.churnBase));
  // Los socios que faltan frente al plan se recuperan de a poco (publicidad, boca a boca).
  const recuperacion = Math.max(0, planHoy - socios) * COEF_SUSCRIPCION.recuperacion;
  const altas = (altasPlan * dm + recuperacion) * factorReputacion(rep);
  const bajas = socios * churn;
  let sociosSig = socios + altas - bajas;
  if (limite !== undefined && Number.isFinite(limite)) sociosSig = Math.min(sociosSig, planSig * limite);
  sociosSig = Math.max(0, sociosSig);
  return { razon: socios / planHoy, sociosSig, altas, bajas };
}

/**
 * La reputación mueve la demanda: con 50% vendes lo planeado, con 100% hasta 50% más y
 * con 0% la mitad. Antes la reputación no afectaba nada y la opción "sucia" siempre
 * rendía más: ahora recortar costos a costa de la reputación tiene un precio.
 */
export function factorReputacion(reputacion: number): number {
  const r = Math.max(0, Math.min(1, Number.isFinite(reputacion) ? reputacion : 0.5));
  return 0.5 + r;
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
      eventoAplicaAProyecto(e.sectores_afectados, sectorProyecto, config.tipoNegocio) &&
      eventoCompatibleConTipo(e.codigo, config.tipoNegocio)
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
  // Cobranza: días que tardan tus clientes en pagarte
  dias_cobro: "dias_cobro",
  plazo_cobro: "dias_cobro",
  cobranza: "dias_cobro",
  // Suscripción: socios activos y bajas
  socios: "socios",
  clientes_activos: "socios",
  churn: "churn_multiplicador",
  bajas: "churn_multiplicador",
  cancelaciones: "churn_multiplicador",
  abandono: "churn_multiplicador",
  // Microcrédito: mora de la cartera
  mora: "mora_multiplicador",
  morosidad: "mora_multiplicador",
  incobrables: "mora_multiplicador",
  previsiones: "mora_multiplicador",
  // Percepción del cliente y del equipo: se reflejan en la reputación
  calidad: "reputacion",
  servicio: "reputacion",
  clima_laboral: "reputacion",
  reputacion_local: "reputacion",
  clientes_recurrentes: "reputacion",
};

/** Rango en que pueden moverse los multiplicadores acumulados por eventos y decisiones. */
export const LIMITES_MULTIPLICADORES: Record<string, [number, number]> = {
  precio_venta_multiplicador: [0.5, 1.3],
  demanda_multiplicador: [0.3, 1.5],
  costos_multiplicador: [0.8, 2.0],
  churn_multiplicador: [0.4, 3.0],
  mora_multiplicador: [0.5, 3.0],
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

  // Los socios solo existen en proyectos de suscripción: en los demás el efecto no aplica.
  if (claveEstado === "socios" && estado.socios === undefined) return estado;
  if (claveEstado === "mora_multiplicador" && estado.mora_multiplicador === undefined) return estado;
  const valorActual =
    claveEstado === "dias_cobro"
      ? (estado.dias_cobro ?? 30)
      : claveEstado === "churn_multiplicador"
        ? (estado.churn_multiplicador ?? 1)
        : (estado[claveEstado] as number);
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
  // Días de cobro: entre 0 y 180
  if (claveEstado === "dias_cobro") {
    nuevo = Math.max(0, Math.min(180, nuevo));
  }
  // Los efectos acumulados de eventos y decisiones tienen un tope: sin él, repetir "subir
  // precio 8%" o "bajar costos 4%" varias veces los llevaba a valores imposibles.
  const tope = LIMITES_MULTIPLICADORES[claveEstado as string];
  if (tope) nuevo = Math.max(tope[0], Math.min(tope[1], nuevo));

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
  /**
   * Tope del multiplicador de demanda por año (capacidad / ventas planeadas del año).
   * Si el proyecto declara capacidad (habitaciones, camas, cupos), no puedes vender más
   * de lo que cabe aunque un evento dispare la demanda. Undefined = sin tope.
   */
  limiteDemanda?: number[];
  /** Solo suscripción: plan de socios mes a mes. Con esto los socios son una variable viva. */
  suscripcion?: PlanSocios;
  /** Solo microcrédito: qué parte del costo es previsión por mora. */
  mora?: PlanMora;
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

  // Tope de demanda por capacidad: el menor cociente capacidad / ventas planeadas.
  const limiteDemanda = [0, 1, 2, 3, 4].map((anio) => {
    let tope = Infinity;
    const totalAnio = p.productos.reduce((acc, prod) => acc + Number(prod.cantidades?.[anio] ?? 0), 0);
    if (p.capacidadAnual && p.capacidadAnual > 0 && totalAnio > 0) tope = Math.min(tope, p.capacidadAnual / totalAnio);
    for (const prod of p.productos) {
      const venta = Number(prod.cantidades?.[anio] ?? 0);
      if (prod.capacidadAnual && prod.capacidadAnual > 0 && venta > 0) tope = Math.min(tope, prod.capacidadAnual / venta);
    }
    return tope;
  });
  const hayCapacidad = limiteDemanda.some((x) => Number.isFinite(x));

  return {
    limiteDemanda: hayCapacidad ? limiteDemanda : undefined,
    suscripcion: construirPlanSocios(p) ?? undefined,
    mora: construirPlanMora(p) ?? undefined,
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

  const cuotaMes = base.cuotaPrestamoMensual;
  const tope = base.limiteDemanda?.[anio];
  let ingresoPeriodo = 0;
  let costoPeriodo = 0;
  let sociosNuevo: Partial<EstadoSimulacion> = {};

  if (base.suscripcion && estado.socios !== undefined) {
    // Suscripción: los socios son un inventario vivo que entra y sale mes a mes.
    let vivo = estado;
    let altasTotal = 0;
    let bajasTotal = 0;
    for (let j = 0; j < meses; j++) {
      const k = turno * meses + j;
      const kAnio = Math.min(4, Math.floor(k / 12));
      const ingresosK = base.porAnio?.[kAnio]?.ingresos ?? base.ingresosAnuales;
      const insumosK = base.porAnio?.[kAnio]?.costosInsumos ?? 0;
      const fijosK = base.porAnio?.[kAnio]?.costosFijos ?? base.costosAnualesFijos;
      const paso = pasoSuscripcionMes(vivo, base.suscripcion, k, base.limiteDemanda?.[kAnio]);
      ingresoPeriodo += (ingresosK / 12) * vivo.precio_venta_multiplicador * paso.razon;
      costoPeriodo +=
        ((insumosK / 12) * paso.razon + fijosK / 12) * vivo.costos_multiplicador + cuotaMes;
      altasTotal += paso.altas;
      bajasTotal += paso.bajas;
      vivo = { ...vivo, socios: paso.sociosSig };
    }
    sociosNuevo = { socios: vivo.socios, altas_mes: altasTotal / meses, bajas_mes: bajasTotal / meses };
  } else {
    // Demanda efectiva: la planeada, movida por los eventos y por la reputación, y con el
    // tope de la capacidad instalada (si el proyecto la declara).
    let demanda = estado.demanda_multiplicador * factorReputacion(estado.reputacion);
    if (tope !== undefined && Number.isFinite(tope)) demanda = Math.min(demanda, tope);

    const ingresoMes = (ingresosAnio / 12) * estado.precio_venta_multiplicador * demanda;
    // Microcrédito: la previsión por mora sigue a la mora viva, no al plan.
    const efectoMora =
      base.mora && estado.mora_multiplicador !== undefined
        ? 1 + base.mora.parteDelCosto * (estado.mora_multiplicador - 1)
        : 1;
    const costoInsumosMes = (insumosAnio / 12) * demanda * estado.costos_multiplicador * efectoMora;
    const costoFijoMes = (fijosAnio / 12) * estado.costos_multiplicador;
    ingresoPeriodo = ingresoMes * meses;
    costoPeriodo = (costoInsumosMes + costoFijoMes + cuotaMes) * meses;
  }
  const utilidadPeriodo = ingresoPeriodo - costoPeriodo;
  const impuestoPeriodo = Math.max(0, utilidadPeriodo) * 0.25;
  const utilidadDespuesImp = utilidadPeriodo - impuestoPeriodo;

  // Cobranza a crédito: con más de 30 días, solo se cobra una parte de lo pendiente cada
  // período y el resto queda como cuenta por cobrar. Con 30 días o menos, cobras todo ya.
  const dias = estado.dias_cobro ?? 30;
  const pendiente = (estado.cuentas_por_cobrar ?? 0) + ingresoPeriodo;
  const fraccionCobrada = dias <= 30 ? 1 : Math.min(1, (30 * meses) / dias);
  const cobrado = pendiente * fraccionCobrada;
  const cuentasPorCobrar = pendiente - cobrado;
  const flujoDelPeriodo = cobrado - costoPeriodo - impuestoPeriodo;

  const moraNueva: Partial<EstadoSimulacion> =
    estado.mora_multiplicador !== undefined
      ? { mora_multiplicador: Math.max(0.5, Math.min(3, moraDelSiguienteMes(estado))) }
      : {};

  return diluirMultiplicadores({
    ...estado,
    ...sociosNuevo,
    ...moraNueva,
    cuentas_por_cobrar: cuentasPorCobrar,
    caja: estado.caja + flujoDelPeriodo,
    delta_caja: flujoDelPeriodo,
    delta_ingresos: ingresoPeriodo,
    ingresos_acumulados: estado.ingresos_acumulados + ingresoPeriodo,
    costos_acumulados: estado.costos_acumulados + costoPeriodo + impuestoPeriodo,
    utilidad_acumulada: estado.utilidad_acumulada + utilidadDespuesImp,
  }, meses);
}


// ============================================================================
// GOLPE DEL EVENTO
// ============================================================================

/**
 * Cuánto de lo que cuenta la noticia le pasa a tu negocio SIN importar qué decidas.
 * Cada evento trae un golpe (`modificadores`) además de las consecuencias de cada
 * opción. Antes el golpe no se aplicaba: los eventos solo ofrecían opciones que
 * mejoraban el negocio y hasta los ejemplos de rechazo terminaban ganando. Con 1 el
 * golpe es completo (demasiado duro: 32% de los proyectos viables quebraban aun
 * decidiendo bien); con 0,6 el que decide bien casi siempre sobrevive y los
 * proyectos malos mayormente fracasan. Medido con `docs` del plan, paso 5.4.
 */
export const INTENSIDAD_GOLPE_EVENTO = 0.6;

/**
 * Los efectos de los eventos no son para siempre: una crisis de contenedores o un paro
 * se van diluyendo. Cada mes, los multiplicadores de precio, demanda y costos recorren
 * esta fracción del camino de vuelta a 1. Sin esto los golpes se acumulaban durante los
 * 60 meses y hasta un negocio sano quebraba sin haber decidido nada mal.
 */
export const DECAIMIENTO_MENSUAL_MULTIPLICADORES = 0.1;

function diluirMultiplicadores(estado: EstadoSimulacion, meses: number): EstadoSimulacion {
  const resto = Math.pow(1 - DECAIMIENTO_MENSUAL_MULTIPLICADORES, meses);
  const volver = (m: number) => 1 + (m - 1) * resto;
  return {
    ...estado,
    precio_venta_multiplicador: volver(estado.precio_venta_multiplicador),
    demanda_multiplicador: volver(estado.demanda_multiplicador),
    costos_multiplicador: volver(estado.costos_multiplicador),
    ...(estado.churn_multiplicador !== undefined
      ? { churn_multiplicador: volver(estado.churn_multiplicador) }
      : {}),
  };
}

function consecuenciasDelGolpe(evento: Evento, intensidad: number): Record<string, string> {
  const salida: Record<string, string> = {};
  for (const m of evento.modificadores?.variables_afectadas ?? []) {
    if (!m || typeof m.valor !== "number" || !(m.campo in aliasACampo)) continue;
    const v = m.valor;
    salida[m.campo] =
      m.operacion === "multiplicar"
        ? `*${1 + (v - 1) * intensidad}`
        : m.operacion === "sumar"
          ? `+${v * intensidad}`
          : m.operacion === "restar"
            ? `-${v * intensidad}`
            : m.operacion === "porcentaje"
              ? `${v * intensidad >= 0 ? "+" : ""}${v * intensidad}%`
              : `${v}`;
  }
  return salida;
}

/** Aplica el golpe del evento al estado (a la intensidad indicada). */
export function aplicarGolpeDelEvento(
  estado: EstadoSimulacion,
  evento: Evento,
  intensidad = INTENSIDAD_GOLPE_EVENTO
): EstadoSimulacion {
  let nuevo = { ...estado };
  for (const [campo, valor] of Object.entries(consecuenciasDelGolpe(evento, intensidad))) {
    nuevo = aplicarConsecuenciaAlEstado(nuevo, campo, valor);
  }
  return nuevo;
}

const ETIQUETA_GOLPE: Record<string, string> = {
  demanda_multiplicador: "Ventas",
  precio_venta_multiplicador: "Precios",
  costos_multiplicador: "Costos",
  caja: "Caja",
  deuda: "Deuda",
  reputacion: "Reputación",
  dias_cobro: "Días de cobro",
};

/**
 * Resumen legible del golpe ("Ventas -15%, Costos +6%") para mostrárselo al alumno
 * antes de que decida: es lo que le pasa aunque elija bien.
 */
export function resumenGolpeEvento(evento: Evento, intensidad = INTENSIDAD_GOLPE_EVENTO): string[] {
  const base: EstadoSimulacion = {
    caja: 100, deuda: 100, precio_venta_multiplicador: 1, demanda_multiplicador: 1, costos_multiplicador: 1,
    reputacion: 0.5, ingresos_acumulados: 0, costos_acumulados: 0, utilidad_acumulada: 0,
    ultimo_evento: null, ultima_decision: null, ultimo_feedback: null, delta_caja: 0, delta_ingresos: 0,
    dias_cobro: 30, cuentas_por_cobrar: 0,
  };
  const despues = aplicarGolpeDelEvento(base, evento, intensidad);
  const partes: string[] = [];
  const claves = ["demanda_multiplicador", "precio_venta_multiplicador", "costos_multiplicador", "caja", "deuda", "reputacion", "dias_cobro"] as const;
  for (const k of claves) {
    const antes = Number(base[k] ?? 0);
    const ahora = Number(despues[k] ?? 0);
    if (!antes || Math.abs(ahora - antes) < 1e-9) continue;
    if (k === "dias_cobro") {
      partes.push(`${ETIQUETA_GOLPE[k]} ${ahora > antes ? "+" : ""}${Math.round(ahora - antes)}`);
      continue;
    }
    const pct = Math.round(((ahora - antes) / antes) * 100);
    if (pct !== 0) partes.push(`${ETIQUETA_GOLPE[k]} ${pct > 0 ? "+" : ""}${pct}%`);
  }
  return partes;
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
    // Primero lo que la noticia le hace a tu negocio, luego lo que tú decides hacer.
    nuevo = aplicarGolpeDelEvento(nuevo, evento);
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
