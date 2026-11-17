import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ExternalLink, Loader2 } from "lucide-react";
import { cargarProyectoEstudianteParaRevision } from "@/lib/proyecto-supabase";
import { useRevisionDocenteStore } from "@/stores/revision-docente-store";
import type { Proyecto } from "@/types/proyecto";
import { cn } from "@/lib/utils";

/**
 * Botón reutilizable para que el docente abra el proyecto completo de un
 * estudiante dentro de /construir (en Modo Revisión Docente).
 */
export default function BotonAbrirProyectoEstudiante({
  proyectoId,
  titular,
  fallbackSnapshot,
  label = "Abrir proyecto completo",
  className,
}: {
  proyectoId: string;
  titular: string;
  fallbackSnapshot?: Proyecto;
  label?: string;
  className?: string;
}) {
  const navigate = useNavigate();
  const [cargando, setCargando] = useState(false);

  const abrir = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setCargando(true);
    try {
      const { proyecto, usandoSnapshot } = await cargarProyectoEstudianteParaRevision(
        proyectoId,
        fallbackSnapshot
      );
      useRevisionDocenteStore.getState().iniciarRevision({
        proyecto,
        titular,
        usandoSnapshot,
      });
      navigate("/construir");
    } catch {
      // Si falló incluso con fallback, no navegamos.
    } finally {
      setCargando(false);
    }
  };

  return (
    <button
      type="button"
      onClick={abrir}
      disabled={cargando}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-indigo-300 bg-indigo-50 px-2.5 py-1.5 text-xs font-semibold text-indigo-800 transition hover:bg-indigo-100 disabled:opacity-50 dark:border-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-200 dark:hover:bg-indigo-900/50",
        className
      )}
      title="Abre el proyecto completo en Construir proyecto para verlo o probar cambios"
    >
      {cargando ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <ExternalLink className="h-3.5 w-3.5" />
      )}
      {label}
    </button>
  );
}
