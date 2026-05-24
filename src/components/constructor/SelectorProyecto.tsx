import { useState } from "react";
import { ChevronDown, FolderOpen, Loader2, Plus, X } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useProyectoStore } from "@/stores/proyecto-store";
import { guardarProyecto } from "@/lib/proyecto-supabase";
import type { Proyecto } from "@/types/proyecto";
import { cn } from "@/lib/utils";

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

  const [abierto, setAbierto] = useState(false);
  const [creando, setCreando] = useState(false);

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
      p.tipo === "entrega_estudiante"
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

      {/* Botón crear nuevo */}
      <button
        type="button"
        onClick={() => setCreando(true)}
        className="flex items-center gap-1 rounded-md border border-primary/40 bg-primary/5 px-2.5 py-1.5 text-xs font-medium text-primary hover:bg-primary/10"
      >
        <Plus className="h-3 w-3" />
        Nuevo proyecto
      </button>

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
                Aún no tenés proyectos. Crea uno con el botón "+ Nuevo proyecto".
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
          onCerrar={(creado) => {
            setCreando(false);
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
  onCerrar,
}: {
  userId: string;
  onCerrar: (proyectoIdCreado: string | null) => void;
}) {
  const inicializar = useProyectoStore((s) => s.inicializar);
  const [nombre, setNombre] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const crear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    setGuardando(true);
    setError(null);
    try {
      inicializar(userId, nombre.trim());
      const p = useProyectoStore.getState().proyecto;
      if (!p) throw new Error("No se pudo inicializar el proyecto");
      await guardarProyecto(p);
      onCerrar(p.id);
    } catch (e: any) {
      setError(e?.message ?? String(e));
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-card p-5 shadow-xl">
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
              placeholder="Ej: Heladería, Restaurante, Taller mecánico…"
              autoFocus
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="rounded-md bg-secondary/50 p-2 text-[11px] text-muted-foreground">
            💡 Tus proyectos anteriores se conservan. Vas a poder cambiar entre
            ellos desde el selector de arriba.
          </div>

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
