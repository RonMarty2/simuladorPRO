import { describe, expect, it } from "vitest";
import {
  codigoCortoGrupo,
  pasosParaNivelSemanaE,
  versionParaNivelSemanaE,
} from "./semana-e";

describe("niveles Semana E", () => {
  it("reduce el recorrido según el nivel", () => {
    expect(pasosParaNivelSemanaE("basico")).toEqual([1, 2, 3, 5, 9]);
    expect(pasosParaNivelSemanaE("medio")).toEqual([1, 2, 3, 4, 5, 6, 9]);
    expect(pasosParaNivelSemanaE("avanzado")).toHaveLength(9);
  });

  it("reserva el análisis V2 para avanzado", () => {
    expect(versionParaNivelSemanaE("basico")).toBe("v1");
    expect(versionParaNivelSemanaE("medio")).toBe("v1");
    expect(versionParaNivelSemanaE("avanzado")).toBe("v2");
  });

  it("genera un código corto fácil de compartir", () => {
    expect(codigoCortoGrupo("123e4567-e89b-12d3-a456-426614174000")).toBe("123E45");
  });
});

