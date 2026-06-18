import { useEffect, useState, type FormEvent } from "react";
import { Loader2, UserRound } from "lucide-react";
import { confirmarNombreSemanaE } from "@/lib/auth-helpers";
import { nombrePerfilEsProvisional } from "@/lib/perfil";
import { useAuthStore } from "@/stores/auth-store";

/** Bloquea la app hasta reemplazar nombres históricos como Invitado-a1b2c3. */
export default function CompletarNombreInicial({ activo }: { activo: boolean }) {
  const user = useAuthStore((s) => s.user);
  const perfil = useAuthStore((s) => s.perfil);
  const recargarPerfil = useAuthStore((s) => s.recargarPerfil);
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debeCompletar = activo && !!user && !!perfil && nombrePerfilEsProvisional(perfil);

  useEffect(() => {
    if (!user || !perfil || !debeCompletar) return;
    const metadata = user.user_metadata ?? {};
    const nombreCompleto = String(metadata.name ?? "").trim();
    setNombre(
      String(metadata.given_name ?? "").trim() || nombreCompleto.split(" ")[0] || ""
    );
    setApellido(
      String(metadata.family_name ?? "").trim() ||
        nombreCompleto.split(" ").slice(1).join(" ").trim() ||
        perfil.apellido?.trim() ||
        ""
    );
  }, [user?.id, perfil?.nombre, perfil?.apellido, debeCompletar]);

  if (!debeCompletar || !user) return null;

  const guardar = async (event: FormEvent) => {
    event.preventDefault();
    if (nombre.trim().length < 2) return;
    setGuardando(true);
    setError(null);
    try {
      await confirmarNombreSemanaE(user.id, { nombre, apellido });
      await recargarPerfil();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar tu nombre.");
      setGuardando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <form onSubmit={guardar} className="w-full max-w-md space-y-4 rounded-xl border bg-card p-6 shadow-2xl">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <UserRound className="h-6 w-6" />
          </div>
          <h2 className="mt-3 text-xl font-bold">Elige cómo quieres aparecer</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Reemplazaremos el nombre provisional “Invitado” para que tus compañeros te reconozcan.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1 text-xs font-medium">
            <span>Nombre</span>
            <input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              maxLength={50}
              autoFocus
              autoComplete="given-name"
              placeholder="Tu nombre"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
          <label className="space-y-1 text-xs font-medium">
            <span>Apellido <span className="font-normal text-muted-foreground">(opcional)</span></span>
            <input
              value={apellido}
              onChange={(e) => setApellido(e.target.value)}
              maxLength={70}
              autoComplete="family-name"
              placeholder="Tu apellido"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
        </div>

        {error && <div className="text-xs text-destructive">{error}</div>}

        <button
          type="submit"
          disabled={guardando || nombre.trim().length < 2}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          {guardando && <Loader2 className="h-4 w-4 animate-spin" />}
          {guardando ? "Guardando…" : "Guardar nombre"}
        </button>
      </form>
    </div>
  );
}
