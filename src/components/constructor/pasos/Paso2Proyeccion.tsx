import { Plus, Trash2, TrendingUp } from "lucide-react";
import { useProyectoStore } from "@/stores/proyecto-store";
import FichaPedagogica from "../FichaPedagogica";
import { formatearBolivianos } from "@/lib/utils";

const TASAS_RAPIDAS = [0, 2, 5, 10];

export default function Paso2Proyeccion() {
  const proyecto = useProyectoStore((s) => s.proyecto)!;
  const agregar = useProyectoStore((s) => s.agregarProducto);
  const editar = useProyectoStore((s) => s.editarProducto);
  const eliminar = useProyectoStore((s) => s.eliminarProducto);

  // Asegurar shape correcto (migración legada)
  const productos = proyecto.productos.map((p: any) => ({
    ...p,
    cantidades: Array.isArray(p.cantidades) && p.cantidades.length === 5
      ? p.cantidades
      : [p.cantidadAnio1 ?? 0, p.cantidadAnio1 ?? 0, p.cantidadAnio1 ?? 0, p.cantidadAnio1 ?? 0, p.cantidadAnio1 ?? 0],
  }));

  const ingresosPorAnio = [0, 1, 2, 3, 4].map((i) =>
    productos.reduce((acc, p) => acc + (p.cantidades[i] ?? 0) * p.precioVenta, 0)
  );
  const totalUnidadesPorAnio = [0, 1, 2, 3, 4].map((i) =>
    productos.reduce((acc, p) => acc + (p.cantidades[i] ?? 0), 0)
  );

  const aplicarCrecimiento = (productoId: string, tasa: number) => {
    const p = productos.find((x) => x.id === productoId);
    if (!p) return;
    const base = p.cantidades[0];
    const nuevas: [number, number, number, number, number] = [
      base,
      Math.round(base * Math.pow(1 + tasa / 100, 1)),
      Math.round(base * Math.pow(1 + tasa / 100, 2)),
      Math.round(base * Math.pow(1 + tasa / 100, 3)),
      Math.round(base * Math.pow(1 + tasa / 100, 4)),
    ];
    editar(productoId, { cantidades: nuevas });
  };

  const actualizarCantidad = (productoId: string, anio: number, valor: number) => {
    const p = productos.find((x) => x.id === productoId);
    if (!p) return;
    const nuevas = [...p.cantidades] as [number, number, number, number, number];
    nuevas[anio] = valor;
    editar(productoId, { cantidades: nuevas });
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4 rounded-lg border border-border bg-card p-6">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Paso 2 · Proyección de demanda
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Cuánto venderás de cada producto/servicio cada año del horizonte de
            proyecto. Las cantidades pueden variar año a año.
          </p>
        </div>

        {productos.length === 0 && (
          <div className="rounded border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
            Aún no agregaste productos.
          </div>
        )}

        {productos.map((p) => (
          <div key={p.id} className="space-y-2 rounded-md border border-border p-3">
            <div className="flex flex-wrap items-end gap-2">
              <div className="flex-1 min-w-[200px] space-y-1">
                <label className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Producto / servicio
                </label>
                <input
                  type="text"
                  value={p.nombre}
                  onChange={(e) => editar(p.id, { nombre: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="w-24 space-y-1">
                <label className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Unidad
                </label>
                <input
                  type="text"
                  value={p.unidadMedida}
                  onChange={(e) => editar(p.id, { unidadMedida: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="w-28 space-y-1">
                <label className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Precio venta (Bs)
                </label>
                <input
                  type="number"
                  value={p.precioVenta}
                  onChange={(e) => editar(p.id, { precioVenta: Number(e.target.value) || 0 })}
                  className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <button
                onClick={() => eliminar(p.id)}
                className="rounded-md border border-border p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                title="Eliminar producto"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="overflow-x-auto rounded border border-border">
              <table className="w-full text-xs">
                <thead className="bg-secondary/30">
                  <tr>
                    <th className="p-1.5 text-left text-muted-foreground">Cantidad</th>
                    {[1, 2, 3, 4, 5].map((a) => (
                      <th key={a} className="p-1.5 text-center text-muted-foreground">
                        Año {a}
                      </th>
                    ))}
                    <th className="p-1.5 text-right text-muted-foreground">Aplicar crecimiento</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-1 font-medium">Unidades</td>
                    {p.cantidades.map((c: number, i: number) => (
                      <td key={i} className="p-0.5 text-center">
                        <input
                          type="number"
                          value={c}
                          onChange={(e) => actualizarCantidad(p.id, i, Number(e.target.value) || 0)}
                          className="w-full rounded border-0 bg-transparent px-1 py-0.5 text-right hover:bg-accent focus:bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                      </td>
                    ))}
                    <td className="p-0.5 text-right">
                      <div className="flex justify-end gap-0.5">
                        {TASAS_RAPIDAS.map((t) => (
                          <button
                            key={t}
                            onClick={() => aplicarCrecimiento(p.id, t)}
                            className="rounded bg-secondary px-1.5 py-0.5 text-[10px] hover:bg-secondary/70"
                            title={`Aplica ${t}% anual desde año 1`}
                          >
                            {t}%
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                  <tr className="border-t border-border bg-secondary/10">
                    <td className="p-1 text-muted-foreground">Ingreso (Bs)</td>
                    {p.cantidades.map((c: number, i: number) => (
                      <td key={i} className="p-1 text-right text-muted-foreground">
                        {formatearBolivianos(c * p.precioVenta)}
                      </td>
                    ))}
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ))}

        <button
          onClick={() =>
            agregar({
              nombre: "Nuevo producto",
              unidadMedida: "unidad",
              cantidades: [0, 0, 0, 0, 0],
              precioVenta: 0,
            } as any)
          }
          className="flex items-center gap-1.5 rounded-md border border-dashed border-border px-2.5 py-1.5 text-xs text-muted-foreground transition hover:border-foreground hover:text-foreground"
        >
          <Plus className="h-3.5 w-3.5" />
          Agregar producto
        </button>

        {/* Totales por año */}
        {productos.length > 0 && (
          <div className="rounded-md border border-border bg-secondary/20 p-3">
            <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold">
              <TrendingUp className="h-3.5 w-3.5" />
              Totales por año
            </div>
            <table className="w-full text-xs">
              <thead className="text-muted-foreground">
                <tr>
                  <th className="p-1 text-left"></th>
                  {[1, 2, 3, 4, 5].map((a) => (
                    <th key={a} className="p-1 text-right">Año {a}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-1 text-muted-foreground">Unidades totales</td>
                  {totalUnidadesPorAnio.map((u, i) => (
                    <td key={i} className="p-1 text-right">{u.toLocaleString()}</td>
                  ))}
                </tr>
                <tr className="border-t border-border">
                  <td className="p-1 font-semibold">Ingreso total (Bs)</td>
                  {ingresosPorAnio.map((ing, i) => (
                    <td key={i} className="p-1 text-right font-semibold">
                      {formatearBolivianos(ing)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      <FichaPedagogica
        titulo="Proyección de demanda en Bolivia"
        contenido={
          <>
            La proyección de cantidades suele seguir un crecimiento del{" "}
            <strong>3-8% anual</strong> en sectores estables, hasta{" "}
            <strong>15-20%</strong> en negocios emergentes. Considera estacionalidad
            (Carnaval, fin de año), capacidad instalada y competencia. El{" "}
            <strong>precio de venta</strong> normalmente se mantiene estable salvo que
            haya inflación o estrategia de ajuste.
          </>
        }
      />
    </div>
  );
}
