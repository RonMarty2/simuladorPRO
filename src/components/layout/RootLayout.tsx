import { NavLink, Outlet } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Hammer, PlayCircle, BookOpenCheck, GraduationCap } from "lucide-react";

const enlaces = [
  { to: "/estudiante", label: "Mi panel", icon: LayoutDashboard },
  { to: "/construir", label: "Construir proyecto", icon: Hammer },
  { to: "/simular", label: "Simular", icon: PlayCircle },
  { to: "/evaluacion", label: "Evaluación", icon: BookOpenCheck },
  { to: "/docente", label: "Panel docente", icon: GraduationCap },
];

export default function RootLayout() {
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
        <div className="text-xs text-muted-foreground">FASE 0 · Setup inicial</div>
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
