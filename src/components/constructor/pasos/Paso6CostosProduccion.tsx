import { AlertCircle, Plus, Trash2 } from "lucide-react";
import { useProyectoStore } from "@/stores/proyecto-store";
import FichaPedagogica from "../FichaPedagogica";
import { formatearBolivianos, cn } from "@/lib/utils";
import { migrarProducto } from "@/lib/proyecto-factory";
import type { CategoriaCostoDirecto, CostoDirecto, Sector } from "@/types/proyecto";

interface ConfigSubcat {
  valor: CategoriaCostoDirecto;
  label: string;
  ejemplos: string;
}

// Sub-categorías por sector (más simple: sin colores propios — el color
// viene del producto al que pertenecen)
const SUBCATEGORIAS_POR_SECTOR: Record<Sector, ConfigSubcat[]> = {
  produccion: [
    { valor: "materia_prima", label: "Materias primas", ejemplos: "Lo que se transforma o incorpora al producto. Ej: harina, tela, madera." },
    { valor: "insumo", label: "Insumos / Utilidades", ejemplos: "Agua, electricidad, gas, combustibles consumidos en el proceso." },
    { valor: "empaque", label: "Empaque", ejemplos: "Envases, etiquetas, embalaje, cajas." },
    { valor: "mano_obra", label: "Mano de obra directa", ejemplos: "Operarios cuyo costo escala con cada unidad producida." },
  ],
  comercio: [
    { valor: "mercaderia", label: "Mercadería", ejemplos: "Productos que comprás para revender." },
    { valor: "empaque", label: "Empaque", ejemplos: "Bolsas, papel, etiquetas, cajas de entrega." },
    { valor: "comision_venta", label: "Comisiones de venta", ejemplos: "% al vendedor por cada venta." },
  ],
  servicios: [
    { valor: "insumo_directo", label: "Insumos del servicio", ejemplos: "Café en grano, leche, tinte, repuestos." },
    { valor: "suministro", label: "Suministros consumibles", ejemplos: "Servilletas, vasos descartables, papel toalla." },
    { valor: "mano_obra", label: "Mano de obra directa", ejemplos: "Barista, peluquero, técnico — por cliente atendido." },
  ],
  agricultura: [
    { valor: "semilla", label: "Semillas y plantines", ejemplos: "Semillas de papa, maíz. Plantines de tomate." },
    { valor: "fertilizante", label: "Fertilizantes y agroquímicos", ejemplos: "Urea, abono, pesticidas, herbicidas." },
    { valor: "riego_combustible", label: "Riego, energía y combustible", ejemplos: "Agua de riego, diésel, electricidad." },
    { valor: "mano_obra_agricola", label: "Mano de obra agrícola", ejemplos: "Jornaleros, cosecha, mantenimiento." },
  ],
  mixto: [
    { valor: "materia_prima", label: "Materias primas / Mercadería", ejemplos: "Lo que se transforma o se vende directamente." },
    { valor: "insumo", label: "Insumos / Utilidades", ejemplos: "Agua, luz, gas, combustibles." },
    { valor: "empaque", label: "Empaque", ejemplos: "Envases, etiquetas, embalaje." },
    { valor: "mano_obra", label: "Mano de obra directa", ejemplos: "Personal que escala por unidad o cliente." },
    { valor: "otro", label: "Otros costos directos", ejemplos: "Cualquier otro costo variable." },
  ],
};

