import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/dashboard/data-table";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

type LeadRow = {
  id: string;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string;
  message: string | null;
  status: string;
  products: {
    title: string;
  } | null;
};

export default async function AgentLeadsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: agent } = (await supabase
    .from("agents")
    .select("id")
    .eq("profile_id", user.id)
    .single()) as { data: { id: string } | null };

  if (!agent) redirect("/pending-approval");

  const { data: productIds } = (await supabase
    .from("products")
    .select("id")
    .eq("agent_id", agent.id)) as { data: Array<{ id: string }> | null };
  const leadIdList = (productIds || []).map((item) => item.id);

  let rows: LeadRow[] = [];

  if (leadIdList.length > 0) {
    const { data } = (await supabase
      .from("buy_requests")
      .select(
        `
      id, buyer_name, buyer_email, buyer_phone, message, status,
      products:product_id (title)
    `
      )
      .in("product_id", leadIdList)
      .neq("status", "pending")
      .order("created_at", { ascending: false })) as { data: LeadRow[] | null };

    rows = data || [];
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Buy Requests</h1>
        <p className="text-sm text-muted-foreground">Read-only queue for leads on your products.</p>
      </div>

      <DataTable
        rows={rows}
        columns={[
          { key: "product", title: "Product", render: (row) => row.products?.title || "—" },
          { key: "buyer_name", title: "Buyer" },
          { key: "buyer_email", title: "Email" },
          { key: "buyer_phone", title: "Phone" },
          {
            key: "message",
            title: "Message",
            render: (row) => row.message || "—",
          },
          {
            key: "status",
            title: "Status",
            render: (row) => <Badge className="capitalize">{row.status}</Badge>,
          },
        ]}
      />
    </div>
  );
}
