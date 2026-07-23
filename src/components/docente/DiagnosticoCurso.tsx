import { useEffect, useState } from "react";
import { AlertTriangle, Loader2, XCircle } from "lucide-react";
import { listarProyectosDelCurso } from "@/lib/proyecto-supabase";
import {
  resumirDiagnosticoCurso,
  type ResumenCurso,
} from "@/lib/diagnostico-pedagogico";
import { cn } from "@/lib/utils";

/**
 * Panel "dónde se traban todos": corre el diagnóstico sobre todos los
 * proyectos del curso y muestra los problemas más frecuentes. Le dice al
 * docente QUÉ reforzar en clase, no solo quién va mal.
 */
export default function DiagnosticoCurso({ cursoId }: { cursoId: string }) {
  const [resumen, setResumen] = useState<ResumenCurso | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let vivo = true;
    setCargando(true);
    setError(null);
    listarProyectosDelCurso(cursoId)
      .then((proyectos) => {
        if (!vivo) return;
        setResumen(resumirDiagnosticoCurso(proyectos));
      })
      .catch((e) => {
        if (!vivo) return;
        setError(e instanceof Error ? e.message : "No se pudo cargar el diagnóstico.");
      })
      .finally(() => {
        if (vivo) setCargando(false);
      });
    return () => {
      vivo = false;
    };
  }, [cursoId]);

  if (cargando) {
    return (
      <div className="flex items-center justify-center gap-2 py-6 text-xs text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
        Analizando proyectos del curso…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-xs text-destructive">
        {error}
      </div>
    );
  }

  if (!resumen || resumen.totalProyectos === 0) {
    return (
      <div className="rounded-md border border-dashed border-border bg-secondary/30 p-4 text-center text-xs text-muted-foreground">
        Todavía no hay proyectos de alumnos en este curso para analizar.
      </div>
    );
  }

  const { totalProyectos, saludables, patrones } = resumen;
  const pctSaludables = Math.round((saludables / totalProyectos) * 100);

  return (
    <div className="space-y-3">
      <div className="rounded-md border border-border bg-card p-3">
        <div className="text-sm font-semibold">Salud del curso</div>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          Sobre <strong>{totalProyectos}</strong> proyecto
          {totalProyectos === 1 ? "" : "s"} analizado{totalProyectos === 1 ? "" : "s"},{" "}
          <strong>{saludables}</strong> ({pctSaludables}%) no tienen problemas detectados.
        </p>
        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full bg-emerald-500"
            style={{ width: `${pctSaludables}%` }}
          />
        </div>
      </div>

      {patrones.length === 0 ? (
        <div className="rounded-md border border-emerald-300 bg-emerald-50 p-4 text-center text-xs text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200">
          Ningún problema frecuente. El curso viene bien.
        </div>
      ) : (
        <div className="space-y-2">
          <div className="text-[11px] font-medium text-muted-foreground">
            Problemas más frecuentes (ordenados por cuántos alumnos los tienen):
          </div>
          {patrones.map((p) => {
            const esCritico = p.severidad === "critico";
            const Icono = esCritico ? XCircle : AlertTriangle;
            return (
              <div
                key={p.id}
                className={cn(
                  "rounded-md border p-2.5",
                  esCritico
                    ? "border-rose-300 bg-rose-50 dark:border-rose-800 dark:bg-rose-950/30"
                    : "border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30"
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Icono
                      className={cn(
                        "h-4 w-4 flex-shrink-0",
                        esCritico
                          ? "text-rose-600 dark:text-rose-400"
                          : "text-amber-600 dark:text-amber-400"
                      )}
                    />
                    <span className="text-[13px] font-semibold">{p.titulo}</span>
                    {p.etapa != null && (
                      <span className="rounded bg-background/70 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        Etapa {p.etapa}
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">{p.porcentaje}%</div>
                    <div className="text-[10px] text-muted-foreground">
                      {p.cuenta}/{totalProyectos}
                    </div>
                  </div>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-background/60">
                  <div
                    className={cn(
                      "h-full",
                      esCritico ? "bg-rose-500" : "bg-amber-500"
                    )}
                    style={{ width: `${p.porcentaje}%` }}
                  />
                </div>
              </div>
            );
          })}
          <p className="text-[10px] text-muted-foreground">
            Tip: si un problema lo tiene gran parte del curso, conviene
            explicarlo en clase en vez de corregirlo uno por uno.
          </p>
        </div>
      )}
    </div>
  );
}
