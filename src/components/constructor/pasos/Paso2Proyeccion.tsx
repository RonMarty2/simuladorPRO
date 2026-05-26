import { useRef, useState } from "react";
import { ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react";
import { useProyectoStore } from "@/stores/proyecto-store";
import FichaPedagogica from "../FichaPedagogica";
import { formatearBolivianos, cn } from "@/lib/utils";
import { migrarProducto } from "@/lib/proyecto-factory";

// Paleta de colores por producto (cíclica si hay más de 6)
const COLORES_PRODUCTO = [
  { borde: "border-l-blue-500", chip: "bg-blue-100 text-blue-900 dark:bg-blue-900/40 dark:text-blue-200" },
  { borde: "border-l-emerald-500", chip: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200" },
  { borde: "border-l-amber-500", chip: "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200" },
  { borde: "border-l-purple-500", chip: "bg-purple-100 text-purple-900 dark:bg-purple-900/40 dark:text-purple-200" },
  { borde: "border-l-pink-500", chip: "bg-pink-100 text-pink-900 dark:bg-pink-900/40 dark:text-pink-200" },
  { borde: "border-l-cyan-500", chip: "bg-cyan-100 text-cyan-900 dark:bg-cyan-900/40 dark:text-cyan-200" },
];

const selectOnFocus = (e: React.FocusEvent<HTMLInputElement>) =>
  e.currentTarget.select();

export default function Paso2Proyeccion() {
  const proyecto = useProyectoStore((s) => s.proyecto)!;
  const agregar = useProyectoStore((s) => s.agregarProducto);
  const editar = useProyectoStore((s) => s.editarProducto);
  const eliminar = useProyectoStore((s) => s.eliminarProducto);
  const setTasaCant = useProyectoStore((s) => s.setTasaCrecCantidad);
  const setTasaPrec = useProyectoStore((s) => s.setTasaCrecPrecio);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Estado de colapso: tasas y cada producto (por id). Default: colapsado.
  const [tasasAbierto, setTasasAbierto] = useState(false);
  const [expandidos, setExpandidos] = useState<Record<string, boolean>>({});
  const toggleProducto = (id: string) =>
    setExpandidos((e) => ({ ...e, [id]: !e[id] }));

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

  /**
   * Edita la cantidad de un año específico.
   * - Si edita año 1 (anio=0) → propaga a años 2-5 usando las tasas vigentes
   *   (con tasa 0%, los siguientes años se igualan al año 1).
   * - Si edita año 2+ → es un override manual: solo cambia ese año.
   */
  const cambiarCantidad = (id: string, anio: number, valor: number) => {
    const p = productos.find((x) => x.id === id);
    if (!p) return;
    const nuevas = [...p.cantidades] as [number, number, number, number, number];
    nuevas[anio] = valor;
    if (anio === 0) {
      // Propaga a 1..4 con la tasa de crecimiento actual
      for (let i = 1; i < 5; i++) {
        nuevas[i] = Math.round(nuevas[i - 1] * (1 + (tasasCant[i - 1] ?? 0) / 100));
      }
    }
    editar(id, { cantidades: nuevas });
  };

  const cambiarPrecio = (id: string, anio: number, valor: number) => {
    const p = productos.find((x) => x.id === id);
    if (!p) return;
    const nuevos = [...p.precios] as [number, number, number, number, number];
    nuevos[anio] = valor;
    if (anio === 0) {
      for (let i = 1; i < 5; i++) {
        const sinRedondear = nuevos[i - 1] * (1 + (tasasPrec[i - 1] ?? 0) / 100);
        nuevos[i] = Math.round(sinRedondear * 100) / 100;
      }
    }
    editar(id, { precios: nuevos });
  };

  const inputClase =
    "w-full rounded-md border border-input bg-background px-2 py-1.5 text-right text-xs " +
    "focus:outline-none focus:ring-2 focus:ring-ring";

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_280px]">
      <div ref={containerRef} className="space-y-3 rounded-lg border border-border bg-card p-5">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Paso 2 · Proyección de demanda
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Las tasas de arriba aplican a <strong>todos los productos por igual</strong>.
            Puedes editar valores individuales en cada celda.{" "}
            <kbd className="rounded bg-secondary px-1 text-[10px]">Enter</kbd> baja a la
            siguiente celda. Click en una celda selecciona el contenido para escribir.
          </p>
        </div>

        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b-2 border-border bg-secondary">
                <th className="p-2 text-left font-semibold w-[200px]">Concepto</th>
                <th className="p-2 text-left font-semibold w-[80px]">Unidad</th>
                {[1, 2, 3, 4, 5].map((a) => (
                  <th key={a} className="p-2 text-center font-semibold">
                    Año {a}
                  </th>
                ))}
                <th className="w-8 p-2"></th>
              </tr>
            </thead>
            <tbody>
              {/* SECCIÓN TASAS GLOBALES — encabezado colapsable */}
              <tr
                className="cursor-pointer bg-amber-100/60 hover:bg-amber-100 dark:bg-amber-950/30"
                onClick={() => setTasasAbierto((v) => !v)}
              >
                <td
                  className="border-l-4 border-l-amber-500 p-2 text-[11px] font-bold uppercase tracking-wide text-amber-900 dark:text-amber-200"
                  colSpan={8}
                >
                  <span className="inline-flex items-center gap-1">
                    {tasasAbierto ? (
                      <ChevronDown className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5" />
                    )}
                    📈 Tasas de crecimiento (aplican a todos)
                    {!tasasAbierto && (
                      <span className="ml-1 normal-case text-[10px] font-normal opacity-70">
                        — clic para editar
                      </span>
                    )}
                  </span>
                </td>
              </tr>
              {tasasAbierto && (
                <>
                  <tr className="bg-amber-50/60 dark:bg-amber-950/20">
                    <td className="border-l-4 border-l-amber-500 p-1.5 text-[11px]" colSpan={2}>
                      ↳ Cantidad (%)
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
                          onFocus={selectOnFocus}
                          data-col={`anio-${i + 2}`}
                          className={inputClase}
                        />
                      </td>
                    ))}
                    <td></td>
                  </tr>
                  <tr className="border-b-2 border-border bg-amber-50/60 dark:bg-amber-950/20">
                    <td className="border-l-4 border-l-amber-500 p-1.5 text-[11px]" colSpan={2}>
                      ↳ Precio (%)
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
                          onFocus={selectOnFocus}
                          data-col={`anio-${i + 2}`}
                          className={inputClase}
                        />
                      </td>
                    ))}
                    <td></td>
                  </tr>
                </>
              )}

              {productos.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-muted-foreground">
                    Aún no agregaste productos.
                  </td>
                </tr>
              )}

              {productos.map((p, pi) => {
                const color = COLORES_PRODUCTO[pi % COLORES_PRODUCTO.length];
                return (
                  <ProductoFilas
                    key={p.id}
                    prod={p}
                    color={color}
                    productoIndex={pi}
                    abierto={!!expandidos[p.id]}
                    onToggle={() => toggleProducto(p.id)}
                    onChangeNombre={(v) => editar(p.id, { nombre: v })}
                    onChangeUnidad={(v) => editar(p.id, { unidadMedida: v })}
                    onChangeCantidad={(anio, v) => cambiarCantidad(p.id, anio, v)}
                    onChangePrecio={(anio, v) => cambiarPrecio(p.id, anio, v)}
                    onEliminar={() => eliminar(p.id)}
                    onKeyEnter={onKeyEnter}
                    inputClase={inputClase}
                  />
                );
              })}

              {productos.length > 0 && (
                <>
                  <tr className="border-t-4 border-border bg-secondary/60">
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
                  <tr className="bg-primary/15">
                    <td className="p-2 text-sm font-bold" colSpan={2}>
                      TOTAL INGRESOS (Bs)
                    </td>
                    {ingresosPorAnio.map((ing, i) => (
                      <td key={i} className="p-2 text-right text-sm font-bold">
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
          onClick={() => {
            agregar({
              nombre: "Nuevo producto",
              unidadMedida: "und",
              cantidades: [0, 0, 0, 0, 0],
              precios: [0, 0, 0, 0, 0],
            } as any);
            // Abrir automáticamente el producto recién creado para editarlo.
            const lista = useProyectoStore.getState().proyecto?.productos ?? [];
            const nuevo = lista[lista.length - 1];
            if (nuevo) setExpandidos((e) => ({ ...e, [nuevo.id]: true }));
          }}
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
            recalculan en cascada para cada producto.
            <br />
            <br />
            Si quieres que un producto crezca distinto, edita directamente la celda
            del año específico (la tasa global no lo sobrescribirá hasta que la
            cambies de nuevo).
            <br />
            <br />
            <strong>Atajo:</strong> click en una celda{" "}
            <em>selecciona todo el contenido</em>, así escribes y reemplazas
            directamente.{" "}
            <kbd className="rounded bg-secondary/50 px-1 text-[10px]">Enter</kbd>{" "}
            baja a la siguiente celda.
          </>
        }
      />
    </div>
  );
}

function ProductoFilas({
  prod,
  color,
  productoIndex,
  abierto,
  onToggle,
  onChangeNombre,
  onChangeUnidad,
  onChangeCantidad,
  onChangePrecio,
  onEliminar,
  onKeyEnter,
  inputClase,
}: {
  prod: ReturnType<typeof migrarProducto>;
  color: { borde: string; chip: string };
  productoIndex: number;
  abierto: boolean;
  onToggle: () => void;
  onChangeNombre: (v: string) => void;
  onChangeUnidad: (v: string) => void;
  onChangeCantidad: (anio: number, v: number) => void;
  onChangePrecio: (anio: number, v: number) => void;
  onEliminar: () => void;
  onKeyEnter: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  inputClase: string;
}) {
  return (
    <>
      {/* HEADER del producto — clic para expandir/contraer */}
      <tr className={cn("border-t-4 border-border", color.chip.split(" ")[0])}>
        <td className={cn("border-l-4 p-2", color.borde)} colSpan={abierto ? 1 : 2}>
          <div className="flex min-w-0 items-center gap-1.5">
            <button
              onClick={onToggle}
              className="flex-shrink-0 rounded p-0.5 hover:bg-black/5 dark:hover:bg-white/10"
              title={abierto ? "Contraer" : "Expandir para editar"}
            >
              {abierto ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
            <span
              className={cn(
                "flex-shrink-0 whitespace-nowrap rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                color.chip
              )}
            >
              Producto {productoIndex + 1}
            </span>
            {!abierto && (
              <span className="min-w-0 truncate text-xs font-bold">{prod.nombre}</span>
            )}
          </div>
          {abierto && (
            <input
              type="text"
              value={prod.nombre}
              onChange={(e) => onChangeNombre(e.target.value)}
              onFocus={(e) => e.currentTarget.select()}
              placeholder="Nombre del producto"
              className="mt-1.5 w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-ring"
            />
          )}
        </td>
        {abierto && (
          <td className="p-2">
            <input
              type="text"
              value={prod.unidadMedida}
              onChange={(e) => onChangeUnidad(e.target.value)}
              onFocus={(e) => e.currentTarget.select()}
              placeholder="taza, kg…"
              className="mt-[26px] w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </td>
        )}
        {/* Colapsado: muestra el ingreso por año junto al nombre. Expandido: vacío. */}
        {abierto ? (
          <td colSpan={5}></td>
        ) : (
          prod.cantidades.map((c, i) => (
            <td key={i} className="p-1.5 text-right text-xs font-semibold">
              {formatearBolivianos(c * prod.precios[i])}
            </td>
          ))
        )}
        <td className="p-2 align-top">
          <button
            onClick={onEliminar}
            className="rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            title="Eliminar producto"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </td>
      </tr>

      {abierto && (
        <>
          {/* Cantidad */}
          <tr>
            <td className={cn("border-l-4 p-1.5 text-[11px]", color.borde)} colSpan={2}>
              <span className="pl-3 font-medium">↳ Cantidad</span>
            </td>
            {prod.cantidades.map((c, i) => (
              <td key={i} className="p-1.5">
                <input
                  type="number"
                  value={c}
                  onChange={(e) => onChangeCantidad(i, Number(e.target.value) || 0)}
                  onKeyDown={onKeyEnter}
                  onFocus={(e) => e.currentTarget.select()}
                  data-col={`anio-${i + 1}`}
                  className={inputClase}
                />
              </td>
            ))}
            <td></td>
          </tr>
          {/* Precio */}
          <tr>
            <td className={cn("border-l-4 p-1.5 text-[11px]", color.borde)} colSpan={2}>
              <span className="pl-3 font-medium">↳ Precio (Bs)</span>
            </td>
            {prod.precios.map((pr, i) => (
              <td key={i} className="p-1.5">
                <input
                  type="number"
                  step="0.01"
                  value={pr}
                  onChange={(e) => onChangePrecio(i, Number(e.target.value) || 0)}
                  onKeyDown={onKeyEnter}
                  onFocus={(e) => e.currentTarget.select()}
                  data-col={`anio-${i + 1}`}
                  className={inputClase}
                />
              </td>
            ))}
            <td></td>
          </tr>
          {/* Ingreso */}
          <tr className="bg-secondary/20">
            <td className={cn("border-l-4 p-1.5 text-[11px]", color.borde)} colSpan={2}>
              <span className="pl-3 font-semibold">↳ Ingreso (Bs)</span>
            </td>
            {prod.cantidades.map((c, i) => (
              <td key={i} className="p-1.5 text-right text-xs font-semibold">
                {formatearBolivianos(c * prod.precios[i])}
              </td>
            ))}
            <td></td>
          </tr>
        </>
      )}
    </>
  );
}
