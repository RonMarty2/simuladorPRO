import { useState } from "react";
import { CheckCircle2, Loader2, X, XCircle, Zap } from "lucide-react";
import { revisarEntrega } from "@/lib/proyecto-supabase";
import type { Entrega } from "@/types/proyecto";
import { cn } from "@/lib/utils";

/**
 * Modal "Calificar todo igual" — el caso típico: el docente ya miró el trabajo
 * del alumno y quiere ponerle UNA misma nota y UN mismo comentario a TODAS las
 * etapas pendientes que entregó, sin abrir tab por tab.
 *
 * Diferente al ModalRevisionMasiva (que permite calificar etapa por etapa):
 * acá no hay tabs, hay un solo formulario que se aplica a todo el lote.
 */
export default function ModalCalificarTodoIgual({
  entregas,
  titular,
  onCerrar,
}: {
  entregas: Entrega[];
  titular: string;
  onCerrar: (algunaActualizada: boolean) => void;
}) {
  const [decision, setDecision] = useState<"aprobada" | "reprobada">("aprobada");
  const [nota, setNota] = useState<number>(75);
  const [comentario, setComentario] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [resultado, setResultado] = useState<{ ok: number; fallidas: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const guardar = async () => {
    if (entregas.length === 0) return;
    if (!confirm(
      `Vas a poner ${decision === "aprobada" ? "APROBADA" : "REPROBADA"} con nota ${nota} a las ${entregas.length} etapas pendientes de ${titular}. ¿Confirmás?`
    )) return;
    setGuardando(true);
    setError(null);
    try {
      const resultados = await Promise.allSettled(
        entregas.map((e) => revisarEntrega(e.id, decision, nota, comentario))
      );
      const fallidas = resultados.filter((r) => r.status === "rejected").length;
      const ok = entregas.length - fallidas;
      setResultado({ ok, fallidas });
      if (fallidas === 0) {
        // Todo OK → cerramos automáticamente tras un breve momento para que el
        // docente vea el feedback visual.
        setTimeout(() => onCerrar(true), 900);
      }
    } catch (e: any) {
      setError(e?.message ?? "Error al calificar");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-lg bg-card shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 border-b border-border p-4">
          <div>
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <Zap className="h-4 w-4 text-amber-600" />
              Calificar todo igual
            </h2>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {titular} · {entregas.length} etapa{entregas.length === 1 ? "" : "s"} pendiente
              {entregas.length === 1 ? "" : "s"}
            </p>
          </div>
          <button
            onClick={() => onCerrar(resultado?.ok ? true : false)}
            disabled={guardando}
            className="rounded-md p-1 hover:bg-secondary disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Resultado */}
        {resultado && (
          <div
            className={cn(
              "border-b border-border p-3 text-xs",
              resultado.fallidas === 0
                ? "bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100"
                : "bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100"
            )}
          >
            {resultado.fallidas === 0 ? (
              <span>✅ Calificadas {resultado.ok} etapas. Cerrando…</span>
            ) : (
              <span>
                ⚠ Se calificaron {resultado.ok} de {entregas.length}. Faltaron{" "}
                {resultado.fallidas} (problema de red, reintentá).
              </span>
            )}
          </div>
        )}

        {/* Body: lista corta de qué etapas se van a calificar */}
        <div className="border-b border-border bg-secondary/20 px-4 py-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Esto se aplica a:
          </div>
          <div className="mt-1 flex flex-wrap gap-1">
            {entregas
              .slice()
              .sort((a, b) => (a.paso_entregado ?? 999) - (b.paso_entregado ?? 999))
              .map((e) => (
                <span
                  key={e.id}
                  className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-900 dark:bg-amber-900/50 dark:text-amber-100"
                >
                  {e.paso_entregado ? `Etapa ${e.paso_entregado}` : "Proyecto"}
                </span>
              ))}
          </div>
        </div>

        {/* Form */}
        <div className="space-y-3 p-4">
          {/* Decisión */}
          <div className="flex gap-2">
            <button
              onClick={() => setDecision("aprobada")}
              disabled={guardando}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-md border-2 px-3 py-2 text-sm font-medium transition disabled:opacity-50",
                decision === "aprobada"
                  ? "border-emerald-500 bg-emerald-500 text-white"
                  : "border-border bg-card hover:bg-secondary"
              )}
            >
              <CheckCircle2 className="h-4 w-4" />
              Aprobar todas
            </button>
            <button
              onClick={() => setDecision("reprobada")}
              disabled={guardando}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-md border-2 px-3 py-2 text-sm font-medium transition disabled:opacity-50",
                decision === "reprobada"
                  ? "border-rose-500 bg-rose-500 text-white"
                  : "border-border bg-card hover:bg-secondary"
              )}
            >
              <XCircle className="h-4 w-4" />
              Reprobar todas
            </button>
          </div>

          {/* Nota */}
          <div>
            <label className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Nota (0-100) — aplica a todas
            </label>
            <input
              type="number"
              value={nota}
              onChange={(e) => setNota(Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
              disabled={guardando}
              min={0}
              max={100}
              className="mt-1 w-24 rounded-md border border-input bg-background px-2 py-1.5 text-right text-sm font-bold disabled:opacity-50"
            />
          </div>

          {/* Comentario */}
          <div>
            <label className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              Comentario para el estudiante (aplica a todas)
            </label>
            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              disabled={guardando}
              rows={3}
              placeholder="Ej: Buen trabajo general. Revisá el cálculo de depreciación en próximas entregas."
              className="mt-1 w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs disabled:opacity-50"
            />
          </div>

          {error && (
            <div className="rounded-md border border-destructive/60 bg-destructive/10 px-2 py-1.5 text-xs text-destructive">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-border bg-secondary/20 p-3">
          <button
            onClick={() => onCerrar(resultado?.ok ? true : false)}
            disabled={guardando}
            className="rounded-md border border-border px-3 py-1.5 text-xs hover:bg-secondary disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={guardar}
            disabled={guardando || entregas.length === 0 || !!resultado}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold text-white shadow-md disabled:opacity-50",
              decision === "aprobada" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"
            )}
          >
            {guardando ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Zap className="h-3.5 w-3.5" />
            )}
            {decision === "aprobada" ? "Aprobar" : "Reprobar"} las {entregas.length} etapas
          </button>
        </div>
      </div>
    </div>
  );
}
