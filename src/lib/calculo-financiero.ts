/**
 * Motor de cálculo financiero — FASE 2 (CORE CRÍTICO)
 *
 * Biblioteca de funciones PURAS (mismo input → mismo output, sin efectos
 * secundarios) que calcula todo lo financiero del simulador. Respeta el
 * contexto boliviano: aportes patronales 30.37%, IUE 25%, IT 3%.
 *
 * No incluir aquí lógica de UI, llamadas a Supabase, ni acceso a stores.
 */

// ============================================================================
// CONSTANTES BOLIVIA (2025)
// ============================================================================

export const APORTES_PATRONALES_BOLIVIA = {
  riesgoProfesional: 0.0171, // 1.71%
  seguroSalud: 0.10, // 10%
  provisionVivienda: 0.02, // 2%
  previsionAguinaldo: 0.0833, // 8.33%
  previsionIndemnizacion: 0.0833, // 8.33%
} as const;

export const TASA_IUE = 0.25; // Impuesto a las Utilidades de Empresas
export const TASA_IT = 0.03; // Impuesto a las Transacciones
export const TASA_IVA = 0.13; // Impuesto al Valor Agregado

// ============================================================================
// DEPRECIACIONES (método lineal sin valor de salvamento)
// ============================================================================

export function calcularDepreciacionAnual(
  costo: number,
  vidaUtilAnios: number
): number {
  if (vidaUtilAnios <= 0) return 0;
  return costo / vidaUtilAnios;
}

export function calcularDepreciacionAcumulada(
  costo: number,
  vidaUtilAnios: number,
  aniosTranscurridos: number
): number {
  if (vidaUtilAnios <= 0) return 0;
  if (aniosTranscurridos <= 0) return 0;
  const dep = (costo / vidaUtilAnios) * Math.min(aniosTranscurridos, vidaUtilAnios);
  return Math.min(costo, dep);
}

export function calcularValorResidual(
  costo: number,
  vidaUtilAnios: number,
  aniosTranscurridos: number
): number {
  if (vidaUtilAnios <= 0) return costo; // no se deprecia
  const acumulada = calcularDepreciacionAcumulada(costo, vidaUtilAnios, aniosTranscurridos);
  return Math.max(0, costo - acumulada);
}

// ============================================================================
// LABORAL (BOLIVIA)
// ============================================================================

export interface AportesPatronales {
  riesgoProfesional: number;
  seguroSalud: number;
  provisionVivienda: number;
  previsionAguinaldo: number;
  previsionIndemnizacion: number;
  totalAportes: number;
  costoTotalAnual: number;
}

/**
 * Calcula los aportes patronales mensuales y el costo laboral total anual.
 *
 * Total mensual de aportes = 30.37% del sueldo bruto:
 *   - Riesgo profesional: 1.71%
 *   - Seguro de salud: 10%
 *   - Provisión vivienda: 2%
 *   - Previsión aguinaldo: 8.33%
 *   - Previsión indemnización: 8.33%
 *
 * Costo total anual = (sueldo mensual × 12) + (aportes mensuales × 12)
 */
export function calcularAportesPatronales(sueldoMensual: number): AportesPatronales {
  const riesgoProfesional = sueldoMensual * APORTES_PATRONALES_BOLIVIA.riesgoProfesional;
  const seguroSalud = sueldoMensual * APORTES_PATRONALES_BOLIVIA.seguroSalud;
  const provisionVivienda = sueldoMensual * APORTES_PATRONALES_BOLIVIA.provisionVivienda;
  const previsionAguinaldo = sueldoMensual * APORTES_PATRONALES_BOLIVIA.previsionAguinaldo;
  const previsionIndemnizacion =
    sueldoMensual * APORTES_PATRONALES_BOLIVIA.previsionIndemnizacion;
  const totalAportes =
    riesgoProfesional +
    seguroSalud +
    provisionVivienda +
    previsionAguinaldo +
    previsionIndemnizacion;
  const costoTotalAnual = sueldoMensual * 12 + totalAportes * 12;
  return {
    riesgoProfesional,
    seguroSalud,
    provisionVivienda,
    previsionAguinaldo,
    previsionIndemnizacion,
    totalAportes,
    costoTotalAnual,
  };
}

// ============================================================================
// IMPUESTOS (BOLIVIA)
// ============================================================================

/** IUE = 25% sobre utilidad antes de impuestos. No se cobra sobre pérdidas. */
export function calcularIUE(utilidadAntesImpuestos: number): number {
  return Math.max(0, utilidadAntesImpuestos) * TASA_IUE;
}

