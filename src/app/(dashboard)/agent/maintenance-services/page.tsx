import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Wrench, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MaintenanceServiceCard } from "@/components/agent/maintenance-service-card";

export const metadata: Metadata = {
  title: "My Services - Agent Dashboard",
};

export const revalidate = 0;

export default async function AgentMaintenanceServicesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: agentData } = await supabase
    .from("agents")
    .select("id, agent_type, status")
    .eq("profile_id", user.id)
    .single();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const agent = agentData as any;

  if (!agent || agent.status !== "approved") redirect("/pending-approval");
  if (agent.agent_type !== "maintenance") redirect("/agent");

  const { data: servicesData, error } = await supabase
    .from("maintenance_services")
    .select("*")
    .eq("agent_id", agent.id)
    .order("created_at", { ascending: false });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const services = servicesData as any[] | null;

  if (error) {
    return <div className="p-6 text-destructive">Failed to load your services: {error.message}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Services</h1>
          <p className="text-muted-foreground">Manage the maintenance services you offer in the marketplace.</p>
        </div>
        <Button asChild>
          <Link href="/agent/maintenance-services/new">
            <Plus className="w-4 h-4 mr-2" /> Add Service
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {!services || services.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center p-12 text-center border rounded-xl bg-card border-dashed">
            <Wrench className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium">No services added</h3>
            <p className="text-sm text-muted-foreground mb-4">You haven&apos;t listed any maintenance services yet.</p>
            <Button variant="outline" asChild>
              <Link href="/agent/maintenance-services/new">
                <Plus className="w-4 h-4 mr-2" /> Create Your First Service
              </Link>
            </Button>
          </div>
        ) : (
          services.map((service) => <MaintenanceServiceCard key={service.id} service={service} />)
        )}
      </div>
    </div>
  );
}
