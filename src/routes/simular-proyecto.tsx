import { useEffect, useState } from "react";
import { ChevronRight, Newspaper, PlayCircle, Trophy, XCircle } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAuthStore } from "@/stores/auth-store";
import { useProyectoStore } from "@/stores/proyecto-store";
import { useSimulacionStore } from "@/stores/simulacion-store";
import { listarMisProyectos } from "@/lib/proyecto-supabase";
import { formatearBolivianos } from "@/lib/utils";
import { mesesPorTurno } from "@/lib/motor-eventos";
import type { OpcionDecision } from "@/types/evento";

export default function SimularProyecto() {
  const user = useAuthStore((s) => s.user);
  const proyecto = useProyectoStore((s) => s.proyecto);
  const cargarProyecto = useProyectoStore((s) => s.cargar);
  const sim = useSimulacionStore((s) => s.simulacion);
  const eventoActual = useSimulacionStore((s) => s.eventoActual);
  const historial = useSimulacionStore((s) => s.historial);
  const cargando = useSimulacionStore((s) => s.cargando);
  const error = useSimulacionStore((s) => s.error);
  const inicializar = useSimulacionStore((s) => s.inicializar);
  const decidirYAvanzar = useSimulacionStore((s) => s.decidirYAvanzar);
  const abandonar = useSimulacionStore((s) => s.abandonar);
  const [opcionSeleccionada, setOpcionSeleccionada] = useState<OpcionDecision | null>(null);
  const [iniciando, setIniciando] = useState(true);

  // Cargar proyecto del usuario al entrar
  useEffect(() => {
    if (!user) return;
    listarMisProyectos(user.id)
      .then((proyectos) => {
        if (proyectos.length > 0) cargarProyecto(proyectos[0]);
      })
      .finally(() => setIniciando(false));
  }, [user, cargarProyecto]);

  // Inicializar simulación cuando hay proyecto
  useEffect(() => {
    if (proyecto && !sim) {
      inicializar(proyecto, "mensual");
    }
  }, [proyecto, sim, inicializar]);

  const aplicarDecision = async () => {
    if (!proyecto) return;
    await decidirYAvanzar(proyecto, opcionSeleccionada);
    setOpcionSeleccionada(null);
  };

  if (iniciando) {
    return <div className="text-sm text-muted-foreground">Cargando…</div>;
  }

  if (!proyecto) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        Primero construye un proyecto antes de simular.
      </div>
    );
  }

  if (!sim) {
    return (
      <div className="text-sm text-muted-foreground">
        {error ? `Error: ${error}` : "Preparando simulación…"}
      </div>
    );
  }

  // Pantalla de finalización
  if (sim.estado !== "activa") {
    return <PantallaFinalizada simulacion={sim} historial={historial} onAbandonar={abandonar} />;
  }

  const meses = mesesPorTurno(sim.frecuencia);
  const mesActual = sim.turno_actual * meses + 1;
  const mesesTotales = sim.turnos_totales * meses;
  const progreso = (sim.turno_actual / sim.turnos_totales) * 100;

  return (
    <div className="space-y-4">
      {/* Header con turno y métricas */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              Simulación · {proyecto.nombre}
            </div>
            <div className="text-base font-semibold tracking-tight">
              Mes {mesActual} de {mesesTotales}
            </div>
          </div>
          <button
            onClick={abandonar}
            className="text-xs text-muted-foreground transition hover:text-destructive"
          >
            Abandonar simulación
          </button>
        </div>
        <div className="mt-2 h-1.5 w-full rounded bg-muted">
          <div className="h-full rounded bg-primary transition-all" style={{ width: `${progreso}%` }} />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Metrica
            titulo="Caja"
            valor={formatearBolivianos(sim.estado_actual.caja)}
            delta={sim.estado_actual.delta_caja}
            positivo={sim.estado_actual.caja > 0}
          />
          <Metrica
            titulo="Ingresos acum."
            valor={formatearBolivianos(sim.estado_actual.ingresos_acumulados)}
            positivo
          />
          <Metrica
            titulo="Utilidad acum."
            valor={formatearBolivianos(sim.estado_actual.utilidad_acumulada)}
            positivo={sim.estado_actual.utilidad_acumulada >= 0}
          />
          <Metrica
            titulo="Reputación"
            valor={`${(sim.estado_actual.reputacion * 100).toFixed(0)}%`}
            positivo={sim.estado_actual.reputacion >= 0.5}
          />
        </div>
      </div>

      {/* Evento del mes */}
      {eventoActual ? (
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
            <Newspaper className="h-3.5 w-3.5" />
            Noticia del mes — {eventoActual.codigo}
          </div>
          <h2 className="text-lg font-semibold tracking-tight">{eventoActual.titulo}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{eventoActual.descripcion}</p>

          <div className="mt-5 space-y-2">
            <div className="text-sm font-medium">¿Qué decides?</div>
            {eventoActual.opciones_decision.map((op) => (
              <label
                key={op.letra}
                className={`flex cursor-pointer gap-3 rounded-md border p-3 transition ${
                  opcionSeleccionada?.letra === op.letra
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-accent"
                }`}
              >
                <input
                  type="radio"
                  name="decision"
                  checked={opcionSeleccionada?.letra === op.letra}
                  onChange={() => setOpcionSeleccionada(op)}
                  className="mt-1"
                />
                <div className="flex-1 text-sm">
                  <div className="font-medium">
                    {op.letra}. {op.texto}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card p-6 text-center">
          <div className="text-sm font-medium">Mes tranquilo — sin eventos relevantes</div>
          <p className="mt-1 text-xs text-muted-foreground">
            Tu negocio opera con normalidad este mes.
          </p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          {sim.estado_actual.ultimo_feedback && (
            <>
              <span className="font-medium">Último turno: </span>
              {sim.estado_actual.ultimo_feedback}
            </>
          )}
        </div>
        <button
          onClick={aplicarDecision}
          disabled={cargando || (!!eventoActual && !opcionSeleccionada)}
          className="flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
        >
          {eventoActual ? "Aplicar decisión y avanzar" : "Avanzar turno"}
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Historial visual */}
      {historial.length > 0 && <GraficosHistorial historial={historial} />}
    </div>
  );
}

function Metrica({
  titulo,
  valor,
  delta,
  positivo,
}: {
  titulo: string;
  valor: string;
  delta?: number;
  positivo: boolean;
}) {
  return (
    <div className="rounded-md border border-border p-2">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{titulo}</div>
      <div
        className={`text-sm font-semibold ${
          positivo ? "text-foreground" : "text-destructive"
        }`}
      >
        {valor}
      </div>
      {delta !== undefined && Math.abs(delta) > 0.01 && (
        <div
          className={`text-[10px] ${
            delta > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"
          }`}
        >
          {delta > 0 ? "+" : ""}
          {formatearBolivianos(delta)}
        </div>
      )}
    </div>
  );
}

function GraficosHistorial({ historial }: { historial: ReturnType<typeof useSimulacionStore.getState>["historial"] }) {
  const datos = historial.map((h) => ({
    turno: h.numero_turno,
    caja: h.estado_despues.caja,
    utilidad: h.estado_despues.utilidad_acumulada,
    delta: h.estado_despues.delta_caja,
  }));

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="mb-2 text-xs font-medium">Evolución de caja</h3>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={datos}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="turno" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
            <Tooltip
              formatter={(v: number) => formatearBolivianos(v)}
              labelFormatter={(l) => `Turno ${l}`}
            />
            <Line type="monotone" dataKey="caja" stroke="hsl(var(--primary))" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="mb-2 text-xs font-medium">Resultado por turno</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={datos}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="turno" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
            <Tooltip
              formatter={(v: number) => formatearBolivianos(v)}
              labelFormatter={(l) => `Turno ${l}`}
            />
            <Bar dataKey="delta" fill="hsl(var(--primary))" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function PantallaFinalizada({
  simulacion,
  historial,
  onAbandonar,
}: {
  simulacion: ReturnType<typeof useSimulacionStore.getState>["simulacion"];
  historial: ReturnType<typeof useSimulacionStore.getState>["historial"];
  onAbandonar: () => Promise<void>;
}) {
  if (!simulacion) return null;
  const quebrada = simulacion.estado === "quebrada";
  return (
    <div className="space-y-4">
      <div
        className={`rounded-lg border p-6 text-center ${
          quebrada
            ? "border-destructive bg-destructive/5"
            : "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30"
        }`}
      >
        {quebrada ? (
          <>
            <XCircle className="mx-auto h-10 w-10 text-destructive" />
            <h2 className="mt-3 text-lg font-semibold">Simulación quebrada</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Tu caja se quedó en negativo en el mes {simulacion.turno_actual}. El proyecto no
              pudo sostenerse.
            </p>
          </>
        ) : (
          <>
            <Trophy className="mx-auto h-10 w-10 text-emerald-600 dark:text-emerald-400" />
            <h2 className="mt-3 text-lg font-semibold">Simulación completa</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Llegaste al final de los {simulacion.turnos_totales} turnos.
            </p>
          </>
        )}

        <div className="mx-auto mt-5 grid max-w-md grid-cols-2 gap-3">
          <ResumenCelda titulo="Caja final" valor={formatearBolivianos(simulacion.estado_actual.caja)} />
          <ResumenCelda
            titulo="Utilidad total"
            valor={formatearBolivianos(simulacion.estado_actual.utilidad_acumulada)}
          />
          <ResumenCelda
            titulo="Ingresos totales"
            valor={formatearBolivianos(simulacion.estado_actual.ingresos_acumulados)}
          />
          <ResumenCelda
            titulo="Reputación final"
            valor={`${(simulacion.estado_actual.reputacion * 100).toFixed(0)}%`}
          />
        </div>

        <button
          onClick={onAbandonar}
          className="mt-5 inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
        >
          <PlayCircle className="h-4 w-4" />
          Empezar nueva simulación
        </button>
      </div>

      {historial.length > 0 && <GraficosHistorial historial={historial} />}
    </div>
  );
}

function ResumenCelda({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div className="rounded-md border border-border bg-card p-3 text-left">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{titulo}</div>
      <div className="text-sm font-semibold">{valor}</div>
    </div>
  );
}
