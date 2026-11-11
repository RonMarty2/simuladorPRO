import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  BarChart3,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  Edit3,
  Eye,
  Loader2,
  Maximize2,
  Play,
  Save,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth-store";
import { guardarProyecto, obtenerProyectoPorId } from "@/lib/proyecto-supabase";
import {
  construirModeloPitch,
  crearPresentacionPredeterminada,
  obtenerPresentacionProyecto,
} from "@/lib/presentacion-proyecto";
import { crearProyectoEjemploCafeteriaV2 } from "@/lib/proyecto-factory";
import type { PresentacionProyecto, Proyecto } from "@/types/proyecto";
import VisorPitch, { RenderDiapositiva } from "@/components/presentacion/VisorPitch";
import {
  crearAjustesLaboratorioIniciales,
  type AjustesLaboratorio,
} from "@/lib/laboratorio-viabilidad";
import { simularMontecarlo, type ResultadoMontecarlo } from "@/lib/analisis-riesgo";

export default function PresentarProyecto() {
  const { proyectoId = "" } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((estado) => estado.user);
  const esDemo =
    proyectoId === "demo" || location.pathname === "/presentar/demo";
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
  const [indiceVistaPrevia, setIndiceVistaPrevia] = useState(0);

  const [montecarlo, setMontecarlo] = useState<ResultadoMontecarlo | null>(null);
  const [ajustesLaboratorio, setAjustesLaboratorio] = useState<AjustesLaboratorio | null>(null);

  useEffect(() => {
    if (!proyecto) return;
    if (!ajustesLaboratorio) {
      setAjustesLaboratorio(crearAjustesLaboratorioIniciales(proyecto));
    }
    let cancelado = false;
    simularMontecarlo(proyecto).then((res) => {
      if (!cancelado) setMontecarlo(res);
    });
    return () => {
      cancelado = true;
    };
  }, [proyecto]);

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

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[minmax(0,1fr)_minmax(420px,1.15fr)] lg:px-6">
        <div className="space-y-5">
          <section className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <div className="border-b border-border bg-accent/40 px-5 py-4">
              <div className="flex items-center gap-2 font-display text-base font-bold text-foreground">
                <Edit3 className="h-4 w-4 text-primary" /> Tu historia en seis ideas
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Edita los textos narrativos de tu presentación. Al escribir, la vista previa a la derecha salta automáticamente a la lámina correspondiente.
              </p>
            </div>
            <div className="grid gap-4 p-5">
              <div className="rounded-lg border border-teal-200/70 bg-teal-50/40 p-2.5 dark:border-teal-900/50 dark:bg-teal-950/20">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300">
                    Apertura · Diapositiva 01
                  </span>
                  <button
                    type="button"
                    onClick={() => setIndiceVistaPrevia(0)}
                    className="text-[10px] font-semibold text-teal-700 hover:underline dark:text-teal-300"
                  >
                    Ver en vista previa →
                  </button>
                </div>
                <div className="space-y-3">
                  <Campo
                    etiqueta="Título principal"
                    valor={presentacion.titulo}
                    onChange={(valor) => actualizar("titulo", valor)}
                    onFocus={() => setIndiceVistaPrevia(0)}
                    maxLength={90}
                  />
                  <Campo
                    etiqueta="Subtítulo"
                    valor={presentacion.subtitulo}
                    onChange={(valor) => actualizar("subtitulo", valor)}
                    onFocus={() => setIndiceVistaPrevia(0)}
                    maxLength={120}
                  />
                  <Campo
                    etiqueta="Equipo o expositores"
                    valor={presentacion.expositores}
                    onChange={(valor) => actualizar("expositores", valor)}
                    onFocus={() => setIndiceVistaPrevia(0)}
                    maxLength={120}
                  />
                </div>
              </div>

              <div className="rounded-lg border border-sky-200/70 bg-sky-50/40 p-2.5 dark:border-sky-900/50 dark:bg-sky-950/20">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-800 dark:text-sky-300">
                    Tesis y Oportunidad · Diapositiva 02
                  </span>
                  <button
                    type="button"
                    onClick={() => setIndiceVistaPrevia(1)}
                    className="text-[10px] font-semibold text-sky-700 hover:underline dark:text-sky-300"
                  >
                    Ver en vista previa →
                  </button>
                </div>
                <div className="space-y-3">
                  <Campo
                    etiqueta="Problema u oportunidad"
                    valor={presentacion.problema}
                    onChange={(valor) => actualizar("problema", valor)}
                    onFocus={() => setIndiceVistaPrevia(1)}
                    maxLength={280}
                    multilinea
                  />
                  <Campo
                    etiqueta="Propuesta de valor"
                    valor={presentacion.propuestaValor}
                    onChange={(valor) => actualizar("propuestaValor", valor)}
                    onFocus={() => setIndiceVistaPrevia(1)}
                    maxLength={280}
                    multilinea
                  />
                </div>
              </div>

              <div className="rounded-lg border border-amber-200/70 bg-amber-50/40 p-2.5 dark:border-amber-900/50 dark:bg-amber-950/20">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                    Cierre de Inversión · Diapositiva {modelo.diapositivas.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIndiceVistaPrevia(modelo.diapositivas.length - 1)}
                    className="text-[10px] font-semibold text-amber-700 hover:underline dark:text-amber-300"
                  >
                    Ver en vista previa →
                  </button>
                </div>
                <Campo
                  etiqueta="Conclusión y recomendación"
                  valor={presentacion.conclusion}
                  onChange={(valor) => actualizar("conclusion", valor)}
                  onFocus={() => setIndiceVistaPrevia(modelo.diapositivas.length - 1)}
                  maxLength={360}
                  multilinea
                />
              </div>

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
          {/* Vista previa en vivo e interactiva */}
          <section className="overflow-hidden rounded-xl border border-border bg-card p-4 shadow-sm">
            {(() => {
              const diapositivaActiva =
                modelo.diapositivas[indiceVistaPrevia] ?? modelo.diapositivas[0];
              return (
                <>
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                        <Eye className="h-3.5 w-3.5 shrink-0" /> Vista previa en vivo
                      </div>
                      <div className="mt-0.5 truncate text-xs font-semibold text-foreground max-w-[240px] sm:max-w-xs">
                        {diapositivaActiva.etiqueta}: {diapositivaActiva.titulo}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setIndiceVistaPrevia((i) => Math.max(0, i - 1))}
                        disabled={indiceVistaPrevia === 0}
                        className="rounded-lg border border-border p-1.5 text-foreground hover:bg-secondary disabled:opacity-30"
                        title="Lámina anterior"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <span className="font-mono text-xs font-bold px-1.5 tabular-nums">
                        {indiceVistaPrevia + 1}/{modelo.diapositivas.length}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setIndiceVistaPrevia((i) =>
                            Math.min(modelo.diapositivas.length - 1, i + 1)
                          )
                        }
                        disabled={indiceVistaPrevia === modelo.diapositivas.length - 1}
                        className="rounded-lg border border-border p-1.5 text-foreground hover:bg-secondary disabled:opacity-30"
                        title="Siguiente lámina"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={presentar}
                        className="ml-1 flex items-center gap-1 rounded-lg bg-teal-700 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-teal-600 shadow-2xs"
                        title="Presentar a pantalla completa"
                      >
                        <Maximize2 className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Presentar</span>
                      </button>
                    </div>
                  </div>

                  {/* Canvas de lámina real */}
                  <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-slate-700/60 bg-white text-slate-900 shadow-lg">
                    <RenderDiapositiva
                      id={diapositivaActiva.id}
                      proyecto={{ ...proyecto, presentacion }}
                      presentacion={presentacion}
                      modelo={modelo}
                      etiqueta={diapositivaActiva.etiqueta}
                      montecarlo={montecarlo}
                      ajustesLaboratorio={
                        ajustesLaboratorio ?? crearAjustesLaboratorioIniciales(proyecto)
                      }
                      onCambiarAjustes={setAjustesLaboratorio}
                      onReiniciarLaboratorio={() =>
                        setAjustesLaboratorio(crearAjustesLaboratorioIniciales(proyecto))
                      }
                    />
                    <div className="pointer-events-none absolute bottom-2 right-3 z-20 rounded bg-slate-950/70 px-2 py-0.5 font-mono text-[10px] font-bold text-white shadow-xs backdrop-blur-xs">
                      {indiceVistaPrevia + 1} / {modelo.diapositivas.length}
                    </div>
                  </div>

                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Haz clic en cualquier lámina abajo para verla aquí.</span>
                    <span
                      className={
                        modelo.viable
                          ? "font-bold text-emerald-600 dark:text-emerald-400"
                          : "font-bold text-amber-600 dark:text-amber-400"
                      }
                    >
                      {modelo.viable ? "✓ Plan base viable" : "⚠ Ajustar costos/ingresos"}
                    </span>
                  </div>
                </>
              );
            })()}
          </section>

          {/* Guion con 3 actos completamente navegables */}
          <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-base font-bold">Guion de la presentación</h2>
                <p className="text-xs text-muted-foreground">
                  Estructurado en 3 actos narrativos · Nivel {modelo.nivel}
                </p>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                {modelo.diapositivas.length} diapositivas
              </span>
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
                    <div className="space-y-1.5">
                      {diapositivasFase.map((diapositiva) => {
                        const pos = modelo.diapositivas.findIndex((d) => d.id === diapositiva.id);
                        const activa = pos === indiceVistaPrevia;
                        return (
                          <button
                            type="button"
                            key={diapositiva.id}
                            onClick={() => setIndiceVistaPrevia(pos)}
                            className={cn(
                              "flex w-full items-center gap-2.5 rounded-lg border px-2.5 py-2 text-left transition-all shadow-2xs",
                              activa
                                ? "border-teal-600 bg-teal-50 dark:bg-teal-950/60 ring-2 ring-teal-500/30 text-teal-950 dark:text-teal-100 font-semibold"
                                : "border-border/60 bg-card hover:border-teal-500/40 hover:bg-secondary/60 text-foreground"
                            )}
                          >
                            <span
                              className={cn(
                                "flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[11px] font-bold font-mono",
                                activa ? "bg-teal-700 text-white" : "bg-primary/10 text-primary"
                              )}
                            >
                              {String(diapositiva.numero).padStart(2, "0")}
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="truncate text-xs font-semibold">
                                {diapositiva.titulo}
                              </div>
                              <div className="truncate text-[10px] text-muted-foreground">
                                {diapositiva.etiqueta}
                              </div>
                            </div>
                            {activa && (
                              <span className="rounded-full bg-teal-600/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300">
                                En vista
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
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
  onFocus,
  maxLength,
  multilinea = false,
}: {
  etiqueta: string;
  valor: string;
  onChange: (valor: string) => void;
  onFocus?: () => void;
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
        <textarea
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          maxLength={maxLength}
          rows={3}
          className={`${clases} resize-y`}
        />
      ) : (
        <input
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          maxLength={maxLength}
          className={clases}
        />
      )}
    </label>
  );
}
