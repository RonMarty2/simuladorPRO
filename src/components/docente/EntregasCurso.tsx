import { useEffect, useState } from "react";
import { CheckCircle2, ChevronRight, Clock, Loader2, XCircle } from "lucide-react";
import { listarEntregasDelCurso } from "@/lib/proyecto-supabase";
import type { Entrega } from "@/types/proyecto";
import { formatearBolivianos, cn } from "@/lib/utils";
import ModalRevisarEntrega from "./ModalRevisarEntrega";

export default function EntregasCurso({ cursoId }: { cursoId: string }) {
  const [entregas, setEntregas] = useState<Entrega[]>([]);
  const [cargando, setCargando] = useState(true);
  const [entregaActiva, setEntregaActiva] = useState<Entrega | null>(null);
  const [filtro, setFiltro] = useState<"todas" | "pendiente" | "aprobada" | "reprobada">("pendiente");

  const cargar = async () => {
    setCargando(true);
    try {
      const lista = await listarEntregasDelCurso(cursoId);
      setEntregas(lista);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, [cursoId]);

  const filtradas = entregas.filter((e) => filtro === "todas" || e.estado === filtro);

  const contadores = {
    pendiente: entregas.filter((e) => e.estado === "pendiente").length,
    aprobada: entregas.filter((e) => e.estado === "aprobada").length,
    reprobada: entregas.filter((e) => e.estado === "reprobada").length,
  };

  return (
    <div className="space-y-2">
      {/* Filtros */}
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
              <span className="ml-1 opacity-75">({contadores[f]})</span>
            )}
          </button>
        ))}
      </div>

      {cargando ? (
        <div className="flex items-center justify-center gap-2 py-6 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
          Cargando entregas…
        </div>
      ) : filtradas.length === 0 ? (
        <div className="rounded-md border border-dashed border-border bg-secondary/30 p-4 text-center text-xs text-muted-foreground">
          {filtro === "pendiente"
            ? "No hay entregas pendientes de revisión 🎉"
            : "Sin entregas en este filtro."}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full text-xs">
            <thead className="bg-secondary/30 text-[10px] uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="p-2 text-left">Estudiante</th>
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
  onRevisar,
}: {
  entrega: Entrega;
  onRevisar: () => void;
}) {
  const datos = entrega.snapshot_datos;
  // estudiante_id no tiene nombre cargado — mostramos id corto
  const nombreEstu = `Estudiante ${entrega.estudiante_id.slice(0, 6)}`;

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
        <div className="font-medium">{nombreEstu}</div>
        <div className="text-[10px] text-muted-foreground">{datos.nombre}</div>
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
