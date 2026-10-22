import { describe, expect, it } from "vitest";
import { PLANTILLAS } from "./plantillas";
import { calcularBaseProyecto, aplicarOperacionDelTurno, inicializarEstadoDesdeProyecto } from "./motor-eventos";
import { construirFlujoCaja } from "./flujo-proyecto";
import { calcularTornado, simularMontecarlo } from "./analisis-riesgo";

// Barrido por TODOS los tipos de proyecto: el simulador, los escenarios y el
// riesgo deben dar números finitos y coherentes con el constructor.
describe("barrido de plantillas", () => {
  for (const pl of PLANTILLAS) {
    it(`${pl.clave} (${pl.modelo})`, () => {
      const p = pl.crear();
      const c: any = construirFlujoCaja(p);
      const base = calcularBaseProyecto(p);

      // ingresos del simulador = ingresos del año 1 del constructor
      expect(base.ingresosAnuales, "ingresos simulador vs constructor").toBeCloseTo(c.ingresos[0], 0);

      // 60 meses sin eventos: nada de NaN ni caja disparada
      let e = inicializarEstadoDesdeProyecto(p);
      for (let i = 0; i < 60; i++) e = aplicarOperacionDelTurno(e, base, "mensual", i);
      expect(Number.isFinite(e.caja)).toBe(true);
      // un proyecto con VAN positivo no debe quebrar en la simulación sin eventos
      if (c.indicadores.van > 0) expect(e.caja, "caja a 60 meses").toBeGreaterThan(0);

      expect(Number.isFinite(c.van ?? 0)).toBe(true);
      const t: any = calcularTornado(p);
      expect(JSON.stringify(t)).not.toMatch(/null|NaN/);
      const m: any = simularMontecarlo(p as any, undefined as any);
      expect(Number.isFinite(m.probabilidadVanPositivo ?? m.probabilidad ?? 0)).toBe(true);
    });
  }
});
