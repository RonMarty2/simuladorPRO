import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, Users, FolderOpen, Loader2, Save } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { guardarProyectoActivo } from "@/components/constructor/SelectorProyecto";
import { actualizarPesosCurso, actualizarConfigGrupal, type Curso } from "@/lib/cursos-supabase";
import {
  listarGruposDeCurso,
  eliminarGrupo,
  calificarGrupo,
  type GrupoConMiembros,
} from "@/lib/grupos-supabase";
import type { ModeloIngreso } from "@/lib/proyecto-factory";
import type { VersionProyecto } from "@/types/proyecto";

export default function GruposDocente({ curso }: { curso: Curso }) {
  const user = useAuthStore((s) => s.user)!;
  const navigate = useNavigate();
  const [grupos, setGrupos] = useState<GrupoConMiembros[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Config del proyecto grupal (la define el docente; los estudiantes crean los grupos)
  const [habilitado, setHabilitado] = useState(curso.grupo_habilitado ?? false);
  const [cupo, setCupo] = useState(curso.grupo_cupo_max ?? 4);
  const [modelo, setModelo] = useState<ModeloIngreso>((curso.grupo_modelo as ModeloIngreso) ?? "unidades");
  const [version, setVersion] = useState<VersionProyecto>((curso.grupo_version as VersionProyecto) ?? "v2");
  const [consigna, setConsigna] = useState(curso.grupo_consigna ?? "");
  const [guardandoCfg, setGuardandoCfg] = useState(false);
  const [cfgOk, setCfgOk] = useState(false);

  // Pesos
  const [pInd, setPInd] = useState(Math.round((curso.peso_individual ?? 0.5) * 100));
  const [pGrp, setPGrp] = useState(Math.round((curso.peso_grupal ?? 0.5) * 100));
  const [guardandoPesos, setGuardandoPesos] = useState(false);
  const [pesosOk, setPesosOk] = useState(false);

  const recargar = () =>
    listarGruposDeCurso(curso.id).then(setGrupos).catch((e) => setError(e?.message ?? String(e)));

  useEffect(() => {
    recargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [curso.id]);

  const guardarConfig = async () => {
    setGuardandoCfg(true);
    setCfgOk(false);
    setError(null);
    try {
      await actualizarConfigGrupal(curso.id, {
        grupo_habilitado: habilitado,
        grupo_cupo_max: Math.max(1, cupo),
        grupo_modelo: modelo,
        grupo_version: version,
        grupo_consigna: consigna.trim() || null,
      });
      setCfgOk(true);
      setTimeout(() => setCfgOk(false), 1500);
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setGuardandoCfg(false);
    }
  };

  const abrirProyecto = (proyectoId: string | null) => {
    if (!proyectoId) return;
    guardarProyectoActivo(user.id, proyectoId);
    navigate("/construir");
  };

  const guardarPesos = async () => {
    setGuardandoPesos(true);
    setPesosOk(false);
    try {
      await actualizarPesosCurso(curso.id, pInd / 100, pGrp / 100);
      setPesosOk(true);
      setTimeout(() => setPesosOk(false), 1500);
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setGuardandoPesos(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Ponderación de la nota final */}
      <div className="rounded-md border border-border bg-secondary/20 p-3">
        <div className="text-xs font-semibold uppercase tracking-wide">
          Ponderación de la nota final
        </div>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          Cómo se combina la nota individual (promedio de entregas) con la nota del proyecto
          grupal para la nota final de cada estudiante.
        </p>
        <div className="mt-2 flex flex-wrap items-end gap-3">
          <label className="text-[11px]">
            Individual
            <div className="flex items-center gap-1">
              <input
                type="number"
                min={0}
                max={100}
                value={pInd}
                onChange={(e) => setPInd(Number(e.target.value) || 0)}
                className="mt-0.5 w-20 rounded border border-input bg-background px-2 py-1 text-right text-xs"
              />
              <span className="text-muted-foreground">%</span>
            </div>
          </label>
          <label className="text-[11px]">
            Grupal
            <div className="flex items-center gap-1">
              <input
                type="number"
                min={0}
                max={100}
                value={pGrp}
                onChange={(e) => setPGrp(Number(e.target.value) || 0)}
                className="mt-0.5 w-20 rounded border border-input bg-background px-2 py-1 text-right text-xs"
              />
              <span className="text-muted-foreground">%</span>
            </div>
          </label>
          <button
            onClick={guardarPesos}
            disabled={guardandoPesos}
            className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {guardandoPesos ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
            Guardar
          </button>
          {pesosOk && <span className="text-[11px] text-emerald-600">Guardado ✓</span>}
          {pInd + pGrp !== 100 && (
            <span className="text-[10px] text-amber-600">
              (No suman 100%: se renormaliza al calcular)
            </span>
          )}
        </div>
      </div>

      {/* Configurar la actividad grupal del curso */}
      <div className="rounded-md border border-border bg-card p-3">
        <label className="flex cursor-pointer items-start gap-2">
          <input
            type="checkbox"
            checked={habilitado}
            onChange={(e) => setHabilitado(e.target.checked)}
            className="mt-0.5"
          />
          <span className="text-xs">
            <strong>Habilitar el proyecto grupal en este curso</strong>
            <span className="mt-0.5 block text-[11px] text-muted-foreground">
              Si está habilitado, los estudiantes <strong>crean sus propios grupos</strong> con
              el formato y cupo que definas acá. Vos no creás los grupos: los arman ellos.
            </span>
          </span>
        </label>

        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-[11px]">
            Cupo máx. por grupo
            <input
              type="number"
              min={1}
              max={50}
              value={cupo}
              onChange={(e) => setCupo(Number(e.target.value) || 1)}
              disabled={!habilitado}
              className="mt-0.5 w-full rounded border border-input bg-background px-2 py-1.5 text-right text-xs disabled:opacity-60"
            />
          </label>
          <label className="text-[11px]">
            Modelo de ingreso
            <select
              value={modelo}
              onChange={(e) => setModelo(e.target.value as ModeloIngreso)}
              disabled={!habilitado}
              className="mt-0.5 w-full rounded border border-input bg-background px-2 py-1.5 text-xs disabled:opacity-60"
            >
              <option value="unidades">Unidades × precio</option>
              <option value="suscripcion">Suscripción</option>
              <option value="publicidad">Publicidad / CPM</option>
              <option value="costo_beneficio">Costo-beneficio</option>
            </select>
          </label>
          <label className="text-[11px]">
            Versión
            <select
              value={version}
              onChange={(e) => setVersion(e.target.value as VersionProyecto)}
              disabled={!habilitado}
              className="mt-0.5 w-full rounded border border-input bg-background px-2 py-1.5 text-xs disabled:opacity-60"
            >
              <option value="v2">Extendido (V2)</option>
              <option value="v1">Clásico (V1)</option>
            </select>
          </label>
          <label className="text-[11px] sm:col-span-2 lg:col-span-1">
            Consigna / tema (opcional)
            <input
              type="text"
              value={consigna}
              onChange={(e) => setConsigna(e.target.value)}
              disabled={!habilitado}
              placeholder="Ej: cafetería de barrio…"
              className="mt-0.5 w-full rounded border border-input bg-background px-2 py-1.5 text-xs disabled:opacity-60"
            />
          </label>
        </div>

        <button
          onClick={guardarConfig}
          disabled={guardandoCfg}
          className="mt-2 flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {guardandoCfg ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
          Guardar configuración
        </button>
        {cfgOk && <span className="ml-2 text-[11px] text-emerald-600">Guardado ✓</span>}
      </div>

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {error}
        </div>
      )}

      {/* Lista de grupos */}
      {grupos === null ? (
        <div className="text-xs text-muted-foreground">Cargando grupos…</div>
      ) : grupos.length === 0 ? (
        <div className="rounded-md border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
          {habilitado
            ? "Los estudiantes aún no crearon grupos. Cuando lo hagan, los verás acá."
            : "El proyecto grupal está deshabilitado. Activalo arriba para que los estudiantes puedan armar grupos."}
        </div>
      ) : (
        <div className="space-y-2">
          {grupos.map((g) => (
            <GrupoFila key={g.id} grupo={g} onAbrir={abrirProyecto} onCambio={recargar} />
          ))}
        </div>
      )}
    </div>
  );
}

function GrupoFila({
  grupo,
  onAbrir,
  onCambio,
}: {
  grupo: GrupoConMiembros;
  onAbrir: (proyectoId: string | null) => void;
  onCambio: () => void;
}) {
  const [nota, setNota] = useState<number | "">(grupo.nota ?? "");
  const [comentario, setComentario] = useState(grupo.comentario_docente ?? "");
  const [guardando, setGuardando] = useState(false);
  const [ok, setOk] = useState(false);
  const [borrando, setBorrando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);

  const guardar = async () => {
    if (nota === "") return;
    setGuardando(true);
    try {
      await calificarGrupo(grupo.id, Number(nota), comentario);
      setOk(true);
      setTimeout(() => setOk(false), 1500);
      onCambio();
    } finally {
      setGuardando(false);
    }
  };

  const borrar = async () => {
    setBorrando(true);
    try {
      await eliminarGrupo(grupo.id);
      onCambio();
    } finally {
      setBorrando(false);
    }
  };

  return (
    <div className="rounded-md border border-border bg-card p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Users className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-sm font-semibold">{grupo.nombre}</span>
          <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">
            {grupo.miembros.length} / {grupo.cupo_max} cupos
          </span>
          {grupo.nota != null && (
            <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">
              Nota: {grupo.nota}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onAbrir(grupo.proyecto_id)}
            className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] hover:bg-secondary"
          >
            <FolderOpen className="h-3 w-3" />
            Abrir / evaluar proyecto
          </button>
          {!confirmando ? (
            <button
              onClick={() => setConfirmando(true)}
              className="rounded p-1 text-muted-foreground hover:text-destructive"
              title="Borrar grupo"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          ) : (
            <span className="flex items-center gap-1 text-[10px]">
              <button onClick={borrar} disabled={borrando} className="rounded bg-destructive px-1.5 py-0.5 font-semibold text-destructive-foreground">
                {borrando ? "…" : "Borrar"}
              </button>
              <button onClick={() => setConfirmando(false)} className="rounded border border-border px-1.5 py-0.5">
                No
              </button>
            </span>
          )}
        </div>
      </div>

      <div className="mt-1.5 text-[11px] text-muted-foreground">
        Integrantes:{" "}
        {grupo.miembros.length === 0
          ? "—"
          : grupo.miembros.map((m) => `${m.nombre} ${m.apellido}`.trim()).join(", ")}
      </div>

      <div className="mt-2 flex flex-wrap items-end gap-2 border-t border-border/50 pt-2">
        <label className="text-[11px]">
          Nota grupal (0–100)
          <input
            type="number"
            min={0}
            max={100}
            value={nota}
            onChange={(e) => setNota(e.target.value === "" ? "" : Number(e.target.value))}
            className="mt-0.5 w-24 rounded border border-input bg-background px-2 py-1 text-right text-xs"
          />
        </label>
        <label className="min-w-[180px] flex-1 text-[11px]">
          Comentario
          <input
            type="text"
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            placeholder="Observaciones para el grupo…"
            className="mt-0.5 w-full rounded border border-input bg-background px-2 py-1 text-xs"
          />
        </label>
        <button
          onClick={guardar}
          disabled={guardando || nota === ""}
          className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {guardando ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
          Guardar nota
        </button>
        {ok && <span className="text-[11px] text-emerald-600">Guardado ✓</span>}
      </div>
    </div>
  );
}