/** IT = 3% sobre ingresos brutos. */
export function calcularIT(ingresosBrutos: number): number {
  return Math.max(0, ingresosBrutos) * TASA_IT;
}

// ============================================================================
// FINANCIAMIENTO — Sistema de amortización francés (cuota fija)
// ============================================================================

/**
 * Cuota fija del sistema francés.
 * Fórmula: C = P × i / (1 - (1+i)^-n)
 * donde i = tasa mensual = tasaAnual / 12, n = plazo en meses.
 */
export function calcularCuotaPrestamoFrancesa(
  capital: number,
  tasaAnual: number,
  plazoMeses: number
): number {
  if (plazoMeses <= 0) return 0;
  if (tasaAnual === 0) return capital / plazoMeses;
  const i = tasaAnual / 12;
  return (capital * i) / (1 - Math.pow(1 + i, -plazoMeses));
}

export interface FilaAmortizacion {
  mes: number;
  cuota: number;
  interes: number;
  amortizacionCapital: number;
  saldoCapital: number;
}

export function calcularTablaAmortizacion(
  capital: number,
  tasaAnual: number,
  plazoMeses: number
): FilaAmortizacion[] {
  if (plazoMeses <= 0) return [];
  const cuota = calcularCuotaPrestamoFrancesa(capital, tasaAnual, plazoMeses);
  const i = tasaAnual / 12;
  const filas: FilaAmortizacion[] = [];
  let saldo = capital;
  for (let mes = 1; mes <= plazoMeses; mes++) {
    const interes = saldo * i;
    const amortizacionCapital = cuota - interes;
    saldo = saldo - amortizacionCapital;
    filas.push({
      mes,
      cuota,
      interes,
      amortizacionCapital,
      saldoCapital: Math.max(0, saldo),
    });
  }
  return filas;
}

// ============================================================================
// COSTO DE CAPITAL (WACC)
// ============================================================================

export interface ParamsWACC {
  porcentajeDeuda: number; // 0..1
  porcentajeCapital: number; // 0..1
  tasaInteresDeuda: number; // tasa anual del préstamo
  costoOportunidadAccionista: number; // Koa
  tasaImpuesto: number; // generalmente 0.25 (IUE)
}

/**
 * WACC = (D/V) × kd × (1-T) + (E/V) × ke
 *
 * donde:
 *   D/V = porcentajeDeuda
 *   E/V = porcentajeCapital
 *   kd = tasaInteresDeuda
 *   ke = costoOportunidadAccionista
 *   T  = tasaImpuesto
 */
export function calcularWACC(params: ParamsWACC): number {
  return (
    params.porcentajeDeuda * params.tasaInteresDeuda * (1 - params.tasaImpuesto) +
    params.porcentajeCapital * params.costoOportunidadAccionista
  );
}

// ============================================================================
// EVALUACIÓN DE PROYECTOS — VAN, TIR, Payback, IR, RBC
// ============================================================================

/**
 * Valor Actual Neto.
 * Convención: flujos[0] es el flujo del año 0 (típicamente la inversión
 * inicial negativa). flujos[t] se descuenta como flujos[t]/(1+r)^t.
 */
export function calcularVAN(flujos: number[], tasaDescuento: number): number {
  return flujos.reduce(
    (acc, flujo, t) => acc + flujo / Math.pow(1 + tasaDescuento, t),
    0
  );
}

/**
 * Tasa Interna de Retorno por Newton-Raphson.
 * Devuelve NaN si no converge.
 */
export function calcularTIR(
  flujos: number[],
  estimacionInicial = 0.1,
  tolerancia = 1e-7,
  maxIteraciones = 200
): number {
  let tasa = estimacionInicial;
  for (let it = 0; it < maxIteraciones; it++) {
    let f = 0;
    let fp = 0;
    for (let t = 0; t < flujos.length; t++) {
      const denom = Math.pow(1 + tasa, t);
      f += flujos[t] / denom;
      if (t > 0) {
        fp += (-t * flujos[t]) / (denom * (1 + tasa));
      }
    }
    if (Math.abs(fp) < 1e-12) return NaN;
    const nuevaTasa = tasa - f / fp;
    if (!isFinite(nuevaTasa)) return NaN;
    if (Math.abs(nuevaTasa - tasa) < tolerancia) return nuevaTasa;
    tasa = nuevaTasa;
  }
  return tasa;
}

