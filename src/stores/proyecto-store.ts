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
