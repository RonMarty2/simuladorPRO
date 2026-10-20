import { construirFlujoCajaProyecto } from "@/lib/finanzas/proyecto-financiero";
import { analizarSensibilidadProyecto } from "@/lib/finanzas/sensibilidad";
import { compararEscenarios, esViable } from "@/lib/escenarios";
import { calcularTornado } from "@/lib/analisis-riesgo";
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
  | "equilibrio"
  | "financiamiento"
  | "flujo"
  | "indicadores"
  | "riesgo"
  | "escenarios"
  | "montecarlo"
  | "laboratorio"
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

  // Optimista / Base / Pesimista con los valores por defecto (la presentación
  // no conoce la config del curso). Mismo cálculo que la pantalla Escenarios.
  const escenarios = compararEscenarios(proyecto).map((e) => {
    let acumulado = 0;
    return {
      nombre: e.etiqueta,
      clave: e.nombre,
      van: finito(e.flujo.indicadores.van),
      tir: e.flujo.indicadores.tir,
      payback: e.flujo.indicadores.payback,
      viable: esViable(e.flujo),
      acumulado: e.flujo.flujoCaja.map((valor, indice) => {
        acumulado += finito(valor);
        return { anio: indice === 0 ? "Inicio" : `Año ${indice}`, valor: Math.round(acumulado) };
      }),
    };
  });
  const tornado = calcularTornado(proyecto, 0.1);

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
      id: "equilibrio",
      titulo: "Punto de equilibrio",
      etiqueta: "06 · Umbral operativo",
      visible:
        mercado[0].demanda > 0 &&
        Number.isFinite(resultado.puntoEquilibrio.unidades),
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
    {
      id: "escenarios",
      titulo: "Tres futuros posibles",
      etiqueta: "Escenarios",
      visible: nivel !== "basico",
    },
    {
      id: "montecarlo",
      titulo: "¿Qué tan seguro es?",
      etiqueta: "Simulación de riesgo",
      visible: nivel !== "basico",
    },
    {
      id: "laboratorio",
      titulo: "Laboratorio de viabilidad",
      etiqueta: "10 · Prueba en vivo",
      visible: true,
    },
    { id: "cierre", titulo: "Conclusión", etiqueta: "11 · Cierre", visible: true },
  ];

  const diapositivas = definiciones
    .filter((diapositiva) => diapositiva.visible)
    .map(({ visible: _visible, ...diapositiva }, indice) => ({
      ...diapositiva,
      // Numeración automática: así agregar o quitar diapositivas no deja
      // etiquetas repetidas o salteadas.
      etiqueta: `${String(indice + 1).padStart(2, "0")} · ${diapositiva.etiqueta.replace(/^d+ · /, "")}`,
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
    escenarios,
    tornado,
    diapositivas,
    totalProyecto,
    capitalPropio,
    deuda,
  };
}
