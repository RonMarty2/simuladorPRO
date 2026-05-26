import { useEffect, useState } from "react";
import { BookOpen, GraduationCap, Hammer, Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useProyectoStore } from "@/stores/proyecto-store";
import { guardarProyecto, listarCasosDelCurso, tomarCasoDelCurso } from "@/lib/proyecto-supabase";
import { listarMisInscripciones, type Curso } from "@/lib/cursos-supabase";
import { cn } from "@/lib/utils";
import type { Proyecto, VersionProyecto } from "@/types/proyecto";

interface CasoDisponible {
  curso: Curso;
  caso: Proyecto;
}

export default function EmpezarProyecto() {
  const user = useAuthStore((s) => s.user);
  const perfil = useAuthStore((s) => s.perfil);
  const cargar = useProyectoStore((s) => s.cargar);
  const inicializar = useProyectoStore((s) => s.inicializar);

  const [casosDisponibles, setCasosDisponibles] = useState<CasoDisponible[]>([]);
  const [cargandoCasos, setCargandoCasos] = useState(true);

  // Cargar casos disponibles para este estudiante (de sus cursos)
  useEffect(() => {
    if (!user || perfil?.rol === "docente") {
      setCargandoCasos(false);
      return;
    }
    (async () => {
      try {
        const inscripciones = await listarMisInscripciones(user.id);
        const arr: CasoDisponible[] = [];
        for (const { curso } of inscripciones) {
          const casos = await listarCasosDelCurso(curso.id);
          casos.forEach((caso) => arr.push({ curso, caso }));
        }
        setCasosDisponibles(arr);
      } catch (e) {
        console.error("Error cargando casos del curso:", e);
      } finally {
        setCargandoCasos(false);
      }
    })();
  }, [user, perfil?.rol]);

  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="text-center">
        <h2 className="text-lg font-semibold tracking-tight">Empezar a trabajar</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          {perfil?.rol === "docente"
            ? "Crea un proyecto para experimentar o armar un caso plantilla del curso."
            : "Elige cómo quieres arrancar."}
        </p>
      </div>

      {/* Casos del curso disponibles (solo estudiantes) */}
      {cargandoCasos && perfil?.rol === "estudiante" && (
        <div className="flex items-center justify-center gap-2 rounded-md border border-border bg-card p-4 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
          Buscando casos disponibles…
        </div>
      )}

      {casosDisponibles.length > 0 && (
        <div className="space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            📥 Casos disponibles en tus cursos
          </div>
          {casosDisponibles.map(({ curso, caso }) => (
            <TarjetaCasoDisponible
              key={caso.id}
              curso={curso}
              caso={caso}
              onTomado={(p) => cargar(p)}
            />
          ))}
        </div>
      )}

      {/* Proyecto libre */}
      <FormularioProyectoLibre
        userId={user.id}
        onCreado={() => {
          // El proyecto ya está en el store después de inicializar/guardar.
        }}
        inicializar={inicializar}
      />
    </div>
  );
}

function TarjetaCasoDisponible({
  curso,
  caso,
  onTomado,
}: {
  curso: Curso;
  caso: Proyecto;
  onTomado: (p: Proyecto) => void;
}) {
  const user = useAuthStore((s) => s.user)!;
  const [tomando, setTomando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tomar = async () => {
    setTomando(true);
    setError(null);
    try {
      const copia = await tomarCasoDelCurso(caso.id, user.id);
      onTomado(copia);
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setTomando(false);
    }
  };

  const pasoInicio = caso.paso_inicio_estudiante ?? 1;

  return (
    <div className="rounded-md border-2 border-emerald-300 bg-emerald-50/50 p-3 dark:border-emerald-700 dark:bg-emerald-950/20">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-emerald-500 text-white">
          <BookOpen className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold">{caso.nombre}</div>
          <div className="text-[11px] text-muted-foreground">
            Curso: <strong>{curso.nombre}</strong> · {curso.materia}
            {curso.paralelo ? ` · ${curso.paralelo}` : ""}
          </div>
          <div className="mt-1 text-[11px] text-emerald-900 dark:text-emerald-100">
            {pasoInicio === 1
              ? "Tendrás que armar TODO el proyecto desde cero (el docente solo te dio el contexto)."
              : pasoInicio === 9
              ? "Recibes el proyecto COMPLETO. Solo lo simulas."
              : `Recibes los pasos 1 al ${pasoInicio - 1} ya armados. Tú completas del ${pasoInicio} al 8.`}
          </div>
          {error && (
            <div className="mt-1 text-[11px] text-destructive">{error}</div>
          )}
        </div>
        <button
          onClick={tomar}
          disabled={tomando}
          className="flex flex-shrink-0 items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {tomando ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <GraduationCap className="h-3 w-3" />
          )}
          Tomar caso
        </button>
      </div>
    </div>
  );
}

