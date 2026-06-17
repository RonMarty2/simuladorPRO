import { describe, expect, it } from "vitest";
import {
  calcularAportesPatronales,
  calcularCuotaPrestamoFrancesa,
  calcularDepreciacionAcumulada,
  calcularDepreciacionAnual,
  calcularFlujoCajaAnual,
  calcularCostoCapitalCAPM,
  calcularLTVSuscripcion,
  proyectarSuscriptores,
  proyectarPublicidad,
  simularMonteCarlo,
  calcularFlujoInversionista,
  calcularGAF,
  calcularGAO,
  calcularGAT,
  calcularIR,
  calcularIVA,
  calcularIT,
  calcularIUE,
  calcularAmortizacionGenerica,
  calcularPayback,
  calcularPaybackDescontado,
  calcularPuntoEquilibrio,
  calcularRBC,
  calcularSensibilidad,
  calcularTIR,
  calcularTablaAmortizacion,
  calcularTributosBolivia,
  calcularVAN,
  calcularValorResidual,
  calcularWACC,
  calcularWACCPorMontos,
  proyectarConCrecimiento,
} from "./calculo-financiero";

// Helper para comparar números con tolerancia
const cerca = (a: number, b: number, tol = 0.01) => Math.abs(a - b) <= tol;

// ============================================================================
// APORTES PATRONALES (Bolivia)
// ============================================================================
describe("calcularAportesPatronales", () => {
  it("sueldo Bs 2.500 (mínimo nacional 2025) → totalAportes Bs 759.25 mensuales", () => {
    const r = calcularAportesPatronales(2500);
    expect(cerca(r.totalAportes, 759.25)).toBe(true);
  });

  it("descompone los 5 aportes correctamente para Bs 2.500", () => {
    const r = calcularAportesPatronales(2500);
    expect(cerca(r.riesgoProfesional, 42.75)).toBe(true); // 2500 * 1.71%
    expect(cerca(r.seguroSalud, 250)).toBe(true); // 2500 * 10%
    expect(cerca(r.provisionVivienda, 50)).toBe(true); // 2500 * 2%
    expect(cerca(r.previsionAguinaldo, 208.25)).toBe(true); // 2500 * 8.33%
    expect(cerca(r.previsionIndemnizacion, 208.25)).toBe(true);
  });

  it("costo total anual incluye 12 sueldos + 12 meses de aportes", () => {
    const r = calcularAportesPatronales(2500);
    // 2500*12 + 759.25*12 = 30000 + 9111 = 39111
    expect(cerca(r.costoTotalAnual, 39111, 0.5)).toBe(true);
  });

  it("escala linealmente — sueldo Bs 5.000 da el doble que Bs 2.500", () => {
    const r1 = calcularAportesPatronales(2500);
    const r2 = calcularAportesPatronales(5000);
    expect(cerca(r2.totalAportes, r1.totalAportes * 2)).toBe(true);
  });
});

// ============================================================================
// IMPUESTOS
// ============================================================================
describe("calcularIUE", () => {
  it("utilidad Bs 100.000 → IUE Bs 25.000 (25%)", () => {
    expect(calcularIUE(100000)).toBe(25000);
  });

  it("no se cobra IUE sobre pérdidas", () => {
    expect(calcularIUE(-50000)).toBe(0);
  });
});

describe("calcularIT", () => {
  it("ingresos Bs 200.000 → IT Bs 6.000 (3%)", () => {
    expect(calcularIT(200000)).toBe(6000);
  });
});

