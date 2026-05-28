/**
 * Exportación del proyecto a Excel (.xlsx) con estilos académicos:
 *  - Hojas separadas por etapa, con título de portada, encabezados de columna
 *    y formato de moneda Bs / porcentaje.
 *  - "Flujo de caja" usa fórmulas Excel reales (=MAX, =SUMA implícita) en las
 *    filas de Utilidad antes de impuestos, Impuestos, Utilidad neta y Flujo
 *    neto, así si el alumno cambia un valor de entrada el resto se recalcula.
 *  - "Indicadores" usa =NPV y =IRR referenciando el flujo neto.
 *  - Una hoja final con interpretación de cada indicador para anexo de tesis.
 *
 * Usa xlsx-js-style (fork de SheetJS con soporte de estilos) para que el .xlsx
 * salga con colores, negritas y bordes, no como un volcado plano.
 */
import * as XLSX from "xlsx-js-style";
import { construirFlujoCaja } from "./flujo-proyecto";
import { calcularAportesPatronales, obtenerTasasAportes, TASA_IUE } from "./calculo-financiero";
import type { Proyecto } from "@/types/proyecto";

const FECHA_HOY = () => new Date().toLocaleDateString("es-BO");
const ANIOS = ["Año 0", "Año 1", "Año 2", "Año 3", "Año 4", "Año 5"];
const SH_FLUJO = "8. Flujo de caja";

// ────────────────────────────────────────────────────────────────────────────
// Paleta y presets de estilo
// ────────────────────────────────────────────────────────────────────────────

const C = {
  textoOscuro: "1E293B", // slate-800
  textoClaro: "FFFFFF",
  fondoTitulo: "0F172A", // slate-900
  fondoSeccion: "0EA5E9", // sky-500
  fondoSeccionAlt: "059669", // emerald-600
  fondoHeader: "E2E8F0", // slate-200
  fondoTotal: "F1F5F9", // slate-100
  bordeSuave: "CBD5E1", // slate-300
  bordeFuerte: "475569", // slate-600
};

const bordeSuave = { style: "thin", color: { rgb: C.bordeSuave } };
const bordeFuerte = { style: "medium", color: { rgb: C.bordeFuerte } };
const todosBordes = { top: bordeSuave, bottom: bordeSuave, left: bordeSuave, right: bordeSuave };

const ST = {
  // Título grande (fila 1 de cada hoja)
  titulo: {
    font: { bold: true, sz: 14, color: { rgb: C.textoClaro } },
    fill: { fgColor: { rgb: C.fondoTitulo } },
    alignment: { horizontal: "left", vertical: "center" },
  } as any,
  subtitulo: {
    font: { italic: true, sz: 10, color: { rgb: "64748B" } },
    alignment: { horizontal: "left" },
  } as any,
  // Encabezado de sección (fila ⓘ INGRESOS, etc.)
  seccion: {
    font: { bold: true, sz: 11, color: { rgb: C.textoClaro } },
    fill: { fgColor: { rgb: C.fondoSeccion } },
    alignment: { horizontal: "left" },
  } as any,
  seccionAlt: {
    font: { bold: true, sz: 11, color: { rgb: C.textoClaro } },
    fill: { fgColor: { rgb: C.fondoSeccionAlt } },
    alignment: { horizontal: "left" },
  } as any,
  // Encabezado de columna (fila de "Concepto | Año 0 | Año 1 ...")
  colHeader: {
    font: { bold: true, sz: 10 },
    fill: { fgColor: { rgb: C.fondoHeader } },
    alignment: { horizontal: "center", wrapText: true },
    border: todosBordes,
  } as any,
  // Etiqueta de fila (primera columna de datos)
  label: {
    font: { sz: 10 },
    alignment: { horizontal: "left" },
    border: todosBordes,
  } as any,
  labelBold: {
    font: { sz: 10, bold: true },
    alignment: { horizontal: "left" },
    border: todosBordes,
  } as any,
  // Celda numérica común
  num: {
    font: { sz: 10 },
    alignment: { horizontal: "right" },
    border: todosBordes,
  } as any,
  // Moneda Bs
  money: {
    font: { sz: 10 },
    alignment: { horizontal: "right" },
    numFmt: '"Bs "#,##0.00;[Red]"-Bs "#,##0.00',
    border: todosBordes,
  } as any,
  moneyBold: {
    font: { sz: 10, bold: true },
    alignment: { horizontal: "right" },
    numFmt: '"Bs "#,##0.00;[Red]"-Bs "#,##0.00',
    border: todosBordes,
  } as any,
  // Porcentaje
  percent: {
    font: { sz: 10 },
    alignment: { horizontal: "right" },
    numFmt: "0.00%",
    border: todosBordes,
  } as any,
  // Fila total / formulada
  totalBg: {
    font: { sz: 10, bold: true },
    alignment: { horizontal: "right" },
    fill: { fgColor: { rgb: C.fondoTotal } },
    numFmt: '"Bs "#,##0.00;[Red]"-Bs "#,##0.00',
    border: { ...todosBordes, top: bordeFuerte },
  } as any,
  totalLabel: {
    font: { sz: 10, bold: true },
    alignment: { horizontal: "left" },
    fill: { fgColor: { rgb: C.fondoTotal } },
    border: { ...todosBordes, top: bordeFuerte },
  } as any,
};

