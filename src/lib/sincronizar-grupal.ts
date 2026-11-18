import type { CategoriaInversion, ItemInversion, Proyecto } from "@/types/proyecto";

/**
 * Sincronización y fusión inteligente (Smart Merge) para proyectos grupales.
 */

const basePorProyecto = new Map<string, Proyecto>();

export function clonarProfundo<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/** Registra la foto base conocida de la base de datos para un proyecto. */
export function registrarBaseSincronizacion(proyecto: Proyecto): void {
  if (!proyecto?.id) return;
  basePorProyecto.set(proyecto.id, clonarProfundo(proyecto));
}

/** Obtiene la última foto base conocida de un proyecto (o null). */
export function obtenerBaseSincronizacion(proyectoId: string): Proyecto | null {
  return basePorProyecto.get(proyectoId) ?? null;
}

function iguales(a: unknown, b: unknown): boolean {
  return JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
}

/**
 * Fusiona una lista de ítems con `id` (productos, personal, inversiones, costos)
 * comparando `local` y `remoto` contra la foto `base`.
 */
export function fusionarListaPorId<T extends { id: string }>(
  base: T[] | undefined,
  local: T[] | undefined,
  remoto: T[] | undefined
): T[] {
  const listaLocal = local ?? [];
  const listaRemota = remoto ?? [];
  if (!base) {
    const mapaLocal = new Map(listaLocal.map((item) => [item.id, item]));
    const resultado: T[] = [...listaLocal];
    for (const itemRemoto of listaRemota) {
      if (!mapaLocal.has(itemRemoto.id)) {
        resultado.push(itemRemoto);
      }
    }
    return resultado;
  }

  const mapaBase = new Map(base.map((item) => [item.id, item]));
  const mapaLocal = new Map(listaLocal.map((item) => [item.id, item]));
  const idsIncluidos = new Set<string>();
  const resultado: T[] = [];

  // 1) Recorrer la lista remota como esqueleto compartido:
  for (const itemRemoto of listaRemota) {
    const enBase = mapaBase.get(itemRemoto.id);
    const enLocal = mapaLocal.get(itemRemoto.id);

    if (enBase) {
      if (!enLocal) {
        // El usuario local lo eliminó deliberadamente -> no lo incluimos.
        continue;
      }
      const modificadoLocalmente = !iguales(enLocal, enBase);
      resultado.push(modificadoLocalmente ? enLocal : itemRemoto);
      idsIncluidos.add(itemRemoto.id);
    } else {
      // No existía en base -> fue agregado por un compañero en remoto. ¡Lo conservamos!
      resultado.push(enLocal ?? itemRemoto);
      idsIncluidos.add(itemRemoto.id);
    }
  }

  // 2) Agregar los ítems que el usuario local creó nuevos (no estaban en base)
  //    o que el usuario local editó aunque alguien los hubiera quitado en remoto.
  for (const itemLocal of listaLocal) {
    if (idsIncluidos.has(itemLocal.id)) continue;
    const enBase = mapaBase.get(itemLocal.id);
    if (!enBase) {
      resultado.push(itemLocal);
      idsIncluidos.add(itemLocal.id);
    } else if (!iguales(itemLocal, enBase)) {
      resultado.push(itemLocal);
      idsIncluidos.add(itemLocal.id);
    }
  }

  return resultado;
}

const CATEGORIAS_INVERSION: CategoriaInversion[] = [
  "terreno",
  "obrasCiviles",
  "maquinaria",
  "mobiliario",
  "activoDiferido",
];

function elegirCampo<K extends keyof Proyecto>(
  campo: K,
  base: Proyecto | null,
  local: Proyecto,
  remoto: Proyecto
): Proyecto[K] {
  if (!base) {
    const valLocal = local[campo];
    const valRemoto = remoto[campo];
    if ((valLocal === "" || valLocal == null) && valRemoto != null && valRemoto !== "") {
      return valRemoto;
    }
    return valLocal;
  }
  const cambioLocal = !iguales(local[campo], base[campo]);
  return cambioLocal ? local[campo] : remoto[campo];
}

/**
 * Fusiona los cambios locales del estudiante con la versión más reciente en
 * Supabase (`remoto`), usando `base` para saber qué tocó cada quién.
 */
