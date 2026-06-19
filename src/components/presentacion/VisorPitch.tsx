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
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileSpreadsheet,
  Lightbulb,
  Maximize2,
  Minimize2,
  Target,
  X,
} from "lucide-react";
import type { PresentacionProyecto, Proyecto } from "@/types/proyecto";
import type { construirModeloPitch, IdDiapositivaPitch } from "@/lib/presentacion-proyecto";

type ModeloPitch = ReturnType<typeof construirModeloPitch>;

const COLORES = ["#7c3aed", "#06b6d4", "#10b981", "#f59e0b", "#f43f5e"];

function fmtBs(valor: number) {
  const abs = Math.abs(valor);
  const signo = valor < 0 ? "−" : "";
  if (abs >= 1_000_000) return `${signo}Bs ${(abs / 1_000_000).toFixed(1)} M`;
  if (abs >= 1_000) return `${signo}Bs ${(abs / 1_000).toFixed(0)} mil`;
  return `${signo}Bs ${abs.toLocaleString("es-BO", { maximumFractionDigits: 0 })}`;
}

function fmtPct(valor: number) {
  return Number.isFinite(valor) ? `${(valor * 100).toFixed(1)}%` : "—";
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
  const diapositiva = modelo.diapositivas[indice];

  const anterior = () => setIndice((actual) => Math.max(0, actual - 1));
  const siguiente = () =>
    setIndice((actual) => Math.min(modelo.diapositivas.length - 1, actual + 1));

  useEffect(() => {
    const alPresionar = (evento: KeyboardEvent) => {
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
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#070b17] text-white">
      <div className="flex h-12 shrink-0 items-center justify-between border-b border-white/10 bg-slate-950/80 px-3 backdrop-blur md:px-5">
        <div className="min-w-0">
          <div className="truncate text-xs font-bold md:text-sm">{presentacion.titulo}</div>
          <div className="hidden text-[10px] text-slate-400 sm:block">
            Presentación · usa ← → para avanzar
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="hidden items-center gap-1.5 rounded-md border border-white/10 px-2.5 py-1.5 font-mono text-[11px] text-slate-300 md:flex">
            <Clock3 className="h-3.5 w-3.5" /> {tiempo}
          </span>
          <button
            onClick={exportar}
            disabled={exportando}
            className="hidden items-center gap-1.5 rounded-md border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-200 hover:bg-emerald-500/20 disabled:opacity-60 sm:flex"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            {exportando ? "Generando…" : "Excel"}
          </button>
          <button
            onClick={() => setMostrarNotas((valor) => !valor)}
            className="rounded-md border border-white/10 p-2 text-slate-300 hover:bg-white/10"
            title="Notas del expositor"
          >
            <Lightbulb className="h-4 w-4" />
          </button>
          <button
            onClick={alternarPantallaCompleta}
            className="rounded-md border border-white/10 p-2 text-slate-300 hover:bg-white/10"
            title="Pantalla completa"
          >
            {document.fullscreenElement ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
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

      <div className="relative flex min-h-0 flex-1 items-center justify-center p-2 md:p-5">
        <div className="relative aspect-video h-auto max-h-full w-full max-w-[1600px] overflow-hidden rounded-xl border border-white/10 bg-slate-50 text-slate-950 shadow-2xl shadow-violet-950/50">
          <RenderDiapositiva
            id={diapositiva.id}
            proyecto={proyecto}
            presentacion={presentacion}
            modelo={modelo}
            etiqueta={diapositiva.etiqueta}
          />
          <div className="absolute bottom-4 right-5 z-20 text-[10px] font-bold tracking-[0.18em] text-slate-400 md:text-xs">
            {indice + 1} / {modelo.diapositivas.length}
          </div>
        </div>

        {mostrarNotas && (
          <div className="absolute bottom-5 left-1/2 z-30 w-[min(760px,90%)] -translate-x-1/2 rounded-xl border border-amber-300/30 bg-slate-950/95 p-4 text-sm text-slate-100 shadow-2xl backdrop-blur">
            <div className="mb-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-amber-300">
              <Lightbulb className="h-3.5 w-3.5" /> Nota del expositor
            </div>
            {nota}
          </div>
        )}
      </div>

      <div className="flex h-14 shrink-0 items-center justify-center gap-3 border-t border-white/10 bg-slate-950/80 px-4">
        <button
          onClick={anterior}
          disabled={indice === 0}
          className="flex items-center gap-1 rounded-full border border-white/10 px-4 py-2 text-xs font-semibold hover:bg-white/10 disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" /> Anterior
        </button>
        <div className="hidden items-center gap-1.5 sm:flex">
          {modelo.diapositivas.map((item, posicion) => (
            <button
              key={item.id}
              onClick={() => setIndice(posicion)}
              className={`h-2 rounded-full transition-all ${
                posicion === indice ? "w-8 bg-fuchsia-400" : "w-2 bg-white/25 hover:bg-white/50"
              }`}
              title={item.titulo}
            />
          ))}
        </div>
        <button
          onClick={siguiente}
          disabled={indice === modelo.diapositivas.length - 1}
          className="flex items-center gap-1 rounded-full bg-white px-4 py-2 text-xs font-bold text-slate-950 hover:bg-slate-100 disabled:opacity-30"
        >
          Siguiente <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function RenderDiapositiva({
  id,
  proyecto,
  presentacion,
  modelo,
  etiqueta,
}: {
  id: IdDiapositivaPitch;
  proyecto: Proyecto;
  presentacion: PresentacionProyecto;
  modelo: ModeloPitch;
  etiqueta: string;
}) {
  if (id === "portada") return <Portada proyecto={proyecto} presentacion={presentacion} modelo={modelo} />;
  if (id === "oportunidad") return <Oportunidad presentacion={presentacion} etiqueta={etiqueta} />;
  if (id === "mercado") return <Mercado modelo={modelo} etiqueta={etiqueta} />;
  if (id === "inversion") return <Inversion modelo={modelo} etiqueta={etiqueta} />;
  if (id === "operacion") return <Operacion modelo={modelo} etiqueta={etiqueta} />;
  if (id === "financiamiento") return <Financiamiento modelo={modelo} etiqueta={etiqueta} />;
  if (id === "flujo") return <Flujo modelo={modelo} etiqueta={etiqueta} />;
  if (id === "indicadores") return <Indicadores modelo={modelo} etiqueta={etiqueta} />;
  if (id === "riesgo") return <Riesgo modelo={modelo} etiqueta={etiqueta} />;
  return <Cierre presentacion={presentacion} modelo={modelo} etiqueta={etiqueta} />;
}

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
    <div className="relative flex h-full flex-col overflow-hidden bg-gradient-to-br from-white via-slate-50 to-violet-50 p-[4%]">
      <div className="absolute -right-[8%] -top-[18%] h-[55%] w-[35%] rounded-full bg-violet-200/50 blur-3xl" />
      <div className="relative z-10 mb-[2.5%]">
        <div className="text-[clamp(9px,0.8vw,14px)] font-black uppercase tracking-[0.24em] text-violet-600">
          {etiqueta}
        </div>
        <h2 className="mt-[0.5%] text-[clamp(24px,3.1vw,54px)] font-black leading-[1.05] tracking-tight text-slate-950">
          {titulo}
        </h2>
        {subtitulo && (
          <p className="mt-[0.8%] max-w-[75%] text-[clamp(11px,1.15vw,20px)] leading-snug text-slate-500">
            {subtitulo}
          </p>
        )}
      </div>
      <div className="relative z-10 min-h-0 flex-1">{children}</div>
    </div>
  );
}

function Portada({ proyecto, presentacion, modelo }: { proyecto: Proyecto; presentacion: PresentacionProyecto; modelo: ModeloPitch }) {
  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-[#0c1022] p-[6%] text-white">
      <div className="absolute -right-[12%] -top-[30%] h-[90%] w-[60%] rounded-full bg-fuchsia-600/30 blur-[90px]" />
      <div className="absolute -bottom-[40%] -left-[10%] h-[80%] w-[60%] rounded-full bg-cyan-500/20 blur-[100px]" />
      <div className="relative z-10 flex items-center justify-between">
        <span className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-[clamp(9px,0.85vw,14px)] font-bold uppercase tracking-[0.22em] text-violet-200">
          Presentación de inversión
        </span>
        <span className="text-[clamp(9px,0.8vw,13px)] font-semibold uppercase tracking-[0.18em] text-slate-400">
          {modelo.nivel} · 5 años
        </span>
      </div>
      <div className="relative z-10 my-auto max-w-[82%]">
        <h1 className="text-[clamp(32px,5.5vw,94px)] font-black leading-[0.95] tracking-[-0.045em]">
          {presentacion.titulo}
        </h1>
        <p className="mt-[3%] text-[clamp(14px,1.65vw,28px)] font-medium text-violet-200">
          {presentacion.subtitulo}
        </p>
        <div className="mt-[5%] flex flex-wrap gap-3 text-[clamp(10px,0.95vw,16px)] text-slate-300">
          {proyecto.ubicacion && <span>{proyecto.ubicacion}</span>}
          {proyecto.ubicacion && <span className="text-violet-400">•</span>}
          <span>{presentacion.expositores}</span>
        </div>
      </div>
      <div className="relative z-10 flex items-end justify-between border-t border-white/15 pt-[2.5%]">
        <span className="text-[clamp(9px,0.75vw,12px)] uppercase tracking-[0.2em] text-slate-500">
          Simulador de Proyectos de Inversión
        </span>
        <span className={`rounded-full px-4 py-2 text-[clamp(10px,0.9vw,15px)] font-black ${modelo.viable ? "bg-emerald-400 text-emerald-950" : "bg-amber-300 text-amber-950"}`}>
          {modelo.viable ? "Proyecto viable" : "Requiere ajustes"}
        </span>
      </div>
    </div>
  );
}

function Oportunidad({ presentacion, etiqueta }: { presentacion: PresentacionProyecto; etiqueta: string }) {
  return (
    <Marco etiqueta={etiqueta} titulo="Una oportunidad con una respuesta clara">
      <div className="grid h-full grid-cols-2 gap-[3%]">
        <div className="flex flex-col justify-between rounded-[2vw] border border-rose-200 bg-rose-50 p-[7%]">
          <div className="flex h-[clamp(36px,4vw,64px)] w-[clamp(36px,4vw,64px)] items-center justify-center rounded-2xl bg-rose-500 text-white shadow-lg shadow-rose-500/20">
            <Target className="h-1/2 w-1/2" />
          </div>
          <div>
            <div className="mb-[3%] text-[clamp(10px,0.9vw,15px)] font-black uppercase tracking-[0.2em] text-rose-600">El problema</div>
            <p className="text-[clamp(15px,1.65vw,28px)] font-bold leading-[1.25] text-slate-900">{presentacion.problema}</p>
          </div>
        </div>
        <div className="flex flex-col justify-between rounded-[2vw] border border-violet-200 bg-violet-50 p-[7%]">
          <div className="flex h-[clamp(36px,4vw,64px)] w-[clamp(36px,4vw,64px)] items-center justify-center rounded-2xl bg-violet-600 text-white shadow-lg shadow-violet-500/20">
            <Lightbulb className="h-1/2 w-1/2" />
          </div>
          <div>
            <div className="mb-[3%] text-[clamp(10px,0.9vw,15px)] font-black uppercase tracking-[0.2em] text-violet-600">La propuesta</div>
            <p className="text-[clamp(15px,1.65vw,28px)] font-bold leading-[1.25] text-slate-900">{presentacion.propuestaValor}</p>
          </div>
        </div>
      </div>
    </Marco>
  );
}

function Mercado({ modelo, etiqueta }: { modelo: ModeloPitch; etiqueta: string }) {
  const crecimiento = modelo.mercado[0]?.ingresos > 0
    ? modelo.mercado[4].ingresos / modelo.mercado[0].ingresos - 1
    : 0;
  return (
    <Marco etiqueta={etiqueta} titulo="Ingresos con trayectoria de crecimiento" subtitulo="La demanda y los precios del proyecto construyen una proyección comercial a cinco años.">
      <div className="grid h-full grid-cols-[1fr_3fr] gap-[3%]">
        <div className="flex flex-col justify-center gap-[8%]">
          <Kpi titulo="Ingreso año 1" valor={fmtBs(modelo.mercado[0]?.ingresos ?? 0)} color="violet" />
          <Kpi titulo="Ingreso año 5" valor={fmtBs(modelo.mercado[4]?.ingresos ?? 0)} color="cyan" />
          <Kpi titulo="Crecimiento acumulado" valor={fmtPct(crecimiento)} color="emerald" />
        </div>
        <div className="rounded-[1.5vw] border border-slate-200 bg-white p-[3%] shadow-sm">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={modelo.mercado} margin={{ top: 12, right: 12, left: 8, bottom: 0 }}>
              <defs>
                <linearGradient id="ingresosPitch" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.03} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="anio" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="dinero" tickFormatter={(v) => fmtBs(v).replace("Bs ", "")} tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="cantidad" orientation="right" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: number | string, nombre) => nombre === "Ingresos" ? tooltipBs(v) : Number(v).toLocaleString("es-BO")} />
              <Legend />
              <Area yAxisId="dinero" type="monotone" dataKey="ingresos" name="Ingresos" stroke="#7c3aed" strokeWidth={4} fill="url(#ingresosPitch)" />
              <Line yAxisId="cantidad" type="monotone" dataKey="demanda" name="Demanda" stroke="#06b6d4" strokeWidth={3} dot={{ r: 4 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Marco>
  );
}

function Inversion({ modelo, etiqueta }: { modelo: ModeloPitch; etiqueta: string }) {
  return (
    <Marco etiqueta={etiqueta} titulo="Una inversión enfocada en lo esencial" subtitulo={`La puesta en marcha requiere ${fmtBs(modelo.totalProyecto)}, incluyendo capital de trabajo.`}>
      <div className="grid h-full grid-cols-[2fr_1fr] gap-[4%]">
        <div className="rounded-[1.5vw] border border-slate-200 bg-white p-[3%] shadow-sm">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={modelo.inversion} layout="vertical" margin={{ top: 8, right: 24, left: 30, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
              <XAxis type="number" tickFormatter={(v) => fmtBs(v).replace("Bs ", "")} tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="nombre" width={130} tick={{ fontSize: 12, fill: "#334155", fontWeight: 600 }} axisLine={false} tickLine={false} />
              <Tooltip formatter={tooltipBs} />
              <Bar dataKey="valor" name="Inversión" radius={[0, 8, 8, 0]}>
                {modelo.inversion.map((_, i) => <Cell key={i} fill={COLORES[i % COLORES.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-col justify-center gap-[5%]">
          <Kpi titulo="Activos iniciales" valor={fmtBs(modelo.resultado.inversionInicial)} color="violet" />
          <Kpi titulo="Capital de trabajo" valor={fmtBs(modelo.resultado.capitalTrabajo)} color="cyan" />
          <div className="rounded-[1.4vw] bg-slate-950 p-[8%] text-white">
            <div className="text-[clamp(9px,0.8vw,13px)] font-black uppercase tracking-[0.16em] text-slate-400">Total proyecto</div>
            <div className="mt-[4%] text-[clamp(20px,2.2vw,38px)] font-black">{fmtBs(modelo.totalProyecto)}</div>
          </div>
        </div>
      </div>
    </Marco>
  );
}

function Operacion({ modelo, etiqueta }: { modelo: ModeloPitch; etiqueta: string }) {
  return (
    <Marco etiqueta={etiqueta} titulo="Costos bajo una estructura visible" subtitulo="Separar producción, equipo y gastos permite identificar dónde se concentra la operación.">
      <div className="h-full rounded-[1.5vw] border border-slate-200 bg-white p-[3%] shadow-sm">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={modelo.operacion} margin={{ top: 8, right: 18, left: 18, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="anio" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={(v) => fmtBs(v).replace("Bs ", "")} tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
            <Tooltip formatter={tooltipBs} />
            <Legend />
            <Bar dataKey="directos" name="Costos directos" stackId="costos" fill="#7c3aed" />
            <Bar dataKey="personal" name="Personal" stackId="costos" fill="#06b6d4" />
            <Bar dataKey="administracion" name="Administración" stackId="costos" fill="#10b981" />
            <Bar dataKey="comercializacion" name="Comercialización" stackId="costos" fill="#f59e0b" radius={[7, 7, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Marco>
  );
}

function Financiamiento({ modelo, etiqueta }: { modelo: ModeloPitch; etiqueta: string }) {
  const deudaPct = modelo.totalProyecto > 0 ? modelo.deuda / modelo.totalProyecto : 0;
  return (
    <Marco etiqueta={etiqueta} titulo="Una mezcla de capital consciente" subtitulo="El costo del financiamiento se incorpora al costo promedio de capital (WACC), la tasa mínima que debe superar el proyecto.">
      <div className="grid h-full grid-cols-[1.4fr_1fr] gap-[4%]">
        <div className="rounded-[1.5vw] border border-slate-200 bg-white p-[2%] shadow-sm">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={modelo.financiamiento} dataKey="valor" nameKey="nombre" innerRadius="48%" outerRadius="72%" paddingAngle={3}>
                {modelo.financiamiento.map((_, i) => <Cell key={i} fill={COLORES[i]} />)}
              </Pie>
              <Tooltip formatter={tooltipBs} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-col justify-center gap-[6%]">
          <Kpi titulo="Capital propio" valor={fmtBs(modelo.capitalPropio)} color="violet" />
          <Kpi titulo="Deuda" valor={fmtBs(modelo.deuda)} color="cyan" />
          <Kpi titulo="Participación de deuda" valor={fmtPct(deudaPct)} color="amber" />
          <Kpi titulo="Costo de capital (WACC)" valor={fmtPct(modelo.resultado.wacc)} color="emerald" />
        </div>
      </div>
    </Marco>
  );
}

function Flujo({ modelo, etiqueta }: { modelo: ModeloPitch; etiqueta: string }) {
  return (
    <Marco etiqueta={etiqueta} titulo="La caja cuenta la historia completa" subtitulo="La inversión inicial da paso a los flujos operativos y a la recuperación acumulada del proyecto.">
      <div className="h-full rounded-[1.5vw] border border-slate-200 bg-white p-[3%] shadow-sm">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={modelo.flujo} margin={{ top: 10, right: 18, left: 18, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="anio" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={(v) => fmtBs(v).replace("Bs ", "")} tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
            <Tooltip formatter={tooltipBs} />
            <Legend />
            <ReferenceLine y={0} stroke="#64748b" />
            <Bar dataKey="flujo" name="Flujo anual" radius={[7, 7, 0, 0]}>
              {modelo.flujo.map((dato, i) => <Cell key={i} fill={dato.flujo >= 0 ? "#10b981" : "#f43f5e"} />)}
            </Bar>
            <Line type="monotone" dataKey="acumulado" name="Flujo acumulado" stroke="#7c3aed" strokeWidth={4} dot={{ r: 4 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Marco>
  );
}

function Indicadores({ modelo, etiqueta }: { modelo: ModeloPitch; etiqueta: string }) {
  const indicadores = [
    { nombre: "VAN", valor: fmtBs(modelo.resultado.indicadores.van), lectura: modelo.resultado.indicadores.van > 0 ? "Crea valor" : "Destruye valor" },
    { nombre: "TIR", valor: fmtPct(modelo.resultado.indicadores.tir), lectura: `vs. costo de capital ${fmtPct(modelo.resultado.wacc)}` },
    { nombre: "Recuperación", valor: Number.isFinite(modelo.resultado.indicadores.payback) && modelo.resultado.indicadores.payback >= 0 ? `${modelo.resultado.indicadores.payback.toFixed(1)} años` : "No recupera", lectura: "Periodo de recuperación de la inversión" },
    { nombre: "Rentabilidad", valor: modelo.resultado.indicadores.ir.toFixed(2), lectura: "Índice de rentabilidad" },
  ];
  return (
    <Marco etiqueta={etiqueta} titulo={modelo.viable ? "Los indicadores respaldan la inversión" : "Los indicadores piden una recalibración"} subtitulo="La decisión combina creación de valor, rendimiento y velocidad de recuperación.">
      <div className="grid h-full grid-cols-2 gap-[3%]">
        {indicadores.map((indicador, i) => (
          <div key={indicador.nombre} className="flex flex-col justify-between rounded-[1.5vw] border border-slate-200 bg-white p-[6%] shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[clamp(10px,1vw,16px)] font-black uppercase tracking-[0.18em] text-slate-500">{indicador.nombre}</span>
              <span className={`h-3 w-3 rounded-full ${modelo.viable ? "bg-emerald-400" : i < 2 ? "bg-amber-400" : "bg-violet-400"}`} />
            </div>
            <div className="text-[clamp(24px,3.4vw,58px)] font-black tracking-tight text-slate-950">{indicador.valor}</div>
            <div className="text-[clamp(10px,1vw,16px)] font-semibold text-slate-500">{indicador.lectura}</div>
          </div>
        ))}
      </div>
    </Marco>
  );
}

function Riesgo({ modelo, etiqueta }: { modelo: ModeloPitch; etiqueta: string }) {
  return (
    <Marco etiqueta={etiqueta} titulo="¿Qué mueve realmente la viabilidad?" subtitulo="Los escenarios muestran cuánto cambia el VAN al mejorar precio, volumen o eficiencia operativa.">
      <div className="h-full rounded-[1.5vw] border border-slate-200 bg-white p-[3%] shadow-sm">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={modelo.riesgo} layout="vertical" margin={{ top: 8, right: 28, left: 80, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
            <XAxis type="number" tickFormatter={(v) => fmtBs(v).replace("Bs ", "")} tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="nombre" width={155} tick={{ fontSize: 11, fill: "#334155", fontWeight: 600 }} axisLine={false} tickLine={false} />
            <Tooltip formatter={tooltipBs} />
            <ReferenceLine x={0} stroke="#64748b" />
            <Bar dataKey="van" name="VAN" radius={[0, 8, 8, 0]}>
              {modelo.riesgo.map((dato, i) => <Cell key={i} fill={dato.viable ? "#10b981" : dato.van >= 0 ? "#f59e0b" : "#f43f5e"} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Marco>
  );
}

function Cierre({ presentacion, modelo, etiqueta }: { presentacion: PresentacionProyecto; modelo: ModeloPitch; etiqueta: string }) {
  return (
    <div className={`relative flex h-full flex-col justify-between overflow-hidden p-[6%] text-white ${modelo.viable ? "bg-gradient-to-br from-emerald-950 via-slate-950 to-violet-950" : "bg-gradient-to-br from-amber-950 via-slate-950 to-violet-950"}`}>
      <div className="absolute -right-[10%] -top-[30%] h-[90%] w-[60%] rounded-full bg-violet-500/25 blur-[100px]" />
      <div className="relative z-10 text-[clamp(9px,0.8vw,14px)] font-black uppercase tracking-[0.24em] text-violet-300">{etiqueta}</div>
      <div className="relative z-10 max-w-[88%]">
        <div className={`mb-[3%] inline-flex rounded-full px-4 py-2 text-[clamp(10px,0.9vw,15px)] font-black ${modelo.viable ? "bg-emerald-400 text-emerald-950" : "bg-amber-300 text-amber-950"}`}>
          {modelo.viable ? "Recomendación: avanzar" : "Recomendación: ajustar"}
        </div>
        <h2 className="text-[clamp(28px,4.2vw,72px)] font-black leading-[1.02] tracking-tight">Una decisión respaldada por números.</h2>
        <p className="mt-[3%] text-[clamp(14px,1.65vw,28px)] font-medium leading-[1.35] text-slate-200">{presentacion.conclusion}</p>
      </div>
      <div className="relative z-10 flex items-center justify-between border-t border-white/15 pt-[2.5%]">
        <span className="text-[clamp(11px,1.1vw,18px)] font-bold">{presentacion.expositores}</span>
        <span className="text-[clamp(18px,2vw,32px)] font-black">Gracias.</span>
      </div>
    </div>
  );
}

function Kpi({ titulo, valor, color }: { titulo: string; valor: string; color: "violet" | "cyan" | "emerald" | "amber" }) {
  const estilos = {
    violet: "border-violet-200 bg-violet-50 text-violet-700",
    cyan: "border-cyan-200 bg-cyan-50 text-cyan-700",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
  };
  return (
    <div className={`rounded-[1.2vw] border p-[6%] ${estilos[color]}`}>
      <div className="text-[clamp(8px,0.72vw,12px)] font-black uppercase tracking-[0.15em] opacity-75">{titulo}</div>
      <div className="mt-[3%] text-[clamp(17px,2vw,34px)] font-black tracking-tight">{valor}</div>
    </div>
  );
}

function notaDiapositiva(id: IdDiapositivaPitch, presentacion: PresentacionProyecto, modelo: ModeloPitch) {
  const notas: Record<IdDiapositivaPitch, string> = {
    portada: `Presenta al equipo y resume en una frase qué hace ${presentacion.titulo}. No leas la portada: úsala para abrir con seguridad.`,
    oportunidad: "Explica primero el problema observable y luego conecta la propuesta de valor. Evita entrar todavía en los cálculos.",
    mercado: "Cuenta qué supuestos explican el crecimiento. Destaca la diferencia entre demanda física e ingresos monetarios.",
    inversion: `La inversión total es ${fmtBs(modelo.totalProyecto)}. Señala las dos categorías más importantes y por qué son necesarias.`,
    operacion: "Explica qué costo pesa más y qué control tendrá el equipo para evitar desviaciones durante la operación.",
    financiamiento: `Aclara cuánto aporta el equipo y cuánto proviene de deuda. El costo promedio de capital (WACC) es ${fmtPct(modelo.resultado.wacc)}.`,
    flujo: "La barra inicial negativa representa la inversión. Después muestra cuándo los flujos positivos compensan ese desembolso.",
    indicadores: `La regla principal es VAN mayor a cero y TIR mayor al costo promedio de capital (WACC). Conecta los indicadores con una decisión concreta.`,
    riesgo: "No presentes los escenarios como predicciones exactas. Son pruebas para identificar las variables que más afectan el resultado.",
    cierre: "Termina con una recomendación clara y una acción siguiente. Después abre el espacio de preguntas.",
  };
  return notas[id];
}
