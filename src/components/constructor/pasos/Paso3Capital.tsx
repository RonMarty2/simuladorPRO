import { useProyectoStore } from "@/stores/proyecto-store";
import FichaPedagogica from "../FichaPedagogica";
import { formatearBolivianos } from "@/lib/utils";

export default function Paso3Capital() {
  const proyecto = useProyectoStore((s) => s.proyecto)!;
  const setCapital = useProyectoStore((s) => s.setCapitalTrabajo);

  // Estimación sugerida: 3 meses de costos operativos
  const costosOperativosMensuales =
    proyecto.personal.reduce((acc, p) => acc + p.sueldoMensual * p.cantidad * 1.3037, 0) +
    proyecto.costosAdministracion.reduce((acc, c) => {
      const factor = c.unidadMedida === "mes" ? 1 : 1 / 12;
      return acc + c.cantidad * c.costoUnitario * factor;
    }, 0) +
    proyecto.costosComercializacion.reduce((acc, c) => {
      const factor = c.unidadMedida === "mes" ? 1 : 1 / 12;
      return acc + c.cantidad * c.costoUnitario * factor;
    }, 0);

  const sugerencia = Math.round(costosOperativosMensuales * 3);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4 rounded-lg border border-border bg-card p-6">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Paso 3 · Capital de trabajo</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Dinero que necesitas para operar los primeros meses antes de tener ingresos
            estables.
          </p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="p3-capital" className="text-sm font-medium">
            Monto en bolivianos (Bs)
          </label>
          <input
            id="p3-capital"
            type="number"
            value={proyecto.capitalTrabajo}
            onChange={(e) => setCapital(Number(e.target.value) || 0)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {sugerencia > 0 && (
            <p className="text-xs text-muted-foreground">
              Sugerencia (3 meses de costos operativos):{" "}
              <button
                onClick={() => setCapital(sugerencia)}
                className="font-medium text-foreground underline underline-offset-2"
              >
                {formatearBolivianos(sugerencia)}
              </button>
            </p>
          )}
        </div>
      </div>

      <FichaPedagogica
        titulo="Capital de trabajo"
        contenido={
          <>
            El <strong>capital de trabajo</strong> cubre el desfase entre cuando pagas
            (sueldos, insumos, alquileres) y cuando cobras (ventas). En Bolivia,
            considerá además que <strong>los aguinaldos</strong> en diciembre exigen
            tener efectivo extra ese mes.
          </>
        }
      />
    </div>
  );
}
