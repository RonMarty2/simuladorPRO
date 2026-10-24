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

  /**
   * Días que tardan tus clientes en pagarte (cobranza a crédito). Opcional: las
   * simulaciones viejas no lo traen y se tratan como 30 (cobro en el mismo mes).
   * Si pasa de 30, parte de lo que vendes queda como cuenta por cobrar.
   */
  dias_cobro?: number;
  /** Lo vendido y todavía no cobrado (Bs). Opcional, 0 si no existe. */
  cuentas_por_cobrar?: number;

  /**
   * Solo proyectos de suscripción: socios activos hoy. Opcional: las simulaciones viejas
   * y los demás tipos no lo traen y usan el cálculo de siempre.
   */
  socios?: number;
  /** Altas y bajas del último mes (para mostrar al alumno). */
  altas_mes?: number;
  bajas_mes?: number;
  /** Multiplica las bajas del plan (1 = normal). Los eventos lo mueven y se diluye con los meses. */
  churn_multiplicador?: number;

  /**
   * Solo microcrédito: cuánto pesa la mora frente a la prevista (1 = la del plan). Sube si
   * creces demasiado rápido o pierdes reputación y los eventos la mueven directamente.
   */
  mora_multiplicador?: number;
  /** Mora prevista del plan como fracción de la cartera (0,052 = 5,2%), si se pudo calcular. */
  mora_base?: number;

  /**
   * Solo negocios con temporadas (turismo): cuánto vende el mes que se va a jugar frente al promedio
   * del año (1,4 = temporada alta, 0,7 = baja) y qué mes es (0 = enero).
   */
  factor_estacional?: number;
  mes_del_anio?: number;

  /**
   * Solo proyectos sociales: qué parte de los fondos previstos llega de verdad (1 = todos;
   * un recorte presupuestario lo baja). El proyecto no vende: lo financia un tercero.
   */
  presupuesto_multiplicador?: number;
  /** Valor social generado hasta hoy (Bs). No es plata en la caja. */
  beneficio_social_acumulado?: number;
  /** Qué parte del servicio planeado se está entregando este mes (1 = todo). */
  cobertura?: number;

  /**
   * Proyectos que se evalúan por un beneficio incremental (ahorro, pérdidas evitadas, ventas
   * adicionales): qué parte del beneficio esperado se está logrando de verdad (1 = todo lo previsto).
   */
  eficacia_multiplicador?: number;
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
  /**
   * Si está seteado, el motor del alumno usa ESTE evento en el próximo turno
   * en vez del sorteo aleatorio. El docente lo setea desde el lanzador del
   * panel docente. Se limpia al avanzar el turno.
   */
  evento_forzado_id?: string | null;
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
