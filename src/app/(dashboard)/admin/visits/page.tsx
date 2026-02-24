import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/dashboard/data-table";

import { VisitRowActions } from "@/components/admin/visit-row-actions";
import { SendDayVisits } from "@/components/admin/send-day-visits";
import { MessageCircle } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDate, formatTime } from "@/lib/format";

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
  admin_notes?: string | null;
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
  const supabase = createAdminClient();
  const { data } = (await supabase
    .from("visit_requests")
    .select(
      `
      id, visitor_name, visitor_email, visitor_phone, visit_date, visit_time, status, visiting_status, customer_remarks, admin_notes,
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

  const { data: propAgentsData } = await supabase
    .from("agents")
    .select("id, profiles:profile_id(full_name)")
    .neq("agent_type", "visiting")
    .eq("status", "approved");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const propertyAgents = (propAgentsData || []).map((a: any) => ({
    id: a.id,
    name: a.profiles?.full_name || "Unknown",
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Visit Requests</h1>
        <p className="text-sm text-muted-foreground">Orchestrate and route scheduled visits.</p>
      </div>

      <SendDayVisits visitingAgents={visitingAgents} propertyAgents={propertyAgents} />

      <DataTable
        rows={rows}
        columns={[
          { key: "property", title: "Property", render: (row) => row.properties?.title || "—" },
          { key: "property_agent", title: "Property Agent", render: (row) => row.properties?.agents?.profiles?.full_name || "—" },
          {
            key: "visiting_agent",
            title: "Visiting Agent",
            render: (row) => row.visiting_agent?.full_name ? (
              <Badge variant="secondary">{row.visiting_agent.full_name}</Badge>
            ) : "—"
          },
          { key: "visitor_name", title: "Visitor" },
          {
            key: "visitor_phone",
            title: "Phone",
            render: (row) => {
              const buildVisitMessage = () => {
                const property = row.properties?.title || "the property";
                const date = formatDate(row.visit_date);
                const time = formatTime(row.visit_time);
                const agentLine = row.visiting_agent?.full_name
                  ? `\nVisiting Agent: ${row.visiting_agent.full_name}`
                  : "";
                return `Hello ${row.visitor_name}!\n\nYour visit has been scheduled.\n\nProperty: ${property}\nDate: ${date}\nTime: ${time}${agentLine}\n\nPlease be on time. Contact us if you need to reschedule.\n\nUrbanSaudi Team`;
              };
              return (
                <div className="flex items-center gap-2">
                  {row.visitor_phone || "—"}
                  {row.visitor_phone && (
                    <a
                      href={`https://wa.me/${row.visitor_phone.replace(/\D/g, '')}?text=${encodeURIComponent(buildVisitMessage())}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Send WhatsApp message"
                    >
                      <MessageCircle className="h-4 w-4 text-green-500 hover:text-green-600 transition-colors" />
                    </a>
                  )}
                </div>
              );
            }
          },
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
              <VisitRowActions visit={row as VisitRow} visitingAgents={visitingAgents} />
            ),
          },
        ]}
      />
    </div>
  );
}
