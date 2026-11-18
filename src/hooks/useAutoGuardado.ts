import { useEffect, useRef, useState } from "react";
import {
  actualizarProyectoComoDocente,
  guardarProyecto,
  obtenerProyectoRemotoDirecto,
} from "@/lib/proyecto-supabase";
import { registrarActividad } from "@/lib/proyecto-actividad-supabase";
import {
  contenidoProyectoIgual,
  fusionarProyectoGrupal,
  obtenerBaseSincronizacion,
  registrarBaseSincronizacion,
} from "@/lib/sincronizar-grupal";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/auth-store";
import { useProyectoStore } from "@/stores/proyecto-store";
import { useRevisionDocenteStore } from "@/stores/revision-docente-store";
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
 * En proyectos GRUPALES:
 * - Al guardar, fusiona (Smart Merge) los cambios locales con los que hayan
 *   guardado otros integrantes para no pisar el trabajo de los compañeros.
 * - Sincroniza en vivo cada 3 segundos (y por canal Realtime) los cambios que
 *   hagan los compañeros de grupo para que aparezcan en pantalla sin recargar.
 */
export function useAutoGuardado(proyecto: Proyecto | null, delayMs = 500) {
  const [estado, setEstado] = useState<EstadoGuardado>({ tipo: "idle" });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const guardandoRef = useRef(false);
  const ultimoProyectoIdRef = useRef<string | null>(null);
  const ultimoGuardadoTimestampRef = useRef<string | null>(null);
  const proyectoRef = useRef<Proyecto | null>(null);
  const usuarioId = useAuthStore((s) => s.user?.id ?? null);

  const revisionActiva = useRevisionDocenteStore((s) => s.activa);
  const modoRevision = useRevisionDocenteStore((s) => s.modoEdicion);

  // Cuando se carga un proyecto distinto, marcamos su timestamp inicial como
  // ya sincronizado para que abrir el proyecto NUNCA dispare un guardado fantasma.
  useEffect(() => {
    if (proyecto && ultimoProyectoIdRef.current !== proyecto.id) {
      ultimoProyectoIdRef.current = proyecto.id;
      ultimoGuardadoTimestampRef.current = proyecto.actualizado_en;
      registrarBaseSincronizacion(proyecto);
    }
    proyectoRef.current = proyecto;
  }, [proyecto]);

  // Función helper que guarda si hay cambios pendientes
  const guardarSiHayPendientes = async () => {
    const p = proyectoRef.current;
    if (!p || guardandoRef.current) return;
    const rev = useRevisionDocenteStore.getState();
    // En modo "Solo probar", jamás sobrescribimos el proyecto del estudiante.
    if (rev.activa && rev.modoEdicion === "probar") return;
    if (ultimoGuardadoTimestampRef.current === p.actualizado_en) return;

    guardandoRef.current = true;
    setEstado({ tipo: "guardando" });
    try {
      if (rev.activa && rev.modoEdicion === "editar") {
        await actualizarProyectoComoDocente(p);
        rev.marcarGuardado(p);
        ultimoGuardadoTimestampRef.current = p.actualizado_en;
      } else {
        const guardado = await guardarProyecto(p);
        ultimoGuardadoTimestampRef.current = guardado.actualizado_en;
        // Si al guardar un grupal se trajeron cambios de una compañera,
        // actualizamos la pantalla sin disparar otro guardado.
        const actualEnStore = useProyectoStore.getState().proyecto;
        if (
          actualEnStore &&
          actualEnStore.id === guardado.id &&
          !contenidoProyectoIgual(actualEnStore, guardado)
        ) {
          useProyectoStore.getState().cargar(guardado);
        }
      }
      setEstado({ tipo: "guardado", en: new Date() });
      // Audit de actividad: solo para grupales, deduplicado por día en BD.
      if ((p.tipo === "proyecto_grupal" || p.grupo_id) && usuarioId && !rev.activa) {
        void registrarActividad(p.id, usuarioId, "edito", 0);
      }
    } catch (e) {
      const mensaje = e instanceof Error ? e.message : "Error al guardar";
      setEstado({ tipo: "error", mensaje });
    } finally {
      guardandoRef.current = false;
    }
  };

  // Debounce: guardar después de delayMs ms de inactividad
  useEffect(() => {
    if (!proyecto) return;
    if (revisionActiva && modoRevision === "probar") {
      setEstado({ tipo: "idle" });
      return;
    }
    if (ultimoGuardadoTimestampRef.current === proyecto.actualizado_en) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      void guardarSiHayPendientes();
    }, delayMs);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proyecto, delayMs, revisionActiva, modoRevision]);

  // Sincronización en vivo para proyectos GRUPALES:
  // Trae cada 3 segundos (y por Realtime si está activo) lo que hayan editado
  // los demás integrantes del grupo y lo fusiona en pantalla sin pisar lo propio.
  const proyectoId = proyecto?.id;
  const esGrupal = Boolean(proyecto && (proyecto.tipo === "proyecto_grupal" || proyecto.grupo_id));

  useEffect(() => {
    if (!proyectoId || !esGrupal || revisionActiva) return;

    let cancelado = false;

    const sincronizarDesdeRemoto = async () => {
      if (cancelado || guardandoRef.current || timerRef.current !== null) return;
      if (typeof document !== "undefined" && document.visibilityState === "hidden") return;

      const actual = proyectoRef.current;
      if (!actual || actual.id !== proyectoId) return;
      // Si hay una edición local pendiente de guardarse, primero que se guarde.
      if (ultimoGuardadoTimestampRef.current !== actual.actualizado_en) return;

      try {
        const remoto = await obtenerProyectoRemotoDirecto(proyectoId);
        if (!remoto || cancelado || guardandoRef.current || timerRef.current !== null) return;

        const ahoraLocal = proyectoRef.current;
        if (!ahoraLocal || ahoraLocal.id !== proyectoId) return;

        if (!contenidoProyectoIgual(ahoraLocal, remoto)) {
          const base = obtenerBaseSincronizacion(proyectoId);
          const fusionado = fusionarProyectoGrupal(base, ahoraLocal, remoto);
          registrarBaseSincronizacion(remoto);
          ultimoGuardadoTimestampRef.current = fusionado.actualizado_en;
          proyectoRef.current = fusionado;
          useProyectoStore.getState().cargar(fusionado);
        }
      } catch {
        // Silencioso: el próximo ciclo reintentará.
      }
    };

    const intervalo = setInterval(() => {
      void sincronizarDesdeRemoto();
    }, 3000);

    // Canal Realtime (por si la tabla tiene replicación habilitada en Supabase)
    const canal = supabase
      .channel(`proyecto-grupal-${proyectoId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "proyectos",
          filter: `id=eq.${proyectoId}`,
        },
        () => {
          void sincronizarDesdeRemoto();
        }
      )
      .subscribe();

    return () => {
      cancelado = true;
      clearInterval(intervalo);
      void supabase.removeChannel(canal);
    };
  }, [proyectoId, esGrupal, revisionActiva]);

  // Guardado de emergencia cuando la pestaña se oculta o el usuario va a cerrar
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
        void guardarSiHayPendientes();
      }
    };
    const onBeforeUnload = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      void guardarSiHayPendientes();
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
