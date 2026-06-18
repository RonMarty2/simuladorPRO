import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, Sparkles } from "lucide-react";
import { entrarAEventoSemanaE } from "@/lib/auth-helpers";
import { useAuthStore } from "@/stores/auth-store";

/**
 * Ruta `/semanae` — entrada pública al evento Semana E. Sin login. Sin código.
 * Apretás el botón gigante, te creamos un usuario anónimo en el toque y te
 * inscribimos al curso Semana E activo. Después caés en /estudiante con el
 * banner del evento listo para usar.
 */
export default function SemanaEEntrada() {
  const navigate = useNavigate();
  const recargarPerfil = useAuthStore((s) => s.recargarPerfil);
  const [nombre, setNombre] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Bonus: si llaman a /semanae con ?auto=1, entran sin tocar nada (útil para
  // QR pegados en una pared).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("auto") === "1") {
      entrar();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const entrar = async () => {
    setCargando(true);
    setError(null);
    try {
      await entrarAEventoSemanaE({
        nombreVisible: nombre.trim() || undefined,
      });
      await recargarPerfil().catch(() => {});
      navigate("/estudiante", { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo entrar al evento.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-fuchsia-50 via-violet-50 to-sky-50 p-4 dark:from-fuchsia-950/30 dark:via-violet-950/30 dark:to-sky-950/30">
      <div className="w-full max-w-md space-y-5 rounded-xl border-2 border-fuchsia-300 bg-card p-6 shadow-lg dark:border-fuchsia-900">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-violet-500 text-white">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="mt-3 text-xl font-extrabold tracking-tight">
            🎓 Bienvenido a Semana E
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Evento de viabilidad de proyectos · sin cuenta · sin código
          </p>
        </div>

        <div className="rounded-md border border-sky-200 bg-sky-50/70 p-3 text-[11px] text-sky-900 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-200">
          <strong>¿Qué vas a hacer acá?</strong>
          <ol className="ml-4 mt-1 list-decimal space-y-0.5">
            <li>Te creamos un invitado en segundos.</li>
            <li>Te unís o formás un grupo con tus compañeros.</li>
            <li>Arman juntos un proyecto: producto, costos, inversión.</li>
            <li>Ven si el VAN/TIR cierra y simulan 5 años.</li>
            <li>NO hay notas. Hay aprendizaje.</li>
          </ol>
        </div>

        <div>
          <label className="text-xs font-medium">
            Cómo te llamás (opcional, para tus compañeros)
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Juana Pérez"
              maxLength={50}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
          <p className="mt-1 text-[10px] text-muted-foreground">
            Si lo dejás en blanco te llamamos "Invitado-XXXXXX". Lo podés cambiar después
            desde el perfil.
          </p>
        </div>

        {error && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </div>
        )}

        <button
          onClick={entrar}
          disabled={cargando}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-gradient-to-r from-fuchsia-600 to-violet-600 px-4 py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {cargando ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Entrando…
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Entrar al evento
            </>
          )}
        </button>

        <div className="text-center text-[10px] text-muted-foreground">
          ¿Tenés cuenta de docente o estudiante regular?{" "}
          <Link to="/login" className="font-medium text-foreground underline">
            Ingresar normal
          </Link>
        </div>
      </div>
    </div>
  );
}
