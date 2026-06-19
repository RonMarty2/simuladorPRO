import { describe, expect, it } from "vitest";
import { crearProyectoEjemploCafeteriaV2 } from "@/lib/proyecto-factory";
import {
  construirModeloPitch,
  crearPresentacionPredeterminada,
  obtenerPresentacionProyecto,
} from "@/lib/presentacion-proyecto";

function ejemplo() {
  return crearProyectoEjemploCafeteriaV2({ estudiante_id: "usuario-prueba" });
}

describe("modo presentación", () => {
  it("genera textos iniciales claros usando los datos del proyecto", () => {
    const proyecto = ejemplo();
    const presentacion = crearPresentacionPredeterminada(proyecto);

    expect(presentacion.titulo).toBe(proyecto.nombre);
    expect(presentacion.subtitulo.length).toBeGreaterThan(5);
    expect(presentacion.problema.length).toBeGreaterThan(10);
    expect(presentacion.propuestaValor.length).toBeGreaterThan(10);
    expect(presentacion.conclusion.length).toBeGreaterThan(10);
  });

  it("respeta los textos editados por el equipo", () => {
    const proyecto = ejemplo();
    proyecto.presentacion = {
      ...crearPresentacionPredeterminada(proyecto),
      titulo: "Mi título personalizado",
      expositores: "Ana, Luis y Marco",
    };

    const presentacion = obtenerPresentacionProyecto(proyecto);
    expect(presentacion.titulo).toBe("Mi título personalizado");
    expect(presentacion.expositores).toBe("Ana, Luis y Marco");
  });

  it("reduce el guion para Semana E básica", () => {
    const proyecto = ejemplo();
    proyecto.nivelSemanaE = "basico";
    proyecto.esSemanaE = true;

    const modelo = construirModeloPitch(proyecto);
    expect(modelo.nivel).toBe("basico");
    expect(modelo.diapositivas.map((d) => d.id)).not.toContain("operacion");
    expect(modelo.diapositivas.map((d) => d.id)).not.toContain("financiamiento");
    expect(modelo.diapositivas.map((d) => d.id)).not.toContain("riesgo");
  });

  it("incluye operación y riesgo en nivel medio", () => {
    const proyecto = ejemplo();
    proyecto.nivelSemanaE = "medio";

    const ids = construirModeloPitch(proyecto).diapositivas.map((d) => d.id);
    expect(ids).toContain("operacion");
    expect(ids).toContain("riesgo");
    expect(ids).not.toContain("financiamiento");
  });

  it("incluye financiamiento en avanzado y produce series de cinco años", () => {
    const proyecto = ejemplo();
    proyecto.nivelSemanaE = "avanzado";

    const modelo = construirModeloPitch(proyecto);
    expect(modelo.diapositivas.map((d) => d.id)).toContain("financiamiento");
    expect(modelo.mercado).toHaveLength(5);
    expect(modelo.operacion).toHaveLength(5);
    expect(modelo.flujo).toHaveLength(6);
    expect(modelo.riesgo.length).toBeGreaterThanOrEqual(4);
  });
});
