/**
 * Exportación del proyecto a Excel (.xlsx) — académicamente útil:
 *  - Una hoja por etapa (Datos, Inversiones, Personal, Demanda, Costos
 *    directos, Gastos operativos, Capital + Financiamiento, Flujo de caja,
 *    Indicadores, Interpretación).
 *  - En "Flujo de caja", las filas de Utilidad antes de impuestos, Impuestos,
 *    Utilidad neta y Flujo neto usan FÓRMULAS Excel reales (=SUMA, =MAX),
 *    así si el alumno toca un valor de entrada Excel recalcula sola.
 *  - En "Indicadores", VAN, TIR e IR usan =NPV / =IRR referenciando la fila
 *    del Flujo neto. Coinciden con la app cuando los inputs no cambian.
 *
 * Pensado para ser entregable: hoja de portada con datos del proyecto, una
 * hoja final con interpretación de cada indicador. Ideal para anexo de tesis.
 */
import * as XLSX from "xlsx";
import { construirFlujoCaja } from "./flujo-proyecto";
import { calcularAportesPatronales, obtenerTasasAportes, TASA_IUE } from "./calculo-financiero";
import type { Proyecto } from "@/types/proyecto";

const FECHA_HOY = () => new Date().toLocaleDateString("es-BO");

const ANIOS = ["Año 0", "Año 1", "Año 2", "Año 3", "Año 4", "Año 5"];

// Nombre de hoja con la que armamos las referencias cruzadas.
const SH_FLUJO = "Flujo de caja";

/**
 * Punto de entrada: genera y descarga el .xlsx del proyecto.
 */
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
// Helpers de hojas
// ────────────────────────────────────────────────────────────────────────────

function addSheet(wb: XLSX.WorkBook, name: string, aoa: any[][]) {
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  // Ancho de columnas razonable.
  const colWidths = aoa[0]?.map((_, i) => ({
    wch: i === 0 ? 38 : 16,
  })) ?? [];
  ws["!cols"] = colWidths;
  XLSX.utils.book_append_sheet(wb, ws, name.slice(0, 31));
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
    ["SIMULADOR DE PROYECTOS DE INVERSIÓN"],
    [`Proyecto: ${p.nombre}`],
    [`Generado: ${FECHA_HOY()}`],
    [],
    ["INDICADORES PRINCIPALES"],
    ["VAN (Bs)", calc.indicadores.van],
    ["TIR", calc.indicadores.tir],
    ["WACC", calc.wacc],
    ["Payback (años)", calc.indicadores.payback],
    ["IR", calc.indicadores.ir],
    ["RBC", calc.indicadores.rbc],
    ["TRC", calc.indicadores.trc],
    ["Cobertura de deuda (SD)", calc.indicadores.sd],
    [],
    ["HOJAS"],
    ["1.", "Datos del proyecto"],
    ["2.", "Inversiones"],
    ["3.", "Personal"],
    ["4.", "Demanda y precios"],
    ["5.", "Costos directos"],
    ["6.", "Gastos operativos"],
    ["7.", "Capital y Financiamiento"],
    ["8.", "Flujo de caja"],
    ["9.", "Indicadores"],
    ["10.", "Interpretación"],
  ];
  addSheet(wb, "Portada", aoa);
}

function agregarDatos(wb: XLSX.WorkBook, p: Proyecto) {
  const aoa: any[][] = [
    ["DATOS DEL PROYECTO"],
    [],
    ["Nombre", p.nombre],
    ["Ubicación", p.ubicacion],
    ["Sector", p.sector],
    ["Descripción", p.descripcion],
    ["Versión de análisis", p.version === "v2" ? "Con análisis de riesgo" : "Clásico"],
    ["Modelo de ingreso", p.modeloIngreso ?? "unidades"],
  ];
  addSheet(wb, "1. Datos", aoa);
}