describe("calcularIVA", () => {
  it("calcula debito fiscal, credito fiscal y neto a pagar", () => {
    const r = calcularIVA({
      ventasGravadas: 20000,
      comprasGravadas: 15000,
    });
    expect(r.debitoFiscal).toBe(2600);
    expect(r.creditoFiscalPeriodo).toBe(1950);
    expect(r.ivaNetoPagar).toBe(650);
    expect(r.saldoCreditoFiscal).toBe(0);
  });

  it("arrastra saldo de credito fiscal cuando el credito supera al debito", () => {
    const r = calcularIVA({
      ventasGravadas: 10000,
      comprasGravadas: 20000,
      saldoCreditoFiscalAnterior: 100,
    });
    expect(r.ivaNetoPagar).toBe(0);
    expect(r.saldoCreditoFiscal).toBe(1400);
  });
});

describe("calcularTributosBolivia", () => {
  it("integra IVA, IT e IUE sin mezclar caja y resultado", () => {
    const r = calcularTributosBolivia({
      ingresosBrutos: 200000,
      comprasGravadasIVA: 100000,
      utilidadAntesIUE: 50000,
    });
    expect(r.it).toBe(6000);
    expect(r.iue).toBe(12500);
    expect(r.iva.ivaNetoPagar).toBe(13000);
    expect(r.totalTributosResultado).toBe(18500);
    expect(r.totalTributosCaja).toBe(31500);
  });
});

// ============================================================================
// DEPRECIACIÓN
// ============================================================================
describe("depreciación lineal", () => {
  it("maquinaria Bs 60.000 a 10 años → Bs 6.000 anuales", () => {
    expect(calcularDepreciacionAnual(60000, 10)).toBe(6000);
  });

  it("vida útil 0 (terreno) → 0 depreciación anual", () => {
    expect(calcularDepreciacionAnual(100000, 0)).toBe(0);
  });

  it("acumulada a 3 años de Bs 60.000/10 años = Bs 18.000", () => {
    expect(calcularDepreciacionAcumulada(60000, 10, 3)).toBe(18000);
  });

  it("acumulada nunca excede el costo original", () => {
    expect(calcularDepreciacionAcumulada(60000, 10, 15)).toBe(60000);
  });

  it("valor residual = costo - depreciación acumulada", () => {
    expect(calcularValorResidual(60000, 10, 3)).toBe(42000);
  });

  it("terreno (vida útil 0) mantiene su valor", () => {
    expect(calcularValorResidual(100000, 0, 5)).toBe(100000);
  });
});

// ============================================================================
// FINANCIAMIENTO — Sistema francés
// ============================================================================
describe("calcularCuotaPrestamoFrancesa", () => {
  it("Bs 50.000 al 12% anual por 36 meses ≈ Bs 1.660", () => {
    const cuota = calcularCuotaPrestamoFrancesa(50000, 0.12, 36);
    expect(cerca(cuota, 1660, 5)).toBe(true);
  });

  it("préstamo sin interés divide capital entre meses", () => {
    expect(calcularCuotaPrestamoFrancesa(12000, 0, 12)).toBe(1000);
  });
});

describe("calcularTablaAmortizacion", () => {
  it("genera el número correcto de filas", () => {
    const tabla = calcularTablaAmortizacion(50000, 0.12, 36);
    expect(tabla).toHaveLength(36);
  });

  it("saldo final ≈ 0 al término del plazo", () => {
    const tabla = calcularTablaAmortizacion(50000, 0.12, 36);
    expect(cerca(tabla[35].saldoCapital, 0, 0.5)).toBe(true);
  });

  it("suma de amortizaciones de capital ≈ capital inicial", () => {
    const tabla = calcularTablaAmortizacion(50000, 0.12, 36);
    const totalAmort = tabla.reduce((acc, f) => acc + f.amortizacionCapital, 0);
    expect(cerca(totalAmort, 50000, 0.5)).toBe(true);
  });

  it("primer mes: interés sobre saldo inicial completo", () => {
    const tabla = calcularTablaAmortizacion(50000, 0.12, 36);
    expect(cerca(tabla[0].interes, 50000 * 0.01)).toBe(true);
  });
});

