import { useMemo } from "react";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";
import {
  diagnosticarProyecto,
  type SeveridadAlerta,
} from "@/lib/diagnostico-pedagogico";
import type { Proyecto } from "@/types/proyecto";
import { cn } from "@/lib/utils";

/**
 * Panel de diagnóstico pedagógico: muestra, en criollo, qué está bien y qué
 * conviene revisar del proyecto. Pensado para que el alumno aprenda en el
 * momento, sin esperar la corrección del docente.
 */

const ESTILO: Record<
  SeveridadAlerta,
  { icono: typeof Info; clase: string; chip: string; orden: number }
> = {
  critico: {
    icono: XCircle,
    clase: "border-rose-300 bg-rose-50 dark:border-rose-800 dark:bg-rose-950/30",
    chip: "text-rose-700 dark:text-rose-300",
    orden: 0,
  },
  advertencia: {
    icono: AlertTriangle,
    clase: "border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30",
    chip: "text-amber-700 dark:text-amber-300",
    orden: 1,
  },
  info: {
    icono: Info,
    clase: "border-sky-300 bg-sky-50 dark:border-sky-800 dark:bg-sky-950/30",
    chip: "text-sky-700 dark:text-sky-300",
    orden: 2,
  },
  ok: {
    icono: CheckCircle2,
    clase: "border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30",
    chip: "text-emerald-700 dark:text-emerald-300",
    orden: 3,
  },
};

export default function PanelDiagnostico({ proyecto }: { proyecto: Proyecto }) {
  const { alertas, problemas, saludable } = useMemo(
    () => diagnosticarProyecto(proyecto),
    [proyecto]
  );

  if (alertas.length === 0) return null;

  const ordenadas = [...alertas].sort(
    (a, b) => ESTILO[a.severidad].orden - ESTILO[b.severidad].orden
  );

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          🔍 Diagnóstico de tu proyecto
        </h3>
        {saludable ? (
          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200">
            Sin problemas detectados
          </span>
        ) : (
          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
            {problemas} cosa{problemas === 1 ? "" : "s"} para revisar
          </span>
        )}
      </div>

      <p className="mb-3 text-[11px] text-muted-foreground">
        Esto NO es tu nota. Son señales automáticas para que entiendas si tus
        decisiones cierran. Mejorá lo que puedas y volvé a mirar.
      </p>

      <div className="space-y-2">
        {ordenadas.map((a) => {
          const est = ESTILO[a.severidad];
          const Icono = est.icono;
          return (
            <div
              key={a.id}
              className={cn("rounded-md border p-2.5", est.clase)}
            >
              <div className="flex items-start gap-2">
                <Icono className={cn("mt-0.5 h-4 w-4 flex-shrink-0", est.chip)} />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[13px] font-semibold">{a.titulo}</span>
                    {a.etapa != null && (
                      <span className="rounded bg-background/70 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        Etapa {a.etapa}
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                    {a.detalle}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
