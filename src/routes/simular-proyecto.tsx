import { fmtNum } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Newspaper, PlayCircle, Trophy, XCircle, AlertTriangle } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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
import { listarMisInscripciones, type Curso } from "@/lib/cursos-supabase";
import { formatearBolivianos, cn } from "@/lib/utils";
import { calcularBaseProyecto, mesesPorTurno, resumenGolpeEvento } from "@/lib/motor-eventos";
import { construirFlujoCaja } from "@/lib/flujo-proyecto";
import { tirCalculable } from "@/lib/acotar-numero";
import { useIntervaloVisible } from "@/hooks/useIntervaloVisible";
import PanelPostmortem from "@/components/simulacion/PanelPostmortem";
import type { OpcionDecision } from "@/types/evento";
import type { Proyecto } from "@/types/proyecto";
import { confirmar } from "@/components/ui/confirmar";
import { NOMBRES_MES } from "@/lib/estacionalidad";

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
  // Proyecto para el que el alumno ya pasó la pantalla de bienvenida. Se guarda
  // el id (no un booleano) para que al cambiar de proyecto vuelva a mostrarse.
  const [bienvenidaVista, setBienvenidaVista] = useState<string | null>(null);
  const [proyectosDisponibles, setProyectosDisponibles] = useState<Proyecto[]>([]);

  // Cargar TODOS los proyectos del usuario al entrar + los cursos donde está
  // inscrito (necesario para filtrar qué tipos se pueden simular según la
  // configuración del docente — FASE 23).
  useEffect(() => {
    if (!user) return;
    Promise.all([
      listarMisProyectos(user.id),
      listarProyectosGrupales(user.id),
      listarMisInscripciones(user.id).catch(() => [] as Array<{ curso: Curso }>),
    ])
      .then(([mios, grupales, inscripciones]) => {
        // Deduplicar por id (el creador del grupo aparece en ambas listas).
        const ids = new Set(mios.map((p) => p.id));
        const todos = [...mios, ...grupales.filter((g) => !ids.has(g.id))];

        // Mapa cursoId → flags de simulación habilitada.
        const flagsCurso = new Map<
          string,
          { caso: boolean; individual: boolean; grupal: boolean }
        >();
        for (const ins of inscripciones) {
          flagsCurso.set(ins.curso.id, {
            caso: ins.curso.simulacion_caso_curso ?? true,
            individual: ins.curso.simulacion_individual ?? false,
            grupal: ins.curso.simulacion_grupal ?? true,
          });
        }

        const simulables = todos.filter((p) => {
          // 1) El caso_curso (plantilla del docente) nunca se simula.
          if (p.tipo === "caso_curso") return false;
          // 2) Proyectos sin curso (libres puros): siempre simulables (no
          // tienen docente que limite).
          if (!p.curso_id) return true;
          const flags = flagsCurso.get(p.curso_id);
          if (!flags) return true; // por seguridad: si no encontramos el curso, no escondemos
          // 3) Filtrar según el tipo y los flags del curso.
          if (p.tipo === "proyecto_grupal") return flags.grupal;
          if (p.caso_origen_id) return flags.caso; // entrega_estudiante = caso del curso
          return flags.individual; // libre dentro de un curso = individual
        });

        setProyectosDisponibles(simulables);
        // Si el proyecto activo ya no está en la lista (ej. el docente
        // deshabilitó el tipo), cargar el primero disponible. Si no hay
        // ninguno, dejar null.
        if (simulables.length > 0) {
          const activoSigueValido = proyecto && simulables.some((p) => p.id === proyecto.id);
          if (!activoSigueValido) cargarProyecto(simulables[0]);
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
      <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground shadow-2xs">
        <p>
          {proyectosDisponibles.length === 0
            ? "Por ahora no tienes ningún proyecto habilitado para simular. Puedes clonar un proyecto de la galería o crear uno nuevo en el constructor."
            : "Primero construye un proyecto antes de simular."}
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <Link
            to="/ejemplos"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-2xs transition hover:bg-primary/90"
          >
            Explorar galería de ejemplos
          </Link>
          <Link
            to="/construir"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary px-4 py-2 text-xs font-semibold text-foreground transition hover:bg-secondary/80"
          >
            Crear proyecto en Constructor
          </Link>
        </div>
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

  // Bienvenida: solo si la simulación es nueva (ningún turno jugado todavía).
  if (
    sim.estado === "activa" &&
    sim.turno_actual === 0 &&
    historial.length === 0 &&
    bienvenidaVista !== proyecto.id
  ) {
    return (
      <PantallaInicio
        proyecto={proyecto}
        turnosTotales={sim.turnos_totales}
        frecuencia={sim.frecuencia}
        onComenzar={() => setBienvenidaVista(proyecto.id)}
      />
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
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Simulación · {proyecto.nombre}
            </div>
            <div className="font-display text-xl font-bold tracking-tight">
              Mes {mesActual} de {mesesTotales}
            </div>
          </div>
          <button
            onClick={async () => {
              if (await confirmar("¿Abandonar la simulación? Se perderá el avance de esta simulación.", { textoOk: "Abandonar", peligro: true })) {
                abandonar();
              }
            }}
            className="rounded-md border border-border px-2.5 py-1 text-xs text-muted-foreground transition hover:border-destructive/40 hover:text-destructive"
          >
            Abandonar simulación
          </button>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div className="h-full rounded-full bg-primary transition-all duration-300" style={{ width: `${progreso}%` }} />
        </div>
        <div className={`mt-3 grid grid-cols-2 gap-3 ${sim.estado_actual.socios !== undefined || sim.estado_actual.mora_multiplicador !== undefined || sim.estado_actual.factor_estacional !== undefined || sim.estado_actual.presupuesto_multiplicador !== undefined || sim.estado_actual.eficacia_multiplicador !== undefined || sim.estado_actual.ocupacion_relativa !== undefined || sim.estado_actual.impagos_multiplicador !== undefined || sim.estado_actual.merma_multiplicador !== undefined ? "md:grid-cols-5" : "md:grid-cols-4"}`}>
          <Metrica
            titulo="Caja"
            valor={formatearBolivianos(sim.estado_actual.caja)}
            delta={sim.estado_actual.delta_caja}
            positivo={sim.estado_actual.caja > 0}
          />
          <Metrica
            titulo={sim.estado_actual.presupuesto_multiplicador !== undefined ? "Fondos recibidos" : "Ingresos acum."}
            valor={formatearBolivianos(sim.estado_actual.ingresos_acumulados)}
            positivo
          />
          <Metrica
            titulo={sim.estado_actual.presupuesto_multiplicador !== undefined ? "Fondos menos gastos" : "Utilidad acum."}
            valor={formatearBolivianos(sim.estado_actual.utilidad_acumulada)}
            positivo={sim.estado_actual.utilidad_acumulada >= 0}
          />
          <Metrica
            titulo="Reputación"
            valor={`${fmtNum((sim.estado_actual.reputacion * 100), 0)}%`}
            positivo={sim.estado_actual.reputacion >= 0.5}
          />
          {sim.estado_actual.socios !== undefined && (
            <Metrica
              titulo="Socios activos"
              valor={fmtNum(sim.estado_actual.socios, 0)}
              detalle={
                sim.estado_actual.altas_mes !== undefined
                  ? `+${fmtNum(sim.estado_actual.altas_mes, 0)} altas, -${fmtNum(sim.estado_actual.bajas_mes ?? 0, 0)} bajas`
                  : undefined
              }
              positivo={sim.estado_actual.socios > 0}
            />
          )}
          {sim.estado_actual.ocupacion_relativa !== undefined && (
            <Metrica
              titulo={ETIQUETA_OCUPACION[sim.estado_actual.tipo_negocio ?? ""] ?? "Ocupación contratada"}
              valor={`${fmtNum(sim.estado_actual.ocupacion_relativa * 100, 0)}%`}
              detalle="Del plan; cambia despacio"
              positivo={sim.estado_actual.ocupacion_relativa >= 0.9}
            />
          )}
          {sim.estado_actual.merma_multiplicador !== undefined && (
            <Metrica
              titulo="Merma"
              valor={`${fmtNum(sim.estado_actual.merma_multiplicador, 1)}x`}
              detalle="Veces la prevista (desperdicio, vencidos, robos)"
              positivo={sim.estado_actual.merma_multiplicador <= 1.5}
            />
          )}
          {sim.estado_actual.impagos_multiplicador !== undefined && (
            <Metrica
              titulo={ETIQUETA_IMPAGOS[sim.estado_actual.tipo_negocio ?? ""] ?? "Impagos"}
              valor={`${fmtNum(sim.estado_actual.impagos_multiplicador, 1)}x`}
              detalle="Veces lo previsto"
              positivo={sim.estado_actual.impagos_multiplicador <= 1.5}
            />
          )}
          {sim.estado_actual.eficacia_multiplicador !== undefined && (
            <Metrica
              titulo="Beneficio logrado"
              valor={`${fmtNum(sim.estado_actual.eficacia_multiplicador * 100, 0)}%`}
              detalle="De lo que prometia el proyecto"
              positivo={sim.estado_actual.eficacia_multiplicador >= 0.85}
            />
          )}
          {sim.estado_actual.presupuesto_multiplicador !== undefined && (
            <>
              <Metrica
                titulo="Beneficio social"
                valor={formatearBolivianos(sim.estado_actual.beneficio_social_acumulado ?? 0)}
                detalle="Valor para la gente, no es plata en caja"
                positivo
              />
              <Metrica
                titulo="Cobertura del servicio"
                valor={`${fmtNum((sim.estado_actual.cobertura ?? 1) * 100, 0)}%`}
                detalle={`Fondos que llegan: ${fmtNum(sim.estado_actual.presupuesto_multiplicador * 100, 0)}% de lo previsto`}
                positivo={(sim.estado_actual.cobertura ?? 1) >= 0.85 && sim.estado_actual.presupuesto_multiplicador >= 0.85}
              />
            </>
          )}
          {sim.estado_actual.factor_estacional !== undefined && (
            <Metrica
              titulo={`Temporada · ${NOMBRES_MES[sim.estado_actual.mes_del_anio ?? 0]}`}
              valor={textoTemporada(sim.estado_actual.factor_estacional)}
              detalle={`Este mes vendes ${fmtNum(sim.estado_actual.factor_estacional * 100, 0)}% del promedio`}
              positivo={sim.estado_actual.factor_estacional >= 0.85}
            />
          )}
          {sim.estado_actual.mora_multiplicador !== undefined && (
            <Metrica
              titulo="Mora de la cartera"
              valor={textoMora(sim.estado_actual.mora_multiplicador, sim.estado_actual.mora_base)}
              detalle={`${fmtNum(sim.estado_actual.mora_multiplicador, 1)} veces la prevista`}
              positivo={sim.estado_actual.mora_multiplicador <= 1.5}
            />
          )}
        </div>
      </div>

      {/* Evento del mes */}
      {eventoActual ? (
        <div
          className={
            sim?.evento_forzado_id
              ? "rounded-xl border-2 border-amber-400 bg-amber-50/70 p-6 shadow-md dark:border-amber-700 dark:bg-amber-950/30"
              : "rounded-xl border border-border bg-card p-6 shadow-sm"
          }
        >
          {sim?.evento_forzado_id && (
            <div className="mb-3 flex items-center gap-2 rounded-md bg-amber-200/80 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-900 dark:bg-amber-900/50 dark:text-amber-100">
              SITUACIÓN LANZADA POR TU DOCENTE EN VIVO
            </div>
          )}
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <Newspaper className="h-4 w-4" />
            Noticia del mes — {eventoActual.codigo}
          </div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">{eventoActual.titulo}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{eventoActual.descripcion}</p>
          {resumenGolpeEvento(eventoActual).length > 0 && (
            <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-amber-300/80 bg-amber-50/80 p-3 text-xs leading-relaxed text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
              <div>
                <strong>Impacto macroeconómico ineludible:</strong>{" "}
                {resumenGolpeEvento(eventoActual).join(", ")}. Tu decisión puede mitigar el impacto o aprovechar la coyuntura.
              </div>
            </div>
          )}

          <div className="mt-6 space-y-3">
            <div className="font-display text-base font-bold text-foreground flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-xs">?</span>
              ¿Qué decides para el mes?
            </div>
            {eventoActual.opciones_decision.map((op) => {
              const elegida = opcionSeleccionada?.letra === op.letra;
              return (
                <label
                  key={op.letra}
                  className={cn(
                    "flex cursor-pointer items-start gap-3.5 rounded-xl border p-4 transition-all duration-150",
                    elegida
                      ? "border-primary bg-primary/10 shadow-md ring-2 ring-primary/40 scale-[1.005]"
                      : "border-border bg-card hover:border-primary/50 hover:bg-accent/30 hover:shadow-xs"
                  )}
                >
                  <input
                    type="radio"
                    name="decision"
                    checked={elegida}
                    onChange={() => setOpcionSeleccionada(op)}
                    className="sr-only"
                  />
                  <span
                    className={cn(
                      "mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all shadow-xs",
                      elegida
                        ? "bg-primary text-primary-foreground ring-2 ring-primary/30"
                        : "bg-secondary text-foreground border border-border"
                    )}
                  >
                    {op.letra}
                  </span>
                  <div className="flex-1 text-sm font-medium leading-relaxed text-foreground">
                    {op.texto}
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center shadow-xs">
          <div className="font-display text-base font-bold">Periodo operativo estable</div>
          <p className="mt-1 text-xs text-muted-foreground">
            Las variables de mercado operan dentro de los márgenes previstos.
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

/** Cómo se llama, en cada rubro, lo que cambia despacio y lo que se deja de cobrar. */
const ETIQUETA_OCUPACION: Record<string, string> = {
  alquiler: "Ocupación contratada",
  educacion_privada: "Matrícula frente al plan",
  concesion: "Clientes conectados",
  medios: "Audiencia frente al plan",
  franquicia: "Fuerza de la marca",
  tecnologia: "Usuarios activos",
  servicios: "Cartera de clientes",
};
const ETIQUETA_IMPAGOS: Record<string, string> = {
  alquiler: "Inquilinos morosos",
  salud_privada: "Glosas e impagos",
  educacion_privada: "Pensiones impagas",
  concesion: "Tarifas impagas",
  medios: "Anunciantes morosos",
  servicios: "Clientes morosos",
};

/** Etiqueta de la temporada según cuánto se vende frente al promedio del año. */
function textoTemporada(factor: number): string {
  if (factor >= 1.15) return "Temporada alta";
  if (factor <= 0.85) return "Temporada baja";
  return "Temporada media";
}

/** Mora para mostrar: en porcentaje de la cartera si el plan la declara, si no, "x veces la prevista". */
function textoMora(multiplicador: number, base?: number): string {
  if (base !== undefined) return `${fmtNum(base * multiplicador * 100, 1)}%`;
  return `${fmtNum(multiplicador, 1)}x`;
}

function Metrica({
  titulo,
  valor,
  delta,
  detalle,
  positivo,
}: {
  titulo: string;
  valor: string;
  delta?: number;
  detalle?: string;
  positivo: boolean;
}) {
  const esReputacion = titulo.toLowerCase().includes("reputación");
  const pctRep = esReputacion ? parseInt(valor.replace("%", ""), 10) || 50 : null;

  return (
    <div className="relative flex flex-col justify-between overflow-hidden rounded-xl border border-border/80 bg-card p-3 shadow-xs transition hover:border-primary/40 hover:shadow-sm">
      <div
        className={cn(
          "absolute top-0 left-0 right-0 h-1",
          positivo ? "bg-teal-500/80" : "bg-rose-500/80"
        )}
      />
      <div>
        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          {titulo}
        </div>
        <div
          className={cn(
            "mt-1 font-display text-base sm:text-lg font-bold tabular-nums tracking-tight",
            positivo ? "text-foreground" : "text-rose-600 dark:text-rose-400"
          )}
        >
          {valor}
        </div>
        {pctRep !== null && (
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-300",
                pctRep >= 65 ? "bg-teal-500" : pctRep >= 45 ? "bg-amber-500" : "bg-rose-500"
              )}
              style={{ width: `${Math.min(100, Math.max(0, pctRep))}%` }}
            />
          </div>
        )}
      </div>
      <div className="mt-1.5 space-y-0.5">
        {delta !== undefined && Math.abs(delta) > 0.01 && (
          <div
            className={cn(
              "text-[10px] font-bold tabular-nums",
              delta > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
            )}
          >
            {delta > 0 ? "▲ +" : "▼ "}
            {formatearBolivianos(delta)}
          </div>
        )}
        {detalle && <div className="text-[10px] text-muted-foreground leading-tight">{detalle}</div>}
      </div>
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
            <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${fmtNum((v / 1000), 0)}K`} />
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
            <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${fmtNum((v / 1000), 1)}K`} />
            <Tooltip
              formatter={(v: number) => formatearBolivianos(v)}
              labelFormatter={(l) => `Turno ${l}`}
            />
            <Bar dataKey="delta" maxBarSize={48}>
              {datos.map((d, i) => (
                <Cell key={i} fill={d.delta < 0 ? "#ef4444" : "#10b981"} />
              ))}
            </Bar>
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
            <h2 className="mt-3 font-display text-xl font-bold tracking-tight">Simulación quebrada</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Tu caja se quedó en negativo en el mes {simulacion.turno_actual}. El proyecto no
              pudo sostenerse.
            </p>
          </>
        ) : (
          <>
            <Trophy className="mx-auto h-10 w-10 text-emerald-600 dark:text-emerald-400" />
            <h2 className="mt-3 font-display text-xl font-bold tracking-tight">Simulación completa</h2>
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
            valor={`${fmtNum((simulacion.estado_actual.reputacion * 100), 0)}%`}
          />
          {simulacion.estado_actual.socios !== undefined && (
            <ResumenCelda titulo="Socios al final" valor={fmtNum(simulacion.estado_actual.socios, 0)} />
          )}
          {simulacion.estado_actual.presupuesto_multiplicador !== undefined && (
            <ResumenCelda
              titulo="Beneficio social generado"
              valor={formatearBolivianos(simulacion.estado_actual.beneficio_social_acumulado ?? 0)}
            />
          )}
          {simulacion.estado_actual.mora_multiplicador !== undefined && (
            <ResumenCelda
              titulo="Mora al final"
              valor={textoMora(simulacion.estado_actual.mora_multiplicador, simulacion.estado_actual.mora_base)}
            />
          )}
        </div>

        <button
          onClick={onAbandonar}
          className="mt-5 inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
        >
          <PlayCircle className="h-4 w-4" />
          Empezar nueva simulación
        </button>
      </div>

      <PanelPostmortem simulacion={simulacion} historial={historial} />

      {historial.length > 0 && <GraficosHistorial historial={historial} />}
      <InformeFinal historial={historial} />
    </div>
  );
}

// ============================================================================
// PantallaInicio — explica qué va a pasar antes del primer turno
// ============================================================================
function PantallaInicio({
  proyecto,
  turnosTotales,
  frecuencia,
  onComenzar,
}: {
  proyecto: Proyecto;
  turnosTotales: number;
  frecuencia: Parameters<typeof mesesPorTurno>[0];
  onComenzar: () => void;
}) {
  const meses = mesesPorTurno(frecuencia);
  const totalMeses = turnosTotales * meses;
  const base = calcularBaseProyecto(proyecto);
  const indicadores = construirFlujoCaja(proyecto).indicadores;
  const pasos = [
    {
      titulo: "Operas tu proyecto mes a mes",
      texto: `Vas a manejar ${proyecto.nombre} durante ${totalMeses} meses, empezando con la caja que planificaste.`,
    },
    {
      titulo: "Aparecen noticias reales de Bolivia",
      texto: "Dólar paralelo, sequías, bloqueos, cambios de normativa. Algunas te favorecen y otras te complican.",
    },
    {
      titulo: "Tú decides cómo responder",
      texto: "Cada noticia trae opciones. Tu decisión cambia la caja, la demanda y la reputación del negocio.",
    },
    {
      titulo: "Al final ves cómo te fue",
      texto: "Recibes un informe con lo que enfrentaste y decidiste. Después puedes volver a Escenarios para comparar.",
    },
  ];
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Antes de empezar</div>
        <h1 className="mt-1 font-display text-2xl font-bold tracking-tight">Simulación de {proyecto.nombre}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Del modelo financiero al entorno dinámico: evalúa la resiliencia de tu estructura operativa ante la incertidumbre económica.
        </p>
        <ol className="mt-5 space-y-3">
          {pasos.map((paso, i) => (
            <li key={paso.titulo} className="flex gap-3">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {i + 1}
              </span>
              <div>
                <div className="text-sm font-semibold">{paso.titulo}</div>
                <div className="text-sm text-muted-foreground">{paso.texto}</div>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="rounded-lg border border-border bg-card p-4">
        <h2 className="mb-2 text-sm font-semibold">Tu punto de partida</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <ResumenCelda titulo="Caja inicial" valor={formatearBolivianos(base.capitalInicial)} />
          <ResumenCelda titulo="Ingresos año 1 (plan)" valor={formatearBolivianos(base.ingresosAnuales)} />
          <ResumenCelda titulo="VAN del plan" valor={formatearBolivianos(indicadores.van)} />
          <ResumenCelda
            titulo="TIR del plan"
            valor={tirCalculable(indicadores.tir) ? `${fmtNum((indicadores.tir * 100), 1)}%` : "No calculable"}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={onComenzar}
          className="flex items-center gap-1.5 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
        >
          <PlayCircle className="h-4 w-4" />
          Comenzar simulación
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// InformeFinal — qué enfrentó y decidió el alumno durante la simulación
// ============================================================================
function InformeFinal({
  historial,
}: {
  historial: ReturnType<typeof useSimulacionStore.getState>["historial"];
}) {
  const eventos = historial.flatMap((h) =>
    (h.eventos_aplicados ?? []).map((e) => ({
      turno: h.numero_turno,
      titulo: e.titulo,
      decision: h.decision_tomada?.opcion ?? null,
    }))
  );
  const turnosConDelta = historial.filter((h) => Math.abs(h.estado_despues.delta_caja) > 0.01);
  const mejor = turnosConDelta.reduce<(typeof historial)[number] | null>(
    (acc, h) => (!acc || h.estado_despues.delta_caja > acc.estado_despues.delta_caja ? h : acc),
    null
  );
  const peor = turnosConDelta.reduce<(typeof historial)[number] | null>(
    (acc, h) => (!acc || h.estado_despues.delta_caja < acc.estado_despues.delta_caja ? h : acc),
    null
  );

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <h2 className="font-display text-base font-bold text-foreground">Tu informe</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Enfrentaste {eventos.length} {eventos.length === 1 ? "noticia" : "noticias"} en {historial.length}{" "}
        {historial.length === 1 ? "turno" : "turnos"}.
      </p>

      {(mejor || peor) && (
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {mejor && mejor.estado_despues.delta_caja > 0 && (
            <ResumenCelda
              titulo={`Mejor turno (${mejor.numero_turno})`}
              valor={`+${formatearBolivianos(mejor.estado_despues.delta_caja)}`}
            />
          )}
          {peor && peor.estado_despues.delta_caja < 0 && (
            <ResumenCelda
              titulo={`Peor turno (${peor.numero_turno})`}
              valor={formatearBolivianos(peor.estado_despues.delta_caja)}
            />
          )}
        </div>
      )}

      {eventos.length > 0 ? (
        <ul className="mt-3 divide-y divide-border rounded-md border border-border">
          {eventos.map((e, i) => (
            <li key={i} className="p-3 text-sm">
              <div className="font-medium">
                <span className="text-muted-foreground">Turno {e.turno} · </span>
                {e.titulo}
              </div>
              {e.decision ? (
                <div className="mt-0.5 text-xs text-muted-foreground">
                  Elegiste: {e.decision.letra}. {e.decision.texto}
                  {e.decision.feedback_corto ? ` — ${e.decision.feedback_corto}` : ""}
                </div>
              ) : (
                <div className="mt-0.5 text-xs text-muted-foreground">Sin decisión registrada.</div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-muted-foreground">
          No hubo noticias relevantes en esta simulación.
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          to="/escenarios"
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground shadow-2xs transition hover:bg-accent"
        >
          Comparar con tus escenarios
        </Link>
      </div>
    </div>
  );
}

function ResumenCelda({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div className="rounded-md border border-border bg-card p-3 text-left">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{titulo}</div>
      <div className="text-sm font-semibold">{valor}</div>
    </div>
  );
}

// ============================================================================
// SelectorProyectoSimular — switcher de portafolio para la simulación
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
      return { label: "Grupal", badge: "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300" };
    }
    if (p.caso_origen_id) {
      return { label: "Caso del curso", badge: "bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300" };
    }
    return { label: "Individual", badge: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300" };
  };

  return (
    <div className="rounded-xl border border-border/80 bg-card p-3 shadow-xs">
      <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-teal-500" />
        Portafolio disponible para simulación
      </div>
      <div className="flex flex-wrap gap-2">
        {proyectos.map((p) => {
          const meta = tipoMeta(p);
          const activo = p.id === activoId;
          return (
            <button
              key={p.id}
              onClick={() => !activo && onCambiar(p)}
              className={cn(
                "group flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all",
                activo
                  ? "border-teal-600 bg-teal-700 text-white shadow-xs font-semibold"
                  : "border-border/80 bg-background text-foreground hover:border-teal-500/50 hover:bg-accent/40"
              )}
              title={`${meta.label} — ${p.nombre}`}
            >
              <span className="max-w-[200px] truncate">{p.nombre}</span>
              <span
                className={cn(
                  "rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                  activo ? "bg-white/20 text-white" : meta.badge
                )}
              >
                {meta.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
