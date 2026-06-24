import type { Perfil } from "@/types/usuario";

export const EMAIL_ADMIN_SEMANA_E = "ronaldmartinezjimenes@gmail.com";

export function puedeAdministrarSemanaE(
  perfil?: Pick<Perfil, "email" | "es_admin"> | null
): boolean {
  return (
    perfil?.es_admin === true &&
    perfil.email.trim().toLowerCase() === EMAIL_ADMIN_SEMANA_E
  );
}
