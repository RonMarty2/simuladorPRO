import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChartScatter, ArrowLeft } from "lucide-react";
import { useProyectoStore } from "@/stores/proyecto-store";
import PanelEscenarios from "@/components/escenarios/PanelEscenarios";
import { obtenerCursoPorId } from "@/lib/cursos-supabase";
import type { EscenariosConfig } from "@/lib/escenarios";

/**
 * Ruta /escenarios — Modo demostrativo de análisis de sensibilidad.
 *
 * Carga el proyecto activo del store y la config de escenarios del curso (si
 * existe y el docente la editó). Delega todo al PanelEscenarios.
 */
export default function Escenarios() {
  const proyecto = useProyectoStore((s) => s.proyecto);
  const [configCurso, setConfigCurso] = useState<EscenariosConfig | null>(null);

  // useMemo aquí: el proyecto puede tener docenas de campos; evitamos que el
  // panel recompute todos los escenarios mientras el alumno arrastra sliders
  // si nada del proyecto base cambió.
  const proyectoBase = useMemo(() => proyecto, [proyecto?.id, proyecto?.actualizado_en]);

  // Carga la config del curso del proyecto (si lo hay). Best-effort: si falla
  // o el alumno no tiene permiso, caemos a los defaults del código.
  useEffect(() => {
    if (!proyectoBase?.curso_id) {
      setConfigCurso(null);
      return;
    }
    obtenerCursoPorId(proyectoBase.curso_id)
      .then((c) => setConfigCurso(c?.escenarios_config ?? null))
      .catch(() => setConfigCurso(null));
  }, [proyectoBase?.curso_id]);

  if (!proyectoBase) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <div className="rounded-lg border border-dashed border-border bg-card p-6 text-center">
          <ChartScatter className="mx-auto h-10 w-10 text-muted-foreground" />
          <h2 className="mt-3 text-base font-semibold">No hay proyecto activo</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Para usar el modo Escenarios necesitás un proyecto cargado.
            Andá a tu panel, elegí uno y volvé.
          </p>
          <Link
            to="/estudiante"
            className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <ArrowLeft className="h-4 w-4" />
            Ir a mi panel
          </Link>
        </div>
      </div>
    );
  }

  return <PanelEscenarios proyecto={proyectoBase} configCurso={configCurso} />;
}
