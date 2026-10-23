import { describe, it, expect } from "vitest";
import { etiquetaSectorEvento } from "./lanzador-eventos";

describe("etiquetaSectorEvento", () => {
  it("muestra el nombre de la categoría para tokens de tipo", () => {
    expect(etiquetaSectorEvento("tipo:turismo")).toBe("Tipo: Turismo y hospitalidad");
  });
  it("deja igual los sectores normales", () => {
    expect(etiquetaSectorEvento("agricultura")).toBe("agricultura");
  });
  it("si la categoría no existe, muestra el código", () => {
    expect(etiquetaSectorEvento("tipo:inexistente")).toBe("Tipo: inexistente");
  });
});
