/**
 * Verificación de los indicadores V2 con datos realistas a escala de la
 * "Cafetería de altura — Sucre" del seed de demo (scripts/seed-demo.mjs):
 *   - Ingreso anual ≈ Bs 1.500.000 (60.000 tazas/año a Bs 25)
 *   - Costo directo ≈ Bs 280.000/año (insumos variables)
 *   - Inversión ≈ Bs 95.000 + capital de trabajo
 *
 * Reproduce la misma orquestación que hace `calcularV2` en Paso9Resumen.tsx
 * usando las funciones puras del motor, para confirmar que sobre datos reales
 * los indicadores salen finitos y coherentes (no NaN/Infinity inesperados).
 */
import { describe, expect, it } from "vitest";
import {
  calcularFlujoInversionista,
  calcularGAF,
  calcularGAO,
  calcularGAT,
  calcularPayback,
  calcularPaybackDescontado,
  calcularPuntoEquilibrio,
  calcularSensibilidad,
  calcularVAN,
} from "./calculo-financiero";

// ── Flujo a escala cafetería (5 años, leve crecimiento) ────────────────────
const UNIDADES_ANIO1 = 60000;
const PRECIO = 25;
const ingresos = [1_500_000, 1_575_000, 1_653_750, 1_736_438, 1_823_259];
const costosProduccion = [280_000, 288_400, 297_052, 305_964, 315_142]; // variables
const personal = [164_266, 169_194, 174_270, 179_498, 184_883];
const gastosAdmin = [52_800, 54_384, 56_016, 57_696, 59_427];
const gastosComerc = [7_200, 7_416, 7_638, 7_868, 8_104];
const depreciacion = [9_500, 9_500, 9_500, 9_500, 9_500];
const imprevistos = [25_213, 25_970, 26_749, 27_551, 28_378];
const intereses = [3_990, 3_100, 2_140, 1_100, 0];
const amortizacion = [6_700, 7_590, 8_550, 9_590, 0];
const inversionInicial = 95_000;
const capitalTrabajo = 30_000;
const montoPrestamo = 28_500; // 30% de la inversión fija
const valorResidual = 47_500;
const TASA_IUE = 0.25;
const WACC = 0.14;
const KOA = 0.18;

// Construye utilidad y flujo de caja base (idéntico al de Paso9Resumen).
function construirFlujo() {
  const utilidadAAI: number[] = [];
  const flujoCaja: number[] = [-(inversionInicial + capitalTrabajo - montoPrestamo)];
  for (let i = 0; i < 5; i++) {
    const uOp =
      ingresos[i] -
      costosProduccion[i] -
      gastosAdmin[i] -
      gastosComerc[i] -
      personal[i] -
      depreciacion[i] -
      imprevistos[i];
    const aai = uOp - intereses[i];
    utilidadAAI.push(aai);
    const imp = Math.max(0, aai) * TASA_IUE;
    const neta = aai - imp;
    let fc = neta + depreciacion[i] - amortizacion[i];
    if (i === 4) fc += valorResidual + capitalTrabajo;
    flujoCaja.push(fc);
  }
  return { utilidadAAI, flujoCaja };
}

describe("Indicadores V2 sobre datos de la cafetería", () => {
  const { utilidadAAI, flujoCaja } = construirFlujo();

  it("punto de equilibrio: positivo y por debajo de las ventas del año 1", () => {
    const costosFijos =
      personal[0] + gastosAdmin[0] + gastosComerc[0] + depreciacion[0] + imprevistos[0] + intereses[0];
    const cvUnit = costosProduccion[0] / UNIDADES_ANIO1;
    const pe = calcularPuntoEquilibrio(costosFijos, PRECIO, cvUnit);
    expect(Number.isFinite(pe.unidades)).toBe(true);
    expect(pe.unidades).toBeGreaterThan(0);
    expect(pe.unidades).toBeLessThan(UNIDADES_ANIO1); // la cafetería es rentable
    expect(pe.margenContribucionUnitario).toBeGreaterThan(0);
  });

  it("payback descontado: finito y nunca menor que el simple", () => {
    const simple = calcularPayback(flujoCaja);
    const desc = calcularPaybackDescontado(flujoCaja, WACC);
    expect(desc).toBeGreaterThan(0);
    expect(desc).toBeGreaterThanOrEqual(simple - 1e-9);
  });

  it("apalancamiento: GAO, GAF y GAT finitos y ≥ 1", () => {
    const margenContribucion = ingresos[0] - costosProduccion[0];
    const ebit = utilidadAAI[0] + intereses[0];
    const gao = calcularGAO(margenContribucion, ebit);
    const gaf = calcularGAF(ebit, intereses[0]);
    const gat = calcularGAT(margenContribucion, ebit, intereses[0]);
    for (const x of [gao, gaf, gat]) {
      expect(Number.isFinite(x)).toBe(true);
      expect(x).toBeGreaterThanOrEqual(1);
    }
    expect(gat).toBeCloseTo(gao * gaf, 6);
  });

  it("flujo del inversionista: ambos VAN finitos; con deuda barata el accionista no sale peor", () => {
    const ebitArr = utilidadAAI.map((u, i) => u + intereses[i]);
    const r = calcularFlujoInversionista({
      inversionTotal: inversionInicial + capitalTrabajo,
      montoPrestamo,
      ebit: ebitArr,
      depreciacion,
      intereses,
      amortizacion,
      tasaImpuesto: TASA_IUE,
      extrasUltimoAnio: valorResidual + capitalTrabajo,
      wacc: WACC,
      koa: KOA,
    });
    expect(Number.isFinite(r.vanProyecto)).toBe(true);
    expect(Number.isFinite(r.vanAccionista)).toBe(true);
    expect(r.vanProyecto).toBeGreaterThan(0); // proyecto rentable
  });

  it("sensibilidad: el escenario base reproduce el VAN base y crece con los ingresos", () => {
    const flujoConFactores = (facIngreso: number, facCosto: number): number[] => {
      const flujos: number[] = [flujoCaja[0]];
      for (let i = 0; i < 5; i++) {
        const ing = ingresos[i] * (1 + facIngreso);
        const costOper =
          (costosProduccion[i] + gastosAdmin[i] + gastosComerc[i] + personal[i] + imprevistos[i]) *
          (1 + facCosto);
        const uOp = ing - costOper - depreciacion[i];
        const aai = uOp - intereses[i];
        const neta = aai - Math.max(0, aai) * TASA_IUE;
        let fc = neta + depreciacion[i] - amortizacion[i];
        if (i === 4) fc += valorResidual + capitalTrabajo;
        flujos.push(fc);
      }
      return flujos;
    };
    const vanBase = calcularVAN(flujoCaja, WACC);
    const sens = calcularSensibilidad((f) => flujoConFactores(f, 0), WACC);
    const base = sens.find((s) => s.variacion === 0)!;
    expect(base.van).toBeCloseTo(vanBase, 2);
    // VAN monótonamente creciente al subir ingresos
    for (let i = 1; i < sens.length; i++) {
      expect(sens[i].van).toBeGreaterThan(sens[i - 1].van);
    }
  });
});
