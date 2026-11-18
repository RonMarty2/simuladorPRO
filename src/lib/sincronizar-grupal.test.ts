import { describe, it, expect } from "vitest";
import { crearProyectoVacio } from "./proyecto-factory";
import {
  clonarProfundo,
  contenidoProyectoIgual,
  fusionarProyectoGrupal,
} from "./sincronizar-grupal";

describe("fusionarProyectoGrupal", () => {
  it("conserva lo que hace la compañera en otro paso cuando yo guardo lo mío", () => {
    const base = crearProyectoVacio({
      estudiante_id: "est-a",
      curso_id: "curso-1",
      nombre: "Grupo 1 · proyecto grupal",
    });
    base.tipo = "proyecto_grupal";
    base.grupo_id = "grupo-1";

    // Estudiante A edita Paso 1 (ubicación y descripción) y agrega un producto:
    const localA = clonarProfundo(base);
    localA.ubicacion = "Cochabamba";
    localA.descripcion = "Planta de biodiesel";
    localA.productos.push({
      id: "prod-a",
      nombre: "Biodiesel B20",
      unidadMedida: "litros",
      cantidades: [1000, 1100, 1200, 1300, 1400],
      precios: [6, 6, 6, 6, 6],
    });

    // Mientras tanto, en la base (remoto), la compañera B ya guardó personal (Paso 4)
    // y otro producto (Paso 2):
    const remotoB = clonarProfundo(base);
    remotoB.productos.push({
      id: "prod-b",
      nombre: "Glicerina",
      unidadMedida: "kg",
      cantidades: [200, 220, 240, 260, 280],
      precios: [15, 15, 15, 15, 15],
    });
    remotoB.personal.push({
      id: "puesto-b",
      puesto: "Operario químico",
      cantidad: 2,
      sueldoMensual: 3500,
    });

    const fusionado = fusionarProyectoGrupal(base, localA, remotoB);

    // Se conserva lo de Estudiante A:
    expect(fusionado.ubicacion).toBe("Cochabamba");
    expect(fusionado.descripcion).toBe("Planta de biodiesel");
    // Y también se conserva todo lo que hizo la compañera B:
    expect(fusionado.productos.map((p) => p.id)).toEqual(["prod-b", "prod-a"]);
    expect(fusionado.personal).toHaveLength(1);
    expect(fusionado.personal[0].puesto).toBe("Operario químico");
  });

  it("permite que cada integrante edite distintos ítems de la misma lista sin pisarse", () => {
    const base = crearProyectoVacio({
      estudiante_id: "est-a",
      curso_id: "curso-1",
      nombre: "Grupo 1",
    });
    base.productos = [
      {
        id: "p1",
        nombre: "Pan",
        unidadMedida: "u",
        cantidades: [100, 100, 100, 100, 100],
        precios: [1, 1, 1, 1, 1],
      },
      {
        id: "p2",
        nombre: "Torta",
        unidadMedida: "u",
        cantidades: [10, 10, 10, 10, 10],
        precios: [50, 50, 50, 50, 50],
      },
    ];

    const localA = clonarProfundo(base);
    localA.productos[0].precios = [2, 2, 2, 2, 2]; // A subió el precio del Pan

    const remotoB = clonarProfundo(base);
    remotoB.productos[1].precios = [80, 80, 80, 80, 80]; // B subió el precio de la Torta

    const fusionado = fusionarProyectoGrupal(base, localA, remotoB);
    expect(fusionado.productos[0].precios[0]).toBe(2);
    expect(fusionado.productos[1].precios[0]).toBe(80);
  });

  it("contenidoProyectoIgual ignora el orden de propiedades y diferencias undefined vs null", () => {
    const a = crearProyectoVacio({
      estudiante_id: "est-a",
      curso_id: "curso-1",
      nombre: "Grupo 1",
    });
    const b = {
      productos: a.productos,
      inversiones: a.inversiones,
      ...a,
      esSemanaE: false,
      caso_origen_id: null,
      paso_inicio_estudiante: null,
      actualizado_en: "2099-01-01T00:00:00.000Z",
    };
    expect(contenidoProyectoIgual(a, b)).toBe(true);
  });
});
