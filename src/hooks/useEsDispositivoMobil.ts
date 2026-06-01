import { useEffect, useState } from "react";

/**
 * Detecta si la app corre en un dispositivo móvil real (Android/iPhone/iPad)
 * independientemente del viewport que reporte el navegador.
 *
 * Útil para forzar el layout mobile aunque el usuario haya activado
 * "Sitio para escritorio" en Chrome, o aunque la PWA se haya instalado
 * mientras esa opción estaba marcada (caso típico que renderizaba la app
 * con sidebar fijo en mobile en lugar del menú hamburguesa).
 *
 * Combina 3 señales (cualquiera positiva = mobile):
 *  - User-agent contiene patrones mobile reales.
 *  - PWA standalone + puntero coarse (touch).
 *  - Pantalla física estrecha (screen.width <= 1024).
 */
export function useEsDispositivoMobil(): boolean {
  const [esMobil, setEsMobil] = useState(() => detectar());

  useEffect(() => {
    const onChange = () => setEsMobil(detectar());
    window.addEventListener("resize", onChange);
    window.addEventListener("orientationchange", onChange);
    return () => {
      window.removeEventListener("resize", onChange);
      window.removeEventListener("orientationchange", onChange);
    };
  }, []);

  return esMobil;
}

function detectar(): boolean {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent || "";

  // 1. User-agent: la señal más confiable. Los UAs mobile son explícitos
  //    (Android, iPhone, etc.) y NO cambian aunque actives "Sitio para
  //    escritorio" — solo cambia un flag interno y la cabecera 'desktop',
  //    pero el UA sigue siendo mobile.
  if (/Mobi|Android|iPhone|iPad|iPod|Opera Mini|IEMobile|Mobile Safari/i.test(ua)) {
    return true;
  }

  // 2. PWA instalada en pantalla táctil
  const standalone = window.matchMedia?.("(display-mode: standalone)").matches;
  const touch = window.matchMedia?.("(pointer: coarse)").matches;
  if (standalone && touch) return true;

  // 3. Pantalla física estrecha. screen.width reporta el ancho real del
  //    dispositivo y NO se ve afectado por el viewport hack del browser.
  if (typeof window.screen !== "undefined" && window.screen.width <= 1024) {
    return true;
  }

  return false;
}
