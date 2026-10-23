import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import Paso9Resumen from "./Paso9Resumen";
import { PLANTILLAS } from "@/lib/plantillas";
import { indicadoresPorTipo } from "@/lib/indicadores-por-tipo";

// Al renderizar en servidor el almacén devuelve su estado inicial (vacío); se
// reemplaza por uno que entrega el proyecto de la prueba.
vi.mock("@/stores/proyecto-store", () => {
  const estado = () => ({ proyecto: (globalThis as any).__proyectoPrueba });
  const useProyectoStore: any = (selector: (s: any) => unknown) => selector(estado());
  useProyectoStore.getState = estado;
  return { useProyectoStore };
});

// Simula el último paso del constructor tal como lo ve un estudiante que usó un
// ejemplo de la galería como base: el panel de su tipo debe estar en la pantalla.
describe("Paso 9 del constructor con cada ejemplo de la galería", () => {
  for (const pl of PLANTILLAS) {
    it(`${pl.clave}: muestra el panel de su tipo y no tiene NaN`, () => {
      const proyecto = pl.crear();
      (globalThis as any).__proyectoPrueba = proyecto;
      const html = renderToStaticMarkup(<Paso9Resumen />);
      const panel = indicadoresPorTipo(proyecto);
      expect(panel, pl.clave).not.toBeNull();
      expect(html).toContain(panel!.titulo);
      expect(html).not.toMatch(/NaN|Infinity/);
    });
  }
});
