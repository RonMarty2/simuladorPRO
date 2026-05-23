import { useRef, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useProyectoStore } from "@/stores/proyecto-store";
import FichaPedagogica from "../FichaPedagogica";
import { formatearBolivianos, cn } from "@/lib/utils";
import type { CategoriaInversion } from "@/types/proyecto";

interface ConfigCategoria {
  valor: CategoriaInversion;
  label: string;
  sinDepreciacion?: boolean;
  vidaDefault: number;
  color: { borde: string; chip: string };
}

const categorias: ConfigCategoria[] = [
  {
    valor: "terreno",
    label: "Terreno",
    sinDepreciacion: true,
    vidaDefault: 0,
    color: {
      borde: "border-l-amber-500",
      chip: "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200",
    },
  },
  {
    valor: "obrasCiviles",
    label: "Obras civiles",
    vidaDefault: 20,
    color: {
      borde: "border-l-blue-500",
      chip: "bg-blue-100 text-blue-900 dark:bg-blue-900/40 dark:text-blue-200",
    },
  },
  {
    valor: "maquinaria",
    label: "Maquinaria y equipos",
    vidaDefault: 10,
    color: {
      borde: "border-l-emerald-500",
      chip: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200",
    },
  },
  {
    valor: "mobiliario",
    label: "Mobiliario",
    vidaDefault: 7,
    color: {
      borde: "border-l-purple-500",
      chip: "bg-purple-100 text-purple-900 dark:bg-purple-900/40 dark:text-purple-200",
    },
  },
  {
    valor: "activoDiferido",
    label: "Activo diferido (intangibles)",
    vidaDefault: 5,
    color: {
      borde: "border-l-pink-500",
      chip: "bg-pink-100 text-pink-900 dark:bg-pink-900/40 dark:text-pink-200",
    },
  },
];

const selectOnFocus = (e: React.FocusEvent<HTMLInputElement>) =>
  e.currentTarget.select();

export default function Paso2Inversiones() {
  const proyecto = useProyectoStore((s) => s.proyecto)!;
  const agregar = useProyectoStore((s) => s.agregarInversion);
  const editar = useProyectoStore((s) => s.editarInversion);
  const eliminar = useProyectoStore((s) => s.eliminarInversion);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const totalGeneral = categorias.reduce(
    (acc, c) =>
      acc +
      proyecto.inversiones[c.valor].reduce((sum, item) => sum + item.costoTotal, 0),
    0
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

  return (
    <div ref={containerRef} className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_280px]">
      <div className="space-y-3 rounded-lg border border-border bg-card p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              Paso 3 · Inversiones en activo fijo
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Bienes que tu proyecto necesita comprar al inicio. Cada categoría
              calcula su depreciación automáticamente.
            </p>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Total inversiones
            </div>
            <div className="text-lg font-bold">{formatearBolivianos(totalGeneral)}</div>
          </div>
        </div>

        {categorias.map((c) => (
          <SeccionCategoria
            key={c.valor}
            config={c}
            items={proyecto.inversiones[c.valor]}
            onAgregar={(item) => agregar(c.valor, item)}
            onEditar={(id, cambios) => editar(c.valor, id, cambios)}
            onEliminar={(id) => eliminar(c.valor, id)}
            onKeyEnter={onKeyEnter}
          />
        ))}
      </div>

      <FichaPedagogica
        titulo="Inversiones y depreciación"
        contenido={
          <>
            El <strong>activo fijo</strong> son bienes durables del proyecto. Excepto
            el terreno, todos se deprecian (pierden valor por uso). La{" "}
            <strong>depreciación lineal</strong> = costo / vida útil. El{" "}
            <strong>valor residual</strong> al final del proyecto es lo que queda
            tras restar la depreciación acumulada.
            <br />
            <br />
            <strong>Atajos:</strong> click en una celda selecciona el contenido.{" "}
            <kbd className="rounded bg-secondary/50 px-1 text-[10px]">Enter</kbd> baja
            a la siguiente celda de la misma columna.
          </>
        }
      />
    </div>
  );
}

