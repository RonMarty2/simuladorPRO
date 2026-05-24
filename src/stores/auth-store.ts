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

    // Hard timeout total: si después de 15 segundos no terminó, igual marcamos
    // como inicializado para que el usuario pueda ver la pantalla de login en
    // vez de quedarse colgado en "Cargando sesión..." para siempre.
    const timeoutHard = setTimeout(() => {
      if (!get().inicializado) {
        console.warn("Auth init timeout — forzando inicializado=true");
        set({ cargando: false, inicializado: true });
      }
    }, 15000);

    try {
      const sessionPromise = supabase.auth.getSession();
      const { data } = await Promise.race([
        sessionPromise,
        new Promise<{ data: { session: null } }>((resolve) =>
          setTimeout(() => resolve({ data: { session: null } }), 10000)
        ),
      ]);
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
    } catch (e) {
      console.error("Error en auth init:", e);
      set({ cargando: false, inicializado: true });
    } finally {
      clearTimeout(timeoutHard);
    }

    // Suscripción al cambio de sesión (login OAuth, logout, refresh de token, etc.)
    supabase.auth.onAuthStateChange(async (evento, nuevaSesion) => {
      let nuevoPerfil: Perfil | null = null;
      if (nuevaSesion?.user) {
        nuevoPerfil = await obtenerPerfilConReintentos(nuevaSesion.user.id).catch(
          () => null
        );
        // Si se acaba de loguear con Google y el perfil tiene nombre default,
        // sincronizar con los datos de Google (given_name, family_name, name)
        if (evento === "SIGNED_IN" && nuevoPerfil && nuevaSesion.user.app_metadata?.provider === "google") {
          const { sincronizarNombreConGoogle } = await import("@/lib/auth-helpers");
          await sincronizarNombreConGoogle(
            nuevaSesion.user.id,
            nuevoPerfil,
            nuevaSesion.user.user_metadata
          );
          // Recargar perfil después de la sincronización
          nuevoPerfil = await obtenerPerfilConReintentos(nuevaSesion.user.id).catch(
            () => nuevoPerfil
          );
        }
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
