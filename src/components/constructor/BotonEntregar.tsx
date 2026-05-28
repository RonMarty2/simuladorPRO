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
  /** Paso (1..9) que se está entregando. Si se omite, es una entrega del
   *  proyecto entero (legacy). */
  paso?: number;
}

/**
 * Botón "Entregar etapa N para revisión" — visible si:
 * - El usuario es estudiante
 * - El proyecto es entrega_estudiante (caso del curso), proyecto_grupal o libre
 *   (los proyectos del docente caso_curso NO se entregan).
 * El proyecto debe estar asociado a un curso para entregarse.
 */
export default function BotonEntregar({ indicadores, paso }: Props) {
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
      .then((todas) =>
        setEntregas(
          todas.filter(
            (e) =>
              e.proyecto_id === proyecto.id &&
              (paso == null
                ? e.paso_entregado == null
                : e.paso_entregado === paso)
          )
        )
      )
      .catch(() => {})
      .finally(() => setCargando(false));
  }, [proyecto?.id, perfil?.id, paso]);

  if (!proyecto || !perfil) return null;
  if (perfil.rol !== "estudiante") return null;
  // Tipos del proyecto que el alumno puede entregar (los caso_curso son
  // plantillas del docente y no se entregan).
  const tiposEntregables = ["entrega_estudiante", "proyecto_grupal", "libre"];
  if (!tiposEntregables.includes(proyecto.tipo ?? "libre")) return null;
  // Sin curso asignado no se puede entregar (la función backend lo valida).
  if (!proyecto.curso_id) return null;

  const entregar = async () => {
    if (!proyecto) return;
    setEntregando(true);
    setMensaje(null);
    try {
      // Cargar el caso de referencia solo si la entrega proviene de un caso
      // del curso. Los proyectos libres y los grupales no tienen referencia.
      if (proyecto.caso_origen_id) {
        await supabase
          .from("proyectos")
          .select("datos")
          .eq("id", proyecto.caso_origen_id)
          .single();
      }
      // Por ahora la sugerencia automática solo aplica reglas duras (VAN>0,
      // TIR>WACC). En el futuro acá podríamos comparar contra el caso del
      // docente cuando haya referencia.
      const referencia = null;

      const entrega = await entregarProyecto(proyecto, indicadores, referencia, paso ?? null);
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
          <h3 className="text-sm font-semibold">
            {paso ? `📤 Entregar etapa ${paso} para revisión` : "📤 Entregar para revisión del docente"}
          </h3>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Tu proyecto se guarda como una "foto" y queda esperando que el docente lo revise.
            Si te lo reprueban, puedes corregir y reentregar las veces que quieras.
            {paso ? " La nota de esta etapa se sumará a tu nota final del proyecto." : null}
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
            ? paso ? `Re-entregar etapa ${paso}` : "Re-entregar"
            : paso ? `Entregar etapa ${paso}` : "Entregar"}
        </button>
      </div>
    </div>
  );
}
