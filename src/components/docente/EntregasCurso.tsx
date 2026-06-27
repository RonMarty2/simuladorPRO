import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ChevronRight, Clock, Loader2, Users, User, XCircle, Layers, Zap, ArrowUpDown } from "lucide-react";
import { listarEntregasDelCurso } from "@/lib/proyecto-supabase";
import { listarGruposDeCurso, type GrupoConMiembros } from "@/lib/grupos-supabase";
import type { Entrega } from "@/types/proyecto";
import { cn } from "@/lib/utils";
import ModalRevisarEntrega from "./ModalRevisarEntrega";
import ModalRevisionMasiva from "./ModalRevisionMasiva";
import ModalCalificarTodoIgual from "./ModalCalificarTodoIgual";

type Vista = "individuales" | "grupales";
type Filtro = "todas" | "pendiente" | "aprobada" | "reprobada";
/** Cómo agrupar la lista: por persona/grupo (clásico) o por etapa (todas las
 *  Etapa 3 del curso juntas, ideal para corregir en lote). */
type Agrupamiento = "por_titular" | "por_etapa";
/** Orden de la lista. "ultima_entrega" sirve para ver lo recién entregado;
 *  "mas_pendientes" pone arriba a quien más debe; "promedio_bajo" sube a
 *  quien necesita atención. */
type Orden = "ultima_entrega" | "mas_pendientes" | "promedio_bajo";

interface Agrupado {
  // Identificador único (estudiante+proyecto para individuales; proyecto para grupales)
  key: string;
  nombreTitular: string;     // estudiante o nombre del grupo
  nombreProyecto: string;
  metaSecundaria?: string;    // ej. "5 integrantes"
  entregas: Entrega[];
  pendientes: number;
  aprobadas: number;
  reprobadas: number;
  promedio: number | null;
  /** Timestamp ISO de la entrega más reciente del grupo (para ordenar). */
  ultimaEntregaEn: string;
}

