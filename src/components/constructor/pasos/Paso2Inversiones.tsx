import { useRef, useState } from "react";
import { AlertTriangle, Plus, Trash2 } from "lucide-react";
import { useProyectoStore } from "@/stores/proyecto-store";
import FichaPedagogica from "../FichaPedagogica";
import { formatearBolivianos, cn } from "@/lib/utils";
import type { CategoriaInversion } from "@/types/proyecto";

interface ConfigCategoria {
  valor: CategoriaInversion;
  label: string;
  sinDepreciacion?: boolean;
  vidaDefault: number;
  // Clases para el color de la categoría
  borde: string; // border-l-{color}
  chip: string; // bg+text para el chip
  bgFila: string; // fondo claro para todas las filas
  bgHeader: string; // fondo del header de categoría
}

const categorias: ConfigCategoria[] = [
  {
    valor: "terreno",
    label: "Terreno",
    sinDepreciacion: true,
    vidaDefault: 0,
    borde: "border-l-amber-500",
    chip: "bg-amber-200 text-amber-900 dark:bg-amber-900/60 dark:text-amber-100",
    bgFila: "bg-amber-50 dark:bg-amber-950/20",
    bgHeader: "bg-amber-100/70 dark:bg-amber-950/40",
  },
  {
    valor: "obrasCiviles",
    label: "Obras civiles",
    vidaDefault: 20,
    borde: "border-l-blue-500",
    chip: "bg-blue-200 text-blue-900 dark:bg-blue-900/60 dark:text-blue-100",
    bgFila: "bg-blue-50 dark:bg-blue-950/20",
    bgHeader: "bg-blue-100/70 dark:bg-blue-950/40",
  },
  {
    valor: "maquinaria",
    label: "Maquinaria y equipos",
    vidaDefault: 10,
    borde: "border-l-emerald-500",
    chip: "bg-emerald-200 text-emerald-900 dark:bg-emerald-900/60 dark:text-emerald-100",
    bgFila: "bg-emerald-50 dark:bg-emerald-950/20",
    bgHeader: "bg-emerald-100/70 dark:bg-emerald-950/40",
  },
  {
    valor: "mobiliario",
    label: "Mobiliario",
    vidaDefault: 7,
    borde: "border-l-purple-500",
    chip: "bg-purple-200 text-purple-900 dark:bg-purple-900/60 dark:text-purple-100",
    bgFila: "bg-purple-50 dark:bg-purple-950/20",
    bgHeader: "bg-purple-100/70 dark:bg-purple-950/40",
  },
  {
    valor: "activoDiferido",
    label: "Activo diferido (intangibles)",
    vidaDefault: 5,
    borde: "border-l-pink-500",
    chip: "bg-pink-200 text-pink-900 dark:bg-pink-900/60 dark:text-pink-100",
    bgFila: "bg-pink-50 dark:bg-pink-950/20",
    bgHeader: "bg-pink-100/70 dark:bg-pink-950/40",
  },
];

const selectOnFocus = (e: React.FocusEvent<HTMLInputElement>) =>
  e.currentTarget.select();

// Horizonte del proyecto para calcular el valor residual al final
const ANIOS_PROYECTO = 5;

// Anchos consistentes de columnas para que se alineen entre categorías
const COLS_ANCHO = {
  descripcion: "w-[22%]",
  unidad: "w-[8%]",
  cantidad: "w-[8%]",
  costo: "w-[11%]",
  total: "w-[12%]",
  vidaUtil: "w-[7%]",
  depAnio: "w-[10%]",
  valorResidual: "w-[12%]",
  acciones: "w-[5%]",
};

