import { useState } from "react";
import { CheckCircle2, Loader2, User } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { actualizarMiPerfil } from "@/lib/auth-helpers";
import { normalizarUniversidad } from "@/lib/utils";

export default function MiPerfil() {
  const perfil = useAuthStore((s) => s.perfil);
  const recargarPerfil = useAuthStore((s) => s.recargarPerfil);

  const [nombre, setNombre] = useState(perfil?.nombre ?? "");
  const [apellido, setApellido] = useState(perfil?.apellido ?? "");
  const [universidad, setUniversidad] = useState(perfil?.universidad ?? "");
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: "ok" | "err"; texto: string } | null>(null);

  if (!perfil) {
    return <div className="text-sm text-muted-foreground">Cargando perfil…</div>;
  }

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setMensaje(null);
    try {
      await actualizarMiPerfil(perfil.id, {
        nombre: nombre.trim() || "Sin nombre",
        apellido: apellido.trim(),
        universidad: normalizarUniversidad(universidad),
      });
      await recargarPerfil();
      setMensaje({ tipo: "ok", texto: "Perfil actualizado correctamente." });
    } catch (e: any) {
      setMensaje({ tipo: "err", texto: e?.message ?? "Error al guardar." });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <User className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-semibold">Mi perfil</h1>
            <p className="text-xs text-muted-foreground">
              Edita tu nombre y datos personales.
            </p>
          </div>
        </div>

        <form onSubmit={guardar} className="space-y-3">
          {/* Email (read-only) */}
          <div className="space-y-1">
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Email
            </label>
            <input
              type="email"
              value={perfil.email}
              disabled
              className="w-full rounded-md border border-input bg-secondary/30 px-3 py-2 text-sm text-muted-foreground"
            />
            <p className="text-[10px] text-muted-foreground">
              El email no se puede cambiar (es el identificador de tu cuenta).
            </p>
          </div>

          {/* Nombre */}
          <div className="space-y-1">
            <label htmlFor="nombre" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Nombre
            </label>
            <input
              id="nombre"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ronald"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Apellido */}
          <div className="space-y-1">
            <label htmlFor="apellido" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Apellido
            </label>
            <input
              id="apellido"
              type="text"
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              placeholder="Martínez"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Universidad */}
          <div className="space-y-1">
            <label htmlFor="universidad" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Universidad (opcional)
            </label>
            <input
              id="universidad"
              type="text"
              value={universidad}
              onChange={(e) => setUniversidad(e.target.value)}
              placeholder="UMSS, UPB, etc."
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Rol (read-only) */}
          <div className="space-y-1">
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Rol del sistema
            </label>
            <div className="flex items-center gap-2 text-sm">
              <span className="rounded-md bg-secondary px-2 py-1 capitalize">{perfil.rol}</span>
              {perfil.es_admin && (
                <span className="rounded-md bg-primary px-2 py-1 text-xs font-bold text-primary-foreground">
                  🛡️ Admin
                </span>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground">
              El rol solo puede cambiarlo un administrador del sistema.
            </p>
          </div>

          {mensaje && (
            <div
              className={
                mensaje.tipo === "ok"
                  ? "flex items-center gap-2 rounded-md border border-emerald-400 bg-emerald-50 px-3 py-2 text-xs text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100"
                  : "rounded-md border border-destructive/60 bg-destructive/10 px-3 py-2 text-xs text-destructive"
              }
            >
              {mensaje.tipo === "ok" && <CheckCircle2 className="h-3.5 w-3.5" />}
              {mensaje.texto}
            </div>
          )}

          <button
            type="submit"
            disabled={guardando}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {guardando && <Loader2 className="h-3 w-3 animate-spin" />}
            Guardar cambios
          </button>
        </form>
      </div>
    </div>
  );
}
