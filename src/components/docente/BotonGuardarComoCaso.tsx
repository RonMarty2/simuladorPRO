import { useEffect, useRef, useState } from "react";
import { BookmarkPlus, CheckCircle2, Loader2, X } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { listarMisCursos, type Curso } from "@/lib/cursos-supabase";
import {
  cargarProyectoEstudianteParaRevision,
  clonarComoCasoDelCurso,
  guardarComoCasoDelCurso,
  guardarProyecto,
  limpiarNombreParaCasoDelCurso,
} from "@/lib/proyecto-supabase";
import { useProyectoStore } from "@/stores/proyecto-store";
import type { Proyecto } from "@/types/proyecto";

const PASOS = [
  { n: 1, label: "Datos generales", desc: "El estudiante define ubicación, descripción, sector" },
  { n: 2, label: "Demanda y precios", desc: "El estudiante proyecta cantidades y precios" },
  { n: 3, label: "Inversiones fijas", desc: "El estudiante decide qué activos comprar" },
  { n: 4, label: "Personal", desc: "El estudiante define puestos y sueldos" },
  { n: 5, label: "Costos directos", desc: "El estudiante calcula insumos por producto" },
  { n: 6, label: "Gastos operativos", desc: "El estudiante define admin y comercialización" },
  { n: 7, label: "Financiamiento", desc: "El estudiante decide la mezcla deuda/capital" },
  { n: 8, label: "Capital de trabajo", desc: "El estudiante elige meses de buffer" },
  { n: 9, label: "Resumen (solo simula)", desc: "El estudiante solo ejecuta la simulación" },
];

/**
 * Determina si al convertir `proyecto` en caso del curso se debe clonar como
 * un caso nuevo e independiente (sin tocar el proyecto origen).
 */
export function debeClonarComoCasoNuevo(
  proyecto: Proyecto,
  docenteId: string,
  cursoDestinoId: string
): boolean {
  if (proyecto.estudiante_id !== docenteId) return true;
  if (proyecto.tipo === "proyecto_grupal" || Boolean(proyecto.grupo_id)) return true;
  if (proyecto.tipo === "entrega_estudiante" || Boolean(proyecto.caso_origen_id)) return true;
  if (
    proyecto.tipo === "caso_curso" &&
    Boolean(proyecto.curso_id) &&
    Boolean(cursoDestinoId) &&
    proyecto.curso_id !== cursoDestinoId
  ) {
    return true;
  }
  return false;
}

export interface BotonGuardarComoCasoProps {
  proyecto?: Proyecto | null;
  proyectoId?: string | null;
  fallbackSnapshot?: Proyecto;
  cursoIdInicial?: string | null;
  variante?: "normal" | "compacto";
  etiqueta?: string;
  onGuardado?: () => void;
}

export default function BotonGuardarComoCaso({
  proyecto,
  proyectoId,
  fallbackSnapshot,
  cursoIdInicial,
  variante = "normal",
  etiqueta = "Guardar como caso del curso",
  onGuardado,
}: BotonGuardarComoCasoProps = {}) {
  const perfil = useAuthStore((s) => s.perfil);
  const proyectoStore = useProyectoStore((s) => s.proyecto);
  const proyectoInicial = proyecto !== undefined ? proyecto : proyectoId ? null : proyectoStore;
  const idObjetivo = proyectoInicial?.id ?? proyectoId ?? null;

  const [abierto, setAbierto] = useState(false);
  const [toast, setToast] = useState<{
    pasoInicio: number;
    cursoNombre: string;
    nombreCaso: string;
    esCopia: boolean;
  } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 6000);
    return () => clearTimeout(t);
  }, [toast]);

  if (perfil?.rol !== "docente" || !idObjetivo) return null;

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setAbierto(true);
        }}
        className={
          variante === "compacto"
            ? "inline-flex items-center gap-1 rounded-md border border-amber-400 bg-amber-50 px-2 py-1 text-[11px] font-medium text-amber-900 transition hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100"
            : "flex items-center gap-1.5 rounded-md border border-amber-400 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-900 hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100"
        }
        title="Convertir este proyecto en un caso plantilla para tus estudiantes"
      >
        <BookmarkPlus className={variante === "compacto" ? "h-3 w-3" : "h-3.5 w-3.5"} />
        {etiqueta}
      </button>

      {abierto && (
        <ModalGuardar
          proyectoInicial={proyectoInicial}
          proyectoId={idObjetivo}
          fallbackSnapshot={fallbackSnapshot}
          cursoIdInicial={cursoIdInicial}
          onCerrar={(exitoso) => {
            setAbierto(false);
            if (exitoso) {
              onGuardado?.();
              setToast(exitoso);
            }
          }}
        />
      )}

      {toast && <ToastExito {...toast} onCerrar={() => setToast(null)} />}
    </>
  );
}

