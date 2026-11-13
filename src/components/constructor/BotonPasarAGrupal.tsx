import { useState } from "react";
import { Loader2, Users } from "lucide-react";
import type { Proyecto } from "@/types/proyecto";
import { buscarCasoDelGrupo, pasarCasoAGrupo } from "@/lib/caso-grupal";

/**
 * "Pasar a caso grupal": copia este caso individual al proyecto del grupo del
 * estudiante, para que el grupo no vuelva a anotar los datos. No modifica el
 * caso individual.
 */
export default function BotonPasarAGrupal({ proyecto }: { proyecto: Proyecto }) {
  const [paso, setPaso] = useState<"cerrado" | "buscando" | "confirmar" | "copiando" | "listo">(
    "cerrado"
  );
  const [destino, setDestino] = useState<Proyecto | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);

  // Solo casos individuales de un curso (los grupos son por curso).
  const esIndividual = proyecto.tipo !== "proyecto_grupal" && !proyecto.grupo_id;
  if (!esIndividual || !proyecto.curso_id || proyecto.esSemanaE) return null;

  const abrir = async () => {
    setMensaje(null);
    setPaso("buscando");
    try {
      const grupal = await buscarCasoDelGrupo(proyecto);
      if (!grupal) {
        setMensaje(
          "Todavía no estás en un grupo de este curso. Crea o únete a un grupo en la pestaña Grupos y vuelve a intentar."
        );
        setPaso("cerrado");
        return;
      }
      setDestino(grupal);
      setPaso("confirmar");
    } catch (e: any) {
      setMensaje(e?.message ?? "No pudimos buscar tu grupo.");
      setPaso("cerrado");
    }
  };

  const confirmar = async () => {
    if (!destino) return;
    setPaso("copiando");
    try {
      await pasarCasoAGrupo(proyecto, destino);
      setMensaje("Listo. Tu grupo ya tiene una copia de este caso. Tu caso individual no cambió.");
      setPaso("listo");
    } catch (e: any) {
      setMensaje(e?.message ?? "No pudimos copiar el caso al grupo.");
      setPaso("cerrado");
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      {(paso === "cerrado" || paso === "buscando" || paso === "listo") && (
        <button
          type="button"
          onClick={abrir}
          disabled={paso === "buscando"}
          className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-border bg-card px-2.5 py-1.5 text-[11px] font-semibold text-foreground transition hover:bg-accent disabled:opacity-60"
        >
          {paso === "buscando" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Users className="h-3.5 w-3.5 text-emerald-600" />
          )}
          Pasar a caso grupal
        </button>
      )}
      {(paso === "confirmar" || paso === "copiando") && destino && (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-2.5 text-[11px] leading-snug">
          <p>
            Se copiarán los datos de este caso a <strong>{destino.nombre}</strong> y se reemplazará lo que el
            grupo tenga ahí ahora. Tu caso individual no cambia.
          </p>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={confirmar}
              disabled={paso === "copiando"}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-2.5 py-1 font-semibold text-primary-foreground disabled:opacity-60"
            >
              {paso === "copiando" && <Loader2 className="h-3 w-3 animate-spin" />}
              Copiar al grupo
            </button>
            <button
              type="button"
              onClick={() => setPaso("cerrado")}
              disabled={paso === "copiando"}
              className="rounded-md border border-border px-2.5 py-1 hover:bg-secondary disabled:opacity-60"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
      {mensaje && <p className="text-[11px] text-muted-foreground">{mensaje}</p>}
    </div>
  );
}