/**
 * Período de recuperación (Payback) — sin descontar.
 * Devuelve el número de años (decimal con interpolación lineal) en que el
 * acumulado de flujos cruza de negativo a positivo. -1 si nunca se recupera.
 *
 * Convención: flujos[0] suele ser la inversión inicial negativa.
 */
export function calcularPayback(flujos: number[]): number {
  let acumulado = 0;
  for (let t = 0; t < flujos.length; t++) {
    const antes = acumulado;
    acumulado += flujos[t];
    if (antes < 0 && acumulado >= 0) {
      // Interpolación lineal dentro del año t
      const faltante = -antes;
      return t - 1 + faltante / flujos[t];
    }
  }
  return -1;
}

/**
 * Índice de Rentabilidad (IR) = VP(flujos positivos) / |inversión inicial|.
 * Considera que flujos[0] es la inversión (negativa).
 */
export function calcularIR(flujos: number[], tasaDescuento: number): number {
  if (flujos.length === 0) return 0;
  const inversion = -flujos[0];
  if (inversion <= 0) return 0;
  const vpFlujosPositivos = flujos
    .slice(1)
    .reduce((acc, c, idx) => acc + c / Math.pow(1 + tasaDescuento, idx + 1), 0);
  return vpFlujosPositivos / inversion;
}

/**
 * Relación Beneficio/Costo: VP(ingresos) / VP(costos).
 */
export function calcularRBC(
  flujosIngresos: number[],
  flujosCostos: number[],
  tasaDescuento: number
): number {
  const vpIngresos = flujosIngresos.reduce(
    (acc, c, t) => acc + c / Math.pow(1 + tasaDescuento, t),
    0
  );
  const vpCostos = flujosCostos.reduce(
    (acc, c, t) => acc + c / Math.pow(1 + tasaDescuento, t),
    0
  );
  if (vpCostos === 0) return vpIngresos > 0 ? Infinity : 0;
  return vpIngresos / vpCostos;
}

// ============================================================================
// FLUJO DE CAJA
// ============================================================================

export interface ParamsFlujoCaja {
  ingresos: number;
  costosProduccion: number;
  costosAdministracion: number;
  costosComercializacion: number;
  depreciacion: number;
  imprevistos: number;
  interesDeuda: number;
  amortizacionDeuda: number;
  tasaImpuesto: number;
}

export interface FlujoCajaAnual {
  utilidadAntesImpuestos: number;
  impuestos: number;
  utilidadNeta: number;
  flujoCaja: number;
}

/**
 * Calcula utilidad y flujo de caja anual.
 *
 * Estructura:
 *   Ingresos
 *   - Costos producción
 *   - Costos administración
 *   - Costos comercialización
 *   - Imprevistos
 *   - Depreciación               ← gasto no efectivo
 *   = Utilidad operativa
 *   - Intereses de deuda
 *   = Utilidad antes de impuestos
 *   - Impuestos (IUE)
 *   = Utilidad neta
 *   + Depreciación               ← se reintegra (no salió de caja)
 *   - Amortización capital deuda  ← sí sale de caja
 *   = Flujo de caja
 */
export function calcularFlujoCajaAnual(params: ParamsFlujoCaja): FlujoCajaAnual {
  const costosTotales =
    params.costosProduccion +
    params.costosAdministracion +
    params.costosComercializacion +
    params.imprevistos;
  const utilidadOperativa = params.ingresos - costosTotales - params.depreciacion;
  const utilidadAntesImpuestos = utilidadOperativa - params.interesDeuda;
  const impuestos = Math.max(0, utilidadAntesImpuestos) * params.tasaImpuesto;
  const utilidadNeta = utilidadAntesImpuestos - impuestos;
  const flujoCaja = utilidadNeta + params.depreciacion - params.amortizacionDeuda;
  return { utilidadAntesImpuestos, impuestos, utilidadNeta, flujoCaja };
}

// ============================================================================
// PROYECCIÓN CON CRECIMIENTO
// ============================================================================

/**
 * Proyecta `anios` años aplicando una tasa de crecimiento compuesta.
 * El primer elemento del array (índice 0) es el valor del primer año = valorBase.
 * El último elemento es valorBase × (1+g)^(anios-1).
 */
export function proyectarConCrecimiento(
  valorBase: number,
  tasaCrecimiento: number,
  anios: number
): number[] {
  if (anios <= 0) return [];
  const out: number[] = [];
  for (let i = 0; i < anios; i++) {
    out.push(valorBase * Math.pow(1 + tasaCrecimiento, i));
  }
  return out;
}
