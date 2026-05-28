import { useEffect, useState } from "react";
import { Trophy, Users, Flame } from "lucide-react";
import { obtenerPodioCurso, type PodioCurso as PodioCursoData } from "@/lib/podio-supabase";
import { cn } from "@/lib/utils";

interface Props {
  cursoId: string;
  cursoNombre: string;
  /** ID del estudiante que mira el podio. null = vista docente. */
  miEstudianteId: string | null;
}

/**
 * Podio del curso — diseño épico estilo Dota 2 sobre fondo blanco del app.
 *
 * Reglas de aparición:
 *  - No mostrar nada si hay menos de 3 estudiantes calificados Y menos de 2 grupos calificados.
 *  - Si solo el individual califica, ocultar la sección grupal y viceversa.
 *  - El docente lo ve igual que el estudiante pero sin la tarjeta "tu posición".
 */
export default function PodioCurso({ cursoId, cursoNombre, miEstudianteId }: Props) {
  const [data, setData] = useState<PodioCursoData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let cancelado = false;
    setCargando(true);
    obtenerPodioCurso(cursoId, miEstudianteId)
      .then((d) => {
        if (cancelado) return;
        setData(d);
        setError(null);
      })
      .catch((e) => {
        if (cancelado) return;
        setError(e instanceof Error ? e.message : "Error al cargar el podio");
      })
      .finally(() => {
        if (!cancelado) setCargando(false);
      });
    return () => {
      cancelado = true;
    };
  }, [cursoId, miEstudianteId]);

  const mostrarIndividual = (data?.totalEstudiantesCalificados ?? 0) >= 3;
  const mostrarGrupal = (data?.totalGruposCalificados ?? 0) >= 2;

  if (cargando) {
    return (
      <div className="rounded-lg border border-border bg-card p-4 text-xs text-muted-foreground">
        Cargando podio…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-xs text-destructive">
        {error}
      </div>
    );
  }

  if (!data) return null;

  // Si NO hay suficientes datos para ninguna sección, no mostramos nada.
  if (!mostrarIndividual && !mostrarGrupal) return null;

  return (
    <div className="space-y-3">
      {/* Saludo de racha (si es estudiante con racha >= 2) */}
      {miEstudianteId && data.miRacha >= 2 && (
        <ChipRacha racha={data.miRacha} />
      )}

      {mostrarIndividual && (
        <SeccionPodio
          tipo="individual"
          cursoNombre={cursoNombre}
          top={data.topIndividuales.map((f) => ({
            nombre: `${f.nombre} ${f.apellido}`.trim(),
            iniciales: f.iniciales,
            nota: f.nota,
            sub: `${f.etapas_revisadas} etapa${f.etapas_revisadas === 1 ? "" : "s"}`,
            es_mio: false,
            tag: undefined,
          }))}
          totalCalificados={data.totalEstudiantesCalificados}
          miPosicion={data.miPosicion}
        />
      )}

      {mostrarGrupal && (
        <SeccionPodio
          tipo="grupal"
          cursoNombre={cursoNombre}
          top={data.topGrupales.map((g) => ({
            nombre: g.nombre,
            iniciales: g.iniciales,
            nota: g.nota,
            sub: `${g.integrantes} integrante${g.integrantes === 1 ? "" : "s"}`,
            es_mio: g.es_mi_grupo,
            tag: g.es_mi_grupo ? "TU GRUPO" : undefined,
          }))}
          totalCalificados={data.totalGruposCalificados}
          miGrupo={data.miGrupo}
        />
      )}
    </div>
  );
}

function ChipRacha({ racha }: { racha: number }) {
  return (
    <div className="flex items-center justify-end">
      <span className="inline-flex items-center gap-2 rounded-full border border-orange-300 bg-gradient-to-br from-orange-50 to-amber-100 px-3 py-1.5 text-[11px] font-bold tracking-wider text-orange-900">
        <span className="relative flex h-2 w-2">
          <span className="absolute inset-0 animate-ping rounded-full bg-orange-500 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-500" />
        </span>
        <Flame className="h-3.5 w-3.5 fill-orange-500 text-orange-600" />
        RACHA · {racha} ENTREGA{racha === 1 ? "" : "S"}
      </span>
    </div>
  );
}

