import { useEffect, useMemo, useState } from "react";
import { Loader2, Search, Send, Zap, CheckCircle2, History, BarChart3, Settings2, X } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { listarEventos } from "@/lib/eventos-supabase";
import {
  contarSimulacionesActivasDelCurso,
  dispararEventoAlCurso,
  listarEventosDisparadosDelCurso,
  obtenerRespuestasEvento,
  type AlcanceLanzamiento,
  type EventoDisparado,
  type RespuestasEvento,
} from "@/lib/lanzador-eventos";
import { actualizarTiposSimulables } from "@/lib/cursos-supabase";
import { useIntervaloVisible } from "@/hooks/useIntervaloVisible";
import { supabase } from "@/lib/supabase";
import type { Curso } from "@/lib/cursos-supabase";
import type { Evento } from "@/types/evento";
import { cn } from "@/lib/utils";

/**
 * Lanzador de situaciones en vivo. El docente elige un evento del catálogo
 * y lo dispara a TODOS los alumnos con simulación activa en el curso. La
 * lógica está en /lib/lanzador-eventos.ts; este componente solo orquesta la
 * UI: catálogo, búsqueda, conteo de simulaciones activas y confirmación.
 */
export default function LanzadorEventos({ cursoId }: { cursoId: string }) {
  const user = useAuthStore((s) => s.user);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [historial, setHistorial] = useState<EventoDisparado[]>([]);
  const [conteo, setConteo] = useState<{ totalDelAlcance: number; enSectoresAfectados: number } | null>(null);
  const [forzarATodos, setForzarATodos] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [categoria, setCategoria] = useState<string>("todas");
  const [seleccionado, setSeleccionado] = useState<Evento | null>(null);
  const [confirmando, setConfirmando] = useState(false);
  const [cargandoEventos, setCargandoEventos] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exito, setExito] = useState<{ titulo: string; afectadas: number } | null>(null);
  const [curso, setCurso] = useState<Curso | null>(null);
  const [alcance, setAlcance] = useState<AlcanceLanzamiento>("todos");
  // #1 editor de tipos simulables
  const [mostrarConfig, setMostrarConfig] = useState(false);
  // #4 dashboard de respuestas: el disparo cuyo desglose estamos viendo
  const [verRespuestas, setVerRespuestas] = useState<EventoDisparado | null>(null);

  // Carga del curso para saber qué alcances están habilitados.
  useEffect(() => {
    supabase
      .from("cursos")
      .select("*")
      .eq("id", cursoId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setCurso(data as Curso);
      });
  }, [cursoId]);

  // Lista de alcances habilitados para este curso (según flags del docente).
  const alcancesDisponibles = useMemo(() => {
    const opts: { value: AlcanceLanzamiento; emoji: string; label: string }[] = [];
    if (curso?.simulacion_caso_curso ?? true) {
      opts.push({ value: "caso", emoji: "🎓", label: "Caso del curso" });
    }
    if (curso?.simulacion_individual ?? false) {
      opts.push({ value: "individual", emoji: "📁", label: "Individual" });
    }
    if (curso?.simulacion_grupal ?? true) {
      opts.push({ value: "grupal", emoji: "🤝", label: "Grupal" });
    }
    if (opts.length > 1) {
      opts.unshift({ value: "todos", emoji: "🎯", label: "Todos" });
    }
    return opts;
  }, [curso]);

  // Si el alcance seleccionado ya no está disponible, volver al primero válido.
  useEffect(() => {
    if (alcancesDisponibles.length === 0) return;
    if (!alcancesDisponibles.some((a) => a.value === alcance)) {
      setAlcance(alcancesDisponibles[0].value);
    }
  }, [alcancesDisponibles, alcance]);

  // Carga inicial del catálogo de eventos
  useEffect(() => {
    let cancelado = false;
    listarEventos()
      .then((evs) => {
        if (!cancelado) setEventos(evs);
      })
      .catch((e) => setError(e?.message ?? "Error al cargar eventos"))
      .finally(() => {
        if (!cancelado) setCargandoEventos(false);
      });
    return () => {
      cancelado = true;
    };
  }, []);

  // Refrescar conteo de activas (alcance + sectores del evento seleccionado) + historial.
  const refrescar = async () => {
    try {
      const [c, h] = await Promise.all([
        contarSimulacionesActivasDelCurso(
          cursoId,
          alcance,
          seleccionado?.sectores_afectados
        ),
        listarEventosDisparadosDelCurso(cursoId, 10),
      ]);
      setConteo(c);
      setHistorial(h);
    } catch {
      /* no-op: no romper UI por error de polling */
    }
  };
  useEffect(() => {
    refrescar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursoId, alcance, seleccionado?.id]);
  useIntervaloVisible(refrescar, 10000);

  // Cuántos van a recibir el evento según el toggle de forzado.
  const aLanzar = !seleccionado
    ? null
    : forzarATodos
      ? conteo?.totalDelAlcance ?? 0
      : conteo?.enSectoresAfectados ?? 0;
  const aplicaATodos = seleccionado?.sectores_afectados.includes("todos") ?? false;

  // Categorías disponibles
  const categorias = useMemo(() => {
    const set = new Set<string>();
    for (const e of eventos) set.add(e.categoria);
    return Array.from(set);
  }, [eventos]);

  // Eventos filtrados
  const filtrados = useMemo(() => {
    const b = busqueda.trim().toLowerCase();
    return eventos.filter((e) => {
      if (!e.activo) return false;
      if (categoria !== "todas" && e.categoria !== categoria) return false;
      if (b === "") return true;
      return (
        e.titulo.toLowerCase().includes(b) ||
        e.descripcion.toLowerCase().includes(b) ||
        e.codigo.toLowerCase().includes(b) ||
        e.categoria.toLowerCase().includes(b)
      );
    });
  }, [eventos, busqueda, categoria]);

  const lanzar = async () => {
    if (!seleccionado || !user) return;
    setConfirmando(true);
    setError(null);
    try {
      const r = await dispararEventoAlCurso({
        cursoId,
        eventoId: seleccionado.id,
        docenteId: user.id,
        alcance,
        sectoresAfectados: seleccionado.sectores_afectados,
        forzarATodos,
      });
      setExito({ titulo: seleccionado.titulo, afectadas: r.afectadas });
      setSeleccionado(null);
      setForzarATodos(false);
      refrescar();
    } catch (e: any) {
      setError(e?.message ?? "Error al lanzar el evento");
    } finally {
      setConfirmando(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header con conteo de activas */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 p-3 dark:border-amber-700 dark:from-amber-950/40 dark:to-orange-950/40">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-amber-700 dark:text-amber-300" />
          <div>
            <div className="text-sm font-bold text-amber-900 dark:text-amber-100">
              Lanzador de situaciones en vivo
            </div>
            <div className="text-[11px] text-amber-800/80 dark:text-amber-300">
              Elegí una situación y mandala a todos los alumnos que estén simulando ahora.
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMostrarConfig(true)}
            className="flex items-center gap-1 rounded-md border border-amber-400 bg-white px-2.5 py-1.5 text-[11px] font-medium text-amber-900 shadow-sm hover:bg-amber-50 dark:border-amber-700 dark:bg-amber-950/60 dark:text-amber-100"
            title="Configurar qué tipos de proyecto se pueden simular en este curso"
          >
            <Settings2 className="h-3.5 w-3.5" />
            Configurar
          </button>
          <div className="rounded-md bg-white px-3 py-1.5 text-center text-xs shadow-sm dark:bg-amber-950/60">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Simulaciones activas
            </div>
            <div className="text-xl font-bold text-amber-900 dark:text-amber-100">
              {conteo?.totalDelAlcance ?? "—"}
            </div>
          </div>
        </div>
      </div>

      {/* #1 Editor de tipos simulables (modal) */}
      {mostrarConfig && curso && (
        <ModalConfigSimulacion
          curso={curso}
          onCerrar={() => setMostrarConfig(false)}
          onGuardado={(nuevo) => {
            setCurso(nuevo);
            setMostrarConfig(false);
          }}
        />
      )}

      {/* #4 Dashboard de respuestas (modal) */}
      {verRespuestas && (
        <ModalRespuestas
          cursoId={cursoId}
          disparo={verRespuestas}
          evento={eventos.find((e) => e.id === verRespuestas.evento_id) ?? null}
          onCerrar={() => setVerRespuestas(null)}
        />
      )}

      {/* Éxito banner */}
      {exito && (
        <div className="flex items-start gap-2 rounded-md border border-emerald-400 bg-emerald-50 p-3 dark:bg-emerald-950/40">
          <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-700" />
          <div className="flex-1 text-xs text-emerald-900 dark:text-emerald-100">
            <div className="font-bold">¡Situación lanzada!</div>
            <p className="mt-0.5">
              «{exito.titulo}» llegó a <strong>{exito.afectadas}</strong> alumno
              {exito.afectadas === 1 ? "" : "s"}. La van a ver al refrescar su pantalla
              de simulación (máximo 8 segundos).
            </p>
            <button
              onClick={() => setExito(null)}
              className="mt-1 text-[10px] font-bold underline"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Selector de alcance (a quién le llega la situación) */}
      {alcancesDisponibles.length > 1 && (
        <div className="rounded-md border border-border bg-card p-2.5">
          <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            ¿A quién le va a llegar la situación?
          </div>
          <div className="flex flex-wrap gap-1.5">
            {alcancesDisponibles.map((a) => {
              const activo = alcance === a.value;
              return (
                <button
                  key={a.value}
                  onClick={() => setAlcance(a.value)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md border-2 px-2.5 py-1 text-xs transition",
                    activo
                      ? "border-amber-500 bg-amber-100 font-semibold text-amber-900 dark:bg-amber-900/40 dark:text-amber-100"
                      : "border-border bg-background hover:border-amber-300"
                  )}
                >
                  <span>{a.emoji}</span>
                  <span>{a.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Buscador + categoría */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-1 items-center gap-1.5 rounded-md border border-input bg-background px-2.5 py-1.5">
          <Search className="h-3.5 w-3.5 text-muted-foreground" />
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar evento (inflación, sequía, dólar, etc.)"
            className="w-full bg-transparent text-xs outline-none"
          />
        </div>
        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className="rounded-md border border-input bg-background px-2 py-1.5 text-xs"
        >
          <option value="todas">Todas las categorías</option>
          {categorias.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Lista de eventos */}
      {cargandoEventos ? (
        <div className="flex items-center gap-2 py-4 text-xs text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Cargando catálogo de eventos…
        </div>
      ) : filtrados.length === 0 ? (
        <div className="rounded-md border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
          Ningún evento coincide con la búsqueda.
        </div>
      ) : (
        <div className="grid max-h-96 grid-cols-1 gap-2 overflow-y-auto rounded-md border border-border bg-card p-2 sm:grid-cols-2">
          {filtrados.map((e) => (
            <button
              key={e.id}
              onClick={() => setSeleccionado(e)}
              className={cn(
                "rounded-md border p-2.5 text-left transition",
                seleccionado?.id === e.id
                  ? "border-amber-500 bg-amber-50 ring-2 ring-amber-400 dark:bg-amber-950/40"
                  : "border-border bg-background hover:border-primary"
              )}
            >
              <div className="mb-1 flex items-center gap-1.5">
                <span className="rounded bg-secondary px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">
                  {e.categoria}
                </span>
                <span className="text-[9px] text-muted-foreground">{e.codigo}</span>
              </div>
              <div className="text-xs font-bold leading-tight">{e.titulo}</div>
              <p className="mt-1 line-clamp-2 text-[10px] leading-snug text-muted-foreground">
                {e.descripcion}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-1">
                <span className="text-[9px] text-muted-foreground">
                  {e.opciones_decision.length} decisiones · 🎯
                </span>
                {e.sectores_afectados.includes("todos") ? (
                  <span className="rounded bg-emerald-100 px-1 py-0.5 text-[9px] font-semibold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
                    todos los sectores
                  </span>
                ) : (
                  e.sectores_afectados.map((s) => (
                    <span
                      key={s}
                      className="rounded bg-sky-100 px-1 py-0.5 text-[9px] font-semibold text-sky-800 dark:bg-sky-950/40 dark:text-sky-200"
                    >
                      {s}
                    </span>
                  ))
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Filtrado sectorial (solo si hay evento seleccionado con sectores específicos) */}
      {seleccionado && !aplicaATodos && (
        <div className="rounded-md border border-sky-300 bg-sky-50/60 p-3 dark:border-sky-800 dark:bg-sky-950/30">
          <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold text-sky-900 dark:text-sky-100">
            🎯 Este evento solo aplica a:{" "}
            {seleccionado.sectores_afectados.map((s) => (
              <span
                key={s}
                className="rounded bg-sky-200 px-1.5 py-0.5 text-[9px] uppercase dark:bg-sky-800/60"
              >
                {s}
              </span>
            ))}
          </div>
          <p className="mb-2 text-[10px] leading-snug text-sky-800/80 dark:text-sky-200/80">
            De los <strong>{conteo?.totalDelAlcance ?? 0}</strong> alumnos con simulación,{" "}
            <strong>{conteo?.enSectoresAfectados ?? 0}</strong> tienen proyectos en sectores
            afectados. El resto tiene proyectos en otros sectores (ej. servicios, software).
          </p>
          <label className="flex cursor-pointer items-start gap-2 text-[11px] text-sky-900 dark:text-sky-100">
            <input
              type="checkbox"
              checked={forzarATodos}
              onChange={(e) => setForzarATodos(e.target.checked)}
              className="mt-0.5"
            />
            <span>
              <strong>Forzar a TODOS los alumnos del alcance</strong> aunque no sea
              sectorialmente relevante (útil si querés que los del sector NO afectado
              discutan en clase <em>por qué</em> no les aplica).
            </span>
          </label>
        </div>
      )}

      {/* Botón de lanzar */}
      <div className="sticky bottom-2 flex items-center gap-2 rounded-lg border border-border bg-card p-3 shadow-lg">
        <div className="min-w-0 flex-1">
          {seleccionado ? (
            <>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Listo para lanzar
              </div>
              <div className="truncate text-sm font-bold">{seleccionado.titulo}</div>
            </>
          ) : (
            <div className="text-xs text-muted-foreground">
              Elegí un evento de la lista para lanzarlo.
            </div>
          )}
        </div>
        <button
          onClick={lanzar}
          disabled={!seleccionado || confirmando || (aLanzar ?? 0) === 0}
          className="flex items-center gap-1.5 rounded-md bg-amber-600 px-4 py-2 text-sm font-bold text-white shadow-md hover:bg-amber-700 disabled:opacity-40"
          title={
            (aLanzar ?? 0) === 0
              ? "Ningún alumno aplica para este evento con el filtro actual"
              : ""
          }
        >
          {confirmando ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          Lanzar a {aLanzar ?? "—"} alumno{(aLanzar ?? 0) === 1 ? "" : "s"}
        </button>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/60 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {error}
        </div>
      )}

      {/* Historial */}
      {historial.length > 0 && (
        <div>
          <div className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            <History className="h-3 w-3" />
            Historial reciente
          </div>
          <ul className="space-y-1">
            {historial.map((h) => {
              const evento = eventos.find((e) => e.id === h.evento_id);
              const hace = relativo(h.disparado_en);
              return (
                <li key={h.id}>
                  <button
                    onClick={() => setVerRespuestas(h)}
                    className="flex w-full items-center justify-between gap-2 rounded-md border border-border bg-background px-2.5 py-1.5 text-left text-[11px] transition hover:border-primary hover:bg-secondary/40"
                    title="Ver qué decidieron los alumnos ante esta situación"
                  >
                    <span className="truncate">
                      <strong>{evento?.titulo ?? h.evento_id}</strong> — llegó a{" "}
                      {h.simulaciones_afectadas} alumno
                      {h.simulaciones_afectadas === 1 ? "" : "s"}
                    </span>
                    <span className="flex flex-shrink-0 items-center gap-1.5 text-[10px] text-muted-foreground">
                      <BarChart3 className="h-3 w-3 text-primary" />
                      {hace}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

function relativo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.floor(ms / 60000);
  if (min < 1) return "hace segundos";
  if (min < 60) return `hace ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.floor(h / 24);
  return `hace ${d} día${d === 1 ? "" : "s"}`;
}

// ============================================================================
// #1 — MODAL: configurar qué tipos de proyecto se pueden simular en el curso
// ============================================================================
function ModalConfigSimulacion({
  curso,
  onCerrar,
  onGuardado,
}: {
  curso: Curso;
  onCerrar: () => void;
  onGuardado: (nuevo: Curso) => void;
}) {
  const [caso, setCaso] = useState(curso.simulacion_caso_curso ?? true);
  const [individual, setIndividual] = useState(curso.simulacion_individual ?? false);
  const [grupal, setGrupal] = useState(curso.simulacion_grupal ?? true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const guardar = async () => {
    setGuardando(true);
    setError(null);
    try {
      await actualizarTiposSimulables(curso.id, {
        simulacion_caso_curso: caso,
        simulacion_individual: individual,
        simulacion_grupal: grupal,
      });
      onGuardado({
        ...curso,
        simulacion_caso_curso: caso,
        simulacion_individual: individual,
        simulacion_grupal: grupal,
      });
    } catch (e: any) {
      setError(e?.message ?? "No se pudo guardar");
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-card p-5 shadow-xl">
        <div className="mb-3 flex items-start justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <Settings2 className="h-4 w-4 text-amber-600" />
              Tipos de proyecto simulables
            </h2>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{curso.nombre}</p>
          </div>
          <button onClick={onCerrar} disabled={guardando} className="rounded-md p-1 hover:bg-secondary disabled:opacity-50">
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mb-3 text-[11px] text-muted-foreground">
          El alumno solo va a ver en su pantalla "Simular" los tipos que marques acá. El
          lanzador de situaciones también respeta esta configuración.
        </p>

        <div className="space-y-2">
          <label className="flex cursor-pointer items-start gap-2 rounded-md border border-emerald-200 bg-emerald-50/40 p-2 text-xs dark:border-emerald-900 dark:bg-emerald-950/20">
            <input type="checkbox" checked={caso} onChange={(e) => setCaso(e.target.checked)} className="mt-0.5" />
            <span>🎓 <strong>Caso del curso</strong> — la copia del caso que publicaste como docente.</span>
          </label>
          <label className="flex cursor-pointer items-start gap-2 rounded-md border border-sky-200 bg-sky-50/40 p-2 text-xs dark:border-sky-900 dark:bg-sky-950/20">
            <input type="checkbox" checked={individual} onChange={(e) => setIndividual(e.target.checked)} className="mt-0.5" />
            <span>📁 <strong>Proyecto individual</strong> — el proyecto propio del alumno.</span>
          </label>
          <label className="flex cursor-pointer items-start gap-2 rounded-md border border-violet-200 bg-violet-50/40 p-2 text-xs dark:border-violet-900 dark:bg-violet-950/20">
            <input type="checkbox" checked={grupal} onChange={(e) => setGrupal(e.target.checked)} className="mt-0.5" />
            <span>🤝 <strong>Proyecto grupal</strong> — el proyecto compartido del grupo.</span>
          </label>
        </div>

        {error && <div className="mt-2 text-[11px] text-destructive">{error}</div>}

        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onCerrar} disabled={guardando} className="rounded-md border border-border px-3 py-1.5 text-xs hover:bg-secondary disabled:opacity-50">
            Cancelar
          </button>
          <button onClick={guardar} disabled={guardando} className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
            {guardando && <Loader2 className="h-3 w-3 animate-spin" />}
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// #4 — MODAL: desglose de decisiones de los alumnos ante un evento lanzado
// ============================================================================
function ModalRespuestas({
  cursoId,
  disparo,
  evento,
  onCerrar,
}: {
  cursoId: string;
  disparo: EventoDisparado;
  evento: Evento | null;
  onCerrar: () => void;
}) {
  const [datos, setDatos] = useState<RespuestasEvento | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = async () => {
    setCargando(true);
    try {
      const r = await obtenerRespuestasEvento(cursoId, disparo.evento_id);
      setDatos(r);
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? "Error al cargar respuestas");
    } finally {
      setCargando(false);
    }
  };
  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursoId, disparo.evento_id]);

  const total = datos?.totalRespondieron ?? 0;
  const letras = ["A", "B", "C", "D"];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-lg bg-card shadow-xl">
        <header className="flex items-start justify-between gap-2 border-b border-border p-4">
          <div className="min-w-0">
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <BarChart3 className="h-4 w-4 text-primary" />
              ¿Qué decidieron los alumnos?
            </h2>
            <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
              {evento?.titulo ?? disparo.evento_id}
            </p>
          </div>
          <button onClick={onCerrar} className="rounded-md p-1 hover:bg-secondary">
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4">
          {cargando ? (
            <div className="flex items-center gap-2 py-6 text-xs text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Cargando respuestas…
            </div>
          ) : error ? (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 p-2 text-xs text-destructive">
              {error}
            </div>
          ) : total === 0 ? (
            <div className="rounded-md border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
              Todavía ningún alumno respondió a esta situación. Volvé a abrir esto en unos
              minutos cuando hayan avanzado el turno.
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-xs text-muted-foreground">
                <strong className="text-foreground">{total}</strong> alumno{total === 1 ? "" : "s"}{" "}
                ya {total === 1 ? "respondió" : "respondieron"} de los{" "}
                {disparo.simulaciones_afectadas} que recibieron la situación.
              </div>
              {letras.map((letra) => {
                const n = datos?.porLetra[letra] ?? 0;
                if (n === 0 && !datos?.textosPorLetra[letra]) {
                  // Buscar el texto desde el evento si no hubo respuestas con esa letra
                  const op = evento?.opciones_decision.find((o) => o.letra === letra);
                  if (!op) return null;
                  return (
                    <BarraRespuesta key={letra} letra={letra} texto={op.texto} n={0} total={total} />
                  );
                }
                const texto =
                  datos?.textosPorLetra[letra] ??
                  evento?.opciones_decision.find((o) => o.letra === letra)?.texto ??
                  "";
                if (!texto) return null;
                return <BarraRespuesta key={letra} letra={letra} texto={texto} n={n} total={total} />;
              })}
              <button
                onClick={cargar}
                className="mt-1 text-[11px] font-medium text-primary underline"
              >
                Actualizar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BarraRespuesta({
  letra,
  texto,
  n,
  total,
}: {
  letra: string;
  texto: string;
  n: number;
  total: number;
}) {
  const pct = total > 0 ? Math.round((n / total) * 100) : 0;
  return (
    <div className="rounded-md border border-border bg-background p-2.5">
      <div className="mb-1 flex items-center justify-between gap-2 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
            {letra}
          </span>
          <span className="font-medium">{texto}</span>
        </span>
        <span className="flex-shrink-0 font-bold tabular-nums">
          {n} <span className="text-[10px] font-normal text-muted-foreground">({pct}%)</span>
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-indigo-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
