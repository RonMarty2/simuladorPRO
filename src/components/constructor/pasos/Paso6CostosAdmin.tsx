import { useProyectoStore } from "@/stores/proyecto-store";
import FichaPedagogica from "../FichaPedagogica";
import TablaCostosGenerales from "../TablaCostosGenerales";

export default function Paso6CostosAdmin() {
  const proyecto = useProyectoStore((s) => s.proyecto)!;
  const agregar = useProyectoStore((s) => s.agregarCostoAdministracion);
  const editar = useProyectoStore((s) => s.editarCostoAdministracion);
  const eliminar = useProyectoStore((s) => s.eliminarCostoAdministracion);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4 rounded-lg border border-border bg-card p-6">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Paso 6 · Costos administrativos
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Gastos fijos de operación (no varían con la cantidad producida).
          </p>
        </div>

        <TablaCostosGenerales
          items={proyecto.costosAdministracion}
          agregar={agregar}
          editar={editar}
          eliminar={eliminar}
          textoAgregar="Agregar costo administrativo"
          placeholderDescripcion="Ej: alquiler, servicios básicos, contador"
        />
      </div>

      <FichaPedagogica
        titulo="Costos administrativos típicos"
        contenido={
          <>
            <ul className="list-disc pl-4">
              <li>Alquiler del local</li>
              <li>Servicios básicos (luz, agua, gas, internet)</li>
              <li>Honorarios contables y legales</li>
              <li>Papelería y suministros de oficina</li>
              <li>Seguros</li>
              <li>Comunicación (telefonía, plataformas)</li>
              <li>Mantenimiento</li>
            </ul>
          </>
        }
      />
    </div>
  );
}