function ToastExito({
  pasoInicio,
  cursoNombre,
  nombreCaso,
  esCopia,
  onCerrar,
}: {
  pasoInicio: number;
  cursoNombre: string;
  nombreCaso: string;
  esCopia: boolean;
  onCerrar: () => void;
}) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-6 z-50 flex justify-center px-4">
      <div className="pointer-events-auto flex max-w-md items-start gap-3 rounded-lg border border-emerald-400 bg-emerald-50 px-4 py-3 shadow-lg dark:border-emerald-700 dark:bg-emerald-950">
        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
          <CheckCircle2 className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1 text-xs">
          <div className="font-semibold text-emerald-900 dark:text-emerald-100">
            Caso "{nombreCaso}" guardado en "{cursoNombre}"
          </div>
          <div className="mt-0.5 text-emerald-900/80 dark:text-emerald-100/80">
            {esCopia && "Se creó como caso nuevo sin tocar el proyecto original. "}
            Tus estudiantes inscritos podrán tomarlo. Empiezan desde el{" "}
            <strong>paso {pasoInicio}</strong>.
          </div>
        </div>
        <button
          type="button"
          onClick={onCerrar}
          className="flex-shrink-0 rounded p-0.5 text-emerald-900/70 hover:bg-emerald-200 dark:text-emerald-100/70 dark:hover:bg-emerald-900"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function ModalGuardar({
  proyectoInicial,
  proyectoId,
  fallbackSnapshot,
  cursoIdInicial,
  onCerrar,
}: {
  proyectoInicial: Proyecto | null;
  proyectoId: string;
  fallbackSnapshot?: Proyecto;
  cursoIdInicial?: string | null;
  onCerrar: (
    exitoso: {
      pasoInicio: number;
      cursoNombre: string;
      nombreCaso: string;
      esCopia: boolean;
    } | null
  ) => void;
}) {
  const perfil = useAuthStore((s) => s.perfil)!;
  const [proyectoCargado, setProyectoCargado] = useState<Proyecto | null>(proyectoInicial);
  const [cargandoProyecto, setCargandoProyecto] = useState(!proyectoInicial);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [cargandoCursos, setCargandoCursos] = useState(true);
  const [cursoId, setCursoId] = useState<string>("");
  const [nombre, setNombre] = useState<string>(() =>
    proyectoInicial ? limpiarNombreParaCasoDelCurso(proyectoInicial.nombre) : ""
  );
  const [pasoInicio, setPasoInicio] = useState<number>(() => {
    if (!proyectoInicial) return 9;
    const clonar = debeClonarComoCasoNuevo(
      proyectoInicial,
      perfil.id,
      cursoIdInicial ?? proyectoInicial.curso_id ?? ""
    );
    return clonar ? 9 : (proyectoInicial.paso_inicio_estudiante ?? 2);
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const usuarioTocoPaso = useRef(false);
  const usuarioEditoNombre = useRef(false);

  useEffect(() => {
    let cancelado = false;
    setError(null);

    const promesaProyecto = proyectoInicial
      ? Promise.resolve(proyectoInicial)
      : cargarProyectoEstudianteParaRevision(proyectoId, fallbackSnapshot).then(
          (res) => res.proyecto
        );

    Promise.all([listarMisCursos(perfil.id), promesaProyecto])
      .then(([cs, proy]) => {
        if (cancelado) return;
        const activos = cs.filter((c) => c.estado === "activo");
        setCursos(activos);
        setProyectoCargado(proy);

        const preferido = cursoIdInicial ?? proy.curso_id ?? null;
        const cursoElegido =
          (preferido && activos.find((c) => c.id === preferido)?.id) ||
          activos[0]?.id ||
          "";
        setCursoId(cursoElegido);

        if (!usuarioEditoNombre.current) {
          setNombre(limpiarNombreParaCasoDelCurso(proy.nombre));
        }
        if (!usuarioTocoPaso.current) {
          const clonar = debeClonarComoCasoNuevo(proy, perfil.id, cursoElegido);
          setPasoInicio(clonar ? 9 : (proy.paso_inicio_estudiante ?? 2));
        }
      })
      .catch((e) => {
        if (cancelado) return;
        setError(String(e?.message ?? e));
      })
      .finally(() => {
        if (cancelado) return;
        setCargandoCursos(false);
        setCargandoProyecto(false);
      });

    return () => {
      cancelado = true;
    };
  }, [perfil.id, proyectoId, proyectoInicial, fallbackSnapshot, cursoIdInicial]);

  const alCambiarCurso = (nuevoCursoId: string) => {
    setCursoId(nuevoCursoId);
    if (!usuarioTocoPaso.current && proyectoCargado) {
      const clonar = debeClonarComoCasoNuevo(proyectoCargado, perfil.id, nuevoCursoId);
      setPasoInicio(clonar ? 9 : (proyectoCargado.paso_inicio_estudiante ?? 2));
    }
  };

  const guardar = async () => {
    if (!proyectoCargado) return;
    if (!cursoId) {
      setError("Elige un curso.");
      return;
    }
    const nombreFinal =
      nombre.trim() || limpiarNombreParaCasoDelCurso(proyectoCargado.nombre);
    setError(null);
    setGuardando(true);
    try {
      const esCopia = debeClonarComoCasoNuevo(proyectoCargado, perfil.id, cursoId);
      if (esCopia) {
        await clonarComoCasoDelCurso({
          origen: proyectoCargado,
          docenteId: perfil.id,
          cursoId,
          pasoInicioEstudiante: pasoInicio,
          nombre: nombreFinal,
        });
      } else {
        const proyectoActualizado = {
          ...proyectoCargado,
          curso_id: cursoId,
          nombre: nombreFinal,
        };
        await guardarProyecto(proyectoActualizado);
        await guardarComoCasoDelCurso(
          proyectoCargado.id,
          cursoId,
          pasoInicio,
          nombreFinal
        );
      }
      const cursoElegido = cursos.find((c) => c.id === cursoId);
      const cursoNombre = cursoElegido?.nombre ?? "el curso";
      onCerrar({ pasoInicio, cursoNombre, nombreCaso: nombreFinal, esCopia });
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setGuardando(false);
    }
  };

  const esCopia = proyectoCargado
    ? debeClonarComoCasoNuevo(proyectoCargado, perfil.id, cursoId)
    : false;
  const pasoSeleccionado = PASOS.find((p) => p.n === pasoInicio) ?? PASOS[8];
  const pasosEntregados = PASOS.filter((p) => p.n < pasoInicio);
  const pasosACompletar = PASOS.filter((p) => p.n >= pasoInicio);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-card shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <div>
            <h2 className="text-base font-semibold">Guardar como caso del curso</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {proyectoCargado
                ? `"${proyectoCargado.nombre}" se convertirá en plantilla para tus estudiantes.`
                : "Preparando el proyecto para guardarlo como plantilla del curso…"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onCerrar(null)}
            className="rounded-md p-1 hover:bg-secondary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 p-4">
          {cargandoProyecto ? (
            <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Cargando datos del proyecto…
            </div>
          ) : !proyectoCargado ? (
            error ? null : (
              <div className="rounded-md border border-destructive/60 bg-destructive/10 p-3 text-xs text-destructive">
                No se pudo cargar el proyecto seleccionado.
              </div>
            )
          ) : (
            <>
              {/* Nombre del caso */}
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Nombre del caso para el curso
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => {
                    usuarioEditoNombre.current = true;
                    setNombre(e.target.value);
                  }}
                  placeholder="Ej: Cafetería de especialidad"
                  className="mt-1 w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-sm"
                />
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Puedes editarlo para anonimizarlo o quitar el nombre del grupo.
                </p>
              </div>

              {/* Selector de curso */}
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Curso destino
                </label>
                {cargandoCursos ? (
                  <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Cargando tus cursos…
                  </div>
                ) : cursos.length === 0 ? (
                  <div className="mt-1 rounded-md border border-dashed border-amber-400 bg-amber-50 p-3 text-xs text-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
                    No tienes cursos activos. Crea uno desde el panel docente primero.
                  </div>
                ) : (
                  <select
                    value={cursoId}
                    onChange={(e) => alCambiarCurso(e.target.value)}
                    className="mt-1 w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
                  >
                    {cursos.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre} {c.paralelo ? `· ${c.paralelo}` : ""} ({c.codigo})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Slider de paso inicio */}
              <div>
                <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  ¿Desde qué paso debe empezar a trabajar el estudiante?
                </label>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="range"
                    min={1}
                    max={9}
                    step={1}
                    value={pasoInicio}
                    onChange={(e) => {
                      usuarioTocoPaso.current = true;
                      setPasoInicio(Number(e.target.value));
                    }}
                    className="flex-1"
                  />
                  <span className="w-16 text-right text-sm font-bold">
                    Paso {pasoInicio}
                  </span>
                </div>
                <div className="mt-1.5 rounded-md bg-secondary/50 p-2">
                  <div className="text-xs font-semibold">{pasoSeleccionado.label}</div>
                  <div className="text-[11px] text-muted-foreground">{pasoSeleccionado.desc}</div>
                </div>
              </div>

              {/* Vista previa */}
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div className="rounded-md border border-emerald-400/60 bg-emerald-50 p-2 dark:bg-emerald-950/20">
                  <div className="text-[11px] font-bold uppercase tracking-wide text-emerald-900 dark:text-emerald-100">
                    ✓ Recibe ya armado ({pasosEntregados.length})
                  </div>
                  <ul className="mt-1 space-y-0.5 text-[11px] text-emerald-900/80 dark:text-emerald-100/80">
                    {pasosEntregados.length === 0 ? (
                      <li className="italic">— Ningún paso —</li>
                    ) : (
                      pasosEntregados.map((p) => (
                        <li key={p.n}>
                          {p.n}. {p.label}
                        </li>
                      ))
                    )}
                  </ul>
                </div>
                <div className="rounded-md border border-sky-400/60 bg-sky-50 p-2 dark:bg-sky-950/20">
                  <div className="text-[11px] font-bold uppercase tracking-wide text-sky-900 dark:text-sky-100">
                    ✎ Debe completar ({pasosACompletar.length})
                  </div>
                  <ul className="mt-1 space-y-0.5 text-[11px] text-sky-900/80 dark:text-sky-100/80">
                    {pasosACompletar.map((p) => (
                      <li key={p.n}>
                        {p.n}. {p.label}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Ficha pedagógica */}
              <div className="rounded-md border border-border bg-secondary/30 p-2 text-[11px] text-muted-foreground">
                <strong className="text-foreground">Notas:</strong>{" "}
                {esCopia ? (
                  <>
                    Se creará un <strong>caso nuevo e independiente</strong> en el curso elegido
                    sin modificar el proyecto original del estudiante o grupo.{" "}
                  </>
                ) : null}
                Tu caso completo queda guardado como referencia para comparar contra cada entrega del
                estudiante. Los estudiantes que tomen el caso DESPUÉS de cambios tuyos verán los
                nuevos valores; los que ya empezaron mantienen su versión.
              </div>
            </>
          )}

          {error && (
            <div className="rounded-md border border-destructive/60 bg-destructive/10 p-2 text-xs text-destructive">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-border p-4">
          <button
            type="button"
            onClick={() => onCerrar(null)}
            disabled={guardando}
            className="rounded-md border border-border px-3 py-1.5 text-xs hover:bg-secondary disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={guardar}
            disabled={
              guardando ||
              cargandoProyecto ||
              !proyectoCargado ||
              cursos.length === 0 ||
              !cursoId
            }
            className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {guardando && <Loader2 className="h-3 w-3 animate-spin" />}
            Guardar como caso del curso
          </button>
        </div>
      </div>
    </div>
  );
}
