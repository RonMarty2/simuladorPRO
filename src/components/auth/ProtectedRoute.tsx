import { useEffect } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth-store";

export default function ProtectedRoute() {
  const inicializar = useAuthStore((s) => s.inicializar);
  const inicializado = useAuthStore((s) => s.inicializado);
  const user = useAuthStore((s) => s.user);
  const perfil = useAuthStore((s) => s.perfil);
  const logout = useAuthStore((s) => s.logout);
  const recargarPerfil = useAuthStore((s) => s.recargarPerfil);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    inicializar();
  }, [inicializar]);

  // Auto-retry en background: si tenemos user pero no perfil, reintentar
  // cada 4 segundos. Soluciona los casos de cuelgue temporal de la query.
  useEffect(() => {
    if (inicializado && user && !perfil) {
      const id = setInterval(() => {
        recargarPerfil();
      }, 4000);
      return () => clearInterval(id);
    }
  }, [inicializado, user, perfil, recargarPerfil]);

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
      <div className="flex h-screen w-screen items-center justify-center bg-background p-6">
        <div className="max-w-md space-y-4 rounded-lg border border-border bg-card p-6 text-center shadow-sm">
          <div className="text-3xl">🤔</div>
          <h2 className="text-base font-semibold text-foreground">
            No pudimos cargar tu perfil
          </h2>
          <p className="text-xs text-muted-foreground">
            La sesión está activa ({user.email}) pero la query a la base de datos no
            devolvió tu perfil. Suele ser un problema temporal de conexión.
          </p>

          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={async () => {
                await recargarPerfil();
                window.location.reload();
              }}
              className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              🔄 Reintentar carga del perfil
            </button>
            <button
              onClick={async () => {
                // Logout server-side
                await logout().catch(() => {});
                // Limpieza completa del cliente: localStorage, sessionStorage e IndexedDB
                // (Supabase persiste tokens en varios lugares)
                try {
                  localStorage.clear();
                  sessionStorage.clear();
                  if (window.indexedDB?.databases) {
                    const dbs = await window.indexedDB.databases();
                    for (const db of dbs) {
                      if (db.name) indexedDB.deleteDatabase(db.name);
                    }
                  }
                } catch {}
                navigate("/login", { replace: true });
                setTimeout(() => window.location.reload(), 200);
              }}
              className="rounded-md border border-border px-3 py-2 text-sm text-foreground hover:bg-secondary"
            >
              🚪 Cerrar sesión y volver a entrar (limpieza total)
            </button>
          </div>

          <details className="pt-2 text-left">
            <summary className="cursor-pointer text-[10px] text-muted-foreground">
              Ver detalles técnicos
            </summary>
            <p className="mt-2 text-[10px] text-muted-foreground">
              Si el reintento no funciona, podría faltar la migración SQL de FASE 1 en
              Supabase, o las tablas <code>perfiles/cursos/inscripciones</code> no existen.
            </p>
          </details>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
