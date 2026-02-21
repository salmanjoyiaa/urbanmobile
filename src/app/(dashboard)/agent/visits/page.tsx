import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AgentVisitsClient } from "@/components/visit/agent-visits-client";

export type VisitRow = {
  id: string;
  visitor_name: string;
  visitor_email: string;
  visitor_phone: string;
  visit_date: string;
  visit_time: string;
  status: string;
  visiting_agent: {
    full_name: string;
  } | null;
  properties: {
    title: string;
  } | null;
};

export default async function AgentVisitsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: agent } = (await supabase
    .from("agents")
    .select("id")
    .eq("profile_id", user.id)
    .single()) as { data: { id: string } | null };

  if (!agent) redirect("/pending-approval");

  const { data: propertyIds } = (await supabase
    .from("properties")
    .select("id")
    .eq("agent_id", agent.id)) as { data: Array<{ id: string }> | null };
  const visitIdList = (propertyIds || []).map((item) => item.id);

  let rows: VisitRow[] = [];

  if (visitIdList.length > 0) {
    const { data } = (await supabase
      .from("visit_requests")
      .select(
        `
      id, visitor_name, visitor_email, visitor_phone, visit_date, visit_time, status,
      visiting_agent:visiting_agent_id (full_name),
      properties:property_id (title)
    `
      )
      .in("property_id", visitIdList)
      .neq("status", "pending")
      .order("created_at", { ascending: false })) as { data: VisitRow[] | null };

    rows = data || [];
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Visit Requests</h1>
        <p className="text-sm text-muted-foreground">Manage your confirmed and completed property visits.</p>
      </div>

      <AgentVisitsClient rows={rows} />
    </div>
  );
}