export default function EntregasCurso({ cursoId }: { cursoId: string }) {
  const [entregas, setEntregas] = useState<Entrega[]>([]);
  const [grupos, setGrupos] = useState<GrupoConMiembros[]>([]);
  const [cargando, setCargando] = useState(true);
  // Al revisar una etapa, pasamos también las OTRAS pendientes del mismo
  // alumno+proyecto para que el modal ofrezca "calificar todas igual" sin
  // que el docente tenga que volver y abrir tab por tab.
  const [entregaActiva, setEntregaActiva] = useState<{ entrega: Entrega; otrasPendientes: Entrega[] } | null>(null);
  // Para "revisión rápida" del lote pendiente de un estudiante o grupo.
  const [loteMasivo, setLoteMasivo] = useState<{ titular: string; entregas: Entrega[] } | null>(null);
  // "Calificar todo igual": misma nota + comentario para todas las pendientes
  // del alumno (sin entrar tab por tab). Caso del docente que ya miró el
  // trabajo y solo quiere cerrar todo de una vez.
  const [loteRapido, setLoteRapido] = useState<{ titular: string; entregas: Entrega[] } | null>(null);
  const [vista, setVista] = useState<Vista>("individuales");
  const [filtro, setFiltro] = useState<Filtro>("pendiente");
  const [agrupamiento, setAgrupamiento] = useState<Agrupamiento>("por_titular");
  const [orden, setOrden] = useState<Orden>("ultima_entrega");

  const cargar = async () => {
    setCargando(true);
    try {
      const [lista, gs] = await Promise.all([
        listarEntregasDelCurso(cursoId),
        listarGruposDeCurso(cursoId).catch(() => [] as GrupoConMiembros[]),
      ]);
      setEntregas(lista);
      setGrupos(gs);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, [cursoId]);

  const grupoPorProyecto = useMemo(() => {
    const m = new Map<string, GrupoConMiembros>();
    for (const g of grupos) {
      if (g.proyecto_id) m.set(g.proyecto_id, g);
    }
    return m;
  }, [grupos]);

  const esGrupal = (e: Entrega): boolean => !!(e.snapshot_datos ?? {}).grupo_id;

  const individuales = entregas.filter((e) => !esGrupal(e));
  const grupales = entregas.filter((e) => esGrupal(e));

  // Helper: nombre legible del titular de una entrega (alumno o grupo).
  const nombreTitularDe = (e: Entrega): string => {
    if (esGrupal(e)) {
      const grupo = grupoPorProyecto.get(e.proyecto_id);
      return grupo?.nombre ?? (e.snapshot_datos?.nombre ?? "(grupo)");
    }
    return e.perfil
      ? `${e.perfil.nombre} ${e.perfil.apellido}`.trim() || e.perfil.email
      : `Estudiante ${e.estudiante_id.slice(0, 6)}`;
  };

  // Agrupar para la vista actual. En "por_etapa" tiramos a la basura la
  // identidad del titular como clave principal y armamos un grupo por
  // paso_entregado: el docente ve un card "Etapa 3" con chips de TODOS los
  // alumnos/grupos que entregaron esa etapa. Es la vista de calificación en
  // lote por etapa.
  const agrupadas = useMemo<Agrupado[]>(() => {
    const fuente = vista === "individuales" ? individuales : grupales;
    const map = new Map<string, Entrega[]>();
    for (const e of fuente) {
      let key: string;
      if (agrupamiento === "por_etapa") {
        key = String(e.paso_entregado ?? 0);
      } else {
        key =
          vista === "grupales"
            ? e.proyecto_id
            : `${e.estudiante_id}|${e.proyecto_id}`;
      }
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    }
    return Array.from(map.entries()).map(([key, es]) => {
      if (agrupamiento === "por_etapa") {
        // Ordenar por nombre del titular dentro de cada etapa.
        es.sort((a, b) => nombreTitularDe(a).localeCompare(nombreTitularDe(b)));
      } else {
        es.sort((a, b) => (a.paso_entregado ?? 999) - (b.paso_entregado ?? 999));
      }
      const primera = es[0];
      const grupo = grupoPorProyecto.get(primera.proyecto_id) ?? null;
      const notas = es.filter((e) => e.nota != null).map((e) => e.nota as number);
      const promedio =
        notas.length > 0 ? Math.round((notas.reduce((a, b) => a + b, 0) / notas.length) * 100) / 100 : null;
      const nombreTitular =
        agrupamiento === "por_etapa"
          ? `Etapa ${primera.paso_entregado ?? "?"}`
          : (vista === "grupales"
              ? grupo?.nombre ?? (primera.snapshot_datos?.nombre ?? "(grupo)")
              : nombreTitularDe(primera));
      const metaSecundaria =
        agrupamiento === "por_etapa"
          ? `${es.length} ${vista === "grupales" ? "grupo" : "alumno"}${es.length === 1 ? "" : "s"} en esta etapa`
          : vista === "grupales" && grupo
            ? `${grupo.miembros.length} integrante${grupo.miembros.length === 1 ? "" : "s"}`
            : undefined;
      return {
        key,
        nombreTitular,
        nombreProyecto: agrupamiento === "por_etapa" ? "" : (primera.snapshot_datos?.nombre ?? ""),
        metaSecundaria,
        entregas: es,
        pendientes: es.filter((e) => e.estado === "pendiente").length,
        aprobadas: es.filter((e) => e.estado === "aprobada").length,
        reprobadas: es.filter((e) => e.estado === "reprobada").length,
        promedio,
        // Fecha de la entrega más reciente del grupo (para ordenar la lista).
        ultimaEntregaEn: es.reduce(
          (max, e) => (e.entregado_en > max ? e.entregado_en : max),
          es[0].entregado_en
        ),
      };
    });
  }, [vista, individuales, grupales, grupoPorProyecto, agrupamiento]);

  // Filtrar grupos según el estado de sus entregas + ordenar según el criterio
  // que eligió el docente (más reciente / más pendientes / promedio más bajo).
  // En vista "por_etapa" siempre forzamos orden por número de etapa (1→9):
  // ahí el orden del docente no aplica, la idea es ver la secuencia natural.
  const filtrados = useMemo(() => {
    const base =
      filtro === "todas"
        ? agrupadas
        : agrupadas
            .map((a) => ({
              ...a,
              entregas: a.entregas.filter((e) => e.estado === filtro),
            }))
            .filter((a) => a.entregas.length > 0);
    // Recalcular ultimaEntregaEn por si el filtro cambia las entregas visibles.
    const recalculados = base.map((a) => ({
      ...a,
      ultimaEntregaEn:
        a.entregas.length > 0
          ? a.entregas.reduce(
              (max, e) => (e.entregado_en > max ? e.entregado_en : max),
              a.entregas[0].entregado_en
            )
          : a.ultimaEntregaEn,
      pendientes: a.entregas.filter((e) => e.estado === "pendiente").length,
    }));
    if (agrupamiento === "por_etapa") {
      return recalculados.sort((a, b) => Number(a.key) - Number(b.key));
    }
    if (orden === "mas_pendientes") {
      return recalculados.sort((a, b) => b.pendientes - a.pendientes);
    }
    if (orden === "promedio_bajo") {
      return recalculados.sort((a, b) => {
        const va = a.promedio ?? Number.POSITIVE_INFINITY;
        const vb = b.promedio ?? Number.POSITIVE_INFINITY;
        return va - vb;
      });
    }
    return recalculados.sort((a, b) => b.ultimaEntregaEn.localeCompare(a.ultimaEntregaEn));
  }, [agrupadas, filtro, agrupamiento, orden]);

  const ctVista = {
    pendiente: (vista === "individuales" ? individuales : grupales).filter((e) => e.estado === "pendiente").length,
    aprobada: (vista === "individuales" ? individuales : grupales).filter((e) => e.estado === "aprobada").length,
    reprobada: (vista === "individuales" ? individuales : grupales).filter((e) => e.estado === "reprobada").length,
  };

  return (
    <div className="space-y-3">
      {/* Tabs Individuales vs Grupales */}
      <div className="flex gap-1.5 text-xs">
        <button
          onClick={() => setVista("individuales")}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-3 py-1.5 transition",
            vista === "individuales"
              ? "bg-sky-600 text-white"
              : "border border-border bg-card hover:bg-secondary"
          )}
        >
          <User className="h-3.5 w-3.5" />
          Entregas individuales
          <span className="rounded bg-white/20 px-1.5 py-0.5 text-[10px] font-semibold">
            {individuales.length}
          </span>
        </button>
        <button
          onClick={() => setVista("grupales")}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-3 py-1.5 transition",
            vista === "grupales"
              ? "bg-violet-600 text-white"
              : "border border-border bg-card hover:bg-secondary"
          )}
        >
          <Users className="h-3.5 w-3.5" />
          Entregas grupales
          <span className="rounded bg-white/20 px-1.5 py-0.5 text-[10px] font-semibold">
            {grupales.length}
          </span>
        </button>
      </div>

      {/* Filtros de estado */}
      <div className="flex flex-wrap gap-1.5 text-xs">
        {(["pendiente", "aprobada", "reprobada", "todas"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={cn(
              "rounded-md px-2.5 py-1 transition",
              filtro === f
                ? "bg-primary text-primary-foreground"
                : "bg-secondary hover:bg-secondary/70"
            )}
          >
            {f === "pendiente" && <Clock className="mr-1 inline h-3 w-3" />}
            {f === "aprobada" && <CheckCircle2 className="mr-1 inline h-3 w-3" />}
            {f === "reprobada" && <XCircle className="mr-1 inline h-3 w-3" />}
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f !== "todas" && <span className="ml-1 opacity-75">({ctVista[f]})</span>}
          </button>
        ))}
      </div>

      {/* Agrupamiento (por alumno/grupo o por etapa) + orden de la lista */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <div className="inline-flex overflow-hidden rounded-md border border-border">
          <button
            onClick={() => setAgrupamiento("por_titular")}
            className={cn(
              "px-2.5 py-1 transition",
              agrupamiento === "por_titular"
                ? "bg-foreground text-background"
                : "bg-card hover:bg-secondary"
            )}
            title="Un card por alumno/grupo, con todas sus etapas adentro."
          >
            {vista === "grupales" ? "Por grupo" : "Por alumno"}
          </button>
          <button
            onClick={() => setAgrupamiento("por_etapa")}
            className={cn(
              "border-l border-border px-2.5 py-1 transition",
              agrupamiento === "por_etapa"
                ? "bg-foreground text-background"
                : "bg-card hover:bg-secondary"
            )}
            title="Un card por etapa, con TODOS los que entregaron esa etapa. Útil para calificar en lote."
          >
            Por etapa
          </button>
        </div>

        {agrupamiento === "por_titular" && (
          <label className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2 py-1">
            <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">Ordenar:</span>
            <select
              value={orden}
              onChange={(e) => setOrden(e.target.value as Orden)}
              className="bg-transparent text-foreground focus:outline-none"
            >
              <option value="ultima_entrega">Última entrega</option>
              <option value="mas_pendientes">Más pendientes primero</option>
              <option value="promedio_bajo">Promedio más bajo primero</option>
            </select>
          </label>
        )}
      </div>

      {vista === "grupales" && (
        <p className="text-[11px] text-violet-700 dark:text-violet-300">
          Cuando calificas una entrega grupal, la nota se acredita al promedio individual de
          TODOS los miembros del grupo.
        </p>
      )}

      {cargando ? (
        <div className="flex items-center justify-center gap-2 py-6 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
          Cargando entregas…
        </div>
      ) : filtrados.length === 0 ? (
        <div className="rounded-md border border-dashed border-border bg-secondary/30 p-4 text-center text-xs text-muted-foreground">
          {vista === "grupales"
            ? filtro === "pendiente"
              ? "No hay entregas grupales pendientes."
              : "Sin entregas grupales en este filtro."
            : filtro === "pendiente"
              ? "No hay entregas individuales pendientes 🎉"
              : "Sin entregas individuales en este filtro."}
        </div>
      ) : (
        <div className="space-y-2">
          {filtrados.map((g) => (
            <TarjetaAgrupada
              key={g.key}
              grupo={g}
              vista={vista}
              agrupamiento={agrupamiento}
              etiquetaChip={(e) =>
                agrupamiento === "por_etapa" ? nombreTitularDe(e) : null
              }
              onRevisar={(e) => {
                // Otras pendientes del mismo alumno+proyecto (excluyendo la abierta).
                const otrasPendientes = g.entregas.filter(
                  (x) => x.id !== e.id && x.estado === "pendiente"
                );
                setEntregaActiva({ entrega: e, otrasPendientes });
              }}
              onRevisarLote={(pendientes) =>
                setLoteMasivo({ titular: g.nombreTitular, entregas: pendientes })
              }
              onCalificarTodoIgual={(pendientes) =>
                setLoteRapido({ titular: g.nombreTitular, entregas: pendientes })
              }
            />
          ))}
        </div>
      )}

      {entregaActiva && (
        <ModalRevisarEntrega
          entrega={entregaActiva.entrega}
          otrasPendientes={entregaActiva.otrasPendientes}
          onCerrar={(actualizada) => {
            setEntregaActiva(null);
            if (actualizada) cargar();
          }}
        />
      )}

      {loteMasivo && (
        <ModalRevisionMasiva
          entregas={loteMasivo.entregas}
          titular={loteMasivo.titular}
          onCerrar={(alguna) => {
            setLoteMasivo(null);
            if (alguna) cargar();
          }}
        />
      )}

      {loteRapido && (
        <ModalCalificarTodoIgual
          entregas={loteRapido.entregas}
          titular={loteRapido.titular}
          onCerrar={(alguna) => {
            setLoteRapido(null);
            if (alguna) cargar();
          }}
        />
      )}
    </div>
  );
}

