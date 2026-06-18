import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Check,
  Copy,
  FolderOpen,
  LogIn,
  LogOut,
  Loader2,
  Plus,
  Search,
  UserPlus,
  Users,
} from "lucide-react";
import {
  guardarProyectoActivo,
  guardarProyectoSemanaEActivo,
} from "@/components/constructor/SelectorProyecto";
import { obtenerPromedioEstudiante } from "@/lib/proyecto-supabase";
import { calcularNotaFinal } from "@/lib/notas";
import type { Curso } from "@/lib/cursos-supabase";
import {
  listarGruposParaEstudiante,
  obtenerMiGrupo,
  unirseAGrupo,
  salirDeGrupo,
  crearGrupoEstudiante,
  configurarNivelProyectoSemanaE,
  type GrupoConMiembros,
  type Grupo,
} from "@/lib/grupos-supabase";
import type { ModeloIngreso } from "@/lib/proyecto-factory";
import type { VersionProyecto } from "@/types/proyecto";
import {
  NIVELES_SEMANA_E,
  codigoCortoGrupo,
  datosNivelSemanaE,
  versionParaNivelSemanaE,
  type NivelSemanaE,
} from "@/lib/semana-e";
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
  const [nivelNuevo, setNivelNuevo] = useState<NivelSemanaE>("basico");
  const [modoSemanaE, setModoSemanaE] = useState<"crear" | "unirse" | null>(null);
  const [busquedaGrupo, setBusquedaGrupo] = useState("");
  const [codigoCopiado, setCodigoCopiado] = useState(false);
  const miGrupoDetalle =
    miGrupo && grupos ? grupos.find((g) => g.id === miGrupo.id) ?? null : null;

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
        esSemanaE: curso.es_semana_e === true,
        nivelSemanaE: curso.es_semana_e ? nivelNuevo : undefined,
        version: curso.es_semana_e
          ? versionParaNivelSemanaE(nivelNuevo)
          : (curso.grupo_version as VersionProyecto) ?? "v2",
        modeloIngreso: (curso.grupo_modelo as ModeloIngreso) ?? "unidades",
      });
      setNombreNuevo("");
      setBusquedaGrupo("");
      setCodigoCopiado(false);
      setModoSemanaE(null);
      await recargar();
    } catch (e: any) {
      const mensaje = e?.message ?? String(e);
      setError(
        mensaje.toLowerCase().includes("row-level security")
          ? "No pudimos crear el grupo. Recargá la página e intentá otra vez; si continúa, avisale al docente."
          : mensaje
      );
    } finally {
      setAccion(false);
    }
  };

  const guardarNivelExistente = async (nivel: NivelSemanaE) => {
    if (!miGrupoDetalle?.proyecto_id) return;
    setAccion(true);
    setError(null);
    try {
      await configurarNivelProyectoSemanaE(
        miGrupoDetalle.proyecto_id,
        nivel,
        versionParaNivelSemanaE(nivel)
      );
      await recargar();
    } catch (e: any) {
      setError(e?.message ?? "No se pudo guardar el nivel del proyecto.");
    } finally {
      setAccion(false);
    }
  };

  const abrirProyecto = (proyectoId: string | null) => {
    if (!proyectoId) return;
    if (curso.es_semana_e) {
      guardarProyectoSemanaEActivo(estudianteId, proyectoId);
      navigate(`/construir?semanae=1&proyecto=${encodeURIComponent(proyectoId)}`);
      return;
    }
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

  const terminoBusqueda = busquedaGrupo.trim().toLocaleLowerCase("es");
  const gruposFiltrados = grupos.filter((grupo) => {
    if (!terminoBusqueda) return true;
    return (
      grupo.nombre.toLocaleLowerCase("es").includes(terminoBusqueda) ||
      codigoCortoGrupo(grupo.id).toLocaleLowerCase("es").includes(terminoBusqueda)
    );
  });
  const nivelActual = datosNivelSemanaE(miGrupoDetalle?.nivel_semana_e);

  const copiarCodigo = async (grupoId: string) => {
    await navigator.clipboard.writeText(codigoCortoGrupo(grupoId));
    setCodigoCopiado(true);
    setTimeout(() => setCodigoCopiado(false), 1800);
  };

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
          {curso.es_semana_e && (
            <div className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100">
              <strong>Tu equipo está guardado aquí.</strong> Si cierras la página o vuelves después,
              entra por <strong>Mi panel</strong> y baja a <strong>Forma tu equipo de Semana E</strong>.
              Desde este bloque puedes copiar el código y continuar el proyecto.
            </div>
          )}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Users className="h-3.5 w-3.5 text-primary" />
              <span className="text-sm font-semibold">{miGrupoDetalle.nombre}</span>
              <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] text-muted-foreground">
                {miGrupoDetalle.miembros.length} / {miGrupoDetalle.cupo_max}
              </span>
              <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                {curso.es_semana_e ? "Tu equipo" : "Tu grupo"}
              </span>
              {curso.es_semana_e && nivelActual && (
                <span className="rounded bg-fuchsia-100 px-1.5 py-0.5 text-[10px] font-semibold text-fuchsia-800 dark:bg-fuchsia-950/50 dark:text-fuchsia-200">
                  {nivelActual.emoji} Nivel {nivelActual.nombre}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => abrirProyecto(miGrupoDetalle.proyecto_id)}
                disabled={curso.es_semana_e && !nivelActual}
                className={
                  curso.es_semana_e
                    ? "group flex min-h-16 w-full animate-pulse items-center justify-center gap-3 rounded-xl border-2 border-fuchsia-200 bg-gradient-to-r from-fuchsia-700 via-purple-700 to-fuchsia-700 px-6 py-3 text-left text-white shadow-xl shadow-fuchsia-500/30 ring-4 ring-fuchsia-300/50 transition hover:animate-none hover:scale-[1.02] hover:shadow-2xl disabled:animate-none disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                    : "flex items-center gap-1 rounded-md bg-primary px-2.5 py-1 text-[11px] font-medium text-primary-foreground hover:bg-primary/90"
                }
              >
                <FolderOpen className={curso.es_semana_e ? "h-7 w-7 shrink-0" : "h-3 w-3"} />
                {curso.es_semana_e ? (
                  <span className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-[0.18em] text-fuchsia-100">
                      Aquí está tu proyecto
                    </span>
                    <span className="text-base font-black leading-tight sm:text-lg">
                      Ver y continuar mi proyecto de Semana E →
                    </span>
                  </span>
                ) : (
                  "Abrir proyecto"
                )}
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
          {curso.es_semana_e && (
            <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-fuchsia-200 bg-fuchsia-50/70 p-2.5 text-xs dark:border-fuchsia-900 dark:bg-fuchsia-950/30">
              <div className="mr-auto">
                <div className="font-semibold">Código para invitar a tu equipo</div>
                <div className="text-[10px] text-muted-foreground">
                  Compártelo por WhatsApp; tus compañeros pueden buscarlo por este código.
                </div>
              </div>
              <code className="rounded-md bg-card px-3 py-1.5 text-base font-black tracking-[0.2em]">
                {codigoCortoGrupo(miGrupoDetalle.id)}
              </code>
              <button
                type="button"
                onClick={() => copiarCodigo(miGrupoDetalle.id)}
                className="flex items-center gap-1 rounded-md border bg-card px-2.5 py-1.5 font-medium"
              >
                {codigoCopiado ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {codigoCopiado ? "Copiado" : "Copiar"}
              </button>
            </div>
          )}
          {curso.es_semana_e && !nivelActual && (
            <div className="mt-3 rounded-lg border-2 border-amber-300 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/30">
              <div className="mb-2 text-sm font-bold">Elijan el nivel antes de empezar</div>
              <p className="mb-3 text-[11px] text-muted-foreground">
                Esta elección define cuántas etapas completará todo el equipo.
              </p>
              <SelectorNivelSemanaE valor={null} onChange={guardarNivelExistente} disabled={accion} />
            </div>
          )}
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

          {!curso.es_semana_e && (
            <>
              {/* Notas de cursos normales; Semana E no califica. */}
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
            </>
          )}
        </div>
      ) : curso.es_semana_e ? (
        <div className="space-y-4">
          <div className="rounded-lg border border-violet-200 bg-white/70 px-3 py-2 text-xs text-violet-950 dark:border-violet-900 dark:bg-violet-950/20 dark:text-violet-100">
            En Semana E el equipo vive siempre en este bloque. Si lo creas, al volver a
            <strong> Mi panel</strong> verás aquí el nombre, el código y el botón para continuar.
          </div>

          {curso.grupo_consigna && (
            <div className="rounded-md border border-sky-300 bg-sky-50/60 p-2 text-[11px] dark:border-sky-800 dark:bg-sky-950/20">
              <strong>Reto del evento:</strong> {curso.grupo_consigna}
            </div>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setModoSemanaE("crear")}
              className={cn(
                "flex min-h-28 items-center gap-4 rounded-xl border-2 p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md",
                modoSemanaE === "crear"
                  ? "border-fuchsia-500 bg-fuchsia-50 ring-2 ring-fuchsia-200 dark:bg-fuchsia-950/30"
                  : "border-fuchsia-200 bg-card hover:border-fuchsia-400 dark:border-fuchsia-900"
              )}
            >
              <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-fuchsia-600 text-white">
                <Plus className="h-6 w-6" />
              </span>
              <span>
                <span className="block text-base font-bold">Crear un equipo</span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  Ponle nombre, elige el nivel e invita a tus compañeros.
                </span>
              </span>
            </button>
            <button
              type="button"
              onClick={() => setModoSemanaE("unirse")}
              className={cn(
                "flex min-h-28 items-center gap-4 rounded-xl border-2 p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md",
                modoSemanaE === "unirse"
                  ? "border-sky-500 bg-sky-50 ring-2 ring-sky-200 dark:bg-sky-950/30"
                  : "border-sky-200 bg-card hover:border-sky-400 dark:border-sky-900"
              )}
            >
              <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-sky-600 text-white">
                <UserPlus className="h-6 w-6" />
              </span>
              <span>
                <span className="block text-base font-bold">Unirme a mi equipo</span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  Busca por el nombre o por el código que te compartieron.
                </span>
              </span>
            </button>
          </div>

          {modoSemanaE === "crear" && (
            <div className="space-y-4 rounded-xl border-2 border-fuchsia-200 bg-fuchsia-50/40 p-4 dark:border-fuchsia-900 dark:bg-fuchsia-950/20">
              <div>
                <h3 className="text-sm font-bold">1. Nombre del equipo</h3>
                <input
                  type="text"
                  value={nombreNuevo}
                  onChange={(e) => setNombreNuevo(e.target.value)}
                  placeholder="Ej: Equipo Cóndor, Los Innovadores…"
                  maxLength={60}
                  autoFocus
                  className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm"
                />
              </div>
              <div>
                <h3 className="text-sm font-bold">2. Nivel del proyecto</h3>
                <p className="mb-2 text-[11px] text-muted-foreground">
                  Elijan según su experiencia y el tiempo disponible. Todos trabajarán el mismo nivel.
                </p>
                <SelectorNivelSemanaE valor={nivelNuevo} onChange={setNivelNuevo} disabled={accion} />
              </div>
              <button
                onClick={crearMiGrupo}
                disabled={accion || nombreNuevo.trim().length < 2}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-fuchsia-600 px-4 py-3 text-sm font-bold text-white hover:bg-fuchsia-700 disabled:opacity-50"
              >
                {accion ? <Loader2 className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
                Crear equipo y obtener código
              </button>
            </div>
          )}

          {modoSemanaE === "unirse" && (
            <div className="space-y-3 rounded-xl border-2 border-sky-200 bg-sky-50/40 p-4 dark:border-sky-900 dark:bg-sky-950/20">
              <label className="relative block">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  value={busquedaGrupo}
                  onChange={(e) => setBusquedaGrupo(e.target.value)}
                  placeholder="Escribe el nombre o código del equipo"
                  autoFocus
                  className="w-full rounded-lg border border-input bg-background py-3 pl-10 pr-3 text-sm"
                />
              </label>
              <div className="text-[11px] text-muted-foreground">
                {gruposFiltrados.length} equipo{gruposFiltrados.length === 1 ? "" : "s"} encontrado{gruposFiltrados.length === 1 ? "" : "s"}
              </div>
              <div className="grid max-h-80 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                {gruposFiltrados.map((grupo) => {
                  const lleno = grupo.miembros.length >= grupo.cupo_max;
                  const nivel = datosNivelSemanaE(grupo.nivel_semana_e);
                  return (
                    <div key={grupo.id} className="rounded-lg border bg-card p-3 shadow-sm">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-bold">{grupo.nombre}</div>
                          <code className="text-[10px] font-bold tracking-widest text-sky-700 dark:text-sky-300">
                            {codigoCortoGrupo(grupo.id)}
                          </code>
                        </div>
                        <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px]">
                          {grupo.miembros.length}/{grupo.cupo_max}
                        </span>
                      </div>
                      {nivel && (
                        <div className="mt-2 text-[10px] text-muted-foreground">
                          {nivel.emoji} Nivel {nivel.nombre} · {nivel.pasos} etapas
                        </div>
                      )}
                      <button
                        onClick={() => unirme(grupo.id)}
                        disabled={accion || lleno}
                        className="mt-3 flex w-full items-center justify-center gap-1 rounded-md bg-sky-600 px-2.5 py-2 text-xs font-semibold text-white hover:bg-sky-700 disabled:opacity-50"
                      >
                        {accion ? <Loader2 className="h-3 w-3 animate-spin" /> : <LogIn className="h-3 w-3" />}
                        {lleno ? "Equipo completo" : "Unirme a este equipo"}
                      </button>
                    </div>
                  );
                })}
              </div>
              {gruposFiltrados.length === 0 && (
                <div className="rounded-lg border border-dashed bg-card p-5 text-center text-xs text-muted-foreground">
                  No encontramos ese equipo. Revisa el código o pídele al creador que te lo comparta otra vez.
                </div>
              )}
            </div>
          )}
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

