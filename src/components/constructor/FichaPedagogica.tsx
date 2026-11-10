import { useState } from "react";
import { Lightbulb, ChevronDown } from "lucide-react";

interface Props {
  titulo: string;
  contenido: string | React.ReactNode;
}

export default function FichaPedagogica({ titulo, contenido }: Props) {
  const [colapsado, setColapsado] = useState(false);

  return (
    <aside className="overflow-hidden rounded-xl border border-border bg-card p-4 shadow-2xs transition-all">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-display text-sm font-bold text-foreground">
          <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Lightbulb className="h-3.5 w-3.5" />
          </div>
          <span>Concepto clave · {titulo}</span>
        </div>
        <button
          type="button"
          onClick={() => setColapsado((v) => !v)}
          className="rounded p-1 text-muted-foreground hover:text-foreground lg:hidden"
          aria-label={colapsado ? "Expandir" : "Colapsar"}
        >
          <ChevronDown className={`h-4 w-4 transition-transform ${colapsado ? "-rotate-90" : ""}`} />
        </button>
      </div>
      {!colapsado && (
        <div className="mt-2.5 text-xs leading-relaxed text-muted-foreground">
          {contenido}
        </div>
      )}
    </aside>
  );
}
