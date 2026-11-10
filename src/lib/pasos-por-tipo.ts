import type { CategoriaPlantilla } from "./plantillas";
import type { ModeloIngreso } from "@/lib/proyecto-factory";

export type FamiliaNegocio =
  | "produccion"
  | "comercio"
  | "servicios"
  | "suscripcion"
  | "costo_beneficio"
  | "ocupacion";

export function familiaDeTipo(
  tipoNegocio?: string | null,
  modeloIngreso?: ModeloIngreso | null
): FamiliaNegocio {
  if (modeloIngreso === "costo_beneficio") return "costo_beneficio";
  if (modeloIngreso === "suscripcion" || modeloIngreso === "publicidad") return "suscripcion";

  const t = tipoNegocio as CategoriaPlantilla | undefined;
  if (!t) return "produccion";

  switch (t) {
    case "comercio":
    case "franquicia":
      return "comercio";

    case "marketing":
    case "costo_beneficio":
    case "social":
      return "costo_beneficio";

    case "suscripcion":
    case "tecnologia":
    case "medios":
      return "suscripcion";

    case "turismo":
    case "alquiler":
    case "salud_privada":
    case "educacion_privada":
    case "concesion":
    case "eventos":
      return "ocupacion";

    case "servicios":
    case "microcredito":
      return "servicios";

    case "produccion":
    case "gastronomia":
    case "agricultura":
    default:
      return "produccion";
  }
}

/**
 * Pasos del constructor visibles según la naturaleza real del proyecto.
 * Evita forzar etapas absurdas (como pedir materias primas a una campaña de marketing).
 */
export function pasosVisiblesPorTipo(
  tipoNegocio?: string | null,
  modeloIngreso?: ModeloIngreso | null
): number[] {
  const familia = familiaDeTipo(tipoNegocio, modeloIngreso);

  switch (familia) {
    case "costo_beneficio":
      // 1: Datos, 2: Beneficio incremental, 3: Inversión inicial, 4: Personal/Equipo, 6: Presupuesto y medios, 7: Financiamiento, 9: Retorno (ROI/VAN)
      // Se omiten: 5 (costos de producción de fábrica) y 8 (inventario de materia prima)
      return [1, 2, 3, 4, 6, 7, 9];

    case "suscripcion":
      // 1: Datos, 2: Suscriptores y planes, 3: Desarrollo/Equipos, 4: Equipo, 6: Servidores y CAC, 7: Financiamiento, 9: Resumen SaaS
      return [1, 2, 3, 4, 6, 7, 9];

    case "servicios":
      // 1: Datos, 2: Demanda de servicios, 3: Equipamiento, 4: Personal profesional, 5: Insumos directos, 6: Gastos operativos, 7: Financiamiento, 8: Capital, 9: Resumen
      return [1, 2, 3, 4, 5, 6, 7, 8, 9];

    case "comercio":
      // 1: Datos, 2: Ventas/Ticket, 3: Local y vitrinas, 4: Personal comercial, 5: Compra de mercadería, 6: Gastos de tienda, 7: Financiamiento, 8: Stock, 9: Resumen
      return [1, 2, 3, 4, 5, 6, 7, 8, 9];

    case "ocupacion":
      // 1: Datos, 2: Capacidad y ocupación, 3: Inversión en activos, 4: Personal de servicio, 5: Costos directos, 6: Gastos fijos, 7: Financiamiento, 8: Capital, 9: Resumen
      return [1, 2, 3, 4, 5, 6, 7, 8, 9];

    case "produccion":
    default:
      // Las 9 etapas completas de producción industrial / manufactura
      return [1, 2, 3, 4, 5, 6, 7, 8, 9];
  }
}

