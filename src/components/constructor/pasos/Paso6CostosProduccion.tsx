import { Plus, Trash2 } from "lucide-react";
import { useProyectoStore } from "@/stores/proyecto-store";
import FichaPedagogica from "../FichaPedagogica";
import { formatearBolivianos } from "@/lib/utils";
import type { CategoriaCostoDirecto, CostoDirecto } from "@/types/proyecto";

const subcategorias: { valor: CategoriaCostoDirecto; label: string; sugerencia: string }[] = [
  { valor: "insumo", label: "Insumos", sugerencia: "Agua, electricidad, gas, combustibles…" },
  { valor: "suministro", label: "Suministros", sugerencia: "Materias primas, materiales que se incorporan al producto" },
  { valor: "empaque", label: "Empaque", sugerencia: "Envases, etiquetas, embalaje" },
  { valor: "mano_obra", label: "Mano de obra directa", sugerencia: "Si tu mano de obra escala por unidad producida" },
];

export default function Paso6CostosProduccion() {
  const proyecto = useProyectoStore((s) => s.proyecto)!;
  const agregar = useProyectoStore((s) => s.agregarCostoDirecto);
  const editar = useProyectoStore((s) => s.editarCostoDirecto);
  const eliminar = useProyectoStore((s) => s.eliminarCostoDirecto);

  // Cantidad total de unidades producidas por año (suma de todas las cantidades de productos)
  const unidadesPorAnio = [0, 1, 2, 3, 4].map((i) =>
    proyecto.productos.reduce((acc, p: any) => {
      const cant = p.cantidades?.[i] ?? p.cantidadAnio1 ?? 0;
      return acc + cant;
    }, 0)
  );

  // Costo unitario directo total (por unidad de producto) = suma de cant×costo por sub-categoría
  const costoUnitarioTotal = proyecto.costosDirectos.reduce(
    (acc, c) => acc + c.cantidadPorUnidad * c.costoUnitario,
    0
  );

  const costosTotalesPorAnio = unidadesPorAnio.map((u) => u * costoUnitarioTotal);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4 rounded-lg border border-border bg-card p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              Paso 6 · Costos directos de producción
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Costos que escalan con cada unidad de producto producido.
            </p>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Costo unitario directo
            </div>
            <div className="text-lg font-semibold">
              {formatearBolivianos(costoUnitarioTotal)} <span className="text-xs text-muted-foreground">/u</span>
            </div>
          </div>
        </div>

        {subcategorias.map((sub) => {
          const items = proyecto.costosDirectos.filter((c) => c.categoria === sub.valor);
          const subtotal = items.reduce((a, c) => a + c.cantidadPorUnidad * c.costoUnitario, 0);
          return (
            <SeccionCategoria
              key={sub.valor}
              titulo={sub.label}
              sugerencia={sub.sugerencia}
              subtotal={subtotal}
              items={items}
              onAgregar={() =>
                agregar({
                  categoria: sub.valor,
                  descripcion: "",
                  unidadMedida: "",
                  cantidadPorUnidad: 1,
                  costoUnitario: 0,
                })
              }
              onEditar={editar}
              onEliminar={eliminar}
            />
          );
        })}

        {/* Totales por año */}
        <div className="rounded-md border border-border bg-secondary/20 p-3">
          <div className="mb-2 text-xs font-semibold">Costos directos proyectados por año</div>
          <table className="w-full text-xs">
            <thead className="text-muted-foreground">
              <tr>
                <th className="p-1 text-left">Concepto</th>
                {[1, 2, 3, 4, 5].map((a) => (
                  <th key={a} className="p-1 text-right">Año {a}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-1 text-muted-foreground">Unidades a producir</td>
                {unidadesPorAnio.map((u, i) => (
                  <td key={i} className="p-1 text-right">{u.toLocaleString()}</td>
                ))}
              </tr>
              <tr className="border-t border-border">
                <td className="p-1 font-semibold">Costo directo total</td>
                {costosTotalesPorAnio.map((c, i) => (
                  <td key={i} className="p-1 text-right font-semibold">
                    {formatearBolivianos(c)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <FichaPedagogica
        titulo="Costos directos vs indirectos"
        contenido={
          <>
            Los <strong>costos directos</strong> son los que escalan con cada unidad
            producida (insumos, suministros, empaque, mano de obra variable). Se
            calculan con la fórmula{" "}
            <em>cantidad por unidad × costo unitario × unidades producidas</em>.
            <br />
            En este simulador, el total se proyecta automáticamente multiplicando por
            las cantidades del Paso 2.
          </>
        }
      />
    </div>
  );
}

function SeccionCategoria({
  titulo,
  sugerencia,
  subtotal,
  items,
  onAgregar,
  onEditar,
  onEliminar,
}: {
  titulo: string;
  sugerencia: string;
  subtotal: number;
  items: CostoDirecto[];
  onAgregar: () => void;
  onEditar: (id: string, cambios: Partial<CostoDirecto>) => void;
  onEliminar: (id: string) => void;
}) {
  return (
    <div className="rounded-md border border-border">
      <div className="flex items-center justify-between border-b border-border bg-secondary/30 px-3 py-2">
        <div>
          <div className="text-sm font-medium">{titulo}</div>
          <div className="text-[10px] text-muted-foreground">{sugerencia}</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-muted-foreground">Por unidad</div>
          <div className="text-sm font-semibold">{formatearBolivianos(subtotal)}</div>
        </div>
      </div>

      {items.length > 0 && (
        <table className="w-full text-xs">
          <thead className="text-muted-foreground">
            <tr className="border-b border-border">
              <th className="p-1.5 text-left">Descripción</th>
              <th className="p-1.5 text-left">Unidad</th>
              <th className="p-1.5 text-right">Cant./unidad</th>
              <th className="p-1.5 text-right">Costo unit.</th>
              <th className="p-1.5 text-right">Subtotal/u</th>
              <th className="w-7 p-1.5"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id} className="border-b border-border/50">
                <td className="p-1">
                  <input
                    type="text"
                    value={it.descripcion}
                    onChange={(e) => onEditar(it.id, { descripcion: e.target.value })}
                    placeholder="Ej: Agua, Pollo bebe, Etiqueta…"
                    className="w-full rounded-md border border-input bg-background px-2 py-1 focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </td>
                <td className="p-1">
                  <input
                    type="text"
                    value={it.unidadMedida}
                    onChange={(e) => onEditar(it.id, { unidadMedida: e.target.value })}
                    placeholder="Lts, kg, und"
                    className="w-20 rounded-md border border-input bg-background px-2 py-1 focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </td>
                <td className="p-1 text-right">
                  <input
                    type="number"
                    step="0.001"
                    value={it.cantidadPorUnidad}
                    onChange={(e) => onEditar(it.id, { cantidadPorUnidad: Number(e.target.value) || 0 })}
                    className="w-20 rounded border-0 bg-transparent px-1 py-0.5 text-right hover:bg-accent focus:bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </td>
                <td className="p-1 text-right">
                  <input
                    type="number"
                    step="0.01"
                    value={it.costoUnitario}
                    onChange={(e) => onEditar(it.id, { costoUnitario: Number(e.target.value) || 0 })}
                    className="w-20 rounded border-0 bg-transparent px-1 py-0.5 text-right hover:bg-accent focus:bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </td>
                <td className="p-1 text-right font-medium">
                  {formatearBolivianos(it.cantidadPorUnidad * it.costoUnitario)}
                </td>
                <td className="p-1">
                  <button
                    onClick={() => onEliminar(it.id)}
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

      <div className="p-2">
        <button
          onClick={onAgregar}
          className="flex items-center gap-1.5 rounded-md border border-dashed border-border px-2.5 py-1.5 text-xs text-muted-foreground hover:border-foreground hover:text-foreground"
        >
          <Plus className="h-3 w-3" />
          Agregar a {titulo.toLowerCase()}
        </button>
      </div>
    </div>
  );
}
