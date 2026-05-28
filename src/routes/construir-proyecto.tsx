import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useProyectoStore } from "@/stores/proyecto-store";
import { eliminarProyecto, listarMisProyectos, listarProyectosGrupales } from "@/lib/proyecto-supabase";
import { useAutoGuardado } from "@/hooks/useAutoGuardado";
import EmpezarProyecto from "@/components/constructor/EmpezarProyecto";
import BarraProgreso from "@/components/constructor/BarraProgreso";
import BotonEntregar from "@/components/constructor/BotonEntregar";
import { BannerTipoProyecto } from "@/components/constructor/BadgeTipoProyecto";
import { construirFlujoCaja } from "@/lib/flujo-proyecto";
import SelectorProyecto, {
  guardarProyectoActivo,
  leerProyectoActivo,
} from "@/components/constructor/SelectorProyecto";
import type { Proyecto } from "@/types/proyecto";
import Paso1Datos from "@/components/constructor/pasos/Paso1Datos";
import Paso2Proyeccion from "@/components/constructor/pasos/Paso2Proyeccion";
import Paso2Inversiones from "@/components/constructor/pasos/Paso2Inversiones";
import Paso3Capital from "@/components/constructor/pasos/Paso3Capital";
import Paso4Personal from "@/components/constructor/pasos/Paso4Personal";
import Paso6CostosProduccion from "@/components/constructor/pasos/Paso6CostosProduccion";
import Paso7GastosOperativos from "@/components/constructor/pasos/Paso7GastosOperativos";
import Paso9Financiamiento from "@/components/constructor/pasos/Paso9Financiamiento";
import Paso9Resumen from "@/components/constructor/pasos/Paso9Resumen";
import BotonGuardarComoCaso from "@/components/docente/BotonGuardarComoCaso";
import BotonVistaPreviaEstudiante from "@/components/docente/BotonVistaPreviaEstudiante";

const TOTAL_PASOS = 9;

const titulosPasos: Record<number, string> = {
  1: "Datos generales",
  2: "Proyección de demanda",
  3: "Inversiones en activo fijo",
  4: "Personal + aportes patronales",
  5: "Costos directos de producción",
  6: "Gastos administrativos y comercialización",
  7: "Financiamiento + WACC",
  8: "Capital de trabajo (se calcula de los anteriores)",
  9: "Resumen y flujo de caja",
};

const titulosCortos: Record<number, string> = {
  1: "Datos",
  2: "Demanda",
  3: "Inversiones",
  4: "Personal",
  5: "Costos directos",
  6: "Gastos op.",
  7: "Financiam.",
  8: "Capital",
  9: "Resumen",
};

const LS_KEY_PASO = "simulador.pasoActual";

function leerPasoGuardado(proyectoId: string | undefined): number {
  if (typeof window === "undefined" || !proyectoId) return 1;
  try {
    const raw = localStorage.getItem(`${LS_KEY_PASO}.${proyectoId}`);
    const n = raw ? parseInt(raw, 10) : 1;
    return n >= 1 && n <= 9 ? n : 1;
  } catch {
    return 1;
  }
}

function guardarPaso(proyectoId: string | undefined, paso: number) {
  if (typeof window === "undefined" || !proyectoId) return;
  try {
    localStorage.setItem(`${LS_KEY_PASO}.${proyectoId}`, String(paso));
  } catch {
    /* ignore */
  }
}

