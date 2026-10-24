import { describe, expect, it } from "vitest";
import { PLANTILLAS } from "./plantillas";
import {
  aplicarDecisionAEstado,
  aplicarOperacionDelTurno,
  calcularBaseProyecto,
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

describe("costo-beneficio y marketing: el beneficio logrado puede quedar corto", () => {
  it("solo los proyectos de beneficio incremental tienen eficacia", () => {
    for (const c of ["solar", "camarafrio", "seguridad", "marketingresto", "campanatv"]) {
      expect(inicializarEstadoDesdeProyecto(crear(c)).eficacia_multiplicador, c).toBe(1);
    }
    expect(inicializarEstadoDesdeProyecto(crear("restaurante")).eficacia_multiplicador).toBeUndefined();
    expect(inicializarEstadoDesdeProyecto(crear("postasalud")).eficacia_multiplicador).toBeUndefined();
  });

  it("sin eventos reproduce el plan", () => {
    for (const c of ["solar", "camarafrio", "marketingresto"]) {
      const { e, p } = correr(c, 12);
      const plan: any = construirFlujoCaja(p);
      expect(e.ingresos_acumulados, c).toBeCloseTo(plan.ingresos[0], 0);
    }
  });

  it("si el ahorro real es 40% menor, entra menos plata", () => {
    const normal = correr("camarafrio", 12).e;
    const corto = correr("camarafrio", 12, (e) => aplicarDecisionAEstado(e, evento, opcion({ ahorro: "*0.6" }))).e;
    expect(corto.ingresos_acumulados).toBeLessThan(normal.ingresos_acumulados);
  });

  it("el beneficio se va recuperando si el problema se corrige", () => {
    const { e } = correr("camarafrio", 24, (e) => aplicarDecisionAEstado(e, evento, opcion({ ahorro: "*0.5" })));
    expect(e.eficacia_multiplicador).toBeGreaterThan(0.9);
  });

  it("una simulación vieja sin eficacia sigue funcionando", () => {
    const p = crear("solar");
    const { eficacia_multiplicador, ...viejo } = inicializarEstadoDesdeProyecto(p) as any;
    const e = aplicarOperacionDelTurno(viejo, calcularBaseProyecto(p), "mensual", 0);
    expect(Number.isFinite(e.caja)).toBe(true);
    expect(e.eficacia_multiplicador).toBeUndefined();
  });
});
