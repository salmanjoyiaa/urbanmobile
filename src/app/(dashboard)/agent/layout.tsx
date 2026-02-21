import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AgentShell } from "@/components/layout/agent-shell";

export default async function AgentLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data } = await supabase
    .from("agents")
    .select("agent_type")
    .eq("profile_id", user.id)
    .single();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const agent = data as any;

  return <AgentShell agentType={agent?.agent_type}>{children}</AgentShell>;
}
