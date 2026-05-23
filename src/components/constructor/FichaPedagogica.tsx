import { Lightbulb } from "lucide-react";

interface Props {
  titulo: string;
  contenido: string | React.ReactNode;
}

export default function FichaPedagogica({ titulo, contenido }: Props) {
  return (
    <aside className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200">
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
        <Lightbulb className="h-4 w-4" />
        <span>Ficha pedagógica · {titulo}</span>
      </div>
      <div className="text-xs leading-relaxed">{contenido}</div>
    </aside>
  );
}
