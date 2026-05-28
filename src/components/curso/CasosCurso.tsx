import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FolderOpen, Loader2, Plus, Trash2 } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { guardarProyectoActivo } from "@/components/constructor/SelectorProyecto";
import { eliminarProyecto, listarCasosDelCurso } from "@/lib/proyecto-supabase";
import type { Proyecto } from "@/types/proyecto";

const fmtFecha = (s?: string | null) =>
  s ? new Date(s).toLocaleString("es-BO", { dateStyle: "short", timeStyle: "short" }) : "—";

export default function CasosCurso({ cursoId }: { cursoId: string }) {
  const user = useAuthStore((s) => s.user)!;
  const navigate = useNavigate();
  const [casos, setCasos] = useState<Proyecto[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [borrandoId, setBorrandoId] = useState<string | null>(null);

  const recargar = () =>
    listarCasosDelCurso(cursoId).then(setCasos).catch((e) => setError(e?.message ?? String(e)));

  useEffect(() => {
    recargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursoId]);

  const abrir = (p: Proyecto) => {
    guardarProyectoActivo(user.id, p.id);
    navigate("/construir");
  };

  const borrar = async (p: Proyecto) => {
    if (!confirm(`¿Borrar definitivamente el caso "${p.nombre}"? Los estudiantes que ya lo tomaron mantienen su copia, pero nadie nuevo podrá tomarlo.`)) return;
    setBorrandoId(p.id);
    setError(null);
    try {
      await eliminarProyecto(p.id);
      await recargar();
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setBorrandoId(null);
    }
  };

  // "+ Crear caso ahora": dispara el flujo del modal "Nuevo proyecto" con el curso
  // preseleccionado. Después, en el constructor, el docente arma el proyecto y usa
  // el botón "Guardar como caso del curso" del costado para publicarlo.
  const crearAhora = () => {
    try {
      localStorage.setItem("simulador.nuevoProyecto", cursoId);
    } catch {}
    navigate("/construir");
  };

  if (casos === null) return <div className="text-xs text-muted-foreground">Cargando casos…</div>;

  return (
    <div className="space-y-3">
      <div className="rounded-md border border-border bg-secondary/20 p-3 text-[11px] text-muted-foreground">
        <strong className="text-foreground">¿Qué es un caso del curso?</strong> Un proyecto que
        vos armás y publicás como <em>plantilla</em>: todos los estudiantes inscritos pueden
        tomarlo (se hace una copia para cada uno) y trabajar sobre tu base. Es distinto del
        proyecto grupal (que arman los estudiantes) y del proyecto individual libre (que cada
        alumno crea si lo habilitás).
        <br />
        <span className="mt-1 block">
          <strong className="text-foreground">Cómo publicar un caso:</strong> tocá{" "}
          <em>"+ Crear caso ahora"</em>, llenalo (todo o solo los primeros pasos), y al final
          desde el constructor usá el botón <strong>"Guardar como caso del curso"</strong>.
        </span>
      </div>

      <button
        onClick={crearAhora}
        className="flex w-full items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90"
      >
        <Plus className="h-3.5 w-3.5" />
        Crear caso ahora
      </button>

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {error}
        </div>
      )}

      {casos.length === 0 ? (
        <div className="rounded-md border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
          Aún no publicaste ningún caso para este curso.
        </div>
      ) : (
        <div className="space-y-2">
          {casos.map((p) => (
            <div
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-card p-3"
            >
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold">{p.nombre}</div>
                <div className="text-[11px] text-muted-foreground">
                  El estudiante completa desde el paso{" "}
                  <strong>{p.paso_inicio_estudiante ?? 1}</strong>
                  {" · "}última edición: {fmtFecha(p.actualizado_en)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => abrir(p)}
                  className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] hover:bg-secondary"
                >
                  <FolderOpen className="h-3 w-3" />
                  Abrir / editar
                </button>
                <button
                  onClick={() => borrar(p)}
                  disabled={borrandoId === p.id}
                  className="flex items-center gap-1 rounded-md border border-destructive/40 bg-destructive/5 px-2 py-1 text-[11px] text-destructive hover:bg-destructive/10 disabled:opacity-50"
                >
                  {borrandoId === p.id ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Trash2 className="h-3 w-3" />
                  )}
                  Borrar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
