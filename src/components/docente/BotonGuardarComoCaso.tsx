import { useEffect, useState } from "react";
import { BookmarkPlus, CheckCircle2, Loader2, X } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { listarMisCursos, type Curso } from "@/lib/cursos-supabase";
import { guardarComoCasoDelCurso, guardarProyecto } from "@/lib/proyecto-supabase";
import { useProyectoStore } from "@/stores/proyecto-store";

const PASOS = [
  { n: 1, label: "Datos generales", desc: "El estudiante define ubicación, descripción, sector" },
  { n: 2, label: "Demanda y precios", desc: "El estudiante proyecta cantidades y precios" },
  { n: 3, label: "Inversiones fijas", desc: "El estudiante decide qué activos comprar" },
  { n: 4, label: "Personal", desc: "El estudiante define puestos y sueldos" },
  { n: 5, label: "Costos directos", desc: "El estudiante calcula insumos por producto" },
  { n: 6, label: "Gastos operativos", desc: "El estudiante define admin y comercialización" },
  { n: 7, label: "Financiamiento", desc: "El estudiante decide la mezcla deuda/capital" },
  { n: 8, label: "Capital de trabajo", desc: "El estudiante elige meses de buffer" },
  { n: 9, label: "Resumen (solo simula)", desc: "El estudiante solo ejecuta la simulación" },
];

export default function BotonGuardarComoCaso() {
  const perfil = useAuthStore((s) => s.perfil);
  const proyecto = useProyectoStore((s) => s.proyecto);
  const [abierto, setAbierto] = useState(false);
  const [toast, setToast] = useState<{ pasoInicio: number; cursoNombre: string } | null>(null);

  if (perfil?.rol !== "docente" || !proyecto) return null;

  return (
    <>
      <button
        onClick={() => setAbierto(true)}
        className="flex items-center gap-1.5 rounded-md border border-amber-400 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-900 hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100"
        title="Convertir este proyecto en un caso plantilla para tus estudiantes"
      >
        <BookmarkPlus className="h-3.5 w-3.5" />
        Guardar como caso del curso
      </button>

      {abierto && (
        <ModalGuardar
          onCerrar={(exitoso) => {
            setAbierto(false);
            if (exitoso) {
              setToast(exitoso);
              // El toast desaparece solo después de 6 segundos
              setTimeout(() => setToast(null), 6000);
            }
          }}
        />
      )}

      {toast && <ToastExito {...toast} onCerrar={() => setToast(null)} />}
    </>
  );
}