function SelectorNivelSemanaE({
  valor,
  onChange,
  disabled,
}: {
  valor: NivelSemanaE | null;
  onChange: (nivel: NivelSemanaE) => void;
  disabled: boolean;
}) {
  return (
    <div className="grid gap-2 md:grid-cols-3">
      {NIVELES_SEMANA_E.map((nivel) => (
        <button
          key={nivel.id}
          type="button"
          onClick={() => onChange(nivel.id)}
          disabled={disabled}
          className={cn(
            "rounded-lg border-2 p-3 text-left transition hover:border-fuchsia-400 disabled:opacity-50",
            valor === nivel.id
              ? "border-fuchsia-500 bg-fuchsia-100 ring-2 ring-fuchsia-200 dark:bg-fuchsia-950/50"
              : "border-border bg-card"
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-bold">{nivel.emoji} {nivel.nombre}</span>
            <span className="rounded bg-secondary px-1.5 py-0.5 text-[9px] font-semibold">
              {nivel.pasos} etapas
            </span>
          </div>
          <div className="mt-1 text-[10px] font-medium text-fuchsia-700 dark:text-fuchsia-300">
            {nivel.tiempo}
          </div>
          <p className="mt-1 text-[10px] leading-snug text-muted-foreground">
            {nivel.descripcion}
          </p>
        </button>
      ))}
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
