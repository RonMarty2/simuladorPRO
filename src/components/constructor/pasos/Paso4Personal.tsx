import { useState } from "react";
import { Plus, RotateCcw, Settings, Trash2 } from "lucide-react";
import { useProyectoStore } from "@/stores/proyecto-store";
import FichaPedagogica from "../FichaPedagogica";
import {
  APORTES_PATRONALES_BOLIVIA,
  calcularAportesPatronales,
  obtenerTasasAportes,
} from "@/lib/calculo-financiero";
import { formatearBolivianos, cn } from "@/lib/utils";

const selectOnFocus = (e: React.FocusEvent<HTMLInputElement>) =>
  e.currentTarget.select();

// Paleta cíclica de colores por puesto / aporte
const COLORES = [
  {
    borde: "border-l-blue-500",
    bgFila: "bg-blue-50 dark:bg-blue-950/20",
    chip: "bg-blue-200 text-blue-900 dark:bg-blue-900/60 dark:text-blue-100",
  },
  {
    borde: "border-l-emerald-500",
    bgFila: "bg-emerald-50 dark:bg-emerald-950/20",
    chip: "bg-emerald-200 text-emerald-900 dark:bg-emerald-900/60 dark:text-emerald-100",
  },
  {
    borde: "border-l-amber-500",
    bgFila: "bg-amber-50 dark:bg-amber-950/20",
    chip: "bg-amber-200 text-amber-900 dark:bg-amber-900/60 dark:text-amber-100",
  },
  {
    borde: "border-l-purple-500",
    bgFila: "bg-purple-50 dark:bg-purple-950/20",
    chip: "bg-purple-200 text-purple-900 dark:bg-purple-900/60 dark:text-purple-100",
  },
  {
    borde: "border-l-pink-500",
    bgFila: "bg-pink-50 dark:bg-pink-950/20",
    chip: "bg-pink-200 text-pink-900 dark:bg-pink-900/60 dark:text-pink-100",
  },
  {
    borde: "border-l-cyan-500",
    bgFila: "bg-cyan-50 dark:bg-cyan-950/20",
    chip: "bg-cyan-200 text-cyan-900 dark:bg-cyan-900/60 dark:text-cyan-100",
  },
];

interface ConfigAporte {
  campo:
    | "riesgoProfesional"
    | "seguroSalud"
    | "provisionVivienda"
    | "previsionAguinaldo"
    | "previsionIndemnizacion";
  label: string;
  ayuda: string;
}

const aportesConfig: ConfigAporte[] = [
  { campo: "riesgoProfesional", label: "Riesgo profesional", ayuda: "Cobertura por accidentes laborales" },
  { campo: "seguroSalud", label: "Seguro de salud (Cajas)", ayuda: "CNS, COSSMIL, Caja Petrolera, etc." },
  { campo: "provisionVivienda", label: "Provisión vivienda", ayuda: "FONDESIF / aporte vivienda" },
  { campo: "previsionAguinaldo", label: "Previsión aguinaldo", ayuda: "1 sueldo / 12 meses" },
  { campo: "previsionIndemnizacion", label: "Previsión indemnización", ayuda: "1 sueldo / 12 meses" },
];

