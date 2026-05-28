import { useEffect, useState } from "react";
import { Calculator, ChevronDown, ChevronRight, Info } from "lucide-react";
import { useProyectoStore } from "@/stores/proyecto-store";
import FichaPedagogica from "../FichaPedagogica";
import {
  calcularAportesPatronales,
  calcularCuotaPrestamoFrancesa,
  obtenerTasasAportes,
} from "@/lib/calculo-financiero";
import { formatearBolivianos } from "@/lib/utils";

const selectOnFocus = (e: React.FocusEvent<HTMLInputElement>) =>
  e.currentTarget.select();

export default function Paso3Capital() {
  const proyecto = useProyectoStore((s) => s.proyecto)!;
  const setCapital = useProyectoStore((s) => s.setCapitalTrabajo);
  const setMesesBuffer = useProyectoStore((s) => s.setMesesBufferCapitalTrabajo);
  const setImprevistos = useProyectoStore((s) => s.setImprevistosPorcentaje);

  // Meses de buffer = ÚNICO input editable. Capital de trabajo se DERIVA de esto.
  const mesesBuffer = proyecto.mesesBufferCapitalTrabajo ?? 3;

  const tasasAportes = obtenerTasasAportes(proyecto.aportesPatronalesOverride);
  const totalTasaAportes =
    tasasAportes.riesgoProfesional +
    tasasAportes.seguroSalud +
    tasasAportes.provisionVivienda +
    tasasAportes.previsionAguinaldo +
    tasasAportes.previsionIndemnizacion;

  // ── Personal anual (Paso 4) ──────────────────────────────────────────────
  // Por cada puesto: (sueldo×12 + aportes×12) × cantidad de personas
  const personalAnual = proyecto.personal.reduce((acc, p) => {
    const ap = calcularAportesPatronales(p.sueldoMensual, tasasAportes);
    return acc + ap.costoTotalAnual * p.cantidad;
  }, 0);
  const desglosePersonal = proyecto.personal.map((p) => {
    const ap = calcularAportesPatronales(p.sueldoMensual, tasasAportes);
    return {
      puesto: p.puesto || "(sin nombre)",
      cantidad: p.cantidad,
      sueldoMensual: p.sueldoMensual,
      costoAnualUno: ap.costoTotalAnual,
      total: ap.costoTotalAnual * p.cantidad,
    };
  });

  // ── Costos de producción (Paso 5) ────────────────────────────────────────
  // FIX: calcular POR PRODUCTO y sumar (antes mezclaba todos los productos
  // con todos los costos directos, lo cual daba resultados incorrectos
  // cuando había más de 1 producto).
  const desgloseProduccion = proyecto.productos.map((p: any) => {
    const unidades = p.cantidades?.[0] ?? p.cantidadAnio1 ?? 0;
    // Solo costos directos asociados a ESTE producto
    const costosDeEsteProducto = proyecto.costosDirectos.filter(
      (c) => c.productoId === p.id
    );
    const costoUnitario = costosDeEsteProducto.reduce(
      (acc, c) => acc + c.cantidadPorUnidad * c.costoUnitario,
      0
    );
    return {
      producto: p.nombre || "(sin nombre)",
      unidades,
      costoUnitario,
      total: unidades * costoUnitario,
    };
  });
  // Items sin productoId (legacy / huérfanos): se reparten contra las
  // unidades totales como ocurría antes.
  const costosHuerfanos = proyecto.costosDirectos.filter(
    (c) => c.productoId == null
  );
  const unidadesTotales = proyecto.productos.reduce(
    (acc, p: any) => acc + (p.cantidades?.[0] ?? p.cantidadAnio1 ?? 0),
    0
  );
  const costoUnitHuerfanos = costosHuerfanos.reduce(
    (acc, c) => acc + c.cantidadPorUnidad * c.costoUnitario,
    0
  );
  const totalHuerfanos = unidadesTotales * costoUnitHuerfanos;
  const costosProduccionAnual =
    desgloseProduccion.reduce((a, d) => a + d.total, 0) + totalHuerfanos;

  // ── Administración y Comercialización (Paso 6) ───────────────────────────
  const desgloseAdmin = proyecto.costosAdministracion.map((c) => ({
    descripcion: c.descripcion || "(sin descripción)",
    factor: c.unidadMedida === "mes" ? 12 : 1,
    base: c.cantidad * c.costoUnitario,
    total: c.cantidad * c.costoUnitario * (c.unidadMedida === "mes" ? 12 : 1),
  }));
  const adminAnual = desgloseAdmin.reduce((a, d) => a + d.total, 0);

  const desgloseComerc = proyecto.costosComercializacion.map((c) => ({
    descripcion: c.descripcion || "(sin descripción)",
    factor: c.unidadMedida === "mes" ? 12 : 1,
    base: c.cantidad * c.costoUnitario,
    total: c.cantidad * c.costoUnitario * (c.unidadMedida === "mes" ? 12 : 1),
  }));
  const comercAnual = desgloseComerc.reduce((a, d) => a + d.total, 0);

  // ── Imprevistos (% sobre los 4 costos base) ──────────────────────────────
  const subtotalOperativo = personalAnual + costosProduccionAnual + adminAnual + comercAnual;
  const porcImprevistos = proyecto.imprevistosPorcentaje ?? 0;
  const imprevistosAnual = subtotalOperativo * porcImprevistos;

  // ── Cuotas anuales de los préstamos (Paso 7) ─────────────────────────────
  // FIX dependencia circular:
  // - Préstamo de ACTIVO FIJO: base = inversiones fijas (no depende de nada
  //   calculado en este paso, no hay bucle).
  // - Préstamo de CAPITAL OPERATIVO: la base es el "capital de trabajo
  //   OPERATIVO" = (operativos + imprevistos) × meses/12. Esta base NO
  //   depende de la cuota → ROMPE el bucle.
  const inversionesFijas = (Object.values(proyecto.inversiones ?? {}) as any[][])
    .flat()
    .reduce((acc: number, it: any) => acc + (it?.costoTotal ?? 0), 0);
  const fin = proyecto.financiamiento;

  // Préstamo de activo fijo
  const montoPrestActivo = inversionesFijas * (fin?.porcentajePrestamo ?? 0);
  const cuotaMensualActivo =
    montoPrestActivo > 0 && fin?.plazoMeses
      ? calcularCuotaPrestamoFrancesa(montoPrestActivo, fin.tasaInteresAnual ?? 0, fin.plazoMeses)
      : 0;
  const cuotaAnualActivo = cuotaMensualActivo * 12;

  // BASE del capital de trabajo (solo operativos + imprevistos, sin cuotas)
  const totalOperativoAnual = subtotalOperativo + imprevistosAnual;
  const capitalTrabajoBase = (totalOperativoAnual * mesesBuffer) / 12;

  // Préstamo de capital operativo se calcula sobre la BASE (no sobre el final)
  const cwCfg = fin?.prestamoCapitalTrabajo;
  const montoPrestCapital = capitalTrabajoBase * (cwCfg?.porcentajePrestamo ?? 0);
  const cuotaMensualCapital =
    montoPrestCapital > 0 && cwCfg?.plazoMeses
      ? calcularCuotaPrestamoFrancesa(
          montoPrestCapital,
          cwCfg.tasaInteresAnual ?? 0,
          cwCfg.plazoMeses
        )
      : 0;
  const cuotaAnualCapital = cuotaMensualCapital * 12;

  const cuotaAnualPrestamo = cuotaAnualActivo + cuotaAnualCapital;
  const financiamientoConfigurado =
    (inversionesFijas > 0 && (fin?.porcentajePrestamo ?? 0) > 0) ||
    (capitalTrabajoBase > 0 && (cwCfg?.porcentajePrestamo ?? 0) > 0);

  // Capital de trabajo = costos operativos + imprevistos. NO incluye la cuota del
  // préstamo: la deuda es un flujo de FINANCIAMIENTO que se paga con el flujo de
  // cada año (amortización + interés en el Paso 9), no se pre-financia como capital
  // de trabajo. Así el cálculo queda idéntico al Paso 7/Paso 9 y al motor del flujo,
  // y desaparece la dependencia circular con el préstamo de capital operativo.
  const totalAnual = totalOperativoAnual;
  const totalMensual = totalAnual / 12;
  const capitalTrabajoCalculado = Math.round((totalAnual * mesesBuffer) / 12);

  // Sincroniza el valor derivado con el store si cambió
  useEffect(() => {
    if (proyecto.capitalTrabajo !== capitalTrabajoCalculado) {
      setCapital(capitalTrabajoCalculado);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [capitalTrabajoCalculado]);

  // baseCapitalOperativo expuesto para el detalle de la fila 6
  const baseCapitalOperativo = capitalTrabajoBase;

  const aplicarMeses = (meses: number) => setMesesBuffer(meses);
  const aplicarSugerido = (meses: number) => aplicarMeses(meses);

  const faltanDatos =
    proyecto.personal.length === 0 &&
    proyecto.costosDirectos.length === 0 &&
    proyecto.costosAdministracion.length === 0 &&
    proyecto.costosComercializacion.length === 0;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_280px]">
      <div className="space-y-4 rounded-lg border border-border bg-card p-5">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Paso 8 · Capital de trabajo
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Dinero que necesitas para operar antes de recibir ingresos del negocio.
            Se calcula a partir de los costos definidos en los pasos anteriores.
          </p>
        </div>

        {faltanDatos && (
          <div className="flex items-start gap-2 rounded-md border border-amber-400 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100">
            <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <div>
              <strong>Te faltan datos.</strong> Volvé a los pasos anteriores y completa:
              <ul className="ml-3 mt-1 list-disc">
                <li>Paso 4 — Personal (sueldos)</li>
                <li>Paso 5 — Costos directos de producción</li>
                <li>Paso 6 — Gastos administrativos y comercialización</li>
              </ul>
              Sin esos datos, el capital de trabajo será Bs 0.
            </div>
          </div>
        )}

        {/* Desglose de gastos anuales con trazabilidad expandible */}
        <div className="rounded-md border border-border">
          <div className="border-b border-border bg-secondary px-3 py-2 text-xs font-semibold uppercase tracking-wide flex items-center justify-between">
            <span>Gastos anuales (calculados de pasos anteriores)</span>
            <span className="text-[10px] font-normal normal-case text-muted-foreground">
              Click en cada fila para ver de dónde sale el número
            </span>
          </div>

          <FilaGastoDetalle
            n={1}
            label={`Personal (con aportes patronales ${(totalTasaAportes * 100).toFixed(2)}%)`}
            origen="Paso 4 — Personal"
            valor={personalAnual}
            formula="Σ por puesto: (sueldo×12 + aportes×12) × cantidad"
            color="blue"
            vacioMsg="Aún no agregaste puestos en el Paso 4."
            detalle={
              desglosePersonal.length > 0 && (
                <table className="w-full text-[11px]">
                  <thead className="border-b border-border text-muted-foreground">
                    <tr>
                      <th className="px-2 py-1 text-left">Puesto</th>
                      <th className="px-2 py-1 text-right">Cant.</th>
                      <th className="px-2 py-1 text-right">Sueldo/mes</th>
                      <th className="px-2 py-1 text-right">Costo anual /persona</th>
                      <th className="px-2 py-1 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {desglosePersonal.map((d, i) => (
                      <tr key={i} className="border-b border-border/30 last:border-0">
                        <td className="px-2 py-1">{d.puesto}</td>
                        <td className="px-2 py-1 text-right">{d.cantidad}</td>
                        <td className="px-2 py-1 text-right">{formatearBolivianos(d.sueldoMensual)}</td>
                        <td className="px-2 py-1 text-right">{formatearBolivianos(d.costoAnualUno)}</td>
                        <td className="px-2 py-1 text-right font-semibold">{formatearBolivianos(d.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            }
          />

          <FilaGastoDetalle
            n={2}
            label="Costos directos de producción"
            origen="Paso 5 — Costos directos · Paso 2 — Demanda año 1"
            valor={costosProduccionAnual}
            formula="Σ por producto: unidades_año1 × (Σ costo_directo /u del producto)"
            color="emerald"
            vacioMsg="Agrega productos en el Paso 2 y costos directos en el Paso 5."
            detalle={
              (desgloseProduccion.length > 0 || costosHuerfanos.length > 0) && (
                <table className="w-full text-[11px]">
                  <thead className="border-b border-border text-muted-foreground">
                    <tr>
                      <th className="px-2 py-1 text-left">Producto</th>
                      <th className="px-2 py-1 text-right">Unid. año 1</th>
                      <th className="px-2 py-1 text-right">Costo directo /u</th>
                      <th className="px-2 py-1 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {desgloseProduccion.map((d, i) => (
                      <tr key={i} className="border-b border-border/30">
                        <td className="px-2 py-1">{d.producto}</td>
                        <td className="px-2 py-1 text-right">{d.unidades.toLocaleString()}</td>
                        <td className="px-2 py-1 text-right">{formatearBolivianos(d.costoUnitario)}</td>
                        <td className="px-2 py-1 text-right font-semibold">{formatearBolivianos(d.total)}</td>
                      </tr>
                    ))}
                    {totalHuerfanos > 0 && (
                      <tr className="border-b border-border/30 bg-amber-50 dark:bg-amber-950/20">
                        <td className="px-2 py-1 italic text-amber-900 dark:text-amber-200" colSpan={2}>
                          ⚠ Costos sin producto asignado (legacy) — se prorratean sobre todas las unidades
                        </td>
                        <td className="px-2 py-1 text-right">{formatearBolivianos(costoUnitHuerfanos)}</td>
                        <td className="px-2 py-1 text-right font-semibold">{formatearBolivianos(totalHuerfanos)}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )
            }
          />

          <FilaGastoDetalle
            n={3}
            label="Gastos de administración"
            origen="Paso 6 — Gastos op. · bloque azul"
            valor={adminAnual}
            formula="Σ cantidad × costo_unit × (12 si es mensual)"
            color="sky"
            vacioMsg="Aún no agregaste gastos administrativos en el Paso 6."
            detalle={
              desgloseAdmin.length > 0 && (
                <table className="w-full text-[11px]">
                  <thead className="border-b border-border text-muted-foreground">
                    <tr>
                      <th className="px-2 py-1 text-left">Descripción</th>
                      <th className="px-2 py-1 text-right">Base (cant×costo)</th>
                      <th className="px-2 py-1 text-right">× factor</th>
                      <th className="px-2 py-1 text-right">Subtotal anual</th>
                    </tr>
                  </thead>
                  <tbody>
                    {desgloseAdmin.map((d, i) => (
                      <tr key={i} className="border-b border-border/30 last:border-0">
                        <td className="px-2 py-1">{d.descripcion}</td>
                        <td className="px-2 py-1 text-right">{formatearBolivianos(d.base)}</td>
                        <td className="px-2 py-1 text-right">×{d.factor}</td>
                        <td className="px-2 py-1 text-right font-semibold">{formatearBolivianos(d.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            }
          />

          <FilaGastoDetalle
            n={4}
            label="Gastos de comercialización"
            origen="Paso 6 — Gastos op. · bloque verde"
            valor={comercAnual}
            formula="Σ cantidad × costo_unit × (12 si es mensual)"
            color="green"
            vacioMsg="Aún no agregaste gastos de comercialización en el Paso 6."
            detalle={
              desgloseComerc.length > 0 && (
                <table className="w-full text-[11px]">
                  <thead className="border-b border-border text-muted-foreground">
                    <tr>
                      <th className="px-2 py-1 text-left">Descripción</th>
                      <th className="px-2 py-1 text-right">Base (cant×costo)</th>
                      <th className="px-2 py-1 text-right">× factor</th>
                      <th className="px-2 py-1 text-right">Subtotal anual</th>
                    </tr>
                  </thead>
                  <tbody>
                    {desgloseComerc.map((d, i) => (
                      <tr key={i} className="border-b border-border/30 last:border-0">
                        <td className="px-2 py-1">{d.descripcion}</td>
                        <td className="px-2 py-1 text-right">{formatearBolivianos(d.base)}</td>
                        <td className="px-2 py-1 text-right">×{d.factor}</td>
                        <td className="px-2 py-1 text-right font-semibold">{formatearBolivianos(d.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            }
          />

          <FilaGastoDetalle
            n={5}
            label={`Imprevistos (${(porcImprevistos * 100).toFixed(1)}% sobre operativos)`}
            origen="Editable acá abajo · se aplica al subtotal operativo (filas 1-4)"
            valor={imprevistosAnual}
            formula="(personal + producción + admin + comerc) × % imprevistos"
            color="amber"
            vacioMsg="Define un % de imprevistos abajo (típico 3-5%)."
            detalle={
              porcImprevistos > 0 && (
                <table className="w-full text-[11px]">
                  <tbody>
                    <tr className="border-b border-border/30">
                      <td className="px-2 py-1">Subtotal operativo (filas 1+2+3+4)</td>
                      <td className="px-2 py-1 text-right">{formatearBolivianos(subtotalOperativo)}</td>
                    </tr>
                    <tr className="border-b border-border/30">
                      <td className="px-2 py-1">× % imprevistos</td>
                      <td className="px-2 py-1 text-right">{(porcImprevistos * 100).toFixed(2)}%</td>
                    </tr>
                    <tr>
                      <td className="px-2 py-1 font-semibold">= Imprevistos anuales</td>
                      <td className="px-2 py-1 text-right font-semibold">{formatearBolivianos(imprevistosAnual)}</td>
                    </tr>
                  </tbody>
                </table>
              )
            }
          />

          <div className="flex items-center justify-between border-t-2 border-border bg-secondary/50 px-3 py-2">
            <span className="text-xs font-bold uppercase tracking-wide">
              TOTAL OPERATIVO ANUAL
            </span>
            <span className="text-sm font-bold">{formatearBolivianos(totalAnual)}</span>
          </div>
        </div>

        {/* Cuotas de préstamo — informativo: NO es capital de trabajo */}
        {financiamientoConfigurado && (
          <div className="rounded-md border border-violet-300 bg-violet-50/50 p-3 dark:border-violet-800 dark:bg-violet-950/20">
            <div className="flex items-start gap-2 text-[11px] text-foreground/90">
              <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-violet-600" />
              <div className="min-w-0 flex-1">
                <strong>
                  Cuota anual de los préstamos: {formatearBolivianos(cuotaAnualPrestamo)}
                </strong>{" "}
                (capital + interés). <strong>No</strong> forma parte del capital de trabajo: la
                deuda se paga con el flujo de cada año y ya está contemplada en el{" "}
                <strong>Paso 7 · Financiamiento</strong> y en el flujo del Paso 9.
                <div className="mt-2 overflow-x-auto rounded-md border border-violet-200 bg-card dark:border-violet-900">
                  <table className="w-full text-[11px]">
                    <thead className="border-b border-border text-muted-foreground">
                      <tr>
                        <th className="px-2 py-1 text-left">Préstamo</th>
                        <th className="px-2 py-1 text-right">Monto financiado</th>
                        <th className="px-2 py-1 text-right">Tasa · plazo</th>
                        <th className="px-2 py-1 text-right">Cuota mensual</th>
                        <th className="px-2 py-1 text-right">Cuota anual</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-border/30">
                        <td className="px-2 py-1">Activo fijo (base: inversiones {formatearBolivianos(inversionesFijas)})</td>
                        <td className="px-2 py-1 text-right">{formatearBolivianos(montoPrestActivo)}</td>
                        <td className="px-2 py-1 text-right">
                          {((fin?.tasaInteresAnual ?? 0) * 100).toFixed(2)}% · {fin?.plazoMeses ?? 0}m
                        </td>
                        <td className="px-2 py-1 text-right">{formatearBolivianos(cuotaMensualActivo)}</td>
                        <td className="px-2 py-1 text-right font-semibold">{formatearBolivianos(cuotaAnualActivo)}</td>
                      </tr>
                      <tr className="border-b border-border/30">
                        <td className="px-2 py-1">Capital operativo (base: cap. trabajo {formatearBolivianos(baseCapitalOperativo)})</td>
                        <td className="px-2 py-1 text-right">{formatearBolivianos(montoPrestCapital)}</td>
                        <td className="px-2 py-1 text-right">
                          {((cwCfg?.tasaInteresAnual ?? 0) * 100).toFixed(2)}% · {cwCfg?.plazoMeses ?? 0}m
                        </td>
                        <td className="px-2 py-1 text-right">{formatearBolivianos(cuotaMensualCapital)}</td>
                        <td className="px-2 py-1 text-right font-semibold">{formatearBolivianos(cuotaAnualCapital)}</td>
                      </tr>
                      <tr className="bg-secondary/40 font-semibold">
                        <td className="px-2 py-1" colSpan={4}>TOTAL cuota anual préstamos</td>
                        <td className="px-2 py-1 text-right">{formatearBolivianos(cuotaAnualPrestamo)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Editor de % imprevistos */}
        <div className="rounded-md border border-amber-400/60 bg-amber-50/60 p-3 dark:border-amber-700/60 dark:bg-amber-950/20">
          <label htmlFor="p7-imp" className="block text-xs font-medium">
            % de imprevistos (colchón sobre los costos operativos):{" "}
            <span className="font-bold text-foreground">
              {(porcImprevistos * 100).toFixed(1)}%
            </span>
          </label>
          <input
            id="p7-imp"
            type="range"
            min={0}
            max={15}
            step={0.5}
            value={porcImprevistos * 100}
            onChange={(e) => setImprevistos(Number(e.target.value) / 100)}
            className="mt-1.5 w-full"
          />
          <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
            <span>0%</span>
            <span>5% (típico)</span>
            <span>10%</span>
            <span>15%</span>
          </div>
        </div>

        {/* Cálculo del capital de trabajo */}
        <div className="rounded-md border-2 border-primary/40 bg-primary/5 p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Calculator className="h-4 w-4" />
            Cálculo del capital de trabajo
          </div>

          <div className="grid grid-cols-1 gap-2 text-xs md:grid-cols-2">
            <div className="rounded-md bg-card p-2">
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Costo mensual de operación
              </div>
              <div className="text-base font-bold">{formatearBolivianos(totalMensual)}</div>
              <div className="text-[10px] text-muted-foreground">= Total operativo anual ÷ 12 meses</div>
            </div>
            <div className="rounded-md bg-card p-2">
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Capital de trabajo requerido
              </div>
              <div className="text-base font-bold text-primary">
                {formatearBolivianos(capitalTrabajoCalculado)}
              </div>
              <div className="text-[10px] text-muted-foreground">
                = Costo mensual × {mesesBuffer} {mesesBuffer === 1 ? "mes" : "meses"}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-medium">
              ¿Cuántos meses necesitas operar antes de recibir tu primer ingreso del
              negocio?
            </div>

            <div className="flex flex-wrap gap-1.5">
              {[1, 2, 3, 4, 5, 6].map((m) => {
                const activo = m === mesesBuffer;
                return (
                  <button
                    key={m}
                    onClick={() => aplicarSugerido(m)}
                    className={
                      activo
                        ? "rounded-md border border-primary bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-sm"
                        : "rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-secondary"
                    }
                  >
                    {m} {m === 1 ? "mes" : "meses"}
                    {activo && <span className="ml-1">✓</span>}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span>O escribe los meses (admite decimales):</span>
              <input
                type="number"
                value={mesesBuffer}
                onChange={(e) => setMesesBuffer(Number(e.target.value) || 0)}
                onFocus={selectOnFocus}
                min={0.5}
                max={24}
                step={0.5}
                className="w-24 rounded-md border border-input bg-background px-2 py-1.5 text-right text-xs focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <span className="text-muted-foreground">meses</span>
              <span className="ml-2 text-muted-foreground">
                → Capital trabajo = <strong>{formatearBolivianos(capitalTrabajoCalculado)}</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      <FichaPedagogica
        titulo="Capital de trabajo"
        contenido={
          <>
            El <strong>capital de trabajo</strong> cubre el desfase entre cuando pagas
            (sueldos, insumos, alquileres) y cuando cobras (ventas). Es uno de los
            errores más comunes en proyectos nuevos: olvidar reservar dinero para los
            primeros meses.
            <br />
            <br />
            <strong>Fórmula:</strong> (operativos + imprevistos) ÷ 12 × meses de buffer. La
            cuota del préstamo no entra acá: es financiamiento y se paga con el flujo de cada
            año.
            <br />
            <br />
            En Bolivia, considera:
            <ul className="ml-3 mt-1 list-disc">
              <li>Si vendes al contado: 1-2 meses suele alcanzar</li>
              <li>Si vendes a crédito (30-60 días): 3-4 meses</li>
              <li>Si tu mercado es nuevo (demanda incierta): 4-6 meses</li>
              <li>Y siempre suma 1 mes extra por aguinaldos (diciembre)</li>
            </ul>
          </>
        }
      />
    </div>
  );
}

type ColorFila = "blue" | "emerald" | "sky" | "green" | "amber" | "violet";

const COLOR_BORDE: Record<ColorFila, string> = {
  blue: "border-l-blue-500",
  emerald: "border-l-emerald-500",
  sky: "border-l-sky-500",
  green: "border-l-green-500",
  amber: "border-l-amber-500",
  violet: "border-l-violet-500",
};

function FilaGastoDetalle({
  n,
  label,
  origen,
  valor,
  formula,
  color,
  vacioMsg,
  detalle,
}: {
  n: number;
  label: string;
  origen: string;
  valor: number;
  formula: string;
  color: ColorFila;
  vacioMsg: string;
  detalle: React.ReactNode;
}) {
  const [abierto, setAbierto] = useState(false);
  const tieneDetalle = Boolean(detalle);

  return (
    <div className={`border-b border-border/60 border-l-4 ${COLOR_BORDE[color]} last:border-b-0`}>
      <button
        onClick={() => setAbierto((v) => !v)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs hover:bg-secondary/40"
      >
        {abierto ? (
          <ChevronDown className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
        )}
        <span className="w-5 text-right text-[10px] font-bold text-muted-foreground">{n}.</span>
        <div className="min-w-0 flex-1">
          <div className="font-medium">{label}</div>
          <div className="text-[10px] text-muted-foreground">{origen}</div>
        </div>
        <div className="text-right font-semibold tabular-nums">{formatearBolivianos(valor)}</div>
      </button>

      {abierto && (
        <div className="space-y-2 border-t border-border/60 bg-background/60 px-3 py-2">
          <div className="rounded-md bg-secondary/40 px-2 py-1 text-[10px] text-muted-foreground">
            <span className="font-semibold text-foreground">Fórmula:</span> {formula}
          </div>
          {tieneDetalle ? (
            <div className="overflow-x-auto rounded-md border border-border/60 bg-card">
              {detalle}
            </div>
          ) : (
            <div className="rounded-md border border-dashed border-amber-400/60 bg-amber-50 px-2 py-1.5 text-[11px] text-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
              {vacioMsg}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
