import { construirFlujoCajaProyecto } from "@/lib/finanzas/proyecto-financiero";
import type { Proyecto } from "@/types/proyecto";

/**
 * Diagnóstico pedagógico de un proyecto de inversión.
 *
 * El objetivo NO es calificar: es que el alumno entienda, en el momento y sin
 * el docente al lado, si las decisiones que tomó tienen sentido financiero.
 * Cada alerta explica QUÉ está pasando, POR QUÉ importa y SUGIERE qué mirar.
 *
 * Es una función pura sobre el motor financiero ya existente — no toca la BD
 * ni el estado global. Se puede usar mientras construye (Paso 9) o en el panel
 * del docente para ver patrones del curso.
 */

export type SeveridadAlerta = "critico" | "advertencia" | "ok" | "info";

export interface AlertaDiagnostico {
  /** Identificador estable de la regla (sirve para agregaciones del docente). */
  id: string;
  severidad: SeveridadAlerta;
  /** Título corto, en criollo. */
  titulo: string;
  /** Explicación de por qué importa + qué mirar. */
  detalle: string;
  /** Etapa del constructor (1..9) a la que conviene volver, si aplica. */
  etapa?: number;
}

export interface ResultadoDiagnostico {
  alertas: AlertaDiagnostico[];
  /** Cantidad de problemas reales (crítico + advertencia). */
  problemas: number;
  /** true si no hay críticos ni advertencias. */
  saludable: boolean;
}

/** Umbrales pedagógicos. Centralizados para poder explicarlos/ajustarlos. */
export const UMBRALES = {
  /** Deuda sobre inversión total: arriba de esto, apalancamiento riesgoso. */
  deudaAltaPct: 80,
  /** Payback que se considera lento para un proyecto a 5 años. */
  paybackLentoAnios: 4,
  /** Crecimiento anual de unidades que suena poco realista. */
  crecimientoDemandaIrrealPct: 40,
  /** Margen neto mínimo del año 1 que no enciende alerta. */
  margenNetoFlacoPct: 5,
} as const;

function crecimientoAnualPromedio(valores: number[]): number | null {
  const validos = valores.filter((v) => Number.isFinite(v));
  if (validos.length < 2 || validos[0] <= 0) return null;
  const tasas: number[] = [];
  for (let i = 1; i < validos.length; i++) {
    const previo = validos[i - 1];
    if (previo > 0) tasas.push((validos[i] - previo) / previo);
  }
  if (tasas.length === 0) return null;
  const prom = tasas.reduce((a, b) => a + b, 0) / tasas.length;
  return prom * 100;
}

