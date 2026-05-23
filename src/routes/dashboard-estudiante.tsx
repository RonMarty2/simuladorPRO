import { Navigate } from "react-router-dom";
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
      <div className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
        Panel del estudiante (FASE 1 completa). En las siguientes fases podrás:
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Inscribirte a un curso usando el código que te dé tu docente (FASE 8)</li>
          <li>Construir tu proyecto de inversión paso a paso (FASE 4)</li>
          <li>Simular 5 años con eventos económicos bolivianos (FASE 6)</li>
          <li>Recibir retroalimentación pedagógica automática (FASE 7)</li>
        </ul>
      </div>
    </div>
  );
}
