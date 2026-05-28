import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { AlertTriangle, Copy, GraduationCap, Plus, Trash2, Trophy, Users } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import {
  crearCurso,
  eliminarCurso,
  listarInscritosDeCurso,
  listarMisCursos,
  type Curso,
  type FrecuenciaCurso,
  type InscripcionConPerfil,
} from "@/lib/cursos-supabase";
import RankingCurso from "@/components/docente/RankingCurso";
import EntregasCurso from "@/components/docente/EntregasCurso";
import GruposDocente from "@/components/curso/GruposDocente";
import CasosCurso from "@/components/curso/CasosCurso";
import Recomendacion from "@/components/constructor/Recomendacion";
import SelectorModoSimulacion from "@/components/docente/SelectorModoSimulacion";
import type { ModoSimulacion } from "@/lib/cursos-supabase";

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

  const onCursoEliminado = (cursoId: string) => {
    setCursos((prev) => prev.filter((c) => c.id !== cursoId));
    setCursoExpandido((id) => (id === cursoId ? null : id));
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
          onEliminado={() => onCursoEliminado(c.id)}
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
  const [modo, setModo] = useState<ModoSimulacion>("automatico");
  const [eventosCurados, setEventosCurados] = useState<string[]>([]);
  const [permiteLibre, setPermiteLibre] = useState(true);
  const [creando, setCreando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (modo === "curado" && eventosCurados.length === 0) {
      setError("Elegiste 'eventos curados' pero no seleccionaste ninguno. Marca al menos 1 evento o cambia el modo.");
      return;
    }
    setCreando(true);
    setError(null);
    try {
      const curso = await crearCurso({
        docente_id: docenteId,
        nombre,
        materia,
        paralelo: paralelo || undefined,
        frecuencia_turnos: frecuencia,
        modo_simulacion: modo,
        eventos_curados: modo === "curado" ? eventosCurados : undefined,
        permite_proyecto_libre: permiteLibre,
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
          <p className="text-[11px] leading-snug text-muted-foreground">
            Cada <strong>turno</strong> = un período del proyecto. Mensual = 60 turnos en 5
            años (más decisiones y detalle); Semestral = 10 turnos (más rápido). En cada turno
            pueden aparecer eventos económicos.
          </p>
        </div>
      </div>

      {/* Explicación de qué es la simulación, con ejemplos reales */}
      <Recomendacion titulo="🎲 ¿Qué es la simulación? Turnos, frecuencia y modo — con ejemplos">
        <p>
          Después de <strong>construir su proyecto</strong> (las 9 etapas: inversión, costos,
          financiamiento, flujo…), cada estudiante lo pone a prueba en una{" "}
          <strong>simulación de 5 años</strong>. El proyecto avanza por <strong>turnos</strong>;
          en cada turno puede ocurrir un <strong>evento económico boliviano real</strong> que
          cambia sus números, y el estudiante decide cómo reaccionar.
        </p>
        <p>
          <strong>Ejemplos de eventos:</strong> «La inflación sube a 8,2%» (suben tus costos),
          «El dólar paralelo sube 10%» (importar sale más caro), «Sequía afecta la producción»,
          «Sube el bono Juancito Pinto» (más demanda en librerías). Así el estudiante ve qué
          tan resistente es su proyecto ante la realidad, no solo en el papel.
        </p>
        <p className="border-t border-sky-200 pt-1.5 dark:border-sky-900">
          <strong>Frecuencia de turnos</strong> = en cuántos pedazos se parten los 5 años{" "}
          <em>simulados del proyecto</em>. <strong>No es tu calendario de clases</strong>: los
          5 años son la vida del negocio (lo que proyecta tu flujo de caja), no la duración del
          curso. Un alumno puede jugar todos los turnos en una sola tarde.
        </p>
        <ul className="ml-4 list-disc space-y-0.5">
          <li><strong>Mensual</strong> — cada turno = 1 mes → <strong>60 turnos</strong>: más detalle y decisiones.</li>
          <li><strong>Trimestral</strong> — cada turno = 3 meses → <strong>20 turnos</strong>: equilibrio.</li>
          <li><strong>Semestral</strong> — cada turno = 6 meses → <strong>10 turnos</strong>: rápido, si el foco es construir el proyecto.</li>
        </ul>
        <p className="text-muted-foreground">
          Si quieres <strong>acompañar tu ritmo de clase</strong> (≈1 turno por clase, sobre todo
          en modo «Docente dispara»): una vez por semana ~5 meses → <strong>Trimestral (20)</strong>;
          clase diaria por pocas semanas → <strong>Mensual (60)</strong>. Igual es opcional.
        </p>
        <p className="border-t border-sky-200 pt-1.5 dark:border-sky-900">
          <strong>Modo de simulación</strong> = quién decide cuándo caen los eventos:
        </p>
        <ul className="ml-4 list-disc space-y-0.5">
          <li>
            <strong>Automático:</strong> el sistema sortea los eventos al azar (según su
            probabilidad real) y el alumno avanza solo, a su ritmo.{" "}
            <em>Úsalo para tarea/práctica en casa.</em>
          </li>
          <li>
            <strong>Docente dispara cada evento:</strong> tú, desde tu panel, lanzas el evento
            cuando quieres y a todos a la vez (ej. en la clase dices «ahora a todos les sube la
            inflación»). <em>Ideal para clase presencial sincronizada.</em>
          </li>
          <li>
            <strong>Eventos curados:</strong> tú eliges de antemano cuáles de los ~50 eventos
            van a enfrentar (ej. solo devaluación + sequía). <em>Ideal para un examen con una
            intención pedagógica clara.</em>
          </li>
        </ul>
        <p className="text-muted-foreground">
          Podés cambiar el modo después desde el curso. Si recién empezás, dejá{" "}
          <strong>Automático</strong>.
        </p>
      </Recomendacion>

      {/* Proyecto individual del estudiante */}
      <div className="rounded-md border border-border bg-secondary/20 p-3">
        <label className="flex cursor-pointer items-start gap-2">
          <input
            type="checkbox"
            checked={permiteLibre}
            onChange={(e) => setPermiteLibre(e.target.checked)}
            className="mt-0.5"
          />
          <span className="text-xs">
            <strong>Dejar que cada estudiante elija y arme su propio proyecto</strong> (V1/V2 y
            modelo de ingreso). Recomendado: cada alumno trae una idea distinta.
            <span className="mt-0.5 block text-[11px] text-muted-foreground">
              Si lo desmarcas, los estudiantes solo trabajan el <strong>caso</strong> que tú
              publiques o el <strong>proyecto grupal</strong>. Lo puedes cambiar después.
            </span>
          </span>
        </label>
      </div>

      {/* Selector de modo de simulación (incluye eventos curados si aplica) */}
      <SelectorModoSimulacion
        modo={modo}
        eventosCurados={eventosCurados}
        onCambiar={(m, ids) => {
          setModo(m);
          setEventosCurados(ids);
        }}
      />

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
  onEliminado,
}: {
  curso: Curso;
  expandido: boolean;
  onToggle: () => void;
  onEliminado: () => void;
}) {
  const [inscritos, setInscritos] = useState<InscripcionConPerfil[] | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [vista, setVista] = useState<"inscritos" | "ranking" | "entregas" | "grupos" | "casos">("ranking");
  const [confirmando, setConfirmando] = useState(false);
  const [textoConfirm, setTextoConfirm] = useState("");
  const [borrando, setBorrando] = useState(false);
  const [errorBorrar, setErrorBorrar] = useState<string | null>(null);

  const borrar = async () => {
    setBorrando(true);
    setErrorBorrar(null);
    try {
      await eliminarCurso(curso.id);
      onEliminado();
    } catch (e) {
      setErrorBorrar(e instanceof Error ? e.message : "No se pudo borrar el curso");
      setBorrando(false);
    }
  };

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

  // Ir a una pestaña: la selecciona y abre la tarjeta si estaba cerrada.
  type Vista = "inscritos" | "ranking" | "entregas" | "grupos" | "casos";
  const irA = (tab: Vista) => {
    setVista(tab);
    if (!expandido) onToggle();
  };
  const claseTab = (tab: Vista) =>
    cn(
      "rounded px-2.5 py-1 transition",
      expandido && vista === tab
        ? "bg-primary text-primary-foreground"
        : "bg-secondary hover:bg-secondary/70"
    );

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

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button onClick={() => irA("ranking")} className={claseTab("ranking")}>
            <Trophy className="mr-1 inline h-3 w-3" />
            Ranking
          </button>
          <button onClick={() => irA("inscritos")} className={claseTab("inscritos")}>
            <Users className="mr-1 inline h-3 w-3" />
            Inscritos{inscritos ? ` (${inscritos.length})` : ""}
          </button>
          <button onClick={() => irA("entregas")} className={claseTab("entregas")}>
            📥 Entregas
          </button>
          <button onClick={() => irA("grupos")} className={claseTab("grupos")}>
            🤝 Grupos
          </button>
          <button onClick={() => irA("casos")} className={claseTab("casos")}>
            🎓 Casos
          </button>
          {expandido && (
            <button
              onClick={onToggle}
              className="rounded px-2 py-1 text-muted-foreground transition hover:text-foreground"
            >
              Ocultar
            </button>
          )}
        </div>
        {!confirmando && (
          <button
            onClick={() => {
              setConfirmando(true);
              setTextoConfirm("");
              setErrorBorrar(null);
            }}
            className="flex items-center gap-1 text-[11px] text-muted-foreground transition hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Borrar curso
          </button>
        )}
      </div>

      {confirmando && (
        <div className="mt-3 rounded-md border border-destructive/40 bg-destructive/5 p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-destructive" />
            <div className="text-xs text-foreground">
              <p className="font-semibold text-destructive">
                Esto borra el curso de forma permanente.
              </p>
              <p className="mt-1 text-muted-foreground">
                También se eliminarán <strong>las inscripciones, los proyectos y las
                entregas</strong> de los estudiantes de este curso. No se puede deshacer.
              </p>
              <p className="mt-2">
                Para confirmar, escribe el código del curso:{" "}
                <strong className="font-mono">{curso.codigo}</strong>
              </p>
            </div>
          </div>

          <input
            type="text"
            value={textoConfirm}
            onChange={(e) => setTextoConfirm(e.target.value)}
            placeholder={curso.codigo}
            autoFocus
            className="mt-2 w-full rounded-md border border-input bg-background px-3 py-1.5 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-destructive/40"
          />

          {errorBorrar && (
            <div className="mt-2 text-[11px] text-destructive">{errorBorrar}</div>
          )}

          <div className="mt-2 flex gap-2">
            <button
              onClick={borrar}
              disabled={textoConfirm.trim() !== curso.codigo || borrando}
              className="flex items-center gap-1.5 rounded-md bg-destructive px-3 py-1.5 text-xs font-medium text-destructive-foreground transition hover:bg-destructive/90 disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {borrando ? "Borrando…" : "Borrar definitivamente"}
            </button>
            <button
              onClick={() => setConfirmando(false)}
              disabled={borrando}
              className="rounded-md border border-border px-3 py-1.5 text-xs text-foreground transition hover:bg-accent disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {expandido && (
        <div className="mt-3 space-y-3 border-t border-border pt-3">
          {vista === "entregas" && <EntregasCurso cursoId={curso.id} />}

          {vista === "grupos" && <GruposDocente curso={curso} />}

          {vista === "casos" && <CasosCurso cursoId={curso.id} />}

          {vista === "ranking" && (
            <RankingCurso
              cursoId={curso.id}
              curso={{ nombre: curso.nombre, codigo: curso.codigo, materia: curso.materia }}
            />
          )}

          {vista === "inscritos" && (
            !inscritos ? (
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
            )
          )}
        </div>
      )}
    </div>
  );
}
