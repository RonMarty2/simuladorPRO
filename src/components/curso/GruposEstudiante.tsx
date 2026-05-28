import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, FolderOpen, LogIn, LogOut, Loader2 } from "lucide-react";
import { guardarProyectoActivo } from "@/components/constructor/SelectorProyecto";
import { obtenerPromedioEstudiante } from "@/lib/proyecto-supabase";
import { calcularNotaFinal } from "@/lib/notas";
import type { Curso } from "@/lib/cursos-supabase";
import {
  listarGruposParaEstudiante,
  obtenerMiGrupo,
  unirseAGrupo,
  salirDeGrupo,
  type GrupoConMiembros,
  type Grupo,
} from "@/lib/grupos-supabase";

export default function GruposEstudiante({
  curso,
  estudianteId,
}: {
  curso: Curso;
  estudianteId: string;
}) {
  const navigate = useNavigate();
  const [grupos, setGrupos] = useState<GrupoConMiembros[] | null>(null);
  const [miGrupo, setMiGrupo] = useState<Grupo | null>(null);
  const [promedioInd, setPromedioInd] = useState<number | null>(null);
  const [accion, setAccion] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recargar = async () => {
    try {
      const [gs, mg, prom] = await Promise.all([
        listarGruposParaEstudiante(curso.id),
        obtenerMiGrupo(estudianteId, curso.id),
        obtenerPromedioEstudiante(estudianteId, curso.id),
      ]);
      setGrupos(gs);
      setMiGrupo(mg);
      setPromedioInd(prom?.promedio_nota ?? null);
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? String(e));
    }
  };

  useEffect(() => {
    recargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [curso.id, estudianteId]);

  const unirme = async (grupoId: string) => {
    setAccion(true);
    setError(null);
    try {
      await unirseAGrupo(grupoId, estudianteId);
      await recargar();
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setAccion(false);
    }
  };

  const salir = async (grupoId: string) => {
    setAccion(true);
    setError(null);
    try {
      await salirDeGrupo(grupoId, estudianteId);
      await recargar();
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setAccion(false);
    }
  };

  const abrirProyecto = (proyectoId: string | null) => {
    if (!proyectoId) return;
    guardarProyectoActivo(estudianteId, proyectoId);
    navigate("/construir");
  };

  if (grupos === null) {
    return <div className="text-[11px] text-muted-foreground">Cargando grupos…</div>;
  }

  if (grupos.length === 0) {
    return (
      <div className="text-[11px] text-muted-foreground">
        Este curso todavía no tiene proyectos grupales.
      </div>
    );
  }

  const miGrupoDetalle = miGrupo ? grupos.find((g) => g.id === miGrupo.id) ?? null : null;

  // Nota final (individual ponderada con grupal)
  const nf = calcularNotaFinal({
    promedioIndividual: promedioInd,
    notaGrupal: miGrupo?.nota ?? null,
    pesoIndividual: curso.peso_individual ?? 0.5,
    pesoGrupal: curso.peso_grupal ?? 0.5,
  });

  return (
    <div className="space-y-2">
      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-2 py-1.5 text-[11px] text-destructive">
          {error}
        </div>
      )}

      {miGrupoDetalle ? (
        <div className="rounded-md border-2 border-primary/40 bg-primary/5 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Users className="h-3.5 w-3.5 text-primary" />
              <span className="text-sm font-semibold">{miGrupoDetalle.nombre}</span>
              <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">
                {miGrupoDetalle.miembros.length} / {miGrupoDetalle.cupo_max}
              </span>
              <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                Tu grupo
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => abrirProyecto(miGrupoDetalle.proyecto_id)}
                className="flex items-center gap-1 rounded-md bg-primary px-2.5 py-1 text-[11px] font-medium text-primary-foreground hover:bg-primary/90"
              >
                <FolderOpen className="h-3 w-3" />
                Abrir proyecto grupal
              </button>
              <button
                onClick={() => salir(miGrupoDetalle.id)}
                disabled={accion}
                className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] text-muted-foreground hover:text-destructive disabled:opacity-50"
              >
                {accion ? <Loader2 className="h-3 w-3 animate-spin" /> : <LogOut className="h-3 w-3" />}
                Salir
              </button>
            </div>
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground">
            Integrantes:{" "}
            {miGrupoDetalle.miembros.map((m) => `${m.nombre} ${m.apellido}`.trim()).join(", ")}
          </div>

          {/* Notas */}
          <div className="mt-2 grid grid-cols-1 gap-1.5 border-t border-border/50 pt-2 text-[11px] sm:grid-cols-3">
            <Nota etiqueta="Nota grupal" valor={miGrupo?.nota} />
            <Nota etiqueta="Promedio individual" valor={promedioInd} />
            <Nota etiqueta="Nota final (ponderada)" valor={nf.final} destacada />
          </div>
          {miGrupo?.comentario_docente && (
            <div className="mt-1.5 rounded bg-secondary/40 px-2 py-1 text-[11px]">
              <strong>Comentario del docente:</strong> {miGrupo.comentario_docente}
            </div>
          )}
          <div className="mt-1 text-[10px] text-muted-foreground">
            Ponderación del curso: {Math.round((curso.peso_individual ?? 0.5) * 100)}% individual ·{" "}
            {Math.round((curso.peso_grupal ?? 0.5) * 100)}% grupal.
          </div>
        </div>
      ) : (
        <div className="space-y-1.5">
          <div className="text-[11px] text-muted-foreground">
            Unite a un grupo para trabajar el proyecto grupal (solo podés estar en uno).
          </div>
          {grupos.map((g) => {
            const lleno = g.miembros.length >= g.cupo_max;
            return (
              <div
                key={g.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-card p-2"
              >
                <div className="flex items-center gap-2">
                  <Users className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium">{g.nombre}</span>
                  <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    {g.miembros.length} / {g.cupo_max}
                  </span>
                  {lleno && <span className="text-[10px] text-amber-600">lleno</span>}
                </div>
                <button
                  onClick={() => unirme(g.id)}
                  disabled={accion || lleno}
                  className="flex items-center gap-1 rounded-md bg-primary px-2.5 py-1 text-[11px] font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {accion ? <Loader2 className="h-3 w-3 animate-spin" /> : <LogIn className="h-3 w-3" />}
                  Unirme
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Nota({
  etiqueta,
  valor,
  destacada,
}: {
  etiqueta: string;
  valor: number | null | undefined;
  destacada?: boolean;
}) {
  return (
    <div className={"rounded-md p-1.5 " + (destacada ? "bg-primary/10" : "bg-secondary/30")}>
      <div className="text-[9px] uppercase tracking-wide text-muted-foreground">{etiqueta}</div>
      <div className={"font-bold " + (destacada ? "text-base text-primary" : "text-sm")}>
        {valor == null ? "—" : valor}
      </div>
    </div>
  );
}
