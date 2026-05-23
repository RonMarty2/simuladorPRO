import { describe, expect, it } from "vitest";
import {
  aplicarDecisionAEstado,
  inicializarEstadoDesdeProyecto,
  mesesPorTurno,
  parsearConsecuencia,
  seleccionarEventoTurno,
  turnosTotalesPorFrecuencia,
} from "./motor-eventos";
import type { EstadoSimulacion } from "@/types/simulacion";
import type { Evento, OpcionDecision } from "@/types/evento";

// ============================================================================
// PARSER DE CONSECUENCIAS
// ============================================================================
describe("parsearConsecuencia", () => {
  it("'*1.10' es multiplicador", () => {
    expect(parsearConsecuencia("*1.10")).toEqual({ operacion: "multiplicar", valor: 1.1 });
  });

  it("'+5%' es porcentaje positivo", () => {
    expect(parsearConsecuencia("+5%")).toEqual({ operacion: "porcentaje", valor: 0.05 });
  });

  it("'-10%' es porcentaje negativo", () => {
    expect(parsearConsecuencia("-10%")).toEqual({ operacion: "porcentaje", valor: -0.10 });
  });

  it("'+5000' es suma absoluta", () => {
    expect(parsearConsecuencia("+5000")).toEqual({ operacion: "sumar", valor: 5000 });
  });

  it("'-3000' es resta absoluta", () => {
    expect(parsearConsecuencia("-3000")).toEqual({ operacion: "restar", valor: 3000 });
  });

  it("número se setea directamente", () => {
    expect(parsearConsecuencia(0.5)).toEqual({ operacion: "setear", valor: 0.5 });
  });

  it("string inválido retorna null", () => {
    expect(parsearConsecuencia("hola mundo")).toBeNull();
  });
});

// ============================================================================
// SELECCIÓN DE EVENTOS
// ============================================================================
function eventoMock(overrides: Partial<Evento> = {}): Evento {
  return {
    id: "test-id",
    codigo: "EVT001",
    titulo: "Test event",
    descripcion: "Una prueba",
    categoria: "macroeconomico",
    tipo: "curado",
    probabilidad: 1.0,
    turno_minimo: 1,
    sectores_afectados: ["todos"],
    modificadores: { variables_afectadas: [] },
    opciones_decision: [],
    activo: true,
    creado_en: "",
    ...overrides,
  };
}

describe("seleccionarEventoTurno", () => {
  it("respeta turno_minimo: descarta eventos cuyo turno_minimo > turnoActual", () => {
    const ev = eventoMock({ turno_minimo: 10 });
    const r = seleccionarEventoTurno(5, "produccion", [ev], [], () => 0);
    expect(r).toBeNull();
  });

  it("respeta sector: filtra eventos que no aplican al sector", () => {
    const ev = eventoMock({ sectores_afectados: ["agricultura"] });
    const r = seleccionarEventoTurno(5, "produccion", [ev], [], () => 0);
    expect(r).toBeNull();
  });

  it("eventos 'todos' aplican a cualquier sector", () => {
    const ev = eventoMock({ sectores_afectados: ["todos"], probabilidad: 1.0 });
    const r = seleccionarEventoTurno(5, "produccion", [ev], [], () => 0);
    expect(r).not.toBeNull();
    expect(r?.id).toBe("test-id");
  });

  it("no repite eventos ya usados", () => {
    const ev = eventoMock();
    const r = seleccionarEventoTurno(5, "produccion", [ev], [ev.id], () => 0);
    expect(r).toBeNull();
  });
});

// ============================================================================
// APLICAR DECISIÓN AL ESTADO
// ============================================================================
function estadoInicial(): EstadoSimulacion {
  return {
    caja: 100000,
    deuda: 50000,
    precio_venta_multiplicador: 1,
    demanda_multiplicador: 1,
    costos_multiplicador: 1,
    reputacion: 0.5,
    ingresos_acumulados: 0,
    costos_acumulados: 0,
    utilidad_acumulada: 0,
    ultimo_evento: null,
    ultima_decision: null,
    ultimo_feedback: null,
    delta_caja: 0,
    delta_ingresos: 0,
  };
}

