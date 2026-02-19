import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Create a Supabase client for use in API Route Handlers (non-cookie, anon key).
 * Used by public API routes like /api/properties, /api/visits, /api/leads.
 * Throws immediately if env vars are missing — no placeholder fallbacks.
 */
export function createApiClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error(
            "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable"
        );
    }

    return createClient<Database>(supabaseUrl, supabaseAnonKey);
}
