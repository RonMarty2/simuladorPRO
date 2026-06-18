import { describe, it, expect } from "vitest";
import {
  aplicarModificadores,
  compararEscenarios,
  esViable,
  DEFAULT_OPTIMISTA,
  DEFAULT_PESIMISTA,
  ESCENARIO_NEUTRAL,
} from "./escenarios";
import { crearProyectoVacio } from "./proyecto-factory";

function proyectoConDatosMinimos() {
  const p = crearProyectoVacio({
    estudiante_id: "e1",
    nombre: "Test",
    curso_id: null,
  });
  // Producto con datos para que el motor calcule algo no-trivial.
  p.productos = [
    {
      id: "prod1",
      nombre: "Pan",
      unidadMedida: "unidad",
      cantidades: [1000, 1100, 1200, 1300, 1400],
      precios: [10, 10, 10, 10, 10],
    },
  ];
  p.financiamiento = {
    porcentajePropio: 0.5,
    porcentajePrestamo: 0.5,
    tasaInteresAnual: 0.12,
    plazoMeses: 60,
    costoOportunidadAccionista: 0.15,
  };
  return p;
}

describe("aplicarModificadores", () => {
  it("multiplica precios por precioMul", () => {
    const p = proyectoConDatosMinimos();
    const out = aplicarModificadores(p, { ...ESCENARIO_NEUTRAL, precioMul: 1.10 });
    expect(out.productos[0].precios[0]).toBeCloseTo(11, 5);
    expect(out.productos[0].precios[4]).toBeCloseTo(11, 5);
  });

  it("multiplica cantidades por demandaMul", () => {
    const p = proyectoConDatosMinimos();
    const out = aplicarModificadores(p, { ...ESCENARIO_NEUTRAL, demandaMul: 0.5 });
    expect(out.productos[0].cantidades[0]).toBe(500);
  });

  it("no muta el proyecto original (deep clone)", () => {
    const p = proyectoConDatosMinimos();
    const precioOriginal = p.productos[0].precios[0];
    aplicarModificadores(p, { ...ESCENARIO_NEUTRAL, precioMul: 2.0 });
    expect(p.productos[0].precios[0]).toBe(precioOriginal);
  });

  it("aplica delta a la tasa de interés (suma en puntos porcentuales)", () => {
    const p = proyectoConDatosMinimos();
    const out = aplicarModificadores(p, { ...ESCENARIO_NEUTRAL, tasaInteresDeltaPp: 0.03 });
    expect(out.financiamiento.tasaInteresAnual).toBeCloseTo(0.15, 5);
  });

  it("override absoluto del % de préstamo respeta [0,1] y ajusta % propio", () => {
    const p = proyectoConDatosMinimos();
    const out = aplicarModificadores(p, { ...ESCENARIO_NEUTRAL, prestamoPorcentaje: 0.7 });
    expect(out.financiamiento.porcentajePrestamo).toBeCloseTo(0.7, 5);
    expect(out.financiamiento.porcentajePropio).toBeCloseTo(0.3, 5);
  });

  it("clampea tasa de interés a un mínimo de 0 cuando el delta es muy negativo", () => {
    const p = proyectoConDatosMinimos();
    p.financiamiento.tasaInteresAnual = 0.05;
    const out = aplicarModificadores(p, { ...ESCENARIO_NEUTRAL, tasaInteresDeltaPp: -0.10 });
    expect(out.financiamiento.tasaInteresAnual).toBe(0);
  });
});

describe("compararEscenarios", () => {
  it("devuelve 3 escenarios sin personalizado", () => {
    const p = proyectoConDatosMinimos();
    const res = compararEscenarios(p);
    expect(res.map((r) => r.nombre)).toEqual(["optimista", "base", "pesimista"]);
  });

  it("agrega 4to escenario si se pasa personalizado", () => {
    const p = proyectoConDatosMinimos();
    const personalizado = { ...ESCENARIO_NEUTRAL, precioMul: 1.5 };
    const res = compararEscenarios(p, DEFAULT_OPTIMISTA, DEFAULT_PESIMISTA, personalizado);
    expect(res).toHaveLength(4);
    expect(res[3].nombre).toBe("personalizado");
  });

  it("VAN del optimista > VAN del base > VAN del pesimista (caso normal)", () => {
    const p = proyectoConDatosMinimos();
    const res = compararEscenarios(p);
    const vanOpt = res[0].flujo.indicadores.van;
    const vanBase = res[1].flujo.indicadores.van;
    const vanPes = res[2].flujo.indicadores.van;
    expect(vanOpt).toBeGreaterThan(vanBase);
    expect(vanBase).toBeGreaterThan(vanPes);
  });
});

describe("esViable", () => {
  it("es false si el VAN es negativo", () => {
    const p = proyectoConDatosMinimos();
    const out = aplicarModificadores(p, DEFAULT_PESIMISTA);
    // Con datos minimos + pesimista probablemente queda no-viable.
    const flujo = compararEscenarios(p)[2].flujo;
    if (flujo.indicadores.van < 0) {
      expect(esViable(flujo)).toBe(false);
    }
    // Asegurar tipo del out (sanity check del aplicar)
    expect(out.productos[0].precios[0]).toBeLessThan(p.productos[0].precios[0]);
  });
});
