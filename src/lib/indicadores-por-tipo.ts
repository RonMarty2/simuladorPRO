import { construirFlujoCaja } from "./flujo-proyecto";
import { calcularEquilibrioPorProducto } from "./equilibrio-por-producto";
import { obtenerPlanesSuscripcion } from "./planes-suscripcion";
import type { Proyecto } from "../types/proyecto";

/**
 * Indicadores propios de cada tipo de negocio (Fase 4, camino A del plan).
 *
 * Solo se MUESTRAN: se calculan con los datos que el proyecto ya tiene y no
 * cambian el VAN, la TIR ni la caja de nadie. Si falta un dato opcional (por
 * ejemplo la capacidad), el indicador que lo necesita simplemente no aparece.
 *
 * Hoy existen los paneles de turismo y suscripción. Los demás tipos devuelven null.
 */

export type SeveridadIndicador = "ok" | "info" | "advertencia" | "critico";

export interface IndicadorPropio {
  id: string;
  nombre: string;
  valor: string;
  /** Qué mide y cómo leerlo, en criollo. */
  detalle: string;
  severidad: SeveridadIndicador;
}

export interface PanelIndicadores {
  titulo: string;
  introduccion: string;
  indicadores: IndicadorPropio[];
}

const pct = (x: number, dec = 0) => `${(x * 100).toFixed(dec).replace(".", ",")}%`;
const bs = (x: number) => `Bs ${Math.round(x).toLocaleString("es-BO")}`;

export function indicadoresPorTipo(proyecto: Proyecto): PanelIndicadores | null {
  if (proyecto.tipoNegocio === "turismo") return indicadoresTurismo(proyecto);
  if (proyecto.tipoNegocio === "suscripcion") return indicadoresSuscripcion(proyecto);
  return null;
}

function indicadoresTurismo(p: Proyecto): PanelIndicadores | null {
  if (p.modeloIngreso === "costo_beneficio" || p.productos.length === 0) return null;

  const flujo = construirFlujoCaja(p);
  const eq = calcularEquilibrioPorProducto(p);

  const unidades = (anio: number) => p.productos.reduce((a, x) => a + Number(x.cantidades?.[anio] ?? 0), 0);
  const ingreso = (anio: number) =>
    p.productos.reduce((a, x) => a + Number(x.cantidades?.[anio] ?? 0) * Number(x.precios?.[anio] ?? 0), 0);

  const u1 = unidades(0);
  const ing1 = ingreso(0);
  if (u1 <= 0 || ing1 <= 0) return null;

  const cap = p.capacidadAnual && p.capacidadAnual > 0 ? p.capacidadAnual : null;
  const indicadores: IndicadorPropio[] = [];

  // Tarifa promedio por unidad vendida (ADR en un hotel)
  indicadores.push({
    id: "tarifa-promedio",
    nombre: "Tarifa promedio por unidad vendida",
    valor: bs(ing1 / u1),
    detalle:
      "Ingreso del año 1 dividido entre las unidades vendidas (noche, cupo o pasajero). Compara con la tarifa de tus competidores directos.",
    severidad: "info",
  });

  if (cap) {
    const ocup1 = u1 / cap;
    const ocup5 = unidades(4) / cap;

    indicadores.push({
      id: "ocupacion",
      nombre: "Ocupación del año 1",
      valor: pct(ocup1),
      detalle:
        ocup1 > 1
          ? "Vendes más de lo que cabe: o tu capacidad está mal calculada o tus ventas son imposibles."
          : ocup1 > 0.85
            ? "Es una ocupación muy alta para sostenerla todo el año. Revisa si tu supuesto de demanda es realista, sobre todo en temporada baja."
            : "Parte de tu capacidad vendida en el primer año. Recuerda que la demanda turística tiene temporada alta y baja.",
      severidad: ocup1 > 1 ? "critico" : ocup1 > 0.85 ? "advertencia" : "ok",
    });

    indicadores.push({
      id: "ocupacion-anio5",
      nombre: "Ocupación del año 5",
      valor: pct(ocup5),
      detalle:
        ocup5 > 1
          ? "Con tu crecimiento, en el año 5 vendes más de lo que cabe: necesitarías ampliar y eso no está en tu inversión."
          : ocup5 > 0.9
            ? "Llegas casi al tope de tu capacidad. Mira si el crecimiento que supones se puede atender sin ampliar."
            : "Cuánto de tu capacidad usas al final del horizonte, según el crecimiento que supusiste.",
      severidad: ocup5 > 1 ? "critico" : ocup5 > 0.9 ? "advertencia" : "ok",
    });

    indicadores.push({
      id: "revpar",
      nombre: "Ingreso por unidad disponible (RevPAR)",
      valor: bs(ing1 / cap),
      detalle:
        "Ingreso del año 1 dividido entre TODA tu capacidad, la vendas o no. Une tarifa y ocupación en un solo número: subir la tarifa y perder ocupación puede dejarlo igual.",
      severidad: "info",
    });

    if (Number.isFinite(eq.factorVolumen)) {
      const ocupEq = ocup1 * eq.factorVolumen;
      indicadores.push({
        id: "ocupacion-equilibrio",
        nombre: "Ocupación de equilibrio",
        valor: pct(ocupEq),
        detalle:
          ocupEq >= ocup1
            ? "Con la ocupación que supones, no cubres tus costos fijos."
            : `Es la ocupación mínima para no perder. Tu margen es de ${((ocup1 - ocupEq) * 100).toFixed(0)} puntos: si tu ocupación real cae más que eso, pierdes.`,
        severidad: ocupEq >= ocup1 ? "critico" : ocupEq > 0.7 ? "advertencia" : "ok",
      });
    }
  }

  // Meses de caja: capital de trabajo contra costos fijos mensuales
  if (eq.costosFijos > 0) {
    const meses = p.capitalTrabajo / (eq.costosFijos / 12);
    indicadores.push({
      id: "meses-caja",
      nombre: "Meses de costos fijos que cubre tu capital de trabajo",
      valor: `${meses.toFixed(1).replace(".", ",")} meses`,
      detalle:
        "La temporada baja y un bloqueo pueden dejarte sin huéspedes por semanas mientras los costos fijos corren. Menos de 2 meses es una caja muy justa.",
      severidad: meses < 1 ? "critico" : meses < 2 ? "advertencia" : "ok",
    });
  }

  // Peso de comisiones y marketing sobre el ingreso
  const comerc = flujo.gastosComerc?.[0] ?? 0;
  if (comerc > 0) {
    const peso = comerc / ing1;
    indicadores.push({
      id: "peso-comercializacion",
      nombre: "Comisiones y marketing sobre el ingreso",
      valor: pct(peso, 1),
      detalle:
        "Lo que pagas a plataformas de reserva, agencias y publicidad. Las reservas directas bajan este porcentaje, pero hay que captarlas.",
      severidad: peso > 0.2 ? "advertencia" : "ok",
    });
  }

  return {
    titulo: "Indicadores de turismo y hospitalidad",
    introduccion:
      "Estas métricas son las que usa un hotel, hostal u operadora para decidir. Son informativas: no cambian tu VAN ni tu flujo de caja.",
    indicadores,
  };
}

