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
 * Hoy existen los paneles de turismo, suscripción, salud privada, microcrédito, social y alquiler. Los demás tipos devuelven null.
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
  if (proyecto.tipoNegocio === "salud_privada") return indicadoresSaludPrivada(proyecto);
  if (proyecto.tipoNegocio === "microcredito") return indicadoresMicrocredito(proyecto);
  if (proyecto.tipoNegocio === "social") return indicadoresSocial(proyecto);
  if (proyecto.tipoNegocio === "alquiler") return indicadoresAlquiler(proyecto);
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

function indicadoresSaludPrivada(p: Proyecto): PanelIndicadores | null {
  if (p.modeloIngreso === "costo_beneficio" || p.productos.length === 0) return null;

  const flujo = construirFlujoCaja(p);
  const eq = calcularEquilibrioPorProducto(p);

  const lineas = p.productos
    .map((x) => ({
      nombre: x.nombre,
      unidad: x.unidadMedida,
      id: x.id,
      u1: Number(x.cantidades?.[0] ?? 0),
      ingreso: Number(x.cantidades?.[0] ?? 0) * Number(x.precios?.[0] ?? 0),
      capacidad: x.capacidadAnual && x.capacidadAnual > 0 ? x.capacidadAnual : null,
    }))
    .filter((l) => l.u1 > 0);
  const ing1 = lineas.reduce((a, l) => a + l.ingreso, 0);
  if (ing1 <= 0) return null;

  const indicadores: IndicadorPropio[] = [];

  // Ocupación de cada línea con capacidad conocida (consultorios, equipos, camas)
  for (const l of lineas) {
    if (!l.capacidad) continue;
    const ocup = l.u1 / l.capacidad;
    indicadores.push({
      id: "ocupacion-" + l.id,
      nombre: `Ocupación: ${l.nombre}`,
      valor: pct(ocup),
      detalle:
        ocup > 1
          ? `Vendes más ${l.unidad} de los que caben en tu capacidad: revisa los supuestos o amplía.`
          : ocup > 0.9
            ? "Casi sin margen: un pico de demanda o una falla de equipo te dejaría pacientes sin atender."
            : ocup < 0.5
              ? "Menos de la mitad de tu capacidad. Un equipo o una cama que no se usa cuesta lo mismo que uno lleno: revisa si la inversión se justifica."
              : "Parte de la capacidad de esta línea que vendes en el primer año. Las clínicas suelen llenar primero las consultas y más despacio la internación.",
      severidad: ocup > 1 ? "critico" : ocup > 0.9 || ocup < 0.5 ? "advertencia" : "ok",
    });
  }

  // Mezcla de servicios: de qué línea vive la clínica
  const mayor = [...lineas].sort((a, b) => b.ingreso - a.ingreso)[0];
  if (lineas.length > 1) {
    indicadores.push({
      id: "mezcla-servicios",
      nombre: "Línea que más aporta al ingreso",
      valor: `${mayor.nombre}: ${pct(mayor.ingreso / ing1)}`,
      detalle:
        "Reparto del ingreso del año 1: " +
        lineas.map((l) => `${l.nombre} ${pct(l.ingreso / ing1)}`).join(", ") +
        ". Si una sola línea sostiene el negocio, un problema ahí lo tumba.",
      severidad: mayor.ingreso / ing1 > 0.6 ? "advertencia" : "info",
    });
  }

  // Ventas mínimas para no perder
  if (Number.isFinite(eq.factorVolumen)) {
    const phi = eq.factorVolumen;
    indicadores.push({
      id: "ventas-equilibrio",
      nombre: "Ventas mínimas para no perder",
      valor: pct(phi),
      detalle:
        phi > 1
          ? "Con lo que proyectas vender no cubres tus costos fijos."
          : `Es la parte de tus ventas proyectadas que cubre los costos fijos. Si vendes menos, pierdes: tu margen de seguridad es de ${pct(1 - phi)}.`,
      severidad: phi > 1 ? "critico" : phi > 0.85 ? "advertencia" : "ok",
    });
  }

  // Honorarios médicos: costo directo de mano de obra sobre el ingreso
  const honorarios = lineas.reduce((a, l) => {
    const unit = (p.costosDirectos ?? [])
      .filter((c) => c.productoId === l.id && c.categoria === "mano_obra")
      .reduce((s, c) => s + c.cantidadPorUnidad * c.costoUnitario, 0);
    return a + unit * l.u1;
  }, 0);
  if (honorarios > 0) {
    const peso = honorarios / ing1;
    indicadores.push({
      id: "honorarios",
      nombre: "Ingreso que se va en honorarios médicos",
      valor: pct(peso),
      detalle:
        "Es un costo variable: baja si baja la demanda, pero un médico que trae muchos pacientes puede pedir más o irse con ellos.",
      severidad: peso > 0.4 ? "advertencia" : "info",
    });
  }

  // Cobranza a cajas y aseguradoras (supuesto ilustrativo de 90 días)
  const DIAS_COBRO = 90;
  const inmovilizado = (ing1 / 365) * DIAS_COBRO;
  const cobertura = p.capitalTrabajo / inmovilizado;
  indicadores.push({
    id: "cobranza",
    nombre: `Capital de trabajo frente a cobrar a ${DIAS_COBRO} días`,
    valor: pct(Math.min(cobertura, 9.99)),
    detalle: `Ejemplo ilustrativo: si cajas de salud y aseguradoras te pagan a ${DIAS_COBRO} días, tienes ${pct(inmovilizado / ing1, 0)} de un año de ingresos sin cobrar, unos ${bs(inmovilizado)}. ${
      cobertura >= 1
        ? "Tu capital de trabajo lo cubre."
        : `Tu capital de trabajo cubre solo ${pct(cobertura)}: el resto lo tendrías que financiar con crédito o dejar de atender.`
    }`,
    severidad: cobertura < 0.5 ? "critico" : cobertura < 1 ? "advertencia" : "ok",
  });

  // Meses de caja
  if (eq.costosFijos > 0) {
    const meses = p.capitalTrabajo / (eq.costosFijos / 12);
    indicadores.push({
      id: "meses-caja",
      nombre: "Meses de costos fijos que cubre tu capital de trabajo",
      valor: `${meses.toFixed(1).replace(".", ",")} meses`,
      detalle:
        "Una inspección que cierra un servicio, un paro o un pagador que se atrasa dejan la plata afuera mientras los sueldos corren. Menos de 2 meses es una caja muy justa.",
      severidad: meses < 1 ? "critico" : meses < 2 ? "advertencia" : "ok",
    });
  }

  void flujo;
  return {
    titulo: "Indicadores de salud privada",
    introduccion:
      "Estas métricas son las que mira un gerente de clínica. Son informativas: no cambian tu VAN ni tu flujo de caja.",
    indicadores,
  };
}

