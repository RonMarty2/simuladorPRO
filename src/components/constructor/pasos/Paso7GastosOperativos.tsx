import { useState } from "react";
import { ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react";
import { useProyectoStore } from "@/stores/proyecto-store";
import FichaPedagogica from "../FichaPedagogica";
import InputNumero from "../InputNumero";
import { formatearBolivianos, cn } from "@/lib/utils";
import type { CostoGeneral } from "@/types/proyecto";

interface ConfigSubcat {
  label: string;
  sugerencia: string;
  placeholderDescripcion: string;
  borde: string;
  bgFila: string;
  bgHeader: string;
  chip: string;
}

const CONFIG_ADMIN: ConfigSubcat = {
  label: "Gastos administrativos",
  sugerencia: "Alquiler oficina, servicios básicos, contador, papelería…",
  placeholderDescripcion: "Ej: Alquiler oficina, contador, luz, internet…",
  borde: "border-l-blue-500",
  bgFila: "bg-blue-50 dark:bg-blue-950/20",
  bgHeader: "bg-blue-100/70 dark:bg-blue-950/40",
  chip: "bg-blue-200 text-blue-900 dark:bg-blue-900/60 dark:text-blue-100",
};

const CONFIG_COMERC: ConfigSubcat = {
  label: "Gastos de comercialización",
  sugerencia: "Publicidad, comisiones de venta, transporte de despacho, marketing…",
  placeholderDescripcion: "Ej: Publicidad, comisiones venta, transporte despacho…",
  borde: "border-l-emerald-500",
  bgFila: "bg-emerald-50 dark:bg-emerald-950/20",
  bgHeader: "bg-emerald-100/70 dark:bg-emerald-950/40",
  chip: "bg-emerald-200 text-emerald-900 dark:bg-emerald-900/60 dark:text-emerald-100",
};

const selectOnFocus = (e: React.FocusEvent<HTMLInputElement>) =>
  e.currentTarget.select();

export default function Paso7GastosOperativos() {
  const proyecto = useProyectoStore((s) => s.proyecto)!;
  const setCrecCostos = useProyectoStore((s) => s.setCrecimientoCostos);

  const agAdmin = useProyectoStore((s) => s.agregarCostoAdministracion);
  const edAdmin = useProyectoStore((s) => s.editarCostoAdministracion);
  const elAdmin = useProyectoStore((s) => s.eliminarCostoAdministracion);

  const agComerc = useProyectoStore((s) => s.agregarCostoComercializacion);
  const edComerc = useProyectoStore((s) => s.editarCostoComercializacion);
  const elComerc = useProyectoStore((s) => s.eliminarCostoComercializacion);

  const t1 = (items: CostoGeneral[]) =>
    items.reduce(
      (acc, c) => acc + c.cantidad * c.costoUnitario * (c.unidadMedida === "mes" ? 12 : 1),
      0
    );
  const adminAnio1 = t1(proyecto.costosAdministracion);
  const comercAnio1 = t1(proyecto.costosComercializacion);

  const g = proyecto.crecimientoCostosAnual;
  const proyectarAnios = (base: number) =>
    [0, 1, 2, 3, 4].map((i) => base * Math.pow(1 + g, i));
  const adminPorAnio = proyectarAnios(adminAnio1);
  const comercPorAnio = proyectarAnios(comercAnio1);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_280px]">
      <div className="space-y-3 rounded-lg border border-border bg-card p-5">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Paso 7 · Gastos administrativos y comercialización
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Gastos fijos del proyecto que no escalan con cada unidad producida.
          </p>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div className="rounded-md border border-blue-500/40 bg-blue-50 px-2.5 py-1.5 text-[11px] dark:bg-blue-950/20">
              <span className="font-semibold text-blue-900 dark:text-blue-100">
                Administrativos →
              </span>{" "}
              <span className="text-blue-900/80 dark:text-blue-100/80">
                hacen que la empresa <em>funcione</em> (alquiler de oficina, luz, agua,
                internet, contador externo, papelería). Los <strong>sueldos van en el Paso 4 ·
                Personal</strong>, no aquí.
              </span>
            </div>
            <div className="rounded-md border border-emerald-500/40 bg-emerald-50 px-2.5 py-1.5 text-[11px] dark:bg-emerald-950/20">
              <span className="font-semibold text-emerald-900 dark:text-emerald-100">
                Comercialización →
              </span>{" "}
              <span className="text-emerald-900/80 dark:text-emerald-100/80">
                sirven para <em>vender</em> el producto (publicidad, comisiones, transporte de despacho).
              </span>
            </div>
          </div>
        </div>

        <SeccionGastos
          config={CONFIG_ADMIN}
          items={proyecto.costosAdministracion}
          totalAnio1={adminAnio1}
          onAgregar={agAdmin}
          onEditar={edAdmin}
          onEliminar={elAdmin}
        />

        <SeccionGastos
          config={CONFIG_COMERC}
          items={proyecto.costosComercializacion}
          totalAnio1={comercAnio1}
          onAgregar={agComerc}
          onEditar={edComerc}
          onEliminar={elComerc}
        />

        {/* Tasa de crecimiento aplicable a ambos grupos */}
        <div className="rounded-md border border-border bg-secondary/20 p-3">
          <label htmlFor="p7-crec" className="text-xs font-medium">
            Crecimiento anual de costos (inflación, ajustes):{" "}
            <span className="text-foreground">{(g * 100).toFixed(1)}%</span>
          </label>
          <input
            id="p7-crec"
            type="range"
            min={0}
            max={15}
            step={0.5}
            value={g * 100}
            onChange={(e) => setCrecCostos(Number(e.target.value) / 100)}
            className="mt-1.5 w-full"
          />
          <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
            <span>0%</span>
            <span>5%</span>
            <span>10%</span>
            <span>15%</span>
          </div>
        </div>

        {/* Totales año a año */}
        <div className="rounded-md border-2 border-primary/40 bg-primary/5 p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide">
              Proyección 5 años
            </span>
            <span className="text-[10px] text-muted-foreground md:hidden">Desliza →</span>
          </div>
          <div className="-mx-1 overflow-x-auto md:mx-0">
          <table className="w-full min-w-[480px] text-xs md:min-w-0">
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
                <td className="p-1">Administrativos</td>
                {adminPorAnio.map((v, i) => (
                  <td key={i} className="p-1 text-right">
                    {formatearBolivianos(v)}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-1">Comercialización</td>
                {comercPorAnio.map((v, i) => (
                  <td key={i} className="p-1 text-right">
                    {formatearBolivianos(v)}
                  </td>
                ))}
              </tr>
              <tr className="border-t border-border">
                <td className="p-1 font-bold">Total operativos</td>
                {adminPorAnio.map((v, i) => (
                  <td key={i} className="p-1 text-right font-bold">
                    {formatearBolivianos(v + comercPorAnio[i])}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
          </div>
        </div>
      </div>

      <FichaPedagogica
        titulo="Gastos operativos en Bolivia"
        contenido={
          <>
            Para PYMES en Bolivia los gastos administrativos típicos suman entre el{" "}
            <strong>15-25% de los ingresos</strong>. Los comerciales rondan el{" "}
            <strong>3-10%</strong> según sector. Considera el ajuste por inflación
            anual (3-8% típico) para proyectar a 5 años.
          </>
        }
      />
    </div>
  );
}

function SeccionGastos({
  config,
  items,
  totalAnio1,
  onAgregar,
  onEditar,
  onEliminar,
}: {
  config: ConfigSubcat;
  items: CostoGeneral[];
  totalAnio1: number;
  onAgregar: (c: Omit<CostoGeneral, "id">) => void;
  onEditar: (id: string, cambios: Partial<CostoGeneral>) => void;
  onEliminar: (id: string) => void;
}) {
  // Colapsada por defecto si ya tiene ítems; abierta si está vacía (para agregar).
  const [abierto, setAbierto] = useState(items.length === 0);

  return (
    <div className={cn("overflow-hidden rounded-md border-l-4", config.borde, config.bgFila)}>
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        className={cn(
          "flex w-full flex-col gap-1 px-3 py-2 text-left md:flex-row md:items-center md:justify-between md:gap-2",
          config.bgHeader
        )}
      >
        <div className="flex min-w-0 items-center gap-2">
          {abierto ? (
            <ChevronDown className="h-4 w-4 flex-shrink-0" />
          ) : (
            <ChevronRight className="h-4 w-4 flex-shrink-0" />
          )}
          <span
            className={cn(
              "rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider md:flex-shrink-0 md:whitespace-nowrap",
              config.chip
            )}
          >
            {config.label}
          </span>
          <span className="hidden truncate text-[10px] text-foreground/70 md:inline">{config.sugerencia}</span>
        </div>
        <div className="flex-shrink-0 pl-6 md:pl-0 md:text-right">
          <div className="text-[10px] text-muted-foreground">
            Total año 1 · {items.length} ítem{items.length === 1 ? "" : "s"}
          </div>
          <div className="text-sm font-bold">{formatearBolivianos(totalAnio1)}</div>
        </div>
      </button>

      {abierto && (
      <div className="space-y-2 p-3">
        {items.length > 0 && (
          <div className="hidden overflow-x-auto rounded-md border border-border bg-card md:block">
            <table className="w-full text-xs">
              <thead className="text-[10px] uppercase tracking-wide text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="p-1.5 text-left w-[35%]">Descripción</th>
                  <th className="p-1.5 text-center w-[12%]">Unidad</th>
                  <th className="p-1.5 text-right w-[12%]">Cantidad</th>
                  <th className="p-1.5 text-right w-[16%]">Costo unit.</th>
                  <th className="p-1.5 text-right w-[18%]">Total anual</th>
                  <th className="w-8"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((c) => {
                  const factor = c.unidadMedida === "mes" ? 12 : 1;
                  return (
                    <tr key={c.id} className="border-b border-border/40 last:border-0">
                      <td className="p-1">
                        <input
                          type="text"
                          value={c.descripcion}
                          onChange={(e) => onEditar(c.id, { descripcion: e.target.value })}
                          onFocus={selectOnFocus}
                          placeholder={config.placeholderDescripcion}
                          className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </td>
                      <td className="p-1 text-center">
                        <select
                          value={c.unidadMedida}
                          onChange={(e) =>
                            onEditar(c.id, { unidadMedida: e.target.value as "mes" | "año" })
                          }
                          className="rounded-md border border-input bg-background px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          <option value="mes">Mes</option>
                          <option value="año">Año</option>
                        </select>
                      </td>
                      <td className="p-1">
                        <input
                          type="number"
                          value={c.cantidad}
                          onChange={(e) =>
                            onEditar(c.id, { cantidad: Number(e.target.value) || 0 })
                          }
                          onFocus={selectOnFocus}
                          className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-right text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </td>
                      <td className="p-1">
                        <input
                          type="number"
                          value={c.costoUnitario}
                          onChange={(e) =>
                            onEditar(c.id, { costoUnitario: Number(e.target.value) || 0 })
                          }
                          onFocus={selectOnFocus}
                          className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-right text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </td>
                      <td className="p-1 text-right font-semibold">
                        {formatearBolivianos(c.cantidad * c.costoUnitario * factor)}
                      </td>
                      <td className="p-1">
                        <button
                          onClick={() => onEliminar(c.id)}
                          className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Vista MÓVIL: una tarjeta por gasto ─────────────────────────── */}
        {items.length > 0 && (
          <div className="space-y-2 md:hidden">
            {items.map((c) => {
              const factor = c.unidadMedida === "mes" ? 12 : 1;
              return (
                <div key={c.id} className="rounded-md border border-border bg-card p-2">
                  <div className="flex items-start gap-2">
                    <input
                      type="text"
                      value={c.descripcion}
                      onChange={(e) => onEditar(c.id, { descripcion: e.target.value })}
                      onFocus={selectOnFocus}
                      placeholder={config.placeholderDescripcion}
                      className="min-w-0 flex-1 rounded-md border border-input bg-background px-2 py-1.5 text-xs font-semibold"
                    />
                    <button
                      onClick={() => onEliminar(c.id)}
                      className="flex-shrink-0 rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      aria-label="Eliminar gasto"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    <label className="text-[9px] text-muted-foreground">
                      Unidad
                      <select
                        value={c.unidadMedida}
                        onChange={(e) => onEditar(c.id, { unidadMedida: e.target.value as "mes" | "año" })}
                        className="mt-0.5 w-full rounded border border-input bg-background px-2 py-1.5 text-xs"
                      >
                        <option value="mes">Mes</option>
                        <option value="año">Año</option>
                      </select>
                    </label>
                    <label className="text-[9px] text-muted-foreground">
                      Cantidad
                      <InputNumero
                        value={c.cantidad}
                        onChange={(n) => onEditar(c.id, { cantidad: n })}
                        className="mt-0.5 w-full rounded border border-input bg-background px-2 py-1.5 text-right text-xs"
                      />
                    </label>
                    <label className="text-[9px] text-muted-foreground">
                      Costo unit.
                      <InputNumero
                        value={c.costoUnitario}
                        onChange={(n) => onEditar(c.id, { costoUnitario: n })}
                        className="mt-0.5 w-full rounded border border-input bg-background px-2 py-1.5 text-right text-xs"
                      />
                    </label>
                  </div>
                  <div className="mt-2 border-t border-border/50 pt-1.5 text-right text-[11px]">
                    <span className="text-muted-foreground">Total anual:</span>{" "}
                    <strong>{formatearBolivianos(c.cantidad * c.costoUnitario * factor)}</strong>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <button
          onClick={() =>
            onAgregar({ descripcion: "", unidadMedida: "mes", cantidad: 1, costoUnitario: 0 })
          }
          className="flex items-center gap-1.5 rounded-md border border-dashed border-border bg-card px-2.5 py-1.5 text-xs text-muted-foreground hover:border-foreground hover:text-foreground"
        >
          <Plus className="h-3.5 w-3.5" />
          Agregar a {config.label.toLowerCase()}
        </button>
      </div>
      )}
    </div>
  );
}
