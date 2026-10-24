/**
 * Eventos generales que solo tienen sentido para ciertos rubros.
 *
 * Los 50 eventos generales (EVT001 a EVT050) se filtran por sector, pero "servicios"
 * junta un gimnasio con una cafetería: al gimnasio le llegaban la gripe aviar, la línea
 * vegana o la crisis de contenedores. Esta tabla acota esos eventos al tipo de negocio.
 *
 * Solo aplica a proyectos que tienen `tipoNegocio`; los viejos o libres siguen igual.
 * Un evento que no figura aquí le llega a todos los tipos (como antes).
 * Criterio del equipo, sin validar con gremios.
 */

const PRODUCTOS_FISICOS = ["gastronomia", "produccion", "comercio", "franquicia"];

/** Eventos que solo le llegan a los tipos de la lista. */
export const TIPOS_POR_EVENTO_GENERAL: Record<string, string[]> = {
  // Bono Juancito Pinto: familias que compran para el colegio.
  EVT006: ["comercio", "gastronomia", "franquicia", "educacion_privada", "marketing"],
  // Gripe aviar: depende de comprar proteína.
  EVT017: [...PRODUCTOS_FISICOS, "agricultura"],
  // Boom turístico: negocios que venden a visitantes.
  EVT018: ["gastronomia", "comercio", "franquicia", "turismo", "eventos", "alquiler"],
  // Centro comercial nuevo cerca: competencia de un local abierto al público.
  EVT019: ["gastronomia", "comercio", "franquicia", "suscripcion", "servicios", "alquiler"],
  // Clientes piden opciones saludables o veganas.
  EVT027: PRODUCTOS_FISICOS,
  // Apps de delivery: negocios que entregan un producto.
  EVT028: PRODUCTOS_FISICOS,
  // Trigo: harinas y derivados.
  EVT036: PRODUCTOS_FISICOS,
  // Contenedores demorados: mercadería importada.
  EVT038: [...PRODUCTOS_FISICOS, "agricultura"],
  // Cliente grande que pide plazo: quien vende a empresas. Un prestamista, una
  // membresía o un proyecto social no venden a crédito.
  EVT035: [
    ...PRODUCTOS_FISICOS, "servicios", "tecnologia", "agricultura",
    "marketing", "eventos", "medios", "turismo",
  ],
  // Aduana cerrada en la frontera: mercadería que entra o sale, y turistas.
  EVT024: [...PRODUCTOS_FISICOS, "agricultura", "turismo"],
  // Restricción de divisas para importadores.
  EVT004: [...PRODUCTOS_FISICOS, "agricultura", "tecnologia", "costo_beneficio", "turismo"],
  // Proveedor único que quiebra.
  EVT044: [...PRODUCTOS_FISICOS, "agricultura", "tecnologia", "eventos", "salud_privada"],
};

/** Eventos que le llegan a todos los tipos menos a los de la lista. */
export const TIPOS_EXCLUIDOS_POR_EVENTO: Record<string, string[]> = {
  // Falla de maquinaria y tarifa eléctrica industrial: no aplican a quien no opera planta.
  EVT043: ["microcredito", "marketing", "social", "costo_beneficio", "educacion_privada", "alquiler"],
  EVT045: ["microcredito", "marketing", "social", "costo_beneficio", "educacion_privada"],
};

/** Verdadero si el evento general corresponde al tipo de negocio (o si no hay dato para decidir). */
export function eventoCompatibleConTipo(
  codigo: string,
  tipoNegocio?: string | null
): boolean {
  if (!tipoNegocio) return true;
  if (TIPOS_EXCLUIDOS_POR_EVENTO[codigo]?.includes(tipoNegocio)) return false;
  const permitidos = TIPOS_POR_EVENTO_GENERAL[codigo];
  return !permitidos || permitidos.includes(tipoNegocio);
}
