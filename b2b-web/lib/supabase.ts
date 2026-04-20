import { createClient } from "@supabase/supabase-js";

// Intentamos leer ambas por si acaso, pero priorizamos NEXT para la web
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // En lugar de un throw que rompe el build, ponemos un console.error
  console.error("Atención: Faltan variables de entorno de Supabase");
}

export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "");