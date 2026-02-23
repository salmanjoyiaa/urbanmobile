
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/dashboard/data-table";
import { AgentRowActions } from "@/components/admin/agent-row-actions";
import { CreatePropertyAgentDialog } from "@/components/admin/create-property-agent-dialog";
import { createAdminClient } from "@/lib/supabase/admin";
import { MessageCircle } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
    phone: string | null;
  } | null;
};

export default async function AdminAgentsPage({ searchParams }: { searchParams: SearchParams }) {
  const supabase = createAdminClient();
  const statusFilter = searchParams.status && searchParams.status !== "all" ? searchParams.status : undefined;

  let query = supabase
    .from("agents")
    .select("id, status, company_name, license_number, profiles:profile_id(full_name, email, phone)")
    .neq("agent_type", "visiting")
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
          <h1 className="text-2xl font-bold text-navy">Property Team</h1>
          <p className="text-sm text-muted-foreground">Approve, reject, or suspend property agent accounts.</p>
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
          {
            key: "phone",
            title: "Phone",
            render: (row) => (
              <div className="flex items-center gap-2">
                {row.profiles?.phone || "—"}
                {row.profiles?.phone && (
                  <a
                    href={`https://wa.me/${row.profiles.phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="h-4 w-4 text-green-500 hover:text-green-600 transition-colors" />
                  </a>
                )}
              </div>
            )
          },
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
              <AgentRowActions id={row.id} status={row.status} agentType="property" />
            ),
          },
        ]}
      />
    </div>
  );
}
