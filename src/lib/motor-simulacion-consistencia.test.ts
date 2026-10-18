import { describe, expect, it } from "vitest";
import { calcularBaseProyecto } from "./motor-eventos";
import { construirFlujoCaja } from "./flujo-proyecto";
import {
  crearProyectoEjemploCafeteriaV2,
  crearProyectoEjemploPanaderiaV2,
  crearProyectoEjemploTiendaV2,
} from "./proyecto-factory";

// El simulador (motor-eventos) debe coincidir con el constructor (flujo-proyecto)
// en los costos de insumos del año 1: los costos directos pertenecen a un producto.
describe("simulacion vs constructor: costos de insumos del año 1", () => {
  const casos = [
    ["panaderia", crearProyectoEjemploPanaderiaV2],
    ["cafeteria", crearProyectoEjemploCafeteriaV2],
    ["tienda", crearProyectoEjemploTiendaV2],
  ] as const;

  for (const [nombre, crear] of casos) {
    it(nombre, () => {
      const p = crear({ estudiante_id: "u" });
      const base = calcularBaseProyecto(p);
      const insumosSimulador = base.costoInsumosPorUnidad * base.cantidadAnualUnidades;
      const insumosConstructor = construirFlujoCaja(p).costosProduccion[0];
      expect(insumosSimulador).toBeCloseTo(insumosConstructor, 2);
    });
  }
});

describe("simulacion vs constructor: ingresos y costos fijos del año 1", () => {
  for (const [nombre, crear] of [
    ["panaderia", crearProyectoEjemploPanaderiaV2],
    ["cafeteria", crearProyectoEjemploCafeteriaV2],
    ["tienda", crearProyectoEjemploTiendaV2],
  ] as const) {
    it(nombre, () => {
      const p = crear({ estudiante_id: "u" });
      const base = calcularBaseProyecto(p);
      const c: any = construirFlujoCaja(p);
      expect(base.ingresosAnuales).toBeCloseTo(c.ingresos[0], 2);
      expect(base.costosAnualesFijos).toBeCloseTo(
        c.personal[0] + c.gastosAdmin[0] + c.gastosComerc[0],
        2
      );
    });
  }
});
