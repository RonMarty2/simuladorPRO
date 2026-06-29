import { useMemo } from "react";
import { Lightbulb, Search, TrendingDown } from "lucide-react";
import { analizarPostmortem } from "@/lib/postmortem-simulacion";
import type { Simulacion, TurnoHistorial } from "@/types/simulacion";
import { formatearBolivianos } from "@/lib/utils";

/**
 * Resumen de "¿qué pasó?" al terminar una simulación. El aprendizaje está en
 * el post-mortem: qué turno dolió, qué evento pegó, qué mejorar la próxima.
 */
export default function PanelPostmortem({
  simulacion,
  historial,
}: {
  simulacion: Simulacion;
  historial: TurnoHistorial[];
}) {
  const pm = useMemo(
    () => analizarPostmortem(simulacion, historial),
    [simulacion, historial]
  );

  if (historial.length === 0) return null;

  return (
    <div className="rounded-lg border border-border bg-card p-4 text-left">
      <h3 className="flex items-center gap-2 text-sm font-semibold">
        <Search className="h-4 w-4 text-primary" />
        ¿Qué pasó? Análisis de tu simulación
      </h3>
      <p className="mt-1 text-xs text-muted-foreground">{pm.veredicto}</p>

      {pm.peorTurno != null && pm.peorDeltaCaja != null && pm.peorDeltaCaja < 0 && (
        <div className="mt-3 flex items-start gap-2 rounded-md border border-rose-200 bg-rose-50 p-2.5 dark:border-rose-800 dark:bg-rose-950/30">
          <TrendingDown className="mt-0.5 h-4 w-4 flex-shrink-0 text-rose-600 dark:text-rose-400" />
          <div className="text-[11px]">
            <span className="font-semibold">Tu peor momento fue el turno {pm.peorTurno}</span>
            {pm.eventoMasDuro ? ` — por "${pm.eventoMasDuro}"` : ""}: la caja cayó{" "}
            {formatearBolivianos(pm.peorDeltaCaja)} ese turno.
          </div>
        </div>
      )}

      {pm.hallazgos.length > 0 && (
        <div className="mt-3 space-y-2">
          {pm.hallazgos.map((h, i) => (
            <div key={i} className="rounded-md border border-border bg-background/50 p-2.5">
              <div className="text-[12px] font-semibold">{h.titulo}</div>
              <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                {h.detalle}
              </p>
            </div>
          ))}
        </div>
      )}

      {pm.consejos.length > 0 && (
        <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-2.5 dark:border-amber-800 dark:bg-amber-950/30">
          <div className="mb-1 flex items-center gap-1.5 text-[12px] font-semibold text-amber-800 dark:text-amber-200">
            <Lightbulb className="h-3.5 w-3.5" />
            Para la próxima
          </div>
          <ul className="ml-4 list-disc space-y-0.5 text-[11px] text-amber-900 dark:text-amber-100">
            {pm.consejos.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
