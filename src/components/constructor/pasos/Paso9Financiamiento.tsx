import { useProyectoStore } from "@/stores/proyecto-store";
import FichaPedagogica from "../FichaPedagogica";
import {
  calcularCuotaPrestamoFrancesa,
  calcularWACC,
  TASA_IUE,
} from "@/lib/calculo-financiero";
import { formatearBolivianos } from "@/lib/utils";

export default function Paso9Financiamiento() {
  const proyecto = useProyectoStore((s) => s.proyecto)!;
  const setFin = useProyectoStore((s) => s.setFinanciamiento);

  const f = proyecto.financiamiento;

  // Inversión total para calcular el monto del préstamo
  const inversionTotal =
    Object.values(proyecto.inversiones)
      .flat()
      .reduce((acc, it) => acc + it.costoTotal, 0) + proyecto.capitalTrabajo;

  const montoPrestamo = inversionTotal * f.porcentajePrestamo;
  const cuotaMensual = calcularCuotaPrestamoFrancesa(montoPrestamo, f.tasaInteresAnual, f.plazoMeses);

  const wacc = calcularWACC({
    porcentajeDeuda: f.porcentajePrestamo,
    porcentajeCapital: f.porcentajePropio,
    tasaInteresDeuda: f.tasaInteresAnual,
    costoOportunidadAccionista: f.costoOportunidadAccionista,
    tasaImpuesto: TASA_IUE,
  });

  const cambiarMezcla = (porcentajePrestamo: number) => {
    setFin({
      porcentajePrestamo,
      porcentajePropio: 1 - porcentajePrestamo,
    });
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
      <div className="space-y-5 rounded-lg border border-border bg-card p-6">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Paso 9 · Financiamiento</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Cómo financias tu inversión inicial de{" "}
            <strong>{formatearBolivianos(inversionTotal)}</strong>.
          </p>
        </div>

        {/* Mezcla deuda/capital */}
        <div className="space-y-2">
          <label htmlFor="p9-mezcla" className="text-sm font-medium">
            Mezcla de financiamiento
          </label>
          <input
            id="p9-mezcla"
            type="range"
            min={0}
            max={100}
            step={5}
            value={Math.round(f.porcentajePrestamo * 100)}
            onChange={(e) => cambiarMezcla(Number(e.target.value) / 100)}
            className="w-full"
          />
          <div className="flex justify-between text-xs">
            <span className="text-emerald-700 dark:text-emerald-400">
              Capital propio: <strong>{Math.round(f.porcentajePropio * 100)}%</strong>{" "}
              ({formatearBolivianos(inversionTotal * f.porcentajePropio)})
            </span>
            <span className="text-amber-700 dark:text-amber-400">
              Préstamo: <strong>{Math.round(f.porcentajePrestamo * 100)}%</strong>{" "}
              ({formatearBolivianos(montoPrestamo)})
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <CampoNumero
            id="p9-tasa"
            label="Tasa interés anual"
            sufijo="%"
            valor={Math.round(f.tasaInteresAnual * 1000) / 10}
            onChange={(v) => setFin({ tasaInteresAnual: v / 100 })}
            min={0}
            max={50}
            step={0.5}
          />
          <CampoNumero
            id="p9-plazo"
            label="Plazo (meses)"
            valor={f.plazoMeses}
            onChange={(v) => setFin({ plazoMeses: Math.max(1, Math.round(v)) })}
            min={1}
            max={120}
            step={1}
          />
          <CampoNumero
            id="p9-koa"
            label="Costo oportunidad (Koa)"
            sufijo="%"
            valor={Math.round(f.costoOportunidadAccionista * 1000) / 10}
            onChange={(v) => setFin({ costoOportunidadAccionista: v / 100 })}
            min={0}
            max={50}
            step={0.5}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 border-t border-border pt-4 md:grid-cols-2">
          <CardResultado
            titulo="Cuota mensual del préstamo"
            valor={formatearBolivianos(cuotaMensual)}
            descripcion={`Sistema francés, ${f.plazoMeses} meses`}
          />
          <CardResultado
            titulo="WACC (costo promedio capital)"
            valor={`${(wacc * 100).toFixed(2)}%`}
            descripcion="Esto será la tasa de descuento del proyecto"
            destacado
          />
        </div>
      </div>

      <FichaPedagogica
        titulo="WACC — Costo promedio ponderado de capital"
        contenido={
          <>
            <strong>WACC = (D/V) × Kd × (1−T) + (E/V) × Ke</strong>
            <br />
            La <strong>deuda baja el WACC</strong> porque los intereses son deducibles de
            impuestos (escudo fiscal). Pero demasiada deuda aumenta el riesgo de quiebra.
            <br />
            En Bolivia, las tasas de préstamo PYME suelen estar entre{" "}
            <strong>10-18% anual</strong> y el Koa ronda el <strong>15-20%</strong> (por
            inflación y riesgo país).
          </>
        }
      />
    </div>
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

function CardResultado({
  titulo,
  valor,
  descripcion,
  destacado,
}: {
  titulo: string;
  valor: string;
  descripcion: string;
  destacado?: boolean;
}) {
  return (
    <div
      className={`rounded-md border p-3 ${
        destacado
          ? "border-primary bg-primary/5"
          : "border-border bg-secondary/30"
      }`}
    >
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{titulo}</div>
      <div className="mt-1 text-lg font-semibold">{valor}</div>
      <div className="text-[10px] text-muted-foreground">{descripcion}</div>
    </div>
  );
}
