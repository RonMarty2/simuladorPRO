import { useEffect, useMemo, useState } from "react";
import { X, BookOpen, Eye, Send, Loader2, CheckCircle2 } from "lucide-react";
import {
  PLANTILLAS,
  CATEGORIAS,
  type PlantillaMeta,
  type CategoriaPlantilla,
} from "@/lib/plantillas";
import { construirFlujoCaja } from "@/lib/flujo-proyecto";
import { formatearBolivianos, cn } from "@/lib/utils";
import type { Proyecto } from "@/types/proyecto";
import DetalleEntregaPasoAPaso from "@/components/docente/DetalleEntregaPasoAPaso";
import { useAuthStore } from "@/stores/auth-store";
import { listarMisCursos, type Curso } from "@/lib/cursos-supabase";
import { publicarPlantillaComoCaso } from "@/lib/proyecto-supabase";

/**
 * Galería de proyectos de EJEMPLO (solo lectura). Vitrina pedagógica para que
 * el docente enseñe y el alumno se vuelva experto comparando varios tipos.
 * Organizada por CATEGORÍAS. Cada plantilla es solo de lectura: NO se guarda
 * y NO se mezcla con los proyectos del alumno.
 */
export default function GaleriaEjemplos() {
  const [abierto, setAbierto] = useState<PlantillaMeta | null>(null);
  const [aPublicar, setAPublicar] = useState<PlantillaMeta | null>(null);
  const [filtroCategoria, setFiltroCategoria] = useState<CategoriaPlantilla | "todas">("todas");
  const perfil = useAuthStore((s) => s.perfil);
  const esDocente = perfil?.rol === "docente";

  const categoriasUsadas = useMemo(() => {
    const set = new Set(PLANTILLAS.map((p) => p.categoria));
    return Array.from(set);
  }, []);

  const plantillasFiltradas = useMemo(() => {
    if (filtroCategoria === "todas") return PLANTILLAS;
    return PLANTILLAS.filter((p) => p.categoria === filtroCategoria);
  }, [filtroCategoria]);

  // Para la vista "todas", agrupamos por categoría
  const porCategoria = useMemo(() => {
    const m = new Map<CategoriaPlantilla, PlantillaMeta[]>();
    for (const pl of plantillasFiltradas) {
      if (!m.has(pl.categoria)) m.set(pl.categoria, []);
      m.get(pl.categoria)!.push(pl);
    }
    return m;
  }, [plantillasFiltradas]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
          <BookOpen className="h-5 w-5 text-primary" />
          Galería de proyectos de ejemplo
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {PLANTILLAS.length} proyectos modelo <strong>completos</strong> agrupados por categoría.
          Vitrina para que el alumno explore distintos tipos de negocio y se vuelva experto
          comparándolos. Son <strong>solo de lectura</strong> — no se guardan ni aparecen en
          tus proyectos.
        </p>
      </div>

      <div className="rounded-md border border-amber-300 bg-amber-50/60 px-3 py-2 text-[11px] text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100">
        💡 Idea pedagógica: comparar 3 cafeterías muestra cómo el tamaño cambia los
        indicadores. Comparar restaurante vs food truck muestra estructuras de costo
        distintas. Comparar podcast premium vs canal de YouTube muestra suscripción vs
        publicidad sobre el mismo creador.
      </div>

      {/* Filtros por categoría */}
      <div className="flex flex-wrap gap-1.5">
        <FiltroCategoria
          activa={filtroCategoria === "todas"}
          onClick={() => setFiltroCategoria("todas")}
          emoji="🎯"
          label={`Todas (${PLANTILLAS.length})`}
        />
        {categoriasUsadas.map((cat) => {
          const meta = CATEGORIAS[cat];
          const total = PLANTILLAS.filter((p) => p.categoria === cat).length;
          return (
            <FiltroCategoria
              key={cat}
              activa={filtroCategoria === cat}
              onClick={() => setFiltroCategoria(cat)}
              emoji={meta.emoji}
              label={`${meta.titulo} (${total})`}
            />
          );
        })}
      </div>

      {/* Grid de plantillas, agrupadas por categoría */}
      <div className="space-y-6">
        {Array.from(porCategoria.entries()).map(([cat, plantillas]) => {
          const meta = CATEGORIAS[cat];
          return (
            <section key={cat} className="space-y-3">
              <div className="flex items-baseline gap-2 border-b border-border pb-1.5">
                <span className="text-xl">{meta.emoji}</span>
                <div>
                  <h2 className="text-base font-bold">{meta.titulo}</h2>
                  <p className="text-[11px] text-muted-foreground">{meta.descripcion}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {plantillas.map((pl) => (
                  <div
                    key={pl.clave}
                    className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4 transition hover:border-primary hover:shadow-md"
                  >
                    <button onClick={() => setAbierto(pl)} className="flex flex-col gap-2 text-left">
                      <div className="flex items-center justify-between">
                        <span className="text-3xl">{pl.emoji}</span>
                        <ChipEscala escala={pl.escala} />
                      </div>
                      <div className="text-sm font-bold leading-tight">{pl.titulo}</div>
                      <div className="flex flex-wrap gap-1">
                        <span className="rounded bg-indigo-600 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                          {pl.modeloLabel}
                        </span>
                        <span className="rounded bg-secondary px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">
                          {pl.sector}
                        </span>
                      </div>
                      <p className="text-[11px] leading-snug text-muted-foreground">{pl.resumen}</p>
                      <div className="mt-1 flex items-center gap-1 text-[11px] font-medium text-primary">
                        <Eye className="h-3.5 w-3.5" />
                        Ver proyecto completo
                      </div>
                    </button>
                    {esDocente && (
                      <button
                        onClick={() => setAPublicar(pl)}
                        className="mt-1 flex items-center justify-center gap-1.5 rounded-md border border-emerald-400 bg-emerald-50 px-2.5 py-1.5 text-[11px] font-bold text-emerald-800 transition hover:bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200"
                        title="Publicar este ejemplo como caso del curso para tus alumnos"
                      >
                        <Send className="h-3.5 w-3.5" />
                        Publicar como caso del curso
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {abierto && <VisorPlantilla plantilla={abierto} onCerrar={() => setAbierto(null)} />}
      {aPublicar && (
        <ModalPublicarCaso plantilla={aPublicar} onCerrar={() => setAPublicar(null)} />
      )}
    </div>
  );
}

// ============================================================================
// MODAL: publicar plantilla como caso del curso (solo docente)
// ============================================================================
function ModalPublicarCaso({
  plantilla,
  onCerrar,
}: {
  plantilla: PlantillaMeta;
  onCerrar: () => void;
}) {
  const user = useAuthStore((s) => s.user);
  const [cursos, setCursos] = useState<Curso[] | null>(null);
  const [cursoId, setCursoId] = useState<string>("");
  const [pasoInicio, setPasoInicio] = useState<number>(9);
  const [nombreCaso, setNombreCaso] = useState<string>(plantilla.titulo);
  const [enviando, setEnviando] = useState(false);
  const [exito, setExito] = useState<{ cursoNombre: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    listarMisCursos(user.id)
      .then((cs) => {
        setCursos(cs);
        if (cs.length > 0) setCursoId(cs[0].id);
      })
      .catch((e) => setError(e?.message ?? "Error al cargar tus cursos"));
  }, [user]);

  const publicar = async () => {
    if (!user || !cursoId) return;
    setEnviando(true);
    setError(null);
    try {
      const proyecto = plantilla.crear();
      await publicarPlantillaComoCaso({
        plantilla: { ...proyecto, nombre: nombreCaso.trim() || plantilla.titulo },
        docenteId: user.id,
        cursoId,
        pasoInicioEstudiante: pasoInicio,
        nombre: nombreCaso.trim() || plantilla.titulo,
      });
      const cursoNombre = cursos?.find((c) => c.id === cursoId)?.nombre ?? "el curso";
      setExito({ cursoNombre });
    } catch (e: any) {
      setError(e?.message ?? "No se pudo publicar el caso");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-card p-5 shadow-xl">
        <div className="mb-3 flex items-start justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <Send className="h-4 w-4 text-emerald-600" />
              Publicar como caso del curso
            </h2>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {plantilla.emoji} {plantilla.titulo}
            </p>
          </div>
          <button
            onClick={onCerrar}
            disabled={enviando}
            className="rounded-md p-1 hover:bg-secondary disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {exito ? (
          <div className="space-y-3">
            <div className="rounded-md border border-emerald-400 bg-emerald-50 p-3 dark:bg-emerald-950/40">
              <div className="flex items-center gap-2 text-sm font-bold text-emerald-900 dark:text-emerald-100">
                <CheckCircle2 className="h-4 w-4" />
                ¡Caso publicado!
              </div>
              <p className="mt-1 text-[11px] text-emerald-800/90 dark:text-emerald-200">
                Los alumnos de <strong>{exito.cursoNombre}</strong> ya pueden tomarlo desde su
                panel, en la sección <strong>"Caso del curso"</strong>.
              </p>
            </div>
            <button
              onClick={onCerrar}
              className="w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Cerrar
            </button>
          </div>
        ) : cursos === null ? (
          <div className="flex items-center justify-center gap-2 py-6 text-xs text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Cargando tus cursos…
          </div>
        ) : cursos.length === 0 ? (
          <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
            No tenés cursos creados. Andá al <strong>Panel del docente</strong> y creá un curso
            primero.
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Nombre que verán los alumnos
              </label>
              <input
                value={nombreCaso}
                onChange={(e) => setNombreCaso(e.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                ¿A qué curso?
              </label>
              <select
                value={cursoId}
                onChange={(e) => setCursoId(e.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {cursos.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre} ({c.codigo})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                ¿Desde qué paso debe trabajar el alumno?
              </label>
              <select
                value={pasoInicio}
                onChange={(e) => setPasoInicio(Number(e.target.value))}
                className="mt-1 w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value={9}>Paso 9 — recibe TODO armado (solo simula)</option>
                <option value={7}>Paso 7 — completa Financiamiento + Cap. trabajo + Resumen</option>
                <option value={5}>Paso 5 — completa Costos directos en adelante</option>
                <option value={3}>Paso 3 — completa Inversiones en adelante</option>
                <option value={1}>Paso 1 — recibe todo armado pero editable desde el inicio</option>
              </select>
              <p className="mt-1 text-[10px] leading-snug text-muted-foreground">
                Los pasos anteriores al elegido le llegan al alumno con tus datos. Los pasos desde
                el elegido en adelante los <strong>completa él</strong> usando tu ejemplo como
                contexto.
              </p>
            </div>

            {error && (
              <div className="rounded-md border border-destructive/60 bg-destructive/10 px-3 py-2 text-[11px] text-destructive">
                {error}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={onCerrar}
                disabled={enviando}
                className="rounded-md border border-border px-3 py-1.5 text-xs hover:bg-secondary disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={publicar}
                disabled={enviando || !cursoId}
                className="flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {enviando ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
                Publicar caso
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FiltroCategoria({
  activa,
  onClick,
  emoji,
  label,
}: {
  activa: boolean;
  onClick: () => void;
  emoji: string;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition",
        activa
          ? "border-primary bg-primary text-primary-foreground shadow-sm"
          : "border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground"
      )}
    >
      <span>{emoji}</span>
      <span>{label}</span>
    </button>
  );
}

function ChipEscala({ escala }: { escala: "Pequeño" | "Mediano" | "Grande" }) {
  const clase =
    escala === "Pequeño"
      ? "bg-sky-100 text-sky-900 dark:bg-sky-950/50 dark:text-sky-200"
      : escala === "Mediano"
        ? "bg-amber-100 text-amber-900 dark:bg-amber-950/50 dark:text-amber-200"
        : "bg-rose-100 text-rose-900 dark:bg-rose-950/50 dark:text-rose-200";
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-[9px] font-bold uppercase", clase)}>
      {escala}
    </span>
  );
}

function VisorPlantilla({
  plantilla,
  onCerrar,
}: {
  plantilla: PlantillaMeta;
  onCerrar: () => void;
}) {
  const perfil = useAuthStore((s) => s.perfil);
  const esDocente = perfil?.rol === "docente";
  const [publicar, setPublicar] = useState(false);
  const proyecto = useMemo<Proyecto>(() => plantilla.crear(), [plantilla]);
  const calc = useMemo(() => {
    try {
      return construirFlujoCaja(proyecto);
    } catch {
      return null;
    }
  }, [proyecto]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4">
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg bg-card shadow-xl">
        <header className="flex items-center justify-between gap-2 border-b border-border p-4">
          <div className="min-w-0">
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <span className="text-xl">{plantilla.emoji}</span>
              <span className="truncate">{proyecto.nombre}</span>
            </h2>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {CATEGORIAS[plantilla.categoria].titulo} · {plantilla.modeloLabel} ·{" "}
              {plantilla.escala} · Proyecto de ejemplo (solo lectura)
            </p>
          </div>
          <button onClick={onCerrar} className="rounded-md p-1 hover:bg-secondary">
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {calc && (
            <div>
              <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Indicadores del proyecto
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <Indicador
                  titulo="VAN"
                  valor={formatearBolivianos(calc.indicadores.van)}
                  positivo={calc.indicadores.van > 0}
                />
                <Indicador
                  titulo="TIR"
                  valor={isFinite(calc.indicadores.tir) ? `${(calc.indicadores.tir * 100).toFixed(2)}%` : "—"}
                  positivo={calc.indicadores.tir > calc.wacc}
                />
                <Indicador titulo="WACC" valor={`${(calc.wacc * 100).toFixed(2)}%`} positivo />
                <Indicador
                  titulo="Payback"
                  valor={isFinite(calc.indicadores.payback) ? `${calc.indicadores.payback.toFixed(1)} años` : "—"}
                  positivo={calc.indicadores.payback > 0 && calc.indicadores.payback <= 5}
                />
              </div>
            </div>
          )}

          <div className="rounded-md border border-border bg-secondary/20 p-3 text-[11px] text-muted-foreground">
            {proyecto.descripcion}
          </div>

          <DetalleEntregaPasoAPaso proyecto={proyecto} pasoEntregado={null} />
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-border p-3">
          <span className="text-[10px] text-muted-foreground">
            Ejemplo de referencia · No se guarda
          </span>
          {esDocente && (
            <button
              onClick={() => setPublicar(true)}
              className="flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
              title="Publicar este ejemplo como caso del curso para tus alumnos"
            >
              <Send className="h-3.5 w-3.5" />
              Publicar como caso del curso
            </button>
          )}
        </footer>
      </div>
      {publicar && <ModalPublicarCaso plantilla={plantilla} onCerrar={() => setPublicar(false)} />}
    </div>
  );
}

function Indicador({ titulo, valor, positivo }: { titulo: string; valor: string; positivo: boolean }) {
  return (
    <div className="rounded-md border border-border bg-card p-2">
      <div className="text-[9px] uppercase tracking-wide text-muted-foreground">{titulo}</div>
      <div
        className={cn(
          "text-sm font-bold tabular-nums",
          positivo ? "text-emerald-700 dark:text-emerald-400" : "text-destructive"
        )}
      >
        {valor}
      </div>
    </div>
  );
}
