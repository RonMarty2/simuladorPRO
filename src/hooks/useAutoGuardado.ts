import { useEffect, useRef, useState } from "react";
import { guardarProyecto } from "@/lib/proyecto-supabase";
import { registrarActividad } from "@/lib/proyecto-actividad-supabase";
import { useAuthStore } from "@/stores/auth-store";
import type { Proyecto } from "@/types/proyecto";

export type EstadoGuardado =
  | { tipo: "idle" }
  | { tipo: "guardando" }
  | { tipo: "guardado"; en: Date }
  | { tipo: "error"; mensaje: string };

/**
 * Auto-guardado del proyecto con debounce corto + guardado de emergencia
 * cuando la pestaña pierde foco o el usuario cierra/refresca.
 *
 * Side-effect: en proyectos GRUPALES registra actividad del usuario (deduplica
 * por día, así que un alumno editando todo el día genera 1 fila). El log es
 * "best-effort" — nunca traba el guardado.
 */
export function useAutoGuardado(proyecto: Proyecto | null, delayMs = 500) {
  const [estado, setEstado] = useState<EstadoGuardado>({ tipo: "idle" });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ultimoGuardadoTimestampRef = useRef<string | null>(null);
  const proyectoRef = useRef<Proyecto | null>(null);
  const usuarioId = useAuthStore((s) => s.user?.id ?? null);

  // Mantenemos un ref actualizado al último proyecto para acceder desde handlers
  useEffect(() => {
    proyectoRef.current = proyecto;
  }, [proyecto]);

  // Función helper que guarda si hay cambios pendientes
  const guardarSiHayPendientes = async () => {
    const p = proyectoRef.current;
    if (!p) return;
    if (ultimoGuardadoTimestampRef.current === p.actualizado_en) return;
    setEstado({ tipo: "guardando" });
    try {
      await guardarProyecto(p);
      ultimoGuardadoTimestampRef.current = p.actualizado_en;
      setEstado({ tipo: "guardado", en: new Date() });
      // Audit de actividad: solo para grupales, deduplicado por día en BD.
      if (p.tipo === "proyecto_grupal" && usuarioId) {
        void registrarActividad(p.id, usuarioId, "edito", 0);
      }
    } catch (e) {
      const mensaje = e instanceof Error ? e.message : "Error al guardar";
      setEstado({ tipo: "error", mensaje });
    }
  };

  // Debounce: guardar después de delayMs ms de inactividad
  useEffect(() => {
    if (!proyecto) return;
    if (ultimoGuardadoTimestampRef.current === proyecto.actualizado_en) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      guardarSiHayPendientes();
    }, delayMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proyecto, delayMs]);

  // Guardado de emergencia cuando la pestaña se oculta o el usuario va a cerrar
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        // Forzar guardado antes de que la pestaña se pause
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
        guardarSiHayPendientes();
      }
    };
    const onBeforeUnload = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      guardarSiHayPendientes();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("beforeunload", onBeforeUnload);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return estado;
}
