import { Plus, Trash2 } from "lucide-react";
import { useProyectoStore } from "@/stores/proyecto-store";
import FichaPedagogica from "../FichaPedagogica";
import { formatearBolivianos, cn } from "@/lib/utils";
import type { CategoriaCostoDirecto, CostoDirecto } from "@/types/proyecto";

interface ConfigSubcat {
  valor: CategoriaCostoDirecto;
  label: string;
  sugerencia: string;
  borde: string;
  bgFila: string;
  bgHeader: string;
  chip: string;
}

const subcategorias: ConfigSubcat[] = [
  {
    valor: "insumo",
    label: "Insumos",
    sugerencia: "Agua, electricidad, gas, combustibles…",
    borde: "border-l-blue-500",
    bgFila: "bg-blue-50 dark:bg-blue-950/20",
    bgHeader: "bg-blue-100/70 dark:bg-blue-950/40",
    chip: "bg-blue-200 text-blue-900 dark:bg-blue-900/60 dark:text-blue-100",
  },
  {
    valor: "suministro",
    label: "Suministros",
    sugerencia: "Materias primas, materiales que se incorporan al producto",
    borde: "border-l-emerald-500",
    bgFila: "bg-emerald-50 dark:bg-emerald-950/20",
    bgHeader: "bg-emerald-100/70 dark:bg-emerald-950/40",
    chip: "bg-emerald-200 text-emerald-900 dark:bg-emerald-900/60 dark:text-emerald-100",
  },
  {
    valor: "empaque",
    label: "Empaque",
    sugerencia: "Envases, etiquetas, embalaje",
    borde: "border-l-amber-500",
    bgFila: "bg-amber-50 dark:bg-amber-950/20",
    bgHeader: "bg-amber-100/70 dark:bg-amber-950/40",
    chip: "bg-amber-200 text-amber-900 dark:bg-amber-900/60 dark:text-amber-100",
  },
  {
    valor: "mano_obra",
    label: "Mano de obra directa",
    sugerencia: "Si tu mano de obra escala por unidad producida",
    borde: "border-l-purple-500",
    bgFila: "bg-purple-50 dark:bg-purple-950/20",
    bgHeader: "bg-purple-100/70 dark:bg-purple-950/40",
    chip: "bg-purple-200 text-purple-900 dark:bg-purple-900/60 dark:text-purple-100",
  },
];

const selectOnFocus = (e: React.FocusEvent<HTMLInputElement>) =>
  e.currentTarget.select();

const COLS_ANCHO = {
  descripcion: "w-[34%]",
  unidad: "w-[10%]",
  cant: "w-[14%]",
  costo: "w-[14%]",
  subtotal: "w-[15%]",
  acciones: "w-[5%]",
};

