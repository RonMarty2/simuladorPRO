import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth-store";

export default function Hub() {
  const perfil = useAuthStore((s) => s.perfil);
  if (!perfil) return null;
  return <Navigate to={perfil.rol === "docente" ? "/docente" : "/estudiante"} replace />;
}
