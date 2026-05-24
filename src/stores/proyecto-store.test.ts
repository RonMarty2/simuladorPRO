import { beforeEach, describe, expect, it } from "vitest";
import { useProyectoStore } from "./proyecto-store";

const reset = () => useProyectoStore.getState().limpiar();
const get = () => useProyectoStore.getState();

describe("proyecto-store", () => {
  beforeEach(() => reset());

  describe("inicializar", () => {
    it("crea un proyecto vacío con valores por defecto bolivianos", () => {
      get().inicializar("est-1", "Proyecto Café Boliviano", "curso-1");
      const p = get().proyecto!;
      expect(p.nombre).toBe("Proyecto Café Boliviano");
      expect(p.estudiante_id).toBe("est-1");
      expect(p.curso_id).toBe("curso-1");
      expect(p.sector).toBe("produccion");
      expect(p.imprevistosPorcentaje).toBe(0.05);
      expect(p.financiamiento.tasaInteresAnual).toBe(0.12);
      expect(p.estado).toBe("construyendo");
    });

    it("crea las 5 categorías de inversión vacías", () => {
      get().inicializar("est", "x", "curso");
      const inv = get().proyecto!.inversiones;
      expect(inv.terreno).toEqual([]);
      expect(inv.obrasCiviles).toEqual([]);
      expect(inv.maquinaria).toEqual([]);
      expect(inv.mobiliario).toEqual([]);
      expect(inv.activoDiferido).toEqual([]);
    });
  });

  describe("inversiones", () => {
    beforeEach(() => get().inicializar("est", "x", "curso"));

    it("agregar maquinaria calcula costoTotal y depreciación automáticamente", () => {
      get().agregarInversion("maquinaria", {
        descripcion: "Tostadora industrial",
        unidadMedida: "unidad",
        cantidad: 2,
        costoUnitario: 30000,
        vidaUtilAnios: 10,
      });
      const items = get().proyecto!.inversiones.maquinaria;
      expect(items).toHaveLength(1);
      expect(items[0].costoTotal).toBe(60000);
      expect(items[0].depreciacionAnual).toBe(6000); // 60000/10
      expect(items[0].valorResidual).toBe(60000); // año 0
      expect(items[0].id).toBeDefined();
    });

    it("terreno con vidaUtil null no se deprecia", () => {
      get().agregarInversion("terreno", {
        descripcion: "Terreno en El Alto",
        unidadMedida: "m²",
        cantidad: 500,
        costoUnitario: 200,
        vidaUtilAnios: null,
      });
      const items = get().proyecto!.inversiones.terreno;
      expect(items[0].costoTotal).toBe(100000);
      expect(items[0].depreciacionAnual).toBe(0);
      expect(items[0].valorResidual).toBe(100000);
    });

    it("editar inversión recalcula derivados", () => {
      get().agregarInversion("maquinaria", {
        descripcion: "Tostadora",
        unidadMedida: "unidad",
        cantidad: 1,
        costoUnitario: 30000,
        vidaUtilAnios: 10,
      });
      const id = get().proyecto!.inversiones.maquinaria[0].id;
      get().editarInversion("maquinaria", id, { cantidad: 3 });
      const item = get().proyecto!.inversiones.maquinaria[0];
      expect(item.costoTotal).toBe(90000);
      expect(item.depreciacionAnual).toBe(9000);
    });

    it("eliminar inversión la quita del array", () => {
      get().agregarInversion("maquinaria", {
        descripcion: "A",
        unidadMedida: "u",
        cantidad: 1,
        costoUnitario: 100,
        vidaUtilAnios: 5,
      });
      const id = get().proyecto!.inversiones.maquinaria[0].id;
      get().eliminarInversion("maquinaria", id);
      expect(get().proyecto!.inversiones.maquinaria).toHaveLength(0);
    });
  });

  describe("personal", () => {
    beforeEach(() => get().inicializar("est", "x", "curso"));

    it("agregar puesto asigna id único", () => {
      get().agregarPuesto({ puesto: "Operario", cantidad: 2, sueldoMensual: 2500 });
      get().agregarPuesto({ puesto: "Supervisor", cantidad: 1, sueldoMensual: 5000 });
      const personal = get().proyecto!.personal;
      expect(personal).toHaveLength(2);
      expect(personal[0].id).not.toBe(personal[1].id);
    });
  });

  describe("financiamiento", () => {
    beforeEach(() => get().inicializar("est", "x", "curso"));

    it("setFinanciamiento mergea cambios parciales", () => {
      get().setFinanciamiento({ porcentajePrestamo: 0.4, porcentajePropio: 0.6 });
      const f = get().proyecto!.financiamiento;
      expect(f.porcentajePrestamo).toBe(0.4);
      expect(f.porcentajePropio).toBe(0.6);
      // los demás valores se mantienen
      expect(f.tasaInteresAnual).toBe(0.12);
      expect(f.plazoMeses).toBe(60);
    });
  });

  describe("estado y timestamps", () => {
    beforeEach(() => get().inicializar("est", "x", "curso"));

    it("cualquier modificación actualiza actualizado_en", async () => {
      const ts0 = get().proyecto!.actualizado_en;
      await new Promise((r) => setTimeout(r, 5));
      get().setCapitalTrabajo(50000);
      const ts1 = get().proyecto!.actualizado_en;
      expect(ts1).not.toBe(ts0);
    });

    it("setEstado cambia el estado del proyecto", () => {
      get().setEstado("completo");
      expect(get().proyecto!.estado).toBe("completo");
    });
  });

  describe("limpiar", () => {
    it("limpiar deja proyecto en null", () => {
      get().inicializar("est", "x", "curso");
      expect(get().proyecto).not.toBeNull();
      get().limpiar();
      expect(get().proyecto).toBeNull();
    });
  });
});
