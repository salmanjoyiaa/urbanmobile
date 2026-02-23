import type { Metadata } from "next";
import Link from "next/link";
import { Package } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/types/database";
import { ProductCard } from "@/components/product/product-card";
import { ProductFilters } from "@/components/product/product-filters";

export const revalidate = 60;

type SearchParams = {
  category?: string;
  condition?: string;
  city?: string;
  minPrice?: string;
  maxPrice?: string;
  page?: string;
};

type ProductsPageProps = {
  searchParams: SearchParams;
};

export async function generateMetadata({ searchParams }: ProductsPageProps): Promise<Metadata> {
  const city = searchParams.city ? ` in ${searchParams.city}` : "";
  return {
    title: `Products${city}`,
    description: "Browse quality used household items from verified agents across Saudi Arabia.",
  };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const supabase = await createClient();
  const city = searchParams.city && searchParams.city !== "all" ? searchParams.city : undefined;
  const category =
    searchParams.category && searchParams.category !== "all"
      ? searchParams.category
      : undefined;
  const condition =
    searchParams.condition && searchParams.condition !== "all"
      ? searchParams.condition
      : undefined;
  const page = Math.max(Number(searchParams.page || 1), 1);
  const pageSize = 12;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("products")
    .select("*", { count: "exact" })
    .eq("is_available", true)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (category) query = query.eq("category", category);
  if (condition) query = query.eq("condition", condition);
  if (city) query = query.eq("city", city);
  if (searchParams.minPrice) query = query.gte("price", Number(searchParams.minPrice));
  if (searchParams.maxPrice) query = query.lte("price", Number(searchParams.maxPrice));

  let products: Product[] = [];
  let count: number | null = 0;

  try {
    const result = (await query) as { data: Product[] | null; error: { message: string } | null; count: number | null };
    if (result.error) {
      console.error("Failed to load products:", result.error.message);
    } else {
      products = result.data || [];
      count = result.count;
    }
  } catch (e) {
    console.error("Products fetch error:", e);
  }

  const totalPages = Math.max(Math.ceil((count || 0) / pageSize), 1);

  const params = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value && value !== "all") params.set(key, value);
  });

  const withPage = (nextPage: number) => {
    const next = new URLSearchParams(params.toString());
    next.set("page", String(nextPage));
    return `/products?${next.toString()}`;
  };

  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      <div>
        <h1 className="text-[24px] font-extrabold text-[#2A201A]">Products</h1>
        <p className="mt-1 text-[15px] text-[#6B5A4E]">Find quality used household items from trusted agents.</p>
      </div>

      <ProductFilters initialValues={searchParams} />

      {products.length === 0 ? (
        <div className="rounded-2xl border border-[#D9C5B2]/40 bg-[#FCF9F2] p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#E5D5C5]">
            <Package className="h-7 w-7 text-[#6B5A4E]" />
          </div>
          <h3 className="mt-4 text-[17px] font-bold text-[#2A201A]">No products found</h3>
          <p className="mt-1 text-[15px] text-[#6B5A4E]">
            Try adjusting your filters or check back later.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      <div className="flex flex-col items-center justify-between gap-4 border-t border-[#eff3f4] pt-4 sm:flex-row">
        <p className="text-[13px] text-[#536471]">
          Showing {products.length} {products.length === 1 ? 'product' : 'products'} {count && count > pageSize ? `of ${count} total` : ''}
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
