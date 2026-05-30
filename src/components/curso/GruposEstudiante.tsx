import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, FolderOpen, LogIn, LogOut, Loader2, Plus } from "lucide-react";
import { guardarProyectoActivo } from "@/components/constructor/SelectorProyecto";
import { obtenerPromedioEstudiante } from "@/lib/proyecto-supabase";
import { calcularNotaFinal } from "@/lib/notas";
import type { Curso } from "@/lib/cursos-supabase";
import {
  listarGruposParaEstudiante,
  obtenerMiGrupo,
  unirseAGrupo,
  salirDeGrupo,
  crearGrupoEstudiante,
  type GrupoConMiembros,
  type Grupo,
} from "@/lib/grupos-supabase";
import type { ModeloIngreso } from "@/lib/proyecto-factory";
import type { VersionProyecto } from "@/types/proyecto";
import { cn } from "@/lib/utils";

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
  const [nombreNuevo, setNombreNuevo] = useState("");

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

  const crearMiGrupo = async () => {
    if (!nombreNuevo.trim()) return;
    setAccion(true);
    setError(null);
    try {
      await crearGrupoEstudiante({
        cursoId: curso.id,
        creadorId: estudianteId,
        nombre: nombreNuevo.trim(),
        cupoMax: curso.grupo_cupo_max ?? 4,
        version: (curso.grupo_version as VersionProyecto) ?? "v2",
        modeloIngreso: (curso.grupo_modelo as ModeloIngreso) ?? "unidades",
      });
      setNombreNuevo("");
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

  if (!curso.grupo_habilitado) {
    return (
      <div className="rounded-md border border-dashed border-border p-3 text-center text-[11px] text-muted-foreground">
        Tu docente todavía no habilitó el proyecto grupal en este curso.
      </div>
    );
  }

  if (grupos === null) {
    return <div className="text-[11px] text-muted-foreground">Cargando grupos…</div>;
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
          <div className="mt-3 border-t border-border/50 pt-3">
            <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Integrantes ({miGrupoDetalle.miembros.length})
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {miGrupoDetalle.miembros.map((m) => (
                <TarjetaIntegrante
                  key={m.estudiante_id}
                  miembro={m}
                  esYo={m.estudiante_id === estudianteId}
                />
              ))}
            </div>
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
        <div className="space-y-2">
          {curso.grupo_consigna && (
            <div className="rounded-md border border-sky-300 bg-sky-50/60 p-2 text-[11px] dark:border-sky-800 dark:bg-sky-950/20">
              <strong>Consigna del docente:</strong> {curso.grupo_consigna}
            </div>
          )}
          <div className="text-[11px] text-muted-foreground">
            Podés <strong>crear tu propio grupo</strong> o unirte a uno existente (solo uno
            por curso). Cupo máximo: <strong>{curso.grupo_cupo_max ?? 4}</strong> integrantes.
          </div>

          {/* Crear grupo */}
          <div className="flex flex-wrap gap-2 rounded-md border border-border bg-card p-2">
            <input
              type="text"
              value={nombreNuevo}
              onChange={(e) => setNombreNuevo(e.target.value)}
              placeholder="Nombre de tu grupo (ej: Los emprendedores)"
              className="min-w-[200px] flex-1 rounded border border-input bg-background px-2 py-1.5 text-xs"
            />
            <button
              onClick={crearMiGrupo}
              disabled={accion || !nombreNuevo.trim()}
              className="flex items-center gap-1 rounded-md bg-primary px-2.5 py-1.5 text-[11px] font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {accion ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
              Crear mi grupo
            </button>
          </div>

          {grupos.length > 0 && (
            <div className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">
              Grupos del curso
            </div>
          )}
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

// ============================================================================
// TARJETA DE INTEGRANTE — avatar grande, color único por persona
// ============================================================================
// Paleta de gradientes para los avatares. Cada miembro recibe siempre el mismo
// color según el hash de su estudiante_id, así dos personas distintas se
// distinguen de un vistazo y el color es consistente entre cargas.
const PALETA_AVATAR = [
  "from-rose-400 to-rose-600",
  "from-orange-400 to-orange-600",
  "from-amber-400 to-amber-600",
  "from-emerald-400 to-emerald-600",
  "from-teal-400 to-teal-600",
  "from-sky-400 to-sky-600",
  "from-blue-400 to-blue-600",
  "from-indigo-400 to-indigo-600",
  "from-violet-400 to-violet-600",
  "from-fuchsia-400 to-fuchsia-600",
  "from-pink-400 to-pink-600",
  "from-cyan-400 to-cyan-600",
];

function colorPorId(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return PALETA_AVATAR[Math.abs(h) % PALETA_AVATAR.length];
}

// Iniciales con fallback inteligente: si no hay nombre/apellido, usa la primera
// letra del email; si no, "?".
function iniciales(m: { nombre: string; apellido: string; email: string }): string {
  const a = (m.nombre ?? "").trim();
  const b = (m.apellido ?? "").trim();
  if (a && b) return (a[0] + b[0]).toUpperCase();
  if (a) return a.slice(0, 2).toUpperCase();
  if (b) return b.slice(0, 2).toUpperCase();
  if (m.email) return m.email.slice(0, 2).toUpperCase();
  return "?";
}

function TarjetaIntegrante({
  miembro,
  esYo,
}: {
  miembro: { estudiante_id: string; nombre: string; apellido: string; email: string };
  esYo: boolean;
}) {
  const tieneNombre =
    (miembro.nombre?.trim() ?? "") !== "" || (miembro.apellido?.trim() ?? "") !== "";
  const nombreCompleto = tieneNombre
    ? `${miembro.nombre} ${miembro.apellido}`.trim()
    : miembro.email.split("@")[0]; // muestra la parte antes del @ como nombre
  const gradiente = colorPorId(miembro.estudiante_id);
  return (
    <div
      title={`${nombreCompleto}${miembro.email ? ` · ${miembro.email}` : ""}`}
      className={cn(
        "relative flex flex-col items-center gap-1.5 rounded-lg border bg-card p-2.5 transition hover:shadow-md",
        esYo
          ? "border-primary ring-2 ring-primary/30"
          : "border-border"
      )}
    >
      {esYo && (
        <span className="absolute -top-1.5 right-1.5 rounded-full bg-primary px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-primary-foreground shadow">
          TÚ
        </span>
      )}
      <div
        className={cn(
          "flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br text-sm font-extrabold text-white shadow-md ring-2 ring-white",
          gradiente
        )}
      >
        {iniciales(miembro)}
      </div>
      <div className="w-full text-center">
        <div className="truncate text-xs font-semibold leading-tight" title={nombreCompleto}>
          {nombreCompleto}
        </div>
        {!tieneNombre && (
          <div className="text-[9px] italic text-muted-foreground">sin nombre</div>
        )}
      </div>
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
