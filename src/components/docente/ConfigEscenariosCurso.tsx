import { useEffect, useState } from "react";
import { Loader2, RotateCcw, Save, TrendingDown, TrendingUp } from "lucide-react";
import {
  DEFAULT_OPTIMISTA,
  DEFAULT_PESIMISTA,
  resolverEscenariosDeCurso,
  type ModificadoresEscenario,
} from "@/lib/escenarios";
import {
  actualizarEscenariosConfig,
  obtenerCursoPorId,
} from "@/lib/cursos-supabase";

/**
 * Editor que usa el DOCENTE para definir los valores de Optimista y Pesimista
 * del curso. Si nunca lo guardó, los inputs muestran los DEFAULTS del código.
 * Al guardar, todos los alumnos del curso ven esos nuevos valores la próxima
 * vez que entren a /escenarios.
 */
export default function ConfigEscenariosCurso({ cursoId }: { cursoId: string }) {
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [optimista, setOptimista] = useState<ModificadoresEscenario>(DEFAULT_OPTIMISTA);
  const [pesimista, setPesimista] = useState<ModificadoresEscenario>(DEFAULT_PESIMISTA);
  // True si la config viva en BD coincide con los defaults del código (para
  // poder mostrar "Usando defaults" vs "Personalizado").
  const [esDefault, setEsDefault] = useState(true);

  useEffect(() => {
    setCargando(true);
    obtenerCursoPorId(cursoId)
      .then((c) => {
        const conf = c?.escenarios_config ?? null;
        const resuelto = resolverEscenariosDeCurso(conf);
        setOptimista(resuelto.optimista);
        setPesimista(resuelto.pesimista);
        setEsDefault(conf === null);
      })
      .catch((e) => setError(e?.message ?? "No se pudo cargar la config."))
      .finally(() => setCargando(false));
  }, [cursoId]);

  const guardar = async () => {
    setGuardando(true);
    setError(null);
    setOk(false);
    try {
      await actualizarEscenariosConfig(cursoId, { optimista, pesimista });
      setEsDefault(false);
      setOk(true);
      setTimeout(() => setOk(false), 1500);
    } catch (e: any) {
      setError(e?.message ?? "No se pudo guardar.");
    } finally {
      setGuardando(false);
    }
  };

  const resetearADefaults = async () => {
    setGuardando(true);
    setError(null);
    try {
      await actualizarEscenariosConfig(cursoId, null);
      setOptimista(DEFAULT_OPTIMISTA);
      setPesimista(DEFAULT_PESIMISTA);
      setEsDefault(true);
      setOk(true);
      setTimeout(() => setOk(false), 1500);
    } catch (e: any) {
      setError(e?.message ?? "No se pudo resetear.");
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) {
    return (
      <div className="flex items-center gap-2 p-4 text-xs text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
        Cargando configuración…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-border bg-secondary/20 p-3">
        <h3 className="text-sm font-semibold">Escenarios económicos del curso</h3>
        <p className="mt-0.5 text-[11px] text-muted-foreground">
          Definí qué tan duro o blando es cada escenario en este curso. Los alumnos los van a
          ver en su pestaña <strong>📊 Escenarios</strong> al analizar el proyecto.
          {esDefault ? (
            <span className="ml-1 rounded bg-sky-100 px-1.5 py-0.5 text-[10px] font-semibold text-sky-800 dark:bg-sky-900/40 dark:text-sky-200">
              Usando defaults del sistema
            </span>
          ) : (
            <span className="ml-1 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
              Personalizado por vos
            </span>
          )}
        </p>
      </div>

      <BloqueEscenario
        nombre="Optimista"
        color="emerald"
        icon={<TrendingUp className="h-4 w-4" />}
        descripcion="Entorno favorable: mercado receptivo, banca con buena tasa, sin presión inflacionaria."
        valor={optimista}
        onChange={setOptimista}
      />

      <BloqueEscenario
        nombre="Pesimista"
        color="rose"
        icon={<TrendingDown className="h-4 w-4" />}
        descripcion="Entorno duro: devaluación, escasez, riesgo país alto. Es el stress test del proyecto."
        valor={pesimista}
        onChange={setPesimista}
      />

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={guardar}
          disabled={guardando}
          className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {guardando ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
          Guardar para el curso
        </button>
        {!esDefault && (
          <button
            onClick={resetearADefaults}
            disabled={guardando}
            className="flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs hover:bg-secondary disabled:opacity-50"
          >
            <RotateCcw className="h-3 w-3" />
            Resetear a defaults
          </button>
        )}
        {ok && <span className="text-[11px] text-emerald-600">Guardado ✓</span>}
      </div>
    </div>
  );
}

// ============================================================================
// Bloque de un escenario (optimista o pesimista) con sus inputs
// ============================================================================

function BloqueEscenario({
  nombre,
  color,
  icon,
  descripcion,
  valor,
  onChange,
}: {
  nombre: string;
  color: "emerald" | "rose";
  icon: React.ReactNode;
  descripcion: string;
  valor: ModificadoresEscenario;
  onChange: (m: ModificadoresEscenario) => void;
}) {
  const claseBorder = color === "emerald" ? "border-l-emerald-500" : "border-l-rose-500";
  const claseTitulo = color === "emerald" ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300";

  const setMul = (k: keyof ModificadoresEscenario, pctEntero: number) => {
    onChange({ ...valor, [k]: 1 + pctEntero / 100 });
  };

  const setDeltaTasa = (pp: number) => {
    onChange({ ...valor, tasaInteresDeltaPp: pp === 0 ? undefined : pp / 100 });
  };

  return (
    <div className={`rounded-lg border border-border bg-card p-3 border-l-4 ${claseBorder}`}>
      <div className={`mb-2 flex items-center gap-2 text-sm font-semibold ${claseTitulo}`}>
        {icon}
        Escenario {nombre}
      </div>
      <p className="mb-3 text-[11px] text-muted-foreground">{descripcion}</p>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
        <InputPctEntero label="Precio" valor={valor.precioMul} onChange={(p) => setMul("precioMul", p)} />
        <InputPctEntero label="Demanda" valor={valor.demandaMul} onChange={(p) => setMul("demandaMul", p)} />
        <InputPctEntero label="Costos directos" valor={valor.costoDirectoMul} onChange={(p) => setMul("costoDirectoMul", p)} />
        <InputPctEntero label="Costos generales" valor={valor.costoGeneralMul} onChange={(p) => setMul("costoGeneralMul", p)} />
        <InputPctEntero label="Sueldos" valor={valor.personalMul} onChange={(p) => setMul("personalMul", p)} />
        <InputPctEntero label="Inversión" valor={valor.inversionMul} onChange={(p) => setMul("inversionMul", p)} />
        <InputPpEntero
          label="Tasa préstamo"
          valor={(valor.tasaInteresDeltaPp ?? 0) * 100}
          onChange={setDeltaTasa}
          sufijo="pp"
          ayuda="Suma o resta a la tasa anual del préstamo (en puntos porcentuales)."
        />
      </div>
    </div>
  );
}

function InputPctEntero({
  label,
  valor,
  onChange,
}: {
  label: string;
  valor: number;
  onChange: (pctEntero: number) => void;
}) {
  // valor es un multiplicador (1.10 = +10%). Convertimos a entero pct para editar.
  const pctEntero = Math.round((valor - 1) * 100);
  return (
    <label className="text-[11px]">
      <span className="font-medium">{label}</span>
      <div className="mt-0.5 flex items-center gap-1">
        <input
          type="number"
          step={1}
          min={-50}
          max={50}
          value={pctEntero}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className="w-20 rounded border border-input bg-background px-2 py-1 text-right text-xs"
        />
        <span className="text-muted-foreground">%</span>
      </div>
    </label>
  );
}

function InputPpEntero({
  label,
  valor,
  onChange,
  sufijo,
  ayuda,
}: {
  label: string;
  valor: number;
  onChange: (pp: number) => void;
  sufijo: string;
  ayuda?: string;
}) {
  const ppEntero = Math.round(valor * 10) / 10;
  return (
    <label className="text-[11px]" title={ayuda}>
      <span className="font-medium">{label}</span>
      <div className="mt-0.5 flex items-center gap-1">
        <input
          type="number"
          step={0.5}
          min={-10}
          max={20}
          value={ppEntero}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className="w-20 rounded border border-input bg-background px-2 py-1 text-right text-xs"
        />
        <span className="text-muted-foreground">{sufijo}</span>
      </div>
    </label>
  );
}
