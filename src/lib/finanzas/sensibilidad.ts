import { construirFlujoCajaProyecto, type ResultadoFlujoProyecto } from "./proyecto-financiero";
import type { Proyecto } from "../../types/proyecto";

export type TipoEscenarioSensibilidad =
  | "base"
  | "precio"
  | "volumen"
  | "costos"
  | "combinado";

export interface EscenarioSensibilidad {
  id: string;
  tipo: TipoEscenarioSensibilidad;
  nombre: string;
  variableModificada: string;
  cambioAplicado: string;
  proyecto: Proyecto;
  resultado: ResultadoFlujoProyecto;
  van: number;
  tir: number;
  wacc: number;
  payback: number;
  esViable: boolean;
}

export interface AnalisisSensibilidadProyecto {
  base: EscenarioSensibilidad;
  escenarios: EscenarioSensibilidad[];
  recomendado: EscenarioSensibilidad | null;
}

function clonarProyecto(proyecto: Proyecto): Proyecto {
  return structuredClone(proyecto);
}

function multiplicarPrecios(proyecto: Proyecto, factor: number): Proyecto {
  const out = clonarProyecto(proyecto);
  out.productos = out.productos.map((producto) => ({
    ...producto,
    precios: producto.precios.map((precio) => precio * factor) as [
      number,
      number,
      number,
      number,
      number,
    ],
    precioVenta: producto.precioVenta != null ? producto.precioVenta * factor : producto.precioVenta,
  }));
  return out;
}

function multiplicarVolumen(proyecto: Proyecto, factor: number): Proyecto {
  const out = clonarProyecto(proyecto);
  out.productos = out.productos.map((producto) => ({
    ...producto,
    cantidades: producto.cantidades.map((cantidad) => cantidad * factor) as [
      number,
      number,
      number,
      number,
      number,
    ],
  }));
  return out;
}

function multiplicarCostosOperativos(proyecto: Proyecto, factor: number): Proyecto {
  const out = clonarProyecto(proyecto);
  out.costosDirectos = out.costosDirectos.map((costo) => ({
    ...costo,
    costoUnitario: costo.costoUnitario * factor,
  }));
  out.costosAdministracion = out.costosAdministracion.map((costo) => ({
    ...costo,
    costoUnitario: costo.costoUnitario * factor,
  }));
  out.costosComercializacion = out.costosComercializacion.map((costo) => ({
    ...costo,
    costoUnitario: costo.costoUnitario * factor,
  }));
  out.personal = out.personal.map((puesto) => ({
    ...puesto,
    sueldoMensual: puesto.sueldoMensual * factor,
  }));
  return out;
}

function combinado(proyecto: Proyecto): Proyecto {
  return multiplicarCostosOperativos(multiplicarVolumen(multiplicarPrecios(proyecto, 1.05), 1.05), 0.95);
}

function crearEscenario(params: {
  id: string;
  tipo: TipoEscenarioSensibilidad;
  nombre: string;
  variableModificada: string;
  cambioAplicado: string;
  proyecto: Proyecto;
}): EscenarioSensibilidad {
  const resultado = construirFlujoCajaProyecto(params.proyecto);
  return {
    ...params,
    resultado,
    van: resultado.indicadores.van,
    tir: resultado.indicadores.tir,
    wacc: resultado.wacc,
    payback: resultado.indicadores.payback,
    esViable:
      resultado.indicadores.van > 0 &&
      Number.isFinite(resultado.indicadores.tir) &&
      resultado.indicadores.tir > resultado.wacc,
  };
}

/**
 * Analisis de sensibilidad oficial. Genera palancas razonables para evaluar
 * si un proyecto inviable puede recalibrarse sin inventar numeros en la UI.
 */
export function analizarSensibilidadProyecto(proyecto: Proyecto): AnalisisSensibilidadProyecto {
  const base = crearEscenario({
    id: "base",
    tipo: "base",
    nombre: "Escenario base",
    variableModificada: "Sin cambios",
    cambioAplicado: "0%",
    proyecto,
  });

  const escenarios = [
    crearEscenario({
      id: "precio-10",
      tipo: "precio",
      nombre: "Precio promedio +10%",
      variableModificada: "Precio promedio",
      cambioAplicado: "+10%",
      proyecto: multiplicarPrecios(proyecto, 1.1),
    }),
    crearEscenario({
      id: "volumen-10",
      tipo: "volumen",
      nombre: "Volumen de operacion +10%",
      variableModificada: "Cantidad vendida / demanda",
      cambioAplicado: "+10%",
      proyecto: multiplicarVolumen(proyecto, 1.1),
    }),
    crearEscenario({
      id: "costos-10",
      tipo: "costos",
      nombre: "Costos operativos -10%",
      variableModificada: "Costos directos, gastos y personal",
      cambioAplicado: "-10%",
      proyecto: multiplicarCostosOperativos(proyecto, 0.9),
    }),
    crearEscenario({
      id: "recalibrado",
      tipo: "combinado",
      nombre: "Combinacion recalibrada",
      variableModificada: "Precio + volumen + costos",
      cambioAplicado: "Precio +5%, volumen +5%, costos -5%",
      proyecto: combinado(proyecto),
    }),
  ];

  const recomendado =
    escenarios
      .filter((escenario) => escenario.esViable)
      .sort((a, b) => b.van - a.van)[0] ?? null;

  return { base, escenarios, recomendado };
}
