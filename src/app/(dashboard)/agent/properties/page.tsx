import Link from "next/link";
import { Pencil } from "lucide-react";
import { DataTable } from "@/components/dashboard/data-table";
import { DeleteItemButton } from "@/components/dashboard/delete-item-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import { formatSAR } from "@/lib/format";
import type { Property } from "@/types/database";

export default async function AgentPropertiesPage() {
  const supabase = await createClient();
  const { data } = (await supabase
    .from("properties")
    .select("*")
    .order("created_at", { ascending: false })) as { data: Property[] | null };

  const rows = data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">My Properties</h1>
          <p className="text-sm text-muted-foreground">Manage your property listings.</p>
        </div>
        <Link href="/agent/properties/new">
          <Button>Create Property</Button>
        </Link>
      </div>

      <DataTable
        rows={rows}
        columns={[
          { key: "title", title: "Title" },
          {
            key: "status",
            title: "Status",
            render: (row) => <Badge className="capitalize">{row.status}</Badge>,
          },
          { key: "city", title: "City" },
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
                <Link href={`/agent/properties/${row.id}/edit`}>
                  <Button size="sm" variant="outline">
                    <Pencil className="mr-1 h-3 w-3" />
                    Edit
                  </Button>
                </Link>
                <DeleteItemButton endpoint={`/api/agent/properties/${row.id}`} label="property" />
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
