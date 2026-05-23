import { Plus, Trash2 } from "lucide-react";
import { formatearBolivianos } from "@/lib/utils";
import type { CostoGeneral } from "@/types/proyecto";

interface Props {
  items: CostoGeneral[];
  agregar: (c: Omit<CostoGeneral, "id">) => void;
  editar: (id: string, cambios: Partial<CostoGeneral>) => void;
  eliminar: (id: string) => void;
  textoAgregar: string;
  placeholderDescripcion?: string;
}

export default function TablaCostosGenerales({
  items,
  agregar,
  editar,
  eliminar,
  textoAgregar,
  placeholderDescripcion,
}: Props) {
  const totalAnual = items.reduce((acc, c) => {
    const factor = c.unidadMedida === "mes" ? 12 : 1;
    return acc + c.cantidad * c.costoUnitario * factor;
  }, 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-end">
        <div className="text-right">
          <div className="text-xs text-muted-foreground">Total anual</div>
          <div className="text-lg font-semibold">{formatearBolivianos(totalAnual)}</div>
        </div>
      </div>

      {items.length === 0 && (
        <div className="rounded border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
          Aún no agregaste items.
        </div>
      )}

      {items.length > 0 && (
        <table className="w-full text-xs">
          <thead className="text-muted-foreground">
            <tr className="border-b border-border">
              <th className="p-1.5 text-left">Descripción</th>
              <th className="p-1.5 text-center">Unidad</th>
              <th className="p-1.5 text-right">Cantidad</th>
              <th className="p-1.5 text-right">Costo unit.</th>
              <th className="p-1.5 text-right">Total anual</th>
              <th className="w-8 p-1.5"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => {
              const factor = c.unidadMedida === "mes" ? 12 : 1;
              const total = c.cantidad * c.costoUnitario * factor;
              return (
                <tr key={c.id} className="border-b border-border/50">
                  <td className="p-1">
                    <input
                      type="text"
                      value={c.descripcion}
                      onChange={(e) => editar(c.id, { descripcion: e.target.value })}
                      className="w-full rounded-md border border-input bg-background px-2 py-1 focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </td>
                  <td className="p-1 text-center">
                    <select
                      value={c.unidadMedida}
                      onChange={(e) =>
                        editar(c.id, { unidadMedida: e.target.value as "mes" | "año" })
                      }
                      className="rounded-md border border-input bg-background px-2 py-1 focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="mes">Mes</option>
                      <option value="año">Año</option>
                    </select>
                  </td>
                  <td className="p-1 text-right">
                    <input
                      type="number"
                      value={c.cantidad}
                      onChange={(e) => editar(c.id, { cantidad: Number(e.target.value) || 0 })}
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
                  <td className="p-1 text-right font-medium">{formatearBolivianos(total)}</td>
                  <td className="p-1 text-right">
                    <button
                      onClick={() => eliminar(c.id)}
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
        onClick={() =>
          agregar({
            descripcion: placeholderDescripcion ?? "Nuevo item",
            unidadMedida: "mes",
            cantidad: 1,
            costoUnitario: 0,
          })
        }
        className="flex items-center gap-1.5 rounded-md border border-dashed border-border px-2.5 py-1.5 text-xs text-muted-foreground transition hover:border-foreground hover:text-foreground"
      >
        <Plus className="h-3.5 w-3.5" />
        {textoAgregar}
      </button>
    </div>
  );
}
