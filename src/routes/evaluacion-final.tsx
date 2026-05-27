import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, Lightbulb, TrendingUp, XCircle } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useAuthStore } from "@/stores/auth-store";
import { listarMisProyectos } from "@/lib/proyecto-supabase";
import {
  obtenerHistorial,
  obtenerSimulacionActiva,
} from "@/lib/simulacion-supabase";
import { supabase } from "@/lib/supabase";
import {
  calcularIR,
  calcularPayback,
  calcularPaybackDescontado,
  calcularTIR,
  calcularVAN,
} from "@/lib/calculo-financiero";
import { construirFlujoCaja } from "@/lib/flujo-proyecto";
import { formatearBolivianos } from "@/lib/utils";
import type { Proyecto } from "@/types/proyecto";
import type { Simulacion, TurnoHistorial } from "@/types/simulacion";

interface Analisis {
  aciertos: string[];
  errores: string[];
  calificacion: number; // 0..100
}

export default function EvaluacionFinal() {
  const user = useAuthStore((s) => s.user);
  const [proyecto, setProyecto] = useState<Proyecto | null>(null);
  const [simulacion, setSimulacion] = useState<Simulacion | null>(null);
  const [historial, setHistorial] = useState<TurnoHistorial[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const proyectos = await listarMisProyectos(user.id);
      if (proyectos.length === 0) {
        setCargando(false);
        return;
      }
      const p = proyectos[0];
      setProyecto(p);
      // Tomar la última simulación FINALIZADA o quebrada (no la activa)
      const { data } = await supabase
        .from("simulaciones")
        .select("*")
        .eq("proyecto_id", p.id)
        .in("estado", ["finalizada", "quebrada"])
        .order("finalizada_en", { ascending: false })
        .limit(1)
        .maybeSingle();
      const sim = (data as Simulacion | null) ?? (await obtenerSimulacionActiva(p.id));
      setSimulacion(sim);
      if (sim) setHistorial(await obtenerHistorial(sim.id));
      setCargando(false);
    })();
  }, [user]);

  if (cargando) return <div className="text-sm text-muted-foreground">Cargando…</div>;
  if (!proyecto)
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        Aún no tienes un proyecto.
      </div>
    );
  if (!simulacion)
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        Aún no has corrido una simulación. Anda a "Simular" para iniciar.
      </div>
    );

  const { proyectado, real, comparativo } = calcularComparativo(proyecto, simulacion, historial);
  const analisis = analizarDecisiones(proyecto, historial);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-card p-6">
        <h1 className="text-xl font-semibold tracking-tight">Evaluación final</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Comparación entre lo que <em>proyectaste</em> al construir el proyecto y lo que{" "}
          <em>realmente pasó</em> en la simulación de 5 años con eventos bolivianos.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <ComparativoCard
          titulo="VAN"
          proyectado={proyectado.van}
          real={real.van}
          formato="moneda"
          mejorEsMayor
        />
        <ComparativoCard
          titulo="TIR"
          proyectado={proyectado.tir}
          real={real.tir}
          formato="porcentaje"
          mejorEsMayor
        />
        <ComparativoCard
          titulo="Payback"
          proyectado={proyectado.payback}
          real={real.payback}
          formato="anios"
          mejorEsMayor={false}
        />
        <ComparativoCard
          titulo="Caja final"
          proyectado={proyectado.cajaFinal}
          real={real.cajaFinal}
          formato="moneda"
          mejorEsMayor
        />
        {proyecto.version === "v2" && (
          <ComparativoCard
            titulo="Payback descontado (V2)"
            proyectado={proyectado.paybackDescontado}
            real={real.paybackDescontado}
            formato="anios"
            mejorEsMayor={false}
          />
        )}
      </div>

      {/* Gráfico flujos proyectados vs reales */}
      <div className="rounded-lg border border-border bg-card p-4">
        <h3 className="mb-2 text-sm font-medium">Flujos: proyectado vs real</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={comparativo}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="periodo" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
            <Tooltip
              formatter={(v: number) => formatearBolivianos(v)}
              labelFormatter={(l) => l}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="proyectado" fill="#94a3b8" name="Proyectado" />
            <Bar dataKey="real" fill="hsl(var(--primary))" name="Real" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-emerald-500/40 bg-emerald-50 p-4 dark:bg-emerald-950/30">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-800 dark:text-emerald-200">
            <CheckCircle2 className="h-4 w-4" />
            Aciertos
          </div>
          {analisis.aciertos.length === 0 ? (
            <p className="text-xs text-emerald-700/70 dark:text-emerald-300/70">
              No identificamos aciertos destacables. Hubo varios errores estructurales.
            </p>
          ) : (
            <ul className="space-y-1 text-xs text-emerald-900 dark:text-emerald-100">
              {analisis.aciertos.map((a, i) => (
                <li key={i} className="flex gap-1.5">
                  <span>•</span>
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-destructive">
            <XCircle className="h-4 w-4" />
            Errores
          </div>
          {analisis.errores.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No detectamos errores estructurales. Buen trabajo.
            </p>
          ) : (
            <ul className="space-y-1 text-xs text-foreground">
              {analisis.errores.map((e, i) => (
                <li key={i} className="flex gap-1.5">
                  <span>•</span>
                  <span>{e}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-amber-500/40 bg-amber-50 p-5 dark:bg-amber-950/30">
        <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-amber-900 dark:text-amber-200">
          <Lightbulb className="h-4 w-4" />
          Calificación sugerida
        </div>
        <div className="text-3xl font-bold text-amber-900 dark:text-amber-200">
          {analisis.calificacion.toFixed(0)}/100
        </div>
        <div className="mt-2 text-xs text-amber-800/80 dark:text-amber-300/80">
          Rúbrica sugerida: 30% calidad de construcción inicial · 40% decisiones durante simulación
          · 30% resultado final (VAN, caja). El docente puede ajustar pesos.
        </div>
      </div>

      <div className="rounded-lg border border-dashed border-border bg-card/50 p-4 text-xs text-muted-foreground">
        <div className="mb-1 flex items-center gap-2 font-medium">
          <TrendingUp className="h-3.5 w-3.5" />
          Retroalimentación con IA
        </div>
        Próximamente: aquí aparecerá un análisis personalizado generado por IA con
        recomendaciones específicas sobre tus decisiones. Requiere configurar la API
        de Claude — se habilita en FASE 9.
      </div>
    </div>
  );
}

function ComparativoCard({
  titulo,
  proyectado,
  real,
  formato,
  mejorEsMayor,
}: {
  titulo: string;
  proyectado: number;
  real: number;
  formato: "moneda" | "porcentaje" | "anios";
  mejorEsMayor: boolean;
}) {
  const fmt = (n: number) =>
    formato === "moneda"
      ? formatearBolivianos(n)
      : formato === "porcentaje"
        ? `${(n * 100).toFixed(2)}%`
        : n < 0
          ? "No recupera"
          : `${n.toFixed(1)} años`;
  const delta = real - proyectado;
  const fueMejor = mejorEsMayor ? delta > 0 : delta < 0;

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{titulo}</div>
      <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
        <div>
          <div className="text-[10px] text-muted-foreground">Proyectado</div>
          <div className="font-medium">{fmt(proyectado)}</div>
        </div>
        <div>
          <div className="text-[10px] text-muted-foreground">Real</div>
          <div
            className={`font-semibold ${
              fueMejor
                ? "text-emerald-700 dark:text-emerald-400"
                : "text-destructive"
            }`}
          >
            {fmt(real)}
          </div>
        </div>
      </div>
      <div className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground">
        {fueMejor ? (
          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
        ) : (
          <AlertCircle className="h-3 w-3 text-destructive" />
        )}
        {fueMejor ? "Mejor de lo esperado" : "Peor de lo esperado"}
      </div>
    </div>
  );
}

// ============================================================================
// CÁLCULOS DE COMPARATIVO
// ============================================================================
function calcularComparativo(
  proyecto: Proyecto,
  simulacion: Simulacion,
  historial: TurnoHistorial[]
) {
  // 1) PROYECTADO — usa el MISMO motor que el Paso 9 (sin recalcular aparte).
  const calc = construirFlujoCaja(proyecto);
  const tasa = calc.wacc > 0 ? calc.wacc : 0.1;
  const flujosProyectados = calc.flujoCaja;
  const cajaFinalProy =
    proyecto.capitalTrabajo + flujosProyectados.slice(1).reduce((a: number, b: number) => a + b, 0);

  const proyectado = {
    van: calc.indicadores.van,
    tir: calc.indicadores.tir,
    payback: calc.indicadores.payback,
    paybackDescontado: calcularPaybackDescontado(flujosProyectados, tasa),
    ir: calc.indicadores.ir,
    cajaFinal: cajaFinalProy,
  };

  // 2) REAL — del estado final de la simulación. Mismo punto de partida (año 0)
  // que el proyectado para que la comparación sea justa.
  const flujosReales: number[] = [flujosProyectados[0]];
  const turnosPorAnio = Math.ceil(simulacion.turnos_totales / 5);
  for (let a = 0; a < 5; a++) {
    const turnosAnio = historial.slice(a * turnosPorAnio, (a + 1) * turnosPorAnio);
    const flujoAnio = turnosAnio.reduce(
      (acc, t) => acc + t.estado_despues.delta_caja,
      0
    );
    flujosReales.push(flujoAnio);
  }
  const real = {
    van: calcularVAN(flujosReales, tasa),
    tir: calcularTIR(flujosReales),
    payback: calcularPayback(flujosReales),
    paybackDescontado: calcularPaybackDescontado(flujosReales, tasa),
    ir: calcularIR(flujosReales, tasa),
    cajaFinal: simulacion.estado_actual.caja,
  };

  // 3) Comparativo año a año
  const comparativo = Array.from({ length: 6 }, (_, i) => ({
    periodo: i === 0 ? "Año 0" : `Año ${i}`,
    proyectado: flujosProyectados[i] ?? 0,
    real: flujosReales[i] ?? 0,
  }));

  return { proyectado, real, comparativo };
}

// ============================================================================
// ANÁLISIS DE ACIERTOS/ERRORES + CALIFICACIÓN
// ============================================================================
function analizarDecisiones(proyecto: Proyecto, historial: TurnoHistorial[]): Analisis {
  const aciertos: string[] = [];
  const errores: string[] = [];

  // Construcción inicial
  const cantidadProductos = proyecto.productos.length;
  const cantidadPersonal = proyecto.personal.length;
  const inversionTotal =
    Object.values(proyecto.inversiones)
      .flat()
      .reduce((acc, it) => acc + it.costoTotal, 0) + proyecto.capitalTrabajo;

  if (cantidadProductos === 0) {
    errores.push("No definiste productos/servicios: tu proyecto no tiene ingresos.");
  } else if (cantidadProductos >= 2) {
    aciertos.push(`Diversificaste ingresos con ${cantidadProductos} productos.`);
  }

  if (cantidadPersonal === 0) {
    errores.push("No proyectaste personal — todo proyecto formal en Bolivia requiere al menos un puesto.");
  }

  if (proyecto.capitalTrabajo < inversionTotal * 0.1) {
    errores.push(
      "Capital de trabajo muy bajo respecto a la inversión total — alto riesgo de iliquidez."
    );
  } else {
    aciertos.push("Capital de trabajo razonable respecto a la inversión.");
  }

  if (proyecto.imprevistosPorcentaje < 0.03) {
    errores.push("No reservaste suficiente para imprevistos (menos del 3%).");
  } else if (proyecto.imprevistosPorcentaje >= 0.05) {
    aciertos.push("Buen colchón de imprevistos (5% o más).");
  }

  if (proyecto.financiamiento.porcentajePrestamo > 0.7) {
    errores.push("Apalancamiento muy alto: más del 70% del proyecto es deuda.");
  }

  // Decisiones en simulación
  const decisiones = historial.filter((h) => h.decision_tomada).length;
  const finalCaja = historial[historial.length - 1]?.estado_despues.caja ?? 0;
  const finalUtilidad = historial[historial.length - 1]?.estado_despues.utilidad_acumulada ?? 0;

  if (decisiones >= 5) {
    aciertos.push(`Tomaste ${decisiones} decisiones activamente durante la simulación.`);
  }

  if (finalCaja < 0) {
    errores.push("Terminaste con caja negativa: el proyecto quebró.");
  } else if (finalCaja > inversionTotal * 0.3) {
    aciertos.push("Terminaste con caja saludable, más del 30% de la inversión.");
  }

  if (finalUtilidad < 0) {
    errores.push("La utilidad acumulada es negativa al final del horizonte.");
  } else if (finalUtilidad > inversionTotal) {
    aciertos.push("Generaste utilidad superior a la inversión inicial — excelente.");
  }

  // Calificación
  let calificacion = 50;
  calificacion += aciertos.length * 7;
  calificacion -= errores.length * 8;
  calificacion = Math.max(0, Math.min(100, calificacion));

  return { aciertos, errores, calificacion };
}
