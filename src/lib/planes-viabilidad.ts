import { aplicarModificadores, ESCENARIO_NEUTRAL, type ModificadoresEscenario } from "./escenarios";
import { construirFlujoCajaProyecto } from "./finanzas/proyecto-financiero";
import type { Proyecto } from "@/types/proyecto";

export interface PlanViabilidad {
  id: string;
  perspectiva: string;
  titulo: string;
  alcanzable: boolean;
  resumen: string;
  vanResultante: number | null;
  tirResultante: number | null;
  waccResultante: number | null;
  modificadores: ModificadoresEscenario | null;
}

function esViableProyecto(proyecto: Proyecto, mods: ModificadoresEscenario) {
  const res = construirFlujoCajaProyecto(aplicarModificadores(proyecto, mods));
  const ok =
    res.indicadores.van > 0 &&
    Number.isFinite(res.indicadores.tir) &&
    res.indicadores.tir > res.wacc;
  return { ok, res };
}

/**
 * Búsqueda binaria creciente: busca el menor t in [0, 1] tal que
 * construirMods(t) haga al proyecto viable (VAN > 0 y TIR > WACC).
 */
function buscarMinimoT(
  proyecto: Proyecto,
  construirMods: (t: number) => ModificadoresEscenario
): { t: number; res: ReturnType<typeof construirFlujoCajaProyecto> } | null {
  const pruebaMax = esViableProyecto(proyecto, construirMods(1));
  if (!pruebaMax.ok) return null;
  const pruebaCero = esViableProyecto(proyecto, construirMods(0));
  if (pruebaCero.ok) return { t: 0, res: pruebaCero.res };

  let bajo = 0;
  let alto = 1;
  let mejorRes = pruebaMax.res;
  for (let i = 0; i < 24; i++) {
    const medio = (bajo + alto) / 2;
    const { ok, res } = esViableProyecto(proyecto, construirMods(medio));
    if (ok) {
      alto = medio;
      mejorRes = res;
    } else {
      bajo = medio;
    }
  }
  return { t: alto, res: mejorRes };
}

function fmtPct(v: number) {
  return `${v >= 10 ? v.toFixed(0) : v.toFixed(1)}%`;
}

/**
 * Analiza un proyecto (especialmente uno no rentable) y devuelve recetas
 * concretas desde 5 perspectivas distintas para hacerlo viable.
 */