function indicadoresMicrocredito(p: Proyecto): PanelIndicadores | null {
  if (p.modeloIngreso === "costo_beneficio" || p.productos.length === 0) return null;

  const flujo = construirFlujoCaja(p);
  const ing1 = flujo.ingresos?.[0] ?? 0;
  if (ing1 <= 0) return null;

  // Créditos colocados el año 1 (el producto con más unidades es el crédito; el resto son comisiones sobre ellos).
  const creditos = Math.max(...p.productos.map((x) => Number(x.cantidades?.[0] ?? 0)));
  if (creditos <= 0) return null;

  // Costos directos del año 1 por tipo, según su descripción.
  const total = (re: RegExp) =>
    (p.costosDirectos ?? [])
      .filter((c) => re.test(c.descripcion.toLowerCase()))
      .reduce((a, c) => {
        const prod = p.productos.find((x) => x.id === c.productoId);
        const unidades = prod ? Number(prod.cantidades?.[0] ?? 0) : creditos;
        return a + c.cantidadPorUnidad * c.costoUnitario * unidades;
      }, 0);
  const fondeo = total(/fondeo/);
  const mora = total(/mora|previsi/);

  const gastosOperativos =
    (flujo.personal?.[0] ?? 0) + (flujo.gastosAdmin?.[0] ?? 0) + (flujo.gastosComerc?.[0] ?? 0) + (flujo.imprevistos?.[0] ?? 0);
  const resultado = ing1 - (flujo.costosProduccion?.[0] ?? 0) - gastosOperativos;

  const indicadores: IndicadorPropio[] = [];

  indicadores.push({
    id: "ingreso-credito",
    nombre: "Ingreso por crédito (intereses y comisiones)",
    valor: bs(ing1 / creditos),
    detalle:
      "Lo que te deja cada crédito colocado en el año 1 antes de costos. La tasa no se elige: se despeja del costo de fondeo, la mora y los gastos de operar.",
    severidad: "info",
  });

  if (fondeo > 0 || mora > 0) {
    const margen = (ing1 - fondeo - mora) / ing1;
    indicadores.push({
      id: "margen-financiero",
      nombre: "Margen después de fondeo y mora",
      valor: pct(margen),
      detalle: `De cada boliviano que cobras, ${pct(fondeo / ing1)} se va en el costo de la plata que prestas y ${pct(mora / ing1)} en la previsión por mora. Lo que queda tiene que pagar oficiales, oficina y todo lo demás.`,
      severidad: margen < 0.3 ? "advertencia" : "ok",
    });
  }

  if (gastosOperativos > 0 && (fondeo > 0 || mora > 0)) {
    const autosuficiencia = (ing1 - fondeo - mora) / gastosOperativos;
    indicadores.push({
      id: "autosuficiencia",
      nombre: "Autosuficiencia operativa",
      valor: `${autosuficiencia.toFixed(2).replace(".", ",")} veces`,
      detalle:
        autosuficiencia < 1
          ? "Tu margen financiero no alcanza a pagar tus gastos de operar: la cooperativa se come su propio capital."
          : "Cuántas veces el margen financiero cubre tus gastos de operar. Debajo de 1 pierdes; cerca de 1 no tienes colchón para la mora.",
      severidad: autosuficiencia < 1 ? "critico" : autosuficiencia < 1.2 ? "advertencia" : "ok",
    });
  }

  // ¿Qué pasa si la mora se duplica?
  if (mora > 0) {
    const conMoraDoble = resultado - mora;
    indicadores.push({
      id: "mora-doble",
      nombre: "Resultado del año 1 si la mora se duplica",
      valor: bs(conMoraDoble),
      detalle: `Hoy el resultado operativo del año 1 es ${bs(resultado)}. ${
        conMoraDoble < 0
          ? "Con la previsión por mora al doble, pasas a pérdida: la mora es lo que decide este negocio."
          : conMoraDoble < resultado * 0.5
            ? "Con la previsión al doble pierdes más de la mitad del resultado: tienes poco margen para una crisis."
            : "Con la previsión al doble sigues ganando una parte importante."
      }`,
      severidad: conMoraDoble < 0 ? "critico" : conMoraDoble < resultado * 0.5 ? "advertencia" : "ok",
    });
  }

  // Productividad de los oficiales de crédito
  const oficiales = (p.personal ?? [])
    .filter((x) => /oficial|asesor/i.test(x.puesto))
    .reduce((a, x) => a + x.cantidad, 0);
  if (oficiales > 0) {
    const porOficial = creditos / oficiales;
    indicadores.push({
      id: "creditos-por-oficial",
      nombre: "Créditos colocados por oficial de crédito al año",
      valor: Math.round(porOficial).toLocaleString("es-BO"),
      detalle:
        "Un oficial que coloca más créditos baja tu costo por crédito, pero si va demasiado rápido analiza menos y la mora aparece un año después.",
      severidad: "info",
    });
  }

  // Rentabilidad sobre el dinero que se presta
  if (p.capitalTrabajo > 0) {
    const rent = resultado / p.capitalTrabajo;
    indicadores.push({
      id: "rentabilidad-capital",
      nombre: "Resultado del año 1 sobre el capital que prestas",
      valor: pct(rent, 1),
      detalle:
        "Resultado operativo del año 1 (antes de impuestos, intereses y depreciación) dividido entre tu capital de trabajo, que aquí es la plata que se presta. No es la TIR del proyecto: sirve para comparar con lo que te pagaría dejar esa plata en un depósito a plazo fijo.",
      severidad: rent <= 0 ? "critico" : rent < 0.05 ? "advertencia" : "ok",
    });
  }

  return {
    titulo: "Indicadores de microcrédito y finanzas",
    introduccion:
      "Estas métricas son las que mira una cooperativa o una entidad de microfinanzas. Son informativas: no cambian tu VAN ni tu flujo de caja.",
    indicadores,
  };
}

