import { redirect } from "next/navigation";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

export default async function AgentOverviewPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: agent } = (await supabase
    .from("agents")
    .select("id, status")
    .eq("profile_id", user.id)
    .single()) as {
    data: { id: string; status: string } | null;
  };

  if (!agent) {
    redirect("/pending-approval");
  }

  const [{ count: propertiesCount }, { count: productsCount }] = await Promise.all([
    supabase.from("properties").select("id", { count: "exact", head: true }).eq("agent_id", agent.id),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("agent_id", agent.id),
  ]);

  const { data: propertyIds } = (await supabase
    .from("properties")
    .select("id")
    .eq("agent_id", agent.id)) as { data: Array<{ id: string }> | null };
  const { data: productIds } = (await supabase
    .from("products")
    .select("id")
    .eq("agent_id", agent.id)) as { data: Array<{ id: string }> | null };

  const visitIdList = (propertyIds || []).map((item) => item.id);
  const leadIdList = (productIds || []).map((item) => item.id);

  const [{ count: pendingVisits }, { count: pendingLeads }] = await Promise.all([
    visitIdList.length > 0
      ? supabase
          .from("visit_requests")
          .select("id", { count: "exact", head: true })
          .in("property_id", visitIdList)
          .eq("status", "pending")
      : Promise.resolve({ count: 0 }),
    leadIdList.length > 0
      ? supabase
          .from("buy_requests")
          .select("id", { count: "exact", head: true })
          .in("product_id", leadIdList)
          .eq("status", "pending")
      : Promise.resolve({ count: 0 }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Agent Overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">Track your listings, requests, and activity.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Properties" value={propertiesCount || 0} />
        <StatCard title="Products" value={productsCount || 0} />
        <StatCard title="Pending Visits" value={pendingVisits || 0} />
        <StatCard title="Pending Leads" value={pendingLeads || 0} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Approval Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm capitalize text-muted-foreground">Current account status: {agent.status}</p>
        </CardContent>
      </Card>
    </div>
  );
}
