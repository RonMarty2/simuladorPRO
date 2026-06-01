import { describe, it, expect } from "vitest";
import { PLANTILLAS } from "./plantillas";
import { construirFlujoCaja } from "./flujo-proyecto";

describe("plantillas de ejemplo (galería)", () => {
  it("hay al menos una plantilla por modelo de ingreso", () => {
    const modelos = new Set(PLANTILLAS.map((p) => p.modelo));
    expect(modelos.has("unidades")).toBe(true);
    expect(modelos.has("suscripcion")).toBe(true);
    expect(modelos.has("publicidad")).toBe(true);
    expect(modelos.has("costo_beneficio")).toBe(true);
  });

  for (const pl of PLANTILLAS) {
    describe(`${pl.titulo} (${pl.modeloLabel})`, () => {
      const proyecto = pl.crear();

      it("genera un proyecto con todos los campos base", () => {
        expect(proyecto.nombre).toBeTruthy();
        expect(proyecto.sector).toBeTruthy();
        expect(proyecto.productos.length).toBeGreaterThan(0);
        expect(proyecto.financiamiento).toBeTruthy();
      });

      it("el motor calcula indicadores FINITOS (sin NaN/Infinity)", () => {
        const calc = construirFlujoCaja(proyecto);
        expect(Number.isFinite(calc.indicadores.van)).toBe(true);
        expect(Number.isFinite(calc.wacc)).toBe(true);
        // TIR y payback pueden ser Infinity en proyectos degenerados, pero
        // NUNCA NaN (eso indicaría datos rotos).
        expect(Number.isNaN(calc.indicadores.van)).toBe(false);
        expect(Number.isNaN(calc.indicadores.tir)).toBe(false);
        expect(Number.isNaN(calc.indicadores.payback)).toBe(false);
      });

      it("genera ingresos positivos en el año 1", () => {
        const ingresoAnio1 = proyecto.productos.reduce(
          (acc, p) => acc + p.cantidades[0] * p.precios[0],
          0
        );
        expect(ingresoAnio1).toBeGreaterThan(0);
      });
    });
  }
});
