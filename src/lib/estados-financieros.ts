/**
 * Motor contable y de Administración Financiera — SOLO LECTURA.
 *
 * Construye a partir de un `Proyecto` (sin modificar `construirFlujoCaja`):
 *  1. Balance de Apertura (Año 0) y Balance General Proyectado (Años 0..5)
 *     con verificación estricta de Partida Doble (Activo = Pasivo + Patrimonio).
 *  2. Estado de Resultados Proyectado (Años 1..5) en cascada contable
 *     (Ventas → Utilidad Bruta → EBITDA → EBIT → EBT → Utilidad Neta)
 *     con análisis vertical (% sobre ventas) y variación interanual.
 *  3. Estado de Flujos de Efectivo clasificado (Operación, Inversión,
 *     Financiamiento) y comparativa Flujo del Proyecto vs. Flujo del Accionista.
 *  4. Batería de Ratios Financieros (Rentabilidad, Liquidez, Endeudamiento,
 *     Cobertura y Eficiencia) + Descomposición DuPont de 3 factores.
 */
import { calcularFlujoInversionista, TASA_IUE } from "./calculo-financiero";
import { construirFlujoCaja } from "./flujo-proyecto";
import type { Proyecto } from "@/types/proyecto";

export interface RubroActivoFijo {
  clave: string;
  etiqueta: string;
  montoBruto: number;
  porcentajeActivo: number;
}

export interface BalanceAnual {
  anio: number; // 0..5
  etiqueta: string;
  // ACTIVO
  cajaYBancos: number;
  creditoFiscalIVA: number;
  totalActivoCorriente: number;
  terrenos: number;
  obrasCiviles: number;
  maquinariaEquipo: number;
  mobiliarioEnseres: number;
  activoDiferido: number;
  reinversionAcumulada: number;
  activoNoCorrienteBruto: number;
  depreciacionAcumulada: number;
  totalActivoNoCorriente: number;
  totalActivo: number;
  // PASIVO
  deudaCortoPlazo: number;
  totalPasivoCorriente: number;
  deudaLargoPlazo: number;
  totalPasivoNoCorriente: number;
  totalPasivo: number;
  // PATRIMONIO
  capitalSocial: number;
  resultadosAcumulados: number;
  totalPatrimonio: number;
  totalPasivoYPatrimonio: number;
  /** Diferencia absoluta para auditoría de partida doble (siempre ~0). */
  diferenciaCuadre: number;
  cuadra: boolean;
}

export interface EstadoResultadosAnual {
  anio: number; // 1..5
  ingresos: number;
  costoVentas: number;
  utilidadBruta: number;
  margenBruto: number; // 0..1
  gastosAdmin: number;
  gastosComerc: number;
  gastosPersonal: number;
  imprevistos: number;
  impuestoTransacciones: number;
  totalGastosOperativos: number;
  ebitda: number;
  margenEbitda: number; // 0..1
  depreciacion: number;
  ebit: number;
  margenOperativo: number; // 0..1
  intereses: number;
  ebt: number;
  margenAntesImpuestos: number; // 0..1
  iue: number;
  utilidadNeta: number;
  margenNeto: number; // 0..1
  variacionIngresosPct: number | null;
  variacionUtilidadNetaPct: number | null;
}

export interface FlujoContableAnual {
  anio: number; // 0..5
  etiqueta: string;
  // Operación
  utilidadNeta: number;
  masDepreciacion: number;
  menosPagoNetoIVA: number;
  flujoOperativo: number;
  // Inversión
  inversionActivosFijos: number;
  inversionCapitalTrabajo: number;
  reinversionActivos: number;
  recuperacionValorResidual: number;
  recuperacionCapitalTrabajo: number;
  flujoInversion: number;
  // Financiamiento
  desembolsoDeuda: number;
  amortizacionDeuda: number;
  flujoFinanciamientoCapital: number;
  // Síntesis de evaluación
  flujoLibreProyecto: number;
  flujoInversionista: number;
  saldoDeudaFinAnio: number;
}

