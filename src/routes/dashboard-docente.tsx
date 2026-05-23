import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth-store";

export default function DashboardDocente() {
  const perfil = useAuthStore((s) => s.perfil);
  if (perfil && perfil.rol !== "docente") return <Navigate to="/estudiante" replace />;

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
        Panel del docente (FASE 1 completa). En las siguientes fases podrás:
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Crear cursos con código único (FASE 8)</li>
          <li>Ver ranking en tiempo real de tus estudiantes</li>
          <li>Inyectar eventos globales a todo el curso</li>
          <li>Configurar rúbrica de evaluación</li>
          <li>Exportar notas a Excel</li>
        </ul>
      </div>
    </div>
  );
}
