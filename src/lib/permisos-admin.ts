import type { Perfil } from "@/types/usuario";

export const EMAIL_ADMIN_SEMANA_E = "ronaldmartinezjimenes@gmail.com";

/** Semana E escondida del panel docente (el panel Admin sigue pudiendo gestionarla). */
export const SEMANA_E_OCULTA = true;

export function puedeAdministrarSemanaE(
  perfil?: Pick<Perfil, "email" | "es_admin"> | null
): boolean {
  return (
    perfil?.es_admin === true &&
    perfil.email.trim().toLowerCase() === EMAIL_ADMIN_SEMANA_E
  );
}
