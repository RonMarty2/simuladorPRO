import { Plus, Trash2 } from "lucide-react";
import { useProyectoStore } from "@/stores/proyecto-store";
import FichaPedagogica from "../FichaPedagogica";
import { formatearBolivianos } from "@/lib/utils";
import type { CategoriaCostoDirecto } from "@/types/proyecto";

const categorias: { valor: CategoriaCostoDirecto; label: string }[] = [
  { valor: "insumo", label: "Insumo" },
  { valor: "suministro", label: "Suministro" },
  { valor: "empaque", label: "Empaque" },
  { valor: "mano_obra", label: "Mano de obra" },
];

export default function Paso5CostosDirectos() {
  const proyecto = useProyectoStore((s) => s.proyecto)!;
  const agregar = useProyectoStore((s) => s.agregarCostoDirecto);
  const editar = useProyectoStore((s) => s.editarCostoDirecto);
  const eliminar = useProyectoStore((s) => s.eliminarCostoDirecto);

  const costoUnitario = proyecto.costosDirectos.reduce(
    (acc, c) => acc + c.cantidadPorUnidad * c.costoUnitario,
    0
  );

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4 rounded-lg border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              Paso 5 · Costos directos de producción
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Costos que varían con cada unidad de producto producido.
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Costo por unidad de producto</div>
            <div className="text-lg font-semibold">{formatearBolivianos(costoUnitario)}</div>
          </div>
        </div>

        {proyecto.costosDirectos.length === 0 && (
          <div className="rounded border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
            Aún no agregaste costos directos.
          </div>
        )}

        {proyecto.costosDirectos.length > 0 && (
          <table className="w-full text-xs">
            <thead className="text-muted-foreground">
              <tr className="border-b border-border">
                <th className="p-1.5 text-left">Categoría</th>
                <th className="p-1.5 text-left">Descripción</th>
                <th className="p-1.5 text-left">Unidad</th>
                <th className="p-1.5 text-right">Cant/producto</th>
                <th className="p-1.5 text-right">Costo unit.</th>
                <th className="p-1.5 text-right">Subtotal</th>
                <th className="w-8 p-1.5"></th>
              </tr>
            </thead>
            <tbody>
              {proyecto.costosDirectos.map((c) => (
                <tr key={c.id} className="border-b border-border/50">
                  <td className="p-1">
                    <select
                      value={c.categoria}
                      onChange={(e) =>
                        editar(c.id, { categoria: e.target.value as CategoriaCostoDirecto })
                      }
                      className="w-full rounded border-0 bg-transparent px-1 py-0.5 hover:bg-accent focus:bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                    >
                      {categorias.map((cat) => (
                        <option key={cat.valor} value={cat.valor}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-1">
                    <input
                      type="text"
                      value={c.descripcion}
                      onChange={(e) => editar(c.id, { descripcion: e.target.value })}
                      className="w-full rounded border-0 bg-transparent px-1 py-0.5 hover:bg-accent focus:bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </td>
                  <td className="p-1">
                    <input
                      type="text"
                      value={c.unidadMedida}
                      onChange={(e) => editar(c.id, { unidadMedida: e.target.value })}
                      className="w-20 rounded border-0 bg-transparent px-1 py-0.5 hover:bg-accent focus:bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </td>
                  <td className="p-1 text-right">
                    <input
                      type="number"
                      value={c.cantidadPorUnidad}
                      onChange={(e) =>
                        editar(c.id, { cantidadPorUnidad: Number(e.target.value) || 0 })
                      }
                      className="w-16 rounded border-0 bg-transparent px-1 py-0.5 text-right hover:bg-accent focus:bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </td>
                  <td className="p-1 text-right">
                    <input
                      type="number"
                      value={c.costoUnitario}
                      onChange={(e) =>
                        editar(c.id, { costoUnitario: Number(e.target.value) || 0 })
                      }
                      className="w-24 rounded border-0 bg-transparent px-1 py-0.5 text-right hover:bg-accent focus:bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </td>
                  <td className="p-1 text-right font-medium">
                    {formatearBolivianos(c.cantidadPorUnidad * c.costoUnitario)}
                  </td>
                  <td className="p-1 text-right">
                    <button
                      onClick={() => eliminar(c.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <button
          onClick={() =>
            agregar({
              categoria: "insumo",
              descripcion: "Nuevo insumo",
              unidadMedida: "unidad",
              cantidadPorUnidad: 1,
              costoUnitario: 0,
            })
          }
          className="flex items-center gap-1.5 rounded-md border border-dashed border-border px-2.5 py-1.5 text-xs text-muted-foreground transition hover:border-foreground hover:text-foreground"
        >
          <Plus className="h-3.5 w-3.5" />
          Agregar costo directo
        </button>
      </div>

      <FichaPedagogica
        titulo="Costos directos vs indirectos"
        contenido={
          <>
            Los <strong>costos directos</strong> son los que puedes asignar a una unidad
            específica de producto (la harina para un pan, el café para una taza). Los{" "}
            <strong>indirectos</strong> (alquiler, sueldos administrativos) van en los
            siguientes pasos. La distinción importa para calcular el margen de cada
            producto y decidir precios.
          </>
        }
      />
    </div>
  );
}
