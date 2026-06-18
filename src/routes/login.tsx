import { useEffect, useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "@/stores/auth-store";
import BotonGoogle from "@/components/auth/BotonGoogle";
import CreditoAutor from "@/components/layout/CreditoAutor";

const esquema = z.object({
  email: z.string().email("Email no válido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

type FormValues = z.infer<typeof esquema>;

export default function Login() {
  const inicializar = useAuthStore((s) => s.inicializar);
  const inicializado = useAuthStore((s) => s.inicializado);
  const user = useAuthStore((s) => s.user);
  const perfil = useAuthStore((s) => s.perfil);
  const login = useAuthStore((s) => s.login);
  const cargando = useAuthStore((s) => s.cargando);
  const location = useLocation();
  const [errorServidor, setErrorServidor] = useState<string | null>(null);

  useEffect(() => {
    inicializar();
  }, [inicializar]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(esquema) });

  const destinoPostLogin = (rol: "docente" | "estudiante") =>
    rol === "docente" ? "/docente" : "/estudiante";

  if (inicializado && user && perfil) {
    const desde = (location.state as { from?: { pathname: string } } | null)?.from?.pathname;
    return <Navigate to={desde ?? destinoPostLogin(perfil.rol)} replace />;
  }

  // Sesión activa pero el perfil todavía no llegó (query a la BD en curso o
  // intermitencia). NO mostrar el form: sería confuso pedirle al usuario que
  // se loguee de nuevo cuando ya está logueado.
  if (inicializado && user && !perfil) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6 text-center">
        <div className="max-w-sm space-y-3">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <h2 className="text-sm font-semibold">Cargando tu perfil…</h2>
          <p className="text-xs text-muted-foreground">
            Ya estás logueado como <strong>{user.email}</strong>. Conectando con tu cuenta.
            Si tarda más de 30 segundos, refrescá la página.
          </p>
        </div>
      </div>
    );
  }

  const onSubmit = async (datos: FormValues) => {
    setErrorServidor(null);
    try {
      await login(datos.email, datos.password);
      // No navegamos imperativamente: dejamos que el <Navigate> declarativo
      // de abajo dispare cuando user+perfil lleguen vía onAuthStateChange.
      // El navigate prematuro tiraba a "/" sin user → ProtectedRoute rebotaba
      // a /login y el form se reseteaba. Quedaba el alumno trabado.
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al iniciar sesión";
      setErrorServidor(traducir(msg));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="flex w-full max-w-sm flex-col">
      <div className="w-full rounded-lg border border-border bg-card p-8 shadow-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 h-10 w-10 rounded-md bg-primary" />
          <h1 className="text-lg font-semibold tracking-tight text-card-foreground">
            Iniciar sesión
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Simulador de Proyectos de Inversión · Bolivia
          </p>
        </div>

        {/* Botón Google primero (opción recomendada) */}
        <BotonGoogle />

        <div className="my-4 flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
          <div className="h-px flex-1 bg-border" />
          o con email
          <div className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>

          {errorServidor && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {errorServidor}
            </div>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
          >
            {cargando ? "Ingresando…" : "Ingresar"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          ¿No tienes cuenta?{" "}
          <Link to="/registro" className="font-medium text-foreground underline">
            Regístrate
          </Link>
        </p>
      </div>

      {/* Escape hatch: si el alumno quedó trabado (sesión vieja corrupta,
          token expirado, etc.) puede limpiar todo y volver a entrar desde 0
          sin tener que abrir la consola del browser. */}
      <details className="mt-4 text-center">
        <summary className="cursor-pointer text-[10px] text-muted-foreground">
          ¿No te deja entrar? Limpiar sesión y reintentar
        </summary>
        <button
          onClick={async () => {
            try {
              localStorage.clear();
              sessionStorage.clear();
              if (window.indexedDB?.databases) {
                const dbs = await window.indexedDB.databases();
                for (const db of dbs) if (db.name) indexedDB.deleteDatabase(db.name);
              }
            } catch {}
            window.location.reload();
          }}
          className="mt-2 rounded-md border border-border bg-card px-3 py-1.5 text-[11px] hover:bg-secondary"
        >
          🧹 Borrar todo lo guardado en este navegador
        </button>
      </details>

      <CreditoAutor />
      </div>
    </div>
  );
}

function traducir(mensaje: string): string {
  const m = mensaje.toLowerCase();
  if (m.includes("invalid login credentials")) return "Email o contraseña incorrectos";
  if (m.includes("email not confirmed"))
    return "Email aún no confirmado. Revisa tu bandeja o desactiva la confirmación en Supabase para pruebas.";
  if (m.includes("network")) return "Error de red — ¿estás conectado?";
  return mensaje;
}
