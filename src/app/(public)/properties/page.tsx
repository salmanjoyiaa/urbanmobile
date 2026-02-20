import type { Metadata } from "next";
import Link from "next/link";
import { Building2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PropertyFilters } from "@/components/property/property-filters";
import { PropertyCard } from "@/components/property/property-card";
import type { Property } from "@/types/database";

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

  let properties: Property[] = [];
  let count: number | null = 0;

  try {
    const result = (await query) as { data: Property[] | null; error: { message: string } | null; count: number | null };
    if (result.error) {
      console.error("Failed to load properties:", result.error.message);
    } else {
      properties = result.data || [];
      count = result.count;
    }
  } catch (e) {
    console.error("Properties fetch error:", e);
  }

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
        <h1 className="text-[24px] font-extrabold text-[#2A201A]">Rental Listings</h1>
        <p className="mt-1 text-[15px] text-[#6B5A4E]">Find affordable homes and spaces for rent across Saudi Arabia.</p>
      </div>

      <PropertyFilters initialValues={searchParams} />

      {properties.length === 0 ? (
        <div className="rounded-2xl border border-[#D9C5B2]/40 bg-[#FCF9F2] p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#E5D5C5]">
            <Building2 className="h-7 w-7 text-[#6B5A4E]" />
          </div>
          <h3 className="mt-4 text-[17px] font-bold text-[#2A201A]">No properties found</h3>
          <p className="mt-1 text-[15px] text-[#6B5A4E]">
            Try adjusting your filters or check back later.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}

      <div className="flex flex-col items-center justify-between gap-4 border-t border-[#eff3f4] pt-4 sm:flex-row">
        <p className="text-[13px] text-[#536471]">
          Showing {properties.length} {properties.length === 1 ? 'property' : 'properties'} {count && count > pageSize ? `of ${count} total` : ''}
        </p>
        <div className="flex items-center gap-2">
          <Link href={withPage(Math.max(page - 1, 1))}>
            <button
              disabled={page <= 1}
              className="rounded-full border border-[#cfd9de] px-4 py-1.5 text-[13px] font-bold text-[#0f1419] transition-colors hover:bg-[#f7f9f9] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
          </Link>
          <span className="text-[13px] text-[#536471]">
            Page {page} of {totalPages}
          </span>
          <Link href={withPage(Math.min(page + 1, totalPages))}>
            <button
              disabled={page >= totalPages}
              className="rounded-full border border-[#cfd9de] px-4 py-1.5 text-[13px] font-bold text-[#0f1419] transition-colors hover:bg-[#f7f9f9] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