export interface RatiosAnuales {
  anio: number; // 1..5
  // Rentabilidad
  margenBruto: number;
  margenEbitda: number;
  margenOperativo: number;
  margenNeto: number;
  roaOperativo: number; // EBIT / Activo Total
  roaNeto: number; // Utilidad Neta / Activo Total
  roe: number; // Utilidad Neta / Patrimonio Neto
  // Liquidez
  capitalTrabajoNeto: number; // AC - PC
  razonCorriente: number; // AC / PC (Infinity si PC = 0)
  // Endeudamiento y Solvencia
  endeudamientoActivo: number; // Pasivo / Activo
  apalancamientoPatrimonio: number; // Pasivo / Patrimonio
  multiplicadorCapital: number; // Activo / Patrimonio
  coberturaIntereses: number; // EBIT / Intereses (Infinity si Intereses = 0)
  coberturaServicioDeuda: number; // EBITDA / (Intereses + Amortización)
  // Eficiencia / Actividad
  rotacionActivos: number; // Ventas / Activo Total
  rotacionActivoFijo: number; // Ventas / Activo No Corriente Neto
}

export interface IdentidadDuPont {
  anio: number;
  margenNeto: number; // Utilidad Neta / Ventas
  rotacionActivos: number; // Ventas / Activo Total
  multiplicadorCapital: number; // Activo Total / Patrimonio
  roe: number; // Producto de los 3 factores
  utilidadNeta: number;
  ventas: number;
  activoTotal: number;
  patrimonioNeto: number;
}

export interface EstadosFinancierosProyecto {
  calc: ReturnType<typeof construirFlujoCaja>;
  rubrosInversion: RubroActivoFijo[];
  balanceApertura: BalanceAnual;
  balances: BalanceAnual[]; // 0..5
  estadoResultados: EstadoResultadosAnual[]; // 1..5
  flujos: FlujoContableAnual[]; // 0..5
  ratios: RatiosAnuales[]; // 1..5
  ratiosPromedio: Omit<RatiosAnuales, "anio">;
  dupontPorAnio: IdentidadDuPont[]; // 1..5
  vanProyecto: number;
  tirProyecto: number;
  vanInversionista: number;
  tirInversionista: number;
  wacc: number;
  ke: number;
}

function sumarCategoria(items: Array<{ costoTotal?: number }> | undefined): number {
  if (!Array.isArray(items)) return 0;
  return items.reduce((acc, it) => acc + Number(it?.costoTotal ?? 0), 0);
}

function divSegura(num: number, den: number, valorSiCero = 0): number {
  if (!Number.isFinite(num) || !Number.isFinite(den) || Math.abs(den) < 1e-9) {
    return valorSiCero;
  }
  return num / den;
}

