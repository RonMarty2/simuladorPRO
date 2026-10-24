/**
 * Eventos generales que solo tienen sentido para ciertos rubros.
 *
 * Los 50 eventos generales (EVT001 a EVT050) se filtran por sector, pero "servicios"
 * junta un gimnasio con una cafetería: al gimnasio le llegaban la gripe aviar, la línea
 * vegana o la crisis de contenedores. Esta tabla acota esos eventos al tipo de negocio.
 *
 * Solo aplica a proyectos que tienen `tipoNegocio`; los viejos o libres siguen igual.
 * Un evento que no figura aquí le llega a todos los tipos (como antes).
 */

const PRODUCTOS_FISICOS = ["gastronomia", "produccion", "comercio", "franquicia"];

export const TIPOS_POR_EVENTO_GENERAL: Record<string, string[]> = {
  // Gripe aviar: depende de comprar proteína.
  EVT017: [...PRODUCTOS_FISICOS, "agricultura"],
  // Boom turístico: negocios que venden a visitantes.
  EVT018: ["gastronomia", "comercio", "franquicia", "turismo", "eventos", "alquiler"],
  // Clientes piden opciones saludables o veganas.
  EVT027: PRODUCTOS_FISICOS,
  // Apps de delivery: negocios que entregan un producto.
  EVT028: PRODUCTOS_FISICOS,
  // Trigo: harinas y derivados.
  EVT036: PRODUCTOS_FISICOS,
  // Contenedores demorados: mercadería importada.
  EVT038: [...PRODUCTOS_FISICOS, "agricultura"],
};

/** Verdadero si el evento general corresponde al tipo de negocio (o si no hay dato para decidir). */
export function eventoCompatibleConTipo(
  codigo: string,
  tipoNegocio?: string | null
): boolean {
  if (!tipoNegocio) return true;
  const permitidos = TIPOS_POR_EVENTO_GENERAL[codigo];
  return !permitidos || permitidos.includes(tipoNegocio);
}