// ============================================================================
// WACC
// ============================================================================
describe("calcularWACC", () => {
  it("50% deuda al 10% (T=25%) + 50% capital al 15% = 11.25%", () => {
    const wacc = calcularWACC({
      porcentajeDeuda: 0.5,
      porcentajeCapital: 0.5,
      tasaInteresDeuda: 0.10,
      costoOportunidadAccionista: 0.15,
      tasaImpuesto: 0.25,
    });
    // 0.5*0.10*(1-0.25) + 0.5*0.15 = 0.0375 + 0.075 = 0.1125
    expect(cerca(wacc, 0.1125)).toBe(true);
  });

  it("100% capital → WACC = costo de oportunidad del accionista", () => {
    const wacc = calcularWACC({
      porcentajeDeuda: 0,
      porcentajeCapital: 1,
      tasaInteresDeuda: 0.10,
      costoOportunidadAccionista: 0.18,
      tasaImpuesto: 0.25,
    });
    expect(cerca(wacc, 0.18)).toBe(true);
  });

  it("WACC por montos coincide con WACC por porcentajes", () => {
    const porMontos = calcularWACCPorMontos({
      capitalPropio: 60000,
      deuda: 40000,
      tasaCapitalPropio: 0.18,
      tasaDeuda: 0.1,
      tasaImpositiva: 0.25,
    });
    expect(cerca(porMontos, 0.138)).toBe(true);
  });
});

// ============================================================================
// VAN, TIR, Payback, IR, RBC
// ============================================================================
describe("calcularVAN", () => {
  it("flujos [-100k, 30k×5] a 10% es positivo", () => {
    const van = calcularVAN([-100000, 30000, 30000, 30000, 30000, 30000], 0.10);
    expect(van).toBeGreaterThan(0);
    expect(cerca(van, 13723.6, 1)).toBe(true); // valor exacto ≈ 13723.60
  });

  it("flujo único negativo → VAN negativo", () => {
    expect(calcularVAN([-10000], 0.10)).toBe(-10000);
  });

  it("tasa de descuento 0 → VAN = suma simple", () => {
    expect(calcularVAN([-100, 50, 50, 50], 0)).toBe(50);
  });
});

describe("calcularTIR", () => {
  it("TIR de [-100k, 30k×5] está entre 15% y 16%", () => {
    const tir = calcularTIR([-100000, 30000, 30000, 30000, 30000, 30000]);
    expect(tir).toBeGreaterThan(0.15);
    expect(tir).toBeLessThan(0.16);
  });

  it("VAN evaluado a la TIR es ≈ 0", () => {
    const flujos = [-100000, 30000, 30000, 30000, 30000, 30000];
    const tir = calcularTIR(flujos);
    expect(cerca(calcularVAN(flujos, tir), 0, 0.5)).toBe(true);
  });
});

describe("calcularPayback", () => {
  it("inversión 100k recuperada en exactamente 4 años con flujos de 25k", () => {
    expect(calcularPayback([-100000, 25000, 25000, 25000, 25000])).toBe(4);
  });

  it("payback interpolado correctamente", () => {
    // Inversión 100, flujos 40, 40, 40 → acumulado tras año 2 = -20, año 3 = +20
    // Recupera en año 2 + 20/40 = 2.5
    const pb = calcularPayback([-100, 40, 40, 40]);
    expect(cerca(pb, 2.5)).toBe(true);
  });

  it("retorna -1 si nunca se recupera", () => {
    expect(calcularPayback([-100, 10, 10, 10])).toBe(-1);
  });
});

describe("calcularPaybackDescontado", () => {
  it("calcula recuperacion descontada dentro del horizonte", () => {
    const pb = calcularPaybackDescontado([-1000, 400, 400, 400, 400], 0.1);
    expect(pb).not.toBeNull();
    expect(pb!).toBeGreaterThan(3);
    expect(pb!).toBeLessThan(4);
  });

  it("retorna -1 cuando no recupera", () => {
    expect(calcularPaybackDescontado([-1000, 50, 50, 50], 0.1)).toBe(-1);
  });
});