export function construirEstadosFinancieros(proyecto: Proyecto): EstadosFinancierosProyecto {
  const calc = construirFlujoCaja(proyecto);

  const terrenos = sumarCategoria(proyecto.inversiones?.terreno);
  const obrasCiviles = sumarCategoria(proyecto.inversiones?.obrasCiviles);
  const maquinariaEquipo = sumarCategoria(proyecto.inversiones?.maquinaria);
  const mobiliarioEnseres = sumarCategoria(proyecto.inversiones?.mobiliario);
  const activoDiferido = sumarCategoria(proyecto.inversiones?.activoDiferido);

  const totalActivoAnio0 = calc.inversionInicial + calc.capitalTrabajo;

  const rubrosInversion: RubroActivoFijo[] = [
    {
      clave: "capitalTrabajo",
      etiqueta: "Caja y Bancos (Capital de trabajo)",
      montoBruto: calc.capitalTrabajo,
      porcentajeActivo: divSegura(calc.capitalTrabajo, totalActivoAnio0),
    },
    {
      clave: "terreno",
      etiqueta: "Terrenos",
      montoBruto: terrenos,
      porcentajeActivo: divSegura(terrenos, totalActivoAnio0),
    },
    {
      clave: "obrasCiviles",
      etiqueta: "Obras civiles y edificaciones",
      montoBruto: obrasCiviles,
      porcentajeActivo: divSegura(obrasCiviles, totalActivoAnio0),
    },
    {
      clave: "maquinaria",
      etiqueta: "Maquinaria y equipo",
      montoBruto: maquinariaEquipo,
      porcentajeActivo: divSegura(maquinariaEquipo, totalActivoAnio0),
    },
    {
      clave: "mobiliario",
      etiqueta: "Mobiliario y enseres",
      montoBruto: mobiliarioEnseres,
      porcentajeActivo: divSegura(mobiliarioEnseres, totalActivoAnio0),
    },
    {
      clave: "activoDiferido",
      etiqueta: "Activo diferido / Intangibles",
      montoBruto: activoDiferido,
      porcentajeActivo: divSegura(activoDiferido, totalActivoAnio0),
    },
  ];

  // ── 1. ESTADO DE RESULTADOS (Años 1..5) ──────────────────────────────────
  const estadoResultados: EstadoResultadosAnual[] = [];
  for (let i = 0; i < 5; i++) {
    const ingresos = calc.ingresos[i] ?? 0;
    const costoVentas = calc.costosProduccion[i] ?? 0;
    const utilidadBruta = ingresos - costoVentas;

    const gastosAdmin = calc.gastosAdmin[i] ?? 0;
    const gastosComerc = calc.gastosComerc[i] ?? 0;
    const gastosPersonal = calc.personal[i] ?? 0;
    const imprevistos = calc.imprevistos[i] ?? 0;
    const impuestoTransacciones = calc.it[i] ?? 0;
    const totalGastosOperativos =
      gastosAdmin + gastosComerc + gastosPersonal + imprevistos + impuestoTransacciones;

    const ebitda = utilidadBruta - totalGastosOperativos;
    const depreciacion = calc.depreciacion[i] ?? 0;
    const ebit = ebitda - depreciacion;
    const intereses = calc.intereses[i] ?? 0;
    const ebt = calc.utilidadAAI[i] ?? ebit - intereses;
    const iue = calc.iue[i] ?? 0;
    const utilidadNeta = calc.utilidadNeta[i] ?? ebt - iue;

    const prevIngresos = i > 0 ? (calc.ingresos[i - 1] ?? 0) : null;
    const prevUtilidad = i > 0 ? (calc.utilidadNeta[i - 1] ?? 0) : null;

    estadoResultados.push({
      anio: i + 1,
      ingresos,
      costoVentas,
      utilidadBruta,
      margenBruto: divSegura(utilidadBruta, ingresos),
      gastosAdmin,
      gastosComerc,
      gastosPersonal,
      imprevistos,
      impuestoTransacciones,
      totalGastosOperativos,
      ebitda,
      margenEbitda: divSegura(ebitda, ingresos),
      depreciacion,
      ebit,
      margenOperativo: divSegura(ebit, ingresos),
      intereses,
      ebt,
      margenAntesImpuestos: divSegura(ebt, ingresos),
      iue,
      utilidadNeta,
      margenNeto: divSegura(utilidadNeta, ingresos),
      variacionIngresosPct:
        prevIngresos !== null && Math.abs(prevIngresos) > 1e-9
          ? (ingresos - prevIngresos) / Math.abs(prevIngresos)
          : null,
      variacionUtilidadNetaPct:
        prevUtilidad !== null && Math.abs(prevUtilidad) > 1e-9
          ? (utilidadNeta - prevUtilidad) / Math.abs(prevUtilidad)
          : null,
    });
  }

  // ── 2. BALANCE DE APERTURA (Año 0) Y PROYECTADO (Años 1..5) ──────────────
  const capitalSocialInicial = Math.max(0, totalActivoAnio0 - calc.montoPrestamo);
  const balances: BalanceAnual[] = [];

  let depAcum = 0;
  let reinvAcum = 0;
  let amortAcum = 0;
  let resultadosAcum = 0;

  for (let anio = 0; anio <= 5; anio++) {
    if (anio >= 1) {
      const idx = anio - 1;
      depAcum += calc.depreciacion[idx] ?? 0;
      reinvAcum += calc.reinversionPorAnio[idx] ?? 0;
      amortAcum += calc.amortizacion[idx] ?? 0;
      resultadosAcum += calc.utilidadNeta[idx] ?? 0;
    }

    const saldoDeuda = Math.max(0, calc.montoPrestamo - amortAcum);
    const amortSiguiente = anio < 5 ? (calc.amortizacion[anio] ?? 0) : 0;
    const deudaCortoPlazo = Math.min(saldoDeuda, Math.max(0, amortSiguiente));
    const deudaLargoPlazo = Math.max(0, saldoDeuda - deudaCortoPlazo);

    const totalPasivoCorriente = deudaCortoPlazo;
    const totalPasivoNoCorriente = deudaLargoPlazo;
    const totalPasivo = totalPasivoCorriente + totalPasivoNoCorriente;

    const capitalSocial = capitalSocialInicial;
    const totalPatrimonio = capitalSocial + resultadosAcum;
    const totalPasivoYPatrimonio = totalPasivo + totalPatrimonio;

    const activoNoCorrienteBruto = calc.inversionInicial + reinvAcum;
    const totalActivoNoCorriente = Math.max(0, activoNoCorrienteBruto - depAcum);

    // Por partida doble sin reparto de dividendos:
    // Caja y capital de trabajo operativo = CapitalTrabajo_0 + Σ(UN + Dep - Reinv - Amort)
    const cajaYBancos =
      calc.capitalTrabajo + resultadosAcum + depAcum - reinvAcum - amortAcum;
    const creditoFiscalIVA =
      anio === 0 ? calc.ivaCreditoFiscalInversionInicial : 0;
    const totalActivoCorriente = cajaYBancos;
    const totalActivo = totalActivoCorriente + totalActivoNoCorriente;
    const diferenciaCuadre = Math.abs(totalActivo - totalPasivoYPatrimonio);

    balances.push({
      anio,
      etiqueta: anio === 0 ? "Apertura (Año 0)" : `Año ${anio}`,
      cajaYBancos,
      creditoFiscalIVA,
      totalActivoCorriente,
      terrenos,
      obrasCiviles,
      maquinariaEquipo,
      mobiliarioEnseres,
      activoDiferido,
      reinversionAcumulada: reinvAcum,
      activoNoCorrienteBruto,
      depreciacionAcumulada: depAcum,
      totalActivoNoCorriente,
      totalActivo,
      deudaCortoPlazo,
      totalPasivoCorriente,
      deudaLargoPlazo,
      totalPasivoNoCorriente,
      totalPasivo,
      capitalSocial,
      resultadosAcumulados: resultadosAcum,
      totalPatrimonio,
      totalPasivoYPatrimonio,
      diferenciaCuadre,
      cuadra: diferenciaCuadre < 0.01,
    });
  }

  // ── 3. FLUJO DE EFECTIVO CONTABLE (Años 0..5) ────────────────────────────
  const ke = proyecto.financiamiento?.costoOportunidadAccionista ?? 0.12;
  const wacc = calc.wacc > 0 ? calc.wacc : ke;
  const ebitArr = calc.utilidadAAI.map((u: number, i: number) => u + (calc.intereses[i] ?? 0));
  const resInversionista = calcularFlujoInversionista({
    inversionTotal: calc.inversionInicial + calc.capitalTrabajo,
    montoPrestamo: calc.montoPrestamo,
    ebit: ebitArr,
    depreciacion: calc.depreciacion,
    intereses: calc.intereses,
    amortizacion: calc.amortizacion,
    reinversionPorAnio: calc.reinversionPorAnio,
    tasaImpuesto: TASA_IUE,
    extrasUltimoAnio: calc.valorResidual + calc.capitalTrabajo,
    wacc,
    koa: ke,
  });
  const flujoInversionistaArr = resInversionista.flujoAccionista;

  const flujos: FlujoContableAnual[] = [];
  let deudaRestante = calc.montoPrestamo;

  for (let anio = 0; anio <= 5; anio++) {
    if (anio === 0) {
      flujos.push({
        anio: 0,
        etiqueta: "Año 0 (Inicio)",
        utilidadNeta: 0,
        masDepreciacion: 0,
        menosPagoNetoIVA: 0,
        flujoOperativo: 0,
        inversionActivosFijos: -calc.inversionInicial,
        inversionCapitalTrabajo: -calc.capitalTrabajo,
        reinversionActivos: 0,
        recuperacionValorResidual: 0,
        recuperacionCapitalTrabajo: 0,
        flujoInversion: -(calc.inversionInicial + calc.capitalTrabajo),
        desembolsoDeuda: calc.montoPrestamo,
        amortizacionDeuda: 0,
        flujoFinanciamientoCapital: calc.montoPrestamo,
        flujoLibreProyecto: calc.flujoCaja[0] ?? 0,
        flujoInversionista: flujoInversionistaArr[0] ?? 0,
        saldoDeudaFinAnio: deudaRestante,
      });
    } else {
      const i = anio - 1;
      const un = calc.utilidadNeta[i] ?? 0;
      const dep = calc.depreciacion[i] ?? 0;
      const iva = calc.ivaNetoPagar[i] ?? 0;
      const flujoOperativo = un + dep - iva;

      const reinv = -(calc.reinversionPorAnio[i] ?? 0);
      const recVR = anio === 5 ? calc.valorResidual : 0;
      const recCT = anio === 5 ? calc.capitalTrabajo : 0;
      const flujoInversion = reinv + recVR + recCT;

      const amort = -(calc.amortizacion[i] ?? 0);
      deudaRestante = Math.max(0, deudaRestante + amort);

      flujos.push({
        anio,
        etiqueta: `Año ${anio}`,
        utilidadNeta: un,
        masDepreciacion: dep,
        menosPagoNetoIVA: -iva,
        flujoOperativo,
        inversionActivosFijos: 0,
        inversionCapitalTrabajo: 0,
        reinversionActivos: reinv,
        recuperacionValorResidual: recVR,
        recuperacionCapitalTrabajo: recCT,
        flujoInversion,
        desembolsoDeuda: 0,
        amortizacionDeuda: amort,
        flujoFinanciamientoCapital: amort,
        flujoLibreProyecto: calc.flujoCaja[anio] ?? 0,
        flujoInversionista: flujoInversionistaArr[anio] ?? 0,
        saldoDeudaFinAnio: deudaRestante,
      });
    }
  }

  // ── 4. RATIOS FINANCIEROS E IDENTIDAD DUPONT (Años 1..5) ─────────────────
  const ratios: RatiosAnuales[] = [];
  const dupontPorAnio: IdentidadDuPont[] = [];

  for (let i = 0; i < 5; i++) {
    const anio = i + 1;
    const er = estadoResultados[i];
    const bal = balances[anio];

    const roaOperativo = divSegura(er.ebit, bal.totalActivo);
    const roaNeto = divSegura(er.utilidadNeta, bal.totalActivo);
    const roe = divSegura(er.utilidadNeta, bal.totalPatrimonio);

    const capitalTrabajoNeto = bal.totalActivoCorriente - bal.totalPasivoCorriente;
    const razonCorriente =
      bal.totalPasivoCorriente > 1e-9
        ? bal.totalActivoCorriente / bal.totalPasivoCorriente
        : Infinity;

    const endeudamientoActivo = divSegura(bal.totalPasivo, bal.totalActivo);
    const apalancamientoPatrimonio = divSegura(bal.totalPasivo, bal.totalPatrimonio);
    const multiplicadorCapital = divSegura(bal.totalActivo, bal.totalPatrimonio, 1);

    const coberturaIntereses =
      er.intereses > 1e-9 ? er.ebit / er.intereses : Infinity;
    const servicioDeudaAnual = er.intereses + (calc.amortizacion[i] ?? 0);
    const coberturaServicioDeuda =
      servicioDeudaAnual > 1e-9 ? er.ebitda / servicioDeudaAnual : Infinity;

    const rotacionActivos = divSegura(er.ingresos, bal.totalActivo);
    const rotacionActivoFijo = divSegura(er.ingresos, bal.totalActivoNoCorriente);

    ratios.push({
      anio,
      margenBruto: er.margenBruto,
      margenEbitda: er.margenEbitda,
      margenOperativo: er.margenOperativo,
      margenNeto: er.margenNeto,
      roaOperativo,
      roaNeto,
      roe,
      capitalTrabajoNeto,
      razonCorriente,
      endeudamientoActivo,
      apalancamientoPatrimonio,
      multiplicadorCapital,
      coberturaIntereses,
      coberturaServicioDeuda,
      rotacionActivos,
      rotacionActivoFijo,
    });

    dupontPorAnio.push({
      anio,
      margenNeto: er.margenNeto,
      rotacionActivos,
      multiplicadorCapital,
      roe,
      utilidadNeta: er.utilidadNeta,
      ventas: er.ingresos,
      activoTotal: bal.totalActivo,
      patrimonioNeto: bal.totalPatrimonio,
    });
  }

  const prom = (fn: (r: RatiosAnuales) => number) => {
    const finitos = ratios.map(fn).filter((v) => Number.isFinite(v));
    if (finitos.length === 0) return Infinity;
    return finitos.reduce((a, b) => a + b, 0) / finitos.length;
  };

  const ratiosPromedio: Omit<RatiosAnuales, "anio"> = {
    margenBruto: prom((r) => r.margenBruto),
    margenEbitda: prom((r) => r.margenEbitda),
    margenOperativo: prom((r) => r.margenOperativo),
    margenNeto: prom((r) => r.margenNeto),
    roaOperativo: prom((r) => r.roaOperativo),
    roaNeto: prom((r) => r.roaNeto),
    roe: prom((r) => r.roe),
    capitalTrabajoNeto: prom((r) => r.capitalTrabajoNeto),
    razonCorriente: prom((r) => r.razonCorriente),
    endeudamientoActivo: prom((r) => r.endeudamientoActivo),
    apalancamientoPatrimonio: prom((r) => r.apalancamientoPatrimonio),
    multiplicadorCapital: prom((r) => r.multiplicadorCapital),
    coberturaIntereses: prom((r) => r.coberturaIntereses),
    coberturaServicioDeuda: prom((r) => r.coberturaServicioDeuda),
    rotacionActivos: prom((r) => r.rotacionActivos),
    rotacionActivoFijo: prom((r) => r.rotacionActivoFijo),
  };

  const vanInversionista = resInversionista.vanAccionista;
  const tirInversionista = resInversionista.tirAccionista;

  return {
    calc,
    rubrosInversion,
    balanceApertura: balances[0],
    balances,
    estadoResultados,
    flujos,
    ratios,
    ratiosPromedio,
    dupontPorAnio,
    vanProyecto: calc.indicadores.van,
    tirProyecto: calc.indicadores.tir,
    vanInversionista,
    tirInversionista,
    wacc,
    ke,
  };
}