// ============================================================================
// SECCIÓN DEL PODIO (individual o grupal)
// ============================================================================

type Puesto = {
  nombre: string;
  iniciales: string;
  nota: number;
  sub: string;
  es_mio: boolean;
  tag?: string;
};

function SeccionPodio({
  tipo,
  top,
  totalCalificados,
  miPosicion,
  miGrupo,
}: {
  tipo: "individual" | "grupal";
  cursoNombre: string;
  top: Puesto[];
  totalCalificados: number;
  miPosicion?: import("@/lib/podio-supabase").MiPosicion | null;
  miGrupo?: import("@/lib/podio-supabase").MiGrupoPosicion | null;
}) {
  const esIndividual = tipo === "individual";

  // Reordenar para mostrar: [2.°, 1.°, 3.°]
  const podioOrdenado: Array<{ puesto: 1 | 2 | 3; data: Puesto } | null> = [
    top[1] ? { puesto: 2, data: top[1] } : null,
    top[0] ? { puesto: 1, data: top[0] } : null,
    top[2] ? { puesto: 3, data: top[2] } : null,
  ];

  return (
    <section className="overflow-hidden rounded-lg border border-border bg-card">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg shadow-md",
              esIndividual
                ? "bg-gradient-to-br from-amber-400 to-orange-600 shadow-amber-500/40"
                : "bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-violet-500/40"
            )}
          >
            {esIndividual ? (
              <Trophy className="h-4 w-4 text-white" />
            ) : (
              <Users className="h-4 w-4 text-white" />
            )}
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              {esIndividual ? "Top individuales" : "Top grupos"}
            </div>
            <h3 className="text-sm font-bold leading-tight">
              {esIndividual ? "Mejores del curso" : "Mejores equipos"}
            </h3>
          </div>
        </div>
        <span className="rounded-full bg-secondary px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
          Mostrando top 3 de {totalCalificados}
        </span>
      </header>

      <div
        className={cn(
          "relative overflow-hidden px-4 pb-4 pt-14",
          esIndividual
            ? "bg-[radial-gradient(ellipse_50%_70%_at_50%_30%,rgba(251,191,36,0.16),transparent_70%)]"
            : "bg-[radial-gradient(ellipse_50%_70%_at_50%_30%,rgba(168,85,247,0.13),transparent_70%)]"
        )}
      >
        <div className="relative z-10 grid grid-cols-3 items-end gap-2 sm:gap-4">
          {podioOrdenado.map((slot, idx) => {
            if (!slot) {
              return <div key={idx} />;
            }
            return (
              <ColumnaPodio
                key={idx}
                puesto={slot.puesto}
                data={slot.data}
                animDelay={
                  slot.puesto === 1 ? 0.1 : slot.puesto === 2 ? 0.25 : 0.4
                }
              />
            );
          })}
        </div>

        {/* Base oscura del podio */}
        <div className="relative z-10 -mt-px h-2 rounded-b-md bg-gradient-to-b from-stone-700 to-stone-900 shadow-md" />

        {/* Tu posición (solo individual y solo si está logueado y tiene nota) */}
        {esIndividual && miPosicion && (
          <TuTarjetaIndividual mi={miPosicion} />
        )}

        {/* CTA grupal */}
        {!esIndividual && miGrupo && (
          <CtaGrupal mi={miGrupo} />
        )}
      </div>
    </section>
  );
}

// ============================================================================
// COLUMNA DEL PODIO (con medallón épico)
// ============================================================================

