/**
 * Cálculo de la NOTA FINAL del estudiante a partir de:
 *  - el promedio de sus entregas individuales (0..100, o null si no tiene),
 *  - la nota de su proyecto grupal (0..100, o null si aún no fue calificado),
 *  - los pesos definidos por el docente en el curso (0..1 cada uno).
 *
 * Si falta una de las dos partes, se pondera SOLO con lo disponible
 * (renormalizando los pesos), para mostrar el estado actual sin castigar al
 * estudiante por algo que el docente todavía no calificó.
 */
export interface ResultadoNotaFinal {
  /** Nota final ponderada (0..100) o null si no hay ninguna nota todavía. */
  final: number | null;
  usaIndividual: boolean;
  usaGrupal: boolean;
}

export function calcularNotaFinal(params: {
  promedioIndividual: number | null;
  notaGrupal: number | null;
  pesoIndividual: number;
  pesoGrupal: number;
}): ResultadoNotaFinal {
  const { promedioIndividual, notaGrupal } = params;
  const pi = Math.max(0, params.pesoIndividual);
  const pg = Math.max(0, params.pesoGrupal);

  let num = 0;
  let den = 0;
  const usaIndividual = promedioIndividual != null && pi > 0;
  const usaGrupal = notaGrupal != null && pg > 0;

  if (usaIndividual) {
    num += pi * (promedioIndividual as number);
    den += pi;
  }
  if (usaGrupal) {
    num += pg * (notaGrupal as number);
    den += pg;
  }

  if (den === 0) return { final: null, usaIndividual, usaGrupal };
  return { final: Math.round((num / den) * 100) / 100, usaIndividual, usaGrupal };
}
