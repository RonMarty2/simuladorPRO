import { useState } from "react";
import { CheckCircle2, ChevronDown, ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Curso } from "@/lib/cursos-supabase";

/**
 * Banner que aparece en el panel del estudiante cuando el curso es "Semana E".
 * Tres objetivos:
 *  1) Dejar EN CLARO que es un evento, no un curso normal.
 *  2) Quitar miedo a las notas — explicar que no se califica.
 *  3) Darle 5 pasos cortos para que el alumno sepa qué hacer.
 *
 * Es visible siempre arriba del bloque del curso. Colapsa los pasos para no
 * ocupar pantalla después de la primera lectura.
 */
export default function BannerSemanaE({ curso }: { curso: Curso }) {
  const [pasosAbiertos, setPasosAbiertos] = useState(true);

  return (
    <div className="mb-4 overflow-hidden rounded-xl border border-primary/25 bg-card shadow-sm">
      <div className="bg-accent/30 p-4">
        <div className="flex items-center gap-2 font-display text-base font-bold text-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          Semana E · {curso.nombre}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Bienvenida/o al evento. Aquí vas a <strong className="text-foreground">armar tu proyecto, simularlo y ver si es
          viable</strong>. No hay notas ni calificaciones: el objetivo es que aprendas experimentando con números y supuestos reales.
        </p>
      </div>

      <button
        onClick={() => setPasosAbiertos((v) => !v)}
        className="flex w-full items-center gap-1.5 border-t border-border bg-accent/50 px-4 py-2.5 text-left text-xs font-semibold text-foreground transition-colors hover:bg-accent"
      >
        {pasosAbiertos ? <ChevronDown className="h-3.5 w-3.5 text-primary" /> : <ChevronRight className="h-3.5 w-3.5 text-primary" />}
        Qué hacer · 5 pasos para terminar el evento
      </button>

      {pasosAbiertos && (
        <ol className="space-y-2 border-t border-border px-4 py-3.5 text-xs">
          <PasoChecklist
            n={1}
            titulo="Únete o crea tu grupo"
            detalle="Baja hasta “Forma tu equipo”. Puedes crear uno y compartir su código, o buscar el equipo de tus compañeros por nombre o código."
          />
          <PasoChecklist
            n={2}
            titulo="Elige el nivel y arma el proyecto"
            detalle="Básico tiene 5 etapas, Medio 7 y Avanzado 9. Elijan según su experiencia y el tiempo disponible; todo el equipo seguirá la misma ruta."
          />
          <PasoChecklist
            n={3}
            titulo="Mira los indicadores (VAN, TIR y recuperación)"
            detalle="En el Paso 9 (Resumen) ves si tu proyecto da plata. VAN > 0 + TIR > WACC = viable. Si no da, vuelve y ajusta precios o costos."
          />
          <PasoChecklist
            n={4}
            titulo="Prueba cambios en los supuestos"
            detalle="Vuelve a precios, demanda o costos y prueba: '¿qué pasa si la harina sube 20%?' o '¿si vendo menos?'. Después compara nuevamente los indicadores."
          />
          <PasoChecklist
            n={5}
            titulo="Cierra el análisis con tu equipo"
            detalle="Revisen juntos el Resumen, expliquen qué cambiarían para mejorar la viabilidad y comparen el resultado con otro grupo."
          />
          <div className="mt-2 rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-foreground">
            <strong className="text-primary">Meta del evento</strong>: terminar los 5 pasos. Si te trabas, pregúntale
            a tu docente o intercambia con otro grupo. Enfocado en el aprendizaje práctico.
          </div>
        </ol>
      )}
    </div>
  );
}

function PasoChecklist({ n, titulo, detalle }: { n: number; titulo: string; detalle: string }) {
  return (
    <li className={cn("flex gap-2.5")}>
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <div className="min-w-0">
        <div className="font-semibold text-foreground">
          {n}. {titulo}
        </div>
        <div className="text-xs text-muted-foreground">{detalle}</div>
      </div>
    </li>
  );
}