function ColumnaPodio({
  puesto,
  data,
  animDelay,
}: {
  puesto: 1 | 2 | 3;
  data: Puesto;
  animDelay: number;
}) {
  const tier =
    puesto === 1 ? "legendario" : puesto === 2 ? "epico" : "raro";

  // Altura del podio según puesto
  const alturaPodio = puesto === 1 ? 110 : puesto === 2 ? 80 : 56;

  // Color del podio (gradiente vertical)
  const colorPodio =
    puesto === 1
      ? "bg-gradient-to-b from-yellow-300 via-amber-500 to-amber-700"
      : puesto === 2
        ? "bg-gradient-to-b from-slate-100 via-slate-400 to-slate-600"
        : "bg-gradient-to-b from-orange-300 via-orange-600 to-orange-900";

  // Tag (LEGENDARIO/ÉPICO/RARO)
  const tagBg =
    puesto === 1
      ? "bg-gradient-to-br from-amber-400 to-amber-700 text-amber-950"
      : puesto === 2
        ? "bg-gradient-to-br from-slate-300 to-slate-600 text-slate-50"
        : "bg-gradient-to-br from-orange-300 to-orange-700 text-orange-950";

  const tagText = puesto === 1 ? "LEGENDARIO" : puesto === 2 ? "ÉPICO" : "RARO";

  return (
    <div
      className="flex flex-col items-center"
      style={{
        animation: `subir-epico 0.85s ${animDelay}s cubic-bezier(0.34, 1.56, 0.64, 1) backwards`,
      }}
    >
      <Medallon
        tier={tier}
        iniciales={data.iniciales}
        numero={puesto}
        tag={tagText}
        tagBg={tagBg}
      />

      {/* Tag "TU GRUPO" (opcional, va debajo del medallón) */}
      {data.tag && (
        <span className="relative z-10 -mt-1 rounded-md bg-gradient-to-r from-violet-500 to-fuchsia-500 px-2 py-0.5 text-[9px] font-extrabold tracking-wider text-white shadow-md shadow-violet-500/40">
          ★ {data.tag}
        </span>
      )}

      <div
        className={cn(
          "mt-2 max-w-full truncate text-center text-sm font-bold",
          puesto === 1
            ? "bg-gradient-to-b from-amber-700 via-amber-600 to-amber-800 bg-clip-text text-base text-transparent"
            : "text-foreground"
        )}
      >
        {data.nombre}
      </div>
      <div
        className={cn(
          "mb-2 text-[10px] font-bold uppercase tracking-widest",
          puesto === 1 ? "text-amber-700" : "text-muted-foreground"
        )}
      >
        {data.sub}
      </div>

      <div
        className={cn(
          "relative w-full overflow-hidden rounded-t-md shadow-lg",
          colorPodio
        )}
        style={{ height: `${alturaPodio}px` }}
      >
        {/* Reflejo lateral */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-black/20" />
        {/* Marco interior superior */}
        <div className="absolute inset-x-0 top-0 h-px bg-white/50" />
        <div className="absolute inset-x-0 bottom-0 h-1 bg-black/20" />

        <div className="relative z-10 flex h-full flex-col items-center justify-end pb-2.5 text-white drop-shadow">
          <span
            className={cn(
              "font-extrabold leading-none tracking-tight",
              puesto === 1 ? "text-5xl" : puesto === 2 ? "text-3xl" : "text-2xl"
            )}
            style={{ textShadow: "0 2px 6px rgba(0,0,0,0.4)" }}
          >
            {data.nota.toFixed(0)}
          </span>
          <span className="mt-1 text-[9px] font-bold uppercase tracking-[0.2em] opacity-90">
            {puesto === 1 ? "1.er puesto" : puesto === 2 ? "2.° puesto" : "3.er puesto"}
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MEDALLÓN ÉPICO (rayos + halo + alas + gema + número + tag)
// ============================================================================

function Medallon({
  tier,
  numero,
  tag,
  tagBg,
}: {
  tier: "legendario" | "epico" | "raro";
  iniciales: string;
  numero: 1 | 2 | 3;
  tag: string;
  tagBg: string;
}) {
  const esLeg = tier === "legendario";
  const tamMedallon = esLeg ? 150 : 110;
  const tamGemaNum = esLeg ? "text-4xl" : numero === 2 ? "text-3xl" : "text-2xl";

  const gemaBg =
    tier === "legendario"
      ? "radial-gradient(circle at 35% 30%, #fef9c3 0%, #fde047 15%, #f59e0b 40%, #b45309 80%, #78350f 100%)"
      : tier === "epico"
        ? "radial-gradient(circle at 35% 30%, #e0f2fe 0%, #7dd3fc 15%, #0ea5e9 40%, #0c4a6e 80%, #082f49 100%)"
        : "radial-gradient(circle at 35% 30%, #fef3c7 0%, #fbbf24 15%, #d97706 40%, #7c2d12 80%, #431407 100%)";

  const innerBg =
    tier === "legendario"
      ? "radial-gradient(circle at 30% 30%, #78350f, #451a03 50%, #1c0a02)"
      : tier === "epico"
        ? "radial-gradient(circle at 30% 30%, #334155, #1e293b 50%, #0f172a)"
        : "radial-gradient(circle at 30% 30%, #431407, #292524 50%, #0c0a09)";

  const marcoBg =
    tier === "legendario"
      ? "conic-gradient(from 45deg, #fef3c7, #fbbf24, #92400e, #fbbf24, #fef3c7, #fbbf24, #92400e, #fbbf24, #fef3c7)"
      : tier === "epico"
        ? "conic-gradient(from 45deg, #f9fafb, #cbd5e1, #475569, #cbd5e1, #f9fafb, #cbd5e1, #475569, #cbd5e1, #f9fafb)"
        : "conic-gradient(from 45deg, #fed7aa, #ea580c, #7c2d12, #ea580c, #fed7aa, #ea580c, #7c2d12, #ea580c, #fed7aa)";

  const haloBg =
    tier === "legendario"
      ? "radial-gradient(circle, rgba(251,191,36,0.55) 0%, transparent 60%)"
      : tier === "epico"
        ? "radial-gradient(circle, rgba(148,163,184,0.35) 0%, transparent 60%)"
        : "radial-gradient(circle, rgba(234,88,12,0.3) 0%, transparent 60%)";

  const rayosColor =
    tier === "legendario"
      ? "rgba(245,158,11,0.85)"
      : tier === "epico"
        ? "rgba(100,116,139,0.6)"
        : "rgba(234,88,12,0.65)";

  const animFlotar = esLeg ? "flotar 3s ease-in-out infinite" : "flotar 3.5s ease-in-out infinite";

  return (
    <div
      className="relative mb-3"
      style={{
        width: tamMedallon,
        height: tamMedallon,
        animation: animFlotar,
      }}
    >
      {/* Rayos rotando */}
      <div
        className="absolute -inset-7 z-0"
        style={{
          background: `conic-gradient(from 0deg,
            ${rayosColor} 0deg 2deg, transparent 2deg 30deg,
            ${rayosColor} 30deg 32deg, transparent 32deg 60deg,
            ${rayosColor} 60deg 62deg, transparent 62deg 90deg,
            ${rayosColor} 90deg 92deg, transparent 92deg 120deg,
            ${rayosColor} 120deg 122deg, transparent 122deg 150deg,
            ${rayosColor} 150deg 152deg, transparent 152deg 180deg,
            ${rayosColor} 180deg 182deg, transparent 182deg 210deg,
            ${rayosColor} 210deg 212deg, transparent 212deg 240deg,
            ${rayosColor} 240deg 242deg, transparent 242deg 270deg,
            ${rayosColor} 270deg 272deg, transparent 272deg 300deg,
            ${rayosColor} 300deg 302deg, transparent 302deg 330deg,
            ${rayosColor} 330deg 332deg, transparent 332deg 360deg)`,
          maskImage: "radial-gradient(circle, transparent 35%, black 50%, transparent 90%)",
          WebkitMaskImage: "radial-gradient(circle, transparent 35%, black 50%, transparent 90%)",
          animation: "girar-rayos 12s linear infinite",
          opacity: esLeg ? 0.85 : 0.55,
        }}
      />

      {/* Halo pulsante */}
      <div
        className="absolute -inset-5 z-0 rounded-full"
        style={{
          background: haloBg,
          animation: "halo-pulse 2.5s ease-in-out infinite",
        }}
      />

      {/* Tag (LEGENDARIO/ÉPICO/RARO) */}
      <span
        className={cn(
          "absolute -top-2 left-1/2 z-30 -translate-x-1/2 whitespace-nowrap rounded px-2.5 py-0.5 text-[9px] font-extrabold tracking-[0.2em] shadow-md",
          tagBg
        )}
      >
        {tag}
      </span>

      {/* Alas SVG */}
      <svg
        className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2"
        width={tamMedallon * (esLeg ? 1.15 : 1.05)}
        height={tamMedallon * (esLeg ? 1.15 : 1.05)}
        viewBox="0 0 200 200"
      >
        <defs>
          <linearGradient id={`ala-${tier}-${numero}`} x1="0%" y1="0%" x2="100%" y2="100%">
            {tier === "legendario" && (
              <>
                <stop offset="0%" stopColor="#fef3c7" />
                <stop offset="50%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#92400e" />
              </>
            )}
            {tier === "epico" && (
              <>
                <stop offset="0%" stopColor="#f1f5f9" />
                <stop offset="50%" stopColor="#94a3b8" />
                <stop offset="100%" stopColor="#334155" />
              </>
            )}
            {tier === "raro" && (
              <>
                <stop offset="0%" stopColor="#fdba74" />
                <stop offset="50%" stopColor="#ea580c" />
                <stop offset="100%" stopColor="#7c2d12" />
              </>
            )}
          </linearGradient>
        </defs>
        {esLeg ? (
          <>
            <path
              d="M 100 100 Q 60 50, 0 60 Q 30 85, 35 95 Q 15 95, -5 100 Q 25 105, 50 105 Q 25 115, 5 125 Q 40 120, 60 115 Q 80 110, 100 100 Z"
              fill={`url(#ala-${tier}-${numero})`}
              opacity="0.92"
              stroke="#451a03"
              strokeWidth="0.8"
            />
            <path
              d="M 100 100 Q 140 50, 200 60 Q 170 85, 165 95 Q 185 95, 205 100 Q 175 105, 150 105 Q 175 115, 195 125 Q 160 120, 140 115 Q 120 110, 100 100 Z"
              fill={`url(#ala-${tier}-${numero})`}
              opacity="0.92"
              stroke="#451a03"
              strokeWidth="0.8"
            />
          </>
        ) : (
          <>
            <path
              d="M 100 100 Q 60 65, 10 75 Q 40 90, 50 100 Q 30 100, 5 105 Q 35 110, 60 110 Q 80 110, 100 100 Z"
              fill={`url(#ala-${tier}-${numero})`}
              opacity="0.9"
              stroke="#1e293b"
              strokeWidth="0.5"
            />
            <path
              d="M 100 100 Q 140 65, 190 75 Q 160 90, 150 100 Q 170 100, 195 105 Q 165 110, 140 110 Q 120 110, 100 100 Z"
              fill={`url(#ala-${tier}-${numero})`}
              opacity="0.9"
              stroke="#1e293b"
              strokeWidth="0.5"
            />
          </>
        )}
      </svg>

      {/* Marco (anillo metálico) */}
      <div
        className="absolute z-30"
        style={{
          inset: "10%",
          borderRadius: "50%",
          background: marcoBg,
          padding: esLeg ? "8px" : "6px",
          boxShadow:
            "0 0 0 1px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(255,255,255,0.2)",
        }}
      >
        {/* Anillo interior oscuro */}
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            background: innerBg,
            padding: "5px",
            boxShadow:
              "inset 0 0 12px rgba(0,0,0,0.5), inset 0 2px 0 rgba(255,255,255,0.1)",
          }}
        >
          {/* Gema con número */}
          <div
            className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-full"
            style={{
              background: gemaBg,
              boxShadow:
                "inset 0 2px 6px rgba(255,255,255,0.6), inset 0 -2px 6px rgba(0,0,0,0.5)",
            }}
          >
            {/* Reflejo */}
            <div
              className="pointer-events-none absolute"
              style={{
                top: "12%",
                left: "18%",
                width: "38%",
                height: "25%",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.7)",
                filter: "blur(4px)",
              }}
            />
            <span
              className={cn(
                "relative z-10 font-extrabold tracking-tighter text-white",
                tamGemaNum
              )}
              style={{
                textShadow:
                  "0 1px 0 rgba(255,255,255,0.4), 0 -1px 3px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.5)",
              }}
            >
              {numero}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// TARJETAS DE TU POSICIÓN
// ============================================================================

function TuTarjetaIndividual({ mi }: { mi: import("@/lib/podio-supabase").MiPosicion }) {
  return (
    <div className="relative z-10 mt-4 overflow-hidden rounded-xl border border-violet-200 bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 p-3 dark:border-violet-900 dark:bg-violet-950/30">
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-violet-400/25 blur-3xl" />

      <div className="relative flex items-center gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-indigo-700 text-xs font-extrabold text-white shadow-md ring-2 ring-white">
          {mi.puesto}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-sm font-bold text-violet-900 dark:text-violet-100">Tu posición</span>
            <span className="rounded border border-violet-300 bg-white px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-violet-700 dark:border-violet-700 dark:bg-violet-900/50 dark:text-violet-200">
              {mi.puesto}.° de {mi.total}
            </span>
          </div>
          {mi.para_top5 !== null && mi.para_top5 > 0 ? (
            <div className="mt-0.5 text-[11px] text-violet-800 dark:text-violet-300">
              Te faltan <strong className="text-amber-700 dark:text-amber-400">{mi.para_top5.toFixed(0)} pts</strong> para entrar al top 5
            </div>
          ) : mi.puesto <= 3 ? (
            <div className="mt-0.5 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
              ¡Estás en el podio! 🏆
            </div>
          ) : (
            <div className="mt-0.5 text-[11px] text-violet-800 dark:text-violet-300">
              Ya estás en el top 5 — apuntá al podio.
            </div>
          )}
        </div>
        <div className="text-right">
          <div className="text-2xl font-extrabold leading-none text-violet-900 dark:text-violet-100">
            {mi.nota.toFixed(0)}
          </div>
          <div className="text-[9px] font-semibold uppercase tracking-widest text-violet-700 dark:text-violet-300">
            tu nota
          </div>
        </div>
      </div>
    </div>
  );
}

function CtaGrupal({ mi }: { mi: import("@/lib/podio-supabase").MiGrupoPosicion }) {
  if (mi.para_oro === null) {
    return (
      <div className="relative z-10 mt-4 rounded-xl border border-amber-300 bg-gradient-to-r from-amber-50 to-orange-100 px-4 py-3 dark:border-amber-700 dark:bg-amber-950/30">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-600 shadow-lg shadow-amber-500/40">
            <Trophy className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="text-sm font-bold text-amber-900 dark:text-amber-100">
              Tu grupo <strong>{mi.nombre}</strong> es el campeón.
            </div>
            <div className="text-[11px] text-amber-800/80 dark:text-amber-300">
              ¡Sigan así para mantener el primer puesto!
            </div>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="relative z-10 mt-4 rounded-xl border border-amber-300 bg-gradient-to-r from-amber-50 to-orange-100 px-4 py-3 dark:border-amber-700 dark:bg-amber-950/30">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-600 shadow-lg shadow-amber-500/40">
          <Flame className="h-4 w-4 fill-white text-white" />
        </div>
        <div>
          <div className="text-sm font-bold text-amber-900 dark:text-amber-100">
            Tu grupo <strong>{mi.nombre}</strong> está a{" "}
            <span className="bg-gradient-to-b from-amber-500 via-orange-600 to-red-600 bg-clip-text text-base font-extrabold text-transparent">
              {mi.para_oro.toFixed(0)} puntos
            </span>{" "}
            del campeonato
          </div>
          <div className="text-[11px] text-amber-800/80 dark:text-amber-300">
            Una buena entrega más y podrían tomar el primer lugar.
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// ANIMACIONES GLOBALES (inyectadas una sola vez)
// ============================================================================

// Inyecta el keyframes-style necesarios al primer mount (idempotente).
let estilosInyectados = false;
function inyectarEstilos() {
  if (estilosInyectados || typeof document === "undefined") return;
  estilosInyectados = true;
  const style = document.createElement("style");
  style.textContent = `
    @keyframes subir-epico {
      0% { transform: translateY(30px) scale(0.85); opacity: 0; }
      60% { transform: translateY(-6px) scale(1.04); opacity: 1; }
      100% { transform: translateY(0) scale(1); opacity: 1; }
    }
    @keyframes girar-rayos {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    @keyframes halo-pulse {
      0%, 100% { opacity: 0.6; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.1); }
    }
    @keyframes flotar {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-6px); }
    }
  `;
  document.head.appendChild(style);
}
// Ejecutar al cargar el módulo (efecto: 1 vez).
inyectarEstilos();
