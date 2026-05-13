import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/dashboard/data-table";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { formatDate } from "@/lib/format";

type ContactRow = {
  id: string;
  channel: string;
  created_at: string;
  products: {
    title: string;
  } | null;
};

export default async function AgentProductContactsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: agent } = (await supabase
    .from("agents")
    .select("id, agent_type")
    .eq("profile_id", user.id)
    .single()) as { data: { id: string; agent_type: string } | null };

  if (!agent) redirect("/pending-approval");
  if (agent.agent_type !== "seller") redirect("/agent");

  const { data: productIds } = (await supabase.from("products").select("id").eq("agent_id", agent.id)) as {
    data: Array<{ id: string }> | null;
  };
  const idList = (productIds || []).map((item) => item.id);

  let rows: ContactRow[] = [];

  if (idList.length > 0) {
    const { data } = (await supabase
      .from("product_contact_events")
      .select(
        `
      id,
      channel,
      created_at,
      products:product_id (title)
    `
      )
      .in("product_id", idList)
      .order("created_at", { ascending: false })
      .limit(500)) as { data: ContactRow[] | null };

    rows = data || [];
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Product contact activity</h1>
        <p className="text-sm text-muted-foreground">
          WhatsApp and call taps on your listings (combined analytics; no customer details stored).
        </p>
      </div>

      <DataTable
        rows={rows}
        columns={[
          { key: "created_at", title: "Time", render: (row) => formatDate(row.created_at) },
          { key: "product", title: "Product", render: (row) => row.products?.title || "—" },
          {
            key: "channel",
            title: "Channel",
            render: (row) => (
              <Badge variant="outline" className="capitalize">
                {row.channel === "whatsapp" ? "WhatsApp" : "Phone"}
              </Badge>
            ),
          },
        ]}
      />
    </div>
  );
}
