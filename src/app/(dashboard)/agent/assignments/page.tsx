import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { VisitingAgentClient, AssignmentRow, AssignedPropertyRow, AssignmentHistoryItem } from "@/components/visit/visiting-agent-client";

export default async function AgentAssignmentsPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    const { data: agentData } = await supabase
        .from("agents")
        .select("id, agent_type")
        .eq("profile_id", user.id)
        .single();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const agent = agentData as any;

    if (!agent || agent.agent_type !== "visiting") {
        redirect("/agent");
    }

    const { data: requestData } = (await supabase
        .from("visit_requests")
        .select(
            `
            id, visitor_name, visitor_email, visitor_phone, visitor_message, visit_date, visit_time, status, visiting_status, customer_remarks, admin_notes, commission_received_amount, commission_received_at,
      properties:property_id (
                title, property_ref, location_url, visiting_agent_instructions, visiting_agent_image,
        agents:agent_id (
          profiles:profile_id (full_name, phone)
        )
      )
    `
        )
        .eq("visiting_agent_id", user.id)
        .order("visit_date", { ascending: true })) as { data: AssignmentRow[] | null };

    const { data: historyData } = (await supabase
        .from("visit_assignment_history")
        .select("id, visit_id, created_at")
        .or(`new_agent_id.eq.${user.id},old_agent_id.eq.${user.id}`)
        .order("created_at", { ascending: false })) as {
            data: Array<{ id: string; visit_id: string; created_at: string }> | null;
        };

    const { data: assignedData } = (await supabase
        .from("agent_property_assignments")
        .select("properties:property_id(id, title, property_ref)")
        .eq("agent_id", agent.id)) as {
            data: Array<{ properties: AssignedPropertyRow | null }> | null;
        };

    const rows = requestData || [];
    const assignmentHistoryByVisit: Record<string, AssignmentHistoryItem[]> = {};
    for (const item of historyData || []) {
        assignmentHistoryByVisit[item.visit_id] = assignmentHistoryByVisit[item.visit_id] || [];
        assignmentHistoryByVisit[item.visit_id].push({ id: item.id, created_at: item.created_at });
    }

    const assignedProperties = (assignedData || [])
        .map((item) => item.properties)
        .filter((property): property is AssignedPropertyRow => Boolean(property));

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-navy">My Assignments</h1>
                <p className="text-sm text-muted-foreground">Manage your property tours and update pipeline statuses.</p>
            </div>

            <VisitingAgentClient rows={rows} assignedProperties={assignedProperties} assignmentHistoryByVisit={assignmentHistoryByVisit} />
        </div>
    );
}
