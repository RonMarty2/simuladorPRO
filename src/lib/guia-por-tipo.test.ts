import { describe, expect, it } from "vitest";
import { PLANTILLAS } from "./plantillas";
import { GUIA_POR_TIPO, SECTOR_POR_TIPO, terrenoAtipico } from "./guia-por-tipo";
import { diagnosticarProyecto } from "./diagnostico-pedagogico";
import { GUIA_EXTRA_POR_TIPO } from "./guia-extra-por-tipo";
import { construirFlujoCaja } from "./flujo-proyecto";

const terrenoDe = (p: ReturnType<(typeof PLANTILLAS)[number]["crear"]>) =>
  (p.inversiones.terreno ?? []).reduce((a, i) => a + i.costoTotal, 0);

describe("guía por tipo de negocio", () => {
  it("todas las categorías de la galería tienen guía y sector", () => {
    for (const cat of new Set(PLANTILLAS.map((p) => p.categoria))) {
      expect(GUIA_POR_TIPO[cat], cat).toBeDefined();
      expect(SECTOR_POR_TIPO[cat], cat).toBeDefined();
    }
  });

  it("ningún ejemplo compra terreno en un tipo donde no es usual", () => {
    for (const pl of PLANTILLAS) {
      const p = pl.crear();
      expect(terrenoAtipico(p.tipoNegocio, terrenoDe(p)), `${pl.clave} compra terreno siendo atípico`).toBeNull();
    }
  });

  it("el diagnóstico avisa si un proyecto compra terreno en un tipo donde no es usual", () => {
    const p = PLANTILLAS.find((x) => x.clave === "restaurante")!.crear();
    expect(diagnosticarProyecto(p).alertas.map((a) => a.id)).not.toContain("terreno_atipico");
    p.inversiones.terreno = [
      { id: "t", descripcion: "Terreno", unidadMedida: "m²", cantidad: 200, costoUnitario: 1200, costoTotal: 240000, vidaUtilAnios: null, depreciacionAnual: 0, valorResidual: 240000 },
    ];
    expect(diagnosticarProyecto(p).alertas.map((a) => a.id)).toContain("terreno_atipico");
  });

  it("en un tipo donde el terreno es usual no hay aviso", () => {
    const p = PLANTILLAS.find((x) => x.clave === "quinua")!.crear();
    expect(terrenoDe(p)).toBeGreaterThan(0);
    expect(diagnosticarProyecto(p).alertas.map((a) => a.id)).not.toContain("terreno_atipico");
  });

  it("cada tipo tiene guía de proyección, capital de trabajo y financiamiento", () => {
    for (const tipo of Object.keys(GUIA_POR_TIPO)) {
      const g = (GUIA_EXTRA_POR_TIPO as Record<string, { proyeccion: string[]; capital: string[]; financiamiento: string[] }>)[tipo];
      expect(g, tipo).toBeDefined();
      expect(g.proyeccion.length, tipo + " proyeccion").toBeGreaterThan(0);
      expect(g.capital.length, tipo + " capital").toBeGreaterThan(0);
      expect(g.financiamiento.length, tipo + " financiamiento").toBeGreaterThan(0);
    }
  });

  it("los ejemplos corregidos siguen siendo viables", () => {
    for (const clave of ["restaurante", "distribuidora"]) {
      const c: any = construirFlujoCaja(PLANTILLAS.find((x) => x.clave === clave)!.crear());
      expect(c.indicadores.van, clave).toBeGreaterThan(0);
    }
  });
});