function indicadoresSuscripcion(p: Proyecto): PanelIndicadores | null {
  if (p.modeloIngreso !== "suscripcion") return null;
  const planes = obtenerPlanesSuscripcion(p);
  if (planes.length === 0) return null;

  // Cada plan pesa según los clientes que maneja (base inicial más altas de un mes).
  const peso = (x: (typeof planes)[number]) => x.suscriptoresIniciales + x.altasMensuales;
  const pesoTotal = planes.reduce((a, x) => a + peso(x), 0);
  if (pesoTotal <= 0) return null;

  const subs0 = planes.reduce((a, x) => a + x.suscriptoresIniciales, 0);
  const altas = planes.reduce((a, x) => a + x.altasMensuales, 0);
  const mrr0 = planes.reduce((a, x) => a + x.suscriptoresIniciales * x.cuotaMensual, 0);
  const arpu = planes.reduce((a, x) => a + peso(x) * x.cuotaMensual, 0) / pesoTotal;
  const churn = planes.reduce((a, x) => a + peso(x) * x.churnMensual, 0) / pesoTotal;
  if (arpu <= 0) return null;

  const flujo = construirFlujoCaja(p);
  const eq = calcularEquilibrioPorProducto(p);
  const ing1 = flujo.ingresos?.[0] ?? 0;
  if (ing1 <= 0) return null;

  // Costo variable por cliente-mes: costos directos del año 1 entre los clientes-mes que los generaron.
  const clientesMes = ing1 / arpu;
  const costoVarMes = (flujo.costosProduccion?.[0] ?? 0) / clientesMes;
  const margenMes = arpu - costoVarMes;

  const indicadores: IndicadorPropio[] = [];

  indicadores.push({
    id: "mrr",
    nombre: "Ingreso recurrente mensual de arranque (MRR)",
    valor: bs(mrr0),
    detalle:
      "Lo que cobrarías cada mes con los clientes con los que empiezas, si no se fuera ni llegara nadie. Es la base sobre la que se construye el resto.",
    severidad: "info",
  });

  indicadores.push({
    id: "arpu",
    nombre: "Cuota promedio por cliente (ARPU)",
    valor: `${bs(arpu)}/mes`,
    detalle: `Después de los costos directos por cliente te quedan ${bs(margenMes)} al mes por cada uno. Ese margen paga tus costos fijos.`,
    severidad: margenMes <= 0 ? "critico" : "info",
  });

  if (churn > 0) {
    const anual = 1 - Math.pow(1 - churn, 12);
    indicadores.push({
      id: "churn",
      nombre: "Bajas por mes (churn)",
      valor: pct(churn, 1),
      detalle: `Equivale a perder ${pct(anual)} de tus clientes en un año, y cada cliente se queda en promedio ${(1 / churn).toFixed(0)} meses. Retener es más barato que conseguir clientes nuevos.`,
      severidad: anual > 0.6 ? "advertencia" : "ok",
    });
  }

  const gastoCaptacionMes = (flujo.gastosComerc?.[0] ?? 0) / 12;
  if (altas > 0 && gastoCaptacionMes > 0) {
    const cac = gastoCaptacionMes / altas;
    indicadores.push({
      id: "cac",
      nombre: "Costo de conseguir un cliente nuevo (CAC)",
      valor: bs(cac),
      detalle:
        "Tu gasto de comercialización de un mes dividido entre las altas de ese mes. Solo cuenta lo que pusiste en comercialización: si captar clientes también te cuesta sueldos o descuentos, tu CAC real es mayor.",
      severidad: "info",
    });

    if (margenMes > 0) {
      const meses = cac / margenMes;
      indicadores.push({
        id: "recuperacion-cac",
        nombre: "Meses para recuperar lo que costó el cliente",
        valor: `${meses.toFixed(1).replace(".", ",")} meses`,
        detalle:
          meses > 12
            ? "Tardas más de un año en recuperar lo gastado en cada cliente: si se va antes, pierdes plata con él."
            : "Es lo que tarda el margen de un cliente en pagar su captación. Mientras más corto, antes crece tu caja.",
        severidad: meses > 12 ? "advertencia" : "ok",
      });

      if (churn > 0) {
        const ltv = margenMes / churn;
        const razon = ltv / cac;
        const lectura =
          razon < 1
            ? "Cuesta más conseguirlo que lo que deja: cada cliente nuevo te hace perder."
            : razon < 3
              ? "Por debajo de 3 a 1 el crecimiento deja poco margen para errores."
              : "Es una relación sana: cada boliviano de captación vuelve multiplicado.";
        indicadores.push({
          id: "ltv-cac",
          nombre: "Valor de un cliente contra su costo de captación (LTV:CAC)",
          valor: `${razon.toFixed(1).replace(".", ",")} a 1`,
          detalle: `Un cliente te deja unos ${bs(ltv)} de margen en toda su vida. ${lectura}`,
          severidad: razon < 1 ? "critico" : razon < 3 ? "advertencia" : "ok",
        });
      }
    }
  }

  if (margenMes > 0 && eq.costosFijos > 0) {
    const equilibrio = eq.costosFijos / 12 / margenMes;
    const detalleBase = `Con el margen por cliente de arriba, necesitas al menos ${Math.ceil(equilibrio).toLocaleString("es-BO")} clientes activos para cubrir tus costos fijos.`;
    if (churn > 0 && altas > 0) {
      const estable = altas / churn;
      const nunca = estable < equilibrio;
      indicadores.push({
        id: "base-equilibrio",
        nombre: "Clientes necesarios para no perder",
        valor: Math.ceil(equilibrio).toLocaleString("es-BO"),
        detalle: `${detalleBase} Con tus altas y tus bajas, tu base se estabiliza en unos ${Math.round(estable).toLocaleString("es-BO")} clientes${
          nunca ? ": nunca llegas al equilibrio sin más altas o menos bajas." : "."
        }`,
        severidad: nunca ? "critico" : subs0 < equilibrio ? "advertencia" : "ok",
      });
    } else {
      indicadores.push({
        id: "base-equilibrio",
        nombre: "Clientes necesarios para no perder",
        valor: Math.ceil(equilibrio).toLocaleString("es-BO"),
        detalle: detalleBase,
        severidad: subs0 < equilibrio ? "advertencia" : "ok",
      });
    }
  }

  return {
    titulo: "Indicadores de suscripción y membresías",
    introduccion:
      "Estas métricas son las que usa un negocio recurrente para decidir. Son informativas: no cambian tu VAN ni tu flujo de caja.",
    indicadores,
  };
}