// Paleta de colores por producto (igual que Paso 2 Proyección)
const COLORES_PRODUCTO = [
  {
    borde: "border-l-blue-500",
    bgFila: "bg-blue-50 dark:bg-blue-950/20",
    bgHeader: "bg-blue-100/70 dark:bg-blue-950/40",
    chip: "bg-blue-200 text-blue-900 dark:bg-blue-900/60 dark:text-blue-100",
  },
  {
    borde: "border-l-emerald-500",
    bgFila: "bg-emerald-50 dark:bg-emerald-950/20",
    bgHeader: "bg-emerald-100/70 dark:bg-emerald-950/40",
    chip: "bg-emerald-200 text-emerald-900 dark:bg-emerald-900/60 dark:text-emerald-100",
  },
  {
    borde: "border-l-amber-500",
    bgFila: "bg-amber-50 dark:bg-amber-950/20",
    bgHeader: "bg-amber-100/70 dark:bg-amber-950/40",
    chip: "bg-amber-200 text-amber-900 dark:bg-amber-900/60 dark:text-amber-100",
  },
  {
    borde: "border-l-purple-500",
    bgFila: "bg-purple-50 dark:bg-purple-950/20",
    bgHeader: "bg-purple-100/70 dark:bg-purple-950/40",
    chip: "bg-purple-200 text-purple-900 dark:bg-purple-900/60 dark:text-purple-100",
  },
  {
    borde: "border-l-pink-500",
    bgFila: "bg-pink-50 dark:bg-pink-950/20",
    bgHeader: "bg-pink-100/70 dark:bg-pink-950/40",
    chip: "bg-pink-200 text-pink-900 dark:bg-pink-900/60 dark:text-pink-100",
  },
  {
    borde: "border-l-cyan-500",
    bgFila: "bg-cyan-50 dark:bg-cyan-950/20",
    bgHeader: "bg-cyan-100/70 dark:bg-cyan-950/40",
    chip: "bg-cyan-200 text-cyan-900 dark:bg-cyan-900/60 dark:text-cyan-100",
  },
];

const selectOnFocus = (e: React.FocusEvent<HTMLInputElement>) =>
  e.currentTarget.select();