function calcularValorResidualHorizonte(costoTotal: number, vidaUtil: number | null): number {
  if (!vidaUtil || vidaUtil <= 0) return costoTotal; // terreno o sin depreciación
  const depAnual = costoTotal / vidaUtil;
  const depAcum = depAnual * Math.min(ANIOS_PROYECTO, vidaUtil);
  return Math.max(0, costoTotal - depAcum);
}

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
              Bienes que tu proyecto necesita comprar al inicio. Cada categoría calcula
              su depreciación automáticamente.
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
            el <strong>terreno</strong>, todos se deprecian (pierden valor por uso). La{" "}
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
  const { borde, chip, bgFila, bgHeader, label, sinDepreciacion } = config;

  return (
    <div className={cn("overflow-hidden rounded-md border-l-4", borde, bgFila)}>
      {/* Header de categoría */}
      <button
        onClick={() => setAbierto((v) => !v)}
        className={cn(
          "flex w-full items-center justify-between px-3 py-2 text-left",
          bgHeader
        )}
      >
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
              chip
            )}
          >
            {label}
          </span>
          <span className="text-xs font-medium text-foreground/70">
            ({items.length} {items.length === 1 ? "item" : "items"})
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold">{formatearBolivianos(subtotal)}</span>
          <span className="text-xs">{abierto ? "▾" : "▸"}</span>
        </div>
      </button>

      {abierto && (
        <div className="space-y-2 p-3">
          {items.length === 0 && (
            <div className="rounded border border-dashed border-border bg-card p-3 text-center text-xs text-muted-foreground">
              Aún no hay items en {label.toLowerCase()}.
            </div>
          )}

          {/* Alerta de items que se deprecian antes del horizonte del proyecto */}
          {(() => {
            const itemsCortos = items.filter(
              (it) =>
                it.vidaUtilAnios !== null &&
                it.vidaUtilAnios > 0 &&
                it.vidaUtilAnios < ANIOS_PROYECTO
            );
            if (itemsCortos.length === 0) return null;
            return (
              <div className="rounded-md border-2 border-amber-400 bg-amber-50 p-3 text-xs text-amber-950 dark:border-amber-600 dark:bg-amber-950/40 dark:text-amber-100">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
                  <div className="space-y-2 leading-relaxed">
                    <div className="text-sm font-semibold">
                      {itemsCortos.length === 1
                        ? "Tienes 1 activo que no dura los 5 años del proyecto"
                        : `Tienes ${itemsCortos.length} activos que no duran los 5 años del proyecto`}
                    </div>

                    <div className="rounded bg-amber-100/70 p-2.5 dark:bg-amber-900/30">
                      <div className="mb-1.5 font-semibold">
                        Si planeas comprar repuestos cuando se acaben:
                      </div>
                      <ul className="ml-3 space-y-1.5">
                        {itemsCortos.map((it) => {
                          const vida = it.vidaUtilAnios ?? 1;
                          const cantSugerida = Math.ceil(ANIOS_PROYECTO / vida);
                          const cantActual = it.cantidad;
                          const yaEsSuficiente = cantActual >= cantSugerida;
                          return (
                            <li key={it.id} className="flex flex-wrap items-center gap-2">
                              <span>
                                <strong>{it.descripcion || "(sin nombre)"}</strong> dura{" "}
                                {vida} años → necesitas <strong>{cantSugerida}{" "}
                                unidades</strong> para cubrir los 5 años (1 original +{" "}
                                {cantSugerida - 1} {cantSugerida - 1 === 1 ? "repuesto" : "repuestos"})
                              </span>
                              {!yaEsSuficiente && (
                                <button
                                  onClick={() =>
                                    onEditar(it.id, { cantidad: cantSugerida })
                                  }
                                  className="rounded-md border border-amber-500 bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-900 transition hover:bg-amber-200 dark:bg-amber-800/40 dark:text-amber-100 dark:hover:bg-amber-700/50"
                                >
                                  ✓ Cambiar cantidad a {cantSugerida}
                                </button>
                              )}
                              {yaEsSuficiente && (
                                <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">
                                  Ya tienes suficiente (cantidad = {cantActual})
                                </span>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </div>

                    <div className="text-[11px]">
                      <strong>Otras opciones</strong> si no vas a comprar repuestos:
                      <ul className="ml-3 mt-1 list-disc space-y-0.5">
                        <li>
                          <strong>Aumentar la vida útil</strong> a {ANIOS_PROYECTO} años
                          si crees que en la práctica te durará todo el proyecto
                          (mantenimiento, uso liviano).
                        </li>
                        <li>
                          <strong>Operar sin él al final:</strong> ajusta tu proyección
                          de demanda (Paso 2) a la baja en los años que ya no funcione.
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {items.length > 0 && (
            <div className="overflow-x-auto rounded-md border border-border bg-card">
              <table className="w-full text-xs">
                <thead className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  <tr className="border-b border-border">
                    <th className={cn("p-1.5 text-left", COLS_ANCHO.descripcion)}>
                      Descripción
                    </th>
                    <th className={cn("p-1.5 text-left", COLS_ANCHO.unidad)}>Unidad</th>
                    <th className={cn("p-1.5 text-right", COLS_ANCHO.cantidad)}>
                      Cantidad
                    </th>
                    <th className={cn("p-1.5 text-right", COLS_ANCHO.costo)}>
                      Costo unit. (Bs)
                    </th>
                    <th className={cn("p-1.5 text-right", COLS_ANCHO.total)}>
                      Total (Bs)
                    </th>
                    <th className={cn("p-1.5 text-right", COLS_ANCHO.vidaUtil)}>
                      Vida útil
                    </th>
                    <th className={cn("p-1.5 text-right", COLS_ANCHO.depAnio)}>
                      Dep./año
                    </th>
                    <th className={cn("p-1.5 text-right", COLS_ANCHO.valorResidual)}>
                      Valor residual
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
                          className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
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
                          onKeyDown={onKeyEnter}
                          data-col={`${config.valor}-costo`}
                          className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-right text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </td>
                      <td className="p-1 text-right text-xs font-semibold">
                        {formatearBolivianos(it.costoTotal)}
                      </td>
                      <td className="p-1">
                        {sinDepreciacion ? (
                          <div className="text-center text-xs text-muted-foreground">—</div>
                        ) : (
                          <div className="relative">
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
                              className={cn(
                                "w-full rounded-md border bg-background px-2 py-1.5 pr-6 text-right text-xs focus:outline-none focus:ring-2 focus:ring-ring",
                                it.vidaUtilAnios !== null &&
                                  it.vidaUtilAnios > 0 &&
                                  it.vidaUtilAnios < ANIOS_PROYECTO
                                  ? "border-amber-400 bg-amber-50/50 dark:bg-amber-950/30"
                                  : "border-input"
                              )}
                            />
                            {it.vidaUtilAnios !== null &&
                              it.vidaUtilAnios > 0 &&
                              it.vidaUtilAnios < ANIOS_PROYECTO && (
                                <AlertTriangle
                                  className="pointer-events-none absolute right-1.5 top-1/2 h-3 w-3 -translate-y-1/2 text-amber-600 dark:text-amber-400"
                                  aria-label={`Vida útil menor a ${ANIOS_PROYECTO} años — se depreciará completo antes del fin del proyecto`}
                                />
                              )}
                          </div>
                        )}
                      </td>
                      <td className="p-1 text-right text-xs text-muted-foreground">
                        {sinDepreciacion ? "—" : formatearBolivianos(it.depreciacionAnual)}
                      </td>
                      <td className="p-1 text-right text-xs">
                        {(() => {
                          const vr = calcularValorResidualHorizonte(
                            it.costoTotal,
                            it.vidaUtilAnios
                          );
                          const totalmenteDepreciado =
                            it.vidaUtilAnios !== null &&
                            it.vidaUtilAnios > 0 &&
                            it.vidaUtilAnios <= ANIOS_PROYECTO &&
                            vr === 0;
                          return (
                            <span
                              className={cn(
                                "font-medium",
                                totalmenteDepreciado
                                  ? "text-amber-700 dark:text-amber-400"
                                  : "text-foreground/80"
                              )}
                              title={
                                totalmenteDepreciado
                                  ? "Totalmente depreciado al fin del proyecto"
                                  : undefined
                              }
                            >
                              {formatearBolivianos(vr)}
                              {totalmenteDepreciado && (
                                <span className="ml-1 text-[10px]">⚠</span>
                              )}
                            </span>
                          );
                        })()}
                      </td>
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
            className="flex items-center gap-1.5 rounded-md border border-dashed border-border bg-card px-2.5 py-1.5 text-xs text-muted-foreground transition hover:border-foreground hover:text-foreground"
          >
            <Plus className="h-3.5 w-3.5" />
            Agregar a {label.toLowerCase()}
          </button>
        </div>
      )}
    </div>
  );
}
