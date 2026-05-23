import { create } from "zustand";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import {
  cerrarSesion,
  iniciarSesion,
  obtenerPerfil,
  obtenerPerfilConReintentos,
  registrarUsuario,
} from "@/lib/auth-helpers";
import type { DatosRegistro, Perfil } from "@/types/usuario";

interface AuthState {
  user: User | null;
  session: Session | null;
  perfil: Perfil | null;
  cargando: boolean;
  inicializado: boolean;
  inicializar: () => Promise<void>;
  registrar: (datos: DatosRegistro) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  recargarPerfil: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  perfil: null,
  cargando: false,
  inicializado: false,

  inicializar: async () => {
    if (get().inicializado) return;
    set({ cargando: true });

    const { data } = await supabase.auth.getSession();
    const session = data.session ?? null;
    let perfil: Perfil | null = null;
    if (session?.user) {
      perfil = await obtenerPerfil(session.user.id).catch(() => null);
    }

    set({
      session,
      user: session?.user ?? null,
      perfil,
      cargando: false,
      inicializado: true,
    });

    supabase.auth.onAuthStateChange(async (_evento, nuevaSesion) => {
      let nuevoPerfil: Perfil | null = null;
      if (nuevaSesion?.user) {
        nuevoPerfil = await obtenerPerfilConReintentos(nuevaSesion.user.id).catch(
          () => null
        );
      }
      set({
        session: nuevaSesion,
        user: nuevaSesion?.user ?? null,
        perfil: nuevoPerfil,
      });
    });
  },

  registrar: async (datos) => {
    set({ cargando: true });
    try {
      await registrarUsuario(datos);
    } finally {
      set({ cargando: false });
    }
  },

  login: async (email, password) => {
    set({ cargando: true });
    try {
      await iniciarSesion(email, password);
    } finally {
      set({ cargando: false });
    }
  },

  logout: async () => {
    set({ cargando: true });
    try {
      await cerrarSesion();
      set({ user: null, session: null, perfil: null });
    } finally {
      set({ cargando: false });
    }
  },

  recargarPerfil: async () => {
    const u = get().user;
    if (!u) return;
    const perfil = await obtenerPerfilConReintentos(u.id).catch(() => null);
    set({ perfil });
  },
}));
