import { describe, it, expect } from "vitest";
import { calcularNotaFinal } from "./notas";

describe("calcularNotaFinal", () => {
  it("pondera individual y grupal con pesos 50/50", () => {
    const r = calcularNotaFinal({
      promedioIndividual: 80,
      notaGrupal: 60,
      pesoIndividual: 0.5,
      pesoGrupal: 0.5,
    });
    expect(r.final).toBe(70);
    expect(r.usaIndividual).toBe(true);
    expect(r.usaGrupal).toBe(true);
  });

  it("respeta pesos asimétricos 70/30", () => {
    const r = calcularNotaFinal({
      promedioIndividual: 90,
      notaGrupal: 50,
      pesoIndividual: 0.7,
      pesoGrupal: 0.3,
    });
    // 0.7*90 + 0.3*50 = 63 + 15 = 78
    expect(r.final).toBe(78);
  });

  it("si falta la nota grupal, usa solo la individual (renormaliza)", () => {
    const r = calcularNotaFinal({
      promedioIndividual: 85,
      notaGrupal: null,
      pesoIndividual: 0.6,
      pesoGrupal: 0.4,
    });
    expect(r.final).toBe(85);
    expect(r.usaGrupal).toBe(false);
  });

  it("si falta la individual, usa solo la grupal", () => {
    const r = calcularNotaFinal({
      promedioIndividual: null,
      notaGrupal: 72,
      pesoIndividual: 0.6,
      pesoGrupal: 0.4,
    });
    expect(r.final).toBe(72);
    expect(r.usaIndividual).toBe(false);
  });

  it("sin ninguna nota devuelve null", () => {
    const r = calcularNotaFinal({
      promedioIndividual: null,
      notaGrupal: null,
      pesoIndividual: 0.5,
      pesoGrupal: 0.5,
    });
    expect(r.final).toBeNull();
  });

  it("un peso en 0 anula esa parte", () => {
    const r = calcularNotaFinal({
      promedioIndividual: 40,
      notaGrupal: 90,
      pesoIndividual: 0,
      pesoGrupal: 1,
    });
    expect(r.final).toBe(90);
    expect(r.usaIndividual).toBe(false);
  });
});
