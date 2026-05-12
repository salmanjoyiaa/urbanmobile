import * as Sentry from "@sentry/nextjs";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

export type AgentProgramType = "property" | "visiting" | "seller" | "maintenance";

export async function upsertAgentRowAndSetAgentRole(
  admin: SupabaseClient<Database>,
  params: {
    profileId: string;
    agent_type: AgentProgramType;
    company_name: string | null;
    license_number?: string | null;
    document_url?: string | null;
    bio?: string | null;
    status: "pending" | "approved";
  }
): Promise<{ ok: true; agent: unknown } | { ok: false; error: string }> {
  const { data, error } = await admin
    .from("agents")
    .upsert(
      {
        profile_id: params.profileId,
        agent_type: params.agent_type,
        company_name: params.company_name ?? null,
        license_number: params.license_number ?? null,
        document_url: params.document_url ?? null,
        bio: params.bio ?? null,
        status: params.status,
      } as never,
      { onConflict: "profile_id" }
    )
    .select()
    .single();

  if (error) {
    return { ok: false, error: error.message };
  }

  const { error: profileError } = await admin
    .from("profiles")
    .update({ role: "agent" } as never)
    .eq("id", params.profileId);

  if (profileError) {
    console.error("[agent-application] profile role update failed:", profileError);
    Sentry.captureException(new Error(profileError.message), {
      contexts: { database: { table: "profiles", error: profileError.message } },
    });
    return { ok: false, error: "Failed to update profile role" };
  }

  return { ok: true, agent: data };
}