export function diagnosticarProyecto(proyecto: Proyecto): ResultadoDiagnostico {
  const alertas: AlertaDiagnostico[] = [];

  let r;
  try {
    r = construirFlujoCajaProyecto(proyecto);
  } catch {
    // Proyecto a medio armar: no diagnosticamos números todavía.
    return { alertas: [], problemas: 0, saludable: true };
  }

  const { van, tir, payback } = r.indicadores;
  const wacc = r.wacc;
  const ingresoAnio1 = r.ingresos[0] ?? 0;
  const utilidadAnio1 = r.utilidadNeta[0] ?? 0;
  const deudaPct =
    r.totalProyecto > 0 ? (r.montoPrestamo / r.totalProyecto) * 100 : 0;
  const margenNetoPct = ingresoAnio1 > 0 ? (utilidadAnio1 / ingresoAnio1) * 100 : 0;

  // ── VAN ────────────────────────────────────────────────────────────────
  if (Number.isFinite(van)) {
    if (van > 0) {
      alertas.push({
        id: "van_positivo",
        severidad: "ok",
        titulo: "El VAN da positivo",
        detalle:
          "Hoy el proyecto crea valor: lo que genera, traído a valor de hoy, " +
          "supera lo que invertís. Es la señal base de viabilidad.",
        etapa: 9,
      });
    } else {
      alertas.push({
        id: "van_negativo",
        severidad: "critico",
        titulo: "El VAN da negativo",
        detalle:
          "El proyecto destruye valor: traído a hoy, devuelve menos de lo que " +
          "ponés. Subí precio, bajá costos o revisá la inversión. Mientras el " +
          "VAN sea negativo, no conviene ejecutarlo.",
        etapa: 9,
      });
    }
  }

  // ── TIR vs WACC ──────────────────────────────────────────────────────────
  if (Number.isFinite(tir) && wacc > 0) {
    if (tir <= wacc) {
      alertas.push({
        id: "tir_bajo_wacc",
        severidad: "critico",
        titulo: "La TIR no supera al costo del capital (WACC)",
        detalle:
          `Tu proyecto rinde ${(tir * 100).toFixed(1)}% pero el dinero te ` +
          `cuesta ${(wacc * 100).toFixed(1)}%. Estás rindiendo menos de lo que ` +
          "cuesta financiarte: no alcanza para pagar a quienes ponen la plata.",
        etapa: 7,
      });
    } else {
      alertas.push({
        id: "tir_supera_wacc",
        severidad: "ok",
        titulo: "La TIR supera al costo del capital",
        detalle:
          `Rendís ${(tir * 100).toFixed(1)}% contra un costo de ` +
          `${(wacc * 100).toFixed(1)}%. El proyecto paga su financiamiento y deja margen.`,
        etapa: 7,
      });
    }
  } else if (!Number.isFinite(tir)) {
    alertas.push({
      id: "tir_indefinida",
      severidad: "advertencia",
      titulo: "No se pudo calcular la TIR",
      detalle:
        "Suele pasar cuando los flujos nunca se vuelven positivos o el proyecto " +
        "no tiene inversión inicial cargada. Revisá inversiones (Etapa 3) y los " +
        "flujos de los 5 años.",
      etapa: 3,
    });
  }

  // ── Payback ──────────────────────────────────────────────────────────────
  if (Number.isFinite(payback) && payback > 0) {
    if (payback > UMBRALES.paybackLentoAnios) {
      alertas.push({
        id: "payback_lento",
        severidad: "advertencia",
        titulo: "Tarda mucho en recuperar la inversión",
        detalle:
          `Recuperás la plata recién en el año ${payback.toFixed(1)}. En un ` +
          "horizonte de 5 años eso deja poco colchón ante imprevistos. Mirá si " +
          "podés bajar la inversión inicial o acelerar ingresos.",
        etapa: 9,
      });
    }
  } else if (!Number.isFinite(payback)) {
    alertas.push({
      id: "payback_nunca",
      severidad: "critico",
      titulo: "La inversión no se recupera en 5 años",
      detalle:
        "Con los flujos actuales nunca llegás a recuperar lo invertido. Es " +
        "coherente con un VAN negativo: el proyecto, así, no se paga solo.",
      etapa: 9,
    });
  }

  // ── Margen neto año 1 ─────────────────────────────────────────────────────
  if (ingresoAnio1 > 0) {
    if (utilidadAnio1 < 0) {
      alertas.push({
        id: "margen_negativo",
        severidad: "critico",
        titulo: "Perdés plata el primer año",
        detalle:
          "Tus costos y gastos del año 1 superan los ingresos. Revisá precio de " +
          "venta (Etapa 2), costos directos (Etapa 5) y gastos fijos/personal " +
          "(Etapas 4 y 6).",
        etapa: 5,
      });
    } else if (margenNetoPct < UMBRALES.margenNetoFlacoPct) {
      alertas.push({
        id: "margen_flaco",
        severidad: "advertencia",
        titulo: "El margen del primer año es muy fino",
        detalle:
          `Te queda apenas ${margenNetoPct.toFixed(1)}% de utilidad sobre ventas. ` +
          "Cualquier suba de costos te deja en rojo. Poco margen = poco aguante " +
          "ante eventos económicos.",
        etapa: 5,
      });
    }
  }

  // ── Apalancamiento (deuda) ────────────────────────────────────────────────
  if (deudaPct > UMBRALES.deudaAltaPct) {
    alertas.push({
      id: "deuda_alta",
      severidad: "advertencia",
      titulo: "Estás financiando casi todo con deuda",
      detalle:
        `El ${deudaPct.toFixed(0)}% de la inversión sale de préstamo. Mucho ` +
        "apalancamiento sube el riesgo: las cuotas se pagan sí o sí, vendas o no. " +
        "Probá subir el aporte propio en Etapa 7.",
      etapa: 7,
    });
  }

  // ── Realismo de la demanda ────────────────────────────────────────────────
  const unidadesPorAnio = [0, 1, 2, 3, 4].map((i) =>
    proyecto.productos.reduce((acc, p) => acc + Number(p.cantidades[i] ?? 0), 0)
  );
  const crecDemanda = crecimientoAnualPromedio(unidadesPorAnio);
  if (crecDemanda != null && crecDemanda > UMBRALES.crecimientoDemandaIrrealPct) {
    alertas.push({
      id: "demanda_irreal",
      severidad: "advertencia",
      titulo: "Tu demanda crece muy rápido",
      detalle:
        `Estás proyectando que las ventas crecen ~${crecDemanda.toFixed(0)}% por ` +
        "año. Es un crecimiento agresivo; defendelo con un motivo real (mercado " +
        "nuevo, expansión) o moderalo en Etapa 2 para que el proyecto sea creíble.",
      etapa: 2,
    });
  }

  // ── Falta de datos mínimos ───────────────────────────────────────────────
  if (ingresoAnio1 <= 0) {
    alertas.push({
      id: "sin_ingresos",
      severidad: "info",
      titulo: "Todavía no hay ingresos cargados",
      detalle:
        "Sin ventas en el año 1 no se puede evaluar viabilidad. Completá " +
        "productos, cantidades y precios en la Etapa 2.",
      etapa: 2,
    });
  }
  if (r.totalProyecto <= 0) {
    alertas.push({
      id: "sin_inversion",
      severidad: "info",
      titulo: "Todavía no hay inversión cargada",
      detalle:
        "Sin inversión inicial ni capital de trabajo, los indicadores no tienen " +
        "sentido. Completá las Etapas 3 y 8.",
      etapa: 3,
    });
  }

  const problemas = alertas.filter(
    (a) => a.severidad === "critico" || a.severidad === "advertencia"
  ).length;

  return {
    alertas,
    problemas,
    saludable: problemas === 0,
  };
}
