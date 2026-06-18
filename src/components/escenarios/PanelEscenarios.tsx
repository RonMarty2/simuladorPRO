import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Info,
  RefreshCw,
  Sliders,
  XCircle,
} from "lucide-react";
import {
  compararEscenarios,
  esViable,
  resolverEscenariosDeCurso,
  ESCENARIO_NEUTRAL,
  type EscenarioCalculado,
  type EscenariosConfig,
  type ModificadoresEscenario,
  type NombreEscenario,
} from "@/lib/escenarios";
import { formatearBolivianos, cn } from "@/lib/utils";
import type { Proyecto } from "@/types/proyecto";

const COLORES: Record<NombreEscenario, string> = {
  optimista: "#10b981",     // emerald-500
  base: "#3b82f6",          // blue-500
  pesimista: "#ef4444",     // red-500
  personalizado: "#a855f7", // purple-500
};

export default function PanelEscenarios({
  proyecto,
  configCurso,
}: {
  proyecto: Proyecto;
  /** Config de escenarios que el docente definió para el curso. Si es null,
   *  se usan los defaults pedagógicos del código. */
  configCurso?: EscenariosConfig | null;
}) {
  const [miEscenario, setMiEscenario] = useState<ModificadoresEscenario>(ESCENARIO_NEUTRAL);
  const [slidersAbierto, setSlidersAbierto] = useState(false);

  // Resolución de optimista/pesimista: lo que el docente puso en el curso,
  // con fallback a los defaults del código.
  const { optimista, pesimista } = useMemo(
    () => resolverEscenariosDeCurso(configCurso),
    [configCurso]
  );

  const escenarios = useMemo<EscenarioCalculado[]>(
    () => compararEscenarios(proyecto, optimista, pesimista, miEscenario),
    [proyecto, optimista, pesimista, miEscenario]
  );

  // Datos para el gráfico: flujo neto acumulado por escenario, año 0..5.
  const datosGrafico = useMemo(() => {
    return [0, 1, 2, 3, 4, 5].map((anio) => {
      const fila: Record<string, number | string> = { anio: `Año ${anio}` };
      for (const e of escenarios) {
        let acum = 0;
        for (let i = 0; i <= anio; i++) acum += e.flujo.flujoCaja[i] ?? 0;
        fila[e.etiqueta] = Math.round(acum);
      }
      return fila;
    });
  }, [escenarios]);

  const resetearMiEscenario = () => setMiEscenario(ESCENARIO_NEUTRAL);

  return (
    <div className="mx-auto max-w-7xl space-y-4 p-3 sm:p-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight">📊 Escenarios — análisis de sensibilidad</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Compará cómo se mueven los indicadores del proyecto si cambian las variables clave.
          El proyecto base es <strong>{proyecto.nombre}</strong>.
        </p>
      </div>

      {/* Tarjetas resumen de cada escenario */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {escenarios.map((e) => (
          <TarjetaEscenario key={e.nombre} escenario={e} />
        ))}
      </div>

      {/* Tabla de indicadores */}
      <SeccionTitulo titulo="Indicadores comparados" />
      <TablaIndicadores escenarios={escenarios} />

      {/* Tabla de flujo de caja año por año */}
      <SeccionTitulo titulo="Flujo de caja año por año" />
      <TablaFlujoCaja escenarios={escenarios} />

      {/* Gráfico comparativo */}
      <SeccionTitulo titulo="Flujo neto acumulado · gráfico comparativo" />
      <div className="rounded-lg border border-border bg-card p-3">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={datosGrafico} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="anio" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              formatter={(v: number) => formatearBolivianos(v)}
              labelStyle={{ color: "hsl(var(--foreground))" }}
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                fontSize: 12,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {escenarios.map((e) => (
              <Line
                key={e.nombre}
                type="monotone"
                dataKey={e.etiqueta}
                stroke={COLORES[e.nombre]}
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
        <p className="mt-1 text-[10px] text-muted-foreground">
          Cada línea muestra cuánto va dejando (o gastando) el proyecto acumulado año por año.
          Si una línea cruza el cero hacia arriba, el proyecto se recuperó.
        </p>
      </div>

      {/* Sliders de "Mi escenario" */}
      <div className="rounded-lg border border-purple-200 bg-purple-50/40 dark:border-purple-900 dark:bg-purple-950/20">
        <button
          onClick={() => setSlidersAbierto((v) => !v)}
          className="flex w-full items-center justify-between gap-2 p-3 text-left"
        >
          <div className="flex items-center gap-2">
            {slidersAbierto ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            <Sliders className="h-4 w-4 text-purple-700 dark:text-purple-300" />
            <span className="text-sm font-semibold">Mi escenario · armá tu propio stress test</span>
          </div>
          <span className="text-[11px] text-muted-foreground">
            {sonNeutrales(miEscenario) ? "Sin cambios" : "Con ajustes activos"}
          </span>
        </button>

        {slidersAbierto && (
          <div className="space-y-3 border-t border-purple-200 p-3 dark:border-purple-900">
            <GrupoSliders titulo="Ingresos">
              <SliderPorcentual
                label="Precio"
                ayuda="Sube o baja todos los precios de venta."
                valor={miEscenario.precioMul}
                onChange={(v) => setMiEscenario({ ...miEscenario, precioMul: v })}
              />
              <SliderPorcentual
                label="Demanda"
                ayuda="Sube o baja la cantidad vendida (o suscriptores / audiencia)."
                valor={miEscenario.demandaMul}
                onChange={(v) => setMiEscenario({ ...miEscenario, demandaMul: v })}
              />
            </GrupoSliders>

            <GrupoSliders titulo="Costos operativos">
              <SliderPorcentual
                label="Costos directos"
                ayuda="Materia prima, insumos, mercadería."
                valor={miEscenario.costoDirectoMul}
                onChange={(v) => setMiEscenario({ ...miEscenario, costoDirectoMul: v })}
              />
              <SliderPorcentual
                label="Gastos generales"
                ayuda="Admin + comercialización."
                valor={miEscenario.costoGeneralMul}
                onChange={(v) => setMiEscenario({ ...miEscenario, costoGeneralMul: v })}
              />
              <SliderPorcentual
                label="Sueldos"
                ayuda="Sube o baja la planilla del personal."
                valor={miEscenario.personalMul}
                onChange={(v) => setMiEscenario({ ...miEscenario, personalMul: v })}
              />
            </GrupoSliders>

            <GrupoSliders titulo="Inversión">
              <SliderPorcentual
                label="Inversión inicial"
                ayuda="Encarece o abarata toda la inversión en activos."
                valor={miEscenario.inversionMul}
                onChange={(v) => setMiEscenario({ ...miEscenario, inversionMul: v })}
              />
              <SliderPorcentual
                label="Capital de trabajo"
                ayuda="Sube o baja el capital operativo necesario."
                valor={miEscenario.capitalTrabajoMul}
                onChange={(v) => setMiEscenario({ ...miEscenario, capitalTrabajoMul: v })}
              />
            </GrupoSliders>

            <GrupoSliders titulo="Financiamiento">
              <SliderTasaInteres
                valor={miEscenario.tasaInteresDeltaPp ?? 0}
                onChange={(v) =>
                  setMiEscenario({
                    ...miEscenario,
                    tasaInteresDeltaPp: v === 0 ? undefined : v,
                  })
                }
              />
              <SliderPlazo
                valor={miEscenario.plazoPrestamoDelta ?? 0}
                onChange={(v) =>
                  setMiEscenario({
                    ...miEscenario,
                    plazoPrestamoDelta: v === 0 ? undefined : v,
                  })
                }
              />
              <SliderPrestamoPorcentaje
                proyecto={proyecto}
                valor={miEscenario.prestamoPorcentaje}
                onChange={(v) => setMiEscenario({ ...miEscenario, prestamoPorcentaje: v })}
              />
            </GrupoSliders>

            <div className="flex justify-end">
              <button
                onClick={resetearMiEscenario}
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs hover:bg-secondary"
              >
                <RefreshCw className="h-3 w-3" />
                Resetear a base
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Lectura pedagógica */}
      <div className="rounded-md border border-sky-200 bg-sky-50/60 p-3 text-xs dark:border-sky-900 dark:bg-sky-950/30">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 flex-shrink-0 text-sky-600 dark:text-sky-300" />
          <div className="space-y-1">
            <p>
              <strong>¿Cómo leer esto?</strong> Si tu escenario PESIMISTA sigue con VAN positivo y
              TIR mayor al WACC, tu proyecto es <strong>robusto</strong> — soporta turbulencias.
            </p>
            <p>
              Si el VAN se hace negativo en el pesimista, hay variables que tenés que controlar
              antes de invertir: o bajás riesgo, o renegociás financiamiento, o reforzás márgenes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Subcomponentes
// ============================================================================

function SeccionTitulo({ titulo }: { titulo: string }) {
  return <h2 className="mt-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">{titulo}</h2>;
}

function TarjetaEscenario({ escenario }: { escenario: EscenarioCalculado }) {
  const color = COLORES[escenario.nombre];
  const viable = esViable(escenario.flujo);
  const ind = escenario.flujo.indicadores;
  return (
    <div
      className="rounded-lg border-l-4 border-border bg-card p-3 shadow-sm"
      style={{ borderLeftColor: color }}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold" style={{ color }}>
          {escenario.etiqueta}
        </span>
        {viable ? (
          <span className="flex items-center gap-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="h-3 w-3" />
            VIABLE
          </span>
        ) : (
          <span className="flex items-center gap-0.5 text-[10px] font-semibold text-rose-700 dark:text-rose-300">
            <XCircle className="h-3 w-3" />
            NO VIABLE
          </span>
        )}
      </div>
      <div className="mt-2 grid grid-cols-2 gap-1 text-[10px]">
        <Stat label="VAN" v={formatearBolivianos(ind.van)} />
        <Stat label="TIR" v={ind.tir !== null ? `${(ind.tir * 100).toFixed(1)}%` : "—"} />
        <Stat label="Payback" v={ind.payback !== null ? `${ind.payback.toFixed(1)} años` : "∞"} />
        <Stat label="WACC" v={`${(escenario.flujo.wacc * 100).toFixed(1)}%`} />
      </div>
      <div className="mt-2 text-[10px] text-muted-foreground">
        {resumirModificadores(escenario.modificadores)}
      </div>
    </div>
  );
}

function Stat({ label, v }: { label: string; v: string }) {
  return (
    <div className="rounded bg-secondary/40 px-1.5 py-1">
      <div className="text-[9px] uppercase text-muted-foreground">{label}</div>
      <div className="font-bold tabular-nums">{v}</div>
    </div>
  );
}

function TablaIndicadores({ escenarios }: { escenarios: EscenarioCalculado[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-xs">
        <thead className="bg-secondary">
          <tr>
            <th className="p-2 text-left font-semibold">Indicador</th>
            {escenarios.map((e) => (
              <th key={e.nombre} className="p-2 text-right font-semibold" style={{ color: COLORES[e.nombre] }}>
                {e.etiqueta}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <FilaIndicador label="VAN" escenarios={escenarios} sel={(f) => formatearBolivianos(f.indicadores.van)} />
          <FilaIndicador
            label="TIR"
            escenarios={escenarios}
            sel={(f) => (f.indicadores.tir !== null ? `${(f.indicadores.tir * 100).toFixed(2)}%` : "—")}
          />
          <FilaIndicador
            label="Payback"
            escenarios={escenarios}
            sel={(f) => (f.indicadores.payback !== null ? `${f.indicadores.payback.toFixed(2)} años` : "∞")}
          />
          <FilaIndicador label="IR (Índice de rentabilidad)" escenarios={escenarios} sel={(f) => f.indicadores.ir.toFixed(2)} />
          <FilaIndicador label="RBC (Beneficio/Costo)" escenarios={escenarios} sel={(f) => f.indicadores.rbc.toFixed(2)} />
          <FilaIndicador label="WACC" escenarios={escenarios} sel={(f) => `${(f.wacc * 100).toFixed(2)}%`} />
          <tr className="border-t-2 border-border bg-primary/5 font-bold">
            <td className="p-2">¿Viable?</td>
            {escenarios.map((e) => (
              <td key={e.nombre} className="p-2 text-right">
                {esViable(e.flujo) ? (
                  <span className="text-emerald-700 dark:text-emerald-300">✓ SÍ</span>
                ) : (
                  <span className="text-rose-700 dark:text-rose-300">✗ NO</span>
                )}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function FilaIndicador({
  label,
  escenarios,
  sel,
}: {
  label: string;
  escenarios: EscenarioCalculado[];
  sel: (flujo: EscenarioCalculado["flujo"]) => string;
}) {
  return (
    <tr className="border-b border-border/40">
      <td className="p-2 text-muted-foreground">{label}</td>
      {escenarios.map((e) => (
        <td key={e.nombre} className="p-2 text-right tabular-nums">
          {sel(e.flujo)}
        </td>
      ))}
    </tr>
  );
}

function TablaFlujoCaja({ escenarios }: { escenarios: EscenarioCalculado[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-xs">
        <thead className="bg-secondary">
          <tr>
            <th className="p-2 text-left font-semibold">Año</th>
            {escenarios.map((e) => (
              <th key={e.nombre} className="p-2 text-right font-semibold" style={{ color: COLORES[e.nombre] }}>
                {e.etiqueta}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[0, 1, 2, 3, 4, 5].map((anio) => (
            <tr key={anio} className="border-b border-border/40">
              <td className="p-2 text-muted-foreground">
                {anio === 0 ? "Año 0 (inversión)" : `Año ${anio}`}
              </td>
              {escenarios.map((e) => {
                const v = e.flujo.flujoCaja[anio] ?? 0;
                return (
                  <td
                    key={e.nombre}
                    className={cn(
                      "p-2 text-right tabular-nums",
                      v >= 0 ? "text-foreground" : "text-rose-700 dark:text-rose-300"
                    )}
                  >
                    {formatearBolivianos(v)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================================
// Sliders
// ============================================================================

function GrupoSliders({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{titulo}</div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </div>
  );
}

function SliderPorcentual({
  label,
  ayuda,
  valor,
  onChange,
}: {
  label: string;
  ayuda: string;
  valor: number;
  onChange: (v: number) => void;
}) {
  // Rango: 0.5 a 1.5 (es decir, de -50% a +50%).
  const pct = Math.round((valor - 1) * 100);
  return (
    <div className="rounded-md border border-border bg-background/60 p-2">
      <div className="flex items-center justify-between text-[11px] font-medium">
        <span>{label}</span>
        <span className={cn("tabular-nums", pct > 0 ? "text-emerald-600" : pct < 0 ? "text-rose-600" : "text-muted-foreground")}>
          {pct > 0 ? "+" : ""}{pct}%
        </span>
      </div>
      <input
        type="range"
        min={0.5}
        max={1.5}
        step={0.01}
        value={valor}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full"
      />
      <p className="mt-0.5 text-[9px] text-muted-foreground">{ayuda}</p>
    </div>
  );
}

function SliderTasaInteres({ valor, onChange }: { valor: number; onChange: (v: number) => void }) {
  // Delta en puntos porcentuales. Rango: -5pp a +10pp.
  const pp = Math.round(valor * 1000) / 10; // a 1 decimal
  return (
    <div className="rounded-md border border-border bg-background/60 p-2">
      <div className="flex items-center justify-between text-[11px] font-medium">
        <span>Tasa de préstamo</span>
        <span className={cn("tabular-nums", pp > 0 ? "text-rose-600" : pp < 0 ? "text-emerald-600" : "text-muted-foreground")}>
          {pp > 0 ? "+" : ""}{pp}pp
        </span>
      </div>
      <input
        type="range"
        min={-0.05}
        max={0.10}
        step={0.005}
        value={valor}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full"
      />
      <p className="mt-0.5 text-[9px] text-muted-foreground">
        Suma o resta a la tasa del préstamo. +3pp simula riesgo país alto.
      </p>
    </div>
  );
}

function SliderPlazo({ valor, onChange }: { valor: number; onChange: (v: number) => void }) {
  return (
    <div className="rounded-md border border-border bg-background/60 p-2">
      <div className="flex items-center justify-between text-[11px] font-medium">
        <span>Plazo del préstamo</span>
        <span className={cn("tabular-nums", valor > 0 ? "text-emerald-600" : valor < 0 ? "text-rose-600" : "text-muted-foreground")}>
          {valor > 0 ? "+" : ""}{valor} meses
        </span>
      </div>
      <input
        type="range"
        min={-36}
        max={36}
        step={6}
        value={valor}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 w-full"
      />
      <p className="mt-0.5 text-[9px] text-muted-foreground">
        Más plazo = cuotas más chicas pero más intereses totales.
      </p>
    </div>
  );
}

function SliderPrestamoPorcentaje({
  proyecto,
  valor,
  onChange,
}: {
  proyecto: Proyecto;
  valor: number | undefined;
  onChange: (v: number | undefined) => void;
}) {
  const original = Math.round((proyecto.financiamiento?.porcentajePrestamo ?? 0) * 100);
  const usado = valor !== undefined ? Math.round(valor * 100) : original;
  return (
    <div className="rounded-md border border-border bg-background/60 p-2">
      <div className="flex items-center justify-between text-[11px] font-medium">
        <span>% financiado con préstamo</span>
        <span className="tabular-nums">{usado}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={5}
        value={usado}
        onChange={(e) => {
          const v = Number(e.target.value) / 100;
          onChange(Math.abs(v - proyecto.financiamiento?.porcentajePrestamo) < 0.005 ? undefined : v);
        }}
        className="mt-1 w-full"
      />
      <p className="mt-0.5 text-[9px] text-muted-foreground">
        Original: {original}%. Más préstamo = más apalancamiento + más riesgo.
      </p>
    </div>
  );
}

// ============================================================================
// Helpers
// ============================================================================

function sonNeutrales(m: ModificadoresEscenario): boolean {
  return (
    m.precioMul === 1 &&
    m.demandaMul === 1 &&
    m.costoDirectoMul === 1 &&
    m.costoGeneralMul === 1 &&
    m.personalMul === 1 &&
    m.inversionMul === 1 &&
    m.capitalTrabajoMul === 1 &&
    (m.tasaInteresDeltaPp ?? 0) === 0 &&
    (m.plazoPrestamoDelta ?? 0) === 0 &&
    m.prestamoPorcentaje === undefined
  );
}

function resumirModificadores(m: ModificadoresEscenario): string {
  const partes: string[] = [];
  const pct = (v: number) => `${v > 0 ? "+" : ""}${Math.round(v * 100)}%`;
  if (m.precioMul !== 1) partes.push(`Precio ${pct(m.precioMul - 1)}`);
  if (m.demandaMul !== 1) partes.push(`Demanda ${pct(m.demandaMul - 1)}`);
  if (m.costoDirectoMul !== 1) partes.push(`C.directos ${pct(m.costoDirectoMul - 1)}`);
  if (m.costoGeneralMul !== 1) partes.push(`C.generales ${pct(m.costoGeneralMul - 1)}`);
  if (m.personalMul !== 1) partes.push(`Sueldos ${pct(m.personalMul - 1)}`);
  if (m.inversionMul !== 1) partes.push(`Inversión ${pct(m.inversionMul - 1)}`);
  if (m.tasaInteresDeltaPp) {
    const pp = Math.round(m.tasaInteresDeltaPp * 1000) / 10;
    partes.push(`Tasa ${pp > 0 ? "+" : ""}${pp}pp`);
  }
  return partes.length === 0 ? "Sin cambios respecto al base." : partes.join(" · ");
}
