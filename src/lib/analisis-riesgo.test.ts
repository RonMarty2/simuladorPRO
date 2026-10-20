import { describe, it, expect } from "vitest";
import {
  calcularTornado,
  crearAleatorio,
  emitirVeredicto,
  muestraTriangular,
  resumirVans,
  simularMontecarlo,
  tablaPrecioDemanda,
} from "./analisis-riesgo";
import { crearProyectoEjemploCafeteriaV2 } from "./proyecto-factory";

const proyecto = () => crearProyectoEjemploCafeteriaV2({ estudiante_id: "e1" });

describe("analisis-riesgo", () => {
  it("el tornado ordena de mayor a menor amplitud y no modifica el proyecto", () => {
    const p = proyecto();
    const antes = JSON.stringify(p);
    const t = calcularTornado(p, 0.1);
    expect(t.filas).toHaveLength(6);
    for (let i = 1; i < t.filas.length; i++) {
      expect(t.filas[i - 1].amplitud).toBeGreaterThanOrEqual(t.filas[i].amplitud);
    }
    for (const f of t.filas) expect(f.vanAlto).toBeGreaterThanOrEqual(f.vanBajo);
    expect(JSON.stringify(p)).toBe(antes);
  });

  it("subir el precio mejora el VAN en la tabla de dos variables", () => {
    const tabla = tablaPrecioDemanda(proyecto());
    const centro = tabla.cambiosFila.indexOf(0);
    expect(tabla.valores[centro + 1][centro]).toBeGreaterThan(tabla.valores[centro][centro]);
    expect(tabla.valores[centro][centro + 1]).toBeGreaterThan(tabla.valores[centro][centro]);
  });

  it("el aleatorio con semilla es reproducible", () => {
    const a = crearAleatorio(7);
    const b = crearAleatorio(7);
    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  it("la triangular respeta sus límites", () => {
    const a = crearAleatorio(3);
    for (let i = 0; i < 200; i++) {
      const x = muestraTriangular(0.8, 1, 1.3, a());
      expect(x).toBeGreaterThanOrEqual(0.8);
      expect(x).toBeLessThanOrEqual(1.3);
    }
  });

  it("montecarlo es reproducible y coherente", async () => {
    const p = proyecto();
    const r1 = await simularMontecarlo(p, { corridas: 100, semilla: 5 });
    const r2 = await simularMontecarlo(p, { corridas: 100, semilla: 5 });
    expect(r1).toEqual(r2);
    expect(r1.corridas).toBe(100);
    expect(r1.probVanPositivo).toBeGreaterThanOrEqual(0);
    expect(r1.probVanPositivo).toBeLessThanOrEqual(1);
    expect(r1.p5).toBeLessThanOrEqual(r1.p50);
    expect(r1.p50).toBeLessThanOrEqual(r1.p95);
    expect(r1.histograma.reduce((s, b) => s + b.cantidad, 0)).toBe(100);
  });

  it("resumirVans con lista vacía no revienta", () => {
    const r = resumirVans([], 0);
    expect(r.corridas).toBe(0);
    expect(r.probVanPositivo).toBe(0);
  });

  it("el veredicto cambia con la probabilidad", () => {
    const t = calcularTornado(proyecto(), 0.1);
    const mc = (p: number) => ({ ...resumirVans([1], 0), probVanPositivo: p });
    expect(emitirVeredicto(t, mc(0.9)).nivel).toBe("robusto");
    expect(emitirVeredicto(t, mc(0.6)).nivel).toBe("sensible");
    expect(emitirVeredicto(t, mc(0.3)).nivel).toBe("riesgoso");
    expect(emitirVeredicto(t, mc(0.05)).nivel).toBe("inviable");
  });
});
