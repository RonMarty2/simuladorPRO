import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useProyectoStore } from "@/stores/proyecto-store";
import FichaPedagogica from "../FichaPedagogica";
import { formatearBolivianos } from "@/lib/utils";
import type { CategoriaInversion } from "@/types/proyecto";

const categorias: { valor: CategoriaInversion; label: string; sinDepreciacion?: boolean }[] = [
  { valor: "terreno", label: "Terreno", sinDepreciacion: true },
  { valor: "obrasCiviles", label: "Obras civiles" },
  { valor: "maquinaria", label: "Maquinaria y equipos" },
  { valor: "mobiliario", label: "Mobiliario" },
  { valor: "activoDiferido", label: "Activo diferido (intangibles)" },
];

export default function Paso2Inversiones() {
  const proyecto = useProyectoStore((s) => s.proyecto)!;
  const agregar = useProyectoStore((s) => s.agregarInversion);
  const editar = useProyectoStore((s) => s.editarInversion);
  const eliminar = useProyectoStore((s) => s.eliminarInversion);

  const totalGeneral = categorias.reduce(
    (acc, c) =>
      acc +
      proyecto.inversiones[c.valor].reduce((sum, item) => sum + item.costoTotal, 0),
    0
  );

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">
                Paso 2 · Inversiones en activo fijo
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Bienes que tu proyecto necesita comprar al inicio.
              </p>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Total inversiones</div>
              <div className="text-lg font-semibold">
                {formatearBolivianos(totalGeneral)}
              </div>
            </div>
          </div>

          {categorias.map((c) => (
            <SeccionCategoria
              key={c.valor}
              categoria={c.valor}
              label={c.label}
              sinDepreciacion={c.sinDepreciacion}
              items={proyecto.inversiones[c.valor]}
              onAgregar={(item) => agregar(c.valor, item)}
              onEditar={(id, cambios) => editar(c.valor, id, cambios)}
              onEliminar={(id) => eliminar(c.valor, id)}
            />
          ))}
        </div>
      </div>

      <FichaPedagogica
        titulo="Inversiones y depreciación"
        contenido={
          <>
            El <strong>activo fijo</strong> son bienes durables del proyecto. Excepto el
            terreno, todos se deprecian (pierden valor por uso). La{" "}
            <strong>depreciación lineal</strong> = costo / vida útil. El{" "}
            <strong>valor residual</strong> al final del proyecto es lo que queda
            tras restar la depreciación acumulada.
          </>
        }
      />
    </div>
  );
}

function SeccionCategoria({
  label,
  sinDepreciacion,
  items,
  onAgregar,
  onEditar,
  onEliminar,
}: {
  categoria: CategoriaInversion;
  label: string;
  sinDepreciacion?: boolean;
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
}) {
  const [abierto, setAbierto] = useState(true);
  const subtotal = items.reduce((acc, it) => acc + it.costoTotal, 0);

  return (
    <div className="border-b border-border py-3 last:border-b-0">
      <button
        onClick={() => setAbierto((v) => !v)}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="text-sm font-medium">
          {abierto ? "▾" : "▸"} {label}{" "}
          <span className="text-xs text-muted-foreground">({items.length})</span>
        </span>
        <span className="text-sm font-medium">{formatearBolivianos(subtotal)}</span>
      </button>

      {abierto && (
        <div className="mt-3 space-y-2">
          {items.length === 0 && (
            <div className="rounded border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
              Aún no hay items en {label.toLowerCase()}.
            </div>
          )}
          {items.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="text-muted-foreground">
                  <tr className="border-b border-border">
                    <th className="p-1.5 text-left">Descripción</th>
                    <th className="p-1.5 text-left">Unidad</th>
                    <th className="p-1.5 text-right">Cant.</th>
                    <th className="p-1.5 text-right">Costo unit.</th>
                    <th className="p-1.5 text-right">Total</th>
                    {!sinDepreciacion && <th className="p-1.5 text-right">Vida útil</th>}
                    {!sinDepreciacion && <th className="p-1.5 text-right">Dep./año</th>}
                    <th className="w-8 p-1.5"></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it) => (
                    <tr key={it.id} className="border-b border-border/50">
                      <td className="p-1">
                        <input
                          type="text"
                          value={it.descripcion}
                          onChange={(e) =>
                            onEditar(it.id, { descripcion: e.target.value })
                          }
                          className="w-full rounded border-0 bg-transparent px-1 py-0.5 hover:bg-accent focus:bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                      </td>
                      <td className="p-1">
                        <input
                          type="text"
                          value={it.unidadMedida}
                          onChange={(e) =>
                            onEditar(it.id, { unidadMedida: e.target.value })
                          }
                          className="w-20 rounded border-0 bg-transparent px-1 py-0.5 hover:bg-accent focus:bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                      </td>
                      <td className="p-1 text-right">
                        <input
                          type="number"
                          value={it.cantidad}
                          onChange={(e) =>
                            onEditar(it.id, { cantidad: Number(e.target.value) || 0 })
                          }
                          className="w-16 rounded border-0 bg-transparent px-1 py-0.5 text-right hover:bg-accent focus:bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                      </td>
                      <td className="p-1 text-right">
                        <input
                          type="number"
                          value={it.costoUnitario}
                          onChange={(e) =>
                            onEditar(it.id, { costoUnitario: Number(e.target.value) || 0 })
                          }
                          className="w-24 rounded border-0 bg-transparent px-1 py-0.5 text-right hover:bg-accent focus:bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                      </td>
                      <td className="p-1 text-right font-medium">
                        {formatearBolivianos(it.costoTotal)}
                      </td>
                      {!sinDepreciacion && (
                        <td className="p-1 text-right">
                          <input
                            type="number"
                            value={it.vidaUtilAnios ?? 0}
                            onChange={(e) =>
                              onEditar(it.id, {
                                vidaUtilAnios: Number(e.target.value) || 0,
                              })
                            }
                            className="w-12 rounded border-0 bg-transparent px-1 py-0.5 text-right hover:bg-accent focus:bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                          />
                        </td>
                      )}
                      {!sinDepreciacion && (
                        <td className="p-1 text-right text-muted-foreground">
                          {formatearBolivianos(it.depreciacionAnual)}
                        </td>
                      )}
                      <td className="p-1 text-right">
                        <button
                          onClick={() => onEliminar(it.id)}
                          className="text-muted-foreground hover:text-destructive"
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
                descripcion: "Nuevo item",
                unidadMedida: "unidad",
                cantidad: 1,
                costoUnitario: 0,
                vidaUtilAnios: sinDepreciacion ? null : 10,
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
