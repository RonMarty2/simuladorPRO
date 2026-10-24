import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { aplicarDecisionAEstado } from "./motor-eventos";
import type { Evento, OpcionDecision } from "@/types/evento";
import type { EstadoSimulacion } from "@/types/simulacion";

// Lee las migraciones que agregan eventos propios de un tipo ("tipo:xxx") y
// comprueba que cada opción tiene forma válida y que cada consecuencia mueve algo.
const DIR = join(__dirname, "../../supabase/migrations");
const archivos = readdirSync(DIR).filter((f) => /^\d+_eventos_[a-z_]+\.sql$/.test(f) && f > "033");

const ESTADO: EstadoSimulacion = {
  caja: 100000, deuda: 50000, precio_venta_multiplicador: 1, demanda_multiplicador: 1,
  costos_multiplicador: 1, reputacion: 0.5, ingresos_acumulados: 0, costos_acumulados: 0,
  utilidad_acumulada: 0, ultimo_evento: null, ultima_decision: null, ultimo_feedback: null,
  delta_caja: 0, delta_ingresos: 0, socios: 100, churn_multiplicador: 1, mora_multiplicador: 1, presupuesto_multiplicador: 1, dias_cobro: 30, eficacia_multiplicador: 1,
};

function leerEventos(sql: string) {
  const filas = sql.split(/\n\(\s*'/).slice(1).map((f) => "'" + f);
  return filas.map((f) => {
    const codigo = f.match(/^'([A-Z]+\d+)'/)![1];
    const sectores = f.match(/ARRAY\[([^\]]*)\]/)![1];
    const bloques = [...f.matchAll(/'([\[{][\s\S]*?[\]}])'::jsonb/g)].map((m) => JSON.parse(m[1]));
    const opciones = bloques.find(Array.isArray) as OpcionDecision[];
    return { codigo, sectores, opciones };
  });
}

describe.each(archivos)("%s", (archivo) => {
  const eventos = leerEventos(readFileSync(join(DIR, archivo), "utf8"));

  it("tiene eventos y todos son de un tipo", () => {
    expect(eventos.length).toBeGreaterThan(0);
    for (const e of eventos) expect(e.sectores).toMatch(/'tipo:[a-z_]+'/);
  });

  it("cada evento tiene 4 opciones A-D sin repetir letras", () => {
    for (const e of eventos) {
      expect(e.opciones.map((o) => o.letra), e.codigo).toEqual(["A", "B", "C", "D"]);
    }
  });

  it("cada consecuencia mueve alguna variable del estado", () => {
    for (const e of eventos) {
      for (const o of e.opciones) {
        for (const [campo, valor] of Object.entries(o.consecuencias)) {
          const solo: OpcionDecision = { ...o, consecuencias: { [campo]: valor } };
          const despues = aplicarDecisionAEstado(ESTADO, { titulo: e.codigo } as Evento, solo);
          const cambio = (Object.keys(ESTADO) as (keyof EstadoSimulacion)[]).some(
            (k) => !["ultimo_evento", "ultima_decision", "ultimo_feedback"].includes(k) && despues[k] !== ESTADO[k]
          );
          expect(cambio, `${e.codigo}${o.letra}: "${campo}" no mueve nada`).toBe(true);
        }
      }
    }
  });
});
