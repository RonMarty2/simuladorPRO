import { describe, expect, it } from "vitest";
import { crearProyectoEjemploCafeteriaV2 } from "@/lib/proyecto-factory";
import { construirFlujoCajaProyecto } from "@/lib/finanzas/proyecto-financiero";
import {
  analizarLimitesViabilidad,
  calcularEscenarioLaboratorio,
  crearAjustesLaboratorioIniciales,
} from "@/lib/laboratorio-viabilidad";

function ejemplo() {
  return crearProyectoEjemploCafeteriaV2({ estudiante_id: "laboratorio" });
}

describe("laboratorio de viabilidad", () => {
  it("reproduce el proyecto base sin modificarlo", () => {
    const proyecto = ejemplo();
    const copia = structuredClone(proyecto);
    const oficial = construirFlujoCajaProyecto(proyecto);
    const escenario = calcularEscenarioLaboratorio(
      proyecto,
      crearAjustesLaboratorioIniciales(proyecto)
    );

    expect(escenario.resultado.indicadores.van).toBeCloseTo(
      oficial.indicadores.van,
      5
    );
    expect(escenario.resultado.indicadores.tir).toBeCloseTo(
      oficial.indicadores.tir,
      5
    );
    expect(proyecto).toEqual(copia);
  });

  it("recalcula VAN, TIR y equilibrio al mover el precio", () => {
    const proyecto = ejemplo();
    const inicial = crearAjustesLaboratorioIniciales(proyecto);
    const base = calcularEscenarioLaboratorio(proyecto, inicial);
    const mejorado = calcularEscenarioLaboratorio(proyecto, {
      ...inicial,
      precioPct: 10,
    });

    expect(mejorado.resultado.indicadores.van).toBeGreaterThan(
      base.resultado.indicadores.van
    );
    expect(mejorado.equilibrio.unidades).toBeLessThan(
      base.equilibrio.unidades
    );
    expect(mejorado.graficoEquilibrio).toHaveLength(9);
  });

  it("calcula límites y ordena las variables por impacto", () => {
    const analisis = analizarLimitesViabilidad(ejemplo(), "medio");

    expect(analisis.umbrales).toHaveLength(4);
    expect(analisis.umbrales.every((item) => item.texto.length > 15)).toBe(true);
    expect(analisis.impactos).toHaveLength(4);
    expect(analisis.impactos[0].porcentaje).toBeCloseTo(100, 5);
    expect(analisis.impactos[0].impactoVan).toBeGreaterThanOrEqual(
      analisis.impactos[1].impactoVan
    );
  });

  it("limita el análisis básico a precio, ventas y costos directos", () => {
    const analisis = analizarLimitesViabilidad(ejemplo(), "basico");
    expect(analisis.umbrales.map((item) => item.variable)).toEqual([
      "precio",
      "demanda",
      "costoDirecto",
    ]);
  });

  it("permite probar deuda sin guardarla en el proyecto", () => {
    const proyecto = ejemplo();
    const original = structuredClone(proyecto);
    const inicial = crearAjustesLaboratorioIniciales(proyecto);
    const escenario = calcularEscenarioLaboratorio(proyecto, {
      ...inicial,
      deudaPct: 60,
      tasaInteresPct: 18,
    });

    expect(escenario.deudaPct).toBeCloseTo(60, 1);
    expect(Number.isFinite(escenario.resultado.wacc)).toBe(true);
    expect(proyecto).toEqual(original);
  });
});
