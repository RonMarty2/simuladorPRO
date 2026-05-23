export type CategoriaEvento =
  | "macroeconomico"
  | "laboral"
  | "sectorial"
  | "logistico"
  | "tecnologico"
  | "climatico"
  | "financiero"
  | "internacional"
  | "comercio"
  | "servicios"
  | "produccion"
  | "oportunidad";

export type TipoEvento = "curado" | "automatico";

/** Operación que aplica un modificador a una variable del estado del proyecto. */
export type OperacionModificador =
  | "multiplicar" // valor = valor * factor
  | "sumar" // valor = valor + delta
  | "restar" // valor = valor - delta
  | "setear" // valor = nuevo_valor (absoluto)
  | "porcentaje"; // valor = valor + (valor * porcentaje)

export interface ModificadorVariable {
  campo: string; // ej: "costos_importacion", "demanda", "caja", "tasa_dolar"
  operacion: OperacionModificador;
  valor: number;
  descripcion?: string;
}

export interface Modificadores {
  variables_afectadas: ModificadorVariable[];
}

export interface OpcionDecision {
  letra: "A" | "B" | "C" | "D";
  texto: string;
  consecuencias: Record<string, number | string>;
  feedback_corto: string;
}

export interface Evento {
  id: string;
  codigo: string;
  titulo: string;
  descripcion: string;
  categoria: CategoriaEvento;
  tipo: TipoEvento;
  probabilidad: number; // 0..1
  turno_minimo: number;
  sectores_afectados: string[]; // ['todos'] o ['produccion', 'comercio', ...]
  modificadores: Modificadores;
  opciones_decision: OpcionDecision[];
  activo: boolean;
  creado_en: string;
}
