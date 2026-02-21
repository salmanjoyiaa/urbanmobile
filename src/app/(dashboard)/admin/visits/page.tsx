import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/dashboard/data-table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ModerationActionButton } from "@/components/admin/moderation-action-button";
import { AssignVisitingAgentDropdown } from "@/components/admin/assign-visiting-agent-dropdown";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatTime } from "@/lib/format";
import { Info } from "lucide-react";

type VisitRow = {
  id: string;
  visitor_name: string;
  visitor_email: string;
  visitor_phone: string;
  visit_date: string;
  visit_time: string;
  status: string;
  visiting_status?: string | null;
  customer_remarks?: string | null;
  properties: {
    title: string;
    agents: {
      profiles: {
        full_name: string;
      } | null;
    } | null;
  } | null;
  visiting_agent: {
    full_name: string;
  } | null;
};

export default async function AdminVisitsPage() {
  const supabase = await createClient();
  const { data } = (await supabase
    .from("visit_requests")
    .select(
      `
      id, visitor_name, visitor_email, visitor_phone, visit_date, visit_time, status, visiting_status, customer_remarks,
      visiting_agent:visiting_agent_id(full_name),
      properties:property_id (
        title,
        agents:agent_id (
          profiles:profile_id (full_name)
        )
      )
    `
    )
    .order("created_at", { ascending: false })) as { data: VisitRow[] | null };

  const rows = data || [];

  // Fetch visiting agents for dropdown routing
  const { data: agentsData } = await supabase
    .from("agents")
    .select("profile_id, profiles:profile_id(full_name)")
    .eq("agent_type", "visiting")
    .eq("status", "approved");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const visitingAgents = (agentsData || []).map((agent: any) => ({
    id: agent.profile_id,
    name: agent.profiles?.full_name || "Unknown",
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Visit Requests</h1>
        <p className="text-sm text-muted-foreground">Orchestrate and route scheduled visits.</p>
      </div>

      <DataTable
        rows={rows}
        columns={[
          { key: "property", title: "Property", render: (row) => row.properties?.title || "—" },
          { key: "property_agent", title: "Property Agent", render: (row) => row.properties?.agents?.profiles?.full_name || "—" },
          {
            key: "visiting_agent",
            title: "Visiting Agent",
            render: (row) => row.visiting_agent?.full_name ? (
              <div className="flex flex-col gap-1 items-start">
                <Badge variant="secondary">{row.visiting_agent.full_name}</Badge>
                {(row.visiting_status || row.customer_remarks) && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="text-xs flex items-center gap-1 text-primary hover:underline font-medium mt-1">
                        <Info className="h-3 w-3" /> View Status
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 p-4 text-sm" align="start">
                      <div className="space-y-3">
                        {row.visiting_status && (
                          <div>
                            <span className="font-semibold text-foreground">Deal Phase:</span>
                            <div className="mt-1 capitalize text-muted-foreground">{row.visiting_status.replace("_", " ")}</div>
                          </div>
                        )}
                        {row.customer_remarks && (
                          <div>
                            <span className="font-semibold text-foreground">Agent Remarks:</span>
                            <div className="mt-1 text-muted-foreground italic border-l-2 pl-2 border-primary/30">
                              &quot;{row.customer_remarks}&quot;
                            </div>
                          </div>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            ) : "—"
          },
          { key: "visitor_name", title: "Visitor" },
          { key: "visitor_phone", title: "Phone" },
          {
            key: "schedule",
            title: "Schedule",
            render: (row) => `${formatDate(row.visit_date)} · ${formatTime(row.visit_time)}`,
          },
          { key: "status", title: "Status", render: (row) => <Badge className="capitalize">{row.status}</Badge> },
          {
            key: "actions",
            title: "Actions",
            render: (row) => (
              <div className="flex flex-wrap gap-2">
                {(row.status === "pending") && (
                  <AssignVisitingAgentDropdown visitId={row.id} visitingAgents={visitingAgents} />
                )}
                {(row.status === "pending") && (
                  <ModerationActionButton endpoint={`/api/admin/visits/${row.id}`} payload={{ status: "confirmed" }} label="Confirm" />
                )}
                {row.status !== "completed" && row.status !== "cancelled" && (
                  <ModerationActionButton endpoint={`/api/admin/visits/${row.id}`} payload={{ status: "cancelled" }} label="Cancel" variant="destructive" />
                )}
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
