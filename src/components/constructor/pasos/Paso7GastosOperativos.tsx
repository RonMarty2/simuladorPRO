import { Plus, Trash2 } from "lucide-react";
import { useProyectoStore } from "@/stores/proyecto-store";
import FichaPedagogica from "../FichaPedagogica";
import { formatearBolivianos, cn } from "@/lib/utils";
import type { CostoGeneral } from "@/types/proyecto";

interface ConfigSubcat {
  label: string;
  sugerencia: string;
  borde: string;
  bgFila: string;
  bgHeader: string;
  chip: string;
}

const CONFIG_ADMIN: ConfigSubcat = {
  label: "Gastos administrativos",
  sugerencia: "Alquiler, servicios básicos, honorarios contables, papelería…",
  borde: "border-l-blue-500",
  bgFila: "bg-blue-50 dark:bg-blue-950/20",
  bgHeader: "bg-blue-100/70 dark:bg-blue-950/40",
  chip: "bg-blue-200 text-blue-900 dark:bg-blue-900/60 dark:text-blue-100",
};

const CONFIG_COMERC: ConfigSubcat = {
  label: "Gastos de comercialización",
  sugerencia: "Publicidad, distribución, comisiones, marketing digital…",
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
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide">
            Proyección 5 años
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
  return (
    <div className={cn("overflow-hidden rounded-md border-l-4", config.borde, config.bgFila)}>
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
          <div className="text-[10px] text-muted-foreground">Total año 1</div>
          <div className="text-sm font-bold">{formatearBolivianos(totalAnio1)}</div>
        </div>
      </div>

      <div className="space-y-2 p-3">
        {items.length > 0 && (
          <div className="overflow-x-auto rounded-md border border-border bg-card">
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
                          placeholder="Alquiler, publicidad…"
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
    </div>
  );
}
