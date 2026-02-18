"use client";

import { useMemo, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { LISTING_PURPOSES, PROPERTY_TYPES, SAUDI_CITIES } from "@/lib/constants";

function setOrDelete(params: URLSearchParams, key: string, value: string | null) {
  if (!value || value === "all") {
    params.delete(key);
    return;
  }
  params.set(key, value);
}

type PropertyFiltersProps = {
  initialValues: {
    city?: string;
    type?: string;
    purpose?: string;
    minPrice?: string;
    maxPrice?: string;
    bedrooms?: string;
  };
};

export function PropertyFilters({ initialValues }: PropertyFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const paramsBase = useMemo(() => new URLSearchParams(searchParams.toString()), [searchParams]);

  const applyFilter = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(paramsBase.toString());
    Object.entries(updates).forEach(([key, value]) => setOrDelete(next, key, value));
    next.delete("page");
    startTransition(() => {
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    });
  };

  const clearFilters = () => {
    startTransition(() => {
      router.replace(pathname, { scroll: false });
    });
  };

  return (
    <section className="rounded-lg border bg-card p-4">
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <div className="space-y-2">
          <Label>City</Label>
          <Select
            value={initialValues.city || "all"}
            onValueChange={(value) => applyFilter({ city: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="All cities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All cities</SelectItem>
              {SAUDI_CITIES.map((city) => (
                <SelectItem key={city} value={city}>
                  {city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Type</Label>
          <Select
            value={initialValues.type || "all"}
            onValueChange={(value) => applyFilter({ type: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {PROPERTY_TYPES.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Purpose</Label>
          <Select
            value={initialValues.purpose || "all"}
            onValueChange={(value) => applyFilter({ purpose: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {LISTING_PURPOSES.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Min price</Label>
          <Input
            type="number"
            placeholder="0"
            defaultValue={initialValues.minPrice || ""}
            onBlur={(event) => applyFilter({ minPrice: event.target.value || null })}
          />
        </div>

        <div className="space-y-2">
          <Label>Max price</Label>
          <Input
            type="number"
            placeholder="5000000"
            defaultValue={initialValues.maxPrice || ""}
            onBlur={(event) => applyFilter({ maxPrice: event.target.value || null })}
          />
        </div>

        <div className="space-y-2">
          <Label>Bedrooms</Label>
          <Input
            type="number"
            min={0}
            placeholder="Any"
            defaultValue={initialValues.bedrooms || ""}
            onBlur={(event) => applyFilter({ bedrooms: event.target.value || null })}
          />
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <Button variant="outline" onClick={clearFilters} disabled={isPending}>
          Clear filters
        </Button>
      </div>
    </section>
  );
}
