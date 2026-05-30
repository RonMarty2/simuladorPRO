import { useMemo, useState } from "react";
import { CheckCircle2, Loader2, X, XCircle, ChevronLeft, ChevronRight, Copy } from "lucide-react";
import { revisarEntrega } from "@/lib/proyecto-supabase";
import type { Entrega } from "@/types/proyecto";
import { cn } from "@/lib/utils";
import DetalleEntregaPasoAPaso from "./DetalleEntregaPasoAPaso";

/**
 * Modal de "revisar todas las entregas pendientes del estudiante / grupo de
 * una sola pasada". Recibe la LISTA de entregas pendientes (ya filtradas
 * desde la tarjeta agrupada). Cada tab es una etapa con su propio formulario.
 *
 * UX:
 *   - Nota y comentario por etapa, independientes.
 *   - Botón "Aplicar a todas" copia la nota+comentario+decisión actual a las
 *     demás etapas (override). Para cuando querés calificar todo igual de un
 *     bombazo.
 *   - "Guardar todas" dispara todas las revisiones en paralelo y cierra.
 *   - Las que NO querés calificar ahora las marcás como 'saltear'; el guardar
 *     final solo persiste las que tengan decisión.
 */

type Decision = "aprobada" | "reprobada" | "saltear";

interface EstadoEtapa {
  decision: Decision;
  nota: number;
  comentario: string;
}

