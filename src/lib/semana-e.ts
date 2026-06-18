import type { NivelSemanaE, Proyecto, VersionProyecto } from "@/types/proyecto";
export type { NivelSemanaE } from "@/types/proyecto";

export const NIVELES_SEMANA_E: Array<{
  id: NivelSemanaE;
  nombre: string;
  emoji: string;
  pasos: number;
  tiempo: string;
  descripcion: string;
}> = [
  {
    id: "basico",
    nombre: "Básico",
    emoji: "🌱",
    pasos: 5,
    tiempo: "35–50 min",
    descripcion: "Idea, ventas, inversión, costos directos y resultado.",
  },
  {
    id: "medio",
    nombre: "Medio",
    emoji: "🚀",
    pasos: 7,
    tiempo: "60–80 min",
    descripcion: "Agrega personal y gastos operativos para mayor realismo.",
  },
  {
    id: "avanzado",
    nombre: "Avanzado",
    emoji: "🧠",
    pasos: 9,
    tiempo: "90+ min",
    descripcion: "Incluye financiamiento, capital de trabajo y análisis de riesgo.",
  },
];

const PASOS_POR_NIVEL: Record<NivelSemanaE, number[]> = {
  basico: [1, 2, 3, 5, 9],
  medio: [1, 2, 3, 4, 5, 6, 9],
  avanzado: [1, 2, 3, 4, 5, 6, 7, 8, 9],
};

export function pasosParaNivelSemanaE(nivel?: NivelSemanaE | null): number[] {
  return nivel ? PASOS_POR_NIVEL[nivel] : PASOS_POR_NIVEL.avanzado;
}

export function pasosVisiblesDelProyecto(proyecto: Proyecto): number[] {
  if (!proyecto.nivelSemanaE) return PASOS_POR_NIVEL.avanzado;
  return pasosParaNivelSemanaE(proyecto.nivelSemanaE);
}

export function versionParaNivelSemanaE(nivel: NivelSemanaE): VersionProyecto {
  return nivel === "avanzado" ? "v2" : "v1";
}

export function codigoCortoGrupo(grupoId: string): string {
  return grupoId.replace(/-/g, "").slice(0, 6).toUpperCase();
}

export function obtenerNivelSemanaE(valor: unknown): NivelSemanaE | null {
  return valor === "basico" || valor === "medio" || valor === "avanzado"
    ? valor
    : null;
}

export function datosNivelSemanaE(nivel?: NivelSemanaE | null) {
  return NIVELES_SEMANA_E.find((item) => item.id === nivel) ?? null;
}
