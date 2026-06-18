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
    <div className="mb-3 overflow-hidden rounded-lg border-2 border-fuchsia-300 bg-gradient-to-br from-fuchsia-50 via-violet-50 to-sky-50 dark:border-fuchsia-900 dark:from-fuchsia-950/30 dark:via-violet-950/30 dark:to-sky-950/30">
      <div className="px-4 pt-3">
        <div className="flex items-center gap-2 text-base font-extrabold tracking-tight text-fuchsia-900 dark:text-fuchsia-200">
          <Sparkles className="h-5 w-5" />
          🎓 Semana E · {curso.nombre}
        </div>
        <p className="mt-1 text-xs text-fuchsia-900/80 dark:text-fuchsia-200/80">
          Bienvenida/o al evento. Acá vas a <strong>armar tu proyecto, simularlo y ver si es
          viable</strong>. No hay notas, no hay calificaciones — el objetivo es que aprendas
          jugando con los números reales.
        </p>
      </div>

      <button
        onClick={() => setPasosAbiertos((v) => !v)}
        className="mt-2 flex w-full items-center gap-1.5 border-t border-fuchsia-200 bg-fuchsia-100/50 px-4 py-2 text-left text-xs font-semibold text-fuchsia-900 hover:bg-fuchsia-100 dark:border-fuchsia-900 dark:bg-fuchsia-950/40 dark:text-fuchsia-200 dark:hover:bg-fuchsia-900/40"
      >
        {pasosAbiertos ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        Qué hacer · 5 pasos para terminar el evento
      </button>

      {pasosAbiertos && (
        <ol className="space-y-1.5 border-t border-fuchsia-200 px-4 py-3 text-xs dark:border-fuchsia-900">
          <PasoChecklist
            n={1}
            titulo="Unite o creá tu grupo"
            detalle="Bajá hasta “Forma tu equipo”. Podés crear uno y compartir su código, o buscar el equipo de tus compañeros por nombre o código."
          />
          <PasoChecklist
            n={2}
            titulo="Elegí el nivel y armá el proyecto"
            detalle="Básico tiene 5 etapas, Medio 7 y Avanzado 9. Elijan según su experiencia y el tiempo disponible; todo el equipo seguirá la misma ruta."
          />
          <PasoChecklist
            n={3}
            titulo="Mirá los indicadores (VAN, TIR, Payback)"
            detalle="En el Paso 9 (Resumen) ves si tu proyecto da plata. VAN > 0 + TIR > WACC = viable. Si no da, volvé y ajustá precios o costos."
          />
          <PasoChecklist
            n={4}
            titulo="Probá escenarios (📊 menú lateral)"
            detalle="Andá al tab 'Escenarios' del menú. Mové los sliders: '¿qué pasa si la harina sube 20%?' '¿y si vendo menos?'. Eso muestra qué tan robusto es tu proyecto."
          />
          <PasoChecklist
            n={5}
            titulo="Simulá 5 años en el mercado"
            detalle="Tab 'Simular' (menú lateral). El sistema te va a tirar eventos económicos (inflación, devaluación, etc.) y vos decidís qué hacer. Llegá al año 5 sin quebrar."
          />
          <div className="mt-2 rounded-md border border-sky-200 bg-sky-50/70 p-2 text-[11px] text-sky-900 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-200">
            🎯 <strong>Meta del evento</strong>: terminar los 5 pasos. Si te trabás, pregntale
            a tu docente o intercambiá con otro grupo. NO hay nota — hay aprendizaje.
          </div>
        </ol>
      )}
    </div>
  );
}

function PasoChecklist({ n, titulo, detalle }: { n: number; titulo: string; detalle: string }) {
  return (
    <li className={cn("flex gap-2")}>
      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-fuchsia-600 dark:text-fuchsia-400" />
      <div className="min-w-0">
        <div className="font-semibold text-foreground">
          {n}. {titulo}
        </div>
        <div className="text-[11px] text-muted-foreground">{detalle}</div>
      </div>
    </li>
  );
}
