import { construirFlujoCajaProyecto } from "@/lib/finanzas/proyecto-financiero";
import { analizarSensibilidadProyecto } from "@/lib/finanzas/sensibilidad";
import type {
  CategoriaInversion,
  NivelSemanaE,
  PresentacionProyecto,
  Proyecto,
} from "@/types/proyecto";

export type IdDiapositivaPitch =
  | "portada"
  | "oportunidad"
  | "mercado"
  | "inversion"
  | "operacion"
  | "financiamiento"
  | "flujo"
  | "indicadores"
  | "riesgo"
  | "cierre";

export interface DiapositivaPitch {
  id: IdDiapositivaPitch;
  numero: number;
  titulo: string;
  etiqueta: string;
}

const ETIQUETA_SECTOR: Record<string, string> = {
  produccion: "Producción",
  comercio: "Comercio",
  servicios: "Servicios",
  agricultura: "Agricultura",
  mixto: "Modelo mixto",
};

const ETIQUETA_INVERSION: Record<CategoriaInversion, string> = {
  terreno: "Terreno",
  obrasCiviles: "Obras civiles",
  maquinaria: "Maquinaria y equipos",
  mobiliario: "Mobiliario",
  activoDiferido: "Activos diferidos",
};

function finito(valor: number, alternativa = 0) {
  return Number.isFinite(valor) ? valor : alternativa;
}

export function nivelNarrativoProyecto(proyecto: Proyecto): NivelSemanaE {
  if (proyecto.nivelSemanaE) return proyecto.nivelSemanaE;
  return proyecto.version === "v2" ? "avanzado" : "medio";
}

export function crearPresentacionPredeterminada(proyecto: Proyecto): PresentacionProyecto {
  const resultado = construirFlujoCajaProyecto(proyecto);
  const viable =
    resultado.indicadores.van > 0 &&
    Number.isFinite(resultado.indicadores.tir) &&
    resultado.indicadores.tir > resultado.wacc;
  const productos = proyecto.productos
    .map((producto) => producto.nombre.trim())
    .filter(Boolean)
    .slice(0, 3);
  const oferta = productos.length > 0 ? productos.join(", ") : "una solución sostenible";
  const lugar = proyecto.ubicacion?.trim() || "el mercado objetivo";
  const sector = ETIQUETA_SECTOR[proyecto.sector] ?? "Proyecto de inversión";

  return {
    titulo: proyecto.nombre || "Proyecto de inversión",
    subtitulo: `${sector} · Evaluación de viabilidad`,
    expositores: "Equipo del proyecto",
    problema:
      proyecto.descripcion?.trim() ||
      `En ${lugar} identificamos una oportunidad que todavía no está siendo atendida de manera suficiente.`,
    propuestaValor: `Nuestra propuesta combina ${oferta} con una operación diseñada para crecer de forma rentable en ${lugar}.`,
    conclusion: viable
      ? `Los resultados respaldan la viabilidad del proyecto: crea valor, supera el rendimiento mínimo esperado y presenta una base financiera favorable para su ejecución.`
      : `El proyecto todavía requiere ajustes antes de ejecutarse. La prioridad es mejorar ingresos, controlar costos y reducir la inversión o el riesgo financiero hasta alcanzar una viabilidad sostenible.`,
  };
}

export function obtenerPresentacionProyecto(proyecto: Proyecto): PresentacionProyecto {
  return {
    ...crearPresentacionPredeterminada(proyecto),
    ...(proyecto.presentacion ?? {}),
  };
}

