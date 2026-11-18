import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  GitBranch,
  Landmark,
  Layers,
  Lightbulb,
  Maximize2,
  Minimize2,
  Scale,
  TrendingUp,
  X,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useProyectoStore } from "@/stores/proyecto-store";
import { useAuthStore } from "@/stores/auth-store";
import { listarMisProyectos, listarProyectosGrupales } from "@/lib/proyecto-supabase";
import {
  construirEstadosFinancieros,
  type EstadosFinancierosProyecto,
} from "@/lib/estados-financieros";
import { tirCalculable } from "@/lib/acotar-numero";
import AccionesProyecto from "@/components/presentacion/AccionesProyecto";
import { cn, fmtNum, formatearBolivianos } from "@/lib/utils";
import type { Proyecto } from "@/types/proyecto";

type PestanaContable = "balance" | "resultados" | "flujos" | "ratios";

const fmtPct = (v: number, dec = 1) =>
  Number.isFinite(v) ? `${fmtNum(v * 100, dec)}%` : "—";

const fmtVeces = (v: number, dec = 2) =>
  Number.isFinite(v) ? `${fmtNum(v, dec)}×` : "Sin deuda";

const PESTANAS_CONTABLES: Array<{
  id: PestanaContable;
  titulo: string;
  sub: string;
  icon: typeof Scale;
}> = [
  {
    id: "balance",
    titulo: "1. Balance de Apertura y General",
    sub: "Partida doble Año 0 a 5",
    icon: Scale,
  },
  {
    id: "resultados",
    titulo: "2. Estado de Resultados",
    sub: "EBITDA · EBIT · Utilidad Neta",
    icon: FileSpreadsheet,
  },
  {
    id: "flujos",
    titulo: "3. Flujos de Efectivo",
    sub: "Operación · Inversión · Deuda",
    icon: Layers,
  },
  {
    id: "ratios",
    titulo: "4. Ratios y Sistema DuPont",
    sub: "ROE · ROA · Liquidez · Solvencia",
    icon: GitBranch,
  },
];

