import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import {
  GraduationCap,
  Loader2,
  Search,
  ShieldCheck,
  Trash2,
  UserCheck,
  Users,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import {
  borrarCursoComoAdmin,
  cambiarRolUsuario,
  clonarProyectoAMiCuenta,
  listarTodosLosCursos,
  listarTodosLosProyectos,
  listarTodosLosUsuarios,
  obtenerEstadisticasGlobales,
  setearAdmin,
} from "@/lib/admin-supabase";
import type { Perfil, Rol } from "@/types/usuario";
import { cn } from "@/lib/utils";

type Tab = "usuarios" | "cursos" | "proyectos";

export default function AdminPanel() {
  const perfil = useAuthStore((s) => s.perfil);
  const [tab, setTab] = useState<Tab>("usuarios");
  const [stats, setStats] = useState<Awaited<ReturnType<typeof obtenerEstadisticasGlobales>> | null>(null);

  useEffect(() => {
    obtenerEstadisticasGlobales().then(setStats).catch(() => {});
  }, []);

  // Redirige si no es admin
  if (perfil && !perfil.es_admin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border-2 border-primary/40 bg-primary/5 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Panel admin</h1>
            <p className="text-xs text-muted-foreground">
              Vista global del simulador. Aquí ves y modificás todo el sistema.
            </p>
          </div>
        </div>

        {/* Estadísticas */}
        {stats && (
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs sm:grid-cols-5">
            <StatCard label="Usuarios" valor={stats.totalUsuarios} icon="👥" />
            <StatCard label="Docentes" valor={stats.totalDocentes} icon="🎓" />
            <StatCard label="Estudiantes" valor={stats.totalEstudiantes} icon="📚" />
            <StatCard label="Cursos" valor={stats.totalCursos} icon="🏫" />
            <StatCard label="Casos curso" valor={stats.totalCasosCurso} icon="📋" />
            <StatCard label="Proyectos" valor={stats.totalProyectos} icon="📁" />
            <StatCard label="Entregas" valor={stats.totalEntregas} icon="📤" />
            <StatCard label="Pendientes" valor={stats.entregasPendientes} icon="⏳" />
            <StatCard label="Admins" valor={stats.totalAdmins} icon="🛡️" />
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {(["usuarios", "cursos", "proyectos"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "rounded-t-md px-4 py-2 text-sm font-medium transition",
              tab === t
                ? "border-x border-t border-border bg-card text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === "usuarios" && <TabUsuarios />}
      {tab === "cursos" && <TabCursos />}
      {tab === "proyectos" && <TabProyectos />}
    </div>
  );
}

function StatCard({ label, valor, icon }: { label: string; valor: number; icon: string }) {
  return (
    <div className="rounded-md border border-border bg-card p-2 text-center">
      <div className="text-base">{icon}</div>
      <div className="text-xl font-bold tabular-nums">{valor}</div>
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TAB USUARIOS
// ════════════════════════════════════════════════════════════════════════════

function TabUsuarios() {
  const [usuarios, setUsuarios] = useState<Perfil[]>([]);
  const [cargando, setCargando] = useState(true);
  const [filtro, setFiltro] = useState("");

  const cargar = async () => {
    setCargando(true);
    try {
      const lista = await listarTodosLosUsuarios();
      setUsuarios(lista);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const filtrados = usuarios.filter((u) => {
    const q = filtro.toLowerCase();
    return (
      u.email.toLowerCase().includes(q) ||
      u.nombre.toLowerCase().includes(q) ||
      u.apellido.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-3 rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">
          <Users className="mr-1 inline h-4 w-4" />
          Usuarios ({filtrados.length})
        </h2>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            placeholder="Buscar email o nombre…"
            className="w-64 rounded-md border border-input bg-background py-1 pl-7 pr-2 text-xs"
          />
        </div>
      </div>

      {cargando ? (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
          Cargando usuarios…
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full text-xs">
            <thead className="bg-secondary/30 text-[10px] uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Nombre</th>
                <th className="p-2 text-center">Rol</th>
                <th className="p-2 text-center">Admin</th>
                <th className="p-2 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((u) => (
                <FilaUsuario key={u.id} usuario={u} onCambio={cargar} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function FilaUsuario({ usuario, onCambio }: { usuario: Perfil; onCambio: () => void }) {
  const [cambiando, setCambiando] = useState(false);

  const cambiarRol = async (nuevoRol: Rol) => {
    if (nuevoRol === usuario.rol) return;
    setCambiando(true);
    try {
      await cambiarRolUsuario(usuario.id, nuevoRol);
      onCambio();
    } finally {
      setCambiando(false);
    }
  };

  const toggleAdmin = async () => {
    if (!confirm(`¿${usuario.es_admin ? "Quitar" : "Dar"} permisos de admin a ${usuario.email}?`)) return;
    setCambiando(true);
    try {
      await setearAdmin(usuario.id, !usuario.es_admin);
      onCambio();
    } finally {
      setCambiando(false);
    }
  };

  return (
    <tr className="border-t border-border/40 hover:bg-secondary/20">
      <td className="p-2 font-mono text-[11px]">{usuario.email}</td>
      <td className="p-2">
        {usuario.nombre} {usuario.apellido}
      </td>
      <td className="p-2 text-center">
        <select
          value={usuario.rol}
          onChange={(e) => cambiarRol(e.target.value as Rol)}
          disabled={cambiando}
          className="rounded border border-input bg-background px-2 py-0.5 text-xs"
        >
          <option value="estudiante">Estudiante</option>
          <option value="docente">Docente</option>
        </select>
      </td>
      <td className="p-2 text-center">
        <button
          onClick={toggleAdmin}
          disabled={cambiando}
          className={cn(
            "rounded px-2 py-0.5 text-[10px] font-bold uppercase",
            usuario.es_admin
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-muted-foreground hover:bg-secondary/70"
          )}
        >
          {usuario.es_admin ? "🛡️ Admin" : "—"}
        </button>
      </td>
      <td className="p-2 text-right text-[10px] text-muted-foreground">
        {cambiando && <Loader2 className="ml-auto h-3 w-3 animate-spin" />}
      </td>
    </tr>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TAB CURSOS
// ════════════════════════════════════════════════════════════════════════════

function TabCursos() {
  const [cursos, setCursos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  const cargar = async () => {
    setCargando(true);
    try {
      setCursos(await listarTodosLosCursos());
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargar();
  }, []);

  const borrar = async (id: string, nombre: string) => {
    if (!confirm(`¿Borrar definitivamente el curso "${nombre}" y TODOS sus proyectos y entregas?`)) return;
    await borrarCursoComoAdmin(id);
    cargar();
  };

  return (
    <div className="space-y-3 rounded-lg border border-border bg-card p-4">
      <h2 className="text-sm font-semibold">
        <GraduationCap className="mr-1 inline h-4 w-4" />
        Cursos ({cursos.length})
      </h2>

      {cargando ? (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
          Cargando cursos…
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full text-xs">
            <thead className="bg-secondary/30 text-[10px] uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="p-2 text-left">Nombre</th>
                <th className="p-2 text-left">Materia · paralelo</th>
                <th className="p-2 text-left">Código</th>
                <th className="p-2 text-center">Estado</th>
                <th className="p-2 text-center">Frecuencia</th>
                <th className="p-2 text-right"></th>
              </tr>
            </thead>
            <tbody>
              {cursos.map((c) => (
                <tr key={c.id} className="border-t border-border/40 hover:bg-secondary/20">
                  <td className="p-2 font-medium">{c.nombre}</td>
                  <td className="p-2 text-muted-foreground">
                    {c.materia} {c.paralelo && `· ${c.paralelo}`}
                  </td>
                  <td className="p-2 font-mono">{c.codigo}</td>
                  <td className="p-2 text-center">{c.estado}</td>
                  <td className="p-2 text-center">{c.frecuencia_turnos}</td>
                  <td className="p-2 text-right">
                    <button
                      onClick={() => borrar(c.id, c.nombre)}
                      className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      title="Borrar curso"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TAB PROYECTOS
// ════════════════════════════════════════════════════════════════════════════

function TabProyectos() {
  const user = useAuthStore((s) => s.user);
  const [proyectos, setProyectos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [clonandoId, setClonandoId] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setProyectos(await listarTodosLosProyectos());
      } finally {
        setCargando(false);
      }
    })();
  }, []);

  const traerAMisProyectos = async (p: any) => {
    if (!user) return;
    if (!confirm(`¿Traer una copia de "${p.nombre}" a tus proyectos? El original no se toca.`)) return;
    setClonandoId(p.id);
    setAviso(null);
    try {
      await clonarProyectoAMiCuenta(p.id, user.id);
      setAviso(`Copia de "${p.nombre}" creada en tus proyectos. La verás en el selector de "Construir proyecto".`);
    } catch (e: any) {
      setAviso(`Error: ${e?.message ?? String(e)}`);
    } finally {
      setClonandoId(null);
    }
  };

  return (
    <div className="space-y-3 rounded-lg border border-border bg-card p-4">
      <h2 className="text-sm font-semibold">
        <UserCheck className="mr-1 inline h-4 w-4" />
        Proyectos ({proyectos.length})
      </h2>

      {aviso && (
        <div className="rounded-md border border-border bg-secondary/30 px-3 py-2 text-[11px]">
          {aviso}
        </div>
      )}

      {cargando ? (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="h-3 w-3 animate-spin" />
          Cargando proyectos…
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full text-xs">
            <thead className="bg-secondary/30 text-[10px] uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="p-2 text-left">Nombre</th>
                <th className="p-2 text-center">Tipo</th>
                <th className="p-2 text-left">Estudiante (id)</th>
                <th className="p-2 text-left">Curso (id)</th>
                <th className="p-2 text-center">Estado</th>
                <th className="p-2 text-right">Actualizado</th>
                <th className="p-2 text-right">Acción</th>
              </tr>
            </thead>
            <tbody>
              {proyectos.map((p) => (
                <tr key={p.id} className="border-t border-border/40 hover:bg-secondary/20">
                  <td className="p-2 font-medium">{p.nombre}</td>
                  <td className="p-2 text-center text-[10px]">
                    {p.tipo === "caso_curso" ? "🎓 caso" : p.tipo === "entrega_estudiante" ? "📝 entrega" : "📁 libre"}
                  </td>
                  <td className="p-2 font-mono text-[10px]">{p.estudiante_id?.slice(0, 8) ?? "—"}</td>
                  <td className="p-2 font-mono text-[10px]">{p.curso_id?.slice(0, 8) ?? "—"}</td>
                  <td className="p-2 text-center">{p.estado}</td>
                  <td className="p-2 text-right text-[10px] text-muted-foreground">
                    {p.actualizado_en
                      ? new Date(p.actualizado_en).toLocaleDateString("es-BO")
                      : "—"}
                  </td>
                  <td className="p-2 text-right">
                    <button
                      onClick={() => traerAMisProyectos(p)}
                      disabled={clonandoId === p.id}
                      className="rounded-md border border-primary/40 bg-primary/5 px-2 py-1 text-[10px] font-medium text-primary hover:bg-primary/10 disabled:opacity-50"
                    >
                      {clonandoId === p.id ? "Copiando…" : "📥 Traer a los míos"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
