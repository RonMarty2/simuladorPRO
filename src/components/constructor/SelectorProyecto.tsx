import { useEffect, useState } from "react";
import { ChevronDown, FolderOpen, Loader2, Plus, Sparkles, Trash2, X } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useProyectoStore } from "@/stores/proyecto-store";
import { guardarProyecto, listarMisProyectos, eliminarProyecto } from "@/lib/proyecto-supabase";
import { listarMisInscripciones, listarMisCursos, type Curso } from "@/lib/cursos-supabase";
import { calcularCapitalTrabajoBase } from "@/lib/flujo-proyecto";
import {
  crearProyectoEjemploCafeteriaV2,
  crearProyectoEjemploPanaderiaV2,
  crearProyectoEjemploPlanMarketingV2,
  crearProyectoEjemploPodcastV2,
  crearProyectoEjemploPublicidadV2,
  crearProyectoEjemploTiendaV2,
  type ModeloIngreso,
} from "@/lib/proyecto-factory";
import type { Proyecto, VersionProyecto } from "@/types/proyecto";
import { cn } from "@/lib/utils";

// Las 6 fábricas de ejemplo, una por cada tipo de proyecto.
const FABRICAS_EJEMPLO: ((p: { estudiante_id: string }) => Proyecto)[] = [
  crearProyectoEjemploCafeteriaV2,
  crearProyectoEjemploPanaderiaV2,
  crearProyectoEjemploTiendaV2,
  crearProyectoEjemploPodcastV2,
  crearProyectoEjemploPublicidadV2,
  crearProyectoEjemploPlanMarketingV2,
];

const LS_KEY_PROYECTO_ACTIVO = "simulador.proyectoActivo";

