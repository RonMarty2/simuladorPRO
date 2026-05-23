import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";
import { useProyectoStore } from "@/stores/proyecto-store";
import { eliminarProyecto, listarMisProyectos } from "@/lib/proyecto-supabase";
import { useAutoGuardado } from "@/hooks/useAutoGuardado";
import EmpezarProyecto from "@/components/constructor/EmpezarProyecto";
import BarraProgreso from "@/components/constructor/BarraProgreso";
import Paso1Datos from "@/components/constructor/pasos/Paso1Datos";
import Paso2Inversiones from "@/components/constructor/pasos/Paso2Inversiones";
import Paso3Capital from "@/components/constructor/pasos/Paso3Capital";
import Paso4Personal from "@/components/constructor/pasos/Paso4Personal";
import Paso5CostosDirectos from "@/components/constructor/pasos/Paso5CostosDirectos";
import Paso6CostosAdmin from "@/components/constructor/pasos/Paso6CostosAdmin";
import Paso7CostosComerc from "@/components/constructor/pasos/Paso7CostosComerc";
import Paso8Productos from "@/components/constructor/pasos/Paso8Productos";
import Paso9Financiamiento from "@/components/constructor/pasos/Paso9Financiamiento";
import Paso10Resumen from "@/components/constructor/pasos/Paso10Resumen";
import PasoPlaceholder from "@/components/constructor/pasos/PasoPlaceholder";

const TOTAL_PASOS = 10;

const titulosPasos: Record<number, string> = {
  1: "Datos generales",
  2: "Inversiones",
  3: "Capital de trabajo",
  4: "Personal",
  5: "Costos directos",
  6: "Costos administrativos",
  7: "Costos de comercialización",
  8: "Productos e ingresos",
  9: "Financiamiento",
  10: "Resumen y proyección",
};

export default function ConstruirProyecto() {
  const user = useAuthStore((s) => s.user);
  const proyecto = useProyectoStore((s) => s.proyecto);
  const cargar = useProyectoStore((s) => s.cargar);
  const limpiar = useProyectoStore((s) => s.limpiar);
  const [pasoActual, setPasoActual] = useState(1);
  const [iniciando, setIniciando] = useState(true);
  const estadoGuardado = useAutoGuardado(proyecto);

  useEffect(() => {
    if (!user) return;
    listarMisProyectos(user.id)
      .then((proyectos) => {
        if (proyectos.length > 0) cargar(proyectos[0]);
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

        <button
          onClick={abandonarProyecto}
          className="flex items-center gap-1.5 text-xs text-muted-foreground transition hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Borrar este proyecto
        </button>

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
      return <Paso2Inversiones />;
    case 3:
      return <Paso3Capital />;
    case 4:
      return <Paso4Personal />;
    case 5:
      return <Paso5CostosDirectos />;
    case 6:
      return <Paso6CostosAdmin />;
    case 7:
      return <Paso7CostosComerc />;
    case 8:
      return <Paso8Productos />;
    case 9:
      return <Paso9Financiamiento />;
    case 10:
      return <Paso10Resumen />;
    default:
      return (
        <PasoPlaceholder
          numero={paso}
          titulo={titulosPasos[paso] ?? "Próximamente"}
          descripcion="Esta pantalla aún no está implementada pero los datos que ingreses en los otros pasos ya funcionan."
        />
      );
  }
}