export default function Paso4Personal() {
  const proyecto = useProyectoStore((s) => s.proyecto)!;
  const agregar = useProyectoStore((s) => s.agregarPuesto);
  const editar = useProyectoStore((s) => s.editarPuesto);
  const eliminar = useProyectoStore((s) => s.eliminarPuesto);
  const setAporte = useProyectoStore((s) => s.setAportePatronal);
  const restaurarDefault = useProyectoStore((s) => s.restaurarAportesPatronalesDefault);
  const [mostrarConfig, setMostrarConfig] = useState(false);

  const tasas = obtenerTasasAportes(proyecto.aportesPatronalesOverride);
  const totalTasa =
    tasas.riesgoProfesional +
    tasas.seguroSalud +
    tasas.provisionVivienda +
    tasas.previsionAguinaldo +
    tasas.previsionIndemnizacion;

  const tasasModificadas = !!proyecto.aportesPatronalesOverride;

  const costoAnualTotal = proyecto.personal.reduce((acc, p) => {
    const aportes = calcularAportesPatronales(p.sueldoMensual, tasas);
    return acc + aportes.costoTotalAnual * p.cantidad;
  }, 0);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_280px]">
      <div className="space-y-4 rounded-lg border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Paso 4 · Personal</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Aportes patronales ({(totalTasa * 100).toFixed(2)}%) se calculan
              automáticamente.
              {tasasModificadas && (
                <span className="ml-1 italic text-amber-700 dark:text-amber-300">
                  Tasas personalizadas
                </span>
              )}
            </p>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
              Costo anual total
            </div>
            <div className="text-lg font-bold">{formatearBolivianos(costoAnualTotal)}</div>
          </div>
        </div>

        {/* Tabla de puestos con color por fila */}
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full text-xs">
            <thead className="bg-secondary text-[10px] uppercase tracking-wide text-muted-foreground">
              <tr className="border-b border-border">
                <th className="p-2 text-left w-[28%]"></th>
                <th className="p-2 text-left">Puesto</th>
                <th className="p-2 text-right">Cantidad</th>
                <th className="p-2 text-right">Sueldo mensual</th>
                <th className="p-2 text-right">Aportes / mes</th>
                <th className="p-2 text-right">Costo anual total</th>
                <th className="w-8 p-2"></th>
              </tr>
            </thead>
            <tbody>
              {proyecto.personal.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-muted-foreground">
                    Aún no agregaste puestos.
                  </td>
                </tr>
              )}
              {proyecto.personal.map((p, idx) => {
                const aportes = calcularAportesPatronales(p.sueldoMensual, tasas);
                const color = COLORES[idx % COLORES.length];
                return (
                  <tr
                    key={p.id}
                    className={cn(
                      "border-b border-border/40 last:border-0 border-l-4",
                      color.borde,
                      color.bgFila
                    )}
                  >
                    <td className="p-1.5">
                      <span
                        className={cn(
                          "rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                          color.chip
                        )}
                      >
                        Puesto {idx + 1}
                      </span>
                    </td>
                    <td className="p-1.5">
                      <input
                        type="text"
                        value={p.puesto}
                        onChange={(e) => editar(p.id, { puesto: e.target.value })}
                        onFocus={selectOnFocus}
                        placeholder="Barista, Administrador…"
                        className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </td>
                    <td className="p-1.5">
                      <input
                        type="number"
                        value={p.cantidad}
                        onChange={(e) => editar(p.id, { cantidad: Number(e.target.value) || 0 })}
                        onFocus={selectOnFocus}
                        className="w-20 rounded-md border border-input bg-background px-2 py-1.5 text-right text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </td>
                    <td className="p-1.5">
                      <input
                        type="number"
                        value={p.sueldoMensual}
                        onChange={(e) =>
                          editar(p.id, { sueldoMensual: Number(e.target.value) || 0 })
                        }
                        onFocus={selectOnFocus}
                        className="w-28 rounded-md border border-input bg-background px-2 py-1.5 text-right text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </td>
                    <td className="p-1.5 text-right text-xs text-muted-foreground">
                      {formatearBolivianos(aportes.totalAportes)}
                    </td>
                    <td className="p-1.5 text-right text-xs font-semibold">
                      {formatearBolivianos(aportes.costoTotalAnual * p.cantidad)}
                    </td>
                    <td className="p-1.5 text-right">
                      <button
                        onClick={() => eliminar(p.id)}
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

        <button
          onClick={() => agregar({ puesto: "Nuevo puesto", cantidad: 1, sueldoMensual: 2500 })}
          className="flex items-center gap-1.5 rounded-md border border-dashed border-border bg-background px-2.5 py-1.5 text-xs text-muted-foreground hover:border-foreground hover:text-foreground"
        >
          <Plus className="h-3.5 w-3.5" />
          Agregar puesto
        </button>

        {/* Panel colapsable de aportes patronales con color por fila */}
        <div
          className={cn(
            "rounded-md border bg-secondary/20",
            tasasModificadas ? "border-amber-400" : "border-border"
          )}
        >
          <button
            onClick={() => setMostrarConfig((v) => !v)}
            className="flex w-full items-center justify-between px-3 py-2 text-left"
          >
            <div className="flex items-center gap-2 text-xs font-medium">
              <Settings className="h-3.5 w-3.5" />
              Tasas de aportes patronales{" "}
              <span className="text-muted-foreground">
                — total {(totalTasa * 100).toFixed(2)}%
              </span>
              {tasasModificadas && (
                <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-900 dark:bg-amber-900/40 dark:text-amber-200">
                  Modificadas
                </span>
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              {mostrarConfig ? "▾ Ocultar" : "▸ Mostrar / Editar"}
            </span>
          </button>

          {mostrarConfig && (
            <div className="space-y-3 border-t border-border bg-card p-3">
              <p className="text-[11px] text-muted-foreground">
                Las tasas vigentes corresponden a la Ley General del Trabajo de Bolivia
                (2025). <strong>Solo modifica si la ley cambió</strong> o si quieres
                hacer un escenario hipotético. Si no estás seguro, deja los valores por
                defecto.
              </p>

              <div className="overflow-x-auto rounded border border-border">
                <table className="w-full text-xs">
                  <thead className="bg-secondary text-[10px] uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="p-1.5 text-left w-[22%]"></th>
                      <th className="p-1.5 text-left">Aporte</th>
                      <th className="p-1.5 text-left">Descripción</th>
                      <th className="p-1.5 text-right">Tasa actual (%)</th>
                      <th className="p-1.5 text-right">Default LGT 2025 (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {aportesConfig.map((cfg, idx) => {
                      const tasaActual = tasas[cfg.campo];
                      const tasaDefault = APORTES_PATRONALES_BOLIVIA[cfg.campo];
                      const modificado = Math.abs(tasaActual - tasaDefault) > 0.0001;
                      const color = COLORES[idx % COLORES.length];
                      return (
                        <tr
                          key={cfg.campo}
                          className={cn(
                            "border-t border-border/40 border-l-4",
                            color.borde,
                            color.bgFila
                          )}
                        >
                          <td className="p-1.5">
                            <span
                              className={cn(
                                "rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                                color.chip
                              )}
                            >
                              Aporte {idx + 1}
                            </span>
                          </td>
                          <td className="p-1.5 font-medium">{cfg.label}</td>
                          <td className="p-1.5 text-muted-foreground">{cfg.ayuda}</td>
                          <td className="p-1.5">
                            <input
                              type="number"
                              step="0.01"
                              value={Number((tasaActual * 100).toFixed(2))}
                              onChange={(e) =>
                                setAporte(cfg.campo, (Number(e.target.value) || 0) / 100)
                              }
                              onFocus={selectOnFocus}
                              className={cn(
                                "w-24 rounded-md border bg-background px-2 py-1 text-right text-xs focus:outline-none focus:ring-2 focus:ring-ring",
                                modificado
                                  ? "border-amber-500 ring-1 ring-amber-300"
                                  : "border-input"
                              )}
                            />
                          </td>
                          <td className="p-1.5 text-right text-muted-foreground">
                            {(tasaDefault * 100).toFixed(2)}%
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="border-t-2 border-border bg-secondary/50">
                      <td className="p-1.5"></td>
                      <td className="p-1.5 font-bold" colSpan={2}>
                        TOTAL
                      </td>
                      <td className="p-1.5 text-right font-bold">
                        {(totalTasa * 100).toFixed(2)}%
                      </td>
                      <td className="p-1.5 text-right text-muted-foreground">30.37%</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {tasasModificadas && (
                <button
                  onClick={restaurarDefault}
                  className="flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-secondary"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Restaurar valores por defecto (LGT 2025)
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <FichaPedagogica
        titulo="Aportes patronales en Bolivia"
        contenido={
          <>
            Por cada Bs 100 de sueldo bruto, el empleador paga Bs{" "}
            {(totalTasa * 100).toFixed(2)} extra en aportes:
            <ul className="mt-1.5 list-disc pl-4">
              <li>Riesgo profesional: {(tasas.riesgoProfesional * 100).toFixed(2)}%</li>
              <li>Seguro de salud (Cajas): {(tasas.seguroSalud * 100).toFixed(2)}%</li>
              <li>Provisión vivienda: {(tasas.provisionVivienda * 100).toFixed(2)}%</li>
              <li>Previsión aguinaldo: {(tasas.previsionAguinaldo * 100).toFixed(2)}%</li>
              <li>Previsión indemnización: {(tasas.previsionIndemnizacion * 100).toFixed(2)}%</li>
            </ul>
            <br />
            Si la Ley General del Trabajo cambia, puedes editar las tasas en el panel
            "Tasas de aportes patronales" al final de la pantalla.
          </>
        }
      />
    </div>
  );
}
