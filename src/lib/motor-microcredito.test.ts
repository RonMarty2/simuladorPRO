import { describe, expect, it } from "vitest";
import { PLANTILLAS } from "./plantillas";
import {
  aplicarDecisionAEstado,
  aplicarOperacionDelTurno,
  calcularBaseProyecto,
  construirPlanMora,
  inicializarEstadoDesdeProyecto,
} from "./motor-eventos";
import { construirFlujoCaja } from "./flujo-proyecto";
import type { Evento, OpcionDecision } from "@/types/evento";

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
  for (let i = 0; i < meses; i++) e = aplicarOperacionDelTurno(e, base, "mensual", i);
  return { e, p };
}

describe("microcrédito: la mora es una variable viva", () => {
  it("arranca con la mora del plan (5,2%) y solo en microcrédito", () => {
    const e = inicializarEstadoDesdeProyecto(crear("microcredito"));
    expect(e.mora_multiplicador).toBe(1);
    expect(e.mora_base).toBeCloseTo(0.052, 3);
    expect(inicializarEstadoDesdeProyecto(crear("restaurante")).mora_multiplicador).toBeUndefined();
    expect(construirPlanMora(crear("restaurante"))).toBeNull();
  });

  it("sin eventos reproduce el plan: ingresos del año 1 igual al constructor y la mora no se mueve", () => {
    const { e, p } = correr("microcredito", 12);
    const plan: any = construirFlujoCaja(p);
    expect(e.ingresos_acumulados).toBeCloseTo(plan.ingresos[0], 0);
    expect(e.mora_multiplicador).toBeCloseTo(1, 5);
  });

  it("un evento que duplica la mora hace perder plata frente al plan", () => {
    const normal = correr("microcredito", 12).e;
    const peor = correr("microcredito", 12, (e) => aplicarDecisionAEstado(e, evento, opcion({ mora: "*2" }))).e;
    expect(peor.mora_multiplicador).toBeGreaterThan(1.5);
    expect(peor.caja).toBeLessThan(normal.caja);
  });

  it("crecer demasiado rápido deteriora la cartera con los meses", () => {
    const apurado = correr("microcredito", 12, (e) => ({ ...e, demanda_multiplicador: 1.4 })).e;
    expect(apurado.mora_multiplicador).toBeGreaterThan(1.1);
  });

  it("perder reputación sube la mora", () => {
    const mala = correr("microcredito", 12, (e) => ({ ...e, reputacion: 0.1 })).e;
    expect(mala.mora_multiplicador).toBeGreaterThan(1.1);
  });

  it("la mora se recupera despacio cuando el problema pasa", () => {
    const { e } = correr("microcredito", 24, (e) => aplicarDecisionAEstado(e, evento, opcion({ mora: "*2" })));
    expect(e.mora_multiplicador).toBeLessThan(1.5);
    expect(e.mora_multiplicador).toBeGreaterThan(1);
  });

  it("una simulación vieja sin mora sigue funcionando", () => {
    const p = crear("microcredito");
    const { mora_multiplicador, mora_base, ...viejo } = inicializarEstadoDesdeProyecto(p) as any;
    const e = aplicarOperacionDelTurno(viejo, calcularBaseProyecto(p), "mensual", 0);
    expect(Number.isFinite(e.caja)).toBe(true);
    expect(e.mora_multiplicador).toBeUndefined();
  });
});