describe("calcularPuntoEquilibrio", () => {
  it("calcula unidades, monto y margen", () => {
    const pe = calcularPuntoEquilibrio(12000, 50, 30);
    expect(pe.unidades).toBe(600);
    expect(pe.ingresoBs).toBe(30000);
    expect(pe.margenContribucionUnitario).toBe(20);
  });

  it("retorna infinito si no hay margen de contribucion", () => {
    const pe = calcularPuntoEquilibrio(1000, 10, 12);
    expect(pe.unidades).toBe(Infinity);
    expect(pe.ingresoBs).toBe(Infinity);
  });
});

describe("calcularAmortizacionGenerica", () => {
  it("soporta metodo aleman con amortizacion fija", () => {
    const r = calcularAmortizacionGenerica({
      capital: 10000,
      tasaPeriodo: 0.1,
      numPeriodos: 4,
      metodo: "aleman",
    });
    expect(r.cuotas).toHaveLength(4);
    expect(r.cuotas.every((c) => cerca(c.amortizacionCapital, 2500))).toBe(true);
  });
});

describe("calcularIR", () => {
  it("IR > 1 → proyecto rentable", () => {
    const ir = calcularIR([-100000, 30000, 30000, 30000, 30000, 30000], 0.10);
    expect(ir).toBeGreaterThan(1);
  });

  it("relación: VAN > 0 ↔ IR > 1", () => {
    const flujos = [-100000, 30000, 30000, 30000, 30000, 30000];
    const van = calcularVAN(flujos, 0.10);
    const ir = calcularIR(flujos, 0.10);
    expect(van > 0 && ir > 1).toBe(true);
  });
});

describe("calcularRBC", () => {
  it("ingresos 100 + costos 80 cada año a 10% → RBC = 1.25", () => {
    const rbc = calcularRBC([100, 100, 100], [80, 80, 80], 0.10);
    expect(cerca(rbc, 1.25)).toBe(true);
  });
});

// ============================================================================
// FLUJO DE CAJA
// ============================================================================
describe("calcularFlujoCajaAnual", () => {
  it("ejemplo boliviano básico — ingresos > costos → utilidad neta positiva", () => {
    const r = calcularFlujoCajaAnual({
      ingresos: 500000,
      costosProduccion: 200000,
      costosAdministracion: 50000,
      costosComercializacion: 30000,
      depreciacion: 20000,
      imprevistos: 10000,
      interesDeuda: 15000,
      amortizacionDeuda: 25000,
      tasaImpuesto: 0.25,
    });
    // utilidad operativa = 500k - 290k - 20k = 190k
    // IT = 15k; utilidad antes IUE = 190k - 15k IT - 15k intereses = 160k
    // IUE = 40k; IVA neto caja = 65k debito - 37.7k credito = 27.3k
    // flujo = 120k + 20k - 25k - 27.3k = 87.7k
    expect(cerca(r.it, 15000)).toBe(true);
    expect(cerca(r.utilidadAntesImpuestos, 160000)).toBe(true);
    expect(cerca(r.iue, 40000)).toBe(true);
    expect(cerca(r.ivaNetoPagar, 27300)).toBe(true);
    expect(cerca(r.impuestos, 55000)).toBe(true);
    expect(cerca(r.utilidadNeta, 120000)).toBe(true);
    expect(cerca(r.flujoCaja, 87700)).toBe(true);
  });

  it("pérdidas no generan impuestos negativos", () => {
    const r = calcularFlujoCajaAnual({
      ingresos: 100000,
      costosProduccion: 200000,
      costosAdministracion: 0,
      costosComercializacion: 0,
      depreciacion: 0,
      imprevistos: 0,
      interesDeuda: 0,
      amortizacionDeuda: 0,
      tasaImpuesto: 0.25,
    });
    expect(r.utilidadAntesImpuestos).toBeLessThan(0);
    expect(r.iue).toBe(0);
    expect(r.impuestos).toBe(3000);
    expect(r.ivaNetoPagar).toBe(0);
    expect(r.ivaSaldoCreditoFiscal).toBe(13000);
  });
});

