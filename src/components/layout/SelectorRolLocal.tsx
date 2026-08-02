import { useNavigate } from "react-router-dom";
import { GraduationCap, User } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { esModoLocal } from "@/lib/modo-local";
import { cn } from "@/lib/utils";
import type { Rol } from "@/types/usuario";

/**
 * Selector de rol flotante — SOLO visible en modo local (sin Supabase).
 * Permite alternar entre docente y estudiante en cualquier momento sin salir
 * ni volver a loguear. Al cambiar, manda al panel del rol elegido.
 *
 * En producción (con Supabase) no se renderiza nunca.
 */
export default function SelectorRolLocal() {
  const perfil = useAuthStore((s) => s.perfil);
  const cambiarRolLocal = useAuthStore((s) => s.cambiarRolLocal);
  const navigate = useNavigate();

  if (!esModoLocal() || !perfil) return null;

  const cambiar = (rol: Rol) => {
    if (rol === perfil.rol) return;
    cambiarRolLocal(rol);
    navigate(rol === "docente" ? "/docente" : "/estudiante", { replace: true });
  };

  const opciones: { rol: Rol; label: string; icon: typeof User }[] = [
    { rol: "estudiante", label: "Estudiante", icon: User },
    { rol: "docente", label: "Docente", icon: GraduationCap },
  ];

  return (
    <div className="fixed bottom-3 right-3 z-[60] flex flex-col items-end gap-1">
      <div className="rounded-md bg-amber-500/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow">
        Modo local
      </div>
      <div className="flex overflow-hidden rounded-full border border-border bg-card shadow-lg">
        {opciones.map(({ rol, label, icon: Icon }) => {
          const activo = perfil.rol === rol;
          return (
            <button
              key={rol}
              onClick={() => cambiar(rol)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors",
                activo
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground/70 hover:bg-accent"
              )}
              aria-pressed={activo}
              title={`Entrar como ${label.toLowerCase()}`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
