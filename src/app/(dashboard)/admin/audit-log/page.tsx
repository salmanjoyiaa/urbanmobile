import { DataTable } from "@/components/dashboard/data-table";
import { Button } from "@/components/ui/button";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDate, formatTime } from "@/lib/format";

type SearchParams = {
  action?: string;
  page?: string;
};

type Row = {
  id: string;
  action: string;
  entity_type: string;
  created_at: string;
  profiles: {
    full_name: string;
  } | null;
};

export default async function AdminAuditLogPage({ searchParams }: { searchParams: SearchParams }) {
  const supabase = createAdminClient();
  const action = searchParams.action || "";
  const page = Math.max(Number(searchParams.page || 1), 1);
  const pageSize = 20;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("audit_log")
    .select("id, action, entity_type, created_at, profiles:actor_id(full_name)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (action) {
    query = query.ilike("action", `%${action}%`);
  }

  const { data, count } = (await query) as { data: Row[] | null; count: number | null };
  const rows = data || [];
  const totalPages = Math.max(Math.ceil((count || 0) / pageSize), 1);

  const params = new URLSearchParams();
  if (action) params.set("action", action);

  const withPage = (nextPage: number) => {
    const next = new URLSearchParams(params.toString());
    next.set("page", String(nextPage));
    return `/admin/audit-log?${next.toString()}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy">Audit Log</h1>
          <p className="text-sm text-muted-foreground">Track all admin moderation actions.</p>
        </div>
        <form method="get" className="flex items-center gap-2">
          <input
            name="action"
            defaultValue={action}
            placeholder="Filter by action"
            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
          />
          <Button type="submit" variant="outline">Apply</Button>
        </form>
      </div>

      <DataTable
        rows={rows}
        columns={[
          { key: "action", title: "Action", render: (row) => row.action.replaceAll("_", " ") },
          { key: "entity_type", title: "Entity" },
          { key: "actor", title: "Actor", render: (row) => row.profiles?.full_name || "System" },
          { key: "created_at", title: "Date & Time", render: (row) => `${formatDate(row.created_at)} · ${formatTime(row.created_at)}` },
        ]}
      />

      <div className="flex items-center justify-end gap-2">
        <a href={withPage(Math.max(page - 1, 1))}>
          <Button variant="outline" disabled={page <= 1}>Previous</Button>
        </a>
        <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
        <a href={withPage(Math.min(page + 1, totalPages))}>
          <Button variant="outline" disabled={page >= totalPages}>Next</Button>
        </a>
      </div>
    </div>
  );
}