// ============================================================================
// PROYECCIÓN
// ============================================================================
describe("proyectarConCrecimiento", () => {
  it("crecimiento 0% → todos los años iguales", () => {
    expect(proyectarConCrecimiento(1000, 0, 5)).toEqual([1000, 1000, 1000, 1000, 1000]);
  });

  it("crecimiento 10% sobre Bs 100.000 en 3 años", () => {
    const proy = proyectarConCrecimiento(100000, 0.10, 3);
    expect(proy).toHaveLength(3);
    expect(cerca(proy[0], 100000)).toBe(true);
    expect(cerca(proy[1], 110000)).toBe(true);
    expect(cerca(proy[2], 121000)).toBe(true);
  });

  it("anios 0 → array vacío", () => {
    expect(proyectarConCrecimiento(1000, 0.10, 0)).toEqual([]);
  });
});

// ============================================================================
// ===================  INDICADORES V2 (EXTENDIDO)  ===========================
// ============================================================================

// ----------------------------------------------------------------------------
// PUNTO DE EQUILIBRIO
// ----------------------------------------------------------------------------
describe("calcularPuntoEquilibrio", () => {
  it("CF 100.000, precio 50, costo var 30 → 5.000 unidades y Bs 250.000", () => {
    const r = calcularPuntoEquilibrio(100000, 50, 30);
    expect(cerca(r.unidades, 5000)).toBe(true);
    expect(cerca(r.ingresoBs, 250000)).toBe(true);
    expect(cerca(r.margenContribucionUnitario, 20)).toBe(true);
    expect(cerca(r.ratioMargenContribucion, 0.4)).toBe(true);
  });

  it("margen de contribución ≤ 0 → unidades Infinity (nunca equilibra)", () => {
    const r = calcularPuntoEquilibrio(100000, 30, 30);
    expect(r.unidades).toBe(Infinity);
    expect(r.ingresoBs).toBe(Infinity);
  });

  it("costos fijos 0 → equilibrio en 0 unidades", () => {
    const r = calcularPuntoEquilibrio(0, 50, 30);
    expect(r.unidades).toBe(0);
    expect(r.ingresoBs).toBe(0);
  });
});

// ----------------------------------------------------------------------------
// PAYBACK DESCONTADO
// ----------------------------------------------------------------------------
describe("calcularPaybackDescontado", () => {
  it("tarda más que el payback simple (descontar retrasa la recuperación)", () => {
    const flujos = [-1000, 400, 400, 400, 400];
    const simple = calcularPayback(flujos);
    const desc = calcularPaybackDescontado(flujos, 0.1);
    expect(desc).toBeGreaterThan(simple);
  });

  it("tasa 0% → igual al payback simple", () => {
    const flujos = [-1000, 500, 500, 500];
    expect(cerca(calcularPaybackDescontado(flujos, 0), calcularPayback(flujos))).toBe(true);
  });

  it("nunca recupera → -1", () => {
    const flujos = [-1000, 100, 100, 100];
    expect(calcularPaybackDescontado(flujos, 0.1)).toBe(-1);
  });
});

