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
    expect(indicadoresPorTipo(crear("colegio"))).toBeNull();
  });

  it("el gimnasio muestra los indicadores de suscripción", () => {
    const panel = indicadoresPorTipo(crear("gimnasio"));
    expect(panel).not.toBeNull();
    expect(ids(panel)).toEqual(
      expect.arrayContaining(["mrr", "arpu", "churn", "cac", "recuperacion-cac", "ltv-cac", "base-equilibrio"])
    );
  });

  it("todas las plantillas de suscripción calculan sin errores", () => {
    for (const pl of PLANTILLAS.filter((x) => x.categoria === "suscripcion")) {
      const panel = indicadoresPorTipo(pl.crear());
      expect(panel, pl.clave).not.toBeNull();
      for (const i of panel!.indicadores) expect(i.valor + i.detalle, pl.clave + i.id).not.toMatch(/NaN|Infinity/);
    }
  });

  it("bajas muy altas hacen que la base nunca llegue al equilibrio", () => {
    const p = crear("gimnasio");
    p.suscripcionV2!.churnMensual = 0.4;
    const panel = indicadoresPorTipo(p)!;
    expect(panel.indicadores.find((i) => i.id === "base-equilibrio")!.severidad).toBe("critico");
  });

  it("la clínica muestra ocupación por línea, ventas de equilibrio y cobranza", () => {
    const panel = indicadoresPorTipo(crear("clinica"));
    expect(panel).not.toBeNull();
    const lista = ids(panel);
    expect(lista.filter((i) => i.startsWith("ocupacion-")).length).toBe(3);
    expect(lista).toEqual(expect.arrayContaining(["mezcla-servicios", "ventas-equilibrio", "honorarios", "cobranza", "meses-caja"]));
    const cobranza = panel!.indicadores.find((i) => i.id === "cobranza")!;
    expect(["advertencia", "critico"]).toContain(cobranza.severidad);
  });

  it("una línea que supera su capacidad se marca como crítica", () => {
    const p = crear("clinica");
    p.productos[2].capacidadAnual = 500;
    const panel = indicadoresPorTipo(p)!;
    const linea = panel.indicadores.find((i) => i.id === "ocupacion-" + p.productos[2].id)!;
    expect(linea.severidad).toBe("critico");
  });

  it("todas las plantillas de salud privada calculan sin errores", () => {
    for (const pl of PLANTILLAS.filter((x) => x.categoria === "salud_privada")) {
      const panel = indicadoresPorTipo(pl.crear());
      expect(panel, pl.clave).not.toBeNull();
      for (const i of panel!.indicadores) expect(i.valor + i.detalle, pl.clave + i.id).not.toMatch(/NaN|Infinity/);
    }
  });

  it("todas las plantillas de turismo calculan sin errores", () => {
    for (const pl of PLANTILLAS.filter((x) => x.categoria === "turismo")) {
      const panel = indicadoresPorTipo(pl.crear());
      expect(panel, pl.clave).not.toBeNull();
      for (const i of panel!.indicadores) expect(i.valor).not.toMatch(/NaN|Infinity/);
    }
  });
});
