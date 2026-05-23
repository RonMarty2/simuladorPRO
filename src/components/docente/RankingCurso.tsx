import { useEffect, useState } from "react";
import { Award, Download, Eye, Medal, RefreshCw, Trophy } from "lucide-react";
import {
  descargarCSV,
  obtenerRankingCurso,
  rankingACSV,
  type Curso,
  type FilaRanking,
} from "@/lib/cursos-supabase";
import { formatearBolivianos, cn } from "@/lib/utils";
import DetalleEstudiante from "./DetalleEstudiante";

interface Props {
  cursoId: string;
  curso?: Pick<Curso, "nombre" | "codigo" | "materia">;
}

type ColumnaOrden = "utilidad_acumulada" | "caja" | "turno_actual" | "reputacion";

export default function RankingCurso({ cursoId, curso }: Props) {
  const [filas, setFilas] = useState<FilaRanking[]>([]);
  const [cargando, setCargando] = useState(true);
  const [orden, setOrden] = useState<ColumnaOrden>("utilidad_acumulada");
  const [error, setError] = useState<string | null>(null);
  const [actualizandoEn, setActualizandoEn] = useState<Date>(new Date());
  const [expandido, setExpandido] = useState<string | null>(null);

  const cargar = async () => {
    setCargando(true);
    try {
      const r = await obtenerRankingCurso(cursoId);
      setFilas(r);
      setActualizandoEn(new Date());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar ranking");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
    // Auto-refresh cada 30 segundos
    const id = setInterval(cargar, 30000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursoId]);

  const ordenado = [...filas].sort((a, b) => {
    if (a.tiene_simulacion !== b.tiene_simulacion) return a.tiene_simulacion ? -1 : 1;
    return (b[orden] as number) - (a[orden] as number);
  });

  if (cargando && filas.length === 0) {
    return <div className="text-xs text-muted-foreground">Cargando ranking…</div>;
  }

  if (error) {
    return (
      <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-xs text-destructive">
        {error}
      </div>
    );
  }

  if (filas.length === 0) {
    return (
      <div className="text-xs text-muted-foreground">
        Aún no hay estudiantes inscritos.
      </div>
    );
  }

  const exportarCSV = () => {
    if (!curso) return;
    const csv = rankingACSV(curso, ordenado);
    const fecha = new Date().toISOString().slice(0, 10);
    const nombre = `ranking_${curso.codigo}_${fecha}.csv`;
    descargarCSV(csv, nombre);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Trophy className="h-3.5 w-3.5" />
          <span>Ranking en vivo — auto-refresh cada 30s</span>
        </div>
        <div className="flex items-center gap-3">
          {curso && (
            <button
              onClick={exportarCSV}
              className="flex items-center gap-1 text-muted-foreground transition hover:text-foreground"
            >
              <Download className="h-3 w-3" />
              Exportar CSV
            </button>
          )}
          <button
            onClick={cargar}
            className="flex items-center gap-1 text-muted-foreground transition hover:text-foreground"
          >
            <RefreshCw className={cn("h-3 w-3", cargando && "animate-spin")} />
            Actualizar
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-md border border-border">
        <table className="w-full text-xs">
          <thead className="bg-secondary/30 text-muted-foreground">
            <tr>
              <th className="p-2 text-left">#</th>
              <th className="p-2 text-left">Estudiante</th>
              <th className="p-2 text-left">Proyecto</th>
              <th className="p-2 text-center">
                <BotonOrden
                  campo="turno_actual"
                  orden={orden}
                  onSet={setOrden}
                  label="Turno"
                />
              </th>
              <th className="p-2 text-right">
                <BotonOrden
                  campo="utilidad_acumulada"
                  orden={orden}
                  onSet={setOrden}
                  label="Utilidad"
                />
              </th>
              <th className="p-2 text-right">
                <BotonOrden
                  campo="caja"
                  orden={orden}
                  onSet={setOrden}
                  label="Caja"
                />
              </th>
              <th className="p-2 text-right">
                <BotonOrden
                  campo="reputacion"
                  orden={orden}
                  onSet={setOrden}
                  label="Reputación"
                />
              </th>
              <th className="p-2 text-center">Estado</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {ordenado.map((f, idx) => (
              <>
              <tr
                key={f.estudiante_id}
                className={cn(
                  "border-t border-border transition",
                  expandido === f.estudiante_id ? "bg-secondary/40" : "hover:bg-secondary/20"
                )}
              >
                <td className="p-2">
                  <PuestoChip puesto={idx + 1} />
                </td>
                <td className="p-2">
                  <div className="font-medium">{f.nombre_completo}</div>
                  {f.universidad && (
                    <div className="text-[10px] text-muted-foreground">{f.universidad}</div>
                  )}
                </td>
                <td className="p-2">
                  {f.tiene_proyecto ? (
                    <span>{f.nombre_proyecto}</span>
                  ) : (
                    <span className="italic text-muted-foreground">Sin proyecto</span>
                  )}
                </td>
                <td className="p-2 text-center">
                  {f.tiene_simulacion ? (
                    <span>
                      {f.turno_actual}/{f.turnos_totales}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="p-2 text-right">
                  {f.tiene_simulacion ? (
                    <span
                      className={cn(
                        "font-medium",
                        f.utilidad_acumulada >= 0
                          ? "text-emerald-700 dark:text-emerald-400"
                          : "text-destructive"
                      )}
                    >
                      {formatearBolivianos(f.utilidad_acumulada)}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="p-2 text-right">
                  {f.tiene_simulacion ? (
                    <span
                      className={cn(
                        f.caja < 0 ? "text-destructive" : "text-foreground"
                      )}
                    >
                      {formatearBolivianos(f.caja)}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="p-2 text-right">
                  {f.tiene_simulacion ? `${(f.reputacion * 100).toFixed(0)}%` : "—"}
                </td>
                <td className="p-2 text-center">
                  <EstadoChip
                    tieneSimulacion={f.tiene_simulacion}
                    estado={f.estado_simulacion}
                  />
                </td>
                <td className="p-2 text-right">
                  {f.tiene_proyecto && (
                    <button
                      onClick={() =>
                        setExpandido(expandido === f.estudiante_id ? null : f.estudiante_id)
                      }
                      className="flex items-center gap-1 text-muted-foreground transition hover:text-foreground"
                      title="Ver detalle del proyecto"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      {expandido === f.estudiante_id ? "Ocultar" : "Ver"}
                    </button>
                  )}
                </td>
              </tr>
              {expandido === f.estudiante_id && (
                <tr className="border-t border-border bg-secondary/10">
                  <td colSpan={9} className="p-3">
                    <DetalleEstudiante
                      cursoId={cursoId}
                      estudianteId={f.estudiante_id}
                      nombreEstudiante={f.nombre_completo}
                    />
                  </td>
                </tr>
              )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-[10px] text-muted-foreground">
        Última actualización: {actualizandoEn.toLocaleTimeString("es-BO")}
      </div>
    </div>
  );
}

function BotonOrden({
  campo,
  orden,
  onSet,
  label,
}: {
  campo: ColumnaOrden;
  orden: ColumnaOrden;
  onSet: (c: ColumnaOrden) => void;
  label: string;
}) {
  const activo = orden === campo;
  return (
    <button
      onClick={() => onSet(campo)}
      className={cn(
        "transition hover:text-foreground",
        activo && "font-semibold text-foreground"
      )}
    >
      {label} {activo && "↓"}
    </button>
  );
}

function PuestoChip({ puesto }: { puesto: number }) {
  if (puesto === 1)
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-yellow-400/20 text-yellow-700 dark:text-yellow-300">
        <Trophy className="h-3.5 w-3.5" />
      </span>
    );
  if (puesto === 2)
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-400/20 text-slate-600 dark:text-slate-300">
        <Medal className="h-3.5 w-3.5" />
      </span>
    );
  if (puesto === 3)
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-700/20 text-amber-700 dark:text-amber-400">
        <Award className="h-3.5 w-3.5" />
      </span>
    );
  return <span className="text-muted-foreground">{puesto}</span>;
}

function EstadoChip({
  tieneSimulacion,
  estado,
}: {
  tieneSimulacion: boolean;
  estado: string | null;
}) {
  if (!tieneSimulacion) {
    return (
      <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">
        sin iniciar
      </span>
    );
  }
  if (estado === "activa") {
    return (
      <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] text-blue-800 dark:bg-blue-950 dark:text-blue-300">
        simulando
      </span>
    );
  }
  if (estado === "finalizada") {
    return (
      <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
        finalizada
      </span>
    );
  }
  if (estado === "quebrada") {
    return (
      <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] text-red-800 dark:bg-red-950 dark:text-red-300">
        quebrada
      </span>
    );
  }
  return null;
}
