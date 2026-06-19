import { useEffect, useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Loader2,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import {
  listarMisEntregas,
  obtenerPromedioEstudiante,
} from "@/lib/proyecto-supabase";
import { listarMisInscripciones, type Curso } from "@/lib/cursos-supabase";
import type { Entrega, PromedioEstudiante } from "@/types/proyecto";
import { formatearBolivianos, cn } from "@/lib/utils";
import { marcarEntregasComoVistas } from "@/components/layout/BadgeRevisionesNuevas";

export default function MisEntregas() {
  const user = useAuthStore((s) => s.user);
  const [entregas, setEntregas] = useState<Entrega[]>([]);
  const [cursos, setCursos] = useState<Record<string, Curso>>({});
  const [promedios, setPromedios] = useState<Record<string, PromedioEstudiante | null>>({});
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const [todasEntregas, inscripciones] = await Promise.all([
          listarMisEntregas(user.id),
          listarMisInscripciones(user.id),
        ]);
        setEntregas(todasEntregas);

        // Marcar como vistas todas las entregas ya revisadas: cuando el
        // estudiante abre esta pantalla, leyó (o tiene la oportunidad de leer)
        // los comentarios y notas de cada una.
        const idsRevisadas = todasEntregas
          .filter((e) => e.estado === "aprobada" || e.estado === "reprobada")
          .map((e) => e.id);
        marcarEntregasComoVistas(user.id, idsRevisadas);

        const mapCursos: Record<string, Curso> = {};
        inscripciones.forEach((i) => {
          mapCursos[i.curso.id] = i.curso;
        });
        setCursos(mapCursos);

        // Cargar promedio por curso EN PARALELO (antes era un loop secuencial
        // = N round-trips; ahora todos a la vez).
        const cursoIds = Object.keys(mapCursos);
        const resultados = await Promise.all(
          cursoIds.map((cursoId) => obtenerPromedioEstudiante(user.id, cursoId))
        );
        const mapPromedios: Record<string, PromedioEstudiante | null> = {};
        cursoIds.forEach((cursoId, i) => {
          mapPromedios[cursoId] = resultados[i];
        });
        setPromedios(mapPromedios);
      } finally {
        setCargando(false);
      }
    })();
  }, [user]);

  if (cargando) {
    return (
      <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Cargando tus entregas…
      </div>
    );
  }

  if (entregas.length === 0) {
    return (
      <div className="mx-auto max-w-md rounded-lg border border-dashed border-border bg-card p-8 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-md bg-secondary">
          📭
        </div>
        <h2 className="text-base font-semibold">Sin entregas aún</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Cuando completes un caso del curso y lo entregues para revisión, aparecerá acá
          su historial.
        </p>
      </div>
    );
  }

  // Agrupar por curso
  const porCurso = new Map<string, Entrega[]>();
  entregas.forEach((e) => {
    if (!porCurso.has(e.curso_id)) porCurso.set(e.curso_id, []);
    porCurso.get(e.curso_id)!.push(e);
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">📝 Mis entregas</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Historial completo de las entregas que hiciste para revisión de tus docentes.
        </p>
      </div>

      {Array.from(porCurso.entries()).map(([cursoId, entregasCurso]) => {
        const curso = cursos[cursoId];
        const promedio = promedios[cursoId];
        return (
          <div key={cursoId} className="space-y-3 rounded-lg border border-border bg-card p-4">
            {/* Header del curso */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">
                  {curso?.nombre ?? `Curso ${cursoId.slice(0, 6)}`}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {curso?.materia ?? ""}
                  {curso?.paralelo ? ` · ${curso.paralelo}` : ""}
                </div>
              </div>

              {/* Card de promedio */}
              {promedio && promedio.entregas_revisadas > 0 && (
                <div className="rounded-md border-2 border-primary bg-primary/10 px-3 py-2 text-center">
                  <div className="flex items-center justify-center gap-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                    <TrendingUp className="h-3 w-3" />
                    Promedio
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    {promedio.promedio_nota ?? "—"}
                  </div>
                  <div className="text-[9px] text-muted-foreground">
                    sobre {promedio.entregas_revisadas} entrega
                    {promedio.entregas_revisadas !== 1 ? "s" : ""}
                  </div>
                </div>
              )}
            </div>

            {/* Lista de entregas — ordenadas por etapa ascendente, y dentro
                de cada etapa por intento más reciente primero. Así el alumno
                ve "Etapa 1, Etapa 2, Etapa 3..." en orden, no mezcladas por
                fecha. */}
            <div className="space-y-1.5">
              {[...entregasCurso]
                .sort((a, b) => {
                  const pa = a.paso_entregado ?? 999;
                  const pb = b.paso_entregado ?? 999;
                  if (pa !== pb) return pa - pb;
                  return b.numero_intento - a.numero_intento;
                })
                .map((e) => (
                <TarjetaEntrega key={e.id} entrega={e} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TarjetaEntrega({ entrega }: { entrega: Entrega }) {
  const [abierto, setAbierto] = useState(false);

  const colorChip =
    entrega.estado === "aprobada"
      ? "border-emerald-400 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100"
      : entrega.estado === "reprobada"
      ? "border-rose-400 bg-rose-50 text-rose-900 dark:bg-rose-950/30 dark:text-rose-100"
      : "border-amber-400 bg-amber-50 text-amber-900 dark:bg-amber-950/30 dark:text-amber-100";

  const Icono =
    entrega.estado === "aprobada"
      ? CheckCircle2
      : entrega.estado === "reprobada"
      ? XCircle
      : Clock;

  return (
    <div className={cn("rounded-md border", colorChip)}>
      <button
        onClick={() => setAbierto((v) => !v)}
        className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-white/30 dark:hover:bg-black/20"
      >
        {abierto ? (
          <ChevronDown className="h-3.5 w-3.5 flex-shrink-0" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
        )}
        <Icono className="h-4 w-4 flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold">
            {entrega.paso_entregado != null
              ? `Etapa ${entrega.paso_entregado} · `
              : "Proyecto entero · "}
            Intento #{entrega.numero_intento} ·{" "}
            <span className="capitalize">{entrega.estado}</span>
          </div>
          <div className="text-[10px] opacity-75">
            Entregada: {new Date(entrega.entregado_en).toLocaleString("es-BO")}
            {entrega.revisado_en &&
              ` · Revisada: ${new Date(entrega.revisado_en).toLocaleString("es-BO")}`}
          </div>
        </div>
        {entrega.nota !== null && (
          <div className="text-right">
            <div className="text-[9px] uppercase opacity-75">Nota</div>
            <div className="text-lg font-bold">{entrega.nota}/100</div>
          </div>
        )}
      </button>

      {abierto && (
        <div className="space-y-2 border-t border-current/20 px-3 py-2 text-[11px]">
          {/* Indicadores de esa entrega */}
          <div className="grid grid-cols-4 gap-2 text-center">
            <div>
              <div className="opacity-60">VAN</div>
              <div className="font-bold">
                {entrega.van !== null ? formatearBolivianos(entrega.van) : "—"}
              </div>
            </div>
            <div>
              <div className="opacity-60">TIR</div>
              <div className="font-bold">
                {entrega.tir !== null ? `${(entrega.tir * 100).toFixed(1)}%` : "—"}
              </div>
            </div>
            <div>
              <div className="opacity-60">WACC</div>
              <div className="font-bold">
                {entrega.wacc !== null ? `${(entrega.wacc * 100).toFixed(1)}%` : "—"}
              </div>
            </div>
            <div>
              <div className="opacity-60">Recuperación</div>
              <div className="font-bold">
                {entrega.payback !== null ? `${entrega.payback.toFixed(1)}a` : "—"}
              </div>
            </div>
          </div>

          {/* Sugerencia automática */}
          {entrega.sugerencia_automatica && (
            <div className="rounded bg-white/40 px-2 py-1 dark:bg-black/20">
              <strong>🤖 Sistema sugirió:</strong> {entrega.sugerencia_automatica}{" "}
              {entrega.sugerencia_nota !== null && `(${entrega.sugerencia_nota}/100)`}
              {entrega.sugerencia_razones && entrega.sugerencia_razones.length > 0 && (
                <ul className="ml-3 mt-0.5 list-disc opacity-80">
                  {entrega.sugerencia_razones.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Comentario del docente */}
          {entrega.comentario_docente && (
            <div className="rounded bg-white/60 p-2 dark:bg-black/30">
              <div className="text-[10px] font-semibold opacity-75">
                💬 Comentario del docente:
              </div>
              <div className="mt-0.5">{entrega.comentario_docente}</div>
            </div>
          )}

          {entrega.estado === "pendiente" && (
            <div className="italic opacity-75">Esperando revisión del docente…</div>
          )}
        </div>
      )}
    </div>
  );
}
