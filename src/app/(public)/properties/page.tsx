import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PropertyFilters } from "@/components/property/property-filters";
import { PropertyCard } from "@/components/property/property-card";
import type { Property } from "@/types/database";
import { Button } from "@/components/ui/button";

export const revalidate = 60;

type SearchParams = {
  city?: string;
  type?: string;
  purpose?: string;
  minPrice?: string;
  maxPrice?: string;
  bedrooms?: string;
  page?: string;
};

type PropertiesPageProps = {
  searchParams: SearchParams;
};

export async function generateMetadata({ searchParams }: PropertiesPageProps): Promise<Metadata> {
  const city = searchParams.city ? ` in ${searchParams.city}` : "";
  const type = searchParams.type ? ` (${searchParams.type})` : "";
  return {
    title: `Properties${city}${type}`,
    description: "Browse premium properties across Saudi Arabia with filters by city, type, and budget.",
  };
}

export default async function PropertiesPage({ searchParams }: PropertiesPageProps) {
  const supabase = await createClient();
  const page = Math.max(Number(searchParams.page || 1), 1);
  const pageSize = 12;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("properties")
    .select("*", { count: "exact" })
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (searchParams.city) query = query.eq("city", searchParams.city);
  if (searchParams.type) query = query.eq("type", searchParams.type);
  if (searchParams.purpose) query = query.eq("purpose", searchParams.purpose);
  if (searchParams.minPrice) query = query.gte("price", Number(searchParams.minPrice));
  if (searchParams.maxPrice) query = query.lte("price", Number(searchParams.maxPrice));
  if (searchParams.bedrooms) query = query.gte("bedrooms", Number(searchParams.bedrooms));

  const { data, count } = (await query) as { data: Property[] | null; count: number | null };
  const properties = data || [];
  const totalPages = Math.max(Math.ceil((count || 0) / pageSize), 1);

  const params = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });

  const withPage = (nextPage: number) => {
    const next = new URLSearchParams(params.toString());
    next.set("page", String(nextPage));
    return `/properties?${next.toString()}`;
  };

  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      <div>
        <h1 className="text-3xl font-bold text-navy">Property Listings</h1>
        <p className="mt-2 text-muted-foreground">Find homes and commercial spaces across Saudi Arabia.</p>
      </div>

      <PropertyFilters initialValues={searchParams} />

      {properties.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center text-muted-foreground">
          No properties found for the current filters.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}

      <div className="flex items-center justify-end gap-2">
        <Link href={withPage(Math.max(page - 1, 1))}>
          <Button variant="outline" disabled={page <= 1}>Previous</Button>
        </Link>
        <span className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </span>
        <Link href={withPage(Math.min(page + 1, totalPages))}>
          <Button variant="outline" disabled={page >= totalPages}>Next</Button>
        </Link>
      </div>
    </div>
  );
}
