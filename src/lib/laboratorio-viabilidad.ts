import { aplicarModificadores, ESCENARIO_NEUTRAL } from "@/lib/escenarios";
import { construirFlujoCajaProyecto } from "@/lib/finanzas/proyecto-financiero";
import type { NivelSemanaE, Proyecto } from "@/types/proyecto";

export interface AjustesLaboratorio {
  precioPct: number;
  demandaPct: number;
  costoDirectoPct: number;
  costoFijoPct: number;
  deudaPct: number;
  tasaInteresPct: number;
}

export type VariableLaboratorio =
  | "precio"
  | "demanda"
  | "costoDirecto"
  | "costoFijo";

export interface UmbralViabilidad {
  variable: VariableLaboratorio;
  nombre: string;
  factor: number | null;
  texto: string;
  alcanzable: boolean;
}

export interface ImpactoVariable {
  variable: string;
  impactoVan: number;
  porcentaje: number;
}

export interface PuntoGraficoEquilibrio {
  unidades: number;
  ingresos: number;
  costos: number;
}

function limitar(valor: number, minimo: number, maximo: number) {
  return Math.min(maximo, Math.max(minimo, valor));
}

function esViable(van: number, tir: number, wacc: number) {
  return van > 0 && Number.isFinite(tir) && tir > wacc;
}

export function crearAjustesLaboratorioIniciales(
  proyecto: Proyecto
): AjustesLaboratorio {
  const resultado = construirFlujoCajaProyecto(proyecto);
  const deudaPct =
    resultado.totalProyecto > 0
      ? (resultado.montoPrestamo / resultado.totalProyecto) * 100
      : 0;
  return {
    precioPct: 0,
    demandaPct: 0,
    costoDirectoPct: 0,
    costoFijoPct: 0,
    deudaPct,
    tasaInteresPct:
      (proyecto.financiamiento?.tasaInteresAnual ?? 0) * 100,
  };
}

export function aplicarAjustesLaboratorio(
  proyecto: Proyecto,
  ajustes: AjustesLaboratorio
): Proyecto {
  const tasaBase = proyecto.financiamiento?.tasaInteresAnual ?? 0;
  const resultadoBase = construirFlujoCajaProyecto(proyecto);
  const deudaBasePct =
    resultadoBase.totalProyecto > 0
      ? (resultadoBase.montoPrestamo / resultadoBase.totalProyecto) * 100
      : 0;
  const deudaCambio = Math.abs(ajustes.deudaPct - deudaBasePct) > 0.001;
  const tasaCambio =
    Math.abs(ajustes.tasaInteresPct / 100 - tasaBase) > 0.00001;
  return aplicarModificadores(proyecto, {
    ...ESCENARIO_NEUTRAL,
    precioMul: Math.max(0.01, 1 + ajustes.precioPct / 100),
    demandaMul: Math.max(0.01, 1 + ajustes.demandaPct / 100),
    costoDirectoMul: Math.max(0.01, 1 + ajustes.costoDirectoPct / 100),
    costoGeneralMul: Math.max(0.01, 1 + ajustes.costoFijoPct / 100),
    personalMul: Math.max(0.01, 1 + ajustes.costoFijoPct / 100),
    prestamoPorcentaje: deudaCambio
      ? limitar(ajustes.deudaPct / 100, 0, 0.8)
      : undefined,
    tasaInteresDeltaPp: tasaCambio
      ? Math.max(0, ajustes.tasaInteresPct / 100) - tasaBase
      : undefined,
  });
}

function resumenOperativo(proyecto: Proyecto) {
  const resultado = construirFlujoCajaProyecto(proyecto);
  const unidadesAnio1 = proyecto.productos.reduce(
    (total, producto) => total + Number(producto.cantidades?.[0] ?? 0),
    0
  );
  const precioPromedio =
    unidadesAnio1 > 0 ? resultado.ingresos[0] / unidadesAnio1 : 0;
  const costoVariableUnitario =
    unidadesAnio1 > 0 ? resultado.costosProduccion[0] / unidadesAnio1 : 0;
  const costosFijos =
    resultado.gastosAdmin[0] +
    resultado.gastosComerc[0] +
    resultado.personal[0] +
    resultado.imprevistos[0];
  const equilibrio = resultado.puntoEquilibrio;
  const margenSeguridad =
    unidadesAnio1 > 0 && Number.isFinite(equilibrio.unidades)
      ? (unidadesAnio1 - equilibrio.unidades) / unidadesAnio1
      : Number.NEGATIVE_INFINITY;

  return {
    resultado,
    unidadesAnio1,
    precioPromedio,
    costoVariableUnitario,
    costosFijos,
    equilibrio,
    margenSeguridad,
    viable: esViable(
      resultado.indicadores.van,
      resultado.indicadores.tir,
      resultado.wacc
    ),
  };
}

export function calcularEscenarioLaboratorio(
  proyecto: Proyecto,
  ajustes: AjustesLaboratorio
) {
  const proyectoAjustado = aplicarAjustesLaboratorio(proyecto, ajustes);
  const resumen = resumenOperativo(proyectoAjustado);
  const maximoUnidades = Math.max(
    resumen.unidadesAnio1,
    Number.isFinite(resumen.equilibrio.unidades)
      ? resumen.equilibrio.unidades
      : resumen.unidadesAnio1,
    1
  );
  const graficoEquilibrio: PuntoGraficoEquilibrio[] = Array.from(
    { length: 9 },
    (_, indice) => {
      const unidades = (maximoUnidades * 1.25 * indice) / 8;
      return {
        unidades,
        ingresos: unidades * resumen.precioPromedio,
        costos:
          resumen.costosFijos + unidades * resumen.costoVariableUnitario,
      };
    }
  );

  return {
    ...resumen,
    proyectoAjustado,
    graficoEquilibrio,
    deudaPct:
      resumen.resultado.totalProyecto > 0
        ? (resumen.resultado.montoPrestamo / resumen.resultado.totalProyecto) *
          100
        : 0,
  };
}