export function guardarProyectoActivo(userId: string, proyectoId: string) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${LS_KEY_PROYECTO_ACTIVO}.${userId}`, proyectoId);
  } catch {}
}

export function leerProyectoActivo(userId: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(`${LS_KEY_PROYECTO_ACTIVO}.${userId}`);
  } catch {
    return null;
  }
}

interface Props {
  proyectos: Proyecto[];
}

export default function SelectorProyecto({ proyectos }: Props) {
  const proyectoActual = useProyectoStore((s) => s.proyecto);
  const cargar = useProyectoStore((s) => s.cargar);
  const user = useAuthStore((s) => s.user);
  // Crear proyectos LIBRES es por ahora solo para docentes. (A futuro se abrirá
  // para estudiantes de pago.) El estudiante recibe su proyecto vía caso del
  // curso o grupo.
  const puedeCrearLibre = useAuthStore((s) => s.perfil?.rol === "docente");

  const [abierto, setAbierto] = useState(false);
  const [creando, setCreando] = useState(false);
  const [cursoInicial, setCursoInicial] = useState<string>("");

  // Si llegamos con intención de crear desde el panel (con o sin curso
  // preseleccionado), abrir directamente la ventana de crear.
  useEffect(() => {
    if (!puedeCrearLibre) return;
    try {
      const hint = localStorage.getItem("simulador.nuevoProyecto");
      if (hint !== null) {
        setCursoInicial(hint);
        setCreando(true);
        localStorage.removeItem("simulador.nuevoProyecto");
      }
    } catch {}
  }, [puedeCrearLibre]);

  if (!user) return null;

  // Filtra proyectos del usuario que no sean caso_curso ni entregas
  // (esos no son "proyectos en construcción" sino plantillas o copias)
  const proyectosVisibles = proyectos.filter((p) => {
    // Mostrar los que el usuario está editando: libres + casos del docente
    // Las entregas también las muestro porque el estudiante puede querer
    // seguir trabajándolas
    return (
      !p.tipo ||
      p.tipo === "libre" ||
      p.tipo === "caso_curso" ||
      p.tipo === "entrega_estudiante" ||
      p.tipo === "proyecto_grupal"
    );
  });

  const cambiarA = (p: Proyecto) => {
    cargar(p);
    guardarProyectoActivo(user.id, p.id);
    setAbierto(false);
    // Recargar la página para refrescar los pasos y estado del nuevo proyecto
    setTimeout(() => window.location.reload(), 50);
  };

  return (
    <div className="relative flex items-center gap-2">
      {/* Dropdown selector */}
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-sm hover:bg-secondary"
      >
        <FolderOpen className="h-3.5 w-3.5 text-muted-foreground" />
        <div className="text-left">
          <div className="text-[9px] uppercase tracking-wide text-muted-foreground">
            Proyecto activo
          </div>
          <div className="max-w-[200px] truncate font-medium">
            {proyectoActual?.nombre ?? "(ninguno)"}
          </div>
        </div>
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        {proyectosVisibles.length > 1 && (
          <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[9px] font-semibold text-primary">
            {proyectosVisibles.length}
          </span>
        )}
      </button>

      {/* Botón crear nuevo — solo docentes por ahora */}
      {puedeCrearLibre && (
        <button
          type="button"
          onClick={() => setCreando(true)}
          className="flex items-center gap-1 rounded-md border border-primary/40 bg-primary/5 px-2.5 py-1.5 text-xs font-medium text-primary hover:bg-primary/10"
        >
          <Plus className="h-3 w-3" />
          Nuevo proyecto
        </button>
      )}

      {/* Menú desplegable de proyectos */}
      {abierto && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setAbierto(false)}
          />
          <div className="absolute left-0 top-full z-40 mt-1 max-h-80 w-80 overflow-y-auto rounded-md border border-border bg-card p-1 shadow-lg">
            {proyectosVisibles.length === 0 ? (
              <div className="p-3 text-center text-xs text-muted-foreground">
                Aún no tienes proyectos. Crea uno con el botón "+ Nuevo proyecto".
              </div>
            ) : (
              proyectosVisibles.map((p) => {
                const activo = p.id === proyectoActual?.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => cambiarA(p)}
                    className={cn(
                      "flex w-full flex-col items-start gap-0.5 rounded p-2 text-left text-xs transition",
                      activo
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-secondary"
                    )}
                  >
                    <div className="flex w-full items-center justify-between gap-2">
                      <span className="truncate font-medium">{p.nombre}</span>
                      <span className="flex-shrink-0 text-[9px] uppercase tracking-wide opacity-60">
                        {p.tipo === "caso_curso"
                          ? "🎓 caso"
                          : p.tipo === "entrega_estudiante"
                          ? "📝 entrega"
                          : p.tipo === "proyecto_grupal"
                          ? "🤝 grupal"
                          : "📁 libre"}
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      Última edición:{" "}
                      {new Date(p.actualizado_en ?? p.creado_en).toLocaleString("es-BO", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        </>
      )}

      {/* Modal de crear nuevo proyecto */}
      {creando && (
        <ModalNuevoProyecto
          userId={user.id}
          cursoInicial={cursoInicial}
          onCerrar={(creado) => {
            setCreando(false);
            setCursoInicial("");
            if (creado) {
              guardarProyectoActivo(user.id, creado);
              setTimeout(() => window.location.reload(), 50);
            }
          }}
        />
      )}
    </div>
  );
}

function ModalNuevoProyecto({
  userId,
  cursoInicial = "",
  onCerrar,
}: {
  userId: string;
  cursoInicial?: string;
  onCerrar: (proyectoIdCreado: string | null) => void;
}) {
  const inicializar = useProyectoStore((s) => s.inicializar);
  const cargar = useProyectoStore((s) => s.cargar);
  const esDocente = useAuthStore((s) => s.perfil?.rol === "docente");
  const [nombre, setNombre] = useState("");
  const [version, setVersion] = useState<VersionProyecto>("v1");
  const [modelo, setModelo] = useState<ModeloIngreso>("unidades");
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [cursoId, setCursoId] = useState<string>(cursoInicial);

  const placeholderNombre: Record<ModeloIngreso, string> = {
    unidades: "Ej: Cafetería, Tienda, Taller mecánico…",
    suscripcion: "Ej: Podcast con membresías, Gimnasio…",
    publicidad: "Ej: Canal de YouTube, Radio, Newsletter…",
    costo_beneficio: "Ej: Plan de marketing, Campaña de comunicación…",
  };
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cursos para asignar el proyecto: el docente ve los que DICTA; el estudiante,
  // aquellos en los que está INSCRITO.
  useEffect(() => {
    const cargar = esDocente
      ? listarMisCursos(userId)
      : listarMisInscripciones(userId).then((insc) => insc.map((i) => i.curso));
    cargar.then(setCursos).catch(() => {});
  }, [userId, esDocente]);

  const crear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    setGuardando(true);
    setError(null);
    try {
      inicializar(userId, nombre.trim(), cursoId || null, version, modelo);
      const p = useProyectoStore.getState().proyecto;
      if (!p) throw new Error("No se pudo inicializar el proyecto");
      await guardarProyecto(p);
      onCerrar(p.id);
    } catch (e: any) {
      setError(e?.message ?? String(e));
      setGuardando(false);
    }
  };

  const [reiniciando, setReiniciando] = useState(false);

  const cargarEjemplo = async (
    factory: (p: { estudiante_id: string; nombre?: string }) => Proyecto
  ) => {
    setGuardando(true);
    setError(null);
    try {
      const p = factory({ estudiante_id: userId });
      // Capital de trabajo recalculado con la fórmula vigente (operativos del
      // año 1, sin la cuota del préstamo), para que el ejemplo quede correcto.
      p.capitalTrabajo = calcularCapitalTrabajoBase(p);
      cargar(p);
      await guardarProyecto(p);
      onCerrar(p.id);
    } catch (e: any) {
      setError(e?.message ?? String(e));
      setGuardando(false);
    }
  };

  // Docente: borra TODOS sus proyectos y deja los 6 ejemplos completos (uno por
  // tipo). Pide doble confirmación porque es destructivo.
  const reiniciarEjemplos = async () => {
    setError(null);
    setGuardando(true);
    try {
      const mios = await listarMisProyectos(userId);
      for (const p of mios) {
        await eliminarProyecto(p.id);
      }
      let primero: string | null = null;
      for (const fabrica of FABRICAS_EJEMPLO) {
        const p = fabrica({ estudiante_id: userId });
        p.capitalTrabajo = calcularCapitalTrabajoBase(p);
        await guardarProyecto(p);
        if (!primero) {
          primero = p.id;
          cargar(p);
        }
      }
      onCerrar(primero);
    } catch (e: any) {
      setError(e?.message ?? String(e));
      setGuardando(false);
      setReiniciando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 sm:items-center">
      <div className="my-auto w-full max-w-md max-h-[90vh] overflow-y-auto rounded-lg bg-card p-5 shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold">Crear proyecto nuevo</h2>
          <button
            onClick={() => onCerrar(null)}
            disabled={guardando}
            className="rounded-md p-1 hover:bg-secondary disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={crear} className="space-y-3">
          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Nombre del proyecto
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder={placeholderNombre[modelo]}
              autoFocus
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {cursos.length > 0 && (
            <div>
              <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Curso al que pertenece
              </label>
              <select
                value={cursoId}
                onChange={(e) => setCursoId(e.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Sin curso (proyecto libre)</option>
                {cursos.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                    {c.paralelo ? ` · ${c.paralelo}` : ""} ({c.codigo})
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[10px] text-muted-foreground">
                Quedará registrado en ese curso; tus entregas irán ahí.
              </p>
            </div>
          )}

          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Tipo de análisis financiero
            </label>
            <div className="mt-1 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <OpcionVersionModal
                activa={version === "v1"}
                onClick={() => setVersion("v1")}
                titulo="Clásico"
                descripcion="VAN, TIR, Payback, IR, TRC, SD, RBC y WACC."
              />
              <OpcionVersionModal
                activa={version === "v2"}
                onClick={() => setVersion("v2")}
                titulo="Con análisis de riesgo"
                descripcion="Todo lo del clásico + punto de equilibrio, payback descontado, sensibilidad, apalancamiento y Monte Carlo."
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Modelo de ingreso (¿cómo entra la plata?)
            </label>
            <div className="mt-1 grid grid-cols-2 gap-2">
              <OpcionModelo activa={modelo === "unidades"} onClick={() => setModelo("unidades")} titulo="Unidades × precio" descripcion="Vendes productos o servicios por unidad. Café, producción, comercio, turismo." />
              <OpcionModelo activa={modelo === "suscripcion"} onClick={() => setModelo("suscripcion")} titulo="Suscripción" descripcion="Base de clientes recurrentes (altas y churn). Membresías, gimnasio." />
              <OpcionModelo activa={modelo === "publicidad"} onClick={() => setModelo("publicidad")} titulo="Publicidad" descripcion="Ingreso por audiencia × CPM. Radio, canal, podcast con sponsors." />
              <OpcionModelo activa={modelo === "costo_beneficio"} onClick={() => setModelo("costo_beneficio")} titulo="Costo-beneficio" descripcion="No vende; se evalúa por el beneficio que genera. Plan de marketing interno." />
            </div>
            <p className="mt-1 text-[10px] text-muted-foreground">
              Sale <strong>vacío</strong> con los campos de ese modelo, listo para llenar.
            </p>
          </div>

          <div className="rounded-md bg-secondary/50 p-2 text-[11px] text-muted-foreground">
            💡 Tus proyectos anteriores se conservan. Vas a poder cambiar entre
            ellos desde el selector de arriba.
          </div>

          {/* Atajos: cargar un ejemplo lleno — SOLO docentes (para ver/entender o
              armar un caso base). Los estudiantes construyen desde cero. */}
          {esDocente && (
            <div className="rounded-md border border-indigo-300 bg-indigo-50/50 p-2 dark:border-indigo-800 dark:bg-indigo-950/20">
              <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300">
                <Sparkles className="h-3.5 w-3.5" />
                Docente: carga un ejemplo completo para ver y entender:
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <BotonEjemplo onClick={() => cargarEjemplo(crearProyectoEjemploCafeteriaV2)} disabled={guardando} titulo="☕ Cafetería" sub="Servicios · unidades" />
                <BotonEjemplo onClick={() => cargarEjemplo(crearProyectoEjemploPanaderiaV2)} disabled={guardando} titulo="🥖 Panadería" sub="Producción · unidades" />
                <BotonEjemplo onClick={() => cargarEjemplo(crearProyectoEjemploTiendaV2)} disabled={guardando} titulo="🛒 Tienda" sub="Comercio · unidades" />
                <BotonEjemplo onClick={() => cargarEjemplo(crearProyectoEjemploPodcastV2)} disabled={guardando} titulo="🎙️ Podcast" sub="Suscripción" />
                <BotonEjemplo onClick={() => cargarEjemplo(crearProyectoEjemploPublicidadV2)} disabled={guardando} titulo="📺 Canal" sub="Publicidad · CPM" />
                <BotonEjemplo onClick={() => cargarEjemplo(crearProyectoEjemploPlanMarketingV2)} disabled={guardando} titulo="📣 Plan mkt" sub="Costo-beneficio" />
              </div>

              {/* Reinicio: deja la plataforma limpia con solo los 6 ejemplos */}
              <div className="mt-2 border-t border-indigo-200 pt-2 dark:border-indigo-900">
                {!reiniciando ? (
                  <button
                    type="button"
                    onClick={() => setReiniciando(true)}
                    disabled={guardando}
                    className="flex w-full items-center justify-center gap-1.5 rounded-md border border-destructive/40 bg-destructive/5 px-2 py-1.5 text-[11px] font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Reiniciar: borrar todos mis proyectos y dejar solo estos 6
                  </button>
                ) : (
                  <div className="rounded-md border border-destructive/50 bg-destructive/10 p-2">
                    <p className="text-[11px] text-destructive">
                      <strong>¿Seguro?</strong> Esto borra <strong>TODOS</strong> tus proyectos
                      (incluidos casos de curso y borradores) y crea los 6 ejemplos completos
                      desde cero. No se puede deshacer.
                    </p>
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={reiniciarEjemplos}
                        disabled={guardando}
                        className="flex items-center gap-1.5 rounded-md bg-destructive px-2.5 py-1.5 text-[11px] font-semibold text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
                      >
                        {guardando && <Loader2 className="h-3 w-3 animate-spin" />}
                        Sí, borrar todo y recrear los 6
                      </button>
                      <button
                        type="button"
                        onClick={() => setReiniciando(false)}
                        disabled={guardando}
                        className="rounded-md border border-border px-2.5 py-1.5 text-[11px] hover:bg-secondary disabled:opacity-50"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => onCerrar(null)}
              disabled={guardando}
              className="rounded-md border border-border px-3 py-1.5 text-xs hover:bg-secondary disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!nombre.trim() || guardando}
              className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {guardando && <Loader2 className="h-3 w-3 animate-spin" />}
              Crear proyecto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function BotonEjemplo({
  onClick,
  disabled,
  titulo,
  sub,
}: {
  onClick: () => void;
  disabled: boolean;
  titulo: string;
  sub: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex flex-col items-center rounded-md border border-indigo-300 bg-card px-2 py-1.5 text-center transition hover:bg-indigo-100 disabled:opacity-50 dark:border-indigo-800 dark:hover:bg-indigo-900/30"
    >
      <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">{titulo}</span>
      <span className="text-[9px] uppercase tracking-wide text-muted-foreground">{sub}</span>
    </button>
  );
}

function OpcionModelo({
  activa,
  onClick,
  titulo,
  descripcion,
}: {
  activa: boolean;
  onClick: () => void;
  titulo: string;
  descripcion: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activa}
      className={cn(
        "flex flex-col rounded-md border p-2 text-left transition",
        activa ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:border-primary/50"
      )}
    >
      <span className="text-xs font-semibold">{titulo}</span>
      <span className="mt-0.5 text-[10px] leading-snug text-muted-foreground">{descripcion}</span>
    </button>
  );
}

function OpcionVersionModal({
  activa,
  onClick,
  titulo,
  descripcion,
}: {
  activa: boolean;
  onClick: () => void;
  titulo: string;
  descripcion: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activa}
      className={cn(
        "flex flex-col rounded-md border p-2 text-left transition",
        activa
          ? "border-primary bg-primary/5 ring-1 ring-primary"
          : "border-border hover:border-primary/50"
      )}
    >
      <div className="flex items-center gap-1.5">
        <span
          className={cn(
            "flex h-3.5 w-3.5 items-center justify-center rounded-full border",
            activa ? "border-primary" : "border-muted-foreground/50"
          )}
        >
          {activa && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
        </span>
        <span className="text-xs font-semibold">{titulo}</span>
      </div>
      <span className="mt-1 text-[10px] leading-snug text-muted-foreground">
        {descripcion}
      </span>
    </button>
  );
}