function agregarInversiones(wb: XLSX.WorkBook, p: Proyecto) {
  const aoa: any[][] = [
    ["INVERSIONES EN ACTIVO FIJO"],
    [],
    ["Categoría", "Ítem", "Unidad", "Cantidad", "Costo unit. (Bs)", "Costo total (Bs)", "Vida útil (años)", "Depreciación anual (Bs)"],
  ];
  let total = 0;
  for (const [cat, items] of Object.entries(p.inversiones ?? {})) {
    for (const it of items as any[]) {
      const dep = it.vidaUtilAnios > 0 ? it.costoTotal / it.vidaUtilAnios : 0;
      aoa.push([
        cat,
        it.descripcion,
        it.unidad ?? "",
        it.cantidad ?? 1,
        it.costoUnitario ?? it.costoTotal,
        it.costoTotal,
        it.vidaUtilAnios ?? 0,
        dep,
      ]);
      total += it.costoTotal;
    }
  }
  aoa.push([]);
  aoa.push(["TOTAL INVERSIÓN FIJA", "", "", "", "", total]);
  addSheet(wb, "2. Inversiones", aoa);
}

function agregarPersonal(wb: XLSX.WorkBook, p: Proyecto) {
  const tasas = obtenerTasasAportes(p.aportesPatronalesOverride);
  const totalTasa =
    tasas.riesgoProfesional + tasas.seguroSalud + tasas.provisionVivienda +
    tasas.previsionAguinaldo + tasas.previsionIndemnizacion;
  const aoa: any[][] = [
    ["PERSONAL (con aportes patronales de Bolivia)"],
    [`Aportes patronales totales: ${(totalTasa * 100).toFixed(2)}%`],
    [],
    ["Puesto", "Cantidad", "Sueldo mensual (Bs)", "Aportes / mes (Bs)", "Costo anual / persona (Bs)", "Costo anual total (Bs)"],
  ];
  let total = 0;
  for (const x of p.personal ?? []) {
    const ap = calcularAportesPatronales(x.sueldoMensual, tasas);
    const totalPuesto = ap.costoTotalAnual * x.cantidad;
    aoa.push([x.puesto, x.cantidad, x.sueldoMensual, ap.totalAportes, ap.costoTotalAnual, totalPuesto]);
    total += totalPuesto;
  }
  aoa.push([]);
  aoa.push(["TOTAL ANUAL PERSONAL", "", "", "", "", total]);
  addSheet(wb, "3. Personal", aoa);
}

function agregarDemanda(wb: XLSX.WorkBook, p: Proyecto) {
  const aoa: any[][] = [
    ["DEMANDA Y PRECIOS POR AÑO"],
    [],
    ["Producto", "Unidad", "", ...ANIOS.slice(1)],
  ];
  for (const prod of p.productos ?? []) {
    aoa.push([prod.nombre, prod.unidadMedida, "Cantidad", ...prod.cantidades]);
    aoa.push(["", "", "Precio (Bs)", ...prod.precios]);
    aoa.push(["", "", "Ingreso (Bs)",
      ...prod.cantidades.map((c, i) => c * prod.precios[i]),
    ]);
    aoa.push([]);
  }
  addSheet(wb, "4. Demanda", aoa);
}

function agregarCostosDirectos(wb: XLSX.WorkBook, p: Proyecto) {
  const aoa: any[][] = [
    ["COSTOS DIRECTOS DE PRODUCCIÓN (por unidad)"],
    [],
    ["Producto", "Categoría", "Descripción", "Unidad", "Cant. / u producto", "Costo unit. (Bs)", "Subtotal por unidad"],
  ];
  for (const prod of p.productos ?? []) {
    const items = (p.costosDirectos ?? []).filter((c) => c.productoId === prod.id);
    for (const it of items) {
      aoa.push([
        prod.nombre,
        it.categoria,
        it.descripcion,
        it.unidadMedida,
        it.cantidadPorUnidad,
        it.costoUnitario,
        it.cantidadPorUnidad * it.costoUnitario,
      ]);
    }
  }
  addSheet(wb, "5. Costos directos", aoa);
}

function agregarGastosOp(wb: XLSX.WorkBook, p: Proyecto) {
  const aoa: any[][] = [
    ["GASTOS ADMINISTRATIVOS Y DE COMERCIALIZACIÓN"],
    [`Crecimiento anual: ${((p.crecimientoCostosAnual ?? 0) * 100).toFixed(1)}%`],
    [],
    ["Tipo", "Descripción", "Unidad", "Cantidad", "Costo unit. (Bs)", "Total anual (Bs)"],
  ];
  for (const c of p.costosAdministracion ?? []) {
    const factor = c.unidadMedida === "mes" ? 12 : 1;
    aoa.push(["Administrativos", c.descripcion, c.unidadMedida, c.cantidad, c.costoUnitario, c.cantidad * c.costoUnitario * factor]);
  }
  for (const c of p.costosComercializacion ?? []) {
    const factor = c.unidadMedida === "mes" ? 12 : 1;
    aoa.push(["Comercialización", c.descripcion, c.unidadMedida, c.cantidad, c.costoUnitario, c.cantidad * c.costoUnitario * factor]);
  }
  addSheet(wb, "6. Gastos op", aoa);
}

