import { describe, expect, it } from "vitest";
import { PLANTILLAS } from "./plantillas";
import { indicadoresPorTipo } from "./indicadores-por-tipo";

const crear = (clave: string) => PLANTILLAS.find((p) => p.clave === clave)!.crear();
const ids = (p: ReturnType<typeof indicadoresPorTipo>) => p?.indicadores.map((i) => i.id) ?? [];

describe("indicadores propios por tipo", () => {
  it("el hostal muestra ocupación realista y ocupación de equilibrio", () => {
    const panel = indicadoresPorTipo(crear("hostal"));
    expect(panel).not.toBeNull();
    expect(ids(panel)).toEqual(
      expect.arrayContaining(["tarifa-promedio", "ocupacion", "ocupacion-anio5", "revpar", "ocupacion-equilibrio", "meses-caja"])
    );
    const ocup = panel!.indicadores.find((i) => i.id === "ocupacion")!;
    expect(ocup.valor).toMatch(/^(6\d|7\d),?\d*%$/);
    const eq = panel!.indicadores.find((i) => i.id === "ocupacion-equilibrio")!;
    expect(eq.severidad).not.toBe("critico");
  });

  it("sin capacidad no aparecen los indicadores de ocupación", () => {
    const p = crear("hostal");
    delete p.capacidadAnual;
    const panel = indicadoresPorTipo(p);
    expect(ids(panel)).toContain("tarifa-promedio");
    expect(ids(panel)).not.toContain("ocupacion");
    expect(ids(panel)).not.toContain("revpar");
  });

  it("una ocupación mayor al 100% se marca como crítica", () => {
    const p = crear("hostal");
    p.capacidadAnual = 1000;
    const ocup = indicadoresPorTipo(p)!.indicadores.find((i) => i.id === "ocupacion")!;
    expect(ocup.severidad).toBe("critico");
  });

  it("los tipos sin panel devuelven null", () => {
    expect(indicadoresPorTipo(crear("restaurante"))).toBeNull();
    expect(indicadoresPorTipo(crear("clinica"))).toBeNull();
  });

  it("todas las plantillas de turismo calculan sin errores", () => {
    for (const pl of PLANTILLAS.filter((x) => x.categoria === "turismo")) {
      const panel = indicadoresPorTipo(pl.crear());
      expect(panel, pl.clave).not.toBeNull();
      for (const i of panel!.indicadores) expect(i.valor).not.toMatch(/NaN|Infinity/);
    }
  });
});
