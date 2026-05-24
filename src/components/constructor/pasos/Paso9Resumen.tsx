import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useProyectoStore } from "@/stores/proyecto-store";
import FichaPedagogica from "../FichaPedagogica";
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
} from "@/lib/calculo-financiero";
import { formatearBolivianos, cn } from "@/lib/utils";

const ANIOS = [1, 2, 3, 4, 5] as const;

export default function Paso9Resumen() {
  const proyecto = useProyectoStore((s) => s.proyecto)!;

  const calc = useMemo(() => construirFlujoCaja(proyecto), [proyecto]);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-lg font-semibold tracking-tight">Paso 9 · Resumen y flujo de caja</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Consolidación de todos los pasos anteriores. Si quieres cambiar algo, vuelve al
          paso correspondiente — esta vista se recalcula sola.
        </p>

        {/* Indicadores principales */}
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          <CardIndicador
            titulo="VAN"
            valor={formatearBolivianos(calc.indicadores.van)}
            positivo={calc.indicadores.van > 0}
            ayuda={`Valor Actual Neto · descontado al ${(calc.wacc * 100).toFixed(2)}%`}
            tooltip={`VAN = Σ FCt / (1+WACC)^t  desde t=0 hasta t=5\n\nSi VAN > 0: el proyecto CREA valor (acepta).\nSi VAN < 0: el proyecto DESTRUYE valor (rechaza).\n\nTu VAN: ${formatearBolivianos(calc.indicadores.van)}`}
          />
          <CardIndicador
            titulo="TIR"
            valor={
              isFinite(calc.indicadores.tir)
                ? `${(calc.indicadores.tir * 100).toFixed(2)}%`
                : "—"
            }
            positivo={isFinite(calc.indicadores.tir) && calc.indicadores.tir > calc.wacc}
            ayuda={`Tasa Interna de Retorno · vs WACC ${(calc.wacc * 100).toFixed(2)}%`}
            tooltip={`TIR = tasa que hace VAN = 0.\n\nSi TIR > WACC (${(calc.wacc * 100).toFixed(2)}%): proyecto rentable, ACEPTAR.\nSi TIR < WACC: proyecto NO rentable, rechazar.\n\nSi muestra "—" significa que los flujos no permiten calcular la TIR (todos negativos o no converge).`}
          />
          <CardIndicador
            titulo="Payback"
            valor={
              calc.indicadores.payback < 0
                ? "No recupera"
                : `${calc.indicadores.payback.toFixed(1)} años`
            }
            positivo={calc.indicadores.payback > 0 && calc.indicadores.payback <= 5}
            ayuda="Período de recuperación de la inversión"
            tooltip="Cuántos años tarda el proyecto en recuperar la inversión inicial (suma de flujos hasta llegar a cero). Si es 'No recupera', los flujos acumulados nunca cruzan el cero en el horizonte de 5 años."
          />
          <CardIndicador
            titulo="TRC"
            valor={
              isFinite(calc.indicadores.trc)
                ? `${(calc.indicadores.trc * 100).toFixed(2)}%`
                : "—"
            }
            positivo={calc.indicadores.trc > 0}
            ayuda="Tasa de Retorno Contable (ARR)"
            tooltip={`TRC = utilidad neta promedio anual ÷ inversión total\n\nNo descuenta el dinero en el tiempo, así que es menos riguroso que la TIR, pero útil como referencia contable rápida.\n\nTu TRC: ${(calc.indicadores.trc * 100).toFixed(2)}%`}
          />
          <CardIndicador
            titulo="SD"
            valor={
              isFinite(calc.indicadores.sd)
                ? calc.indicadores.sd.toFixed(2)
                : "Sin deuda"
            }
            positivo={calc.indicadores.sd >= 1}
            ayuda="Cobertura del Servicio de la Deuda (DSCR)"
            tooltip={`SD = flujo de caja operativo promedio ÷ cuota anual (capital + interés)\n\nSi SD > 1.0: el proyecto genera suficiente caja para pagar la deuda.\nSi SD < 1.0: NO alcanza, hace falta poner plata propia o refinanciar.\n\nCuota anual de referencia (año 1): ${formatearBolivianos(calc.indicadores.cuotaAnualTotal)}\nTu SD: ${isFinite(calc.indicadores.sd) ? calc.indicadores.sd.toFixed(2) : "sin deuda"}`}
          />
          <CardIndicador
            titulo="IR"
            valor={calc.indicadores.ir.toFixed(2)}
            positivo={calc.indicadores.ir > 1}
            ayuda="Índice de Rentabilidad"
            tooltip={`IR = VP(flujos positivos) ÷ inversión inicial\n\nSi IR > 1: por cada Bs invertido, recuperas más de Bs 1 a valor presente. Proyecto rentable.\nSi IR < 1: pierdes valor.\n\nTu IR: ${calc.indicadores.ir.toFixed(2)} → ${calc.indicadores.ir > 1 ? "ACEPTA" : "RECHAZA"}`}
          />
          <CardIndicador
            titulo="RBC"
            valor={
              isFinite(calc.indicadores.rbc)
                ? calc.indicadores.rbc.toFixed(2)
                : "—"
            }
            positivo={calc.indicadores.rbc > 1}
            ayuda="Relación Beneficio-Costo"
            tooltip={`RBC = VP(ingresos) ÷ VP(todos los costos + impuestos + intereses)\n\nSi RBC > 1: por cada Bs de costo, generas más de Bs 1 de ingreso (a valor presente). Acepta.\nSi RBC < 1: pierdes valor.\n\nTu RBC: ${calc.indicadores.rbc.toFixed(2)}`}
          />
          <CardIndicador
            titulo="WACC"
            valor={`${(calc.wacc * 100).toFixed(2)}%`}
            positivo
            ayuda="Costo Promedio Ponderado de Capital"
            tooltip={`WACC = (D/V × Kd × (1−T)) + (E/V × Ke)\n\nEs la tasa mínima que tu proyecto debe rendir para no destruir valor. Se usa como tasa de descuento del VAN y como referencia de comparación de la TIR.`}
          />
        </div>
      </div>

      {/* TABLA FLUJO DE CAJA */}
      <div className="overflow-x-auto rounded-lg border border-border bg-card p-4">
        <h3 className="mb-3 text-sm font-semibold">Flujo de caja proyectado (Bs)</h3>
        <table className="w-full min-w-[700px] text-xs">
          <thead className="text-muted-foreground">
            <tr className="border-b border-border">
              <th className="p-1.5 text-left">Concepto</th>
              <th className="p-1.5 text-right">Año 0</th>
              {ANIOS.map((a) => (
                <th key={a} className="p-1.5 text-right">Año {a}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <FilaFlujo label="(+) Ingresos" valores={[0, ...calc.ingresos]} signo="+" />
            <FilaFlujo
              label="(-) Costos de producción"
              valores={[0, ...calc.costosProduccion]}
              signo="-"
            />
            <FilaFlujo
              label="(-) Gastos administrativos"
              valores={[0, ...calc.gastosAdmin]}
              signo="-"
            />
            <FilaFlujo
              label="(-) Gastos comercialización"
              valores={[0, ...calc.gastosComerc]}
              signo="-"
            />
            <FilaFlujo
              label="(-) Personal (con aportes 30.37%)"
              valores={[0, ...calc.personal]}
              signo="-"
            />
            <FilaFlujo label="(-) Depreciación" valores={[0, ...calc.depreciacion]} signo="-" />
            <FilaFlujo label="(-) Imprevistos" valores={[0, ...calc.imprevistos]} signo="-" />
            <FilaFlujo
              label="(-) Intereses deuda"
              valores={[0, ...calc.intereses]}
              signo="-"
            />
            <FilaFlujo
              label="= Utilidad antes de impuestos"
              valores={[0, ...calc.utilidadAAI]}
              destacada
            />
            <FilaFlujo label="(-) Impuestos (IUE 25%)" valores={[0, ...calc.impuestos]} signo="-" />
            <FilaFlujo
              label="= Utilidad neta"
              valores={[0, ...calc.utilidadNeta]}
              destacada
            />
            <FilaFlujo label="(+) Depreciación" valores={[0, ...calc.depreciacion]} signo="+" />
            <FilaFlujo
              label="(-) Inversión inicial"
              valores={[-calc.inversionInicial, 0, 0, 0, 0, 0]}
              signo="-"
            />
            <FilaFlujo
              label="(-) Capital de trabajo"
              valores={[-calc.capitalTrabajo, 0, 0, 0, 0, 0]}
              signo="-"
            />
            <FilaFlujo
              label="(+) Préstamo"
              valores={[calc.montoPrestamo, 0, 0, 0, 0, 0]}
              signo="+"
            />
            <FilaFlujo
              label="(-) Amortización de capital"
              valores={[0, ...calc.amortizacion]}
              signo="-"
            />
            <FilaFlujo
              label="(+) Valor residual"
              valores={[0, 0, 0, 0, 0, calc.valorResidual]}
              signo="+"
            />
            <FilaFlujo
              label="(+) Recuperación capital trabajo"
              valores={[0, 0, 0, 0, 0, calc.capitalTrabajo]}
              signo="+"
            />
            <FilaFlujo
              label="FLUJO DE CAJA"
              valores={calc.flujoCaja}
              destacada
              top
            />
          </tbody>
        </table>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="mb-2 text-sm font-medium">Flujo de caja por año</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={calc.flujoCaja.map((v, i) => ({ anio: `Año ${i}`, valor: v }))}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="anio" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
              <Tooltip formatter={(v: number) => formatearBolivianos(v)} />
              <Bar dataKey="valor" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="mb-2 text-sm font-medium">Ingresos vs Costos por año</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart
              data={ANIOS.map((a, i) => ({
                anio: `Año ${a}`,
                ingresos: calc.ingresos[i],
                costos:
                  calc.costosProduccion[i] +
                  calc.gastosAdmin[i] +
                  calc.gastosComerc[i] +
                  calc.personal[i] +
                  calc.imprevistos[i],
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="anio" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
              <Tooltip formatter={(v: number) => formatearBolivianos(v)} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="ingresos" stroke="#10b981" name="Ingresos" />
              <Line type="monotone" dataKey="costos" stroke="#ef4444" name="Costos" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <FichaPedagogica
        titulo="Indicadores de evaluación"
        contenido={
          <>
            <strong>VAN &gt; 0</strong> y <strong>TIR &gt; WACC</strong> son las dos
            condiciones para que el proyecto sea rentable a la tasa de costo de
            capital actual. <strong>Payback</strong> indica cuán rápido recuperás la
            inversión.
            <br />
            <span className="text-amber-800/80 dark:text-amber-300/80">
              Recordá: estos son tus números <em>proyectados</em>. La simulación de 60
              turnos con eventos económicos bolivianos te mostrará cuánto puede mover
              estos valores la realidad.
            </span>
          </>
        }
      />
    </div>
  );
}

function CardIndicador({
  titulo,
  valor,
  positivo,
  ayuda,
  tooltip,
}: {
  titulo: string;
  valor: string;
  positivo: boolean;
  ayuda: string;
  tooltip?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-md border border-border p-3",
        tooltip && "cursor-help"
      )}
      title={tooltip}
    >
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {titulo}
        {tooltip && <span className="ml-1 opacity-60">ⓘ</span>}
      </div>
      <div
        className={cn(
          "mt-0.5 text-lg font-semibold",
          positivo ? "text-emerald-700 dark:text-emerald-400" : "text-destructive"
        )}
      >
        {valor}
      </div>
      <div className="text-[10px] text-muted-foreground">{ayuda}</div>
    </div>
  );
}

function FilaFlujo({
  label,
  valores,
  destacada,
  top,
}: {
  label: string;
  valores: number[];
  signo?: "+" | "-"; // Indicador visual ya viene en el label; no se usa internamente
  destacada?: boolean;
  top?: boolean;
}) {
  return (
    <tr
      className={cn(
        "border-b border-border/40",
        destacada && "bg-secondary/30",
        top && "border-t-2 border-foreground"
      )}
    >
      <td className={cn("p-1.5", destacada && "font-semibold")}>{label}</td>
      {valores.map((v, i) => (
        <td
          key={i}
          className={cn(
            "p-1.5 text-right",
            destacada && "font-semibold",
            v < 0 && "text-destructive"
          )}
        >
          {Math.abs(v) < 0.01 ? "—" : formatearBolivianos(v)}
        </td>
      ))}
    </tr>
  );
}

// ============================================================================
// Construcción del flujo de caja a partir del proyecto
// ============================================================================
function construirFlujoCaja(proyecto: any) {
  const productos = proyecto.productos.map((p: any) => {
    const cantidades = Array.isArray(p.cantidades) && p.cantidades.length === 5
      ? p.cantidades
      : [p.cantidadAnio1 ?? 0, p.cantidadAnio1 ?? 0, p.cantidadAnio1 ?? 0, p.cantidadAnio1 ?? 0, p.cantidadAnio1 ?? 0];
    const precios = Array.isArray(p.precios) && p.precios.length === 5
      ? p.precios
      : [p.precioVenta ?? 0, p.precioVenta ?? 0, p.precioVenta ?? 0, p.precioVenta ?? 0, p.precioVenta ?? 0];
    return { ...p, cantidades, precios };
  });

  // Inversión y depreciación
  const inversionItems = Object.values(proyecto.inversiones).flat() as any[];
  const inversionInicial = inversionItems.reduce((a, it) => a + it.costoTotal, 0);
  const depreciacionAnual = inversionItems.reduce((a, it) => a + (it.depreciacionAnual ?? 0), 0);
  const valorResidual = inversionItems.reduce((a, it) => a + (it.valorResidual ?? 0), 0);

  // Financiamiento
  const f = proyecto.financiamiento;
  const totalInversion = inversionInicial + proyecto.capitalTrabajo;
  const montoPrestamo = totalInversion * f.porcentajePrestamo;
  const cuotaMensual = calcularCuotaPrestamoFrancesa(
    montoPrestamo,
    f.tasaInteresAnual,
    f.plazoMeses
  );

  // Tabla amortización año por año (intereses y amortización capital por año)
  let saldo = montoPrestamo;
  const i_mes = f.tasaInteresAnual / 12;
  const intereses: number[] = [];
  const amortizacion: number[] = [];
  const mesesPagados = Math.min(60, f.plazoMeses);
  for (let anio = 0; anio < 5; anio++) {
    let int = 0,
      amort = 0;
    for (let mes = 0; mes < 12; mes++) {
      const mesGlobal = anio * 12 + mes + 1;
      if (mesGlobal > mesesPagados || saldo <= 0) break;
      const intMes = saldo * i_mes;
      const amortMes = cuotaMensual - intMes;
      int += intMes;
      amort += amortMes;
      saldo -= amortMes;
    }
    intereses.push(int);
    amortizacion.push(amort);
  }

  // WACC
  const wacc = calcularWACC({
    porcentajeDeuda: f.porcentajePrestamo,
    porcentajeCapital: f.porcentajePropio,
    tasaInteresDeuda: f.tasaInteresAnual,
    costoOportunidadAccionista: f.costoOportunidadAccionista,
    tasaImpuesto: 0.25,
  });

  // Personal anual con aportes patronales (default 30.37% o tasas custom)
  const tasasAportes = obtenerTasasAportes(proyecto.aportesPatronalesOverride);
  const personalAnual = proyecto.personal.reduce(
    (acc: number, p: any) =>
      acc + calcularAportesPatronales(p.sueldoMensual, tasasAportes).costoTotalAnual * p.cantidad,
    0
  );

  // Productos: ingresos y unidades por año
  const ingresos = [0, 1, 2, 3, 4].map((i) =>
    productos.reduce((acc: number, p: any) => acc + p.cantidades[i] * p.precios[i], 0)
  );
  const unidades = [0, 1, 2, 3, 4].map((i) =>
    productos.reduce((acc: number, p: any) => acc + p.cantidades[i], 0)
  );

  // Costos directos = costo unitario × unidades de año
  const costoUnitDirectos = proyecto.costosDirectos.reduce(
    (acc: number, c: any) => acc + c.cantidadPorUnidad * c.costoUnitario,
    0
  );
  const costosProduccion = unidades.map((u) => u * costoUnitDirectos);

  // Gastos administrativos y comerc — crecimiento aplicado año a año
  const g = proyecto.crecimientoCostosAnual;
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

  // Personal proyectado (mismo todos los años por simplicidad)
  const personal = [personalAnual, personalAnual, personalAnual, personalAnual, personalAnual];
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
    const imp = Math.max(0, aai) * 0.25;
    impuestos.push(imp);
    utilidadNeta.push(aai - imp);
  }

  const flujoCaja: number[] = [-(totalInversion - montoPrestamo)];
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

  // TRC = utilidad neta promedio / inversión total
  const trc = calcularTRC(utilidadNeta, inversionInicial + proyecto.capitalTrabajo);

  // SD = flujo caja operativo promedio / cuota anual total (capital + interés)
  // Como el flujoCaja del array ya descontó la amortización, sumamos otra vez
  // amortización + intereses para tener el flujo operativo bruto antes de la
  // deuda (que es lo que debe cubrir la cuota anual).
  const flujoOperativo: number[] = [];
  for (let i = 0; i < 5; i++) {
    flujoOperativo.push(flujoCaja[i + 1] + amortizacion[i] + intereses[i]);
  }
  const cuotaAnualTotal = (amortizacion[0] ?? 0) + (intereses[0] ?? 0); // Año 1 = referencia
  const sd = calcularServicioDeuda(flujoOperativo, cuotaAnualTotal);

  // RBC = VP(ingresos) / VP(costos+impuestos+deuda)
  const flujoIngresos: number[] = [0, ...ingresos];
  const flujoCostosTotal: number[] = [
    totalInversion - montoPrestamo, // inversión inicial = costo año 0
  ];
  for (let i = 0; i < 5; i++) {
    flujoCostosTotal.push(
      costosProduccion[i] +
        gastosAdmin[i] +
        gastosComerc[i] +
        personal[i] +
        imprevistos[i] +
        intereses[i] +
        impuestos[i]
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