function agregarCapitalYFinanciamiento(
  wb: XLSX.WorkBook,
  p: Proyecto,
  calc: ReturnType<typeof construirFlujoCaja>
) {
  const fin = p.financiamiento;
  const cw = fin?.prestamoCapitalTrabajo;
  const aoa: any[][] = [
    ["CAPITAL DE TRABAJO Y FINANCIAMIENTO"],
    [],
    ["Capital de trabajo (Bs)", p.capitalTrabajo],
    ["Meses de buffer", p.mesesBufferCapitalTrabajo ?? 3],
    [],
    ["PRÉSTAMO ACTIVO FIJO"],
    ["% Propio", fin?.porcentajePropio ?? 1],
    ["% Préstamo", fin?.porcentajePrestamo ?? 0],
    ["Tasa interés anual", fin?.tasaInteresAnual ?? 0],
    ["Plazo (meses)", fin?.plazoMeses ?? 0],
    [],
    ["PRÉSTAMO CAPITAL DE TRABAJO"],
    ["% Propio", cw?.porcentajePropio ?? 1],
    ["% Préstamo", cw?.porcentajePrestamo ?? 0],
    ["Tasa interés anual", cw?.tasaInteresAnual ?? 0],
    ["Plazo (meses)", cw?.plazoMeses ?? 0],
    [],
    ["WACC", calc.wacc],
    ["Ke (costo de oportunidad)", fin?.costoOportunidadAccionista ?? 0],
    ["Monto préstamo total (Bs)", calc.montoPrestamo],
    ["Cuota anual total (Bs)", calc.indicadores.cuotaAnualTotal],
  ];
  addSheet(wb, "7. Cap+Financiamiento", aoa);
}

