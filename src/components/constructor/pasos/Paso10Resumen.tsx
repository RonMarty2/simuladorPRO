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
  calcularFlujoCajaAnual,
  calcularIR,
  calcularPayback,
  calcularTIR,
  calcularVAN,
  calcularWACC,
} from "@/lib/calculo-financiero";
import { formatearBolivianos } from "@/lib/utils";

export default function Paso10Resumen() {
  const proyecto = useProyectoStore((s) => s.proyecto)!;

  const { proyeccion, indicadores, wacc } = useMemo(() => {
    // 1. Inversión inicial (todo el activo fijo + capital de trabajo)
    const inversionInicial =
      Object.values(proyecto.inversiones)
        .flat()
        .reduce((acc, it) => acc + it.costoTotal, 0) + proyecto.capitalTrabajo;

    // 2. Depreciación anual total (suma de todas las inversiones depreciables)
    const depreciacionAnual = Object.values(proyecto.inversiones)
      .flat()
      .reduce((acc, it) => acc + it.depreciacionAnual, 0);

    // 3. Costos anuales base (año 1)
    const costoPersonalAnual = proyecto.personal.reduce((acc, p) => {
      const ap = calcularAportesPatronales(p.sueldoMensual);
      return acc + ap.costoTotalAnual * p.cantidad;
    }, 0);

    const costoAdminAnual = proyecto.costosAdministracion.reduce((acc, c) => {
      const factor = c.unidadMedida === "mes" ? 12 : 1;
      return acc + c.cantidad * c.costoUnitario * factor;
    }, 0);

    const costoComercAnual = proyecto.costosComercializacion.reduce((acc, c) => {
      const factor = c.unidadMedida === "mes" ? 12 : 1;
      return acc + c.cantidad * c.costoUnitario * factor;
    }, 0);

    // Producción: por simplicidad asumimos que se vende toda la cantidad anual
    const ingresosAnioBase = proyecto.productos.reduce(
      (acc, p) => acc + p.cantidadAnio1 * p.precioVenta,
      0
    );

    // Costos directos de producción (insumos × cantidad anual de productos)
    const cantidadTotalAnual = proyecto.productos.reduce(
      (acc, p) => acc + p.cantidadAnio1,
      0
    );
    const costoDirectoUnitario = proyecto.costosDirectos.reduce(
      (acc, c) => acc + c.cantidadPorUnidad * c.costoUnitario,
      0
    );
    const costosProduccionAnioBase = costoDirectoUnitario * cantidadTotalAnual;

    // 4. Financiamiento
    const wacc = calcularWACC({
      porcentajeDeuda: proyecto.financiamiento.porcentajePrestamo,
      porcentajeCapital: proyecto.financiamiento.porcentajePropio,
      tasaInteresDeuda: proyecto.financiamiento.tasaInteresAnual,
      costoOportunidadAccionista: proyecto.financiamiento.costoOportunidadAccionista,
      tasaImpuesto: 0.25,
    });

    // 5. Proyección 5 años con crecimiento
    const filas: Array<{
      anio: number;
      ingresos: number;
      costos: number;
      utilidadNeta: number;
      flujoCaja: number;
    }> = [];

    const gIngresos = proyecto.crecimientoIngresosAnual;
    const gCostos = proyecto.crecimientoCostosAnual;

    for (let a = 1; a <= 5; a++) {
      const ingresos = ingresosAnioBase * Math.pow(1 + gIngresos, a - 1);
      const costosProduccion = costosProduccionAnioBase * Math.pow(1 + gCostos, a - 1);
      const costosAdmin = costoAdminAnual * Math.pow(1 + gCostos, a - 1);
      const costosComerc = costoComercAnual * Math.pow(1 + gCostos, a - 1);
      const personal = costoPersonalAnual * Math.pow(1 + gCostos, a - 1);
      const imprevistos =
        (costosProduccion + costosAdmin + costosComerc + personal) *
        proyecto.imprevistosPorcentaje;

      const fc = calcularFlujoCajaAnual({
        ingresos,
        costosProduccion: costosProduccion + personal,
        costosAdministracion: costosAdmin,
        costosComercializacion: costosComerc,
        depreciacion: depreciacionAnual,
        imprevistos,
        interesDeuda: 0, // simplificado: no descontamos interés en este resumen
        amortizacionDeuda: 0,
        tasaImpuesto: 0.25,
      });

      filas.push({
        anio: a,
        ingresos,
        costos: costosProduccion + costosAdmin + costosComerc + personal + imprevistos,
        utilidadNeta: fc.utilidadNeta,
        flujoCaja: fc.flujoCaja,
      });
    }

    // 6. Indicadores (flujos incluyendo año 0 con la inversión negativa)
    const flujos = [-inversionInicial, ...filas.map((f) => f.flujoCaja)];
    const tasaDescuento = wacc > 0 ? wacc : 0.10;
    const van = calcularVAN(flujos, tasaDescuento);
    const tir = calcularTIR(flujos);
    const payback = calcularPayback(flujos);
    const ir = calcularIR(flujos, tasaDescuento);

    return {
      proyeccion: filas,
      indicadores: { inversionInicial, van, tir, payback, ir, tasaDescuento },
      wacc,
    };
  }, [proyecto]);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-lg font-semibold tracking-tight">Paso 10 · Resumen y proyección</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Indicadores calculados en vivo. Cuando estés conforme, envías a simulación.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Indicador
            titulo="VAN"
            valor={formatearBolivianos(indicadores.van)}
            positivo={indicadores.van > 0}
            ayuda={`Tasa descuento ${(indicadores.tasaDescuento * 100).toFixed(2)}%`}
          />
          <Indicador
            titulo="TIR"
            valor={isFinite(indicadores.tir) ? `${(indicadores.tir * 100).toFixed(2)}%` : "—"}
            positivo={isFinite(indicadores.tir) && indicadores.tir > indicadores.tasaDescuento}
            ayuda={`vs WACC ${(wacc * 100).toFixed(2)}%`}
          />
          <Indicador
            titulo="Payback"
            valor={indicadores.payback < 0 ? "No se recupera" : `${indicadores.payback.toFixed(1)} años`}
            positivo={indicadores.payback > 0 && indicadores.payback <= 5}
            ayuda="Periodo de recuperación"
          />
          <Indicador
            titulo="IR"
            valor={indicadores.ir.toFixed(2)}
            positivo={indicadores.ir > 1}
            ayuda="Índice de rentabilidad"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="mb-2 text-sm font-medium">Flujo de caja proyectado (5 años)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={proyeccion}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="anio" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
              <Tooltip
                formatter={(v: number) => formatearBolivianos(v)}
                labelFormatter={(l) => `Año ${l}`}
              />
              <Bar dataKey="flujoCaja" fill="hsl(var(--primary))" name="Flujo caja" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <h3 className="mb-2 text-sm font-medium">Ingresos vs Costos</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={proyeccion}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="anio" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
              <Tooltip
                formatter={(v: number) => formatearBolivianos(v)}
                labelFormatter={(l) => `Año ${l}`}
              />
              <Legend />
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
            condiciones clásicas de un proyecto rentable. El <strong>payback</strong> nos
            dice qué tan rápido recuperás la inversión (sensibilidad al riesgo).
            <br />
            <span className="text-amber-800/80 dark:text-amber-300/80">
              Recordá: estos números son tu <em>proyección</em>. La simulación de 5 años
              con eventos económicos bolivianos puede mover mucho estos valores.
            </span>
          </>
        }
      />
    </div>
  );
}

function Indicador({
  titulo,
  valor,
  positivo,
  ayuda,
}: {
  titulo: string;
  valor: string;
  positivo: boolean;
  ayuda: string;
}) {
  return (
    <div className="rounded-md border border-border p-3">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{titulo}</div>
      <div
        className={`mt-1 text-lg font-semibold ${
          positivo ? "text-emerald-700 dark:text-emerald-400" : "text-destructive"
        }`}
      >
        {valor}
      </div>
      <div className="text-[10px] text-muted-foreground">{ayuda}</div>
    </div>
  );
}
