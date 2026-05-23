import { describe, expect, it } from "vitest";
import {
  calcularAportesPatronales,
  calcularCuotaPrestamoFrancesa,
  calcularDepreciacionAcumulada,
  calcularDepreciacionAnual,
  calcularFlujoCajaAnual,
  calcularIR,
  calcularIT,
  calcularIUE,
  calcularPayback,
  calcularRBC,
  calcularTIR,
  calcularTablaAmortizacion,
  calcularVAN,
  calcularValorResidual,
  calcularWACC,
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
    // utilidad antes imp = 190k - 15k = 175k
    // impuestos = 43.75k
    // utilidad neta = 131.25k
    // flujo = 131.25k + 20k - 25k = 126.25k
    expect(cerca(r.utilidadAntesImpuestos, 175000)).toBe(true);
    expect(cerca(r.impuestos, 43750)).toBe(true);
    expect(cerca(r.utilidadNeta, 131250)).toBe(true);
    expect(cerca(r.flujoCaja, 126250)).toBe(true);
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
    expect(r.impuestos).toBe(0);
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
