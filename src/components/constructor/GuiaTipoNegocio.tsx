import { useState } from "react";
import { ChevronDown, ChevronRight, Lightbulb } from "lucide-react";
import { useProyectoStore } from "@/stores/proyecto-store";
import { GUIA_POR_TIPO } from "@/lib/guia-por-tipo";
import { GUIA_EXTRA_POR_TIPO, type GuiaTipoExtra } from "@/lib/guia-extra-por-tipo";
import type { GuiaTipo } from "@/lib/guia-por-tipo";
import type { CategoriaPlantilla } from "@/lib/plantillas";

/**
 * Guía del tipo de negocio dentro de cada etapa del constructor: qué suele llevar
 * un proyecto de ese rubro. Si el proyecto no tiene tipo, invita a elegirlo.
 */

export type EtapaGuia = "inversiones" | "personal" | "costosDirectos" | "gastos" | "proyeccion" | "capital" | "financiamiento";

const TITULO: Record<EtapaGuia, string> = {
  inversiones: "Qué suele invertir un proyecto de este tipo",
  personal: "Qué personal suele necesitar",
  costosDirectos: "Qué costos directos suele tener",
  gastos: "Qué gastos administrativos y comerciales suele tener",
  proyeccion: "Cómo conviene proyectar la demanda",
  capital: "Qué inmoviliza tu capital de trabajo",
  financiamiento: "Cómo suele financiarse",
};

function lista(guia: GuiaTipo, etapa: EtapaGuia, tipo: string): string[] {
  if (etapa === "proyeccion" || etapa === "capital" || etapa === "financiamiento") {
    const extra = (GUIA_EXTRA_POR_TIPO as Record<string, GuiaTipoExtra>)[tipo];
    return extra ? extra[etapa] : [];
  }
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

  const items = lista(guia, etapa, tipo!);

  return (
    <div className="rounded-xl border border-border bg-accent/35 p-3.5 text-xs">
      <button
        type="button"
        onClick={() => setAbierta((v) => !v)}
        className="flex w-full items-center gap-1.5 text-left font-semibold text-foreground hover:text-primary"
      >
        {abierta ? <ChevronDown className="h-3.5 w-3.5 text-primary" /> : <ChevronRight className="h-3.5 w-3.5 text-primary" />}
        <Lightbulb className="h-3.5 w-3.5 text-primary" />
        Guía de referencia para {guia.titulo}: {TITULO[etapa].toLowerCase()}
      </button>
      {abierta && (
        <div className="mt-2.5 space-y-2 text-foreground/90">
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
                  ? "rounded-lg border border-amber-300/80 bg-amber-50/60 p-2 text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200"
                  : ""
              }
            >
              <strong>Terreno:</strong> {guia.notaTerreno}
            </p>
          )}
          {guia.cuidado.length > 0 && (
            <p className="text-[11px] text-muted-foreground">
              <strong className="text-foreground">Ojo:</strong> {guia.cuidado.join(" · ")}
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
