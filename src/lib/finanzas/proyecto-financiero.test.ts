import { describe, expect, it } from "vitest";
import { crearProyectoVacio } from "@/lib/proyecto-factory";
import { calcularVAN } from "@/lib/calculo-financiero";
import { evaluarProyectoFinanciero } from "./api-contract";
import { analizarSensibilidadProyecto } from "./sensibilidad";
import { construirFlujoCajaProyecto } from "./proyecto-financiero";

function proyectoDemo() {
  const proyecto = crearProyectoVacio({
    id: "proy-demo",
    estudiante_id: "est-demo",
    curso_id: "curso-demo",
    nombre: "Cafe universitario",
  });

  proyecto.inversiones.maquinaria.push({
    id: "maq-1",
    descripcion: "Maquina espresso",
    unidadMedida: "unidad",
    cantidad: 1,
    costoUnitario: 30000,
    costoTotal: 30000,
    vidaUtilAnios: 5,
    depreciacionAnual: 6000,
    valorResidual: 0,
  });
  proyecto.capitalTrabajo = 10000;
  proyecto.productos.push({
    id: "prod-1",
    nombre: "Cafe",
    unidadMedida: "taza",
    cantidades: [12000, 13200, 14520, 15972, 17569],
    precios: [12, 12.5, 13, 13.5, 14],
  });
  proyecto.costosDirectos.push({
    id: "cd-1",
    productoId: "prod-1",
    categoria: "insumo",
    descripcion: "Cafe y vaso",
    unidadMedida: "taza",
    cantidadPorUnidad: 1,
    costoUnitario: 4,
  });
  proyecto.costosAdministracion.push({
    id: "ga-1",
    descripcion: "Alquiler",
    unidadMedida: "mes",
    cantidad: 1,
    costoUnitario: 2500,
  });
  proyecto.costosComercializacion.push({
    id: "gc-1",
    descripcion: "Promocion",
    unidadMedida: "mes",
    cantidad: 1,
    costoUnitario: 500,
  });
  proyecto.personal.push({
    id: "per-1",
    puesto: "Barista",
    cantidad: 1,
    sueldoMensual: 2500,
  });
  proyecto.financiamiento = {
    porcentajePropio: 0.6,
    porcentajePrestamo: 0.4,
    tasaInteresAnual: 0.12,
    plazoMeses: 60,
    costoOportunidadAccionista: 0.15,
    prestamoCapitalTrabajo: {
      porcentajePropio: 1,
      porcentajePrestamo: 0,
      tasaInteresAnual: 0.1,
      plazoMeses: 60,
    },
  };

  return proyecto;
}

describe("construirFlujoCajaProyecto", () => {
  it("centraliza el flujo de caja y los indicadores usados por la UI", () => {
    const resultado = construirFlujoCajaProyecto(proyectoDemo());
    expect(resultado.flujoCaja).toHaveLength(6);
    expect(resultado.flujoLibreProyecto).toHaveLength(6);
    expect(resultado.it).toHaveLength(5);
    expect(resultado.iue).toHaveLength(5);
    expect(resultado.ivaNetoPagar).toHaveLength(5);
    expect(resultado.it[0]).toBeGreaterThan(0);
    expect(resultado.impuestos[0]).toBeCloseTo(
      resultado.it[0] + resultado.iue[0],
      2
    );
    expect(resultado.puntoEquilibrio).not.toBeNull();
    expect(resultado.indicadores.van).toBeCloseTo(
      calcularVAN(resultado.flujoCaja, resultado.wacc),
      6
    );
  });

  it("no genera debito fiscal IVA en productos marcados sin IVA", () => {
    const proyecto = proyectoDemo();
    proyecto.productos[0].aplicaIVA = false;

    const resultado = construirFlujoCajaProyecto(proyecto);

    expect(resultado.ingresos[0]).toBeGreaterThan(0);
    expect(resultado.ingresosGravadosIVA[0]).toBe(0);
    expect(resultado.ivaDebitoFiscal[0]).toBe(0);
    expect(resultado.ivaNetoPagar[0]).toBe(0);
  });

  it("no computa credito fiscal IVA en costos/gastos sin factura", () => {
    const proyecto = proyectoDemo();
    proyecto.inversiones.maquinaria[0].creditoFiscalIVA = false;
    proyecto.costosDirectos[0].creditoFiscalIVA = false;
    proyecto.costosAdministracion[0].creditoFiscalIVA = false;
    proyecto.costosComercializacion[0].creditoFiscalIVA = false;

    const resultado = construirFlujoCajaProyecto(proyecto);

    expect(resultado.comprasGravadasIVA[0]).toBe(0);
    expect(resultado.ivaCreditoFiscal[0]).toBe(0);
    expect(resultado.ivaDebitoFiscal[0]).toBeGreaterThan(0);
    expect(resultado.ivaNetoPagar[0]).toBe(resultado.ivaDebitoFiscal[0]);
  });

  it("registra el credito fiscal IVA inicial de inversiones con factura", () => {
    const proyecto = proyectoDemo();
    proyecto.inversiones.maquinaria[0].creditoFiscalIVA = true;

    const resultado = construirFlujoCajaProyecto(proyecto);
    const creditoInicial = 30000 * 0.13;

    expect(resultado.ivaCreditoFiscalInversionInicial).toBe(creditoInicial);
    expect(resultado.flujoCaja[0]).toBeCloseTo(
      -(
        resultado.inversionInicial +
        resultado.capitalTrabajo -
        resultado.montoPrestamo
      ) - creditoInicial,
      2
    );
  });
});

describe("analizarSensibilidadProyecto", () => {
  it("genera base, tres palancas y una combinacion recalibrada", () => {
    const analisis = analizarSensibilidadProyecto(proyectoDemo());
    expect(analisis.base.id).toBe("base");
    expect(analisis.escenarios).toHaveLength(4);
    expect(analisis.escenarios.some((e) => e.tipo === "combinado")).toBe(true);
  });
});

describe("evaluarProyectoFinanciero", () => {
  it("expone un contrato estable para clientes externos", () => {
    const response = evaluarProyectoFinanciero({
      proyecto: proyectoDemo(),
      incluirSensibilidad: true,
    });
    expect(response.version).toBe("2026-06-17");
    expect(response.resultado.flujoCaja).toHaveLength(6);
    expect(response.sensibilidad?.escenarios).toHaveLength(4);
  });
});
