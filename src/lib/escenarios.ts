/**
 * Modo Escenarios — análisis de sensibilidad comparativo.
 *
 * Toma un Proyecto base y devuelve N variaciones con sus indicadores y flujo
 * de caja, para que el alumno (o docente en clase) compare lado a lado qué
 * pasa con el VAN/TIR si cambian variables clave (precio, demanda, costos,
 * sueldos, inversión, financiamiento).
 *
 * Diseñado como FUNCIÓN PURA: no toca el proyecto original (clona profundo),
 * no tira queries, no escribe en BD. Es solo cálculo.
 */
import { construirFlujoCaja, type FlujoCajaProyecto } from "./flujo-proyecto";
import type { Proyecto } from "@/types/proyecto";

// ============================================================================
// TIPOS
// ============================================================================

/**
 * Modificadores que aplica un escenario al proyecto base. Cada `Mul` es un
 * multiplicador (1.0 = sin cambio, 0.85 = -15%, 1.20 = +20%). Los campos de
 * financiamiento son override absoluto / delta puntual.
 */
export interface ModificadoresEscenario {
  /** Multiplica `productos[].precios`. */
  precioMul: number;
  /** Multiplica `productos[].cantidades`. */
  demandaMul: number;
  /** Multiplica `costosDirectos[].costoUnitario`. */
  costoDirectoMul: number;
  /** Multiplica `costosAdministracion[]` y `costosComercializacion[]`. */
  costoGeneralMul: number;
  /** Multiplica `personal[].sueldoMensual`. */
  personalMul: number;
  /** Multiplica el costo unitario de cada `inversiones[*][]`. */
  inversionMul: number;
  /** Multiplica `capitalTrabajo`. */
  capitalTrabajoMul: number;
  /** Override absoluto del % préstamo (0..1). `undefined` = no toca. */
  prestamoPorcentaje?: number;
  /** Delta a la tasa anual del préstamo, en PUNTOS porcentuales (0.03 = +3pp). */
  tasaInteresDeltaPp?: number;
  /** Delta al plazo en meses (entero, puede ser negativo). */
  plazoPrestamoDelta?: number;
}

export type NombreEscenario = "optimista" | "base" | "pesimista" | "personalizado";

export interface EscenarioCalculado {
  nombre: NombreEscenario;
  etiqueta: string;
  modificadores: ModificadoresEscenario;
  proyectoModificado: Proyecto;
  flujo: FlujoCajaProyecto;
}

/**
 * Config de escenarios que el DOCENTE define por curso (FASE A.2). Sobreescribe
 * los DEFAULTS hardcodeados. Todos los campos opcionales: lo que no esté seteado
 * cae al default. Se guarda en `cursos.escenarios_config` (JSONB).
 */
export interface EscenariosConfig {
  optimista?: Partial<ModificadoresEscenario>;
  pesimista?: Partial<ModificadoresEscenario>;
}

// ============================================================================
// DEFAULTS — los valores "de fábrica" para Optimista / Base / Pesimista.
// ============================================================================

export const ESCENARIO_NEUTRAL: ModificadoresEscenario = {
  precioMul: 1.0,
  demandaMul: 1.0,
  costoDirectoMul: 1.0,
  costoGeneralMul: 1.0,
  personalMul: 1.0,
  inversionMul: 1.0,
  capitalTrabajoMul: 1.0,
};

/** Optimista: entorno macro estable, mercado receptivo, banca con buena tasa. */
export const DEFAULT_OPTIMISTA: ModificadoresEscenario = {
  precioMul: 1.10,        // +10% precios (poder de fijación de precios)
  demandaMul: 1.15,       // +15% demanda
  costoDirectoMul: 0.95,  // -5% costos directos (negociación con proveedores)
  costoGeneralMul: 0.95,  // -5% gastos generales
  personalMul: 1.0,       // sueldos planos (sin presión inflacionaria)
  inversionMul: 1.0,
  capitalTrabajoMul: 1.0,
  tasaInteresDeltaPp: -0.02, // -2pp en la tasa del préstamo (mejor entorno)
};

export const DEFAULT_BASE: ModificadoresEscenario = ESCENARIO_NEUTRAL;

/** Pesimista: entorno boliviano duro — devaluación, riesgo país, escasez. */
export const DEFAULT_PESIMISTA: ModificadoresEscenario = {
  precioMul: 0.85,        // -15% precios (mercado castiga, competencia)
  demandaMul: 0.75,       // -25% demanda (caída del consumo)
  costoDirectoMul: 1.20,  // +20% costos directos (importados más caros)
  costoGeneralMul: 1.15,  // +15% gastos generales (inflación)
  personalMul: 1.05,      // +5% sueldos (presión sindical / inflación)
  inversionMul: 1.10,     // +10% inversión inicial (devaluación encarece equipos)
  capitalTrabajoMul: 1.10,
  tasaInteresDeltaPp: 0.03,  // +3pp en la tasa (riesgo país)
};

// ============================================================================
// LÓGICA
// ============================================================================

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj)) as T;
}

/**
 * Aplica modificadores a una COPIA del proyecto y la devuelve. El proyecto
 * original queda intacto.
 */
