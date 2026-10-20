/**
 * Análisis de riesgo del proyecto: tornado, tabla de dos variables y Montecarlo.
 *
 * Funciones PURAS construidas sobre `aplicarModificadores` + `construirFlujoCaja`,
 * así que usan exactamente las mismas fórmulas que el resto de la app. No tocan
 * el proyecto original ni la base de datos.
 */
import { construirFlujoCaja } from "./flujo-proyecto";
import {
  aplicarModificadores,
  DEFAULT_OPTIMISTA,
  DEFAULT_PESIMISTA,
  ESCENARIO_NEUTRAL,
  esViable,
  type ModificadoresEscenario,
} from "./escenarios";
import type { Proyecto } from "@/types/proyecto";

type CampoMul =
  | "precioMul"
  | "demandaMul"
  | "costoDirectoMul"
  | "costoGeneralMul"
  | "personalMul"
  | "inversionMul";

const CAMPOS_MUL: CampoMul[] = [
  "precioMul",
  "demandaMul",
  "costoDirectoMul",
  "costoGeneralMul",
  "personalMul",
  "inversionMul",
];

function vanDe(proyecto: Proyecto, mods: ModificadoresEscenario): number {
  return construirFlujoCaja(aplicarModificadores(proyecto, mods)).indicadores.van;
}

// ============================================================================
// TORNADO
// ============================================================================

export interface FilaTornado {
  variable: string;
  /** VAN con la variable en su valor desfavorable (-x% ingresos, +x% costos). */
  vanBajo: number;
  /** VAN con la variable en su valor favorable. */
  vanAlto: number;
  /** Amplitud |vanAlto - vanBajo|: cuánto mueve la variable al VAN. */
  amplitud: number;
}

export interface ResultadoTornado {
  vanBase: number;
  variacion: number;
  filas: FilaTornado[];
}

const VARIABLES_TORNADO: Array<{
  campo: CampoMul | "tasa";
  etiqueta: string;
  /** +1: subir la variable mejora el VAN (ingresos). -1: lo empeora (costos). */
  signo: 1 | -1;
}> = [
  { campo: "precioMul", etiqueta: "Precio de venta", signo: 1 },
  { campo: "demandaMul", etiqueta: "Demanda / volumen", signo: 1 },
  { campo: "costoDirectoMul", etiqueta: "Costos directos", signo: -1 },
  { campo: "costoGeneralMul", etiqueta: "Gastos generales", signo: -1 },
  { campo: "personalMul", etiqueta: "Sueldos", signo: -1 },
  { campo: "inversionMul", etiqueta: "Inversión inicial", signo: -1 },
];

/**
 * Mueve de a una variable ±`variacion` (0.10 = 10%) y mide el VAN. Devuelve las
 * filas ordenadas de la que más mueve el VAN a la que menos.
 */
export function calcularTornado(proyecto: Proyecto, variacion = 0.1): ResultadoTornado {
  const vanBase = vanDe(proyecto, ESCENARIO_NEUTRAL);
  const filas: FilaTornado[] = VARIABLES_TORNADO.map(({ campo, etiqueta }) => {
    const subida = vanDe(proyecto, { ...ESCENARIO_NEUTRAL, [campo]: 1 + variacion });
    const bajada = vanDe(proyecto, { ...ESCENARIO_NEUTRAL, [campo]: 1 - variacion });
    return {
      variable: etiqueta,
      vanBajo: Math.min(subida, bajada),
      vanAlto: Math.max(subida, bajada),
      amplitud: Math.abs(subida - bajada),
    };
  });
  filas.sort((a, b) => b.amplitud - a.amplitud);
  return { vanBase, variacion, filas };
}

// ============================================================================
// TABLA DE DOS VARIABLES
// ============================================================================

export interface TablaDosVariables {
  /** Cambios porcentuales de las filas (ej. precio) y de las columnas (ej. demanda). */
  cambiosFila: number[];
  cambiosColumna: number[];
  /** valores[fila][columna] = VAN. */
  valores: number[][];
}

/** VAN para combinaciones de cambio de precio (filas) y demanda (columnas). */
export function tablaPrecioDemanda(
  proyecto: Proyecto,
  cambios: number[] = [-0.2, -0.1, 0, 0.1, 0.2]
): TablaDosVariables {
  const valores = cambios.map((cp) =>
    cambios.map((cd) =>
      vanDe(proyecto, { ...ESCENARIO_NEUTRAL, precioMul: 1 + cp, demandaMul: 1 + cd })
    )
  );
  return { cambiosFila: cambios, cambiosColumna: cambios, valores };
}

// ============================================================================
// MONTECARLO
// ============================================================================

export interface BinHistograma {
  desde: number;
  hasta: number;
  cantidad: number;
}

export interface ResultadoMontecarlo {
  corridas: number;
  probVanPositivo: number;
  /** VAN > 0 y TIR > WACC. */
  probViable: number;
  media: number;
  p5: number;
  p50: number;
  p95: number;
  minimo: number;
  maximo: number;
  histograma: BinHistograma[];
}

