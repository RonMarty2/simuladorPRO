import { Check, Save } from "lucide-react";
import type { EstadoGuardado } from "@/hooks/useAutoGuardado";
import { cn } from "@/lib/utils";

interface Props {
  pasoActual: number;
  totalPasos: number;
  nombreProyecto: string;
  estadoGuardado: EstadoGuardado;
  onCambiarPaso: (paso: number) => void;
  titulos: Record<number, string>;
  titulosCortos?: Record<number, string>;
}

export default function BarraProgreso({
  pasoActual,
  totalPasos,
  nombreProyecto,
  estadoGuardado,
  onCambiarPaso,
  titulos,
  titulosCortos,
}: Props) {
  return (
    <div className="space-y-3 rounded-lg border border-border bg-card p-4">
      {/* Header con nombre + estado guardado */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Proyecto
          </div>
          <div className="truncate text-base font-semibold tracking-tight">
            {nombreProyecto}
          </div>
        </div>
        <EstadoGuardadoChip estado={estadoGuardado} />
      </div>

      {/* Stepper de pasos */}
      <div className="overflow-x-auto pb-1">
        <div className="flex min-w-max items-stretch gap-1">
          {Array.from({ length: totalPasos }, (_, i) => {
            const n = i + 1;
            const completado = n < pasoActual;
            const actual = n === pasoActual;
            const corto = titulosCortos?.[n] ?? titulos[n] ?? `Paso ${n}`;
            return (
              <button
                key={n}
                onClick={() => onCambiarPaso(n)}
                className={cn(
                  "group flex min-w-[88px] flex-col items-center gap-1 rounded-md border px-2 py-1.5 transition",
                  actual
                    ? "border-primary bg-primary text-primary-foreground shadow-sm"
                    : completado
                      ? "border-emerald-500/40 bg-emerald-50 text-emerald-900 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-200"
                      : "border-border bg-background text-muted-foreground hover:border-foreground/40 hover:bg-secondary/50"
                )}
                title={titulos[n]}
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      "flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold",
                      actual
                        ? "bg-primary-foreground text-primary"
                        : completado
                          ? "bg-emerald-500 text-white"
                          : "bg-secondary text-foreground"
                    )}
                  >
                    {completado ? <Check className="h-3 w-3" /> : n}
                  </span>
                </div>
                <div className="text-[10px] font-medium leading-tight text-center">
                  {corto}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detalle del paso actual */}
      <div className="flex items-center justify-between border-t border-border pt-2 text-xs">
        <span className="text-muted-foreground">
          Paso <strong>{pasoActual}</strong> de {totalPasos}:{" "}
          <strong className="text-foreground">{titulos[pasoActual]}</strong>
        </span>
        <span className="text-muted-foreground">
          {Math.round((pasoActual / totalPasos) * 100)}% completado
        </span>
      </div>
    </div>
  );
}

function EstadoGuardadoChip({ estado }: { estado: EstadoGuardado }) {
  if (estado.tipo === "idle") {
    return (
      <span className="rounded-md bg-secondary px-2 py-1 text-xs text-muted-foreground">
        Sin cambios
      </span>
    );
  }
  if (estado.tipo === "guardando") {
    return (
      <span className="flex items-center gap-1 rounded-md bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-900 dark:bg-amber-900/40 dark:text-amber-200">
        <Save className="h-3 w-3 animate-pulse" />
        Guardando… (no refresques)
      </span>
    );
  }
  if (estado.tipo === "guardado") {
    return (
      <span className="flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">
        <Check className="h-3 w-3" />
        Guardado ✓
      </span>
    );
  }
  return (
    <span className="rounded-md bg-destructive/15 px-2 py-1 text-xs font-semibold text-destructive">
      Error: {estado.mensaje}
    </span>
  );
}
