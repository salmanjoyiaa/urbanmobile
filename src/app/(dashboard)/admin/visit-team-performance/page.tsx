import { createAdminClient } from "@/lib/supabase/admin";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/dashboard/data-table";
import { VisitRequestDialog } from "@/components/admin/visit-request-dialog";
import { formatDate, formatTime } from "@/lib/format";
import { getVisitStatusBadgeClass } from "@/lib/visit-status";

type VisitingAgent = {
  id: string;
  name: string;
};

type VisitRow = {
  id: string;
  visitor_name: string;
  visitor_email: string;
  visitor_phone: string;
  visitor_message?: string | null;
  visit_date: string;
  visit_time: string;
  status: string;
  visiting_status?: string | null;
  customer_remarks?: string | null;
  admin_notes?: string | null;
  visiting_agent: {
    id: string;
    full_name: string;
  } | null;
  properties: {
    title: string;
    property_ref: string | null;
    agents: {
      profiles: {
        full_name: string;
      } | null;
    } | null;
  } | null;
};

const DEAL_STATUS_LABELS: Record<string, string> = {
  view: "To Visit",
  contact_done: "Contact Done",
  customer_confirmed: "Customer Confirmed",
  customer_arrived: "Customer Arrived",
  visit_done: "Visit Done",
  customer_remarks: "Remarks Logged",
  deal_pending: "Deal Pending",
  deal_fail: "Deal Failed",
  commission_got: "Commission Received",
  deal_close: "Deal Closed",
  reschedule: "Reschedule Requested",
};

export default async function VisitTeamPerformancePage({
  searchParams,
}: {
  searchParams: { visiting_agent_id?: string };
}) {
  const supabase = createAdminClient();

  const { data: agentsData } = await supabase
    .from("agents")
    .select("profile_id, profiles:profile_id(full_name)")
    .eq("agent_type", "visiting")
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const visitingAgents: VisitingAgent[] = (agentsData || []).map((agent: any) => ({
    id: agent.profile_id,
    name: agent.profiles?.full_name || "Unknown",
  }));

  const selectedVisitingAgentId = searchParams.visiting_agent_id || "";

  let rows: VisitRow[] = [];
  if (selectedVisitingAgentId) {
    const { data } = (await supabase
      .from("visit_requests")
      .select(`
        id, visitor_name, visitor_email, visitor_phone, visitor_message, visit_date, visit_time, status, visiting_status, customer_remarks, admin_notes,
        visiting_agent:visiting_agent_id(id, full_name),
        properties:property_id (
          title, property_ref,
          agents:agent_id (
            profiles:profile_id (full_name)
          )
        )
      `)
      .eq("visiting_agent_id", selectedVisitingAgentId)
      .in("status", ["confirmed", "completed"])
      .order("visit_date", { ascending: false })) as { data: VisitRow[] | null };

    rows = data || [];
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Visit Team Performance</h1>
        <p className="text-sm text-muted-foreground">Select a visiting agent to review confirmed/completed visits and deal progress.</p>
      </div>

      <form className="flex flex-wrap items-end gap-3" action="/admin/visit-team-performance" method="get">
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1">Visiting Agent</label>
          <select
            name="visiting_agent_id"
            defaultValue={selectedVisitingAgentId}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm min-w-[260px]"
          >
            <option value="">Select visiting agent</option>
            {visitingAgents.map((agent) => (
              <option key={agent.id} value={agent.id}>{agent.name}</option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Load Visits
        </button>
      </form>

      {selectedVisitingAgentId ? (
        <DataTable
          rows={rows}
          columns={[
            {
              key: "property",
              title: "Property",
              render: (row) => (
                <div className="text-sm">
                  <div>{row.properties?.title || "—"}</div>
                  <div className="font-mono text-xs text-muted-foreground">{row.properties?.property_ref || "Not set"}</div>
                </div>
              ),
            },
            { key: "visitor_name", title: "Customer" },
            { key: "visitor_phone", title: "Phone" },
            {
              key: "schedule",
              title: "Schedule",
              render: (row) => `${formatDate(row.visit_date)} · ${formatTime(row.visit_time)}`,
            },
            {
              key: "status",
              title: "Visit Status",
              render: (row) => (
                <Badge variant="outline" className={`${getVisitStatusBadgeClass(row.status)} capitalize`}>
                  {row.status}
                </Badge>
              ),
            },
            {
              key: "deal",
              title: "Deal Status",
              render: (row) => (
                <Badge variant="secondary" className="capitalize">
                  {DEAL_STATUS_LABELS[row.visiting_status || ""] || row.visiting_status || "—"}
                </Badge>
              ),
            },
            {
              key: "actions",
              title: "Request",
              render: (row) => (
                <VisitRequestDialog
                  visit={row as VisitRow}
                  visitingAgents={visitingAgents}
                  busyAgentIds={[]}
                />
              ),
            },
          ]}
        />
      ) : (
        <div className="rounded-md border bg-card p-6 text-sm text-muted-foreground">
          Select a visiting agent to display their confirmed/completed visits.
        </div>
      )}
    </div>
  );
}
