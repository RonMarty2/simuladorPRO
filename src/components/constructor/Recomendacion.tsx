import type { ReactNode } from "react";

/**
 * Caja de recomendación / buenas prácticas, colapsable (cerrada por defecto)
 * para no ensuciar la vista. Reutilizable en cualquier etapa del constructor.
 */
export default function Recomendacion({
  titulo = "¿De dónde saco estos números? — buenas prácticas",
  children,
}: {
  titulo?: string;
  children: ReactNode;
}) {
  return (
    <details className="group rounded-xl border border-border bg-accent/35 transition-all">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 p-3 text-xs font-semibold text-foreground hover:bg-accent/60">
        <span>{titulo}</span>
        <span className="flex-shrink-0 text-[11px] font-medium text-muted-foreground group-open:hidden">▸ ver guía</span>
        <span className="hidden flex-shrink-0 text-[11px] font-medium text-muted-foreground group-open:inline">▾ ocultar</span>
      </summary>
      <div className="space-y-2 border-t border-border/70 p-3.5 text-xs leading-relaxed text-foreground/90">
        {children}
      </div>
    </details>
  );
}
