import { describe, expect, it } from "vitest";
import { PLANTILLAS } from "./plantillas";
import { indicadoresPorTipo, alertasDelTipo } from "./indicadores-por-tipo";
import { diagnosticarProyecto } from "./diagnostico-pedagogico";

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

  it("el microcrédito muestra margen, autosuficiencia y el efecto de duplicar la mora", () => {
    const panel = indicadoresPorTipo(crear("microcredito"));
    expect(panel).not.toBeNull();
    expect(ids(panel)).toEqual(
      expect.arrayContaining(["ingreso-credito", "margen-financiero", "autosuficiencia", "mora-doble", "creditos-por-oficial", "rentabilidad-capital"])
    );
  });

  it("sin costos de mora no aparece el indicador de mora doble", () => {
    const p = crear("microcredito");
    p.costosDirectos = p.costosDirectos.filter((c) => !/mora|previsi/i.test(c.descripcion));
    expect(ids(indicadoresPorTipo(p))).not.toContain("mora-doble");
  });

  it("todas las plantillas de microcrédito calculan sin errores", () => {
    for (const pl of PLANTILLAS.filter((x) => x.categoria === "microcredito")) {
      const panel = indicadoresPorTipo(pl.crear());
      expect(panel, pl.clave).not.toBeNull();
      for (const i of panel!.indicadores) expect(i.valor + i.detalle, pl.clave + i.id).not.toMatch(/NaN|Infinity/);
    }
  });

  it("la posta de salud muestra costo por beneficiario y razón beneficio-costo", () => {
    const panel = indicadoresPorTipo(crear("postasalud"));
    expect(panel).not.toBeNull();
    expect(ids(panel)).toEqual(
      expect.arrayContaining(["costo-beneficiario", "costo-beneficiario-total", "beneficio-beneficiario", "razon-beneficio-costo", "gasto-recurrente", "meses-operacion"])
    );
  });

  it("sin beneficiarios no aparecen los indicadores por beneficiario", () => {
    const p = crear("postasalud");
    delete p.beneficiarios;
    const lista = ids(indicadoresPorTipo(p));
    expect(lista).not.toContain("costo-beneficiario");
    expect(lista).toContain("razon-beneficio-costo");
  });

  it("todas las plantillas sociales calculan sin errores", () => {
    const sociales = PLANTILLAS.filter((x) => x.categoria === "social");
    expect(sociales.length).toBeGreaterThan(0);
    for (const pl of sociales) {
      const panel = indicadoresPorTipo(pl.crear());
      expect(panel, pl.clave).not.toBeNull();
      for (const i of panel!.indicadores) expect(i.valor + i.detalle, pl.clave + i.id).not.toMatch(/NaN|Infinity/);
    }
  });

  it("el edificio muestra ocupación, NOI, rendimiento y cobertura de la cuota", () => {
    const panel = indicadoresPorTipo(crear("edificio"));
    expect(panel).not.toBeNull();
    const lista = ids(panel);
    expect(lista.filter((i) => i.startsWith("ocupacion-")).length).toBe(2);
    expect(lista).toEqual(expect.arrayContaining(["noi", "rendimiento-inversion", "cobertura-cuota", "ventas-equilibrio", "meses-reserva"]));
  });

  it("una ocupación sobre el 100% se marca como crítica en alquiler", () => {
    const p = crear("edificio");
    p.productos[0].capacidadAnual = 50;
    const panel = indicadoresPorTipo(p)!;
    expect(panel.indicadores.find((i) => i.id === "ocupacion-" + p.productos[0].id)!.severidad).toBe("critico");
  });

  it("todas las plantillas de alquiler calculan sin errores", () => {
    const lista = PLANTILLAS.filter((x) => x.categoria === "alquiler");
    expect(lista.length).toBeGreaterThan(0);
    for (const pl of lista) {
      const panel = indicadoresPorTipo(pl.crear());
      expect(panel, pl.clave).not.toBeNull();
      for (const i of panel!.indicadores) expect(i.valor + i.detalle, pl.clave + i.id).not.toMatch(/NaN|Infinity/);
    }
  });

  it("el restaurante muestra márgenes, mezcla, equilibrio e inventario", () => {
    const panel = indicadoresPorTipo(crear("restaurante"));
    expect(panel).not.toBeNull();
    expect(panel!.titulo).toContain("gastronomía");
    expect(ids(panel)).toEqual(
      expect.arrayContaining(["margen-contribucion", "mezcla-ventas", "mejor-margen", "ventas-equilibrio", "margen-operativo", "peso-personal", "inventario"])
    );
  });

  it("cada rubro de productos usa su propio título", () => {
    expect(indicadoresPorTipo(crear("distribuidora"))!.titulo).toContain("comercio");
    expect(indicadoresPorTipo(crear("fabrica"))!.titulo).toContain("producción");
  });

  it("todas las plantillas de gastronomía, producción y comercio calculan sin errores", () => {
    const lista = PLANTILLAS.filter((x) => ["gastronomia", "produccion", "comercio"].includes(x.categoria));
    expect(lista.length).toBeGreaterThan(10);
    for (const pl of lista) {
      const panel = indicadoresPorTipo(pl.crear());
      expect(panel, pl.clave).not.toBeNull();
      for (const i of panel!.indicadores) expect(i.valor + i.detalle, pl.clave + i.id).not.toMatch(/NaN|Infinity/);
    }
  });

  it("el colegio muestra la caja de los 2 meses sin pensión y la morosidad", () => {
    const panel = indicadoresPorTipo(crear("colegio"));
    expect(panel!.titulo).toContain("educación privada");
    expect(ids(panel)).toEqual(expect.arrayContaining(["meses-sin-pension", "morosidad-10", "ventas-menos-20", "recuperacion-simple"]));
  });

  it("la franquicia muestra la regalía sobre las ventas", () => {
    const panel = indicadoresPorTipo(crear("franquicia"));
    expect(panel!.titulo).toContain("franquicia");
    expect(ids(panel)).toContain("regalias");
  });

  it("servicios, tecnología y concesión tienen su panel", () => {
    expect(indicadoresPorTipo(crear("consultora"))!.titulo).toContain("servicios");
    expect(ids(indicadoresPorTipo(crear("consultora")))).toContain("cobranza");
    expect(indicadoresPorTipo(crear("appdelivery"))!.titulo).toContain("tecnología");
    expect(ids(indicadoresPorTipo(crear("appdelivery")))).toContain("resultado-anio5");
    expect(ids(indicadoresPorTipo(crear("concesionagua")))).toContain("cobertura-cuota");
  });

  it("todas las plantillas de los rubros generales calculan sin errores", () => {
    const rubros = ["gastronomia", "produccion", "comercio", "servicios", "tecnologia", "educacion_privada", "franquicia", "concesion"];
    const lista = PLANTILLAS.filter((x) => rubros.includes(x.categoria) && x.modelo !== "costo_beneficio");
    for (const pl of lista) {
      const p = pl.crear();
      const panel = indicadoresPorTipo(p);
      // un SaaS (suscripción) o un costo-beneficio no usa este panel
      if (!panel) continue;
      for (const i of panel.indicadores) expect(i.valor + i.detalle, pl.clave + i.id).not.toMatch(/NaN|Infinity/);
    }
  });

  it("el ahorro y el marketing muestran su prueba de estrés propia", () => {
    const ahorro = indicadoresPorTipo(crear("solar"));
    expect(ahorro!.titulo).toContain("ahorro");
    expect(ids(ahorro)).toEqual(expect.arrayContaining(["beneficio-esperado", "costo-de-operar", "beneficio-neto", "ahorro-70", "razon-beneficio-costo"]));
    const mkt = indicadoresPorTipo(crear("campanatv"));
    expect(mkt!.titulo).toContain("marketing");
    expect(ids(mkt)).toContain("ventas-adicionales-50");
  });

  it("los medios muestran audiencia de equilibrio y el efecto de un CPM menor", () => {
    const panel = indicadoresPorTipo(crear("medio"));
    expect(panel!.titulo).toContain("medios");
    expect(ids(panel)).toEqual(expect.arrayContaining(["ingreso-por-usuario", "audiencia-equilibrio", "cpm-menos-30", "resultado-anio5", "meses-caja"]));
  });

  it("agricultura y eventos tienen su panel", () => {
    expect(ids(indicadoresPorTipo(crear("quinua")))).toEqual(expect.arrayContaining(["campana-6-meses", "precio-menos-30", "sequia-menos-40"]));
    expect(ids(indicadoresPorTipo(crear("festival")))).toContain("caja-antes-del-evento");
  });

  it("todas las plantillas tienen panel y calculan sin errores", () => {
    for (const pl of PLANTILLAS) {
      const panel = indicadoresPorTipo(pl.crear());
      expect(panel, pl.clave).not.toBeNull();
      for (const i of panel!.indicadores) expect(i.valor + i.detalle, pl.clave + i.id).not.toMatch(/NaN|Infinity/);
    }
  });

  it("los indicadores en rojo con los números del alumno llegan al diagnóstico", () => {
    const p = crear("appdelivery");
    const alertas = alertasDelTipo(p);
    expect(alertas.length).toBeGreaterThan(0);
    const diag = diagnosticarProyecto(p);
    for (const a of alertas) expect(diag.alertas.map((x) => x.id)).toContain(a.id);
  });

  it("los escenarios ilustrativos no entran al diagnóstico", () => {
    for (const pl of PLANTILLAS) {
      for (const a of alertasDelTipo(pl.crear())) {
        expect(a.id, pl.clave).not.toMatch(/cobranza|inventario|sequia|precio-menos|cpm-menos|ahorro-70|mora-doble|morosidad-10|campana|antes-del-evento/);
      }
    }
  });

  it("un ejemplo sano no suma alertas del tipo", () => {
    expect(alertasDelTipo(crear("hostal")).every((a) => a.id.startsWith("tipo_"))).toBe(true);
  });

  it("todas las plantillas de turismo calculan sin errores", () => {
    for (const pl of PLANTILLAS.filter((x) => x.categoria === "turismo")) {
      const panel = indicadoresPorTipo(pl.crear());
      expect(panel, pl.clave).not.toBeNull();
      for (const i of panel!.indicadores) expect(i.valor).not.toMatch(/NaN|Infinity/);
    }
  });
});