function indicadoresSocial(p: Proyecto): PanelIndicadores | null {
  if (p.productos.length === 0) return null;

  const flujo = construirFlujoCaja(p);
  const costoOperacion =
    (flujo.personal?.[0] ?? 0) +
    (flujo.gastosAdmin?.[0] ?? 0) +
    (flujo.gastosComerc?.[0] ?? 0) +
    (flujo.imprevistos?.[0] ?? 0) +
    (flujo.costosProduccion?.[0] ?? 0);
  if (costoOperacion <= 0) return null;

  const inversionTotal = Object.values(p.inversiones ?? {})
    .flat()
    .reduce((a, i) => a + Number(i.costoTotal ?? 0), 0);

  const ben = p.beneficiarios && p.beneficiarios.cantidad > 0 ? p.beneficiarios : null;
  const beneficioAnual = p.costoBeneficioV2?.beneficioAnualBase ?? 0;
  const indicadores: IndicadorPropio[] = [];

  if (ben) {
    indicadores.push({
      id: "costo-beneficiario",
      nombre: "Costo de operar por beneficiario (año 1)",
      valor: bs(costoOperacion / ben.cantidad),
      detalle: `Lo que cuesta cada año atender a ${ben.cantidad.toLocaleString("es-BO")} beneficiarios (unidad: ${ben.unidad}), sin contar la inversión inicial. Es el número que mira un financiador para comparar con otros proyectos.`,
      severidad: "info",
    });

    indicadores.push({
      id: "costo-beneficiario-total",
      nombre: "Costo por beneficiario con la inversión repartida en 5 años",
      valor: bs((costoOperacion + inversionTotal / 5) / ben.cantidad),
      detalle:
        "Suma la operación de un año más una quinta parte de lo que invertiste. Es más honesto que el costo de operar solo, porque la obra y los equipos también hay que pagarlos.",
      severidad: "info",
    });
  }

  if (beneficioAnual > 0) {
    if (ben) {
      indicadores.push({
        id: "beneficio-beneficiario",
        nombre: "Beneficio social valorado por beneficiario (año 1)",
        valor: bs(beneficioAnual / ben.cantidad),
        detalle:
          "El beneficio se traduce a bolivianos con supuestos (horas de acarreo, traslados evitados, ingresos que mejoran). Cada supuesto es discutible: pregúntate cuál cambiaría el resultado si estuviera equivocado.",
        severidad: "info",
      });
    }

    const rbc = Number(flujo.indicadores?.rbc);
    if (Number.isFinite(rbc)) {
      indicadores.push({
        id: "razon-beneficio-costo",
        nombre: "Razón beneficio-costo social (5 años)",
        valor: `${rbc.toFixed(2).replace(".", ",")} a 1`,
        detalle:
          rbc < 1
            ? "Los beneficios valorados no alcanzan a pagar los costos: con estos supuestos, el proyecto destruye valor social."
            : rbc < 1.3
              ? "Los beneficios apenas superan a los costos: un supuesto optimista de más y el resultado se da vuelta."
              : "Por cada boliviano que cuesta, el proyecto devuelve más de un boliviano en beneficio social.",
        severidad: rbc < 1 ? "critico" : rbc < 1.3 ? "advertencia" : "ok",
      });
    }
  }

  indicadores.push({
    id: "gasto-recurrente",
    nombre: "Gasto anual que alguien tiene que seguir pagando",
    valor: bs(costoOperacion),
    detalle:
      "Cuando termina el dinero de la inversión, este gasto sigue. Si no hay un dueño que lo asuma (municipio, comunidad, otro financiador), el servicio se cae: es la causa más común de proyectos sociales abandonados.",
    severidad: "info",
  });

  const meses = p.capitalTrabajo / (costoOperacion / 12);
  indicadores.push({
    id: "meses-operacion",
    nombre: "Meses de operación que cubre tu reserva",
    valor: `${meses.toFixed(1).replace(".", ",")} meses`,
    detalle:
      "Los desembolsos del financiador se atrasan con frecuencia. Una reserva de menos de 2 meses te deja sin poder pagar sueldos cuando eso pasa.",
    severidad: meses < 1 ? "critico" : meses < 2 ? "advertencia" : "ok",
  });

  return {
    titulo: "Indicadores de proyectos sociales y públicos",
    introduccion:
      "Estas métricas son las que mira un financiador o una entidad pública. Son informativas: no cambian tu VAN ni tu flujo de caja.",
    indicadores,
  };
}

