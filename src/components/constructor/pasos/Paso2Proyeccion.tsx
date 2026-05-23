import { Plus, Trash2 } from "lucide-react";
import { useProyectoStore } from "@/stores/proyecto-store";
import FichaPedagogica from "../FichaPedagogica";
import { formatearBolivianos } from "@/lib/utils";

const TASAS_RAPIDAS = [
  { label: "0%", valor: 0 },
  { label: "2%", valor: 2 },
  { label: "5%", valor: 5 },
  { label: "10%", valor: 10 },
];

export default function Paso2Proyeccion() {
  const proyecto = useProyectoStore((s) => s.proyecto)!;
  const agregar = useProyectoStore((s) => s.agregarProducto);
  const editar = useProyectoStore((s) => s.editarProducto);
  const eliminar = useProyectoStore((s) => s.eliminarProducto);

  const productos = proyecto.productos.map((p: any) => ({
    ...p,
    cantidades:
      Array.isArray(p.cantidades) && p.cantidades.length === 5
        ? p.cantidades
        : [
            p.cantidadAnio1 ?? 0,
            p.cantidadAnio1 ?? 0,
            p.cantidadAnio1 ?? 0,
            p.cantidadAnio1 ?? 0,
            p.cantidadAnio1 ?? 0,
          ],
  }));

  const ingresosPorAnio = [0, 1, 2, 3, 4].map((i) =>
    productos.reduce((acc, p) => acc + (p.cantidades[i] ?? 0) * p.precioVenta, 0)
  );
  const unidadesPorAnio = [0, 1, 2, 3, 4].map((i) =>
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
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_300px]">
      <div className="space-y-3 rounded-lg border border-border bg-card p-5">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Paso 2 · Proyección de demanda
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Productos × cantidad por año × precio. Edita cualquier celda directamente.
          </p>
        </div>

        {/* Tabla principal Excel-style */}
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b-2 border-border bg-secondary text-foreground">
                <th className="p-2 text-left font-semibold">Producto / Servicio</th>
                <th className="p-2 text-left font-semibold">Unidad</th>
                <th className="p-2 text-right font-semibold">Precio (Bs)</th>
                <th className="p-2 text-center font-semibold">Año 1</th>
                <th className="p-2 text-center font-semibold">Año 2</th>
                <th className="p-2 text-center font-semibold">Año 3</th>
                <th className="p-2 text-center font-semibold">Año 4</th>
                <th className="p-2 text-center font-semibold">Año 5</th>
                <th className="p-2 text-center font-semibold" title="Aplicar crecimiento desde Año 1">
                  Crecim.
                </th>
                <th className="w-8 p-2"></th>
              </tr>
            </thead>
            <tbody>
              {productos.length === 0 && (
                <tr>
                  <td colSpan={10} className="p-6 text-center text-muted-foreground">
                    Aún no agregaste productos. Click "Agregar producto" abajo.
                  </td>
                </tr>
              )}
              {productos.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0">
                  <td className="p-1.5">
                    <input
                      type="text"
                      value={p.nombre}
                      onChange={(e) => editar(p.id, { nombre: e.target.value })}
                      placeholder="Ej: Café especialidad"
                      className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </td>
                  <td className="p-1.5">
                    <input
                      type="text"
                      value={p.unidadMedida}
                      onChange={(e) => editar(p.id, { unidadMedida: e.target.value })}
                      placeholder="taza"
                      className="w-20 rounded-md border border-input bg-background px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </td>
                  <td className="p-1.5 text-right">
                    <input
                      type="number"
                      value={p.precioVenta}
                      onChange={(e) =>
                        editar(p.id, { precioVenta: Number(e.target.value) || 0 })
                      }
                      className="w-20 rounded-md border border-input bg-background px-2 py-1.5 text-right text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </td>
                  {p.cantidades.map((c: number, i: number) => (
                    <td key={i} className="p-1.5">
                      <input
                        type="number"
                        value={c}
                        onChange={(e) =>
                          actualizarCantidad(p.id, i, Number(e.target.value) || 0)
                        }
                        className="w-24 rounded-md border border-input bg-background px-2 py-1.5 text-right text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </td>
                  ))}
                  <td className="p-1.5 text-center">
                    <select
                      defaultValue=""
                      onChange={(e) => {
                        const tasa = parseInt(e.target.value, 10);
                        if (!Number.isNaN(tasa)) aplicarCrecimiento(p.id, tasa);
                        e.target.value = "";
                      }}
                      className="rounded-md border border-input bg-background px-1.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                      title="Aplica crecimiento compuesto desde Año 1"
                    >
                      <option value="">Aplicar…</option>
                      {TASAS_RAPIDAS.map((t) => (
                        <option key={t.valor} value={t.valor}>
                          {t.label} anual
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-1.5 text-center">
                    <button
                      onClick={() => eliminar(p.id)}
                      className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      title="Eliminar producto"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            {productos.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-border bg-secondary/50">
                  <td className="p-2 text-xs font-semibold" colSpan={3}>
                    TOTAL UNIDADES
                  </td>
                  {unidadesPorAnio.map((u, i) => (
                    <td key={i} className="p-2 text-right text-xs font-semibold">
                      {u.toLocaleString()}
                    </td>
                  ))}
                  <td colSpan={2}></td>
                </tr>
                <tr className="bg-primary/10">
                  <td className="p-2 text-xs font-bold" colSpan={3}>
                    TOTAL INGRESOS (Bs)
                  </td>
                  {ingresosPorAnio.map((ing, i) => (
                    <td key={i} className="p-2 text-right text-xs font-bold">
                      {formatearBolivianos(ing)}
                    </td>
                  ))}
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        <button
          onClick={() =>
            agregar({
              nombre: "Nuevo producto",
              unidadMedida: "und",
              cantidades: [0, 0, 0, 0, 0],
              precioVenta: 0,
            } as any)
          }
          className="flex items-center gap-2 rounded-md border border-dashed border-border bg-background px-3 py-2 text-xs font-medium text-muted-foreground hover:border-foreground hover:text-foreground"
        >
          <Plus className="h-3.5 w-3.5" />
          Agregar producto
        </button>
      </div>

      <FichaPedagogica
        titulo="Proyección de demanda"
        contenido={
          <>
            Los productos suelen crecer entre <strong>3% y 8% anual</strong> en
            sectores estables, o hasta <strong>15-20%</strong> en negocios emergentes.
            Considera Carnaval, fin de año y capacidad instalada.
            <br />
            <br />
            <strong>Tip:</strong> el desplegable "Aplicar…" pone automáticamente los 5
            años con un crecimiento compuesto desde Año 1.
          </>
        }
      />
    </div>
  );
}
