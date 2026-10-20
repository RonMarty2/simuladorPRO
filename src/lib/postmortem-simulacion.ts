import type { Simulacion, TurnoHistorial } from "@/types/simulacion";

/**
 * Post-mortem de una simulación terminada. El aprendizaje real está en
 * entender QUÉ pasó: qué turno fue el peor, qué evento pegó más fuerte, si las
 * decisiones ayudaron o hundieron, y qué se podría haber hecho distinto.
 *
 * Función pura sobre el historial de turnos — sin BD ni estado global.
 */

export interface HallazgoPostmortem {
  titulo: string;
  detalle: string;
}

export interface Postmortem {
  quebro: boolean;
  /** Frase de encabezado según el desenlace. */
  veredicto: string;
  /** Turno donde más cayó la caja (1-indexed sobre numero_turno). */
  peorTurno: number | null;
  peorDeltaCaja: number | null;
  /** Evento que más golpeó (por mayor caída de caja en su turno). */
  eventoMasDuro: string | null;
  hallazgos: HallazgoPostmortem[];
  /** Consejos accionables para la próxima corrida. */
  consejos: string[];
}

export function analizarPostmortem(
  simulacion: Simulacion,
  historial: TurnoHistorial[]
): Postmortem {
  const quebro = simulacion.estado === "quebrada";

  if (historial.length === 0) {
    return {
      quebro,
      veredicto: quebro
        ? "El proyecto quebró antes de generar historial."
        : "Simulación sin turnos registrados.",
      peorTurno: null,
      peorDeltaCaja: null,
      eventoMasDuro: null,
      hallazgos: [],
      consejos: [],
    };
  }

  const ordenado = [...historial].sort((a, b) => a.numero_turno - b.numero_turno);

  // Peor turno por delta de caja.
  let peorTurno: number | null = null;
  let peorDeltaCaja: number | null = null;
  let eventoMasDuro: string | null = null;
  for (const t of ordenado) {
    const delta = t.estado_despues.delta_caja;
    if (peorDeltaCaja == null || delta < peorDeltaCaja) {
      peorDeltaCaja = delta;
      peorTurno = t.numero_turno;
      eventoMasDuro = t.eventos_aplicados[0]?.titulo ?? null;
    }
  }

  const hallazgos: HallazgoPostmortem[] = [];
  const consejos: string[] = [];

  const estadoFinal = ordenado[ordenado.length - 1].estado_despues;

  // ── Reputación ────────────────────────────────────────────────────────────
  const repInicial = ordenado[0].estado_antes.reputacion;
  const repFinal = estadoFinal.reputacion;
  if (repFinal < repInicial - 0.15) {
    hallazgos.push({
      titulo: "Tu reputación cayó a lo largo de la simulación",
      detalle:
        `Pasaste de ${(repInicial * 100).toFixed(0)}% a ${(repFinal * 100).toFixed(0)}%. ` +
        "La reputación baja arrastra la demanda: vendés menos y la caja sufre.",
    });
    consejos.push(
      "Cuidá la reputación: ante eventos, las opciones más baratas a veces la dañan y el costo aparece después."
    );
  }

  // ── Decisiones ────────────────────────────────────────────────────────────
  const conDecision = ordenado.filter((t) => t.decision_tomada != null);
  const decisionesQueDañaron = conDecision.filter(
    (t) => t.estado_despues.delta_caja < 0
  ).length;
  if (conDecision.length > 0 && decisionesQueDañaron / conDecision.length > 0.5) {
    hallazgos.push({
      titulo: "Más de la mitad de tus decisiones dejaron la caja en rojo ese turno",
      detalle:
        "No siempre es error (a veces hay que gastar para sostener el negocio), " +
        "pero conviene revisar si elegías la opción más cara sin necesidad.",
    });
  }

  // ── Caja al límite ────────────────────────────────────────────────────────
  const turnosEnRojo = ordenado.filter((t) => t.estado_despues.caja < 0).length;
  if (turnosEnRojo > 0 && !quebro) {
    hallazgos.push({
      titulo: "Estuviste con caja negativa y zafaste",
      detalle:
        `Hubo ${turnosEnRojo} turno(s) con caja en rojo. Llegaste al final, pero ` +
        "sin colchón. Un evento más y quebrabas.",
    });
    consejos.push(
      "Arrancá con más capital de trabajo o un colchón de caja para aguantar los meses malos."
    );
  }

  // ── Resultado global ──────────────────────────────────────────────────────
  if (quebro) {
    hallazgos.push({
      titulo: `Quebraste en el turno ${simulacion.turno_actual}`,
      detalle:
        "La caja se quedó sin fondos. Quebrar no es por una sola mala decisión: " +
        "suele ser poco margen + poco colchón + un evento fuerte juntos.",
    });
    consejos.push(
      "Volvé al constructor y mejorá el margen (precio/costos) antes de simular de nuevo."
    );
  } else if (estadoFinal.utilidad_acumulada > 0) {
    hallazgos.push({
      titulo: "Cerraste con utilidad acumulada positiva",
      detalle:
        `Terminaste con ${formatBs(estadoFinal.utilidad_acumulada)} de utilidad y ` +
        `${formatBs(estadoFinal.caja)} en caja. El proyecto aguantó los eventos.`,
    });
  } else {
    hallazgos.push({
      titulo: "Sobreviviste pero sin ganar plata",
      detalle:
        "Llegaste al final con utilidad acumulada en cero o negativa. El negocio " +
        "se sostiene pero todavía no genera valor.",
    });
    consejos.push(
      "Buscá subir el margen: aunque no quiebres, sin utilidad el proyecto no rinde."
    );
  }

  if (consejos.length === 0) {
    consejos.push(
      "Buen manejo. Probá un nivel más difícil o forzá eventos para estresar el proyecto."
    );
  }

  const veredicto = quebro
    ? "El proyecto no sobrevivió los 5 años. Veamos por qué."
    : estadoFinal.utilidad_acumulada > 0
      ? "El proyecto sobrevivió y generó valor. Veamos qué lo sostuvo."
      : "El proyecto sobrevivió, pero apenas. Veamos qué mejorar.";

  return {
    quebro,
    veredicto,
    peorTurno,
    peorDeltaCaja,
    eventoMasDuro,
    hallazgos,
    consejos,
  };
}

function formatBs(n: number): string {
  return `Bs ${Math.round(n).toLocaleString("es-BO")}`;
}