function indicadoresAlquiler(p: Proyecto): PanelIndicadores | null {
  if (p.modeloIngreso === "costo_beneficio" || p.productos.length === 0) return null;

  const flujo = construirFlujoCaja(p);
  const eq = calcularEquilibrioPorProducto(p);

  const lineas = p.productos
    .map((x) => ({
      nombre: x.nombre,
      unidad: x.unidadMedida,
      id: x.id,
      u1: Number(x.cantidades?.[0] ?? 0),
      ingreso: Number(x.cantidades?.[0] ?? 0) * Number(x.precios?.[0] ?? 0),
      capacidad: x.capacidadAnual && x.capacidadAnual > 0 ? x.capacidadAnual : null,
    }))
    .filter((l) => l.u1 > 0);
  const ing1 = lineas.reduce((a, l) => a + l.ingreso, 0);
  if (ing1 <= 0) return null;

  const gastosOperativos =
    (flujo.personal?.[0] ?? 0) +
    (flujo.gastosAdmin?.[0] ?? 0) +
    (flujo.gastosComerc?.[0] ?? 0) +
    (flujo.imprevistos?.[0] ?? 0) +
    (flujo.costosProduccion?.[0] ?? 0);
  const noi = ing1 - gastosOperativos;
  const inversionTotal = Object.values(p.inversiones ?? {})
    .flat()
    .reduce((a, i) => a + Number(i.costoTotal ?? 0), 0);

  const indicadores: IndicadorPropio[] = [];

  // Ocupación de cada línea con capacidad conocida (departamentos, parqueos, eventos)
  for (const l of lineas) {
    if (!l.capacidad) continue;
    const ocup = l.u1 / l.capacidad;
    indicadores.push({
      id: "ocupacion-" + l.id,
      nombre: `Ocupación: ${l.nombre}`,
      valor: pct(ocup),
      detalle:
        ocup > 1
          ? "Alquilas más de lo que tienes: revisa los supuestos o la capacidad."
          : ocup > 0.95
            ? "Casi sin vacancia. Cuando se va un inquilino la unidad queda vacía entre 2 y 6 meses: una ocupación tan alta todo el año es poco realista."
            : ocup < 0.7
              ? "La vacancia pesa: tus gastos fijos y la cuota del préstamo no bajan cuando la unidad está vacía."
              : "Parte de tu capacidad alquilada en el año 1. Piensa en cuánto tardas en reemplazar a un inquilino que se va.",
      severidad: ocup > 1 ? "critico" : ocup > 0.95 || ocup < 0.7 ? "advertencia" : "ok",
    });
  }

  indicadores.push({
    id: "noi",
    nombre: "Resultado operativo anual (NOI)",
    valor: `${bs(noi)} (${pct(noi / ing1)} de las rentas)`,
    detalle:
      "Lo que queda de las rentas del año 1 después de pagar todo lo de operar, antes de impuestos, intereses y depreciación. Es el número con el que se valúa un inmueble.",
    severidad: noi <= 0 ? "critico" : "info",
  });

  if (inversionTotal > 0) {
    const rend = noi / inversionTotal;
    const tasaCredito = p.financiamiento?.tasaInteresAnual ?? 0;
    indicadores.push({
      id: "rendimiento-inversion",
      nombre: "Rendimiento anual sobre lo invertido",
      valor: pct(rend, 1),
      detalle: `NOI del año 1 dividido entre toda tu inversión, terreno incluido. No cuenta la plusvalía, que en un inmueble es parte del retorno pero no se cobra hasta vender. ${
        tasaCredito > 0 && rend < tasaCredito
          ? `Rinde menos que la tasa de tu crédito (${pct(tasaCredito, 1)}): la renta sola no alcanza a pagar el costo de la deuda.`
          : "Compáralo con la tasa de tu crédito y con lo que pagaría un depósito a plazo fijo."
      }`,
      severidad: rend <= 0 ? "critico" : tasaCredito > 0 && rend < tasaCredito ? "advertencia" : "ok",
    });
  }

  const cuota = Number(flujo.indicadores?.cuotaAnualTotal ?? 0);
  if (cuota > 0) {
    const cobertura = noi / cuota;
    indicadores.push({
      id: "cobertura-cuota",
      nombre: "Cobertura de la cuota del préstamo",
      valor: `${cobertura.toFixed(2).replace(".", ",")} veces`,
      detalle:
        cobertura < 1
          ? "Las rentas no alcanzan a pagar la cuota del préstamo: tendrías que poner plata de tu bolsillo todos los años."
          : cobertura < 1.25
            ? "Cubres la cuota, pero casi sin margen: un par de meses de vacancia te dejan sin poder pagar."
            : "Las rentas cubren la cuota con colchón para algún mes de vacancia.",
      severidad: cobertura < 1 ? "critico" : cobertura < 1.25 ? "advertencia" : "ok",
    });
  }

  if (Number.isFinite(eq.factorVolumen)) {
    const phi = eq.factorVolumen;
    indicadores.push({
      id: "ventas-equilibrio",
      nombre: "Rentas mínimas para no perder",
      valor: pct(phi),
      detalle:
        phi > 1
          ? "Con las rentas que proyectas no cubres tus costos fijos."
          : `Es la parte de tus rentas proyectadas que cubre los costos fijos. Si cobras menos, pierdes: tu margen de seguridad es de ${pct(1 - phi)}.`,
      severidad: phi > 1 ? "critico" : phi > 0.85 ? "advertencia" : "ok",
    });
  }

  if (eq.costosFijos > 0) {
    const fijosMes = (eq.costosFijos + cuota) / 12;
    const meses = p.capitalTrabajo / fijosMes;
    indicadores.push({
      id: "meses-reserva",
      nombre: "Meses de gastos fijos y cuota que cubre tu reserva",
      valor: `${meses.toFixed(1).replace(".", ",")} meses`,
      detalle:
        "Si un inquilino grande se va o deja de pagar, estos gastos siguen. Menos de 3 meses es poco para esperar a que llegue el reemplazo.",
      severidad: meses < 1.5 ? "critico" : meses < 3 ? "advertencia" : "ok",
    });
  }

  return {
    titulo: "Indicadores de alquiler y renta",
    introduccion:
      "Estas métricas son las que mira un dueño de inmuebles o activos. Son informativas: no cambian tu VAN ni tu flujo de caja.",
    indicadores,
  };
}
