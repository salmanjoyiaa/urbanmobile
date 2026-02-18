import Link from "next/link";
import { Pencil } from "lucide-react";
import { DataTable } from "@/components/dashboard/data-table";
import { DeleteItemButton } from "@/components/dashboard/delete-item-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { formatSAR } from "@/lib/format";
import type { Product } from "@/types/database";

export default async function AgentProductsPage() {
  const supabase = await createClient();
  const { data } = (await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false })) as { data: Product[] | null };

  const rows = data || [];

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
