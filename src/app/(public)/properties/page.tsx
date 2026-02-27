import type { Metadata } from "next";
import { Building2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PropertyFilters } from "@/components/property/property-filters";
import { PropertySection } from "@/components/property/property-section";
import type { Property } from "@/types/database";

export const revalidate = 60;

type SearchParams = {
  city?: string;
  type?: string;
  purpose?: string;
  minPrice?: string;
  maxPrice?: string;
  bedrooms?: string;
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

async function fetchByStatus(
  supabase: Awaited<ReturnType<typeof createClient>>,
  status: string,
  searchParams: SearchParams,
  limit: number,
) {
  let query = supabase
    .from("properties")
    .select("*", { count: "exact" })
    .eq("status", status)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (searchParams.city) query = query.eq("city", searchParams.city);
  if (searchParams.type) query = query.eq("type", searchParams.type);
  if (searchParams.purpose) query = query.eq("purpose", searchParams.purpose);
  if (searchParams.minPrice) query = query.gte("price", Number(searchParams.minPrice));
  if (searchParams.maxPrice) query = query.lte("price", Number(searchParams.maxPrice));
  if (searchParams.bedrooms) query = query.gte("bedrooms", Number(searchParams.bedrooms));

  const result = (await query) as {
    data: Property[] | null;
    error: { message: string } | null;
    count: number | null;
  };

  if (result.error) {
    console.error(`Failed to load ${status} properties:`, result.error.message);
    return { data: [] as Property[], count: 0 };
  }

  return { data: result.data || [], count: result.count || 0 };
}

export default async function PropertiesPage({ searchParams }: PropertiesPageProps) {
  const supabase = await createClient();

  const maxForModal = 100;

  const [available, rented, reserved] = await Promise.all([
    fetchByStatus(supabase, "available", searchParams, maxForModal),
    fetchByStatus(supabase, "rented", searchParams, maxForModal),
    fetchByStatus(supabase, "reserved", searchParams, maxForModal),
  ]);

  const hasAny = available.data.length > 0 || rented.data.length > 0 || reserved.data.length > 0;

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-[24px] font-extrabold text-foreground">Rental Listings</h1>
        <p className="text-[15px] text-muted-foreground">Find affordable homes and spaces for rent across Saudi Arabia.</p>
      </div>

      <PropertyFilters initialValues={searchParams} />

      {!hasAny ? (
        <div className="rounded-2xl border border-border bg-muted/50 p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <Building2 className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-[17px] font-bold text-foreground">No properties found</h3>
          <p className="mt-1 text-[15px] text-muted-foreground">
            Try adjusting your filters or check back later.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          <PropertySection
            title="Available for Rent"
            status="available"
            preview={available.data.slice(0, 10)}
            all={available.data}
            totalCount={available.count}
          />
          <PropertySection
            title="Rented"
            status="rented"
            preview={rented.data.slice(0, 10)}
            all={rented.data}
            totalCount={rented.count}
          />
          <PropertySection
            title="Reserved"
            status="reserved"
            preview={reserved.data.slice(0, 10)}
            all={reserved.data}
            totalCount={reserved.count}
          />
        </div>
      )}
    </div>
  );
}
