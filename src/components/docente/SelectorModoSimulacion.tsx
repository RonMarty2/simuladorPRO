import { useEffect, useState } from "react";
import { Check, ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import { listarEventos } from "@/lib/eventos-supabase";
import type { Evento } from "@/types/evento";
import type { ModoSimulacion } from "@/lib/cursos-supabase";
import { cn } from "@/lib/utils";

interface Props {
  modo: ModoSimulacion;
  eventosCurados: string[];
  onCambiar: (modo: ModoSimulacion, eventosCurados: string[]) => void;
}

const MODOS: Array<{ valor: ModoSimulacion; titulo: string; desc: string; icon: string }> = [
  {
    valor: "automatico",
    titulo: "Automático",
    desc: "El sistema sortea eventos al azar según probabilidad real. El estudiante avanza solo. Bueno para tareas.",
    icon: "🎲",
  },
  {
    valor: "docente_dispara",
    titulo: "Docente dispara cada evento",
    desc: "Vos lanzás los eventos manualmente desde tu panel cuando lo decidas. Ideal para clase presencial sincronizada.",
    icon: "🎯",
  },
  {
    valor: "curado",
    titulo: "Eventos curados por el docente",
    desc: "Vos elegís de los 50 eventos cuáles enfrentarán tus estudiantes. Ideal para examen con intención pedagógica clara.",
    icon: "📋",
  },
];

export default function SelectorModoSimulacion({ modo, eventosCurados, onCambiar }: Props) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Modo de simulación
      </label>

      <div className="space-y-1.5">
        {MODOS.map((m) => {
          const seleccionado = modo === m.valor;
          return (
            <button
              key={m.valor}
              type="button"
              onClick={() => onCambiar(m.valor, eventosCurados)}
              className={cn(
                "flex w-full items-start gap-2 rounded-md border-2 p-2.5 text-left transition",
                seleccionado
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-primary/40"
              )}
            >
              <div className="text-lg">{m.icon}</div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold">{m.titulo}</div>
                <div className="text-[11px] text-muted-foreground">{m.desc}</div>
              </div>
              {seleccionado && (
                <Check className="h-4 w-4 flex-shrink-0 text-primary" />
              )}
            </button>
          );
        })}
      </div>

      {modo === "curado" && (
        <SelectorEventosCurados
          seleccionados={eventosCurados}
          onCambiar={(ids) => onCambiar("curado", ids)}
        />
      )}
    </div>
  );
}

function SelectorEventosCurados({
  seleccionados,
  onCambiar,
}: {
  seleccionados: string[];
  onCambiar: (ids: string[]) => void;
}) {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [cargando, setCargando] = useState(true);
  const [abierto, setAbierto] = useState(true);
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todas");

  useEffect(() => {
    listarEventos()
      .then(setEventos)
      .catch(() => {})
      .finally(() => setCargando(false));
  }, []);

  const categorias = Array.from(new Set(eventos.map((e) => e.categoria)));
  const eventosFiltrados =
    filtroCategoria === "todas"
      ? eventos
      : eventos.filter((e) => e.categoria === filtroCategoria);

  const toggle = (id: string) => {
    if (seleccionados.includes(id)) {
      onCambiar(seleccionados.filter((x) => x !== id));
    } else {
      onCambiar([...seleccionados, id]);
    }
  };

  return (
    <div className="rounded-md border-2 border-primary/40 bg-primary/5 p-2">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        className="flex w-full items-center justify-between text-xs font-semibold"
      >
        <span>
          📋 Eventos seleccionados:{" "}
          <span className="text-primary">{seleccionados.length}</span>
        </span>
        {abierto ? (
          <ChevronDown className="h-3.5 w-3.5" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5" />
        )}
      </button>

      {abierto && (
        <div className="mt-2 space-y-2">
          {/* Filtro de categoría */}
          {!cargando && eventos.length > 0 && (
            <div className="flex flex-wrap gap-1 text-[10px]">
              <button
                type="button"
                onClick={() => setFiltroCategoria("todas")}
                className={cn(
                  "rounded px-2 py-0.5",
                  filtroCategoria === "todas"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary hover:bg-secondary/70"
                )}
              >
                Todas ({eventos.length})
              </button>
              {categorias.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setFiltroCategoria(c)}
                  className={cn(
                    "rounded px-2 py-0.5 capitalize",
                    filtroCategoria === c
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary hover:bg-secondary/70"
                  )}
                >
                  {c} ({eventos.filter((e) => e.categoria === c).length})
                </button>
              ))}
            </div>
          )}

          {/* Lista de eventos */}
          {cargando ? (
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              Cargando eventos del catálogo…
            </div>
          ) : eventosFiltrados.length === 0 ? (
            <div className="text-[11px] text-muted-foreground italic">
              No hay eventos en esta categoría.
            </div>
          ) : (
            <div className="max-h-64 space-y-1 overflow-y-auto rounded border border-border bg-card p-1">
              {eventosFiltrados.map((e) => {
                const sel = seleccionados.includes(e.id);
                return (
                  <button
                    key={e.id}
                    type="button"
                    onClick={() => toggle(e.id)}
                    className={cn(
                      "flex w-full items-start gap-2 rounded p-1.5 text-left text-[11px] transition",
                      sel ? "bg-primary/10" : "hover:bg-secondary/50"
                    )}
                  >
                    <div
                      className={cn(
                        "mt-0.5 flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center rounded border",
                        sel
                          ? "border-primary bg-primary"
                          : "border-border"
                      )}
                    >
                      {sel && <Check className="h-2.5 w-2.5 text-primary-foreground" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium">
                        <span className="font-mono opacity-60">{e.codigo}</span>{" "}
                        {e.titulo}
                      </div>
                      <div className="text-[10px] text-muted-foreground line-clamp-2">
                        {e.descripcion}
                      </div>
                      <div className="mt-0.5 text-[9px] uppercase tracking-wide text-muted-foreground">
                        {e.categoria} · prob. {(e.probabilidad * 100).toFixed(0)}% · desde turno {e.turno_minimo}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          <div className="rounded bg-background px-2 py-1 text-[10px] text-muted-foreground">
            💡 Tip: los eventos seleccionados se aplicarán <strong>en orden</strong> a lo
            largo de los turnos del curso. Si eliges más eventos que turnos, los últimos
            se omiten.
          </div>
        </div>
      )}
    </div>
  );
}
