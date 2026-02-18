import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PRODUCT_CATEGORIES, PRODUCT_CONDITIONS, SAUDI_CITIES } from "@/lib/constants";
import type { Product } from "@/types/database";
import { ProductCard } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

  const { data, count } = (await query) as { data: Product[] | null; count: number | null };
  const products = data || [];
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
        <h1 className="text-3xl font-bold text-navy">Products</h1>
        <p className="mt-2 text-muted-foreground">Find quality used household items from trusted agents.</p>
      </div>

      <form className="grid gap-4 rounded-lg border bg-card p-4 md:grid-cols-3 lg:grid-cols-6" method="get">
        <div className="space-y-2 lg:col-span-1">
          <label className="text-sm font-medium">City</label>
          <select
            name="city"
            defaultValue={searchParams.city || "all"}
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
          >
            <option value="all">All cities</option>
            {SAUDI_CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2 lg:col-span-1">
          <label className="text-sm font-medium">Category</label>
          <select
            name="category"
            defaultValue={searchParams.category || "all"}
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
          >
            <option value="all">All categories</option>
            {PRODUCT_CATEGORIES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2 lg:col-span-1">
          <label className="text-sm font-medium">Condition</label>
          <select
            name="condition"
            defaultValue={searchParams.condition || "all"}
            className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
          >
            <option value="all">Any condition</option>
            {PRODUCT_CONDITIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2 lg:col-span-1">
          <label className="text-sm font-medium">Min price</label>
          <Input type="number" name="minPrice" defaultValue={searchParams.minPrice || ""} />
        </div>

        <div className="space-y-2 lg:col-span-1">
          <label className="text-sm font-medium">Max price</label>
          <Input type="number" name="maxPrice" defaultValue={searchParams.maxPrice || ""} />
        </div>

        <div className="flex items-end gap-2 lg:col-span-1">
          <Button type="submit" className="w-full">Apply</Button>
        </div>
      </form>

      {products.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center text-muted-foreground">
          No products found for the current filters.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
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
