import type { Evento, OpcionDecision } from "./evento";

export type EstadoSimulacionEnum = "activa" | "finalizada" | "quebrada";
export type Frecuencia = "mensual" | "trimestral" | "semestral";

/**
 * Estado vivo de la simulación. Empieza desde los datos del proyecto y va
 * mutando turno a turno según eventos y decisiones del estudiante.
 *
 * Todos los `_multiplicador` empiezan en 1.0 y los eventos los modifican.
 * Caja y deuda son montos absolutos en Bs.
 */
export interface EstadoSimulacion {
  // Liquidez y deuda (montos absolutos en Bs)
  caja: number;
  deuda: number;

  // Métricas de operación (multiplicadores sobre el valor base del proyecto)
  precio_venta_multiplicador: number;
  demanda_multiplicador: number;
  costos_multiplicador: number;
  reputacion: number; // 0..1

  // Acumulados desde inicio
  ingresos_acumulados: number;
  costos_acumulados: number;
  utilidad_acumulada: number;

  // Histórico de eventos del último turno (texto resumido para UI)
  ultimo_evento: string | null;
  ultima_decision: string | null;
  ultimo_feedback: string | null;

  // Cambios en este turno respecto al anterior (para mostrar deltas)
  delta_caja: number;
  delta_ingresos: number;
}

export interface Simulacion {
  id: string;
  proyecto_id: string;
  turno_actual: number;
  turnos_totales: number;
  frecuencia: Frecuencia;
  estado: EstadoSimulacionEnum;
  estado_actual: EstadoSimulacion;
  iniciada_en: string;
  finalizada_en: string | null;
}

export interface TurnoHistorial {
  id: string;
  simulacion_id: string;
  numero_turno: number;
  estado_antes: EstadoSimulacion;
  eventos_aplicados: Evento[];
  decision_tomada: { evento_id: string; opcion: OpcionDecision } | null;
  estado_despues: EstadoSimulacion;
  procesado_en: string;
}
