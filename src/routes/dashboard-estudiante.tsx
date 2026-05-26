import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { FolderOpen, GraduationCap, KeyRound, Plus } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import {
  buscarCursoPorCodigo,
  inscribirseACurso,
  listarMisInscripciones,
  type Curso,
} from "@/lib/cursos-supabase";
import { listarMisProyectos } from "@/lib/proyecto-supabase";
import { guardarProyectoActivo } from "@/components/constructor/SelectorProyecto";
import type { Proyecto } from "@/types/proyecto";
import { cn } from "@/lib/utils";

const ESTADO_LABEL: Record<string, { txt: string; clase: string }> = {
  construyendo: { txt: "En construcción", clase: "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200" },
  completo: { txt: "Completo", clase: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200" },
  simulando: { txt: "Simulando", clase: "bg-sky-100 text-sky-900 dark:bg-sky-900/40 dark:text-sky-200" },
  finalizado: { txt: "Finalizado", clase: "bg-secondary text-muted-foreground" },
};

const MODELO_LABEL: Record<string, string> = {
  unidades: "Unidades",
  suscripcion: "Suscripción",
  publicidad: "Publicidad",
  costo_beneficio: "Costo-beneficio",
};

export default function DashboardEstudiante() {
  const perfil = useAuthStore((s) => s.perfil);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [inscripciones, setInscripciones] = useState<Array<{ curso: Curso; inscrito_en: string }>>([]);
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [codigoInscripcion, setCodigoInscripcion] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [inscribiendo, setInscribiendo] = useState(false);

  const recargar = () => {
    if (!user) return;
    Promise.all([listarMisInscripciones(user.id), listarMisProyectos(user.id)])
      .then(([insc, proy]) => {
        setInscripciones(insc);
        setProyectos(proy);
      })
      .catch(() => {})
      .finally(() => setCargando(false));
  };

  useEffect(() => {
    recargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (perfil && perfil.rol !== "estudiante") return <Navigate to="/docente" replace />;

  const abrir = (p: Proyecto) => {
    if (!user) return;
    guardarProyectoActivo(user.id, p.id);
    navigate("/construir");
  };

  // Crear un proyecto nuevo: deja una "pista" (curso preseleccionado, o "" para
  // libre) y va al constructor, que abrirá la ventana de crear automáticamente.
  const nuevo = (cursoId?: string) => {
    try {
      localStorage.setItem("simulador.nuevoProyecto", cursoId ?? "");
    } catch {}
    navigate("/construir");
  };

  const inscribirse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError(null);
    setInscribiendo(true);
    try {
      const curso = await buscarCursoPorCodigo(codigoInscripcion.trim());
      if (!curso) {
        setError("Código no válido o curso no activo.");
        return;
      }
      if (inscripciones.some((i) => i.curso.id === curso.id)) {
        setError("Ya estás inscrito en este curso.");
        return;
      }
      await inscribirseACurso({ curso_id: curso.id, estudiante_id: user.id });
      recargar();
      setCodigoInscripcion("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al inscribirte");
    } finally {
      setInscribiendo(false);
    }
  };

  const idsCursos = new Set(inscripciones.map((i) => i.curso.id));
  const libres = proyectos.filter((p) => !p.curso_id || !idsCursos.has(p.curso_id));

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Hola, {perfil?.nombre} 👋</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tus proyectos, organizados por curso. Haz clic en uno para seguir trabajándolo.
          </p>
        </div>
        <button
          onClick={() => nuevo()}
          className="flex flex-shrink-0 items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Nuevo proyecto
        </button>
      </div>

      {cargando && <div className="text-sm text-muted-foreground">Cargando…</div>}

      {/* Un bloque por curso inscrito */}
      {!cargando &&
        inscripciones.map(({ curso }) => {
          const delCurso = proyectos.filter((p) => p.curso_id === curso.id);
          return (
            <section key={curso.id} className="rounded-lg border border-border bg-card p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm font-semibold">{curso.nombre}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {curso.materia}
                      {curso.paralelo && ` · Paralelo ${curso.paralelo}`}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => nuevo(curso.id)}
                    className="flex items-center gap-1 rounded-md border border-primary/40 bg-primary/5 px-2 py-1 text-[11px] font-medium text-primary transition hover:bg-primary/10"
                  >
                    <Plus className="h-3 w-3" />
                    Nuevo aquí
                  </button>
                  <span className="rounded bg-secondary px-2 py-0.5 font-mono text-[10px]">{curso.codigo}</span>
                </div>
              </div>

              {delCurso.length === 0 ? (
                <div className="rounded-md border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
                  Aún no tienes proyectos en este curso.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {delCurso.map((p) => (
                    <TarjetaProyecto key={p.id} proyecto={p} onClick={() => abrir(p)} />
                  ))}
                </div>
              )}
            </section>
          );
        })}

      {/* Proyectos sin curso (libres) */}
      {!cargando && libres.length > 0 && (
        <section className="rounded-lg border border-border bg-card p-4">
          <div className="mb-3 flex items-center gap-2">
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
            <div className="text-sm font-semibold">Sin curso (proyectos libres)</div>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {libres.map((p) => (
              <TarjetaProyecto key={p.id} proyecto={p} onClick={() => abrir(p)} />
            ))}
          </div>
        </section>
      )}

      {!cargando && proyectos.length === 0 && inscripciones.length === 0 && (
        <div className="rounded-lg border border-dashed border-border bg-card/50 p-6 text-center text-sm text-muted-foreground">
          Aún no tienes proyectos ni cursos. Crea tu primer proyecto con "Nuevo proyecto" o
          inscríbete a un curso con el código de tu docente.
        </div>
      )}

      {/* Inscribirse a un curso */}
      <form onSubmit={inscribirse} className="space-y-3 rounded-lg border border-border bg-card p-4">
        <div className="flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Inscribirme a un curso</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Pídele a tu docente el <strong>código de 6 letras</strong> de su curso.
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={codigoInscripcion}
            onChange={(e) => setCodigoInscripcion(e.target.value.toUpperCase())}
            placeholder="ABCDEF"
            maxLength={6}
            className="flex-1 rounded-md border border-input bg-background px-3 py-2 font-mono text-sm tracking-widest focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="submit"
            disabled={inscribiendo || codigoInscripcion.length !== 6}
            className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
          >
            {inscribiendo ? "..." : "Inscribirme"}
          </button>
        </div>
        {error && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </div>
        )}
      </form>
    </div>
  );
}

function TarjetaProyecto({ proyecto, onClick }: { proyecto: Proyecto; onClick: () => void }) {
  const estado = ESTADO_LABEL[proyecto.estado] ?? ESTADO_LABEL.construyendo;
  const esV2 = proyecto.version === "v2";
  const modelo = MODELO_LABEL[proyecto.modeloIngreso ?? "unidades"];
  return (
    <button
      onClick={onClick}
      className="flex flex-col gap-2 rounded-md border border-border bg-background p-3 text-left transition hover:border-primary hover:shadow-sm"
    >
      <div className="truncate text-sm font-semibold">{proyecto.nombre}</div>
      <div className="flex flex-wrap items-center gap-1">
        <span className={cn("rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider", esV2 ? "bg-indigo-600 text-white" : "bg-secondary text-muted-foreground")}>
          {esV2 ? "V2" : "V1"}
        </span>
        <span className="rounded bg-secondary px-1.5 py-0.5 text-[9px] text-muted-foreground">{modelo}</span>
        <span className={cn("rounded px-1.5 py-0.5 text-[9px] font-medium", estado.clase)}>{estado.txt}</span>
      </div>
      <div className="text-[10px] text-primary">Abrir →</div>
    </button>
  );
}
