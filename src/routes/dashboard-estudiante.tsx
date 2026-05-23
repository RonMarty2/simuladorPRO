import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { GraduationCap, Hammer, KeyRound } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import {
  buscarCursoPorCodigo,
  inscribirseACurso,
  listarMisInscripciones,
  type Curso,
} from "@/lib/cursos-supabase";

export default function DashboardEstudiante() {
  const perfil = useAuthStore((s) => s.perfil);
  const user = useAuthStore((s) => s.user);
  const [inscripciones, setInscripciones] = useState<Array<{ curso: Curso; inscrito_en: string }>>([]);
  const [cargando, setCargando] = useState(true);
  const [codigoInscripcion, setCodigoInscripcion] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [inscribiendo, setInscribiendo] = useState(false);

  useEffect(() => {
    if (!user) return;
    listarMisInscripciones(user.id)
      .then(setInscripciones)
      .catch(() => {})
      .finally(() => setCargando(false));
  }, [user]);

  if (perfil && perfil.rol !== "estudiante") return <Navigate to="/docente" replace />;

  const inscribirse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError(null);
    setInscribiendo(true);
    try {
      const curso = await buscarCursoPorCodigo(codigoInscripcion.trim());
      if (!curso) {
        setError("Código no válido o curso no activo.");
        return;
      }
      if (inscripciones.some((i) => i.curso.id === curso.id)) {
        setError("Ya estás inscrito en este curso.");
        return;
      }
      await inscribirseACurso({ curso_id: curso.id, estudiante_id: user.id });
      const lista = await listarMisInscripciones(user.id);
      setInscripciones(lista);
      setCodigoInscripcion("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al inscribirte");
    } finally {
      setInscribiendo(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Hola, {perfil?.nombre} 👋</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Rol: <span className="capitalize">{perfil?.rol}</span>
          {perfil?.universidad && ` · ${perfil.universidad}`}
        </p>
      </div>

      <Link
        to="/construir"
        className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 transition hover:border-foreground"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Hammer className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium">Construir mi proyecto</div>
          <div className="text-xs text-muted-foreground">
            10 pasos guiados con cálculos en vivo. Auto-guardado.
          </div>
        </div>
        <div className="text-xs text-muted-foreground">→</div>
      </Link>

      <form
        onSubmit={inscribirse}
        className="space-y-3 rounded-lg border border-border bg-card p-4"
      >
        <div className="flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Inscribirme a un curso</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Pídele a tu docente el <strong>código de 6 letras</strong> de su curso.
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={codigoInscripcion}
            onChange={(e) => setCodigoInscripcion(e.target.value.toUpperCase())}
            placeholder="ABCDEF"
            maxLength={6}
            className="flex-1 rounded-md border border-input bg-background px-3 py-2 font-mono text-sm tracking-widest focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="submit"
            disabled={inscribiendo || codigoInscripcion.length !== 6}
            className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
          >
            {inscribiendo ? "..." : "Inscribirme"}
          </button>
        </div>
        {error && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </div>
        )}
      </form>

      <div className="rounded-lg border border-border bg-card p-4">
        <div className="mb-3 flex items-center gap-2">
          <GraduationCap className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Mis cursos</h2>
        </div>
        {cargando ? (
          <div className="text-xs text-muted-foreground">Cargando…</div>
        ) : inscripciones.length === 0 ? (
          <div className="text-xs text-muted-foreground">
            Aún no estás inscrito en ningún curso. Usa el código que te dé tu docente.
          </div>
        ) : (
          <ul className="space-y-2">
            {inscripciones.map(({ curso, inscrito_en }) => (
              <li
                key={curso.id}
                className="flex items-start justify-between gap-3 rounded-md border border-border p-3 text-sm"
              >
                <div>
                  <div className="font-medium">{curso.nombre}</div>
                  <div className="text-xs text-muted-foreground">
                    {curso.materia}
                    {curso.paralelo && ` · Paralelo ${curso.paralelo}`}
                  </div>
                  <div className="mt-1 text-[10px] text-muted-foreground">
                    Inscrito el {new Date(inscrito_en).toLocaleDateString("es-BO")}
                  </div>
                </div>
                <span className="rounded bg-secondary px-2 py-0.5 font-mono text-[10px]">
                  {curso.codigo}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
