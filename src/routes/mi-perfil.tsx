import { useState } from "react";
import { CheckCircle2, Loader2, User } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { actualizarMiPerfil } from "@/lib/auth-helpers";

export default function MiPerfil() {
  const perfil = useAuthStore((s) => s.perfil);
  const recargarPerfil = useAuthStore((s) => s.recargarPerfil);

  const [nombre, setNombre] = useState(perfil?.nombre ?? "");
  const [apellido, setApellido] = useState(perfil?.apellido ?? "");
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
        universidad: null,
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
      <div className="rounded-xl border border-border bg-card p-6 sm:p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <User className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight">Mi perfil</h1>
            <p className="text-xs text-muted-foreground">
              Edita tu nombre y datos personales.
            </p>
          </div>
        </div>

        <form onSubmit={guardar} className="space-y-4">
          {/* Email (read-only) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Email
            </label>
            <input
              type="email"
              value={perfil.email}
              disabled
              className="h-11 w-full rounded-lg border border-input bg-secondary/40 px-3.5 text-sm text-muted-foreground"
            />
            <p className="text-[11px] text-muted-foreground">
              El email no se puede cambiar (es el identificador de tu cuenta).
            </p>
          </div>

          {/* Nombre */}
          <div className="space-y-1.5">
            <label htmlFor="nombre" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Nombre
            </label>
            <input
              id="nombre"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ronald"
              className="h-11 w-full rounded-lg border border-input bg-background px-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Apellido */}
          <div className="space-y-1.5">
            <label htmlFor="apellido" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Apellido
            </label>
            <input
              id="apellido"
              type="text"
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              placeholder="Martínez"
              className="h-11 w-full rounded-lg border border-input bg-background px-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Rol (read-only) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Rol del sistema
            </label>
            <div className="flex items-center gap-2 text-sm">
              <span className="rounded-md border border-border bg-secondary px-2.5 py-1 text-xs font-semibold capitalize text-foreground">{perfil.rol}</span>
              {perfil.es_admin && (
                <span className="rounded-md bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground">
                  Admin
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground">
              El rol solo puede cambiarlo un administrador del sistema.
            </p>
          </div>

          {mensaje && (
            <div
              className={
                mensaje.tipo === "ok"
                  ? "flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-3.5 py-2.5 text-xs font-semibold text-primary"
                  : "rounded-lg border border-destructive/60 bg-destructive/10 px-3.5 py-2.5 text-xs font-semibold text-destructive"
              }
            >
              {mensaje.tipo === "ok" && <CheckCircle2 className="h-4 w-4" />}
              {mensaje.texto}
            </div>
          )}

          <button
            type="submit"
            disabled={guardando}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:opacity-50"
          >
            {guardando && <Loader2 className="h-4 w-4 animate-spin" />}
            Guardar cambios
          </button>
        </form>
      </div>
    </div>
  );
}
