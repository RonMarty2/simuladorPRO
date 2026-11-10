import { describe, expect, it } from "vitest";
import {
  familiaDeTipo,
  pasosVisiblesPorTipo,
  titulosCortosPorTipo,
  titulosPasosPorTipo,
} from "./pasos-por-tipo";

describe("pasos-por-tipo", () => {
  it("clasifica proyectos por su familia real", () => {
    expect(familiaDeTipo("comercio", "unidades")).toBe("comercio");
    expect(familiaDeTipo("marketing", "costo_beneficio")).toBe("costo_beneficio");
    expect(familiaDeTipo("suscripcion", "suscripcion")).toBe("suscripcion");
    expect(familiaDeTipo("turismo", "unidades")).toBe("ocupacion");
    expect(familiaDeTipo("produccion", "unidades")).toBe("produccion");
  });

  it("elimina pasos forzados en marketing y costo-beneficio (no pide costos de fábrica)", () => {
    const pasosMarketing = pasosVisiblesPorTipo("marketing", "costo_beneficio");
    expect(pasosMarketing).toEqual([1, 2, 3, 4, 6, 7, 9]);
    expect(pasosMarketing).not.toContain(5); // no pide costos de fábrica
    expect(pasosMarketing).not.toContain(8); // no pide inventario fabril
  });

  it("adapta los títulos de comercio con vocabulario de retail", () => {
    const titulos = titulosPasosPorTipo("comercio", "unidades");
    expect(titulos[5]).toContain("Costo de compra de mercadería");
    expect(titulos[8]).toContain("rotación de mercadería");
    const cortos = titulosCortosPorTipo("comercio", "unidades");
    expect(cortos[5]).toBe("Mercadería");
    expect(cortos[8]).toBe("Stock");
  });

  it("adapta los títulos de marketing con vocabulario de retorno y pauta", () => {
    const titulos = titulosPasosPorTipo("marketing", "costo_beneficio");
    expect(titulos[2]).toContain("Beneficio proyectado");
    expect(titulos[6]).toContain("Presupuesto operativo y pauta");
    expect(titulos[9]).toContain("ROI");
  });
});
