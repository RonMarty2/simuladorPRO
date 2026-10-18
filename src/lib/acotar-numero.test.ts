import { describe, expect, it } from "vitest";
import { acotarNumero } from "./acotar-numero";

describe("acotarNumero", () => {
  it("deja pasar valores normales", () => {
    expect(acotarNumero(12.5)).toBe(12.5);
  });
  it("no finito => 0", () => {
    expect(acotarNumero(Infinity)).toBe(0);
    expect(acotarNumero(NaN)).toBe(0);
  });
  it("aplica el tope absoluto", () => {
    expect(acotarNumero(1e308)).toBe(1e12);
    expect(acotarNumero(-1e308)).toBe(-1e12);
  });
  it("respeta min y max", () => {
    expect(acotarNumero(-500, -100, 1000)).toBe(-100);
    expect(acotarNumero(5000, -100, 1000)).toBe(1000);
    expect(acotarNumero(-3, 0)).toBe(0);
    expect(acotarNumero(-3, "0")).toBe(0);
  });
});

import { tirCalculable } from "./acotar-numero";

describe("tirCalculable", () => {
  it("0 exacto, NaN y null no son calculables", () => {
    expect(tirCalculable(0)).toBe(false);
    expect(tirCalculable(NaN)).toBe(false);
    expect(tirCalculable(null)).toBe(false);
  });
  it("un valor real si", () => {
    expect(tirCalculable(0.18)).toBe(true);
    expect(tirCalculable(-0.35)).toBe(true);
  });
});