export function fusionarProyectoGrupal(
  base: Proyecto | null,
  local: Proyecto,
  remoto: Proyecto
): Proyecto {
  const localClon = clonarProfundo(local);
  const remotoClon = clonarProfundo(remoto);

  const inversionesFusionadas = {} as Record<CategoriaInversion, ItemInversion[]>;
  for (const cat of CATEGORIAS_INVERSION) {
    inversionesFusionadas[cat] = fusionarListaPorId(
      base?.inversiones?.[cat],
      localClon.inversiones?.[cat],
      remotoClon.inversiones?.[cat]
    );
  }

  const finBase = base?.financiamiento;
  const finLocal = localClon.financiamiento;
  const finRemoto = remotoClon.financiamiento;
  const financiamientoFusionado =
    finBase && finLocal && finRemoto
      ? {
          porcentajePropio: !iguales(finLocal.porcentajePropio, finBase.porcentajePropio)
            ? finLocal.porcentajePropio
            : finRemoto.porcentajePropio,
          porcentajePrestamo: !iguales(finLocal.porcentajePrestamo, finBase.porcentajePrestamo)
            ? finLocal.porcentajePrestamo
            : finRemoto.porcentajePrestamo,
          tasaInteresAnual: !iguales(finLocal.tasaInteresAnual, finBase.tasaInteresAnual)
            ? finLocal.tasaInteresAnual
            : finRemoto.tasaInteresAnual,
          plazoMeses: !iguales(finLocal.plazoMeses, finBase.plazoMeses)
            ? finLocal.plazoMeses
            : finRemoto.plazoMeses,
          costoOportunidadAccionista: !iguales(
            finLocal.costoOportunidadAccionista,
            finBase.costoOportunidadAccionista
          )
            ? finLocal.costoOportunidadAccionista
            : finRemoto.costoOportunidadAccionista,
          prestamoCapitalTrabajo: !iguales(
            finLocal.prestamoCapitalTrabajo,
            finBase.prestamoCapitalTrabajo
          )
            ? finLocal.prestamoCapitalTrabajo
            : finRemoto.prestamoCapitalTrabajo,
        }
      : finLocal ?? finRemoto;

  const tsMayor =
    (localClon.actualizado_en ?? "") >= (remotoClon.actualizado_en ?? "")
      ? localClon.actualizado_en
      : remotoClon.actualizado_en;

  return {
    ...remotoClon,
    ...localClon,
    id: remotoClon.id,
    estudiante_id: remotoClon.estudiante_id,
    curso_id: remotoClon.curso_id,
    grupo_id: remotoClon.grupo_id ?? localClon.grupo_id ?? null,
    tipo: "proyecto_grupal",
    creado_en: remotoClon.creado_en,
    actualizado_en: tsMayor,

    nombre: elegirCampo("nombre", base, localClon, remotoClon),
    ubicacion: elegirCampo("ubicacion", base, localClon, remotoClon),
    descripcion: elegirCampo("descripcion", base, localClon, remotoClon),
    sector: elegirCampo("sector", base, localClon, remotoClon),
    tipoNegocio: elegirCampo("tipoNegocio", base, localClon, remotoClon),
    version: elegirCampo("version", base, localClon, remotoClon),
    modeloIngreso: elegirCampo("modeloIngreso", base, localClon, remotoClon),
    nivelSemanaE: elegirCampo("nivelSemanaE", base, localClon, remotoClon),
    capacidadAnual: elegirCampo("capacidadAnual", base, localClon, remotoClon),
    beneficiarios: elegirCampo("beneficiarios", base, localClon, remotoClon),
    capitalTrabajo: elegirCampo("capitalTrabajo", base, localClon, remotoClon),
    mesesBufferCapitalTrabajo: elegirCampo(
      "mesesBufferCapitalTrabajo",
      base,
      localClon,
      remotoClon
    ),
    imprevistosPorcentaje: elegirCampo("imprevistosPorcentaje", base, localClon, remotoClon),
    crecimientoIngresosAnual: elegirCampo(
      "crecimientoIngresosAnual",
      base,
      localClon,
      remotoClon
    ),
    crecimientoCostosAnual: elegirCampo("crecimientoCostosAnual", base, localClon, remotoClon),
    tasasCrecCantidad: elegirCampo("tasasCrecCantidad", base, localClon, remotoClon),
    tasasCrecPrecio: elegirCampo("tasasCrecPrecio", base, localClon, remotoClon),
    aportesPatronalesOverride: elegirCampo(
      "aportesPatronalesOverride",
      base,
      localClon,
      remotoClon
    ),
    capmV2: elegirCampo("capmV2", base, localClon, remotoClon),
    suscripcionV2: elegirCampo("suscripcionV2", base, localClon, remotoClon),
    publicidadV2: elegirCampo("publicidadV2", base, localClon, remotoClon),
    costoBeneficioV2: elegirCampo("costoBeneficioV2", base, localClon, remotoClon),
    presentacion: elegirCampo("presentacion", base, localClon, remotoClon),
    estado: elegirCampo("estado", base, localClon, remotoClon),

    productos: fusionarListaPorId(base?.productos, localClon.productos, remotoClon.productos),
    inversiones: inversionesFusionadas,
    personal: fusionarListaPorId(base?.personal, localClon.personal, remotoClon.personal),
    costosDirectos: fusionarListaPorId(
      base?.costosDirectos,
      localClon.costosDirectos,
      remotoClon.costosDirectos
    ),
    costosAdministracion: fusionarListaPorId(
      base?.costosAdministracion,
      localClon.costosAdministracion,
      remotoClon.costosAdministracion
    ),
    costosComercializacion: fusionarListaPorId(
      base?.costosComercializacion,
      localClon.costosComercializacion,
      remotoClon.costosComercializacion
    ),
    financiamiento: financiamientoFusionado,
  };
}

