import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  BookOpenCheck,
  GraduationCap,
  Hammer,
  LayoutDashboard,
  LogOut,
  Newspaper,
  PlayCircle,
  ShieldCheck,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";

const enlacesEstudiante = [
  { to: "/estudiante", label: "Mi panel", icon: LayoutDashboard },
  { to: "/construir", label: "Construir proyecto", icon: Hammer },
  { to: "/simular", label: "Simular", icon: PlayCircle },
  { to: "/mis-entregas", label: "Mis entregas", icon: BookOpenCheck },
  { to: "/evaluacion", label: "Evaluación", icon: BookOpenCheck },
  { to: "/eventos", label: "Catálogo eventos", icon: Newspaper },
];

const enlacesDocente = [
  { to: "/docente", label: "Panel docente", icon: GraduationCap },
  { to: "/construir", label: "Construir proyecto", icon: Hammer },
  { to: "/eventos", label: "Catálogo eventos", icon: Newspaper },
];

export default function RootLayout() {
  const perfil = useAuthStore((s) => s.perfil);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const enlacesBase = perfil?.rol === "docente" ? enlacesDocente : enlacesEstudiante;
  const enlaces = perfil?.es_admin
    ? [...enlacesBase, { to: "/admin", label: "Admin", icon: ShieldCheck }]
    : enlacesBase;

  const cerrar = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex h-screen w-screen flex-col bg-background text-foreground">
      <header className="flex h-14 items-center justify-between border-b border-border px-6">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded bg-primary" />
          <span className="text-sm font-semibold tracking-tight">
            Simulador de Proyectos de Inversión
          </span>
          <span className="ml-2 rounded bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
            Bolivia
          </span>
        </div>
        <div className="flex items-center gap-4">
          {perfil && (
            <div className="text-right text-xs">
              <div className="font-medium text-foreground">
                {perfil.nombre} {perfil.apellido}
              </div>
              <div className="text-muted-foreground capitalize">{perfil.rol}</div>
            </div>
          )}
          <button
            onClick={cerrar}
            className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs text-foreground transition hover:bg-accent"
          >
            <LogOut className="h-3.5 w-3.5" />
            Salir
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-56 shrink-0 border-r border-border bg-secondary/30 p-3">
          <nav className="flex flex-col gap-1">
            {enlaces.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground/80 hover:bg-accent hover:text-accent-foreground"
                  )
                }
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
