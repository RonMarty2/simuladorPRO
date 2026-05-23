import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/auth-store";

export default function ProtectedRoute() {
  const inicializar = useAuthStore((s) => s.inicializar);
  const inicializado = useAuthStore((s) => s.inicializado);
  const user = useAuthStore((s) => s.user);
  const perfil = useAuthStore((s) => s.perfil);
  const location = useLocation();

  useEffect(() => {
    inicializar();
  }, [inicializar]);

  if (!inicializado) {
    return (
      <div className="flex h-screen w-screen items-center justify-center text-sm text-muted-foreground">
        Cargando sesión…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!perfil) {
    return (
      <div className="flex h-screen w-screen items-center justify-center p-6 text-center text-sm text-muted-foreground">
        <div className="max-w-md space-y-2">
          <p>
            Tu cuenta existe pero no encontramos tu perfil. Esto pasa si la migración SQL
            de FASE 1 no se corrió en Supabase.
          </p>
          <p className="text-xs">
            Verificar que las tablas <code>perfiles</code>, <code>cursos</code>,{" "}
            <code>inscripciones</code> existan en el dashboard de Supabase.
          </p>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