function SeccionCategoria({
  config,
  items,
  onAgregar,
  onEditar,
  onEliminar,
  onKeyEnter,
}: {
  config: ConfigCategoria;
  items: ReturnType<typeof useProyectoStore.getState>["proyecto"] extends infer P
    ? P extends { inversiones: { [K in CategoriaInversion]: infer I } }
      ? I
      : never
    : never;
  onAgregar: (item: {
    descripcion: string;
    unidadMedida: string;
    cantidad: number;
    costoUnitario: number;
    vidaUtilAnios: number | null;
  }) => void;
  onEditar: (id: string, cambios: any) => void;
  onEliminar: (id: string) => void;
  onKeyEnter: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}) {
  const [abierto, setAbierto] = useState(true);
  const subtotal = items.reduce((acc, it) => acc + it.costoTotal, 0);
  const { color, label, sinDepreciacion } = config;

  return (
    <div
      className={cn(
        "rounded-md border-l-4 border-border bg-secondary/20",
        color.borde
      )}
    >
      {/* Header */}
      <button
        onClick={() => setAbierto((v) => !v)}
        className="flex w-full items-center justify-between px-3 py-2 text-left"
      >
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
              color.chip
            )}
          >
            {label}
          </span>
          <span className="text-xs text-muted-foreground">
            ({items.length} {items.length === 1 ? "item" : "items"})
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold">{formatearBolivianos(subtotal)}</span>
          <span className="text-xs text-muted-foreground">{abierto ? "▾" : "▸"}</span>
        </div>
      </button>

      {abierto && (
        <div className="space-y-2 border-t border-border bg-card p-3">
          {items.length === 0 && (
            <div className="rounded border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
              Aún no hay items en {label.toLowerCase()}.
            </div>
          )}

          {items.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  <tr className="border-b border-border">
                    <th className="p-1.5 text-left">Descripción</th>
                    <th className="p-1.5 text-left">Unidad</th>
                    <th className="p-1.5 text-right">Cantidad</th>
                    <th className="p-1.5 text-right">Costo unit. (Bs)</th>
                    <th className="p-1.5 text-right">Total (Bs)</th>
                    {!sinDepreciacion && <th className="p-1.5 text-right">Vida útil</th>}
                    {!sinDepreciacion && <th className="p-1.5 text-right">Dep./año</th>}
                    <th className="w-8 p-1.5"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it) => (
                    <tr key={it.id} className="border-b border-border/50 last:border-0">
                      <td className="p-1">
                        <input
                          type="text"
                          value={it.descripcion}
                          onChange={(e) => onEditar(it.id, { descripcion: e.target.value })}
                          onFocus={selectOnFocus}
                          placeholder="Ej: Galpón, Espresso…"
                          className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </td>
                      <td className="p-1">
                        <input
                          type="text"
                          value={it.unidadMedida}
                          onChange={(e) => onEditar(it.id, { unidadMedida: e.target.value })}
                          onFocus={selectOnFocus}
                          placeholder="m², und"
                          className="w-20 rounded-md border border-input bg-background px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </td>
                      <td className="p-1">
                        <input
                          type="number"
                          value={it.cantidad}
                          onChange={(e) =>
                            onEditar(it.id, { cantidad: Number(e.target.value) || 0 })
                          }
                          onFocus={selectOnFocus}
                          onKeyDown={onKeyEnter}
                          data-col={`${config.valor}-cant`}
                          className="w-20 rounded-md border border-input bg-background px-2 py-1.5 text-right text-xs focus:outline-none focus:ring-2 focus:ring-ring"
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
                          onKeyDown={onKeyEnter}
                          data-col={`${config.valor}-costo`}
                          className="w-24 rounded-md border border-input bg-background px-2 py-1.5 text-right text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </td>
                      <td className="p-1 text-right text-xs font-semibold">
                        {formatearBolivianos(it.costoTotal)}
                      </td>
                      {!sinDepreciacion && (
                        <td className="p-1">
                          <input
                            type="number"
                            value={it.vidaUtilAnios ?? 0}
                            onChange={(e) =>
                              onEditar(it.id, {
                                vidaUtilAnios: Number(e.target.value) || 0,
                              })
                            }
                            onFocus={selectOnFocus}
                            onKeyDown={onKeyEnter}
                            data-col={`${config.valor}-vida`}
                            className="w-16 rounded-md border border-input bg-background px-2 py-1.5 text-right text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                        </td>
                      )}
                      {!sinDepreciacion && (
                        <td className="p-1 text-right text-xs text-muted-foreground">
                          {formatearBolivianos(it.depreciacionAnual)}
                        </td>
                      )}
                      <td className="p-1 text-right">
                        <button
                          onClick={() => onEliminar(it.id)}
                          className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          title="Eliminar"
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
            onClick={() =>
              onAgregar({
                descripcion: "",
                unidadMedida: "und",
                cantidad: 1,
                costoUnitario: 0,
                vidaUtilAnios: sinDepreciacion ? null : config.vidaDefault,
              })
            }
            className="flex items-center gap-1.5 rounded-md border border-dashed border-border px-2.5 py-1.5 text-xs text-muted-foreground transition hover:border-foreground hover:text-foreground"
          >
            <Plus className="h-3.5 w-3.5" />
            Agregar a {label.toLowerCase()}
          </button>
        </div>
      )}
    </div>
  );
}
