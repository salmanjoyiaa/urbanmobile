import { NextRequest, NextResponse } from "next/server";
import { createApiClient } from "@/lib/supabase/api";
import { cacheAside } from "@/lib/redis";

function toNumber(value: string | null, fallback: number) {
  const parsed = value ? Number(value) : NaN;
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalize(value: string | null) {
  if (!value || value === "all") return null;
  return value;
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const category = normalize(params.get("category"));
  const minPrice = params.get("minPrice");
  const maxPrice = params.get("maxPrice");
  const sortBy = params.get("sortBy") || "created_at";
  const sortOrder = params.get("sortOrder") || "desc";
  const page = Math.max(toNumber(params.get("page"), 1), 1);
  const pageSize = Math.max(toNumber(params.get("pageSize"), 12), 1);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const key = `products:list:${category || "*"}:${minPrice || "*"}:${maxPrice || "*"}:${sortBy}:${sortOrder}:${page}:${pageSize}`;

  try {
    const supabase = createApiClient();
    const result = await cacheAside({
      key,
      ttlSeconds: 300,
      label: "products:list",
      fetcher: async () => {
        let query = supabase.from("products").select("*", { count: "exact" });

        if (category) {
          query = query.eq("category", category);
        }

        if (minPrice) {
          query = query.gte("price", Math.max(Number(minPrice), 0));
        }

        if (maxPrice) {
          query = query.lte("price", Math.max(Number(maxPrice), 0));
        }

        query = query.order(sortBy, { ascending: sortOrder === "asc" });
        query = query.range(from, to);

        const { data, error, count } = await query;

        if (error) {
          throw new Error(error.message);
        }

        const total = count || 0;
        const totalPages = Math.ceil(total / pageSize);

        return {
          data: data || [],
          pagination: {
            page,
            pageSize,
            total,
            totalPages,
          },
        };
      },
    });

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        "X-Total-Count": String(result.pagination?.total || 0),
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load products" },
      { status: 500 }
    );
  }
}
