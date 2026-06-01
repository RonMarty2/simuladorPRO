import { useEffect, useRef } from "react";

/**
 * Ejecuta `callback` cada `ms` milisegundos, PERO solo mientras la pestaña
 * está visible. Cuando el usuario cambia de pestaña o minimiza, el timer se
 * pausa (no dispara queries inútiles). Al volver a la pestaña, ejecuta una
 * vez de inmediato y reanuda el intervalo.
 *
 * Reemplazo directo de setInterval para auto-refresh de datos: con 30 alumnos
 * y un docente, evita decenas de queries por minuto a pestañas en segundo
 * plano (la mayoría del tiempo el celular tiene la pestaña oculta).
 */
export function useIntervaloVisible(callback: () => void, ms: number) {
  const cbRef = useRef(callback);
  cbRef.current = callback;

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;

    const arrancar = () => {
      if (timer != null) return;
      timer = setInterval(() => cbRef.current(), ms);
    };
    const parar = () => {
      if (timer != null) {
        clearInterval(timer);
        timer = null;
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        cbRef.current(); // refresca al volver
        arrancar();
      } else {
        parar();
      }
    };

    // Estado inicial
    if (document.visibilityState === "visible") arrancar();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      parar();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [ms]);
}
