"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Product } from "@/types/database";

const supabase = createClient();

export function useProducts(filters?: {
  city?: string;
  category?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  pageSize?: number;
}) {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: async () => {
      const page = filters?.page || 1;
      const pageSize = filters?.pageSize || 12;
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from("products")
        .select("*", { count: "exact" })
        .eq("is_available", true)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (filters?.city) query = query.eq("city", filters.city);
      if (filters?.category) query = query.eq("category", filters.category);
      if (filters?.condition) query = query.eq("condition", filters.condition);
      if (filters?.minPrice) query = query.gte("price", filters.minPrice);
      if (filters?.maxPrice) query = query.lte("price", filters.maxPrice);

      const { data, error, count } = (await query) as {
        data: Product[] | null;
        error: { message: string } | null;
        count: number | null;
      };

      if (error) throw new Error(error.message);

      return {
        data: data || [],
        count: count || 0,
      };
    },
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ["product", id],
    enabled: Boolean(id),
    queryFn: async () => {
      const { data, error } = (await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .eq("is_available", true)
        .single()) as {
        data: Product | null;
        error: { message: string } | null;
      };

      if (error) throw new Error(error.message);
      return data;
    },
  });
}
