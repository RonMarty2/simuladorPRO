import { useState } from "react";
import { CheckCircle2, Loader2, X, XCircle } from "lucide-react";
import { revisarEntrega } from "@/lib/proyecto-supabase";
import type { Entrega } from "@/types/proyecto";
import { formatearBolivianos, cn } from "@/lib/utils";
import DetalleEntregaPasoAPaso from "./DetalleEntregaPasoAPaso";

export default function ModalRevisarEntrega({
  entrega,
  onCerrar,
}: {
  entrega: Entrega;
  onCerrar: (actualizada: boolean) => void;
}) {
  const yaRevisada = entrega.estado !== "pendiente";
  const [decision, setDecision] = useState<"aprobada" | "reprobada">(
    (entrega.estado as any) ??
      (entrega.sugerencia_automatica === "reprobar" ? "reprobada" : "aprobada")
  );
  const [nota, setNota] = useState<number>(
    entrega.nota ?? entrega.sugerencia_nota ?? 70
  );
  const [comentario, setComentario] = useState(entrega.comentario_docente ?? "");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const guardar = async () => {
    setGuardando(true);
    setError(null);
    try {
      await revisarEntrega(entrega.id, decision, nota, comentario);
      onCerrar(true);
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setGuardando(false);
    }
  };

  const datos = entrega.snapshot_datos;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-lg bg-card shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <div>
            <h2 className="text-base font-semibold">
              {yaRevisada ? "Ver revisión" : "Revisar entrega"} · Intento #{entrega.numero_intento}
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {datos.nombre} · Entregado el{" "}
              {new Date(entrega.entregado_en).toLocaleString("es-BO")}
            </p>
          </div>
          <button onClick={() => onCerrar(false)} className="rounded-md p-1 hover:bg-secondary">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[calc(90vh-160px)] space-y-4 overflow-y-auto p-4">
          {/* Indicadores del estudiante */}
          <div>
            <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Indicadores de esta entrega
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Indicador
                titulo="VAN"
                valor={entrega.van !== null ? formatearBolivianos(entrega.van) : "—"}
                positivo={(entrega.van ?? 0) > 0}
              />
              <Indicador
                titulo="TIR"
                valor={entrega.tir !== null ? `${(entrega.tir * 100).toFixed(2)}%` : "—"}
                positivo={(entrega.tir ?? 0) > (entrega.wacc ?? 0)}
              />
              <Indicador
                titulo="WACC"
                valor={entrega.wacc !== null ? `${(entrega.wacc * 100).toFixed(2)}%` : "—"}
                positivo
              />
              <Indicador
                titulo="Payback"
                valor={entrega.payback !== null ? `${entrega.payback.toFixed(1)} años` : "—"}
                positivo={(entrega.payback ?? 99) > 0 && (entrega.payback ?? 99) <= 5}
              />
            </div>
          </div>

          {/* Sugerencia automática */}
          {entrega.sugerencia_automatica && (
            <div
              className={cn(
                "rounded-md border-2 p-3",
                entrega.sugerencia_automatica === "aprobar"
                  ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30"
                  : entrega.sugerencia_automatica === "reprobar"
                  ? "border-rose-400 bg-rose-50 dark:bg-rose-950/30"
                  : "border-amber-400 bg-amber-50 dark:bg-amber-950/30"
              )}
            >
              <div className="flex items-center gap-2 text-sm font-semibold">
                🤖 Sugerencia automática:{" "}
                <span className="uppercase">{entrega.sugerencia_automatica}</span>
                {entrega.sugerencia_nota !== null && (
                  <span className="ml-auto text-base">{entrega.sugerencia_nota}/100</span>
                )}
              </div>
              {entrega.sugerencia_razones && entrega.sugerencia_razones.length > 0 && (
                <ul className="mt-1.5 space-y-0.5 text-[11px]">
                  {entrega.sugerencia_razones.map((r, i) => (
                    <li key={i}>• {r}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Detalle paso a paso: TODO lo que llenó el estudiante */}
          <DetalleEntregaPasoAPaso
            proyecto={datos}
            pasoEntregado={entrega.paso_entregado ?? null}
          />

          {/* Formulario de decisión */}
          <div className="space-y-3 rounded-md border-2 border-primary/40 bg-primary/5 p-3">
            <div className="text-xs font-semibold uppercase tracking-wide">
              {yaRevisada ? "Tu revisión" : "Decidir"}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setDecision("aprobada")}
                disabled={yaRevisada}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-md border-2 px-3 py-2 text-sm font-medium transition disabled:opacity-50",
                  decision === "aprobada"
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : "border-border bg-card hover:bg-secondary"
                )}
              >
                <CheckCircle2 className="h-4 w-4" />
                Aprobar
              </button>
              <button
                onClick={() => setDecision("reprobada")}
                disabled={yaRevisada}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-md border-2 px-3 py-2 text-sm font-medium transition disabled:opacity-50",
                  decision === "reprobada"
                    ? "border-rose-500 bg-rose-500 text-white"
                    : "border-border bg-card hover:bg-secondary"
                )}
              >
                <XCircle className="h-4 w-4" />
                Reprobar
              </button>
            </div>

            <div>
              <label className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Nota (0-100)
              </label>
              <input
                type="number"
                value={nota}
                onChange={(e) => setNota(Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
                disabled={yaRevisada}
                min={0}
                max={100}
                className="mt-1 w-24 rounded-md border border-input bg-background px-2 py-1.5 text-right text-sm font-bold disabled:opacity-70"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Comentario para el estudiante
              </label>
              <textarea
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                disabled={yaRevisada}
                rows={3}
                placeholder="Qué hizo bien, qué le falta, en qué debe trabajar…"
                className="mt-1 w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs disabled:opacity-70"
              />
            </div>

            {yaRevisada && entrega.revisado_en && (
              <div className="text-[10px] text-muted-foreground">
                Revisada el {new Date(entrega.revisado_en).toLocaleString("es-BO")}
              </div>
            )}
          </div>

          {error && (
            <div className="rounded-md border border-destructive/60 bg-destructive/10 p-2 text-xs text-destructive">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-border p-4">
          <button
            onClick={() => onCerrar(false)}
            className="rounded-md border border-border px-3 py-1.5 text-xs hover:bg-secondary"
          >
            {yaRevisada ? "Cerrar" : "Cancelar"}
          </button>
          {!yaRevisada && (
            <button
              onClick={guardar}
              disabled={guardando}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50",
                decision === "aprobada"
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-rose-600 hover:bg-rose-700"
              )}
            >
              {guardando && <Loader2 className="h-3 w-3 animate-spin" />}
              Confirmar {decision === "aprobada" ? "aprobación" : "reprobación"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Indicador({
  titulo,
  valor,
  positivo,
}: {
  titulo: string;
  valor: string;
  positivo: boolean;
}) {
  return (
    <div className="rounded-md border border-border bg-card p-2">
      <div className="text-[9px] uppercase tracking-wide text-muted-foreground">{titulo}</div>
      <div
        className={cn(
          "text-sm font-bold tabular-nums",
          positivo ? "text-emerald-700 dark:text-emerald-400" : "text-destructive"
        )}
      >
        {valor}
      </div>
    </div>
  );
}
