import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/dashboard/data-table";
import { createAdminClient } from "@/lib/supabase/admin";
import { Star } from "lucide-react";

type TestimonialRow = {
  id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
  is_active: boolean;
  created_at: string;
};

export const revalidate = 0;

export default async function AdminTestimonialsPage() {
  const supabase = createAdminClient();
  const { data } = (await supabase
    .from("testimonials")
    .select("*")
    .order("created_at", { ascending: false })) as { data: TestimonialRow[] | null };

  const rows = data || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Testimonials</h1>
        <p className="text-sm text-muted-foreground">Manage homepage testimonials and reviews.</p>
      </div>

      <DataTable
        rows={rows}
        columns={[
          { key: "name", title: "Name" },
          { key: "role", title: "Role" },
          {
            key: "content",
            title: "Content",
            render: (row) => (
              <span className="max-w-[300px] truncate block" title={row.content}>
                {row.content}
              </span>
            ),
          },
          {
            key: "rating",
            title: "Rating",
            render: (row) => (
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${i < row.rating ? "fill-yellow-500 text-yellow-500" : "text-gray-300"}`}
                  />
                ))}
              </div>
            ),
          },
          {
            key: "is_active",
            title: "Status",
            render: (row) => (
              <Badge variant={row.is_active ? "default" : "secondary"}>
                {row.is_active ? "Active" : "Hidden"}
              </Badge>
            ),
          },
          {
            key: "created_at",
            title: "Added",
            render: (row) => new Date(row.created_at).toLocaleDateString(),
          },
        ]}
      />
    </div>
  );
}
