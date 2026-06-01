import { useMemo, useState } from "react";
import { X, BookOpen, Eye } from "lucide-react";
import { PLANTILLAS, type PlantillaMeta } from "@/lib/plantillas";
import { construirFlujoCaja } from "@/lib/flujo-proyecto";
import { formatearBolivianos, cn } from "@/lib/utils";
import type { Proyecto } from "@/types/proyecto";
import DetalleEntregaPasoAPaso from "@/components/docente/DetalleEntregaPasoAPaso";

/**
 * Galería de proyectos de EJEMPLO (solo lectura). Muestra "mega proyectos"
 * completos como referencia. NO se guardan, NO se mezclan con los proyectos
 * del estudiante: se exploran acá y listo.
 */
export default function GaleriaEjemplos() {
  const [abierto, setAbierto] = useState<PlantillaMeta | null>(null);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
          <BookOpen className="h-5 w-5 text-primary" />
          Galería de proyectos de ejemplo
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Proyectos modelo <strong>completos</strong> para que veas todo lo que el simulador
          puede modelar (inversiones, personal, costos, financiamiento, indicadores). Son{" "}
          <strong>solo de lectura</strong>: explorálos para aprender — tu proyecto será más
          simple porque elegís un solo tipo.
        </p>
      </div>

      <div className="rounded-md border border-amber-300 bg-amber-50/60 px-3 py-2 text-[11px] text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100">
        💡 Estos ejemplos <strong>no aparecen en tu lista de proyectos</strong> ni se guardan.
        Son una vitrina de referencia. Para trabajar el tuyo, andá a <strong>Mi panel</strong>.
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PLANTILLAS.map((pl) => (
          <button
            key={pl.clave}
            onClick={() => setAbierto(pl)}
            className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4 text-left transition hover:border-primary hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-3xl">{pl.emoji}</span>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                {pl.sector}
              </span>
            </div>
            <div className="text-sm font-bold leading-tight">{pl.titulo}</div>
            <span className="self-start rounded bg-indigo-600 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
              {pl.modeloLabel}
            </span>
            <p className="text-[11px] leading-snug text-muted-foreground">{pl.resumen}</p>
            <div className="mt-1 flex items-center gap-1 text-[11px] font-medium text-primary">
              <Eye className="h-3.5 w-3.5" />
              Ver proyecto completo
            </div>
          </button>
        ))}
      </div>

      {abierto && <VisorPlantilla plantilla={abierto} onCerrar={() => setAbierto(null)} />}
    </div>
  );
}

function VisorPlantilla({
  plantilla,
  onCerrar,
}: {
  plantilla: PlantillaMeta;
  onCerrar: () => void;
}) {
  // Genera el proyecto una sola vez al abrir.
  const proyecto = useMemo<Proyecto>(() => plantilla.crear(), [plantilla]);
  const calc = useMemo(() => {
    try {
      return construirFlujoCaja(proyecto);
    } catch {
      return null;
    }
  }, [proyecto]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4">
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg bg-card shadow-xl">
        <header className="flex items-center justify-between gap-2 border-b border-border p-4">
          <div className="min-w-0">
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <span className="text-xl">{plantilla.emoji}</span>
              <span className="truncate">{proyecto.nombre}</span>
            </h2>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {plantilla.sector} · {plantilla.modeloLabel} · Proyecto de ejemplo (solo lectura)
            </p>
          </div>
          <button onClick={onCerrar} className="rounded-md p-1 hover:bg-secondary">
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {/* Indicadores calculados */}
          {calc && (
            <div>
              <div className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Indicadores del proyecto
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <Indicador
                  titulo="VAN"
                  valor={formatearBolivianos(calc.indicadores.van)}
                  positivo={calc.indicadores.van > 0}
                />
                <Indicador
                  titulo="TIR"
                  valor={isFinite(calc.indicadores.tir) ? `${(calc.indicadores.tir * 100).toFixed(2)}%` : "—"}
                  positivo={calc.indicadores.tir > calc.wacc}
                />
                <Indicador titulo="WACC" valor={`${(calc.wacc * 100).toFixed(2)}%`} positivo />
                <Indicador
                  titulo="Payback"
                  valor={isFinite(calc.indicadores.payback) ? `${calc.indicadores.payback.toFixed(1)} años` : "—"}
                  positivo={calc.indicadores.payback > 0 && calc.indicadores.payback <= 5}
                />
              </div>
            </div>
          )}

          {/* Descripción */}
          <div className="rounded-md border border-border bg-secondary/20 p-3 text-[11px] text-muted-foreground">
            {proyecto.descripcion}
          </div>

          {/* Detalle paso a paso (reusa el visor del docente) */}
          <DetalleEntregaPasoAPaso proyecto={proyecto} pasoEntregado={null} />
        </div>

        <footer className="border-t border-border p-3 text-center text-[10px] text-muted-foreground">
          Ejemplo de referencia · No se guarda ni aparece en tus proyectos
        </footer>
      </div>
    </div>
  );
}

function Indicador({ titulo, valor, positivo }: { titulo: string; valor: string; positivo: boolean }) {
  return (
    <div className="rounded-md border border-border bg-card p-2">
      <div className="text-[9px] uppercase tracking-wide text-muted-foreground">{titulo}</div>
      <div
        className={cn(
          "text-sm font-bold tabular-nums",
          positivo ? "text-emerald-700 dark:text-emerald-400" : "text-destructive"
        )}
      >
        {valor}
      </div>
    </div>
  );
}
