import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { aplicarDecisionAEstado } from "./motor-eventos";
import type { Evento, OpcionDecision } from "@/types/evento";
import type { EstadoSimulacion } from "@/types/simulacion";

const SQL = readFileSync(join(__dirname, "../../supabase/migrations/053_cobranza_en_eventos.sql"), "utf8");
const ESTADO: EstadoSimulacion = {
  caja: 100000, deuda: 50000, precio_venta_multiplicador: 1, demanda_multiplicador: 1,
  costos_multiplicador: 1, reputacion: 0.5, ingresos_acumulados: 0, costos_acumulados: 0,
  utilidad_acumulada: 0, ultimo_evento: null, ultima_decision: null, ultimo_feedback: null,
  delta_caja: 0, delta_ingresos: 0, dias_cobro: 45, cuentas_por_cobrar: 0,
};

const actualizaciones = [...SQL.matchAll(/'(\[[\s\S]*?\])'::jsonb WHERE codigo = '([A-Z]+\d+)'/g)].map((m) => ({
  codigo: m[2],
  opciones: JSON.parse(m[1]) as OpcionDecision[],
}));

describe("migración 053: cobranza en los eventos", () => {
  it("actualiza los 4 eventos de cobranza", () => {
    expect(actualizaciones.map((a) => a.codigo).sort()).toEqual(["SAL001", "SAL011", "SRV001", "SOC001"].sort());
  });

  it("cada evento conserva sus opciones y alguna mueve los días de cobro", () => {
    for (const a of actualizaciones) {
      expect(a.opciones.map((o) => o.letra), a.codigo).toEqual(["A", "B", "C", "D"]);
      const conCobranza = a.opciones.filter((o) => "dias_cobro" in o.consecuencias);
      expect(conCobranza.length, a.codigo).toBeGreaterThanOrEqual(3);
    }
  });

  it("los días de cobro de cada opción cambian el estado y quedan dentro de 0 a 180", () => {
    for (const a of actualizaciones) {
      for (const o of a.opciones) {
        if (!("dias_cobro" in o.consecuencias)) continue;
        const despues = aplicarDecisionAEstado(ESTADO, { titulo: a.codigo } as Evento, { ...o, consecuencias: { dias_cobro: o.consecuencias.dias_cobro } });
        expect(despues.dias_cobro, `${a.codigo}${o.letra}`).not.toBe(ESTADO.dias_cobro);
        expect(despues.dias_cobro!).toBeGreaterThanOrEqual(0);
        expect(despues.dias_cobro!).toBeLessThanOrEqual(180);
      }
    }
  });

  it("el SQL no tiene apóstrofes sueltos dentro del JSON", () => {
    expect(SQL.match(/UPDATE eventos/g)!.length).toBe(4);
    for (const a of actualizaciones) expect(JSON.stringify(a.opciones)).not.toContain("'");
  });
});
