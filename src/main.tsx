import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

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
