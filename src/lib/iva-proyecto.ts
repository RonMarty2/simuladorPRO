import type {
  CategoriaCostoDirecto,
  CategoriaInversion,
  CostoDirecto,
  CostoGeneral,
  ItemInversion,
  Producto,
} from "../types/proyecto";

const COSTOS_DIRECTOS_SIN_CREDITO_IVA = new Set<CategoriaCostoDirecto>([
  "mano_obra",
  "mano_obra_agricola",
]);

export function productoGeneraDebitoIVA(producto: Pick<Producto, "aplicaIVA">): boolean {
  return producto.aplicaIVA !== false;
}

export function costoDirectoDaCreditoIVA(
  costo: Pick<CostoDirecto, "categoria" | "creditoFiscalIVA">
): boolean {
  return costo.creditoFiscalIVA ?? !COSTOS_DIRECTOS_SIN_CREDITO_IVA.has(costo.categoria);
}

export function costoGeneralDaCreditoIVA(
  costo: Pick<CostoGeneral, "creditoFiscalIVA">
): boolean {
  return costo.creditoFiscalIVA ?? true;
}

export function inversionDaCreditoIVA(
  inversion: Pick<ItemInversion, "creditoFiscalIVA">,
  categoria: CategoriaInversion
): boolean {
  return inversion.creditoFiscalIVA ?? categoria !== "terreno";
}

export function defaultCreditoFiscalIVACostoDirecto(
  categoria: CategoriaCostoDirecto
): boolean {
  return !COSTOS_DIRECTOS_SIN_CREDITO_IVA.has(categoria);
}

export function defaultCreditoFiscalIVAInversion(
  categoria: CategoriaInversion
): boolean {
  return categoria !== "terreno";
}
