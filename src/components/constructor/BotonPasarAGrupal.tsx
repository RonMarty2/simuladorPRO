import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2, Loader2, Plus, UserPlus, Users } from "lucide-react";
import type { Proyecto } from "@/types/proyecto";
import { listarMisInscripciones, type Curso } from "@/lib/cursos-supabase";
import {
  listarGruposParaEstudiante,
  obtenerMiGrupo,
  type Grupo,
  type GrupoConMiembros,
} from "@/lib/grupos-supabase";
import {
  crearGrupoConCaso,
  limpiarNombreCaso,
  pasarCasoAGrupoExistente,
  unirseAGrupoYPasarCaso,
} from "@/lib/caso-grupal";
import { guardarProyectoActivo } from "./SelectorProyecto";
import { useProyectoStore } from "@/stores/proyecto-store";

/**
 * "Pasar a caso grupal":
 * - Si el estudiante ya tiene grupo en el curso, copia todos los datos de este
 *   caso al proyecto compartido del grupo.
 * - Si el estudiante todavía NO tiene grupo en el curso, le permite crear el
 *   grupo ahí mismo con este caso ya cargado (o unirse a un grupo abierto y
 *   llevar este caso), dejándolo listo en "Caso grupal" para que sus
 *   compañeros se unan y entren a editar en equipo.
 * - Funciona también desde proyectos en "Sin curso (proyectos libres)" o de un
 *   curso anterior, llevándolos al curso activo donde el estudiante está inscrito.
 */
