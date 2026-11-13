import { describe, it, expect, vi } from "vitest";

vi.mock("./supabase", () => ({ supabase: {} }));
vi.mock("./modo-local", () => ({ esModoLocal: () => false }));
vi.mock("./proyecto-supabase", () => ({
  guardarProyecto: vi.fn(),
  listarProyectosGrupales: vi.fn(),
  proyectoAFilaSupabase: vi.fn(),
}));

import { construirCasoGrupal } from "./caso-grupal";
import { crearProyectoEjemploCafeteriaV2, crearProyectoVacio } from "./proyecto-factory";

function crearPar() {
  const individual = crearProyectoEjemploCafeteriaV2({ estudiante_id: "est-1" });
  individual.curso_id = "curso-1";
  individual.estado = "finalizado";
  const grupal = crearProyectoVacio({
    estudiante_id: "est-2",
    curso_id: "curso-1",
    nombre: "Grupo A · proyecto grupal",
  });
  grupal.tipo = "proyecto_grupal";
  grupal.grupo_id = "grupo-1";
  return { individual, grupal };
}

describe("construirCasoGrupal", () => {
  it("copia los datos del individual pero conserva la identidad del grupo", () => {
    const { individual, grupal } = crearPar();
    const r = construirCasoGrupal(individual, grupal);
    expect(r.id).toBe(grupal.id);
    expect(r.estudiante_id).toBe("est-2");
    expect(r.grupo_id).toBe("grupo-1");
    expect(r.curso_id).toBe("curso-1");
    expect(r.nombre).toBe(grupal.nombre);
    expect(r.tipo).toBe("proyecto_grupal");
    expect(r.copiadoDeProyectoId).toBe(individual.id);
    expect(r.productos).toEqual(individual.productos);
    expect(r.inversiones).toEqual(individual.inversiones);
  });

  it("un individual terminado queda 'completo' en el grupo", () => {
    const { individual, grupal } = crearPar();
    expect(construirCasoGrupal(individual, grupal).estado).toBe("completo");
    individual.estado = "construyendo";
    expect(construirCasoGrupal(individual, grupal).estado).toBe("construyendo");
  });

  it("no modifica el caso individual y la copia es independiente", () => {
    const { individual, grupal } = crearPar();
    const antes = JSON.stringify(individual);
    const r = construirCasoGrupal(individual, grupal);
    r.productos[0].nombre = "EDITADO POR EL GRUPO";
    r.inversiones.terreno.push({} as any);
    expect(JSON.stringify(individual)).toBe(antes);
  });
});
