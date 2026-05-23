import { Plus, Trash2 } from "lucide-react";
import { useProyectoStore } from "@/stores/proyecto-store";
import FichaPedagogica from "../FichaPedagogica";
import { calcularAportesPatronales } from "@/lib/calculo-financiero";
import { formatearBolivianos } from "@/lib/utils";

export default function Paso4Personal() {
  const proyecto = useProyectoStore((s) => s.proyecto)!;
  const agregar = useProyectoStore((s) => s.agregarPuesto);
  const editar = useProyectoStore((s) => s.editarPuesto);
  const eliminar = useProyectoStore((s) => s.eliminarPuesto);

  const costoAnualTotal = proyecto.personal.reduce((acc, p) => {
    const aportes = calcularAportesPatronales(p.sueldoMensual);
    return acc + aportes.costoTotalAnual * p.cantidad;
  }, 0);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4 rounded-lg border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Paso 4 · Personal</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Aportes patronales (30.37%) se calculan automáticamente.
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Costo anual total</div>
            <div className="text-lg font-semibold">{formatearBolivianos(costoAnualTotal)}</div>
          </div>
        </div>

        {proyecto.personal.length === 0 && (
          <div className="rounded border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
            Aún no agregaste puestos.
          </div>
        )}

        {proyecto.personal.length > 0 && (
          <table className="w-full text-xs">
            <thead className="text-muted-foreground">
              <tr className="border-b border-border">
                <th className="p-1.5 text-left">Puesto</th>
                <th className="p-1.5 text-right">Cantidad</th>
                <th className="p-1.5 text-right">Sueldo mensual</th>
                <th className="p-1.5 text-right">Aportes/mes</th>
                <th className="p-1.5 text-right">Costo anual total</th>
                <th className="w-8 p-1.5"></th>
              </tr>
            </thead>
            <tbody>
              {proyecto.personal.map((p) => {
                const aportes = calcularAportesPatronales(p.sueldoMensual);
                return (
                  <tr key={p.id} className="border-b border-border/50">
                    <td className="p-1">
                      <input
                        type="text"
                        value={p.puesto}
                        onChange={(e) => editar(p.id, { puesto: e.target.value })}
                        className="w-full rounded border-0 bg-transparent px-1 py-0.5 hover:bg-accent focus:bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                    </td>
                    <td className="p-1 text-right">
                      <input
                        type="number"
                        value={p.cantidad}
                        onChange={(e) => editar(p.id, { cantidad: Number(e.target.value) || 0 })}
                        className="w-16 rounded border-0 bg-transparent px-1 py-0.5 text-right hover:bg-accent focus:bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                    </td>
                    <td className="p-1 text-right">
                      <input
                        type="number"
                        value={p.sueldoMensual}
                        onChange={(e) =>
                          editar(p.id, { sueldoMensual: Number(e.target.value) || 0 })
                        }
                        className="w-24 rounded border-0 bg-transparent px-1 py-0.5 text-right hover:bg-accent focus:bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                      />
                    </td>
                    <td className="p-1 text-right text-muted-foreground">
                      {formatearBolivianos(aportes.totalAportes)}
                    </td>
                    <td className="p-1 text-right font-medium">
                      {formatearBolivianos(aportes.costoTotalAnual * p.cantidad)}
                    </td>
                    <td className="p-1 text-right">
                      <button
                        onClick={() => eliminar(p.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        <button
          onClick={() => agregar({ puesto: "Nuevo puesto", cantidad: 1, sueldoMensual: 2500 })}
          className="flex items-center gap-1.5 rounded-md border border-dashed border-border px-2.5 py-1.5 text-xs text-muted-foreground transition hover:border-foreground hover:text-foreground"
        >
          <Plus className="h-3.5 w-3.5" />
          Agregar puesto
        </button>
      </div>

      <FichaPedagogica
        titulo="Aportes patronales en Bolivia"
        contenido={
          <>
            Por cada Bs 100 de sueldo bruto, el empleador paga Bs 30.37 extra en aportes:
            <ul className="mt-1.5 list-disc pl-4">
              <li>Riesgo profesional: 1.71%</li>
              <li>Seguro de salud (Cajas): 10%</li>
              <li>Provisión vivienda: 2%</li>
              <li>Previsión aguinaldo: 8.33%</li>
              <li>Previsión indemnización: 8.33%</li>
            </ul>
          </>
        }
      />
    </div>
  );
}
