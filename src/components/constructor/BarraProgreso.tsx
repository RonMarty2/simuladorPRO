import { Check, Save } from "lucide-react";
import type { EstadoGuardado } from "@/hooks/useAutoGuardado";
import { cn } from "@/lib/utils";

interface Props {
  pasoActual: number;
  totalPasos: number;
  nombreProyecto: string;
  estadoGuardado: EstadoGuardado;
  onCambiarPaso: (paso: number) => void;
}

export default function BarraProgreso({
  pasoActual,
  totalPasos,
  nombreProyecto,
  estadoGuardado,
  onCambiarPaso,
}: Props) {
  return (
    <div className="space-y-3 rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">
            Proyecto
          </div>
          <div className="text-base font-semibold tracking-tight">{nombreProyecto}</div>
        </div>
        <EstadoGuardadoChip estado={estadoGuardado} />
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
          <span>Paso {pasoActual} de {totalPasos}</span>
          <span>{Math.round((pasoActual / totalPasos) * 100)}%</span>
        </div>
        <div className="flex gap-1">
          {Array.from({ length: totalPasos }, (_, i) => {
            const n = i + 1;
            const completado = n < pasoActual;
            const actual = n === pasoActual;
            return (
              <button
                key={n}
                onClick={() => onCambiarPaso(n)}
                title={`Ir al paso ${n}`}
                className={cn(
                  "flex h-1.5 flex-1 rounded transition",
                  completado && "bg-primary",
                  actual && "bg-primary",
                  !completado && !actual && "bg-muted hover:bg-muted-foreground/30"
                )}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

function EstadoGuardadoChip({ estado }: { estado: EstadoGuardado }) {
  if (estado.tipo === "idle") {
    return <span className="text-xs text-muted-foreground">Sin cambios</span>;
  }
  if (estado.tipo === "guardando") {
    return (
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        <Save className="h-3 w-3 animate-pulse" />
        Guardando…
      </span>
    );
  }
  if (estado.tipo === "guardado") {
    return (
      <span className="flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-400">
        <Check className="h-3 w-3" />
        Guardado
      </span>
    );
  }
  return <span className="text-xs text-destructive">Error: {estado.mensaje}</span>;
}
