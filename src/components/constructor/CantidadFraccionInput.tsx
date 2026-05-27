import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

/**
 * Parsea un texto como "3/12", "0.25", "2", "1.5/4" y devuelve el decimal.
 * Retorna null si el texto está incompleto o es inválido.
 */
export function parsearFraccion(texto: string): number | null {
  const t = texto.trim();
  if (t === "") return 0;
  if (t.includes("/")) {
    const partes = t.split("/");
    if (partes.length !== 2) return null;
    const num = parseFloat(partes[0]);
    const den = parseFloat(partes[1]);
    if (Number.isNaN(num) || Number.isNaN(den) || den === 0) return null;
    return num / den;
  }
  const n = parseFloat(t);
  return Number.isNaN(n) ? null : n;
}

/**
 * Input que acepta decimales O fracciones.
 * Si el usuario escribe "3/12", lo muestra tal cual + chip "= 0.25" abajo.
 * El valor numérico se guarda como decimal en el store.
 */
export default function CantidadFraccionInput({
  valorInicial,
  onChange,
  className,
  placeholder = "0 o 3/12",
}: {
  valorInicial: number;
  onChange: (n: number) => void;
  className?: string;
  placeholder?: string;
}) {
  const [texto, setTexto] = useState<string>(() =>
    valorInicial === 0 ? "" : formatearNumero(valorInicial)
  );

  // Si el item cambia desde afuera (otra acción), resync
  useEffect(() => {
    // Solo si la representación actual no parsea al valor del store
    const parseado = parsearFraccion(texto);
    if (parseado === null || Math.abs(parseado - valorInicial) > 0.0001) {
      setTexto(valorInicial === 0 ? "" : formatearNumero(valorInicial));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valorInicial]);

  const handleChange = (v: string) => {
    setTexto(v);
    const parsed = parsearFraccion(v);
    if (parsed !== null) onChange(parsed);
  };

  const esFraccion = texto.includes("/");
  const parsed = parsearFraccion(texto);
  const mostrarDecimal = esFraccion && parsed !== null;
  const hayError = texto.trim() !== "" && parsed === null;

  return (
    <div>
      <input
        type="text"
        value={texto}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={(e) => e.currentTarget.select()}
        placeholder={placeholder}
        className={cn(
          className,
          hayError && "border-destructive ring-1 ring-destructive/30"
        )}
        title="Puedes escribir un número (0.25) o una fracción (3/12)"
      />
      {mostrarDecimal && (
        <div className="mt-0.5 text-right text-[9px] font-semibold leading-none text-emerald-700 dark:text-emerald-300">
          = {parsed!.toFixed(4)}
        </div>
      )}
      {hayError && (
        <div className="mt-0.5 text-right text-[9px] font-semibold leading-none text-destructive">
          inválido
        </div>
      )}
    </div>
  );
}

function formatearNumero(n: number): string {
  // Quitar ceros innecesarios: 0.250000 → 0.25, 5.0 → 5
  return Number(n.toFixed(6)).toString();
}
