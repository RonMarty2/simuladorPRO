/**
 * Estacionalidad por tipo de negocio: cuánto de lo que vende en un año cae en cada mes.
 *
 * El plan del constructor reparte las ventas en partes iguales, pero un hostal en Bolivia
 * llena sus habitaciones en la época seca y casi no tiene turistas en la lluviosa. El
 * simulador usa este perfil para que la caja suba y baje durante el año sin cambiar el
 * total anual del plan. Los factores son criterio del equipo, a calibrar con operadores.
 */

/** Perfil mensual desde enero. Se normaliza para que el promedio sea exactamente 1. */
const PERFILES_BRUTOS: Record<string, number[]> = {
  // Turismo en Bolivia: época seca (mayo a octubre) con picos en vacaciones de invierno y
  // Navidad; época lluviosa (enero a marzo) floja.
  turismo: [0.85, 0.75, 0.7, 0.85, 1.05, 1.25, 1.45, 1.4, 1.2, 1.1, 0.8, 1.05],
  // Agricultura de altiplano y valles: se vende después de la cosecha (mayo a agosto).
  agricultura: [0.3, 0.3, 0.4, 0.9, 2.0, 2.3, 2.0, 1.6, 0.8, 0.4, 0.3, 0.3],
};

/**
 * Perfil de los costos variables cuando no siguen a las ventas. En agricultura se gasta
 * en insumos y labores al sembrar (septiembre a diciembre), meses antes de cobrar.
 */
const PERFILES_BRUTOS_COSTOS: Record<string, number[]> = {
  agricultura: [0.8, 0.8, 0.8, 1.2, 1.0, 0.8, 0.6, 0.6, 1.5, 1.7, 1.4, 0.8],
};

export const NOMBRES_MES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

/** Perfil normalizado (12 meses, promedio 1) del tipo, o undefined si el tipo no tiene temporadas. */
export function perfilEstacional(tipoNegocio?: string | null): number[] | undefined {
  const bruto = tipoNegocio ? PERFILES_BRUTOS[tipoNegocio] : undefined;
  if (!bruto) return undefined;
  const promedio = bruto.reduce((a, x) => a + x, 0) / bruto.length;
  return bruto.map((x) => x / promedio);
}

/** Perfil normalizado de los costos variables, si el tipo los tiene desfasados de las ventas. */
export function perfilEstacionalCostos(tipoNegocio?: string | null): number[] | undefined {
  const bruto = tipoNegocio ? PERFILES_BRUTOS_COSTOS[tipoNegocio] : undefined;
  if (!bruto) return undefined;
  const promedio = bruto.reduce((a, x) => a + x, 0) / bruto.length;
  return bruto.map((x) => x / promedio);
}

/** Factor del mes k (0 = enero del primer año). */
export function factorDelMes(perfil: number[], k: number): number {
  return perfil[((k % 12) + 12) % 12];
}
