import { describe, expect, it } from "vitest";
import { datosFaltantes } from "./datos-faltantes";
import { crearProyectoEjemploPanaderiaV2, crearProyectoVacio } from "./proyecto-factory";

describe("datosFaltantes", () => {
  it("un proyecto de ejemplo completo no tiene faltantes", () => {
    expect(datosFaltantes(crearProyectoEjemploPanaderiaV2({ estudiante_id: "u" }))).toEqual([]);
  });
  it("un proyecto vacio lista los pasos sin datos", () => {
    const p = crearProyectoVacio({ estudiante_id: "u", nombre: "x" } as any);
    const pasos = datosFaltantes(p).map((d) => d.paso);
    expect(pasos).toEqual(expect.arrayContaining([3, 4, 5, 6]));
  });
});