export default function BotonPasarAGrupal({
  proyecto,
  cursosInscritos,
  onPasado,
}: {
  proyecto: Proyecto;
  cursosInscritos?: Curso[];
  onPasado?: (proyectoGrupalId: string, cursoId: string) => void;
}) {
  const navigate = useNavigate();
  const cargarEnStore = useProyectoStore((s) => s.cargar);

  const [paso, setPaso] = useState<
    "cerrado" | "buscando" | "confirmar_existente" | "crear_o_unirse" | "copiando" | "listo"
  >("cerrado");
  const [cursosDisponibles, setCursosDisponibles] = useState<Curso[]>([]);
  const [cursoElegido, setCursoElegido] = useState<Curso | null>(null);
  const [miGrupo, setMiGrupo] = useState<Grupo | null>(null);
  const [gruposAbiertos, setGruposAbiertos] = useState<GrupoConMiembros[]>([]);
  const [nombreGrupoNuevo, setNombreGrupoNuevo] = useState("");
  const [proyectoGrupalListo, setProyectoGrupalListo] = useState<Proyecto | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const esIndividual = proyecto.tipo !== "proyecto_grupal" && !proyecto.grupo_id;
  if (!esIndividual || proyecto.esSemanaE) return null;

  const cargarEstadoCurso = async (curso: Curso) => {
    setCursoElegido(curso);
    const [grupoActual, listaGrupos] = await Promise.all([
      obtenerMiGrupo(proyecto.estudiante_id, curso.id),
      listarGruposParaEstudiante(curso.id).catch(() => [] as GrupoConMiembros[]),
    ]);
    setMiGrupo(grupoActual);
    setGruposAbiertos(listaGrupos.filter((g) => g.miembros.length < g.cupo_max));
    if (grupoActual) {
      setPaso("confirmar_existente");
    } else {
      setNombreGrupoNuevo(limpiarNombreCaso(proyecto.nombre));
      setPaso("crear_o_unirse");
    }
  };

  const abrir = async () => {
    setMensaje(null);
    setError(null);
    setPaso("buscando");
    try {
      let listaCursos = cursosInscritos ?? [];
      if (listaCursos.length === 0) {
        const insc = await listarMisInscripciones(proyecto.estudiante_id);
        listaCursos = insc.map((i) => i.curso);
      }
      const cursosConGrupo = listaCursos.filter((c) => !c.es_semana_e);
      if (cursosConGrupo.length === 0) {
        setError("Inscríbete primero a un curso con su código de 6 letras para armar un grupo.");
        setPaso("cerrado");
        return;
      }
      setCursosDisponibles(cursosConGrupo);

      // Preferimos el curso del proyecto si el estudiante sigue inscrito ahí;
      // si no (p. ej. "Sin curso (proyectos libres)"), usamos su curso inscrito con grupos habilitados.
      const cursoPreferido =
        cursosConGrupo.find((c) => c.id === proyecto.curso_id && c.grupo_habilitado) ??
        cursosConGrupo.find((c) => c.grupo_habilitado) ??
        cursosConGrupo.find((c) => c.id === proyecto.curso_id) ??
        cursosConGrupo[0];

      await cargarEstadoCurso(cursoPreferido);
    } catch (e: any) {
      setError(e?.message ?? "No pudimos consultar tu curso o grupo.");
      setPaso("cerrado");
    }
  };

  const cambiarCurso = async (cursoId: string) => {
    const nuevo = cursosDisponibles.find((c) => c.id === cursoId);
    if (!nuevo) return;
    setPaso("buscando");
    setError(null);
    try {
      await cargarEstadoCurso(nuevo);
    } catch (e: any) {
      setError(e?.message ?? "No pudimos consultar ese curso.");
      setPaso("cerrado");
    }
  };

  const finalizarExito = (resultado: Proyecto, texto: string) => {
    setProyectoGrupalListo(resultado);
    cargarEnStore(resultado);
    guardarProyectoActivo(proyecto.estudiante_id, resultado.id);
    setMensaje(texto);
    setPaso("listo");
    if (cursoElegido) {
      onPasado?.(resultado.id, cursoElegido.id);
    }
  };

  const confirmarEnGrupoExistente = async () => {
    if (!miGrupo || !cursoElegido) return;
    setPaso("copiando");
    setError(null);
    try {
      const resultado = await pasarCasoAGrupoExistente({
        origen: proyecto,
        grupo: miGrupo,
        estudianteId: proyecto.estudiante_id,
      });
      finalizarExito(
        resultado,
        `Listo. «${limpiarNombreCaso(proyecto.nombre)}» ya está en el caso grupal de «${miGrupo.nombre}». Todos los integrantes ya pueden entrar a editarlo.`
      );
    } catch (e: any) {
      setError(e?.message ?? "No pudimos copiar el caso al grupo.");
      setPaso("confirmar_existente");
    }
  };

  const crearGrupoYPasar = async () => {
    if (!cursoElegido) return;
    setPaso("copiando");
    setError(null);
    try {
      const nombreFinal = nombreGrupoNuevo.trim() || limpiarNombreCaso(proyecto.nombre);
      const resultado = await crearGrupoConCaso({
        origen: proyecto,
        curso: cursoElegido,
        estudianteId: proyecto.estudiante_id,
        nombreGrupo: nombreFinal,
      });
      finalizarExito(
        resultado,
        `Listo. Se creó el grupo «${nombreFinal}» en ${cursoElegido.nombre} con una copia de este caso. Tus compañeros ya pueden unirse en "Caso grupal" y editar juntos.`
      );
    } catch (e: any) {
      setError(e?.message ?? "No pudimos crear el grupo con este caso.");
      setPaso("crear_o_unirse");
    }
  };

  const unirmeYPasar = async (grupo: GrupoConMiembros) => {
    if (!cursoElegido) return;
    setPaso("copiando");
    setError(null);
    try {
      const resultado = await unirseAGrupoYPasarCaso({
        origen: proyecto,
        grupo,
        estudianteId: proyecto.estudiante_id,
      });
      finalizarExito(
        resultado,
        `Listo. Te uniste a «${grupo.nombre}» y copiaste este caso al grupo. Todos los integrantes ya pueden editarlo.`
      );
    } catch (e: any) {
      setError(e?.message ?? "No pudimos unirte al grupo o copiar el caso.");
      setPaso("crear_o_unirse");
    }
  };

  const irAlProyectoGrupal = () => {
    if (!proyectoGrupalListo) return;
    cargarEnStore(proyectoGrupalListo);
    guardarProyectoActivo(proyecto.estudiante_id, proyectoGrupalListo.id);
    navigate(`/construir?proyecto=${encodeURIComponent(proyectoGrupalListo.id)}`);
  };

  return (
    <div className="flex flex-col gap-1.5">
      {(paso === "cerrado" || paso === "buscando") && (
        <button
          type="button"
          onClick={abrir}
          disabled={paso === "buscando"}
          className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-emerald-600/30 bg-emerald-500/10 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-900 transition hover:bg-emerald-500/20 dark:text-emerald-200 disabled:opacity-60"
        >
          {paso === "buscando" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Users className="h-3.5 w-3.5 text-emerald-600" />
          )}
          Pasar a caso grupal
        </button>
      )}

      {(paso === "confirmar_existente" || paso === "copiando") && miGrupo && cursoElegido && (
        <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-2.5 text-[11px] leading-snug">
          {cursosDisponibles.length > 1 && (
            <div className="mb-2">
              <label className="block text-[10px] font-semibold uppercase text-muted-foreground">
                Curso destino
              </label>
              <select
                value={cursoElegido.id}
                onChange={(e) => cambiarCurso(e.target.value)}
                disabled={paso === "copiando"}
                className="mt-0.5 w-full rounded border border-input bg-background px-2 py-1 text-xs"
              >
                {cursosDisponibles.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre} ({c.codigo})
                  </option>
                ))}
              </select>
            </div>
          )}
          <p>
            Se copiarán todos los datos de <strong>{limpiarNombreCaso(proyecto.nombre)}</strong> al
            caso grupal de tu grupo <strong>{miGrupo.nombre}</strong> ({cursoElegido.nombre}) para
            que todo tu equipo pueda entrar a editarlo. Tu caso individual no cambia.
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={confirmarEnGrupoExistente}
              disabled={paso === "copiando"}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-2.5 py-1.5 font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
            >
              {paso === "copiando" && <Loader2 className="h-3 w-3 animate-spin" />}
              Copiar a mi grupo «{miGrupo.nombre}»
            </button>
            <button
              type="button"
              onClick={() => setPaso("cerrado")}
              disabled={paso === "copiando"}
              className="rounded-md border border-border bg-card px-2.5 py-1.5 hover:bg-secondary disabled:opacity-60"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {(paso === "crear_o_unirse" || (paso === "copiando" && !miGrupo)) && cursoElegido && (
        <div className="space-y-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-2.5 text-[11px] leading-snug">
          {cursosDisponibles.length > 1 && (
            <div>
              <label className="block text-[10px] font-semibold uppercase text-muted-foreground">
                Curso destino
              </label>
              <select
                value={cursoElegido.id}
                onChange={(e) => cambiarCurso(e.target.value)}
                disabled={paso === "copiando"}
                className="mt-0.5 w-full rounded border border-input bg-background px-2 py-1 text-xs"
              >
                {cursosDisponibles.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre} ({c.codigo})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <p className="font-semibold text-foreground">
              Pasar «{limpiarNombreCaso(proyecto.nombre)}» a Caso grupal en {cursoElegido.nombre}
            </p>
            <p className="mt-0.5 text-muted-foreground">
              Crea tu grupo ahora con este proyecto ya cargado para que tus compañeros se unan y
              entren a editar en equipo:
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              <input
                type="text"
                value={nombreGrupoNuevo}
                onChange={(e) => setNombreGrupoNuevo(e.target.value)}
                placeholder="Nombre del grupo (ej: Los emprendedores)"
                disabled={paso === "copiando"}
                className="min-w-[160px] flex-1 rounded border border-input bg-background px-2 py-1 text-xs"
              />
              <button
                type="button"
                onClick={crearGrupoYPasar}
                disabled={paso === "copiando"}
                className="inline-flex items-center gap-1 rounded-md bg-primary px-2.5 py-1.5 font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
              >
                {paso === "copiando" ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Plus className="h-3 w-3" />
                )}
                Crear grupo con este caso
              </button>
            </div>
          </div>

          {gruposAbiertos.length > 0 && (
            <div className="border-t border-border/60 pt-2">
              <div className="mb-1 font-semibold text-muted-foreground">
                O únete a un grupo existente y lleva este caso:
              </div>
              <div className="space-y-1">
                {gruposAbiertos.map((g) => (
                  <div
                    key={g.id}
                    className="flex items-center justify-between gap-2 rounded border border-border bg-card px-2 py-1"
                  >
                    <span className="truncate font-medium">
                      {g.nombre}{" "}
                      <span className="text-muted-foreground">
                        ({g.miembros.length}/{g.cupo_max})
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => unirmeYPasar(g)}
                      disabled={paso === "copiando"}
                      className="inline-flex items-center gap-1 rounded bg-emerald-600 px-2 py-1 text-[10px] font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                    >
                      <UserPlus className="h-3 w-3" />
                      Unirme y copiar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setPaso("cerrado")}
              disabled={paso === "copiando"}
              className="rounded border border-border bg-card px-2 py-1 text-[10px] hover:bg-secondary"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {paso === "listo" && proyectoGrupalListo && (
        <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-2.5 text-[11px] leading-snug">
          <div className="flex items-start gap-1.5 font-medium text-emerald-900 dark:text-emerald-200">
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
            <span>{mensaje}</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={irAlProyectoGrupal}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-2.5 py-1.5 font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Abrir y editar en grupo
              <ArrowRight className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={() => setPaso("cerrado")}
              className="rounded-md border border-border bg-card px-2 py-1 text-[10px] hover:bg-secondary"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="rounded border border-destructive/40 bg-destructive/10 px-2 py-1 text-[11px] text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
