import { describe, expect, it } from "vitest";
import {
  familiaDeTipo,
  pasosVisiblesPorTipo,
  titulosCortosPorTipo,
  titulosPasosPorTipo,
  deducirTipoNegocio,
} from "./pasos-por-tipo";

describe("pasos-por-tipo", () => {
  it("clasifica proyectos por su familia real", () => {
    expect(familiaDeTipo("comercio", "unidades")).toBe("comercio");
    expect(familiaDeTipo("marketing", "costo_beneficio")).toBe("costo_beneficio");
    expect(familiaDeTipo("suscripcion", "suscripcion")).toBe("suscripcion");
    expect(familiaDeTipo("turismo", "unidades")).toBe("ocupacion");
    expect(familiaDeTipo("produccion", "unidades")).toBe("produccion");
  });

  it("deduce el tipo de negocio incluso en proyectos clonados sin tipoNegocio explícito", () => {
    expect(deducirTipoNegocio({ nombre: "Hostal boutique «Casa Andina» (mi copia)" })).toBe("turismo");
    expect(deducirTipoNegocio({ nombre: "Gimnasio «FitAndes» con membresías (mi copia)" })).toBe("suscripcion");
    expect(deducirTipoNegocio({ nombre: "Cámara de frío para una cooperativa frutícola (mi copia)" })).toBe("costo_beneficio");
    expect(deducirTipoNegocio({ nombre: "Fábrica de snacks andinos «AndeFoods» (mi copia)" })).toBe("produccion");
  });

  it("adapta la cantidad de pasos según la naturaleza del negocio", () => {
    // Suscripción: 7 pasos (omite producción e inventario)
    expect(pasosVisiblesPorTipo("suscripcion", "suscripcion")).toEqual([1, 2, 3, 4, 6, 7, 9]);

    // Costo-beneficio: 7 pasos (omite producción e inventario)
    expect(pasosVisiblesPorTipo("costo_beneficio", "costo_beneficio")).toEqual([1, 2, 3, 4, 6, 7, 9]);

    // Turismo / Ocupación: 8 pasos (omite costos de fábrica)
    expect(pasosVisiblesPorTipo("turismo", "unidades")).toEqual([1, 2, 3, 4, 6, 7, 8, 9]);

    // Servicios puros: 8 pasos (omite costos de fábrica)
    expect(pasosVisiblesPorTipo("servicios", "unidades")).toEqual([1, 2, 3, 4, 6, 7, 8, 9]);

    // Producción industrial: 9 pasos completos
    expect(pasosVisiblesPorTipo("produccion", "unidades")).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
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
