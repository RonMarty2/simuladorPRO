import { useMemo } from "react";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import { indicadoresPorTipo, type SeveridadIndicador } from "@/lib/indicadores-por-tipo";
import type { Proyecto } from "@/types/proyecto";
import { cn } from "@/lib/utils";

/**
 * Indicadores propios del tipo de negocio del proyecto (hoy: turismo).
 * Solo informativos: no cambian el VAN ni la caja. Si el proyecto no tiene un
 * tipo con panel, no se muestra nada.
 */

const ESTILO: Record<SeveridadIndicador, { icono: typeof Info; clase: string; chip: string }> = {
  critico: {
    icono: XCircle,
    clase: "border-rose-300 bg-rose-50 dark:border-rose-800 dark:bg-rose-950/30",
    chip: "text-rose-700 dark:text-rose-300",
  },
  advertencia: {
    icono: AlertTriangle,
    clase: "border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30",
    chip: "text-amber-700 dark:text-amber-300",
  },
  info: {
    icono: Info,
    clase: "border-sky-300 bg-sky-50 dark:border-sky-800 dark:bg-sky-950/30",
    chip: "text-sky-700 dark:text-sky-300",
  },
  ok: {
    icono: CheckCircle2,
    clase: "border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30",
    chip: "text-emerald-700 dark:text-emerald-300",
  },
};

export default function PanelIndicadoresTipo({ proyecto }: { proyecto: Proyecto }) {
  const panel = useMemo(() => indicadoresPorTipo(proyecto), [proyecto]);
  if (!panel) return null;

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h3 className="mb-1 text-sm font-semibold">{panel.titulo}</h3>
      <p className="mb-3 text-[11px] text-muted-foreground">{panel.introduccion}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {panel.indicadores.map((i) => {
          const est = ESTILO[i.severidad];
          const Icono = est.icono;
          return (
            <div key={i.id} className={cn("rounded-md border p-2.5", est.clase)}>
              <div className="flex items-start gap-2">
                <Icono className={cn("mt-0.5 h-4 w-4 flex-shrink-0", est.chip)} />
                <div className="min-w-0">
                  <div className="text-xs font-semibold leading-tight">{i.nombre}</div>
                  <div className="text-base font-bold leading-tight">{i.valor}</div>
                  <p className="mt-1 text-[11px] leading-snug text-muted-foreground">{i.detalle}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
