import { useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useProyectoStore } from "@/stores/proyecto-store";
import { guardarProyecto } from "@/lib/proyecto-supabase";
import { Hammer } from "lucide-react";

export default function EmpezarProyecto() {
  const user = useAuthStore((s) => s.user);
  const inicializar = useProyectoStore((s) => s.inicializar);
  const [nombre, setNombre] = useState("");
  const [creando, setCreando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const crear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !nombre.trim()) return;
    setCreando(true);
    setError(null);
    try {
      inicializar(user.id, nombre.trim());
      const proyecto = useProyectoStore.getState().proyecto!;
      await guardarProyecto(proyecto);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al crear el proyecto";
      setError(msg);
    } finally {
      setCreando(false);
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-lg border border-border bg-card p-8 shadow-sm">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Hammer className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-semibold tracking-tight">Nuevo proyecto de inversión</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Construirás tu proyecto paso a paso. Al final lo simularemos 5 años con
          eventos económicos bolivianos reales.
        </p>
      </div>

      <form onSubmit={crear} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="nombre-proyecto" className="text-sm font-medium">
            Nombre del proyecto
          </label>
          <input
            id="nombre-proyecto"
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Cafetería en Cochabamba"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            autoFocus
          />
        </div>

        {error && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={!nombre.trim() || creando}
          className="w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
        >
          {creando ? "Creando…" : "Empezar a construir"}
        </button>
      </form>
    </div>
  );
}
