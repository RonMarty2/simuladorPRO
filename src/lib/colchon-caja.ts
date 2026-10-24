import type { Proyecto } from "@/types/proyecto";
import {
  aplicarOperacionDelTurno,
  calcularBaseProyecto,
  inicializarEstadoDesdeProyecto,
} from "./motor-eventos";

export interface MinimoCaja {
  /** Caja más baja que alcanza el proyecto en 60 meses, sin eventos. */
  minimo: number;
  /** Mes (1..60) en que ocurre. 0 si es la caja inicial. */
  mes: number;
}

/**
 * Recorre los 60 meses con el motor del simulador (sin eventos) y devuelve el
 * punto más bajo de la caja. El capital de trabajo del constructor se calcula como
 * meses de costos y no mira cuánto tardan en llegar los ingresos, por eso los
 * proyectos que arrancan perdiendo (suscripción, publicidad) pueden quedarse sin
 * caja en el año 1 aunque su VAN sea positivo.
 */
export function calcularMinimoCaja(p: Proyecto): MinimoCaja {
  const base = calcularBaseProyecto(p);
  let estado = inicializarEstadoDesdeProyecto(p);
  let minimo = estado.caja;
  let mes = 0;
  for (let i = 0; i < 60; i++) {
    estado = aplicarOperacionDelTurno(estado, base, "mensual", i);
    if (estado.caja < minimo) {
      minimo = estado.caja;
      mes = i + 1;
    }
  }
  return { minimo, mes };
}

/** Sube el capital de trabajo lo justo (más 60% de margen para imprevistos) para que la caja no sea negativa. */
export function conColchonDeCaja(p: Proyecto): Proyecto {
  let actual = p;
  for (let vuelta = 0; vuelta < 8; vuelta++) {
    const { minimo } = calcularMinimoCaja(actual);
    if (minimo >= 0) break;
    const extra = Math.ceil((-minimo * 1.6) / 1000) * 1000;
    actual = { ...actual, capitalTrabajo: actual.capitalTrabajo + extra };
  }
  return actual;
}
