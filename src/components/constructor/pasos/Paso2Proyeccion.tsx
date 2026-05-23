import { useRef } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useProyectoStore } from "@/stores/proyecto-store";
import FichaPedagogica from "../FichaPedagogica";
import { formatearBolivianos, cn } from "@/lib/utils";
import { migrarProducto } from "@/lib/proyecto-factory";

type Tupla5 = [number, number, number, number, number];

function calcularTasas(valores: Tupla5): [number, number, number, number] {
  return [1, 2, 3, 4].map((i) => {
    const prev = valores[i - 1];
    if (prev === 0) return 0;
    return ((valores[i] / prev) - 1) * 100;
  }) as [number, number, number, number];
}

function aplicarTasaDesde(valores: Tupla5, indice: number, nuevaTasa: number): Tupla5 {
  // Cambia los valores desde `indice` aplicando esa tasa, manteniendo año 1
  const nuevo: Tupla5 = [...valores];
  for (let i = indice; i < 5; i++) {
    nuevo[i] = Math.round(nuevo[i - 1] * (1 + nuevaTasa / 100));
  }
  return nuevo;
}

export default function Paso2Proyeccion() {
  const proyecto = useProyectoStore((s) => s.proyecto)!;
  const agregar = useProyectoStore((s) => s.agregarProducto);
  const editar = useProyectoStore((s) => s.editarProducto);
  const eliminar = useProyectoStore((s) => s.eliminarProducto);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const productos = proyecto.productos.map(migrarProducto);

  const ingresosPorAnio: Tupla5 = [0, 1, 2, 3, 4].map((i) =>
    productos.reduce((acc, p) => acc + p.cantidades[i] * p.precios[i], 0)
  ) as Tupla5;
  const unidadesPorAnio: Tupla5 = [0, 1, 2, 3, 4].map((i) =>
    productos.reduce((acc, p) => acc + p.cantidades[i], 0)
  ) as Tupla5;

  // Enter para saltar a misma columna en siguiente fila editable
  const onKeyEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const input = e.currentTarget;
    const col = input.dataset.col;
    const grupoId = input.dataset.grupo;
    if (!col || !grupoId || !containerRef.current) return;
    // Buscar el siguiente input editable con la misma columna en el documento
    const allInputs = Array.from(
      containerRef.current.querySelectorAll<HTMLInputElement>(`input[data-col="${col}"]`)
    );
    const idx = allInputs.indexOf(input);
    const siguiente = allInputs[idx + 1];
    if (siguiente) {
      siguiente.focus();
      siguiente.select();
    }
  };

  const cambiarCantidad = (id: string, anio: number, valor: number) => {
    const p = productos.find((x) => x.id === id);
    if (!p) return;
    const nuevas = [...p.cantidades] as Tupla5;
    nuevas[anio] = valor;
    editar(id, { cantidades: nuevas });
  };

  const cambiarPrecio = (id: string, anio: number, valor: number) => {
    const p = productos.find((x) => x.id === id);
    if (!p) return;
    const nuevos = [...p.precios] as Tupla5;
    nuevos[anio] = valor;
    editar(id, { precios: nuevos });
  };

  const cambiarTasaCantidad = (id: string, anioDestino: number, nuevaTasa: number) => {
    const p = productos.find((x) => x.id === id);
    if (!p) return;
    const nuevas = aplicarTasaDesde(p.cantidades, anioDestino, nuevaTasa);
    editar(id, { cantidades: nuevas });
  };

  const cambiarTasaPrecio = (id: string, anioDestino: number, nuevaTasa: number) => {
    const p = productos.find((x) => x.id === id);
    if (!p) return;
    const nuevos = aplicarTasaDesde(p.precios, anioDestino, nuevaTasa);
    editar(id, { precios: nuevos });
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_300px]">
      <div ref={containerRef} className="space-y-4 rounded-lg border border-border bg-card p-5">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Paso 2 · Proyección de demanda
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Cantidades y precios año por año. Cambia las tasas de crecimiento para
            auto-llenar los años siguientes. <kbd className="rounded bg-secondary px-1 text-[10px]">Enter</kbd> baja a la siguiente celda.
          </p>
        </div>

        {productos.length === 0 && (
          <div className="rounded-md border border-dashed border-border bg-secondary/20 p-6 text-center text-sm text-muted-foreground">
            Aún no agregaste productos.
          </div>
        )}

        {productos.map((p, idx) => {
          const tasasCantidad = calcularTasas(p.cantidades);
          const tasasPrecio = calcularTasas(p.precios);
          return (
            <div key={p.id} className="rounded-md border-2 border-border bg-background p-3 space-y-2">
              {/* Header */}
              <div className="flex flex-wrap items-end gap-2 border-b border-border pb-2">
                <span className="rounded-md bg-secondary px-2 py-0.5 text-[10px] font-medium">
                  Producto {idx + 1}
                </span>
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-[10px] uppercase text-muted-foreground">Nombre</label>
                  <input
                    type="text"
                    value={p.nombre}
                    onChange={(e) => editar(p.id, { nombre: e.target.value })}
                    placeholder="Ej: Café especialidad"
                    className="w-full rounded-md border border-input bg-background px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div className="w-24">
                  <label className="block text-[10px] uppercase text-muted-foreground">Unidad</label>
                  <input
                    type="text"
                    value={p.unidadMedida}
                    onChange={(e) => editar(p.id, { unidadMedida: e.target.value })}
                    placeholder="taza"
                    className="w-full rounded-md border border-input bg-background px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <button
                  onClick={() => eliminar(p.id)}
                  className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground hover:border-destructive hover:text-destructive"
                  title="Eliminar producto"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Mini-tabla 5 años */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-[10px] uppercase text-muted-foreground">
                      <th className="p-1 text-left"></th>
                      <th className="p-1 text-center">Año 1</th>
                      <th className="p-1 text-center">Año 2</th>
                      <th className="p-1 text-center">Año 3</th>
                      <th className="p-1 text-center">Año 4</th>
                      <th className="p-1 text-center">Año 5</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Tasa cantidad */}
                    <tr>
                      <td className="p-1 text-[11px] text-muted-foreground">Tasa crec. cantidad (%)</td>
                      <td className="p-1 text-center text-muted-foreground">—</td>
                      {tasasCantidad.map((t, i) => (
                        <td key={i} className="p-1">
                          <input
                            type="number"
                            step="0.5"
                            value={Number.isFinite(t) ? Number(t.toFixed(2)) : 0}
                            onChange={(e) => cambiarTasaCantidad(p.id, i + 1, Number(e.target.value) || 0)}
                            onKeyDown={onKeyEnter}
                            data-grupo={`${p.id}-tasaC`}
                            data-col={i + 1}
                            className="w-full rounded-md border border-input bg-background px-1.5 py-1 text-right text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </td>
                      ))}
                    </tr>
                    {/* Cantidad */}
                    <tr className="bg-secondary/30">
                      <td className="p-1 text-[11px] font-semibold">Cantidad</td>
                      {p.cantidades.map((c, i) => (
                        <td key={i} className="p-1">
                          <input
                            type="number"
                            value={c}
                            onChange={(e) => cambiarCantidad(p.id, i, Number(e.target.value) || 0)}
                            onKeyDown={onKeyEnter}
                            data-grupo={`${p.id}-cant`}
                            data-col={i}
                            className="w-full rounded-md border border-input bg-background px-1.5 py-1 text-right text-xs font-medium focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </td>
                      ))}
                    </tr>
                    {/* Tasa precio */}
                    <tr>
                      <td className="p-1 text-[11px] text-muted-foreground">Tasa crec. precio (%)</td>
                      <td className="p-1 text-center text-muted-foreground">—</td>
                      {tasasPrecio.map((t, i) => (
                        <td key={i} className="p-1">
                          <input
                            type="number"
                            step="0.5"
                            value={Number.isFinite(t) ? Number(t.toFixed(2)) : 0}
                            onChange={(e) => cambiarTasaPrecio(p.id, i + 1, Number(e.target.value) || 0)}
                            onKeyDown={onKeyEnter}
                            data-grupo={`${p.id}-tasaP`}
                            data-col={i + 1}
                            className="w-full rounded-md border border-input bg-background px-1.5 py-1 text-right text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </td>
                      ))}
                    </tr>
                    {/* Precio */}
                    <tr className="bg-secondary/30">
                      <td className="p-1 text-[11px] font-semibold">Precio (Bs)</td>
                      {p.precios.map((pr, i) => (
                        <td key={i} className="p-1">
                          <input
                            type="number"
                            step="0.01"
                            value={pr}
                            onChange={(e) => cambiarPrecio(p.id, i, Number(e.target.value) || 0)}
                            onKeyDown={onKeyEnter}
                            data-grupo={`${p.id}-prec`}
                            data-col={i}
                            className="w-full rounded-md border border-input bg-background px-1.5 py-1 text-right text-xs font-medium focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </td>
                      ))}
                    </tr>
                    {/* Ingreso calculado */}
                    <tr className="bg-primary/10">
                      <td className="p-1 text-[11px] font-bold">Ingreso (Bs)</td>
                      {p.cantidades.map((c, i) => (
                        <td key={i} className="p-1 text-right text-xs font-bold">
                          {formatearBolivianos(c * p.precios[i])}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}

        <button
          onClick={() =>
            agregar({
              nombre: "Nuevo producto",
              unidadMedida: "und",
              cantidades: [0, 0, 0, 0, 0],
              precios: [0, 0, 0, 0, 0],
            } as any)
          }
          className="flex items-center gap-2 rounded-md border border-dashed border-border bg-background px-3 py-2 text-xs font-medium text-muted-foreground hover:border-foreground hover:text-foreground"
        >
          <Plus className="h-3.5 w-3.5" />
          Agregar producto
        </button>

        {/* Resumen del proyecto */}
        {productos.length > 0 && (
          <div className="rounded-md border-2 border-primary/40 bg-primary/5 p-3">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide">Totales del proyecto</div>
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
                  <td className="p-1">Unidades totales</td>
                  {unidadesPorAnio.map((u, i) => (
                    <td key={i} className="p-1 text-right">{u.toLocaleString()}</td>
                  ))}
                </tr>
                <tr className="border-t border-border">
                  <td className="p-1 font-bold">Ingresos totales (Bs)</td>
                  {ingresosPorAnio.map((ing, i) => (
                    <td key={i} className={cn("p-1 text-right font-bold")}>
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
        titulo="Tasas de crecimiento"
        contenido={
          <>
            La fila de <strong>tasa de crecimiento</strong> muestra el % de aumento de
            un año al siguiente. Si la cambias, se recalculan automáticamente los años
            siguientes desde ahí. Si editas una <strong>cantidad o precio</strong>{" "}
            directamente, las tasas se actualizan solas.
            <br />
            <br />
            <strong>Tip:</strong> presiona <kbd className="rounded bg-secondary/50 px-1 text-[10px]">Enter</kbd>{" "}
            mientras editas para bajar a la siguiente celda de la misma columna.
          </>
        }
      />
    </div>
  );
}
