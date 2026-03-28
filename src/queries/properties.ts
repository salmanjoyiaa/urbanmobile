"use client";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import type { Property } from "@/types/database";

type PropertyFilters = {
  city?: string;
  type?: string;
  purpose?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  page?: number;
  pageSize?: number;
};

function buildParams(filters?: PropertyFilters) {
  const params = new URLSearchParams();
  if (!filters) return params;

  if (filters.city) params.set("city", filters.city);
  if (filters.type) params.set("type", filters.type);
  if (filters.purpose) params.set("purpose", filters.purpose);
  if (typeof filters.minPrice === "number") params.set("minPrice", String(filters.minPrice));
  if (typeof filters.maxPrice === "number") params.set("maxPrice", String(filters.maxPrice));
  if (typeof filters.bedrooms === "number") params.set("bedrooms", String(filters.bedrooms));
  if (typeof filters.page === "number") params.set("page", String(filters.page));
  if (typeof filters.pageSize === "number") params.set("pageSize", String(filters.pageSize));

  return params;
}

export function useProperties(filters?: PropertyFilters) {
  return useQuery({
    queryKey: ["properties", filters],
    queryFn: async () => {
      const params = buildParams(filters);
      const response = await fetch(`/api/properties?${params.toString()}`);
      const result = (await response.json()) as {
        data?: Property[];
        count?: number;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(result.error || "Could not load properties");
      }

      return { data: result.data || [], count: result.count || 0 };
    },
  });
}

export function useInfiniteProperties(filters?: Omit<PropertyFilters, "page">) {
  const pageSize = filters?.pageSize || 12;

  return useInfiniteQuery({
    queryKey: ["properties-infinite", filters],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const params = buildParams({ ...filters, page: pageParam, pageSize });
      const response = await fetch(`/api/properties?${params.toString()}`);
      const result = (await response.json()) as {
        data?: Property[];
        count?: number;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(result.error || "Could not load properties");
      }

      return {
        data: result.data || [],
        count: result.count || 0,
        page: pageParam,
      };
    },
    getNextPageParam: (lastPage) => {
      const totalPages = Math.max(Math.ceil(lastPage.count / pageSize), 1);
      return lastPage.page < totalPages ? lastPage.page + 1 : undefined;
    },
  });
}

export function useProperty(id: string) {
  return useQuery({
    queryKey: ["property", id],
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    queryFn: async () => {
      const response = await fetch(`/api/properties/${id}`);
      const result = (await response.json()) as {
        data?: Property;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(result.error || "Could not load property");
      }

      return result.data || null;
    },
  });
}
