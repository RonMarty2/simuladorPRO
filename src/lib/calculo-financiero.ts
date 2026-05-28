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

export interface TasasAportesPatronales {
  riesgoProfesional: number;
  seguroSalud: number;
  provisionVivienda: number;
  previsionAguinaldo: number;
  previsionIndemnizacion: number;
}

export const APORTES_PATRONALES_BOLIVIA: TasasAportesPatronales = {
  riesgoProfesional: 0.0171, // 1.71%
  seguroSalud: 0.10, // 10%
  provisionVivienda: 0.02, // 2%
  previsionAguinaldo: 0.0833, // 8.33%
  previsionIndemnizacion: 0.0833, // 8.33%
};

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
 * Total mensual de aportes = 30.37% del sueldo bruto (por defecto):
 *   - Riesgo profesional: 1.71%
 *   - Seguro de salud: 10%
 *   - Provisión vivienda: 2%
 *   - Previsión aguinaldo: 8.33%
 *   - Previsión indemnización: 8.33%
 *
 * Costo total anual = (sueldo mensual × 12) + (aportes mensuales × 12)
 *
 * Se pueden pasar tasas personalizadas (útil si cambia la Ley General del
 * Trabajo). Si no se pasan, usa las vigentes 2025.
 */
export function calcularAportesPatronales(
  sueldoMensual: number,
  tasas: TasasAportesPatronales = APORTES_PATRONALES_BOLIVIA
): AportesPatronales {
  const riesgoProfesional = sueldoMensual * tasas.riesgoProfesional;
  const seguroSalud = sueldoMensual * tasas.seguroSalud;
  const provisionVivienda = sueldoMensual * tasas.provisionVivienda;
  const previsionAguinaldo = sueldoMensual * tasas.previsionAguinaldo;
  const previsionIndemnizacion = sueldoMensual * tasas.previsionIndemnizacion;
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

/**
 * Devuelve las tasas efectivas de aportes patronales para un proyecto.
 * Combina los defaults bolivianos con cualquier override que tenga el proyecto.
 */
export function obtenerTasasAportes(
  override?: {
    riesgoProfesional?: number;
    seguroSalud?: number;
    provisionVivienda?: number;
    previsionAguinaldo?: number;
    previsionIndemnizacion?: number;
  } | null
): TasasAportesPatronales {
  if (!override) return APORTES_PATRONALES_BOLIVIA;
  return {
    riesgoProfesional: override.riesgoProfesional ?? APORTES_PATRONALES_BOLIVIA.riesgoProfesional,
    seguroSalud: override.seguroSalud ?? APORTES_PATRONALES_BOLIVIA.seguroSalud,
    provisionVivienda: override.provisionVivienda ?? APORTES_PATRONALES_BOLIVIA.provisionVivienda,
    previsionAguinaldo: override.previsionAguinaldo ?? APORTES_PATRONALES_BOLIVIA.previsionAguinaldo,
    previsionIndemnizacion: override.previsionIndemnizacion ?? APORTES_PATRONALES_BOLIVIA.previsionIndemnizacion,
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

/**
 * Tasa de Retorno Contable (TRC / ARR — Accounting Rate of Return).
 * Mide la rentabilidad contable sin considerar el valor del dinero en el
 * tiempo: utilidad neta promedio anual sobre la inversión inicial.
 *
 *   TRC = ( promedio(utilidad_neta[1..n]) ) / |inversionInicial|
 *
 * Devuelve 0 si la inversión es 0 (evita divisiones por cero).
 */
export function calcularTRC(
  utilidadesNetas: number[],
  inversionInicial: number
): number {
  if (utilidadesNetas.length === 0) return 0;
  const inv = Math.abs(inversionInicial);
  if (inv === 0) return 0;
  const promedio =
    utilidadesNetas.reduce((acc, u) => acc + u, 0) / utilidadesNetas.length;
  return promedio / inv;
}

/**
 * Cobertura del Servicio de la Deuda (DSCR — Debt Service Coverage Ratio).
 * Mide si el flujo de caja operativo del proyecto alcanza para pagar la
 * cuota de los préstamos (capital + intereses).
 *
 *   SD = promedio(flujo_caja_operativo[1..n]) / cuota_anual_total
 *
 * Convención de lectura:
 *   - SD > 1.0 → el proyecto genera suficiente caja para pagar la deuda
 *   - SD = 1.0 → genera lo justo, sin margen
 *   - SD < 1.0 → no alcanza, hay que poner plata propia o refinanciar
 *
 * Devuelve Infinity si no hay deuda (servicio = 0).
 */
export function calcularServicioDeuda(
  flujosCajaOperativos: number[],
  cuotaAnualTotal: number
): number {
  if (flujosCajaOperativos.length === 0) return 0;
  if (cuotaAnualTotal === 0) return Infinity;
  const promedio =
    flujosCajaOperativos.reduce((acc, f) => acc + f, 0) /
    flujosCajaOperativos.length;
  return promedio / cuotaAnualTotal;
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

// ============================================================================
// ====================  INDICADORES V2 (EXTENDIDO)  ==========================
// ============================================================================
// Todo lo de abajo es ADITIVO: funciones nuevas que NO modifican el cálculo
// V1. Solo se usan cuando un proyecto tiene version === "v2".
// ============================================================================

// ----------------------------------------------------------------------------
// PUNTO DE EQUILIBRIO (break-even)
// ----------------------------------------------------------------------------

export interface PuntoEquilibrio {
  /** Unidades a vender para no ganar ni perder. Infinity si no hay margen. */
  unidades: number;
  /** Ingreso en Bs en el punto de equilibrio. */
  ingresoBs: number;
  /** Margen de contribución por unidad = precio − costo variable unitario. */
  margenContribucionUnitario: number;
  /** Margen de contribución como proporción del precio (0..1). */
  ratioMargenContribucion: number;
}

/**
 * Punto de equilibrio en unidades y en Bs.
 *
 *   Q* = Costos Fijos / (Precio − Costo Variable Unitario)
 *   Ingreso* = Q* × Precio
 *
 * Si el margen de contribución unitario es ≤ 0, el negocio pierde con cada
 * unidad vendida y nunca alcanza equilibrio → unidades = Infinity.
 */
export function calcularPuntoEquilibrio(
  costosFijos: number,
  precioUnitario: number,
  costoVariableUnitario: number
): PuntoEquilibrio {
  const margenContribucionUnitario = precioUnitario - costoVariableUnitario;
  const ratioMargenContribucion =
    precioUnitario > 0 ? margenContribucionUnitario / precioUnitario : 0;
  if (margenContribucionUnitario <= 0) {
    return {
      unidades: Infinity,
      ingresoBs: Infinity,
      margenContribucionUnitario,
      ratioMargenContribucion,
    };
  }
  const unidades = costosFijos / margenContribucionUnitario;
  return {
    unidades,
    ingresoBs: unidades * precioUnitario,
    margenContribucionUnitario,
    ratioMargenContribucion,
  };
}

// ----------------------------------------------------------------------------
// PAYBACK DESCONTADO
// ----------------------------------------------------------------------------

/**
 * Período de recuperación DESCONTADO. Igual que `calcularPayback` pero
 * descontando cada flujo a valor presente antes de acumular, así considera el
 * valor del dinero en el tiempo. Devuelve años (decimal con interpolación) o
 * -1 si nunca se recupera dentro del horizonte.
 *
 * Convención: flujos[0] es el flujo del año 0 (inversión inicial negativa).
 */
export function calcularPaybackDescontado(
  flujos: number[],
  tasaDescuento: number
): number {
  let acumulado = 0;
  for (let t = 0; t < flujos.length; t++) {
    const vp = flujos[t] / Math.pow(1 + tasaDescuento, t);
    const antes = acumulado;
    acumulado += vp;
    if (antes < 0 && acumulado >= 0) {
      const faltante = -antes;
      return t - 1 + faltante / vp;
    }
  }
  return -1;
}

// ----------------------------------------------------------------------------
// ANÁLISIS DE SENSIBILIDAD (estático — NO es la simulación con eventos)
// ----------------------------------------------------------------------------

export interface FilaSensibilidad {
  /** Variación aplicada a la variable (-0.2 = −20%, 0 = base, 0.2 = +20%). */
  variacion: number;
  van: number;
  tir: number;
}

/**
 * Análisis de sensibilidad de una sola variable (one-way). Recibe una función
 * pura que construye los flujos del proyecto dado un factor de variación, y
 * recalcula VAN/TIR para cada escenario.
 *
 * Es estático y determinista — no tiene azar ni turnos. Sirve para detectar
 * QUÉ variable es más peligrosa para el proyecto ANTES de simular. Es distinto
 * del motor de eventos (inflación, bloqueos…), que es dinámico y turno a turno.
 *
 * @param construirFlujos  factor → flujos del proyecto (factor 0 = caso base).
 * @param tasaDescuento    tasa para el VAN (típicamente WACC).
 * @param variaciones      lista de variaciones a probar.
 */
export function calcularSensibilidad(
  construirFlujos: (factor: number) => number[],
  tasaDescuento: number,
  variaciones: number[] = [-0.2, -0.1, 0, 0.1, 0.2]
): FilaSensibilidad[] {
  return variaciones.map((variacion) => {
    const flujos = construirFlujos(variacion);
    return {
      variacion,
      van: calcularVAN(flujos, tasaDescuento),
      tir: calcularTIR(flujos),
    };
  });
}

// ----------------------------------------------------------------------------
// APALANCAMIENTO (operativo, financiero y total)
// ----------------------------------------------------------------------------

/**
 * Grado de Apalancamiento Operativo.
 *   GAO = Margen de Contribución / Utilidad Operativa (EBIT)
 * Mide cuánto amplifica los cambios en ventas sobre la utilidad operativa,
 * por efecto de los costos fijos. Devuelve NaN si EBIT = 0.
 */
export function calcularGAO(
  margenContribucion: number,
  utilidadOperativa: number
): number {
  if (utilidadOperativa === 0) return NaN;
  return margenContribucion / utilidadOperativa;
}

/**
 * Grado de Apalancamiento Financiero.
 *   GAF = Utilidad Operativa (EBIT) / Utilidad Antes de Impuestos (EBIT − interés)
 * Mide cuánto amplifican los intereses los cambios del EBIT sobre la utilidad
 * antes de impuestos. Devuelve NaN si la utilidad antes de impuestos = 0.
 */
export function calcularGAF(
  utilidadOperativa: number,
  interes: number
): number {
  const utilidadAntesImpuestos = utilidadOperativa - interes;
  if (utilidadAntesImpuestos === 0) return NaN;
  return utilidadOperativa / utilidadAntesImpuestos;
}

/**
 * Grado de Apalancamiento Total = GAO × GAF.
 *   GAT = Margen de Contribución / (EBIT − interés)
 */
export function calcularGAT(
  margenContribucion: number,
  utilidadOperativa: number,
  interes: number
): number {
  return (
    calcularGAO(margenContribucion, utilidadOperativa) *
    calcularGAF(utilidadOperativa, interes)
  );
}

// ----------------------------------------------------------------------------
// MODELO DE INGRESO: SUSCRIPCIÓN / RECURRENTE
// ----------------------------------------------------------------------------

export interface ParamsSuscripcion {
  /** Suscriptores con los que arrancas (mes 0). */
  suscriptoresIniciales: number;
  /** Nuevos suscriptores que ganas por mes (altas). */
  altasMensuales: number;
  /** Fracción de suscriptores que se va cada mes (churn). 0.05 = 5%. */
  churnMensual: number;
  /** Cuota que paga cada suscriptor por mes. */
  cuotaMensual: number;
}

export interface ProyeccionSuscripcionAnio {
  /** Promedio de suscriptores activos durante el año. */
  promedioSuscriptores: number;
  /** Suscriptores al cierre del año (mes 12). */
  suscriptoresFin: number;
  /** Ingreso del año = promedio × cuota mensual × 12. */
  ingresoAnual: number;
}

/**
 * Proyecta la base de suscriptores mes a mes y la resume por año.
 *
 * Dinámica mensual:  S(m) = S(m-1) × (1 − churn) + altas
 *
 * Cada mes pierdes una fracción (churn) de tu base y ganas altas nuevas. La
 * base tiende a estabilizarse en  altas / churn  (punto de equilibrio del
 * modelo). El ingreso anual usa el promedio de suscriptores activos del año.
 */
export function proyectarSuscriptores(
  p: ParamsSuscripcion,
  anios = 5
): ProyeccionSuscripcionAnio[] {
  const out: ProyeccionSuscripcionAnio[] = [];
  let s = p.suscriptoresIniciales;
  for (let y = 0; y < anios; y++) {
    let suma = 0;
    for (let m = 0; m < 12; m++) {
      s = s * (1 - p.churnMensual) + p.altasMensuales;
      suma += s;
    }
    const promedio = suma / 12;
    out.push({
      promedioSuscriptores: promedio,
      suscriptoresFin: s,
      ingresoAnual: promedio * p.cuotaMensual * 12,
    });
  }
  return out;
}

/**
 * Valor de vida del cliente (LTV) en un modelo de suscripción.
 *   LTV = cuota mensual / churn mensual
 * Es cuánto deja en promedio un suscriptor antes de irse. Infinity si churn=0.
 */
export function calcularLTVSuscripcion(
  cuotaMensual: number,
  churnMensual: number
): number {
  if (churnMensual <= 0) return Infinity;
  return cuotaMensual / churnMensual;
}

// ----------------------------------------------------------------------------
// MODELO DE INGRESO: PUBLICIDAD / AUDIENCIA (CPM)
// ----------------------------------------------------------------------------

export interface ParamsPublicidad {
  /** Audiencia del primer mes (oyentes, visitas, espectadores). */
  audienciaMensual: number;
  /** Crecimiento mensual de la audiencia. 0.05 = 5%. */
  crecimientoMensual: number;
  /** Anuncios (impresiones) mostrados a cada usuario por mes. */
  impresionesPorUsuario: number;
  /** Tarifa por cada 1000 impresiones (CPM), en Bs. */
  cpm: number;
}

export interface ProyeccionPublicidadAnio {
  audienciaPromedio: number;
  audienciaFin: number;
  /** Impresiones totales del año = audiencia × impresiones/usuario × 12. */
  impresionesAnio: number;
  /** Ingreso del año = (impresiones / 1000) × CPM. */
  ingresoAnual: number;
}

/**
 * Proyecta el ingreso por publicidad: la audiencia crece mes a mes, genera
 * impresiones y cada 1000 impresiones se cobran al CPM.
 *
 *   ingreso = (audiencia × impresiones_por_usuario / 1000) × CPM
 */
export function proyectarPublicidad(
  p: ParamsPublicidad,
  anios = 5
): ProyeccionPublicidadAnio[] {
  const out: ProyeccionPublicidadAnio[] = [];
  let aud = p.audienciaMensual;
  for (let y = 0; y < anios; y++) {
    let sumaAud = 0;
    for (let m = 0; m < 12; m++) {
      aud = aud * (1 + p.crecimientoMensual);
      sumaAud += aud;
    }
    const audienciaPromedio = sumaAud / 12;
    const impresionesAnio = audienciaPromedio * p.impresionesPorUsuario * 12;
    out.push({
      audienciaPromedio,
      audienciaFin: aud,
      impresionesAnio,
      ingresoAnual: (impresionesAnio / 1000) * p.cpm,
    });
  }
  return out;
}

// ----------------------------------------------------------------------------
// COSTO DE CAPITAL PROPIO — CAPM
// ----------------------------------------------------------------------------

/**
 * Costo del capital propio (Ke) por el modelo CAPM:
 *
 *   Ke = Rf + β × (Rm − Rf)
 *
 * donde:
 *   Rf            = tasa libre de riesgo (ej. bonos del TGN)
 *   β (beta)      = sensibilidad del proyecto al riesgo de mercado
 *   primaMercado  = prima de riesgo de mercado = (Rm − Rf)
 *
 * Reemplaza al Koa "puesto a mano". Todas las tasas en decimal (0.04 = 4%).
 */
export function calcularCostoCapitalCAPM(
  tasaLibreRiesgo: number,
  beta: number,
  primaMercado: number
): number {
  return tasaLibreRiesgo + beta * primaMercado;
}

// ----------------------------------------------------------------------------
// ANÁLISIS DE RIESGO — SIMULACIÓN MONTE CARLO
// ----------------------------------------------------------------------------

export interface ConfigMonteCarlo {
  /** Número de escenarios a simular. Default 1000. */
  iteraciones?: number;
  /** Variación máxima de los ingresos (±). 0.1 = ±10%. */
  rangoIngreso?: number;
  /** Variación máxima de los costos (±). 0.15 = ±15%. */
  rangoCosto?: number;
  /** Generador aleatorio (inyectable para tests). Default Math.random. */
  rng?: () => number;
}

export interface ResultadoMonteCarlo {
  iteraciones: number;
  /** Proporción de escenarios con VAN > 0 (0..1). El indicador estrella. */
  probabilidadVANPositivo: number;
  vanPromedio: number;
  vanP5: number; // peor caso razonable
  vanP50: number; // mediana (caso típico)
  vanP95: number; // mejor caso razonable
  vanMin: number;
  vanMax: number;
  histograma: { min: number; max: number; conteo: number; perdida: boolean }[];
}

/**
 * Muestra de una distribución triangular en [-rango, +rango] con moda 0.
 * Refleja que lo "más probable" es el valor base (variación 0) y los extremos
 * son cada vez menos probables. `u` es un uniforme [0,1).
 */
function muestraTriangular(rango: number, u: number): number {
  if (rango <= 0) return 0;
  if (u < 0.5) return -rango + rango * Math.sqrt(2 * u);
  return rango - rango * Math.sqrt(2 * (1 - u));
}

/**
 * Simulación Monte Carlo del VAN. Corre `iteraciones` escenarios; en cada uno
 * varía ingresos y costos al azar (distribución triangular alrededor de la base)
 * y recalcula el VAN. Devuelve la distribución: probabilidad de éxito (VAN>0),
 * promedio, percentiles y un histograma. No tiene efectos secundarios.
 *
 * @param construirFlujos  (factorIngreso, factorCosto) → flujos del proyecto.
 *                          factor 0 = caso base; 0.1 = +10%, -0.1 = −10%.
 */
export function simularMonteCarlo(
  construirFlujos: (factorIngreso: number, factorCosto: number) => number[],
  tasaDescuento: number,
  config: ConfigMonteCarlo = {}
): ResultadoMonteCarlo {
  const n = Math.max(1, Math.floor(config.iteraciones ?? 1000));
  const rIng = config.rangoIngreso ?? 0.1;
  const rCos = config.rangoCosto ?? 0.15;
  const rng = config.rng ?? Math.random;

  const vans: number[] = [];
  for (let i = 0; i < n; i++) {
    const fi = muestraTriangular(rIng, rng());
    const fc = muestraTriangular(rCos, rng());
    vans.push(calcularVAN(construirFlujos(fi, fc), tasaDescuento));
  }
  vans.sort((a, b) => a - b);

  const positivos = vans.filter((v) => v > 0).length;
  const promedio = vans.reduce((a, b) => a + b, 0) / n;
  const pct = (p: number) => vans[Math.min(n - 1, Math.floor(p * n))];
  const min = vans[0];
  const max = vans[n - 1];

  const bins = 12;
  const ancho = (max - min) / bins || 1;
  const histograma = Array.from({ length: bins }, (_, b) => {
    const lo = min + b * ancho;
    const hi = b === bins - 1 ? max : min + (b + 1) * ancho;
    const conteo = vans.filter((v) =>
      b === bins - 1 ? v >= lo && v <= hi : v >= lo && v < hi
    ).length;
    return { min: lo, max: hi, conteo, perdida: hi <= 0 };
  });

  return {
    iteraciones: n,
    probabilidadVANPositivo: positivos / n,
    vanPromedio: promedio,
    vanP5: pct(0.05),
    vanP50: pct(0.5),
    vanP95: pct(0.95),
    vanMin: min,
    vanMax: max,
    histograma,
  };
}

// ----------------------------------------------------------------------------
// FLUJO DEL INVERSIONISTA — proyecto (FCF) vs accionista (FCFE)
// ----------------------------------------------------------------------------

export interface ParamsFlujoInversionista {
  /** Inversión total = activos fijos + capital de trabajo. */
  inversionTotal: number;
  /** Préstamo total recibido (lo que NO pone el accionista). */
  montoPrestamo: number;
  /** Utilidad operativa (EBIT) por año: ingresos − costos − depreciación. */
  ebit: number[];
  /** Depreciación por año (gasto no efectivo, se reintegra). */
  depreciacion: number[];
  /** Intereses de la deuda por año. */
  intereses: number[];
  /** Amortización de capital de la deuda por año. */
  amortizacion: number[];
  /** Reposición de activos de vida corta por año (capex de reemplazo). Opcional. */
  reinversionPorAnio?: number[];
  /** Tasa de impuesto (IUE, típicamente 0.25). */
  tasaImpuesto: number;
  /** Extras del último año (valor residual + recuperación capital trabajo). */
  extrasUltimoAnio?: number;
  /** WACC — descuenta el flujo del PROYECTO. */
  wacc: number;
  /** Koa (costo de oportunidad del accionista) — descuenta el flujo del ACCIONISTA. */
  koa: number;
}

export interface ResultadoFlujoInversionista {
  /** Flujo libre del proyecto (sin financiamiento). Se descuenta al WACC. */
  flujoProyecto: number[];
  /** Flujo del accionista (después de deuda). Se descuenta al Koa. */
  flujoAccionista: number[];
  vanProyecto: number;
  vanAccionista: number;
  tirProyecto: number;
  tirAccionista: number;
}

/**
 * Construye y evalúa dos perspectivas de flujo:
 *
 *  - FLUJO DEL PROYECTO (FCF): como si todo fuera capital propio. No resta
 *    intereses ni amortización; los impuestos se calculan sobre el EBIT
 *    completo (escudo fiscal de la deuda NO aplica). Se descuenta al WACC.
 *
 *  - FLUJO DEL ACCIONISTA (FCFE): lo que efectivamente recibe el dueño tras
 *    pagar al banco. Año 0 = solo el aporte propio (inversión − préstamo);
 *    los impuestos se calculan sobre la utilidad después de intereses
 *    (escudo fiscal incluido). Se descuenta al Koa.
 *
 * El apalancamiento es favorable cuando el VAN del accionista supera al VAN
 * del proyecto — señal de que la deuda crea valor para el dueño.
 */
export function calcularFlujoInversionista(
  p: ParamsFlujoInversionista
): ResultadoFlujoInversionista {
  const n = p.ebit.length;
  const extras = p.extrasUltimoAnio ?? 0;
  const flujoProyecto: number[] = [-p.inversionTotal];
  const flujoAccionista: number[] = [-(p.inversionTotal - p.montoPrestamo)];

  for (let i = 0; i < n; i++) {
    const extra = i === n - 1 ? extras : 0;
    // Capex de reemplazo del año (reposición de activos de vida corta).
    const reinversion = p.reinversionPorAnio?.[i] ?? 0;

    // Flujo del proyecto (sin deuda): impuestos sobre EBIT completo.
    const impuestoProyecto = Math.max(0, p.ebit[i]) * p.tasaImpuesto;
    const fcf = p.ebit[i] - impuestoProyecto + p.depreciacion[i] - reinversion + extra;
    flujoProyecto.push(fcf);

    // Flujo del accionista (con deuda): impuestos sobre utilidad tras intereses.
    const utilidadAntesImpuestos = p.ebit[i] - p.intereses[i];
    const impuestoAccionista = Math.max(0, utilidadAntesImpuestos) * p.tasaImpuesto;
    const utilidadNeta = utilidadAntesImpuestos - impuestoAccionista;
    const fcfe = utilidadNeta + p.depreciacion[i] - p.amortizacion[i] - reinversion + extra;
    flujoAccionista.push(fcfe);
  }

  return {
    flujoProyecto,
    flujoAccionista,
    vanProyecto: calcularVAN(flujoProyecto, p.wacc),
    vanAccionista: calcularVAN(flujoAccionista, p.koa),
    tirProyecto: calcularTIR(flujoProyecto),
    tirAccionista: calcularTIR(flujoAccionista),
  };
}
