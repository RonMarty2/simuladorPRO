import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { FolderOpen, GraduationCap, KeyRound, Loader2, Plus, X } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import {
  buscarCursoPorCodigo,
  inscribirseACurso,
  listarMisInscripciones,
  type Curso,
} from "@/lib/cursos-supabase";
import {
  guardarProyecto,
  listarCasosDelCurso,
  listarMisProyectos,
  tomarCasoDelCurso,
} from "@/lib/proyecto-supabase";
import { guardarProyectoActivo } from "@/components/constructor/SelectorProyecto";
import GruposEstudiante from "@/components/curso/GruposEstudiante";
import { crearProyectoVacio, type ModeloIngreso } from "@/lib/proyecto-factory";
import type { Proyecto, VersionProyecto } from "@/types/proyecto";
import { cn } from "@/lib/utils";

const ESTADO_LABEL: Record<string, { txt: string; clase: string }> = {
  construyendo: { txt: "En construcción", clase: "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200" },
  completo: { txt: "Completo", clase: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200" },
  simulando: { txt: "Simulando", clase: "bg-sky-100 text-sky-900 dark:bg-sky-900/40 dark:text-sky-200" },
  finalizado: { txt: "Finalizado", clase: "bg-secondary text-muted-foreground" },
};

// Por ahora los estudiantes NO crean proyectos libres (futuro: estudiantes de
// pago). Reciben su proyecto vía caso del curso o grupo. Cambiar a true cuando
// se habilite la creación libre para alumnos.
const PUEDE_CREAR_LIBRE = false;

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
  const [crearEnCurso, setCrearEnCurso] = useState<Curso | null>(null);
  const [casosPorCurso, setCasosPorCurso] = useState<Record<string, Proyecto[]>>({});
  const [tomandoCaso, setTomandoCaso] = useState<string | null>(null);

  const recargar = () => {
    if (!user) return;
    Promise.all([listarMisInscripciones(user.id), listarMisProyectos(user.id)])
      .then(async ([insc, proy]) => {
        setInscripciones(insc);
        setProyectos(proy);
        // Casos disponibles del docente por curso (todos en paralelo)
        const casosEntries = await Promise.all(
          insc.map(async ({ curso }) => {
            try {
              const casos = await listarCasosDelCurso(curso.id);
              return [curso.id, casos] as const;
            } catch {
              return [curso.id, []] as const;
            }
          })
        );
        setCasosPorCurso(Object.fromEntries(casosEntries));
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

  // El estudiante toma un caso publicado por el docente: se hace una copia
  // personal (entrega_estudiante) y aparece en su lista de proyectos.
  const tomarCaso = async (casoId: string) => {
    if (!user) return;
    setTomandoCaso(casoId);
    setError(null);
    try {
      const copia = await tomarCasoDelCurso(casoId, user.id);
      // Marcar el activo y abrirlo en el constructor.
      guardarProyectoActivo(user.id, copia.id);
      navigate("/construir");
    } catch (e: any) {
      setError(e?.message ?? String(e));
      setTomandoCaso(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Hola, {perfil?.nombre} 👋</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tus proyectos, organizados por curso. Haz clic en uno para seguir trabajándolo.
          </p>
        </div>
        {PUEDE_CREAR_LIBRE && (
          <button
            onClick={() => nuevo()}
            className="flex flex-shrink-0 items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Nuevo proyecto
          </button>
        )}
      </div>

      {cargando && <div className="text-sm text-muted-foreground">Cargando…</div>}

      {/* Un bloque por curso inscrito */}
      {!cargando &&
        inscripciones.map(({ curso }) => {
          // Sólo proyectos INDIVIDUALES del estudiante en este curso (excluye el
          // proyecto compartido del grupo, que tiene tipo='proyecto_grupal').
          const delCurso = proyectos.filter(
            (p) => p.curso_id === curso.id && p.tipo !== "proyecto_grupal"
          );
          // Casos publicados por el docente: la copia del estudiante (entrega) la
          // identifico por caso_origen_id; los demás casos están "disponibles".
          const casosDelDocente = casosPorCurso[curso.id] ?? [];
          const yaTomados = new Set(
            proyectos.filter((p) => p.caso_origen_id).map((p) => p.caso_origen_id!)
          );
          const casosDisponibles = casosDelDocente.filter((c) => !yaTomados.has(c.id));
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
                  {PUEDE_CREAR_LIBRE && (
                    <button
                      onClick={() => nuevo(curso.id)}
                      className="flex items-center gap-1 rounded-md border border-primary/40 bg-primary/5 px-2 py-1 text-[11px] font-medium text-primary transition hover:bg-primary/10"
                    >
                      <Plus className="h-3 w-3" />
                      Nuevo aquí
                    </button>
                  )}
                  <span className="rounded bg-secondary px-2 py-0.5 font-mono text-[10px]">{curso.codigo}</span>
                </div>
              </div>

              {/* ── Sub-tarjeta: Proyecto INDIVIDUAL (acento sky) ────────── */}
              <div className="overflow-hidden rounded-md border border-sky-200 bg-sky-50/40 dark:border-sky-900 dark:bg-sky-950/20">
                <div className="border-b border-sky-200 bg-sky-100/60 px-3 py-2 dark:border-sky-900 dark:bg-sky-900/30">
                  <div className="flex items-center gap-2 text-sm font-semibold text-sky-900 dark:text-sky-100">
                    <span className="text-base">📁</span>
                    <span>Tu proyecto individual</span>
                  </div>
                  <div className="text-[11px] text-sky-900/70 dark:text-sky-200/70">
                    Tu propio proyecto del curso — lo armas tú y lo entregas para nota.
                  </div>
                </div>
                <div className="space-y-3 p-3">
                  {/* Casos publicados por el docente, disponibles para tomar */}
                  {casosDisponibles.length > 0 && (
                    <div className="rounded-md border border-emerald-300 bg-emerald-50/60 p-2 dark:border-emerald-800 dark:bg-emerald-950/20">
                      <div className="mb-1.5 text-[11px] font-semibold text-emerald-900 dark:text-emerald-200">
                        🎓 Casos del docente disponibles para ti
                      </div>
                      <div className="space-y-1.5">
                        {casosDisponibles.map((c) => {
                          const pasoInicio = c.paso_inicio_estudiante ?? 1;
                          return (
                            <div
                              key={c.id}
                              className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-emerald-200 bg-card p-2 dark:border-emerald-900"
                            >
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-semibold">{c.nombre}</div>
                                <div className="text-[10px] text-muted-foreground">
                                  {pasoInicio === 1
                                    ? "Lo armas desde cero (el docente solo dio el contexto)."
                                    : pasoInicio === 9
                                      ? "Lo recibes COMPLETO (sirve de ejemplo / para simular)."
                                      : `Recibes los pasos 1 a ${pasoInicio - 1} ya armados; completas del ${pasoInicio} en adelante.`}
                                </div>
                              </div>
                              <button
                                onClick={() => tomarCaso(c.id)}
                                disabled={tomandoCaso === c.id}
                                className="flex items-center gap-1 rounded-md bg-emerald-600 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                              >
                                {tomandoCaso === c.id ? "Tomando…" : "Tomar este caso"}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {delCurso.length === 0 ? (
                    casosDisponibles.length === 0 && (
                      <div className="rounded-md border border-dashed border-border bg-card p-3 text-center text-xs text-muted-foreground">
                        Aún no tienes un proyecto individual en este curso.
                        {curso.permite_proyecto_libre !== false && (
                          <div className="mt-2 flex justify-center">
                            <button
                              onClick={() => setCrearEnCurso(curso)}
                              className="flex items-center gap-1 rounded-md bg-primary px-2.5 py-1 text-[11px] font-medium text-primary-foreground hover:bg-primary/90"
                            >
                              <Plus className="h-3 w-3" />
                              Crear mi proyecto
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  ) : (
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {delCurso.map((p) => (
                        <TarjetaProyecto key={p.id} proyecto={p} onClick={() => abrir(p)} />
                      ))}
                    </div>
                  )}

                  {/* Botón secundario: crear mi propio proyecto, si el docente lo permite y ya hay actividad */}
                  {curso.permite_proyecto_libre !== false && (delCurso.length > 0 || casosDisponibles.length > 0) && (
                    <button
                      onClick={() => setCrearEnCurso(curso)}
                      className="flex items-center gap-1 rounded-md border border-primary/40 bg-primary/5 px-2.5 py-1 text-[11px] font-medium text-primary hover:bg-primary/10"
                    >
                      <Plus className="h-3 w-3" />
                      Crear mi propio proyecto (además)
                    </button>
                  )}
                </div>
              </div>

              {/* ── Sub-tarjeta: Proyecto GRUPAL (acento violet) ─────────── */}
              <div className="mt-3 overflow-hidden rounded-md border border-violet-200 bg-violet-50/40 dark:border-violet-900 dark:bg-violet-950/20">
                <div className="border-b border-violet-200 bg-violet-100/60 px-3 py-2 dark:border-violet-900 dark:bg-violet-900/30">
                  <div className="flex items-center gap-2 text-sm font-semibold text-violet-900 dark:text-violet-100">
                    <span className="text-base">🤝</span>
                    <span>Proyecto grupal</span>
                  </div>
                  <div className="text-[11px] text-violet-900/70 dark:text-violet-200/70">
                    Trabajen en equipo sobre un mismo proyecto.
                  </div>
                </div>
                <div className="p-3">
                  {user && <GruposEstudiante curso={curso} estudianteId={user.id} />}
                </div>
              </div>
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
          Todavía no estás en ningún curso. Inscríbete con el{" "}
          <strong>código de 6 letras</strong> que te da tu docente para empezar a trabajar.
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

      {crearEnCurso && user && (
        <ModalCrearMiProyecto
          curso={crearEnCurso}
          userId={user.id}
          onCerrar={() => setCrearEnCurso(null)}
        />
      )}
    </div>
  );
}

// Modal: el estudiante crea SU PROPIO proyecto individual dentro de un curso
// (eligiendo V1/V2 y modelo de ingreso). Solo aparece si el curso lo permite.
function ModalCrearMiProyecto({
  curso,
  userId,
  onCerrar,
}: {
  curso: Curso;
  userId: string;
  onCerrar: () => void;
}) {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState("");
  const [version, setVersion] = useState<VersionProyecto>("v2");
  const [modelo, setModelo] = useState<ModeloIngreso>("unidades");
  const [creando, setCreando] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const modelos: { v: ModeloIngreso; t: string; d: string }[] = [
    { v: "unidades", t: "Unidades × precio", d: "Vendés productos o servicios por unidad." },
    { v: "suscripcion", t: "Suscripción", d: "Clientes recurrentes (altas y churn)." },
    { v: "publicidad", t: "Publicidad", d: "Ingreso por audiencia × CPM." },
    { v: "costo_beneficio", t: "Costo-beneficio", d: "No vende; se evalúa por el beneficio." },
  ];

  const crear = async () => {
    if (!nombre.trim()) return;
    setCreando(true);
    setErr(null);
    try {
      const p = crearProyectoVacio({
        estudiante_id: userId,
        nombre: nombre.trim(),
        curso_id: curso.id,
        version,
        modeloIngreso: modelo,
      });
      await guardarProyecto(p);
      guardarProyectoActivo(userId, p.id);
      navigate("/construir");
    } catch (e: any) {
      setErr(e?.message ?? String(e));
      setCreando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:items-center">
      <div className="my-auto w-full max-w-md max-h-[90vh] overflow-y-auto rounded-lg bg-card p-5 shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold">Crear mi proyecto · {curso.nombre}</h2>
          <button onClick={onCerrar} disabled={creando} className="rounded-md p-1 hover:bg-secondary disabled:opacity-50">
            <X className="h-4 w-4" />
          </button>
        </div>

        <label className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Nombre del proyecto
        </label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej: Cafetería, Tienda de mascotas…"
          autoFocus
          className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />

        <div className="mt-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Tipo de análisis
        </div>
        <div className="mt-1 grid grid-cols-2 gap-2">
          {(["v2", "v1"] as VersionProyecto[]).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVersion(v)}
              className={cn(
                "rounded-md border p-2 text-left text-xs",
                version === v ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border"
              )}
            >
              <div className="font-semibold">{v === "v2" ? "Con análisis de riesgo" : "Clásico"}</div>
              <div className="text-[10px] text-muted-foreground">
                {v === "v2" ? "VAN/TIR + equilibrio, sensibilidad, etc." : "VAN, TIR, payback, etc."}
              </div>
            </button>
          ))}
        </div>

        <div className="mt-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          ¿Cómo entra la plata?
        </div>
        <div className="mt-1 grid grid-cols-2 gap-2">
          {modelos.map((m) => (
            <button
              key={m.v}
              type="button"
              onClick={() => setModelo(m.v)}
              className={cn(
                "rounded-md border p-2 text-left text-xs",
                modelo === m.v ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border"
              )}
            >
              <div className="font-semibold">{m.t}</div>
              <div className="text-[10px] leading-snug text-muted-foreground">{m.d}</div>
            </button>
          ))}
        </div>

        {err && <div className="mt-2 text-xs text-destructive">{err}</div>}

        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onCerrar} disabled={creando} className="rounded-md border border-border px-3 py-1.5 text-xs hover:bg-secondary disabled:opacity-50">
            Cancelar
          </button>
          <button
            onClick={crear}
            disabled={creando || !nombre.trim()}
            className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {creando && <Loader2 className="h-3 w-3 animate-spin" />}
            Crear y empezar
          </button>
        </div>
      </div>
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
          {esV2 ? "+ Riesgo" : "Clásico"}
        </span>
        <span className="rounded bg-secondary px-1.5 py-0.5 text-[9px] text-muted-foreground">{modelo}</span>
        <span className={cn("rounded px-1.5 py-0.5 text-[9px] font-medium", estado.clase)}>{estado.txt}</span>
      </div>
      <div className="text-[10px] text-primary">Abrir →</div>
    </button>
  );
}