// ----------------------------------------------------------------------------
// SENSIBILIDAD
// ----------------------------------------------------------------------------
describe("calcularSensibilidad", () => {
  it("escenario base (factor 0) coincide con el VAN/TIR del caso base", () => {
    const base = [-1000, 500, 500, 500];
    const construir = (f: number) => base.map((v, t) => (t === 0 ? v : v * (1 + f)));
    const filas = calcularSensibilidad(construir, 0.1, [-0.2, 0, 0.2]);
    const fbase = filas.find((r) => r.variacion === 0)!;
    expect(cerca(fbase.van, calcularVAN(base, 0.1))).toBe(true);
  });

  it("VAN crece monótonamente al subir los ingresos", () => {
    const base = [-1000, 500, 500, 500];
    const construir = (f: number) => base.map((v, t) => (t === 0 ? v : v * (1 + f)));
    const filas = calcularSensibilidad(construir, 0.1, [-0.2, -0.1, 0, 0.1, 0.2]);
    for (let i = 1; i < filas.length; i++) {
      expect(filas[i].van).toBeGreaterThan(filas[i - 1].van);
    }
  });

  it("usa las variaciones por defecto cuando no se especifican", () => {
    const filas = calcularSensibilidad(() => [-100, 50, 50, 50], 0.1);
    expect(filas).toHaveLength(5);
  });
});

// ----------------------------------------------------------------------------
// APALANCAMIENTO
// ----------------------------------------------------------------------------
describe("apalancamiento (GAO / GAF / GAT)", () => {
  // Margen contribución 200.000, costos fijos 120.000 → EBIT 80.000, interés 30.000
  it("GAO = margen contribución / EBIT", () => {
    expect(cerca(calcularGAO(200000, 80000), 2.5)).toBe(true);
  });

  it("GAF = EBIT / (EBIT − interés)", () => {
    expect(cerca(calcularGAF(80000, 30000), 1.6)).toBe(true); // 80000 / 50000
  });

  it("GAT = GAO × GAF", () => {
    const gat = calcularGAT(200000, 80000, 30000);
    expect(cerca(gat, 2.5 * 1.6)).toBe(true); // 4.0
  });

  it("EBIT 0 → GAO NaN", () => {
    expect(Number.isNaN(calcularGAO(200000, 0))).toBe(true);
  });

  it("utilidad antes de impuestos 0 → GAF NaN", () => {
    expect(Number.isNaN(calcularGAF(80000, 80000))).toBe(true);
  });
});

// ----------------------------------------------------------------------------
// SUSCRIPCIÓN / RECURRENTE
// ----------------------------------------------------------------------------
describe("proyectarSuscriptores", () => {
  it("churn 0% → la base crece linealmente con las altas", () => {
    const r = proyectarSuscriptores(
      { suscriptoresIniciales: 100, altasMensuales: 10, churnMensual: 0, cuotaMensual: 30 },
      1
    );
    // sin churn: 100 + 12×10 = 220 al cierre del año 1
    expect(cerca(r[0].suscriptoresFin, 220)).toBe(true);
  });

  it("con churn, la base tiende a estabilizarse en altas/churn", () => {
    const r = proyectarSuscriptores(
      { suscriptoresIniciales: 0, altasMensuales: 50, churnMensual: 0.1, cuotaMensual: 20 },
      5
    );
    // equilibrio = 50 / 0.1 = 500; al año 5 debe estar cerca
    expect(r[4].suscriptoresFin).toBeGreaterThan(450);
    expect(r[4].suscriptoresFin).toBeLessThanOrEqual(500);
  });

  it("ingreso anual = promedio suscriptores × cuota × 12", () => {
    const r = proyectarSuscriptores(
      { suscriptoresIniciales: 200, altasMensuales: 0, churnMensual: 0, cuotaMensual: 25 },
      1
    );
    // sin altas ni churn: 200 constante → 200 × 25 × 12 = 60.000
    expect(cerca(r[0].ingresoAnual, 60000)).toBe(true);
  });

  it("devuelve un registro por año", () => {
    const r = proyectarSuscriptores(
      { suscriptoresIniciales: 10, altasMensuales: 5, churnMensual: 0.05, cuotaMensual: 10 },
      5
    );
    expect(r).toHaveLength(5);
  });
});