function proyectoConFactor(
  proyecto: Proyecto,
  variable: VariableLaboratorio,
  factor: number
) {
  return aplicarModificadores(proyecto, {
    ...ESCENARIO_NEUTRAL,
    precioMul: variable === "precio" ? factor : 1,
    demandaMul: variable === "demanda" ? factor : 1,
    costoDirectoMul: variable === "costoDirecto" ? factor : 1,
    costoGeneralMul: variable === "costoFijo" ? factor : 1,
    personalMul: variable === "costoFijo" ? factor : 1,
  });
}

function viableConFactor(
  proyecto: Proyecto,
  variable: VariableLaboratorio,
  factor: number
) {
  const resultado = construirFlujoCajaProyecto(
    proyectoConFactor(proyecto, variable, factor)
  );
  return esViable(
    resultado.indicadores.van,
    resultado.indicadores.tir,
    resultado.wacc
  );
}

function buscarUmbral(
  proyecto: Proyecto,
  variable: VariableLaboratorio
): number | null {
  const aumentaViabilidad = variable === "precio" || variable === "demanda";
  const minimo = 0.3;
  const maximo = 2;
  const viableMinimo = viableConFactor(proyecto, variable, minimo);
  const viableMaximo = viableConFactor(proyecto, variable, maximo);

  if (aumentaViabilidad && !viableMaximo) return null;
  if (!aumentaViabilidad && !viableMinimo) return null;

  if (aumentaViabilidad && viableMinimo) return minimo;
  if (!aumentaViabilidad && viableMaximo) return maximo;

  let bajo = minimo;
  let alto = maximo;
  for (let intento = 0; intento < 24; intento += 1) {
    const medio = (bajo + alto) / 2;
    const viable = viableConFactor(proyecto, variable, medio);
    if (aumentaViabilidad) {
      if (viable) alto = medio;
      else bajo = medio;
    } else if (viable) {
      bajo = medio;
    } else {
      alto = medio;
    }
  }
  return aumentaViabilidad ? alto : bajo;
}

function textoUmbral(
  variable: VariableLaboratorio,
  factor: number | null,
  baseViable: boolean
) {
  const nombre = {
    precio: "Precio promedio",
    demanda: "Ventas",
    costoDirecto: "Costos directos",
    costoFijo: "Costos fijos",
  }[variable];
  if (factor == null) {
    return `${nombre}: el rango probado todavía no alcanza la viabilidad.`;
  }

  const cambio = Math.abs((factor - 1) * 100);
  const porcentaje = `${cambio.toFixed(cambio >= 10 ? 0 : 1)}%`;
  if (variable === "precio" || variable === "demanda") {
    if (baseViable) {
      return factor <= 0.301
        ? `${nombre}: resiste al menos una caída de 70%.`
        : `${nombre}: puede bajar ${porcentaje} antes de perder viabilidad.`;
    }
    return `${nombre}: necesita subir al menos ${porcentaje} para ser viable.`;
  }

  if (baseViable) {
    return factor >= 1.999
      ? `${nombre}: resiste al menos un aumento de 100%.`
      : `${nombre}: puede subir ${porcentaje} antes de perder viabilidad.`;
  }
  return `${nombre}: necesita bajar al menos ${porcentaje} para ser viable.`;
}

function variablesPorNivel(nivel: NivelSemanaE): VariableLaboratorio[] {
  if (nivel === "basico") return ["precio", "demanda", "costoDirecto"];
  return ["precio", "demanda", "costoDirecto", "costoFijo"];
}

export function analizarLimitesViabilidad(
  proyecto: Proyecto,
  nivel: NivelSemanaE
) {
  const base = resumenOperativo(proyecto);
  const variables = variablesPorNivel(nivel);
  const nombres: Record<VariableLaboratorio, string> = {
    precio: "Precio promedio",
    demanda: "Ventas",
    costoDirecto: "Costos directos",
    costoFijo: "Costos fijos",
  };
  const umbrales: UmbralViabilidad[] = variables.map((variable) => {
    const factor = buscarUmbral(proyecto, variable);
    return {
      variable,
      nombre: nombres[variable],
      factor,
      texto: textoUmbral(variable, factor, base.viable),
      alcanzable: factor != null,
    };
  });

  const vanBase = base.resultado.indicadores.van;
  const impactosSinNormalizar = variables.map((variable) => {
    const vanMenos = construirFlujoCajaProyecto(
      proyectoConFactor(proyecto, variable, 0.9)
    ).indicadores.van;
    const vanMas = construirFlujoCajaProyecto(
      proyectoConFactor(proyecto, variable, 1.1)
    ).indicadores.van;
    return {
      variable: nombres[variable],
      impactoVan: Math.max(Math.abs(vanMenos - vanBase), Math.abs(vanMas - vanBase)),
    };
  });
  const maximoImpacto = Math.max(
    ...impactosSinNormalizar.map((item) => item.impactoVan),
    1
  );
  const impactos: ImpactoVariable[] = impactosSinNormalizar
    .map((item) => ({
      ...item,
      porcentaje: (item.impactoVan / maximoImpacto) * 100,
    }))
    .sort((a, b) => b.impactoVan - a.impactoVan);

  return { base, umbrales, impactos };
}
