interface Props {
  /**
   * 'publico' — visible en login/registro (un poco más prominente, centrado).
   * 'sutil'   — visible dentro del app logueado (chico, gris, al pie del sidebar).
   */
  variante?: "publico" | "sutil";
}

export default function CreditoAutor({ variante = "publico" }: Props) {
  const anio = new Date().getFullYear();
  if (variante === "sutil") {
    return (
      <p className="text-center text-[10px] leading-tight text-muted-foreground/60">
        Diseñado por
        <br />
        <span className="font-medium text-muted-foreground/80">
          Ronald Martínez Jimenes
        </span>
      </p>
    );
  }

  return (
    <p className="mt-5 text-center text-[11px] text-muted-foreground/70">
      Diseñado por{" "}
      <span className="font-medium text-foreground/80">
        Ronald Martínez Jimenes
      </span>
      {" · "}
      <span className="text-muted-foreground/60">© {anio}</span>
    </p>
  );
}
