
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

const tabs = [
  { key: "property", label: "AQARI Team" },
  { key: "seller", label: "Sellers" },
  { key: "maintenance", label: "Maintenance" },
] as const;

type AgentListType = (typeof tabs)[number]["key"];

export default async function AdminAgentsPage({ searchParams }: { searchParams: SearchParams }) {
  const supabase = createAdminClient();
  const rawType = searchParams.agent_type;
  const typeFilter: AgentListType =
    rawType === "property" || rawType === "seller" || rawType === "maintenance" ? rawType : "property";
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

  const currentTab = tabs.find((t) => t.key === typeFilter) || tabs[0];
  const pageTitle = currentTab.label;
  const pageDescription =
    typeFilter === "seller"
      ? "Approve, reject, or suspend seller accounts."
      : typeFilter === "maintenance"
        ? "Approve, reject, or suspend maintenance agent accounts."
        : "Approve, reject, or suspend property agent accounts.";

  const entityLabel = typeFilter === "seller" ? "Seller" : typeFilter === "maintenance" ? "Agent" : "Agent";

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-1 border-b border-border overflow-x-auto">
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            href={`/admin/agents?agent_type=${tab.key}`}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px whitespace-nowrap",
              typeFilter === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">{pageTitle}</h1>
          <p className="text-sm text-muted-foreground">{pageDescription}</p>
        </div>
        <div className="flex items-center gap-3">
          <CreatePropertyAgentDialog agentType={typeFilter} />
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
          { key: "name", title: entityLabel, render: (row) => row.profiles?.full_name || "—" },
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
              <AgentRowActions id={row.id} status={row.status} agentType={typeFilter} row={row} />
            ),
          },
        ]}
      />
    </div>
  );
}
