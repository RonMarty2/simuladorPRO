import { describe, it, expect } from "vitest";
import { PLANTILLAS } from "./plantillas";
import { calcularEquilibrioPorProducto } from "./equilibrio-por-producto";
import { construirFlujoCaja } from "./flujo-proyecto";

const crear = (clave: string) => PLANTILLAS.find((p) => p.clave === clave)!.crear();

describe("equilibrio por producto", () => {
  it("cada producto tiene su propia unidad y un equilibrio menor que su venta del año 1 si el proyecto es rentable", () => {
    const eq = calcularEquilibrioPorProducto(crear("restaurante"));
    expect(eq.tipo).toBe("unidades");
    expect(eq.filas.length).toBeGreaterThan(1);
    const unidades = new Set(eq.filas.map((f) => f.unidad));
    expect(unidades.size).toBeGreaterThan(1);
    expect(eq.alcanza).toBe(true);
    for (const f of eq.filas) {
      expect(f.unidadesEquilibrio).toBeLessThan(f.unidadesAnio1);
    }
  });

  it("en el equilibrio los ingresos cubren exactamente los costos fijos más los variables", () => {
    const p = crear("cafeteria");
    const eq = calcularEquilibrioPorProducto(p);
    const contribucionEnEquilibrio = eq.filas.reduce(
      (a, f) => a + f.unidadesEquilibrio * f.margenUnitario,
      0
    );
    expect(contribucionEnEquilibrio).toBeCloseTo(eq.costosFijos, 4);
  });

  it("proyectos costo-beneficio devuelven un beneficio mínimo, no unidades", () => {
    const eq = calcularEquilibrioPorProducto(crear("camarafrio"));
    expect(eq.tipo).toBe("beneficio");
    expect(eq.filas.length).toBe(1);
    expect(Number.isFinite(eq.ingresoEquilibrio)).toBe(true);
  });

  it("si no hay margen el equilibrio no se alcanza", () => {
    const p = crear("cafeteria");
    p.costosDirectos = p.costosDirectos.map((c) => ({ ...c, costoUnitario: 1e6 }));
    const eq = calcularEquilibrioPorProducto(p);
    expect(eq.alcanza).toBe(false);
    expect(eq.factorVolumen).toBe(Infinity);
  });

  it("es consistente con el motor: costos fijos del año 1", () => {
    const p = crear("panaderia");
    const flujo = construirFlujoCaja(p);
    const eq = calcularEquilibrioPorProducto(p);
    expect(eq.costosFijos).toBeCloseTo(
      flujo.gastosAdmin[0] + flujo.gastosComerc[0] + flujo.personal[0] + flujo.imprevistos[0],
      6
    );
  });
});
