import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/dashboard/data-table";
import { ModerationActionButton } from "@/components/admin/moderation-action-button";
import { createAdminClient } from "@/lib/supabase/admin";
import { MessageCircle } from "lucide-react";

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

export default async function AdminLeadsPage() {
  const supabase = createAdminClient();
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
        <p className="text-sm text-muted-foreground">Confirm or reject incoming product leads.</p>
      </div>

      <DataTable
        rows={rows}
        columns={[
          { key: "product", title: "Product", render: (row) => row.products?.title || "—" },
          { key: "buyer_name", title: "Buyer" },
          { key: "buyer_email", title: "Email" },
          {
            key: "buyer_phone",
            title: "Phone",
            render: (row) => (
              <div className="flex items-center gap-2">
                {row.buyer_phone || "—"}
                {row.buyer_phone && (
                  <a
                    href={`https://wa.me/${row.buyer_phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="h-4 w-4 text-green-500 hover:text-green-600 transition-colors" />
                  </a>
                )}
              </div>
            )
          },
          { key: "message", title: "Message", render: (row) => row.message || "—" },
          { key: "status", title: "Status", render: (row) => <Badge className="capitalize">{row.status}</Badge> },
          {
            key: "actions",
            title: "Actions",
            render: (row) => (
              <div className="flex gap-2">
                <ModerationActionButton endpoint={`/api/admin/leads/${row.id}`} payload={{ status: "confirmed" }} label="Confirm" />
                <ModerationActionButton endpoint={`/api/admin/leads/${row.id}`} payload={{ status: "rejected" }} label="Reject" variant="destructive" />
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
