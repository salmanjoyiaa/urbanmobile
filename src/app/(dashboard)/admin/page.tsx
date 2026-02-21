import { StatCard } from "@/components/dashboard/stat-card";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { createAdminClient } from "@/lib/supabase/admin";

export const revalidate = 0;

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
  const supabase = createAdminClient();

  const [
    { count: pendingPropertyAgents },
    { count: pendingVisitingAgents },
    { count: approvedPropertyAgents },
    { count: approvedVisitingAgents },
    { count: totalProperties },
    { count: activeProperties },
    { count: pendingVisits },
    { count: pendingLeads },
    { count: pendingMaintenance },
    { count: totalCustomers },
    { data: activity },
  ] = await Promise.all([
    supabase.from("agents").select("id", { count: "exact", head: true }).eq("status", "pending").neq("agent_type", "visiting"),
    supabase.from("agents").select("id", { count: "exact", head: true }).eq("status", "pending").eq("agent_type", "visiting"),
    supabase.from("agents").select("id", { count: "exact", head: true }).eq("status", "approved").neq("agent_type", "visiting"),
    supabase.from("agents").select("id", { count: "exact", head: true }).eq("status", "approved").eq("agent_type", "visiting"),
    supabase.from("properties").select("id", { count: "exact", head: true }),
    supabase.from("properties").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("visit_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("buy_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("maintenance_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "customer"),
    supabase
      .from("audit_log")
      .select("id, action, entity_type, created_at, profiles:actor_id(full_name)")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const activityRows = (activity as ActivityRow[] | null) || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-navy">Admin Overview</h1>
        <p className="text-sm text-muted-foreground">Real-time platform metrics and activity.</p>
      </div>

      {/* Pending / Action Required */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Action Required</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard title="Pending Property Agents" value={pendingPropertyAgents || 0} />
          <StatCard title="Pending Visiting Agents" value={pendingVisitingAgents || 0} />
          <StatCard title="Pending Visits" value={pendingVisits || 0} />
          <StatCard title="Pending Leads" value={pendingLeads || 0} />
          <StatCard title="Pending Maintenance" value={pendingMaintenance || 0} />
        </div>
      </div>

      {/* Totals */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Platform Totals</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Active Properties" value={activeProperties || 0} description={`${totalProperties || 0} total`} />
          <StatCard title="Property Agents" value={approvedPropertyAgents || 0} description="Approved" />
          <StatCard title="Visiting Team" value={approvedVisitingAgents || 0} description="Approved" />
          <StatCard title="Customers" value={totalCustomers || 0} />
        </div>
      </div>

      <ActivityFeed entries={activityRows} />
    </div>
  );
}
