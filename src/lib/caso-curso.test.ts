import { describe, it, expect, vi } from "vitest";

vi.mock("./supabase", () => ({ supabase: {} }));
vi.mock("./modo-local", () => ({
  esModoLocal: () => false,
  guardarProyectoLocal: vi.fn(),
  eliminarProyectoLocal: vi.fn(),
  leerProyectosLocal: vi.fn(() => []),
}));
vi.mock("@/stores/auth-store", () => ({ useAuthStore: vi.fn() }));
vi.mock("@/stores/proyecto-store", () => ({ useProyectoStore: vi.fn() }));
vi.mock("./cursos-supabase", () => ({ listarMisCursos: vi.fn() }));
vi.mock("lucide-react", () => ({
  BookmarkPlus: () => null,
  CheckCircle2: () => null,
  Loader2: () => null,
  X: () => null,
}));

import {
  construirCasoDelCursoDesdeProyecto,
  limpiarNombreParaCasoDelCurso,
} from "./proyecto-supabase";
import { debeClonarComoCasoNuevo } from "@/components/docente/BotonGuardarComoCaso";
import { crearProyectoEjemploCafeteriaV2, crearProyectoVacio } from "./proyecto-factory";

describe("limpiarNombreParaCasoDelCurso", () => {
  it("quita sufijos ' — entrega', ' · proyecto grupal' y espacios extra", () => {
    expect(limpiarNombreParaCasoDelCurso("  Panadería Aurora — entrega  ")).toBe(
      "Panadería Aurora"
    );
    expect(limpiarNombreParaCasoDelCurso("Grupo Alfa · proyecto grupal")).toBe(
      "Grupo Alfa"
    );
    expect(limpiarNombreParaCasoDelCurso("Café Central - Entrega")).toBe(
      "Café Central"
    );
  });

  it("cae a 'Caso del curso' si queda vacío", () => {
    expect(limpiarNombreParaCasoDelCurso("")).toBe("Caso del curso");
    expect(limpiarNombreParaCasoDelCurso("   ")).toBe("Caso del curso");
    expect(limpiarNombreParaCasoDelCurso(" — entrega ")).toBe("Caso del curso");
  });
});

describe("construirCasoDelCursoDesdeProyecto", () => {
  it("genera un id nuevo distinto al original y asigna metadatos de caso_curso", () => {
    const origen = crearProyectoEjemploCafeteriaV2({ estudiante_id: "est-1" });
    origen.curso_id = "curso-origen";
    origen.grupo_id = "grupo-1";
    origen.tipo = "proyecto_grupal";
    origen.caso_origen_id = "caso-previo";
    origen.estado = "construyendo";

    const caso = construirCasoDelCursoDesdeProyecto(origen, {
      docenteId: "doc-1",
      cursoId: "curso-destino",
      pasoInicioEstudiante: 4,
    });

    expect(caso.id).toBeTruthy();
    expect(caso.id).not.toBe(origen.id);
    expect(caso.estudiante_id).toBe("doc-1");
    expect(caso.curso_id).toBe("curso-destino");
    expect(caso.grupo_id).toBeNull();
    expect(caso.tipo).toBe("caso_curso");
    expect(caso.caso_origen_id).toBeNull();
    expect(caso.estado).toBe("completo");
    expect(caso.copiadoDeProyectoId).toBe(origen.id);
    expect(caso.paso_inicio_estudiante).toBe(4);
  });

  it("clona en profundidad: mutar productos o inversiones no muta el proyecto original", () => {
    const origen = crearProyectoEjemploCafeteriaV2({ estudiante_id: "est-1" });
    const snapshotOriginal = JSON.stringify(origen);

    const caso = construirCasoDelCursoDesdeProyecto(origen, {
      docenteId: "doc-1",
      cursoId: "curso-1",
      pasoInicioEstudiante: 5,
    });

    caso.productos[0].nombre = "PRODUCTO MODIFICADO EN CASO";
    caso.inversiones.terreno.push({} as any);

    expect(JSON.stringify(origen)).toBe(snapshotOriginal);
  });

  it("respeta nombre personalizado y acota paso_inicio_estudiante entre 1 y 9", () => {
    const origen = crearProyectoVacio({
      estudiante_id: "est-1",
      curso_id: "curso-1",
      nombre: "Proyecto Base — entrega",
    });

    const conNombre = construirCasoDelCursoDesdeProyecto(origen, {
      docenteId: "doc-1",
      cursoId: "curso-1",
      pasoInicioEstudiante: 0,
      nombre: "  Caso Personalizado  ",
    });
    expect(conNombre.nombre).toBe("Caso Personalizado");
    expect(conNombre.paso_inicio_estudiante).toBe(1);

    const pasoAlto = construirCasoDelCursoDesdeProyecto(origen, {
      docenteId: "doc-1",
      cursoId: "curso-1",
      pasoInicioEstudiante: 15,
    });
    expect(pasoAlto.nombre).toBe("Proyecto Base");
    expect(pasoAlto.paso_inicio_estudiante).toBe(9);
  });
});

describe("debeClonarComoCasoNuevo", () => {
  it("devuelve true para proyecto_grupal incluso cuando estudiante_id === docenteId", () => {
    const p = crearProyectoVacio({
      estudiante_id: "doc-1",
      curso_id: "curso-1",
      nombre: "Proyecto grupal",
    });
    p.tipo = "proyecto_grupal";
    p.grupo_id = "grupo-1";
    expect(debeClonarComoCasoNuevo(p, "doc-1", "curso-1")).toBe(true);
  });

  it("devuelve true para entrega_estudiante o proyecto de otro estudiante_id", () => {
    const entregaPropia = crearProyectoVacio({
      estudiante_id: "doc-1",
      curso_id: "curso-1",
      nombre: "Entrega",
    });
    entregaPropia.tipo = "entrega_estudiante";
    expect(debeClonarComoCasoNuevo(entregaPropia, "doc-1", "curso-1")).toBe(true);

    const otroEstudiante = crearProyectoVacio({
      estudiante_id: "est-99",
      curso_id: "curso-1",
      nombre: "Proyecto estudiante",
    });
    otroEstudiante.tipo = "libre";
    expect(debeClonarComoCasoNuevo(otroEstudiante, "doc-1", "curso-1")).toBe(true);
  });

  it("devuelve true para caso_curso propio llevado a otro cursoDestinoId", () => {
    const casoPropio = crearProyectoVacio({
      estudiante_id: "doc-1",
      curso_id: "curso-A",
      nombre: "Caso A",
    });
    casoPropio.tipo = "caso_curso";
    expect(debeClonarComoCasoNuevo(casoPropio, "doc-1", "curso-B")).toBe(true);
  });

  it("devuelve false para proyecto libre o caso_curso propio del docente en el mismo curso", () => {
    const librePropio = crearProyectoVacio({
      estudiante_id: "doc-1",
      curso_id: "curso-1",
      nombre: "Libre docente",
    });
    librePropio.tipo = "libre";
    expect(debeClonarComoCasoNuevo(librePropio, "doc-1", "curso-1")).toBe(false);

    const casoMismoCurso = crearProyectoVacio({
      estudiante_id: "doc-1",
      curso_id: "curso-1",
      nombre: "Caso 1",
    });
    casoMismoCurso.tipo = "caso_curso";
    expect(debeClonarComoCasoNuevo(casoMismoCurso, "doc-1", "curso-1")).toBe(false);
  });
});
