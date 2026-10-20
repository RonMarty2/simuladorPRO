import { describe, expect, it } from "vitest";
import {
  crearProyectoEjemploCafeteriaV2,
  crearProyectoVacio,
} from "@/lib/proyecto-factory";
import { construirFlujoCajaProyecto } from "@/lib/finanzas/proyecto-financiero";
import {
  diagnosticarProyecto,
  resumirDiagnosticoCurso,
  UMBRALES,
} from "@/lib/diagnostico-pedagogico";

function ejemplo() {
  return crearProyectoEjemploCafeteriaV2({ estudiante_id: "diag" });
}

function idsDe(proyecto: Parameters<typeof diagnosticarProyecto>[0]) {
  return diagnosticarProyecto(proyecto).alertas.map((a) => a.id);
}

describe("diagnóstico pedagógico", () => {
  it("no muta el proyecto", () => {
    const proyecto = ejemplo();
    const copia = structuredClone(proyecto);
    diagnosticarProyecto(proyecto);
    expect(proyecto).toEqual(copia);
  });

  it("un proyecto de ejemplo viable da VAN positivo y sin críticos", () => {
    const proyecto = ejemplo();
    const oficial = construirFlujoCajaProyecto(proyecto);
    // El ejemplo de cafetería está diseñado para ser viable.
    expect(oficial.indicadores.van).toBeGreaterThan(0);

    const { alertas } = diagnosticarProyecto(proyecto);
    expect(alertas.some((a) => a.id === "van_positivo")).toBe(true);
    expect(alertas.some((a) => a.severidad === "critico")).toBe(false);
  });

  it("un proyecto vacío avisa que faltan ingresos e inversión, sin reventar", () => {
    const vacio = crearProyectoVacio({ estudiante_id: "diag", nombre: "vacío" });
    const ids = idsDe(vacio);
    // Debe pedir datos mínimos en vez de tirar números sin sentido.
    expect(ids).toContain("sin_ingresos");
  });

  it("detecta crecimiento de demanda irreal", () => {
    const proyecto = ejemplo();
    // Forzar un crecimiento agresivo de unidades en el primer producto.
    const base = proyecto.productos[0].cantidades[0] || 100;
    proyecto.productos[0].cantidades = [
      base,
      base * 2,
      base * 4,
      base * 8,
      base * 16,
    ];
    const ids = idsDe(proyecto);
    expect(ids).toContain("demanda_irreal");
  });

  it("clasifica problemas: crítico y advertencia cuentan, ok no", () => {
    const proyecto = ejemplo();
    const { alertas, problemas, saludable } = diagnosticarProyecto(proyecto);
    const contadosManual = alertas.filter(
      (a) => a.severidad === "critico" || a.severidad === "advertencia"
    ).length;
    expect(problemas).toBe(contadosManual);
    expect(saludable).toBe(problemas === 0);
  });

  it("los umbrales son coherentes (deuda alta < 100, payback < horizonte)", () => {
    expect(UMBRALES.deudaAltaPct).toBeLessThan(100);
    expect(UMBRALES.paybackLentoAnios).toBeLessThanOrEqual(5);
  });

  describe("resumen del curso", () => {
    it("curso vacío devuelve cero sin reventar", () => {
      const r = resumirDiagnosticoCurso([]);
      expect(r.totalProyectos).toBe(0);
      expect(r.patrones).toEqual([]);
    });

    it("agrega patrones y calcula porcentaje sobre el total", () => {
      const sano = ejemplo();
      const conDemandaIrreal = ejemplo();
      const base = conDemandaIrreal.productos[0].cantidades[0] || 100;
      conDemandaIrreal.productos[0].cantidades = [
        base,
        base * 2,
        base * 4,
        base * 8,
        base * 16,
      ];
      const r = resumirDiagnosticoCurso([sano, conDemandaIrreal]);
      expect(r.totalProyectos).toBe(2);
      const patron = r.patrones.find((p) => p.id === "demanda_irreal");
      expect(patron).toBeDefined();
      expect(patron!.cuenta).toBe(1);
      expect(patron!.porcentaje).toBe(50);
    });

    it("los patrones vienen ordenados por frecuencia DESC", () => {
      const proyectos = [ejemplo(), ejemplo(), ejemplo()];
      const r = resumirDiagnosticoCurso(proyectos);
      for (let i = 1; i < r.patrones.length; i++) {
        expect(r.patrones[i - 1].cuenta).toBeGreaterThanOrEqual(r.patrones[i].cuenta);
      }
    });
  });
});
