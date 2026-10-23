import { describe, expect, it } from "vitest";
import { PLANTILLAS } from "./plantillas";
import {
  aplicarDecisionAEstado,
  aplicarOperacionDelTurno,
  calcularBaseProyecto,
  factorReputacion,
  inicializarEstadoDesdeProyecto,
} from "./motor-eventos";
import type { Evento, OpcionDecision } from "@/types/evento";

const crear = (clave: string) => PLANTILLAS.find((p) => p.clave === clave)!.crear();
const opcion = (consecuencias: Record<string, string | number>): OpcionDecision => ({
  letra: "A",
  texto: "",
  feedback_corto: "",
  consecuencias,
});

describe("reputación, capacidad y cobranza en la simulación", () => {
  it("la reputación mueve la demanda: 50% es neutral, 100% suma y 0% resta", () => {
    expect(factorReputacion(0.5)).toBe(1);
    expect(factorReputacion(1)).toBe(1.5);
    expect(factorReputacion(0)).toBe(0.5);
  });

  it("con peor reputación se vende menos y entra menos caja", () => {
    const p = crear("restaurante");
    const base = calcularBaseProyecto(p);
    const e0 = inicializarEstadoDesdeProyecto(p);
    const buena = aplicarOperacionDelTurno({ ...e0, reputacion: 0.8 }, base, "mensual", 0);
    const mala = aplicarOperacionDelTurno({ ...e0, reputacion: 0.2 }, base, "mensual", 0);
    expect(buena.delta_ingresos).toBeGreaterThan(mala.delta_ingresos);
    expect(buena.delta_caja).toBeGreaterThan(mala.delta_caja);
  });

  it("con la reputación inicial (50%) la operación no cambia respecto de lo planeado", () => {
    const p = crear("restaurante");
    const base = calcularBaseProyecto(p);
    const e = aplicarOperacionDelTurno(inicializarEstadoDesdeProyecto(p), base, "mensual", 0);
    expect(e.delta_ingresos).toBeCloseTo(base.porAnio![0].ingresos / 12, 0);
  });

  it("la capacidad pone tope a las ventas aunque un evento dispare la demanda", () => {
    const p = crear("hostal");
    const base = calcularBaseProyecto(p);
    expect(base.limiteDemanda).toBeDefined();
    const e0 = inicializarEstadoDesdeProyecto(p);
    const disparada = aplicarOperacionDelTurno({ ...e0, demanda_multiplicador: 5 }, base, "mensual", 0);
    const tope = aplicarOperacionDelTurno({ ...e0, demanda_multiplicador: base.limiteDemanda![0] }, base, "mensual", 0);
    expect(disparada.delta_ingresos).toBeCloseTo(tope.delta_ingresos, 0);
    // Y es bastante más que lo planeado, pero no 5 veces
    const planeado = aplicarOperacionDelTurno(e0, base, "mensual", 0);
    expect(disparada.delta_ingresos).toBeGreaterThan(planeado.delta_ingresos);
    expect(disparada.delta_ingresos).toBeLessThan(planeado.delta_ingresos * 2);
  });

  it("un proyecto sin capacidad declarada no tiene tope", () => {
    expect(calcularBaseProyecto(crear("restaurante")).limiteDemanda).toBeUndefined();
  });

  it("la clínica parte cobrando a 60 días y retiene una parte de lo vendido", () => {
    const p = crear("clinica");
    const e0 = inicializarEstadoDesdeProyecto(p);
    expect(e0.dias_cobro).toBe(60);
    const base = calcularBaseProyecto(p);
    const e1 = aplicarOperacionDelTurno(e0, base, "mensual", 0);
    expect(e1.cuentas_por_cobrar).toBeGreaterThan(0);
    // lo que entra a caja es menos que lo vendido
    expect(e1.delta_caja).toBeLessThan(
      aplicarOperacionDelTurno({ ...e0, dias_cobro: 30 }, base, "mensual", 0).delta_caja
    );
  });

  it("con cobro a 30 días o menos no hay cuentas por cobrar", () => {
    const p = crear("restaurante");
    const e1 = aplicarOperacionDelTurno(inicializarEstadoDesdeProyecto(p), calcularBaseProyecto(p), "mensual", 0);
    expect(e1.cuentas_por_cobrar).toBe(0);
  });

  it("un evento puede alargar o acortar los días de cobro, también en simulaciones viejas", () => {
    const evento = { titulo: "x" } as Evento;
    const vieja: any = { ...inicializarEstadoDesdeProyecto(crear("restaurante")) };
    delete vieja.dias_cobro;
    delete vieja.cuentas_por_cobrar;
    expect(aplicarDecisionAEstado(vieja, evento, opcion({ dias_cobro: "+30" })).dias_cobro).toBe(60);
    expect(aplicarDecisionAEstado(vieja, evento, opcion({ dias_cobro: "-20" })).dias_cobro).toBe(10);
    expect(aplicarDecisionAEstado(vieja, evento, opcion({ dias_cobro: "+500" })).dias_cobro).toBe(180);
    // y la operación de una simulación vieja sigue funcionando sin números raros
    const op = aplicarOperacionDelTurno(vieja, calcularBaseProyecto(crear("restaurante")), "mensual", 0);
    expect(Number.isFinite(op.caja)).toBe(true);
  });

  it("ningún ejemplo viable quiebra en 60 meses sin eventos aunque cobre a crédito", () => {
    for (const pl of PLANTILLAS) {
      const p = pl.crear();
      const base = calcularBaseProyecto(p);
      let e = inicializarEstadoDesdeProyecto(p);
      let minimo = e.caja;
      for (let i = 0; i < 60; i++) {
        e = aplicarOperacionDelTurno(e, base, "mensual", i);
        minimo = Math.min(minimo, e.caja);
        expect(Number.isFinite(e.caja), pl.clave).toBe(true);
      }
      if (pl.veredicto !== "rechazo") expect(minimo, pl.clave + " caja mínima").toBeGreaterThanOrEqual(0);
    }
  });
});
