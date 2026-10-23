import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import PanelIndicadoresTipo from "./PanelIndicadoresTipo";
import { PLANTILLAS } from "@/lib/plantillas";

const crear = (clave: string) => PLANTILLAS.find((p) => p.clave === clave)!.crear();

describe("PanelIndicadoresTipo", () => {
  it("dibuja los indicadores de turismo con el hostal", () => {
    const html = renderToStaticMarkup(<PanelIndicadoresTipo proyecto={crear("hostal")} />);
    expect(html).toContain("Indicadores de turismo y hospitalidad");
    expect(html).toContain("Ocupación del año 1");
    expect(html).toContain("Ocupación de equilibrio");
    expect(html).toContain("RevPAR");
  });

  it("no dibuja nada para un tipo sin panel", () => {
    const html = renderToStaticMarkup(<PanelIndicadoresTipo proyecto={crear("colegio")} />);
    expect(html).toBe("");
  });
});
