import { describe, expect, it } from "vitest";
import { PLANTILLAS } from "./plantillas";
import {
  aplicarDecisionAEstado,
  aplicarOperacionDelTurno,
  calcularBaseProyecto,
  inicializarEstadoDesdeProyecto,
} from "./motor-eventos";
import type { Evento, OpcionDecision } from "@/types/evento";

const SOCIALES = ["postasalud", "capacitacion", "aguapotable"];
const crear = (clave: string) => PLANTILLAS.find((p) => p.clave === clave)!.crear();
const evento = { id: "e", codigo: "T", titulo: "t", modificadores: { variables_afectadas: [] } } as unknown as Evento;
const opcion = (consecuencias: Record<string, string | number>): OpcionDecision => ({
  letra: "A", texto: "", feedback_corto: "", consecuencias,
});

function correr(clave: string, meses: number, antes?: (e: any) => any) {
  const p = crear(clave);
  const base = calcularBaseProyecto(p);
  let e: any = inicializarEstadoDesdeProyecto(p);
  if (antes) e = antes(e);
  let minCaja = e.caja;
  for (let i = 0; i < meses; i++) {
    e = aplicarOperacionDelTurno(e, base, "mensual", i);
    minCaja = Math.min(minCaja, e.caja);
  }
  return { e, minCaja };
}

describe("proyectos sociales: los fondos financian y el beneficio no es plata", () => {
  it("solo los proyectos sociales tienen fondos y beneficio social", () => {
    for (const c of SOCIALES) expect(inicializarEstadoDesdeProyecto(crear(c)).presupuesto_multiplicador, c).toBe(1);
    expect(inicializarEstadoDesdeProyecto(crear("restaurante")).presupuesto_multiplicador).toBeUndefined();
    expect(inicializarEstadoDesdeProyecto(crear("solar")).presupuesto_multiplicador).toBeUndefined();
  });

  it("con los fondos completos la caja no se infla con el beneficio y el servicio llega a todos", () => {
    for (const c of SOCIALES) {
      const { e, minCaja } = correr(c, 60);
      const inicial = inicializarEstadoDesdeProyecto(crear(c)).caja;
      expect(e.caja, c).toBeLessThan(inicial * 3);
      expect(minCaja, c).toBeGreaterThanOrEqual(0);
      expect(e.beneficio_social_acumulado, c).toBeGreaterThan(0);
      expect(e.cobertura, c).toBeCloseTo(1, 5);
    }
  });

  it("un recorte del presupuesto consume la reserva", () => {
    const normal = correr("postasalud", 24).e;
    const recortado = correr("postasalud", 24, (e) => aplicarDecisionAEstado(e, evento, opcion({ presupuesto: "*0.6" }))).e;
    expect(recortado.caja).toBeLessThan(normal.caja);
  });

  it("un recorte fuerte y largo quiebra el proyecto: se queda sin fondos para operar", () => {
    const { e } = correr("postasalud", 60, (e) => aplicarDecisionAEstado(e, evento, opcion({ presupuesto: "*0.1" })));
    expect(e.caja).toBeLessThan(0);
  });

  it("más demanda de la que cabe encarece el servicio sin traer más fondos", () => {
    const normal = correr("postasalud", 12).e;
    const saturado = correr("postasalud", 12, (e) => ({ ...e, demanda_multiplicador: 1.4 })).e;
    expect(saturado.caja).toBeLessThan(normal.caja);
    expect(saturado.beneficio_social_acumulado).toBeGreaterThan(normal.beneficio_social_acumulado);
  });

  it("una simulación vieja sin fondos sigue funcionando", () => {
    const p = crear("postasalud");
    const { presupuesto_multiplicador, beneficio_social_acumulado, cobertura, ...viejo } = inicializarEstadoDesdeProyecto(p) as any;
    const e = aplicarOperacionDelTurno(viejo, calcularBaseProyecto(p), "mensual", 0);
    expect(Number.isFinite(e.caja)).toBe(true);
    expect(e.presupuesto_multiplicador).toBeUndefined();
  });
});
