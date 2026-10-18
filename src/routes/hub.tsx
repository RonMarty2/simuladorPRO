import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth-store";

export default function Hub() {
  const perfil = useAuthStore((s) => s.perfil);
  const user = useAuthStore((s) => s.user);
  const inicializado = useAuthStore((s) => s.inicializado);
  if (!inicializado) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!perfil) return null;
  return <Navigate to={perfil.rol === "docente" ? "/docente" : "/estudiante"} replace />;
}
