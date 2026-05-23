import { useRef } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useProyectoStore } from "@/stores/proyecto-store";
import FichaPedagogica from "../FichaPedagogica";
import { formatearBolivianos, cn } from "@/lib/utils";
import { migrarProducto } from "@/lib/proyecto-factory";

export default function Paso2Proyeccion() {
  const proyecto = useProyectoStore((s) => s.proyecto)!;
  const agregar = useProyectoStore((s) => s.agregarProducto);
  const editar = useProyectoStore((s) => s.editarProducto);
  const eliminar = useProyectoStore((s) => s.eliminarProducto);
  const setTasaCant = useProyectoStore((s) => s.setTasaCrecCantidad);
  const setTasaPrec = useProyectoStore((s) => s.setTasaCrecPrecio);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const productos = proyecto.productos.map(migrarProducto);
  const tasasCant = proyecto.tasasCrecCantidad ?? [0, 0, 0, 0];
  const tasasPrec = proyecto.tasasCrecPrecio ?? [0, 0, 0, 0];

  const ingresosPorAnio = [0, 1, 2, 3, 4].map((i) =>
    productos.reduce((acc, p) => acc + p.cantidades[i] * p.precios[i], 0)
  );
  const unidadesPorAnio = [0, 1, 2, 3, 4].map((i) =>
    productos.reduce((acc, p) => acc + p.cantidades[i], 0)
  );

  const onKeyEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const input = e.currentTarget;
    const col = input.dataset.col;
    if (!col || !containerRef.current) return;
    const all = Array.from(
      containerRef.current.querySelectorAll<HTMLInputElement>(`input[data-col="${col}"]`)
    );
    const idx = all.indexOf(input);
    const next = all[idx + 1];
    if (next) {
      next.focus();
      next.select();
    }
  };

  const cambiarCantidad = (id: string, anio: number, valor: number) => {
    const p = productos.find((x) => x.id === id);
    if (!p) return;
    const nuevas = [...p.cantidades] as [number, number, number, number, number];
    nuevas[anio] = valor;
    editar(id, { cantidades: nuevas });
  };

  const cambiarPrecio = (id: string, anio: number, valor: number) => {
    const p = productos.find((x) => x.id === id);
    if (!p) return;
    const nuevos = [...p.precios] as [number, number, number, number, number];
    nuevos[anio] = valor;
    editar(id, { precios: nuevos });
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_280px]">
      <div ref={containerRef} className="space-y-3 rounded-lg border border-border bg-card p-5">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Paso 2 · Proyección de demanda
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Las tasas de crecimiento de arriba aplican a <strong>todos los productos por igual</strong>.
            Puedes editar valores individuales en cada celda.{" "}
            <kbd className="rounded bg-secondary px-1 text-[10px]">Enter</kbd> baja a la siguiente celda.
          </p>
        </div>

        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b-2 border-border bg-secondary">
                <th className="p-2 text-left font-semibold">Concepto</th>
                <th className="p-2 text-left font-semibold">Unidad</th>
                {[1, 2, 3, 4, 5].map((a) => (
                  <th key={a} className="p-2 text-center font-semibold">Año {a}</th>
                ))}
                <th className="w-8 p-2"></th>
              </tr>
            </thead>
            <tbody>
              {/* TASAS GLOBALES */}
              <tr className="border-b border-border bg-amber-50/40 dark:bg-amber-950/20">
                <td className="p-1.5 text-[11px] font-medium" colSpan={2}>
                  📈 Tasa crecimiento cantidad (%)
                </td>
                <td className="p-1.5 text-center text-muted-foreground">—</td>
                {tasasCant.map((t, i) => (
                  <td key={i} className="p-1.5">
                    <input
                      type="number"
                      step="0.5"
                      value={t}
                      onChange={(e) => setTasaCant(i, Number(e.target.value) || 0)}
                      onKeyDown={onKeyEnter}
                      data-col={`tasa-${i + 1}`}
                      className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-right text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </td>
                ))}
                <td></td>
              </tr>
              <tr className="border-b-2 border-border bg-amber-50/40 dark:bg-amber-950/20">
                <td className="p-1.5 text-[11px] font-medium" colSpan={2}>
                  📈 Tasa crecimiento precio (%)
                </td>
                <td className="p-1.5 text-center text-muted-foreground">—</td>
                {tasasPrec.map((t, i) => (
                  <td key={i} className="p-1.5">
                    <input
                      type="number"
                      step="0.5"
                      value={t}
                      onChange={(e) => setTasaPrec(i, Number(e.target.value) || 0)}
                      onKeyDown={onKeyEnter}
                      data-col={`tasaP-${i + 1}`}
                      className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-right text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </td>
                ))}
                <td></td>
              </tr>

              {productos.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-muted-foreground">
                    Aún no agregaste productos.
                  </td>
                </tr>
              )}

              {productos.map((p, pi) => (
                <ProductoFilas
                  key={p.id}
                  prod={p}
                  productoIndex={pi}
                  onChangeNombre={(v) => editar(p.id, { nombre: v })}
                  onChangeUnidad={(v) => editar(p.id, { unidadMedida: v })}
                  onChangeCantidad={(anio, v) => cambiarCantidad(p.id, anio, v)}
                  onChangePrecio={(anio, v) => cambiarPrecio(p.id, anio, v)}
                  onEliminar={() => eliminar(p.id)}
                  onKeyEnter={onKeyEnter}
                />
              ))}

              {productos.length > 0 && (
                <>
                  <tr className="border-t-2 border-border bg-secondary/50">
                    <td className="p-2 text-xs font-semibold" colSpan={2}>
                      TOTAL UNIDADES
                    </td>
                    {unidadesPorAnio.map((u, i) => (
                      <td key={i} className="p-2 text-right text-xs font-semibold">
                        {u.toLocaleString()}
                      </td>
                    ))}
                    <td></td>
                  </tr>
                  <tr className="bg-primary/10">
                    <td className="p-2 text-xs font-bold" colSpan={2}>
                      TOTAL INGRESOS (Bs)
                    </td>
                    {ingresosPorAnio.map((ing, i) => (
                      <td key={i} className="p-2 text-right text-xs font-bold">
                        {formatearBolivianos(ing)}
                      </td>
                    ))}
                    <td></td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>

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
      </div>

      <FichaPedagogica
        titulo="Tasas globales de crecimiento"
        contenido={
          <>
            La <strong>tasa de crecimiento</strong> aplica a <strong>todos los
            productos por igual</strong>. Si la cambias, los años siguientes se
            recalculan en cascada para cada producto. <br /><br />
            Si quieres que un producto crezca distinto, puedes editar directamente
            su cantidad o precio en el año específico (las tasas no lo
            sobrescribirán hasta que las toques otra vez).
            <br /><br />
            <strong>Tip:</strong> <kbd className="rounded bg-secondary/50 px-1 text-[10px]">Enter</kbd>{" "}
            baja a la siguiente celda de la misma columna.
          </>
        }
      />
    </div>
  );
}

