import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  BarChart3,
  Check,
  Download,
  Edit3,
  Loader2,
  Play,
  Save,
  Sparkles,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { guardarProyecto, obtenerProyectoPorId } from "@/lib/proyecto-supabase";
import {
  construirModeloPitch,
  crearPresentacionPredeterminada,
  obtenerPresentacionProyecto,
} from "@/lib/presentacion-proyecto";
import { crearProyectoEjemploCafeteriaV2 } from "@/lib/proyecto-factory";
import type { PresentacionProyecto, Proyecto } from "@/types/proyecto";
import VisorPitch from "@/components/presentacion/VisorPitch";

export default function PresentarProyecto() {
  const { proyectoId = "" } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((estado) => estado.user);
  const esDemo =
    import.meta.env.DEV &&
    (proyectoId === "demo" || location.pathname === "/presentar/demo");
  const proyectoDemo = useMemo(
    () =>
      esDemo
        ? crearProyectoEjemploCafeteriaV2({ estudiante_id: user?.id ?? "demo" })
        : null,
    [esDemo, user?.id]
  );
  const [proyecto, setProyecto] = useState<Proyecto | null>(proyectoDemo);
  const [presentacion, setPresentacion] = useState<PresentacionProyecto | null>(
    proyectoDemo ? obtenerPresentacionProyecto(proyectoDemo) : null
  );
  const [cargando, setCargando] = useState(!proyectoDemo);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [exportando, setExportando] = useState(false);
  const [searchParams] = useSearchParams();
  const [presentando, setPresentando] = useState(
    searchParams.get("pitch") === "1" || searchParams.get("presentar") === "true"
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (esDemo) return;
    if (!user) return;
    setCargando(true);
    setError(null);
    obtenerProyectoPorId(proyectoId)
      .then((proyectoCargado) => {
        setProyecto(proyectoCargado);
        setPresentacion(obtenerPresentacionProyecto(proyectoCargado));
      })
      .catch((e) => {
        const msg = (e as { message?: unknown } | null)?.message;
        setError(typeof msg === "string" && msg ? msg : "No se pudo cargar el proyecto.");
      })
      .finally(() => setCargando(false));
  }, [esDemo, proyectoId, user]);

  const modelo = useMemo(
    () => (proyecto ? construirModeloPitch(proyecto) : null),
    [proyecto]
  );

  const actualizar = (campo: keyof PresentacionProyecto, valor: string) => {
    setGuardado(false);
    setPresentacion((actual) => (actual ? { ...actual, [campo]: valor } : actual));
  };

  const guardar = async () => {
    if (!proyecto || !presentacion || esDemo) return proyecto;
    setGuardando(true);
    setError(null);
    try {
      const actualizado: Proyecto = {
        ...proyecto,
        presentacion,
        actualizado_en: new Date().toISOString(),
      };
      await guardarProyecto(actualizado);
      setProyecto(actualizado);
      setGuardado(true);
      setTimeout(() => setGuardado(false), 1800);
      return actualizado;
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar la presentación.");
      return null;
    } finally {
      setGuardando(false);
    }
  };

  const presentar = async () => {
    const listo = esDemo ? proyecto : await guardar();
    if (listo) setPresentando(true);
  };

  const restaurarTextos = () => {
    if (!proyecto) return;
    setPresentacion(crearPresentacionPredeterminada(proyecto));
    setGuardado(false);
  };

  const exportar = async () => {
    if (!proyecto) return;
    setExportando(true);
    try {
      const { exportarProyectoExcel } = await import("@/lib/exportar-excel");
      exportarProyectoExcel({ ...proyecto, presentacion: presentacion ?? undefined });
    } finally {
      setExportando(false);
    }
  };

  if (cargando) {
    return (
      <div className="flex h-app w-screen items-center justify-center bg-background text-foreground">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-3 text-sm font-medium text-muted-foreground">Preparando tu presentación…</p>
        </div>
      </div>
    );
  }

  if (error && (!proyecto || !presentacion || !modelo)) {
    return (
      <div className="flex h-app w-screen items-center justify-center bg-background p-6 text-foreground">
        <div className="max-w-md rounded-2xl border border-destructive/30 bg-destructive/10 p-6 text-center">
          <h1 className="font-display text-lg font-bold">No pudimos preparar la presentación</h1>
          <p className="mt-2 text-sm text-destructive-foreground/80">{error}</p>
          <button onClick={() => navigate(-1)} className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
            Volver
          </button>
        </div>
      </div>
    );
  }

  if (!proyecto || !presentacion || !modelo) return null;

  if (presentando) {
    return (
      <VisorPitch
        proyecto={{ ...proyecto, presentacion }}
        presentacion={presentacion}
        modelo={modelo}
        onSalir={() => setPresentando(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-card/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label="Volver"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="truncate font-display text-base font-bold sm:text-lg">Preparar presentación</div>
              <div className="truncate text-xs text-muted-foreground">{proyecto.nombre}</div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={exportar}
              disabled={exportando}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground shadow-2xs transition hover:bg-accent disabled:opacity-60"
            >
              {exportando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              <span className="hidden sm:inline">Descargar </span>Excel
            </button>
            {!esDemo && (
              <button
                onClick={guardar}
                disabled={guardando}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-xs font-semibold transition hover:bg-accent disabled:opacity-60"
              >
                {guardando ? <Loader2 className="h-4 w-4 animate-spin" /> : guardado ? <Check className="h-4 w-4 text-emerald-600" /> : <Save className="h-4 w-4" />}
                {guardando ? "Guardando…" : guardado ? "Guardado" : "Guardar"}
              </button>
            )}
            <button
              onClick={presentar}
              disabled={guardando}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:opacity-60"
            >
              <Play className="h-4 w-4 fill-current" /> Presentar ahora
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)] lg:px-6">
        <div className="space-y-5">
          <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <div className="border-b border-border bg-accent/40 px-5 py-4">
              <div className="flex items-center gap-2 font-display text-base font-bold text-foreground">
                <Edit3 className="h-4 w-4 text-primary" /> Tu historia en seis ideas
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Ya propusimos un texto usando los datos del proyecto. Edítalo para que exprese el enfoque de tu equipo.
              </p>
            </div>
            <div className="grid gap-4 p-5">
              <Campo etiqueta="Título principal" valor={presentacion.titulo} onChange={(valor) => actualizar("titulo", valor)} maxLength={90} />
              <Campo etiqueta="Subtítulo" valor={presentacion.subtitulo} onChange={(valor) => actualizar("subtitulo", valor)} maxLength={120} />
              <Campo etiqueta="Equipo o expositores" valor={presentacion.expositores} onChange={(valor) => actualizar("expositores", valor)} maxLength={120} />
              <Campo etiqueta="Problema u oportunidad" valor={presentacion.problema} onChange={(valor) => actualizar("problema", valor)} maxLength={280} multilinea />
              <Campo etiqueta="Propuesta de valor" valor={presentacion.propuestaValor} onChange={(valor) => actualizar("propuestaValor", valor)} maxLength={280} multilinea />
              <Campo etiqueta="Conclusión y recomendación" valor={presentacion.conclusion} onChange={(valor) => actualizar("conclusion", valor)} maxLength={360} multilinea />
              <button onClick={restaurarTextos} className="justify-self-start text-xs font-semibold text-primary transition hover:underline">
                <Sparkles className="mr-1 inline h-3.5 w-3.5" /> Regenerar textos sugeridos
              </button>
            </div>
          </section>

          {error && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
              {error}
            </div>
          )}
        </div>

        <div className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <section className="overflow-hidden rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-primary">Vista previa</div>
                <div className="mt-0.5 text-xs text-muted-foreground">Formato panorámico 16:9</div>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase ${modelo.viable ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300" : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"}`}>
                {modelo.viable ? "Plan base: viable" : "Plan base: requiere ajustes"}
              </span>
            </div>
            <div className="relative aspect-video overflow-hidden rounded-xl bg-[#0a101d] p-5 text-white shadow-lg border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-400">Presentación de Inversión</span>
                <span className="text-[10px] text-slate-400 font-medium">5 años · {modelo.nivel}</span>
              </div>
              <div className="my-auto">
                <div className="font-display text-lg sm:text-xl font-bold leading-tight tracking-tight text-white line-clamp-2">{presentacion.titulo}</div>
                <div className="mt-1 text-xs text-slate-300 line-clamp-1">{presentacion.subtitulo}</div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-[10px]">
                  <div className="rounded bg-white/5 border border-white/10 p-1.5 text-center">
                    <div className="text-slate-400">Inversión</div>
                    <div className="font-bold text-white truncate">{Math.round(modelo.totalProyecto / 1000)}k Bs</div>
                  </div>
                  <div className="rounded bg-white/5 border border-white/10 p-1.5 text-center">
                    <div className="text-slate-400">VAN</div>
                    <div className={`font-bold truncate ${modelo.resultado.indicadores.van > 0 ? "text-emerald-300" : "text-rose-300"}`}>
                      {Math.round(modelo.resultado.indicadores.van / 1000)}k Bs
                    </div>
                  </div>
                  <div className="rounded bg-white/5 border border-white/10 p-1.5 text-center">
                    <div className="text-slate-400">TIR</div>
                    <div className="font-bold text-teal-300 truncate">
                      {Math.round(modelo.resultado.indicadores.tir * 100)}%
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-white/10 pt-2 text-[10px] text-slate-400">
                <span className="truncate">{presentacion.expositores}</span>
                <span className={`font-bold ${modelo.viable ? "text-emerald-400" : "text-amber-400"}`}>
                  {modelo.viable ? "✓ Viable" : "⚠ Ajustar"}
                </span>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-base font-bold">Guion automático</h2>
                <p className="text-xs text-muted-foreground">Estructurado en 3 actos narrativos · Nivel {modelo.nivel}</p>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{modelo.diapositivas.length} diapositivas</span>
            </div>
            <div className="mt-4 space-y-4">
              {[
                {
                  fase: "Acto I",
                  titulo: "Tesis y Oportunidad",
                  ids: ["portada", "oportunidad", "mercado"],
                  color: "border-teal-500/30",
                  bg: "bg-teal-50/40 dark:bg-teal-950/20",
                  badge: "bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300",
                },
                {
                  fase: "Acto II",
                  titulo: "Modelo Económico y Operativo",
                  ids: ["inversion", "operacion", "equilibrio", "financiamiento", "flujo"],
                  color: "border-sky-500/30",
                  bg: "bg-sky-50/40 dark:bg-sky-950/20",
                  badge: "bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-300",
                },
                {
                  fase: "Acto III",
                  titulo: "Evaluación, Riesgo y Cierre",
                  ids: ["indicadores", "tipo", "riesgo", "escenarios", "montecarlo", "laboratorio", "cierre"],
                  color: "border-amber-500/30",
                  bg: "bg-amber-50/40 dark:bg-amber-950/20",
                  badge: "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300",
                },
              ].map((fase) => {
                const diapositivasFase = modelo.diapositivas.filter((d) => fase.ids.includes(d.id));
                if (diapositivasFase.length === 0) return null;
                return (
                  <div key={fase.fase} className={`rounded-xl border ${fase.color} ${fase.bg} p-3`}>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        {fase.fase} · {fase.titulo}
                      </span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${fase.badge}`}>
                        {diapositivasFase.length} {diapositivasFase.length === 1 ? "lámina" : "láminas"}
                      </span>
                    </div>
                    <ol className="space-y-1.5">
                      {diapositivasFase.map((diapositiva) => (
                        <li
                          key={diapositiva.id}
                          className="flex items-center gap-2.5 rounded-lg border border-border/60 bg-card px-2.5 py-2 shadow-2xs"
                        >
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary text-[11px] font-bold text-primary-foreground font-mono">
                            {String(diapositiva.numero).padStart(2, "0")}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-xs font-semibold text-foreground">
                              {diapositiva.titulo}
                            </div>
                            <div className="truncate text-[10px] text-muted-foreground">
                              {diapositiva.etiqueta}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function Campo({
  etiqueta,
  valor,
  onChange,
  maxLength,
  multilinea = false,
}: {
  etiqueta: string;
  valor: string;
  onChange: (valor: string) => void;
  maxLength: number;
  multilinea?: boolean;
}) {
  const clases = "mt-1.5 w-full rounded-lg border border-input bg-background px-3.5 py-2.5 text-sm font-medium text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20";
  return (
    <label className="block">
      <span className="flex items-center justify-between text-xs font-medium text-foreground">
        {etiqueta}
        <span className="font-mono text-[11px] text-muted-foreground">{valor.length}/{maxLength}</span>
      </span>
      {multilinea ? (
        <textarea value={valor} onChange={(e) => onChange(e.target.value)} maxLength={maxLength} rows={3} className={`${clases} resize-y`} />
      ) : (
        <input value={valor} onChange={(e) => onChange(e.target.value)} maxLength={maxLength} className={clases} />
      )}
    </label>
  );
}
