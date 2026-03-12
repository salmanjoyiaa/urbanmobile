import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/product/product-form";

export default async function AgentNewProductPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: agent } = (await supabase
    .from("agents")
    .select("id, agent_type")
    .eq("profile_id", user.id)
    .single()) as { data: { id: string; agent_type: string } | null };

  if (!agent) redirect("/pending-approval");
  if (agent.agent_type !== "seller") redirect("/agent");

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-navy">Create Product</h1>
      <ProductForm mode="create" />
    </div>
  );
}
