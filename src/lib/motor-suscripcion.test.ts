import { describe, expect, it } from "vitest";
import { PLANTILLAS } from "./plantillas";
import {
  aplicarDecisionAEstado,
  aplicarOperacionDelTurno,
  calcularBaseProyecto,
  construirPlanSocios,
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
  return { e, p, base };
}

describe("suscripción: los socios son una variable viva", () => {
  it("un negocio de suscripción arranca con socios; uno de productos no", () => {
    expect(inicializarEstadoDesdeProyecto(crear("gimnasio")).socios).toBeGreaterThan(0);
    expect(inicializarEstadoDesdeProyecto(crear("restaurante")).socios).toBeUndefined();
  });

  it("sin eventos ni decisiones reproduce el plan: ingresos del año 1 igual al constructor", () => {
    for (const clave of ["gimnasio", "academia", "podcast", "coworking", "saas"]) {
      const { e, p } = correr(clave, 12);
      const plan: any = construirFlujoCaja(p);
      expect(e.ingresos_acumulados, clave).toBeCloseTo(plan.ingresos[0], 0);
    }
  });

  it("sin eventos los socios siguen el plan", () => {
    const { e, p } = correr("gimnasio", 24);
    const plan = construirPlanSocios(p)!;
    expect(e.socios).toBeCloseTo(plan.sociosPlan[24], 0);
  });

  it("subir el precio 20% hace que se vayan más socios que en el plan", () => {
    const normal = correr("gimnasio", 18).e;
    const caro = correr("gimnasio", 18, (e) => ({ ...e, precio_venta_multiplicador: 1.2 })).e;
    expect(caro.socios).toBeLessThan(normal.socios);
  });

  it("un evento que sube las bajas deja menos socios y menos ingresos", () => {
    const normal = correr("gimnasio", 12).e;
    const golpeado = correr("gimnasio", 12, (e) =>
      aplicarDecisionAEstado(e, evento, opcion({ churn: "*1.8", socios: "-10%" }))
    ).e;
    expect(golpeado.socios).toBeLessThan(normal.socios);
    expect(golpeado.ingresos_acumulados).toBeLessThan(normal.ingresos_acumulados);
  });

  it("la reputación baja las bajas: con 90% de reputación hay más socios que con 20%", () => {
    const alta = correr("gimnasio", 18, (e) => ({ ...e, reputacion: 0.9 })).e;
    const baja = correr("gimnasio", 18, (e) => ({ ...e, reputacion: 0.2 })).e;
    expect(alta.socios).toBeGreaterThan(baja.socios);
  });

  it("socios y churn en eventos no hacen nada en un negocio de productos", () => {
    const antes = inicializarEstadoDesdeProyecto(crear("restaurante"));
    const despues = aplicarDecisionAEstado(antes, evento, opcion({ socios: "-10%" }));
    expect(despues.socios).toBeUndefined();
  });

  it("una simulación vieja sin socios sigue funcionando con el cálculo anterior", () => {
    const p = crear("gimnasio");
    const base = calcularBaseProyecto(p);
    const { socios, churn_multiplicador, ...viejo } = inicializarEstadoDesdeProyecto(p) as any;
    const e = aplicarOperacionDelTurno(viejo, base, "mensual", 0);
    expect(Number.isFinite(e.caja)).toBe(true);
    expect(e.socios).toBeUndefined();
  });
});
