import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, ChevronRight, Clock, Loader2, Users, User, XCircle } from "lucide-react";
import { listarEntregasDelCurso } from "@/lib/proyecto-supabase";
import { listarGruposDeCurso, type GrupoConMiembros } from "@/lib/grupos-supabase";
import type { Entrega } from "@/types/proyecto";
import { formatearBolivianos, cn } from "@/lib/utils";
import ModalRevisarEntrega from "./ModalRevisarEntrega";

type Vista = "individuales" | "grupales";
type Filtro = "todas" | "pendiente" | "aprobada" | "reprobada";

export default function EntregasCurso({ cursoId }: { cursoId: string }) {
  const [entregas, setEntregas] = useState<Entrega[]>([]);
  const [grupos, setGrupos] = useState<GrupoConMiembros[]>([]);
  const [cargando, setCargando] = useState(true);
  const [entregaActiva, setEntregaActiva] = useState<Entrega | null>(null);
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

  // Mapa proyecto_id -> grupo (para identificar entregas grupales y su nombre)
  const grupoPorProyecto = useMemo(() => {
    const m = new Map<string, GrupoConMiembros>();
    for (const g of grupos) {
      if (g.proyecto_id) m.set(g.proyecto_id, g);
    }
    return m;
  }, [grupos]);

  // Detección de entrega grupal: el snapshot del proyecto trae grupo_id seteado.
  const esGrupal = (e: Entrega): boolean => {
    const s = e.snapshot_datos ?? {};
    return !!s.grupo_id;
  };

  const individuales = entregas.filter((e) => !esGrupal(e));
  const grupales = entregas.filter((e) => esGrupal(e));

  const fuente = vista === "individuales" ? individuales : grupales;
  const filtradas = fuente.filter((e) => filtro === "todas" || e.estado === filtro);

  const contadores = (lista: Entrega[]) => ({
    pendiente: lista.filter((e) => e.estado === "pendiente").length,
    aprobada: lista.filter((e) => e.estado === "aprobada").length,
    reprobada: lista.filter((e) => e.estado === "reprobada").length,
  });
  const ct = contadores(fuente);

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

      {/* Filtros estado */}
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
            {f !== "todas" && (
              <span className="ml-1 opacity-75">({ct[f]})</span>
            )}
          </button>
        ))}
      </div>

      {vista === "grupales" && (
        <p className="text-[11px] text-violet-700 dark:text-violet-300">
          Cuando calificas una entrega grupal, la nota se acredita automáticamente al
          promedio individual de TODOS los miembros del grupo.
        </p>
      )}

      {cargando ? (
        <div className="flex items-center justify-center gap-2 py-6 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
          Cargando entregas…
        </div>
      ) : filtradas.length === 0 ? (
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
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full text-xs">
            <thead className="bg-secondary/30 text-[10px] uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="p-2 text-left">
                  {vista === "grupales" ? "Grupo" : "Estudiante"}
                </th>
                <th className="p-2 text-center">Etapa</th>
                <th className="p-2 text-center">Intento</th>
                <th className="p-2 text-right">VAN</th>
                <th className="p-2 text-right">TIR</th>
                <th className="p-2 text-center">Sugerencia</th>
                <th className="p-2 text-center">Estado</th>
                <th className="p-2 text-right">Nota</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {filtradas.map((e) => (
                <FilaEntrega
                  key={e.id}
                  entrega={e}
                  vista={vista}
                  grupo={grupoPorProyecto.get(e.proyecto_id) ?? null}
                  onRevisar={() => setEntregaActiva(e)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {entregaActiva && (
        <ModalRevisarEntrega
          entrega={entregaActiva}
          onCerrar={(actualizada) => {
            setEntregaActiva(null);
            if (actualizada) {
              cargar();
            }
          }}
        />
      )}
    </div>
  );
}

function FilaEntrega({
  entrega,
  vista,
  grupo,
  onRevisar,
}: {
  entrega: Entrega;
  vista: Vista;
  grupo: GrupoConMiembros | null;
  onRevisar: () => void;
}) {
  const datos = entrega.snapshot_datos ?? {};
  const nombreEstu = `Estudiante ${entrega.estudiante_id.slice(0, 6)}`;
  // Nombre del grupo (cuando es grupal). Si no encontramos el grupo (porque
  // fue borrado), mostramos el nombre del proyecto como fallback.
  const nombreGrupo = grupo?.nombre ?? datos.nombre ?? "(grupo)";
  const cantidadMiembros = grupo?.miembros?.length ?? 0;

  const colorEstado =
    entrega.estado === "aprobada"
      ? "text-emerald-700 dark:text-emerald-400"
      : entrega.estado === "reprobada"
      ? "text-destructive"
      : "text-amber-700 dark:text-amber-400";

  const iconoSug =
    entrega.sugerencia_automatica === "aprobar"
      ? "👍"
      : entrega.sugerencia_automatica === "reprobar"
      ? "👎"
      : entrega.sugerencia_automatica === "duda"
      ? "🤔"
      : "—";

  return (
    <tr className="border-t border-border/40 hover:bg-secondary/20">
      <td className="p-2">
        {vista === "grupales" ? (
          <>
            <div className="flex items-center gap-1.5 font-medium">
              <Users className="h-3 w-3 text-violet-600" />
              {nombreGrupo}
            </div>
            <div className="text-[10px] text-muted-foreground">
              {cantidadMiembros} integrante{cantidadMiembros === 1 ? "" : "s"}
              {" · "}entregado por: {entrega.estudiante_id.slice(0, 6)}
            </div>
          </>
        ) : (
          <>
            <div className="font-medium">{nombreEstu}</div>
            <div className="text-[10px] text-muted-foreground">{datos.nombre}</div>
          </>
        )}
      </td>
      <td className="p-2 text-center">
        {entrega.paso_entregado ? (
          <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-semibold">
            Etapa {entrega.paso_entregado}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </td>
      <td className="p-2 text-center">#{entrega.numero_intento}</td>
      <td className="p-2 text-right tabular-nums">
        {entrega.van !== null ? formatearBolivianos(entrega.van) : "—"}
      </td>
      <td className="p-2 text-right tabular-nums">
        {entrega.tir !== null ? `${(entrega.tir * 100).toFixed(1)}%` : "—"}
      </td>
      <td className="p-2 text-center">
        <span title={(entrega.sugerencia_razones ?? []).join("\n")}>{iconoSug}</span>
        {entrega.sugerencia_nota !== null && (
          <div className="text-[10px] text-muted-foreground">{entrega.sugerencia_nota}</div>
        )}
      </td>
      <td className={cn("p-2 text-center font-medium capitalize", colorEstado)}>
        {entrega.estado}
      </td>
      <td className="p-2 text-right">
        {entrega.nota !== null ? <strong>{entrega.nota}</strong> : "—"}
      </td>
      <td className="p-2">
        <button
          onClick={onRevisar}
          className="flex items-center gap-1 rounded-md bg-primary px-2 py-1 text-[10px] font-medium text-primary-foreground hover:bg-primary/90"
        >
          {entrega.estado === "pendiente" ? "Revisar" : "Ver"}
          <ChevronRight className="h-3 w-3" />
        </button>
      </td>
    </tr>
  );
}
