import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { PLANTILLAS } from "./plantillas";
import {
  INTENSIDAD_GOLPE_EVENTO,
  LIMITES_MULTIPLICADORES,
  aplicarDecisionAEstado,
  aplicarGolpeDelEvento,
  aplicarOperacionDelTurno,
  avanzarTurnoConDecision,
  calcularBaseProyecto,
  eventoAplicaAProyecto,
  inicializarEstadoDesdeProyecto,
  resumenGolpeEvento,
} from "./motor-eventos";
import type { Evento, OpcionDecision } from "@/types/evento";

const crear = (clave: string) => PLANTILLAS.find((p) => p.clave === clave)!.crear();

const eventoDe = (variables: { campo: string; operacion: string; valor: number }[]): Evento =>
  ({ id: "e", codigo: "T1", titulo: "Evento de prueba", modificadores: { variables_afectadas: variables } }) as unknown as Evento;
const opcion = (consecuencias: Record<string, string | number> = {}): OpcionDecision => ({
  letra: "A", texto: "", feedback_corto: "", consecuencias,
});

describe("golpe del evento", () => {
  it("el golpe se aplica a la intensidad indicada y las opciones no lo borran", () => {
    const p = crear("restaurante");
    const e0 = inicializarEstadoDesdeProyecto(p);
    const ev = eventoDe([{ campo: "demanda", operacion: "multiplicar", valor: 0.5 }]);
    const e1 = aplicarGolpeDelEvento(e0, ev);
    expect(e1.demanda_multiplicador).toBeCloseTo(1 + (0.5 - 1) * INTENSIDAD_GOLPE_EVENTO, 5);
    const r = avanzarTurnoConDecision(e0, calcularBaseProyecto(p), "mensual", ev, opcion({ caja: "+1000" }));
    expect(r.estadoDespues.demanda_multiplicador).toBeCloseTo(e1.demanda_multiplicador, 5);
  });

  it("campos que el motor no maneja se ignoran sin romper nada", () => {
    const e0 = inicializarEstadoDesdeProyecto(crear("restaurante"));
    const ev = eventoDe([{ campo: "tasa_dolar_paralelo", operacion: "multiplicar", valor: 1.1 }]);
    expect(aplicarGolpeDelEvento(e0, ev)).toEqual(e0);
  });

  it("el resumen del golpe se puede mostrar al alumno", () => {
    const ev = eventoDe([
      { campo: "demanda", operacion: "multiplicar", valor: 0.75 },
      { campo: "costos_importacion", operacion: "multiplicar", valor: 1.2 },
    ]);
    const texto = resumenGolpeEvento(ev).join(", ");
    expect(texto).toMatch(/Ventas -15%/);
    expect(texto).toMatch(/Costos \+12%/);
    expect(resumenGolpeEvento(eventoDe([]))).toEqual([]);
  });

  it("los efectos acumulados no pasan de los topes", () => {
    let e = inicializarEstadoDesdeProyecto(crear("restaurante"));
    const ev = eventoDe([]);
    for (let i = 0; i < 40; i++) {
      e = aplicarDecisionAEstado(e, ev, opcion({ precio_venta: "*1.2", demanda: "*1.3", costos: "*0.8" }));
    }
    expect(e.precio_venta_multiplicador).toBe(LIMITES_MULTIPLICADORES.precio_venta_multiplicador[1]);
    expect(e.demanda_multiplicador).toBe(LIMITES_MULTIPLICADORES.demanda_multiplicador[1]);
    expect(e.costos_multiplicador).toBe(LIMITES_MULTIPLICADORES.costos_multiplicador[0]);
  });
});

