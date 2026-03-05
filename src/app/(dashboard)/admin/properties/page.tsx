import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { DataTable } from "@/components/dashboard/data-table";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatSAR } from "@/lib/format";
import { PropertyActions } from "@/components/admin/property-actions";
import { FeaturedToggle } from "@/components/admin/featured-toggle";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Row = {
  id: string;
  title: string;
  city: string;
  status: string;
  price: number;
  property_ref: string | null;
  featured: boolean;
  agents: {
    profiles: {
      full_name: string;
    } | null;
  } | null;
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
  available: "bg-green-100 text-green-800 border-green-300",
  rented: "bg-blue-100 text-blue-800 border-blue-300",
  sold: "bg-red-100 text-red-800 border-red-300",
  reserved: "bg-orange-100 text-orange-800 border-orange-300",
};

export default async function AdminPropertiesPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const supabase = createAdminClient();
  let query = supabase
    .from("properties")
    .select("id, title, city, status, price, property_ref, featured, agents:agent_id(profiles:profile_id(full_name))")
    .order("created_at", { ascending: false });

  if (searchParams?.status) {
    query = query.eq("status", searchParams.status);
  }

  const { data } = (await query) as { data: Row[] | null };

  const rows = data || [];
  const pendingCount = rows.filter((r) => r.status === "pending").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">All Properties</h1>
        <p className="text-sm text-muted-foreground">
          Global listings overview for administrators.
          {pendingCount > 0 && (
            <span className="ml-2 inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-semibold text-yellow-800">
              {pendingCount} pending approval
            </span>
          )}
        </p>
      </div>

      <form className="flex flex-wrap gap-3 items-end" action="/admin/properties" method="get">
        <div>
          <label className="text-xs font-medium text-muted-foreground block mb-1">Status</label>
          <select
            name="status"
            defaultValue={searchParams.status || ""}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="available">Available</option>
            <option value="rented">Rented</option>
            <option value="reserved">Reserved</option>
            <option value="sold">Sold</option>
          </select>
        </div>
        <button
          type="submit"
          className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Filter
        </button>
        <a
          href="/admin/properties"
          className="h-9 rounded-md border border-input bg-background px-4 text-sm font-medium inline-flex items-center hover:bg-muted"
        >
          Reset
        </a>
      </form>

      <DataTable
        rows={rows}
        columns={[
          { key: "id", title: "Property ID", render: (row) => <span className="font-mono text-xs">{row.property_ref ?? "—"}</span> },
          {
            key: "title",
            title: "Title",
            render: (row) => (
              <Link href={`/properties/${row.id}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                {row.title}
              </Link>
            ),
          },
          { key: "agent", title: "Listed By", render: (row) => row.agents?.profiles?.full_name || "—" },
          { key: "city", title: "City" },
          { key: "price", title: "Price", render: (row) => formatSAR(row.price) },
          {
            key: "status",
            title: "Status",
            render: (row) => (
              <Badge className={`capitalize border ${STATUS_COLORS[row.status] || ""}`}>
                {row.status}
              </Badge>
            ),
          },
          {
            key: "featured",
            title: "On Homepage",
            render: (row) => (
              <FeaturedToggle id={row.id} featured={row.featured} />
            ),
          },
          {
            key: "actions",
            title: "Actions",
            render: (row) => <PropertyActions id={row.id} title={row.title} status={row.status} />,
          },
        ]}
      />
    </div>
  );
}
