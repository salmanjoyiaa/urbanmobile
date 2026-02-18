import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/dashboard/data-table";
import { createClient } from "@/lib/supabase/server";

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
  const { data } = (await supabase
    .from("buy_requests")
    .select(
      `
      id, buyer_name, buyer_email, buyer_phone, message, status,
      products:product_id (title)
    `
    )
    .order("created_at", { ascending: false })) as { data: LeadRow[] | null };

  const rows = data || [];

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
