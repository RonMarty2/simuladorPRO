import { useEffect, useState } from "react";
import { Download, Smartphone, X } from "lucide-react";

/**
 * Botón "Instalar app" para PWA. Comportamiento:
 *
 * - Android / Chrome: el navegador dispara el evento `beforeinstallprompt`
 *   antes de mostrar su propio banner. Lo interceptamos y mostramos NUESTRO
 *   botón para que el alumno lo vea sí o sí. Click → diálogo nativo del
 *   navegador → instalado.
 *
 * - iOS / Safari: NO existe `beforeinstallprompt`. Detectamos el user-agent y
 *   mostramos un modal con instrucciones manuales ("toca compartir → Agregar a
 *   pantalla de inicio").
 *
 * - Ya instalado: se oculta automáticamente.
 *
 * - Cerrado por el usuario: guardamos en localStorage para no molestar más
 *   en esta sesión.
 */

type DeferredPrompt = {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const SS_KEY_OCULTO = "simulador.pwa.botonOcultoSesion";

function esIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent) && !("MSStream" in window);
}

function yaInstalada(): boolean {
  if (typeof window === "undefined") return false;
  // Si la app corre en modo standalone, ya está instalada.
  if (window.matchMedia?.("(display-mode: standalone)").matches) return true;
  if ((navigator as any).standalone === true) return true; // iOS
  return false;
}

export default function BotonInstalarApp() {
  const [prompt, setPrompt] = useState<DeferredPrompt | null>(null);
  const [mostrarModalIOS, setMostrarModalIOS] = useState(false);
  // Usamos sessionStorage (no localStorage): si el alumno cierra el banner,
  // no aparece más en ESTA sesión, pero sí en visitas futuras. Útil cuando
  // desinstalan y vuelven a entrar: queremos que vean el banner de nuevo.
  // Migración automática del flag viejo en localStorage (lo borramos si
  // existe) para que los usuarios que cerraron antes vuelvan a verlo.
  const [ocultoSesion, setOcultoSesion] = useState(() => {
    try {
      // Limpieza única del flag antiguo
      localStorage.removeItem("simulador.pwa.botonOculto");
      return sessionStorage.getItem(SS_KEY_OCULTO) === "1";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as unknown as DeferredPrompt);
    };
    window.addEventListener("beforeinstallprompt", handler);
    // Cuando la app se instala, ocultamos el botón.
    const handlerInstalled = () => {
      setPrompt(null);
      setMostrarModalIOS(false);
    };
    window.addEventListener("appinstalled", handlerInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", handlerInstalled);
    };
  }, []);

  const cerrar = () => {
    setOcultoSesion(true);
    try {
      sessionStorage.setItem(SS_KEY_OCULTO, "1");
    } catch {
      /* ignore */
    }
  };

  const instalar = async () => {
    if (esIOS()) {
      setMostrarModalIOS(true);
      return;
    }
    if (!prompt) return;
    await prompt.prompt();
    const choice = await prompt.userChoice;
    if (choice.outcome === "accepted") {
      setPrompt(null);
    }
  };

  // No mostrar el botón si:
  //  - la app ya está instalada
  //  - el usuario lo cerró en esta sesión
  //  - no es iOS y el navegador no disparó beforeinstallprompt
  if (yaInstalada()) return null;
  if (ocultoSesion) return null;
  if (!prompt && !esIOS()) return null;

  return (
    <>
      <div className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-2.5 shadow-xl shadow-amber-500/30 backdrop-blur dark:border-amber-700 dark:from-amber-950/80 dark:to-orange-950/80">
        <Smartphone className="h-4 w-4 flex-shrink-0 text-amber-700 dark:text-amber-300" />
        <div className="text-xs">
          <div className="font-bold text-amber-900 dark:text-amber-100">Instalá la app</div>
          <div className="text-[10px] text-amber-800/80 dark:text-amber-300">
            Más rápido, ícono en tu pantalla, sin barra de navegador.
          </div>
        </div>
        <button
          onClick={instalar}
          className="flex items-center gap-1 rounded-full bg-amber-600 px-3 py-1.5 text-xs font-bold text-white shadow transition hover:bg-amber-700"
        >
          <Download className="h-3.5 w-3.5" />
          Instalar
        </button>
        <button
          onClick={cerrar}
          aria-label="Cerrar"
          className="rounded-full p-1 text-amber-800 transition hover:bg-amber-100 dark:text-amber-300 dark:hover:bg-amber-900"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {mostrarModalIOS && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-4 sm:items-center">
          <div className="w-full max-w-sm rounded-lg bg-card p-5 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold">Instalar en iPhone / iPad</h2>
              <button
                onClick={() => setMostrarModalIOS(false)}
                className="rounded-md p-1 hover:bg-secondary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <ol className="space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  1
                </span>
                <span>
                  Tocá el botón <strong>Compartir</strong>{" "}
                  <span className="inline-block align-middle text-base">⎙</span> de Safari
                  (abajo en el centro).
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  2
                </span>
                <span>
                  Bajá y tocá <strong>"Añadir a pantalla de inicio"</strong>.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  3
                </span>
                <span>
                  Confirmá tocando <strong>"Añadir"</strong>. Vas a ver el ícono de SIMPRO en tu
                  pantalla de inicio.
                </span>
              </li>
            </ol>
            <p className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-[11px] text-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
              ⚠️ Tiene que ser desde <strong>Safari</strong>. Chrome en iPhone no permite instalar.
            </p>
            <button
              onClick={() => setMostrarModalIOS(false)}
              className="mt-4 w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
}
