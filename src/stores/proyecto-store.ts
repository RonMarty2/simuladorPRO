import { create } from "zustand";
import { crearProyectoVacio, nuevoId } from "@/lib/proyecto-factory";
import {
  calcularDepreciacionAnual,
  calcularValorResidual,
} from "@/lib/calculo-financiero";
import type {
  CategoriaInversion,
  CostoDirecto,
  CostoGeneral,
  EstadoProyecto,
  Financiamiento,
  ItemInversion,
  Producto,
  Proyecto,
  PuestoTrabajo,
  Sector,
} from "@/types/proyecto";

interface ProyectoState {
  proyecto: Proyecto | null;

  // Ciclo de vida
  inicializar: (estudiante_id: string, nombre: string, curso_id?: string | null) => void;
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

  inicializar: (estudiante_id, nombre, curso_id) => {
    set({ proyecto: crearProyectoVacio({ estudiante_id, nombre, curso_id }) });
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
    const base: ItemInversion = { ...item, id: nuevoId(), costoTotal: 0, depreciacionAnual: 0, valorResidual: 0 };
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
        costosDirectos: [...p.costosDirectos, { ...c, id: nuevoId() }],
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
        costosAdministracion: [...p.costosAdministracion, { ...c, id: nuevoId() }],
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
        costosComercializacion: [...p.costosComercializacion, { ...c, id: nuevoId() }],
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
        productos: [...p.productos, { ...prod, id: nuevoId() }],
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

  setEstado: (estado) => {
    const p = get().proyecto;
    if (!p) return;
    set({ proyecto: conTimestamp({ ...p, estado }) });
  },
}));
