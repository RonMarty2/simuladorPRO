import { construirFlujoCajaProyecto } from "@/lib/finanzas/proyecto-financiero";
import { UMBRALES } from "@/lib/diagnostico-pedagogico";
import type { Proyecto } from "@/types/proyecto";

/**
 * "Boletín" del proyecto: compara los indicadores del alumno contra los rangos
 * sanos esperados, lado a lado. A diferencia del diagnóstico (que lista qué
 * revisar), esto es un scorecard de autoevaluación: indicador por indicador,
 * tu valor vs la meta, con un estado claro.
 *
 * Función pura sobre el motor financiero existente.
 */

export type EstadoBoletin = "bien" | "atencion" | "mal" | "sin_dato";

export interface FilaBoletin {
  clave: string;
  nombre: string;
  /** Valor del alumno ya formateado para mostrar. */
  valorTexto: string;
  /** Meta/rango sano en texto. */
  metaTexto: string;
  estado: EstadoBoletin;
  /** Una línea de por qué. */
  comentario: string;
}

export interface Boletin {
  filas: FilaBoletin[];
  /** Indicadores en verde sobre el total con dato. */
  puntaje: { bien: number; total: number };
}

function pct(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}

export function calcularBoletin(proyecto: Proyecto): Boletin {
  const filas: FilaBoletin[] = [];

  let r;
  try {
    r = construirFlujoCajaProyecto(proyecto);
  } catch {
    return { filas: [], puntaje: { bien: 0, total: 0 } };
  }

  const { van, tir, payback } = r.indicadores;
  const wacc = r.wacc;
  const ingresoAnio1 = r.ingresos[0] ?? 0;
  const utilidadAnio1 = r.utilidadNeta[0] ?? 0;
  const deudaPct =
    r.totalProyecto > 0 ? (r.montoPrestamo / r.totalProyecto) * 100 : 0;
  const margenNetoPct = ingresoAnio1 > 0 ? (utilidadAnio1 / ingresoAnio1) * 100 : 0;

  // VAN
  filas.push({
    clave: "van",
    nombre: "VAN (Valor Actual Neto)",
    valorTexto: Number.isFinite(van) ? `Bs ${Math.round(van).toLocaleString("es-BO")}` : "—",
    metaTexto: "Mayor a 0",
    estado: !Number.isFinite(van) ? "sin_dato" : van > 0 ? "bien" : "mal",
    comentario:
      van > 0
        ? "Crea valor: vale la pena invertir."
        : "Negativo: hoy el proyecto destruye valor.",
  });

  // TIR vs WACC
  filas.push({
    clave: "tir",
    nombre: "TIR vs costo del capital",
    valorTexto: Number.isFinite(tir) ? pct(tir) : "—",
    metaTexto: `Mayor al WACC (${pct(wacc)})`,
    estado: !Number.isFinite(tir)
      ? "sin_dato"
      : tir > wacc
        ? "bien"
        : "mal",
    comentario:
      Number.isFinite(tir) && tir > wacc
        ? "Rinde más de lo que cuesta financiarlo."
        : "No supera el costo del capital.",
  });

  // Payback
  filas.push({
    clave: "payback",
    nombre: "Recuperación de la inversión",
    valorTexto:
      Number.isFinite(payback) && payback > 0 ? `${payback.toFixed(1)} años` : "—",
    metaTexto: `Hasta ${UMBRALES.paybackLentoAnios} años`,
    estado: !Number.isFinite(payback) || payback <= 0
      ? "mal"
      : payback <= UMBRALES.paybackLentoAnios
        ? "bien"
        : "atencion",
    comentario:
      !Number.isFinite(payback) || payback <= 0
        ? "No se recupera dentro del horizonte."
        : payback <= UMBRALES.paybackLentoAnios
          ? "Recuperás la plata a tiempo."
          : "Tarda; queda poco colchón.",
  });

  // Margen neto año 1
  filas.push({
    clave: "margen",
    nombre: "Margen neto (año 1)",
    valorTexto: ingresoAnio1 > 0 ? `${margenNetoPct.toFixed(1)}%` : "—",
    metaTexto: `Al menos ${UMBRALES.margenNetoFlacoPct}%`,
    estado:
      ingresoAnio1 <= 0
        ? "sin_dato"
        : margenNetoPct < 0
          ? "mal"
          : margenNetoPct < UMBRALES.margenNetoFlacoPct
            ? "atencion"
            : "bien",
    comentario:
      ingresoAnio1 <= 0
        ? "Falta cargar ingresos."
        : margenNetoPct < 0
          ? "Perdés plata el primer año."
          : margenNetoPct < UMBRALES.margenNetoFlacoPct
            ? "Margen fino: poco aguante."
            : "Margen saludable.",
  });

  // Deuda / apalancamiento
  filas.push({
    clave: "deuda",
    nombre: "Financiado con deuda",
    valorTexto: r.totalProyecto > 0 ? `${deudaPct.toFixed(0)}%` : "—",
    metaTexto: `Hasta ${UMBRALES.deudaAltaPct}%`,
    estado:
      r.totalProyecto <= 0
        ? "sin_dato"
        : deudaPct > UMBRALES.deudaAltaPct
          ? "atencion"
          : "bien",
    comentario:
      r.totalProyecto <= 0
        ? "Falta cargar la inversión."
        : deudaPct > UMBRALES.deudaAltaPct
          ? "Muy apalancado: más riesgo."
          : "Apalancamiento razonable.",
  });

  const conDato = filas.filter((f) => f.estado !== "sin_dato");
  const bien = conDato.filter((f) => f.estado === "bien").length;

  return {
    filas,
    puntaje: { bien, total: conDato.length },
  };
}