describe("calcularLTVSuscripcion", () => {
  it("cuota 30, churn 5% → LTV 600", () => {
    expect(cerca(calcularLTVSuscripcion(30, 0.05), 600)).toBe(true);
  });
  it("churn 0 → LTV Infinity", () => {
    expect(calcularLTVSuscripcion(30, 0)).toBe(Infinity);
  });
});

// ----------------------------------------------------------------------------
// PUBLICIDAD / AUDIENCIA (CPM)
// ----------------------------------------------------------------------------
describe("proyectarPublicidad", () => {
  it("sin crecimiento: ingreso = audiencia × impresiones × 12 / 1000 × CPM", () => {
    const r = proyectarPublicidad(
      { audienciaMensual: 10000, crecimientoMensual: 0, impresionesPorUsuario: 4, cpm: 50 },
      1
    );
    // impresiones/año = 10000 × 4 × 12 = 480.000 → /1000 × 50 = 24.000
    expect(cerca(r[0].ingresoAnual, 24000)).toBe(true);
  });

  it("la audiencia crece mes a mes", () => {
    const r = proyectarPublicidad(
      { audienciaMensual: 1000, crecimientoMensual: 0.1, impresionesPorUsuario: 1, cpm: 30 },
      2
    );
    expect(r[1].audienciaFin).toBeGreaterThan(r[0].audienciaFin);
  });

  it("devuelve un registro por año", () => {
    const r = proyectarPublicidad(
      { audienciaMensual: 5000, crecimientoMensual: 0.05, impresionesPorUsuario: 2, cpm: 40 },
      5
    );
    expect(r).toHaveLength(5);
  });
});

