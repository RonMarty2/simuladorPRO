import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.warn(
    "[supabase] Variables VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY no definidas. " +
      "Configurar .env.local en la FASE 1 antes de usar autenticación."
  );
}

export const supabase = createClient(
  url ?? "http://localhost",
  anonKey ?? "anon-placeholder",
  {
    auth: {
      // Persistir sesión en localStorage para que sobreviva refresh
      persistSession: true,
      // Auto-refresh del token antes de que venza (sin esto se cuelga después de ~1h)
      autoRefreshToken: true,
      // Detectar OAuth callbacks en la URL automáticamente
      detectSessionInUrl: true,
      // Usar PKCE flow para OAuth (más seguro y robusto)
      flowType: "pkce",
    },
  }
);
