import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, Sparkles } from "lucide-react";
import {
  confirmarNombreSemanaE,
  entrarAEventoSemanaE,
  iniciarSesionConGoogle,
} from "@/lib/auth-helpers";
import { nombrePerfilEsProvisional } from "@/lib/perfil";
import { useAuthStore } from "@/stores/auth-store";

/**
 * Ruta `/semanae` — entrada al evento Semana E con Google únicamente.
 *
 * Flujo:
 *  1) Alumno aprieta "Continuar con Google".
 *  2) Vuelve del callback OAuth con sesión activa.
 *  3) useEffect detecta sesión + perfil y dispara `entrarAEventoSemanaE()`.
 *  4) Auto-inscribe al curso Semana E activo y abre su panel aislado.
 */
export default function SemanaEEntrada() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const perfil = useAuthStore((s) => s.perfil);
  const inicializado = useAuthStore((s) => s.inicializado);
  const inicializar = useAuthStore((s) => s.inicializar);
  const recargarPerfil = useAuthStore((s) => s.recargarPerfil);

  const [cargandoGoogle, setCargandoGoogle] = useState(false);
  const [autoInscribiendo, setAutoInscribiendo] = useState(false);
  const [guardandoNombre, setGuardandoNombre] = useState(false);
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [error, setError] = useState<string | null>(null);

  const necesitaConfirmarNombre =
    !!user &&
    !!perfil &&
    (user.user_metadata?.semana_e_nombre_confirmado !== true ||
      nombrePerfilEsProvisional(perfil));

  // Asegurar que el store de auth esté inicializado para detectar sesión
  // existente (ej. al volver del callback de Google).
  useEffect(() => {
    inicializar();
  }, [inicializar]);

  // La primera vez sugerimos el nombre de Google, pero el alumno puede elegir
  // cómo quiere aparecer. Nunca precargamos el viejo "Invitado-xxxxxx".
  useEffect(() => {
    if (!user || !perfil || !necesitaConfirmarNombre) return;
    const metadata = user.user_metadata ?? {};
    const nombreCompleto = String(metadata.name ?? "").trim();
    const nombreGoogle =
      String(metadata.given_name ?? "").trim() || nombreCompleto.split(" ")[0] || "";
    const apellidoGoogle =
      String(metadata.family_name ?? "").trim() ||
      nombreCompleto.split(" ").slice(1).join(" ").trim();

    setNombre(nombrePerfilEsProvisional(perfil) ? nombreGoogle : perfil.nombre.trim());
    setApellido(apellidoGoogle || perfil.apellido?.trim() || "");
  }, [user?.id, perfil?.nombre, perfil?.apellido, necesitaConfirmarNombre]);

  // Si el usuario YA tiene sesión cuando llega a /semanae (volvió del
  // callback de Google, o ya estaba logueado), inscribirlo automáticamente
  // y mandarlo al panel del estudiante.
  useEffect(() => {
    if (!inicializado || !user || !perfil || necesitaConfirmarNombre) return;
    if (autoInscribiendo) return;
    setAutoInscribiendo(true);
    (async () => {
      try {
        await entrarAEventoSemanaE();
        navigate("/estudiante?semanae=1", { replace: true });
      } catch (e) {
        setError(e instanceof Error ? e.message : "No se pudo inscribirte al evento.");
        setAutoInscribiendo(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inicializado, user, perfil, necesitaConfirmarNombre]);

  const entrarConGoogle = async () => {
    setCargandoGoogle(true);
    setError(null);
    try {
      await iniciarSesionConGoogle({ volverA: "/semanae" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo abrir el login de Google.");
      setCargandoGoogle(false);
    }
  };

  const guardarNombreYEntrar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !nombre.trim()) return;
    setGuardandoNombre(true);
    setAutoInscribiendo(true);
    setError(null);
    try {
      await confirmarNombreSemanaE(user.id, { nombre, apellido });
      await recargarPerfil();
      await entrarAEventoSemanaE();
      navigate("/estudiante?semanae=1", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar tu nombre.");
      setAutoInscribiendo(false);
      setGuardandoNombre(false);
    }
  };

  if (inicializado && user && perfil && necesitaConfirmarNombre) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-fuchsia-50 via-violet-50 to-sky-50 p-4 dark:from-fuchsia-950/30 dark:via-violet-950/30 dark:to-sky-950/30">
        <form
          onSubmit={guardarNombreYEntrar}
          className="w-full max-w-md space-y-4 rounded-xl border-2 border-fuchsia-300 bg-card p-6 shadow-lg dark:border-fuchsia-900"
        >
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-violet-500 text-white">
              <Sparkles className="h-6 w-6" />
            </div>
            <h1 className="mt-3 text-xl font-extrabold tracking-tight">¿Cómo te llamas?</h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Este es el nombre que verán tus compañeros en el grupo.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 text-xs font-medium">
              <span>Nombre</span>
              <input
                value={nombre}
                onChange={(event) => setNombre(event.target.value)}
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
                onChange={(event) => setApellido(event.target.value)}
                maxLength={70}
                autoComplete="family-name"
                placeholder="Tu apellido"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </label>
          </div>

          {error && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={guardandoNombre || nombre.trim().length < 2}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
          >
            {guardandoNombre && <Loader2 className="h-4 w-4 animate-spin" />}
            {guardandoNombre ? "Guardando…" : "Guardar y entrar"}
          </button>
        </form>
      </div>
    );
  }

  // Si está en proceso de auto-inscribir vía sesión existente, mostrar loader.
  if (inicializado && user && (autoInscribiendo || perfil)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-fuchsia-50 via-violet-50 to-sky-50 p-4 dark:from-fuchsia-950/30 dark:via-violet-950/30 dark:to-sky-950/30">
        <div className="space-y-3 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-fuchsia-600" />
          <p className="text-sm font-medium">Inscribiéndote al evento…</p>
        </div>
      </div>
    );
  }

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
            Evento de viabilidad de proyectos · sin notas
          </p>
        </div>

        <div className="rounded-md border border-sky-200 bg-sky-50/70 p-3 text-[11px] text-sky-900 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-200">
          <strong>¿Qué vas a hacer acá?</strong>
          <ol className="ml-4 mt-1 list-decimal space-y-0.5">
            <li>Entrás con tu cuenta Google en segundos.</li>
            <li>Te unís o formás un grupo con tus compañeros.</li>
            <li>Arman juntos un proyecto: producto, costos, inversión.</li>
            <li>Ven si el VAN/TIR cierra y simulan 5 años.</li>
            <li>NO hay notas. Hay aprendizaje.</li>
          </ol>
        </div>

        {error && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </div>
        )}

        <button
          onClick={entrarConGoogle}
          disabled={cargandoGoogle}
          className="flex w-full items-center justify-center gap-2 rounded-md border border-border bg-card px-4 py-3 text-sm font-bold transition hover:bg-secondary disabled:opacity-50"
        >
          {cargandoGoogle ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Abriendo Google…
            </>
          ) : (
            <>
              <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continuar con Google
            </>
          )}
        </button>

        <div className="text-center text-[10px] text-muted-foreground">
          ¿Sos docente o estudiante regular?{" "}
          <Link to="/login" className="font-medium text-foreground underline">
            Ingresar normal
          </Link>
        </div>
      </div>
    </div>
  );
}
