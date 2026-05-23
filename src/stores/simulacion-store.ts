import { create } from "zustand";
import {
  actualizarSimulacion,
  crearSimulacion,
  obtenerHistorial,
  obtenerSimulacionActiva,
  registrarTurno,
} from "@/lib/simulacion-supabase";
import {
  avanzarTurnoConDecision,
  calcularBaseProyecto,
  inicializarEstadoDesdeProyecto,
  seleccionarEventoTurno,
  turnosTotalesPorFrecuencia,
} from "@/lib/motor-eventos";
import { listarEventos } from "@/lib/eventos-supabase";
import type { Evento, OpcionDecision } from "@/types/evento";
import type { Frecuencia, Simulacion, TurnoHistorial } from "@/types/simulacion";
import type { Proyecto } from "@/types/proyecto";

interface SimulacionState {
  simulacion: Simulacion | null;
  eventos: Evento[];
  historial: TurnoHistorial[];
  eventoActual: Evento | null;
  cargando: boolean;
  error: string | null;

  // Inicia o carga simulación existente para el proyecto
  inicializar: (proyecto: Proyecto, frecuencia?: Frecuencia) => Promise<void>;

  // Genera el evento del próximo turno (si toca)
  prepararSiguienteTurno: (proyecto: Proyecto) => void;

  // El estudiante decidió: aplica consecuencias + operación + avanza turno
  decidirYAvanzar: (proyecto: Proyecto, opcion: OpcionDecision | null) => Promise<void>;

  // Reinicia (borra la simulación activa, queda lista para empezar otra)
  abandonar: () => Promise<void>;
}

export const useSimulacionStore = create<SimulacionState>((set, get) => ({
  simulacion: null,
  eventos: [],
  historial: [],
  eventoActual: null,
  cargando: false,
  error: null,

  inicializar: async (proyecto, frecuencia = "mensual") => {
    set({ cargando: true, error: null });
    try {
      let sim = await obtenerSimulacionActiva(proyecto.id);
      if (!sim) {
        const estado = inicializarEstadoDesdeProyecto(proyecto);
        sim = await crearSimulacion({
          proyecto_id: proyecto.id,
          turnos_totales: turnosTotalesPorFrecuencia(frecuencia, 5),
          frecuencia,
          estado_inicial: estado,
        });
      }
      const eventos = await listarEventos();
      const historial = await obtenerHistorial(sim.id);
      set({ simulacion: sim, eventos, historial, cargando: false });

      // Generar evento del próximo turno si no es el primer turno o si no terminó
      get().prepararSiguienteTurno(proyecto);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error";
      set({ error: msg, cargando: false });
    }
  },

  prepararSiguienteTurno: (proyecto) => {
    const { simulacion, eventos, historial } = get();
    if (!simulacion) return;
    if (simulacion.estado !== "activa") return;
    if (simulacion.turno_actual >= simulacion.turnos_totales) return;

    const eventosYaUsados = historial
      .flatMap((h) => h.eventos_aplicados.map((e) => e.id))
      .filter(Boolean);

    const evento = seleccionarEventoTurno(
      simulacion.turno_actual + 1,
      proyecto.sector,
      eventos,
      eventosYaUsados
    );
    set({ eventoActual: evento });
  },

  decidirYAvanzar: async (proyecto, opcion) => {
    const { simulacion, eventoActual } = get();
    if (!simulacion) return;
    set({ cargando: true });
    try {
      const base = calcularBaseProyecto(proyecto);
      const resultado = avanzarTurnoConDecision(
        simulacion.estado_actual,
        base,
        simulacion.frecuencia,
        eventoActual,
        opcion
      );

      const nuevoTurno = simulacion.turno_actual + 1;
      const estadoFinal: Simulacion["estado"] = resultado.quiebra
        ? "quebrada"
        : nuevoTurno >= simulacion.turnos_totales
          ? "finalizada"
          : "activa";

      await actualizarSimulacion(simulacion.id, {
        turno_actual: nuevoTurno,
        estado_actual: resultado.estadoDespues,
        estado: estadoFinal,
        finalizada_en: estadoFinal === "activa" ? null : new Date().toISOString(),
      });

      await registrarTurno({
        simulacion_id: simulacion.id,
        numero_turno: nuevoTurno,
        estado_antes: resultado.estadoAntes,
        eventos_aplicados: resultado.eventosAplicados,
        decision_tomada: resultado.decision,
        estado_despues: resultado.estadoDespues,
      });

      const historial = await obtenerHistorial(simulacion.id);
      const nuevaSim: Simulacion = {
        ...simulacion,
        turno_actual: nuevoTurno,
        estado_actual: resultado.estadoDespues,
        estado: estadoFinal,
        finalizada_en: estadoFinal === "activa" ? null : new Date().toISOString(),
      };
      set({ simulacion: nuevaSim, historial, eventoActual: null, cargando: false });

      // Preparar siguiente evento si continúa
      if (estadoFinal === "activa") {
        get().prepararSiguienteTurno(proyecto);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error";
      set({ error: msg, cargando: false });
    }
  },

  abandonar: async () => {
    const { simulacion } = get();
    if (!simulacion) return;
    await actualizarSimulacion(simulacion.id, {
      estado: "finalizada",
      finalizada_en: new Date().toISOString(),
    });
    set({ simulacion: null, historial: [], eventoActual: null });
  },
}));
