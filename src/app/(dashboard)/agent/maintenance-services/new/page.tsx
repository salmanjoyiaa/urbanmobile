import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MaintenanceServiceForm } from "@/components/agent/maintenance-service-form";

export default async function AgentNewMaintenanceServicePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: agent } = (await supabase
    .from("agents")
    .select("id, agent_type, status")
    .eq("profile_id", user.id)
    .single()) as { data: { id: string; agent_type: string; status: string } | null };

  if (!agent || agent.status !== "approved") redirect("/pending-approval");
  if (agent.agent_type !== "maintenance") redirect("/agent");

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-navy">Add maintenance service</h1>
        <p className="text-sm text-muted-foreground mt-1">
          List a service on the marketplace. Customers will see it after it is live.
        </p>
      </div>
      <MaintenanceServiceForm mode="create" />
    </div>
  );
}
