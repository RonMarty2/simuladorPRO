import { create } from "zustand";
import { crearProyectoVacio, nuevoId, type ModeloIngreso } from "@/lib/proyecto-factory";
import {
  calcularCostoCapitalCAPM,
  calcularDepreciacionAnual,
  calcularValorResidual,
  proyectarSuscriptores,
  proyectarPublicidad,
} from "@/lib/calculo-financiero";
import {
  defaultCreditoFiscalIVACostoDirecto,
  defaultCreditoFiscalIVAInversion,
} from "@/lib/iva-proyecto";
import type {
  CategoriaInversion,
  CostoDirecto,
  CostoGeneral,
  EstadoProyecto,
  Financiamiento,
  ItemInversion,
  PlanSuscripcion,
  Producto,
  Proyecto,
  PuestoTrabajo,
  Sector,
  VersionProyecto,
} from "@/types/proyecto";

// ============================================================================
// Helpers privados: planes de suscripción
// ============================================================================

/** Lee los planes (FASE 24) o los deriva del legacy plano. */
function obtenerPlanesSuscripcionStore(p: Proyecto): PlanSuscripcion[] {
  const sus = p.suscripcionV2;
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

/** Sugiere nombres comunes para el plan N (1=Básico, 2=VIP, etc.). */
function sugerirNombrePlan(indice: number): string {
  const sugerencias = ["Plan básico", "Plan VIP", "Plan Premium", "Plan Empresarial", "Plan Anual"];
  return sugerencias[indice] ?? `Plan ${indice + 1}`;
}

/**
 * Aplica una lista de planes al proyecto y regenera los productos portadores:
 * un producto por plan, con sus cantidades (promedio de suscriptores) y su
 * precio anual (cuota × 12). Mantiene los campos planos sincronizados con el
 * primer plan para compat.
 */
function aplicarPlanesSuscripcion(p: Proyecto, planes: PlanSuscripcion[]): Proyecto {
  const productos: Producto[] = planes.map((plan) => {
    const proy = proyectarSuscriptores(plan, 5);
    const cantidades = proy.map((a) => Math.round(a.promedioSuscriptores)) as [
      number, number, number, number, number,
    ];
    const precioAnual = Math.round(plan.cuotaMensual * 12 * 100) / 100;
    return {
      id: plan.id,
      nombre: plan.nombre,
      unidadMedida: "suscriptor/año",
      cantidades,
      precios: [precioAnual, precioAnual, precioAnual, precioAnual, precioAnual],
    };
  });
  const primero = planes[0];
  const ahora = new Date().toISOString();
  return {
    ...p,
    modeloIngreso: "suscripcion",
    suscripcionV2: {
      // Campos planos = primer plan (compat con código viejo que los lee).
      suscriptoresIniciales: primero.suscriptoresIniciales,
      altasMensuales: primero.altasMensuales,
      churnMensual: primero.churnMensual,
      cuotaMensual: primero.cuotaMensual,
      planes,
    },
    productos,
    actualizado_en: ahora,
  };
}

interface ProyectoState {
  proyecto: Proyecto | null;

  // Ciclo de vida
  inicializar: (
    estudiante_id: string,
    nombre: string,
    curso_id?: string | null,
    version?: VersionProyecto,
    modeloIngreso?: ModeloIngreso
  ) => void;
  cargar: (proyecto: Proyecto) => void;
  limpiar: () => void;

  // Datos generales
  actualizarDatosGenerales: (
    cambios: Partial<Pick<Proyecto, "nombre" | "ubicacion" | "descripcion" | "sector">>
  ) => void;

  // Inversiones
  agregarInversion: (
    categoria: CategoriaInversion,
    item: Omit<ItemInversion, "id" | "costoTotal" | "depreciacionAnual" | "valorResidual">
  ) => void;
  editarInversion: (
    categoria: CategoriaInversion,
    id: string,
    cambios: Partial<ItemInversion>
  ) => void;
  eliminarInversion: (categoria: CategoriaInversion, id: string) => void;

  // Capital de trabajo
  setCapitalTrabajo: (monto: number) => void;
  setMesesBufferCapitalTrabajo: (meses: number) => void;

  // Personal
  agregarPuesto: (puesto: Omit<PuestoTrabajo, "id">) => void;
  editarPuesto: (id: string, cambios: Partial<PuestoTrabajo>) => void;
  eliminarPuesto: (id: string) => void;

  // Costos directos
  agregarCostoDirecto: (c: Omit<CostoDirecto, "id">) => void;
  editarCostoDirecto: (id: string, cambios: Partial<CostoDirecto>) => void;
  eliminarCostoDirecto: (id: string) => void;

  // Costos generales (admin + comercialización)
  agregarCostoAdministracion: (c: Omit<CostoGeneral, "id">) => void;
  editarCostoAdministracion: (id: string, cambios: Partial<CostoGeneral>) => void;
  eliminarCostoAdministracion: (id: string) => void;
  agregarCostoComercializacion: (c: Omit<CostoGeneral, "id">) => void;
  editarCostoComercializacion: (id: string, cambios: Partial<CostoGeneral>) => void;
  eliminarCostoComercializacion: (id: string) => void;

  // Imprevistos
  setImprevistosPorcentaje: (p: number) => void;

  // Productos
  agregarProducto: (p: Omit<Producto, "id">) => void;
  editarProducto: (id: string, cambios: Partial<Producto>) => void;
  eliminarProducto: (id: string) => void;

  // Financiamiento + crecimiento
  setFinanciamiento: (f: Partial<Financiamiento>) => void;
  setCrecimientoIngresos: (g: number) => void;
  setCrecimientoCostos: (g: number) => void;

  // Tasas de crecimiento globales que aplican a TODOS los productos
  setTasaCrecCantidad: (indice: number, valorPct: number) => void;
  setTasaCrecPrecio: (indice: number, valorPct: number) => void;

  // CAPM (solo V2): calcula el costo del capital propio y lo aplica al Koa
  setCapmV2: (
    cambios: Partial<{ tasaLibreRiesgo: number; beta: number; primaMercado: number }>
  ) => void;

  // Suscripción (modelo de ingreso recurrente): recalcula el producto portador
  setSuscripcionV2: (
    cambios: Partial<{
      suscriptoresIniciales: number;
      altasMensuales: number;
      churnMensual: number;
      cuotaMensual: number;
    }>
  ) => void;
  // Suscripción multi-plan (FASE 24): agregar, editar o eliminar un plan.
  agregarPlanSuscripcion: (nombre?: string) => void;
  editarPlanSuscripcion: (
    id: string,
    cambios: Partial<{ nombre: string; suscriptoresIniciales: number; altasMensuales: number; churnMensual: number; cuotaMensual: number }>
  ) => void;
  eliminarPlanSuscripcion: (id: string) => void;

  // Publicidad (audiencia × CPM): recalcula el producto portador
  setPublicidadV2: (
    cambios: Partial<{
      audienciaMensual: number;
      crecimientoMensual: number;
      impresionesPorUsuario: number;
      cpm: number;
    }>
  ) => void;

  // Costo-beneficio (sin ingresos propios): recalcula el "beneficio incremental"
  setCostoBeneficioV2: (
    cambios: Partial<{ beneficioAnualBase: number; crecimientoAnual: number }>
  ) => void;

  // Override de aportes patronales (si la LGT cambia)
  setAportePatronal: (
    campo: "riesgoProfesional" | "seguroSalud" | "provisionVivienda" | "previsionAguinaldo" | "previsionIndemnizacion",
    valorDecimal: number
  ) => void;
  restaurarAportesPatronalesDefault: () => void;

  // Estado
  setEstado: (estado: EstadoProyecto) => void;
}

/**
 * Recalcula los campos derivados de un ItemInversion (costoTotal,
 * depreciacionAnual, valorResidual) a partir de cantidad/costoUnitario/vidaUtil.
 */
function recalcularItemInversion(item: ItemInversion): ItemInversion {
  const costoTotal = item.cantidad * item.costoUnitario;
  const vida = item.vidaUtilAnios;
  return {
    ...item,
    costoTotal,
    depreciacionAnual: vida ? calcularDepreciacionAnual(costoTotal, vida) : 0,
    valorResidual: vida ? calcularValorResidual(costoTotal, vida, 0) : costoTotal,
  };
}

// Helper para actualizaciones inmutables del proyecto + timestamp
function conTimestamp(p: Proyecto): Proyecto {
  return { ...p, actualizado_en: new Date().toISOString() };
}

export const useProyectoStore = create<ProyectoState>((set, get) => ({
  proyecto: null,

  inicializar: (estudiante_id, nombre, curso_id, version, modeloIngreso) => {
    set({ proyecto: crearProyectoVacio({ estudiante_id, nombre, curso_id, version, modeloIngreso }) });
  },

  cargar: (proyecto) => set({ proyecto }),

  limpiar: () => set({ proyecto: null }),

  // -- Datos generales --
  actualizarDatosGenerales: (cambios) => {
    const p = get().proyecto;
    if (!p) return;
    set({ proyecto: conTimestamp({ ...p, ...cambios } as Proyecto) });
    if (cambios.sector) {
      // type guard solo para asegurar que sector queda tipado
      const _: Sector = cambios.sector;
      void _;
    }
  },

  // -- Inversiones --
  agregarInversion: (categoria, item) => {
    const p = get().proyecto;
    if (!p) return;
    const base: ItemInversion = {
      ...item,
      creditoFiscalIVA:
        item.creditoFiscalIVA ?? defaultCreditoFiscalIVAInversion(categoria),
      id: nuevoId(),
      costoTotal: 0,
      depreciacionAnual: 0,
      valorResidual: 0,
    };
    const calculado = recalcularItemInversion(base);
    set({
      proyecto: conTimestamp({
        ...p,
        inversiones: {
          ...p.inversiones,
          [categoria]: [...p.inversiones[categoria], calculado],
        },
      }),
    });
  },

  editarInversion: (categoria, id, cambios) => {
    const p = get().proyecto;
    if (!p) return;
    set({
      proyecto: conTimestamp({
        ...p,
        inversiones: {
          ...p.inversiones,
          [categoria]: p.inversiones[categoria].map((it) =>
            it.id === id ? recalcularItemInversion({ ...it, ...cambios }) : it
          ),
        },
      }),
    });
  },

  eliminarInversion: (categoria, id) => {
    const p = get().proyecto;
    if (!p) return;
    set({
      proyecto: conTimestamp({
        ...p,
        inversiones: {
          ...p.inversiones,
          [categoria]: p.inversiones[categoria].filter((it) => it.id !== id),
        },
      }),
    });
  },

  // -- Capital de trabajo --
  setCapitalTrabajo: (monto) => {
    const p = get().proyecto;
    if (!p) return;
    set({ proyecto: conTimestamp({ ...p, capitalTrabajo: monto }) });
  },
  setMesesBufferCapitalTrabajo: (meses) => {
    const p = get().proyecto;
    if (!p) return;
    set({
      proyecto: conTimestamp({
        ...p,
        mesesBufferCapitalTrabajo: Math.max(1, Math.round(meses * 10) / 10),
      }),
    });
  },

  // -- Personal --
  agregarPuesto: (puesto) => {
    const p = get().proyecto;
    if (!p) return;
    set({
      proyecto: conTimestamp({
        ...p,
        personal: [...p.personal, { ...puesto, id: nuevoId() }],
      }),
    });
  },
  editarPuesto: (id, cambios) => {
    const p = get().proyecto;
    if (!p) return;
    set({
      proyecto: conTimestamp({
        ...p,
        personal: p.personal.map((x) => (x.id === id ? { ...x, ...cambios } : x)),
      }),
    });
  },
  eliminarPuesto: (id) => {
    const p = get().proyecto;
    if (!p) return;
    set({
      proyecto: conTimestamp({ ...p, personal: p.personal.filter((x) => x.id !== id) }),
    });
  },

  // -- Costos directos --
  agregarCostoDirecto: (c) => {
    const p = get().proyecto;
    if (!p) return;
    set({
      proyecto: conTimestamp({
        ...p,
        costosDirectos: [
          ...p.costosDirectos,
          {
            ...c,
            creditoFiscalIVA:
              c.creditoFiscalIVA ?? defaultCreditoFiscalIVACostoDirecto(c.categoria),
            id: nuevoId(),
          },
        ],
      }),
    });
  },
  editarCostoDirecto: (id, cambios) => {
    const p = get().proyecto;
    if (!p) return;
    set({
      proyecto: conTimestamp({
        ...p,
        costosDirectos: p.costosDirectos.map((x) =>
          x.id === id ? { ...x, ...cambios } : x
        ),
      }),
    });
  },
  eliminarCostoDirecto: (id) => {
    const p = get().proyecto;
    if (!p) return;
    set({
      proyecto: conTimestamp({
        ...p,
        costosDirectos: p.costosDirectos.filter((x) => x.id !== id),
      }),
    });
  },

  // -- Costos administración --
  agregarCostoAdministracion: (c) => {
    const p = get().proyecto;
    if (!p) return;
    set({
      proyecto: conTimestamp({
        ...p,
        costosAdministracion: [
          ...p.costosAdministracion,
          { ...c, creditoFiscalIVA: c.creditoFiscalIVA ?? true, id: nuevoId() },
        ],
      }),
    });
  },
  editarCostoAdministracion: (id, cambios) => {
    const p = get().proyecto;
    if (!p) return;
    set({
      proyecto: conTimestamp({
        ...p,
        costosAdministracion: p.costosAdministracion.map((x) =>
          x.id === id ? { ...x, ...cambios } : x
        ),
      }),
    });
  },
  eliminarCostoAdministracion: (id) => {
    const p = get().proyecto;
    if (!p) return;
    set({
      proyecto: conTimestamp({
        ...p,
        costosAdministracion: p.costosAdministracion.filter((x) => x.id !== id),
      }),
    });
  },

  // -- Costos comercialización --
  agregarCostoComercializacion: (c) => {
    const p = get().proyecto;
    if (!p) return;
    set({
      proyecto: conTimestamp({
        ...p,
        costosComercializacion: [
          ...p.costosComercializacion,
          { ...c, creditoFiscalIVA: c.creditoFiscalIVA ?? true, id: nuevoId() },
        ],
      }),
    });
  },
  editarCostoComercializacion: (id, cambios) => {
    const p = get().proyecto;
    if (!p) return;
    set({
      proyecto: conTimestamp({
        ...p,
        costosComercializacion: p.costosComercializacion.map((x) =>
          x.id === id ? { ...x, ...cambios } : x
        ),
      }),
    });
  },
  eliminarCostoComercializacion: (id) => {
    const p = get().proyecto;
    if (!p) return;
    set({
      proyecto: conTimestamp({
        ...p,
        costosComercializacion: p.costosComercializacion.filter((x) => x.id !== id),
      }),
    });
  },

  // -- Imprevistos --
  setImprevistosPorcentaje: (porcentaje) => {
    const p = get().proyecto;
    if (!p) return;
    set({ proyecto: conTimestamp({ ...p, imprevistosPorcentaje: porcentaje }) });
  },

  // -- Productos --
  agregarProducto: (prod) => {
    const p = get().proyecto;
    if (!p) return;
    set({
      proyecto: conTimestamp({
        ...p,
        productos: [...p.productos, { ...prod, aplicaIVA: prod.aplicaIVA ?? true, id: nuevoId() }],
      }),
    });
  },
  editarProducto: (id, cambios) => {
    const p = get().proyecto;
    if (!p) return;
    set({
      proyecto: conTimestamp({
        ...p,
        productos: p.productos.map((x) => (x.id === id ? { ...x, ...cambios } : x)),
      }),
    });
  },
  eliminarProducto: (id) => {
    const p = get().proyecto;
    if (!p) return;
    set({
      proyecto: conTimestamp({
        ...p,
        productos: p.productos.filter((x) => x.id !== id),
      }),
    });
  },

  // -- Financiamiento --
  setFinanciamiento: (f) => {
    const p = get().proyecto;
    if (!p) return;
    set({
      proyecto: conTimestamp({
        ...p,
        financiamiento: { ...p.financiamiento, ...f },
      }),
    });
  },

  setCrecimientoIngresos: (g) => {
    const p = get().proyecto;
    if (!p) return;
    set({ proyecto: conTimestamp({ ...p, crecimientoIngresosAnual: g }) });
  },
  setCrecimientoCostos: (g) => {
    const p = get().proyecto;
    if (!p) return;
    set({ proyecto: conTimestamp({ ...p, crecimientoCostosAnual: g }) });
  },

  setTasaCrecCantidad: (indice, valorPct) => {
    const p = get().proyecto;
    if (!p) return;
    const tasas: [number, number, number, number] = [...((p.tasasCrecCantidad ?? [0, 0, 0, 0]) as [number, number, number, number])];
    tasas[indice] = valorPct;
    // Recalcular cantidades de TODOS los productos a partir de año 1
    const productos = p.productos.map((prod: any) => {
      const c0 = (prod.cantidades?.[0] ?? prod.cantidadAnio1 ?? 0);
      const cantidades: [number, number, number, number, number] = [c0, c0, c0, c0, c0];
      for (let i = 1; i < 5; i++) {
        cantidades[i] = Math.round(cantidades[i - 1] * (1 + tasas[i - 1] / 100));
      }
      return { ...prod, cantidades };
    });
    set({ proyecto: conTimestamp({ ...p, productos, tasasCrecCantidad: tasas }) });
  },

  setTasaCrecPrecio: (indice, valorPct) => {
    const p = get().proyecto;
    if (!p) return;
    const tasas: [number, number, number, number] = [...((p.tasasCrecPrecio ?? [0, 0, 0, 0]) as [number, number, number, number])];
    tasas[indice] = valorPct;
    const productos = p.productos.map((prod: any) => {
      const pr0 = (prod.precios?.[0] ?? prod.precioVenta ?? 0);
      const precios: [number, number, number, number, number] = [pr0, pr0, pr0, pr0, pr0];
      for (let i = 1; i < 5; i++) {
        const sinRedondear = precios[i - 1] * (1 + tasas[i - 1] / 100);
        // Para precios mantengo 2 decimales (centavos)
        precios[i] = Math.round(sinRedondear * 100) / 100;
      }
      return { ...prod, precios };
    });
    set({ proyecto: conTimestamp({ ...p, productos, tasasCrecPrecio: tasas }) });
  },

  setCapmV2: (cambios) => {
    const p = get().proyecto;
    if (!p) return;
    const capm = {
      tasaLibreRiesgo: 0.04,
      beta: 1,
      primaMercado: 0.08,
      ...(p.capmV2 ?? {}),
      ...cambios,
    };
    const ke = calcularCostoCapitalCAPM(capm.tasaLibreRiesgo, capm.beta, capm.primaMercado);
    set({
      proyecto: conTimestamp({
        ...p,
        capmV2: capm,
        financiamiento: { ...p.financiamiento, costoOportunidadAccionista: ke },
      }),
    });
  },

  setSuscripcionV2: (cambios) => {
    const p = get().proyecto;
    if (!p) return;
    // Compat: edita el PRIMER plan (o crea uno si no existe ninguno).
    const planesActuales = obtenerPlanesSuscripcionStore(p);
    const primero = planesActuales[0] ?? {
      id: nuevoId(),
      nombre: "Plan básico",
      suscriptoresIniciales: 100,
      altasMensuales: 20,
      churnMensual: 0.05,
      cuotaMensual: 30,
    };
    const primeroEditado = { ...primero, ...cambios };
    const planesNuevos = [primeroEditado, ...planesActuales.slice(1)];
    set({ proyecto: aplicarPlanesSuscripcion(p, planesNuevos) });
  },

  agregarPlanSuscripcion: (nombre) => {
    const p = get().proyecto;
    if (!p) return;
    const planesActuales = obtenerPlanesSuscripcionStore(p);
    const nombreDefault = nombre ?? sugerirNombrePlan(planesActuales.length);
    const nuevo: PlanSuscripcion = {
      id: nuevoId(),
      nombre: nombreDefault,
      suscriptoresIniciales: 0,
      altasMensuales: 10,
      churnMensual: 0.05,
      cuotaMensual: 50,
    };
    set({
      proyecto: aplicarPlanesSuscripcion(p, [...planesActuales, nuevo]),
    });
  },

  editarPlanSuscripcion: (id, cambios) => {
    const p = get().proyecto;
    if (!p) return;
    const planesActuales = obtenerPlanesSuscripcionStore(p);
    const planesNuevos = planesActuales.map((pl) =>
      pl.id === id ? { ...pl, ...cambios } : pl
    );
    set({ proyecto: aplicarPlanesSuscripcion(p, planesNuevos) });
  },

  eliminarPlanSuscripcion: (id) => {
    const p = get().proyecto;
    if (!p) return;
    const planesActuales = obtenerPlanesSuscripcionStore(p);
    if (planesActuales.length <= 1) return; // no permitir quedarse sin planes
    const planesNuevos = planesActuales.filter((pl) => pl.id !== id);
    set({ proyecto: aplicarPlanesSuscripcion(p, planesNuevos) });
  },

  setPublicidadV2: (cambios) => {
    const p = get().proyecto;
    if (!p) return;
    const params = {
      audienciaMensual: 10000,
      crecimientoMensual: 0.05,
      impresionesPorUsuario: 4,
      cpm: 40,
      ...(p.publicidadV2 ?? {}),
      ...cambios,
    };
    const proy = proyectarPublicidad(params, 5);
    // Producto portador: cantidad = miles de impresiones del año, precio = CPM.
    const cantidades = proy.map((a) => Math.round(a.impresionesAnio / 1000)) as [
      number, number, number, number, number,
    ];
    const precios: [number, number, number, number, number] = [
      params.cpm, params.cpm, params.cpm, params.cpm, params.cpm,
    ];
    const prodId = p.productos[0]?.id ?? nuevoId();
    const producto: Producto = {
      id: prodId,
      nombre: "Publicidad",
      unidadMedida: "mil impresiones",
      cantidades,
      precios,
    };
    set({
      proyecto: conTimestamp({
        ...p,
        modeloIngreso: "publicidad",
        publicidadV2: params,
        productos: [producto],
      }),
    });
  },

  setCostoBeneficioV2: (cambios) => {
    const p = get().proyecto;
    if (!p) return;
    const params = {
      beneficioAnualBase: 100000,
      crecimientoAnual: 0.05,
      ...(p.costoBeneficioV2 ?? {}),
      ...cambios,
    };
    // El beneficio incremental se modela como el "ingreso" (cantidad 1 × beneficio).
    const precios = [0, 1, 2, 3, 4].map(
      (i) => Math.round(params.beneficioAnualBase * Math.pow(1 + params.crecimientoAnual, i) * 100) / 100
    ) as [number, number, number, number, number];
    const prodId = p.productos[0]?.id ?? nuevoId();
    const producto: Producto = {
      id: prodId,
      nombre: "Beneficio incremental estimado",
      unidadMedida: "año",
      cantidades: [1, 1, 1, 1, 1],
      precios,
    };
    set({
      proyecto: conTimestamp({
        ...p,
        modeloIngreso: "costo_beneficio",
        costoBeneficioV2: params,
        productos: [producto],
      }),
    });
  },

  setAportePatronal: (campo, valorDecimal) => {
    const p = get().proyecto;
    if (!p) return;
    const override = { ...(p.aportesPatronalesOverride ?? {}), [campo]: valorDecimal };
    set({ proyecto: conTimestamp({ ...p, aportesPatronalesOverride: override }) });
  },

  restaurarAportesPatronalesDefault: () => {
    const p = get().proyecto;
    if (!p) return;
    set({ proyecto: conTimestamp({ ...p, aportesPatronalesOverride: undefined }) });
  },

  setEstado: (estado) => {
    const p = get().proyecto;
    if (!p) return;
    set({ proyecto: conTimestamp({ ...p, estado }) });
  },
}));
