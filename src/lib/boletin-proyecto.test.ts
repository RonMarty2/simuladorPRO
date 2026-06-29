import { describe, expect, it } from "vitest";
import {
  crearProyectoEjemploCafeteriaV2,
  crearProyectoVacio,
} from "@/lib/proyecto-factory";
import { calcularBoletin } from "@/lib/boletin-proyecto";

function ejemplo() {
  return crearProyectoEjemploCafeteriaV2({ estudiante_id: "boletin" });
}

describe("boletín del proyecto", () => {
  it("no muta el proyecto", () => {
    const proyecto = ejemplo();
    const copia = structuredClone(proyecto);
    calcularBoletin(proyecto);
    expect(proyecto).toEqual(copia);
  });

  it("siempre incluye las 5 filas clave", () => {
    const boletin = calcularBoletin(ejemplo());
    const claves = boletin.filas.map((f) => f.clave).sort();
    expect(claves).toEqual(["deuda", "margen", "payback", "tir", "van"]);
  });

  it("el ejemplo viable marca VAN en bien", () => {
    const boletin = calcularBoletin(ejemplo());
    const van = boletin.filas.find((f) => f.clave === "van");
    expect(van?.estado).toBe("bien");
  });

  it("el puntaje cuenta solo filas con dato", () => {
    const boletin = calcularBoletin(ejemplo());
    const conDato = boletin.filas.filter((f) => f.estado !== "sin_dato").length;
    expect(boletin.puntaje.total).toBe(conDato);
    expect(boletin.puntaje.bien).toBeLessThanOrEqual(boletin.puntaje.total);
  });

  it("proyecto vacío marca filas sin_dato sin reventar", () => {
    const vacio = crearProyectoVacio({ estudiante_id: "boletin", nombre: "v" });
    const boletin = calcularBoletin(vacio);
    expect(boletin.filas.some((f) => f.estado === "sin_dato")).toBe(true);
  });
});
