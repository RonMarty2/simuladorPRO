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

describe("alquiler, salud, educación y concesión: contratos e impagos", () => {
  it("cada tipo arranca con las variables que le corresponden", () => {
    const edificio = inicializarEstadoDesdeProyecto(crear("edificio"));
    expect(edificio.ocupacion_relativa).toBe(1);
    expect(edificio.impagos_multiplicador).toBe(1);
    const clinica = inicializarEstadoDesdeProyecto(crear("clinica"));
    expect(clinica.impagos_multiplicador).toBe(1);
    expect(clinica.ocupacion_relativa).toBeUndefined();
    expect(inicializarEstadoDesdeProyecto(crear("colegio")).ocupacion_relativa).toBe(1);
    expect(inicializarEstadoDesdeProyecto(crear("concesionagua")).ocupacion_relativa).toBe(1);
    expect(inicializarEstadoDesdeProyecto(crear("restaurante")).ocupacion_relativa).toBeUndefined();
  });

  it("sin eventos reproduce el plan del año 1", () => {
    for (const c of ["edificio", "parqueo", "clinica", "colegio", "concesionagua"]) {
      const { e, p } = correr(c, 12);
      const plan: any = construirFlujoCaja(p);
      expect(e.ingresos_acumulados, c).toBeCloseTo(plan.ingresos[0], 0);
    }
  });

  it("una caída de la demanda se siente despacio: la ocupación baja menos y más tarde que la demanda", () => {
    const p = crear("edificio");
    const base = calcularBaseProyecto(p);
    let e: any = { ...inicializarEstadoDesdeProyecto(p), demanda_multiplicador: 0.6 };
    let minimo = 1;
    for (let i = 0; i < 24; i++) {
      e = aplicarOperacionDelTurno(e, base, "mensual", i);
      minimo = Math.min(minimo, e.ocupacion_relativa);
    }
    expect(minimo).toBeLessThan(0.9); // sí se siente
    expect(minimo).toBeGreaterThan(0.65); // pero no cae de golpe a la demanda
    expect(e.ocupacion_relativa).toBeGreaterThan(minimo); // y se recupera cuando pasa la crisis
  });

  it("subir mucho la renta vacía departamentos", () => {
    const normal = correr("edificio", 24).e;
    const caro = correr("edificio", 24, (e) => ({ ...e, precio_venta_multiplicador: 1.3 })).e;
    expect(caro.ocupacion_relativa).toBeLessThan(normal.ocupacion_relativa);
  });

  it("más impagos o glosas hacen entrar menos plata", () => {
    for (const c of ["edificio", "clinica", "colegio"]) {
      const normal = correr(c, 12).e;
      const peor = correr(c, 12, (e) => aplicarDecisionAEstado(e, evento, opcion({ impagos: "*3" }))).e;
      expect(peor.ingresos_acumulados, c).toBeLessThan(normal.ingresos_acumulados);
    }
  });

  it("los impagos se normalizan con los meses", () => {
    const { e } = correr("clinica", 36, (e) => aplicarDecisionAEstado(e, evento, opcion({ glosas: "*3" })));
    expect(e.impagos_multiplicador).toBeLessThan(2);
  });

  it("los efectos de contratos no hacen nada en otros tipos", () => {
    const antes = inicializarEstadoDesdeProyecto(crear("restaurante"));
    const despues = aplicarDecisionAEstado(antes, evento, opcion({ impagos: "*3", ocupacion: "-20%" }));
    expect(despues.impagos_multiplicador).toBeUndefined();
    expect(despues.ocupacion_relativa).toBeUndefined();
  });

  it("una simulación vieja sin estas variables sigue funcionando", () => {
    const p = crear("edificio");
    const { impagos_multiplicador, ocupacion_relativa, ...viejo } = inicializarEstadoDesdeProyecto(p) as any;
    const e = aplicarOperacionDelTurno(viejo, calcularBaseProyecto(p), "mensual", 0);
    expect(Number.isFinite(e.caja)).toBe(true);
    expect(e.ocupacion_relativa).toBeUndefined();
  });
});
