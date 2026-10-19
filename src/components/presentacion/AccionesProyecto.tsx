import { useState } from "react";
import { BarChart3, ChartScatter, Download, Loader2, PlayCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Proyecto } from "@/types/proyecto";
import { useProyectoStore } from "@/stores/proyecto-store";
import { cn } from "@/lib/utils";

export default function AccionesProyecto({
  proyecto,
  compacto = false,
  className,
}: {
  proyecto: Proyecto;
  compacto?: boolean;
  className?: string;
}) {
  const navigate = useNavigate();
  const [exportando, setExportando] = useState(false);
  const cargarProyecto = useProyectoStore((s) => s.cargar);

  // Escenarios y Simular trabajan sobre el proyecto activo del store: lo
  // cargamos antes de navegar para que nunca aparezca "no hay proyecto".
  const irA = (ruta: "/escenarios" | "/simular") => {
    cargarProyecto(proyecto);
    navigate(ruta);
  };

  const abrirPitch = () => {
    const query = proyecto.esSemanaE ? "?semanae=1" : "";
    navigate(`/presentar/${encodeURIComponent(proyecto.id)}${query}`);
  };

  const exportar = async () => {
    setExportando(true);
    try {
      const { exportarProyectoExcel } = await import("@/lib/exportar-excel");
      exportarProyectoExcel(proyecto);
    } finally {
      setExportando(false);
    }
  };

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <button
        type="button"
        onClick={abrirPitch}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-700 to-fuchsia-600 font-bold text-white shadow-md shadow-violet-500/20 transition hover:-translate-y-0.5 hover:shadow-lg",
          compacto ? "px-2.5 py-1.5 text-[11px]" : "px-4 py-2.5 text-sm"
        )}
      >
        <BarChart3 className={compacto ? "h-3.5 w-3.5" : "h-4 w-4"} />
        Presentar proyecto
      </button>
      {!proyecto.esSemanaE && (
        <>
          <button
            type="button"
            onClick={() => irA("/escenarios")}
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-lg border border-sky-300 bg-sky-50 font-semibold text-sky-800 transition hover:bg-sky-100 dark:border-sky-800 dark:bg-sky-950/40 dark:text-sky-200",
              compacto ? "px-2.5 py-1.5 text-[11px]" : "px-4 py-2.5 text-sm"
            )}
          >
            <ChartScatter className={compacto ? "h-3.5 w-3.5" : "h-4 w-4"} />
            Escenarios
          </button>
          <button
            type="button"
            onClick={() => irA("/simular")}
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-lg border border-amber-300 bg-amber-50 font-semibold text-amber-800 transition hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200",
              compacto ? "px-2.5 py-1.5 text-[11px]" : "px-4 py-2.5 text-sm"
            )}
          >
            <PlayCircle className={compacto ? "h-3.5 w-3.5" : "h-4 w-4"} />
            Simular 5 años
          </button>
        </>
      )}
      <button
        type="button"
        onClick={exportar}
        disabled={exportando}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-300 bg-emerald-50 font-semibold text-emerald-800 transition hover:bg-emerald-100 disabled:opacity-60 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200",
          compacto ? "px-2.5 py-1.5 text-[11px]" : "px-4 py-2.5 text-sm"
        )}
      >
        {exportando ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Download className="h-3.5 w-3.5" />
        )}
        {exportando ? "Generando…" : "Descargar Excel"}
      </button>
    </div>
  );
}