/** Títulos largos para la barra y navegación según la familia */
export function titulosPasosPorTipo(
  tipoNegocio?: string | null,
  modeloIngreso?: ModeloIngreso | null
): Record<number, string> {
  const familia = familiaDeTipo(tipoNegocio, modeloIngreso);

  switch (familia) {
    case "costo_beneficio":
      return {
        1: "Datos generales del proyecto",
        2: "Beneficio proyectado (ventas incrementales o ahorros)",
        3: "Inversión inicial (creatividades, activos, desarrollo)",
        4: "Equipo y personal",
        6: "Presupuesto operativo y pauta de medios",
        7: "Financiamiento del plan",
        9: "Evaluación y retorno de inversión (ROI / VAN)",
      };

    case "comercio":
      return {
        1: "Datos generales de la tienda",
        2: "Proyección de ventas (ticket y unidades)",
        3: "Adecuación de local y equipamiento comercial",
        4: "Personal comercial y atención",
        5: "Costo de compra de mercadería (stock)",
        6: "Gastos operativos de tienda y comercialización",
        7: "Financiamiento y capital inicial",
        8: "Capital de trabajo (rotación de mercadería)",
        9: "Resumen, margen comercial y flujo de caja",
      };

    case "suscripcion":
      return {
        1: "Datos de la plataforma",
        2: "Proyección de suscriptores (altas, cuota y bajas)",
        3: "Desarrollo tecnológico y equipamiento",
        4: "Equipo técnico, soporte y operaciones",
        6: "Gastos operativos, servidores y CAC",
        7: "Financiamiento",
        9: "Métricas SaaS, punto de equilibrio y flujo",
      };

    case "ocupacion":
      return {
        1: "Datos generales",
        2: "Capacidad instalada y porcentaje de ocupación",
        3: "Inversiones en instalaciones y adecuación",
        4: "Personal de atención y servicio",
        5: "Costos directos por ocupación",
        6: "Gastos fijos de operación y mantenimiento",
        7: "Financiamiento",
        8: "Capital de trabajo",
        9: "Resumen, ocupación y flujo de caja",
      };

    case "servicios":
      return {
        1: "Datos generales del servicio",
        2: "Proyección de clientes y horas facturables",
        3: "Equipamiento e infraestructura de servicio",
        4: "Equipo profesional y operativo",
        5: "Insumos y costos directos del servicio",
        6: "Gastos administrativos y comerciales",
        7: "Financiamiento",
        8: "Capital de trabajo (cobranza a clientes)",
        9: "Resumen y flujo de caja",
      };

    case "produccion":
    default:
      return {
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
  }
}

/** Títulos cortos para los chips de la barra superior */
export function titulosCortosPorTipo(
  tipoNegocio?: string | null,
  modeloIngreso?: ModeloIngreso | null
): Record<number, string> {
  const familia = familiaDeTipo(tipoNegocio, modeloIngreso);

  switch (familia) {
    case "costo_beneficio":
      return {
        1: "Datos",
        2: "Beneficio",
        3: "Inversión",
        4: "Equipo",
        6: "Presupuesto",
        7: "Financiam.",
        9: "Retorno",
      };

    case "comercio":
      return {
        1: "Datos",
        2: "Ventas",
        3: "Local/Equipos",
        4: "Personal",
        5: "Mercadería",
        6: "Gastos",
        7: "Financiam.",
        8: "Stock",
        9: "Resumen",
      };

    case "suscripcion":
      return {
        1: "Datos",
        2: "Suscriptores",
        3: "Desarrollo",
        4: "Equipo",
        6: "Servidores/CAC",
        7: "Financiam.",
        9: "Métricas",
      };

    case "ocupacion":
      return {
        1: "Datos",
        2: "Ocupación",
        3: "Inversión",
        4: "Personal",
        5: "Costos directos",
        6: "Gastos fijos",
        7: "Financiam.",
        8: "Capital",
        9: "Resumen",
      };

    case "servicios":
      return {
        1: "Datos",
        2: "Servicios",
        3: "Equipos",
        4: "Profesionales",
        5: "Insumos",
        6: "Gastos",
        7: "Financiam.",
        8: "Capital",
        9: "Resumen",
      };

    case "produccion":
    default:
      return {
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
  }
}
