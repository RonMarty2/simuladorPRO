/**
 * Motor de flujo de caja del proyecto — COMPARTIDO.
 *
 * Construye el flujo de caja proyectado a 5 años y todos los indicadores
 * (VAN, TIR, Payback, IR, TRC, SD, RBC, WACC) a partir de un Proyecto.
 *
 * Vive aquí (y no dentro de una pantalla) para que el Paso 9 (Resumen) y la
 * pantalla de Evaluación final usen EXACTAMENTE el mismo cálculo y nunca
 * muestren un VAN distinto para el mismo proyecto.
 */
import {
  calcularAportesPatronales,
  calcularCuotaPrestamoFrancesa,
  calcularIR,
  calcularPayback,
  calcularRBC,
  calcularServicioDeuda,
  calcularTIR,
  calcularTRC,
  calcularVAN,
  calcularWACC,
  obtenerTasasAportes,
  TASA_IUE,
} from "./calculo-financiero";

export function construirFlujoCaja(proyecto: any) {
  const productos = proyecto.productos.map((p: any) => {
    const cantidades = Array.isArray(p.cantidades) && p.cantidades.length === 5
      ? p.cantidades
      : [p.cantidadAnio1 ?? 0, p.cantidadAnio1 ?? 0, p.cantidadAnio1 ?? 0, p.cantidadAnio1 ?? 0, p.cantidadAnio1 ?? 0];
    const precios = Array.isArray(p.precios) && p.precios.length === 5
      ? p.precios
      : [p.precioVenta ?? 0, p.precioVenta ?? 0, p.precioVenta ?? 0, p.precioVenta ?? 0, p.precioVenta ?? 0];
    return { ...p, cantidades, precios };
  });

  // ── Inversión y depreciación ──────────────────────────────────────────────
  const inversionItems = Object.values(proyecto.inversiones).flat() as any[];
  const inversionInicial = inversionItems.reduce((a, it) => a + it.costoTotal, 0);
  const depreciacionAnual = inversionItems.reduce((a, it) => a + (it.depreciacionAnual ?? 0), 0);
  const valorResidual = inversionItems.reduce((a, it) => a + (it.valorResidual ?? 0), 0);

  // ── Financiamiento: DOS préstamos separados (activo fijo + capital op) ────
  const f = proyecto.financiamiento;
  const TASA_IMP = TASA_IUE;

  const montoPrestActivo = inversionInicial * (f?.porcentajePrestamo ?? 0);
  const cuotaMensualActivo =
    montoPrestActivo > 0 && f?.plazoMeses
      ? calcularCuotaPrestamoFrancesa(montoPrestActivo, f.tasaInteresAnual ?? 0, f.plazoMeses)
      : 0;

  const cwCfg = f?.prestamoCapitalTrabajo;
  const montoPrestCapital = proyecto.capitalTrabajo * (cwCfg?.porcentajePrestamo ?? 0);
  const cuotaMensualCapital =
    montoPrestCapital > 0 && cwCfg?.plazoMeses
      ? calcularCuotaPrestamoFrancesa(montoPrestCapital, cwCfg.tasaInteresAnual ?? 0, cwCfg.plazoMeses)
      : 0;

  const montoPrestamo = montoPrestActivo + montoPrestCapital;

  const amortizarPrestamo = (
    montoInicial: number,
    tasaAnual: number,
    plazoMeses: number,
    cuotaMensual: number
  ) => {
    const intereses: number[] = [];
    const amortizacion: number[] = [];
    let saldo = montoInicial;
    const iMes = tasaAnual / 12;
    const mesesPagados = Math.min(60, plazoMeses);
    for (let anio = 0; anio < 5; anio++) {
      let int = 0;
      let amort = 0;
      for (let mes = 0; mes < 12; mes++) {
        const mesGlobal = anio * 12 + mes + 1;
        if (mesGlobal > mesesPagados || saldo <= 0) break;
        const intMes = saldo * iMes;
        const amortMes = cuotaMensual - intMes;
        int += intMes;
        amort += amortMes;
        saldo -= amortMes;
      }
      intereses.push(int);
      amortizacion.push(amort);
    }
    return { intereses, amortizacion };
  };

  const amortActivo = amortizarPrestamo(
    montoPrestActivo,
    f?.tasaInteresAnual ?? 0,
    f?.plazoMeses ?? 0,
    cuotaMensualActivo
  );
  const amortCapital = amortizarPrestamo(
    montoPrestCapital,
    cwCfg?.tasaInteresAnual ?? 0,
    cwCfg?.plazoMeses ?? 0,
    cuotaMensualCapital
  );

  const intereses = [0, 1, 2, 3, 4].map((i) => amortActivo.intereses[i] + amortCapital.intereses[i]);
  const amortizacion = [0, 1, 2, 3, 4].map(
    (i) => amortActivo.amortizacion[i] + amortCapital.amortizacion[i]
  );

  // ── WACC ponderado por monto de los dos préstamos ─────────────────────────
  const totalProyecto = inversionInicial + proyecto.capitalTrabajo;
  const deudaTotal = montoPrestActivo + montoPrestCapital;
  const capitalPropioTotal = totalProyecto - deudaTotal;
  const porcDeudaTotal = totalProyecto > 0 ? deudaTotal / totalProyecto : 0;
  const porcCapitalTotal = totalProyecto > 0 ? capitalPropioTotal / totalProyecto : 1;
  const tasaPromedioDeuda =
    deudaTotal > 0
      ? (montoPrestActivo * (f?.tasaInteresAnual ?? 0) +
          montoPrestCapital * (cwCfg?.tasaInteresAnual ?? 0)) /
        deudaTotal
      : 0;
  const wacc = calcularWACC({
    porcentajeDeuda: porcDeudaTotal,
    porcentajeCapital: porcCapitalTotal,
    tasaInteresDeuda: tasaPromedioDeuda,
    costoOportunidadAccionista: f.costoOportunidadAccionista,
    tasaImpuesto: TASA_IMP,
  });

  // ── Personal con aportes patronales (crece con inflación de costos) ──────
  const tasasAportes = obtenerTasasAportes(proyecto.aportesPatronalesOverride);
  const personalAnual = proyecto.personal.reduce(
    (acc: number, p: any) =>
      acc + calcularAportesPatronales(p.sueldoMensual, tasasAportes).costoTotalAnual * p.cantidad,
    0
  );

  // ── Productos: ingresos por año (cantidades[i] × precios[i]) ─────────────
  const ingresos = [0, 1, 2, 3, 4].map((i) =>
    productos.reduce((acc: number, p: any) => acc + p.cantidades[i] * p.precios[i], 0)
  );

  // ── Costos directos POR PRODUCTO ─────────────────────────────────────────
  const g = proyecto.crecimientoCostosAnual;
  const costosProduccion = [0, 1, 2, 3, 4].map((i) => {
    const inflacion = Math.pow(1 + g, i);
    const costoPorProducto = productos.reduce((acc: number, p: any) => {
      const unidadesProd = p.cantidades[i] ?? 0;
      const costoUnit = proyecto.costosDirectos
        .filter((c: any) => c.productoId === p.id)
        .reduce((a: number, c: any) => a + c.cantidadPorUnidad * c.costoUnitario, 0);
      return acc + unidadesProd * costoUnit * inflacion;
    }, 0);
    const unidadesTotales = productos.reduce(
      (a: number, p: any) => a + (p.cantidades[i] ?? 0),
      0
    );
    const costoUnitHuerfanos = proyecto.costosDirectos
      .filter((c: any) => c.productoId == null)
      .reduce((a: number, c: any) => a + c.cantidadPorUnidad * c.costoUnitario, 0);
    return costoPorProducto + unidadesTotales * costoUnitHuerfanos * inflacion;
  });

  // ── Admin y Comerc — crecimiento aplicado año a año ──────────────────────
  const gAdminBase = proyecto.costosAdministracion.reduce(
    (acc: number, c: any) => acc + c.cantidad * c.costoUnitario * (c.unidadMedida === "mes" ? 12 : 1),
    0
  );
  const gComercBase = proyecto.costosComercializacion.reduce(
    (acc: number, c: any) => acc + c.cantidad * c.costoUnitario * (c.unidadMedida === "mes" ? 12 : 1),
    0
  );
  const gastosAdmin = [0, 1, 2, 3, 4].map((i) => gAdminBase * Math.pow(1 + g, i));
  const gastosComerc = [0, 1, 2, 3, 4].map((i) => gComercBase * Math.pow(1 + g, i));

  const personal = [0, 1, 2, 3, 4].map((i) => personalAnual * Math.pow(1 + g, i));
  const depreciacion = [
    depreciacionAnual,
    depreciacionAnual,
    depreciacionAnual,
    depreciacionAnual,
    depreciacionAnual,
  ];
  const imprevistos = [0, 1, 2, 3, 4].map((i) => {
    const base = costosProduccion[i] + gastosAdmin[i] + gastosComerc[i] + personal[i];
    return base * proyecto.imprevistosPorcentaje;
  });

  // Utilidad y flujo
  const utilidadAAI: number[] = [];
  const impuestos: number[] = [];
  const utilidadNeta: number[] = [];
  for (let i = 0; i < 5; i++) {
    const uOp =
      ingresos[i] -
      costosProduccion[i] -
      gastosAdmin[i] -
      gastosComerc[i] -
      personal[i] -
      depreciacion[i] -
      imprevistos[i];
    const aai = uOp - intereses[i];
    utilidadAAI.push(aai);
    const imp = Math.max(0, aai) * TASA_IMP;
    impuestos.push(imp);
    utilidadNeta.push(aai - imp);
  }

  const flujoCaja: number[] = [-(totalProyecto - montoPrestamo)];
  for (let i = 0; i < 5; i++) {
    let fc = utilidadNeta[i] + depreciacion[i] - amortizacion[i];
    if (i === 4) fc += valorResidual + proyecto.capitalTrabajo;
    flujoCaja.push(fc);
  }

  // Indicadores
  const tasa = wacc > 0 ? wacc : 0.1;
  const van = calcularVAN(flujoCaja, tasa);
  const tir = calcularTIR(flujoCaja);
  const payback = calcularPayback(flujoCaja);
  const ir = calcularIR(flujoCaja, tasa);

  const trc = calcularTRC(utilidadNeta, inversionInicial + proyecto.capitalTrabajo);

  const flujoOperativo: number[] = [];
  for (let i = 0; i < 5; i++) {
    flujoOperativo.push(flujoCaja[i + 1] + amortizacion[i] + intereses[i]);
  }
  const cuotaAnualTotal = (amortizacion[0] ?? 0) + (intereses[0] ?? 0);
  const sd = calcularServicioDeuda(flujoOperativo, cuotaAnualTotal);

  // RBC = VP(beneficios) / VP(costos), mismos flujos que el VAN (RBC>1 ⟺ VAN>0)
  const flujoIngresos: number[] = [montoPrestamo, ...ingresos];
  flujoIngresos[5] += valorResidual + proyecto.capitalTrabajo;
  const flujoCostosTotal: number[] = [totalProyecto];
  for (let i = 0; i < 5; i++) {
    flujoCostosTotal.push(
      costosProduccion[i] +
        gastosAdmin[i] +
        gastosComerc[i] +
        personal[i] +
        imprevistos[i] +
        intereses[i] +
        impuestos[i] +
        amortizacion[i]
    );
  }
  const rbc = calcularRBC(flujoIngresos, flujoCostosTotal, tasa);

  return {
    ingresos,
    costosProduccion,
    gastosAdmin,
    gastosComerc,
    personal,
    depreciacion,
    imprevistos,
    intereses,
    amortizacion,
    utilidadAAI,
    impuestos,
    utilidadNeta,
    inversionInicial,
    capitalTrabajo: proyecto.capitalTrabajo,
    montoPrestamo,
    valorResidual,
    flujoCaja,
    wacc,
    indicadores: { van, tir, payback, ir, trc, sd, rbc, cuotaAnualTotal },
  };
}

export type FlujoCajaProyecto = ReturnType<typeof construirFlujoCaja>;
