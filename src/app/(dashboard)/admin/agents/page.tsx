import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/dashboard/data-table";
import { ModerationActionButton } from "@/components/admin/moderation-action-button";
import { CreatePropertyAgentDialog } from "@/components/admin/create-property-agent-dialog";
import { createClient } from "@/lib/supabase/server";

type SearchParams = {
  status?: string;
};

type AgentRow = {
  id: string;
  status: string;
  company_name: string | null;
  license_number: string | null;
  profiles: {
    full_name: string;
    email: string;
  } | null;
};

export default async function AdminAgentsPage({ searchParams }: { searchParams: SearchParams }) {
  const supabase = await createClient();
  const statusFilter = searchParams.status && searchParams.status !== "all" ? searchParams.status : undefined;

  let query = supabase
    .from("agents")
    .select("id, status, company_name, license_number, profiles:profile_id(full_name, email)")
    .order("created_at", { ascending: false });

  if (statusFilter) {
    query = query.eq("status", statusFilter);
  }

  const { data } = (await query) as { data: AgentRow[] | null };
  const rows = data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">Agents</h1>
          <p className="text-sm text-muted-foreground">Approve, reject, or suspend agent accounts.</p>
        </div>
        <div className="flex items-center gap-3">
          <CreatePropertyAgentDialog />
          <form method="get" className="flex items-center gap-2">
            <select
              name="status"
              defaultValue={statusFilter || "all"}
              className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="suspended">Suspended</option>
            </select>
            <Button type="submit" variant="outline">Filter</Button>
          </form>
        </div>
      </div>

      <DataTable
        rows={rows}
        columns={[
          { key: "name", title: "Agent", render: (row) => row.profiles?.full_name || "—" },
          { key: "email", title: "Email", render: (row) => row.profiles?.email || "—" },
          { key: "company_name", title: "Company", render: (row) => row.company_name || "—" },
          {
            key: "status",
            title: "Status",
            render: (row) => <Badge className="capitalize">{row.status}</Badge>,
          },
          {
            key: "actions",
            title: "Actions",
            render: (row) => (
              <div className="flex flex-wrap gap-2">
                <Link href={`/admin/agents/${row.id}`}>
                  <Button size="sm" variant="secondary">View</Button>
                </Link>
                <ModerationActionButton endpoint={`/api/admin/agents/${row.id}`} payload={{ status: "approved" }} label="Approve" />
                <ModerationActionButton endpoint={`/api/admin/agents/${row.id}`} payload={{ status: "rejected" }} label="Reject" variant="destructive" />
                <ModerationActionButton endpoint={`/api/admin/agents/${row.id}`} payload={{ status: "suspended" }} label="Suspend" variant="outline" />
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
