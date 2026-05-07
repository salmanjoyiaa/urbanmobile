"use client";

import { useState, useTransition, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LISTING_PURPOSES, PROPERTY_TYPES, SAUDI_CITIES } from "@/lib/constants";

type PropertyFiltersProps = {
  initialValues: {
    city?: string;
    district?: string;
    type?: string;
    purpose?: string;
    minPrice?: string;
    maxPrice?: string;
    bedrooms?: string;
    status?: string;
  };
};

export function PropertyFilters({ initialValues }: PropertyFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const filterKey = searchParams.toString();
  const selectedCity = searchParams.get("city") || "all";

  const [districts, setDistricts] = useState<string[]>([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  useEffect(() => {
    if (selectedCity && selectedCity !== "all") {
      setLoadingDistricts(true);
      fetch(`/api/districts?city=${encodeURIComponent(selectedCity)}`)
        .then(res => res.json())
        .then(data => {
          setDistricts(data.districts || []);
        })
        .catch(console.error)
        .finally(() => setLoadingDistricts(false));
    } else {
      setDistricts([]);
    }
  }, [selectedCity]);

  const applyFilter = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (!value || value === "all") {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    });
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

  const [open, setOpen] = useState(false);

  return (
    <section className="rounded-2xl border border-[#eff3f4] p-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-[14px] font-bold text-[#0f1419] lg:hidden"
      >
        <span className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </span>
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      <div className={`${open ? "mt-4 grid" : "hidden"} grid-cols-2 gap-4 lg:grid lg:grid-cols-4 xl:grid-cols-8`} key={filterKey}>
        <div className="space-y-1.5">
          <label className="text-[13px] font-bold text-[#0f1419]">City</label>
          <Select
            defaultValue={initialValues.city || "all"}
            onValueChange={(value) => applyFilter({ city: value, district: null })} // Reset district when city changes
          >
            <SelectTrigger className="rounded-lg border-[#cfd9de]">
              <SelectValue placeholder="All cities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All cities</SelectItem>
              {SAUDI_CITIES.map((city) => (
                <SelectItem key={city} value={city}>{city}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[13px] font-bold text-[#0f1419]">District</label>
          <Select
            value={initialValues.district || "all"}
            onValueChange={(value) => applyFilter({ district: value })}
            disabled={selectedCity === "all" || loadingDistricts || districts.length === 0}
          >
            <SelectTrigger className="rounded-lg border-[#cfd9de]">
              <SelectValue placeholder={loadingDistricts ? "Loading..." : "All districts"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All districts</SelectItem>
              {districts.map((d) => (
                <SelectItem key={d} value={d}>{d}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[13px] font-bold text-[#0f1419]">Type</label>
          <Select
            defaultValue={initialValues.type || "all"}
            onValueChange={(value) => applyFilter({ type: value })}
          >
            <SelectTrigger className="rounded-lg border-[#cfd9de]">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {PROPERTY_TYPES.map((item) => (
                <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[13px] font-bold text-[#0f1419]">Rental Type</label>
          <Select
            defaultValue={initialValues.purpose || "all"}
            onValueChange={(value) => applyFilter({ purpose: value })}
          >
            <SelectTrigger className="rounded-lg border-[#cfd9de]">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {LISTING_PURPOSES.map((item) => (
                <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[13px] font-bold text-[#0f1419]">Status</label>
          <Select
            defaultValue={initialValues.status || "all"}
            onValueChange={(value) => applyFilter({ status: value })}
          >
            <SelectTrigger className="rounded-lg border-[#cfd9de]">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="rented">Rented</SelectItem>
              <SelectItem value="reserved">Reserved</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[13px] font-bold text-[#0f1419]">Min price</label>
          <Input
            type="number"
            placeholder="Min"
            defaultValue={initialValues.minPrice || ""}
            className="rounded-lg border-[#cfd9de]"
            onBlur={(event) => applyFilter({ minPrice: event.target.value || null })}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[13px] font-bold text-[#0f1419]">Max price</label>
          <Input
            type="number"
            placeholder="Max"
            defaultValue={initialValues.maxPrice || ""}
            className="rounded-lg border-[#cfd9de]"
            onBlur={(event) => applyFilter({ maxPrice: event.target.value || null })}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[13px] font-bold text-[#0f1419]">Bedrooms</label>
          <Input
            type="number"
            min={0}
            placeholder="Any"
            defaultValue={initialValues.bedrooms || ""}
            className="rounded-lg border-[#cfd9de]"
            onBlur={(event) => applyFilter({ bedrooms: event.target.value || null })}
          />
        </div>
      </div>

      <div className={`${open ? "flex" : "hidden"} mt-3 justify-end lg:flex`}>
        <button
          onClick={clearFilters}
          disabled={isPending}
          className="rounded-full px-4 py-1.5 text-[13px] font-bold text-[#1d9bf0] transition-colors hover:bg-[#e8f5fd] disabled:opacity-40"
        >
          Clear filters
        </button>
      </div>
    </section>
  );
}