export function construirModeloPitch(proyecto: Proyecto) {
  const resultado = construirFlujoCajaProyecto(proyecto);
  const nivel = nivelNarrativoProyecto(proyecto);
  const viable =
    resultado.indicadores.van > 0 &&
    Number.isFinite(resultado.indicadores.tir) &&
    resultado.indicadores.tir > resultado.wacc;

  const mercado = [0, 1, 2, 3, 4].map((indice) => ({
    anio: `Año ${indice + 1}`,
    demanda: proyecto.productos.reduce(
      (total, producto) => total + Number(producto.cantidades?.[indice] ?? 0),
      0
    ),
    ingresos: finito(resultado.ingresos[indice]),
  }));

  const inversion = (Object.keys(proyecto.inversiones) as CategoriaInversion[])
    .map((categoria) => ({
      nombre: ETIQUETA_INVERSION[categoria],
      valor: proyecto.inversiones[categoria].reduce(
        (total, item) => total + Number(item.costoTotal ?? 0),
        0
      ),
    }))
    .filter((item) => item.valor > 0)
    .sort((a, b) => b.valor - a.valor);

  const operacion = [0, 1, 2, 3, 4].map((indice) => ({
    anio: `Año ${indice + 1}`,
    directos: finito(resultado.costosProduccion[indice]),
    personal: finito(resultado.personal[indice]),
    administracion: finito(resultado.gastosAdmin[indice]),
    comercializacion: finito(resultado.gastosComerc[indice]),
  }));

  let acumulado = 0;
  const flujo = resultado.flujoCaja.map((valor, indice) => {
    acumulado += finito(valor);
    return {
      anio: indice === 0 ? "Inicio" : `Año ${indice}`,
      flujo: finito(valor),
      acumulado,
    };
  });

  const totalProyecto = resultado.inversionInicial + resultado.capitalTrabajo;
  const deuda = Math.max(0, resultado.montoPrestamo);
  const capitalPropio = Math.max(0, totalProyecto - deuda);
  const financiamiento = [
    { nombre: "Capital propio", valor: capitalPropio },
    { nombre: "Financiamiento", valor: deuda },
  ].filter((item) => item.valor > 0);

  const sensibilidad = analizarSensibilidadProyecto(proyecto);
  const riesgo = [sensibilidad.base, ...sensibilidad.escenarios].map((escenario) => ({
    nombre: escenario.nombre.replace("Escenario ", ""),
    van: finito(escenario.van),
    viable: escenario.esViable,
  }));

  const definiciones: Array<Omit<DiapositivaPitch, "numero"> & { visible: boolean }> = [
    { id: "portada", titulo: "El proyecto", etiqueta: "01 · Apertura", visible: true },
    { id: "oportunidad", titulo: "Problema y propuesta", etiqueta: "02 · Oportunidad", visible: true },
    {
      id: "mercado",
      titulo: "Mercado e ingresos",
      etiqueta: "03 · Tracción proyectada",
      visible: mercado.some((dato) => dato.ingresos > 0 || dato.demanda > 0),
    },
    {
      id: "inversion",
      titulo: "Inversión necesaria",
      etiqueta: "04 · Recursos",
      visible: totalProyecto > 0,
    },
    {
      id: "operacion",
      titulo: "Estructura operativa",
      etiqueta: "05 · Operación",
      visible:
        nivel !== "basico" &&
        operacion.some(
          (dato) => dato.directos + dato.personal + dato.administracion + dato.comercializacion > 0
        ),
    },
    {
      id: "financiamiento",
      titulo: "Cómo se financia",
      etiqueta: "06 · Capital",
      visible: nivel === "avanzado" && financiamiento.length > 0,
    },
    { id: "flujo", titulo: "Flujo de caja", etiqueta: "07 · Cinco años", visible: true },
    { id: "indicadores", titulo: "Decisión financiera", etiqueta: "08 · Viabilidad", visible: true },
    {
      id: "riesgo",
      titulo: "Escenarios y sensibilidad",
      etiqueta: "09 · Riesgo",
      visible: nivel !== "basico",
    },
    { id: "cierre", titulo: "Conclusión", etiqueta: "10 · Cierre", visible: true },
  ];

  const diapositivas = definiciones
    .filter((diapositiva) => diapositiva.visible)
    .map(({ visible: _visible, ...diapositiva }, indice) => ({
      ...diapositiva,
      numero: indice + 1,
    }));

  return {
    resultado,
    nivel,
    viable,
    mercado,
    inversion,
    operacion,
    flujo,
    financiamiento,
    riesgo,
    diapositivas,
    totalProyecto,
    capitalPropio,
    deuda,
  };
}
