import { useEffect, useMemo, useState } from "react";
import { Filter, Newspaper } from "lucide-react";
import { listarEventos } from "@/lib/eventos-supabase";
import type { CategoriaEvento, Evento } from "@/types/evento";

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

const coloresCategoria: Record<CategoriaEvento, string> = {
  macroeconomico: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200",
  laboral: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200",
  sectorial: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200",
  logistico: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200",
  tecnologico: "bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-200",
  climatico: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200",
  financiero: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
  internacional: "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200",
  comercio: "bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-200",
  servicios: "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-200",
  produccion: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200",
  oportunidad: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
};

export default function CatalogoEventos() {
  const [eventos, setEventos] = useState<Evento[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<CategoriaEvento | "todos">("todos");
  const [expandido, setExpandido] = useState<string | null>(null);

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
          ¿Corriste las migraciones 005 y 006 en Supabase?
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
          <h1 className="text-xl font-semibold tracking-tight">Catálogo de eventos</h1>
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
              className="rounded-lg border border-border bg-card p-4 transition hover:border-foreground/40"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Newspaper className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-mono text-muted-foreground">{e.codigo}</span>
                </div>
                <span
                  className={`rounded px-2 py-0.5 text-[10px] font-medium ${
                    coloresCategoria[e.categoria as CategoriaEvento] ?? ""
                  }`}
                >
                  {etiquetasCategoria[e.categoria as CategoriaEvento] ?? e.categoria}
                </span>
              </div>

              <h3 className="mt-2 text-sm font-semibold tracking-tight">{e.titulo}</h3>
              <p className="mt-1 text-xs text-muted-foreground line-clamp-3">{e.descripcion}</p>

              <div className="mt-2 flex items-center gap-3 text-[10px] text-muted-foreground">
                <span>Prob: {(e.probabilidad * 100).toFixed(0)}%</span>
                <span>·</span>
                <span>Desde turno {e.turno_minimo}</span>
                <span>·</span>
                <span>{e.opciones_decision.length} decisiones</span>
              </div>

              <button
                onClick={() => setExpandido(abierto ? null : e.id)}
                className="mt-3 text-xs font-medium text-foreground underline underline-offset-2"
              >
                {abierto ? "Ocultar decisiones" : "Ver opciones de decisión"}
              </button>

              {abierto && (
                <div className="mt-3 space-y-2 border-t border-border pt-3">
                  {e.opciones_decision.map((op) => (
                    <div key={op.letra} className="text-xs">
                      <div className="font-medium">
                        <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-[10px]">
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
      className={`rounded-full px-3 py-1 text-xs transition ${
        activo
          ? "bg-primary text-primary-foreground"
          : "bg-secondary text-foreground hover:bg-secondary/70"
      }`}
    >
      {children}
    </button>
  );
}
