import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/dashboard/data-table";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatSAR } from "@/lib/format";
import { PropertyActions } from "@/components/admin/property-actions";

type Row = {
  id: string;
  title: string;
  city: string;
  status: string;
  price: number;
  agents: {
    profiles: {
      full_name: string;
    } | null;
  } | null;
};

export default async function AdminPropertiesPage() {
  const supabase = createAdminClient();
  const { data } = (await supabase
    .from("properties")
    .select("id, title, city, status, price, agents(profiles(full_name))")
    .order("created_at", { ascending: false })) as { data: Row[] | null };

  const rows = data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">All Properties</h1>
        <p className="text-sm text-muted-foreground">Global listings overview for administrators.</p>
      </div>

      <DataTable
        rows={rows}
        columns={[
          { key: "title", title: "Title" },
          { key: "agent", title: "Listed By", render: (row) => row.agents?.profiles?.full_name || "—" },
          { key: "city", title: "City" },
          { key: "price", title: "Price", render: (row) => formatSAR(row.price) },
          {
            key: "status",
            title: "Status",
            render: (row) => <Badge className="capitalize">{row.status}</Badge>,
          },
          {
            key: "actions",
            title: "Actions",
            render: (row) => <PropertyActions id={row.id} title={row.title} />,
          },
        ]}
      />
    </div>
  );
}