/** Generador pseudoaleatorio con semilla (mulberry32): resultados reproducibles. */
export function crearAleatorio(semilla: number): () => number {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Muestra una distribución triangular (mínimo, moda, máximo). */
export function muestraTriangular(
  minimo: number,
  moda: number,
  maximo: number,
  u: number
): number {
  if (maximo <= minimo) return moda;
  const corte = (moda - minimo) / (maximo - minimo);
  if (u < corte) return minimo + Math.sqrt(u * (maximo - minimo) * (moda - minimo));
  return maximo - Math.sqrt((1 - u) * (maximo - minimo) * (maximo - moda));
}

function percentil(ordenados: number[], p: number): number {
  if (ordenados.length === 0) return 0;
  const idx = Math.min(ordenados.length - 1, Math.max(0, Math.round(p * (ordenados.length - 1))));
  return ordenados[idx];
}

export function resumirVans(vans: number[], viables: number, bins = 14): ResultadoMontecarlo {
  const n = vans.length;
  const ordenados = [...vans].sort((a, b) => a - b);
  const minimo = ordenados[0] ?? 0;
  const maximo = ordenados[n - 1] ?? 0;
  const ancho = (maximo - minimo) / bins || 1;
  const histograma: BinHistograma[] = Array.from({ length: bins }, (_, i) => ({
    desde: minimo + i * ancho,
    hasta: minimo + (i + 1) * ancho,
    cantidad: 0,
  }));
  for (const v of vans) {
    const i = Math.min(bins - 1, Math.floor((v - minimo) / ancho));
    histograma[i].cantidad++;
  }
  return {
    corridas: n,
    probVanPositivo: n ? vans.filter((v) => v > 0).length / n : 0,
    probViable: n ? viables / n : 0,
    media: n ? vans.reduce((s, v) => s + v, 0) / n : 0,
    p5: percentil(ordenados, 0.05),
    p50: percentil(ordenados, 0.5),
    p95: percentil(ordenados, 0.95),
    minimo,
    maximo,
    histograma,
  };
}

/**
 * Simula `corridas` futuros posibles. Cada variable se sortea con distribución
 * triangular entre el escenario pesimista, el base (moda) y el optimista, que
 * son los mismos que el docente configura para el curso. `onProgreso` permite
 * ceder el hilo a la UI entre lotes.
 */
export async function simularMontecarlo(
  proyecto: Proyecto,
  opciones: {
    corridas?: number;
    semilla?: number;
    optimista?: ModificadoresEscenario;
    pesimista?: ModificadoresEscenario;
    onProgreso?: (fraccion: number) => void;
  } = {}
): Promise<ResultadoMontecarlo> {
  const {
    corridas = 500,
    semilla = 20260101,
    optimista = DEFAULT_OPTIMISTA,
    pesimista = DEFAULT_PESIMISTA,
    onProgreso,
  } = opciones;
  const aleatorio = crearAleatorio(semilla);
  const vans: number[] = [];
  let viables = 0;
  const LOTE = 25;

  for (let i = 0; i < corridas; i++) {
    const mods: ModificadoresEscenario = { ...ESCENARIO_NEUTRAL };
    for (const campo of CAMPOS_MUL) {
      const a = optimista[campo];
      const b = pesimista[campo];
      mods[campo] = muestraTriangular(Math.min(a, b), 1, Math.max(a, b), aleatorio());
    }
    const flujo = construirFlujoCaja(aplicarModificadores(proyecto, mods));
    vans.push(flujo.indicadores.van);
    if (esViable(flujo)) viables++;

    if ((i + 1) % LOTE === 0) {
      onProgreso?.((i + 1) / corridas);
      await new Promise((r) => setTimeout(r, 0));
    }
  }
  return resumirVans(vans, viables);
}

// ============================================================================
// VEREDICTO
// ============================================================================

export type NivelVeredicto = "robusto" | "sensible" | "riesgoso" | "inviable";

export interface Veredicto {
  nivel: NivelVeredicto;
  titulo: string;
  detalle: string;
}

/** Resume en lenguaje simple qué dicen el tornado y Montecarlo juntos. */
export function emitirVeredicto(
  tornado: ResultadoTornado,
  montecarlo: ResultadoMontecarlo | null
): Veredicto {
  const principal = tornado.filas[0]?.variable.toLowerCase() ?? "una variable clave";
  const pct = Math.round(tornado.variacion * 100);

  if (!montecarlo) {
    const cambiaSigno = tornado.filas.some((f) => f.vanBajo < 0 !== tornado.vanBase < 0);
    return cambiaSigno
      ? {
          nivel: "sensible",
          titulo: "Sensible",
          detalle: `Un cambio de ${pct}% en ${principal} puede cambiar la conclusión del proyecto. Corré la simulación de riesgo para medir la probabilidad.`,
        }
      : {
          nivel: tornado.vanBase > 0 ? "robusto" : "inviable",
          titulo: tornado.vanBase > 0 ? "Robusto" : "Inviable",
          detalle: `Ninguna variable individual cambia el signo del VAN con ${pct}% de variación. Corré la simulación de riesgo para confirmarlo.`,
        };
  }

  const p = montecarlo.probVanPositivo;
  const porc = Math.round(p * 100);
  if (p >= 0.8) {
    return {
      nivel: "robusto",
      titulo: "Robusto",
      detalle: `El VAN es positivo en ${porc}% de los futuros simulados. La variable que más lo mueve es ${principal}.`,
    };
  }
  if (p >= 0.5) {
    return {
      nivel: "sensible",
      titulo: "Sensible",
      detalle: `El VAN es positivo en ${porc}% de los futuros simulados. Vigilá especialmente ${principal}.`,
    };
  }
  if (p >= 0.2) {
    return {
      nivel: "riesgoso",
      titulo: "Riesgoso",
      detalle: `Solo ${porc}% de los futuros simulados da VAN positivo. Conviene mejorar ${principal} antes de invertir.`,
    };
  }
  return {
    nivel: "inviable",
    titulo: "Inviable",
    detalle: `Solo ${porc}% de los futuros simulados da VAN positivo. Con estos supuestos el proyecto rara vez se recupera.`,
  };
}
