import { Plus, Trash2 } from "lucide-react";
import { useProyectoStore } from "@/stores/proyecto-store";
import FichaPedagogica from "../FichaPedagogica";
import { formatearBolivianos } from "@/lib/utils";
import type { CostoGeneral } from "@/types/proyecto";

export default function Paso7GastosOperativos() {
  const proyecto = useProyectoStore((s) => s.proyecto)!;
  const setCrecCostos = useProyectoStore((s) => s.setCrecimientoCostos);

  const agAdmin = useProyectoStore((s) => s.agregarCostoAdministracion);
  const edAdmin = useProyectoStore((s) => s.editarCostoAdministracion);
  const elAdmin = useProyectoStore((s) => s.eliminarCostoAdministracion);

  const agComerc = useProyectoStore((s) => s.agregarCostoComercializacion);
  const edComerc = useProyectoStore((s) => s.editarCostoComercializacion);
  const elComerc = useProyectoStore((s) => s.eliminarCostoComercializacion);

  // Totales año 1 de cada grupo
  const t1 = (items: CostoGeneral[]) =>
    items.reduce(
      (acc, c) => acc + c.cantidad * c.costoUnitario * (c.unidadMedida === "mes" ? 12 : 1),
      0
    );
  const adminAnio1 = t1(proyecto.costosAdministracion);
  const comercAnio1 = t1(proyecto.costosComercializacion);

  // Proyección a 5 años aplicando crecimientoCostosAnual
  const g = proyecto.crecimientoCostosAnual;
  const proyectarAnios = (base: number) =>
    [0, 1, 2, 3, 4].map((i) => base * Math.pow(1 + g, i));
  const adminPorAnio = proyectarAnios(adminAnio1);
  const comercPorAnio = proyectarAnios(comercAnio1);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4 rounded-lg border border-border bg-card p-6">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Paso 7 · Gastos administrativos y comercialización
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Gastos fijos del proyecto que no escalan con cada unidad producida.
          </p>
        </div>

        <SeccionGastos
          titulo="Gastos administrativos"
          subtitulo="Alquiler, servicios básicos, honorarios contables, papelería…"
          items={proyecto.costosAdministracion}
          totalAnio1={adminAnio1}
          onAgregar={agAdmin}
          onEditar={edAdmin}
          onEliminar={elAdmin}
        />

        <SeccionGastos
          titulo="Gastos de comercialización"
          subtitulo="Publicidad, distribución, comisiones, marketing digital…"
          items={proyecto.costosComercializacion}
          totalAnio1={comercAnio1}
          onAgregar={agComerc}
          onEditar={edComerc}
          onEliminar={elComerc}
        />

        {/* Crecimiento anual aplicable a ambos grupos */}
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

        {/* Proyección 5 años */}
        <div className="rounded-md border border-border bg-secondary/20 p-3">
          <div className="mb-2 text-xs font-semibold">Proyección 5 años</div>
          <table className="w-full text-xs">
            <thead className="text-muted-foreground">
              <tr>
                <th className="p-1 text-left">Concepto</th>
                {[1, 2, 3, 4, 5].map((a) => (
                  <th key={a} className="p-1 text-right">Año {a}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-1">Administrativos</td>
                {adminPorAnio.map((v, i) => (
                  <td key={i} className="p-1 text-right">{formatearBolivianos(v)}</td>
                ))}
              </tr>
              <tr>
                <td className="p-1">Comercialización</td>
                {comercPorAnio.map((v, i) => (
                  <td key={i} className="p-1 text-right">{formatearBolivianos(v)}</td>
                ))}
              </tr>
              <tr className="border-t border-border">
                <td className="p-1 font-semibold">Total operativos</td>
                {adminPorAnio.map((v, i) => (
                  <td key={i} className="p-1 text-right font-semibold">
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
  titulo,
  subtitulo,
  items,
  totalAnio1,
  onAgregar,
  onEditar,
  onEliminar,
}: {
  titulo: string;
  subtitulo: string;
  items: CostoGeneral[];
  totalAnio1: number;
  onAgregar: (c: Omit<CostoGeneral, "id">) => void;
  onEditar: (id: string, cambios: Partial<CostoGeneral>) => void;
  onEliminar: (id: string) => void;
}) {
  return (
    <div className="rounded-md border border-border">
      <div className="flex items-center justify-between border-b border-border bg-secondary/30 px-3 py-2">
        <div>
          <div className="text-sm font-medium">{titulo}</div>
          <div className="text-[10px] text-muted-foreground">{subtitulo}</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-muted-foreground">Total año 1</div>
          <div className="text-sm font-semibold">{formatearBolivianos(totalAnio1)}</div>
        </div>
      </div>

      {items.length > 0 && (
        <table className="w-full text-xs">
          <thead className="text-muted-foreground">
            <tr className="border-b border-border">
              <th className="p-1.5 text-left">Descripción</th>
              <th className="p-1.5 text-center">Unidad</th>
              <th className="p-1.5 text-right">Cantidad</th>
              <th className="p-1.5 text-right">Costo unit.</th>
              <th className="p-1.5 text-right">Total anual</th>
              <th className="w-7"></th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => {
              const factor = c.unidadMedida === "mes" ? 12 : 1;
              return (
                <tr key={c.id} className="border-b border-border/50">
                  <td className="p-1">
                    <input
                      type="text"
                      value={c.descripcion}
                      onChange={(e) => onEditar(c.id, { descripcion: e.target.value })}
                      className="w-full rounded-md border border-input bg-background px-2 py-1 focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </td>
                  <td className="p-1 text-center">
                    <select
                      value={c.unidadMedida}
                      onChange={(e) =>
                        onEditar(c.id, { unidadMedida: e.target.value as "mes" | "año" })
                      }
                      className="rounded-md border border-input bg-background px-2 py-1 focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="mes">Mes</option>
                      <option value="año">Año</option>
                    </select>
                  </td>
                  <td className="p-1 text-right">
                    <input
                      type="number"
                      value={c.cantidad}
                      onChange={(e) => onEditar(c.id, { cantidad: Number(e.target.value) || 0 })}
                      className="w-16 rounded border-0 bg-transparent px-1 py-0.5 text-right hover:bg-accent focus:bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </td>
                  <td className="p-1 text-right">
                    <input
                      type="number"
                      value={c.costoUnitario}
                      onChange={(e) => onEditar(c.id, { costoUnitario: Number(e.target.value) || 0 })}
                      className="w-24 rounded border-0 bg-transparent px-1 py-0.5 text-right hover:bg-accent focus:bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </td>
                  <td className="p-1 text-right font-medium">
                    {formatearBolivianos(c.cantidad * c.costoUnitario * factor)}
                  </td>
                  <td className="p-1">
                    <button
                      onClick={() => onEliminar(c.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      <div className="p-2">
        <button
          onClick={() =>
            onAgregar({ descripcion: "", unidadMedida: "mes", cantidad: 1, costoUnitario: 0 })
          }
          className="flex items-center gap-1.5 rounded-md border border-dashed border-border px-2.5 py-1.5 text-xs text-muted-foreground hover:border-foreground hover:text-foreground"
        >
          <Plus className="h-3 w-3" />
          Agregar a {titulo.toLowerCase()}
        </button>
      </div>
    </div>
  );
}