describe("aplicarDecisionAEstado", () => {
  it("aplica multiplicador a precio_venta", () => {
    const ev = eventoMock();
    const op: OpcionDecision = {
      letra: "A",
      texto: "Subir precio 10%",
      consecuencias: { precio_venta: "*1.10" },
      feedback_corto: "Subiste precios",
    };
    const r = aplicarDecisionAEstado(estadoInicial(), ev, op);
    expect(r.precio_venta_multiplicador).toBeCloseTo(1.1);
  });

  it("aplica porcentaje a demanda", () => {
    const ev = eventoMock();
    const op: OpcionDecision = {
      letra: "B",
      texto: "Bajar demanda",
      consecuencias: { demanda: "-15%" },
      feedback_corto: "Perdiste clientes",
    };
    const r = aplicarDecisionAEstado(estadoInicial(), ev, op);
    expect(r.demanda_multiplicador).toBeCloseTo(0.85);
  });

  it("clamp de reputacion entre 0 y 1", () => {
    const ev = eventoMock();
    const op: OpcionDecision = {
      letra: "C",
      texto: "Subir reputación al cielo",
      consecuencias: { reputacion: "+100%" },
      feedback_corto: "Excelente",
    };
    const r = aplicarDecisionAEstado(estadoInicial(), ev, op);
    expect(r.reputacion).toBeLessThanOrEqual(1);
    expect(r.reputacion).toBeGreaterThanOrEqual(0);
  });

  it("guarda último_feedback en el estado", () => {
    const ev = eventoMock();
    const op: OpcionDecision = {
      letra: "D",
      texto: "Una opción",
      consecuencias: {},
      feedback_corto: "Resultado X",
    };
    const r = aplicarDecisionAEstado(estadoInicial(), ev, op);
    expect(r.ultimo_feedback).toBe("Resultado X");
    expect(r.ultima_decision).toContain("Una opción");
  });
});

// ============================================================================
// CONFIGURACIÓN POR FRECUENCIA
// ============================================================================
describe("turnosTotalesPorFrecuencia", () => {
  it("mensual 5 años = 60 turnos", () => {
    expect(turnosTotalesPorFrecuencia("mensual", 5)).toBe(60);
  });

  it("trimestral 5 años = 20 turnos", () => {
    expect(turnosTotalesPorFrecuencia("trimestral", 5)).toBe(20);
  });

  it("semestral 5 años = 10 turnos", () => {
    expect(turnosTotalesPorFrecuencia("semestral", 5)).toBe(10);
  });
});

describe("mesesPorTurno", () => {
  it("mensual = 1 mes/turno", () => {
    expect(mesesPorTurno("mensual")).toBe(1);
  });
  it("trimestral = 3 meses/turno", () => {
    expect(mesesPorTurno("trimestral")).toBe(3);
  });
  it("semestral = 6 meses/turno", () => {
    expect(mesesPorTurno("semestral")).toBe(6);
  });
});

// ============================================================================
// INICIALIZACIÓN DESDE PROYECTO
// ============================================================================
describe("inicializarEstadoDesdeProyecto", () => {
  it("caja inicial = capital de trabajo del proyecto", () => {
    const proyecto = {
      capitalTrabajo: 50000,
      inversiones: { terreno: [], obrasCiviles: [], maquinaria: [], mobiliario: [], activoDiferido: [] },
      financiamiento: { porcentajePropio: 1, porcentajePrestamo: 0, tasaInteresAnual: 0.12, plazoMeses: 36, costoOportunidadAccionista: 0.15 },
    } as any;
    const r = inicializarEstadoDesdeProyecto(proyecto);
    expect(r.caja).toBe(50000);
    expect(r.deuda).toBe(0);
    expect(r.precio_venta_multiplicador).toBe(1);
    expect(r.reputacion).toBe(0.5);
  });

  it("calcula deuda inicial según porcentaje de préstamo", () => {
    const proyecto = {
      capitalTrabajo: 30000,
      inversiones: {
        terreno: [], obrasCiviles: [],
        maquinaria: [{ id: "1", costoTotal: 70000 } as any],
        mobiliario: [], activoDiferido: [],
      },
      financiamiento: { porcentajePropio: 0.6, porcentajePrestamo: 0.4, tasaInteresAnual: 0.12, plazoMeses: 36, costoOportunidadAccionista: 0.15 },
    } as any;
    const r = inicializarEstadoDesdeProyecto(proyecto);
    // inversionTotal = 70000 + 30000 = 100000; deuda = 100000 * 0.4 = 40000
    expect(r.deuda).toBe(40000);
  });
});