// Constructores de celda — para usar dentro de los AOA
const ti = (v: string) => ({ v, t: "s", s: ST.titulo });
const sub = (v: string) => ({ v, t: "s", s: ST.subtitulo });
const sec = (v: string, alt = false) => ({ v, t: "s", s: alt ? ST.seccionAlt : ST.seccion });
const ch = (v: string) => ({ v, t: "s", s: ST.colHeader });
const lbl = (v: string) => ({ v, t: "s", s: ST.label });
const lblB = (v: string) => ({ v, t: "s", s: ST.labelBold });
const M = (v: number) => ({ v, t: "n", s: ST.money });
const MB = (v: number) => ({ v, t: "n", s: ST.moneyBold });
const P = (v: number) => ({ v, t: "n", s: ST.percent });
const N = (v: number) => ({ v, t: "n", s: ST.num });
const totL = (v: string) => ({ v, t: "s", s: ST.totalLabel });
const totV = (v: number) => ({ v, t: "n", s: ST.totalBg });
const fMoney = (f: string) => ({ f, t: "n", s: ST.money });
const fMoneyBold = (f: string) => ({ f, t: "n", s: ST.moneyBold });
const fPercent = (f: string) => ({ f, t: "n", s: ST.percent });
const fTotal = (f: string) => ({ f, t: "n", s: ST.totalBg });

// ────────────────────────────────────────────────────────────────────────────
// Helpers de hoja
// ────────────────────────────────────────────────────────────────────────────

function addSheet(
  wb: XLSX.WorkBook,
  name: string,
  aoa: any[][],
  opts: { anchos?: number[]; merges?: { s: { r: number; c: number }; e: { r: number; c: number } }[] } = {}
) {
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws["!cols"] = (opts.anchos ?? aoa[0]?.map((_, i) => (i === 0 ? 38 : 18)) ?? []).map((wch) => ({ wch }));
  if (opts.merges) ws["!merges"] = opts.merges;
  // Altura de la fila de título
  ws["!rows"] = [{ hpt: 22 }];
  XLSX.utils.book_append_sheet(wb, ws, name.slice(0, 31));
}

// Merge horizontal en una fila (0-indexed row, fromCol..toCol)
const mergeRow = (r: number, c0: number, c1: number) => ({
  s: { r, c: c0 },
  e: { r, c: c1 },
});

// ────────────────────────────────────────────────────────────────────────────
// Punto de entrada
// ────────────────────────────────────────────────────────────────────────────

