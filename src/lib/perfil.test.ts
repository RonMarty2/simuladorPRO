import { describe, expect, it } from "vitest";
import { nombrePerfilEsProvisional } from "./perfil";

describe("nombrePerfilEsProvisional", () => {
  it.each([
    "",
    "Sin nombre",
    "Invitado-6666db",
    "invitado-ABC123",
    "estudiante.demo",
  ])("detecta el nombre provisional %j", (nombre) => {
    expect(
      nombrePerfilEsProvisional({ nombre, email: "estudiante.demo@example.com" })
    ).toBe(true);
  });

  it("conserva un nombre elegido por el estudiante", () => {
    expect(
      nombrePerfilEsProvisional({ nombre: "María", email: "maria@example.com" })
    ).toBe(false);
  });
});

