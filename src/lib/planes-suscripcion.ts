import type { PlanSuscripcion, Proyecto } from "@/types/proyecto";
import { nuevoId } from "@/lib/proyecto-factory";

/**
 * Lee los planes de suscripción de un proyecto, sea cual sea el formato.
 *
 * - Si `suscripcionV2.planes` existe y tiene items, los devuelve.
 * - Si no, deriva UN plan único desde los campos planos (compat con proyectos
 *   creados antes de FASE 24).
 * - Si no hay nada, devuelve [].
 */
export function obtenerPlanesSuscripcion(proyecto: Proyecto): PlanSuscripcion[] {
  const sus = proyecto.suscripcionV2;
  if (!sus) return [];
  if (sus.planes && sus.planes.length > 0) return sus.planes;
  return [
    {
      id: "legacy",
      nombre: "Plan único",
      suscriptoresIniciales: sus.suscriptoresIniciales,
      altasMensuales: sus.altasMensuales,
      churnMensual: sus.churnMensual,
      cuotaMensual: sus.cuotaMensual,
    },
  ];
}

/** Default razonable para un plan nuevo (lo que aparece al hacer "+ Agregar plan"). */
export function nuevoPlanSuscripcionVacio(nombre: string): PlanSuscripcion {
  return {
    id: nuevoId(),
    nombre,
    suscriptoresIniciales: 0,
    altasMensuales: 10,
    churnMensual: 0.05,
    cuotaMensual: 50,
  };
}

/** Default para el primer plan al crear un proyecto de suscripción desde cero. */
export function planSuscripcionInicial(): PlanSuscripcion {
  return {
    id: nuevoId(),
    nombre: "Plan básico",
    suscriptoresIniciales: 100,
    altasMensuales: 20,
    churnMensual: 0.05,
    cuotaMensual: 30,
  };
}
