import { Calculator, Info } from "lucide-react";
import { useProyectoStore } from "@/stores/proyecto-store";
import FichaPedagogica from "../FichaPedagogica";
import { calcularAportesPatronales } from "@/lib/calculo-financiero";
import { formatearBolivianos } from "@/lib/utils";

const selectOnFocus = (e: React.FocusEvent<HTMLInputElement>) =>
  e.currentTarget.select();

export default function Paso3Capital() {
  const proyecto = useProyectoStore((s) => s.proyecto)!;
  const setCapital = useProyectoStore((s) => s.setCapitalTrabajo);

  // Cálculos automáticos basados en los pasos anteriores
  const personalAnual = proyecto.personal.reduce((acc, p) => {
    const ap = calcularAportesPatronales(p.sueldoMensual);
    return acc + ap.costoTotalAnual * p.cantidad;
  }, 0);

  // Unidades de producto totales año 1 (cantidades[0])
  const unidadesAnio1 = proyecto.productos.reduce(
    (acc, p: any) => acc + (p.cantidades?.[0] ?? p.cantidadAnio1 ?? 0),
    0
  );

  // Costos directos = costo por unidad × unidades
  const costoUnitDirectos = proyecto.costosDirectos.reduce(
    (acc, c) => acc + c.cantidadPorUnidad * c.costoUnitario,
    0
  );
  const costosProduccionAnual = unidadesAnio1 * costoUnitDirectos;

  const adminAnual = proyecto.costosAdministracion.reduce(
    (acc, c) => acc + c.cantidad * c.costoUnitario * (c.unidadMedida === "mes" ? 12 : 1),
    0
  );

  const comercAnual = proyecto.costosComercializacion.reduce(
    (acc, c) => acc + c.cantidad * c.costoUnitario * (c.unidadMedida === "mes" ? 12 : 1),
    0
  );

  const totalAnual = personalAnual + costosProduccionAnual + adminAnual + comercAnual;
  const totalMensual = totalAnual / 12;

  // El usuario decide cuántos meses necesita de buffer
  // Por default: si el capitalTrabajo del proyecto es 0, sugerir 3 meses;
  // si no, derivar los meses inversamente del monto actual
  const mesesGuardados =
    totalMensual > 0 && proyecto.capitalTrabajo > 0
      ? Math.round((proyecto.capitalTrabajo / totalMensual) * 10) / 10
      : 3;

  const aplicarMeses = (meses: number) => {
    const monto = Math.round(totalMensual * meses);
    setCapital(monto);
  };

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
            Paso 7 · Capital de trabajo
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

        {/* Desglose de gastos anuales (igual al Excel) */}
        <div className="rounded-md border border-border">
          <div className="border-b border-border bg-secondary px-3 py-2 text-xs font-semibold uppercase tracking-wide">
            Gastos anuales (calculados de pasos anteriores)
          </div>
          <table className="w-full text-xs">
            <thead className="border-b border-border text-muted-foreground">
              <tr>
                <th className="p-2 text-left">N°</th>
                <th className="p-2 text-left">Gasto</th>
                <th className="p-2 text-right">Anual (Bs)</th>
              </tr>
            </thead>
            <tbody>
              <FilaGasto n={1} label="Personal (con aportes patronales 30.37%)" valor={personalAnual} />
              <FilaGasto n={2} label="Costos de producción (insumos × unidades año 1)" valor={costosProduccionAnual} />
              <FilaGasto n={3} label="Gastos de administración" valor={adminAnual} />
              <FilaGasto n={4} label="Gastos de comercialización" valor={comercAnual} />
              <tr className="border-t-2 border-border bg-secondary/50">
                <td className="p-2 font-bold" colSpan={2}>
                  TOTAL ANUAL
                </td>
                <td className="p-2 text-right font-bold">{formatearBolivianos(totalAnual)}</td>
              </tr>
            </tbody>
          </table>
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
              <div className="text-[10px] text-muted-foreground">= Total anual ÷ 12 meses</div>
            </div>
            <div className="rounded-md bg-card p-2">
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Capital de trabajo requerido
              </div>
              <div className="text-base font-bold text-primary">
                {formatearBolivianos(proyecto.capitalTrabajo)}
              </div>
              <div className="text-[10px] text-muted-foreground">
                = Costo mensual × {mesesGuardados.toFixed(1)} meses
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-medium">
              ¿Cuántos meses necesitas operar antes de recibir tu primer ingreso del
              negocio?
            </div>

            <div className="flex flex-wrap gap-1.5">
              {[1, 2, 3, 4, 5, 6].map((m) => (
                <button
                  key={m}
                  onClick={() => aplicarSugerido(m)}
                  className="rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium hover:bg-secondary"
                >
                  {m} {m === 1 ? "mes" : "meses"}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span>O escribe directamente el monto (Bs):</span>
              <input
                type="number"
                value={proyecto.capitalTrabajo}
                onChange={(e) => setCapital(Number(e.target.value) || 0)}
                onFocus={selectOnFocus}
                className="w-40 rounded-md border border-input bg-background px-2 py-1.5 text-right text-xs focus:outline-none focus:ring-2 focus:ring-ring"
              />
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
            <strong>Fórmula:</strong> Total costos anuales ÷ 12 × meses de buffer.
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

function FilaGasto({ n, label, valor }: { n: number; label: string; valor: number }) {
  return (
    <tr className="border-b border-border/40 last:border-0">
      <td className="p-2 text-muted-foreground">{n}</td>
      <td className="p-2">{label}</td>
      <td className="p-2 text-right font-medium">{formatearBolivianos(valor)}</td>
    </tr>
  );
}
