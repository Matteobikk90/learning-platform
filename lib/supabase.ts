import { createClient } from "@supabase/supabase-js";

import { requireEnv } from "@/lib/env";

let supabaseAdmin: ReturnType<typeof createClient> | undefined;

export function getSupabaseAdmin() {
  supabaseAdmin ??= createClient(
    requireEnv("SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  return supabaseAdmin;
}
