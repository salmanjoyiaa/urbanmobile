import Link from "next/link";
import { redirect } from "next/navigation";
import { Pencil } from "lucide-react";
import { DataTable } from "@/components/dashboard/data-table";
import { DeleteItemButton } from "@/components/dashboard/delete-item-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { formatSAR } from "@/lib/format";
import type { Product } from "@/types/database";

type ProductRow = Product & { contact_clicks: number };

export default async function AgentProductsPage() {
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

  const { data } = (await supabase
    .from("products")
    .select("*")
    .eq("agent_id", agent.id)
    .order("created_at", { ascending: false })) as { data: Product[] | null };

  const baseRows = data || [];
  const ids = baseRows.map((p) => p.id);
  const clickMap: Record<string, number> = {};

  if (ids.length > 0) {
    const { data: events } = (await supabase.from("product_contact_events").select("product_id").in("product_id", ids)) as {
      data: { product_id: string }[] | null;
    };
    for (const e of events || []) {
      clickMap[e.product_id] = (clickMap[e.product_id] || 0) + 1;
    }
  }

  const rows: ProductRow[] = baseRows.map((p) => ({
    ...p,
    contact_clicks: clickMap[p.id] || 0,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">My Products</h1>
          <p className="text-sm text-muted-foreground">Manage your product listings.</p>
        </div>
        <Link href="/agent/products/new">
          <Button>Create Product</Button>
        </Link>
      </div>

      <DataTable
        rows={rows}
        columns={[
          { key: "title", title: "Title" },
          { key: "category", title: "Category" },
          {
            key: "condition",
            title: "Condition",
            render: (row) => <Badge className="capitalize">{row.condition.replace("_", " ")}</Badge>,
          },
          {
            key: "price",
            title: "Price",
            render: (row) => formatSAR(row.price),
          },
          {
            key: "contact_clicks",
            title: "Clicks",
            render: (row) => <span className="tabular-nums font-medium">{row.contact_clicks}</span>,
          },
          {
            key: "actions",
            title: "Actions",
            render: (row) => (
              <div className="flex items-center gap-2">
                <Link href={`/agent/products/${row.id}/edit`}>
                  <Button size="sm" variant="outline">
                    <Pencil className="mr-1 h-3 w-3" />
                    Edit
                  </Button>
                </Link>
                <DeleteItemButton endpoint={`/api/agent/products/${row.id}`} label="product" />
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
