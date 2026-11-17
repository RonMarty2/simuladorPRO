import { useMemo, useState } from "react";
import { CheckCircle2, RotateCcw, Sparkles, Wrench, XCircle } from "lucide-react";
import { generarPlanesViabilidad } from "@/lib/planes-viabilidad";
import { aplicarModificadores } from "@/lib/escenarios";
import { useProyectoStore } from "@/stores/proyecto-store";
import { cn, fmtNum, formatearBolivianos } from "@/lib/utils";
import { tirCalculable } from "@/lib/acotar-numero";
import type { Proyecto } from "@/types/proyecto";

export default function PanelComoHacerViable({
  proyecto,
  esViable,
}: {
  proyecto: Proyecto;
  esViable: boolean;
}) {
  const [abierto, setAbierto] = useState(false);
  const [respaldo, setRespaldo] = useState<Proyecto | null>(null);
  const cargar = useProyectoStore((s) => s.cargar);

  const planes = useMemo(() => {
    if (!abierto) return [];
    return generarPlanesViabilidad(proyecto);
  }, [abierto, proyecto]);

  const probarPlan = (mods: NonNullable<(typeof planes)[number]["modificadores"]>) => {
    if (!respaldo) {
      setRespaldo(structuredClone(proyecto));
    }
    const modificado = aplicarModificadores(proyecto, mods);
    cargar({
      ...modificado,
      actualizado_en: new Date().toISOString(),
    });
  };

  const deshacerPrueba = () => {
    if (!respaldo) return;
    cargar(respaldo);
    setRespaldo(null);
  };

  return (
    <div className="order-4 rounded-xl border border-border bg-card p-4 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-bold text-foreground">
            <Wrench className={cn("h-4 w-4", esViable ? "text-emerald-600" : "text-amber-600")} />
            {esViable
              ? "Optimizador de rentabilidad"
              : "Este proyecto no es rentable todavía"}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {esViable
              ? "Puedes explorar cuánto margen de mejora tiene desde distintas perspectivas."
              : "Calcula automáticamente qué cambios hacen falta (en precio, ventas, costos, inversión o combinados) para volverlo viable."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {respaldo && (
            <button
              type="button"
              onClick={deshacerPrueba}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground transition hover:bg-accent"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Volver a números anteriores
            </button>
          )}
          <button
            type="button"
            onClick={() => setAbierto((v) => !v)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-bold shadow-xs transition",
              esViable
                ? "border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20"
                : "bg-amber-600 text-white hover:bg-amber-700"
            )}
          >
            <Sparkles className="h-3.5 w-3.5" />
            {abierto
              ? "Ocultar perspectivas"
              : esViable
                ? "Explorar perspectivas"
                : "¿Cómo hacerlo viable?"}
          </button>
        </div>
      </div>

      {abierto && (
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          {planes.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                "flex flex-col justify-between rounded-lg border p-3.5",
                plan.alcanzable
                  ? "border-emerald-300/80 bg-emerald-50/40 dark:border-emerald-800/60 dark:bg-emerald-950/20"
                  : "border-border bg-muted/30"
              )}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {plan.perspectiva}
                  </span>
                  {plan.alcanzable ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Viable
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                      <XCircle className="h-3.5 w-3.5" />
                      No alcanza solo
                    </span>
                  )}
                </div>

                <h4 className="mt-1 text-sm font-bold text-foreground">
                  {plan.titulo}
                </h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  {plan.resumen}
                </p>

                {plan.alcanzable && plan.vanResultante !== null && (
                  <div className="mt-2.5 flex flex-wrap gap-3 rounded-md bg-background/80 px-2.5 py-1.5 text-[11px]">
                    <span>
                      <strong>VAN:</strong>{" "}
                      <span className="font-semibold text-emerald-700 dark:text-emerald-300">
                        {formatearBolivianos(plan.vanResultante)}
                      </span>
                    </span>
                    <span>
                      <strong>TIR:</strong>{" "}
                      <span className="font-semibold">
                        {plan.tirResultante !== null && tirCalculable(plan.tirResultante)
                          ? `${fmtNum(plan.tirResultante * 100, 1)}%`
                          : "—"}
                      </span>
                    </span>
                    {plan.waccResultante !== null && (
                      <span>
                        <strong>WACC:</strong> {fmtNum(plan.waccResultante * 100, 1)}%
                      </span>
                    )}
                  </div>
                )}
              </div>

              {plan.alcanzable && plan.modificadores && (
                <div className="mt-3 pt-2 border-t border-border/50">
                  <button
                    type="button"
                    onClick={() => probarPlan(plan.modificadores!)}
                    className="w-full rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90"
                  >
                    Probar esta solución en el simulador
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
