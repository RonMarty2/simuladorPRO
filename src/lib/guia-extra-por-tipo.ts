import type { CategoriaPlantilla } from "./plantillas";

/**
 * Qué conviene pensar, según el tipo de negocio, en las etapas de proyección de
 * demanda, capital de trabajo y financiamiento. Complementa `guia-por-tipo.ts`.
 * Es una guía del equipo, no un dato auditado de Bolivia.
 */
export interface GuiaTipoExtra {
  proyeccion: string[];
  capital: string[];
  financiamiento: string[];
}

export const GUIA_EXTRA_POR_TIPO: Record<CategoriaPlantilla, GuiaTipoExtra> = {
  gastronomia: {
    proyeccion: ["Parte de cuántos clientes caben por turno y cuántos turnos abres por día", "Considera la estacionalidad: feriados, vacaciones y días de semana", "Separa el plato fuerte, las bebidas y los postres: tienen precio y margen distintos"],
    capital: ["Los insumos frescos se compran cada semana: el stock inmoviliza poco", "Lo que pesa son los primeros meses, mientras el local gana clientela", "Piensa en 2 a 3 meses de costos fijos"],
    financiamiento: ["Equipos de cocina y remodelación suelen financiarse con crédito de inversión", "Evita endeudarte para comprar el local: eso es otro negocio"],
  },
  produccion: {
    proyeccion: ["Compara lo que quieres vender con lo que tu planta puede producir al mes", "Proyecta cada producto de la línea por separado", "Un contrato con un supermercado puede cambiar tu volumen de golpe"],
    capital: ["Materia prima, producto en proceso y producto terminado inmovilizan plata", "Si vendes a crédito a supermercados, también cobras con atraso", "Calcula días de inventario más días de cobranza menos días que te dan tus proveedores"],
    financiamiento: ["La maquinaria suele financiarse con crédito a 5 años o más", "La materia prima importada vuelve riesgoso un crédito en dólares si vendes en bolivianos"],
  },
  comercio: {
    proyeccion: ["Proyecta por línea de producto, no un solo promedio", "Piensa en rotación: cuántas veces al año vendes tu stock", "Si vendes online, separa el tráfico, la conversión y el ticket promedio"],
    capital: ["El stock inicial es la inversión más grande del comercio", "Si compras importado, el tiempo de llegada obliga a tener más stock", "Un negocio puede ser rentable y quedarse sin caja por comprar demasiada mercadería"],
    financiamiento: ["Crédito de capital de trabajo para el stock", "Negocia plazo con tus proveedores: es financiamiento sin intereses"],
  },
  servicios: {
    proyeccion: ["Parte de la capacidad de tu equipo: horas vendibles, no solo clientes deseados", "Separa servicios recurrentes de proyectos puntuales", "Un cliente grande concentra riesgo: no lo des por seguro"],
    capital: ["Si facturas a empresas, te pagan a 30, 60 o más días mientras pagas sueldos hoy", "Calcula cuánta facturación queda sin cobrar a la vez"],
    financiamiento: ["Como casi no tienes activos, el banco pide garantías personales", "Un anticipo de tus clientes es la mejor fuente de caja"],
  },
  suscripcion: {
    proyeccion: ["No proyectes ventas: proyecta socios nuevos por mes y cuántos se dan de baja", "Cada mes pierdes una parte de tus socios: si no los reemplazas, tu base se estabiliza", "Un plan anual y uno mensual tienen bajas muy distintas"],
    capital: ["Casi no inmovilizas stock, pero los primeros meses pagas todo antes de tener la base de socios", "Un plan anual cobrado por adelantado mejora tu caja pero es una deuda con el socio"],
    financiamiento: ["La inversión inicial (local, equipos, plataforma) suele financiarse con crédito", "Mientras tu base no cubre los costos fijos, necesitas capital propio para aguantar"],
  },
  medios: {
    proyeccion: ["Proyecta audiencia, impresiones por usuario y precio por mil, no ventas directas", "Una plataforma ajena puede cambiar tu alcance de un día para otro", "Los anunciantes grandes concentran tus ingresos"],
    capital: ["Los anunciantes y las plataformas pagan a 30 a 90 días", "En Bolivia algunas plataformas no pagan directo o piden un mínimo para liberar el pago"],
    financiamiento: ["La inversión en equipos es pequeña frente a los costos de producir contenido cada mes", "Muchos medios se sostienen con capital propio y pocos acceden a crédito"],
  },
  turismo: {
    proyeccion: ["Proyecta ocupación por temporada alta y baja, no un promedio plano", "Separa turistas extranjeros y nacionales: se comportan distinto", "Un bloqueo o una alerta de viaje puede vaciar un mes entero"],
    capital: ["Los costos fijos corren aunque no haya huéspedes: necesitas colchón para la temporada baja", "Una reserva con depósito te da caja pero crea una obligación"],
    financiamiento: ["Un hostal o un hotel suele financiarse a plazos largos por el inmueble", "Una operadora financia vehículos y equipos a 3 a 5 años"],
  },
  agricultura: {
    proyeccion: ["Proyecta hectáreas sembradas por rendimiento esperado, no solo toneladas", "Un año de clima malo o precio bajo es normal: no proyectes cinco años perfectos", "Un cultivo perenne no produce hasta el año 2 o 3"],
    capital: ["Gastas durante meses (semilla, insumos, jornales) antes de vender la cosecha", "Calcula el gasto de toda la campaña, no de un mes"],
    financiamiento: ["El crédito de campaña tiene cuota mensual y tu ingreso llega una vez al año", "Busca una cuota única en la cosecha o un anticipo del comprador"],
  },
  costo_beneficio: {
    proyeccion: ["No proyectas ventas: proyectas el ahorro anual que genera la inversión", "Pregúntate cómo vas a medir el ahorro, no solo cuánto prometió el proveedor", "El ahorro baja con los años si el equipo se desgasta"],
    capital: ["Casi no necesitas capital de trabajo, pero sí una reserva para repuestos y mantenimiento"],
    financiamiento: ["Un crédito de eficiencia o un contrato de ahorro compartido con una empresa de servicios energéticos", "Si el crédito es en dólares y tu ahorro en bolivianos, hay riesgo cambiario"],
  },
  marketing: {
    proyeccion: ["Proyecta las ventas adicionales gracias a la campaña, restando lo que habrías vendido igual", "El efecto de la campaña se desvanece cuando dejas de pautar", "Define cómo vas a medir contra un grupo que no recibió la campaña"],
    capital: ["El gasto de pauta sale antes de que lleguen las ventas"],
    financiamiento: ["Una campaña casi siempre se paga con caja propia o de la empresa", "Es raro endeudarse para pautar: pregúntate qué pasa si no funciona"],
  },
  social: {
    proyeccion: ["Define cuántos beneficiarios atiendes al año y qué cambia para ellos", "El beneficio se valora en bolivianos con supuestos: escríbelos explícitos", "Un beneficio que no puedes medir es una opinión"],
    capital: ["Los desembolsos del financiador se atrasan: necesitas reserva para pagar sueldos"],
    financiamiento: ["Aportes de cooperación, municipio o gobernación, con convenios que fijan cuándo y cuánto", "Pregúntate quién paga cuando se acaba el convenio"],
  },
  eventos: {
    proyeccion: ["Proyecta asistentes por edición, no por mes", "Separa entradas, auspicios y venta de comida: tienen riesgos distintos", "Un evento puede caerse por lluvia, paro o moda que pasa"],
    capital: ["Casi todo el gasto sale antes de vender la primera entrada", "Calcula cuánta plata necesitas antes del día del evento"],
    financiamiento: ["Anticipos de auspiciantes y preventas de entradas financian el evento", "Un crédito para un solo evento es muy riesgoso: si se cae, ya gastaste"],
  },
  alquiler: {
    proyeccion: ["Proyecta ocupación por unidad, con meses de vacancia entre inquilinos", "La renta de lista no es la renta que cobras", "Parte del retorno es la plusvalía, que no cobras hasta vender"],
    capital: ["Reserva para meses sin inquilino y para reparaciones grandes"],
    financiamiento: ["Un crédito hipotecario o de inversión a plazos largos", "Compara el rendimiento del alquiler (cerca de 6% anual) con la tasa de tu crédito"],
  },
  tecnologia: {
    proyeccion: ["Proyecta usuarios que se suman por mes y cuánto paga cada uno", "Gastas casi todo antes de vender: el crecimiento es tu supuesto más importante", "Pregúntate qué pasa si creces la mitad"],
    capital: ["Necesitas caja para pagar equipo y servidores durante meses sin ingresos"],
    financiamiento: ["Muchas plataformas arrancan con capital propio o de socios, no con crédito bancario", "El costo de nube y licencias en dólares sube si sube el tipo de cambio"],
  },
  salud_privada: {
    proyeccion: ["Proyecta atenciones por consultorio, equipo y cama, con su ocupación realista", "La internación se llena mucho más despacio que las consultas", "Separa quién paga: bolsillo, aseguradoras, cajas de salud y Estado"],
    capital: ["Las cajas de salud y las aseguradoras pagan a 60, 90 o más días", "Calcula cuánta facturación queda sin cobrar mientras pagas sueldos e insumos hoy"],
    financiamiento: ["Los equipos médicos suelen financiarse con crédito a 5 años o más", "Si el equipo se compra en dólares y cobras en bolivianos, hay riesgo cambiario"],
  },
  educacion_privada: {
    proyeccion: ["Proyecta alumnos por curso y cuántos se reinscriben cada año", "La pensión la regula el Ministerio: no asumas aumentos libres", "Un curso con pocos alumnos pierde plata aunque tenga alumnos"],
    capital: ["Pagas 12 meses de sueldos y cobras 10 pensiones: faltan 2 meses de caja", "Algunas familias pagan tarde: pon una morosidad realista"],
    financiamiento: ["Aulas y terreno se financian a plazos largos; equipos a menos plazo", "Pregúntate si construir o alquilar un edificio"],
  },
  franquicia: {
    proyeccion: ["No uses el promedio de la red: pide las ventas de locales parecidos al tuyo", "Las ventas del primer año suelen ser menores que las de los locales maduros", "La regalía se paga sobre lo que vendes, ganes o pierdas"],
    capital: ["Además del derecho de entrada, necesitas caja para los primeros meses", "Tus insumos los compras al franquiciante: pregunta el plazo de pago"],
    financiamiento: ["El derecho de franquicia y la adecuación suelen financiarse con crédito", "El banco mira sobre todo si la marca tiene locales que funcionan"],
  },
  concesion: {
    proyeccion: ["Proyecta usuarios conectados y consumo por usuario, con la tarifa que autoriza el regulador", "La demanda real suele quedar bajo la proyectada", "Piensa en décadas, aunque aquí analices 5 años"],
    capital: ["Cobras a los usuarios con atraso y algunos no pagan"],
    financiamiento: ["Créditos a plazos largos de bancos de desarrollo o aportes públicos", "Si la deuda es en dólares y tu tarifa es en bolivianos, el descalce puede destruir el proyecto"],
  },
  microcredito: {
    proyeccion: ["Proyecta créditos colocados por mes y por oficial de crédito", "La mora de hoy viene de los créditos de hace 12 a 24 meses", "Crecer demasiado rápido suele terminar en más mora"],
    capital: ["El capital de trabajo es la plata que prestas: se presta antes de cobrar el primer interés", "Cada crédito lleva previsión por mora"],
    financiamiento: ["Fondeo con depósitos, líneas de bancos o fondos de inversión", "Pregúntate qué pasa si el financista te retira la línea"],
  },
};
