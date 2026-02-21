import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { VisitingAgentClient, AssignmentRow } from "@/components/visit/visiting-agent-client";

export default async function AgentAssignmentsPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: agentData } = await supabase
        .from("agents")
        .select("id, agent_type")
        .eq("profile_id", user.id)
        .single();

    const agent = agentData as any;

    if (!agent || agent.agent_type !== "visiting") {
        redirect("/agent");
    }

    const { data: requestData } = (await supabase
        .from("visit_requests")
        .select(
            `
      id, visitor_name, visitor_email, visitor_phone, visit_date, visit_time, status, visiting_status, customer_remarks,
      properties:property_id (title, location_url)
    `
        )
        .eq("visiting_agent_id", user.id)
        .order("visit_date", { ascending: true })) as { data: AssignmentRow[] | null };

    const rows = requestData || [];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-navy">My Assignments</h1>
                <p className="text-sm text-muted-foreground">Manage your property tours and update pipeline statuses.</p>
            </div>

            <VisitingAgentClient rows={rows} />
        </div>
    );
}
