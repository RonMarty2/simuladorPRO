import { Check, Save } from "lucide-react";
import type { EstadoGuardado } from "@/hooks/useAutoGuardado";
import type { NivelSemanaE, VersionProyecto } from "@/types/proyecto";
import { cn } from "@/lib/utils";
import { datosNivelSemanaE } from "@/lib/semana-e";

interface Props {
  pasoActual: number;
  totalPasos: number;
  nombreProyecto: string;
  version?: VersionProyecto;
  nivelSemanaE?: NivelSemanaE;
  pasosVisibles?: number[];
  estadoGuardado: EstadoGuardado;
  onCambiarPaso: (paso: number) => void;
  titulos: Record<number, string>;
  titulosCortos?: Record<number, string>;
  /** Pasos ya recorridos que siguen sin ningún dato (se marcan en ámbar, no en verde). */
  pasosSinDatos?: number[];
}

export default function BarraProgreso({
  pasoActual,
  totalPasos,
  nombreProyecto,
  version,
  nivelSemanaE,
  pasosVisibles,
  estadoGuardado,
  onCambiarPaso,
  titulos,
  titulosCortos,
  pasosSinDatos = [],
}: Props) {
  const numerosPasos =
    pasosVisibles ?? Array.from({ length: totalPasos }, (_, indice) => indice + 1);
  const indiceActual = Math.max(0, numerosPasos.indexOf(pasoActual));
  const nivel = datosNivelSemanaE(nivelSemanaE);
  const etiquetaPaso = nivel ? "Etapa" : "Paso";
  const sinDatosPrevios = numerosPasos.filter(
    (n, i) => i < indiceActual && pasosSinDatos.includes(n)
  ).length;

  return (
    <div className="space-y-3 rounded-lg border border-border bg-card p-4">
      {/* Header con nombre + estado guardado */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Proyecto
          </div>
          <div className="flex items-center gap-2">
            <div className="truncate text-base font-semibold tracking-tight">
              {nombreProyecto}
            </div>
            <BadgeVersion version={version} />
            {nivel && (
              <span className="flex-shrink-0 rounded bg-fuchsia-100 px-1.5 py-0.5 text-[11px] font-bold text-fuchsia-800 dark:bg-fuchsia-950/50 dark:text-fuchsia-200">
                {nivel.emoji} {nivel.nombre} · {nivel.pasos} etapas
              </span>
            )}
          </div>
        </div>
        <EstadoGuardadoChip estado={estadoGuardado} />
      </div>

      {/* Stepper de pasos */}
      <div className="overflow-x-auto pb-1">
        <div className="flex min-w-max items-stretch gap-1">
          {numerosPasos.map((n, i) => {
            const recorrido = i < indiceActual;
            const sinDatos = recorrido && pasosSinDatos.includes(n);
            const completado = recorrido && !sinDatos;
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
                    : sinDatos
                      ? "border-amber-500/50 bg-amber-50 text-amber-900 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-200"
                      : completado
                      ? "border-emerald-500/40 bg-emerald-50 text-emerald-900 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-200"
                      : "border-border bg-background text-muted-foreground hover:border-foreground/40 hover:bg-secondary/50"
                )}
                title={sinDatos ? `${titulos[n]} — aún sin datos` : titulos[n]}
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      "flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-bold",
                      actual
                        ? "bg-primary-foreground text-primary"
                        : sinDatos
                          ? "bg-amber-500 text-white"
                          : completado
                            ? "bg-emerald-500 text-white"
                            : "bg-secondary text-foreground"
                    )}
                  >
                    {sinDatos ? (
                      <span className="flex items-center gap-0.5">
                        <span aria-hidden="true">!</span>
                        <span>{n}</span>
                      </span>
                    ) : completado ? (
                      <span className="flex items-center gap-0.5">
                        <Check className="h-2.5 w-2.5" />
                        <span>{n}</span>
                      </span>
                    ) : (
                      n
                    )}
                  </span>
                </div>
                <div className="text-[11px] font-medium leading-tight text-center">
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
          {etiquetaPaso} <strong>{indiceActual + 1}</strong> de {numerosPasos.length}:{" "}
          <strong className="text-foreground">{titulos[pasoActual]}</strong>
        </span>
        <span className="text-muted-foreground">
          {Math.round(((indiceActual + 1 - sinDatosPrevios) / numerosPasos.length) * 100)}% completado
        </span>
      </div>
    </div>
  );
}

function BadgeVersion({ version }: { version?: VersionProyecto }) {
  const esV2 = version === "v2";
  return (
    <span
      className={cn(
        "flex-shrink-0 rounded px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wider",
        esV2
          ? "bg-indigo-600 text-white"
          : "bg-secondary text-muted-foreground"
      )}
      title={
        esV2
          ? "Con análisis de riesgo: incluye punto de equilibrio, sensibilidad, apalancamiento, Monte Carlo"
          : "Indicadores clásicos: VAN, TIR, recuperación, IR, TRC, SD, RBC y WACC"
      }
    >
      {esV2 ? "+ Riesgo" : "Clásico"}
    </span>
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
