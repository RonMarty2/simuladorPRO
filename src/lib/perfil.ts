import type { Perfil } from "@/types/usuario";

/** Detecta los nombres de respaldo que no fueron elegidos por el usuario. */
export function nombrePerfilEsProvisional(
  perfil: Pick<Perfil, "nombre" | "email"> | null
): boolean {
  if (!perfil) return true;
  const nombre = perfil.nombre?.trim() ?? "";
  if (!nombre) return true;

  const normalizado = nombre.toLocaleLowerCase("es");
  const usuarioEmail = perfil.email?.split("@")[0]?.toLocaleLowerCase("es") ?? "";
  return (
    normalizado === "sin nombre" ||
    normalizado.startsWith("invitado-") ||
    (!!usuarioEmail && normalizado === usuarioEmail)
  );
}

