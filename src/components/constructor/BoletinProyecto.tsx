import { useMemo } from "react";
import { CheckCircle2, AlertTriangle, XCircle, MinusCircle } from "lucide-react";
import { calcularBoletin, type EstadoBoletin } from "@/lib/boletin-proyecto";
import type { Proyecto } from "@/types/proyecto";
import { cn } from "@/lib/utils";

/**
 * Boletín de autoevaluación: muestra los indicadores del alumno frente a los
 * rangos sanos, lado a lado, con un estado claro por fila. Sirve para que el
 * alumno se autocalifique antes de entregar.
 */

const ICONO: Record<EstadoBoletin, { Icono: typeof CheckCircle2; clase: string }> = {
  bien: { Icono: CheckCircle2, clase: "text-emerald-600 dark:text-emerald-400" },
  atencion: { Icono: AlertTriangle, clase: "text-amber-600 dark:text-amber-400" },
  mal: { Icono: XCircle, clase: "text-rose-600 dark:text-rose-400" },
  sin_dato: { Icono: MinusCircle, clase: "text-muted-foreground" },
};

export default function BoletinProyecto({ proyecto }: { proyecto: Proyecto }) {
  const { filas, puntaje } = useMemo(() => calcularBoletin(proyecto), [proyecto]);

  if (filas.length === 0) return null;

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-1 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">📋 Tu proyecto vs. lo recomendado</h3>
        {puntaje.total > 0 && (
          <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-semibold">
            {puntaje.bien}/{puntaje.total} en verde
          </span>
        )}
      </div>
      <p className="mb-3 text-[11px] text-muted-foreground">
        Compará cada indicador con el rango sano esperado. Apuntá a tener todo en
        verde antes de dar por cerrado el proyecto.
      </p>

      <div className="overflow-hidden rounded-md border border-border">
        {/* Encabezado */}
        <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-2 bg-secondary/50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          <div>Indicador</div>
          <div className="text-right">Tu valor</div>
          <div className="text-right">Recomendado</div>
        </div>
        {filas.map((f, i) => {
          const { Icono, clase } = ICONO[f.estado];
          return (
            <div
              key={f.clave}
              className={cn(
                "grid grid-cols-[1.4fr_1fr_1fr] items-center gap-2 px-3 py-2",
                i % 2 === 1 && "bg-secondary/20"
              )}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <Icono className={cn("h-3.5 w-3.5 flex-shrink-0", clase)} />
                  <span className="truncate text-[12px] font-medium">{f.nombre}</span>
                </div>
                <div className="ml-5 text-[10px] text-muted-foreground">
                  {f.comentario}
                </div>
              </div>
              <div className={cn("text-right text-[13px] font-semibold tabular-nums", clase)}>
                {f.valorTexto}
              </div>
              <div className="text-right text-[11px] text-muted-foreground tabular-nums">
                {f.metaTexto}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
