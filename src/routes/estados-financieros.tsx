import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  FileSpreadsheet,
  GitBranch,
  Landmark,
  Layers,
  Scale,
  TrendingUp,
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

export default function EstadosFinancierosRoute() {
  const proyecto = useProyectoStore((s) => s.proyecto);
  const cargarProyecto = useProyectoStore((s) => s.cargar);
  const user = useAuthStore((s) => s.user);
  const [disponibles, setDisponibles] = useState<Proyecto[] | null>(null);
  const [pestana, setPestana] = useState<PestanaContable>("balance");

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
          <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            Cuadre contable exacto (Activo = Pasivo + Patrimonio)
          </div>
        </div>

        {/* Barra de sub-pestañas */}
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            {
              id: "balance" as const,
              titulo: "1. Balance de Apertura y General",
              sub: "Partida doble Año 0 a 5",
              icon: Scale,
            },
            {
              id: "resultados" as const,
              titulo: "2. Estado de Resultados",
              sub: "EBITDA · EBIT · Utilidad Neta",
              icon: FileSpreadsheet,
            },
            {
              id: "flujos" as const,
              titulo: "3. Flujos de Efectivo",
              sub: "Operación · Inversión · Deuda",
              icon: Layers,
            },
            {
              id: "ratios" as const,
              titulo: "4. Ratios y Sistema DuPont",
              sub: "ROE · ROA · Liquidez · Solvencia",
              icon: GitBranch,
            },
          ].map((tab) => {
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
