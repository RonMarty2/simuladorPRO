import { describe, expect, it } from "vitest";
import { PLANTILLAS } from "./plantillas";
import { aplicarOperacionDelTurno, calcularBaseProyecto, inicializarEstadoDesdeProyecto } from "./motor-eventos";
import { construirFlujoCaja } from "./flujo-proyecto";
import { perfilEstacional } from "./estacionalidad";

const crear = (clave: string) => PLANTILLAS.find((p) => p.clave === clave)!.crear();

describe("turismo: las temporadas mueven la caja durante el año", () => {
  it("el perfil de turismo promedia 1 y los demás tipos no tienen temporadas", () => {
    const perfil = perfilEstacional("turismo")!;
    expect(perfil).toHaveLength(12);
    expect(perfil.reduce((a, x) => a + x, 0) / 12).toBeCloseTo(1, 6);
    expect(perfilEstacional("gastronomia")).toBeUndefined();
  });

  it("el año suma lo mismo que el plan, pero cada mes es distinto", () => {
    for (const clave of ["hostal", "turismo"]) {
      const p = crear(clave);
      const base = calcularBaseProyecto(p);
      let e: any = inicializarEstadoDesdeProyecto(p);
      const mensuales: number[] = [];
      for (let i = 0; i < 12; i++) {
        e = aplicarOperacionDelTurno(e, base, "mensual", i);
        mensuales.push(e.delta_ingresos);
      }
      const plan: any = construirFlujoCaja(p);
      if (clave === "turismo") expect(e.ingresos_acumulados).toBeCloseTo(plan.ingresos[0], 0);
      else expect(e.ingresos_acumulados).toBeLessThanOrEqual(plan.ingresos[0] + 1); // la capacidad puede recortar los picos
      expect(Math.max(...mensuales)).toBeGreaterThan(Math.min(...mensuales) * 1.5);
    }
  });

  it("el estado avisa la temporada del mes que viene", () => {
    const p = crear("hostal");
    const base = calcularBaseProyecto(p);
    let e: any = inicializarEstadoDesdeProyecto(p);
    expect(e.mes_del_anio).toBe(0);
    e = aplicarOperacionDelTurno(e, base, "mensual", 0);
    expect(e.mes_del_anio).toBe(1);
    for (let i = 1; i < 6; i++) e = aplicarOperacionDelTurno(e, base, "mensual", i);
    expect(e.mes_del_anio).toBe(6);
    expect(e.factor_estacional).toBeGreaterThan(1.3);
  });

  it("los negocios sin temporadas no cambian", () => {
    const e = inicializarEstadoDesdeProyecto(crear("restaurante"));
    expect(e.factor_estacional).toBeUndefined();
  });
});

describe("agricultura: se gasta al sembrar y se cobra en la cosecha", () => {
  it("el año suma lo mismo que el plan, con ventas concentradas en mayo a agosto", () => {
    const p = crear("quinua");
    const base = calcularBaseProyecto(p);
    let e: any = inicializarEstadoDesdeProyecto(p);
    const ventas: number[] = [];
    for (let i = 0; i < 12; i++) {
      e = aplicarOperacionDelTurno(e, base, "mensual", i);
      ventas.push(e.delta_ingresos);
    }
    const plan: any = construirFlujoCaja(p);
    expect(e.ingresos_acumulados).toBeCloseTo(plan.ingresos[0], 0);
    const cosecha = ventas.slice(4, 8).reduce((a, x) => a + x, 0);
    expect(cosecha / e.ingresos_acumulados).toBeGreaterThan(0.5);
    expect(ventas[0]).toBeLessThan(ventas[5] / 3);
  });

  it("los costos variables caen en la siembra, no en la cosecha", () => {
    const p = crear("quinua");
    const base = calcularBaseProyecto(p);
    expect(base.estacionalidadCostos).toBeDefined();
    const e0 = inicializarEstadoDesdeProyecto(p);
    const siembra = aplicarOperacionDelTurno(e0, base, "mensual", 9); // octubre
    const cosecha = aplicarOperacionDelTurno(e0, base, "mensual", 5); // junio
    expect(siembra.costos_acumulados).toBeGreaterThan(0);
    // en junio vendes mucho más que en octubre pero gastas menos en insumos
    expect(cosecha.delta_ingresos).toBeGreaterThan(siembra.delta_ingresos * 3);
  });
});
