import { construirFlujoCaja } from "./flujo-proyecto";
import type { Proyecto } from "../types/proyecto";

/**
 * Punto de equilibrio POR PRODUCTO / SERVICIO.
 *
 * El equilibrio agregado (suma de unidades ÷ precio promedio) mezcla cosas que
 * no se pueden sumar (platos con eventos, socios con impresiones). Aquí se
 * mantiene la MEZCLA de ventas del año 1 y se calcula qué fracción de ese
 * volumen hace falta para cubrir los costos fijos:
 *
 *   φ = Costos fijos ÷ Contribución total del año 1
 *
 * y para cada producto: unidades de equilibrio = unidades del año 1 × φ.
 * Si φ ≤ 1 el año 1 ya cubre los costos; si φ > 1 no alcanza.
 *
 * En proyectos costo-beneficio no hay unidades: el equilibrio es el beneficio
 * anual mínimo que cubre los costos de operar.
 */

export interface FilaEquilibrio {
  id: string;
  nombre: string;
  /** Unidad de medida del producto (plato, socio/año, mil impresiones…). */
  unidad: string;
  unidadesAnio1: number;
  unidadesEquilibrio: number;
  ingresoAnio1: number;
  ingresoEquilibrio: number;
  /** Precio − costo variable por unidad, en el año 1. */
  margenUnitario: number;
}

export interface EquilibrioPorProducto {
  tipo: "unidades" | "beneficio";
  filas: FilaEquilibrio[];
  costosFijos: number;
  /** φ: fracción del volumen del año 1 que cubre los costos fijos. Infinity si no hay margen. */
  factorVolumen: number;
  /** Ingresos totales (o beneficio) necesarios para no perder. */
  ingresoEquilibrio: number;
  ingresoAnio1: number;
  /** 1 − φ: cuánto pueden caer las ventas antes de perder (negativo si ya se pierde). */
  margenSeguridad: number;
  alcanza: boolean;
}

export function calcularEquilibrioPorProducto(proyecto: Proyecto): EquilibrioPorProducto {
  const flujo = construirFlujoCaja(proyecto);
  const costosFijos =
    flujo.gastosAdmin[0] + flujo.gastosComerc[0] + flujo.personal[0] + flujo.imprevistos[0];

  const costosDirectos = proyecto.costosDirectos ?? [];
  const unitarioHuerfano = costosDirectos
    .filter((c) => c.productoId == null)
    .reduce((a, c) => a + c.cantidadPorUnidad * c.costoUnitario, 0);

  const filas: FilaEquilibrio[] = [];
  let contribucionTotal = 0;
  let ingresoTotal = 0;

  for (const p of proyecto.productos) {
    const unidades = Number(p.cantidades?.[0] ?? 0);
    const precio = Number(p.precios?.[0] ?? 0);
    if (unidades <= 0) continue;
    const costoPropio = costosDirectos
      .filter((c) => c.productoId === p.id)
      .reduce((a, c) => a + c.cantidadPorUnidad * c.costoUnitario, 0);
    const margenUnitario = precio - (costoPropio + unitarioHuerfano);
    const ingreso = unidades * precio;
    contribucionTotal += unidades * margenUnitario;
    ingresoTotal += ingreso;
    filas.push({
      id: p.id,
      nombre: p.nombre,
      unidad: p.unidadMedida,
      unidadesAnio1: unidades,
      unidadesEquilibrio: 0,
      ingresoAnio1: ingreso,
      ingresoEquilibrio: 0,
      margenUnitario,
    });
  }

  const factorVolumen = contribucionTotal > 0 ? costosFijos / contribucionTotal : Infinity;
  for (const f of filas) {
    f.unidadesEquilibrio = f.unidadesAnio1 * factorVolumen;
    f.ingresoEquilibrio = f.ingresoAnio1 * factorVolumen;
  }

  return {
    tipo: proyecto.modeloIngreso === "costo_beneficio" ? "beneficio" : "unidades",
    filas,
    costosFijos,
    factorVolumen,
    ingresoEquilibrio: Number.isFinite(factorVolumen) ? ingresoTotal * factorVolumen : Infinity,
    ingresoAnio1: ingresoTotal,
    margenSeguridad: Number.isFinite(factorVolumen) ? 1 - factorVolumen : -Infinity,
    alcanza: Number.isFinite(factorVolumen) && factorVolumen <= 1,
  };
}