export function aplicarModificadores(
  proyecto: Proyecto,
  mods: ModificadoresEscenario
): Proyecto {
  const p = deepClone(proyecto);

  // Productos: precio × demanda.
  for (const prod of p.productos) {
    prod.precios = prod.precios.map((x) => x * mods.precioMul) as typeof prod.precios;
    prod.cantidades = prod.cantidades.map((x) => x * mods.demandaMul) as typeof prod.cantidades;
  }

  // Costos directos.
  for (const c of p.costosDirectos) {
    c.costoUnitario = c.costoUnitario * mods.costoDirectoMul;
  }

  // Costos generales (admin + comercialización).
  for (const c of p.costosAdministracion) {
    c.costoUnitario = c.costoUnitario * mods.costoGeneralMul;
  }
  for (const c of p.costosComercializacion) {
    c.costoUnitario = c.costoUnitario * mods.costoGeneralMul;
  }

  // Personal.
  for (const puesto of p.personal) {
    puesto.sueldoMensual = puesto.sueldoMensual * mods.personalMul;
  }

  // Inversiones (terreno, obras civiles, maquinaria, mobiliario, activoDiferido).
  // Cada item se reescala por costoUnitario y se recalculan los campos derivados.
  for (const items of Object.values(p.inversiones)) {
    for (const it of items as any[]) {
      it.costoUnitario = it.costoUnitario * mods.inversionMul;
      it.costoTotal = it.costoUnitario * it.cantidad;
      if (it.vidaUtilAnios) {
        it.depreciacionAnual = it.costoTotal / it.vidaUtilAnios;
        it.valorResidual = it.costoTotal; // residual antes de depreciar
      } else {
        it.valorResidual = it.costoTotal; // terreno conserva valor
      }
    }
  }

  // Capital de trabajo.
  p.capitalTrabajo = p.capitalTrabajo * mods.capitalTrabajoMul;

  // Financiamiento.
  if (p.financiamiento) {
    if (mods.prestamoPorcentaje !== undefined) {
      const pp = Math.max(0, Math.min(1, mods.prestamoPorcentaje));
      p.financiamiento.porcentajePrestamo = pp;
      p.financiamiento.porcentajePropio = 1 - pp;
    }
    if (mods.tasaInteresDeltaPp !== undefined) {
      p.financiamiento.tasaInteresAnual = Math.max(
        0,
        p.financiamiento.tasaInteresAnual + mods.tasaInteresDeltaPp
      );
    }
    if (mods.plazoPrestamoDelta !== undefined) {
      p.financiamiento.plazoMeses = Math.max(
        1,
        p.financiamiento.plazoMeses + mods.plazoPrestamoDelta
      );
    }
    // Mismo tratamiento para el préstamo de capital de trabajo si existe.
    const cw = p.financiamiento.prestamoCapitalTrabajo;
    if (cw) {
      if (mods.prestamoPorcentaje !== undefined) {
        const pp = Math.max(0, Math.min(1, mods.prestamoPorcentaje));
        cw.porcentajePrestamo = pp;
        cw.porcentajePropio = 1 - pp;
      }
      if (mods.tasaInteresDeltaPp !== undefined) {
        cw.tasaInteresAnual = Math.max(0, cw.tasaInteresAnual + mods.tasaInteresDeltaPp);
      }
      if (mods.plazoPrestamoDelta !== undefined) {
        cw.plazoMeses = Math.max(1, cw.plazoMeses + mods.plazoPrestamoDelta);
      }
    }
  }

  return p;
}

/**
 * Resuelve los modificadores de Optimista y Pesimista combinando los DEFAULTS
 * del código con la config del curso (si el docente la editó). Lo que esté en
 * la config gana; lo que falte cae al default.
 */
export function resolverEscenariosDeCurso(
  config: EscenariosConfig | null | undefined
): { optimista: ModificadoresEscenario; pesimista: ModificadoresEscenario } {
  return {
    optimista: { ...DEFAULT_OPTIMISTA, ...(config?.optimista ?? {}) },
    pesimista: { ...DEFAULT_PESIMISTA, ...(config?.pesimista ?? {}) },
  };
}

/** Calcula los 4 escenarios (optimista, base, pesimista, personalizado). */
export function compararEscenarios(
  proyecto: Proyecto,
  optimista: ModificadoresEscenario = DEFAULT_OPTIMISTA,
  pesimista: ModificadoresEscenario = DEFAULT_PESIMISTA,
  personalizado: ModificadoresEscenario | null = null
): EscenarioCalculado[] {
  const definiciones: Array<{ nombre: NombreEscenario; etiqueta: string; mods: ModificadoresEscenario }> = [
    { nombre: "optimista", etiqueta: "Optimista", mods: optimista },
    { nombre: "base", etiqueta: "Base", mods: DEFAULT_BASE },
    { nombre: "pesimista", etiqueta: "Pesimista", mods: pesimista },
  ];
  if (personalizado) {
    definiciones.push({ nombre: "personalizado", etiqueta: "Mi escenario", mods: personalizado });
  }
  return definiciones.map((d) => {
    const proyectoModificado = aplicarModificadores(proyecto, d.mods);
    const flujo = construirFlujoCaja(proyectoModificado);
    return {
      nombre: d.nombre,
      etiqueta: d.etiqueta,
      modificadores: d.mods,
      proyectoModificado,
      flujo,
    };
  });
}

/** Útil para "¿es viable?" en la tabla — VAN positivo Y TIR > WACC. */
export function esViable(flujo: FlujoCajaProyecto): boolean {
  return (
    flujo.indicadores.van > 0 &&
    flujo.indicadores.tir !== null &&
    flujo.indicadores.tir > flujo.wacc
  );
}
