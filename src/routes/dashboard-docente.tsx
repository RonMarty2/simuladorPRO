import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Copy, GraduationCap, Plus, Users } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import {
  crearCurso,
  listarInscritosDeCurso,
  listarMisCursos,
  type Curso,
  type FrecuenciaCurso,
  type InscripcionConPerfil,
} from "@/lib/cursos-supabase";

export default function DashboardDocente() {
  const perfil = useAuthStore((s) => s.perfil);
  const user = useAuthStore((s) => s.user);
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [cursoExpandido, setCursoExpandido] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    listarMisCursos(user.id)
      .then(setCursos)
      .catch(() => {})
      .finally(() => setCargando(false));
  }, [user]);

  if (perfil && perfil.rol !== "docente") return <Navigate to="/estudiante" replace />;

  const onCursoCreado = (curso: Curso) => {
    setCursos((prev) => [curso, ...prev]);
    setMostrarForm(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Panel del docente</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Hola {perfil?.nombre} — gestiona tus cursos y ve cómo van tus estudiantes.
          </p>
        </div>
        {!mostrarForm && (
          <button
            onClick={() => setMostrarForm(true)}
            className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Crear curso
          </button>
        )}
      </div>

      {mostrarForm && user && (
        <FormCrearCurso
          docenteId={user.id}
          onCreado={onCursoCreado}
          onCancelar={() => setMostrarForm(false)}
        />
      )}

      {cargando && <div className="text-sm text-muted-foreground">Cargando cursos…</div>}

      {!cargando && cursos.length === 0 && !mostrarForm && (
        <div className="rounded-lg border border-dashed border-border bg-card/50 p-8 text-center">
          <GraduationCap className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            Aún no tienes cursos creados. Click "Crear curso" para empezar.
          </p>
        </div>
      )}

      {cursos.map((c) => (
        <CursoCard
          key={c.id}
          curso={c}
          expandido={cursoExpandido === c.id}
          onToggle={() => setCursoExpandido(cursoExpandido === c.id ? null : c.id)}
        />
      ))}
    </div>
  );
}

function FormCrearCurso({
  docenteId,
  onCreado,
  onCancelar,
}: {
  docenteId: string;
  onCreado: (c: Curso) => void;
  onCancelar: () => void;
}) {
  const [nombre, setNombre] = useState("");
  const [materia, setMateria] = useState("Administración Financiera");
  const [paralelo, setParalelo] = useState("");
  const [frecuencia, setFrecuencia] = useState<FrecuenciaCurso>("mensual");
  const [creando, setCreando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreando(true);
    setError(null);
    try {
      const curso = await crearCurso({
        docente_id: docenteId,
        nombre,
        materia,
        paralelo: paralelo || undefined,
        frecuencia_turnos: frecuencia,
      });
      onCreado(curso);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al crear el curso");
    } finally {
      setCreando(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3 rounded-lg border border-border bg-card p-4">
      <h2 className="text-sm font-semibold">Nuevo curso</h2>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <CampoTexto label="Nombre del curso" valor={nombre} onChange={setNombre} required />
        <CampoTexto
          label="Materia"
          valor={materia}
          onChange={setMateria}
          placeholder="Administración Financiera, Matemática Financiera…"
          required
        />
        <CampoTexto
          label="Paralelo"
          valor={paralelo}
          onChange={setParalelo}
          placeholder="Opcional — ej: A, B, M-1"
        />
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Frecuencia de turnos</label>
          <select
            value={frecuencia}
            onChange={(e) => setFrecuencia(e.target.value as FrecuenciaCurso)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="mensual">Mensual (60 turnos / 5 años)</option>
            <option value="trimestral">Trimestral (20 turnos)</option>
            <option value="semestral">Semestral (10 turnos)</option>
          </select>
        </div>
      </div>
      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {error}
        </div>
      )}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={creando || !nombre || !materia}
          className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
        >
          {creando ? "Creando…" : "Crear curso"}
        </button>
        <button
          type="button"
          onClick={onCancelar}
          className="rounded-md border border-border px-3 py-2 text-sm text-foreground transition hover:bg-accent"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

function CampoTexto({
  label,
  valor,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  valor: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium">{label}</label>
      <input
        type="text"
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}

function CursoCard({
  curso,
  expandido,
  onToggle,
}: {
  curso: Curso;
  expandido: boolean;
  onToggle: () => void;
}) {
  const [inscritos, setInscritos] = useState<InscripcionConPerfil[] | null>(null);
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    if (expandido && !inscritos) {
      listarInscritosDeCurso(curso.id).then(setInscritos).catch(() => {});
    }
  }, [expandido, curso.id, inscritos]);

  const copiarCodigo = async () => {
    await navigator.clipboard.writeText(curso.codigo);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1500);
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold tracking-tight">{curso.nombre}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {curso.materia}
            {curso.paralelo && ` · Paralelo ${curso.paralelo}`} · {curso.frecuencia_turnos} ·{" "}
            {curso.duracion_anios} años
          </p>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Código inscripción
          </div>
          <button
            onClick={copiarCodigo}
            className="mt-0.5 flex items-center gap-1 rounded-md bg-secondary px-2.5 py-1 font-mono text-sm font-semibold transition hover:bg-secondary/70"
          >
            {curso.codigo}
            <Copy className="h-3 w-3" />
          </button>
          {copiado && (
            <div className="mt-0.5 text-[10px] text-emerald-600">Copiado ✓</div>
          )}
        </div>
      </div>

      <button
        onClick={onToggle}
        className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground transition hover:text-foreground"
      >
        <Users className="h-3.5 w-3.5" />
        {expandido ? "Ocultar" : "Ver"} estudiantes inscritos
        {inscritos && ` (${inscritos.length})`}
      </button>

      {expandido && (
        <div className="mt-3 border-t border-border pt-3">
          {!inscritos ? (
            <div className="text-xs text-muted-foreground">Cargando…</div>
          ) : inscritos.length === 0 ? (
            <div className="text-xs text-muted-foreground">
              Aún no hay inscritos. Comparte el código <strong>{curso.codigo}</strong> con tus
              estudiantes.
            </div>
          ) : (
            <ul className="space-y-1.5">
              {inscritos.map((i) => (
                <li key={i.id} className="flex items-center justify-between text-xs">
                  <span>
                    {i.nombre} {i.apellido}
                    {i.universidad && (
                      <span className="ml-2 text-muted-foreground">· {i.universidad}</span>
                    )}
                  </span>
                  <span className="text-muted-foreground">{i.email}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