export function exportarProyectoExcel(proyecto: Proyecto): void {
  const calc = construirFlujoCaja(proyecto);
  const wb = XLSX.utils.book_new();

  agregarPortada(wb, proyecto, calc);
  agregarDatos(wb, proyecto);
  agregarInversiones(wb, proyecto);
  agregarPersonal(wb, proyecto);
  agregarDemanda(wb, proyecto);
  agregarCostosDirectos(wb, proyecto);
  agregarGastosOp(wb, proyecto);
  agregarCapitalYFinanciamiento(wb, proyecto, calc);
  agregarFlujoCaja(wb, calc);
  agregarIndicadores(wb, calc);
  agregarInterpretacion(wb);

  const nombre =
    (proyecto.nombre || "proyecto").replace(/[^a-z0-9_-]/gi, "_") +
    `_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, nombre);
}

// ────────────────────────────────────────────────────────────────────────────
// Hojas
// ────────────────────────────────────────────────────────────────────────────

function agregarPortada(
  wb: XLSX.WorkBook,
  p: Proyecto,
  calc: ReturnType<typeof construirFlujoCaja>
) {
  const aoa: any[][] = [
    [ti("SIMULADOR DE PROYECTOS DE INVERSIÓN — REPORTE")],
    [sub(`Proyecto: ${p.nombre}   ·   Generado: ${FECHA_HOY()}`)],
    [],
    [sec("INDICADORES PRINCIPALES")],
    [lbl("VAN (Bs)"), M(calc.indicadores.van)],
    [lbl("TIR"), P(calc.indicadores.tir)],
    [lbl("WACC"), P(calc.wacc)],
    [lbl("Payback (años)"), N(calc.indicadores.payback)],
    [lbl("IR (Índice de Rentabilidad)"), N(calc.indicadores.ir)],
    [lbl("RBC (Relación Beneficio/Costo)"), N(calc.indicadores.rbc)],
    [lbl("TRC (Tasa de Retorno Contable)"), P(calc.indicadores.trc)],
    [lbl("SD (Cobertura de Deuda)"), N(calc.indicadores.sd)],
    [],
    [sec("CONTENIDO DEL LIBRO", true)],
    [lbl("1."), lbl("Datos del proyecto")],
    [lbl("2."), lbl("Inversiones")],
    [lbl("3."), lbl("Personal")],
    [lbl("4."), lbl("Demanda y precios")],
    [lbl("5."), lbl("Costos directos")],
    [lbl("6."), lbl("Gastos operativos")],
    [lbl("7."), lbl("Capital y Financiamiento")],
    [lbl("8."), lbl("Flujo de caja (con fórmulas)")],
    [lbl("9."), lbl("Indicadores (con NPV / IRR)")],
    [lbl("10."), lbl("Interpretación")],
  ];
  addSheet(wb, "Portada", aoa, {
    anchos: [42, 22],
    merges: [mergeRow(0, 0, 1), mergeRow(1, 0, 1), mergeRow(3, 0, 1), mergeRow(13, 0, 1)],
  });
}

function agregarDatos(wb: XLSX.WorkBook, p: Proyecto) {
  const aoa: any[][] = [
    [ti("1. DATOS DEL PROYECTO")],
    [],
    [lblB("Nombre"), lbl(p.nombre)],
    [lblB("Ubicación"), lbl(p.ubicacion || "—")],
    [lblB("Sector"), lbl(p.sector)],
    [lblB("Descripción"), lbl(p.descripcion || "—")],
    [lblB("Versión de análisis"), lbl(p.version === "v2" ? "Con análisis de riesgo" : "Clásico")],
    [lblB("Modelo de ingreso"), lbl(p.modeloIngreso ?? "unidades")],
  ];
  addSheet(wb, "1. Datos", aoa, { anchos: [22, 60], merges: [mergeRow(0, 0, 1)] });
}

function agregarInversiones(wb: XLSX.WorkBook, p: Proyecto) {
  const headers = ["Categoría", "Ítem", "Unidad", "Cantidad", "Costo unit. (Bs)", "Costo total (Bs)", "Vida útil (años)", "Depreciación anual (Bs)"];
  const aoa: any[][] = [
    [ti("2. INVERSIONES EN ACTIVO FIJO")],
    [],
    headers.map(ch),
  ];
  let total = 0;
  for (const [cat, items] of Object.entries(p.inversiones ?? {})) {
    for (const it of items as any[]) {
      const dep = it.vidaUtilAnios > 0 ? it.costoTotal / it.vidaUtilAnios : 0;
      aoa.push([
        lbl(cat),
        lbl(it.descripcion),
        lbl(it.unidad ?? ""),
        N(it.cantidad ?? 1),
        M(it.costoUnitario ?? it.costoTotal),
        M(it.costoTotal),
        N(it.vidaUtilAnios ?? 0),
        M(dep),
      ]);
      total += it.costoTotal;
    }
  }
  aoa.push([totL("TOTAL INVERSIÓN FIJA"), lbl(""), lbl(""), lbl(""), lbl(""), totV(total), lbl(""), lbl("")]);
  addSheet(wb, "2. Inversiones", aoa, {
    anchos: [18, 36, 12, 12, 18, 20, 12, 22],
    merges: [mergeRow(0, 0, 7)],
  });
}

function agregarPersonal(wb: XLSX.WorkBook, p: Proyecto) {
  const tasas = obtenerTasasAportes(p.aportesPatronalesOverride);
  const totalTasa =
    tasas.riesgoProfesional + tasas.seguroSalud + tasas.provisionVivienda +
    tasas.previsionAguinaldo + tasas.previsionIndemnizacion;
  const headers = ["Puesto", "Cantidad", "Sueldo mensual (Bs)", "Aportes / mes (Bs)", "Costo anual / persona (Bs)", "Costo anual total (Bs)"];
  const aoa: any[][] = [
    [ti("3. PERSONAL — con aportes patronales de Bolivia")],
    [sub(`Aportes patronales totales: ${(totalTasa * 100).toFixed(2)}%`)],
    [],
    headers.map(ch),
  ];
  let total = 0;
  for (const x of p.personal ?? []) {
    const ap = calcularAportesPatronales(x.sueldoMensual, tasas);
    const tot = ap.costoTotalAnual * x.cantidad;
    aoa.push([lbl(x.puesto), N(x.cantidad), M(x.sueldoMensual), M(ap.totalAportes), M(ap.costoTotalAnual), MB(tot)]);
    total += tot;
  }
  aoa.push([totL("TOTAL ANUAL PERSONAL"), lbl(""), lbl(""), lbl(""), lbl(""), totV(total)]);
  addSheet(wb, "3. Personal", aoa, {
    anchos: [30, 12, 22, 22, 26, 24],
    merges: [mergeRow(0, 0, 5), mergeRow(1, 0, 5)],
  });
}

function agregarDemanda(wb: XLSX.WorkBook, p: Proyecto) {
  const headers = ["Producto", "Unidad", "", ...ANIOS.slice(1)];
  const aoa: any[][] = [
    [ti("4. DEMANDA Y PRECIOS POR AÑO")],
    [],
    headers.map(ch),
  ];
  for (const prod of p.productos ?? []) {
    aoa.push([lblB(prod.nombre), lbl(prod.unidadMedida), lbl("Cantidad"), ...prod.cantidades.map(N)]);
    aoa.push([lbl(""), lbl(""), lbl("Precio (Bs)"), ...prod.precios.map(M)]);
    aoa.push([lbl(""), lbl(""), lbl("Ingreso (Bs)"), ...prod.cantidades.map((c, i) => M(c * prod.precios[i]))]);
    aoa.push([]);
  }
  addSheet(wb, "4. Demanda", aoa, {
    anchos: [28, 12, 16, 16, 16, 16, 16, 16],
    merges: [mergeRow(0, 0, 7)],
  });
}

function agregarCostosDirectos(wb: XLSX.WorkBook, p: Proyecto) {
  const headers = ["Producto", "Categoría", "Descripción", "Unidad", "Cant. / u producto", "Costo unit. (Bs)", "Subtotal por unidad"];
  const aoa: any[][] = [
    [ti("5. COSTOS DIRECTOS DE PRODUCCIÓN (por unidad)")],
    [],
    headers.map(ch),
  ];
  for (const prod of p.productos ?? []) {
    const items = (p.costosDirectos ?? []).filter((c) => c.productoId === prod.id);
    for (const it of items) {
      aoa.push([
        lbl(prod.nombre),
        lbl(it.categoria),
        lbl(it.descripcion),
        lbl(it.unidadMedida),
        N(it.cantidadPorUnidad),
        M(it.costoUnitario),
        M(it.cantidadPorUnidad * it.costoUnitario),
      ]);
    }
  }
  addSheet(wb, "5. Costos directos", aoa, {
    anchos: [24, 18, 32, 12, 18, 18, 20],
    merges: [mergeRow(0, 0, 6)],
  });
}

function agregarGastosOp(wb: XLSX.WorkBook, p: Proyecto) {
  const headers = ["Tipo", "Descripción", "Unidad", "Cantidad", "Costo unit. (Bs)", "Total anual (Bs)"];
  const aoa: any[][] = [
    [ti("6. GASTOS ADMINISTRATIVOS Y DE COMERCIALIZACIÓN")],
    [sub(`Crecimiento anual: ${((p.crecimientoCostosAnual ?? 0) * 100).toFixed(1)}%`)],
    [],
    headers.map(ch),
  ];
  for (const c of p.costosAdministracion ?? []) {
    const factor = c.unidadMedida === "mes" ? 12 : 1;
    aoa.push([lbl("Administrativos"), lbl(c.descripcion), lbl(c.unidadMedida), N(c.cantidad), M(c.costoUnitario), M(c.cantidad * c.costoUnitario * factor)]);
  }
  for (const c of p.costosComercializacion ?? []) {
    const factor = c.unidadMedida === "mes" ? 12 : 1;
    aoa.push([lbl("Comercialización"), lbl(c.descripcion), lbl(c.unidadMedida), N(c.cantidad), M(c.costoUnitario), M(c.cantidad * c.costoUnitario * factor)]);
  }
  addSheet(wb, "6. Gastos op", aoa, {
    anchos: [20, 36, 12, 12, 18, 22],
    merges: [mergeRow(0, 0, 5), mergeRow(1, 0, 5)],
  });
}

function agregarCapitalYFinanciamiento(
  wb: XLSX.WorkBook,
  p: Proyecto,
  calc: ReturnType<typeof construirFlujoCaja>
) {
  const fin = p.financiamiento;
  const cw = fin?.prestamoCapitalTrabajo;
  const aoa: any[][] = [
    [ti("7. CAPITAL DE TRABAJO Y FINANCIAMIENTO")],
    [],
    [lblB("Capital de trabajo (Bs)"), M(p.capitalTrabajo)],
    [lblB("Meses de buffer"), N(p.mesesBufferCapitalTrabajo ?? 3)],
    [],
    [sec("PRÉSTAMO ACTIVO FIJO")],
    [lbl("% Propio"), P(fin?.porcentajePropio ?? 1)],
    [lbl("% Préstamo"), P(fin?.porcentajePrestamo ?? 0)],
    [lbl("Tasa interés anual"), P(fin?.tasaInteresAnual ?? 0)],
    [lbl("Plazo (meses)"), N(fin?.plazoMeses ?? 0)],
    [],
    [sec("PRÉSTAMO CAPITAL DE TRABAJO", true)],
    [lbl("% Propio"), P(cw?.porcentajePropio ?? 1)],
    [lbl("% Préstamo"), P(cw?.porcentajePrestamo ?? 0)],
    [lbl("Tasa interés anual"), P(cw?.tasaInteresAnual ?? 0)],
    [lbl("Plazo (meses)"), N(cw?.plazoMeses ?? 0)],
    [],
    [sec("WACC Y RESUMEN")],
    [lbl("WACC"), P(calc.wacc)],
    [lbl("Ke (costo de oportunidad del accionista)"), P(fin?.costoOportunidadAccionista ?? 0)],
    [lbl("Monto préstamo total (Bs)"), M(calc.montoPrestamo)],
    [lbl("Cuota anual total (Bs)"), M(calc.indicadores.cuotaAnualTotal)],
  ];
  addSheet(wb, "7. Cap+Financ", aoa, {
    anchos: [42, 22],
    merges: [
      mergeRow(0, 0, 1),
      mergeRow(5, 0, 1),
      mergeRow(11, 0, 1),
      mergeRow(17, 0, 1),
    ],
  });
}

function agregarFlujoCaja(
  wb: XLSX.WorkBook,
  calc: ReturnType<typeof construirFlujoCaja>
) {
  // Filas (1-indexadas Excel) que usaremos en las fórmulas
  const R = {
    title: 1,
    header: 3,
    secIngresos: 4,
    ingresos: 5,
    secCostos: 6,
    costosProd: 7,
    gastosAdmin: 8,
    gastosComerc: 9,
    personal: 10,
    deprec: 11,
    imprev: 12,
    intereses: 13,
    secResultado: 14,
    uai: 15,
    impuestos: 16,
    un: 17,
    secAjustes: 18,
    depRein: 19,
    invIni: 20,
    capTra: 21,
    prestamo: 22,
    amort: 23,
    reinv: 24,
    residual: 25,
    recupCT: 26,
    flujo: 27,
  };
  const cols = ["B", "C", "D", "E", "F", "G"];

  const aoa: any[][] = [];
  const filaValor = (c: any, vs: number[]) => [c, ...vs.map(M)];
  const filaFormula = (c: any, fs: string[]) => [c, ...fs.map(fMoney)];
  const filaTotalFormula = (c: any, fs: string[]) => [c, ...fs.map(fTotal)];

  // R1 título
  aoa.push([ti("8. FLUJO DE CAJA PROYECTADO (Bs)")]);
  // R2 vacío
  aoa.push([]);
  // R3 header
  aoa.push([ch("Concepto"), ...ANIOS.map(ch)]);
  // R4 sección
  aoa.push([sec("1 · INGRESOS")]);
  // R5
  aoa.push(filaValor(lbl("(+) Ingresos por ventas"), [0, ...calc.ingresos]));
  // R6 sección
  aoa.push([sec("2 · COSTOS Y GASTOS OPERATIVOS")]);
  // R7..R13
  aoa.push(filaValor(lbl("(-) Costos de producción"), [0, ...calc.costosProduccion]));
  aoa.push(filaValor(lbl("(-) Gastos administrativos"), [0, ...calc.gastosAdmin]));
  aoa.push(filaValor(lbl("(-) Gastos comercialización"), [0, ...calc.gastosComerc]));
  aoa.push(filaValor(lbl("(-) Personal (con aportes)"), [0, ...calc.personal]));
  aoa.push(filaValor(lbl("(-) Depreciación"), [0, ...calc.depreciacion]));
  aoa.push(filaValor(lbl("(-) Imprevistos"), [0, ...calc.imprevistos]));
  aoa.push(filaValor(lbl("(-) Intereses de la deuda"), [0, ...calc.intereses]));
  // R14 sección
  aoa.push([sec("3 · RESULTADO E IMPUESTOS")]);
  // R15 UAI (fórmula)
  aoa.push(filaFormula(
    lblB("= Utilidad antes de impuestos"),
    cols.map(
      (c) =>
        `=${c}${R.ingresos}-${c}${R.costosProd}-${c}${R.gastosAdmin}-${c}${R.gastosComerc}-${c}${R.personal}-${c}${R.deprec}-${c}${R.imprev}-${c}${R.intereses}`
    )
  ));
  // R16 Impuestos
  aoa.push(filaFormula(
    lbl(`(-) Impuestos (IUE ${(TASA_IUE * 100).toFixed(0)}%)`),
    cols.map((c) => `=MAX(0,${c}${R.uai})*${TASA_IUE}`)
  ));
  // R17 Utilidad neta
  aoa.push(filaFormula(
    lblB("= Utilidad neta"),
    cols.map((c) => `=${c}${R.uai}-${c}${R.impuestos}`)
  ));
  // R18 sección
  aoa.push([sec("4 · AJUSTES A FLUJO DE CAJA", true)]);
  // R19 Depreciación reincorporada
  aoa.push(filaFormula(lbl("(+) Depreciación (no es salida de caja)"), cols.map((c) => `=${c}${R.deprec}`)));
  // R20..R26 valores
  aoa.push(filaValor(lbl("(-) Inversión inicial (activos fijos)"), [calc.inversionInicial, 0, 0, 0, 0, 0]));
  aoa.push(filaValor(lbl("(-) Capital de trabajo"), [calc.capitalTrabajo, 0, 0, 0, 0, 0]));
  aoa.push(filaValor(lbl("(+) Préstamo recibido"), [calc.montoPrestamo, 0, 0, 0, 0, 0]));
  aoa.push(filaValor(lbl("(-) Amortización de la deuda"), [0, ...calc.amortizacion]));
  aoa.push(filaValor(lbl("(-) Reinversión (reposición de activos)"), [0, ...calc.reinversionPorAnio]));
  aoa.push(filaValor(lbl("(+) Valor residual (año 5)"), [0, 0, 0, 0, 0, calc.valorResidual]));
  aoa.push(filaValor(lbl("(+) Recuperación capital de trabajo (año 5)"), [0, 0, 0, 0, 0, calc.capitalTrabajo]));
  // R27 FLUJO NETO (fórmula con fondo destacado)
  aoa.push(filaTotalFormula(
    totL("5 · FLUJO DE CAJA NETO"),
    cols.map(
      (c) =>
        `=${c}${R.un}+${c}${R.depRein}-${c}${R.invIni}-${c}${R.capTra}+${c}${R.prestamo}-${c}${R.amort}-${c}${R.reinv}+${c}${R.residual}+${c}${R.recupCT}`
    )
  ));

  addSheet(wb, SH_FLUJO, aoa, {
    anchos: [42, 18, 18, 18, 18, 18, 18],
    merges: [
      mergeRow(0, 0, 6),
      mergeRow(R.secIngresos - 1, 0, 6),
      mergeRow(R.secCostos - 1, 0, 6),
      mergeRow(R.secResultado - 1, 0, 6),
      mergeRow(R.secAjustes - 1, 0, 6),
    ],
  });
}

function agregarIndicadores(
  wb: XLSX.WorkBook,
  calc: ReturnType<typeof construirFlujoCaja>
) {
  // Flujo neto: 'SH_FLUJO'!B27 (año 0) y C27:G27 (años 1..5)
  const RF = 27;
  const refAno0 = `'${SH_FLUJO}'!B${RF}`;
  const rangoAnios = `'${SH_FLUJO}'!C${RF}:G${RF}`;
  const rangoCompleto = `'${SH_FLUJO}'!B${RF}:G${RF}`;

  const aoa: any[][] = [
    [ti("9. INDICADORES DE EVALUACIÓN")],
    [sub("VAN, TIR e IR están vinculados al Flujo de caja (cambian si tocas un valor de entrada).")],
    [],
    [lblB("WACC (tasa de descuento)"), P(calc.wacc)],
    [lblB("VAN (Bs)"), fMoneyBold(`=NPV(B4,${rangoAnios})+${refAno0}`)],
    [lblB("TIR"), fPercent(`=IRR(${rangoCompleto})`)],
    [lblB("Payback (años)"), N(calc.indicadores.payback)],
    [lblB("IR — Índice de Rentabilidad"), { f: `=NPV(B4,${rangoAnios})/(-${refAno0})`, t: "n", s: { ...ST.num, font: { sz: 10, bold: true } } } as any],
    [lblB("RBC — Relación Beneficio/Costo"), N(calc.indicadores.rbc)],
    [lblB("TRC — Tasa de Retorno Contable"), P(calc.indicadores.trc)],
    [lblB("SD — Cobertura del Servicio de Deuda"), N(calc.indicadores.sd)],
    [],
    [sub("Payback, RBC, TRC y SD se exportan como valores calculados por la app.")],
  ];
  addSheet(wb, "9. Indicadores", aoa, {
    anchos: [44, 22],
    merges: [mergeRow(0, 0, 1), mergeRow(1, 0, 1), mergeRow(12, 0, 1)],
  });
}

function agregarInterpretacion(wb: XLSX.WorkBook) {
  const item = (titulo: string, texto: string) => [
    { v: titulo, t: "s", s: { ...ST.labelBold, alignment: { vertical: "top", wrapText: true } } },
    { v: texto, t: "s", s: { ...ST.label, alignment: { wrapText: true, vertical: "top" } } },
  ];
  const aoa: any[][] = [
    [ti("10. INTERPRETACIÓN DE LOS INDICADORES")],
    [],
    [ch("Indicador"), ch("Qué significa y cómo se lee")],
    item("VAN — Valor Actual Neto",
      "Suma todos los flujos del proyecto traídos a valor de hoy, descontados al WACC. VAN > 0: el proyecto crea valor por encima del mínimo exigido. VAN < 0: destruye valor."
    ),
    item("TIR — Tasa Interna de Retorno",
      "Rendimiento promedio anual del proyecto. Se compara con el WACC: si TIR > WACC, conviene; si TIR < WACC, no."
    ),
    item("WACC — Costo Promedio Ponderado de Capital",
      "Mezcla del costo de la deuda (banco, después de impuestos) y del costo del capital propio, ponderada por cuánto pones de cada uno. Es la 'vara' mínima que la TIR debe superar."
    ),
    item("Payback",
      "Cuántos años tarda el proyecto en devolverte la inversión inicial sumando flujos sin descontar. Mientras más corto, menor el riesgo de tiempo expuesto."
    ),
    item("Payback descontado",
      "Igual al payback pero descontando los flujos al WACC. Siempre es más largo que el payback simple."
    ),
    item("IR — Índice de Rentabilidad",
      "VP(flujos futuros) ÷ |inversión inicial|. Si IR > 1, por cada Bs invertido recuperas más de un Bs."
    ),
    item("RBC — Relación Beneficio/Costo",
      "VP(ingresos totales: ventas + préstamo + residual + CT) ÷ VP(costos totales). RBC > 1 conviene; coincide con VAN > 0."
    ),
    item("TRC — Tasa de Retorno Contable",
      "Promedio anual de utilidad neta ÷ inversión inicial. No considera el valor del dinero en el tiempo; es un indicador contable."
    ),
    item("SD / DSCR — Cobertura del Servicio de la Deuda",
      "Cuántas veces el flujo de caja operativo cubre la cuota anual de los préstamos. SD > 1.5 es cómodo; SD < 1 no alcanza."
    ),
    item("Punto de equilibrio",
      "Cuántas unidades hay que vender para cubrir todos los costos (sin ganar ni perder). Por encima de ese número, se gana; por debajo, se pierde."
    ),
    item("Apalancamiento (GAO/GAF/GAT)",
      "GAO mide cómo los costos fijos amplifican el efecto de las ventas sobre la utilidad operativa; GAF mide cómo la deuda amplifica el efecto sobre la utilidad del dueño; GAT = GAO × GAF."
    ),
    [],
    [sub("Generado automáticamente por el Simulador de Proyectos de Inversión.")],
  ];
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws["!cols"] = [{ wch: 42 }, { wch: 90 }];
  ws["!rows"] = [{ hpt: 22 }];
  ws["!merges"] = [mergeRow(0, 0, 1)];
  XLSX.utils.book_append_sheet(wb, ws, "10. Interpretación");
}
