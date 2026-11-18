import { describe, it, expect } from "vitest";
import { calcularTIR } from "./calculo-financiero";

describe("calcularTIR sin raiz interpretable", () => {
  it("devuelve 0 (no un porcentaje espurio) cuando no hay raiz real", () => {
    // Flujos con positivos y negativos pero sin tasa que anule el VAN.
    expect(calcularTIR([-1000, 1000, -500])).toBe(0);
  });

  it("sigue calculando la TIR normal de un proyecto convencional", () => {
    const tir = calcularTIR([-1000, 600, 600]);
    expect(tir).toBeGreaterThan(0.12);
    expect(tir).toBeLessThan(0.14);
  });

  it("devuelve 0 si todos los flujos son negativos", () => {
    expect(calcularTIR([-100, -50, -20])).toBe(0);
  });
});
