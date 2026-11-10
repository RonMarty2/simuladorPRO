import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth-store";

export default function Hub() {
  const perfil = useAuthStore((s) => s.perfil);
  const user = useAuthStore((s) => s.user);
  const inicializado = useAuthStore((s) => s.inicializado);
  if (!inicializado) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        Cargando simulador…
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (!perfil) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-muted-foreground">
        Cargando perfil…
      </div>
    );
  }
  return <Navigate to={perfil.rol === "docente" ? "/docente" : "/estudiante"} replace />;
}
