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
  const city = normalize(params.get("city"));
  const type = normalize(params.get("type"));
  const purpose = normalize(params.get("purpose"));
  const minPrice = params.get("minPrice");
  const maxPrice = params.get("maxPrice");
  const bedrooms = params.get("bedrooms");
  const page = Math.max(toNumber(params.get("page"), 1), 1);
  const pageSize = Math.max(toNumber(params.get("pageSize"), 12), 1);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const key = `properties:list:${city || "*"}:${type || "*"}:${purpose || "*"}:${minPrice || "*"}:${maxPrice || "*"}:${bedrooms || "*"}:${page}:${pageSize}`;

  try {
    const supabase = createApiClient();
    const result = await cacheAside({
      key,
      ttlSeconds: 60,
      label: "properties:list",
      fetcher: async () => {
        let query = supabase
          .from("properties")
          .select("*", { count: "exact" })
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .range(from, to);

        if (city) query = query.eq("city", city);
        if (type) query = query.eq("type", type);
        if (purpose) query = query.eq("purpose", purpose);
        if (minPrice) query = query.gte("price", Number(minPrice));
        if (maxPrice) query = query.lte("price", Number(maxPrice));
        if (bedrooms) query = query.gte("bedrooms", Number(bedrooms));

        const { data, error, count } = await query;

        if (error) {
          throw new Error(error.message);
        }

        return {
          data: data || [],
          count: count || 0,
        };
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load properties" },
      { status: 500 }
    );
  }
}