export default function ConstruirProyecto() {
  const user = useAuthStore((s) => s.user);
  const proyecto = useProyectoStore((s) => s.proyecto);
  const cargar = useProyectoStore((s) => s.cargar);
  const limpiar = useProyectoStore((s) => s.limpiar);
  const [pasoActual, setPasoActualState] = useState(1);
  const [iniciando, setIniciando] = useState(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [todosProyectos, setTodosProyectos] = useState<Proyecto[]>([]);
  const estadoGuardado = useAutoGuardado(proyecto);

  // Setter que también persiste en localStorage
  const setPasoActual = (paso: number | ((prev: number) => number)) => {
    setPasoActualState((prev) => {
      const nuevo = typeof paso === "function" ? paso(prev) : paso;
      guardarPaso(proyecto?.id, nuevo);
      return nuevo;
    });
  };

  useEffect(() => {
    if (!user) return;
    Promise.all([listarMisProyectos(user.id), listarProyectosGrupales(user.id)])
      .then(([mios, grupales]) => {
        // Evita duplicar el proyecto grupal si el usuario es el dueño (docente).
        const ids = new Set(mios.map((p) => p.id));
        const proyectos = [...mios, ...grupales.filter((g) => !ids.has(g.id))];
        setTodosProyectos(proyectos);
        if (proyectos.length > 0) {
          // Elegir el proyecto activo: el guardado en localStorage (si existe
          // y todavía está en la lista) o el más reciente como fallback.
          const idActivo = leerProyectoActivo(user.id);
          const elegido =
            (idActivo && proyectos.find((p) => p.id === idActivo)) || proyectos[0];
          cargar(elegido);
          guardarProyectoActivo(user.id, elegido.id);
          setPasoActualState(leerPasoGuardado(elegido.id));
        }
        setErrorCarga(null);
      })
      .catch((e) => {
        setErrorCarga(e?.message ?? String(e));
      })
      .finally(() => setIniciando(false));
  }, [user, cargar]);

  const abandonarProyecto = async () => {
    if (!proyecto) return;
    if (!confirm(`¿Borrar definitivamente "${proyecto.nombre}"?`)) return;
    await eliminarProyecto(proyecto.id);
    limpiar();
    // Limpia el proyecto activo de localStorage para que la siguiente carga
    // tome el más reciente disponible.
    if (user) {
      try {
        localStorage.removeItem(`simulador.proyectoActivo.${user.id}`);
      } catch {}
    }
    // Recargar para que se cargue el siguiente proyecto disponible
    setTimeout(() => window.location.reload(), 50);
  };

  if (iniciando) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Cargando tu proyecto…
      </div>
    );
  }

  if (errorCarga) {
    return (
      <div className="mx-auto max-w-md rounded-lg border border-destructive/40 bg-destructive/5 p-6 text-center">
        <h2 className="text-base font-semibold text-destructive">No se pudo cargar tu proyecto</h2>
        <p className="mt-2 text-xs text-muted-foreground">{errorCarga}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-3 rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground hover:bg-primary/90"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!proyecto) {
    return <EmpezarProyecto />;
  }

  return (
    <div className="space-y-4">
      {/* Selector de proyecto múltiple */}
      <SelectorProyecto proyectos={todosProyectos} />

      {/* Banner del tipo de proyecto — separa visualmente el selector de la barra */}
      <BannerTipoProyecto tipo={proyecto.tipo} />

      <BarraProgreso
        pasoActual={pasoActual}
        totalPasos={TOTAL_PASOS}
        nombreProyecto={proyecto.nombre}
        version={proyecto.version}
        estadoGuardado={estadoGuardado}
        onCambiarPaso={setPasoActual}
        titulos={titulosPasos}
        titulosCortos={titulosCortos}
      />

      <ContenidoPaso paso={pasoActual} />

      <EntregarPasoActual pasoActual={pasoActual} />

      <div className="flex items-center justify-between">
        {pasoActual > 1 ? (
          <button
            onClick={() => setPasoActual((p) => Math.max(1, p - 1))}
            className="flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm text-foreground transition hover:bg-accent"
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </button>
        ) : (
          <span />
        )}

        <div className="flex flex-col items-center gap-1.5 text-center">
          <span className="text-xs text-muted-foreground">
            {titulosPasos[pasoActual]}
          </span>
          <div className="flex items-center gap-1.5">
            <BotonGuardarComoCaso />
            <BotonVistaPreviaEstudiante />
          </div>
          <button
            onClick={abandonarProyecto}
            className="flex items-center gap-1.5 text-[10px] text-muted-foreground transition hover:text-destructive"
          >
            <Trash2 className="h-3 w-3" />
            Borrar este proyecto
          </button>
        </div>

        {pasoActual < TOTAL_PASOS ? (
          <button
            onClick={() => setPasoActual((p) => Math.min(TOTAL_PASOS, p + 1))}
            className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            Siguiente
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}

function ContenidoPaso({ paso }: { paso: number }) {
  switch (paso) {
    case 1:
      return <Paso1Datos />;
    case 2:
      return <Paso2Proyeccion />;
    case 3:
      return <Paso2Inversiones />;
    case 4:
      return <Paso4Personal />;
    case 5:
      return <Paso6CostosProduccion />;
    case 6:
      return <Paso7GastosOperativos />;
    case 7:
      return <Paso9Financiamiento />;
    case 8:
      return <Paso3Capital />;
    case 9:
      return <Paso9Resumen />;
    default:
      return null;
  }
}

// Inserta el BotonEntregar para el paso actual. Computa los indicadores con el
// motor del flujo de caja (que ya hacen las pantallas internamente).
function EntregarPasoActual({ pasoActual }: { pasoActual: number }) {
  const proyecto = useProyectoStore((s) => s.proyecto);
  const calc = useMemo(() => (proyecto ? construirFlujoCaja(proyecto) : null), [proyecto]);
  if (!proyecto || !calc) return null;
  // Las plantillas del docente no se entregan (las propias BotonEntregar igual
  // lo filtra, pero evitamos hasta computar para no contaminar visualmente).
  if (proyecto.tipo === "caso_curso") return null;
  return (
    <BotonEntregar
      paso={pasoActual}
      indicadores={{
        van: calc.indicadores.van,
        tir: isFinite(calc.indicadores.tir) ? calc.indicadores.tir : 0,
        wacc: calc.wacc,
        payback: isFinite(calc.indicadores.payback) ? calc.indicadores.payback : 0,
      }}
    />
  );
}
