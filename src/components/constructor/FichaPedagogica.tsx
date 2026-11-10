import { Lightbulb } from "lucide-react";

interface Props {
  titulo: string;
  contenido: string | React.ReactNode;
}

export default function FichaPedagogica({ titulo, contenido }: Props) {
  return (
    <aside className="rounded-xl border border-amber-300/60 bg-amber-50/70 p-4 text-amber-950 shadow-sm dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
      <div className="mb-2 flex items-center gap-2 font-display text-sm font-bold text-amber-900 dark:text-amber-200">
        <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <span>Ficha pedagógica · {titulo}</span>
      </div>
      <div className="text-xs leading-relaxed opacity-90">{contenido}</div>
    </aside>
  );
}
