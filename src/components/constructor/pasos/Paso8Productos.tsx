import { Plus, Trash2 } from "lucide-react";
import { useProyectoStore } from "@/stores/proyecto-store";
import FichaPedagogica from "../FichaPedagogica";
import { formatearBolivianos } from "@/lib/utils";

export default function Paso8Productos() {
  const proyecto = useProyectoStore((s) => s.proyecto)!;
  const agregar = useProyectoStore((s) => s.agregarProducto);
  const editar = useProyectoStore((s) => s.editarProducto);
  const eliminar = useProyectoStore((s) => s.eliminarProducto);
  const setCrecIngresos = useProyectoStore((s) => s.setCrecimientoIngresos);

  const ingresoAnioBase = proyecto.productos.reduce(
    (acc, p) => acc + p.cantidadAnio1 * p.precioVenta,
    0
  );
  const ingresoAnio5 = ingresoAnioBase * Math.pow(1 + proyecto.crecimientoIngresosAnual, 4);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4 rounded-lg border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              Paso 8 · Productos e ingresos
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Qué venderás, cuánto y a qué precio el primer año.
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">Ingreso anual año 1</div>
            <div className="text-lg font-semibold">{formatearBolivianos(ingresoAnioBase)}</div>
            <div className="text-[10px] text-muted-foreground">
              Año 5: {formatearBolivianos(ingresoAnio5)}
            </div>
          </div>
        </div>

        {proyecto.productos.length === 0 && (
          <div className="rounded border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
            Aún no agregaste productos.
          </div>
        )}

        {proyecto.productos.length > 0 && (
          <table className="w-full text-xs">
            <thead className="text-muted-foreground">
              <tr className="border-b border-border">
                <th className="p-1.5 text-left">Producto / servicio</th>
                <th className="p-1.5 text-left">Unidad</th>
                <th className="p-1.5 text-right">Cantidad año 1</th>
                <th className="p-1.5 text-right">Precio venta</th>
                <th className="p-1.5 text-right">Ingreso anual</th>
                <th className="w-8 p-1.5"></th>
              </tr>
            </thead>
            <tbody>
              {proyecto.productos.map((p) => (
                <tr key={p.id} className="border-b border-border/50">
                  <td className="p-1">
                    <input
                      type="text"
                      value={p.nombre}
                      onChange={(e) => editar(p.id, { nombre: e.target.value })}
                      className="w-full rounded border-0 bg-transparent px-1 py-0.5 hover:bg-accent focus:bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </td>
                  <td className="p-1">
                    <input
                      type="text"
                      value={p.unidadMedida}
                      onChange={(e) => editar(p.id, { unidadMedida: e.target.value })}
                      className="w-20 rounded border-0 bg-transparent px-1 py-0.5 hover:bg-accent focus:bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </td>
                  <td className="p-1 text-right">
                    <input
                      type="number"
                      value={p.cantidadAnio1}
                      onChange={(e) =>
                        editar(p.id, { cantidadAnio1: Number(e.target.value) || 0 })
                      }
                      className="w-24 rounded border-0 bg-transparent px-1 py-0.5 text-right hover:bg-accent focus:bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </td>
                  <td className="p-1 text-right">
                    <input
                      type="number"
                      value={p.precioVenta}
                      onChange={(e) =>
                        editar(p.id, { precioVenta: Number(e.target.value) || 0 })
                      }
                      className="w-20 rounded border-0 bg-transparent px-1 py-0.5 text-right hover:bg-accent focus:bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </td>
                  <td className="p-1 text-right font-medium">
                    {formatearBolivianos(p.cantidadAnio1 * p.precioVenta)}
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
              ))}
            </tbody>
          </table>
        )}

        <button
          onClick={() =>
            agregar({
              nombre: "Nuevo producto",
              unidadMedida: "unidad",
              cantidadAnio1: 0,
              precioVenta: 0,
            })
          }
          className="flex items-center gap-1.5 rounded-md border border-dashed border-border px-2.5 py-1.5 text-xs text-muted-foreground transition hover:border-foreground hover:text-foreground"
        >
          <Plus className="h-3.5 w-3.5" />
          Agregar producto
        </button>

        <div className="border-t border-border pt-4">
          <label htmlFor="p8-crecimiento" className="text-sm font-medium">
            Crecimiento anual proyectado de ingresos:{" "}
            <span className="text-foreground">
              {(proyecto.crecimientoIngresosAnual * 100).toFixed(1)}%
            </span>
          </label>
          <input
            id="p8-crecimiento"
            type="range"
            min={-10}
            max={30}
            step={0.5}
            value={proyecto.crecimientoIngresosAnual * 100}
            onChange={(e) => setCrecIngresos(Number(e.target.value) / 100)}
            className="mt-2 w-full"
          />
          <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
            <span>-10%</span>
            <span>0%</span>
            <span>+30%</span>
          </div>
        </div>
      </div>

      <FichaPedagogica
        titulo="Proyección de demanda"
        contenido={
          <>
            En Bolivia, las proyecciones de demanda deben considerar:{" "}
            <strong>estacionalidad</strong> (Carnaval, Día del padre/madre, fin de año),{" "}
            <strong>estabilidad del tipo de cambio</strong> (afecta poder adquisitivo) y{" "}
            <strong>competencia local</strong>. Una proyección de crecimiento del{" "}
            <strong>3-8% anual</strong> es realista para la mayoría de sectores; arriba
            del 15% sugiere mercado emergente o adquisición agresiva.
          </>
        }
      />
    </div>
  );
}
