import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, Pencil, RotateCcw, Save } from "lucide-react";
import { useRevisionDocenteStore } from "@/stores/revision-docente-store";
import { useProyectoStore } from "@/stores/proyecto-store";
import { actualizarProyectoComoDocente } from "@/lib/proyecto-supabase";
import { cn } from "@/lib/utils";

/**
 * Banner fijo superior cuando el docente abre el proyecto completo de un
 * estudiante desde /docente. Permite alternar entre "Solo probar" (cambios
 * temporales en memoria) y "Editar al estudiante" (guarda en el proyecto real).
 */
export default function BannerRevisionDocente() {
  const navigate = useNavigate();
  const activa = useRevisionDocenteStore((s) => s.activa);
  const titular = useRevisionDocenteStore((s) => s.titular);
  const modoEdicion = useRevisionDocenteStore((s) => s.modoEdicion);
  const usandoSnapshot = useRevisionDocenteStore((s) => s.usandoSnapshot);
  const cambiarModo = useRevisionDocenteStore((s) => s.cambiarModo);
  const restaurarOriginal = useRevisionDocenteStore((s) => s.restaurarOriginal);
  const marcarGuardado = useRevisionDocenteStore((s) => s.marcarGuardado);
  const salirRevision = useRevisionDocenteStore((s) => s.salirRevision);

  const proyecto = useProyectoStore((s) => s.proyecto);
  const [guardando, setGuardando] = useState(false);
  const [estadoMsg, setEstadoMsg] = useState<string | null>(null);

  if (!activa) return null;

  const guardarAhora = async () => {
    if (!proyecto) return;
    setGuardando(true);
    setEstadoMsg(null);
    try {
      await actualizarProyectoComoDocente(proyecto);
      marcarGuardado(proyecto);
      setEstadoMsg("Cambios guardados en el proyecto del estudiante.");
    } catch (e: any) {
      setEstadoMsg(
        e?.message ?? "No se pudo guardar (verifica permisos de edición)."
      );
    } finally {
      setGuardando(false);
    }
  };

  const volver = () => {
    salirRevision();
    navigate("/docente");
  };

  return (
    <div
      className={cn(
        "mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border-2 px-4 py-2.5 shadow-sm",
        modoEdicion === "editar"
          ? "border-amber-400 bg-amber-50/90 dark:bg-amber-950/30"
          : "border-indigo-300 bg-indigo-50/90 dark:bg-indigo-950/30"
      )}
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
            Modo Docente
          </span>
          <span className="text-sm font-bold text-foreground truncate">
            Proyecto de: {titular}
          </span>
          {usandoSnapshot && (
            <span className="rounded bg-amber-200/80 px-1.5 py-0.5 text-[10px] font-semibold text-amber-900">
              Copia de entrega
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {modoEdicion === "probar"
            ? "Modo Solo probar: puedes cambiar datos para simular, pero no se guardará nada al estudiante."
            : "Modo Editar: los cambios que hagas se guardarán en el proyecto del estudiante."}
        </p>
        {estadoMsg && (
          <p className="mt-0.5 text-xs font-medium text-foreground">{estadoMsg}</p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Switch Solo probar / Editar */}
        <div className="inline-flex rounded-lg border border-border bg-background p-0.5 text-xs font-medium">
          <button
            type="button"
            onClick={() => {
              setEstadoMsg(null);
              cambiarModo("probar");
            }}
            className={cn(
              "flex items-center gap-1 rounded-md px-2.5 py-1 transition",
              modoEdicion === "probar"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Eye className="h-3.5 w-3.5" />
            Solo probar
          </button>
          <button
            type="button"
            onClick={() => {
              setEstadoMsg(null);
              cambiarModo("editar");
            }}
            disabled={usandoSnapshot}
            title={
              usandoSnapshot
                ? "Esta vista usa la copia de la entrega y no se puede editar en vivo"
                : "Editar y guardar cambios en el proyecto del estudiante"
            }
            className={cn(
              "flex items-center gap-1 rounded-md px-2.5 py-1 transition disabled:opacity-50",
              modoEdicion === "editar"
                ? "bg-amber-600 text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Pencil className="h-3.5 w-3.5" />
            Editar al estudiante
          </button>
        </div>

        {modoEdicion === "editar" && (
          <button
            type="button"
            onClick={guardarAhora}
            disabled={guardando}
            className="flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" />
            {guardando ? "Guardando..." : "Guardar cambios"}
          </button>
        )}

        <button
          type="button"
          onClick={() => {
            setEstadoMsg(null);
            restaurarOriginal();
          }}
          className="flex items-center gap-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground transition hover:bg-accent"
          title="Descartar cambios de prueba y volver al estado inicial"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Restaurar
        </button>

        <button
          type="button"
          onClick={volver}
          className="flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver a /docente
        </button>
      </div>
    </div>
  );
}
