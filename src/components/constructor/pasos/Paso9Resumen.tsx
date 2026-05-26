import { useMemo, type ReactNode } from "react";
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
import BotonEntregar from "../BotonEntregar";
import {
  calcularAportesPatronales,
  calcularCuotaPrestamoFrancesa,
  calcularFlujoInversionista,
  calcularGAF,
  calcularGAO,
  calcularGAT,
  calcularIR,
  calcularPayback,
  calcularPaybackDescontado,
  calcularPuntoEquilibrio,
  calcularRBC,
  calcularSensibilidad,
  calcularServicioDeuda,
  calcularTIR,
  calcularTRC,
  calcularVAN,
  calcularWACC,
  obtenerTasasAportes,
  TASA_IUE,
} from "@/lib/calculo-financiero";
import { formatearBolivianos, cn } from "@/lib/utils";

const ANIOS = [1, 2, 3, 4, 5] as const;

export default function Paso9Resumen() {
  const proyecto = useProyectoStore((s) => s.proyecto)!;

  const calc = useMemo(() => construirFlujoCaja(proyecto), [proyecto]);

  return (
    <div className="space-y-4">
      <BotonEntregar
        indicadores={{
          van: calc.indicadores.van,
          tir: isFinite(calc.indicadores.tir) ? calc.indicadores.tir : 0,
          wacc: calc.wacc,
          payback: isFinite(calc.indicadores.payback) ? calc.indicadores.payback : 0,
        }}
      />

      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="text-lg font-semibold tracking-tight">Paso 9 · Resumen y flujo de caja</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Consolidación de todos los pasos anteriores. Si quieres cambiar algo, vuelve al
          paso correspondiente — esta vista se recalcula sola.
        </p>

        {/* Indicadores principales */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <CardIndicador
            sigla="VAN"
            nombre="Valor Actual Neto"
            valor={formatearBolivianos(calc.indicadores.van)}
            positivo={calc.indicadores.van > 0}
            pregunta="¿Cuánta plata extra te deja el proyecto?"
            interpretacion={
              calc.indicadores.van > 0
                ? "✓ Positivo: el proyecto crea valor"
                : "✗ Negativo: el proyecto destruye valor"
            }
            tooltip={`VAN = Σ FCt / (1+WACC)^t  desde t=0 hasta t=5\nTu VAN descontado al ${(calc.wacc * 100).toFixed(2)}%: ${formatearBolivianos(calc.indicadores.van)}\n\nRegla: VAN > 0 acepta · VAN < 0 rechaza`}
          />
          <CardIndicador
            sigla="TIR"
            nombre="Tasa Interna de Retorno"
            valor={
              isFinite(calc.indicadores.tir)
                ? `${(calc.indicadores.tir * 100).toFixed(2)}%`
                : "—"
            }
            positivo={isFinite(calc.indicadores.tir) && calc.indicadores.tir > calc.wacc}
            pregunta="¿Cuánto rinde el proyecto al año?"
            interpretacion={
              !isFinite(calc.indicadores.tir)
                ? "✗ No se puede calcular (flujos malos)"
                : calc.indicadores.tir > calc.wacc
                  ? `✓ Supera el WACC (${(calc.wacc * 100).toFixed(2)}%)`
                  : `✗ Menor al WACC (${(calc.wacc * 100).toFixed(2)}%)`
            }
            tooltip={`TIR = tasa que hace VAN = 0.\n\nSi TIR > WACC: proyecto rentable, ACEPTAR.\nSi TIR < WACC: proyecto NO rentable, rechazar.\n\nSi muestra "—" los flujos no permiten calcularla.`}
          />
          <CardIndicador
            sigla="PAYBACK"
            nombre="Período de recuperación"
            valor={
              calc.indicadores.payback < 0
                ? "No recupera"
                : `${calc.indicadores.payback.toFixed(1)} años`
            }
            positivo={calc.indicadores.payback > 0 && calc.indicadores.payback <= 5}
            pregunta="¿En cuánto tiempo recuperas tu plata?"
            interpretacion={
              calc.indicadores.payback < 0
                ? "✗ Nunca recupera en 5 años"
                : calc.indicadores.payback <= 5
                  ? "✓ Recupera dentro del horizonte"
                  : "⚠ Tarda más de 5 años"
            }
            tooltip="Cuántos años tarda el proyecto en devolverte la inversión inicial (suma de flujos hasta cruzar cero)."
          />
          <CardIndicador
            sigla="TRC"
            nombre="Tasa de Retorno Contable"
            valor={
              isFinite(calc.indicadores.trc)
                ? `${(calc.indicadores.trc * 100).toFixed(2)}%`
                : "—"
            }
            positivo={calc.indicadores.trc > 0}
            pregunta="¿Qué % de utilidad contable da por año?"
            interpretacion={
              calc.indicadores.trc > 0
                ? "✓ Utilidad contable positiva"
                : "✗ El proyecto pierde plata contablemente"
            }
            tooltip={`TRC = utilidad neta promedio ÷ inversión total\n\nNo descuenta el dinero en el tiempo, así que es menos riguroso que la TIR. Sirve como referencia contable rápida (también llamada ARR).`}
          />
          <CardIndicador
            sigla="SD"
            nombre="Servicio de la Deuda"
            valor={
              isFinite(calc.indicadores.sd)
                ? `${calc.indicadores.sd.toFixed(2)} veces`
                : "Sin deuda"
            }
            positivo={calc.indicadores.sd >= 1}
            pregunta="¿Cuántas veces el flujo cubre la cuota del banco?"
            interpretacion={
              !isFinite(calc.indicadores.sd)
                ? "— No tienes préstamos"
                : calc.indicadores.sd >= 1.5
                  ? "✓ Cobertura cómoda"
                  : calc.indicadores.sd >= 1
                    ? "⚠ Justa, sin margen"
                    : "✗ No alcanza, no podrías pagar"
            }
            tooltip={`SD (o DSCR) = flujo de caja operativo promedio ÷ cuota anual del préstamo.\n\nSi SD > 1: el proyecto genera suficiente caja para pagar la deuda.\nSi SD < 1: NO alcanza.\n\nCuota anual referencia (año 1): ${formatearBolivianos(calc.indicadores.cuotaAnualTotal)}`}
          />
          <CardIndicador
            sigla="IR"
            nombre="Índice de Rentabilidad"
            valor={calc.indicadores.ir.toFixed(2)}
            positivo={calc.indicadores.ir > 1}
            pregunta="¿Cuántos Bs ganas por cada Bs invertido?"
            interpretacion={
              calc.indicadores.ir > 1
                ? `✓ Por cada Bs invertido recuperas Bs ${calc.indicadores.ir.toFixed(2)}`
                : "✗ No recuperas ni 1 Bs por cada Bs invertido"
            }
            tooltip="IR = VP(flujos positivos) ÷ inversión inicial.\n\nSi IR > 1: rentable, acepta.\nSi IR < 1: pierdes valor."
          />
          <CardIndicador
            sigla="RBC"
            nombre="Relación Beneficio/Costo"
            valor={
              isFinite(calc.indicadores.rbc)
                ? calc.indicadores.rbc.toFixed(2)
                : "—"
            }
            positivo={calc.indicadores.rbc > 1}
            pregunta="¿Cuántos Bs ingresas por cada Bs gastado?"
            interpretacion={
              calc.indicadores.rbc > 1
                ? `✓ Por cada Bs de costo, ingresas Bs ${calc.indicadores.rbc.toFixed(2)}`
                : "✗ Gastas más de lo que ingresas"
            }
            tooltip="RBC = VP(ingresos) ÷ VP(todos los costos, impuestos e intereses).\n\nSi RBC > 1: el negocio es eficiente. Si RBC < 1: gastas más de lo que generas."
          />
          <CardIndicador
            sigla="WACC"
            nombre="Costo Promedio Ponderado de Capital"
            valor={`${(calc.wacc * 100).toFixed(2)}%`}
            positivo
            pregunta="¿Qué rentabilidad mínima debe dar el proyecto?"
            interpretacion="Es la vara que la TIR debe superar"
            tooltip="WACC = (D/V × Kd × (1−T)) + (E/V × Ke)\n\nTasa mínima exigida al proyecto. Se usa como tasa de descuento del VAN y se compara con la TIR."
          />
        </div>
      </div>

      {/* ANÁLISIS AVANZADO V2 — solo si el proyecto es versión extendida */}
      {proyecto.version === "v2" && <AnalisisAvanzadoV2 proyecto={proyecto} calc={calc} />}

      {/* TABLA FLUJO DE CAJA con secciones de color */}
      <div className="overflow-x-auto rounded-lg border border-border bg-card p-4">
        <h3 className="mb-3 text-sm font-semibold">Flujo de caja proyectado (Bs)</h3>
        <table className="w-full min-w-[700px] text-xs">
          <thead className="text-muted-foreground">
            <tr className="border-b-2 border-border">
              <th className="p-1.5 text-left">Concepto</th>
              <th className="p-1.5 text-right">Año 0</th>
              {ANIOS.map((a) => (
                <th key={a} className="p-1.5 text-right">Año {a}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* ── 1. INGRESOS (verde) ─────────────────────────────────── */}
            <FilaSeccion label="① INGRESOS" color="emerald" />
            <FilaFlujo
              label="(+) Ingresos por ventas"
              valores={[0, ...calc.ingresos]}
              signo="+"
              fila="emerald"
            />

            {/* ── 2. COSTOS Y GASTOS OPERATIVOS (rojo) ───────────────── */}
            <FilaSeccion label="② COSTOS Y GASTOS OPERATIVOS" color="rose" />
            <FilaFlujo
              label="(-) Costos de producción"
              valores={[0, ...calc.costosProduccion]}
              signo="-"
              fila="rose"
            />
            <FilaFlujo
              label="(-) Gastos administrativos"
              valores={[0, ...calc.gastosAdmin]}
              signo="-"
              fila="rose"
            />
            <FilaFlujo
              label="(-) Gastos comercialización"
              valores={[0, ...calc.gastosComerc]}
              signo="-"
              fila="rose"
            />
            <FilaFlujo
              label="(-) Personal (con aportes 30.37%)"
              valores={[0, ...calc.personal]}
              signo="-"
              fila="rose"
            />
            <FilaFlujo
              label="(-) Depreciación (no efectivo)"
              valores={[0, ...calc.depreciacion]}
              signo="-"
              fila="rose"
            />
            <FilaFlujo
              label="(-) Imprevistos"
              valores={[0, ...calc.imprevistos]}
              signo="-"
              fila="rose"
            />
            <FilaFlujo
              label="(-) Intereses de la deuda"
              valores={[0, ...calc.intereses]}
              signo="-"
              fila="rose"
            />

            {/* ── 3. RESULTADO ANTES DE IMPUESTOS Y NETO (violeta) ──── */}
            <FilaSeccion label="③ RESULTADO E IMPUESTOS" color="violet" />
            <FilaFlujo
              label="= Utilidad antes de impuestos"
              valores={[0, ...calc.utilidadAAI]}
              destacada
              fila="violet"
            />
            <FilaFlujo
              label="(-) Impuestos (IUE 25%)"
              valores={[0, ...calc.impuestos]}
              signo="-"
              fila="violet"
            />
            <FilaFlujo
              label="= Utilidad neta"
              valores={[0, ...calc.utilidadNeta]}
              destacada
              fila="violet"
            />

            {/* ── 4. AJUSTES A FLUJO DE CAJA (gris/azul) ─────────────── */}
            <FilaSeccion label="④ AJUSTES A FLUJO DE CAJA" color="sky" />
            <FilaFlujo
              label="(+) Depreciación (se reintegra, no salió de caja)"
              valores={[0, ...calc.depreciacion]}
              signo="+"
              fila="sky"
            />
            <FilaFlujo
              label="(-) Inversión inicial (activos fijos)"
              valores={[-calc.inversionInicial, 0, 0, 0, 0, 0]}
              signo="-"
              fila="sky"
            />
            <FilaFlujo
              label="(-) Capital de trabajo"
              valores={[-calc.capitalTrabajo, 0, 0, 0, 0, 0]}
              signo="-"
              fila="sky"
            />
            <FilaFlujo
              label="(+) Préstamo recibido"
              valores={[calc.montoPrestamo, 0, 0, 0, 0, 0]}
              signo="+"
              fila="sky"
            />
            <FilaFlujo
              label="(-) Amortización de capital de la deuda"
              valores={[0, ...calc.amortizacion]}
              signo="-"
              fila="sky"
            />
            <FilaFlujo
              label="(+) Valor residual (año 5)"
              valores={[0, 0, 0, 0, 0, calc.valorResidual]}
              signo="+"
              fila="sky"
            />
            <FilaFlujo
              label="(+) Recuperación capital de trabajo (año 5)"
              valores={[0, 0, 0, 0, 0, calc.capitalTrabajo]}
              signo="+"
              fila="sky"
            />

            {/* ── 5. FLUJO DE CAJA TOTAL (destacado primario) ────────── */}
            <FilaSeccion label="⑤ FLUJO DE CAJA NETO" color="primary" />
            <FilaFlujo
              label="FLUJO DE CAJA"
              valores={calc.flujoCaja}
              destacada
              top
              fila="primary"
            />
          </tbody>
        </table>

        {/* Leyenda de colores */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
          <span className="font-semibold">Leyenda:</span>
          <LeyendaColor color="emerald" texto="① Ingresos" />
          <LeyendaColor color="rose" texto="② Costos operativos" />
          <LeyendaColor color="violet" texto="③ Resultado e impuestos" />
          <LeyendaColor color="sky" texto="④ Ajustes de caja" />
          <LeyendaColor color="primary" texto="⑤ Flujo de caja neto" />
        </div>
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

// ============================================================================
// ANÁLISIS AVANZADO (V2) — solo se renderiza para proyectos versión extendida
// ============================================================================
function AnalisisAvanzadoV2({
  proyecto,
  calc,
}: {
  proyecto: any;
  calc: ReturnType<typeof construirFlujoCaja>;
}) {
  const v2 = useMemo(() => calcularV2(proyecto, calc), [proyecto, calc]);

  const fmtRatio = (n: number) =>
    isFinite(n) ? `${n.toFixed(2)}×` : "—";
  const fmtPct = (n: number) =>
    isFinite(n) ? `${(n * 100).toFixed(2)}%` : "—";

  return (
    <div className="rounded-lg border-2 border-indigo-300 bg-indigo-50/40 p-6 dark:border-indigo-800 dark:bg-indigo-950/20">
      <div className="flex items-center gap-2">
        <span className="rounded bg-indigo-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
          V2
        </span>
        <h3 className="text-base font-semibold tracking-tight">Análisis avanzado</h3>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Indicadores adicionales de la versión extendida. No reemplazan a los de
        arriba: los complementan.
      </p>

      {/* Glosario rápido de las siglas del panel V2 */}
      <details className="mt-3 max-w-4xl rounded-md border border-border bg-card p-2 text-[11px]">
        <summary className="cursor-pointer font-semibold text-foreground">
          📖 ¿Qué significan estas siglas? (clic para abrir)
        </summary>
        <div className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
          <div className="rounded bg-secondary/40 px-2 py-1">
            <strong className="font-mono">PE</strong> · Punto de equilibrio — cuántas
            unidades debes vender para no ganar ni perder.
          </div>
          <div className="rounded bg-secondary/40 px-2 py-1">
            <strong className="font-mono">PBD</strong> · Payback descontado — en cuántos
            años recuperas la inversión, ya descontando el valor del dinero en el tiempo.
          </div>
          <div className="rounded bg-secondary/40 px-2 py-1">
            <strong className="font-mono">GAO</strong> · Apalancamiento operativo — cuánto
            amplifican tus <em>costos fijos</em> el efecto de un cambio en ventas.
          </div>
          <div className="rounded bg-secondary/40 px-2 py-1">
            <strong className="font-mono">GAF</strong> · Apalancamiento financiero — cuánto
            amplifica la <em>deuda</em> ese efecto sobre la ganancia del dueño.
          </div>
          <div className="rounded bg-secondary/40 px-2 py-1">
            <strong className="font-mono">GAT</strong> · Apalancamiento total = GAO × GAF.
            Si vale 3×, una subida de 1% en ventas mueve ~3% la ganancia del dueño.
          </div>
          <div className="rounded bg-secondary/40 px-2 py-1">
            <strong className="font-mono">VAN·INV</strong> · compara el VAN del{" "}
            <em>negocio entero</em> (al WACC) contra el de <em>tu parte</em> como dueño
            tras pagar la deuda (al Ke). Si tu parte vale más, la deuda te conviene.
          </div>
        </div>
      </details>

      {/* Tarjetas colapsables — cada una muestra solo el titular; se despliega para ver el detalle */}
      <div className="mt-4 grid max-w-4xl grid-cols-1 gap-2 sm:grid-cols-2">
        <V2Card
          sigla="PE"
          nombre="Punto de equilibrio"
          valor={
            isFinite(v2.puntoEquilibrio.unidades)
              ? `${Math.ceil(v2.puntoEquilibrio.unidades).toLocaleString("es-BO")} u`
              : "No equilibra"
          }
          positivo={isFinite(v2.puntoEquilibrio.unidades) && v2.puntoEquilibrio.unidades <= v2.unidadesAnio1}
        >
          <p className="text-[11px] text-muted-foreground">
            <strong>¿Qué es?</strong> Cuántas unidades necesitas vender para no ganar ni
            perder (cubrir todos tus costos). Por debajo de ese número pierdes plata; por
            encima, empiezas a ganar.
          </p>
          <div className="mt-2 space-y-0.5 text-[11px]">
            <FilaDetalle k="En dinero (Bs)" v={isFinite(v2.puntoEquilibrio.ingresoBs) ? formatearBolivianos(v2.puntoEquilibrio.ingresoBs) : "—"} />
            <FilaDetalle k="Margen de contribución" v={`${(v2.puntoEquilibrio.ratioMargenContribucion * 100).toFixed(1)}% del precio`} />
            <FilaDetalle k="Tu venta del año 1" v={`${v2.unidadesAnio1.toLocaleString("es-BO")} u`} />
          </div>
          <div className="mt-1.5 text-[10px] font-medium text-muted-foreground">
            {!isFinite(v2.puntoEquilibrio.unidades)
              ? "✗ Cada unidad pierde plata (sin margen)."
              : v2.puntoEquilibrio.unidades <= v2.unidadesAnio1
                ? "✓ Vendes más que el punto de equilibrio → ganas."
                : "⚠ Vendes menos que el punto de equilibrio → pierdes."}
          </div>
        </V2Card>

        <V2Card
          sigla="PBD"
          nombre="Payback descontado"
          valor={v2.paybackDescontado < 0 ? "No recupera" : `${v2.paybackDescontado.toFixed(1)} años`}
          positivo={v2.paybackDescontado > 0 && v2.paybackDescontado <= 5}
        >
          <p className="text-[11px] text-muted-foreground">
            <strong>¿Qué es?</strong> En cuántos años recuperas tu inversión, pero contando
            que el dinero de mañana vale menos que el de hoy (lo "descuenta" al WACC{" "}
            {(calc.wacc * 100).toFixed(1)}%). Por eso siempre tarda un poco más que el
            payback normal.
          </p>
          <div className="mt-1.5 text-[10px] font-medium text-muted-foreground">
            {v2.paybackDescontado < 0
              ? "✗ No recupera en los 5 años."
              : v2.paybackDescontado <= 5
                ? "✓ Recupera dentro del horizonte de 5 años."
                : "⚠ Tarda más de 5 años en recuperar."}
          </div>
        </V2Card>

        <V2Card
          sigla="APAL"
          nombre="Apalancamiento"
          valor={isFinite(v2.gat) ? `${v2.gat.toFixed(2)}×` : "—"}
          positivo
        >
          <p className="text-[11px] text-muted-foreground">
            <strong>¿Qué es?</strong> Mide cuánto se <em>amplifican</em> tus ganancias (y
            también tus pérdidas) cuando cambian las ventas. Los costos fijos y la deuda
            actúan como una palanca: magnifican lo bueno y lo malo. Más alto = más sensible
            = más riesgo.
          </p>
          <div className="mt-2 space-y-0.5 text-[11px]">
            <FilaDetalle k="GAO · por tus costos fijos" v={fmtRatio(v2.gao)} />
            <FilaDetalle k="GAF · por la deuda" v={fmtRatio(v2.gaf)} />
            <FilaDetalle k="GAT · total (GAO × GAF)" v={fmtRatio(v2.gat)} />
          </div>
          <div className="mt-1.5 text-[10px] font-medium leading-snug text-muted-foreground">
            {isFinite(v2.gat)
              ? `En palabras: si tus ventas suben (o bajan) 1%, la ganancia del dueño sube (o baja) ~${v2.gat.toFixed(1)}%.`
              : "No calculable con los datos actuales."}
          </div>
        </V2Card>

        <V2Card
          sigla="VAN·INV"
          nombre="Inversionista (proyecto vs dueño)"
          valor={formatearBolivianos(v2.flujoInv.vanAccionista)}
          positivo={v2.flujoInv.vanAccionista >= 0}
        >
          <p className="text-[11px] text-muted-foreground">
            <strong>¿Qué es?</strong> Hay dos formas de medir la ganancia: la del{" "}
            <strong>negocio entero</strong> (como si lo pagaras todo de tu bolsillo) y la de{" "}
            <strong>tu parte como dueño</strong> (lo que te queda después de pagarle al
            banco). Si tu parte vale más que el negocio entero, endeudarte te conviene; si
            vale menos, la deuda no te suma.
          </p>
          <div className="mt-2 space-y-1 text-[11px]">
            <div className="flex items-start justify-between gap-2">
              <span className="text-muted-foreground leading-tight">
                VAN del proyecto<br />
                <span className="text-[9px] opacity-70">negocio entero · descontado al WACC {(calc.wacc * 100).toFixed(1)}%</span>
              </span>
              <span className={cn("font-semibold tabular-nums", v2.flujoInv.vanProyecto >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-destructive")}>{formatearBolivianos(v2.flujoInv.vanProyecto)}</span>
            </div>
            <div className="flex items-start justify-between gap-2">
              <span className="text-muted-foreground leading-tight">
                VAN de tu parte (accionista)<br />
                <span className="text-[9px] opacity-70">tras pagar la deuda · descontado al Ke {(proyecto.financiamiento.costoOportunidadAccionista * 100).toFixed(1)}%</span>
              </span>
              <span className={cn("font-semibold tabular-nums", v2.flujoInv.vanAccionista >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-destructive")}>{formatearBolivianos(v2.flujoInv.vanAccionista)}</span>
            </div>
          </div>
          <div className="mt-1.5 text-[10px] font-medium leading-snug text-muted-foreground">
            {v2.flujoInv.vanAccionista > v2.flujoInv.vanProyecto
              ? "✓ Tu parte vale más que el negocio entero: la deuda te conviene."
              : "⚠ Tu parte no supera al negocio entero: la deuda no te suma valor."}
          </div>
        </V2Card>
      </div>

      {/* Tabla de sensibilidad — colapsable */}
      <details className="mt-3 max-w-4xl overflow-hidden rounded-md border border-border bg-card">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 p-3 hover:bg-secondary/40">
          <span className="text-sm font-semibold">
            Análisis de sensibilidad del VAN — "¿qué pasaría si…?"
          </span>
          <span className="flex-shrink-0 text-[10px] text-muted-foreground">▸ ver / ▾ ocultar</span>
        </summary>
        <div className="overflow-x-auto p-4 pt-0">
        <p className="mb-1 text-[11px] leading-snug text-muted-foreground">
          Cada <strong>fila</strong> es una variable de tu proyecto. Cada{" "}
          <strong>columna</strong> dice cuánto sería el VAN si esa variable{" "}
          <strong>subiera o bajara</strong> ese porcentaje, dejando todo lo demás igual.
          La columna del medio (<strong>Base</strong>) es tu VAN actual sin cambios.
        </p>
        <p className="mb-3 text-[10px] italic text-muted-foreground">
          Sirve para ver qué variable es más peligrosa. Es estático — distinto de la
          simulación con eventos (inflación, bloqueos…).
        </p>

        {/* Leyenda de dirección */}
        <div className="mb-1 flex items-center justify-end gap-3 text-[9px] uppercase tracking-wide text-muted-foreground">
          <span>← la variable BAJA</span>
          <span>sin cambio</span>
          <span>la variable SUBE →</span>
        </div>

        <table className="w-full min-w-[520px] text-xs">
          <thead>
            <tr className="border-b-2 border-border text-muted-foreground">
              <th className="p-1.5 text-left font-medium">Si cambia…</th>
              {v2.variaciones.map((v) => (
                <th
                  key={v}
                  className={cn(
                    "p-1.5 text-right font-medium",
                    v === 0 && "bg-secondary/50 text-foreground"
                  )}
                >
                  {v === 0 ? "Base (hoy)" : `${v > 0 ? "+" : "−"}${Math.abs(v * 100).toFixed(0)}%`}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {v2.sensVariables.map((sv) => (
              <FilaSensibilidadVAN key={sv.label} label={sv.label} filas={sv.filas} />
            ))}
          </tbody>
        </table>

        {/* Lectura guiada con ejemplo real */}
        <div className="mt-3 space-y-1.5 rounded-md bg-secondary/30 p-2.5 text-[11px]">
          <div>
            <strong>Cómo leerla:</strong> {v2.lectura}
          </div>
          <div>
            <strong>Más peligrosa:</strong> {v2.masPeligrosa}. Es la variable que más
            mueve tu VAN, así que es la que más debes cuidar.
          </div>
        </div>

        <div className="mt-2 text-[10px] text-muted-foreground">
          Verde = el proyecto sigue creando valor (VAN &gt; 0) · Rojo = destruye valor
          (VAN &lt; 0). VAN base: <strong>{formatearBolivianos(calc.indicadores.van)}</strong> ·
          descontado al WACC {fmtPct(calc.wacc)}.
        </div>
        </div>
      </details>
    </div>
  );
}

function V2Card({
  sigla,
  nombre,
  valor,
  positivo,
  children,
}: {
  sigla: string;
  nombre: string;
  valor: string;
  positivo: boolean;
  children: ReactNode;
}) {
  return (
    <details className="group rounded-md border border-border bg-card">
      <summary className="flex cursor-pointer list-none items-center gap-2 p-2.5 hover:bg-secondary/40">
        <span className="min-w-0 flex-1">
          <span className="font-mono text-sm font-bold tracking-tight">{sigla}</span>
          <span className="ml-1.5 text-[10px] uppercase tracking-wide text-muted-foreground">
            {nombre}
          </span>
          <span
            className={cn(
              "ml-2 text-base font-bold tabular-nums",
              positivo ? "text-emerald-700 dark:text-emerald-400" : "text-destructive"
            )}
          >
            {valor}
          </span>
        </span>
        <span className="flex-shrink-0 text-[10px] text-muted-foreground">
          <span className="group-open:hidden">▸ ver</span>
          <span className="hidden group-open:inline">▾ ocultar</span>
        </span>
      </summary>
      <div className="border-t border-border/60 p-3 pt-2">{children}</div>
    </details>
  );
}

function FilaDetalle({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-semibold tabular-nums">{v}</span>
    </div>
  );
}

function FilaSensibilidadVAN({
  label,
  filas,
}: {
  label: string;
  filas: { variacion: number; van: number }[];
}) {
  return (
    <tr className="border-b border-border/40">
      <td className="p-1.5 font-medium">{label}</td>
      {filas.map((f) => (
        <td
          key={f.variacion}
          className={cn(
            "p-1.5 text-right tabular-nums",
            f.van < 0
              ? "text-destructive"
              : "text-emerald-700 dark:text-emerald-400",
            f.variacion === 0 && "bg-secondary/50 font-semibold"
          )}
        >
          {formatearBolivianos(f.van)}
        </td>
      ))}
    </tr>
  );
}

// Calcula todos los indicadores V2 a partir del flujo de caja ya construido.
function calcularV2(proyecto: any, calc: ReturnType<typeof construirFlujoCaja>) {
  // ── Punto de equilibrio (año 1) ──────────────────────────────────────────
  const ingA1 = calc.ingresos[0];
  const costosVariablesAnio1 = calc.costosProduccion[0]; // costos directos = varían con la producción
  const costosFijosAnio1 =
    calc.personal[0] +
    calc.gastosAdmin[0] +
    calc.gastosComerc[0] +
    calc.depreciacion[0] +
    calc.imprevistos[0] +
    calc.intereses[0];
  const unidadesAnio1 = proyecto.productos.reduce(
    (a: number, p: any) => a + (p.cantidades?.[0] ?? p.cantidadAnio1 ?? 0),
    0
  );
  const precioPromedio = unidadesAnio1 > 0 ? ingA1 / unidadesAnio1 : 0;
  const costoVariableUnitProm = unidadesAnio1 > 0 ? costosVariablesAnio1 / unidadesAnio1 : 0;
  const puntoEquilibrio = calcularPuntoEquilibrio(
    costosFijosAnio1,
    precioPromedio,
    costoVariableUnitProm
  );

  // ── Payback descontado ───────────────────────────────────────────────────
  const tasa = calc.wacc > 0 ? calc.wacc : 0.1;
  const paybackDescontado = calcularPaybackDescontado(calc.flujoCaja, tasa);

  // ── Apalancamiento (año 1) ───────────────────────────────────────────────
  const margenContribucion = ingA1 - costosVariablesAnio1;
  const ebitAnio1 = calc.utilidadAAI[0] + calc.intereses[0];
  const gao = calcularGAO(margenContribucion, ebitAnio1);
  const gaf = calcularGAF(ebitAnio1, calc.intereses[0]);
  const gat = calcularGAT(margenContribucion, ebitAnio1, calc.intereses[0]);

  // ── Flujo del inversionista (proyecto vs accionista) ─────────────────────
  const ebitArr = calc.utilidadAAI.map((u: number, i: number) => u + calc.intereses[i]);
  const flujoInv = calcularFlujoInversionista({
    inversionTotal: calc.inversionInicial + calc.capitalTrabajo,
    montoPrestamo: calc.montoPrestamo,
    ebit: ebitArr,
    depreciacion: calc.depreciacion,
    intereses: calc.intereses,
    amortizacion: calc.amortizacion,
    tasaImpuesto: TASA_IUE,
    extrasUltimoAnio: calc.valorResidual + calc.capitalTrabajo,
    wacc: tasa,
    koa: proyecto.financiamiento.costoOportunidadAccionista,
  });

  // ── Sensibilidad: 5 variables, cada una recalcula los flujos ─────────────
  const variaciones = [-0.2, -0.1, 0, 0.1, 0.2];
  const pct = proyecto.imprevistosPorcentaje ?? 0;
  // Recalcula el flujo aplicando factores independientes a cada variable.
  //  - precio: solo escala los ingresos.
  //  - cantidad: escala ingresos Y los costos variables (producir más cuesta más).
  //  - costoVar: escala los costos de producción.
  //  - costoFijo: escala personal + admin + comercialización.
  const flujoVar = (
    fPrecio: number,
    fCantidad: number,
    fCostoVar: number,
    fCostoFijo: number
  ): number[] => {
    const flujos: number[] = [calc.flujoCaja[0]]; // año 0 = inversión, no cambia
    for (let i = 0; i < 5; i++) {
      const ing = calc.ingresos[i] * (1 + fPrecio) * (1 + fCantidad);
      const cVar = calc.costosProduccion[i] * (1 + fCantidad) * (1 + fCostoVar);
      const cFijo =
        (calc.gastosAdmin[i] + calc.gastosComerc[i] + calc.personal[i]) * (1 + fCostoFijo);
      const imprev = (cVar + cFijo) * pct;
      const uOp = ing - cVar - cFijo - imprev - calc.depreciacion[i];
      const aai = uOp - calc.intereses[i];
      const neta = aai - Math.max(0, aai) * TASA_IUE;
      let fc = neta + calc.depreciacion[i] - calc.amortizacion[i];
      if (i === 4) fc += calc.valorResidual + calc.capitalTrabajo;
      flujos.push(fc);
    }
    return flujos;
  };

  const sensVariables: { label: string; filas: { variacion: number; van: number }[] }[] = [
    { label: "Precio de venta", filas: calcularSensibilidad((f) => flujoVar(f, 0, 0, 0), tasa, variaciones) },
    { label: "Cantidad vendida", filas: calcularSensibilidad((f) => flujoVar(0, f, 0, 0), tasa, variaciones) },
    { label: "Costos variables (producción)", filas: calcularSensibilidad((f) => flujoVar(0, 0, f, 0), tasa, variaciones) },
    { label: "Costos fijos (personal + admin)", filas: calcularSensibilidad((f) => flujoVar(0, 0, 0, f), tasa, variaciones) },
    // WACC: no cambia los flujos, cambia la tasa de descuento.
    { label: "WACC (tasa de descuento)", filas: variaciones.map((v) => ({ variacion: v, van: calcularVAN(calc.flujoCaja, tasa * (1 + v)) })) },
  ];

  // ── Lectura guiada + variable más peligrosa ──────────────────────────────
  const fmtBs = (n: number) => `Bs ${Math.round(n).toLocaleString("es-BO")}`;
  const rango = (filas: { van: number }[]) =>
    Math.max(...filas.map((f) => f.van)) - Math.min(...filas.map((f) => f.van));
  let peligrosa = sensVariables[0];
  for (const sv of sensVariables) {
    if (rango(sv.filas) > rango(peligrosa.filas)) peligrosa = sv;
  }
  const peorVan = Math.min(...peligrosa.filas.map((f) => f.van));
  const lectura =
    `la variable que más mueve tu VAN es "${peligrosa.label}". En el peor escenario analizado (±20%), tu VAN caería hasta ${fmtBs(peorVan)}` +
    (peorVan < 0 ? " → llegaría a destruir valor (negativo)." : " → seguiría siendo positivo.");
  const masPeligrosa = peligrosa.label;

  return {
    puntoEquilibrio,
    costosFijosAnio1,
    costosVariablesAnio1,
    unidadesAnio1,
    paybackDescontado,
    gao,
    gaf,
    gat,
    flujoInv,
    variaciones,
    sensVariables,
    lectura,
    masPeligrosa,
  };
}

function CardIndicador({
  sigla,
  nombre,
  valor,
  positivo,
  pregunta,
  interpretacion,
  tooltip,
}: {
  sigla: string;
  nombre: string;
  valor: string;
  positivo: boolean;
  pregunta: string;
  interpretacion: string;
  tooltip?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-md border border-border p-3",
        tooltip && "cursor-help"
      )}
      title={tooltip}
    >
      {/* Encabezado: sigla técnica + nombre completo */}
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-sm font-bold tracking-tight">{sigla}</span>
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
          {nombre}
        </span>
        {tooltip && <span className="ml-auto text-[10px] opacity-60">ⓘ</span>}
      </div>

      {/* Pregunta que responde, en lenguaje simple */}
      <div className="mt-1 text-[10px] italic text-muted-foreground">{pregunta}</div>

      {/* Valor numérico destacado */}
      <div
        className={cn(
          "mt-1.5 text-xl font-bold tabular-nums",
          positivo ? "text-emerald-700 dark:text-emerald-400" : "text-destructive"
        )}
      >
        {valor}
      </div>

      {/* Interpretación en lenguaje plano (verde si bien, rojo si mal) */}
      <div
        className={cn(
          "mt-1 text-[10px] font-medium",
          positivo ? "text-emerald-700 dark:text-emerald-400" : "text-destructive"
        )}
      >
        {interpretacion}
      </div>
    </div>
  );
}

type ColorFila = "emerald" | "rose" | "violet" | "sky" | "primary";

const FILA_BG: Record<ColorFila, string> = {
  emerald: "bg-emerald-50/40 dark:bg-emerald-950/15",
  rose: "bg-rose-50/40 dark:bg-rose-950/15",
  violet: "bg-violet-50/40 dark:bg-violet-950/15",
  sky: "bg-sky-50/40 dark:bg-sky-950/15",
  primary: "bg-primary/10",
};

const FILA_BORDE_IZQ: Record<ColorFila, string> = {
  emerald: "border-l-4 border-l-emerald-500",
  rose: "border-l-4 border-l-rose-500",
  violet: "border-l-4 border-l-violet-500",
  sky: "border-l-4 border-l-sky-500",
  primary: "border-l-4 border-l-primary",
};

const SECCION_BG: Record<ColorFila, string> = {
  emerald: "bg-emerald-500 text-white",
  rose: "bg-rose-500 text-white",
  violet: "bg-violet-500 text-white",
  sky: "bg-sky-500 text-white",
  primary: "bg-primary text-primary-foreground",
};

function FilaSeccion({ label, color }: { label: string; color: ColorFila }) {
  return (
    <tr>
      <td
        colSpan={7}
        className={cn(
          "px-2 py-1 text-[10px] font-bold uppercase tracking-wider",
          SECCION_BG[color]
        )}
      >
        {label}
      </td>
    </tr>
  );
}

function LeyendaColor({ color, texto }: { color: ColorFila; texto: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className={cn("inline-block h-2.5 w-2.5 rounded", SECCION_BG[color])} />
      {texto}
    </span>
  );
}

function FilaFlujo({
  label,
  valores,
  destacada,
  top,
  fila,
}: {
  label: string;
  valores: number[];
  signo?: "+" | "-"; // Indicador visual ya viene en el label; no se usa internamente
  destacada?: boolean;
  top?: boolean;
  fila?: ColorFila;
}) {
  return (
    <tr
      className={cn(
        "border-b border-border/40",
        fila && FILA_BG[fila],
        fila && FILA_BORDE_IZQ[fila],
        destacada && (fila ? "font-semibold" : "bg-secondary/30 font-semibold"),
        top && "border-t-2 border-foreground"
      )}
    >
      <td className={cn("p-1.5", destacada && "font-semibold")}>{label}</td>
      {valores.map((v, i) => (
        <td
          key={i}
          className={cn(
            "p-1.5 text-right tabular-nums",
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

  // ── Inversión y depreciación ──────────────────────────────────────────────
  const inversionItems = Object.values(proyecto.inversiones).flat() as any[];
  const inversionInicial = inversionItems.reduce((a, it) => a + it.costoTotal, 0);
  const depreciacionAnual = inversionItems.reduce((a, it) => a + (it.depreciacionAnual ?? 0), 0);
  const valorResidual = inversionItems.reduce((a, it) => a + (it.valorResidual ?? 0), 0);

  // ── Financiamiento: DOS préstamos separados (activo fijo + capital op) ────
  const f = proyecto.financiamiento;
  const TASA_IMP = TASA_IUE;

  // Préstamo 1 — Activo fijo
  const montoPrestActivo = inversionInicial * (f?.porcentajePrestamo ?? 0);
  const cuotaMensualActivo =
    montoPrestActivo > 0 && f?.plazoMeses
      ? calcularCuotaPrestamoFrancesa(montoPrestActivo, f.tasaInteresAnual ?? 0, f.plazoMeses)
      : 0;

  // Préstamo 2 — Capital operativo
  const cwCfg = f?.prestamoCapitalTrabajo;
  const montoPrestCapital = proyecto.capitalTrabajo * (cwCfg?.porcentajePrestamo ?? 0);
  const cuotaMensualCapital =
    montoPrestCapital > 0 && cwCfg?.plazoMeses
      ? calcularCuotaPrestamoFrancesa(montoPrestCapital, cwCfg.tasaInteresAnual ?? 0, cwCfg.plazoMeses)
      : 0;

  const montoPrestamo = montoPrestActivo + montoPrestCapital;

  // Tabla de amortización por separado para cada préstamo, luego sumamos
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

  // Sumar año por año los dos préstamos
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

  // ── Costos directos POR PRODUCTO (fix del bug de mezcla) ─────────────────
  // El costo unitario también crece año a año por inflación de insumos.
  const g = proyecto.crecimientoCostosAnual;
  const costosProduccion = [0, 1, 2, 3, 4].map((i) => {
    const inflacion = Math.pow(1 + g, i);
    // Por cada producto: unidades_año_i × Σ (cantPorUnidad × costoUnit) de ESE producto
    const costoPorProducto = productos.reduce((acc: number, p: any) => {
      const unidadesProd = p.cantidades[i] ?? 0;
      const costoUnit = proyecto.costosDirectos
        .filter((c: any) => c.productoId === p.id)
        .reduce((a: number, c: any) => a + c.cantidadPorUnidad * c.costoUnitario, 0);
      return acc + unidadesProd * costoUnit * inflacion;
    }, 0);
    // Items huérfanos (sin productoId): prorratear contra todas las unidades
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

  // ── Personal proyectado: ahora crece también con la inflación de costos ──
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
    totalProyecto - montoPrestamo, // inversión inicial = costo año 0
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
