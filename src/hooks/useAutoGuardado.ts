import { useEffect, useRef, useState } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
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
 * Auto-guardado del proyecto con debounce corto + sincronización instantánea
 * entre integrantes de un grupo mediante Supabase Broadcast + fusión inteligente.
 */
export function useAutoGuardado(proyecto: Proyecto | null, delayMs = 350) {
  const [estado, setEstado] = useState<EstadoGuardado>({ tipo: "idle" });
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const guardandoRef = useRef(false);
  const pendienteReintentoRef = useRef(false);
  const ultimoProyectoIdRef = useRef<string | null>(null);
  const ultimoGuardadoTimestampRef = useRef<string | null>(null);
  const proyectoRef = useRef<Proyecto | null>(null);
  const canalRef = useRef<RealtimeChannel | null>(null);
  const usuarioId = useAuthStore((s) => s.user?.id ?? null);

  const revisionActiva = useRevisionDocenteStore((s) => s.activa);
  const modoRevision = useRevisionDocenteStore((s) => s.modoEdicion);

  // Al cambiar de proyecto activo, registramos su timestamp inicial para no
  // disparar un guardado fantasma al solo abrir la pantalla.
  useEffect(() => {
    if (proyecto && ultimoProyectoIdRef.current !== proyecto.id) {
      ultimoProyectoIdRef.current = proyecto.id;
      ultimoGuardadoTimestampRef.current = proyecto.actualizado_en;
      registrarBaseSincronizacion(proyecto);
    }
    proyectoRef.current = proyecto;
  }, [proyecto]);

  // Aplica en memoria un proyecto recibido de un compañero (vía Broadcast o Poll)
  const aplicarRemotoEnPantalla = (remoto: Proyecto) => {
    const actual = proyectoRef.current;
    if (!actual || actual.id !== remoto.id) return;
    if (contenidoProyectoIgual(actual, remoto)) {
      registrarBaseSincronizacion(remoto);
      return;
    }
    const base = obtenerBaseSincronizacion(actual.id);
    const fusionado = fusionarProyectoGrupal(base, actual, remoto);
    registrarBaseSincronizacion(remoto);
    // Si no había cambios locales pendientes de guardar, marcamos el timestamp
    // como ya guardado para no re-guardar en bucle lo que mandó el compañero.
    const habiaCambiosLocalesPendientes =
      ultimoGuardadoTimestampRef.current !== actual.actualizado_en;
    if (!habiaCambiosLocalesPendientes) {
      ultimoGuardadoTimestampRef.current = fusionado.actualizado_en;
    }
    proyectoRef.current = fusionado;
    useProyectoStore.getState().cargar(fusionado);
  };

  // Función helper que guarda si hay cambios pendientes
  const guardarSiHayPendientes = async () => {
    const p = proyectoRef.current;
    if (!p) return;
    const rev = useRevisionDocenteStore.getState();
    if (rev.activa && rev.modoEdicion === "probar") return;
    if (ultimoGuardadoTimestampRef.current === p.actualizado_en) return;

    // Si ya hay un guardado en vuelo, encolamos un reintento inmediato al terminar.
    if (guardandoRef.current) {
      pendienteReintentoRef.current = true;
      return;
    }

    guardandoRef.current = true;
    pendienteReintentoRef.current = false;
    const timestampIniciado = p.actualizado_en;
    setEstado({ tipo: "guardando" });

    try {
      if (rev.activa && rev.modoEdicion === "editar") {
        await actualizarProyectoComoDocente(p);
        rev.marcarGuardado(p);
        if (proyectoRef.current?.actualizado_en === timestampIniciado) {
          ultimoGuardadoTimestampRef.current = timestampIniciado;
        }
      } else {
        const guardado = await guardarProyecto(p);
        // Solo marcamos como sincronizado si el usuario no siguió escribiendo mientras guardábamos
        const actualAhora = proyectoRef.current;
        const siguioEscribiendo =
          actualAhora && actualAhora.actualizado_en !== timestampIniciado;

        if (!siguioEscribiendo) {
          ultimoGuardadoTimestampRef.current = guardado.actualizado_en;
          if (
            actualAhora &&
            actualAhora.id === guardado.id &&
            !contenidoProyectoIgual(actualAhora, guardado)
          ) {
            proyectoRef.current = guardado;
            useProyectoStore.getState().cargar(guardado);
          }
        } else {
          pendienteReintentoRef.current = true;
        }

        // Si es grupal, avisamos al instante por WebSocket Broadcast a los
        // compañeros conectados para que lo vean en <100ms sin apretar F5.
        if ((p.tipo === "proyecto_grupal" || p.grupo_id) && canalRef.current) {
          void canalRef.current.send({
            type: "broadcast",
            event: "cambio_grupal",
            payload: { proyecto: guardado, emisor: usuarioId },
          });
        }
      }
      setEstado({ tipo: "guardado", en: new Date() });
      if ((p.tipo === "proyecto_grupal" || p.grupo_id) && usuarioId && !rev.activa) {
        void registrarActividad(p.id, usuarioId, "edito", 0);
      }
    } catch (e: any) {
      const mensaje =
        (typeof e?.message === "string" && e.message) ||
        (e instanceof Error ? e.message : "Error al guardar");
      setEstado({ tipo: "error", mensaje });
    } finally {
      guardandoRef.current = false;
      if (pendienteReintentoRef.current) {
        pendienteReintentoRef.current = false;
        void guardarSiHayPendientes();
      }
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

  // Canal en vivo para proyectos GRUPALES:
  // 1) Broadcast WebSocket instantáneo (<100ms) entre pestañas/compañeros.
  // 2) Respaldo por lectura periódica cada 2.5s por si el WebSocket se reconecta.
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
      if (ultimoGuardadoTimestampRef.current !== actual.actualizado_en) return;

      try {
        const remoto = await obtenerProyectoRemotoDirecto(proyectoId);
        if (!remoto || cancelado || guardandoRef.current || timerRef.current !== null) return;
        aplicarRemotoEnPantalla(remoto);
      } catch {
        // Silencioso: el próximo ciclo reintentará.
      }
    };

    const intervalo = setInterval(() => {
      void sincronizarDesdeRemoto();
    }, 2500);

    const canal = supabase
      .channel(`grupo-live-${proyectoId}`, {
        config: { broadcast: { self: false } },
      })
      .on("broadcast", { event: "cambio_grupal" }, ({ payload }) => {
        if (cancelado) return;
        const proyRemoto = payload?.proyecto as Proyecto | undefined;
        if (proyRemoto && proyRemoto.id === proyectoId) {
          aplicarRemotoEnPantalla(proyRemoto);
        }
      })
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

    canalRef.current = canal;

    return () => {
      cancelado = true;
      canalRef.current = null;
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