function FormularioProyectoLibre({
  userId,
  onCreado,
  inicializar,
}: {
  userId: string;
  onCreado: () => void;
  inicializar: (
    estudianteId: string,
    nombre: string,
    curso_id?: string | null,
    version?: VersionProyecto
  ) => void;
}) {
  const [nombre, setNombre] = useState("");
  const [version, setVersion] = useState<VersionProyecto>("v1");
  const [creando, setCreando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const crear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !nombre.trim()) return;
    setCreando(true);
    setError(null);
    try {
      inicializar(userId, nombre.trim(), null, version);
      const proyecto = useProyectoStore.getState().proyecto!;
      await guardarProyecto(proyecto);
      onCreado();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error al crear el proyecto";
      setError(msg);
    } finally {
      setCreando(false);
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-3 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Hammer className="h-4 w-4" />
        </div>
        <div>
          <div className="text-sm font-semibold">🆕 Crear proyecto libre</div>
          <div className="text-[11px] text-muted-foreground">
            Arranca desde cero, sin guion del docente
          </div>
        </div>
      </div>

      <form onSubmit={crear} className="space-y-3">
        <input
          id="nombre-proyecto"
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej: nombre de tu proyecto o negocio"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />

        {/* Selector de versión de indicadores */}
        <div>
          <div className="mb-1.5 text-[11px] font-medium text-muted-foreground">
            Tipo de análisis financiero
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <OpcionVersion
              activa={version === "v1"}
              onClick={() => setVersion("v1")}
              titulo="Clásico (V1)"
              descripcion="VAN, TIR, Payback, IR, TRC, SD, RBC y WACC. Igual que siempre."
            />
            <OpcionVersion
              activa={version === "v2"}
              onClick={() => setVersion("v2")}
              titulo="Extendido (V2)"
              descripcion="Todo lo de V1 + punto de equilibrio, payback descontado, sensibilidad y apalancamiento."
            />
          </div>
        </div>

        {error && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={!nombre.trim() || creando}
          className="w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
        >
          {creando ? "Creando…" : "Empezar a construir"}
        </button>
      </form>
    </div>
  );
}

function OpcionVersion({
  activa,
  onClick,
  titulo,
  descripcion,
}: {
  activa: boolean;
  onClick: () => void;
  titulo: string;
  descripcion: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activa}
      className={cn(
        "flex flex-col rounded-md border p-2.5 text-left transition",
        activa
          ? "border-primary bg-primary/5 ring-1 ring-primary"
          : "border-border hover:border-primary/50"
      )}
    >
      <div className="flex items-center gap-1.5">
        <span
          className={cn(
            "flex h-3.5 w-3.5 items-center justify-center rounded-full border",
            activa ? "border-primary" : "border-muted-foreground/50"
          )}
        >
          {activa && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
        </span>
        <span className="text-xs font-semibold">{titulo}</span>
      </div>
      <span className="mt-1 text-[10px] leading-snug text-muted-foreground">
        {descripcion}
      </span>
    </button>
  );
}
