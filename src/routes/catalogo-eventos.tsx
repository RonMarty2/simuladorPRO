import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { Filter, Newspaper } from "lucide-react";
import { listarEventos } from "@/lib/eventos-supabase";
import type { CategoriaEvento, Evento } from "@/types/evento";
import { useAuthStore } from "@/stores/auth-store";

const etiquetasCategoria: Record<CategoriaEvento, string> = {
  macroeconomico: "Macroeconómico",
  laboral: "Laboral / tributario",
  sectorial: "Sectorial",
  logistico: "Logístico",
  tecnologico: "Tecnológico / social",
  climatico: "Climático",
  financiero: "Financiero",
  internacional: "Internacional",
  comercio: "Comercio",
  servicios: "Servicios",
  produccion: "Producción",
  oportunidad: "Oportunidad",
};

export default function CatalogoEventos() {
  const perfil = useAuthStore((s) => s.perfil);
  const [eventos, setEventos] = useState<Evento[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<CategoriaEvento | "todos">("todos");
  const [expandido, setExpandido] = useState<string | null>(null);

  // Defensa contra estudiantes que intenten entrar por URL directa.
  // El catálogo son spoilers de la simulación — solo docentes y admin.
  if (perfil && perfil.rol === "estudiante" && !perfil.es_admin) {
    return <Navigate to="/estudiante" replace />;
  }

  useEffect(() => {
    listarEventos()
      .then(setEventos)
      .catch((e) => setError(e instanceof Error ? e.message : "Error"));
  }, []);

  const filtrados = useMemo(() => {
    if (!eventos) return [];
    if (filtro === "todos") return eventos;
    return eventos.filter((e) => e.categoria === filtro);
  }, [eventos, filtro]);

  const conteoPorCategoria = useMemo(() => {
    if (!eventos) return {} as Record<string, number>;
    return eventos.reduce(
      (acc, e) => {
        acc[e.categoria] = (acc[e.categoria] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
  }, [eventos]);

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
        Error al cargar eventos: {error}
        <p className="mt-2 text-xs">
          No fue posible sincronizar el catálogo de contingencias de mercado. Reintenta la conexión o contacta a soporte.
        </p>
      </div>
    );
  }

  if (!eventos) {
    return (
      <div className="text-sm text-muted-foreground">Cargando catálogo de eventos…</div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Catálogo de eventos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Los <strong>{eventos.length} eventos</strong> económicos bolivianos que el motor de
            simulación inyectará turno a turno en cada proyecto.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card p-3">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">Filtrar por categoría:</span>
        <FiltroPill activo={filtro === "todos"} onClick={() => setFiltro("todos")}>
          Todos ({eventos.length})
        </FiltroPill>
        {(Object.keys(etiquetasCategoria) as CategoriaEvento[]).map((cat) => {
          const cantidad = conteoPorCategoria[cat] ?? 0;
          if (cantidad === 0) return null;
          return (
            <FiltroPill key={cat} activo={filtro === cat} onClick={() => setFiltro(cat)}>
              {etiquetasCategoria[cat]} ({cantidad})
            </FiltroPill>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {filtrados.map((e) => {
          const abierto = expandido === e.id;
          return (
            <div
              key={e.id}
              className="rounded-xl border border-border bg-card p-5 shadow-sm transition hover:border-primary/50 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Newspaper className="h-4 w-4 text-primary" />
                  <span className="font-mono text-xs font-semibold text-muted-foreground">{e.codigo}</span>
                </div>
                <span
                  className="rounded-md border border-border bg-secondary/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
                >
                  {etiquetasCategoria[e.categoria as CategoriaEvento] ?? e.categoria}
                </span>
              </div>

              <h3 className="mt-2.5 font-display text-base font-bold text-foreground">{e.titulo}</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground line-clamp-3">{e.descripcion}</p>

              <div className="mt-3 flex items-center gap-3 text-[11px] text-muted-foreground font-medium">
                <span>Prob: {(e.probabilidad * 100).toFixed(0)}%</span>
                <span>·</span>
                <span>Desde turno {e.turno_minimo}</span>
                <span>·</span>
                <span>{e.opciones_decision.length} decisiones</span>
              </div>

              <button
                onClick={() => setExpandido(abierto ? null : e.id)}
                className="mt-3 text-xs font-semibold text-primary underline underline-offset-4 hover:opacity-80"
              >
                {abierto ? "Ocultar decisiones" : "Ver opciones de decisión"}
              </button>

              {abierto && (
                <div className="mt-3 space-y-2 border-t border-border pt-3">
                  {e.opciones_decision.map((op) => (
                    <div key={op.letra} className="text-xs">
                      <div className="font-medium">
                        <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[11px]">
                          {op.letra}
                        </span>
                        {op.texto}
                      </div>
                      <div className="ml-7 mt-0.5 text-muted-foreground italic">
                        → {op.feedback_corto}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FiltroPill({
  activo,
  onClick,
  children,
}: {
  activo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex min-h-[38px] items-center justify-center rounded-lg px-3.5 py-1.5 text-xs font-medium transition ${
        activo
          ? "bg-primary text-primary-foreground shadow-2xs font-semibold"
          : "bg-secondary text-foreground hover:bg-secondary/70 border border-border/50"
      }`}
    >
      {children}
    </button>
  );
}