export default function Paso6CostosProduccion() {
  const proyecto = useProyectoStore((s) => s.proyecto)!;
  const agregar = useProyectoStore((s) => s.agregarCostoDirecto);
  const editar = useProyectoStore((s) => s.editarCostoDirecto);
  const eliminar = useProyectoStore((s) => s.eliminarCostoDirecto);

  const unidadesPorAnio = [0, 1, 2, 3, 4].map((i) =>
    proyecto.productos.reduce((acc, p: any) => {
      const cant = p.cantidades?.[i] ?? p.cantidadAnio1 ?? 0;
      return acc + cant;
    }, 0)
  );

  const costoUnitarioTotal = proyecto.costosDirectos.reduce(
    (acc, c) => acc + c.cantidadPorUnidad * c.costoUnitario,
    0
  );

  const costosTotalesPorAnio = unidadesPorAnio.map((u) => u * costoUnitarioTotal);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_280px]">
      <div className="space-y-3 rounded-lg border border-border bg-card p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              Paso 6 · Costos directos de producción
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Costos que escalan con cada unidad producida.
            </p>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Costo unitario directo
            </div>
            <div className="text-lg font-bold">
              {formatearBolivianos(costoUnitarioTotal)}{" "}
              <span className="text-xs font-normal text-muted-foreground">/u</span>
            </div>
          </div>
        </div>

        {subcategorias.map((sub) => {
          const items = proyecto.costosDirectos.filter((c) => c.categoria === sub.valor);
          const subtotal = items.reduce((a, c) => a + c.cantidadPorUnidad * c.costoUnitario, 0);
          return (
            <SeccionSubcategoria
              key={sub.valor}
              config={sub}
              items={items}
              subtotal={subtotal}
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

        {/* Totales año a año */}
        <div className="rounded-md border-2 border-primary/40 bg-primary/5 p-3">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide">
            Costos directos proyectados por año
          </div>
          <table className="w-full text-xs">
            <thead className="text-muted-foreground">
              <tr>
                <th className="p-1 text-left">Concepto</th>
                {[1, 2, 3, 4, 5].map((a) => (
                  <th key={a} className="p-1 text-right">
                    Año {a}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-1 text-muted-foreground">Unidades a producir</td>
                {unidadesPorAnio.map((u, i) => (
                  <td key={i} className="p-1 text-right">
                    {u.toLocaleString()}
                  </td>
                ))}
              </tr>
              <tr className="border-t border-border">
                <td className="p-1 font-bold">Costo directo total</td>
                {costosTotalesPorAnio.map((c, i) => (
                  <td key={i} className="p-1 text-right font-bold">
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
            <br />
            En este simulador, el total se proyecta automáticamente multiplicando por
            las cantidades del Paso 2.
          </>
        }
      />
    </div>
  );
}

function SeccionSubcategoria({
  config,
  items,
  subtotal,
  onAgregar,
  onEditar,
  onEliminar,
}: {
  config: ConfigSubcat;
  items: CostoDirecto[];
  subtotal: number;
  onAgregar: () => void;
  onEditar: (id: string, cambios: Partial<CostoDirecto>) => void;
  onEliminar: (id: string) => void;
}) {
  return (
    <div className={cn("overflow-hidden rounded-md border-l-4", config.borde, config.bgFila)}>
      {/* Header */}
      <div
        className={cn("flex items-center justify-between px-3 py-2", config.bgHeader)}
      >
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
              config.chip
            )}
          >
            {config.label}
          </span>
          <span className="text-[10px] text-foreground/70">{config.sugerencia}</span>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-muted-foreground">Por unidad</div>
          <div className="text-sm font-bold">{formatearBolivianos(subtotal)}</div>
        </div>
      </div>

      <div className="space-y-2 p-3">
        {items.length > 0 && (
          <div className="overflow-x-auto rounded-md border border-border bg-card">
            <table className="w-full text-xs">
              <thead className="text-[10px] uppercase tracking-wide text-muted-foreground">
                <tr className="border-b border-border">
                  <th className={cn("p-1.5 text-left", COLS_ANCHO.descripcion)}>
                    Descripción
                  </th>
                  <th className={cn("p-1.5 text-left", COLS_ANCHO.unidad)}>Unidad</th>
                  <th className={cn("p-1.5 text-right", COLS_ANCHO.cant)}>
                    Cant./unidad
                  </th>
                  <th className={cn("p-1.5 text-right", COLS_ANCHO.costo)}>
                    Costo unit. (Bs)
                  </th>
                  <th className={cn("p-1.5 text-right", COLS_ANCHO.subtotal)}>
                    Subtotal/u
                  </th>
                  <th className={cn("p-1.5", COLS_ANCHO.acciones)}></th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id} className="border-b border-border/40 last:border-0">
                    <td className="p-1">
                      <input
                        type="text"
                        value={it.descripcion}
                        onChange={(e) => onEditar(it.id, { descripcion: e.target.value })}
                        onFocus={selectOnFocus}
                        placeholder="Ej: Agua, Pollo bebe…"
                        className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="text"
                        value={it.unidadMedida}
                        onChange={(e) => onEditar(it.id, { unidadMedida: e.target.value })}
                        onFocus={selectOnFocus}
                        placeholder="Lts, kg"
                        className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="number"
                        step="0.001"
                        value={it.cantidadPorUnidad}
                        onChange={(e) =>
                          onEditar(it.id, {
                            cantidadPorUnidad: Number(e.target.value) || 0,
                          })
                        }
                        onFocus={selectOnFocus}
                        className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-right text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </td>
                    <td className="p-1">
                      <input
                        type="number"
                        step="0.01"
                        value={it.costoUnitario}
                        onChange={(e) =>
                          onEditar(it.id, { costoUnitario: Number(e.target.value) || 0 })
                        }
                        onFocus={selectOnFocus}
                        className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-right text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </td>
                    <td className="p-1 text-right font-semibold">
                      {formatearBolivianos(it.cantidadPorUnidad * it.costoUnitario)}
                    </td>
                    <td className="p-1 text-right">
                      <button
                        onClick={() => onEliminar(it.id)}
                        className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <button
          onClick={onAgregar}
          className="flex items-center gap-1.5 rounded-md border border-dashed border-border bg-card px-2.5 py-1.5 text-xs text-muted-foreground hover:border-foreground hover:text-foreground"
        >
          <Plus className="h-3.5 w-3.5" />
          Agregar a {config.label.toLowerCase()}
        </button>
      </div>
    </div>
  );
}
