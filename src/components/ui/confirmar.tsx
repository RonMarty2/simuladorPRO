import { useEffect, useRef, useState } from "react";

/**
 * Confirmación propia que reemplaza a window.confirm.
 *
 * window.confirm congela la página mientras está abierto y Chrome lo reporta como
 * un problema de interacción (INP) de más de un segundo. Esta versión es un aviso
 * dentro de la página: no bloquea nada y se usa igual de simple:
 *
 *   if (!(await confirmar("¿Seguro?"))) return;
 *
 * Requiere montar <ConfirmarHost /> una vez (está en App.tsx). Si no estuviera
 * montado (por ejemplo en una prueba), cae al window.confirm del navegador.
 */

interface Pedido {
  mensaje: string;
  textoOk: string;
  peligro: boolean;
  resolver: (acepto: boolean) => void;
}

let publicar: ((pedido: Pedido | null) => void) | null = null;

export function confirmar(
  mensaje: string,
  opciones: { textoOk?: string; peligro?: boolean } = {}
): Promise<boolean> {
  if (!publicar) return Promise.resolve(typeof window !== "undefined" ? window.confirm(mensaje) : false);
  const mostrar = publicar;
  return new Promise<boolean>((resolver) => {
    mostrar({
      mensaje,
      textoOk: opciones.textoOk ?? "Aceptar",
      peligro: opciones.peligro ?? false,
      resolver,
    });
  });
}

export function ConfirmarHost() {
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const botonOk = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    publicar = setPedido;
    return () => {
      publicar = null;
    };
  }, []);

  useEffect(() => {
    if (pedido) botonOk.current?.focus();
  }, [pedido]);

  if (!pedido) return null;

  const cerrar = (acepto: boolean) => {
    pedido.resolver(acepto);
    setPedido(null);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      role="alertdialog"
      aria-modal="true"
      onKeyDown={(e) => {
        if (e.key === "Escape") cerrar(false);
      }}
    >
      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-5 shadow-xl">
        <p className="text-sm leading-relaxed text-foreground">{pedido.mensaje}</p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => cerrar(false)}
            className="rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-secondary"
          >
            Cancelar
          </button>
          <button
            ref={botonOk}
            type="button"
            onClick={() => cerrar(true)}
            className={
              pedido.peligro
                ? "rounded-md bg-destructive px-3 py-1.5 text-xs font-medium text-destructive-foreground hover:bg-destructive/90"
                : "rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90"
            }
          >
            {pedido.textoOk}
          </button>
        </div>
      </div>
    </div>
  );
}
