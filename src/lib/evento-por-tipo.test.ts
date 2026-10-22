import { describe, it, expect } from "vitest";
import { eventoAplicaAProyecto } from "./motor-eventos";
import { PLANTILLAS } from "./plantillas";

describe("eventoAplicaAProyecto", () => {
  it("los eventos generales llegan a todos", () => {
    expect(eventoAplicaAProyecto(["todos"], "servicios", undefined)).toBe(true);
  });

  it("sin marca de tipo se filtra por sector como siempre", () => {
    expect(eventoAplicaAProyecto(["comercio"], "comercio", "turismo")).toBe(true);
    expect(eventoAplicaAProyecto(["comercio"], "servicios", "turismo")).toBe(false);
  });

  it("un evento de tipo solo llega a ese tipo, sin importar el sector", () => {
    expect(eventoAplicaAProyecto(["tipo:turismo"], "servicios", "turismo")).toBe(true);
    expect(eventoAplicaAProyecto(["tipo:turismo"], "servicios", "gastronomia")).toBe(false);
  });

  it("un proyecto sin tipo no recibe eventos de tipo (retro-compat)", () => {
    expect(eventoAplicaAProyecto(["tipo:turismo"], "servicios", undefined)).toBe(false);
  });
});

describe("plantillas con tipo de negocio", () => {
  it("todas las plantillas salen marcadas con su categoría", () => {
    for (const pl of PLANTILLAS) {
      expect(pl.crear().tipoNegocio).toBe(pl.categoria);
    }
  });
});
