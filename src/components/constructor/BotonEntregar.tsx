import { useEffect, useState } from "react";
import { Loader2, Send } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useProyectoStore } from "@/stores/proyecto-store";
import {
  entregarProyecto,
  listarMisEntregas,
  type IndicadoresEntrega,
} from "@/lib/proyecto-supabase";
import { supabase } from "@/lib/supabase";
import type { Entrega } from "@/types/proyecto";

interface Props {
  indicadores: IndicadoresEntrega;
}

/**
 * Botón "Entregar para revisión" — solo visible si:
 * - El proyecto es tipo='entrega_estudiante' (tomó un caso del curso)
 * - El usuario es estudiante
 */
export default function BotonEntregar({ indicadores }: Props) {
  const perfil = useAuthStore((s) => s.perfil);
  const proyecto = useProyectoStore((s) => s.proyecto);

  const [entregas, setEntregas] = useState<Entrega[]>([]);
  const [cargando, setCargando] = useState(true);
  const [entregando, setEntregando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: "ok" | "err"; texto: string } | null>(null);

  useEffect(() => {
    if (!proyecto || !perfil) {
      setCargando(false);
      return;
    }
    listarMisEntregas(perfil.id)
      .then((todas) => setEntregas(todas.filter((e) => e.proyecto_id === proyecto.id)))
      .catch(() => {})
      .finally(() => setCargando(false));
  }, [proyecto?.id, perfil?.id]);

  if (!proyecto || !perfil) return null;
  if (perfil.rol !== "estudiante") return null;
  if (proyecto.tipo !== "entrega_estudiante") return null;

  const entregar = async () => {
    if (!proyecto || !proyecto.caso_origen_id) return;
    setEntregando(true);
    setMensaje(null);
    try {
      // Cargar indicadores del caso de referencia (del docente)
      const { data: casoFila } = await supabase
        .from("proyectos")
        .select("datos")
        .eq("id", proyecto.caso_origen_id)
        .single();

      // Para sacar indicadores del caso de referencia tendríamos que
      // ejecutar el mismo motor de cálculo. Por ahora le pasamos null
      // y la sugerencia automática solo aplica reglas duras (VAN>0, TIR>WACC).
      // TODO en futuro: cachear los indicadores del caso al guardarlo.
      const referencia = null;
      void casoFila;

      const entrega = await entregarProyecto(proyecto, indicadores, referencia);
      const nuevaLista = [entrega, ...entregas];
      setEntregas(nuevaLista);
      setMensaje({
        tipo: "ok",
        texto: `Entrega #${entrega.numero_intento} registrada. Sugerencia del sistema: ${entrega.sugerencia_automatica}. El docente revisará tu trabajo.`,
      });
    } catch (e: any) {
      setMensaje({ tipo: "err", texto: e?.message ?? String(e) });
    } finally {
      setEntregando(false);
    }
  };

  const yaEntregadas = entregas.length;
  const pendientes = entregas.filter((e) => e.estado === "pendiente").length;
  const aprobadas = entregas.filter((e) => e.estado === "aprobada").length;
  const reprobadas = entregas.filter((e) => e.estado === "reprobada").length;

  return (
    <div className="rounded-lg border-2 border-primary/40 bg-primary/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold">📤 Entregar para revisión del docente</h3>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Tu proyecto se guarda como una "foto" y queda esperando que el docente lo revise.
            Si te lo reprueban, podés corregir y reentregar las veces que quieras.
          </p>

          {cargando ? (
            <div className="mt-2 flex items-center gap-2 text-[11px] text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Cargando tus entregas previas…
            </div>
          ) : yaEntregadas > 0 ? (
            <div className="mt-2 flex flex-wrap gap-1.5 text-[10px]">
              <span className="rounded-full bg-secondary px-2 py-0.5">
                Total: <strong>{yaEntregadas}</strong>
              </span>
              {pendientes > 0 && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
                  Pendientes: <strong>{pendientes}</strong>
                </span>
              )}
              {aprobadas > 0 && (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100">
                  Aprobadas: <strong>{aprobadas}</strong>
                </span>
              )}
              {reprobadas > 0 && (
                <span className="rounded-full bg-rose-100 px-2 py-0.5 text-rose-900 dark:bg-rose-950/40 dark:text-rose-100">
                  Reprobadas: <strong>{reprobadas}</strong>
                </span>
              )}
            </div>
          ) : null}

          {mensaje && (
            <div
              className={
                mensaje.tipo === "ok"
                  ? "mt-2 rounded-md border border-emerald-400/60 bg-emerald-50 px-2 py-1.5 text-[11px] text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100"
                  : "mt-2 rounded-md border border-destructive/60 bg-destructive/10 px-2 py-1.5 text-[11px] text-destructive"
              }
            >
              {mensaje.texto}
            </div>
          )}
        </div>

        <button
          onClick={entregar}
          disabled={entregando || pendientes > 0}
          title={
            pendientes > 0
              ? "Tienes una entrega pendiente de revisión. Espera la nota antes de re-entregar."
              : ""
          }
          className="flex flex-shrink-0 items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {entregando ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Send className="h-3.5 w-3.5" />
          )}
          {pendientes > 0
            ? "Esperando revisión…"
            : yaEntregadas > 0
            ? "Re-entregar"
            : "Entregar"}
        </button>
      </div>
    </div>
  );
}
