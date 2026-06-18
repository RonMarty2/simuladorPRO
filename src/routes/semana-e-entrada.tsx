import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertTriangle, Loader2, Sparkles } from "lucide-react";
import { entrarAEventoSemanaE, iniciarSesionConGoogle } from "@/lib/auth-helpers";
import { useAuthStore } from "@/stores/auth-store";

/**
 * Ruta `/semanae` — entrada al evento Semana E.
 *
 * Dos caminos:
 *  1) GOOGLE (recomendado): persistente, podés cerrar sesión, volver al día
 *     siguiente o entrar desde otro dispositivo y seguir donde quedaste.
 *  2) INVITADO: 1 click, sin cuenta. Si cerrás el navegador o borrás cache,
 *     PERDÉS el acceso al trabajo (la data queda en BD pero sin forma de
 *     identificarte de vuelta).
 *
 * En los dos casos al final llamamos `entrarAEventoSemanaE()` que detecta la
 * sesión existente y auto-inscribe al curso Semana E activo.
 */
export default function SemanaEEntrada() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const perfil = useAuthStore((s) => s.perfil);
  const inicializado = useAuthStore((s) => s.inicializado);
  const inicializar = useAuthStore((s) => s.inicializar);
  const recargarPerfil = useAuthStore((s) => s.recargarPerfil);

  const [nombre, setNombre] = useState("");
  const [cargandoAnon, setCargandoAnon] = useState(false);
  const [cargandoGoogle, setCargandoGoogle] = useState(false);
  const [autoInscribiendo, setAutoInscribiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Asegurar que el store de auth esté inicializado para detectar sesión
  // existente (ej. al volver del callback de Google).
  useEffect(() => {
    inicializar();
  }, [inicializar]);

  // Si el usuario YA tiene sesión cuando llega a /semanae (volvió del
  // callback de Google, o ya estaba logueado), inscribirlo automáticamente
  // y mandarlo al panel del estudiante. Esto cubre el flujo Google end-to-end.
  useEffect(() => {
    if (!inicializado || !user || !perfil) return;
    if (autoInscribiendo) return;
    setAutoInscribiendo(true);
    (async () => {
      try {
        await entrarAEventoSemanaE();
        navigate("/estudiante", { replace: true });
      } catch (e) {
        setError(e instanceof Error ? e.message : "No se pudo inscribirte al evento.");
        setAutoInscribiendo(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inicializado, user, perfil]);

  // Bonus: ?auto=1 entra como invitado sin tocar nada (útil para QR de pared).
  useEffect(() => {
    if (!inicializado || user) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("auto") === "1") entrarComoInvitado();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inicializado, user]);

  const entrarConGoogle = async () => {
    setCargandoGoogle(true);
    setError(null);
    try {
      // Vuelve a /semanae después del callback → useEffect de arriba dispara
      // entrarAEventoSemanaE() automáticamente porque ya hay sesión.
      await iniciarSesionConGoogle({ volverA: "/semanae" });
      // signInWithOAuth redirige el browser, no hace falta nada más acá.
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo abrir el login de Google.");
      setCargandoGoogle(false);
    }
  };

  const entrarComoInvitado = async () => {
    setCargandoAnon(true);
    setError(null);
    try {
      await entrarAEventoSemanaE({ nombreVisible: nombre.trim() || undefined });
      await recargarPerfil().catch(() => {});
      navigate("/estudiante", { replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo entrar al evento.");
    } finally {
      setCargandoAnon(false);
    }
  };

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
            <li>Entrás en segundos.</li>
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

        {/* Camino RECOMENDADO: Google */}
        <button
          onClick={entrarConGoogle}
          disabled={cargandoGoogle || cargandoAnon}
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
              Continuar con Google (recomendado)
            </>
          )}
        </button>
        <p className="-mt-3 text-center text-[10px] text-muted-foreground">
          Persistente. Podés cerrar y volver cuando quieras desde cualquier dispositivo.
        </p>

        <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
          <div className="h-px flex-1 bg-border" />
          o si preferís
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Camino SECUNDARIO: anónimo */}
        <div className="space-y-2 rounded-md border border-dashed border-border bg-card/50 p-3">
          <div className="text-xs font-medium">Entrar como invitado</div>
          <div className="flex items-start gap-1.5 text-[10px] text-amber-800 dark:text-amber-200">
            <AlertTriangle className="mt-0.5 h-3 w-3 flex-shrink-0" />
            <span>
              Si cerrás el navegador o borrás cache, <strong>perdés el acceso</strong> a este
              trabajo. Usá Google si querés retomar después o cambiar de dispositivo.
            </span>
          </div>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Cómo te llamás (opcional)"
            maxLength={50}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            onClick={entrarComoInvitado}
            disabled={cargandoAnon || cargandoGoogle}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-secondary px-3 py-2 text-xs font-medium hover:bg-secondary/70 disabled:opacity-50"
          >
            {cargandoAnon ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                Entrando…
              </>
            ) : (
              "Entrar como invitado"
            )}
          </button>
        </div>

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
