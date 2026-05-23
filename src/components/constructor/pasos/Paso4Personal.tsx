import { useState } from "react";
import { Plus, RotateCcw, Trash2, Users, Receipt } from "lucide-react";
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

// Mismo patrón visual de Paso 3 (Inversiones): un color por BLOQUE completo.
// Paso 4 tiene 2 bloques: Personal (azul) y Aportes Patronales (ámbar).
const BLOQUE_PERSONAL = {
  borde: "border-l-blue-500",
  bgFila: "bg-blue-50 dark:bg-blue-950/20",
  bgHeader: "bg-blue-100/70 dark:bg-blue-950/40",
  chip: "bg-blue-200 text-blue-900 dark:bg-blue-900/60 dark:text-blue-100",
};

const BLOQUE_APORTES = {
  borde: "border-l-amber-500",
  bgFila: "bg-amber-50 dark:bg-amber-950/20",
  bgHeader: "bg-amber-100/70 dark:bg-amber-950/40",
  chip: "bg-amber-200 text-amber-900 dark:bg-amber-900/60 dark:text-amber-100",
};

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
      <div className="space-y-3 rounded-lg border border-border bg-card p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Paso 4 · Personal</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Aportes patronales ({(totalTasa * 100).toFixed(2)}%) se calculan
              automáticamente según las tasas de abajo.
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

        {/* BLOQUE 1: APORTES PATRONALES (ámbar) — marco legal, va PRIMERO */}
        <div
          className={cn(
            "overflow-hidden rounded-md border-l-4",
            BLOQUE_APORTES.borde,
            BLOQUE_APORTES.bgFila
          )}
        >
          <button
            onClick={() => setMostrarConfig((v) => !v)}
            className={cn(
              "flex w-full items-center justify-between px-3 py-2 text-left",
              BLOQUE_APORTES.bgHeader
            )}
          >
            <div className="flex items-center gap-2">
              <Receipt className="h-3.5 w-3.5" />
              <span
                className={cn(
                  "rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                  BLOQUE_APORTES.chip
                )}
              >
                1. Aportes patronales (LGT Bolivia)
              </span>
              <span className="text-xs font-medium text-foreground/70">
                — total {(totalTasa * 100).toFixed(2)}%
              </span>
              {tasasModificadas && (
                <span className="rounded bg-amber-300 px-1.5 py-0.5 text-[10px] font-semibold text-amber-950 dark:bg-amber-700 dark:text-amber-100">
                  Modificadas
                </span>
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              {mostrarConfig ? "▾ Ocultar" : "▸ Mostrar / Editar"}
            </span>
          </button>

          {mostrarConfig && (
            <div className="space-y-3 p-3">
              <p className="text-[11px] text-muted-foreground">
                Estas son las tasas vigentes de la Ley General del Trabajo de Bolivia
                (2025). Se aplican automáticamente a cada sueldo en la tabla de
                Personal abajo. <strong>Solo modifica si la ley cambió</strong> o si
                quieres hacer un escenario hipotético.
              </p>

              <div className="overflow-x-auto rounded border border-border bg-card">
                <table className="w-full text-xs">
                  <thead className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    <tr className="border-b border-border">
                      <th className="p-1.5 text-left w-[30%]">Aporte</th>
                      <th className="p-1.5 text-left w-[35%]">Descripción</th>
                      <th className="p-1.5 text-right w-[17%]">Tasa actual (%)</th>
                      <th className="p-1.5 text-right w-[18%]">Default LGT 2025 (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {aportesConfig.map((cfg) => {
                      const tasaActual = tasas[cfg.campo];
                      const tasaDefault = APORTES_PATRONALES_BOLIVIA[cfg.campo];
                      const modificado = Math.abs(tasaActual - tasaDefault) > 0.0001;
                      return (
                        <tr key={cfg.campo} className="border-b border-border/40 last:border-0">
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
                                "w-full rounded-md border bg-background px-2 py-1 text-right text-xs focus:outline-none focus:ring-2 focus:ring-ring",
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
                    <tr className="border-t-2 border-border bg-secondary/40">
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

        {/* BLOQUE 2: PERSONAL (azul) */}
        <div className={cn("overflow-hidden rounded-md border-l-4", BLOQUE_PERSONAL.borde, BLOQUE_PERSONAL.bgFila)}>
          <div className={cn("flex items-center justify-between px-3 py-2", BLOQUE_PERSONAL.bgHeader)}>
            <div className="flex items-center gap-2">
              <Users className="h-3.5 w-3.5" />
              <span className={cn("rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider", BLOQUE_PERSONAL.chip)}>
                2. Personal
              </span>
              <span className="text-xs font-medium text-foreground/70">
                ({proyecto.personal.length} {proyecto.personal.length === 1 ? "puesto" : "puestos"})
              </span>
            </div>
          </div>

          <div className="space-y-2 p-3">
            {proyecto.personal.length === 0 && (
              <div className="rounded border border-dashed border-border bg-card p-3 text-center text-xs text-muted-foreground">
                Aún no agregaste puestos.
              </div>
            )}

            {proyecto.personal.length > 0 && (
              <div className="overflow-x-auto rounded-md border border-border bg-card">
                <table className="w-full text-xs">
                  <thead className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    <tr className="border-b border-border">
                      <th className="p-1.5 text-left w-[32%]">Puesto</th>
                      <th className="p-1.5 text-right w-[12%]">Cantidad</th>
                      <th className="p-1.5 text-right w-[16%]">Sueldo mensual</th>
                      <th className="p-1.5 text-right w-[15%]">Aportes / mes</th>
                      <th className="p-1.5 text-right w-[20%]">Costo anual total</th>
                      <th className="w-8 p-1.5"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {proyecto.personal.map((p) => {
                      const aportes = calcularAportesPatronales(p.sueldoMensual, tasas);
                      return (
                        <tr key={p.id} className="border-b border-border/40 last:border-0">
                          <td className="p-1">
                            <input
                              type="text"
                              value={p.puesto}
                              onChange={(e) => editar(p.id, { puesto: e.target.value })}
                              onFocus={selectOnFocus}
                              placeholder="Barista, Administrador…"
                              className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                          </td>
                          <td className="p-1">
                            <input
                              type="number"
                              value={p.cantidad}
                              onChange={(e) => editar(p.id, { cantidad: Number(e.target.value) || 0 })}
                              onFocus={selectOnFocus}
                              className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-right text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                          </td>
                          <td className="p-1">
                            <input
                              type="number"
                              value={p.sueldoMensual}
                              onChange={(e) =>
                                editar(p.id, { sueldoMensual: Number(e.target.value) || 0 })
                              }
                              onFocus={selectOnFocus}
                              className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-right text-xs focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                          </td>
                          <td className="p-1 text-right text-xs text-muted-foreground">
                            {formatearBolivianos(aportes.totalAportes)}
                          </td>
                          <td className="p-1 text-right text-xs font-semibold">
                            {formatearBolivianos(aportes.costoTotalAnual * p.cantidad)}
                          </td>
                          <td className="p-1 text-right">
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
            )}

            <button
              onClick={() => agregar({ puesto: "Nuevo puesto", cantidad: 1, sueldoMensual: 2500 })}
              className="flex items-center gap-1.5 rounded-md border border-dashed border-border bg-card px-2.5 py-1.5 text-xs text-muted-foreground hover:border-foreground hover:text-foreground"
            >
              <Plus className="h-3.5 w-3.5" />
              Agregar puesto
            </button>
          </div>
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
            Si la Ley General del Trabajo cambia, edita las tasas en el panel ámbar
            "Aportes patronales" al final de la pantalla.
          </>
        }
      />
    </div>
  );
}
