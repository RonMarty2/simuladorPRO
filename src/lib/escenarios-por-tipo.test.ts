import { describe, expect, it } from "vitest";
import { PLANTILLAS } from "./plantillas";
import { GUIA_POR_TIPO } from "./guia-por-tipo";
import { compararEscenarios } from "./escenarios";
import { ESCENARIOS_POR_TIPO, resolverEscenarios, resumenCambios } from "./escenarios-por-tipo";

describe("escenarios por tipo de negocio", () => {
  it("todos los tipos tienen sus escenarios", () => {
    for (const tipo of Object.keys(GUIA_POR_TIPO)) {
      expect(ESCENARIOS_POR_TIPO[tipo], tipo).toBeDefined();
    }
  });

  it("el pesimista de cada plantilla es peor que el base y el optimista es mejor", () => {
    for (const pl of PLANTILLAS) {
      const p = pl.crear();
      const { optimista, pesimista } = resolverEscenarios(null, p.tipoNegocio);
      const [opt, base, pes] = compararEscenarios(p, optimista, pesimista);
      expect(pes.flujo.indicadores.van, pl.clave + " pesimista < base").toBeLessThan(base.flujo.indicadores.van);
      expect(opt.flujo.indicadores.van, pl.clave + " optimista > base").toBeGreaterThan(base.flujo.indicadores.van);
    }
  });

  it("lo que configura el docente para el curso gana sobre el tipo", () => {
    const r = resolverEscenarios({ pesimista: { demandaMul: 0.5 } }, "turismo");
    expect(r.pesimista.demandaMul).toBe(0.5);
    expect(r.pesimista.precioMul).toBe(0.92);
  });

  it("sin tipo se usan los escenarios genéricos", () => {
    const r = resolverEscenarios(null, undefined);
    expect(r.delTipo).toBeNull();
    expect(r.pesimista.demandaMul).toBe(0.75);
  });

  it("el resumen de cambios es legible", () => {
    const r = resolverEscenarios(null, "agricultura");
    expect(resumenCambios(r.pesimista)).toMatch(/Ventas \(cantidades\) -40%/);
  });
});
