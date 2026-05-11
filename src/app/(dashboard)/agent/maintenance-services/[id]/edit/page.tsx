import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MaintenanceServiceForm } from "@/components/agent/maintenance-service-form";
import type { MaintenanceService } from "@/types/database";

type PageProps = {
  params: { id: string };
};

export default async function AgentEditMaintenanceServicePage({ params }: PageProps) {
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

  const { data } = (await supabase
    .from("maintenance_services")
    .select("*")
    .eq("id", params.id)
    .eq("agent_id", agent.id)
    .single()) as { data: MaintenanceService | null };

  if (!data) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-navy">Edit service</h1>
        <p className="text-sm text-muted-foreground mt-1">Update your marketplace listing.</p>
      </div>
      <MaintenanceServiceForm mode="edit" initialData={data} />
    </div>
  );
}
