import { createBrowserClient } from "@supabase/ssr";

import { getSupabaseEnv, isSupabaseConfigured } from "@/lib/supabase/env";

export function createClient() {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to Frontend/.env.local",
    );
  }

  const { url, anonKey } = getSupabaseEnv();
  return createBrowserClient(url, anonKey);
}
