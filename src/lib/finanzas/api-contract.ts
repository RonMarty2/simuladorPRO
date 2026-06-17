import { construirFlujoCajaProyecto, type ResultadoFlujoProyecto } from "./proyecto-financiero";
import {
  analizarSensibilidadProyecto,
  type AnalisisSensibilidadProyecto,
} from "./sensibilidad";
import type { Proyecto } from "../../types/proyecto";

export const FINANZAS_API_VERSION = "2026-06-17";

export interface EvaluarProyectoFinancieroRequest {
  version?: string;
  proyecto: Proyecto;
  incluirSensibilidad?: boolean;
}

export interface EvaluarProyectoFinancieroResponse {
  version: string;
  resultado: ResultadoFlujoProyecto;
  sensibilidad: AnalisisSensibilidadProyecto | null;
  warnings: string[];
}

export function evaluarProyectoFinanciero(
  request: EvaluarProyectoFinancieroRequest
): EvaluarProyectoFinancieroResponse {
  const warnings: string[] = [];
  const resultado = construirFlujoCajaProyecto(request.proyecto);

  if (request.version && request.version !== FINANZAS_API_VERSION) {
    warnings.push(
      `Version solicitada ${request.version}; version activa ${FINANZAS_API_VERSION}.`
    );
  }
  if (request.proyecto.productos.length === 0) {
    warnings.push("El proyecto no tiene productos o servicios configurados.");
  }
  if (resultado.totalProyecto <= 0) {
    warnings.push("El proyecto no tiene inversion inicial ni capital de trabajo.");
  }

  return {
    version: FINANZAS_API_VERSION,
    resultado,
    sensibilidad: request.incluirSensibilidad
      ? analizarSensibilidadProyecto(request.proyecto)
      : null,
    warnings,
  };
}

/**
 * Helper para exponer este contrato desde un endpoint HTTP o una Edge Function.
 * Mantiene la validacion de entrada en un punto unico.
 */
export function evaluarProyectoFinancieroDesdeJson(
  body: unknown
): EvaluarProyectoFinancieroResponse {
  if (!body || typeof body !== "object" || !("proyecto" in body)) {
    throw new Error("Payload invalido: se requiere { proyecto }.");
  }
  return evaluarProyectoFinanciero(body as EvaluarProyectoFinancieroRequest);
}
