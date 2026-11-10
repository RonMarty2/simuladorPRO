import { fmtNum } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  X, BookOpen, Eye, Send, Loader2, CheckCircle2, Copy, Filter, ChevronDown, Sparkles,
  UtensilsCrossed, Factory, ShoppingBag, Wrench, Repeat,
  Tv, Mountain, Sprout, Scale, Megaphone, HeartHandshake,
  Ticket, Smartphone, Building2, Activity, GraduationCap,
  BadgePercent, Droplet, Landmark, LayoutGrid, type LucideIcon
} from "lucide-react";
import {
  PLANTILLAS,
  CATEGORIAS,
  type PlantillaMeta,
  type CategoriaPlantilla,
} from "@/lib/plantillas";

const ICONOS_CATEGORIA: Record<string, LucideIcon> = {
  gastronomia: UtensilsCrossed,
  produccion: Factory,
  comercio: ShoppingBag,
  servicios: Wrench,
  suscripcion: Repeat,
  medios: Tv,
  turismo: Mountain,
  agricultura: Sprout,
  costo_beneficio: Scale,
  marketing: Megaphone,
  social: HeartHandshake,
  eventos: Ticket,
  tecnologia: Smartphone,
  alquiler: Building2,
  salud_privada: Activity,
  educacion_privada: GraduationCap,
  franquicia: BadgePercent,
  concesion: Droplet,
  microcredito: Landmark,
};
import { construirFlujoCaja } from "@/lib/flujo-proyecto";
import { formatearBolivianos, cn } from "@/lib/utils";
import type { Proyecto } from "@/types/proyecto";
import DetalleEntregaPasoAPaso from "@/components/docente/DetalleEntregaPasoAPaso";
import PanelIndicadoresTipo from "@/components/constructor/PanelIndicadoresTipo";
import { useAuthStore } from "@/stores/auth-store";
import { listarMisCursos, type Curso } from "@/lib/cursos-supabase";
import { guardarProyecto, publicarPlantillaComoCaso } from "@/lib/proyecto-supabase";
import { guardarProyectoActivo } from "@/components/constructor/SelectorProyecto";

/**
 * Galería de proyectos de EJEMPLO (solo lectura). Vitrina pedagógica para que
 * el docente enseñe y el alumno se vuelva experto comparando varios tipos.
 * Organizada por CATEGORÍAS. Cada plantilla es solo de lectura: NO se guarda
 * y NO se mezcla con los proyectos del alumno.
 */
