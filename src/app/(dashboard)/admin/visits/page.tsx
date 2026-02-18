import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/dashboard/data-table";
import { ModerationActionButton } from "@/components/admin/moderation-action-button";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatTime } from "@/lib/format";

type VisitRow = {
  id: string;
  visitor_name: string;
  visitor_email: string;
  visitor_phone: string;
  visit_date: string;
  visit_time: string;
  status: string;
  properties: {
    title: string;
  } | null;
};

export default async function AdminVisitsPage() {
  const supabase = await createClient();
  const { data } = (await supabase
    .from("visit_requests")
    .select(
      `
      id, visitor_name, visitor_email, visitor_phone, visit_date, visit_time, status,
      properties:property_id (title)
    `
    )
    .order("created_at", { ascending: false })) as { data: VisitRow[] | null };

  const rows = data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Visit Requests</h1>
        <p className="text-sm text-muted-foreground">Confirm or cancel scheduled visits.</p>
      </div>

      <DataTable
        rows={rows}
        columns={[
          { key: "property", title: "Property", render: (row) => row.properties?.title || "—" },
          { key: "visitor_name", title: "Visitor" },
          { key: "visitor_email", title: "Email" },
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
              <div className="flex gap-2">
                <ModerationActionButton endpoint={`/api/admin/visits/${row.id}`} payload={{ status: "confirmed" }} label="Confirm" />
                <ModerationActionButton endpoint={`/api/admin/visits/${row.id}`} payload={{ status: "cancelled" }} label="Cancel" variant="destructive" />
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