function TarjetaAgrupada({
  grupo,
  vista,
  agrupamiento,
  etiquetaChip,
  onRevisar,
  onRevisarLote,
  onCalificarTodoIgual,
}: {
  grupo: Agrupado;
  vista: Vista;
  agrupamiento: Agrupamiento;
  /** Si devuelve string, ese texto reemplaza el "Etapa N" del chip. */
  etiquetaChip: (e: Entrega) => string | null;
  onRevisar: (e: Entrega) => void;
  onRevisarLote: (pendientes: Entrega[]) => void;
  onCalificarTodoIgual: (pendientes: Entrega[]) => void;
}) {
  const pendientes = grupo.entregas.filter((e) => e.estado === "pendiente");
  const esVistaEtapa = agrupamiento === "por_etapa";
  return (
    <div className="rounded-md border border-border bg-card p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-sm font-semibold">
            {esVistaEtapa ? (
              <Layers className="h-3.5 w-3.5 text-primary" />
            ) : vista === "grupales" ? (
              <Users className="h-3.5 w-3.5 text-violet-600" />
            ) : (
              <User className="h-3.5 w-3.5 text-sky-600" />
            )}
            {grupo.nombreTitular}
          </div>
          <div className="text-[11px] text-muted-foreground">
            {grupo.nombreProyecto}
            {grupo.metaSecundaria ? (grupo.nombreProyecto ? ` · ${grupo.metaSecundaria}` : grupo.metaSecundaria) : ""}
            {!esVistaEtapa && vista === "individuales" && grupo.entregas[0]?.perfil?.email
              ? ` · ${grupo.entregas[0].perfil.email}`
              : ""}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
          {pendientes.length >= 2 && (
            <button
              onClick={() => onCalificarTodoIgual(pendientes)}
              title="Misma nota y comentario para todas las pendientes (sin abrir tab por tab)"
              className="flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-0.5 text-[11px] font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              <Zap className="h-3 w-3" />
              Calificar todo igual
            </button>
          )}
          {pendientes.length >= 2 && (
            <button
              onClick={() => onRevisarLote(pendientes)}
              title="Revisar etapa por etapa con nota distinta cada una"
              className="flex items-center gap-1 rounded-md bg-amber-500 px-2 py-0.5 text-[11px] font-semibold text-white shadow-sm transition hover:bg-amber-600"
            >
              <Layers className="h-3 w-3" />
              Revisar las {pendientes.length} pendientes
            </button>
          )}
          <span className="rounded-full bg-secondary px-2 py-0.5">
            Entregas: <strong>{grupo.entregas.length}</strong>
          </span>
          {grupo.pendientes > 0 && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
              {grupo.pendientes} pendiente{grupo.pendientes === 1 ? "" : "s"}
            </span>
          )}
          {grupo.aprobadas > 0 && (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100">
              {grupo.aprobadas} aprobada{grupo.aprobadas === 1 ? "" : "s"}
            </span>
          )}
          {grupo.reprobadas > 0 && (
            <span className="rounded-full bg-rose-100 px-2 py-0.5 text-rose-900 dark:bg-rose-950/40 dark:text-rose-100">
              {grupo.reprobadas} reprobada{grupo.reprobadas === 1 ? "" : "s"}
            </span>
          )}
          {grupo.promedio != null && (
            <span className="rounded-full bg-primary/15 px-2 py-0.5 font-bold text-primary">
              Promedio: {grupo.promedio}
            </span>
          )}
        </div>
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5 border-t border-border/50 pt-2">
        {grupo.entregas.map((e) => (
          <ChipEtapa
            key={e.id}
            entrega={e}
            etiqueta={etiquetaChip(e)}
            onClick={() => onRevisar(e)}
          />
        ))}
      </div>
    </div>
  );
}