const LECCIONES_CATEGORIA: Record<string, { titulo: string; comparativa: string; leccion: string }> = {
  todas: {
    titulo: "Laboratorio Comparativo de Proyectos",
    comparativa: "57 modelos completos en 19 sectores económicos de Bolivia",
    leccion: "Cada sector tiene su propio motor financiero: en producción domina la maquinaria, en tecnología el desarrollo inicial, en suscripción la retención de clientes, y en servicios la planilla de personal. Selecciona cualquier categoría abajo para ver sus particularidades.",
  },
  gastronomia: {
    titulo: "Gastronomía: El impacto del alquiler y la maquinaria",
    comparativa: "Cafetería al paso vs. Restaurante temático vs. Food Truck",
    leccion: "Compara cómo la inversión inicial en adecuación de cocina y alquiler mensual determina cuántos platos o cafés diarios necesitas vender antes de alcanzar tu punto de equilibrio.",
  },
  produccion: {
    titulo: "Producción Industrial: Economías de escala",
    comparativa: "Taller artesanal vs. Fábrica de alimentos",
    leccion: "Observa el peso de la maquinaria fija y cómo el costo unitario de materia prima disminuye cuando el volumen de producción crece.",
  },
  comercio: {
    titulo: "Comercio: Rotación de inventario y capital de trabajo",
    comparativa: "Tienda física vs. E-commerce",
    leccion: "En comercio el dinero está inmovilizado en mercadería (stock). La clave es la rotación rápida para no asfixiar la caja.",
  },
  servicios: {
    titulo: "Servicios: Intensivos en planilla y tiempo",
    comparativa: "Consultoría vs. Centro de estética",
    leccion: "Casi no hay inventario físico; el costo principal son los sueldos y aportes patronales. La rentabilidad depende de la ocupación horaria.",
  },
  suscripcion: {
    titulo: "Suscripción: El valor de la recurrencia (LTV)",
    comparativa: "Gimnasio con cuota mensual vs. Academia digital",
    leccion: "El ingreso mensual es predecible, pero el crecimiento depende de mantener baja la tasa de cancelación (churn) frente al costo de adquirir nuevos clientes.",
  },
  medios: {
    titulo: "Medios y Publicidad: Audiencia masiva vs. Nicho",
    comparativa: "Canal de YouTube vs. Podcast premium",
    leccion: "Un canal gratuito requiere millones de reproducciones para vivir de anuncios; un formato de suscripción especializada vive con una base reducida pero fiel.",
  },
  turismo: {
    titulo: "Turismo y Hospitalidad: Estacionalidad y Ocupación",
    comparativa: "Hotel boutique vs. Operadora de excursiones",
    leccion: "Flujos de caja muy marcados por temporada alta y baja. El hotel inmoviliza capital en infraestructura; la agencia opera con capital ligero y comisiones.",
  },
  agricultura: {
    titulo: "Agricultura: Ciclos de cosecha y riesgo climático",
    comparativa: "Cultivo a campo abierto vs. Invernadero tecnificado",
    leccion: "Se invierte durante meses antes de ver el primer ingreso por cosecha. El capital de trabajo y las reservas de caja son cruciales.",
  },
  costo_beneficio: {
    titulo: "Costo-Beneficio: Justificar ahorros e inversión",
    comparativa: "Energía solar vs. Modernización de maquinaria",
    leccion: "No siempre se busca vender más: muchos proyectos se aprueban porque reducen gastos operativos mes a mes de forma garantizada.",
  },
  marketing: {
    titulo: "Marketing: Ventas incrementales atribuibles",
    comparativa: "Campaña de lanzamiento vs. Expansión de canal",
    leccion: "La inversión publicitaria debe generar un margen bruto adicional que supere con creces el presupuesto de la campaña.",
  },
  social: {
    titulo: "Impacto Social: Retorno cuantificado en bienestar",
    comparativa: "Centro de salud comunitario vs. Proyecto de agua",
    leccion: "El beneficio social se traduce a bolivianos medibles (días laborales ganados, ahorro en salud) con supuestos claros.",
  },
  eventos: {
    titulo: "Eventos: Concentración extrema del riesgo",
    comparativa: "Festival musical vs. Feria comercial",
    leccion: "Todos los gastos se desembolsan por adelantado y los ingresos entran en 48 horas. Una mala fecha o clima adverso define el resultado.",
  },
  tecnologia: {
    titulo: "Tecnología: Alto desarrollo inicial vs. Costo marginal cero",
    comparativa: "SaaS de suscripción vs. App transaccional",
    leccion: "Crear el software requiere una gran inversión diferida; pero atender al usuario número 10.000 cuesta casi lo mismo que al número 100.",
  },
  alquiler: {
    titulo: "Alquiler e Inmuebles: Inversión pesada y flujo constante",
    comparativa: "Edificio de oficinas vs. Bodegas de alquiler",
    leccion: "El activo fijo (terreno y edificación) es gigantesco, pero el flujo mensual de arriendos es de los más estables y seguros del mercado.",
  },
  salud_privada: {
    titulo: "Salud Privada: Equipos de alta gama y plazos de cobranza",
    comparativa: "Clínica médica vs. Laboratorio de análisis",
    leccion: "Equipos con depreciación rápida y regulaciones sanitarias estrictas. La caja debe soportar 60 a 90 días de crédito a aseguradoras y cajas.",
  },
  educacion_privada: {
    titulo: "Educación Privada: Matrículas y costos docentes",
    comparativa: "Colegio privado vs. Instituto técnico",
    leccion: "Ingresos concentrados en meses escolares (febrero a noviembre). La planilla docente no se detiene en vacaciones, exigiendo colchón de caja.",
  },
  franquicia: {
    titulo: "Franquicias: Marca probada a cambio de regalías",
    comparativa: "Franquicia gastronómica vs. Franquicia de servicios",
    leccion: "Menor riesgo de mercado gracias a la marca, pero con canon de entrada inicial y regalías mensuales que reducen tu margen neto.",
  },
  concesion: {
    titulo: "Concesiones: Inversión a 20 años y tarifa regulada",
    comparativa: "Red de agua potable vs. Concesión de peaje",
    leccion: "Inversión inicial millonaria que se recupera lentamente a lo largo de décadas con tarifas supervisadas por el Estado.",
  },
  microcredito: {
    titulo: "Microcrédito: Fondeo, colocación y previsión de mora",
    comparativa: "Cooperativa de ahorro y crédito vs. Fintech de micropréstamos",
    leccion: "El negocio no es solo prestar, sino a qué tasa te prestas tú (costo de fondeo) y cuánto reservas para clientes que se retrasan en pagar.",
  },
};

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

  const [mostrarGuia, setMostrarGuia] = useState<boolean>(true);

  // Para la vista "todas", agrupamos por categoría
  const porCategoria = useMemo(() => {
    const m = new Map<CategoriaPlantilla, PlantillaMeta[]>();
    for (const pl of plantillasFiltradas) {
      if (!m.has(pl.categoria)) m.set(pl.categoria, []);
      m.get(pl.categoria)!.push(pl);
    }
    return m;
  }, [plantillasFiltradas]);

  const leccionActual = LECCIONES_CATEGORIA[filtroCategoria] ?? LECCIONES_CATEGORIA.todas;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2.5 font-display text-2xl font-bold tracking-tight sm:text-3xl">
          <BookOpen className="h-7 w-7 text-primary" />
          Galería de proyectos de ejemplo
        </h1>
        <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-muted-foreground">
          {PLANTILLAS.length} proyectos disponibles
        </span>
      </div>

      {/* Guía Pedagógica Dinámica por Sector (Dirección A) */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-xs sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-primary">
              <Sparkles className="h-3 w-3" />
              Guía de Análisis
            </span>
            <span className="font-display text-sm font-bold text-foreground">
              {leccionActual.titulo}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setMostrarGuia((v) => !v)}
            className="text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            {mostrarGuia ? "Ocultar guía ▴" : "Ver guía ▾"}
          </button>
        </div>

        {mostrarGuia && (
          <div className="mt-3 space-y-3">
            <div className="rounded-xl border border-border/70 bg-accent/30 p-3 text-xs leading-relaxed text-foreground">
              <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Comparativa clave · {leccionActual.comparativa}
              </div>
              <p className="mt-1">
                {leccionActual.leccion}
              </p>
            </div>

            {filtroCategoria === "todas" ? (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-medium text-muted-foreground">Explora por rubro:</span>
                {[
                  { cat: "gastronomia", label: "🍽️ Gastronomía" },
                  { cat: "tecnologia", label: "📱 Tecnología" },
                  { cat: "produccion", label: "🏭 Producción" },
                  { cat: "salud_privada", label: "🏥 Salud" },
                  { cat: "turismo", label: "🏔️ Turismo" },
                  { cat: "suscripcion", label: "🔄 Suscripción" },
                  { cat: "comercio", label: "📦 Comercio" },
                  { cat: "microcredito", label: "🏦 Microcrédito" },
                ].map((s) => (
                  <button
                    key={s.cat}
                    type="button"
                    onClick={() => setFiltroCategoria(s.cat as any)}
                    className="rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  Mostrando únicamente proyectos de <strong>{CATEGORIAS[filtroCategoria as CategoriaPlantilla]?.titulo}</strong>.
                </span>
                <button
                  type="button"
                  onClick={() => setFiltroCategoria("todas")}
                  className="font-bold text-primary hover:underline"
                >
                  ↺ Ver todos los 57 proyectos
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filtro por categoría: desplegable compacto y limpio */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-primary">
            <Filter className="h-4 w-4" />
          </div>
          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value as any)}
            className="h-11 w-full appearance-none rounded-xl border border-input bg-card pl-10 pr-9 text-xs font-bold text-foreground shadow-xs focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="todas">Todas las categorías ({PLANTILLAS.length} proyectos)</option>
            {categoriasUsadas.map((cat) => {
              const meta = CATEGORIAS[cat];
              const total = PLANTILLAS.filter((p) => p.categoria === cat).length;
              return (
                <option key={cat} value={cat}>
                  {meta.titulo} ({total})
                </option>
              );
            })}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-muted-foreground">
            <ChevronDown className="h-4 w-4" />
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          Mostrando <strong className="text-foreground">{plantillasFiltradas.length}</strong> de {PLANTILLAS.length} ejemplos
        </div>
      </div>

      {/* Grid de plantillas, agrupadas por categoría */}
      <div className="space-y-6">
        {Array.from(porCategoria.entries()).map(([cat, plantillas]) => {
          const meta = CATEGORIAS[cat];
          const IconoCat = ICONOS_CATEGORIA[cat] ?? LayoutGrid;
          return (
            <section key={cat} className="space-y-3">
              <div className="flex items-center gap-2.5 border-b border-border pb-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <IconoCat className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="font-display text-base font-bold text-foreground">{meta.titulo}</h2>
                  <p className="text-xs text-muted-foreground">{meta.descripcion}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {plantillas.map((pl) => {
                  const IconoPl = ICONOS_CATEGORIA[pl.categoria] ?? LayoutGrid;
                  return (
                    <div
                      key={pl.clave}
                      className="group flex flex-col gap-2.5 rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/50 hover:shadow-md"
                    >
                      <button onClick={() => setAbierto(pl)} className="flex flex-col gap-2 text-left">
                        <div className="flex items-center justify-between">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-xs transition group-hover:bg-primary group-hover:text-primary-foreground">
                            <IconoPl className="h-5 w-5" />
                          </div>
                          <ChipEscala escala={pl.escala} />
                        </div>
                        <div className="font-display text-base font-bold leading-tight text-foreground transition group-hover:text-primary">
                          {pl.titulo}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          <span className="rounded-md bg-primary/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                            {pl.modeloLabel}
                          </span>
                          <span className="rounded-md bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                            {pl.sector}
                          </span>
                          {pl.veredicto && <ChipVeredicto veredicto={pl.veredicto} />}
                        </div>
                        <p className="text-xs leading-relaxed text-muted-foreground">{pl.resumen}</p>
                        <div className="mt-1 flex items-center gap-1 text-xs font-semibold text-primary">
                          <Eye className="h-3.5 w-3.5" />
                          Ver proyecto completo
                        </div>
                      </button>
                      {esDocente && (
                        <button
                          onClick={() => setAPublicar(pl)}
                          className="mt-1 flex items-center justify-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary hover:text-primary-foreground"
                          title="Publicar este ejemplo como caso del curso para tus alumnos"
                        >
                          <Send className="h-3.5 w-3.5" />
                          Publicar como caso del curso
                        </button>
                      )}
                    </div>
                  );
                })}
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
            No tienes cursos creados. Ve al <strong>Panel del docente</strong> y crea un curso
            primero.
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Nombre que verán los alumnos
              </label>
              <input
                value={nombreCaso}
                onChange={(e) => setNombreCaso(e.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div>
              <label className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
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
              <label className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
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
              <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
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

function ChipVeredicto({ veredicto }: { veredicto: "viable" | "marginal" | "rechazo" }) {
  const meta = {
    viable: { texto: "Viable", clase: "bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-200 dark:border-emerald-800" },
    marginal: { texto: "Marginal", clase: "bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-200 dark:border-amber-800" },
    rechazo: { texto: "Ejemplo de rechazo", clase: "bg-rose-100 text-rose-900 border border-rose-300 dark:bg-rose-950/60 dark:text-rose-200 dark:border-rose-800" },
  }[veredicto];
  return (
    <span className={cn("rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wide", meta.clase)}>{meta.texto}</span>
  );
}

function ChipEscala({ escala }: { escala: "Pequeño" | "Mediano" | "Grande" }) {
  return (
    <span className="rounded-md border border-border bg-secondary/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
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
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [publicar, setPublicar] = useState(false);
  const [copiando, setCopiando] = useState(false);
  const [errorCopia, setErrorCopia] = useState<string | null>(null);
  const proyecto = useMemo<Proyecto>(() => plantilla.crear(), [plantilla]);

  // El alumno se lleva una copia propia (proyecto libre, sin curso) y la edita
  // en el constructor. El ejemplo de la galería no cambia.
  const usarComoBase = async () => {
    if (!user) return;
    setCopiando(true);
    setErrorCopia(null);
    try {
      const ahora = new Date().toISOString();
      const copia: Proyecto = {
        ...plantilla.crear(),
        estudiante_id: user.id,
        curso_id: null,
        grupo_id: null,
        tipo: "libre",
        caso_origen_id: null,
        paso_inicio_estudiante: null,
        estado: "construyendo",
        nombre: `${proyecto.nombre} (mi copia)`,
        creado_en: ahora,
        actualizado_en: ahora,
      };
      await guardarProyecto(copia);
      guardarProyectoActivo(user.id, copia.id);
      navigate("/construir");
    } catch (e: any) {
      setErrorCopia(e?.message ?? "No se pudo crear la copia");
      setCopiando(false);
    }
  };
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
            <h2 className="flex items-center gap-2 font-display text-lg font-bold">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <BookOpen className="h-4 w-4" />
              </div>
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
              <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
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
                  valor={isFinite(calc.indicadores.tir) ? `${fmtNum((calc.indicadores.tir * 100), 2)}%` : "—"}
                  positivo={calc.indicadores.tir > calc.wacc}
                />
                <Indicador titulo="WACC" valor={`${fmtNum((calc.wacc * 100), 2)}%`} positivo />
                <Indicador
                  titulo="Periodo de recuperación"
                  valor={isFinite(calc.indicadores.payback) ? `${fmtNum(calc.indicadores.payback, 1)} años` : "—"}
                  positivo={calc.indicadores.payback > 0 && calc.indicadores.payback <= 5}
                />
              </div>
            </div>
          )}

          <div className="rounded-md border border-border bg-secondary/20 p-3 text-[11px] text-muted-foreground">
            {proyecto.descripcion}
          </div>

          {plantilla.ensena && (
            <div className="rounded-md border border-amber-300 bg-amber-50/60 p-3 text-[11px] text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100">
              <div className="mb-1 flex items-center gap-2 font-bold uppercase tracking-wider">
                Qué enseña este ejemplo
                {plantilla.veredicto && <ChipVeredicto veredicto={plantilla.veredicto} />}
              </div>
              {plantilla.ensena}
            </div>
          )}

          <PanelIndicadoresTipo proyecto={proyecto} />

          <DetalleEntregaPasoAPaso proyecto={proyecto} pasoEntregado={null} />
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-border p-3">
          <span className="text-[11px] text-muted-foreground">
            {user && !esDocente
              ? "Ejemplo de referencia · Puedes crear tu propia copia para editarla"
              : "Ejemplo de referencia · No se guarda"}
          </span>
          {user && !esDocente && (
            <div className="flex items-center gap-2">
              {errorCopia && <span className="text-[11px] text-destructive">{errorCopia}</span>}
              <button
                onClick={usarComoBase}
                disabled={copiando}
                className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                title="Crea una copia tuya de este ejemplo; el original no cambia"
              >
                {copiando ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                Usar como base
              </button>
            </div>
          )}
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
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">{titulo}</div>
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
