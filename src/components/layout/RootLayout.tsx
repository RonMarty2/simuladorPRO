import { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  BookOpenCheck,
  ChartScatter,
  GraduationCap,
  Hammer,
  BookOpen,
  LayoutDashboard,
  LogOut,
  Menu,
  Newspaper,
  PlayCircle,
  ShieldCheck,
  X,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import CreditoAutor from "@/components/layout/CreditoAutor";
import BadgeRevisionesNuevas from "@/components/layout/BadgeRevisionesNuevas";
import BotonInstalarApp from "@/components/layout/BotonInstalarApp";
import { useEsDispositivoMobil } from "@/hooks/useEsDispositivoMobil";

const enlacesEstudiante = [
  { to: "/estudiante", label: "Mi panel", icon: LayoutDashboard },
  // "Construir proyecto" se quitó del menú: el estudiante entra al constructor
  // haciendo clic en un proyecto de su panel (evita la redundancia).
  { to: "/simular", label: "Simular", icon: PlayCircle },
  { to: "/escenarios", label: "Escenarios", icon: ChartScatter },
  { to: "/mis-entregas", label: "Mis entregas", icon: BookOpenCheck },
  { to: "/ejemplos", label: "Ejemplos", icon: BookOpen },
  { to: "/evaluacion", label: "Evaluación", icon: BookOpenCheck },
  // El catálogo de eventos NO se muestra a estudiantes — son spoilers de la
  // simulación. Solo docentes y admin lo ven.
];

// Semana E es una experiencia aislada y sin calificaciones ni entregas.
// Conservamos Ejemplos porque forma parte de la ayuda para armar el proyecto.
const enlacesEstudianteSemanaE = [
  { to: "/estudiante?semanae=1", label: "Mi panel", icon: LayoutDashboard },
  { to: "/ejemplos?semanae=1", label: "Ejemplos", icon: BookOpen },
];

const enlacesDocente = [
  { to: "/docente", label: "Panel docente", icon: GraduationCap },
  { to: "/construir", label: "Construir proyecto", icon: Hammer },
  { to: "/escenarios", label: "Escenarios", icon: ChartScatter },
  { to: "/ejemplos", label: "Ejemplos", icon: BookOpen },
  { to: "/eventos", label: "Catálogo eventos", icon: Newspaper },
];

export default function RootLayout() {
  const perfil = useAuthStore((s) => s.perfil);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const location = useLocation();
  const [menuAbierto, setMenuAbierto] = useState(false);
  // Detección robusta de dispositivo móvil. Sobrescribe cualquier hack del
  // navegador (ej. "Sitio para escritorio") para forzar el layout mobile.
  const esMobil = useEsDispositivoMobil();

  const modoSemanaE =
    perfil?.rol === "estudiante" &&
    new URLSearchParams(location.search).get("semanae") === "1";
  const enlacesBase =
    perfil?.rol === "docente"
      ? enlacesDocente
      : modoSemanaE
        ? enlacesEstudianteSemanaE
        : enlacesEstudiante;
  const enlaces = perfil?.es_admin
    ? [...enlacesBase, { to: "/admin", label: "Admin", icon: ShieldCheck }]
    : enlacesBase;

  const cerrar = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  const navItems = (onClick?: () => void) =>
    enlaces.map(({ to, label, icon: Icon }) => (
      <NavLink
        key={to}
        to={to}
        onClick={onClick}
        className={({ isActive }) =>
          cn(
            "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
            isActive
              ? "bg-primary text-primary-foreground"
              : "text-foreground/80 hover:bg-accent hover:text-accent-foreground"
          )
        }
      >
        <Icon className="h-4 w-4 flex-shrink-0" />
        <span>{label}</span>
      </NavLink>
    ));

  return (
    <div className="flex h-screen w-screen flex-col bg-background text-foreground">
      <header className="flex h-14 items-center justify-between gap-2 border-b border-border px-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-2">
          {/* Botón menú hamburguesa — siempre visible en mobile (sobrescribe
              cualquier hack del browser tipo "Sitio para escritorio") */}
          <button
            onClick={() => setMenuAbierto(true)}
            className={cn(
              "-ml-1 rounded-md p-1.5 text-foreground hover:bg-accent",
              esMobil ? "" : "md:hidden"
            )}
            aria-label="Abrir menú"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="h-6 w-6 flex-shrink-0 rounded bg-primary" />
          <span className="truncate text-sm font-semibold tracking-tight">
            Simulador de Proyectos de Inversión
          </span>
          <span className="hidden flex-shrink-0 rounded bg-secondary px-2 py-0.5 text-xs text-muted-foreground sm:inline">
            Bolivia
          </span>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2 sm:gap-4">
          <BadgeRevisionesNuevas />
          {perfil && (
            <button
              onClick={() => navigate("/perfil")}
              className="hidden rounded-md px-2 py-1 text-right text-xs transition hover:bg-accent sm:block"
              title="Editar mi perfil"
            >
              <div className="font-medium text-foreground">
                {perfil.nombre} {perfil.apellido}
              </div>
              <div className="capitalize text-muted-foreground">
                {perfil.rol}
                {perfil.es_admin && " · 🛡️"}
              </div>
            </button>
          )}
          <button
            onClick={cerrar}
            className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs text-foreground transition hover:bg-accent"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Barra lateral — solo escritorio. Si detectamos dispositivo móvil
            (UA, screen estrecho o PWA standalone con touch) NUNCA se muestra
            aunque el viewport reporte ancho de desktop. */}
        {!esMobil && (
          <aside className="hidden w-56 shrink-0 flex-col border-r border-border bg-secondary/30 p-3 md:flex">
            <nav className="flex flex-col gap-1">{navItems()}</nav>
            <div className="mt-auto pt-4">
              <CreditoAutor variante="sutil" />
            </div>
          </aside>
        )}

        {/* Menú deslizable — móvil. md:hidden solo aplica si NO forzamos mobile;
            si esMobil=true queremos que el menú aparezca siempre que el alumno
            lo abra, aunque el viewport reporte ancho de escritorio. */}
        {menuAbierto && (
          <div className={cn("fixed inset-0 z-50", esMobil ? "" : "md:hidden")}>
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setMenuAbierto(false)}
            />
            <aside className="absolute left-0 top-0 flex h-full w-64 flex-col border-r border-border bg-background p-3 shadow-xl">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold">Menú</span>
                <button
                  onClick={() => setMenuAbierto(false)}
                  className="rounded-md p-1.5 hover:bg-accent"
                  aria-label="Cerrar menú"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex flex-col gap-1">
                {navItems(() => setMenuAbierto(false))}
                {perfil && (
                  <button
                    onClick={() => {
                      setMenuAbierto(false);
                      navigate("/perfil");
                    }}
                    className="mt-1 flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-foreground/80 hover:bg-accent"
                  >
                    <span className="h-4 w-4 flex-shrink-0 text-center">👤</span>
                    <span>Mi perfil</span>
                  </button>
                )}
              </nav>
              <div className="mt-auto pt-4">
                <CreditoAutor variante="sutil" />
              </div>
            </aside>
          </div>
        )}

        <main className="flex-1 overflow-auto p-3 sm:p-6">
          <Outlet />
        </main>
      </div>

      {/* Banner flotante "Instalá la app" — solo aparece si el navegador
          permite instalar la PWA y el usuario aún no la instaló ni la
          cerró en esta sesión. */}
      <BotonInstalarApp />
    </div>
  );
}
