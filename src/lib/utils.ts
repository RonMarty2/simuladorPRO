import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatearBolivianos(monto: number): string {
  return new Intl.NumberFormat("es-BO", {
    style: "currency",
    currency: "BOB",
    minimumFractionDigits: 2,
  }).format(monto);
}

/**
 * Normaliza el nombre de una universidad para que no haya 3 variantes
 * de la misma (ej: "ucatec", "Ucatec", "UCATEC"). Trim + UPPERCASE,
 * porque casi siempre se escribe como acrónimo (UMSS, UCATEC, UPB, USFX).
 * Si el alumno escribió el nombre largo ("Universidad Mayor de San Simón")
 * igual queda consistente con mayúsculas.
 */
export function normalizarUniversidad(input: string | null | undefined): string | null {
  if (input == null) return null;
  const t = input.trim();
  if (t === "") return null;
  return t.toUpperCase();
}
