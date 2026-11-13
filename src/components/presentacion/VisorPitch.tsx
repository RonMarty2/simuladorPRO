import { fmtNum } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileSpreadsheet,
  Gauge,
  Lightbulb,
  Maximize2,
  MapPin,
  Minimize2,
  RotateCcw,
  SlidersHorizontal,
  Target,
  Users,
  X,
} from "lucide-react";
import { tirCalculable } from "@/lib/acotar-numero";
import type { PresentacionProyecto, Proyecto } from "@/types/proyecto";
import type { construirModeloPitch, IdDiapositivaPitch } from "@/lib/presentacion-proyecto";
import {
  analizarLimitesViabilidad,
  calcularEscenarioLaboratorio,
  crearAjustesLaboratorioIniciales,
  type AjustesLaboratorio,
} from "@/lib/laboratorio-viabilidad";
import { calcularEquilibrioPorProducto } from "@/lib/equilibrio-por-producto";
import { resolverEscenarios } from "@/lib/escenarios-por-tipo";
import type { SeveridadIndicador } from "@/lib/indicadores-por-tipo";
import {
  emitirVeredicto,
  simularMontecarlo,
  type ResultadoMontecarlo,
} from "@/lib/analisis-riesgo";
import { GUIA_POR_TIPO } from "@/lib/guia-por-tipo";

type ModeloPitch = ReturnType<typeof construirModeloPitch>;

// Paleta ejecutiva editorial (acorde al sistema LIENZO institucional)
const COLORES = ["#0f766e", "#0284c7", "#059669", "#d97706", "#475569"];

function fmtBs(valor: number) {
  const abs = Math.abs(valor);
  const signo = valor < 0 ? "−" : "";
  if (abs >= 1_000_000) return `${signo}Bs ${fmtNum(abs / 1_000_000, 1)} M`;
  if (abs >= 1_000) return `${signo}Bs ${fmtNum(abs / 1_000, 0)} mil`;
  return `${signo}Bs ${abs.toLocaleString("es-BO", { maximumFractionDigits: 0 })}`;
}

function fmtPct(valor: number) {
  return Number.isFinite(valor) ? `${fmtNum(valor * 100, 1)}%` : "—";
}

function tooltipBs(valor: number | string) {
  return fmtBs(Number(valor));
}

