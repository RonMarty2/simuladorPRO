import { create } from "zustand";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import {
  cerrarSesion,
  iniciarSesion,
  obtenerPerfil,
  obtenerPerfilConReintentos,
  procesarCallbackOAuthSiAplica,
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
    // React StrictMode ejecuta los efectos dos veces en desarrollo. Evitamos
    // que dos inicializaciones compitan por la misma sesión persistida.
    if (get().inicializado || get().cargando) return;
    set({ cargando: true });

    // Hard timeout total: si después de 20 segundos no terminó, igual marcamos
    // como inicializado para que el usuario pueda ver la pantalla de login en
    // vez de quedarse colgado en "Cargando sesión..." para siempre.
    const timeoutHard = setTimeout(() => {
      if (!get().inicializado) {
        console.warn("Auth init timeout — forzando inicializado=true");
        set({ cargando: false, inicializado: true });
      }
    }, 20000);

    // Supabase recomienda no esperar otras llamadas del cliente dentro de
    // onAuthStateChange: el callback corre mientras el cliente mantiene su
    // bloqueo interno. Diferimos el trabajo para evitar un bloqueo circular.
    supabase.auth.onAuthStateChange((evento, nuevaSesion) => {
      setTimeout(() => {
        void (async () => {
          // Logout o sin sesión: limpiar todo.
          if (evento === "SIGNED_OUT" || !nuevaSesion?.user) {
            set({ session: null, user: null, perfil: null });
            return;
          }

          const prev = get();
          const mismoUsuario = prev.user?.id === nuevaSesion.user.id;

          // Refresco de token (TOKEN_REFRESHED) u otros eventos donde la identidad
          // no cambió y ya tenemos el perfil cargado: solo actualizar la sesión.
          if (mismoUsuario && prev.perfil) {
            set({ session: nuevaSesion, user: nuevaSesion.user });
            return;
          }

          let nuevoPerfil = await obtenerPerfilConReintentos(
            nuevaSesion.user.id
          ).catch(() => null);

          if (
            evento === "SIGNED_IN" &&
            nuevoPerfil &&
            nuevaSesion.user.app_metadata?.provider === "google"
          ) {
            const { sincronizarNombreConGoogle } = await import(
              "@/lib/auth-helpers"
            );
            await sincronizarNombreConGoogle(
              nuevaSesion.user.id,
              nuevoPerfil,
              nuevaSesion.user.user_metadata
            );
            nuevoPerfil = await obtenerPerfilConReintentos(
              nuevaSesion.user.id
            ).catch(() => nuevoPerfil);
          }

          set({
            session: nuevaSesion,
            user: nuevaSesion.user,
            // Nunca pisar un perfil bueno del mismo usuario con null por un fallo
            // transitorio de la query.
            perfil: nuevoPerfil ?? (mismoUsuario ? prev.perfil : null),
          });
        })().catch((error) => {
          console.error("Error procesando cambio de sesión:", error);
        });
      }, 0);
    });

    // Si la app arrancó con ?code= o #access_token= en la URL (callback de
    // OAuth), procesarlo ANTES de pedir la sesión. Necesario en PWA standalone
    // donde detectSessionInUrl no siempre se dispara solo.
    try {
      await procesarCallbackOAuthSiAplica();
    } catch (error) {
      console.error("Error procesando callback OAuth:", error);
    }

    try {
      const sessionPromise = supabase.auth.getSession();
      const { data } = await Promise.race([
        sessionPromise,
        // Una red lenta no significa que el token esté corrupto. Continuamos
        // sin bloquear la interfaz, pero conservamos la sesión persistida para
        // que INITIAL_SESSION o el próximo intento puedan recuperarla.
        new Promise<{ data: { session: null } }>((resolve) =>
          setTimeout(() => {
            console.warn(
              "[auth] getSession >12s — continuando sin borrar la sesión persistida"
            );
            resolve({ data: { session: null } });
          }, 12000)
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
