import { beforeEach, describe, expect, it } from "vitest";
import {
  esModoLocal,
  guardarProyectoLocal,
  leerProyectosLocal,
  eliminarProyectoLocal,
  leerRolLocal,
  guardarRolLocal,
  perfilLocal,
  ID_USUARIO_LOCAL,
} from "@/lib/modo-local";
import { crearProyectoVacio } from "@/lib/proyecto-factory";

// Stub mínimo de localStorage (los tests corren en node, sin DOM).
function instalarLocalStorage() {
  const mapa = new Map<string, string>();
  (globalThis as any).localStorage = {
    getItem: (k: string) => (mapa.has(k) ? mapa.get(k)! : null),
    setItem: (k: string, v: string) => void mapa.set(k, v),
    removeItem: (k: string) => void mapa.delete(k),
    clear: () => mapa.clear(),
  };
}

beforeEach(() => {
  instalarLocalStorage();
});

describe("modo local", () => {
  it("sin credenciales (env de test) detecta modo local", () => {
    // Depende del entorno: si el dev tiene .env.local con Supabase real, no aplica.
    const hayCredenciales = !!import.meta.env.VITE_SUPABASE_URL;
    expect(esModoLocal()).toBe(!hayCredenciales);
  });

  it("el rol por defecto es estudiante y persiste el cambio", () => {
    expect(leerRolLocal()).toBe("estudiante");
    guardarRolLocal("docente");
    expect(leerRolLocal()).toBe("docente");
  });

  it("perfilLocal arma un perfil coherente con el rol", () => {
    const p = perfilLocal("docente");
    expect(p.rol).toBe("docente");
    expect(p.id).toBe(ID_USUARIO_LOCAL);
    expect(p.es_admin).toBe(true);
  });

  it("guarda, lista y elimina proyectos en localStorage (upsert por id)", () => {
    const proy = crearProyectoVacio({ estudiante_id: ID_USUARIO_LOCAL, nombre: "Uno" });
    guardarProyectoLocal(proy);
    expect(leerProyectosLocal()).toHaveLength(1);

    // Upsert: mismo id no duplica, actualiza.
    guardarProyectoLocal({ ...proy, nombre: "Uno editado" });
    const lista = leerProyectosLocal();
    expect(lista).toHaveLength(1);
    expect(lista[0].nombre).toBe("Uno editado");

    eliminarProyectoLocal(proy.id);
    expect(leerProyectosLocal()).toHaveLength(0);
  });

  it("no revienta si localStorage no está disponible", () => {
    delete (globalThis as any).localStorage;
    expect(() => leerProyectosLocal()).not.toThrow();
    expect(leerProyectosLocal()).toEqual([]);
    expect(leerRolLocal()).toBe("estudiante");
  });
});
