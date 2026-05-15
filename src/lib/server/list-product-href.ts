import { createClient } from "@/lib/supabase/server";

type SupabaseServer = Awaited<ReturnType<typeof createClient>>;

/**
 * Public "list a product" entry: guest → /sell; approved seller → dashboard create.
 */
export async function getListProductFreeHref(supabase: SupabaseServer): Promise<"/sell" | "/agent/products/new"> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return "/sell";

  const { data: profile } = (await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()) as { data: { role: string } | null };

  if (profile?.role !== "agent") return "/sell";

  const { data: agent } = (await supabase
    .from("agents")
    .select("agent_type, status")
    .eq("profile_id", user.id)
    .single()) as { data: { agent_type: string; status: string } | null };

  if (agent?.agent_type === "seller" && agent.status === "approved") {
    return "/agent/products/new";
  }

  return "/sell";
}