function normalizarParaComparar(p: Proyecto) {
  return {
    nombre: p.nombre ?? "",
    ubicacion: p.ubicacion ?? "",
    descripcion: p.descripcion ?? "",
    sector: p.sector ?? "produccion",
    tipoNegocio: p.tipoNegocio ?? null,
    version: p.version ?? "v1",
    modeloIngreso: p.modeloIngreso ?? "unidades",
    nivelSemanaE: p.nivelSemanaE ?? null,
    capacidadAnual: p.capacidadAnual ?? null,
    beneficiarios: p.beneficiarios ?? null,
    capitalTrabajo: p.capitalTrabajo ?? 0,
    mesesBufferCapitalTrabajo: p.mesesBufferCapitalTrabajo ?? 3,
    imprevistosPorcentaje: p.imprevistosPorcentaje ?? 0.05,
    crecimientoIngresosAnual: p.crecimientoIngresosAnual ?? 0,
    crecimientoCostosAnual: p.crecimientoCostosAnual ?? 0,
    tasasCrecCantidad: p.tasasCrecCantidad ?? [0, 0, 0, 0],
    tasasCrecPrecio: p.tasasCrecPrecio ?? [0, 0, 0, 0],
    aportesPatronalesOverride: p.aportesPatronalesOverride ?? null,
    capmV2: p.capmV2 ?? null,
    suscripcionV2: p.suscripcionV2 ?? null,
    publicidadV2: p.publicidadV2 ?? null,
    costoBeneficioV2: p.costoBeneficioV2 ?? null,
    presentacion: p.presentacion ?? null,
    estado: p.estado ?? "construyendo",
    productos: p.productos ?? [],
    inversiones: {
      terreno: p.inversiones?.terreno ?? [],
      obrasCiviles: p.inversiones?.obrasCiviles ?? [],
      maquinaria: p.inversiones?.maquinaria ?? [],
      mobiliario: p.inversiones?.mobiliario ?? [],
      activoDiferido: p.inversiones?.activoDiferido ?? [],
    },
    personal: p.personal ?? [],
    costosDirectos: p.costosDirectos ?? [],
    costosAdministracion: p.costosAdministracion ?? [],
    costosComercializacion: p.costosComercializacion ?? [],
    financiamiento: p.financiamiento ?? null,
  };
}

/**
 * Compara si dos proyectos tienen exactamente los mismos datos de negocio,
 * sin importar el orden de las propiedades ni diferencias entre null y undefined.
 */
export function contenidoProyectoIgual(a: Proyecto, b: Proyecto): boolean {
  return JSON.stringify(normalizarParaComparar(a)) === JSON.stringify(normalizarParaComparar(b));
}
