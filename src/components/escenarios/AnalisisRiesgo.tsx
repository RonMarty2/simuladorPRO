import { fmtNum } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Dices, Loader2, ShieldAlert, ShieldCheck } from "lucide-react";
import {
  calcularTornado,
  emitirVeredicto,
  simularMontecarlo,
  tablaPrecioDemanda,
  type NivelVeredicto,
  type ResultadoMontecarlo,
} from "@/lib/analisis-riesgo";
import type { ModificadoresEscenario } from "@/lib/escenarios";
import { formatearBolivianos, cn } from "@/lib/utils";
import type { Proyecto } from "@/types/proyecto";

const CORRIDAS = 1000;

const ESTILO_VEREDICTO: Record<NivelVeredicto, string> = {
  robusto:
    "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200",
  sensible:
    "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200",
  riesgoso:
    "border-orange-300 bg-orange-50 text-orange-900 dark:border-orange-800 dark:bg-orange-950/30 dark:text-orange-200",
  inviable:
    "border-red-300 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200",
};

function corto(v: number) {
  const abs = Math.abs(v);
  if (abs >= 1_000_000) return `${fmtNum((v / 1_000_000), 1)}M`;
  if (abs >= 1_000) return `${fmtNum((v / 1_000), 0)}k`;
  return `${Math.round(v)}`;
}

function pct(v: number) {
  return `${v > 0 ? "+" : ""}${Math.round(v * 100)}%`;
}

