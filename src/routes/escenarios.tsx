import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChartScatter, ArrowLeft } from "lucide-react";
import { useProyectoStore } from "@/stores/proyecto-store";
import { useAuthStore } from "@/stores/auth-store";
import { listarMisProyectos, listarProyectosGrupales } from "@/lib/proyecto-supabase";
import type { Proyecto } from "@/types/proyecto";
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
  const cargarProyecto = useProyectoStore((s) => s.cargar);
  const user = useAuthStore((s) => s.user);
  const [configCurso, setConfigCurso] = useState<EscenariosConfig | null>(null);
  const [disponibles, setDisponibles] = useState<Proyecto[] | null>(null);

  // Sin proyecto activo, ofrecemos elegir uno en vez de mandar al panel.
  useEffect(() => {
    if (proyecto || !user) return;
    Promise.all([
      listarMisProyectos(user.id),
      listarProyectosGrupales(user.id).catch(() => [] as Proyecto[]),
    ])
      .then(([mios, grupales]) => {
        const ids = new Set(mios.map((p) => p.id));
        const todos = [...mios, ...grupales.filter((g) => !ids.has(g.id))];
        setDisponibles(todos.filter((p) => !p.esSemanaE));
      })
      .catch(() => setDisponibles([]));
  }, [proyecto, user]);

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
            Elegí un proyecto para comparar sus escenarios optimista, base y pesimista.
          </p>
          {disponibles === null && (
            <p className="mt-3 text-xs text-muted-foreground">Cargando tus proyectos…</p>
          )}
          {disponibles && disponibles.length > 0 && (
            <div className="mt-4 flex flex-col gap-2">
              {disponibles.map((p) => (
                <button
                  key={p.id}
                  onClick={() => cargarProyecto(p)}
                  className="rounded-md border border-border bg-background px-3 py-2 text-left text-sm font-medium hover:border-primary/60 hover:bg-secondary"
                >
                  {p.nombre}
                </button>
              ))}
            </div>
          )}
          {disponibles && disponibles.length === 0 && (
            <p className="mt-3 text-xs text-muted-foreground">
              Todavía no tenés proyectos. Creá uno desde tu panel.
            </p>
          )}
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
