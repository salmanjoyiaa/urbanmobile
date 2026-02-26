import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BlockDatesClient } from "@/components/agent/block-dates-client";

type PageProps = {
  params: { id: string };
};

export default async function AgentPropertyBlockDatesPage({ params }: PageProps) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: agent } = (await supabase
    .from("agents")
    .select("id")
    .eq("profile_id", user.id)
    .single()) as { data: { id: string } | null };

  if (!agent) redirect("/pending-approval");

  const { data: property } = (await supabase
    .from("properties")
    .select("id, title, blocked_dates")
    .eq("id", params.id)
    .eq("agent_id", agent.id)
    .single()) as { data: { id: string; title: string; blocked_dates: string[] | null } | null };

  if (!property) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Block dates</h1>
        <p className="text-sm text-muted-foreground">
          Manage when this property is unavailable for visit bookings.
        </p>
      </div>
      <BlockDatesClient
        propertyId={property.id}
        propertyTitle={property.title}
        initialBlockedDates={property.blocked_dates || []}
      />
    </div>
  );
}
