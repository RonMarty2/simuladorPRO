import { useEffect, useRef, useState } from "react";
import { guardarProyecto } from "@/lib/proyecto-supabase";
import type { Proyecto } from "@/types/proyecto";

export type EstadoGuardado =
  | { tipo: "idle" }
  | { tipo: "guardando" }
  | { tipo: "guardado"; en: Date }
  | { tipo: "error"; mensaje: string };

/**
 * Auto-guardado del proyecto con debounce.
 *
 * Cada vez que `proyecto.actualizado_en` cambia, espera `delayMs` ms y
 * persiste en Supabase. Si llegan más cambios dentro del delay, los anteriores
 * se descartan (debounce clásico). Indica el estado del guardado para UI.
 */
export function useAutoGuardado(proyecto: Proyecto | null, delayMs = 1000) {
  const [estado, setEstado] = useState<EstadoGuardado>({ tipo: "idle" });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ultimoTimestampRef = useRef<string | null>(null);

  useEffect(() => {
    if (!proyecto) {
      ultimoTimestampRef.current = null;
      setEstado({ tipo: "idle" });
      return;
    }

    // Si no cambió el timestamp, no hacemos nada
    if (ultimoTimestampRef.current === proyecto.actualizado_en) return;
    ultimoTimestampRef.current = proyecto.actualizado_en;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      setEstado({ tipo: "guardando" });
      try {
        await guardarProyecto(proyecto);
        setEstado({ tipo: "guardado", en: new Date() });
      } catch (e) {
        const mensaje = e instanceof Error ? e.message : "Error al guardar";
        setEstado({ tipo: "error", mensaje });
      }
    }, delayMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [proyecto, delayMs]);

  return estado;
}