function agregarFlujoCaja(
  wb: XLSX.WorkBook,
  calc: ReturnType<typeof construirFlujoCaja>
) {
  // Layout: A=Concepto, B=Año 0, C..G=Años 1..5
  // Filas en Excel (1-indexadas): definimos sus números para usar en fórmulas.
  const R = {
    title: 1,
    header: 3,
    ingresos: 5,
    costosProd: 7,
    gastosAdmin: 8,
    gastosComerc: 9,
    personal: 10,
    deprec: 11,
    imprev: 12,
    intereses: 13,
    uai: 15,
    impuestos: 16,
    un: 17,
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

  const aoa: any[][] = [];
  // Helpers para construir filas
  const fila = (concepto: string, valores: number[]) =>
    [concepto, ...valores] as any[];
  const filaFormula = (concepto: string, formulas: string[]) =>
    [concepto, ...formulas.map((f) => ({ f })) as any[]] as any[];

  // Año 0 + Años 1..5 (índices 0..5 en el array)
  const cols = ["B", "C", "D", "E", "F", "G"];

  // R1
  aoa.push(["FLUJO DE CAJA PROYECTADO (Bs)"]);
  // R2
  aoa.push([]);
  // R3 header
  aoa.push(["Concepto", ...ANIOS]);
  // R4 sección INGRESOS
  aoa.push(["① INGRESOS"]);
  // R5
  aoa.push(fila("(+) Ingresos por ventas", [0, ...calc.ingresos]));
  // R6 sección COSTOS
  aoa.push(["② COSTOS Y GASTOS OPERATIVOS"]);
  // R7..R13
  aoa.push(fila("(-) Costos de producción", [0, ...calc.costosProduccion]));
  aoa.push(fila("(-) Gastos administrativos", [0, ...calc.gastosAdmin]));
  aoa.push(fila("(-) Gastos comercialización", [0, ...calc.gastosComerc]));
  aoa.push(fila("(-) Personal (con aportes)", [0, ...calc.personal]));
  aoa.push(fila("(-) Depreciación", [0, ...calc.depreciacion]));
  aoa.push(fila("(-) Imprevistos", [0, ...calc.imprevistos]));
  aoa.push(fila("(-) Intereses de la deuda", [0, ...calc.intereses]));
  // R14 sección RESULTADO
  aoa.push(["③ RESULTADO E IMPUESTOS"]);
  // R15 UAI = ingresos - costos - intereses (con fórmula por columna)
  aoa.push(
    filaFormula(
      "= Utilidad antes de impuestos",
      cols.map(
        (c) =>
          `=${c}${R.ingresos}-${c}${R.costosProd}-${c}${R.gastosAdmin}-${c}${R.gastosComerc}-${c}${R.personal}-${c}${R.deprec}-${c}${R.imprev}-${c}${R.intereses}`
      )
    )
  );
  // R16 Impuestos = MAX(0, UAI) * IUE
  aoa.push(
    filaFormula(
      `(-) Impuestos (IUE ${(TASA_IUE * 100).toFixed(0)}%)`,
      cols.map((c) => `=MAX(0,${c}${R.uai})*${TASA_IUE}`)
    )
  );
  // R17 Utilidad neta = UAI - Impuestos
  aoa.push(
    filaFormula(
      "= Utilidad neta",
      cols.map((c) => `=${c}${R.uai}-${c}${R.impuestos}`)
    )
  );
  // R18 sección AJUSTES
  aoa.push(["④ AJUSTES A FLUJO DE CAJA"]);
  // R19 Depreciación reincorporada (referencia a R11 — se re-suma porque no es salida de caja)
  aoa.push(
    filaFormula(
      "(+) Depreciación (no es salida de caja)",
      cols.map((c) => `=${c}${R.deprec}`)
    )
  );
  // R20 Inversión inicial (positiva en columna; el signo lo da la fórmula final)
  aoa.push(fila("(-) Inversión inicial (activos fijos)", [calc.inversionInicial, 0, 0, 0, 0, 0]));
  // R21 Capital de trabajo
  aoa.push(fila("(-) Capital de trabajo", [calc.capitalTrabajo, 0, 0, 0, 0, 0]));
  // R22 Préstamo recibido (inflow t=0)
  aoa.push(fila("(+) Préstamo recibido", [calc.montoPrestamo, 0, 0, 0, 0, 0]));
  // R23 Amortización
  aoa.push(fila("(-) Amortización de la deuda", [0, ...calc.amortizacion]));
  // R24 Reinversión
  aoa.push(fila("(-) Reinversión (reposición de activos)", [0, ...calc.reinversionPorAnio]));
  // R25 Valor residual (año 5)
  aoa.push(fila("(+) Valor residual (año 5)", [0, 0, 0, 0, 0, calc.valorResidual]));
  // R26 Recuperación capital trabajo (año 5)
  aoa.push(fila("(+) Recuperación capital de trabajo (año 5)", [0, 0, 0, 0, 0, calc.capitalTrabajo]));
  // R27 FLUJO NETO = UN + Dep - Inv - CT + Préstamo - Amort - Reinv + Residual + RecupCT
  aoa.push(
    filaFormula(
      "⑤ FLUJO DE CAJA NETO",
      cols.map(
        (c) =>
          `=${c}${R.un}+${c}${R.depRein}-${c}${R.invIni}-${c}${R.capTra}+${c}${R.prestamo}-${c}${R.amort}-${c}${R.reinv}+${c}${R.residual}+${c}${R.recupCT}`
      )
    )
  );

  addSheet(wb, SH_FLUJO, aoa);
}

function agregarIndicadores(
  wb: XLSX.WorkBook,
  calc: ReturnType<typeof construirFlujoCaja>
) {
  // Filas: WACC en B3, VAN en B4, TIR en B5...
  // Referencia al flujo: 'Flujo de caja'!B27 año 0, !C27:G27 años 1..5.
  const RF = 27; // fila del flujo neto en la hoja Flujo de caja
  const flujoRef = (col: string) => `'${SH_FLUJO}'!${col}${RF}`;
  const rangoAnios = `'${SH_FLUJO}'!C${RF}:G${RF}`;
  const wacc = calc.wacc;

  const aoa: any[][] = [
    ["INDICADORES DE EVALUACIÓN"],
    [],
    ["WACC (tasa de descuento)", wacc],
    ["VAN (Bs)", { f: `=NPV(B3,${rangoAnios})+${flujoRef("B")}` }],
    ["TIR", { f: `=IRR('${SH_FLUJO}'!B${RF}:G${RF})` }],
    ["Payback (años, valor de la app)", calc.indicadores.payback],
    ["IR (Índice de Rentabilidad)", { f: `=NPV(B3,${rangoAnios})/(-${flujoRef("B")})` }],
    ["RBC (valor de la app)", calc.indicadores.rbc],
    ["TRC (valor de la app)", calc.indicadores.trc],
    ["Cobertura de deuda SD (valor de la app)", calc.indicadores.sd],
    [],
    ["Notas:"],
    ["VAN, TIR, IR están vinculados al Flujo de caja (cambian si tocas un valor)."],
    ["Payback, RBC, TRC y SD se exportan como valores calculados por la app."],
  ];
  addSheet(wb, "9. Indicadores", aoa);
}

function agregarInterpretacion(wb: XLSX.WorkBook) {
  const aoa: any[][] = [
    ["INTERPRETACIÓN DE LOS INDICADORES"],
    [],
    ["VAN — Valor Actual Neto",
      "Suma todos los flujos del proyecto traídos a valor de hoy, descontados al WACC. VAN > 0: el proyecto crea valor por encima del mínimo exigido. VAN < 0: destruye valor.",
    ],
    ["TIR — Tasa Interna de Retorno",
      "Rendimiento promedio anual del proyecto. Se compara con el WACC: si TIR > WACC, conviene; si TIR < WACC, no.",
    ],
    ["WACC — Costo Promedio Ponderado de Capital",
      "Mezcla del costo de la deuda (banco, después de impuestos) y del costo del capital propio, ponderada por cuánto pones de cada uno. Es la 'vara' mínima que la TIR debe superar.",
    ],
    ["Payback",
      "Cuántos años tarda el proyecto en devolverte la inversión inicial sumando flujos sin descontar. Mientras más corto, menor el riesgo de tiempo expuesto.",
    ],
    ["Payback descontado",
      "Igual al payback pero descontando los flujos al WACC. Siempre es más largo que el payback simple.",
    ],
    ["IR — Índice de Rentabilidad",
      "VP(flujos futuros) ÷ |inversión inicial|. Si IR > 1, por cada Bs invertido recuperas más de un Bs.",
    ],
    ["RBC — Relación Beneficio/Costo",
      "VP(ingresos totales: ventas + préstamo + residual + CT) ÷ VP(costos totales: inversión + operación + intereses + impuestos + amortización). RBC > 1 conviene; coincide con VAN > 0.",
    ],
    ["TRC — Tasa de Retorno Contable",
      "Promedio anual de utilidad neta ÷ inversión inicial. No considera el valor del dinero en el tiempo; es un indicador contable.",
    ],
    ["SD / DSCR — Cobertura del Servicio de la Deuda",
      "Cuántas veces el flujo de caja operativo del proyecto cubre la cuota anual de los préstamos. SD > 1.5 es cómodo; SD < 1 no alcanza.",
    ],
    ["Punto de equilibrio",
      "Cuántas unidades hay que vender para cubrir todos los costos (sin ganar ni perder). Por encima de ese número, se gana; por debajo, se pierde.",
    ],
    ["Apalancamiento (GAO/GAF/GAT)",
      "GAO mide cómo los costos fijos amplifican el efecto de las ventas sobre la utilidad operativa; GAF mide cómo la deuda amplifica el efecto sobre la utilidad del dueño; GAT = GAO × GAF.",
    ],
    [],
    ["Cómo leer este libro:"],
    ["La hoja 'Flujo de caja' contiene la matriz del proyecto. Las filas de Utilidad antes de impuestos, Impuestos, Utilidad neta y Flujo de caja neto son fórmulas que dependen de las filas de arriba: si cambias un valor de entrada, Excel recalcula automáticamente."],
    ["La hoja 'Indicadores' usa fórmulas NPV e IRR de Excel referenciando el Flujo neto, así VAN, TIR e IR siempre coinciden con la matriz."],
  ];
  // Columnas más anchas para texto
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws["!cols"] = [{ wch: 40 }, { wch: 90 }];
  XLSX.utils.book_append_sheet(wb, ws, "10. Interpretación");
}