export default function ModalRevisionMasiva({
  entregas,
  titular,
  onCerrar,
}: {
  entregas: Entrega[];
  /** Nombre que va en el header (estudiante o grupo). */
  titular: string;
  onCerrar: (algunaActualizada: boolean) => void;
}) {
  // Ordenar por etapa para que las tabs vayan 1, 2, 3...
  const ordenadas = useMemo(
    () =>
      [...entregas].sort(
        (a, b) => (a.paso_entregado ?? 999) - (b.paso_entregado ?? 999)
      ),
    [entregas]
  );

  const [activoIdx, setActivoIdx] = useState(0);
  const [estados, setEstados] = useState<Record<string, EstadoEtapa>>(() => {
    const init: Record<string, EstadoEtapa> = {};
    for (const e of ordenadas) {
      init[e.id] = {
        decision:
          e.sugerencia_automatica === "reprobar" ? "reprobada" : "aprobada",
        nota: e.sugerencia_nota ?? 70,
        comentario: "",
      };
    }
    return init;
  });
  const [guardando, setGuardando] = useState(false);
  const [errorGuardar, setErrorGuardar] = useState<string | null>(null);

  const entregaActual = ordenadas[activoIdx];
  const estadoActual = estados[entregaActual.id];

  const actualizar = (id: string, cambios: Partial<EstadoEtapa>) => {
    setEstados((prev) => ({ ...prev, [id]: { ...prev[id], ...cambios } }));
  };

  const aplicarATodas = () => {
    if (!estadoActual) return;
    if (!confirm("¿Aplicar esta misma decisión, nota y comentario a todas las etapas?")) return;
    setEstados((prev) => {
      const next = { ...prev };
      for (const e of ordenadas) {
        if (e.id === entregaActual.id) continue;
        next[e.id] = {
          decision: estadoActual.decision,
          nota: estadoActual.nota,
          comentario: estadoActual.comentario,
        };
      }
      return next;
    });
  };

  const guardarTodas = async () => {
    setGuardando(true);
    setErrorGuardar(null);
    const aGuardar = ordenadas.filter((e) => {
      const s = estados[e.id];
      return s && s.decision !== "saltear";
    });
    if (aGuardar.length === 0) {
      setErrorGuardar("No hay ninguna etapa con decisión. Decidí al menos una o cerrá el modal.");
      setGuardando(false);
      return;
    }
    try {
      await Promise.all(
        aGuardar.map((e) => {
          const s = estados[e.id];
          return revisarEntrega(
            e.id,
            s.decision as "aprobada" | "reprobada",
            s.nota,
            s.comentario
          );
        })
      );
      onCerrar(true);
    } catch (e: any) {
      setErrorGuardar(e?.message ?? String(e));
    } finally {
      setGuardando(false);
    }
  };

  // Conteo de cuántas tienen decisión (excluyendo saltear)
  const cuantasConDecision = ordenadas.filter(
    (e) => estados[e.id]?.decision !== "saltear"
  ).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg bg-card shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <div>
            <h2 className="flex items-center gap-2 text-base font-semibold">
              📚 Revisión rápida · {titular}
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {ordenadas.length} etapa{ordenadas.length === 1 ? "" : "s"} pendiente
              {ordenadas.length === 1 ? "" : "s"} · Calificá una por una o aplicá la misma decisión a todas.
            </p>
          </div>
          <button
            onClick={() => onCerrar(false)}
            disabled={guardando}
            className="rounded-md p-1 hover:bg-secondary disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs por etapa */}
        <div className="flex flex-wrap gap-1 border-b border-border bg-secondary/30 px-3 py-2">
          {ordenadas.map((e, idx) => {
            const s = estados[e.id];
            const colorTab =
              s?.decision === "aprobada"
                ? "bg-emerald-500 text-white"
                : s?.decision === "reprobada"
                  ? "bg-rose-500 text-white"
                  : s?.decision === "saltear"
                    ? "bg-secondary text-muted-foreground opacity-60"
                    : "bg-amber-400 text-amber-950";
            return (
              <button
                key={e.id}
                onClick={() => setActivoIdx(idx)}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition",
                  idx === activoIdx
                    ? "ring-2 ring-primary ring-offset-1"
                    : "ring-0",
                  colorTab
                )}
              >
                {e.paso_entregado ? `Etapa ${e.paso_entregado}` : "Proyecto"}
                {e.numero_intento > 1 && ` ·#${e.numero_intento}`}
                {s?.decision === "saltear" ? " (—)" : ` · ${s?.nota ?? "—"}`}
              </button>
            );
          })}
        </div>

        {/* Cuerpo: detalle de la etapa activa + form */}
        <div className="flex-1 overflow-y-auto p-4">
          {entregaActual && (
            <FormEtapa
              entrega={entregaActual}
              estado={estadoActual}
              onCambiar={(c) => actualizar(entregaActual.id, c)}
            />
          )}
        </div>

        {/* Footer con controles globales */}
        <div className="space-y-2 border-t border-border bg-secondary/20 p-3">
          {errorGuardar && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 px-2 py-1.5 text-xs text-destructive">
              {errorGuardar}
            </div>
          )}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActivoIdx((i) => Math.max(0, i - 1))}
                disabled={activoIdx === 0 || guardando}
                className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs hover:bg-secondary disabled:opacity-40"
              >
                <ChevronLeft className="h-3 w-3" /> Anterior
              </button>
              <button
                onClick={() =>
                  setActivoIdx((i) => Math.min(ordenadas.length - 1, i + 1))
                }
                disabled={activoIdx === ordenadas.length - 1 || guardando}
                className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs hover:bg-secondary disabled:opacity-40"
              >
                Siguiente <ChevronRight className="h-3 w-3" />
              </button>
              {ordenadas.length > 1 && (
                <button
                  onClick={aplicarATodas}
                  disabled={guardando}
                  title="Copia decisión + nota + comentario actuales a todas las demás etapas"
                  className="flex items-center gap-1 rounded-md border border-primary/40 bg-primary/5 px-2 py-1 text-xs text-primary hover:bg-primary/10 disabled:opacity-40"
                >
                  <Copy className="h-3 w-3" /> Aplicar a todas
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-muted-foreground">
                Se guardarán <strong>{cuantasConDecision}</strong> de {ordenadas.length}
              </span>
              <button
                onClick={() => onCerrar(false)}
                disabled={guardando}
                className="rounded-md border border-border px-3 py-1.5 text-xs hover:bg-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={guardarTodas}
                disabled={guardando || cuantasConDecision === 0}
                className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {guardando && <Loader2 className="h-3 w-3 animate-spin" />}
                Guardar {cuantasConDecision === 1 ? "esta" : `las ${cuantasConDecision}`} revisione
                {cuantasConDecision === 1 ? "" : "s"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// FORM POR ETAPA
// ============================================================================
function FormEtapa({
  entrega,
  estado,
  onCambiar,
}: {
  entrega: Entrega;
  estado: EstadoEtapa;
  onCambiar: (c: Partial<EstadoEtapa>) => void;
}) {
  const datos = entrega.snapshot_datos;
  return (
    <div className="space-y-3">
      {/* Header de la etapa */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2">
        <div>
          <div className="text-sm font-bold">
            {entrega.paso_entregado
              ? `Etapa ${entrega.paso_entregado}`
              : "Proyecto entero"}{" "}
            · Intento #{entrega.numero_intento}
          </div>
          <div className="text-[11px] text-muted-foreground">
            Entregado: {new Date(entrega.entregado_en).toLocaleString("es-BO")}
          </div>
        </div>
        {entrega.sugerencia_automatica && (
          <div
            className={cn(
              "rounded-md border px-2 py-1 text-[11px]",
              entrega.sugerencia_automatica === "aprobar"
                ? "border-emerald-400 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100"
                : entrega.sugerencia_automatica === "reprobar"
                  ? "border-rose-400 bg-rose-50 text-rose-900 dark:bg-rose-950/30 dark:text-rose-100"
                  : "border-amber-400 bg-amber-50 text-amber-900 dark:bg-amber-950/30 dark:text-amber-100"
            )}
          >
            🤖 Sugiere: <strong>{entrega.sugerencia_automatica}</strong>
            {entrega.sugerencia_nota !== null && ` · ${entrega.sugerencia_nota}/100`}
          </div>
        )}
      </div>

      {/* Detalle paso a paso (colapsado por defecto en cada paso) */}
      <details className="rounded-md border border-border">
        <summary className="cursor-pointer px-3 py-2 text-xs font-semibold hover:bg-secondary/40">
          📂 Ver detalle de lo que entregó en esta etapa
        </summary>
        <div className="border-t border-border p-3">
          <DetalleEntregaPasoAPaso
            proyecto={datos}
            pasoEntregado={entrega.paso_entregado ?? null}
          />
        </div>
      </details>

      {/* Form de decisión */}
      <div className="space-y-2.5 rounded-md border-2 border-primary/40 bg-primary/5 p-3">
        <div className="text-[11px] font-semibold uppercase tracking-wide">Decisión</div>
        <div className="flex gap-2">
          <button
            onClick={() => onCambiar({ decision: "aprobada" })}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-md border-2 px-3 py-2 text-sm font-medium transition",
              estado.decision === "aprobada"
                ? "border-emerald-500 bg-emerald-500 text-white"
                : "border-border bg-card hover:bg-secondary"
            )}
          >
            <CheckCircle2 className="h-4 w-4" />
            Aprobar
          </button>
          <button
            onClick={() => onCambiar({ decision: "reprobada" })}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-md border-2 px-3 py-2 text-sm font-medium transition",
              estado.decision === "reprobada"
                ? "border-rose-500 bg-rose-500 text-white"
                : "border-border bg-card hover:bg-secondary"
            )}
          >
            <XCircle className="h-4 w-4" />
            Reprobar
          </button>
          <button
            onClick={() => onCambiar({ decision: "saltear" })}
            title="No la califico todavía; queda pendiente"
            className={cn(
              "rounded-md border-2 px-3 py-2 text-xs font-medium transition",
              estado.decision === "saltear"
                ? "border-amber-500 bg-amber-100 text-amber-900"
                : "border-border bg-card hover:bg-secondary"
            )}
          >
            Saltear
          </button>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          <div className="sm:col-span-1">
            <label className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Nota (0-100)
            </label>
            <input
              type="number"
              value={estado.nota}
              onChange={(e) =>
                onCambiar({
                  nota: Math.max(0, Math.min(100, Number(e.target.value) || 0)),
                })
              }
              disabled={estado.decision === "saltear"}
              min={0}
              max={100}
              className="mt-1 w-full rounded-md border border-input bg-background px-2 py-1.5 text-right text-sm font-bold disabled:opacity-50"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Comentario para el estudiante
            </label>
            <textarea
              value={estado.comentario}
              onChange={(e) => onCambiar({ comentario: e.target.value })}
              disabled={estado.decision === "saltear"}
              rows={2}
              placeholder="Qué hizo bien, qué le falta…"
              className="mt-1 w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs disabled:opacity-50"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
