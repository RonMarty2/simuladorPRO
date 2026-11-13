import { describe, expect, it } from "vitest";
import { crearProyectoEjemploCafeteriaV2 } from "@/lib/proyecto-factory";
import { construirFlujoCajaProyecto } from "@/lib/finanzas/proyecto-financiero";
import {
  aplicarAjustesLaboratorio,
  calcularEscenarioLaboratorio,
  crearAjustesLaboratorioIniciales,
} from "@/lib/laboratorio-viabilidad";

describe("laboratorio: sueldos como variable propia", () => {
  it("arranca en 0 y no cambia el resultado del plan original", () => {
    const proyecto = crearProyectoEjemploCafeteriaV2({ estudiante_id: "est-prueba" });
    const ajustes = crearAjustesLaboratorioIniciales(proyecto);
    expect(ajustes.sueldosPct).toBe(0);
    const base = construirFlujoCajaProyecto(proyecto);
    const escenario = calcularEscenarioLaboratorio(proyecto, ajustes);
    expect(escenario.resultado.indicadores.van).toBeCloseTo(base.indicadores.van, 2);
  });

  it("subir los sueldos aumenta el gasto de personal y baja el VAN", () => {
    const proyecto = crearProyectoEjemploCafeteriaV2({ estudiante_id: "est-prueba" });
    const ajustes = crearAjustesLaboratorioIniciales(proyecto);
    const base = construirFlujoCajaProyecto(proyecto);
    expect(base.personal[0]).toBeGreaterThan(0);
    const escenario = calcularEscenarioLaboratorio(proyecto, {
      ...ajustes,
      sueldosPct: 30,
    });
    expect(escenario.resultado.personal[0]).toBeGreaterThan(base.personal[0]);
    expect(escenario.resultado.indicadores.van).toBeLessThan(base.indicadores.van);
  });

  it("mover los gastos fijos no toca los sueldos", () => {
    const proyecto = crearProyectoEjemploCafeteriaV2({ estudiante_id: "est-prueba" });
    const ajustes = crearAjustesLaboratorioIniciales(proyecto);
    const base = construirFlujoCajaProyecto(proyecto);
    const escenario = calcularEscenarioLaboratorio(proyecto, {
      ...ajustes,
      costoFijoPct: 30,
    });
    expect(escenario.resultado.personal[0]).toBeCloseTo(base.personal[0], 2);
  });

  it("simular no modifica el caso original", () => {
    const proyecto = crearProyectoEjemploCafeteriaV2({ estudiante_id: "est-prueba" });
    const antes = JSON.stringify(proyecto);
    aplicarAjustesLaboratorio(proyecto, {
      ...crearAjustesLaboratorioIniciales(proyecto),
      sueldosPct: 40,
      precioPct: -20,
    });
    expect(JSON.stringify(proyecto)).toBe(antes);
  });
});
