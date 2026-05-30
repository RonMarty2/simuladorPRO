import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "@/stores/auth-store";
import BotonGoogle from "@/components/auth/BotonGoogle";
import CreditoAutor from "@/components/layout/CreditoAutor";

const esquema = z.object({
  nombre: z.string().min(1, "Requerido"),
  apellido: z.string().min(1, "Requerido"),
  email: z.string().email("Email no válido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
  rol: z.enum(["estudiante", "docente"]),
});

type FormValues = z.infer<typeof esquema>;

export default function Registro() {
  const inicializar = useAuthStore((s) => s.inicializar);
  const inicializado = useAuthStore((s) => s.inicializado);
  const user = useAuthStore((s) => s.user);
  const perfil = useAuthStore((s) => s.perfil);
  const registrar = useAuthStore((s) => s.registrar);
  const cargando = useAuthStore((s) => s.cargando);
  const navigate = useNavigate();
  const [errorServidor, setErrorServidor] = useState<string | null>(null);

  useEffect(() => {
    inicializar();
  }, [inicializar]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(esquema),
    defaultValues: { rol: "estudiante" },
  });

  if (inicializado && user && perfil) {
    return <Navigate to={perfil.rol === "docente" ? "/docente" : "/estudiante"} replace />;
  }

  const onSubmit = async (datos: FormValues) => {
    setErrorServidor(null);
    try {
      await registrar(datos);
      navigate("/", { replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error al registrarse";
      setErrorServidor(traducir(msg));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="flex w-full max-w-md flex-col">
      <div className="w-full rounded-lg border border-border bg-card p-8 shadow-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 h-10 w-10 rounded-md bg-primary" />
          <h1 className="text-lg font-semibold tracking-tight text-card-foreground">
            Crear cuenta
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Simulador de Proyectos de Inversión · Bolivia
          </p>
        </div>

        {/* Botón Google primero (recomendado para estudiantes) */}
        <BotonGoogle texto="Crear cuenta con Google" />

        <div className="my-4 flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
          <div className="h-px flex-1 bg-border" />
          o con email
          <div className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="nombre" className="text-sm font-medium">
                Nombre
              </label>
              <input
                id="nombre"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                {...register("nombre")}
              />
              {errors.nombre && (
                <p className="text-xs text-destructive">{errors.nombre.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <label htmlFor="apellido" className="text-sm font-medium">
                Apellido
              </label>
              <input
                id="apellido"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                {...register("apellido")}
              />
              {errors.apellido && (
                <p className="text-xs text-destructive">{errors.apellido.message}</p>
              )}
            </div>
          </div>

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
              autoComplete="new-password"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>

          {/* El rol del registro público es SIEMPRE 'estudiante' (viene en
              defaultValues). Para crear un docente, un admin lo promueve desde
              el panel /admin. Así un alumno no puede registrarse como docente
              por error y quedar fuera del ranking.
              La UNIVERSIDAD ya no se pide acá: la define el docente al crear
              el curso, así no hay 'ucatec / Ucatec / UCATEC' en la lista. */}

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
            {cargando ? "Creando cuenta…" : "Crear cuenta"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="font-medium text-foreground underline">
            Inicia sesión
          </Link>
        </p>
      </div>
      <CreditoAutor />
      </div>
    </div>
  );
}

function traducir(mensaje: string): string {
  const m = mensaje.toLowerCase();
  if (m.includes("user already registered")) return "Este email ya está registrado";
  if (m.includes("password should be at least"))
    return "La contraseña debe tener al menos 6 caracteres";
  if (m.includes("invalid email")) return "Email no válido";
  if (m.includes("network")) return "Error de red — ¿estás conectado?";
  if (m.includes("database error"))
    return "Error en la base de datos. ¿Corriste la migración SQL de FASE 1?";
  return mensaje;
}
