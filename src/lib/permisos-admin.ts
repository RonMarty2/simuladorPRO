import type { Perfil } from "@/types/usuario";

export const EMAIL_ADMIN_SEMANA_E = "ronaldmartinezjimenes@gmail.com";

/** Semana E escondida de la UI docente/admin (la funcionalidad se conserva). */
export const SEMANA_E_OCULTA = true;

export function puedeAdministrarSemanaE(
  perfil?: Pick<Perfil, "email" | "es_admin"> | null
): boolean {
  if (SEMANA_E_OCULTA) return false;
  return (
    perfil?.es_admin === true &&
    perfil.email.trim().toLowerCase() === EMAIL_ADMIN_SEMANA_E
  );
}
