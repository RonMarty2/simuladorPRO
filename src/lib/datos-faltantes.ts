import type { Proyecto } from "@/types/proyecto";
import { pasosVisiblesDelProyecto } from "./semana-e";

export interface DatoFaltante {
  paso: number;
  etiqueta: string;
}

/**
 * Pasos del constructor que siguen sin ningun dato cargado. Es solo informativo:
 * un proyecto puede no tener personal o costos directos, asi que no bloquea nada.
 */
export function datosFaltantes(p: Proyecto): DatoFaltante[] {
  const visibles = new Set(pasosVisiblesDelProyecto(p));
  const faltan: DatoFaltante[] = [];
  const inversiones = Object.values(p.inversiones ?? {}).flat() as { costoTotal?: number }[];
  if (!inversiones.some((i) => (i.costoTotal ?? 0) > 0)) {
    faltan.push({ paso: 3, etiqueta: "Inversiones" });
  }
  if (!(p.personal ?? []).length) faltan.push({ paso: 4, etiqueta: "Personal" });
  if (!(p.costosDirectos ?? []).length) faltan.push({ paso: 5, etiqueta: "Costos directos" });
  if (!(p.costosAdministracion ?? []).length && !(p.costosComercializacion ?? []).length) {
    faltan.push({ paso: 6, etiqueta: "Gastos operativos" });
  }
  return faltan.filter((f) => visibles.has(f.paso));
}