// ---------------------------------------------------------------------------
// Control de equilibrio del juego con los eventos reales de la base.
// ---------------------------------------------------------------------------
const DIR = join(__dirname, "../../supabase/migrations");
function leerEventos(sql: string) {
  const filas = sql.split(/\n\(\s*'/).slice(1).map((f) => "'" + f);
  const salida: any[] = [];
  for (const f of filas) {
    const codigo = f.match(/^'([A-Z]+\d+)'/)?.[1];
    const sec = f.match(/ARRAY\[([^\]]*)\]/)?.[1];
    const prob = f.match(/'[a-z]+', 'curado', ([0-9.]+), (\d+)/);
    if (!codigo || !sec || !prob) continue;
    const bloques = [...f.matchAll(/'([\[{][\s\S]*?[\]}])'::jsonb/g)].map((m) => JSON.parse(m[1]));
    salida.push({
      id: codigo, codigo, titulo: codigo, turno_minimo: Number(prob[2]),
      sectores_afectados: [...sec.matchAll(/'([^']+)'/g)].map((m) => m[1]),
      modificadores: bloques.find((b) => !Array.isArray(b)),
      opciones_decision: bloques.find(Array.isArray),
    });
  }
  return salida;
}
const EVENTOS = readdirSync(DIR)
  .filter((f) => /^(006|03[4-9]|04\d|05\d)_.*\.sql$/.test(f))
  .flatMap((f) => leerEventos(readFileSync(join(DIR, f), "utf8")));

function azar(semilla: number) {
  let t = semilla;
  return () => ((t = (t * 1664525 + 1013904223) % 4294967296) / 4294967296);
}

/** Juega 60 meses eligiendo siempre la opción que más caja deja a 12 meses. true si quiebra. */
function juegaBien(clave: string, semilla: number): boolean {
  const p = crear(clave);
  const base = calcularBaseProyecto(p);
  const candidatos = EVENTOS.filter((e) => eventoAplicaAProyecto(e.sectores_afectados, p.sector, p.tipoNegocio));
  const rand = azar(semilla);
  let e = inicializarEstadoDesdeProyecto(p);
  const usados = new Set<string>();
  for (let t = 0; t < 60; t++) {
    if (rand() < 0.4) {
      const posibles = candidatos.filter((x) => t >= x.turno_minimo && !usados.has(x.id));
      if (posibles.length) {
        const ev = posibles[Math.floor(rand() * posibles.length)];
        usados.add(ev.id);
        const conGolpe = aplicarGolpeDelEvento(e, ev as Evento);
        let mejorCaja = -Infinity;
        let elegida: OpcionDecision = ev.opciones_decision[0];
        for (const o of ev.opciones_decision as OpcionDecision[]) {
          let x = aplicarDecisionAEstado(conGolpe, ev as Evento, o);
          for (let k = 0; k < 12; k++) x = aplicarOperacionDelTurno(x, base, "mensual", t + k);
          if (x.caja > mejorCaja) { mejorCaja = x.caja; elegida = o; }
        }
        e = aplicarDecisionAEstado(conGolpe, ev as Evento, elegida);
      }
    }
    e = aplicarOperacionDelTurno(e, base, "mensual", t);
    if (e.caja < 0) return true;
  }
  return false;
}

describe("equilibrio del juego (decidiendo bien)", () => {
  const CORRIDAS = 12;
  const tasa = (clave: string) => {
    let q = 0;
    for (let i = 0; i < CORRIDAS; i++) if (juegaBien(clave, 300 + i)) q++;
    return q / CORRIDAS;
  };

  it("un proyecto viable bien jugado casi nunca quiebra", () => {
    for (const clave of ["restaurante", "clinica", "consultora", "quinua"]) {
      expect(tasa(clave), clave).toBeLessThanOrEqual(0.3);
    }
  });

  it("un ejemplo de rechazo, aun bien jugado, fracasa en la mayoría de los casos", () => {
    for (const clave of ["edificio", "radiocomunitaria", "reforestacion", "concesionagua"]) {
      expect(tasa(clave), clave).toBeGreaterThanOrEqual(0.5);
    }
  });
});
