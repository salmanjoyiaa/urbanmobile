import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MaintenanceServiceForm } from "@/components/agent/maintenance-service-form";
import type { MaintenanceService } from "@/types/database";

type PageProps = {
  params: { id: string };
};

export default async function AdminEditMaintenanceServicePage({ params }: PageProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = (await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()) as { data: { role: string } | null };

  if (!profile || profile.role !== "admin") {
    redirect("/");
  }

  const { data } = (await supabase
    .from("maintenance_services")
    .select("*")
    .eq("id", params.id)
    .single()) as { data: MaintenanceService | null };

  if (!data) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edit maintenance service</h1>
        <p className="text-sm text-muted-foreground mt-1">Update listing fields for the marketplace.</p>
      </div>
      <MaintenanceServiceForm mode="edit" initialData={data} submitTarget="admin" />
    </div>
  );
}
