import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useProyectoStore } from "@/stores/proyecto-store";
import { eliminarProyecto, listarMisProyectos } from "@/lib/proyecto-supabase";
import { useAutoGuardado } from "@/hooks/useAutoGuardado";
import EmpezarProyecto from "@/components/constructor/EmpezarProyecto";
import BarraProgreso from "@/components/constructor/BarraProgreso";
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
    listarMisProyectos(user.id)
      .then((proyectos) => {
        if (proyectos.length > 0) {
          cargar(proyectos[0]);
          // Restaurar paso guardado para este proyecto
          setPasoActualState(leerPasoGuardado(proyectos[0].id));
        }
      })
      .finally(() => setIniciando(false));
  }, [user, cargar]);

  const abandonarProyecto = async () => {
    if (!proyecto) return;
    if (!confirm(`¿Borrar definitivamente "${proyecto.nombre}"?`)) return;
    await eliminarProyecto(proyecto.id);
    limpiar();
  };

  if (iniciando) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Cargando tu proyecto…
      </div>
    );
  }

  if (!proyecto) {
    return <EmpezarProyecto />;
  }

  return (
    <div className="space-y-4">
      <BarraProgreso
        pasoActual={pasoActual}
        totalPasos={TOTAL_PASOS}
        nombreProyecto={proyecto.nombre}
        estadoGuardado={estadoGuardado}
        onCambiarPaso={setPasoActual}
        titulos={titulosPasos}
        titulosCortos={titulosCortos}
      />

      <ContenidoPaso paso={pasoActual} />

      <div className="flex items-center justify-between">
        <button
          onClick={() => setPasoActual((p) => Math.max(1, p - 1))}
          disabled={pasoActual === 1}
          className="flex items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm text-foreground transition hover:bg-accent disabled:opacity-50"
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </button>

        <div className="flex flex-col items-center gap-1.5 text-center">
          <span className="text-xs text-muted-foreground">
            {titulosPasos[pasoActual]}
          </span>
          <BotonGuardarComoCaso />
          <button
            onClick={abandonarProyecto}
            className="flex items-center gap-1.5 text-[10px] text-muted-foreground transition hover:text-destructive"
          >
            <Trash2 className="h-3 w-3" />
            Borrar este proyecto
          </button>
        </div>

        <button
          onClick={() => setPasoActual((p) => Math.min(TOTAL_PASOS, p + 1))}
          disabled={pasoActual === TOTAL_PASOS}
          className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
        >
          Siguiente
          <ChevronRight className="h-4 w-4" />
        </button>
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