function ProductoFilas({
  prod,
  productoIndex,
  onChangeNombre,
  onChangeUnidad,
  onChangeCantidad,
  onChangePrecio,
  onEliminar,
  onKeyEnter,
}: {
  prod: ReturnType<typeof migrarProducto>;
  productoIndex: number;
  onChangeNombre: (v: string) => void;
  onChangeUnidad: (v: string) => void;
  onChangeCantidad: (anio: number, v: number) => void;
  onChangePrecio: (anio: number, v: number) => void;
  onEliminar: () => void;
  onKeyEnter: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}) {
  return (
    <>
      {/* Fila de header del producto */}
      <tr className="border-t-2 border-border bg-secondary/20">
        <td className="p-1.5" colSpan={1}>
          <input
            type="text"
            value={prod.nombre}
            onChange={(e) => onChangeNombre(e.target.value)}
            placeholder="Producto / servicio"
            className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </td>
        <td className="p-1.5">
          <input
            type="text"
            value={prod.unidadMedida}
            onChange={(e) => onChangeUnidad(e.target.value)}
            placeholder="taza, kg…"
            className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </td>
        <td colSpan={5} className="p-1.5 text-[11px] text-muted-foreground">
          Producto {productoIndex + 1}
        </td>
        <td className="p-1.5 text-center">
          <button
            onClick={onEliminar}
            className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            title="Eliminar producto"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </td>
      </tr>
      {/* Cantidades por año */}
      <tr>
        <td className="p-1.5 text-[11px]" colSpan={2}>
          <span className="pl-3 text-muted-foreground">↳ Cantidad</span>
        </td>
        {prod.cantidades.map((c, i) => (
          <td key={i} className="p-1.5">
            <input
              type="number"
              value={c}
              onChange={(e) => onChangeCantidad(i, Number(e.target.value) || 0)}
              onKeyDown={onKeyEnter}
              data-col={`cant-${i + 1}`}
              className={cn(
                "w-full rounded-md border border-input bg-background px-2 py-1.5 text-right text-xs",
                "focus:outline-none focus:ring-2 focus:ring-ring"
              )}
            />
          </td>
        ))}
        <td></td>
      </tr>
      {/* Precios por año */}
      <tr>
        <td className="p-1.5 text-[11px]" colSpan={2}>
          <span className="pl-3 text-muted-foreground">↳ Precio (Bs)</span>
        </td>
        {prod.precios.map((pr, i) => (
          <td key={i} className="p-1.5">
            <input
              type="number"
              step="0.01"
              value={pr}
              onChange={(e) => onChangePrecio(i, Number(e.target.value) || 0)}
              onKeyDown={onKeyEnter}
              data-col={`prec-${i + 1}`}
              className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-right text-xs focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </td>
        ))}
        <td></td>
      </tr>
      {/* Ingreso del producto */}
      <tr className="border-b border-border bg-secondary/10">
        <td className="p-1.5 text-[11px]" colSpan={2}>
          <span className="pl-3 text-muted-foreground">↳ Ingreso (Bs)</span>
        </td>
        {prod.cantidades.map((c, i) => (
          <td key={i} className="p-1.5 text-right text-xs font-semibold">
            {formatearBolivianos(c * prod.precios[i])}
          </td>
        ))}
        <td></td>
      </tr>
    </>
  );
}
