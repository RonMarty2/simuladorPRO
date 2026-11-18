import { describe, expect, it } from "vitest";
import { crearProyectoEjemploCafeteriaV2 } from "./proyecto-factory";
import { construirEstadosFinancieros } from "./estados-financieros";

describe("construirEstadosFinancieros", () => {
  it("cumple la partida doble (Activo = Pasivo + Patrimonio) en el Balance de Apertura y en los 5 años proyectados", () => {
    const proyecto = crearProyectoEjemploCafeteriaV2({ estudiante_id: "test-ef" });
    const ef = construirEstadosFinancieros(proyecto);

    expect(ef.balances).toHaveLength(6);
    for (const bal of ef.balances) {
      expect(bal.cuadra).toBe(true);
      expect(bal.diferenciaCuadre).toBeLessThan(0.01);
      expect(bal.totalActivo).toBeCloseTo(bal.totalPasivoYPatrimonio, 2);
      expect(bal.totalActivo).toBeCloseTo(
        bal.totalActivoCorriente + bal.totalActivoNoCorriente,
        2
      );
      expect(bal.totalPasivo).toBeCloseTo(
        bal.totalPasivoCorriente + bal.totalPasivoNoCorriente,
        2
      );
    }
  });

  it("construye la cascada contable del Estado de Resultados (Ventas -> UB -> EBITDA -> EBIT -> EBT -> UN)", () => {
    const proyecto = crearProyectoEjemploCafeteriaV2({ estudiante_id: "test-ef" });
    const ef = construirEstadosFinancieros(proyecto);

    expect(ef.estadoResultados).toHaveLength(5);
    for (const er of ef.estadoResultados) {
      expect(er.utilidadBruta).toBeCloseTo(er.ingresos - er.costoVentas, 2);
      expect(er.ebitda).toBeCloseTo(er.utilidadBruta - er.totalGastosOperativos, 2);
      expect(er.ebit).toBeCloseTo(er.ebitda - er.depreciacion, 2);
      expect(er.ebt).toBeCloseTo(er.ebit - er.intereses, 2);
      expect(er.utilidadNeta).toBeCloseTo(er.ebt - er.iue, 2);
    }
  });

  it("verifica la identidad DuPont de 3 factores en todos los años", () => {
    const proyecto = crearProyectoEjemploCafeteriaV2({ estudiante_id: "test-ef" });
    const ef = construirEstadosFinancieros(proyecto);

    expect(ef.dupontPorAnio).toHaveLength(5);
    for (const dp of ef.dupontPorAnio) {
      const producto = dp.margenNeto * dp.rotacionActivos * dp.multiplicadorCapital;
      expect(producto).toBeCloseTo(dp.roe, 6);
    }
  });
});
