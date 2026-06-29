import { describe, expect, it } from "vitest";
import { analizarPostmortem } from "@/lib/postmortem-simulacion";
import type {
  EstadoSimulacion,
  Simulacion,
  TurnoHistorial,
} from "@/types/simulacion";

function estado(parcial: Partial<EstadoSimulacion>): EstadoSimulacion {
  return {
    caja: 10000,
    deuda: 0,
    precio_venta_multiplicador: 1,
    demanda_multiplicador: 1,
    costos_multiplicador: 1,
    reputacion: 0.7,
    ingresos_acumulados: 0,
    costos_acumulados: 0,
    utilidad_acumulada: 0,
    ultimo_evento: null,
    ultima_decision: null,
    ultimo_feedback: null,
    delta_caja: 0,
    delta_ingresos: 0,
    ...parcial,
  };
}

function turno(
  numero: number,
  antes: Partial<EstadoSimulacion>,
  despues: Partial<EstadoSimulacion>,
  eventoTitulo?: string
): TurnoHistorial {
  return {
    id: `t${numero}`,
    simulacion_id: "sim",
    numero_turno: numero,
    estado_antes: estado(antes),
    eventos_aplicados: eventoTitulo
      ? ([{ id: `e${numero}`, titulo: eventoTitulo } as any])
      : [],
    decision_tomada: null,
    estado_despues: estado(despues),
    procesado_en: "2026-01-01T00:00:00Z",
  };
}

function sim(estadoEnum: Simulacion["estado"], turnoActual: number): Simulacion {
  return {
    id: "sim",
    proyecto_id: "p",
    turno_actual: turnoActual,
    turnos_totales: 5,
    frecuencia: "anual" as any,
    estado: estadoEnum,
    estado_actual: estado({}),
    iniciada_en: "2026-01-01T00:00:00Z",
    finalizada_en: "2026-01-02T00:00:00Z",
  };
}

describe("post-mortem de simulación", () => {
  it("sin historial no revienta", () => {
    const pm = analizarPostmortem(sim("quebrada", 1), []);
    expect(pm.quebro).toBe(true);
    expect(pm.hallazgos).toEqual([]);
    expect(pm.peorTurno).toBeNull();
  });

  it("identifica el peor turno y el evento más duro por caída de caja", () => {
    const historial = [
      turno(1, { caja: 10000 }, { caja: 9000, delta_caja: -1000 }, "Inflación leve"),
      turno(2, { caja: 9000 }, { caja: 3000, delta_caja: -6000 }, "Sequía altiplano"),
      turno(3, { caja: 3000 }, { caja: 4000, delta_caja: 1000 }, "Buena temporada"),
    ];
    const pm = analizarPostmortem(sim("finalizada", 3), historial);
    expect(pm.peorTurno).toBe(2);
    expect(pm.peorDeltaCaja).toBe(-6000);
    expect(pm.eventoMasDuro).toBe("Sequía altiplano");
  });

  it("marca quiebra y aconseja volver al constructor", () => {
    const historial = [
      turno(1, { caja: 5000 }, { caja: -2000, delta_caja: -7000 }, "Devaluación"),
    ];
    const pm = analizarPostmortem(sim("quebrada", 1), historial);
    expect(pm.quebro).toBe(true);
    expect(pm.hallazgos.some((h) => h.titulo.includes("Quebraste"))).toBe(true);
    expect(pm.consejos.length).toBeGreaterThan(0);
  });

  it("reconoce un cierre exitoso con utilidad positiva", () => {
    const historial = [
      turno(1, { caja: 10000, utilidad_acumulada: 0 }, { caja: 12000, utilidad_acumulada: 2000, delta_caja: 2000 }),
      turno(2, { caja: 12000, utilidad_acumulada: 2000 }, { caja: 15000, utilidad_acumulada: 5000, delta_caja: 3000 }),
    ];
    const pm = analizarPostmortem(sim("finalizada", 2), historial);
    expect(pm.quebro).toBe(false);
    expect(pm.veredicto.toLowerCase()).toContain("valor");
    expect(pm.hallazgos.some((h) => h.titulo.includes("utilidad"))).toBe(true);
  });

  it("detecta caída de reputación", () => {
    const historial = [
      turno(1, { reputacion: 0.8 }, { reputacion: 0.7, delta_caja: 500 }),
      turno(2, { reputacion: 0.7 }, { reputacion: 0.5, delta_caja: 500, utilidad_acumulada: 1000 }),
    ];
    const pm = analizarPostmortem(sim("finalizada", 2), historial);
    expect(pm.hallazgos.some((h) => h.titulo.toLowerCase().includes("reputación"))).toBe(true);
  });
});
