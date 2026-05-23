import { Link, Navigate } from "react-router-dom";
import { Hammer } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";

export default function DashboardEstudiante() {
  const perfil = useAuthStore((s) => s.perfil);
  if (perfil && perfil.rol !== "estudiante") return <Navigate to="/docente" replace />;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">
          Hola, {perfil?.nombre} 👋
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Rol: <span className="font-medium text-foreground capitalize">{perfil?.rol}</span>
          {perfil?.universidad && (
            <>
              {" · "}
              <span>{perfil.universidad}</span>
            </>
          )}
        </p>
      </div>

      <Link
        to="/construir"
        className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 transition hover:border-foreground"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Hammer className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium">Construir mi proyecto</div>
          <div className="text-xs text-muted-foreground">
            10 pasos guiados con cálculos en vivo. Auto-guardado.
          </div>
        </div>
        <div className="text-xs text-muted-foreground">→</div>
      </Link>
    </div>
  );
}
