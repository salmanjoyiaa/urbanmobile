import { StatCard } from "@/components/dashboard/stat-card";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { createClient } from "@/lib/supabase/server";

type ActivityRow = {
  id: string;
  action: string;
  entity_type: string;
  created_at: string;
  profiles: {
    full_name: string;
  } | null;
};

export default async function AdminOverviewPage() {
  const supabase = await createClient();

  const [
    { count: pendingAgents },
    { count: pendingVisits },
    { count: pendingLeads },
    { count: totalProperties },
    { data: activity },
  ] = await Promise.all([
    supabase.from("agents").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("visit_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("buy_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("properties").select("id", { count: "exact", head: true }),
    supabase
      .from("audit_log")
      .select("id, action, entity_type, created_at, profiles:actor_id(full_name)")
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const activityRows = (activity as ActivityRow[] | null) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Admin Overview</h1>
        <p className="text-sm text-muted-foreground">Moderate approvals, visits, and leads.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Pending Agents" value={pendingAgents || 0} />
        <StatCard title="Pending Visits" value={pendingVisits || 0} />
        <StatCard title="Pending Leads" value={pendingLeads || 0} />
        <StatCard title="Total Properties" value={totalProperties || 0} />
      </div>

      <ActivityFeed entries={activityRows} />
    </div>
  );
}
