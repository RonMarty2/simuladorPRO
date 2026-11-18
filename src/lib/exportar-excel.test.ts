import { describe, expect, it } from "vitest";
import { crearProyectoEjemploCafeteriaV2 } from "@/lib/proyecto-factory";
import { crearPresentacionPredeterminada } from "@/lib/presentacion-proyecto";
import { crearLibroProyectoExcel } from "@/lib/exportar-excel";

describe("Excel global del proyecto", () => {
  it("genera la presentación ejecutiva y todas las etapas financieras", () => {
    const proyecto = crearProyectoEjemploCafeteriaV2({ estudiante_id: "prueba" });
    proyecto.presentacion = {
      ...crearPresentacionPredeterminada(proyecto),
      expositores: "Equipo de prueba",
    };

    const libro = crearLibroProyectoExcel(proyecto);

    expect(libro.SheetNames).toContain("Presentación ejecutiva");
    expect(libro.SheetNames).toContain("Portada");
    expect(libro.SheetNames).toContain("8. Flujo de caja");
    expect(libro.SheetNames).toContain("9. Indicadores");
    expect(libro.SheetNames).toContain("10. Interpretación");
    expect(libro.SheetNames.length).toBeGreaterThanOrEqual(11);

    const presentacion = libro.Sheets["Presentación ejecutiva"];
    expect(presentacion?.B5?.v).toBe("Equipo de prueba");
    expect(presentacion?.A16?.v).toBe("Punto de equilibrio (unidades)");
    expect(Number(presentacion?.B16?.v)).toBeGreaterThan(0);

    const flujo = libro.Sheets["8. Flujo de caja"];
    expect(flujo?.A15?.v).toBe("(-) IT 3% sobre ingresos brutos");
    expect(flujo?.A22?.v).toBe("(-) IVA pagado en inversión con factura (recuperable)");
    expect(flujo?.A29?.v).toBe("(-) IVA neto a pagar (débito - crédito disponible)");
    expect(flujo?.A33?.v).toBe("5 · FLUJO DE CAJA NETO");
    expect(flujo?.C33?.f).toContain("-C29+");
  });
});