export default function EstadosFinancierosRoute() {
  const proyecto = useProyectoStore((s) => s.proyecto);
  const cargarProyecto = useProyectoStore((s) => s.cargar);
  const user = useAuthStore((s) => s.user);
  const [disponibles, setDisponibles] = useState<Proyecto[] | null>(null);
  const [pestana, setPestana] = useState<PestanaContable>("balance");
  const [modoPresentacion, setModoPresentacion] = useState(false);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      listarMisProyectos(user.id),
      listarProyectosGrupales(user.id).catch(() => [] as Proyecto[]),
    ])
      .then(([mios, grupales]) => {
        const miosInd = mios.filter(
          (p) => p.tipo !== "proyecto_grupal" && !p.grupo_id
        );
        const ids = new Set(miosInd.map((p) => p.id));
        const todos = [
          ...miosInd,
          ...grupales.filter((g) => !ids.has(g.id)),
        ].filter((p) => !p.esSemanaE);
        setDisponibles(todos);
        if (!proyecto && todos.length > 0) {
          cargarProyecto(todos[0]);
        }
      })
      .catch(() => setDisponibles([]));
  }, [user, proyecto, cargarProyecto]);

  const ef = useMemo(
    () => (proyecto ? construirEstadosFinancieros(proyecto) : null),
    [proyecto]
  );

  if (!proyecto || !ef) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <div className="rounded-lg border border-dashed border-border bg-card p-6 text-center">
          <Scale className="mx-auto h-10 w-10 text-muted-foreground" />
          <h2 className="mt-3 text-base font-semibold">No hay proyecto activo</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Elige un proyecto para consultar su Balance de Apertura, Estado de Resultados,
            Flujos de Efectivo y Ratios Financieros.
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

  return (
    <div className="space-y-5">
      {/* Selector de proyecto si tiene más de uno */}
      {disponibles && disponibles.length > 1 && (
        <div className="rounded-xl border border-border/80 bg-card p-3 shadow-2xs">
          <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Proyecto analizado
          </div>
          <div className="flex flex-wrap gap-2">
            {disponibles.map((p) => {
              const activo = p.id === proyecto.id;
              return (
                <button
                  key={p.id}
                  onClick={() => !activo && cargarProyecto(p)}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-xs font-medium transition-all",
                    activo
                      ? "border-primary bg-primary text-primary-foreground font-semibold shadow-2xs"
                      : "border-border bg-background hover:border-primary/40 hover:bg-secondary/50"
                  )}
                >
                  {p.nombre}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Barra de retorno directo al constructor del proyecto + acciones del mismo proyecto */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-3.5 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/construir"
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary/60 px-3 py-1.5 text-xs font-semibold text-foreground transition hover:bg-secondary"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Volver a editar este proyecto
          </Link>
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary">
            {proyecto.tipo === "proyecto_grupal"
              ? "Proyecto grupal"
              : proyecto.caso_origen_id
                ? "Caso del curso"
                : "Proyecto individual"}
          </span>
        </div>
        <AccionesProyecto proyecto={proyecto} compacto />
      </div>

      {/* Encabezado contable */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-2xs">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
              <Landmark className="h-4 w-4" />
              Administración Financiera · Estados Contables y Ratios
            </div>
            <h1 className="mt-1 font-display text-2xl font-bold tracking-tight">
              {proyecto.nombre}
            </h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Expresado en Bolivianos (Bs) · Horizonte de evaluación: 5 años · Partida doble verificada
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              Cuadre contable exacto (Activo = Pasivo + Patrimonio)
            </div>
            <button
              type="button"
              onClick={() => setModoPresentacion(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-xs font-bold text-primary-foreground shadow-sm transition hover:bg-primary/90"
            >
              <BarChart3 className="h-4 w-4" />
              Presentar estados financieros
            </button>
          </div>
        </div>

        {/* Barra de sub-pestañas */}
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {PESTANAS_CONTABLES.map((tab) => {
            const Icon = tab.icon;
            const activa = pestana === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setPestana(tab.id)}
                className={cn(
                  "flex flex-col items-start rounded-xl border p-3 text-left transition-all",
                  activa
                    ? "border-primary bg-primary/10 ring-2 ring-primary/25"
                    : "border-border bg-background/60 hover:border-primary/40 hover:bg-secondary/40"
                )}
              >
                <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                  <Icon className={cn("h-4 w-4", activa ? "text-primary" : "text-muted-foreground")} />
                  {tab.titulo}
                </div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">{tab.sub}</div>
              </button>
            );
          })}
        </div>
      </div>

      {pestana === "balance" && <VistaBalance ef={ef} nombreProyecto={proyecto.nombre} />}
      {pestana === "resultados" && <VistaEstadoResultados ef={ef} nombreProyecto={proyecto.nombre} />}
      {pestana === "flujos" && <VistaFlujosContables ef={ef} />}
      {pestana === "ratios" && <VistaRatiosYDuPont ef={ef} />}

      {/* Modo presentación ejecutiva (5 diapositivas resumidas para exponer) */}
      {modoPresentacion && (
        <PresentacionEjecutivaContable
          proyecto={proyecto}
          ef={ef}
          onSalir={() => setModoPresentacion(false)}
        />
      )}
    </div>
  );
}

// ============================================================================
// PRESENTACIÓN EJECUTIVA CONTABLE (5 DIAPOSITIVAS RESUMIDAS PARA EXPONER)
// ============================================================================
const LAMINAS_EXPOSICION = [
  {
    id: "portada",
    etiqueta: "01 · Síntesis Ejecutiva",
    titulo: "Dictamen Contable y Financiero",
    guia: "Presenta el nombre del proyecto, confirma que la ecuación patrimonial cuadra al centavo y destaca los 4 indicadores clave de la portada.",
  },
  {
    id: "balance",
    etiqueta: "02 · Balance de Apertura",
    titulo: "Ecuación Patrimonial e Inversión (Año 0)",
    guia: "Explica a la izquierda en qué se invierte cada boliviano (Activo) y a la derecha quién lo financia (Deuda bancaria vs. Aporte propio de socios).",
  },
  {
    id: "resultados",
    etiqueta: "03 · Estado de Resultados",
    titulo: "Cascada de Márgenes: de Ventas a Utilidad Neta",
    guia: "Muestra cómo las ventas cubren costos directos y gastos operativos generando un EBITDA y Utilidad Neta positivos desde el Año 1 hasta el Año 5.",
  },
  {
    id: "flujos",
    etiqueta: "04 · Tesorería y Deuda",
    titulo: "Flujo Económico vs. Flujo del Inversionista",
    guia: "Compara la rentabilidad del proyecto puro (al WACC) contra la rentabilidad del bolsillo de los socios (al Ke) tras cumplir con el servicio de la deuda.",
  },
  {
    id: "dupont",
    etiqueta: "05 · Ratios y Sistema DuPont",
    titulo: "Descomposición del ROE, Liquidez y Solvencia",
    guia: "Explica la identidad DuPont: cuánto del ROE viene del margen neto, cuánto de la rotación del activo y cuánto del apalancamiento financiero.",
  },
] as const;

function PresentacionEjecutivaContable({
  proyecto,
  ef,
  onSalir,
}: {
  proyecto: Proyecto;
  ef: EstadosFinancierosProyecto;
  onSalir: () => void;
}) {
  const [indice, setIndice] = useState(0);
  const [mostrarGuia, setMostrarGuia] = useState(false);
  const lamina = LAMINAS_EXPOSICION[indice];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onSalir();
      } else if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        setIndice((i) => Math.min(LAMINAS_EXPOSICION.length - 1, i + 1));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setIndice((i) => Math.max(0, i - 1));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onSalir]);

  const b0 = ef.balanceApertura;
  const total0 = b0.totalActivo || 1;
  const er1 = ef.estadoResultados[0];
  const er5 = ef.estadoResultados[4];
  const dp1 = ef.dupontPorAnio[0];
  const prom = ef.ratiosPromedio;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#070d19] text-slate-100 select-none">
      {/* Barra superior */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-white/10 bg-[#0b1322] px-4 md:px-6">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-teal-400" />
          <span className="truncate text-xs font-bold text-slate-200 md:text-sm">
            {proyecto.nombre} · Defensa de Estados Financieros
          </span>
          <span className="hidden text-xs text-slate-400 sm:inline">
            · {lamina.etiqueta} — {lamina.titulo}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMostrarGuia((v) => !v)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold transition-colors",
              mostrarGuia
                ? "border-amber-400/50 bg-amber-400/20 text-amber-200"
                : "border-white/10 text-slate-300 hover:bg-white/10"
            )}
            title="Qué decir al exponer esta lámina"
          >
            <Lightbulb className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Guía para exponer</span>
          </button>
          <button
            type="button"
            onClick={async () => {
              try {
                if (!document.fullscreenElement) {
                  await document.documentElement.requestFullscreen();
                } else {
                  await document.exitFullscreen();
                }
              } catch {}
            }}
            className="rounded-md border border-white/10 p-1.5 text-slate-300 hover:bg-white/10"
            title="Pantalla completa"
          >
            {document.fullscreenElement ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              if (document.fullscreenElement) {
                document.exitFullscreen().catch(() => {});
              }
              onSalir();
            }}
            className="inline-flex items-center gap-1 rounded-md border border-white/10 px-2.5 py-1 text-xs font-semibold text-slate-200 hover:bg-white/10"
          >
            <X className="h-4 w-4" /> Salir
          </button>
        </div>
      </div>

      {/* Área central de la diapositiva 16:9 sin scroll */}
      <div className="relative flex min-h-0 flex-1 items-center justify-center p-2 md:p-4">
        <div className="relative h-full w-full max-w-[1550px] overflow-hidden rounded-xl border border-slate-700/60 bg-[#faf8f5] text-slate-900 shadow-2xl">
          {/* LÁMINA 1: PORTADA FINANCIERA */}
          {lamina.id === "portada" && (
            <div className="relative flex h-full flex-col justify-between bg-[#0a101d] p-[4.5%] text-white">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 via-emerald-400 to-indigo-500" />
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="rounded bg-teal-500/20 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-teal-300 border border-teal-500/30">
                  Administración Financiera · Estados Contables
                </span>
                <span className="rounded-full bg-emerald-500/20 border border-emerald-400/40 px-3 py-1 text-xs font-bold text-emerald-300">
                  ✓ Partida Doble Verificada (Activo = Pasivo + Patrimonio)
                </span>
              </div>

              <div className="my-auto grid grid-cols-1 gap-6 lg:grid-cols-[1.35fr_1fr] items-center">
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.2em] text-teal-400">
                    Defensa Ejecutiva · Horizonte 5 Años
                  </div>
                  <h1 className="mt-2 font-display text-[clamp(26px,3.8vw,60px)] font-bold leading-tight tracking-tight text-white">
                    {proyecto.nombre}
                  </h1>
                  <p className="mt-2 max-w-2xl text-[clamp(12px,1.2vw,18px)] text-slate-300 leading-relaxed">
                    Síntesis de Balance de Apertura, Estado de Resultados, Flujos de Efectivo y Descomposición DuPont para evaluación financiera.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Activo Total Apertura (Año 0)
                    </div>
                    <div className="mt-1 font-mono text-[clamp(18px,2vw,30px)] font-bold text-teal-300">
                      {formatearBolivianos(b0.totalActivo)}
                    </div>
                    <div className="mt-0.5 text-[11px] text-slate-400">
                      {fmtPct(b0.totalPatrimonio / total0)} propio · {fmtPct(b0.totalPasivo / total0)} deuda
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      EBITDA Año 1 → Año 5
                    </div>
                    <div className="mt-1 font-mono text-[clamp(16px,1.7vw,26px)] font-bold text-emerald-300">
                      {formatearBolivianos(er1.ebitda)}
                    </div>
                    <div className="mt-0.5 text-[11px] text-slate-400">
                      Año 5: {formatearBolivianos(er5.ebitda)} ({fmtPct(prom.margenEbitda)} prom.)
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      ROE Promedio (Accionista)
                    </div>
                    <div className="mt-1 font-mono text-[clamp(18px,2vw,30px)] font-bold text-indigo-300">
                      {fmtPct(prom.roe)}
                    </div>
                    <div className="mt-0.5 text-[11px] text-slate-400">
                      ROA Neto prom.: {fmtPct(prom.roaNeto)} · WACC: {fmtPct(ef.wacc)}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      VAN del Proyecto (al WACC)
                    </div>
                    <div className={cn("mt-1 font-mono text-[clamp(18px,2vw,30px)] font-bold", ef.vanProyecto >= 0 ? "text-emerald-400" : "text-rose-400")}>
                      {formatearBolivianos(ef.vanProyecto)}
                    </div>
                    <div className="mt-0.5 text-[11px] text-slate-400">
                      TIR: {tirCalculable(ef.tirProyecto) ? fmtPct(ef.tirProyecto) : "N/A"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-white/10 pt-3 text-xs text-slate-400">
                <span>Expresado en Bolivianos (Bs) · Normativa Tributaria Bolivia (IVA 13%, IT 3%, IUE 25%)</span>
                <span className="font-semibold text-teal-300">Usa las flechas ← → para exponer</span>
              </div>
            </div>
          )}

          {/* LÁMINA 2: BALANCE DE APERTURA RESUMIDO */}
          {lamina.id === "balance" && (
            <MarcoLaminaContable
              etiqueta={lamina.etiqueta}
              titulo={lamina.titulo}
              subtitulo="Distribución de recursos invertidos (Activo) frente a sus fuentes de financiamiento (Pasivo y Patrimonio)."
            >
              <div className="grid h-full min-h-0 grid-cols-1 gap-4 lg:grid-cols-2">
                {/* Columna Izquierda: ACTIVO */}
                <div className="flex flex-col justify-between rounded-2xl border border-emerald-200 bg-white p-5 shadow-xs">
                  <div>
                    <div className="flex items-center justify-between border-b-2 border-emerald-700 pb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                        1. ACTIVO (¿En qué se invierte?)
                      </span>
                      <span className="font-mono text-sm font-bold text-emerald-900">100,0%</span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3">
                        <div className="text-[10px] font-bold uppercase text-slate-500">
                          1.1 Activo Corriente (Liquidez)
                        </div>
                        <div className="mt-1 font-mono text-xl font-bold text-slate-900">
                          {formatearBolivianos(b0.totalActivoCorriente)}
                        </div>
                        <div className="text-xs font-semibold text-emerald-800">
                          {fmtPct(b0.totalActivoCorriente / total0)} del Activo
                        </div>
                      </div>
                      <div className="rounded-xl border border-teal-100 bg-teal-50/60 p-3">
                        <div className="text-[10px] font-bold uppercase text-slate-500">
                          1.2 Activo No Corriente (Fijo)
                        </div>
                        <div className="mt-1 font-mono text-xl font-bold text-slate-900">
                          {formatearBolivianos(b0.totalActivoNoCorriente)}
                        </div>
                        <div className="text-xs font-semibold text-teal-800">
                          {fmtPct(b0.totalActivoNoCorriente / total0)} del Activo
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 space-y-2">
                      {ef.rubrosInversion
                        .filter((r) => r.montoBruto > 0)
                        .slice(0, 5)
                        .map((r) => (
                          <div key={r.clave}>
                            <div className="flex justify-between text-xs">
                              <span className="font-medium text-slate-700">{r.etiqueta}</span>
                              <span className="font-mono font-bold text-slate-900">
                                {formatearBolivianos(r.montoBruto)} ({fmtPct(r.porcentajeActivo)})
                              </span>
                            </div>
                            <div className="mt-1 h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-teal-600"
                                style={{ width: `${Math.max(3, r.porcentajeActivo * 100)}%` }}
                              />
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t-2 border-b-4 border-double border-slate-900 py-2 font-mono text-base font-bold">
                    <span>TOTAL ACTIVO</span>
                    <span className="text-emerald-800">{formatearBolivianos(b0.totalActivo)}</span>
                  </div>
                </div>

                {/* Columna Derecha: PASIVO + PATRIMONIO */}
                <div className="flex flex-col justify-between rounded-2xl border border-indigo-200 bg-white p-5 shadow-xs">
                  <div>
                    <div className="flex items-center justify-between border-b-2 border-indigo-700 pb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-800">
                        2. PASIVO + 3. PATRIMONIO (¿Cómo se financia?)
                      </span>
                      <span className="font-mono text-sm font-bold text-indigo-900">100,0%</span>
                    </div>

                    <div className="mt-3 space-y-2.5">
                      <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-3.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase text-rose-800">
                            2.1 Pasivo Corriente (Deuda Corto Plazo ≤ 1 año)
                          </span>
                          <span className="font-mono text-xs font-bold text-rose-700">
                            {fmtPct(b0.totalPasivoCorriente / total0)}
                          </span>
                        </div>
                        <div className="mt-1 font-mono text-xl font-bold text-slate-900">
                          {formatearBolivianos(b0.totalPasivoCorriente)}
                        </div>
                      </div>

                      <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase text-amber-900">
                            2.2 Pasivo No Corriente (Deuda Largo Plazo &gt; 1 año)
                          </span>
                          <span className="font-mono text-xs font-bold text-amber-800">
                            {fmtPct(b0.totalPasivoNoCorriente / total0)}
                          </span>
                        </div>
                        <div className="mt-1 font-mono text-xl font-bold text-slate-900">
                          {formatearBolivianos(b0.totalPasivoNoCorriente)}
                        </div>
                      </div>

                      <div className="rounded-xl border-2 border-indigo-300 bg-indigo-50/70 p-3.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase text-indigo-900">
                            3. Patrimonio Neto (Capital Social / Aporte Propio)
                          </span>
                          <span className="font-mono text-xs font-bold text-indigo-800">
                            {fmtPct(b0.totalPatrimonio / total0)}
                          </span>
                        </div>
                        <div className="mt-1 font-mono text-2xl font-bold text-indigo-950">
                          {formatearBolivianos(b0.totalPatrimonio)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t-2 border-b-4 border-double border-slate-900 py-2 font-mono text-base font-bold">
                    <span>TOTAL PASIVO Y PATRIMONIO</span>
                    <span className="text-indigo-800">{formatearBolivianos(b0.totalPasivoYPatrimonio)}</span>
                  </div>
                </div>
              </div>
            </MarcoLaminaContable>
          )}

          {/* LÁMINA 3: ESTADO DE RESULTADOS RESUMIDO */}
          {lamina.id === "resultados" && (
            <MarcoLaminaContable
              etiqueta={lamina.etiqueta}
              titulo={lamina.titulo}
              subtitulo="Síntesis de ingresos, costos, EBITDA y utilidad neta entre el Año 1 y el Año 5."
            >
              <div className="grid h-full min-h-0 grid-cols-1 gap-4 lg:grid-cols-[1.15fr_1.45fr]">
                {/* Izquierda: Escalera ejecutiva Año 1 vs Año 5 */}
                <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Cascada Contable Resumen (Año 1 vs. Año 5)
                  </div>
                  <div className="my-auto space-y-2">
                    {[
                      {
                        label: "(+) Ingresos por Ventas",
                        a1: er1.ingresos,
                        a5: er5.ingresos,
                        pct: "100% Ventas",
                        bg: "bg-slate-50 border-slate-200",
                      },
                      {
                        label: "(=) Utilidad Bruta",
                        a1: er1.utilidadBruta,
                        a5: er5.utilidadBruta,
                        pct: `Margen Bruto prom. ${fmtPct(prom.margenBruto)}`,
                        bg: "bg-teal-50/60 border-teal-200",
                      },
                      {
                        label: "(=) EBITDA (Caja Operativa)",
                        a1: er1.ebitda,
                        a5: er5.ebitda,
                        pct: `Margen EBITDA prom. ${fmtPct(prom.margenEbitda)}`,
                        bg: "bg-sky-50/60 border-sky-200",
                      },
                      {
                        label: "(=) Utilidad Operativa (EBIT)",
                        a1: er1.ebit,
                        a5: er5.ebit,
                        pct: `Margen EBIT prom. ${fmtPct(prom.margenOperativo)}`,
                        bg: "bg-indigo-50/60 border-indigo-200",
                      },
                      {
                        label: "(=) UTILIDAD NETA (Tras IUE 25%)",
                        a1: er1.utilidadNeta,
                        a5: er5.utilidadNeta,
                        pct: `Margen Neto prom. ${fmtPct(prom.margenNeto)}`,
                        bg: "bg-emerald-50/80 border-2 border-emerald-400",
                      },
                    ].map((row) => (
                      <div key={row.label} className={cn("rounded-xl border px-3.5 py-2", row.bg)}>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800">{row.label}</span>
                          <span className="text-[11px] font-semibold text-teal-800">{row.pct}</span>
                        </div>
                        <div className="mt-1 flex items-baseline justify-between font-mono">
                          <span className="text-xs text-slate-600">
                            Año 1: <strong className="text-slate-900">{formatearBolivianos(row.a1)}</strong>
                          </span>
                          <span className="text-xs text-slate-600">
                            Año 5: <strong className="text-emerald-800">{formatearBolivianos(row.a5)}</strong>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Derecha: Gráfico de evolución de Ingresos, EBITDA y Utilidad Neta */}
                <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                  <div className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Evolución de Ventas, EBITDA y Utilidad Neta (Años 1 a 5)
                  </div>
                  <div className="min-h-0 flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={ef.estadoResultados.map((e) => ({
                          anio: `Año ${e.anio}`,
                          Ventas: Math.round(e.ingresos),
                          EBITDA: Math.round(e.ebitda),
                          "Utilidad Neta": Math.round(e.utilidadNeta),
                        }))}
                      >
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis dataKey="anio" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${fmtNum(v / 1000, 0)}K`} />
                        <Tooltip formatter={(v: number) => formatearBolivianos(v)} />
                        <Legend wrapperStyle={{ fontSize: 12 }} />
                        <ReferenceLine y={0} stroke="#64748b" />
                        <Bar dataKey="Ventas" fill="#0d9488" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="EBITDA" fill="#0284c7" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Utilidad Neta" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </MarcoLaminaContable>
          )}

          {/* LÁMINA 4: FLUJOS DE EFECTIVO Y DEUDA */}
          {lamina.id === "flujos" && (
            <MarcoLaminaContable
              etiqueta={lamina.etiqueta}
              titulo={lamina.titulo}
              subtitulo="Comparación entre el flujo puro del proyecto (Económico) y el flujo real para los socios tras pagar deuda (Financiero)."
            >
              <div className="grid h-full min-h-0 grid-cols-1 gap-4 lg:grid-cols-[1fr_1.6fr]">
                <div className="flex flex-col justify-center gap-3">
                  <div className="rounded-2xl border border-teal-200 bg-teal-50/70 p-4">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Perspectiva Económica (Proyecto al WACC {fmtPct(ef.wacc)})
                    </div>
                    <div className="mt-1 font-mono text-2xl font-bold text-slate-900">
                      VAN: {formatearBolivianos(ef.vanProyecto)}
                    </div>
                    <div className="mt-0.5 text-xs font-semibold text-teal-800">
                      TIR Económica: {tirCalculable(ef.tirProyecto) ? fmtPct(ef.tirProyecto) : "No calculable"}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-indigo-200 bg-indigo-50/70 p-4">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Perspectiva Financiera (Accionista al Ke {fmtPct(ef.ke)})
                    </div>
                    <div className="mt-1 font-mono text-2xl font-bold text-slate-900">
                      VAN: {formatearBolivianos(ef.vanInversionista)}
                    </div>
                    <div className="mt-0.5 text-xs font-semibold text-indigo-800">
                      TIR Accionista: {tirCalculable(ef.tirInversionista) ? fmtPct(ef.tirInversionista) : "No calculable"}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Desendeudamiento Bancario (Año 0 → Año 5)
                    </div>
                    <div className="mt-1 font-mono text-lg font-bold text-slate-900">
                      {formatearBolivianos(ef.flujos[0].saldoDeudaFinAnio)} →{" "}
                      <span className="text-emerald-700">
                        {formatearBolivianos(ef.flujos[5].saldoDeudaFinAnio)}
                      </span>
                    </div>
                    <div className="mt-0.5 text-xs text-slate-600">
                      Cobertura prom. servicio de deuda (DSCR):{" "}
                      <strong>{fmtVeces(prom.coberturaServicioDeuda)}</strong>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                  <div className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Flujo Libre del Proyecto (FCL) vs. Flujo del Inversionista (FCA)
                  </div>
                  <div className="min-h-0 flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={ef.flujos.map((f) => ({
                          periodo: f.anio === 0 ? "Año 0" : `Año ${f.anio}`,
                          "Flujo Proyecto (FCL)": Math.round(f.flujoLibreProyecto),
                          "Flujo Inversionista (FCA)": Math.round(f.flujoInversionista),
                        }))}
                      >
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis dataKey="periodo" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${fmtNum(v / 1000, 0)}K`} />
                        <Tooltip formatter={(v: number) => formatearBolivianos(v)} />
                        <Legend wrapperStyle={{ fontSize: 12 }} />
                        <ReferenceLine y={0} stroke="#64748b" />
                        <Bar dataKey="Flujo Proyecto (FCL)" fill="#0d9488" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Flujo Inversionista (FCA)" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </MarcoLaminaContable>
          )}

          {/* LÁMINA 5: RATIOS Y SISTEMA DUPONT RESUMIDO */}
          {lamina.id === "dupont" && (
            <MarcoLaminaContable
              etiqueta={lamina.etiqueta}
              titulo={lamina.titulo}
              subtitulo="Descomposición de la rentabilidad patrimonial (Año 1) y síntesis de liquidez, solvencia y eficiencia (Promedio 5 años)."
            >
              <div className="flex h-full min-h-0 flex-col justify-between gap-4">
                {/* Arriba: Identidad DuPont grande */}
                <div className="rounded-2xl border-2 border-indigo-200 bg-white p-4 shadow-xs">
                  <div className="mb-2 text-xs font-bold uppercase tracking-wider text-indigo-700">
                    Identidad DuPont de 3 Factores (Año 1)
                  </div>
                  <div className="grid grid-cols-1 items-center gap-2 lg:grid-cols-[1.15fr_auto_1fr_auto_1fr_auto_1fr]">
                    <div className="rounded-xl border-2 border-indigo-600 bg-indigo-50 p-3 text-center">
                      <div className="text-[10px] font-bold uppercase text-indigo-800">
                        ROE (Rentabilidad Socios)
                      </div>
                      <div className="mt-0.5 font-mono text-2xl font-bold text-indigo-950">
                        {fmtPct(dp1.roe, 2)}
                      </div>
                      <div className="text-[11px] text-slate-600">Utilidad Neta / Patrimonio</div>
                    </div>
                    <div className="text-center font-mono text-2xl font-bold text-slate-400">=</div>
                    <div className="rounded-xl border border-emerald-300 bg-emerald-50/70 p-3 text-center">
                      <div className="text-[10px] font-bold uppercase text-emerald-800">
                        1 · Margen Neto (ROS)
                      </div>
                      <div className="mt-0.5 font-mono text-xl font-bold text-emerald-950">
                        {fmtPct(dp1.margenNeto, 2)}
                      </div>
                      <div className="text-[11px] text-slate-600">Utilidad Neta / Ventas</div>
                    </div>
                    <div className="text-center font-mono text-2xl font-bold text-slate-400">×</div>
                    <div className="rounded-xl border border-sky-300 bg-sky-50/70 p-3 text-center">
                      <div className="text-[10px] font-bold uppercase text-sky-800">
                        2 · Rotación de Activos
                      </div>
                      <div className="mt-0.5 font-mono text-xl font-bold text-sky-950">
                        {fmtNum(dp1.rotacionActivos, 2)}×
                      </div>
                      <div className="text-[11px] text-slate-600">Ventas / Activo Total</div>
                    </div>
                    <div className="text-center font-mono text-2xl font-bold text-slate-400">×</div>
                    <div className="rounded-xl border border-amber-300 bg-amber-50/70 p-3 text-center">
                      <div className="text-[10px] font-bold uppercase text-amber-900">
                        3 · Multiplicador Capital
                      </div>
                      <div className="mt-0.5 font-mono text-xl font-bold text-amber-950">
                        {fmtNum(dp1.multiplicadorCapital, 2)}×
                      </div>
                      <div className="text-[11px] text-slate-600">Activo Total / Patrimonio</div>
                    </div>
                  </div>
                </div>

                {/* Abajo: 4 tarjetas ejecutivas de ratios promedio */}
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Rentabilidad del Activo (ROA)
                    </div>
                    <div className="mt-1 font-mono text-2xl font-bold text-teal-800">
                      {fmtPct(prom.roaOperativo)}
                    </div>
                    <div className="mt-1 text-xs text-slate-600">
                      ROA Neto: <strong>{fmtPct(prom.roaNeto)}</strong> vs. WACC{" "}
                      <strong>{fmtPct(ef.wacc)}</strong>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Liquidez y Capital de Trabajo
                    </div>
                    <div className="mt-1 font-mono text-2xl font-bold text-sky-800">
                      {fmtVeces(prom.razonCorriente)}
                    </div>
                    <div className="mt-1 text-xs text-slate-600">
                      CTN prom.: <strong>{formatearBolivianos(prom.capitalTrabajoNeto)}</strong>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Endeudamiento (Pasivo / Activo)
                    </div>
                    <div className="mt-1 font-mono text-2xl font-bold text-amber-800">
                      {fmtPct(prom.endeudamientoActivo)}
                    </div>
                    <div className="mt-1 text-xs text-slate-600">
                      Deuda / Patrimonio: <strong>{fmtNum(prom.apalancamientoPatrimonio, 2)}×</strong>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Cobertura Servicio Deuda (DSCR)
                    </div>
                    <div className="mt-1 font-mono text-2xl font-bold text-emerald-800">
                      {fmtVeces(prom.coberturaServicioDeuda)}
                    </div>
                    <div className="mt-1 text-xs text-slate-600">
                      Cobertura intereses: <strong>{fmtVeces(prom.coberturaIntereses)}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </MarcoLaminaContable>
          )}
        </div>

        {/* Guía flotante para el expositor */}
        {mostrarGuia && (
          <div className="absolute bottom-5 left-1/2 z-30 w-[min(760px,92%)] -translate-x-1/2 rounded-xl border border-amber-300/40 bg-slate-950/95 p-4 text-sm text-slate-100 shadow-2xl backdrop-blur">
            <div className="mb-1 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-amber-300">
              <Lightbulb className="h-3.5 w-3.5" /> Qué decir al exponer esta lámina
            </div>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-200">{lamina.guia}</p>
          </div>
        )}
      </div>

      {/* Barra inferior */}
      <div className="flex h-14 shrink-0 items-center justify-between border-t border-white/10 bg-[#0b1322] px-4 md:px-6">
        <div className="text-xs font-medium text-slate-400">
          Diapositiva <span className="font-bold text-white">{indice + 1}</span> de{" "}
          <span className="font-bold text-white">{LAMINAS_EXPOSICION.length}</span>
          <span className="mx-2 text-slate-600">·</span>
          <span className="text-slate-300">{lamina.titulo}</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={indice <= 0}
            onClick={() => setIndice((i) => Math.max(0, i - 1))}
            className="flex items-center gap-1 rounded-full border border-white/15 px-4 py-1.5 text-xs font-semibold text-slate-200 hover:bg-white/10 disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" /> Anterior
          </button>
          <div className="hidden items-center gap-1.5 sm:flex">
            {LAMINAS_EXPOSICION.map((item, pos) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setIndice(pos)}
                className={cn(
                  "h-2 rounded-full transition-all",
                  pos === indice
                    ? "w-7 bg-teal-400"
                    : "w-2 bg-white/20 hover:bg-white/40"
                )}
                title={item.titulo}
              />
            ))}
          </div>
          <button
            type="button"
            disabled={indice >= LAMINAS_EXPOSICION.length - 1}
            onClick={() => setIndice((i) => Math.min(LAMINAS_EXPOSICION.length - 1, i + 1))}
            className="flex items-center gap-1.5 rounded-full bg-teal-500 px-4 py-1.5 text-xs font-bold text-slate-950 hover:bg-teal-400 disabled:opacity-30"
          >
            Siguiente <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function MarcoLaminaContable({
  etiqueta,
  titulo,
  subtitulo,
  children,
}: {
  etiqueta: string;
  titulo: string;
  subtitulo: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-[#faf8f5] px-5 py-4 text-slate-900">
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-700 via-emerald-600 to-indigo-700" />
      <div className="mb-3 shrink-0">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-teal-700" />
          <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
            {etiqueta}
          </span>
        </div>
        <h2 className="mt-0.5 font-display text-[clamp(18px,2vw,30px)] font-bold leading-tight tracking-tight text-slate-950">
          {titulo}
        </h2>
        <p className="mt-0.5 text-xs sm:text-sm text-slate-600 line-clamp-1">{subtitulo}</p>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
    </div>
  );
}

// ============================================================================
// 1. VISTA BALANCE DE APERTURA Y BALANCE GENERAL PROYECTADO
// ============================================================================
function VistaBalance({
  ef,
  nombreProyecto,
}: {
  ef: EstadosFinancierosProyecto;
  nombreProyecto: string;
}) {
  const b0 = ef.balanceApertura;
  const total0 = b0.totalActivo || 1;

  const datosGraficoEcuacion = ef.balances.map((b) => ({
    periodo: b.anio === 0 ? "Apertura" : `Año ${b.anio}`,
    "Activo Corriente": Math.round(b.totalActivoCorriente),
    "Activo No Corriente": Math.round(b.totalActivoNoCorriente),
    Pasivo: Math.round(b.totalPasivo),
    Patrimonio: Math.round(b.totalPatrimonio),
  }));

  return (
    <div className="space-y-5">
      {/* Hoja contable de Balance de Apertura (Año 0) en doble columna */}
      <div className="rounded-xl border-2 border-slate-300 bg-card p-5 shadow-xs dark:border-slate-700">
        <div className="border-b-2 border-slate-800 pb-3 text-center dark:border-slate-200">
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Estado Financiero Inicial
          </div>
          <h2 className="mt-0.5 font-display text-lg font-bold uppercase tracking-wide">
            BALANCE GENERAL DE APERTURA — {nombreProyecto}
          </h2>
          <div className="text-xs text-muted-foreground">
            Al inicio de operaciones (Año 0) · Expresado en Bolivianos (Bs) y Análisis Vertical (%)
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* COLUMNA IZQUIERDA: ACTIVO */}
          <div className="flex flex-col justify-between rounded-lg border border-border p-3.5">
            <div>
              <div className="border-b-2 border-emerald-700 pb-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                1. ACTIVO (Inversiones y Recursos)
              </div>

              <div className="mt-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                1.1 Activo Corriente (Disponibilidades)
              </div>
              <table className="mt-1 w-full text-xs">
                <tbody>
                  <FilaCuentaContable
                    codigo="1.1.01"
                    cuenta="Caja y Bancos (Capital de trabajo inicial)"
                    monto={b0.cajaYBancos}
                    pct={b0.cajaYBancos / total0}
                  />
                  <FilaSubtotalContable
                    etiqueta="Total Activo Corriente"
                    monto={b0.totalActivoCorriente}
                    pct={b0.totalActivoCorriente / total0}
                  />
                </tbody>
              </table>

              <div className="mt-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                1.2 Activo No Corriente (Bienes de Uso e Intangibles)
              </div>
              <table className="mt-1 w-full text-xs">
                <tbody>
                  <FilaCuentaContable
                    codigo="1.2.01"
                    cuenta="Terrenos"
                    monto={b0.terrenos}
                    pct={b0.terrenos / total0}
                  />
                  <FilaCuentaContable
                    codigo="1.2.02"
                    cuenta="Obras civiles y edificaciones"
                    monto={b0.obrasCiviles}
                    pct={b0.obrasCiviles / total0}
                  />
                  <FilaCuentaContable
                    codigo="1.2.03"
                    cuenta="Maquinaria y equipo"
                    monto={b0.maquinariaEquipo}
                    pct={b0.maquinariaEquipo / total0}
                  />
                  <FilaCuentaContable
                    codigo="1.2.04"
                    cuenta="Muebles, enseres y equipamiento"
                    monto={b0.mobiliarioEnseres}
                    pct={b0.mobiliarioEnseres / total0}
                  />
                  <FilaCuentaContable
                    codigo="1.2.05"
                    cuenta="Activo diferido / Gastos de organización"
                    monto={b0.activoDiferido}
                    pct={b0.activoDiferido / total0}
                  />
                  <FilaSubtotalContable
                    etiqueta="Total Activo No Corriente"
                    monto={b0.totalActivoNoCorriente}
                    pct={b0.totalActivoNoCorriente / total0}
                  />
                </tbody>
              </table>
            </div>

            <div className="mt-4 border-t-2 border-b-4 border-double border-slate-900 py-2 dark:border-slate-100">
              <div className="flex items-center justify-between font-mono text-sm font-bold">
                <span>TOTAL ACTIVO</span>
                <div className="flex items-center gap-4">
                  <span>{formatearBolivianos(b0.totalActivo)}</span>
                  <span className="w-14 text-right text-xs text-muted-foreground">100,0%</span>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: PASIVO Y PATRIMONIO */}
          <div className="flex flex-col justify-between rounded-lg border border-border p-3.5">
            <div>
              <div className="border-b-2 border-indigo-700 pb-1.5 text-xs font-bold uppercase tracking-wider text-indigo-800 dark:text-indigo-300">
                2. PASIVO Y 3. PATRIMONIO NETO (Fuentes de Financiamiento)
              </div>

              <div className="mt-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                2.1 Pasivo Corriente (Exigible a Corto Plazo ≤ 1 año)
              </div>
              <table className="mt-1 w-full text-xs">
                <tbody>
                  <FilaCuentaContable
                    codigo="2.1.01"
                    cuenta="Porción corriente de préstamos bancarios (Año 1)"
                    monto={b0.deudaCortoPlazo}
                    pct={b0.deudaCortoPlazo / total0}
                  />
                  <FilaSubtotalContable
                    etiqueta="Total Pasivo Corriente"
                    monto={b0.totalPasivoCorriente}
                    pct={b0.totalPasivoCorriente / total0}
                  />
                </tbody>
              </table>

              <div className="mt-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                2.2 Pasivo No Corriente (Exigible a Largo Plazo &gt; 1 año)
              </div>
              <table className="mt-1 w-full text-xs">
                <tbody>
                  <FilaCuentaContable
                    codigo="2.2.01"
                    cuenta="Préstamos bancarios a largo plazo"
                    monto={b0.deudaLargoPlazo}
                    pct={b0.deudaLargoPlazo / total0}
                  />
                  <FilaSubtotalContable
                    etiqueta="Total Pasivo No Corriente"
                    monto={b0.totalPasivoNoCorriente}
                    pct={b0.totalPasivoNoCorriente / total0}
                  />
                  <FilaSubtotalContable
                    etiqueta="TOTAL PASIVO (Deuda Total)"
                    monto={b0.totalPasivo}
                    pct={b0.totalPasivo / total0}
                    destacado
                  />
                </tbody>
              </table>

              <div className="mt-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                3. Patrimonio Neto (Capital Propio)
              </div>
              <table className="mt-1 w-full text-xs">
                <tbody>
                  <FilaCuentaContable
                    codigo="3.1.01"
                    cuenta="Capital Social / Aporte Propio de Socios"
                    monto={b0.capitalSocial}
                    pct={b0.capitalSocial / total0}
                  />
                  <FilaSubtotalContable
                    etiqueta="TOTAL PATRIMONIO NETO"
                    monto={b0.totalPatrimonio}
                    pct={b0.totalPatrimonio / total0}
                    destacado
                  />
                </tbody>
              </table>
            </div>

            <div className="mt-4 border-t-2 border-b-4 border-double border-slate-900 py-2 dark:border-slate-100">
              <div className="flex items-center justify-between font-mono text-sm font-bold">
                <span>TOTAL PASIVO Y PATRIMONIO</span>
                <div className="flex items-center gap-4">
                  <span>{formatearBolivianos(b0.totalPasivoYPatrimonio)}</span>
                  <span className="w-14 text-right text-xs text-muted-foreground">100,0%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {b0.creditoFiscalIVA > 0 && (
          <div className="mt-3 rounded-md border border-sky-500/30 bg-sky-500/10 px-3 py-2 text-xs text-sky-900 dark:text-sky-200">
            <strong>Nota tributaria (Bolivia):</strong> Las inversiones iniciales con factura generan un{" "}
            <strong>Crédito Fiscal IVA acumulado de {formatearBolivianos(b0.creditoFiscalIVA)}</strong>,
            que se compensa automáticamente contra el Débito Fiscal IVA de las ventas a partir del Año 1.
          </div>
        )}
      </div>

      {/* Gráficos del Balance */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-sm font-semibold">
            Evolución Patrimonial: Activos vs. Pasivo y Patrimonio (Años 0 a 5)
          </h3>
          <p className="mb-3 text-xs text-muted-foreground">
            Cómo crecen los recursos del proyecto a medida que se acumulan utilidades y se amortiza la deuda.
          </p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={datosGraficoEcuacion}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="periodo" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${fmtNum(v / 1000, 0)}K`} />
              <Tooltip formatter={(v: number) => formatearBolivianos(v)} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Activo Corriente" stackId="activo" fill="#10b981" />
              <Bar dataKey="Activo No Corriente" stackId="activo" fill="#0d9488" />
              <Bar dataKey="Pasivo" stackId="fuentes" fill="#f43f5e" />
              <Bar dataKey="Patrimonio" stackId="fuentes" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-sm font-semibold">
            Estructura de Inversión Inicial (Análisis Vertical Año 0)
          </h3>
          <p className="mb-3 text-xs text-muted-foreground">
            Distribución porcentual de cada rubro sobre el Activo Total de apertura ({formatearBolivianos(b0.totalActivo)}).
          </p>
          <div className="space-y-2.5">
            {ef.rubrosInversion
              .filter((r) => r.montoBruto > 0)
              .map((r) => (
                <div key={r.clave}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium">{r.etiqueta}</span>
                    <span className="font-mono font-semibold tabular-nums">
                      {formatearBolivianos(r.montoBruto)} ({fmtPct(r.porcentajeActivo)})
                    </span>
                  </div>
                  <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${Math.min(100, Math.max(2, r.porcentajeActivo * 100))}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Tabla evolutiva del Balance General Proyectado (Años 0 al 5) */}
      <div className="rounded-xl border border-border bg-card p-4">
        <h3 className="text-sm font-semibold">
          Balance General Proyectado (Años 0 al 5)
        </h3>
        <p className="mb-3 text-xs text-muted-foreground">
          Evolución contable anual de Activos, Pasivos y Patrimonio Neto con verificación de cuadre.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] border-collapse text-xs">
            <thead>
              <tr className="border-b-2 border-slate-700 bg-secondary/50 text-left dark:border-slate-300">
                <th className="py-2 px-2 font-bold">Cuenta Contable</th>
                {ef.balances.map((b) => (
                  <th key={b.anio} className="py-2 px-2 text-right font-mono font-bold">
                    {b.anio === 0 ? "Año 0 (Apertura)" : `Año ${b.anio}`}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 font-mono">
              <tr className="bg-emerald-500/10 font-sans font-bold text-emerald-900 dark:text-emerald-300">
                <td colSpan={7} className="py-1.5 px-2">1. ACTIVO</td>
              </tr>
              <tr>
                <td className="py-1.5 px-2 font-sans">Caja, Bancos y Capital Operativo</td>
                {ef.balances.map((b) => (
                  <td key={b.anio} className="py-1.5 px-2 text-right tabular-nums">
                    {formatearBolivianos(b.cajaYBancos)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-1.5 px-2 font-sans">Activo Fijo y Diferido Bruto</td>
                {ef.balances.map((b) => (
                  <td key={b.anio} className="py-1.5 px-2 text-right tabular-nums">
                    {formatearBolivianos(b.activoNoCorrienteBruto)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-1.5 px-2 font-sans text-muted-foreground">(-) Depreciación Acumulada</td>
                {ef.balances.map((b) => (
                  <td key={b.anio} className="py-1.5 px-2 text-right tabular-nums text-rose-600 dark:text-rose-400">
                    {b.depreciacionAcumulada > 0 ? `-${formatearBolivianos(b.depreciacionAcumulada)}` : "Bs 0"}
                  </td>
                ))}
              </tr>
              <tr className="border-t-2 border-slate-700 bg-secondary/40 font-bold dark:border-slate-300">
                <td className="py-2 px-2 font-sans">TOTAL ACTIVO</td>
                {ef.balances.map((b) => (
                  <td key={b.anio} className="py-2 px-2 text-right tabular-nums">
                    {formatearBolivianos(b.totalActivo)}
                  </td>
                ))}
              </tr>

              <tr className="bg-rose-500/10 font-sans font-bold text-rose-900 dark:text-rose-300">
                <td colSpan={7} className="py-1.5 px-2">2. PASIVO</td>
              </tr>
              <tr>
                <td className="py-1.5 px-2 font-sans">Deuda Bancaria Corto Plazo (Porción Corriente)</td>
                {ef.balances.map((b) => (
                  <td key={b.anio} className="py-1.5 px-2 text-right tabular-nums">
                    {formatearBolivianos(b.deudaCortoPlazo)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-1.5 px-2 font-sans">Deuda Bancaria Largo Plazo</td>
                {ef.balances.map((b) => (
                  <td key={b.anio} className="py-1.5 px-2 text-right tabular-nums">
                    {formatearBolivianos(b.deudaLargoPlazo)}
                  </td>
                ))}
              </tr>
              <tr className="bg-secondary/25 font-semibold">
                <td className="py-1.5 px-2 font-sans">TOTAL PASIVO</td>
                {ef.balances.map((b) => (
                  <td key={b.anio} className="py-1.5 px-2 text-right tabular-nums">
                    {formatearBolivianos(b.totalPasivo)}
                  </td>
                ))}
              </tr>

              <tr className="bg-indigo-500/10 font-sans font-bold text-indigo-900 dark:text-indigo-300">
                <td colSpan={7} className="py-1.5 px-2">3. PATRIMONIO NETO</td>
              </tr>
              <tr>
                <td className="py-1.5 px-2 font-sans">Capital Social / Aporte Propio</td>
                {ef.balances.map((b) => (
                  <td key={b.anio} className="py-1.5 px-2 text-right tabular-nums">
                    {formatearBolivianos(b.capitalSocial)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-1.5 px-2 font-sans">Resultados Acumulados (Utilidades Retenidas)</td>
                {ef.balances.map((b) => (
                  <td
                    key={b.anio}
                    className={cn(
                      "py-1.5 px-2 text-right tabular-nums",
                      b.resultadosAcumulados < 0 && "text-rose-600 dark:text-rose-400"
                    )}
                  >
                    {formatearBolivianos(b.resultadosAcumulados)}
                  </td>
                ))}
              </tr>
              <tr className="bg-secondary/25 font-semibold">
                <td className="py-1.5 px-2 font-sans">TOTAL PATRIMONIO NETO</td>
                {ef.balances.map((b) => (
                  <td key={b.anio} className="py-1.5 px-2 text-right tabular-nums">
                    {formatearBolivianos(b.totalPatrimonio)}
                  </td>
                ))}
              </tr>
              <tr className="border-t-2 border-b-4 border-double border-slate-900 bg-secondary/40 font-bold dark:border-slate-100">
                <td className="py-2 px-2 font-sans">TOTAL PASIVO Y PATRIMONIO</td>
                {ef.balances.map((b) => (
                  <td key={b.anio} className="py-2 px-2 text-right tabular-nums">
                    {formatearBolivianos(b.totalPasivoYPatrimonio)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 2. VISTA ESTADO DE RESULTADOS PROYECTADO (AÑOS 1..5)
// ============================================================================
function VistaEstadoResultados({
  ef,
  nombreProyecto,
}: {
  ef: EstadosFinancierosProyecto;
  nombreProyecto: string;
}) {
  const [anioCascada, setAnioCascada] = useState(1);
  const erSel = ef.estadoResultados[anioCascada - 1] ?? ef.estadoResultados[0];

  const datosCascada = [
    { etapa: "Ventas", monto: Math.round(erSel.ingresos), color: "#10b981" },
    { etapa: "Costo Ventas", monto: -Math.round(erSel.costoVentas), color: "#f43f5e" },
    { etapa: "Util. Bruta", monto: Math.round(erSel.utilidadBruta), color: "#0d9488" },
    { etapa: "Gastos Oper.", monto: -Math.round(erSel.totalGastosOperativos), color: "#fb7185" },
    { etapa: "EBITDA", monto: Math.round(erSel.ebitda), color: "#0284c7" },
    { etapa: "Deprec.", monto: -Math.round(erSel.depreciacion), color: "#f59e0b" },
    { etapa: "EBIT", monto: Math.round(erSel.ebit), color: "#4f46e5" },
    { etapa: "Intereses + IUE", monto: -Math.round(erSel.intereses + erSel.iue), color: "#e11d48" },
    { etapa: "Util. Neta", monto: Math.round(erSel.utilidadNeta), color: erSel.utilidadNeta >= 0 ? "#059669" : "#dc2626" },
  ];

  const datosMargenes = ef.estadoResultados.map((er) => ({
    anio: `Año ${er.anio}`,
    "Margen Bruto": Number((er.margenBruto * 100).toFixed(1)),
    "Margen EBITDA": Number((er.margenEbitda * 100).toFixed(1)),
    "Margen EBIT": Number((er.margenOperativo * 100).toFixed(1)),
    "Margen Neto": Number((er.margenNeto * 100).toFixed(1)),
  }));

  return (
    <div className="space-y-5">
      {/* Hoja contable del Estado de Resultados */}
      <div className="rounded-xl border-2 border-slate-300 bg-card p-5 shadow-xs dark:border-slate-700">
        <div className="border-b-2 border-slate-800 pb-3 text-center dark:border-slate-200">
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Estado de Rendimiento Económico
          </div>
          <h2 className="mt-0.5 font-display text-lg font-bold uppercase tracking-wide">
            ESTADO DE RESULTADOS PROYECTADO — {nombreProyecto}
          </h2>
          <div className="text-xs text-muted-foreground">
            Años 1 al 5 · Expresado en Bolivianos (Bs) con Análisis Vertical (% sobre Ventas)
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-xs">
            <thead>
              <tr className="border-b-2 border-slate-800 bg-secondary/50 dark:border-slate-200">
                <th className="py-2 px-2 text-left font-bold">Concepto Contable</th>
                {ef.estadoResultados.map((er) => (
                  <th key={er.anio} className="py-2 px-2 text-right font-mono font-bold">
                    Año {er.anio} (Bs · % Vtas)
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 font-mono">
              <FilaEERR
                etiqueta="(+) Ingresos por Ventas / Servicios"
                datos={ef.estadoResultados}
                valor={(e) => e.ingresos}
                destacado
              />
              <FilaEERR
                etiqueta="(-) Costo de Ventas / Producción directa"
                datos={ef.estadoResultados}
                valor={(e) => -e.costoVentas}
                negativo
              />
              <FilaEERR
                etiqueta="(=) UTILIDAD BRUTA EN VENTAS"
                datos={ef.estadoResultados}
                valor={(e) => e.utilidadBruta}
                subtotal
              />
              <FilaEERR
                etiqueta="(-) Gastos de Administración"
                datos={ef.estadoResultados}
                valor={(e) => -e.gastosAdmin}
                negativo
              />
              <FilaEERR
                etiqueta="(-) Gastos de Comercialización y Marketing"
                datos={ef.estadoResultados}
                valor={(e) => -e.gastosComerc}
                negativo
              />
              <FilaEERR
                etiqueta="(-) Sueldos, Salarios y Cargas Sociales (30,37%)"
                datos={ef.estadoResultados}
                valor={(e) => -e.gastosPersonal}
                negativo
              />
              <FilaEERR
                etiqueta="(-) Imprevistos Operativos"
                datos={ef.estadoResultados}
                valor={(e) => -e.imprevistos}
                negativo
              />
              <FilaEERR
                etiqueta="(-) Impuesto a las Transacciones — IT (3% neto)"
                datos={ef.estadoResultados}
                valor={(e) => -e.impuestoTransacciones}
                negativo
              />
              <FilaEERR
                etiqueta="(=) EBITDA (Resultado Operativo de Caja)"
                datos={ef.estadoResultados}
                valor={(e) => e.ebitda}
                subtotal
              />
              <FilaEERR
                etiqueta="(-) Depreciación y Amortización de Activos"
                datos={ef.estadoResultados}
                valor={(e) => -e.depreciacion}
                negativo
              />
              <FilaEERR
                etiqueta="(=) UTILIDAD OPERATIVA (EBIT / UAII)"
                datos={ef.estadoResultados}
                valor={(e) => e.ebit}
                subtotal
              />
              <FilaEERR
                etiqueta="(-) Gastos Financieros (Intereses Bancarios)"
                datos={ef.estadoResultados}
                valor={(e) => -e.intereses}
                negativo
              />
              <FilaEERR
                etiqueta="(=) UTILIDAD ANTES DE IMPUESTOS (EBT / UAI)"
                datos={ef.estadoResultados}
                valor={(e) => e.ebt}
                subtotal
              />
              <FilaEERR
                etiqueta="(-) Impuesto sobre las Utilidades — IUE (25%)"
                datos={ef.estadoResultados}
                valor={(e) => -e.iue}
                negativo
              />
              <FilaEERR
                etiqueta="(=) UTILIDAD NETA DEL EJERCICIO"
                datos={ef.estadoResultados}
                valor={(e) => e.utilidadNeta}
                totalFinal
              />
            </tbody>
          </table>
        </div>
      </div>

      {/* Gráficos del Estado de Resultados */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold">
                Cascada de Resultados (Año {anioCascada})
              </h3>
              <p className="text-xs text-muted-foreground">
                De los Ingresos por Ventas hasta la Utilidad Neta final.
              </p>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAnioCascada(a)}
                  className={cn(
                    "rounded px-2 py-1 text-xs font-semibold",
                    anioCascada === a
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  )}
                >
                  A{a}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-3">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={datosCascada}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="etiqueta" hide />
                <XAxis dataKey="etapa" tick={{ fontSize: 10 }} interval={0} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${fmtNum(v / 1000, 0)}K`} />
                <Tooltip formatter={(v: number) => formatearBolivianos(v)} />
                <ReferenceLine y={0} stroke="#64748b" />
                <Bar dataKey="monto">
                  {datosCascada.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-sm font-semibold">
            Evolución de Márgenes Contables (% sobre Ventas)
          </h3>
          <p className="mb-3 text-xs text-muted-foreground">
            Comparativa de Margen Bruto, EBITDA, Operativo (EBIT) y Neto del Año 1 al 5.
          </p>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={datosMargenes}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="anio" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
              <Tooltip formatter={(v: number) => `${fmtNum(v, 1)}%`} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />
              <Line type="monotone" dataKey="Margen Bruto" stroke="#0d9488" strokeWidth={2} />
              <Line type="monotone" dataKey="Margen EBITDA" stroke="#0284c7" strokeWidth={2} />
              <Line type="monotone" dataKey="Margen EBIT" stroke="#4f46e5" strokeWidth={2} />
              <Line type="monotone" dataKey="Margen Neto" stroke="#10b981" strokeWidth={2.5} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 3. VISTA FLUJOS DE EFECTIVO CONTABLES (OPERACIÓN, INVERSIÓN, FINANCIAMIENTO)
// ============================================================================
function VistaFlujosContables({ ef }: { ef: EstadosFinancierosProyecto }) {
  const datosFlujos = ef.flujos.map((f) => ({
    periodo: f.anio === 0 ? "Año 0" : `Año ${f.anio}`,
    "Flujo Proyecto (FCL)": Math.round(f.flujoLibreProyecto),
    "Flujo Inversionista (FCA)": Math.round(f.flujoInversionista),
    "Saldo Deuda": Math.round(f.saldoDeudaFinAnio),
  }));

  return (
    <div className="space-y-5">
      {/* Comparativa Económica vs Financiera */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-3.5">
          <div className="text-[11px] font-semibold uppercase text-muted-foreground">
            VAN Económico (Proyecto al WACC {fmtPct(ef.wacc)})
          </div>
          <div className={cn("mt-1 font-mono text-lg font-bold", ef.vanProyecto >= 0 ? "text-emerald-600" : "text-rose-600")}>
            {formatearBolivianos(ef.vanProyecto)}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-3.5">
          <div className="text-[11px] font-semibold uppercase text-muted-foreground">
            TIR Económica (Proyecto)
          </div>
          <div className="mt-1 font-mono text-lg font-bold">
            {tirCalculable(ef.tirProyecto) ? fmtPct(ef.tirProyecto) : "No calculable"}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-3.5">
          <div className="text-[11px] font-semibold uppercase text-muted-foreground">
            VAN Financiero (Inversionista al Ke {fmtPct(ef.ke)})
          </div>
          <div className={cn("mt-1 font-mono text-lg font-bold", ef.vanInversionista >= 0 ? "text-emerald-600" : "text-rose-600")}>
            {formatearBolivianos(ef.vanInversionista)}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-3.5">
          <div className="text-[11px] font-semibold uppercase text-muted-foreground">
            TIR Financiera (Inversionista)
          </div>
          <div className="mt-1 font-mono text-lg font-bold">
            {tirCalculable(ef.tirInversionista) ? fmtPct(ef.tirInversionista) : "No calculable"}
          </div>
        </div>
      </div>

      {/* Tabla contable de Flujos por Actividades */}
      <div className="rounded-xl border-2 border-slate-300 bg-card p-5 shadow-xs dark:border-slate-700">
        <div className="border-b-2 border-slate-800 pb-3 text-center dark:border-slate-200">
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Movimiento de Tesorería por Actividades
          </div>
          <h2 className="mt-0.5 font-display text-lg font-bold uppercase tracking-wide">
            ESTADO DE FLUJOS DE EFECTIVO PROYECTADO (AÑOS 0 AL 5)
          </h2>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-xs">
            <thead>
              <tr className="border-b-2 border-slate-800 bg-secondary/50 dark:border-slate-200">
                <th className="py-2 px-2 text-left font-bold">Actividad / Partida de Efectivo</th>
                {ef.flujos.map((f) => (
                  <th key={f.anio} className="py-2 px-2 text-right font-mono font-bold">
                    {f.etiqueta}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 font-mono">
              <tr className="bg-emerald-500/10 font-sans font-bold text-emerald-900 dark:text-emerald-300">
                <td colSpan={7} className="py-1.5 px-2">I. ACTIVIDADES DE OPERACIÓN</td>
              </tr>
              <tr>
                <td className="py-1.5 px-2 font-sans">(+) Utilidad Neta del Ejercicio</td>
                {ef.flujos.map((f) => (
                  <td key={f.anio} className="py-1.5 px-2 text-right tabular-nums">
                    {formatearBolivianos(f.utilidadNeta)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-1.5 px-2 font-sans">(+) Depreciación y Amortización (partida no monetaria)</td>
                {ef.flujos.map((f) => (
                  <td key={f.anio} className="py-1.5 px-2 text-right tabular-nums">
                    {formatearBolivianos(f.masDepreciacion)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-1.5 px-2 font-sans">(-) Pago neto de IVA a Impuestos Nacionales</td>
                {ef.flujos.map((f) => (
                  <td key={f.anio} className="py-1.5 px-2 text-right tabular-nums">
                    {formatearBolivianos(f.menosPagoNetoIVA)}
                  </td>
                ))}
              </tr>
              <tr className="bg-secondary/30 font-bold">
                <td className="py-1.5 px-2 font-sans">(=) Flujo de Efectivo Operativo</td>
                {ef.flujos.map((f) => (
                  <td key={f.anio} className="py-1.5 px-2 text-right tabular-nums">
                    {formatearBolivianos(f.flujoOperativo)}
                  </td>
                ))}
              </tr>

              <tr className="bg-sky-500/10 font-sans font-bold text-sky-900 dark:text-sky-300">
                <td colSpan={7} className="py-1.5 px-2">II. ACTIVIDADES DE INVERSIÓN</td>
              </tr>
              <tr>
                <td className="py-1.5 px-2 font-sans">(-) Adquisición de Activos Fijos y Diferidos</td>
                {ef.flujos.map((f) => (
                  <td key={f.anio} className="py-1.5 px-2 text-right tabular-nums">
                    {formatearBolivianos(f.inversionActivosFijos)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-1.5 px-2 font-sans">(-) Inversión en Capital de Trabajo</td>
                {ef.flujos.map((f) => (
                  <td key={f.anio} className="py-1.5 px-2 text-right tabular-nums">
                    {formatearBolivianos(f.inversionCapitalTrabajo)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-1.5 px-2 font-sans">(-) Reposición de Activos por Vida Útil</td>
                {ef.flujos.map((f) => (
                  <td key={f.anio} className="py-1.5 px-2 text-right tabular-nums">
                    {formatearBolivianos(f.reinversionActivos)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-1.5 px-2 font-sans">(+) Recuperación de Valor Residual y Capital de Trabajo</td>
                {ef.flujos.map((f) => (
                  <td key={f.anio} className="py-1.5 px-2 text-right tabular-nums">
                    {formatearBolivianos(f.recuperacionValorResidual + f.recuperacionCapitalTrabajo)}
                  </td>
                ))}
              </tr>
              <tr className="bg-secondary/30 font-bold">
                <td className="py-1.5 px-2 font-sans">(=) Flujo de Efectivo de Inversión</td>
                {ef.flujos.map((f) => (
                  <td key={f.anio} className="py-1.5 px-2 text-right tabular-nums">
                    {formatearBolivianos(f.flujoInversion)}
                  </td>
                ))}
              </tr>

              <tr className="bg-indigo-500/10 font-sans font-bold text-indigo-900 dark:text-indigo-300">
                <td colSpan={7} className="py-1.5 px-2">III. ACTIVIDADES DE FINANCIAMIENTO Y SÍNTESIS</td>
              </tr>
              <tr>
                <td className="py-1.5 px-2 font-sans">(+) Desembolso Préstamo / (-) Amortización de Capital</td>
                {ef.flujos.map((f) => (
                  <td key={f.anio} className="py-1.5 px-2 text-right tabular-nums">
                    {formatearBolivianos(f.flujoFinanciamientoCapital)}
                  </td>
                ))}
              </tr>
              <tr className="border-t-2 border-slate-700 bg-secondary/40 font-bold dark:border-slate-300">
                <td className="py-2 px-2 font-sans">FLUJO DE CAJA LIBRE DEL PROYECTO (Económico)</td>
                {ef.flujos.map((f) => (
                  <td
                    key={f.anio}
                    className={cn(
                      "py-2 px-2 text-right tabular-nums",
                      f.flujoLibreProyecto < 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-700 dark:text-emerald-400"
                    )}
                  >
                    {formatearBolivianos(f.flujoLibreProyecto)}
                  </td>
                ))}
              </tr>
              <tr className="border-b-4 border-double border-slate-900 bg-primary/10 font-bold dark:border-slate-100">
                <td className="py-2 px-2 font-sans">FLUJO DE CAJA DEL INVERSIONISTA (Financiero)</td>
                {ef.flujos.map((f) => (
                  <td
                    key={f.anio}
                    className={cn(
                      "py-2 px-2 text-right tabular-nums",
                      f.flujoInversionista < 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-700 dark:text-emerald-400"
                    )}
                  >
                    {formatearBolivianos(f.flujoInversionista)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Gráficos de Flujos y Deuda */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-sm font-semibold">
            Flujo del Proyecto (FCL) vs. Flujo del Inversionista (FCA)
          </h3>
          <p className="mb-3 text-xs text-muted-foreground">
            Efecto del apalancamiento bancario sobre el desembolso inicial y los flujos anuales.
          </p>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={datosFlujos}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="periodo" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${fmtNum(v / 1000, 0)}K`} />
              <Tooltip formatter={(v: number) => formatearBolivianos(v)} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <ReferenceLine y={0} stroke="#64748b" />
              <Bar dataKey="Flujo Proyecto (FCL)" fill="#0d9488" />
              <Bar dataKey="Flujo Inversionista (FCA)" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="text-sm font-semibold">
            Cronograma de Desendeudamiento (Saldo Vivo de Deuda)
          </h3>
          <p className="mb-3 text-xs text-muted-foreground">
            Reducción del saldo de capital bancario del Año 0 al Año 5.
          </p>
          <ResponsiveContainer width="100%" height={230}>
            <LineChart data={datosFlujos}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="periodo" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${fmtNum(v / 1000, 0)}K`} />
              <Tooltip formatter={(v: number) => formatearBolivianos(v)} />
              <Line
                type="monotone"
                dataKey="Saldo Deuda"
                stroke="#e11d48"
                strokeWidth={2.5}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 4. VISTA RATIOS FINANCIEROS Y SISTEMA DUPONT VISUAL
// ============================================================================
function VistaRatiosYDuPont({ ef }: { ef: EstadosFinancierosProyecto }) {
  const [anioDuPont, setAnioDuPont] = useState(1);
  const dp = ef.dupontPorAnio[anioDuPont - 1] ?? ef.dupontPorAnio[0];

  const datosRentabilidad = ef.ratios.map((r) => ({
    anio: `Año ${r.anio}`,
    ROE: Number((r.roe * 100).toFixed(1)),
    "ROA Neto": Number((r.roaNeto * 100).toFixed(1)),
    "ROA Operativo": Number((r.roaOperativo * 100).toFixed(1)),
    WACC: Number((ef.wacc * 100).toFixed(1)),
  }));

  return (
    <div className="space-y-5">
      {/* Diagrama Visual del Sistema DuPont */}
      <div className="rounded-xl border-2 border-indigo-500/30 bg-card p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              <GitBranch className="h-4 w-4" />
              Figura Contable · Descomposición del ROE (Identidad DuPont de 3 Factores)
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Explica si la rentabilidad del accionista proviene del margen comercial, de la rotación de activos o del apalancamiento.
            </p>
          </div>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAnioDuPont(a)}
                className={cn(
                  "rounded px-2.5 py-1 text-xs font-semibold",
                  anioDuPont === a
                    ? "bg-indigo-600 text-white"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                )}
              >
                Año {a}
              </button>
            ))}
          </div>
        </div>

        {/* Cajas conectadas de la Identidad DuPont */}
        <div className="mt-4 grid grid-cols-1 items-center gap-3 lg:grid-cols-[1.15fr_auto_1fr_auto_1fr_auto_1fr]">
          {/* ROE */}
          <div className="rounded-xl border-2 border-indigo-600 bg-indigo-500/10 p-3.5 text-center">
            <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
              Rentabilidad Patrimonial (ROE)
            </div>
            <div className="mt-1 font-mono text-2xl font-bold text-indigo-900 dark:text-indigo-100">
              {fmtPct(dp.roe, 2)}
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground font-mono">
              {formatearBolivianos(dp.utilidadNeta)} ÷ {formatearBolivianos(dp.patrimonioNeto)}
            </div>
          </div>

          <div className="text-center font-mono text-xl font-bold text-muted-foreground">=</div>

          {/* Factor 1: Margen Neto */}
          <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3.5 text-center">
            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
              1 · Margen Neto (ROS)
            </div>
            <div className="mt-1 font-mono text-xl font-bold text-emerald-900 dark:text-emerald-100">
              {fmtPct(dp.margenNeto, 2)}
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground">
              Utilidad Neta ÷ Ventas
            </div>
            <div className="text-[10px] font-mono text-muted-foreground">
              {formatearBolivianos(dp.utilidadNeta)} ÷ {formatearBolivianos(dp.ventas)}
            </div>
          </div>

          <div className="text-center font-mono text-xl font-bold text-muted-foreground">×</div>

          {/* Factor 2: Rotación de Activos */}
          <div className="rounded-xl border border-sky-500/40 bg-sky-500/10 p-3.5 text-center">
            <div className="text-[10px] font-bold uppercase tracking-wider text-sky-800 dark:text-sky-300">
              2 · Rotación de Activos
            </div>
            <div className="mt-1 font-mono text-xl font-bold text-sky-900 dark:text-sky-100">
              {fmtNum(dp.rotacionActivos, 2)}×
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground">
              Ventas ÷ Activo Total
            </div>
            <div className="text-[10px] font-mono text-muted-foreground">
              {formatearBolivianos(dp.ventas)} ÷ {formatearBolivianos(dp.activoTotal)}
            </div>
          </div>

          <div className="text-center font-mono text-xl font-bold text-muted-foreground">×</div>

          {/* Factor 3: Multiplicador de Capital */}
          <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3.5 text-center">
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
              3 · Multiplicador Capital
            </div>
            <div className="mt-1 font-mono text-xl font-bold text-amber-900 dark:text-amber-100">
              {fmtNum(dp.multiplicadorCapital, 2)}×
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground">
              Activo Total ÷ Patrimonio
            </div>
            <div className="text-[10px] font-mono text-muted-foreground">
              {formatearBolivianos(dp.activoTotal)} ÷ {formatearBolivianos(dp.patrimonioNeto)}
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico ROE vs ROA vs WACC */}
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">
            Creación de Valor: ROE y ROA frente al Costo de Capital (WACC {fmtPct(ef.wacc)})
          </h3>
        </div>
        <p className="mb-3 text-xs text-muted-foreground">
          Cuando el ROA Operativo supera al WACC, el endeudamiento genera apalancamiento financiero positivo y eleva el ROE.
        </p>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={datosRentabilidad}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="anio" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
            <Tooltip formatter={(v: number) => `${fmtNum(v, 1)}%`} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <ReferenceLine y={0} stroke="#94a3b8" />
            <Line type="monotone" dataKey="ROE" stroke="#4f46e5" strokeWidth={2.5} />
            <Line type="monotone" dataKey="ROA Operativo" stroke="#0d9488" strokeWidth={2} />
            <Line type="monotone" dataKey="ROA Neto" stroke="#10b981" strokeWidth={2} />
            <Line type="monotone" dataKey="WACC" stroke="#f43f5e" strokeDasharray="4 3" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Tabla Integral de Ratios Financieros */}
      <div className="rounded-xl border-2 border-slate-300 bg-card p-5 shadow-xs dark:border-slate-700">
        <h3 className="text-sm font-bold uppercase tracking-wide">
          Cuadro Integral de Ratios Financieros (Años 1 al 5 y Promedio)
        </h3>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[780px] border-collapse text-xs">
            <thead>
              <tr className="border-b-2 border-slate-800 bg-secondary/50 dark:border-slate-200">
                <th className="py-2 px-2 text-left font-bold">Ratio / Indicador</th>
                <th className="py-2 px-2 text-left font-semibold text-muted-foreground">Fórmula</th>
                {ef.ratios.map((r) => (
                  <th key={r.anio} className="py-2 px-2 text-right font-mono font-bold">
                    Año {r.anio}
                  </th>
                ))}
                <th className="py-2 px-2 text-right font-mono font-bold text-primary">Promedio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 font-mono">
              <tr className="bg-emerald-500/10 font-sans font-bold text-emerald-900 dark:text-emerald-300">
                <td colSpan={8} className="py-1.5 px-2">1. RATIOS DE RENTABILIDAD</td>
              </tr>
              <FilaRatio
                nombre="Margen Bruto"
                formula="Utilidad Bruta / Ventas"
                valores={ef.ratios.map((r) => fmtPct(r.margenBruto))}
                promedio={fmtPct(ef.ratiosPromedio.margenBruto)}
              />
              <FilaRatio
                nombre="Margen EBITDA"
                formula="EBITDA / Ventas"
                valores={ef.ratios.map((r) => fmtPct(r.margenEbitda))}
                promedio={fmtPct(ef.ratiosPromedio.margenEbitda)}
              />
              <FilaRatio
                nombre="Margen Operativo (EBIT)"
                formula="EBIT / Ventas"
                valores={ef.ratios.map((r) => fmtPct(r.margenOperativo))}
                promedio={fmtPct(ef.ratiosPromedio.margenOperativo)}
              />
              <FilaRatio
                nombre="Margen Neto (ROS)"
                formula="Utilidad Neta / Ventas"
                valores={ef.ratios.map((r) => fmtPct(r.margenNeto))}
                promedio={fmtPct(ef.ratiosPromedio.margenNeto)}
              />
              <FilaRatio
                nombre="ROA Operativo"
                formula="EBIT / Activo Total"
                valores={ef.ratios.map((r) => fmtPct(r.roaOperativo))}
                promedio={fmtPct(ef.ratiosPromedio.roaOperativo)}
              />
              <FilaRatio
                nombre="ROA Neto (Return on Assets)"
                formula="Utilidad Neta / Activo Total"
                valores={ef.ratios.map((r) => fmtPct(r.roaNeto))}
                promedio={fmtPct(ef.ratiosPromedio.roaNeto)}
              />
              <FilaRatio
                nombre="ROE (Return on Equity)"
                formula="Utilidad Neta / Patrimonio"
                valores={ef.ratios.map((r) => fmtPct(r.roe))}
                promedio={fmtPct(ef.ratiosPromedio.roe)}
              />

              <tr className="bg-sky-500/10 font-sans font-bold text-sky-900 dark:text-sky-300">
                <td colSpan={8} className="py-1.5 px-2">2. RATIOS DE LIQUIDEZ Y CAPITAL DE TRABAJO</td>
              </tr>
              <FilaRatio
                nombre="Capital de Trabajo Neto (CTN)"
                formula="Activo Corriente − Pasivo Corriente"
                valores={ef.ratios.map((r) => formatearBolivianos(r.capitalTrabajoNeto))}
                promedio={formatearBolivianos(ef.ratiosPromedio.capitalTrabajoNeto)}
              />
              <FilaRatio
                nombre="Razón Corriente (Liquidez General)"
                formula="Activo Corriente / Pasivo Corriente"
                valores={ef.ratios.map((r) => fmtVeces(r.razonCorriente))}
                promedio={fmtVeces(ef.ratiosPromedio.razonCorriente)}
              />

              <tr className="bg-amber-500/10 font-sans font-bold text-amber-900 dark:text-amber-300">
                <td colSpan={8} className="py-1.5 px-2">3. RATIOS DE ENDEUDAMIENTO Y SOLVENCIA</td>
              </tr>
              <FilaRatio
                nombre="Razón de Endeudamiento"
                formula="Pasivo Total / Activo Total"
                valores={ef.ratios.map((r) => fmtPct(r.endeudamientoActivo))}
                promedio={fmtPct(ef.ratiosPromedio.endeudamientoActivo)}
              />
              <FilaRatio
                nombre="Apalancamiento Patrimonial (D/E)"
                formula="Pasivo Total / Patrimonio"
                valores={ef.ratios.map((r) => `${fmtNum(r.apalancamientoPatrimonio, 2)}×`)}
                promedio={`${fmtNum(ef.ratiosPromedio.apalancamientoPatrimonio, 2)}×`}
              />
              <FilaRatio
                nombre="Multiplicador de Capital"
                formula="Activo Total / Patrimonio"
                valores={ef.ratios.map((r) => `${fmtNum(r.multiplicadorCapital, 2)}×`)}
                promedio={`${fmtNum(ef.ratiosPromedio.multiplicadorCapital, 2)}×`}
              />
              <FilaRatio
                nombre="Cobertura de Intereses"
                formula="EBIT / Intereses"
                valores={ef.ratios.map((r) => fmtVeces(r.coberturaIntereses))}
                promedio={fmtVeces(ef.ratiosPromedio.coberturaIntereses)}
              />
              <FilaRatio
                nombre="Cobertura Servicio de Deuda (DSCR)"
                formula="EBITDA / (Intereses + Amortización)"
                valores={ef.ratios.map((r) => fmtVeces(r.coberturaServicioDeuda))}
                promedio={fmtVeces(ef.ratiosPromedio.coberturaServicioDeuda)}
              />

              <tr className="bg-indigo-500/10 font-sans font-bold text-indigo-900 dark:text-indigo-300">
                <td colSpan={8} className="py-1.5 px-2">4. RATIOS DE EFICIENCIA Y ACTIVIDAD</td>
              </tr>
              <FilaRatio
                nombre="Rotación de Activos Totales"
                formula="Ventas / Activo Total"
                valores={ef.ratios.map((r) => `${fmtNum(r.rotacionActivos, 2)}×`)}
                promedio={`${fmtNum(ef.ratiosPromedio.rotacionActivos, 2)}×`}
              />
              <FilaRatio
                nombre="Rotación de Activo Fijo"
                formula="Ventas / Activo No Corriente Neto"
                valores={ef.ratios.map((r) => `${fmtNum(r.rotacionActivoFijo, 2)}×`)}
                promedio={`${fmtNum(ef.ratiosPromedio.rotacionActivoFijo, 2)}×`}
              />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SUBCOMPONENTES DE TABLA CON ESTÉTICA CONTABLE
// ============================================================================
function FilaCuentaContable({
  codigo,
  cuenta,
  monto,
  pct,
}: {
  codigo: string;
  cuenta: string;
  monto: number;
  pct: number;
}) {
  return (
    <tr className="border-b border-border/40">
      <td className="py-1 pr-2 font-mono text-[11px] text-muted-foreground">{codigo}</td>
      <td className="py-1 pr-2">{cuenta}</td>
      <td className="py-1 text-right font-mono tabular-nums">{formatearBolivianos(monto)}</td>
      <td className="w-14 py-1 pl-2 text-right font-mono text-[11px] text-muted-foreground tabular-nums">
        {fmtPct(pct)}
      </td>
    </tr>
  );
}

function FilaSubtotalContable({
  etiqueta,
  monto,
  pct,
  destacado,
}: {
  etiqueta: string;
  monto: number;
  pct: number;
  destacado?: boolean;
}) {
  return (
    <tr
      className={cn(
        "border-t border-slate-400 font-semibold dark:border-slate-600",
        destacado && "bg-secondary/40 font-bold"
      )}
    >
      <td colSpan={2} className="py-1.5 pr-2">
        {etiqueta}
      </td>
      <td className="py-1.5 text-right font-mono tabular-nums">{formatearBolivianos(monto)}</td>
      <td className="w-14 py-1.5 pl-2 text-right font-mono text-[11px] text-muted-foreground tabular-nums">
        {fmtPct(pct)}
      </td>
    </tr>
  );
}

function FilaEERR({
  etiqueta,
  datos,
  valor,
  negativo,
  subtotal,
  destacado,
  totalFinal,
}: {
  etiqueta: string;
  datos: EstadosFinancierosProyecto["estadoResultados"];
  valor: (e: EstadosFinancierosProyecto["estadoResultados"][number]) => number;
  negativo?: boolean;
  subtotal?: boolean;
  destacado?: boolean;
  totalFinal?: boolean;
}) {
  return (
    <tr
      className={cn(
        subtotal && "border-t border-slate-500 bg-secondary/35 font-bold dark:border-slate-400",
        destacado && "font-semibold",
        totalFinal &&
          "border-t-2 border-b-4 border-double border-slate-900 bg-emerald-500/10 font-bold dark:border-slate-100"
      )}
    >
      <td className="py-1.5 px-2 font-sans">{etiqueta}</td>
      {datos.map((e) => {
        const v = valor(e);
        const pct = e.ingresos > 0 ? Math.abs(v) / e.ingresos : 0;
        return (
          <td
            key={e.anio}
            className={cn(
              "py-1.5 px-2 text-right tabular-nums",
              negativo && v < 0 && "text-muted-foreground",
              (subtotal || totalFinal) && v < 0 && "text-rose-600 dark:text-rose-400",
              totalFinal && v >= 0 && "text-emerald-700 dark:text-emerald-400"
            )}
          >
            <div>{formatearBolivianos(v)}</div>
            <div className="text-[10px] font-normal text-muted-foreground">
              {e.ingresos > 0 ? `${v < 0 ? "-" : ""}${fmtNum(pct * 100, 1)}%` : "—"}
            </div>
          </td>
        );
      })}
    </tr>
  );
}

function FilaRatio({
  nombre,
  formula,
  valores,
  promedio,
}: {
  nombre: string;
  formula: string;
  valores: string[];
  promedio: string;
}) {
  return (
    <tr>
      <td className="py-1.5 px-2 font-sans font-medium">{nombre}</td>
      <td className="py-1.5 px-2 font-sans text-[11px] text-muted-foreground">{formula}</td>
      {valores.map((v, idx) => (
        <td key={idx} className="py-1.5 px-2 text-right tabular-nums">
          {v}
        </td>
      ))}
      <td className="py-1.5 px-2 text-right font-bold text-primary tabular-nums">{promedio}</td>
    </tr>
  );
}
