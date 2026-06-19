import { useState } from "react";
import { BarChart3, Download, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Proyecto } from "@/types/proyecto";
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
