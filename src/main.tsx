import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { inicializarSentry } from "./lib/sentry";
import { registrarActualizacionPWA } from "./lib/pwa-update";

// Monitoreo de errores en producción. No-op si no hay VITE_SENTRY_DSN.
inicializarSentry();

// Actualización OTA: la PWA se actualiza y recarga sola al abrir una versión
// nueva (no-op en desarrollo).
registrarActualizacionPWA();

// Bloqueo de orientación en vertical en mobile. El layout está pensado para
// portrait (formularios largos, tablas, podio); en horizontal se ve roto.
// El manifest PWA tiene `orientation: portrait` para la app instalada; este
// código intenta lo mismo en el browser. Falla silenciosamente en navegadores
// que no permiten lock fuera de fullscreen (Safari, algunos Chrome).
if (typeof window !== "undefined" && "screen" in window) {
  const orient = (screen as any).orientation;
  if (orient && typeof orient.lock === "function") {
    orient.lock("portrait").catch(() => {
      /* navegador no permite — ignorar */
    });
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
