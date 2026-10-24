import { describe, expect, it } from "vitest";
import { eventoCompatibleConTipo, TIPOS_POR_EVENTO_GENERAL } from "./eventos-por-rubro";
import { GUIA_POR_TIPO } from "./guia-por-tipo";

describe("eventoCompatibleConTipo", () => {
  it("un gimnasio (suscripción) no recibe gripe aviar, línea vegana ni contenedores", () => {
    for (const codigo of ["EVT017", "EVT027", "EVT028", "EVT036", "EVT038"]) {
      expect(eventoCompatibleConTipo(codigo, "suscripcion")).toBe(false);
    }
  });

  it("una cafetería sí los recibe", () => {
    for (const codigo of ["EVT017", "EVT027", "EVT028", "EVT036", "EVT038"]) {
      expect(eventoCompatibleConTipo(codigo, "gastronomia")).toBe(true);
    }
  });

  it("sin tipo de negocio todo evento aplica (proyectos viejos)", () => {
    expect(eventoCompatibleConTipo("EVT017", undefined)).toBe(true);
    expect(eventoCompatibleConTipo("EVT017", null)).toBe(true);
  });

  it("un evento que no figura en la tabla aplica a cualquier tipo", () => {
    expect(eventoCompatibleConTipo("EVT001", "microcredito")).toBe(true);
  });

  it("la tabla solo nombra tipos que existen", () => {
    const tipos = Object.keys(GUIA_POR_TIPO);
    for (const lista of Object.values(TIPOS_POR_EVENTO_GENERAL)) {
      for (const t of lista) expect(tipos).toContain(t);
    }
  });
});
