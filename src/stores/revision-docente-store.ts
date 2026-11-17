import { create } from "zustand";
import type { Proyecto } from "@/types/proyecto";
import { useProyectoStore } from "./proyecto-store";

export type ModoRevisionDocente = "probar" | "editar";

interface RevisionDocenteState {
  activa: boolean;
  titular: string;
  modoEdicion: ModoRevisionDocente;
  proyectoOriginal: Proyecto | null;
  usandoSnapshot: boolean;

  iniciarRevision: (opts: {
    proyecto: Proyecto;
    titular: string;
    usandoSnapshot?: boolean;
  }) => void;
  cambiarModo: (modo: ModoRevisionDocente) => void;
  restaurarOriginal: () => void;
  marcarGuardado: (proyectoActualizado: Proyecto) => void;
  salirRevision: () => void;
}

export const useRevisionDocenteStore = create<RevisionDocenteState>((set, get) => ({
  activa: false,
  titular: "",
  modoEdicion: "probar",
  proyectoOriginal: null,
  usandoSnapshot: false,

  iniciarRevision: ({ proyecto, titular, usandoSnapshot = false }) => {
    const copia = structuredClone(proyecto);
    set({
      activa: true,
      titular,
      modoEdicion: "probar",
      proyectoOriginal: copia,
      usandoSnapshot,
    });
    useProyectoStore.getState().cargar(structuredClone(proyecto));
  },

  cambiarModo: (modo) => set({ modoEdicion: modo }),

  restaurarOriginal: () => {
    const { proyectoOriginal } = get();
    if (!proyectoOriginal) return;
    useProyectoStore.getState().cargar(structuredClone(proyectoOriginal));
  },

  marcarGuardado: (proyectoActualizado) =>
    set({ proyectoOriginal: structuredClone(proyectoActualizado) }),

  salirRevision: () => {
    set({
      activa: false,
      titular: "",
      modoEdicion: "probar",
      proyectoOriginal: null,
      usandoSnapshot: false,
    });
    useProyectoStore.getState().limpiar();
  },
}));
