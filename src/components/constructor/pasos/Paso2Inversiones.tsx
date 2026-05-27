import { useRef, useState } from "react";
import { AlertTriangle, Plus, Trash2 } from "lucide-react";
import { useProyectoStore } from "@/stores/proyecto-store";
import FichaPedagogica from "../FichaPedagogica";
import InputNumero from "../InputNumero";
import Recomendacion from "../Recomendacion";
import { formatearBolivianos, cn } from "@/lib/utils";
import type { CategoriaInversion } from "@/types/proyecto";

interface ConfigCategoria {
  valor: CategoriaInversion;
  label: string;
  ejemplo: string;
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
    ejemplo: "Ej: Terreno 200 m², lote",
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
    ejemplo: "Ej: Galpón, adecuación, instalación eléctrica",
    vidaDefault: 20,
    borde: "border-l-blue-500",
    chip: "bg-blue-200 text-blue-900 dark:bg-blue-900/60 dark:text-blue-100",
    bgFila: "bg-blue-50 dark:bg-blue-950/20",
    bgHeader: "bg-blue-100/70 dark:bg-blue-950/40",
  },
  {
    valor: "maquinaria",
    label: "Maquinaria y equipos",
    ejemplo: "Ej: Cafetera espresso, horno, refrigerador",
    vidaDefault: 10,
    borde: "border-l-emerald-500",
    chip: "bg-emerald-200 text-emerald-900 dark:bg-emerald-900/60 dark:text-emerald-100",
    bgFila: "bg-emerald-50 dark:bg-emerald-950/20",
    bgHeader: "bg-emerald-100/70 dark:bg-emerald-950/40",
  },
  {
    valor: "mobiliario",
    label: "Mobiliario",
    ejemplo: "Ej: Mesas, sillas, estantería, vitrina",
    vidaDefault: 7,
    borde: "border-l-purple-500",
    chip: "bg-purple-200 text-purple-900 dark:bg-purple-900/60 dark:text-purple-100",
    bgFila: "bg-purple-50 dark:bg-purple-950/20",
    bgHeader: "bg-purple-100/70 dark:bg-purple-950/40",
  },
  {
    valor: "activoDiferido",
    label: "Activo diferido (intangibles)",
    ejemplo: "Ej: Licencias, registro de marca, software, web",
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
  descripcion: "w-[20%]",
  unidad: "w-[8%]",
  cantidad: "w-[8%]",
  costo: "w-[11%]",
  total: "w-[12%]",
  vidaUtil: "w-[11%]",
  depAnio: "w-[9%]",
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

        <Recomendacion titulo="💡 ¿Qué inversiones poner y cómo estimarlas? — buenas prácticas">
          <p>
            Incluye <strong>todo lo que compras UNA vez al inicio</strong> para poder operar
            (no lo que se gasta mes a mes — eso son costos, van en otros pasos).
          </p>
          <ul className="ml-4 list-disc space-y-1">
            <li><strong>Terreno:</strong> no se deprecia (mantiene su valor). Usa precios de mercado/zona o avalúos.</li>
            <li><strong>Obras civiles:</strong> construcción y adecuación del local. Pide cotización a un albañil/constructor.</li>
            <li><strong>Maquinaria y equipos:</strong> lo que produce/atiende. Cotiza con proveedores reales (no precios "redondos").</li>
            <li><strong>Mobiliario:</strong> mesas, estantería, vitrinas, computadoras.</li>
            <li><strong>Activo diferido (intangibles):</strong> licencias, registro de marca, software, página web, gastos de constitución.</li>
          </ul>
          <p>
            <strong>Cotiza de verdad:</strong> pide proformas a proveedores; en Bolivia,
            mercados y ferias industriales, importadoras, o catálogos en línea. Guarda la
            proforma como respaldo.
          </p>
          <p>
            <strong>Vida útil:</strong> ponla según cuánto dura <em>realmente</em> el bien
            (referencias contables: edificios ~20-40 años, maquinaria ~5-10, equipos de
            cómputo ~4, mobiliario ~5-10). No la infles para tapar un aviso.
          </p>
          <p className="border-t border-sky-200 pt-1.5 dark:border-sky-900">
            <strong>Activos que duran menos que el proyecto (5 años):</strong> no te
            preocupes — el modelo los <strong>repone automáticamente</strong> en el año que se
            acaban (lo verás como "Reinversión" en el flujo de caja) y ajusta solo su
            depreciación y valor residual. Tú solo pon <strong>cuántos usas y su vida real</strong>.
          </p>
        </Recomendacion>
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
  // Colapsado por defecto si ya tiene ítems (vista limpia); abierto si está vacío.
  const [abierto, setAbierto] = useState(items.length === 0);
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
              <div className="rounded-md border-2 border-sky-400 bg-sky-50 p-3 text-xs text-sky-950 dark:border-sky-600 dark:bg-sky-950/40 dark:text-sky-100">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-sky-600" />
                  <div className="space-y-2 leading-relaxed">
                    <div className="text-sm font-semibold">
                      {itemsCortos.length === 1
                        ? "Tienes 1 activo que no dura los 5 años — el modelo lo repone solo"
                        : `Tienes ${itemsCortos.length} activos que no duran los 5 años — el modelo los repone solos`}
                    </div>

                    <div className="rounded bg-sky-100/70 p-2.5 dark:bg-sky-900/30">
                      <ul className="ml-3 space-y-1.5">
                        {itemsCortos.map((it) => {
                          const vida = it.vidaUtilAnios ?? 1;
                          const enUso = it.cantidad;
                          const aniosRecompra: number[] = [];
                          for (let o = vida; o < ANIOS_PROYECTO; o += vida) aniosRecompra.push(o);
                          return (
                            <li key={it.id}>
                              <strong>{it.descripcion || "(sin nombre)"}</strong> dura {vida} años.
                              Como usas <strong>{enUso.toLocaleString()}</strong>, el modelo{" "}
                              <strong>recompra {enUso.toLocaleString()} automáticamente</strong> en
                              el/los año(s) <strong>{aniosRecompra.join(", ")}</strong>. Lo verás
                              como <em>"Reinversión"</em> en el flujo de caja del Paso 9.
                            </li>
                          );
                        })}
                      </ul>
                    </div>

                    <div className="rounded bg-card/60 p-2 text-[11px]">
                      <strong>No tienes que hacer nada:</strong> ya no inflas la cantidad ni
                      compras repuestos a mano. Solo pon <strong>cuántos usas a la vez</strong> y{" "}
                      <strong>su vida útil real</strong>; el motor registra las recompras y
                      ajusta la depreciación y el valor residual solo.
                      <ul className="ml-3 mt-1 list-disc space-y-0.5">
                        <li>
                          ¿Pusiste mal la vida útil? <strong>Corrígela a su valor real</strong>{" "}
                          en la columna "Vida útil".
                        </li>
                        <li>
                          ¿No piensas reponerlo? Puedes <strong>operar sin él al final</strong>:
                          baja tu proyección de demanda (Paso 2) en los años que ya no funcione.
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
                          placeholder={config.ejemplo}
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
                        <InputNumero
                          value={it.cantidad}
                          onChange={(n) => onEditar(it.id, { cantidad: n })}
                          onKeyDown={onKeyEnter}
                          data-col={`${config.valor}-cant`}
                          className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-right text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </td>
                      <td className="p-1">
                        <InputNumero
                          step="0.01"
                          value={it.costoUnitario}
                          onChange={(n) => onEditar(it.id, { costoUnitario: n })}
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
                            <InputNumero
                              value={it.vidaUtilAnios ?? 0}
                              onChange={(n) => onEditar(it.id, { vidaUtilAnios: n })}
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