function ChipEtapa({
  entrega,
  etiqueta,
  onClick,
}: {
  entrega: Entrega;
  /** Texto que reemplaza el "Etapa N" (ej. nombre del alumno en vista por etapa). */
  etiqueta: string | null;
  onClick: () => void;
}) {
  const etapa = entrega.paso_entregado;
  const estiloEstado =
    entrega.estado === "aprobada"
      ? "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-100"
      : entrega.estado === "reprobada"
        ? "border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-700 dark:bg-rose-950/40 dark:text-rose-100"
        : "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100";
  const textoBase = etiqueta ?? (etapa ? `Etapa ${etapa}` : "Proyecto");
  return (
    <button
      onClick={onClick}
      title={`Intento #${entrega.numero_intento} — ${entrega.estado}${entrega.nota != null ? ` · Nota ${entrega.nota}` : ""}`}
      className={cn(
        "flex items-center gap-1.5 rounded-md border px-2 py-1 text-[10px] font-medium transition hover:brightness-95",
        estiloEstado
      )}
    >
      <span>
        {textoBase}
        {entrega.numero_intento > 1 ? ` · #${entrega.numero_intento}` : ""}
      </span>
      {entrega.nota != null ? (
        <span className="rounded bg-white/60 px-1 font-bold dark:bg-black/40">{entrega.nota}</span>
      ) : (
        <span className="opacity-70">·</span>
      )}
      <ChevronRight className="h-3 w-3" />
    </button>
  );
}
