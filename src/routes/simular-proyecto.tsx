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
import { listarMisProyectos, listarProyectosGrupales } from "@/lib/proyecto-supabase";
import { formatearBolivianos, cn } from "@/lib/utils";
import { mesesPorTurno } from "@/lib/motor-eventos";
import { useIntervaloVisible } from "@/hooks/useIntervaloVisible";
import type { OpcionDecision } from "@/types/evento";
import type { Proyecto } from "@/types/proyecto";

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
  const refrescarSiHayEventoForzado = useSimulacionStore(
    (s) => s.refrescarSiHayEventoForzado
  );
  const [opcionSeleccionada, setOpcionSeleccionada] = useState<OpcionDecision | null>(null);
  const [iniciando, setIniciando] = useState(true);
  const [proyectosDisponibles, setProyectosDisponibles] = useState<Proyecto[]>([]);

  // Cargar TODOS los proyectos del usuario al entrar: los propios + los
  // grupales (proyecto compartido del grupo). El alumno puede tener varios y
  // elige cuál simular con el selector de arriba.
  useEffect(() => {
    if (!user) return;
    Promise.all([listarMisProyectos(user.id), listarProyectosGrupales(user.id)])
      .then(([mios, grupales]) => {
        // Deduplicar por id (el creador del grupo aparece en ambas listas).
        const ids = new Set(mios.map((p) => p.id));
        const todos = [...mios, ...grupales.filter((g) => !ids.has(g.id))];
        // El "caso del curso" del docente (caso_curso) no se simula — es la
        // plantilla original. Lo sacamos del selector. Los entrega_estudiante
        // (la copia del alumno) sí se simulan.
        const simulables = todos.filter((p) => p.tipo !== "caso_curso");
        setProyectosDisponibles(simulables);
        // Si todavía no hay proyecto activo, cargar el primero.
        if (simulables.length > 0 && !proyecto) {
          cargarProyecto(simulables[0]);
        }
      })
      .finally(() => setIniciando(false));
  }, [user, cargarProyecto, proyecto]);

  // Inicializar simulación cuando hay proyecto, o cuando el alumno cambia de
  // proyecto en el selector (la sim cargada corresponde al proyecto anterior).
  useEffect(() => {
    if (!proyecto) return;
    if (!sim || sim.proyecto_id !== proyecto.id) {
      inicializar(proyecto, "mensual");
    }
  }, [proyecto, sim, inicializar]);

  // Polling: cada 8 segundos verifica si el docente disparó un evento en vivo
  // mientras el alumno tenía la pantalla abierta sin tomar decisiones. Solo
  // mientras la pestaña está visible (useIntervaloVisible).
  useIntervaloVisible(
    () => {
      if (proyecto && sim?.estado === "activa") {
        refrescarSiHayEventoForzado(proyecto);
      }
    },
    8000
  );

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
      {/* Selector de proyecto: el alumno elige cuál de sus proyectos simular
          (caso del curso / individual / grupal). Solo aparece si tiene 2 o más.
          NO abandonamos la simulación anterior — queda guardada por si el
          alumno vuelve. El useEffect detecta el cambio de proyecto y carga la
          simulación correspondiente (o crea una nueva si no existe). */}
      {proyectosDisponibles.length > 1 && (
        <SelectorProyectoSimular
          proyectos={proyectosDisponibles}
          activoId={proyecto.id}
          onCambiar={(p) => cargarProyecto(p)}
        />
      )}

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
        <div
          className={
            sim?.evento_forzado_id
              ? "rounded-lg border-2 border-amber-400 bg-gradient-to-br from-amber-50 to-orange-50 p-6 shadow-md dark:from-amber-950/30 dark:to-orange-950/30"
              : "rounded-lg border border-border bg-card p-6"
          }
        >
          {sim?.evento_forzado_id && (
            <div className="mb-3 flex items-center gap-2 rounded-md bg-amber-200/60 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-900 dark:bg-amber-800/40 dark:text-amber-100">
              🎲 SITUACIÓN LANZADA POR TU DOCENTE EN VIVO
            </div>
          )}
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

// ============================================================================
// SelectorProyectoSimular — pills con los proyectos del alumno
// ============================================================================
function SelectorProyectoSimular({
  proyectos,
  activoId,
  onCambiar,
}: {
  proyectos: Proyecto[];
  activoId: string;
  onCambiar: (p: Proyecto) => void;
}) {
  const tipoMeta = (p: Proyecto) => {
    if (p.tipo === "proyecto_grupal") {
      return { emoji: "🤝", label: "Grupal", clase: "border-violet-400 bg-violet-50 text-violet-900 dark:bg-violet-950/40 dark:text-violet-100" };
    }
    if (p.caso_origen_id) {
      // copia del caso del docente — viene de un caso_curso
      return { emoji: "🎓", label: "Caso del curso", clase: "border-emerald-400 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100" };
    }
    return { emoji: "📁", label: "Individual", clase: "border-sky-400 bg-sky-50 text-sky-900 dark:bg-sky-950/40 dark:text-sky-100" };
  };

  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        ¿Qué proyecto querés simular?
      </div>
      <div className="flex flex-wrap gap-1.5">
        {proyectos.map((p) => {
          const meta = tipoMeta(p);
          const activo = p.id === activoId;
          return (
            <button
              key={p.id}
              onClick={() => !activo && onCambiar(p)}
              className={cn(
                "flex items-center gap-1.5 rounded-md border-2 px-2.5 py-1.5 text-xs transition",
                activo
                  ? "border-primary bg-primary text-primary-foreground shadow"
                  : `${meta.clase} hover:border-primary`
              )}
              title={`${meta.label} — ${p.nombre}`}
            >
              <span>{meta.emoji}</span>
              <span className="max-w-[160px] truncate font-semibold">{p.nombre}</span>
              <span className="rounded bg-black/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider dark:bg-white/10">
                {meta.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
