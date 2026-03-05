import { StatCard } from "@/components/dashboard/stat-card";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import { Eye } from "lucide-react";

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

type SiteTrafficSummary = {
  today_views: number | string | null;
  week_views: number | string | null;
  total_views: number | string | null;
  today_unique: number | string | null;
  week_unique: number | string | null;
  total_unique: number | string | null;
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
    { count: pendingProperties },
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
    supabase.from("properties").select("id", { count: "exact", head: true }).eq("status", "available"),
    supabase.from("properties").select("id", { count: "exact", head: true }).eq("status", "pending"),
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

  const { data: trafficSummary } = await supabase.rpc("get_site_traffic_summary");
  const traffic = (Array.isArray(trafficSummary) ? trafficSummary[0] : trafficSummary) as SiteTrafficSummary | null;

  const todayViews = Number(traffic?.today_views || 0);
  const weekViews = Number(traffic?.week_views || 0);
  const totalViews = Number(traffic?.total_views || 0);
  const todayUnique = Number(traffic?.today_unique || 0);
  const weekUnique = Number(traffic?.week_unique || 0);
  const totalUnique = Number(traffic?.total_unique || 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-navy">Admin Overview</h1>
        <p className="text-sm text-muted-foreground">Real-time platform metrics and activity.</p>
      </div>

      {/* Pending / Action Required */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Action Required</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          <Link href="/admin/properties?status=pending" className="block">
            <StatCard title="Pending Properties" value={pendingProperties || 0} description="Awaiting approval" />
          </Link>
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

      {/* Site Traffic */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Site Traffic
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard title="Today" value={todayUnique || 0} description={`Unique visitors • ${todayViews.toLocaleString()} page views`} />
          <StatCard title="Last 7 Days" value={weekUnique || 0} description={`Unique visitors • ${weekViews.toLocaleString()} page views`} />
          <StatCard title="All Time" value={totalUnique || 0} description={`Unique visitors • ${totalViews.toLocaleString()} page views`} />
        </div>
      </div>

      <ActivityFeed entries={activityRows} />
    </div>
  );
}
