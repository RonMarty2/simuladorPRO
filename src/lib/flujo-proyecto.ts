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
  calcularIT,
  calcularPayback,
  calcularRBC,
  calcularServicioDeuda,
  calcularTIR,
  calcularTributosBolivia,
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

  // ── Inversión, depreciación, reposiciones y valor residual ───────────────
  // Solo los activos de vida < 5 reciben tratamiento especial (reposición
  // escalonada). Los de vida ≥ 5 y el terreno se comportan EXACTAMENTE igual
  // que antes: compra en año 0, depreciación durante su vida, sin reposición.
  const HORIZONTE = 5;
  const inversionItems = Object.values(proyecto.inversiones).flat() as any[];
  const inversionInicial = inversionItems.reduce((a, it) => a + it.costoTotal, 0);

  const depreciacion = [0, 0, 0, 0, 0]; // por año 1..5
  const reinversionPorAnio = [0, 0, 0, 0, 0]; // recompras de activos de vida corta, año 1..5
  let valorResidual = 0;

  for (const it of inversionItems) {
    const vida = it.vidaUtilAnios;
    const costo = it.costoTotal;
    if (!vida || vida <= 0) {
      // Terreno / no se deprecia: conserva todo su valor, sin depreciación.
      valorResidual += costo;
      continue;
    }
    // Lotes comprados en los años 0, vida, 2·vida… mientras quepan en el horizonte.
    for (let offset = 0; offset < HORIZONTE; offset += vida) {
      // El lote del año 0 ya está en inversionInicial; los demás son reposiciones.
      if (offset >= 1) reinversionPorAnio[offset - 1] += costo;
      const finDep = Math.min(offset + vida, HORIZONTE); // hasta dónde alcanza a depreciarse
      for (let y = offset + 1; y <= finDep; y++) {
        depreciacion[y - 1] += costo / vida;
      }
      // Lo que le queda a ESTE lote sin depreciar al final del horizonte.
      valorResidual += Math.max(0, costo - (costo / vida) * (finDep - offset));
    }
  }

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
  // depreciacion ya se calculó arriba (por año, respetando la vida de cada activo)
  const imprevistos = [0, 1, 2, 3, 4].map((i) => {
    const base = costosProduccion[i] + gastosAdmin[i] + gastosComerc[i] + personal[i];
    return base * proyecto.imprevistosPorcentaje;
  });
  const comprasGravadasIVA = [0, 1, 2, 3, 4].map(
    (i) => costosProduccion[i] + gastosAdmin[i] + gastosComerc[i] + imprevistos[i]
  );

  // Utilidad y flujo
  const ivaDebitoFiscal: number[] = [];
  const ivaCreditoFiscal: number[] = [];
  const ivaNetoPagar: number[] = [];
  const ivaSaldoCreditoFiscal: number[] = [];
  const it: number[] = [];
  const iue: number[] = [];
  const utilidadAAI: number[] = [];
  const impuestos: number[] = [];
  const utilidadNeta: number[] = [];
  let saldoCreditoFiscalIVA = 0;
  for (let i = 0; i < 5; i++) {
    const uOp =
      ingresos[i] -
      costosProduccion[i] -
      gastosAdmin[i] -
      gastosComerc[i] -
      personal[i] -
      depreciacion[i] -
      imprevistos[i];
    const itEstimado = calcularIT(ingresos[i]);
    const aai = uOp - itEstimado - intereses[i];
    const tributos = calcularTributosBolivia({
      ingresosBrutos: ingresos[i],
      comprasGravadasIVA: comprasGravadasIVA[i],
      utilidadAntesIUE: aai,
      saldoCreditoFiscalIVAAnterior: saldoCreditoFiscalIVA,
    });
    saldoCreditoFiscalIVA = tributos.iva.saldoCreditoFiscal;

    ivaDebitoFiscal.push(tributos.iva.debitoFiscal);
    ivaCreditoFiscal.push(tributos.iva.creditoFiscalPeriodo);
    ivaNetoPagar.push(tributos.iva.ivaNetoPagar);
    ivaSaldoCreditoFiscal.push(tributos.iva.saldoCreditoFiscal);
    it.push(tributos.it);
    iue.push(tributos.iue);
    utilidadAAI.push(aai);
    impuestos.push(tributos.totalTributosResultado);
    utilidadNeta.push(aai - tributos.iue);
  }

  const flujoCaja: number[] = [-(totalProyecto - montoPrestamo)];
  for (let i = 0; i < 5; i++) {
    // Resta la reposición de activos de vida corta en el año que toca recomprarlos.
    let fc =
      utilidadNeta[i] +
      depreciacion[i] -
      amortizacion[i] -
      reinversionPorAnio[i] -
      ivaNetoPagar[i];
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
        ivaNetoPagar[i] +
        amortizacion[i] +
        reinversionPorAnio[i]
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
    reinversionPorAnio,
    imprevistos,
    intereses,
    amortizacion,
    comprasGravadasIVA,
    ivaDebitoFiscal,
    ivaCreditoFiscal,
    ivaNetoPagar,
    ivaSaldoCreditoFiscal,
    it,
    iue,
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

/**
 * Capital de trabajo "base" = costos operativos del año 1 (producción +
 * personal + admin + comercialización + imprevistos) × meses de buffer / 12.
 *
 * NO incluye la cuota del préstamo (eso es financiamiento, se paga con el flujo
 * de cada año). Reutiliza los componentes del año 1 del propio motor para que
 * coincida EXACTAMENTE con lo que muestra el Paso 8 y con lo que entra al flujo.
 */
export function calcularCapitalTrabajoBase(proyecto: any): number {
  const meses = proyecto.mesesBufferCapitalTrabajo ?? 3;
  const c = construirFlujoCaja(proyecto);
  const operativoAnio1 =
    c.costosProduccion[0] +
    c.personal[0] +
    c.gastosAdmin[0] +
    c.gastosComerc[0] +
    c.imprevistos[0];
  return Math.round((operativoAnio1 * meses) / 12);
}
