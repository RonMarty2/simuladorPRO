import { useProyectoStore } from "@/stores/proyecto-store";
import FichaPedagogica from "../FichaPedagogica";
import {
  calcularCuotaPrestamoFrancesa,
  calcularTablaAmortizacion,
  calcularWACC,
  TASA_IUE,
} from "@/lib/calculo-financiero";
import { formatearBolivianos, cn } from "@/lib/utils";
import type { PrestamoConfig } from "@/types/proyecto";

export default function Paso9Financiamiento() {
  const proyecto = useProyectoStore((s) => s.proyecto)!;
  const setFin = useProyectoStore((s) => s.setFinanciamiento);

  const f = proyecto.financiamiento;

  // ── Totales necesarios ────────────────────────────────────────────────────
  const inversionesFijas = Object.values(proyecto.inversiones)
    .flat()
    .reduce((acc, it) => acc + it.costoTotal, 0);
  const capitalOperativo = proyecto.capitalTrabajo;

  // ── Préstamo 1: ACTIVO FIJO (campos raíz del financiamiento) ─────────────
  const activo: PrestamoConfig = {
    porcentajePropio: f.porcentajePropio,
    porcentajePrestamo: f.porcentajePrestamo,
    tasaInteresAnual: f.tasaInteresAnual,
    plazoMeses: f.plazoMeses,
  };
  const montoActivo = inversionesFijas * activo.porcentajePrestamo;
  const cuotaActivoMensual =
    montoActivo > 0 && activo.plazoMeses > 0
      ? calcularCuotaPrestamoFrancesa(montoActivo, activo.tasaInteresAnual, activo.plazoMeses)
      : 0;

  const setActivo = (cambios: Partial<PrestamoConfig>) => setFin(cambios);

  // ── Préstamo 2: CAPITAL DE TRABAJO ────────────────────────────────────────
  const capital: PrestamoConfig = f.prestamoCapitalTrabajo ?? {
    porcentajePropio: 1,
    porcentajePrestamo: 0,
    tasaInteresAnual: 0.1,
    plazoMeses: 60,
  };
  const montoCapital = capitalOperativo * capital.porcentajePrestamo;
  const cuotaCapitalMensual =
    montoCapital > 0 && capital.plazoMeses > 0
      ? calcularCuotaPrestamoFrancesa(montoCapital, capital.tasaInteresAnual, capital.plazoMeses)
      : 0;

  const setCapital = (cambios: Partial<PrestamoConfig>) =>
    setFin({ prestamoCapitalTrabajo: { ...capital, ...cambios } });

  // ── WACC ponderado por monto de los dos préstamos ─────────────────────────
  const totalProyecto = inversionesFijas + capitalOperativo;
  const deudaTotal = montoActivo + montoCapital;
  const capitalPropioTotal = totalProyecto - deudaTotal;
  const porcDeudaTotal = totalProyecto > 0 ? deudaTotal / totalProyecto : 0;
  const porcCapitalTotal = totalProyecto > 0 ? capitalPropioTotal / totalProyecto : 1;
  const tasaPromedioDeuda =
    deudaTotal > 0
      ? (montoActivo * activo.tasaInteresAnual + montoCapital * capital.tasaInteresAnual) /
        deudaTotal
      : 0;
  const wacc = calcularWACC({
    porcentajeDeuda: porcDeudaTotal,
    porcentajeCapital: porcCapitalTotal,
    tasaInteresDeuda: tasaPromedioDeuda,
    costoOportunidadAccionista: f.costoOportunidadAccionista,
    tasaImpuesto: TASA_IUE,
  });

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4 rounded-lg border border-border bg-card p-5">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Paso 7 · Financiamiento</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Configura los <strong>dos préstamos</strong> del proyecto: uno para los activos
            fijos y otro para el capital de trabajo. Tasas y plazos suelen ser distintos.
          </p>
        </div>

        <BloquePrestamo
          titulo="Amortización de la deuda en activo"
          subtitulo="Cubre la inversión fija (terreno, obras, maquinaria, mobiliario, intangibles)"
          colorBase="orange"
          totalNecesario={inversionesFijas}
          cfg={activo}
          onChange={setActivo}
          msgVacio="Aún no agregaste inversiones en el Paso 3. Sin eso no hay nada que financiar acá."
        />

        <BloquePrestamo
          titulo="Amortización del capital operativo"
          subtitulo="Cubre el capital de trabajo (calculado en el Paso 8)"
          colorBase="red"
          totalNecesario={capitalOperativo}
          cfg={capital}
          onChange={setCapital}
          msgVacio="Todavía no calculaste el capital de trabajo en el Paso 8. Volvé y elegí los meses de buffer."
        />

        {/* WACC — explicación visual + cálculo paso a paso */}
        <BloqueWACC
          inversionesFijas={inversionesFijas}
          capitalOperativo={capitalOperativo}
          montoActivo={montoActivo}
          montoCapital={montoCapital}
          tasaActivo={activo.tasaInteresAnual}
          tasaCapital={capital.tasaInteresAnual}
          deudaTotal={deudaTotal}
          capitalPropioTotal={capitalPropioTotal}
          porcDeudaTotal={porcDeudaTotal}
          porcCapitalTotal={porcCapitalTotal}
          tasaPromedioDeuda={tasaPromedioDeuda}
          koa={f.costoOportunidadAccionista}
          tasaImpuesto={TASA_IUE}
          wacc={wacc}
          onChangeKoa={(v) => setFin({ costoOportunidadAccionista: v / 100 })}
        />

        {/* Resumen rápido */}
        <div className="rounded-md border border-border bg-secondary/20 p-3">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide">
            Resumen de financiamiento
          </div>
          <table className="w-full text-xs">
            <thead className="text-muted-foreground">
              <tr>
                <th className="p-1 text-left">Concepto</th>
                <th className="p-1 text-right">Monto necesario</th>
                <th className="p-1 text-right">Capital propio</th>
                <th className="p-1 text-right">Préstamo</th>
                <th className="p-1 text-right">Cuota mensual</th>
                <th className="p-1 text-right">Cuota anual</th>
              </tr>
            </thead>
            <tbody>
              <FilaResumen
                concepto="Activo fijo"
                total={inversionesFijas}
                propio={inversionesFijas - montoActivo}
                prestamo={montoActivo}
                cuotaMensual={cuotaActivoMensual}
              />
              <FilaResumen
                concepto="Capital operativo"
                total={capitalOperativo}
                propio={capitalOperativo - montoCapital}
                prestamo={montoCapital}
                cuotaMensual={cuotaCapitalMensual}
              />
              <tr className="border-t-2 border-border bg-secondary/40 font-bold">
                <td className="p-1">TOTAL</td>
                <td className="p-1 text-right">{formatearBolivianos(totalProyecto)}</td>
                <td className="p-1 text-right">{formatearBolivianos(capitalPropioTotal)}</td>
                <td className="p-1 text-right">{formatearBolivianos(deudaTotal)}</td>
                <td className="p-1 text-right">
                  {formatearBolivianos(cuotaActivoMensual + cuotaCapitalMensual)}
                </td>
                <td className="p-1 text-right">
                  {formatearBolivianos((cuotaActivoMensual + cuotaCapitalMensual) * 12)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <FichaPedagogica
        titulo="Dos préstamos, dos tasas"
        contenido={
          <>
            En Bolivia las PYMES suelen tener <strong>dos créditos diferentes</strong>:
            <ul className="ml-3 mt-1 list-disc">
              <li>
                <strong>Activo fijo</strong>: plazo 5-10 años, tasa 10-14%, garantía
                hipotecaria.
              </li>
              <li>
                <strong>Capital de trabajo</strong>: plazo 3-5 años, tasa 8-12%, suele ser
                más barato.
              </li>
            </ul>
            <br />
            <strong>WACC = (D/V) × Kd × (1−T) + (E/V) × Ke</strong>
            <br />
            La deuda baja el WACC por el escudo fiscal (intereses deducibles del IUE 25%).
            Pero mucha deuda = mucho riesgo de quiebra.
          </>
        }
      />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Bloque de UN préstamo (activo fijo o capital operativo)
// ════════════════════════════════════════════════════════════════════════════

const COLOR_HEADER: Record<"orange" | "red", string> = {
  orange: "bg-orange-500 text-white",
  red: "bg-red-600 text-white",
};

const COLOR_BORDE: Record<"orange" | "red", string> = {
  orange: "border-orange-400/60",
  red: "border-red-500/60",
};

function BloquePrestamo({
  titulo,
  subtitulo,
  colorBase,
  totalNecesario,
  cfg,
  onChange,
  msgVacio,
}: {
  titulo: string;
  subtitulo: string;
  colorBase: "orange" | "red";
  totalNecesario: number;
  cfg: PrestamoConfig;
  onChange: (cambios: Partial<PrestamoConfig>) => void;
  msgVacio: string;
}) {
  const montoFinanciar = totalNecesario * cfg.porcentajePrestamo;
  const aportePropio = totalNecesario * cfg.porcentajePropio;
  const cuotaMensual =
    montoFinanciar > 0 && cfg.plazoMeses > 0
      ? calcularCuotaPrestamoFrancesa(montoFinanciar, cfg.tasaInteresAnual, cfg.plazoMeses)
      : 0;
  const cuotaAnual = cuotaMensual * 12;

  // Tabla de amortización mes a mes durante el plazo del préstamo
  const tabla =
    montoFinanciar > 0 && cfg.plazoMeses > 0
      ? calcularTablaAmortizacion(montoFinanciar, cfg.tasaInteresAnual, cfg.plazoMeses)
      : [];

  // SIEMPRE mostrar los 5 años del horizonte del proyecto, aunque el plazo
  // del préstamo sea menor (años post-pago = 0) o mayor (sólo los primeros 5).
  const HORIZONTE_ANIOS = 5;
  const filasAnio = Array.from({ length: HORIZONTE_ANIOS }, (_, a) => {
    const desde = a * 12;
    const hasta = Math.min(desde + 12, tabla.length);
    const fragmento = tabla.slice(desde, hasta);
    const pagado = fragmento.length === 0; // este año el préstamo ya no existe
    return {
      anio: a + 1,
      cuotaAnual: fragmento.reduce((s, f) => s + f.cuota, 0),
      interesAnual: fragmento.reduce((s, f) => s + f.interes, 0),
      amortizacionAnual: fragmento.reduce((s, f) => s + f.amortizacionCapital, 0),
      saldoFinal: fragmento.length > 0 ? fragmento[fragmento.length - 1].saldoCapital : 0,
      pagado,
    };
  });
  const plazoMayor5 = cfg.plazoMeses > HORIZONTE_ANIOS * 12;

  const cambiarMezcla = (porcPrestamo: number) =>
    onChange({ porcentajePrestamo: porcPrestamo, porcentajePropio: 1 - porcPrestamo });

  return (
    <div className={cn("overflow-hidden rounded-md border-2", COLOR_BORDE[colorBase])}>
      {/* Header */}
      <div className={cn("px-3 py-2 text-sm font-bold uppercase tracking-wide", COLOR_HEADER[colorBase])}>
        {titulo}
      </div>
      <div className="border-b border-border bg-secondary/30 px-3 py-1 text-[11px] text-muted-foreground">
        {subtitulo}
      </div>

      {totalNecesario <= 0 ? (
        <div className="m-3 rounded-md border border-dashed border-amber-400/60 bg-amber-50 p-3 text-xs text-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
          {msgVacio}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 p-3 md:grid-cols-2">
          {/* COLUMNA IZQUIERDA: Estructura del financiamiento */}
          <div className="space-y-1 rounded-md border border-border bg-background/60 p-2">
            <div className="border-b border-border pb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Estructura del financiamiento
            </div>

            <FilaLinea
              label="Total monto necesario"
              valor={formatearBolivianos(totalNecesario)}
              negrita
              tooltip="Es la base sobre la que se reparte la mezcla deuda/capital propio. Para activo fijo viene del Paso 3 (inversiones). Para capital operativo viene del Paso 8."
            />

            <FilaLineaInput
              label="% Financiamiento (préstamo)"
              valor={Math.round(cfg.porcentajePrestamo * 1000) / 10}
              sufijo="%"
              ancho="w-20"
              min={0}
              max={100}
              step={0.5}
              onChange={(v) => cambiarMezcla(Math.min(100, Math.max(0, v)) / 100)}
              valorDerecho={formatearBolivianos(montoFinanciar)}
              tooltip={`Monto financiado = total necesario × % préstamo = ${formatearBolivianos(totalNecesario)} × ${(cfg.porcentajePrestamo * 100).toFixed(2)}% = ${formatearBolivianos(montoFinanciar)}`}
            />

            <FilaLinea
              label={`Aporte propio (${(cfg.porcentajePropio * 100).toFixed(1)}%)`}
              valor={formatearBolivianos(aportePropio)}
              tooltip={`Aporte propio = total necesario × % propio = ${formatearBolivianos(totalNecesario)} × ${(cfg.porcentajePropio * 100).toFixed(2)}% = ${formatearBolivianos(aportePropio)}`}
            />
          </div>

          {/* COLUMNA DERECHA: Condiciones del préstamo */}
          <div className="space-y-1 rounded-md border border-border bg-background/60 p-2">
            <div className="border-b border-border pb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Condiciones del préstamo
            </div>

            <FilaLinea
              label="Monto a financiar"
              valor={formatearBolivianos(montoFinanciar)}
              negrita
              tooltip={`Mismo número que en la izquierda: total necesario × % préstamo = ${formatearBolivianos(montoFinanciar)}. Es el capital sobre el que el banco calcula la cuota.`}
            />

            <FilaLineaInput
              label="Plazo del préstamo (meses)"
              valor={cfg.plazoMeses}
              ancho="w-20"
              min={1}
              max={240}
              step={1}
              onChange={(v) => onChange({ plazoMeses: Math.max(1, Math.round(v)) })}
              valorDerecho={`${(cfg.plazoMeses / 12).toFixed(1)} años`}
              valorDerechoMuted
              tooltip="Plazo total para devolver el préstamo. En Bolivia: activo fijo 5-10 años, capital operativo 3-5 años."
            />

            <FilaLineaInput
              label="Tasa de interés anual"
              valor={Math.round(cfg.tasaInteresAnual * 1000) / 10}
              sufijo="%"
              ancho="w-20"
              min={0}
              max={50}
              step={0.25}
              onChange={(v) => onChange({ tasaInteresAnual: Math.max(0, v) / 100 })}
              tooltip="Tasa nominal anual cobrada por el banco. En Bolivia para PYMES: 8-14% típico."
            />

            <FilaLinea
              label="Cuota mensual (sistema francés)"
              valor={formatearBolivianos(cuotaMensual)}
              negrita
              destacado={colorBase}
              tooltip={`Fórmula sistema francés: C = P × i / (1 - (1+i)^-n)\nP (capital) = ${formatearBolivianos(montoFinanciar)}\ni (tasa mensual) = ${(cfg.tasaInteresAnual * 100).toFixed(2)}% ÷ 12 = ${((cfg.tasaInteresAnual / 12) * 100).toFixed(4)}%\nn (meses) = ${cfg.plazoMeses}\n→ Cuota mensual = ${formatearBolivianos(cuotaMensual)}`}
            />
          </div>

          {/* FILA COMPLETA: Tabla de amortización 5 años */}
          <div className="md:col-span-2">
            <div className="overflow-x-auto rounded-md border border-border">
              <table className="w-full text-[11px]">
                <thead className={cn("uppercase tracking-wide", COLOR_HEADER[colorBase])}>
                  <tr>
                    <th className="p-1.5 text-left">Año del proyecto</th>
                    {filasAnio.map((f) => (
                      <th key={f.anio} className="p-1.5 text-right">
                        Año {f.anio}
                        {f.pagado && (
                          <span className="ml-1 rounded bg-white/25 px-1 text-[8px] font-normal">
                            pagado
                          </span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <FilaAmortAnio label="Cuota anual" filas={filasAnio} campo="cuotaAnual" />
                  <FilaAmortAnio label="Interés" filas={filasAnio} campo="interesAnual" />
                  <FilaAmortAnio
                    label="Amortización de capital"
                    filas={filasAnio}
                    campo="amortizacionAnual"
                  />
                  <FilaAmortAnio label="Saldo al cierre" filas={filasAnio} campo="saldoFinal" resaltar />
                </tbody>
              </table>
            </div>

            {plazoMayor5 && (
              <div className="mt-1 rounded bg-amber-50 px-2 py-1 text-[10px] text-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
                ⓘ Tu préstamo dura {(cfg.plazoMeses / 12).toFixed(1)} años. La tabla muestra
                solo los primeros 5 (horizonte del proyecto). Al cierre del año 5 todavía
                queda saldo por pagar.
              </div>
            )}

            <div className="mt-2 rounded bg-secondary/30 px-2 py-1 text-[11px] text-muted-foreground">
              <strong className="text-foreground">Cuota anual:</strong>{" "}
              {formatearBolivianos(cuotaAnual)} (= cuota mensual × 12). Este monto se suma
              al Capital de trabajo del Paso 8.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Helpers de UI: fila key-value y fila con input
// ────────────────────────────────────────────────────────────────────────────

const DESTACADO_COLOR: Record<"orange" | "red", string> = {
  orange: "bg-orange-50 dark:bg-orange-950/30",
  red: "bg-red-50 dark:bg-red-950/30",
};

function FilaLinea({
  label,
  valor,
  negrita,
  destacado,
  tooltip,
}: {
  label: string;
  valor: string;
  negrita?: boolean;
  destacado?: "orange" | "red";
  tooltip?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2 rounded px-1 py-1 text-xs",
        destacado && DESTACADO_COLOR[destacado],
        tooltip && "cursor-help"
      )}
      title={tooltip}
    >
      <span className={cn(negrita && "font-semibold")}>{label}</span>
      <span className={cn("tabular-nums", negrita && "font-bold")}>{valor}</span>
    </div>
  );
}

function FilaLineaInput({
  label,
  valor,
  sufijo,
  ancho = "w-20",
  min,
  max,
  step,
  onChange,
  valorDerecho,
  valorDerechoMuted,
  tooltip,
}: {
  label: string;
  valor: number;
  sufijo?: string;
  ancho?: string;
  min?: number;
  max?: number;
  step?: number;
  onChange: (v: number) => void;
  valorDerecho?: string;
  valorDerechoMuted?: boolean;
  tooltip?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-2 rounded px-1 py-1 text-xs",
        tooltip && "cursor-help"
      )}
      title={tooltip}
    >
      <span className="flex-1">{label}</span>
      <div className="flex items-center gap-1">
        <input
          type="number"
          value={valor}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          onFocus={(e) => e.currentTarget.select()}
          min={min}
          max={max}
          step={step}
          className={cn(
            "rounded border border-input bg-background px-2 py-1 text-right text-xs tabular-nums focus:outline-none focus:ring-1 focus:ring-ring",
            ancho
          )}
        />
        {sufijo && <span className="text-muted-foreground">{sufijo}</span>}
      </div>
      {valorDerecho && (
        <span
          className={cn(
            "min-w-[100px] text-right text-xs tabular-nums",
            valorDerechoMuted && "text-muted-foreground"
          )}
        >
          {valorDerecho}
        </span>
      )}
    </div>
  );
}

type FilaAnio = {
  anio: number;
  cuotaAnual: number;
  interesAnual: number;
  amortizacionAnual: number;
  saldoFinal: number;
  pagado: boolean;
};

const TOOLTIPS_AMORT: Record<string, string> = {
  cuotaAnual:
    "Cuota anual = cuota mensual × 12 meses. Como el sistema francés tiene cuota fija, este valor es igual todos los años mientras el préstamo esté vigente.",
  interesAnual:
    "Interés del año = saldo pendiente × tasa mensual, sumado mes a mes. Es alto al principio (debes más) y baja con el tiempo.",
  amortizacionAnual:
    "Amortización de capital = cuota − interés. Empieza baja y crece año a año porque cada vez queda menos saldo que genera intereses.",
  saldoFinal:
    "Saldo al cierre = saldo del año anterior − amortización del año. En el último año del plazo llega a Bs 0 (préstamo pagado).",
};

function FilaAmortAnio({
  label,
  filas,
  campo,
  resaltar,
}: {
  label: string;
  filas: FilaAnio[];
  campo: keyof Omit<FilaAnio, "anio" | "pagado">;
  resaltar?: boolean;
}) {
  const tooltipBase = TOOLTIPS_AMORT[campo] ?? "";
  return (
    <tr
      className={cn(
        "border-b border-border/30 last:border-0",
        resaltar && "bg-secondary/30 font-semibold"
      )}
    >
      <td className="p-1.5 font-medium" title={tooltipBase}>
        {label} <span className="text-[9px] text-muted-foreground">ⓘ</span>
      </td>
      {filas.map((f) => (
        <td
          key={f.anio}
          className={cn(
            "p-1.5 text-right tabular-nums cursor-help",
            f.pagado && "text-muted-foreground/60"
          )}
          title={
            f.pagado
              ? `Año ${f.anio}: el préstamo ya está pagado. Por eso ${label.toLowerCase()} = Bs 0.`
              : `Año ${f.anio} — ${label}\n\n${tooltipBase}`
          }
        >
          {formatearBolivianos(f[campo])}
        </td>
      ))}
    </tr>
  );
}

function FilaResumen({
  concepto,
  total,
  propio,
  prestamo,
  cuotaMensual,
}: {
  concepto: string;
  total: number;
  propio: number;
  prestamo: number;
  cuotaMensual: number;
}) {
  return (
    <tr className="border-b border-border/40">
      <td className="p-1">{concepto}</td>
      <td
        className="p-1 text-right cursor-help"
        title={`${concepto} — Monto necesario total. Para activo fijo viene del Paso 3. Para capital operativo viene del Paso 8.`}
      >
        {formatearBolivianos(total)}
      </td>
      <td
        className="p-1 text-right text-emerald-700 dark:text-emerald-400 cursor-help"
        title={`Aporte propio = ${formatearBolivianos(total)} − ${formatearBolivianos(prestamo)} = ${formatearBolivianos(propio)} (${total > 0 ? ((propio / total) * 100).toFixed(1) : "0"}%)`}
      >
        {formatearBolivianos(propio)}
      </td>
      <td
        className="p-1 text-right text-amber-700 dark:text-amber-400 cursor-help"
        title={`Préstamo = ${formatearBolivianos(total)} × % financiado = ${formatearBolivianos(prestamo)} (${total > 0 ? ((prestamo / total) * 100).toFixed(1) : "0"}%)`}
      >
        {formatearBolivianos(prestamo)}
      </td>
      <td
        className="p-1 text-right cursor-help"
        title="Cuota mensual del sistema francés. Es lo que pagarás cada mes al banco mientras dure el plazo."
      >
        {formatearBolivianos(cuotaMensual)}
      </td>
      <td
        className="p-1 text-right cursor-help"
        title={`Cuota anual = cuota mensual × 12 = ${formatearBolivianos(cuotaMensual)} × 12 = ${formatearBolivianos(cuotaMensual * 12)}. Este valor se suma al Capital de trabajo del Paso 8.`}
      >
        {formatearBolivianos(cuotaMensual * 12)}
      </td>
    </tr>
  );
}

function CampoNumero({
  id,
  label,
  valor,
  onChange,
  sufijo,
  min,
  max,
  step,
}: {
  id: string;
  label: string;
  valor: number;
  onChange: (v: number) => void;
  sufijo?: string;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="text-xs font-medium text-muted-foreground">
        {label}
      </label>
      <div className="flex items-center gap-1">
        <input
          id={id}
          type="number"
          value={valor}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          min={min}
          max={max}
          step={step}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {sufijo && <span className="text-sm text-muted-foreground">{sufijo}</span>}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// BloqueWACC — explicación didáctica del WACC paso a paso
// ════════════════════════════════════════════════════════════════════════════

function BloqueWACC({
  inversionesFijas,
  capitalOperativo,
  montoActivo,
  montoCapital,
  tasaActivo,
  tasaCapital,
  deudaTotal,
  capitalPropioTotal,
  porcDeudaTotal,
  porcCapitalTotal,
  tasaPromedioDeuda,
  koa,
  tasaImpuesto,
  wacc,
  onChangeKoa,
}: {
  inversionesFijas: number;
  capitalOperativo: number;
  montoActivo: number;
  montoCapital: number;
  tasaActivo: number;
  tasaCapital: number;
  deudaTotal: number;
  capitalPropioTotal: number;
  porcDeudaTotal: number;
  porcCapitalTotal: number;
  tasaPromedioDeuda: number;
  koa: number;
  tasaImpuesto: number;
  wacc: number;
  onChangeKoa: (v: number) => void;
}) {
  const totalProyecto = inversionesFijas + capitalOperativo;
  const aporteActivo = inversionesFijas - montoActivo;
  const aporteCapital = capitalOperativo - montoCapital;
  const escudoFiscal = 1 - tasaImpuesto;
  const kdNeto = tasaPromedioDeuda * escudoFiscal;
  const contribDeuda = porcDeudaTotal * kdNeto;
  const contribCapital = porcCapitalTotal * koa;

  return (
    <div className="space-y-3 rounded-md border-2 border-primary/40 bg-primary/5 p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-sm font-bold uppercase tracking-wide">
            WACC — Costo promedio ponderado de capital
          </div>
          <div className="text-[11px] text-muted-foreground">
            Es la <strong>tasa mínima</strong> que tu proyecto tiene que rendir para que valga la pena.
            Se usa como tasa de descuento del VAN y se compara con la TIR.
          </div>
        </div>
        <div
          className="rounded-md bg-card px-3 py-2 text-right shadow-sm"
          title={`WACC = (D/V × Kd × (1-T)) + (E/V × Ke)\n     = ${(porcDeudaTotal * 100).toFixed(2)}% × ${(tasaPromedioDeuda * 100).toFixed(2)}% × ${(escudoFiscal * 100).toFixed(0)}% + ${(porcCapitalTotal * 100).toFixed(2)}% × ${(koa * 100).toFixed(2)}%\n     = ${(contribDeuda * 100).toFixed(2)}% + ${(contribCapital * 100).toFixed(2)}%\n     = ${(wacc * 100).toFixed(2)}%`}
        >
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
            WACC del proyecto
          </div>
          <div className="text-3xl font-bold text-primary">{(wacc * 100).toFixed(2)}%</div>
          <div className="text-[10px] text-muted-foreground">Tasa de descuento</div>
        </div>
      </div>

      {/* Koa editable */}
      <div className="flex items-center gap-2 rounded-md bg-card p-2">
        <label htmlFor="p7-koa" className="text-xs font-medium">
          Costo de oportunidad del accionista (Ke):
        </label>
        <input
          id="p7-koa"
          type="number"
          value={Math.round(koa * 1000) / 10}
          onChange={(e) => onChangeKoa(Number(e.target.value) || 0)}
          onFocus={(e) => e.currentTarget.select()}
          min={0}
          max={50}
          step={0.5}
          className="w-20 rounded border border-input bg-background px-2 py-1 text-right text-xs"
        />
        <span className="text-xs text-muted-foreground">%</span>
        <span
          className="ml-2 text-[10px] text-muted-foreground"
          title="Es lo mínimo que ganarías si invirtieras esa plata en otra alternativa similar (DPF, bolsa, otro negocio). En Bolivia las PYMES usan 13-20% típico."
        >
          ⓘ ¿qué es esto?
        </span>
      </div>

      {/* Diagrama de los 4 ingredientes */}
      <div className="rounded-md bg-card p-3">
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Los 4 ingredientes del WACC
        </div>
        <div className="grid grid-cols-2 gap-2 text-[11px] sm:grid-cols-4">
          <IngredienteWACC
            etiqueta="D/V"
            nombre="% Deuda"
            valor={`${(porcDeudaTotal * 100).toFixed(2)}%`}
            detalle={`${formatearBolivianos(deudaTotal)} / ${formatearBolivianos(totalProyecto)}`}
            color="amber"
            tooltip={`Deuda total = préstamo activo (${formatearBolivianos(montoActivo)}) + préstamo capital operativo (${formatearBolivianos(montoCapital)}) = ${formatearBolivianos(deudaTotal)}.\nProyecto total = inversiones fijas (${formatearBolivianos(inversionesFijas)}) + capital de trabajo (${formatearBolivianos(capitalOperativo)}) = ${formatearBolivianos(totalProyecto)}.\nD/V = ${formatearBolivianos(deudaTotal)} ÷ ${formatearBolivianos(totalProyecto)} = ${(porcDeudaTotal * 100).toFixed(2)}%`}
          />
          <IngredienteWACC
            etiqueta="Kd"
            nombre="Tasa promedio de la deuda"
            valor={`${(tasaPromedioDeuda * 100).toFixed(2)}%`}
            detalle={`(${(tasaActivo * 100).toFixed(1)}% activo + ${(tasaCapital * 100).toFixed(1)}% capital) ponderado`}
            color="amber"
            tooltip={`Promedio ponderado por monto de las dos deudas:\nKd = (${formatearBolivianos(montoActivo)} × ${(tasaActivo * 100).toFixed(2)}% + ${formatearBolivianos(montoCapital)} × ${(tasaCapital * 100).toFixed(2)}%) ÷ ${formatearBolivianos(deudaTotal)} = ${(tasaPromedioDeuda * 100).toFixed(2)}%`}
          />
          <IngredienteWACC
            etiqueta="E/V"
            nombre="% Capital propio"
            valor={`${(porcCapitalTotal * 100).toFixed(2)}%`}
            detalle={`${formatearBolivianos(capitalPropioTotal)} / ${formatearBolivianos(totalProyecto)}`}
            color="emerald"
            tooltip={`Capital propio = aporte propio del activo (${formatearBolivianos(aporteActivo)}) + aporte propio del capital operativo (${formatearBolivianos(aporteCapital)}) = ${formatearBolivianos(capitalPropioTotal)}.\nE/V = ${formatearBolivianos(capitalPropioTotal)} ÷ ${formatearBolivianos(totalProyecto)} = ${(porcCapitalTotal * 100).toFixed(2)}%`}
          />
          <IngredienteWACC
            etiqueta="Ke"
            nombre="Costo del accionista"
            valor={`${(koa * 100).toFixed(2)}%`}
            detalle="lo que tú definiste arriba"
            color="emerald"
            tooltip="Ke = costo de oportunidad del accionista. Editable arriba. Representa el rendimiento mínimo que el dueño esperaría de invertir su plata en este proyecto en lugar de en otra alternativa."
          />
        </div>
      </div>

      {/* Cálculo paso a paso */}
      <div className="rounded-md bg-card p-3">
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Cálculo paso a paso
        </div>
        <div className="space-y-1.5 text-xs">
          {/* Línea 1: aporte de la deuda */}
          <div
            className="rounded bg-amber-50 px-2 py-1.5 dark:bg-amber-950/30"
            title={`Aporte de la deuda al WACC:\nD/V × Kd × (1 - T)\n= ${(porcDeudaTotal * 100).toFixed(2)}% × ${(tasaPromedioDeuda * 100).toFixed(2)}% × (1 - ${(tasaImpuesto * 100).toFixed(0)}%)\n= ${(porcDeudaTotal * 100).toFixed(2)}% × ${(kdNeto * 100).toFixed(2)}%\n= ${(contribDeuda * 100).toFixed(2)}%\n\n¿Por qué (1-T)? Los intereses son deducibles del IUE. Cada Bs de interés que pagas te ahorra 0,25 Bs de impuesto, así que el costo "real" de la deuda baja.`}
          >
            <div className="font-medium text-amber-900 dark:text-amber-100">
              1. Aporte de la deuda (con escudo fiscal)
            </div>
            <div className="ml-3 mt-0.5 font-mono text-[11px] text-amber-900/80 dark:text-amber-100/80">
              D/V × Kd × (1−T) = {(porcDeudaTotal * 100).toFixed(2)}% × {(tasaPromedioDeuda * 100).toFixed(2)}% × {(escudoFiscal * 100).toFixed(0)}% ={" "}
              <strong>{(contribDeuda * 100).toFixed(2)}%</strong>
            </div>
          </div>

          {/* Línea 2: aporte del capital propio */}
          <div
            className="rounded bg-emerald-50 px-2 py-1.5 dark:bg-emerald-950/30"
            title={`Aporte del capital propio al WACC:\nE/V × Ke\n= ${(porcCapitalTotal * 100).toFixed(2)}% × ${(koa * 100).toFixed(2)}%\n= ${(contribCapital * 100).toFixed(2)}%\n\nNo lleva escudo fiscal porque los dividendos NO son deducibles del IUE.`}
          >
            <div className="font-medium text-emerald-900 dark:text-emerald-100">
              2. Aporte del capital propio (sin escudo fiscal)
            </div>
            <div className="ml-3 mt-0.5 font-mono text-[11px] text-emerald-900/80 dark:text-emerald-100/80">
              E/V × Ke = {(porcCapitalTotal * 100).toFixed(2)}% × {(koa * 100).toFixed(2)}% ={" "}
              <strong>{(contribCapital * 100).toFixed(2)}%</strong>
            </div>
          </div>

          {/* Línea 3: suma */}
          <div className="rounded border-2 border-primary bg-primary/10 px-2 py-1.5">
            <div className="font-bold text-primary">3. WACC = (1) + (2)</div>
            <div className="ml-3 mt-0.5 font-mono text-[11px]">
              {(contribDeuda * 100).toFixed(2)}% + {(contribCapital * 100).toFixed(2)}% ={" "}
              <strong className="text-base">{(wacc * 100).toFixed(2)}%</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Lectura del WACC */}
      <div className="rounded-md bg-secondary/40 p-2 text-[11px] text-muted-foreground">
        <strong className="text-foreground">📖 Cómo se lee:</strong> tu proyecto debe rendir
        al menos <strong className="text-foreground">{(wacc * 100).toFixed(2)}%</strong> anual
        para no destruir valor. Si la TIR queda por encima → el VAN es positivo y el proyecto
        crea valor. Si queda por debajo → estás perdiendo plata aunque el negocio dé utilidad.
      </div>
    </div>
  );
}

function IngredienteWACC({
  etiqueta,
  nombre,
  valor,
  detalle,
  color,
  tooltip,
}: {
  etiqueta: string;
  nombre: string;
  valor: string;
  detalle: string;
  color: "amber" | "emerald";
  tooltip: string;
}) {
  const claseFondo =
    color === "amber"
      ? "bg-amber-50 border-amber-300 dark:bg-amber-950/30 dark:border-amber-700"
      : "bg-emerald-50 border-emerald-300 dark:bg-emerald-950/30 dark:border-emerald-700";
  const claseTexto =
    color === "amber" ? "text-amber-900 dark:text-amber-100" : "text-emerald-900 dark:text-emerald-100";

  return (
    <div
      className={cn("rounded-md border px-2 py-1.5 cursor-help", claseFondo)}
      title={tooltip}
    >
      <div className={cn("font-mono text-[10px] font-bold uppercase", claseTexto)}>
        {etiqueta}
      </div>
      <div className={cn("text-[10px]", claseTexto)}>{nombre}</div>
      <div className={cn("mt-0.5 text-base font-bold", claseTexto)}>{valor}</div>
      <div className={cn("text-[9px] opacity-75", claseTexto)}>{detalle}</div>
    </div>
  );
}
