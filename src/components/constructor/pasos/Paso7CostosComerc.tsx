import { useProyectoStore } from "@/stores/proyecto-store";
import FichaPedagogica from "../FichaPedagogica";
import TablaCostosGenerales from "../TablaCostosGenerales";

export default function Paso7CostosComerc() {
  const proyecto = useProyectoStore((s) => s.proyecto)!;
  const agregar = useProyectoStore((s) => s.agregarCostoComercializacion);
  const editar = useProyectoStore((s) => s.editarCostoComercializacion);
  const eliminar = useProyectoStore((s) => s.eliminarCostoComercializacion);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4 rounded-lg border border-border bg-card p-6">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Paso 7 · Costos de comercialización
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Gastos para que tu producto/servicio llegue al cliente.
          </p>
        </div>

        <TablaCostosGenerales
          items={proyecto.costosComercializacion}
          agregar={agregar}
          editar={editar}
          eliminar={eliminar}
          textoAgregar="Agregar costo de comercialización"
          placeholderDescripcion="Ej: publicidad, distribución, comisiones"
        />
      </div>

      <FichaPedagogica
        titulo="Presupuesto comercial"
        contenido={
          <>
            En proyectos nuevos en Bolivia,{" "}
            <strong>no presupuestar comercialización es un error frecuente</strong>. Sin
            publicidad y distribución, la demanda proyectada raramente se cumple. Un{" "}
            <strong>5-10% de las ventas estimadas</strong> es un punto de partida
            razonable para los primeros años.
          </>
        }
      />
    </div>
  );
}
