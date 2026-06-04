import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ChevronRight, Clock, Loader2, Users, User, XCircle, Layers, Zap } from "lucide-react";
import { listarEntregasDelCurso } from "@/lib/proyecto-supabase";
import { listarGruposDeCurso, type GrupoConMiembros } from "@/lib/grupos-supabase";
import type { Entrega } from "@/types/proyecto";
import { cn } from "@/lib/utils";
import ModalRevisarEntrega from "./ModalRevisarEntrega";
import ModalRevisionMasiva from "./ModalRevisionMasiva";
import ModalCalificarTodoIgual from "./ModalCalificarTodoIgual";

type Vista = "individuales" | "grupales";
type Filtro = "todas" | "pendiente" | "aprobada" | "reprobada";

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
}

export default function EntregasCurso({ cursoId }: { cursoId: string }) {
  const [entregas, setEntregas] = useState<Entrega[]>([]);
  const [grupos, setGrupos] = useState<GrupoConMiembros[]>([]);
  const [cargando, setCargando] = useState(true);
  const [entregaActiva, setEntregaActiva] = useState<Entrega | null>(null);
  // Para "revisión rápida" del lote pendiente de un estudiante o grupo.
  const [loteMasivo, setLoteMasivo] = useState<{ titular: string; entregas: Entrega[] } | null>(null);
  // "Calificar todo igual": misma nota + comentario para todas las pendientes
  // del alumno (sin entrar tab por tab). Caso del docente que ya miró el
  // trabajo y solo quiere cerrar todo de una vez.
  const [loteRapido, setLoteRapido] = useState<{ titular: string; entregas: Entrega[] } | null>(null);
  const [vista, setVista] = useState<Vista>("individuales");
  const [filtro, setFiltro] = useState<Filtro>("pendiente");

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

  // Agrupar para la vista actual
  const agrupadas = useMemo<Agrupado[]>(() => {
    const fuente = vista === "individuales" ? individuales : grupales;
    const map = new Map<string, Entrega[]>();
    for (const e of fuente) {
      const key =
        vista === "grupales"
          ? e.proyecto_id
          : `${e.estudiante_id}|${e.proyecto_id}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    }
    return Array.from(map.entries()).map(([key, es]) => {
      es.sort((a, b) => (a.paso_entregado ?? 999) - (b.paso_entregado ?? 999));
      const primera = es[0];
      const grupo = grupoPorProyecto.get(primera.proyecto_id) ?? null;
      const notas = es.filter((e) => e.nota != null).map((e) => e.nota as number);
      const promedio =
        notas.length > 0 ? Math.round((notas.reduce((a, b) => a + b, 0) / notas.length) * 100) / 100 : null;
      return {
        key,
        nombreTitular:
          vista === "grupales"
            ? grupo?.nombre ?? (primera.snapshot_datos?.nombre ?? "(grupo)")
            : (primera.perfil
                ? `${primera.perfil.nombre} ${primera.perfil.apellido}`.trim() ||
                  primera.perfil.email
                : `Estudiante ${primera.estudiante_id.slice(0, 6)}`),
        nombreProyecto: primera.snapshot_datos?.nombre ?? "",
        metaSecundaria:
          vista === "grupales" && grupo
            ? `${grupo.miembros.length} integrante${grupo.miembros.length === 1 ? "" : "s"}`
            : undefined,
        entregas: es,
        pendientes: es.filter((e) => e.estado === "pendiente").length,
        aprobadas: es.filter((e) => e.estado === "aprobada").length,
        reprobadas: es.filter((e) => e.estado === "reprobada").length,
        promedio,
      };
    });
  }, [vista, individuales, grupales, grupoPorProyecto]);

  // Filtrar grupos según el estado de sus entregas
  const filtrados = useMemo(() => {
    if (filtro === "todas") return agrupadas;
    return agrupadas
      .map((a) => ({
        ...a,
        entregas: a.entregas.filter((e) => e.estado === filtro),
      }))
      .filter((a) => a.entregas.length > 0);
  }, [agrupadas, filtro]);

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
              onRevisar={(e) => setEntregaActiva(e)}
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
          entrega={entregaActiva}
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
  onRevisar,
  onRevisarLote,
  onCalificarTodoIgual,
}: {
  grupo: Agrupado;
  vista: Vista;
  onRevisar: (e: Entrega) => void;
  onRevisarLote: (pendientes: Entrega[]) => void;
  onCalificarTodoIgual: (pendientes: Entrega[]) => void;
}) {
  const pendientes = grupo.entregas.filter((e) => e.estado === "pendiente");
  return (
    <div className="rounded-md border border-border bg-card p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-sm font-semibold">
            {vista === "grupales" ? (
              <Users className="h-3.5 w-3.5 text-violet-600" />
            ) : (
              <User className="h-3.5 w-3.5 text-sky-600" />
            )}
            {grupo.nombreTitular}
          </div>
          <div className="text-[11px] text-muted-foreground">
            {grupo.nombreProyecto}
            {grupo.metaSecundaria ? ` · ${grupo.metaSecundaria}` : ""}
            {vista === "individuales" && grupo.entregas[0]?.perfil?.email
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
          <ChipEtapa key={e.id} entrega={e} onClick={() => onRevisar(e)} />
        ))}
      </div>
    </div>
  );
}

function ChipEtapa({ entrega, onClick }: { entrega: Entrega; onClick: () => void }) {
  const etapa = entrega.paso_entregado;
  const estiloEstado =
    entrega.estado === "aprobada"
      ? "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-100"
      : entrega.estado === "reprobada"
        ? "border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-700 dark:bg-rose-950/40 dark:text-rose-100"
        : "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100";
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
        {etapa ? `Etapa ${etapa}` : "Proyecto"}
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
