import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
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
  guardarProyectoSemanaEActivo,
  leerProyectoActivo,
  leerProyectoSemanaEActivo,
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
import AccionesProyecto from "@/components/presentacion/AccionesProyecto";
import { esProyectoSemanaE, pasosVisiblesDelProyecto } from "@/lib/semana-e";

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
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const proyecto = useProyectoStore((s) => s.proyecto);
  const cargar = useProyectoStore((s) => s.cargar);
  const limpiar = useProyectoStore((s) => s.limpiar);
  const [pasoActual, setPasoActualState] = useState(1);
  const [iniciando, setIniciando] = useState(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);
  const [todosProyectos, setTodosProyectos] = useState<Proyecto[]>([]);
  const estadoGuardado = useAutoGuardado(proyecto);
  const paramsRuta = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const modoSemanaE = paramsRuta.get("semanae") === "1";
  const proyectoSemanaEUrl = paramsRuta.get("proyecto");
  const pasosVisibles = useMemo(
    () => (proyecto ? pasosVisiblesDelProyecto(proyecto) : Array.from({ length: TOTAL_PASOS }, (_, i) => i + 1)),
    [proyecto]
  );
  const indicePasoActual = Math.max(0, pasosVisibles.indexOf(pasoActual));

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
        // Los grupales que aparecen como "propios" pueden ser equipos antiguos
        // creados por el usuario. Solo aceptamos grupales devueltos por su
        // membresía ACTUAL; así no se muestran grupos de los que ya salió.
        const proyectosNoGrupales = mios.filter(
          (p) => p.tipo !== "proyecto_grupal" && !esProyectoSemanaE(p)
        );
        const grupalesNormales = grupales.filter((p) => !esProyectoSemanaE(p));
        const idsNormales = new Set(proyectosNoGrupales.map((p) => p.id));
        const proyectosNormales = [
          ...proyectosNoGrupales,
          ...grupalesNormales.filter((p) => !idsNormales.has(p.id)),
        ];
        const proyectosSemanaE = grupales.filter(
          (p) => esProyectoSemanaE(p) || p.id === proyectoSemanaEUrl
        );
        const listaElegible = modoSemanaE ? proyectosSemanaE : proyectosNormales;

        // Semana E no entra al selector general. Los cursos normales conservan
        // su proyecto grupal actual junto a individuales y casos.
        setTodosProyectos(proyectosNormales);
        if (listaElegible.length > 0) {
          const idActivo = modoSemanaE
            ? proyectoSemanaEUrl ?? leerProyectoSemanaEActivo(user.id)
            : leerProyectoActivo(user.id);
          const elegido =
            (idActivo && listaElegible.find((p) => p.id === idActivo)) ||
            (!modoSemanaE ? listaElegible[0] : null);
          if (!elegido) {
            limpiar();
            return;
          }
          cargar(elegido);
          if (modoSemanaE) {
            guardarProyectoSemanaEActivo(user.id, elegido.id);
          } else {
            guardarProyectoActivo(user.id, elegido.id);
          }
          const pasoGuardado = leerPasoGuardado(elegido.id);
          const pasosElegidos = pasosVisiblesDelProyecto(elegido);
          setPasoActualState(
            pasosElegidos.includes(pasoGuardado) ? pasoGuardado : pasosElegidos[0]
          );
        } else {
          limpiar();
        }
        setErrorCarga(null);
      })
      .catch((e) => {
        setErrorCarga(e?.message ?? String(e));
      })
      .finally(() => setIniciando(false));
  }, [user, cargar, limpiar, modoSemanaE, proyectoSemanaEUrl]);

  useEffect(() => {
    if (!proyecto || pasosVisibles.includes(pasoActual)) return;
    setPasoActual(pasosVisibles[0]);
    // setPasoActual también guarda el paso normalizado para este proyecto.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proyecto?.id, proyecto?.nivelSemanaE, pasosVisibles, pasoActual]);

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
      {/* Selector de proyecto múltiple: solo flujo normal. Semana E se maneja
          desde Mi panel/equipo para no mezclar proyectos fantasmas. */}
      {!modoSemanaE && !esProyectoSemanaE(proyecto) && (
        <SelectorProyecto proyectos={todosProyectos} />
      )}

      {/* Banner del tipo de proyecto — separa visualmente el selector de la barra */}
      <BannerTipoProyecto tipo={proyecto.tipo} />

      {/* Acciones globales: disponibles en Semana E, cursos normales, grupos e individuales. */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-violet-200 bg-gradient-to-r from-violet-50 via-white to-emerald-50 p-3 dark:border-violet-900 dark:from-violet-950/30 dark:via-background dark:to-emerald-950/20">
        <div>
          <div className="text-xs font-bold">¿Listo para mostrar tu proyecto?</div>
          <div className="text-[10px] text-muted-foreground">
            Prepara una presentación profesional o descarga el modelo financiero completo.
          </div>
        </div>
        <AccionesProyecto proyecto={proyecto} />
      </div>

      <BarraProgreso
        pasoActual={pasoActual}
        totalPasos={TOTAL_PASOS}
        nombreProyecto={proyecto.nombre}
        version={proyecto.version}
        nivelSemanaE={proyecto.nivelSemanaE}
        pasosVisibles={pasosVisibles}
        estadoGuardado={estadoGuardado}
        onCambiarPaso={setPasoActual}
        titulos={titulosPasos}
        titulosCortos={titulosCortos}
      />

      <ContenidoPaso paso={pasoActual} />

      <EntregarPasoActual pasoActual={pasoActual} />

      <div className="flex items-center justify-between">
        {indicePasoActual > 0 ? (
          <button
            onClick={() => setPasoActual(pasosVisibles[indicePasoActual - 1])}
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
          {!modoSemanaE && proyecto.tipo !== "proyecto_grupal" && (
            <button
              onClick={abandonarProyecto}
              className="flex items-center gap-1.5 text-[10px] text-muted-foreground transition hover:text-destructive"
            >
              <Trash2 className="h-3 w-3" />
              Borrar este proyecto
            </button>
          )}
        </div>

        {indicePasoActual < pasosVisibles.length - 1 ? (
          <button
            onClick={() => setPasoActual(pasosVisibles[indicePasoActual + 1])}
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
  // Solo se entregan proyectos del alumno (libre y grupal). El "caso del
  // curso" (plantilla del docente / copia del alumno) no se entrega.
  if (proyecto.tipo !== "libre" && proyecto.tipo !== "proyecto_grupal") return null;
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
