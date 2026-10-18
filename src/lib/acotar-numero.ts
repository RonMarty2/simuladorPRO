/** Tope absoluto: evita 1e308/Infinity que terminan en "BsNaN" en los resumenes. */
export const LIMITE_ABSOLUTO = 1e12;

/** Devuelve `n` dentro de [min, max] y del tope absoluto; no finito => 0. */
export function acotarNumero(n: number, min?: number | string, max?: number | string): number {
  if (!Number.isFinite(n)) return 0;
  let r = Math.max(-LIMITE_ABSOLUTO, Math.min(LIMITE_ABSOLUTO, n));
  const mn = min !== undefined && min !== "" ? Number(min) : NaN;
  const mx = max !== undefined && max !== "" ? Number(max) : NaN;
  if (Number.isFinite(mn)) r = Math.max(mn, r);
  if (Number.isFinite(mx)) r = Math.min(mx, r);
  return r;
}

/**
 * La TIR "no calculable" (flujos sin cambio de signo) llega como 0 exacto desde
 * el motor. Para mostrarla se la trata como ausente.
 */
export function tirCalculable(tir: number | null | undefined): tir is number {
  return typeof tir === "number" && Number.isFinite(tir) && tir !== 0;
}
