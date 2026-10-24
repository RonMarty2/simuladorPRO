import { describe, expect, it } from "vitest";
import {
  eventoCompatibleConTipo,
  TIPOS_EXCLUIDOS_POR_EVENTO,
  TIPOS_POR_EVENTO_GENERAL,
} from "./eventos-por-rubro";
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

  it("una cooperativa de microcrédito no recibe el cliente grande que pide plazo ni el bono escolar", () => {
    for (const codigo of ["EVT035", "EVT006", "EVT024", "EVT043", "EVT045"]) {
      expect(eventoCompatibleConTipo(codigo, "microcredito")).toBe(false);
    }
  });

  it("una distribuidora sí recibe el cliente grande que pide plazo", () => {
    expect(eventoCompatibleConTipo("EVT035", "comercio")).toBe(true);
  });

  it("la tabla solo nombra tipos que existen", () => {
    const tipos = Object.keys(GUIA_POR_TIPO);
    const listas = [
      ...Object.values(TIPOS_POR_EVENTO_GENERAL),
      ...Object.values(TIPOS_EXCLUIDOS_POR_EVENTO),
    ];
    for (const lista of listas) {
      for (const t of lista) expect(tipos).toContain(t);
    }
  });

});
