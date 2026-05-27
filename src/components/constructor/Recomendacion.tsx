import type { ReactNode } from "react";

/**
 * Caja de recomendación / buenas prácticas, colapsable (cerrada por defecto)
 * para no ensuciar la vista. Reutilizable en cualquier etapa del constructor.
 */
export default function Recomendacion({
  titulo = "💡 ¿De dónde saco estos números? — buenas prácticas",
  children,
}: {
  titulo?: string;
  children: ReactNode;
}) {
  return (
    <details className="rounded-md border border-sky-300 bg-sky-50/60 dark:border-sky-800 dark:bg-sky-950/20">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 p-2.5 text-xs font-semibold text-sky-900 hover:bg-sky-100/60 dark:text-sky-200 dark:hover:bg-sky-900/30">
        <span>{titulo}</span>
        <span className="flex-shrink-0 text-[10px] font-normal opacity-70">▸ ver / ▾ ocultar</span>
      </summary>
      <div className="space-y-2 border-t border-sky-200 p-3 text-[11px] leading-relaxed text-foreground/90 dark:border-sky-900">
        {children}
      </div>
    </details>
  );
}
