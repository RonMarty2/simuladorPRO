/// <reference types="vite-plugin-pwa/client" />
import { registerSW } from "virtual:pwa-register";

/**
 * Actualización OTA (over-the-air) de la PWA.
 *
 * Cuando publicás una versión nueva, la app la detecta y se recarga sola al
 * abrirla/enfocarla, sin que el usuario reinstale ni cierre nada. La recarga
 * ocurre UNA sola vez (vite-plugin-pwa guarda internamente un flag sobre el
 * evento `controllerchange`, así que no hay loops).
 *
 * Mecanismo:
 *  - `immediate: true` → registra el SW apenas carga la app.
 *  - `onRegisteredSW` → guarda la registration y busca versión nueva al abrir
 *    (`reg.update()`) y cada vez que la pestaña vuelve a primer plano.
 *  - `onNeedRefresh` → cuando hay un SW nuevo esperando, lo activa
 *    (`updateSW(true)`), que dispara skipWaiting + la recarga única.
 */
export function registrarActualizacionPWA() {
  // Solo en producción (en dev el SW está deshabilitado en vite.config).
  if (import.meta.env.DEV) return;

  const updateSW = registerSW({
    immediate: true,
    onRegisteredSW(_swUrl, reg) {
      if (!reg) return;
      // Buscar versión nueva al abrir + cada vez que la pestaña se enfoca.
      const buscar = () => {
        if (document.visibilityState === "visible") reg.update();
      };
      buscar(); // chequeo inicial al abrir
      document.addEventListener("visibilitychange", buscar);
      window.addEventListener("focus", buscar);
      // Chequeo periódico liviano cada 60s mientras la app está abierta.
      setInterval(buscar, 60_000);
    },
    onNeedRefresh() {
      // Hay una versión nueva lista → aplicarla y recargar (una sola vez).
      updateSW(true);
    },
  });
}
