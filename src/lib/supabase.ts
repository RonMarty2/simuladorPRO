import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.warn(
    "[supabase] Variables VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY no definidas. " +
      "Configurar .env.local en la FASE 1 antes de usar autenticación."
  );
}

export const supabase = createClient(url ?? "http://localhost", anonKey ?? "anon-placeholder");