export function generarPlanesViabilidad(proyecto: Proyecto): PlanViabilidad[] {
  const planes: PlanViabilidad[] = [];

  // 1. Perspectiva Precio (hasta +300%)
  {
    const modsFn = (t: number): ModificadoresEscenario => ({
      ...ESCENARIO_NEUTRAL,
      precioMul: 1 + t * 3.0,
    });
    const hallado = buscarMinimoT(proyecto, modsFn);
    if (hallado) {
      const pct = hallado.t * 300;
      planes.push({
        id: "precio",
        perspectiva: "Comercial · Precio",
        titulo: `Subir precio de venta en +${fmtPct(pct)}`,
        alcanzable: true,
        resumen: `Aumentando tus precios un ${fmtPct(pct)} (manteniendo costos y ventas iguales) el proyecto pasa a ser viable.`,
        vanResultante: hallado.res.indicadores.van,
        tirResultante: hallado.res.indicadores.tir,
        waccResultante: hallado.res.wacc,
        modificadores: modsFn(hallado.t),
      });
    } else {
      planes.push({
        id: "precio",
        perspectiva: "Comercial · Precio",
        titulo: "Subir solo el precio",
        alcanzable: false,
        resumen: "Incluso multiplicando el precio x4 (+300%) no alcanza para cubrir costos e inversión.",
        vanResultante: null,
        tirResultante: null,
        waccResultante: null,
        modificadores: null,
      });
    }
  }

  // 2. Perspectiva Demanda / Volumen (hasta +400%)
  {
    const modsFn = (t: number): ModificadoresEscenario => ({
      ...ESCENARIO_NEUTRAL,
      demandaMul: 1 + t * 4.0,
    });
    const hallado = buscarMinimoT(proyecto, modsFn);
    if (hallado) {
      const pct = hallado.t * 400;
      planes.push({
        id: "demanda",
        perspectiva: "Comercial · Volumen",
        titulo: `Aumentar ventas/demanda en +${fmtPct(pct)}`,
        alcanzable: true,
        resumen: `Vendiendo un ${fmtPct(pct)} más de unidades al mismo precio, cubres tus costos fijos y recuperas la inversión.`,
        vanResultante: hallado.res.indicadores.van,
        tirResultante: hallado.res.indicadores.tir,
        waccResultante: hallado.res.wacc,
        modificadores: modsFn(hallado.t),
      });
    } else {
      planes.push({
        id: "demanda",
        perspectiva: "Comercial · Volumen",
        titulo: "Aumentar solo las ventas",
        alcanzable: false,
        resumen:
          "Vender más volumen por sí solo no resuelve el proyecto (posible margen unitario negativo o muy bajo; primero revisa precio o costo directo).",
        vanResultante: null,
        tirResultante: null,
        waccResultante: null,
        modificadores: null,
      });
    }
  }

  // 3. Perspectiva Eficiencia en Costos y Gastos (hasta -85%)
  {
    const modsFn = (t: number): ModificadoresEscenario => {
      const mul = Math.max(0.15, 1 - t * 0.85);
      return {
        ...ESCENARIO_NEUTRAL,
        costoDirectoMul: mul,
        costoGeneralMul: mul,
        personalMul: mul,
      };
    };
    const hallado = buscarMinimoT(proyecto, modsFn);
    if (hallado) {
      const pct = hallado.t * 85;
      planes.push({
        id: "costos",
        perspectiva: "Eficiencia · Costos y Gastos",
        titulo: `Reducir costos directos, gastos y sueldos en -${fmtPct(pct)}`,
        alcanzable: true,
        resumen: `Recortando todos tus costos operativos y directos en ${fmtPct(pct)}, el negocio se vuelve rentable sin subir precios.`,
        vanResultante: hallado.res.indicadores.van,
        tirResultante: hallado.res.indicadores.tir,
        waccResultante: hallado.res.wacc,
        modificadores: modsFn(hallado.t),
      });
    } else {
      planes.push({
        id: "costos",
        perspectiva: "Eficiencia · Costos y Gastos",
        titulo: "Recortar solo costos y gastos",
        alcanzable: false,
        resumen: "Incluso reduciendo costos y gastos en 85%, la inversión o los ingresos actuales no alcanzan.",
        vanResultante: null,
        tirResultante: null,
        waccResultante: null,
        modificadores: null,
      });
    }
  }

  // 4. Perspectiva Inversión Inicial (hasta -85%)
  {
    const modsFn = (t: number): ModificadoresEscenario => ({
      ...ESCENARIO_NEUTRAL,
      inversionMul: Math.max(0.15, 1 - t * 0.85),
    });
    const hallado = buscarMinimoT(proyecto, modsFn);
    if (hallado) {
      const pct = hallado.t * 85;
      planes.push({
        id: "inversion",
        perspectiva: "Capex · Inversión Inicial",
        titulo: `Reducir inversión en activos fijos en -${fmtPct(pct)}`,
        alcanzable: true,
        resumen: `Arrancando con una inversión ${fmtPct(pct)} más liviana (ej. alquilando en vez de comprar), el proyecto recupera y da VAN positivo.`,
        vanResultante: hallado.res.indicadores.van,
        tirResultante: hallado.res.indicadores.tir,
        waccResultante: hallado.res.wacc,
        modificadores: modsFn(hallado.t),
      });
    } else {
      planes.push({
        id: "inversion",
        perspectiva: "Capex · Inversión Inicial",
        titulo: "Reducir solo la inversión inicial",
        alcanzable: false,
        resumen: "El flujo operativo anual es negativo o insuficiente incluso con una inversión 85% menor.",
        vanResultante: null,
        tirResultante: null,
        waccResultante: null,
        modificadores: null,
      });
    }
  }

  // 5. Perspectiva Mixta Equilibrada (combinar todo de a poco, hasta ±75%)
  {
    const modsFn = (t: number): ModificadoresEscenario => {
      const p = t * 0.75;
      return {
        ...ESCENARIO_NEUTRAL,
        precioMul: 1 + p,
        demandaMul: 1 + p,
        costoDirectoMul: Math.max(0.2, 1 - p),
        costoGeneralMul: Math.max(0.2, 1 - p),
        personalMul: Math.max(0.2, 1 - p),
        inversionMul: Math.max(0.2, 1 - p),
      };
    };
    const hallado = buscarMinimoT(proyecto, modsFn);
    if (hallado) {
      const pct = hallado.t * 75;
      planes.push({
        id: "mixta",
        perspectiva: "Estrategia Combinada (Recomendada)",
        titulo: `Ajuste equilibrado de ±${fmtPct(pct)} en todas las palancas`,
        alcanzable: true,
        resumen: `Subir precio y ventas +${fmtPct(pct)}, y reducir costos, gastos e inversión -${fmtPct(pct)}. Es el camino más realista porque reparte el esfuerzo.`,
        vanResultante: hallado.res.indicadores.van,
        tirResultante: hallado.res.indicadores.tir,
        waccResultante: hallado.res.wacc,
        modificadores: modsFn(hallado.t),
      });
    } else {
      planes.push({
        id: "mixta",
        perspectiva: "Estrategia Combinada",
        titulo: "Ajuste combinado",
        alcanzable: false,
        resumen: "La estructura actual está muy lejos del equilibrio; revisa las unidades, precios o moneda ingresada en los pasos anteriores.",
        vanResultante: null,
        tirResultante: null,
        waccResultante: null,
        modificadores: null,
      });
    }
  }

  return planes;
}
