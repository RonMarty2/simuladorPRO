import { Construction } from "lucide-react";

interface Props {
  numero: number;
  titulo: string;
  descripcion: string;
}

export default function PasoPlaceholder({ numero, titulo, descripcion }: Props) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-card/50 p-12 text-center">
      <Construction className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
      <h2 className="text-base font-semibold tracking-tight">
        Paso {numero} · {titulo}
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{descripcion}</p>
      <p className="mt-3 text-xs text-muted-foreground">
        Esta pantalla se construirá en una próxima iteración del simulador.
      </p>
    </div>
  );
}