export default function AnalisisRiesgo({
  proyecto,
  optimista,
  pesimista,
}: {
  proyecto: Proyecto;
  optimista: ModificadoresEscenario;
  pesimista: ModificadoresEscenario;
}) {
  const [semilla, setSemilla] = useState(20260101);
  const [progreso, setProgreso] = useState(0);
  const [mc, setMc] = useState<ResultadoMontecarlo | null>(null);

  const tornado = useMemo(() => calcularTornado(proyecto, 0.1), [proyecto]);
  const tabla = useMemo(() => tablaPrecioDemanda(proyecto), [proyecto]);
  const veredicto = useMemo(() => emitirVeredicto(tornado, mc), [tornado, mc]);

  // Montecarlo corre solo al abrir el panel y cada vez que cambia el proyecto o
  // la configuración de escenarios. `cancelado` evita pisar el resultado con
  // una corrida vieja si el usuario cambia de proyecto a mitad de camino.
  useEffect(() => {
    let cancelado = false;
    setMc(null);
    setProgreso(0);
    simularMontecarlo(proyecto, {
      corridas: CORRIDAS,
      semilla,
      optimista,
      pesimista,
      onProgreso: (f) => {
        if (!cancelado) setProgreso(f);
      },
    })
      .then((r) => {
        if (!cancelado) setMc(r);
      })
      .catch(() => {
        if (!cancelado) setMc(null);
      });
    return () => {
      cancelado = true;
    };
  }, [proyecto, optimista, pesimista, semilla]);

  const datosTornado = useMemo(
    () =>
      [...tornado.filas]
        .reverse()
        .map((f) => ({ variable: f.variable, rango: [f.vanBajo, f.vanAlto] as [number, number] })),
    [tornado]
  );

  const datosHistograma = useMemo(
    () =>
      (mc?.histograma ?? []).map((b) => ({
        etiqueta: corto((b.desde + b.hasta) / 2),
        centro: (b.desde + b.hasta) / 2,
        cantidad: b.cantidad,
      })),
    [mc]
  );

  const Icono = veredicto.nivel === "robusto" ? ShieldCheck : ShieldAlert;
  const extremosTabla = tabla.valores.flat();
  const maxAbs = Math.max(1, ...extremosTabla.map((v) => Math.abs(v)));

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold tracking-tight">Análisis de riesgo</h2>
        <p className="text-sm text-muted-foreground">
          Qué variables mueven más tu VAN y qué tan probable es que el proyecto funcione.
        </p>
      </div>

      {/* Veredicto */}
      <div className={cn("flex items-start gap-3 rounded-lg border p-4", ESTILO_VEREDICTO[veredicto.nivel])}>
        <Icono className="mt-0.5 h-6 w-6 flex-shrink-0" />
        <div>
          <div className="text-base font-bold">Veredicto de riesgo: {veredicto.titulo}</div>
          <div className="text-sm">{veredicto.detalle}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Tornado */}
        <div className="rounded-lg border border-border bg-card p-3">
          <h3 className="text-sm font-semibold">Qué variable mueve más el VAN</h3>
          <p className="mb-2 text-xs text-muted-foreground">
            Cada barra muestra el VAN cuando la variable cambia ±{Math.round(tornado.variacion * 100)}%.
            La línea es el VAN actual ({formatearBolivianos(tornado.vanBase)}).
          </p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={datosTornado} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={corto} />
              <YAxis type="category" dataKey="variable" width={120} tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(v: number[]) => `${formatearBolivianos(v[0])} a ${formatearBolivianos(v[1])}`}
              />
              <ReferenceLine x={tornado.vanBase} stroke="#64748b" strokeDasharray="4 3" />
              <ReferenceLine x={0} stroke="#ef4444" />
              <Bar dataKey="rango" fill="#3b82f6" radius={3} />
            </BarChart>
          </ResponsiveContainer>
          <p className="mt-1 text-xs text-muted-foreground">
            La línea roja es VAN = 0: si una barra la cruza, esa variable puede volver inviable tu proyecto.
          </p>
        </div>

        {/* Montecarlo */}
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold">Simulación de riesgo ({CORRIDAS.toLocaleString("es-BO")} futuros)</h3>
              <p className="mb-2 text-xs text-muted-foreground">
                Cada futuro mezcla al azar precios, demanda y costos entre tu escenario pesimista y el optimista.
              </p>
            </div>
            <button
              onClick={() => setSemilla((s) => s + 1)}
              disabled={!mc}
              className="inline-flex flex-shrink-0 items-center gap-1 rounded-md border border-border px-2 py-1 text-xs hover:bg-secondary disabled:opacity-50"
            >
              <Dices className="h-3.5 w-3.5" /> Otra tirada
            </button>
          </div>

          {!mc ? (
            <div className="flex h-[280px] flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              Simulando… {Math.round(progreso * 100)}%
            </div>
          ) : (
            <>
              <div className="mb-2 grid grid-cols-3 gap-2 text-center">
                <Dato titulo="VAN positivo" valor={`${Math.round(mc.probVanPositivo * 100)}%`} destacado />
                <Dato titulo="Caso pesimista (5%)" valor={formatearBolivianos(mc.p5)} />
                <Dato titulo="Caso optimista (95%)" valor={formatearBolivianos(mc.p95)} />
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={datosHistograma} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="etiqueta" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                  <Tooltip
                    formatter={(v: number) => [`${v} de ${mc.corridas} futuros`, "Frecuencia"]}
                    labelFormatter={(l) => `VAN cercano a ${l}`}
                  />
                  <Bar dataKey="cantidad" radius={2}>
                    {datosHistograma.map((d, i) => (
                      <Cell key={i} fill={d.centro >= 0 ? "#10b981" : "#ef4444"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <p className="mt-1 text-xs text-muted-foreground">
                Verde: futuros donde el VAN es positivo. Rojo: futuros donde se pierde. VAN medio:{" "}
                {formatearBolivianos(mc.media)}.
              </p>
            </>
          )}
        </div>
      </div>

      {/* Tabla de dos variables */}
      <div className="rounded-lg border border-border bg-card p-3">
        <h3 className="text-sm font-semibold">VAN según precio y demanda</h3>
        <p className="mb-2 text-xs text-muted-foreground">
          Filas: cambio en el precio. Columnas: cambio en la demanda. Verde = VAN positivo, rojo = negativo.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[460px] border-collapse text-center text-xs">
            <thead>
              <tr>
                <th className="p-1.5 text-left text-muted-foreground">Precio \ Demanda</th>
                {tabla.cambiosColumna.map((c) => (
                  <th key={c} className="p-1.5 font-semibold">
                    {pct(c)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tabla.valores.map((fila, i) => (
                <tr key={i}>
                  <th className="p-1.5 text-left font-semibold">{pct(tabla.cambiosFila[i])}</th>
                  {fila.map((v, j) => {
                    const intensidad = 0.12 + 0.5 * Math.min(1, Math.abs(v) / maxAbs);
                    const base = tabla.cambiosFila[i] === 0 && tabla.cambiosColumna[j] === 0;
                    return (
                      <td
                        key={j}
                        className={cn("border border-background p-1.5 font-medium", base && "ring-2 ring-primary ring-inset")}
                        style={{
                          backgroundColor:
                            v >= 0
                              ? `rgba(16,185,129,${intensidad})`
                              : `rgba(239,68,68,${intensidad})`,
                        }}
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
      </div>
    </div>
  );
}

function Dato({ titulo, valor, destacado }: { titulo: string; valor: string; destacado?: boolean }) {
  return (
    <div className="rounded-md bg-secondary/60 p-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{titulo}</div>
      <div className={cn("font-bold", destacado ? "text-lg" : "text-sm")}>{valor}</div>
    </div>
  );
}