// ----------------------------------------------------------------------------
// MONTE CARLO
// ----------------------------------------------------------------------------
describe("simularMonteCarlo", () => {
  // Generador determinista (LCG) para tests reproducibles.
  function lcg(seed: number) {
    let s = seed >>> 0;
    return () => {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }
  const base = [-1000, 500, 500, 500];
  const construir = (fi: number, _fc: number) =>
    base.map((v, t) => (t === 0 ? v : v * (1 + fi)));

  it("con rng=0.5 (sin variación) todos los escenarios dan el VAN base", () => {
    const vanBase = calcularVAN(base, 0.1);
    const r = simularMonteCarlo(construir, 0.1, { iteraciones: 100, rng: () => 0.5 });
    expect(cerca(r.vanPromedio, vanBase)).toBe(true);
    expect(cerca(r.vanP50, vanBase)).toBe(true);
    expect(r.probabilidadVANPositivo).toBe(vanBase > 0 ? 1 : 0);
  });

  it("probabilidad entre 0 y 1, percentiles ordenados", () => {
    const r = simularMonteCarlo(construir, 0.1, {
      iteraciones: 2000,
      rangoIngreso: 0.3,
      rangoCosto: 0.2,
      rng: lcg(42),
    });
    expect(r.probabilidadVANPositivo).toBeGreaterThanOrEqual(0);
    expect(r.probabilidadVANPositivo).toBeLessThanOrEqual(1);
    expect(r.vanP5).toBeLessThanOrEqual(r.vanP50);
    expect(r.vanP50).toBeLessThanOrEqual(r.vanP95);
    expect(r.vanMin).toBeLessThanOrEqual(r.vanMax);
  });

  it("el histograma cubre todos los escenarios", () => {
    const iteraciones = 1000;
    const r = simularMonteCarlo(construir, 0.1, {
      iteraciones,
      rangoIngreso: 0.25,
      rng: lcg(7),
    });
    const suma = r.histograma.reduce((a, h) => a + h.conteo, 0);
    expect(suma).toBe(iteraciones);
  });
});

// ----------------------------------------------------------------------------
// COSTO DE CAPITAL CAPM
// ----------------------------------------------------------------------------
describe("calcularCostoCapitalCAPM", () => {
  it("Rf 4%, β 1.0, prima 8% → Ke 12%", () => {
    expect(cerca(calcularCostoCapitalCAPM(0.04, 1.0, 0.08), 0.12)).toBe(true);
  });

  it("β > 1 amplifica el riesgo (Ke mayor)", () => {
    expect(cerca(calcularCostoCapitalCAPM(0.04, 1.5, 0.08), 0.16)).toBe(true);
  });

  it("β 0 → Ke iguala la tasa libre de riesgo", () => {
    expect(cerca(calcularCostoCapitalCAPM(0.05, 0, 0.08), 0.05)).toBe(true);
  });
});

// ----------------------------------------------------------------------------
// FLUJO DEL INVERSIONISTA (proyecto vs accionista)
// ----------------------------------------------------------------------------
describe("calcularFlujoInversionista", () => {
  const params = {
    inversionTotal: 100000,
    montoPrestamo: 40000,
    ebit: [30000, 30000, 30000],
    depreciacion: [10000, 10000, 10000],
    intereses: [4000, 3000, 2000],
    amortizacion: [12000, 13000, 14000],
    tasaImpuesto: 0.25,
    extrasUltimoAnio: 0,
    wacc: 0.12,
    koa: 0.18,
  };

  it("año 0 del proyecto = −inversión total; del accionista = −(inversión − préstamo)", () => {
    const r = calcularFlujoInversionista(params);
    expect(r.flujoProyecto[0]).toBe(-100000);
    expect(r.flujoAccionista[0]).toBe(-60000);
  });

  it("flujo del proyecto año 1 = EBIT − impuesto sobre EBIT + depreciación", () => {
    const r = calcularFlujoInversionista(params);
    // 30000 − 7500 + 10000 = 32500
    expect(cerca(r.flujoProyecto[1], 32500)).toBe(true);
  });

  it("flujo del accionista año 1 incluye escudo fiscal de intereses y resta amortización", () => {
    const r = calcularFlujoInversionista(params);
    // UAI = 30000 − 4000 = 26000; imp = 6500; neta = 19500; +10000 dep −12000 amort = 17500
    expect(cerca(r.flujoAccionista[1], 17500)).toBe(true);
  });

  it("calcula VAN del proyecto al WACC y del accionista al Koa", () => {
    const r = calcularFlujoInversionista(params);
    expect(cerca(r.vanProyecto, calcularVAN(r.flujoProyecto, 0.12))).toBe(true);
    expect(cerca(r.vanAccionista, calcularVAN(r.flujoAccionista, 0.18))).toBe(true);
  });

  it("extras del último año solo se agregan al final", () => {
    const conExtra = calcularFlujoInversionista({ ...params, extrasUltimoAnio: 5000 });
    const sinExtra = calcularFlujoInversionista(params);
    const ult = conExtra.flujoProyecto.length - 1;
    expect(cerca(conExtra.flujoProyecto[ult] - sinExtra.flujoProyecto[ult], 5000)).toBe(true);
    expect(cerca(conExtra.flujoProyecto[1], sinExtra.flujoProyecto[1])).toBe(true);
  });

  it("la reposición de activos (reinversión) se resta de ambos flujos en su año", () => {
    const conReinv = calcularFlujoInversionista({
      ...params,
      reinversionPorAnio: [0, 8000, 0],
    });
    const sinReinv = calcularFlujoInversionista(params);
    // Año 2 (índice 2): ambos flujos bajan exactamente 8000 respecto al caso sin reposición.
    expect(cerca(sinReinv.flujoProyecto[2] - conReinv.flujoProyecto[2], 8000)).toBe(true);
    expect(cerca(sinReinv.flujoAccionista[2] - conReinv.flujoAccionista[2], 8000)).toBe(true);
    // Años sin reposición no cambian.
    expect(cerca(conReinv.flujoProyecto[1], sinReinv.flujoProyecto[1])).toBe(true);
  });
});
