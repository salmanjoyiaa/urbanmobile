
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/dashboard/data-table";
import { AgentRowActions } from "@/components/admin/agent-row-actions";
import { CreatePropertyAgentDialog } from "@/components/admin/create-property-agent-dialog";
import { createAdminClient } from "@/lib/supabase/admin";
import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type SearchParams = {
  status?: string;
  agent_type?: string;
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
  const typeFilter = searchParams.agent_type || "property";
  const statusFilter = searchParams.status && searchParams.status !== "all" ? searchParams.status : undefined;

  let query = supabase
    .from("agents")
    .select("id, status, company_name, license_number, profiles:profile_id(full_name, email, phone)")
    .eq("agent_type", typeFilter)
    .order("created_at", { ascending: false });

  if (statusFilter) {
    query = query.eq("status", statusFilter);
  }

  const { data } = (await query) as { data: AgentRow[] | null };
  const rows = data || [];

  const isSeller = typeFilter === "seller";
  const pageTitle = isSeller ? "Sellers" : "AQARI Team";
  const pageDescription = isSeller
    ? "Approve, reject, or suspend seller accounts."
    : "Approve, reject, or suspend property agent accounts.";

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        <Link
          href="/admin/agents?agent_type=property"
          className={cn(
            "px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
            typeFilter === "property"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          AQARI Team
        </Link>
        <Link
          href="/admin/agents?agent_type=seller"
          className={cn(
            "px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
            typeFilter === "seller"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          Sellers
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">{pageTitle}</h1>
          <p className="text-sm text-muted-foreground">{pageDescription}</p>
        </div>
        <div className="flex items-center gap-3">
          <CreatePropertyAgentDialog agentType={isSeller ? "seller" : "property"} />
          <form method="get" className="flex items-center gap-2">
            <input type="hidden" name="agent_type" value={typeFilter} />
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
          { key: "name", title: isSeller ? "Seller" : "Agent", render: (row) => row.profiles?.full_name || "—" },
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
              <AgentRowActions id={row.id} status={row.status} agentType={isSeller ? "seller" : "property"} row={row} />
            ),
          },
        ]}
      />
    </div>
  );
}