export default function Paso6CostosProduccion() {
  const proyecto = useProyectoStore((s) => s.proyecto)!;
  const agregar = useProyectoStore((s) => s.agregarCostoDirecto);
  const editar = useProyectoStore((s) => s.editarCostoDirecto);
  const eliminar = useProyectoStore((s) => s.eliminarCostoDirecto);

  const productos = proyecto.productos.map(migrarProducto);
  const subcategorias = SUBCATEGORIAS_POR_SECTOR[proyecto.sector];

  // Items huérfanos: sin productoId asignado (legados pre-refactor)
  const itemsHuerfanos = proyecto.costosDirectos.filter((c) => !c.productoId);

  // Costo unitario directo por producto
  const costoUnitPorProducto: Record<string, number> = {};
  productos.forEach((p) => {
    costoUnitPorProducto[p.id] = proyecto.costosDirectos
      .filter((c) => c.productoId === p.id)
      .reduce((a, c) => a + c.cantidadPorUnidad * c.costoUnitario, 0);
  });
  const costoUnitGenerico = itemsHuerfanos.reduce(
    (a, c) => a + c.cantidadPorUnidad * c.costoUnitario,
    0
  );

  // Costos directos totales por año (cada producto × su costo unitario + parte genérica)
  const costosPorAnio = [0, 1, 2, 3, 4].map((i) =>
    productos.reduce((acc, p) => {
      const cant = p.cantidades[i];
      const unit = (costoUnitPorProducto[p.id] ?? 0) + costoUnitGenerico;
      return acc + cant * unit;
    }, 0)
  );

  if (productos.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Aún no agregaste productos. Volve al <strong>Paso 2 · Proyección de demanda</strong> y
          define al menos un producto antes de configurar sus costos directos.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_280px]">
      <div className="space-y-3 rounded-lg border border-border bg-card p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              Paso 6 · Costos directos de producción
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Por cada producto, define qué le cuesta producir/atender 1 unidad.
              Sub-categorías adaptadas al sector{" "}
              <span className="font-medium capitalize">{proyecto.sector}</span>.
            </p>
          </div>
        </div>

        {productos.map((p, idx) => {
          const color = COLORES_PRODUCTO[idx % COLORES_PRODUCTO.length];
          const costoUnit = costoUnitPorProducto[p.id] ?? 0;
          return (
            <BloqueProducto
              key={p.id}
              producto={p}
              productoIndex={idx}
              color={color}
              costoUnit={costoUnit}
              subcategorias={subcategorias}
              costos={proyecto.costosDirectos.filter((c) => c.productoId === p.id)}
              onAgregar={(categoria) =>
                agregar({
                  productoId: p.id,
                  categoria,
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

        {/* Items huérfanos: legados sin producto asignado */}
        {itemsHuerfanos.length > 0 && (
          <div className="rounded-md border-2 border-amber-400 bg-amber-50 p-3 dark:border-amber-700 dark:bg-amber-950/40">
            <div className="flex items-start gap-2 text-xs text-amber-950 dark:text-amber-100">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
              <div className="flex-1">
                <strong>
                  {itemsHuerfanos.length} item{itemsHuerfanos.length === 1 ? "" : "s"} sin
                  producto asignado
                </strong>
                <p className="mt-1 text-[11px]">
                  Estos costos fueron creados antes y no están asociados a un producto
                  específico. Por ahora se aplican a TODOS los productos por igual. Si
                  no los necesitas, elimínalos.
                </p>
                <ul className="ml-3 mt-2 list-disc space-y-1">
                  {itemsHuerfanos.map((it) => (
                    <li key={it.id} className="flex items-center justify-between gap-2">
                      <span>
                        <span className="font-mono text-[10px] text-amber-700">
                          [{it.categoria}]
                        </span>{" "}
                        <strong>{it.descripcion || "(sin nombre)"}</strong> —{" "}
                        {formatearBolivianos(it.cantidadPorUnidad * it.costoUnitario)}/u
                      </span>
                      <button
                        onClick={() => eliminar(it.id)}
                        className="rounded p-1 text-amber-700 hover:bg-destructive/20 hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Resumen consolidado */}
        <div className="rounded-md border-2 border-primary/40 bg-primary/5 p-3">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide">
            Costos directos consolidados (todos los productos)
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
              {productos.map((p, idx) => {
                const color = COLORES_PRODUCTO[idx % COLORES_PRODUCTO.length];
                const cu = (costoUnitPorProducto[p.id] ?? 0) + costoUnitGenerico;
                return (
                  <tr key={p.id} className="border-t border-border/40">
                    <td className="p-1">
                      <span
                        className={cn(
                          "rounded px-1.5 py-0.5 text-[9px] font-bold uppercase",
                          color.chip
                        )}
                      >
                        {p.nombre || `Producto ${idx + 1}`}
                      </span>
                    </td>
                    {[0, 1, 2, 3, 4].map((i) => (
                      <td key={i} className="p-1 text-right">
                        {formatearBolivianos(p.cantidades[i] * cu)}
                      </td>
                    ))}
                  </tr>
                );
              })}
              <tr className="border-t-2 border-border bg-primary/10">
                <td className="p-1 font-bold">TOTAL</td>
                {costosPorAnio.map((c, i) => (
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
        titulo="Costos por producto"
        contenido={
          <>
            Cada <strong>producto distinto</strong> tiene sus propios costos directos.
            Un café no usa los mismos insumos que un postre. Por eso esta sección se
            divide por producto.
            <br />
            <br />
            Para cada producto, defines cuánto consume por cada unidad (taza, kg,
            unidad). El simulador multiplica por las cantidades del Paso 2 para
            proyectar costos año a año.
            <br />
            <br />
            Si tu proyecto tiene <strong>un solo producto/servicio</strong>, igual te
            aparece un solo bloque arriba.
          </>
        }
      />
    </div>
  );
}

function BloqueProducto({
  producto,
  productoIndex,
  color,
  costoUnit,
  subcategorias,
  costos,
  onAgregar,
  onEditar,
  onEliminar,
}: {
  producto: ReturnType<typeof migrarProducto>;
  productoIndex: number;
  color: typeof COLORES_PRODUCTO[number];
  costoUnit: number;
  subcategorias: ConfigSubcat[];
  costos: CostoDirecto[];
  onAgregar: (categoria: CategoriaCostoDirecto) => void;
  onEditar: (id: string, cambios: Partial<CostoDirecto>) => void;
  onEliminar: (id: string) => void;
}) {
  const margen = producto.precios[0] - costoUnit;
  const margenPct = producto.precios[0] > 0 ? (margen / producto.precios[0]) * 100 : 0;

  return (
    <div className={cn("overflow-hidden rounded-md border-l-4", color.borde, color.bgFila)}>
      {/* Header del producto */}
      <div className={cn("flex flex-wrap items-center justify-between gap-2 px-3 py-2", color.bgHeader)}>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
              color.chip
            )}
          >
            Producto {productoIndex + 1}: {producto.nombre || "(sin nombre)"}
          </span>
          <span className="text-[10px] text-foreground/70">
            {producto.unidadMedida} · {formatearBolivianos(producto.precios[0])}/u (precio venta)
          </span>
        </div>
        <div className="flex items-center gap-4 text-right text-[11px]">
          <div>
            <div className="text-[9px] uppercase tracking-wide text-muted-foreground">
              Costo directo /u
            </div>
            <div className="font-bold">{formatearBolivianos(costoUnit)}</div>
          </div>
          <div>
            <div className="text-[9px] uppercase tracking-wide text-muted-foreground">
              Margen /u
            </div>
            <div
              className={cn(
                "font-bold",
                margen >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-destructive"
              )}
            >
              {formatearBolivianos(margen)}{" "}
              <span className="text-[9px]">({margenPct.toFixed(0)}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Demanda año por año del producto */}
      <div className="border-b border-border/60 bg-card/50 px-3 py-1.5">
        <div className="flex items-center gap-2 text-[10px]">
          <span className="font-semibold uppercase tracking-wide text-muted-foreground">
            Demanda proyectada:
          </span>
          {[0, 1, 2, 3, 4].map((i) => (
            <span key={i} className="rounded bg-secondary px-1.5 py-0.5">
              Año {i + 1}: <strong>{producto.cantidades[i].toLocaleString()}</strong> {producto.unidadMedida}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-3 p-3">
        {subcategorias.map((sub) => {
          const items = costos.filter((c) => c.categoria === sub.valor);
          const subtotal = items.reduce(
            (a, c) => a + c.cantidadPorUnidad * c.costoUnitario,
            0
          );
          return (
            <div key={sub.valor} className="rounded-md border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border bg-secondary/40 px-2 py-1.5">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                    {sub.label}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{sub.ejemplos}</span>
                </div>
                <span className="text-xs font-semibold">{formatearBolivianos(subtotal)}/u</span>
              </div>

              {items.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      <tr className="border-b border-border">
                        <th className="p-1.5 text-left w-[34%]">Descripción</th>
                        <th className="p-1.5 text-left w-[10%]">Unidad</th>
                        <th className="p-1.5 text-right w-[14%]">Cant./u producto</th>
                        <th className="p-1.5 text-right w-[14%]">Costo unit. (Bs)</th>
                        <th className="p-1.5 text-right w-[15%]">Subtotal/u</th>
                        <th className="w-8 p-1.5"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((it) => (
                        <tr key={it.id} className="border-b border-border/40 last:border-0">
                          <td className="p-1">
                            <input
                              type="text"
                              value={it.descripcion}
                              onChange={(e) =>
                                onEditar(it.id, { descripcion: e.target.value })
                              }
                              onFocus={selectOnFocus}
                              className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                          </td>
                          <td className="p-1">
                            <input
                              type="text"
                              value={it.unidadMedida}
                              onChange={(e) =>
                                onEditar(it.id, { unidadMedida: e.target.value })
                              }
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
                                onEditar(it.id, {
                                  costoUnitario: Number(e.target.value) || 0,
                                })
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

              <div className="p-2">
                <button
                  onClick={() => onAgregar(sub.valor)}
                  className="flex items-center gap-1.5 rounded-md border border-dashed border-border bg-card px-2.5 py-1.5 text-[11px] text-muted-foreground hover:border-foreground hover:text-foreground"
                >
                  <Plus className="h-3 w-3" />
                  Agregar a {sub.label.toLowerCase()}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
