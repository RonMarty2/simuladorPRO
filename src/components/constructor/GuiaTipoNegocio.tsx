import { useState } from "react";
import { ChevronDown, ChevronRight, Lightbulb } from "lucide-react";
import { useProyectoStore } from "@/stores/proyecto-store";
import { GUIA_POR_TIPO } from "@/lib/guia-por-tipo";
import type { GuiaTipo } from "@/lib/guia-por-tipo";
import type { CategoriaPlantilla } from "@/lib/plantillas";

/**
 * Guía del tipo de negocio dentro de cada etapa del constructor: qué suele llevar
 * un proyecto de ese rubro. Si el proyecto no tiene tipo, invita a elegirlo.
 */

export type EtapaGuia = "inversiones" | "personal" | "costosDirectos" | "gastos";

const TITULO: Record<EtapaGuia, string> = {
  inversiones: "Qué suele invertir un proyecto de este tipo",
  personal: "Qué personal suele necesitar",
  costosDirectos: "Qué costos directos suele tener",
  gastos: "Qué gastos administrativos y comerciales suele tener",
};

function lista(guia: GuiaTipo, etapa: EtapaGuia): string[] {
  return etapa === "inversiones"
    ? guia.inversiones
    : etapa === "personal"
      ? guia.personal
      : etapa === "costosDirectos"
        ? guia.costosDirectos
        : guia.gastos;
}

export default function GuiaTipoNegocio({ etapa }: { etapa: EtapaGuia }) {
  const tipo = useProyectoStore((s) => s.proyecto?.tipoNegocio);
  const [abierta, setAbierta] = useState(true);
  const guia = tipo ? (GUIA_POR_TIPO as Record<string, GuiaTipo>)[tipo] : undefined;

  if (!guia) {
    return (
      <div className="rounded-md border border-dashed border-border bg-secondary/20 p-3 text-xs text-muted-foreground">
        <Lightbulb className="mr-1 inline h-3.5 w-3.5" />
        Elige el <strong>tipo de negocio</strong> en el Paso 1 y aquí verás qué suele llevar un
        proyecto de tu rubro.
      </div>
    );
  }

  const items = lista(guia, etapa);

  return (
    <div className="rounded-md border border-sky-300 bg-sky-50/60 p-3 text-xs dark:border-sky-800 dark:bg-sky-950/30">
      <button
        type="button"
        onClick={() => setAbierta((v) => !v)}
        className="flex w-full items-center gap-1.5 text-left font-semibold text-sky-900 dark:text-sky-100"
      >
        {abierta ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
        <Lightbulb className="h-3.5 w-3.5" />
        Guía para {guia.titulo.toLowerCase()}: {TITULO[etapa].toLowerCase()}
      </button>
      {abierta && (
        <div className="mt-2 space-y-2 text-sky-950/90 dark:text-sky-100/90">
          {items.length > 0 ? (
            <ul className="list-disc space-y-0.5 pl-5">
              {items.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          ) : (
            <p>En este tipo de proyecto esta etapa casi no tiene líneas propias.</p>
          )}
          {etapa === "inversiones" && (
            <p
              className={
                guia.terreno === "raro"
                  ? "rounded border border-amber-300 bg-amber-50 p-2 text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100"
                  : ""
              }
            >
              <strong>Terreno:</strong> {guia.notaTerreno}
            </p>
          )}
          {guia.cuidado.length > 0 && (
            <p className="text-[11px] text-sky-900/80 dark:text-sky-100/70">
              <strong>Ojo:</strong> {guia.cuidado.join(" · ")}
            </p>
          )}
          <p className="text-[10px] text-muted-foreground">
            Guía del equipo, no un dato auditado: contrástala con alguien del rubro.
          </p>
        </div>
      )}
    </div>
  );
}

export type { CategoriaPlantilla };