function ToastExito({
  pasoInicio,
  cursoNombre,
  onCerrar,
}: {
  pasoInicio: number;
  cursoNombre: string;
  onCerrar: () => void;
}) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
      <div className="pointer-events-auto flex max-w-md items-start gap-3 rounded-lg border border-emerald-400 bg-emerald-50 px-4 py-3 shadow-lg dark:border-emerald-700 dark:bg-emerald-950">
        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
          <CheckCircle2 className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1 text-xs">
          <div className="font-semibold text-emerald-900 dark:text-emerald-100">
            Caso guardado en "{cursoNombre}"
          </div>
          <div className="mt-0.5 text-emerald-900/80 dark:text-emerald-100/80">
            Tus estudiantes inscritos podrán tomarlo. Empiezan desde el{" "}
            <strong>paso {pasoInicio}</strong>.
          </div>
        </div>
        <button
          onClick={onCerrar}
          className="flex-shrink-0 rounded p-0.5 text-emerald-900/70 hover:bg-emerald-200 dark:text-emerald-100/70 dark:hover:bg-emerald-900"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function ModalGuardar({
  onCerrar,
}: {
  onCerrar: (exitoso: { pasoInicio: number; cursoNombre: string } | null) => void;
}) {
  const perfil = useAuthStore((s) => s.perfil)!;
  const proyecto = useProyectoStore((s) => s.proyecto)!;
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [cargandoCursos, setCargandoCursos] = useState(true);
  const [cursoId, setCursoId] = useState<string>("");
  const [pasoInicio, setPasoInicio] = useState(2);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listarMisCursos(perfil.id)
      .then((cs) => {
        setCursos(cs.filter((c) => c.estado === "activo"));
        if (cs.length > 0) setCursoId(cs[0].id);
      })
      .catch((e) => setError(String(e?.message ?? e)))
      .finally(() => setCargandoCursos(false));
  }, [perfil.id]);

  const guardar = async () => {
    if (!cursoId) {
      setError("Elige un curso.");
      return;
    }
    setError(null);
    setGuardando(true);
    try {
      // 1. Aseguramos que el proyecto esté guardado (con su curso_id)
      const proyectoConCurso = { ...proyecto, curso_id: cursoId };
      await guardarProyecto(proyectoConCurso);
      // 2. Marcar como caso del curso
      await guardarComoCasoDelCurso(proyecto.id, cursoId, pasoInicio);
      const cursoElegido = cursos.find((c) => c.id === cursoId);
      const cursoNombre = cursoElegido?.nombre ?? "el curso";
      onCerrar({ pasoInicio, cursoNombre });
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setGuardando(false);
    }
  };

  const pasoSeleccionado = PASOS.find((p) => p.n === pasoInicio)!;
  const pasosEntregados = PASOS.filter((p) => p.n < pasoInicio);
  const pasosACompletar = PASOS.filter((p) => p.n >= pasoInicio);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-lg bg-card shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <div>
            <h2 className="text-base font-semibold">Guardar como caso del curso</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              "{proyecto.nombre}" se convertirá en plantilla para tus estudiantes.
            </p>
          </div>
          <button onClick={() => onCerrar(null)} className="rounded-md p-1 hover:bg-secondary">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 p-4">
          {/* Selector de curso */}
          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Curso destino
            </label>
            {cargandoCursos ? (
              <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                Cargando tus cursos…
              </div>
            ) : cursos.length === 0 ? (
              <div className="mt-1 rounded-md border border-dashed border-amber-400 bg-amber-50 p-3 text-xs text-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
                No tienes cursos activos. Crea uno desde el panel docente primero.
              </div>
            ) : (
              <select
                value={cursoId}
                onChange={(e) => setCursoId(e.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
              >
                {cursos.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre} {c.paralelo ? `· ${c.paralelo}` : ""} ({c.codigo})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Slider de paso inicio */}
          <div>
            <label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              ¿Desde qué paso debe empezar a trabajar el estudiante?
            </label>
            <div className="mt-2 flex items-center gap-2">
              <input
                type="range"
                min={1}
                max={9}
                step={1}
                value={pasoInicio}
                onChange={(e) => setPasoInicio(Number(e.target.value))}
                className="flex-1"
              />
              <span className="w-16 text-right text-sm font-bold">
                Paso {pasoInicio}
              </span>
            </div>
            <div className="mt-1.5 rounded-md bg-secondary/50 p-2">
              <div className="text-xs font-semibold">{pasoSeleccionado.label}</div>
              <div className="text-[11px] text-muted-foreground">{pasoSeleccionado.desc}</div>
            </div>
          </div>

          {/* Vista previa */}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div className="rounded-md border border-emerald-400/60 bg-emerald-50 p-2 dark:bg-emerald-950/20">
              <div className="text-[10px] font-bold uppercase tracking-wide text-emerald-900 dark:text-emerald-100">
                ✓ Recibe ya armado ({pasosEntregados.length})
              </div>
              <ul className="mt-1 space-y-0.5 text-[11px] text-emerald-900/80 dark:text-emerald-100/80">
                {pasosEntregados.length === 0 ? (
                  <li className="italic">— Ningún paso —</li>
                ) : (
                  pasosEntregados.map((p) => (
                    <li key={p.n}>
                      {p.n}. {p.label}
                    </li>
                  ))
                )}
              </ul>
            </div>
            <div className="rounded-md border border-sky-400/60 bg-sky-50 p-2 dark:bg-sky-950/20">
              <div className="text-[10px] font-bold uppercase tracking-wide text-sky-900 dark:text-sky-100">
                ✎ Debe completar ({pasosACompletar.length})
              </div>
              <ul className="mt-1 space-y-0.5 text-[11px] text-sky-900/80 dark:text-sky-100/80">
                {pasosACompletar.map((p) => (
                  <li key={p.n}>
                    {p.n}. {p.label}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Ficha pedagógica */}
          <div className="rounded-md border border-border bg-secondary/30 p-2 text-[11px] text-muted-foreground">
            <strong className="text-foreground">📌 Notas:</strong> Tu caso completo queda
            guardado como referencia para comparar contra cada entrega del estudiante. Los
            estudiantes que tomen el caso DESPUÉS de cambios tuyos verán los nuevos valores;
            los que ya empezaron mantienen su versión.
          </div>

          {error && (
            <div className="rounded-md border border-destructive/60 bg-destructive/10 p-2 text-xs text-destructive">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-border p-4">
          <button
            onClick={() => onCerrar(null)}
            disabled={guardando}
            className="rounded-md border border-border px-3 py-1.5 text-xs hover:bg-secondary disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={guardar}
            disabled={guardando || cursos.length === 0 || !cursoId}
            className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {guardando && <Loader2 className="h-3 w-3 animate-spin" />}
            Guardar como caso del curso
          </button>
        </div>
      </div>
    </div>
  );
}
