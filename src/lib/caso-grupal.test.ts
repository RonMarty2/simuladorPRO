import { describe, it, expect, vi } from "vitest";

vi.mock("./supabase", () => ({ supabase: {} }));
vi.mock("./modo-local", () => ({ esModoLocal: () => false }));
vi.mock("./proyecto-supabase", () => ({
  guardarProyecto: vi.fn(),
  listarProyectosGrupales: vi.fn(),
  proyectoAFilaSupabase: vi.fn(),
}));

import {
  construirCasoGrupal,
  limpiarNombreCaso,
  nombreProyectoGrupalConCaso,
  pasarCasoAGrupo,
  tieneContenidoReal,
  validarReemplazoGrupal,
} from "./caso-grupal";
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

  it("permite pasar un proyecto libre o de otro curso al curso del grupo y actualizar el nombre", () => {
    const { individual, grupal } = crearPar();
    individual.curso_id = null;
    individual.nombre = "PANADERIA — entrega";
    const r = construirCasoGrupal(individual, grupal, {
      nombre: nombreProyectoGrupalConCaso("Los emprendedores", individual.nombre),
    });
    expect(r.curso_id).toBe("curso-1");
    expect(r.grupo_id).toBe("grupo-1");
    expect(r.nombre).toBe("Los emprendedores · PANADERIA");
    expect(limpiarNombreCaso("PANADERIA — entrega")).toBe("PANADERIA");
  });
});

describe("tieneContenidoReal", () => {
  it("devuelve false para un proyecto vacío", () => {
    const vacio = crearProyectoVacio({ estudiante_id: "est-1", nombre: "Cafetería" });
    expect(tieneContenidoReal(vacio)).toBe(false);
  });

  it("devuelve true cuando tiene productos, inversiones o ubicación", () => {
    const conProductos = crearProyectoEjemploCafeteriaV2({ estudiante_id: "est-1" });
    expect(tieneContenidoReal(conProductos)).toBe(true);

    const conUbicacion = crearProyectoVacio({ estudiante_id: "est-1", nombre: "Nuevo" });
    conUbicacion.ubicacion = "Cochabamba";
    expect(tieneContenidoReal(conUbicacion)).toBe(true);

    const conInversion = crearProyectoVacio({ estudiante_id: "est-1", nombre: "Nuevo" });
    conInversion.inversiones.maquinaria.push({
      id: "inv-1",
      descripcion: "Horno",
      unidadMedida: "unidad",
      cantidad: 1,
      costoUnitario: 5000,
      costoTotal: 5000,
      vidaUtilAnios: 10,
      depreciacionAnual: 500,
      valorResidual: 0,
    });
    expect(tieneContenidoReal(conInversion)).toBe(true);
  });
});

describe("validarReemplazoGrupal y pasarCasoAGrupo", () => {
  it("bloquea cuando el origen está vacío y el destino tiene datos", () => {
    const origen = crearProyectoVacio({ estudiante_id: "est-1", nombre: "Cafetería" });
    const destino = crearProyectoEjemploCafeteriaV2({ estudiante_id: "est-2" });
    destino.nombre = "Grupo Alfa · proyecto grupal";
    destino.tipo = "proyecto_grupal";
    destino.grupo_id = "grupo-1";

    const msg = validarReemplazoGrupal(origen, destino);
    expect(msg).toBe(
      "Este proyecto está vacío y el grupo «Grupo Alfa · proyecto grupal» ya tiene datos cargados. No se copió para evitar borrar el trabajo del grupo."
    );
  });

  it("permite reemplazar cuando el origen tiene datos o el destino está vacío", () => {
    const origenConDatos = crearProyectoEjemploCafeteriaV2({ estudiante_id: "est-1" });
    const destinoConDatos = crearProyectoEjemploCafeteriaV2({ estudiante_id: "est-2" });
    expect(validarReemplazoGrupal(origenConDatos, destinoConDatos)).toBeNull();

    const origenVacio = crearProyectoVacio({ estudiante_id: "est-1", nombre: "Cafetería" });
    const destinoVacio = crearProyectoVacio({ estudiante_id: "est-2", nombre: "Grupo B" });
    expect(validarReemplazoGrupal(origenVacio, destinoVacio)).toBeNull();
  });

  it("pasarCasoAGrupo rechaza con error cuando origen está vacío y destino tiene datos", async () => {
    const origen = crearProyectoVacio({ estudiante_id: "est-1", nombre: "Cafetería" });
    const destino = crearProyectoEjemploCafeteriaV2({ estudiante_id: "est-2" });
    destino.nombre = "Grupo Beta";
    destino.tipo = "proyecto_grupal";
    destino.grupo_id = "grupo-2";

    await expect(pasarCasoAGrupo(origen, destino)).rejects.toThrow(
      "Este proyecto está vacío y el grupo «Grupo Beta» ya tiene datos cargados. No se copió para evitar borrar el trabajo del grupo."
    );
  });
});
