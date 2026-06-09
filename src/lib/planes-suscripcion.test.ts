import { describe, it, expect } from "vitest";
import {
  obtenerPlanesSuscripcion,
  nuevoPlanSuscripcionVacio,
  planSuscripcionInicial,
} from "./planes-suscripcion";
import type { Proyecto } from "@/types/proyecto";

function proyectoBase(): Proyecto {
  return {
    id: "p1",
    estudiante_id: "e1",
    curso_id: null,
    nombre: "test",
    modeloIngreso: "suscripcion",
  } as unknown as Proyecto;
}

describe("obtenerPlanesSuscripcion", () => {
  it("devuelve [] si no hay suscripcionV2", () => {
    const p = proyectoBase();
    delete (p as { suscripcionV2?: unknown }).suscripcionV2;
    expect(obtenerPlanesSuscripcion(p)).toEqual([]);
  });

  it("deriva un plan legacy desde los campos planos si no hay planes[]", () => {
    const p = proyectoBase();
    p.suscripcionV2 = {
      suscriptoresIniciales: 100,
      altasMensuales: 20,
      churnMensual: 0.05,
      cuotaMensual: 30,
    };
    const planes = obtenerPlanesSuscripcion(p);
    expect(planes).toHaveLength(1);
    expect(planes[0].nombre).toBe("Plan único");
    expect(planes[0].cuotaMensual).toBe(30);
  });

  it("devuelve planes[] cuando existen", () => {
    const p = proyectoBase();
    p.suscripcionV2 = {
      suscriptoresIniciales: 100,
      altasMensuales: 20,
      churnMensual: 0.05,
      cuotaMensual: 30,
      planes: [
        { id: "a", nombre: "Básico", suscriptoresIniciales: 100, altasMensuales: 20, churnMensual: 0.05, cuotaMensual: 30 },
        { id: "b", nombre: "VIP", suscriptoresIniciales: 20, altasMensuales: 5, churnMensual: 0.03, cuotaMensual: 100 },
      ],
    };
    const planes = obtenerPlanesSuscripcion(p);
    expect(planes).toHaveLength(2);
    expect(planes[1].nombre).toBe("VIP");
  });
});

describe("nuevoPlanSuscripcionVacio", () => {
  it("genera un plan con el nombre dado y un id único", () => {
    const a = nuevoPlanSuscripcionVacio("Plan VIP");
    const b = nuevoPlanSuscripcionVacio("Plan VIP");
    expect(a.nombre).toBe("Plan VIP");
    expect(a.id).not.toBe(b.id);
    expect(a.altasMensuales).toBeGreaterThan(0);
    expect(a.cuotaMensual).toBeGreaterThan(0);
  });
});

describe("planSuscripcionInicial", () => {
  it("genera el plan por defecto al crear un proyecto", () => {
    const plan = planSuscripcionInicial();
    expect(plan.nombre).toBe("Plan básico");
    expect(plan.suscriptoresIniciales).toBe(100);
    expect(plan.cuotaMensual).toBe(30);
  });
});
