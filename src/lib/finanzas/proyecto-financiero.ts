import {
  calcularPuntoEquilibrio,
  type PuntoEquilibrio,
} from "../calculo-financiero";
import {
  construirFlujoCaja,
  type FlujoCajaProyecto,
} from "../flujo-proyecto";
import type { Proyecto } from "../../types/proyecto";

export type ResultadoFlujoProyecto = FlujoCajaProyecto & {
  totalProyecto: number;
  flujoLibreProyecto: number[];
  puntoEquilibrio: PuntoEquilibrio;
};

export function construirFlujoCajaProyecto(
  proyecto: Proyecto
): ResultadoFlujoProyecto {
  const base = construirFlujoCaja(proyecto);
  const totalProyecto = base.inversionInicial + base.capitalTrabajo;
  const unidadesAnio1 = proyecto.productos.reduce(
    (acc, producto) => acc + Number(producto.cantidades[0] ?? 0),
    0
  );
  const precioPromedio =
    unidadesAnio1 > 0 ? base.ingresos[0] / unidadesAnio1 : 0;
  const costoVariableUnitario =
    unidadesAnio1 > 0 ? base.costosProduccion[0] / unidadesAnio1 : 0;
  const costosFijos =
    base.gastosAdmin[0] +
    base.gastosComerc[0] +
    base.personal[0] +
    base.imprevistos[0];

  return {
    ...base,
    totalProyecto,
    flujoLibreProyecto: base.flujoCaja,
    puntoEquilibrio: calcularPuntoEquilibrio(
      costosFijos,
      precioPromedio,
      costoVariableUnitario
    ),
  };
}
