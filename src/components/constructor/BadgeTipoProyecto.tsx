import { cn } from "@/lib/utils";
import type { TipoProyecto } from "@/types/proyecto";

/**
 * Badge claro que identifica el tipo de proyecto (Caso del curso, Individual,
 * Grupal, Plantilla del docente). Color + ícono + etiqueta consistentes en
 * toda la app — para que el estudiante sepa de un vistazo a qué sección
 * pertenece cada proyecto en su panel y en el selector.
 */
const CFG: Record<
  string,
  { label: string; icono: string; clase: string; banner: string }
> = {
  entrega_estudiante: {
    label: "Caso del curso",
    icono: "🎓",
    clase:
      "bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-200 dark:border-emerald-700",
    banner:
      "bg-emerald-50 text-emerald-900 border-l-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-100",
  },
  caso_curso: {
    label: "Plantilla del docente",
    icono: "📚",
    clase:
      "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-900/40 dark:text-amber-200 dark:border-amber-700",
    banner:
      "bg-amber-50 text-amber-900 border-l-amber-500 dark:bg-amber-950/40 dark:text-amber-100",
  },
  proyecto_grupal: {
    label: "Grupal",
    icono: "🤝",
    clase:
      "bg-violet-100 text-violet-900 border-violet-300 dark:bg-violet-900/40 dark:text-violet-200 dark:border-violet-700",
    banner:
      "bg-violet-50 text-violet-900 border-l-violet-500 dark:bg-violet-950/40 dark:text-violet-100",
  },
  libre: {
    label: "Individual",
    icono: "📁",
    clase:
      "bg-sky-100 text-sky-900 border-sky-300 dark:bg-sky-900/40 dark:text-sky-200 dark:border-sky-700",
    banner:
      "bg-sky-50 text-sky-900 border-l-sky-500 dark:bg-sky-950/40 dark:text-sky-100",
  },
};

/**
 * Banner ancho del tipo de proyecto — ubicado entre el selector y la barra de
 * progreso del constructor. Acento de color a la izquierda + emoji grande +
 * etiqueta en mayúsculas. Pensado para que el estudiante sepa de un vistazo a
 * qué tipo pertenece el proyecto que está editando.
 */
export function BannerTipoProyecto({
  tipo,
  className,
}: {
  tipo?: TipoProyecto | null;
  className?: string;
}) {
  const c = CFG[tipo ?? "libre"] ?? CFG.libre;
  return (
    <div
      className={cn(
        "flex w-full items-center gap-3 rounded-lg border border-border border-l-4 px-4 py-2.5",
        c.banner,
        className
      )}
      title={c.label}
    >
      <span className="text-xl" aria-hidden>
        {c.icono}
      </span>
      <span className="text-sm font-bold uppercase tracking-wider">{c.label}</span>
    </div>
  );
}

export default function BadgeTipoProyecto({
  tipo,
  tamaño = "md",
  className,
}: {
  tipo?: TipoProyecto | null;
  tamaño?: "sm" | "md" | "lg";
  className?: string;
}) {
  const c = CFG[tipo ?? "libre"] ?? CFG.libre;
  const sizeCls =
    tamaño === "sm"
      ? "px-1.5 py-0.5 text-[9px] gap-1"
      : tamaño === "lg"
        ? "px-3 py-1 text-xs gap-1.5"
        : "px-2 py-0.5 text-[10px] gap-1";
  return (
    <span
      className={cn(
        "inline-flex flex-shrink-0 items-center rounded-md border font-bold uppercase tracking-wider",
        sizeCls,
        c.clase,
        className
      )}
      title={c.label}
    >
      <span aria-hidden className={tamaño === "lg" ? "text-sm" : undefined}>
        {c.icono}
      </span>
      <span>{c.label}</span>
    </span>
  );
}