export default function VisorPitch({
  proyecto,
  presentacion,
  modelo,
  onSalir,
}: {
  proyecto: Proyecto;
  presentacion: PresentacionProyecto;
  modelo: ModeloPitch;
  onSalir: () => void;
}) {
  const [indice, setIndice] = useState(0);
  const [mostrarNotas, setMostrarNotas] = useState(false);
  const [exportando, setExportando] = useState(false);
  const [segundos, setSegundos] = useState(0);
  const [ajustesLaboratorio, setAjustesLaboratorio] = useState<AjustesLaboratorio>(
    () => crearAjustesLaboratorioIniciales(proyecto)
  );
  const [montecarlo, setMontecarlo] = useState<ResultadoMontecarlo | null>(null);
  const diapositiva = modelo.diapositivas[indice];

  const hayMontecarlo = modelo.diapositivas.some((d) => d.id === "montecarlo");
  useEffect(() => {
    if (!hayMontecarlo) return;
    let cancelado = false;
    simularMontecarlo(proyecto, {
      corridas: 500,
      ...(() => {
        const r = resolverEscenarios(null, proyecto.tipoNegocio);
        return { optimista: r.optimista, pesimista: r.pesimista };
      })(),
    })
      .then((r) => {
        if (!cancelado) setMontecarlo(r);
      })
      .catch(() => {});
    return () => {
      cancelado = true;
    };
  }, [proyecto, hayMontecarlo]);

  const anterior = () => setIndice((actual) => Math.max(0, actual - 1));
  const siguiente = () =>
    setIndice((actual) => Math.min(modelo.diapositivas.length - 1, actual + 1));

  useEffect(() => {
    const alPresionar = (evento: KeyboardEvent) => {
      const objetivo = evento.target as HTMLElement | null;
      if (
        objetivo &&
        ["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(objetivo.tagName)
      ) {
        return;
      }
      if (["ArrowRight", "PageDown", " "].includes(evento.key)) {
        evento.preventDefault();
        siguiente();
      }
      if (["ArrowLeft", "PageUp"].includes(evento.key)) {
        evento.preventDefault();
        anterior();
      }
      if (evento.key === "Escape" && !document.fullscreenElement) onSalir();
    };
    window.addEventListener("keydown", alPresionar);
    return () => window.removeEventListener("keydown", alPresionar);
  }, [modelo.diapositivas.length, onSalir]);

  useEffect(() => {
    const reloj = window.setInterval(() => setSegundos((actual) => actual + 1), 1000);
    return () => window.clearInterval(reloj);
  }, []);

  const tiempo = `${String(Math.floor(segundos / 60)).padStart(2, "0")}:${String(
    segundos % 60
  ).padStart(2, "0")}`;

  const alternarPantallaCompleta = async () => {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await document.documentElement.requestFullscreen();
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

  const nota = useMemo(
    () => notaDiapositiva(diapositiva.id, presentacion, modelo),
    [diapositiva.id, presentacion, modelo]
  );

  return (
    <div className="flex h-app w-screen flex-col overflow-hidden bg-[#070d18] text-slate-100">
      {/* Barra superior del presentador */}
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-white/10 bg-[#0b1322] px-3 md:px-5">
        <div className="flex min-w-0 items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-teal-400" />
          <div className="truncate text-xs font-bold text-slate-200 md:text-sm">
            {presentacion.titulo}
          </div>
          <span className="hidden text-[11px] text-slate-400 sm:inline">
            · {diapositiva.titulo}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="hidden items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[11px] text-slate-300 md:flex">
            <Clock3 className="h-3.5 w-3.5 text-teal-400" /> {tiempo}
          </span>
          <button
            onClick={exportar}
            disabled={exportando}
            className="hidden items-center gap-1.5 rounded-md border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-60 sm:flex"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            {exportando ? "Generando…" : "Excel"}
          </button>
          <button
            onClick={() => setMostrarNotas((valor) => !valor)}
            className={`rounded-md border p-2 transition-colors ${
              mostrarNotas
                ? "border-amber-400/50 bg-amber-400/20 text-amber-200"
                : "border-white/10 text-slate-300 hover:bg-white/10"
            }`}
            title="Notas del expositor"
          >
            <Lightbulb className="h-4 w-4" />
          </button>
          <button
            onClick={alternarPantallaCompleta}
            className="rounded-md border border-white/10 p-2 text-slate-300 hover:bg-white/10"
            title="Pantalla completa"
          >
            {document.fullscreenElement ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </button>
          <button
            onClick={onSalir}
            className="rounded-md border border-white/10 p-2 text-slate-300 hover:bg-white/10"
            title="Volver a preparar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Área de la diapositiva */}
      <div className="relative flex min-h-0 flex-1 items-center justify-center p-2 md:p-5">
        <div className="relative aspect-video h-auto max-h-full w-full max-w-[1550px] overflow-hidden rounded-xl border border-slate-700/60 bg-white text-slate-900 shadow-2xl">
          <RenderDiapositiva
            id={diapositiva.id}
            proyecto={proyecto}
            presentacion={presentacion}
            modelo={modelo}
            etiqueta={diapositiva.etiqueta}
            montecarlo={montecarlo}
            ajustesLaboratorio={ajustesLaboratorio}
            onCambiarAjustes={setAjustesLaboratorio}
            onReiniciarLaboratorio={() =>
              setAjustesLaboratorio(crearAjustesLaboratorioIniciales(proyecto))
            }
          />
          <div className="absolute bottom-3 right-4 z-20 font-mono text-[11px] font-bold tracking-wider text-slate-400 md:text-xs">
            {indice + 1} / {modelo.diapositivas.length}
          </div>
        </div>

        {mostrarNotas && (
          <div className="absolute bottom-6 left-1/2 z-30 w-[min(780px,92%)] -translate-x-1/2 rounded-xl border border-amber-300/40 bg-slate-950/95 p-4 text-sm text-slate-100 shadow-2xl backdrop-blur">
            <div className="mb-1.5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-amber-300">
              <Lightbulb className="h-3.5 w-3.5" /> Guía para el expositor
            </div>
            <p className="leading-relaxed text-slate-200">{nota}</p>
          </div>
        )}
      </div>

      {/* Barra de control inferior */}
      <div className="flex h-14 shrink-0 items-center justify-between border-t border-white/10 bg-[#0b1322] px-4 md:px-6">
        <div className="text-xs font-medium text-slate-400">
          Diapositiva <span className="font-bold text-white">{indice + 1}</span> de{" "}
          <span className="font-bold text-white">{modelo.diapositivas.length}</span>
          <span className="mx-2 text-slate-600">·</span>
          <span className="text-slate-300">{diapositiva.titulo}</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={anterior}
            disabled={indice === 0}
            className="flex items-center gap-1 rounded-full border border-white/15 px-4 py-1.5 text-xs font-semibold text-slate-200 hover:bg-white/10 disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" /> Anterior
          </button>
          <div className="hidden items-center gap-1.5 lg:flex">
            {modelo.diapositivas.map((item, posicion) => (
              <button
                key={item.id}
                onClick={() => setIndice(posicion)}
                className={`h-2 rounded-full transition-all ${
                  posicion === indice
                    ? "w-7 bg-teal-400"
                    : "w-2 bg-white/20 hover:bg-white/40"
                }`}
                title={`${posicion + 1}. ${item.titulo}`}
              />
            ))}
          </div>
          <button
            onClick={siguiente}
            disabled={indice === modelo.diapositivas.length - 1}
            className="flex items-center gap-1.5 rounded-full bg-teal-500 px-4 py-1.5 text-xs font-bold text-slate-950 hover:bg-teal-400 disabled:opacity-30"
          >
            Siguiente <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function RenderDiapositiva({
  id,
  proyecto,
  presentacion,
  modelo,
  etiqueta,
  ajustesLaboratorio,
  onCambiarAjustes,
  onReiniciarLaboratorio,
  montecarlo,
}: {
  id: IdDiapositivaPitch;
  proyecto: Proyecto;
  presentacion: PresentacionProyecto;
  modelo: ModeloPitch;
  etiqueta: string;
  ajustesLaboratorio: AjustesLaboratorio;
  onCambiarAjustes: (ajustes: AjustesLaboratorio) => void;
  onReiniciarLaboratorio: () => void;
  montecarlo: ResultadoMontecarlo | null;
}) {
  if (id === "portada") return <Portada proyecto={proyecto} presentacion={presentacion} modelo={modelo} />;
  if (id === "oportunidad") return <Oportunidad presentacion={presentacion} etiqueta={etiqueta} />;
  if (id === "mercado") return <Mercado modelo={modelo} etiqueta={etiqueta} />;
  if (id === "inversion") return <Inversion modelo={modelo} etiqueta={etiqueta} />;
  if (id === "operacion") return <Operacion modelo={modelo} etiqueta={etiqueta} />;
  if (id === "equilibrio") return <Equilibrio proyecto={proyecto} etiqueta={etiqueta} />;
  if (id === "financiamiento") return <Financiamiento modelo={modelo} etiqueta={etiqueta} />;
  if (id === "flujo") return <Flujo modelo={modelo} etiqueta={etiqueta} />;
  if (id === "indicadores") return <Indicadores modelo={modelo} etiqueta={etiqueta} />;
  if (id === "tipo") return <IndicadoresDelRubro modelo={modelo} etiqueta={etiqueta} />;
  if (id === "riesgo") return <Riesgo modelo={modelo} etiqueta={etiqueta} />;
  if (id === "escenarios") return <Escenarios modelo={modelo} etiqueta={etiqueta} />;
  if (id === "montecarlo") return <SimulacionRiesgo modelo={modelo} etiqueta={etiqueta} montecarlo={montecarlo} />;
  if (id === "laboratorio") {
    return (
      <LaboratorioViabilidad
        proyecto={proyecto}
        modelo={modelo}
        etiqueta={etiqueta}
        ajustes={ajustesLaboratorio}
        onCambiar={onCambiarAjustes}
        onReiniciar={onReiniciarLaboratorio}
      />
    );
  }
  return <Cierre presentacion={presentacion} modelo={modelo} etiqueta={etiqueta} />;
}

// Marco unificado de alta gama editorial para diapositivas interiores
function Marco({
  etiqueta,
  titulo,
  subtitulo,
  children,
}: {
  etiqueta: string;
  titulo: string;
  subtitulo?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-[#faf8f5] p-3 sm:p-4 md:p-[2.5%] text-slate-900">
      {/* Barra superior de acento editorial */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-700 via-emerald-600 to-slate-800" />
      <div className="relative z-10 mb-2 sm:mb-3 shrink-0">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-teal-700" />
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-teal-800">
            {etiqueta}
          </span>
        </div>
        <h2 className="mt-0.5 font-display text-[clamp(16px,2.2vw,36px)] font-bold leading-tight tracking-tight text-slate-950">
          {titulo}
        </h2>
        {subtitulo && (
          <p className="mt-0.5 max-w-[90%] font-sans text-[clamp(10px,0.95vw,15px)] leading-snug text-slate-600 line-clamp-2">
            {subtitulo}
          </p>
        )}
      </div>
      <div className="relative z-10 min-h-0 flex-1">{children}</div>
    </div>
  );
}

// Portada ejecutiva: completa, sin vacíos negros, con Ficha de Inversión
function Portada({
  proyecto,
  presentacion,
  modelo,
}: {
  proyecto: Proyecto;
  presentacion: PresentacionProyecto;
  modelo: ModeloPitch;
}) {
  const rubroTitulo = proyecto.tipoNegocio
    ? (GUIA_POR_TIPO as Record<string, { titulo: string }>)[proyecto.tipoNegocio]?.titulo
    : undefined;

  return (
    <div className="relative flex h-full flex-col justify-between overflow-hidden bg-[#0a101d] p-[5%] text-white">
      {/* Acento superior de autoridad */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 via-emerald-400 to-amber-400" />

      {/* Encabezado con insignias formales */}
      <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <span className="rounded bg-teal-500/20 px-3 py-1 text-[clamp(9px,0.8vw,13px)] font-bold uppercase tracking-[0.2em] text-teal-300 border border-teal-500/30">
            Presentación de Inversión
          </span>
          {rubroTitulo && (
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded bg-slate-800 px-2.5 py-1 text-[clamp(9px,0.75vw,12px)] font-semibold text-slate-300">
              <Building2 className="h-3 w-3 text-teal-400" /> {rubroTitulo}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 text-[clamp(9px,0.75vw,12px)] font-semibold uppercase tracking-wider text-slate-400">
          <span>Horizonte: 5 años</span>
          <span>•</span>
          <span>Nivel: {modelo.nivel}</span>
        </div>
      </div>

      {/* Bloque central: Título y Ficha de Inversión */}
      <div className="relative z-10 my-auto grid grid-cols-1 lg:grid-cols-[1.6fr_1.1fr] gap-6 items-center">
        <div>
          <h1 className="font-display text-[clamp(28px,4.4vw,76px)] font-bold leading-[0.98] tracking-tight text-white">
            {presentacion.titulo}
          </h1>
          <p className="mt-3 font-sans text-[clamp(13px,1.45vw,24px)] font-medium text-slate-300 leading-snug">
            {presentacion.subtitulo}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-4 text-[clamp(10px,0.9vw,15px)] text-slate-400">
            {proyecto.ubicacion && (
              <span className="flex items-center gap-1.5 text-slate-300">
                <MapPin className="h-4 w-4 text-teal-400" /> {proyecto.ubicacion}
              </span>
            )}
            <span className="flex items-center gap-1.5 text-slate-300">
              <Users className="h-4 w-4 text-teal-400" /> {presentacion.expositores}
            </span>
          </div>
        </div>

        {/* Ficha técnica de decisión de inversión */}
        <div className="rounded-2xl border border-white/15 bg-white/5 p-5 backdrop-blur-md">
          <div className="mb-3 text-[11px] font-bold uppercase tracking-wider text-teal-300">
            Resumen Ejecutivo del Proyecto
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-white/10 bg-slate-900/60 p-3">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Inversión Inicial
              </div>
              <div className="mt-1 text-[clamp(16px,1.8vw,28px)] font-bold text-white">
                {fmtBs(modelo.totalProyecto)}
              </div>
              <div className="text-[10px] text-slate-400">Activos + Capital operativo</div>
            </div>

            <div className="rounded-xl border border-white/10 bg-slate-900/60 p-3">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Valor Actual Neto (VAN)
              </div>
              <div className={`mt-1 text-[clamp(16px,1.8vw,28px)] font-bold ${modelo.resultado.indicadores.van > 0 ? "text-emerald-300" : "text-rose-300"}`}>
                {fmtBs(modelo.resultado.indicadores.van)}
              </div>
              <div className="text-[10px] text-slate-400">
                {modelo.resultado.indicadores.van > 0 ? "Creación neta de valor" : "Riesgo de pérdida"}
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-slate-900/60 p-3">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Retorno (TIR)
              </div>
              <div className="mt-1 text-[clamp(16px,1.8vw,28px)] font-bold text-teal-300">
                {fmtPct(modelo.resultado.indicadores.tir)}
              </div>
              <div className="text-[10px] text-slate-400">Tasa exigida: {fmtPct(modelo.resultado.wacc)}</div>
            </div>

            <div className="rounded-xl border border-white/10 bg-slate-900/60 p-3">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Dictamen
              </div>
              <div className="mt-1 flex items-center gap-1 text-[clamp(13px,1.4vw,20px)] font-bold">
                {modelo.viable ? (
                  <span className="text-emerald-400">✓ Viable</span>
                ) : (
                  <span className="text-amber-400">⚠ Ajustar</span>
                )}
              </div>
              <div className="text-[10px] text-slate-400">Plan base evaluado</div>
            </div>
          </div>
        </div>
      </div>

      {/* Pie de portada formal */}
      <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-3 text-[clamp(9px,0.75vw,12px)] text-slate-400">
        <span className="uppercase tracking-[0.18em]">
          Simulador de Proyectos de Inversión · Bolivia
        </span>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-bold ${
          modelo.viable ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
        }`}>
          {modelo.viable ? "Recomendación: Viable para financiamiento" : "Recomendación: Recalibrar costos"}
        </span>
      </div>
    </div>
  );
}

function Oportunidad({ presentacion, etiqueta }: { presentacion: PresentacionProyecto; etiqueta: string }) {
  return (
    <Marco etiqueta={etiqueta} titulo="Una oportunidad con una respuesta clara">
      <div className="grid h-full grid-cols-2 gap-3 sm:gap-4 lg:gap-6 min-h-0">
        <div className="flex flex-col rounded-xl border border-rose-200 bg-rose-50/70 p-3.5 sm:p-4 lg:p-5 shadow-xs overflow-hidden">
          <div className="flex items-center gap-2.5 mb-2 shrink-0">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg bg-rose-600 text-white shadow-xs">
              <Target className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-rose-700 block">
                El problema u oportunidad
              </span>
              <span className="text-[10px] text-rose-900/60 font-medium hidden sm:block">Necesidad no resuelta</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto pr-1">
            <p className="font-sans text-[clamp(11px,1.05vw,16px)] font-medium leading-relaxed text-slate-800">
              {presentacion.problema}
            </p>
          </div>
        </div>

        <div className="flex flex-col rounded-xl border border-teal-200 bg-teal-50/70 p-3.5 sm:p-4 lg:p-5 shadow-xs overflow-hidden">
          <div className="flex items-center gap-2.5 mb-2 shrink-0">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg bg-teal-700 text-white shadow-xs">
              <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-teal-800 block">
                Nuestra propuesta de valor
              </span>
              <span className="text-[10px] text-teal-900/60 font-medium hidden sm:block">Solución diferenciada</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto pr-1">
            <p className="font-sans text-[clamp(11px,1.05vw,16px)] font-medium leading-relaxed text-slate-800">
              {presentacion.propuestaValor}
            </p>
          </div>
        </div>
      </div>
    </Marco>
  );
}

function Mercado({ modelo, etiqueta }: { modelo: ModeloPitch; etiqueta: string }) {
  const crecimiento =
    modelo.mercado[0]?.ingresos > 0
      ? modelo.mercado[4].ingresos / modelo.mercado[0].ingresos - 1
      : 0;
  return (
    <Marco
      etiqueta={etiqueta}
      titulo="Proyección de ingresos y demanda comercial a cinco años"
      subtitulo="La demanda proyectada y los precios definen la tracción del negocio en el mercado boliviano."
    >
      <div className="grid h-full grid-cols-[1fr_2.8fr] gap-[3%]">
        <div className="flex flex-col justify-center gap-[6%]">
          <Kpi titulo="Ingreso año 1" valor={fmtBs(modelo.mercado[0]?.ingresos ?? 0)} color="teal" />
          <Kpi titulo="Ingreso año 5" valor={fmtBs(modelo.mercado[4]?.ingresos ?? 0)} color="sky" />
          <Kpi titulo="Crecimiento acumulado" valor={fmtPct(crecimiento)} color="emerald" />
        </div>
        <div className="relative h-full min-h-[220px] rounded-2xl border border-slate-200 bg-white p-[3%] shadow-sm">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={modelo.mercado} margin={{ top: 12, right: 12, left: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="ingresosEditorial" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0f766e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0f766e" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="anio" tick={{ fontSize: 12, fill: "#475569" }} axisLine={false} tickLine={false} />
              <YAxis
                yAxisId="dinero"
                tickFormatter={(v) => fmtBs(v).replace("Bs ", "")}
                tick={{ fontSize: 11, fill: "#475569" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                yAxisId="cantidad"
                orientation="right"
                tick={{ fontSize: 11, fill: "#475569" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip formatter={(v: number | string, nombre) => (nombre === "Ingresos" ? tooltipBs(v) : Number(v).toLocaleString("es-BO"))} />
              <Legend />
              <Area yAxisId="dinero" type="monotone" dataKey="ingresos" name="Ingresos" stroke="#0f766e" strokeWidth={3} fill="url(#ingresosEditorial)" />
              <Line yAxisId="cantidad" type="monotone" dataKey="demanda" name="Demanda" stroke="#0284c7" strokeWidth={3} dot={{ r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Marco>
  );
}

function Inversion({ modelo, etiqueta }: { modelo: ModeloPitch; etiqueta: string }) {
  return (
    <Marco
      etiqueta={etiqueta}
      titulo="Estructura de inversión inicial y capital de trabajo"
      subtitulo={`La puesta en marcha requiere ${fmtBs(modelo.totalProyecto)} para infraestructura, equipamiento y liquidez operativa.`}
    >
      <div className="grid h-full grid-cols-[2fr_1fr] gap-[4%]">
        <div className="relative h-full min-h-[220px] rounded-2xl border border-slate-200 bg-white p-[3%] shadow-sm">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={modelo.inversion} layout="vertical" margin={{ top: 8, right: 24, left: 30, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
              <XAxis type="number" tickFormatter={(v) => fmtBs(v).replace("Bs ", "")} tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="nombre" width={140} tick={{ fontSize: 12, fill: "#1e293b", fontWeight: 600 }} axisLine={false} tickLine={false} />
              <Tooltip formatter={tooltipBs} />
              <Bar dataKey="valor" name="Inversión" radius={[0, 6, 6, 0]}>
                {modelo.inversion.map((_, i) => (
                  <Cell key={i} fill={COLORES[i % COLORES.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-col justify-center gap-[5%]">
          <Kpi titulo="Activos fijos e intangibles" valor={fmtBs(modelo.resultado.inversionInicial)} color="teal" />
          <Kpi titulo="Capital de trabajo" valor={fmtBs(modelo.resultado.capitalTrabajo)} color="sky" />
          <div className="rounded-2xl border border-slate-900 bg-slate-900 p-[7%] text-white shadow-md">
            <div className="text-[clamp(9px,0.8vw,13px)] font-bold uppercase tracking-[0.16em] text-teal-300">
              Inversión Total Requerida
            </div>
            <div className="mt-2 text-[clamp(20px,2.2vw,36px)] font-bold">{fmtBs(modelo.totalProyecto)}</div>
          </div>
        </div>
      </div>
    </Marco>
  );
}

function Operacion({ modelo, etiqueta }: { modelo: ModeloPitch; etiqueta: string }) {
  return (
    <Marco
      etiqueta={etiqueta}
      titulo="Estructura de costos operativos anuales"
      subtitulo="La segregación entre producción directa, personal, administración y ventas permite un control riguroso de márgenes."
    >
      <div className="relative h-full min-h-[220px] rounded-2xl border border-slate-200 bg-white p-[3%] shadow-sm">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={modelo.operacion} margin={{ top: 8, right: 18, left: 18, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="anio" tick={{ fontSize: 12, fill: "#475569" }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={(v) => fmtBs(v).replace("Bs ", "")} tick={{ fontSize: 11, fill: "#475569" }} axisLine={false} tickLine={false} />
            <Tooltip formatter={tooltipBs} />
            <Legend />
            <Bar dataKey="directos" name="Costos directos" stackId="costos" fill="#0f766e" />
            <Bar dataKey="personal" name="Personal y cargas" stackId="costos" fill="#0284c7" />
            <Bar dataKey="administracion" name="Gastos administrativos" stackId="costos" fill="#d97706" />
            <Bar dataKey="comercializacion" name="Comercialización y ventas" stackId="costos" fill="#475569" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Marco>
  );
}

function Equilibrio({
  proyecto,
  etiqueta,
}: {
  proyecto: Proyecto;
  etiqueta: string;
}) {
  const base = useMemo(
    () =>
      calcularEscenarioLaboratorio(
        proyecto,
        crearAjustesLaboratorioIniciales(proyecto)
      ),
    [proyecto]
  );
  const eq = useMemo(
    () => calcularEquilibrioPorProducto(base.proyectoAjustado),
    [base.proyectoAjustado]
  );
  const esBeneficio = eq.tipo === "beneficio";
  const factor = eq.factorVolumen;
  const filasVisibles = [...eq.filas]
    .sort((a, b) => b.ingresoAnio1 - a.ingresoAnio1)
    .slice(0, 4);
  const filasOcultas = eq.filas.length - filasVisibles.length;

  return (
    <Marco
      etiqueta={etiqueta}
      titulo="Punto de equilibrio operativo y margen de seguridad"
      subtitulo={
        esBeneficio
          ? "Beneficio anual mínimo requerido para absorber los costos fijos y evitar operar a pérdida."
          : "Nivel de ventas en unidades y dinero que cubre el 100% de los costos operativos fijos y variables."
      }
    >
      <div className="grid h-full grid-cols-[1fr_2fr] gap-[3%]">
        <div className="flex flex-col justify-center gap-[4%]">
          {esBeneficio ? (
            <Kpi
              titulo="Beneficio anual mínimo"
              valor={Number.isFinite(eq.ingresoEquilibrio) ? fmtBs(eq.ingresoEquilibrio) : "No se alcanza"}
              color={eq.alcanza ? "emerald" : "amber"}
            />
          ) : (
            <div
              className={`rounded-2xl border p-[5%] shadow-sm ${
                eq.alcanza
                  ? "border-emerald-200 bg-emerald-50/70 text-emerald-900"
                  : "border-amber-200 bg-amber-50/70 text-amber-900"
              }`}
            >
              <div className="text-[clamp(8px,0.72vw,12px)] font-bold uppercase tracking-[0.15em] text-slate-500">
                Equilibrio por producto
              </div>
              {Number.isFinite(factor) ? (
                <ul className="mt-2 space-y-1.5 text-[clamp(10px,0.95vw,15px)]">
                  {filasVisibles.map((f) => (
                    <li key={f.id} className="border-b border-black/5 pb-1 last:border-0">
                      <span className="block truncate font-semibold text-slate-800">{f.nombre}</span>
                      <span className="font-bold text-teal-800">
                        {Math.ceil(f.unidadesEquilibrio).toLocaleString("es-BO")} {f.unidad}
                      </span>
                      <span className="text-slate-500 text-xs">
                        {" "}de {Math.round(f.unidadesAnio1).toLocaleString("es-BO")} proyectadas
                      </span>
                    </li>
                  ))}
                  {filasOcultas > 0 && (
                    <li className="text-slate-500 text-xs italic">y {filasOcultas} productos más…</li>
                  )}
                </ul>
              ) : (
                <div className="mt-2 text-lg font-bold">No se alcanza con la estructura actual</div>
              )}
            </div>
          )}
          <Kpi
            titulo={esBeneficio ? "Beneficio del año 1" : "Ventas de equilibrio monetarias"}
            valor={
              esBeneficio
                ? fmtBs(eq.ingresoAnio1)
                : Number.isFinite(eq.ingresoEquilibrio)
                  ? fmtBs(eq.ingresoEquilibrio)
                  : "Sin margen"
            }
            color="teal"
          />
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Lectura de viabilidad operativa
            </div>
            <div className="mt-2 text-xl font-bold text-slate-900">
              {eq.alcanza
                ? "Las ventas proyectadas superan el umbral de supervivencia"
                : "Se requiere incrementar volumen o reducir costos fijos"}
            </div>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              El punto de equilibrio representa el volumen mínimo donde los ingresos igualan los costos totales.
              Cualquier venta adicional genera utilidad neta directa para el proyecto.
            </p>
          </div>
          <div className="rounded-xl border border-teal-200 bg-teal-50/50 p-4">
            <span className="font-bold text-teal-900 text-sm">Respaldo:</span>{" "}
            <span className="text-sm text-teal-800">
              La empresa opera con margen de cobertura positivo desde el primer año de operaciones.
            </span>
          </div>
        </div>
      </div>
    </Marco>
  );
}

function Financiamiento({ modelo, etiqueta }: { modelo: ModeloPitch; etiqueta: string }) {
  const deudaPct = modelo.totalProyecto > 0 ? modelo.deuda / modelo.totalProyecto : 0;
  return (
    <Marco
      etiqueta={etiqueta}
      titulo="Estructura de financiamiento y costo de capital (WACC)"
      subtitulo="La proporción entre capital propio y deuda bancaria determina la tasa de corte mínima exigida al proyecto."
    >
      <div className="grid h-full grid-cols-[1.4fr_1fr] gap-[4%]">
        <div className="relative h-full min-h-[220px] rounded-2xl border border-slate-200 bg-white p-[2%] shadow-sm">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={modelo.financiamiento}
                dataKey="valor"
                nameKey="nombre"
                innerRadius="46%"
                outerRadius="72%"
                paddingAngle={4}
              >
                {modelo.financiamiento.map((_, i) => (
                  <Cell key={i} fill={COLORES[i % COLORES.length]} />
                ))}
              </Pie>
              <Tooltip formatter={tooltipBs} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-col justify-center gap-[5%]">
          <Kpi titulo="Capital propio (Aporte socios)" valor={fmtBs(modelo.capitalPropio)} color="teal" />
          <Kpi titulo="Financiamiento bancario (Deuda)" valor={fmtBs(modelo.deuda)} color="sky" />
          <Kpi titulo="Nivel de endeudamiento" valor={fmtPct(deudaPct)} color="amber" />
          <Kpi titulo="Costo promedio de capital (WACC)" valor={fmtPct(modelo.resultado.wacc)} color="emerald" />
        </div>
      </div>
    </Marco>
  );
}

function Flujo({ modelo, etiqueta }: { modelo: ModeloPitch; etiqueta: string }) {
  return (
    <Marco
      etiqueta={etiqueta}
      titulo="Evolución del flujo de caja: anual y acumulado"
      subtitulo="El desembolso inicial del Año 0 da paso a los flujos operativos que compensan la inversión y crean liquidez neta."
    >
      <div className="relative h-full min-h-[220px] rounded-2xl border border-slate-200 bg-white p-[3%] shadow-sm">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={modelo.flujo} margin={{ top: 10, right: 18, left: 18, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="anio" tick={{ fontSize: 12, fill: "#475569" }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={(v) => fmtBs(v).replace("Bs ", "")} tick={{ fontSize: 11, fill: "#475569" }} axisLine={false} tickLine={false} />
            <Tooltip formatter={tooltipBs} />
            <Legend />
            <ReferenceLine y={0} stroke="#64748b" />
            <Bar dataKey="flujo" name="Flujo anual neto" radius={[6, 6, 0, 0]}>
              {modelo.flujo.map((dato, i) => (
                <Cell key={i} fill={dato.flujo >= 0 ? "#059669" : "#e11d48"} />
              ))}
            </Bar>
            <Line type="monotone" dataKey="acumulado" name="Flujo acumulado" stroke="#0f766e" strokeWidth={3} dot={{ r: 4 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Marco>
  );
}

function Indicadores({ modelo, etiqueta }: { modelo: ModeloPitch; etiqueta: string }) {
  const indicadores = [
    {
      nombre: "VAN (Valor Actual Neto)",
      valor: fmtBs(modelo.resultado.indicadores.van),
      lectura: modelo.resultado.indicadores.van > 0 ? "Crea valor para el inversionista" : "Destruye valor",
      positivo: modelo.resultado.indicadores.van > 0,
      detalle: "Rendimiento neto actualizado por encima de la tasa exigida.",
    },
    {
      nombre: "TIR (Tasa Interna de Retorno)",
      valor: fmtPct(modelo.resultado.indicadores.tir),
      lectura: `Supera el costo de capital WACC (${fmtPct(modelo.resultado.wacc)})`,
      positivo: modelo.resultado.indicadores.tir > modelo.resultado.wacc,
      detalle: "Rentabilidad anual promedio generada por los fondos del proyecto.",
    },
    {
      nombre: "Recuperación de la Inversión (Payback)",
      valor:
        Number.isFinite(modelo.resultado.indicadores.payback) && modelo.resultado.indicadores.payback >= 0
          ? `${fmtNum(modelo.resultado.indicadores.payback, 1)} años`
          : "No recupera",
      lectura: "Velocidad de retorno del capital",
      positivo: Number.isFinite(modelo.resultado.indicadores.payback) && modelo.resultado.indicadores.payback <= 5,
      detalle: "Momento en el que el flujo acumulado cruza a terreno positivo.",
    },
    {
      nombre: "Índice de Rentabilidad (IR)",
      valor: `${fmtNum(modelo.resultado.indicadores.ir, 2)}x`,
      lectura: modelo.resultado.indicadores.ir >= 1 ? "Retorno superior a la unidad invertida" : "Retorno menor a la inversión",
      positivo: modelo.resultado.indicadores.ir >= 1,
      detalle: "Relación beneficio / costo actualizada a valor presente.",
    },
  ];
  return (
    <Marco
      etiqueta={etiqueta}
      titulo={modelo.viable ? "Indicadores financieros clave respaldan la viabilidad" : "Los indicadores exigen ajustes en la estructura"}
      subtitulo="Evaluación formal de creación de valor, rentabilidad periódica, velocidad de retorno y eficiencia del capital."
    >
      <div className="grid h-full grid-cols-2 gap-[2.5%]">
        {indicadores.map((ind) => (
          <div
            key={ind.nombre}
            className={`flex flex-col justify-between rounded-2xl border p-[5%] shadow-sm ${
              ind.positivo ? "border-emerald-200 bg-white" : "border-amber-200 bg-amber-50/40"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[clamp(10px,0.9vw,15px)] font-bold text-slate-700">{ind.nombre}</span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[clamp(8px,0.72vw,11px)] font-bold ${
                  ind.positivo ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                }`}
              >
                {ind.positivo ? "✓ Favorable" : "⚠ Alerta"}
              </span>
            </div>
            <div className="my-2 text-[clamp(24px,3vw,48px)] font-bold tracking-tight text-slate-900">
              {ind.valor}
            </div>
            <div>
              <div className="text-[clamp(10px,0.95vw,15px)] font-bold text-teal-800">{ind.lectura}</div>
              <div className="mt-0.5 text-[clamp(9px,0.78vw,13px)] text-slate-500 leading-snug">{ind.detalle}</div>
            </div>
          </div>
        ))}
      </div>
    </Marco>
  );
}

const PRIORIDAD_SEVERIDAD: Record<SeveridadIndicador, number> = { critico: 0, advertencia: 1, ok: 2, info: 3 };
const PUNTO_SEVERIDAD: Record<SeveridadIndicador, string> = {
  critico: "bg-rose-500",
  advertencia: "bg-amber-500",
  ok: "bg-emerald-500",
  info: "bg-sky-500",
};

function IndicadoresDelRubro({ modelo, etiqueta }: { modelo: ModeloPitch; etiqueta: string }) {
  const panel = modelo.panelTipo;
  if (!panel) return null;
  const elegidos = [...panel.indicadores]
    .sort((a, b) => PRIORIDAD_SEVERIDAD[a.severidad] - PRIORIDAD_SEVERIDAD[b.severidad])
    .slice(0, 6);
  return (
    <Marco
      etiqueta={etiqueta}
      titulo={panel.titulo}
      subtitulo="Métricas operativas del rubro: lo que examina un evaluador con experiencia en este tipo de negocio."
    >
      <div className="grid h-full grid-cols-2 gap-[2.5%]">
        {elegidos.map((i) => (
          <div key={i.id} className="flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-[4%] shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <span className="text-[clamp(9px,0.9vw,14px)] font-bold uppercase tracking-[0.12em] text-slate-500">{i.nombre}</span>
              <span className={`mt-1 h-3 w-3 flex-shrink-0 rounded-full ${PUNTO_SEVERIDAD[i.severidad]}`} />
            </div>
            <div className="text-[clamp(18px,2.2vw,36px)] font-bold leading-tight tracking-tight text-slate-900">{i.valor}</div>
            <div className="line-clamp-2 text-[clamp(9px,0.85vw,13px)] text-slate-600">{i.detalle}</div>
          </div>
        ))}
      </div>
    </Marco>
  );
}

function Riesgo({ modelo, etiqueta }: { modelo: ModeloPitch; etiqueta: string }) {
  return (
    <Marco
      etiqueta={etiqueta}
      titulo="Sensibilidad del VAN ante fluctuaciones de mercado"
      subtitulo="Impacto directo en la rentabilidad al variar precio, demanda, costos de insumos y personal."
    >
      <div className="relative h-full min-h-[220px] rounded-2xl border border-slate-200 bg-white p-[3%] shadow-sm">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={modelo.riesgo} layout="vertical" margin={{ top: 8, right: 28, left: 80, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
            <XAxis type="number" tickFormatter={(v) => fmtBs(v).replace("Bs ", "")} tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="nombre" width={160} tick={{ fontSize: 11, fill: "#1e293b", fontWeight: 600 }} axisLine={false} tickLine={false} />
            <Tooltip formatter={tooltipBs} />
            <ReferenceLine x={0} stroke="#64748b" />
            <Bar dataKey="van" name="VAN resultante" radius={[0, 6, 6, 0]}>
              {modelo.riesgo.map((dato, i) => (
                <Cell key={i} fill={dato.viable ? "#059669" : dato.van >= 0 ? "#d97706" : "#e11d48"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Marco>
  );
}

const COLOR_ESCENARIO: Record<string, string> = {
  optimista: "#059669",
  base: "#0284c7",
  pesimista: "#e11d48",
};

function Escenarios({ modelo, etiqueta }: { modelo: ModeloPitch; etiqueta: string }) {
  const filas = [0, 1, 2, 3, 4, 5].map((i) => {
    const fila: Record<string, number | string> = { anio: modelo.escenarios[0].acumulado[i]?.anio ?? "" };
    for (const e of modelo.escenarios) fila[e.nombre] = e.acumulado[i]?.valor ?? 0;
    return fila;
  });
  return (
    <Marco
      etiqueta={etiqueta}
      titulo="Stress test: escenarios optimista, base y pesimista"
      subtitulo="Comportamiento del proyecto bajo condiciones favorables de mercado, plan base y escenario de estrés."
    >
      <div className="grid h-full grid-cols-[2fr_3fr] gap-[2.5%]">
        <div className="flex flex-col gap-[3%]">
          {modelo.escenarios.map((e) => (
            <div
              key={e.clave}
              className="flex flex-1 flex-col justify-center rounded-2xl border border-slate-200 bg-white px-[6%] shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-[clamp(10px,1vw,15px)] font-bold uppercase tracking-[0.16em]" style={{ color: COLOR_ESCENARIO[e.clave] }}>
                  {e.nombre}
                </span>
                <span className={`rounded-full px-2.5 py-0.5 text-[clamp(8px,0.75vw,12px)] font-bold ${e.viable ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
                  {e.viable ? "Viable" : "No viable"}
                </span>
              </div>
              <div className="text-[clamp(20px,2.4vw,40px)] font-bold tracking-tight text-slate-900 mt-1">
                {fmtBs(e.van)}
              </div>
              <div className="text-[clamp(9px,0.85vw,14px)] text-slate-500 font-medium">
                TIR {tirCalculable(e.tir) ? fmtPct(e.tir) : "no calculable"} · {Number.isFinite(e.payback) && e.payback >= 0 ? `recupera en ${fmtNum(e.payback, 1)} años` : "no recupera"}
              </div>
            </div>
          ))}
        </div>
        <div className="relative h-full min-h-[220px] rounded-2xl border border-slate-200 bg-white p-[3%] shadow-sm">
          <div className="mb-1 text-xs font-bold text-slate-600">Dinero acumulado año a año por escenario</div>
          <ResponsiveContainer width="100%" height="92%">
            <ComposedChart data={filas} margin={{ top: 8, right: 18, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="anio" tick={{ fontSize: 12, fill: "#475569" }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={(v) => fmtBs(v).replace("Bs ", "")} tick={{ fontSize: 11, fill: "#475569" }} axisLine={false} tickLine={false} />
              <Tooltip formatter={tooltipBs} />
              <Legend />
              <ReferenceLine y={0} stroke="#64748b" />
              {modelo.escenarios.map((e) => (
                <Line key={e.clave} type="monotone" dataKey={e.nombre} stroke={COLOR_ESCENARIO[e.clave]} strokeWidth={3} dot={{ r: 4 }} />
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Marco>
  );
}

const COLOR_VEREDICTO: Record<string, string> = {
  robusto: "text-emerald-700",
  sensible: "text-amber-700",
  riesgoso: "text-orange-700",
  inviable: "text-rose-700",
};

function SimulacionRiesgo({
  modelo,
  etiqueta,
  montecarlo,
}: {
  modelo: ModeloPitch;
  etiqueta: string;
  montecarlo: ResultadoMontecarlo | null;
}) {
  const veredicto = emitirVeredicto(modelo.tornado, montecarlo);
  const histograma = (montecarlo?.histograma ?? []).map((b) => ({
    etiqueta: fmtBs((b.desde + b.hasta) / 2).replace("Bs ", ""),
    centro: (b.desde + b.hasta) / 2,
    cantidad: b.cantidad,
  }));
  const tornado = [...modelo.tornado.filas]
    .reverse()
    .map((f) => ({ variable: f.variable, rango: [f.vanBajo, f.vanAlto] as [number, number] }));
  return (
    <Marco
      etiqueta={etiqueta}
      titulo="Simulación probabilística de Montecarlo (500 escenarios)"
      subtitulo="Evaluación estocástica variando simultáneamente precios, demanda y costos directos."
    >
      <div className="grid h-full grid-cols-[2fr_3fr_3fr] gap-[2.5%]">
        <div className="flex flex-col justify-center rounded-2xl border border-slate-200 bg-white p-[7%] text-center shadow-sm">
          <div className="text-[clamp(9px,0.85vw,13px)] font-bold uppercase tracking-[0.18em] text-slate-500">
            Probabilidad de éxito
          </div>
          <div className={`text-[clamp(36px,5.5vw,96px)] font-bold leading-none tracking-tight ${COLOR_VEREDICTO[veredicto.nivel]}`}>
            {montecarlo ? `${Math.round(montecarlo.probVanPositivo * 100)}%` : "…"}
          </div>
          <div className={`mt-3 text-[clamp(14px,1.7vw,28px)] font-bold ${COLOR_VEREDICTO[veredicto.nivel]}`}>
            {veredicto.titulo}
          </div>
          <div className="mt-2 text-[clamp(9px,0.9vw,15px)] leading-snug text-slate-600">{veredicto.detalle}</div>
          {montecarlo && (
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-semibold">
              <div className="rounded-lg bg-rose-50 p-2 text-slate-700">
                Peor 5%
                <div className="text-sm font-bold text-rose-700">{fmtBs(montecarlo.p5)}</div>
              </div>
              <div className="rounded-lg bg-emerald-50 p-2 text-slate-700">
                Mejor 5%
                <div className="text-sm font-bold text-emerald-700">{fmtBs(montecarlo.p95)}</div>
              </div>
            </div>
          )}
        </div>
        <div className="relative h-full min-h-[220px] rounded-2xl border border-slate-200 bg-white p-[3%] shadow-sm">
          <div className="mb-1 text-xs font-bold text-slate-600">Distribución de frecuencias del VAN</div>
          {montecarlo ? (
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={histograma} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="etiqueta" tick={{ fontSize: 10, fill: "#475569" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#475569" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip formatter={(v: number | string) => [`${v} escenarios`, "Frecuencia"]} />
                <Bar dataKey="cantidad" radius={[4, 4, 0, 0]}>
                  {histograma.map((d, i) => (
                    <Cell key={i} fill={d.centro >= 0 ? "#059669" : "#e11d48"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[85%] items-center justify-center text-sm text-slate-400">Simulando futuros…</div>
          )}
        </div>
        <div className="relative h-full min-h-[220px] rounded-2xl border border-slate-200 bg-white p-[3%] shadow-sm">
          <div className="mb-1 text-xs font-bold text-slate-600">Sensibilidad: impacto ante ±10% de variación</div>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={tornado} layout="vertical" margin={{ top: 8, right: 12, left: 4, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
              <XAxis type="number" tickFormatter={(v) => fmtBs(v).replace("Bs ", "")} tick={{ fontSize: 10, fill: "#475569" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="variable" width={115} tick={{ fontSize: 11, fill: "#1e293b", fontWeight: 600 }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: number[]) => `${fmtBs(v[0])} a ${fmtBs(v[1])}`} />
              <ReferenceLine x={0} stroke="#e11d48" />
              <ReferenceLine x={modelo.tornado.vanBase} stroke="#475569" strokeDasharray="4 3" />
              <Bar dataKey="rango" fill="#0f766e" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Marco>
  );
}

function LaboratorioViabilidad({
  proyecto,
  modelo,
  etiqueta,
  ajustes,
  onCambiar,
  onReiniciar,
}: {
  proyecto: Proyecto;
  modelo: ModeloPitch;
  etiqueta: string;
  ajustes: AjustesLaboratorio;
  onCambiar: (ajustes: AjustesLaboratorio) => void;
  onReiniciar: () => void;
}) {
  const analisis = useMemo(
    () => analizarLimitesViabilidad(proyecto, modelo.nivel),
    [proyecto, modelo.nivel]
  );
  const escenario = useMemo(
    () => calcularEscenarioLaboratorio(proyecto, ajustes),
    [proyecto, ajustes]
  );
  const base = analisis.base;
  const resultado = escenario.resultado;
  const actualizar = (campo: keyof AjustesLaboratorio, valor: number) =>
    onCambiar({ ...ajustes, [campo]: valor });
  const controles = [
    { campo: "precioPct" as const, etiqueta: "Precio de venta", minimo: -30, maximo: 50, paso: 1, sufijo: "%" },
    { campo: "demandaPct" as const, etiqueta: "Volumen de ventas", minimo: -40, maximo: 50, paso: 1, sufijo: "%" },
    { campo: "costoDirectoPct" as const, etiqueta: "Costos directos", minimo: -30, maximo: 50, paso: 1, sufijo: "%" },
    { campo: "sueldosPct" as const, etiqueta: "Sueldos del personal", minimo: -30, maximo: 50, paso: 1, sufijo: "%" },
    ...(modelo.nivel !== "basico"
      ? [{ campo: "costoFijoPct" as const, etiqueta: "Gastos fijos (sin sueldos)", minimo: -30, maximo: 50, paso: 1, sufijo: "%" }]
      : []),
    ...(modelo.nivel === "avanzado"
      ? [
          { campo: "deudaPct" as const, etiqueta: "Deuda del proyecto", minimo: 0, maximo: 80, paso: 1, sufijo: "%" },
          { campo: "tasaInteresPct" as const, etiqueta: "Tasa de interés", minimo: 0, maximo: 35, paso: 0.5, sufijo: "%" },
        ]
      : []),
  ];

  return (
    <Marco
      etiqueta={etiqueta}
      titulo="Laboratorio interactivo: límites de viabilidad en vivo"
      subtitulo="Permite a los evaluadores o inversionistas modificar variables en tiempo real durante la defensa."
    >
      <div className="grid h-full grid-cols-[1.1fr_1.6fr] gap-[2.5%]">
        <div className="flex min-h-0 flex-col rounded-2xl border border-slate-200 bg-white p-[4%] shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-800">
              <SlidersHorizontal className="h-4 w-4" /> Parámetros ajustables
            </div>
            <button
              onClick={onReiniciar}
              className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200"
            >
              <RotateCcw className="h-3 w-3" /> Volver al plan original
            </button>
          </div>
          <div className={`grid min-h-0 flex-1 content-center gap-x-4 gap-y-2 ${controles.length > 4 ? "grid-cols-2" : "grid-cols-1"}`}>
            {controles.map((control) => (
              <ControlLaboratorio
                key={control.campo}
                etiqueta={control.etiqueta}
                valor={ajustes[control.campo]}
                minimo={control.minimo}
                maximo={control.maximo}
                paso={control.paso}
                sufijo={control.sufijo}
                mostrarSigno={!(["deudaPct", "tasaInteresPct"] as string[]).includes(control.campo)}
                onChange={(valor) => actualizar(control.campo, valor)}
              />
            ))}
          </div>
        </div>

        <div className="grid min-h-0 grid-rows-[auto_auto_1fr] gap-[2.5%]">
          <div className={`flex items-center justify-between rounded-xl border px-4 py-3 ${
            escenario.viable ? "border-emerald-200 bg-emerald-50/70" : "border-amber-200 bg-amber-50/70"
          }`}>
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-white ${
                escenario.viable ? "bg-emerald-600" : "bg-amber-600"
              }`}>
                <Gauge className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Resultado del ajuste</div>
                <div className="text-xl font-bold text-slate-900">
                  {escenario.viable ? "Proyecto viable" : "Requiere ajustes"}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-bold uppercase text-slate-500">Variable más sensible</div>
              <div className="text-sm font-bold text-teal-800">{analisis.impactos[0]?.variable ?? "—"}</div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <Comparador titulo="VAN" base={fmtBs(base.resultado.indicadores.van)} actual={fmtBs(resultado.indicadores.van)} positivo={resultado.indicadores.van > 0} />
            <Comparador titulo="TIR" base={fmtPct(base.resultado.indicadores.tir)} actual={fmtPct(resultado.indicadores.tir)} positivo={resultado.indicadores.tir > resultado.wacc} />
            <Comparador
              titulo="Equilibrio"
              base={Number.isFinite(base.equilibrio.unidades) ? `${Math.ceil(base.equilibrio.unidades).toLocaleString("es-BO")} u` : "—"}
              actual={Number.isFinite(escenario.equilibrio.unidades) ? `${Math.ceil(escenario.equilibrio.unidades).toLocaleString("es-BO")} u` : "—"}
              positivo={escenario.margenSeguridad >= 0}
            />
            <Comparador
              titulo={modelo.nivel === "avanzado" ? "Cobertura deuda" : "Recuperación"}
              base={modelo.nivel === "avanzado" ? formatoCobertura(base.resultado.indicadores.sd) : formatoRecuperacion(base.resultado.indicadores.payback)}
              actual={modelo.nivel === "avanzado" ? formatoCobertura(resultado.indicadores.sd) : formatoRecuperacion(resultado.indicadores.payback)}
              positivo={modelo.nivel === "avanzado" ? resultado.indicadores.sd >= 1 : resultado.indicadores.payback >= 0}
            />
          </div>

          <div className="grid min-h-0 grid-cols-[0.9fr_1.1fr] gap-3">
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Impacto en el VAN</div>
              <div className="mt-2 space-y-2">
                {analisis.impactos.map((impacto) => (
                  <div key={impacto.variable}>
                    <div className="mb-0.5 flex justify-between text-xs font-semibold text-slate-700">
                      <span>{impacto.variable}</span>
                      <span>{fmtBs(impacto.impactoVan)}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-teal-600" style={{ width: `${impacto.porcentaje}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900 p-3 text-white">
              <div className="text-[10px] font-bold uppercase tracking-wider text-teal-300">Límites calculados de resistencia</div>
              <div className="mt-2 grid h-[80%] content-center gap-1.5">
                {analisis.umbrales.map((umbral) => (
                  <div key={umbral.variable} className="flex items-start gap-2 text-xs leading-snug text-slate-200">
                    <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${umbral.alcanzable ? "bg-emerald-400" : "bg-amber-400"}`} />
                    {umbral.texto}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Marco>
  );
}

function ControlLaboratorio({
  etiqueta,
  valor,
  minimo,
  maximo,
  paso,
  sufijo,
  mostrarSigno,
  onChange,
}: {
  etiqueta: string;
  valor: number;
  minimo: number;
  maximo: number;
  paso: number;
  sufijo: string;
  mostrarSigno: boolean;
  onChange: (valor: number) => void;
}) {
  const textoValor = `${mostrarSigno && valor > 0 ? "+" : ""}${fmtNum(valor, paso < 1 ? 1 : 0)}${sufijo}`;
  return (
    <label className="block rounded-lg bg-slate-50 px-3 py-2 border border-slate-200">
      <span className="flex items-center justify-between gap-2 text-xs font-medium text-slate-700">
        <span>{etiqueta}</span>
        <span className="rounded bg-white px-1.5 py-0.5 font-bold text-teal-800 shadow-2xs text-[11px]">{textoValor}</span>
      </span>
      <input
        type="range"
        min={minimo}
        max={maximo}
        step={paso}
        value={valor}
        onChange={(evento) => onChange(Number(evento.target.value))}
        className="mt-1 h-1.5 w-full cursor-pointer accent-teal-700"
        aria-label={etiqueta}
      />
    </label>
  );
}

function Comparador({
  titulo,
  base,
  actual,
  positivo,
}: {
  titulo: string;
  base: string;
  actual: string;
  positivo: boolean;
}) {
  return (
    <div className={`rounded-xl border p-2.5 ${
      positivo ? "border-emerald-200 bg-emerald-50/70" : "border-amber-200 bg-amber-50/70"
    }`}>
      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{titulo}</div>
      <div className="mt-1 truncate text-base font-bold text-slate-900">{actual}</div>
      <div className="truncate text-[10px] text-slate-500">Base: {base}</div>
    </div>
  );
}

function formatoRecuperacion(valor: number) {
  return Number.isFinite(valor) && valor >= 0 ? `${fmtNum(valor, 1)} años` : "No recupera";
}

function formatoCobertura(valor: number) {
  if (!Number.isFinite(valor)) return "Sin deuda";
  return `${fmtNum(valor, 2)} veces`;
}

function Cierre({
  presentacion,
  modelo,
  etiqueta,
}: {
  presentacion: PresentacionProyecto;
  modelo: ModeloPitch;
  etiqueta: string;
}) {
  return (
    <div className="relative flex h-full flex-col justify-between overflow-hidden bg-[#0a101d] p-[6%] text-white">
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 via-emerald-400 to-amber-400" />
      <div className="relative z-10 flex items-center justify-between">
        <span className="text-[clamp(9px,0.8vw,14px)] font-bold uppercase tracking-[0.24em] text-teal-300">
          {etiqueta} · CONCLUSIÓN Y DICTAMEN
        </span>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[clamp(10px,0.9vw,14px)] font-bold ${
          modelo.viable ? "bg-emerald-500/20 border border-emerald-400/40 text-emerald-300" : "bg-amber-500/20 border border-amber-400/40 text-amber-300"
        }`}>
          {modelo.viable ? "✓ Proyecto viable para ejecución" : "⚠ Requiere ajustes en costos/demanda"}
        </span>
      </div>

      <div className="relative z-10 max-w-[88%] my-auto">
        <h2 className="font-display text-[clamp(26px,3.8vw,64px)] font-bold leading-[1.05] tracking-tight text-white">
          Una decisión de inversión respaldada por datos.
        </h2>
        <div className="mt-[3%] rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <div className="text-[clamp(9px,0.75vw,12px)] font-bold uppercase tracking-wider text-teal-300 mb-1">
            Recomendación del equipo de proyecto
          </div>
          <p className="text-[clamp(13px,1.45vw,22px)] font-medium leading-[1.4] text-slate-200">
            {presentacion.conclusion}
          </p>
        </div>
      </div>

      <div className="relative z-10 flex items-center justify-between border-t border-white/15 pt-[2.5%] text-slate-300">
        <div>
          <span className="text-xs uppercase tracking-wider text-slate-500 block">Equipo expositor</span>
          <span className="text-[clamp(11px,1.1vw,18px)] font-bold text-white">{presentacion.expositores}</span>
        </div>
        <div className="text-right">
          <span className="text-xs uppercase tracking-wider text-slate-500 block">Simulador de Proyectos de Inversión</span>
          <span className="text-[clamp(16px,1.8vw,28px)] font-bold text-teal-300">Muchas gracias.</span>
        </div>
      </div>
    </div>
  );
}

function Kpi({
  titulo,
  valor,
  color,
}: {
  titulo: string;
  valor: string;
  color: "teal" | "sky" | "emerald" | "amber" | "violet" | "cyan";
}) {
  const estilos: Record<string, string> = {
    teal: "border-teal-200 bg-teal-50/70 text-teal-900",
    emerald: "border-emerald-200 bg-emerald-50/70 text-emerald-900",
    amber: "border-amber-200 bg-amber-50/70 text-amber-900",
    sky: "border-sky-200 bg-sky-50/70 text-sky-900",
    violet: "border-teal-200 bg-teal-50/70 text-teal-900",
    cyan: "border-sky-200 bg-sky-50/70 text-sky-900",
  };
  return (
    <div className={`rounded-xl border p-[5%] shadow-sm ${estilos[color] || estilos.teal}`}>
      <div className="text-[clamp(8px,0.72vw,12px)] font-bold uppercase tracking-[0.14em] text-slate-500">{titulo}</div>
      <div className="mt-1 text-[clamp(16px,1.8vw,30px)] font-bold tracking-tight text-slate-900">{valor}</div>
    </div>
  );
}

function notaDiapositiva(id: IdDiapositivaPitch, presentacion: PresentacionProyecto, modelo: ModeloPitch) {
  const notas: Record<IdDiapositivaPitch, string> = {
    portada: `Presenta al equipo y resume en una frase qué hace ${presentacion.titulo}. No leas la portada: úsala para abrir con seguridad y citar la inversión inicial.`,
    oportunidad: "Explica primero el problema observable y luego conecta la propuesta de valor. Evita entrar todavía en los cálculos.",
    mercado: "Cuenta qué supuestos explican el crecimiento. Destaca la diferencia entre demanda física e ingresos monetarios.",
    inversion: `La inversión total es ${fmtBs(modelo.totalProyecto)}. Señala las dos categorías más importantes y por qué son necesarias.`,
    operacion: "Explica qué costo pesa más y qué control tendrá el equipo para evitar desviaciones durante la operación.",
    equilibrio: "Muestra dónde se cruzan ingresos y costos. El margen de seguridad indica cuánto pueden caer las ventas antes de empezar a perder.",
    financiamiento: `Aclara cuánto aporta el equipo y cuánto proviene de deuda. El costo promedio de capital (WACC) es ${fmtPct(modelo.resultado.wacc)}.`,
    flujo: "La barra inicial negativa representa la inversión. Después muestra cuándo los flujos positivos compensan ese desembolso.",
    indicadores: `La regla principal es VAN mayor a cero y TIR mayor al costo promedio de capital (WACC). Conecta los indicadores con una decisión concreta.`,
    tipo: "Estos son los indicadores que mira alguien que conoce tu rubro. Empieza por los que están en rojo o amarillo: explica qué los causa y qué harías para corregirlos.",
    riesgo: "No presentes los escenarios como predicciones exactas. Son pruebas para identificar las variables que más afectan el resultado.",
    escenarios: "Presenta los tres escenarios como un rango, no como predicciones. Pregunta al público qué tan probable creen cada uno y vuelve al base como el más razonable.",
    montecarlo: "Explica el porcentaje como la proporción de futuros simulados en los que el proyecto gana dinero. Señala la variable más sensible del tornado y qué harían para controlarla.",
    laboratorio: "Mueve una variable a la vez, explica qué cambia y usa los límites calculados para defender hasta dónde resiste el proyecto. Restablece antes de probar otra variable.",
    cierre: "Termina con una recomendación clara y una acción siguiente. Después abre el espacio de preguntas.",
  };
  return notas[id];
}
