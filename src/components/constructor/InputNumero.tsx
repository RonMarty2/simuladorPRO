import { useEffect, useState } from "react";

type Props = {
  value: number;
  onChange: (n: number) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type">;

/**
 * Input numérico con mejor UX:
 *  - Al enfocar una celda en 0, el 0 desaparece para escribir directo.
 *  - Si sales sin escribir nada, vuelve a 0.
 *  - Si tiene un valor distinto de 0, lo selecciona al enfocar (se reemplaza al escribir).
 * Reenvía cualquier prop extra (className, step, min, data-col, onKeyDown…).
 */
export default function InputNumero({ value, onChange, ...rest }: Props) {
  const [txt, setTxt] = useState(String(value));
  const [enfocado, setEnfocado] = useState(false);

  // Sincroniza con el valor externo mientras no se está editando.
  useEffect(() => {
    if (!enfocado) setTxt(String(value));
  }, [value, enfocado]);

  return (
    <input
      {...rest}
      type="number"
      value={txt}
      onFocus={(e) => {
        setEnfocado(true);
        if (Number(txt) === 0) setTxt("");
        else e.currentTarget.select();
      }}
      onChange={(e) => {
        setTxt(e.target.value);
        onChange(Number(e.target.value) || 0);
      }}
      onBlur={() => {
        setEnfocado(false);
        if (txt.trim() === "") {
          setTxt("0");
          onChange(0);
        } else {
          setTxt(String(Number(txt)));
        }
      }}
    />
  );
}
