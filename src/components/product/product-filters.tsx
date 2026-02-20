"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { SlidersHorizontal, ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PRODUCT_CATEGORIES, PRODUCT_CONDITIONS, SAUDI_CITIES } from "@/lib/constants";

type ProductFiltersProps = {
  initialValues: {
    city?: string;
    category?: string;
    condition?: string;
    minPrice?: string;
    maxPrice?: string;
  };
};

export function ProductFilters({ initialValues }: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [city, setCity] = useState(initialValues.city || "all");
  const [category, setCategory] = useState(initialValues.category || "all");
  const [condition, setCondition] = useState(initialValues.condition || "all");
  const [minPrice, setMinPrice] = useState(initialValues.minPrice || "");
  const [maxPrice, setMaxPrice] = useState(initialValues.maxPrice || "");

  const apply = () => {
    const next = new URLSearchParams();
    if (city && city !== "all") next.set("city", city);
    if (category && category !== "all") next.set("category", category);
    if (condition && condition !== "all") next.set("condition", condition);
    if (minPrice) next.set("minPrice", minPrice);
    if (maxPrice) next.set("maxPrice", maxPrice);
    router.push(`${pathname}?${next.toString()}`);
  };

  const clearFilters = () => {
    setCity("all");
    setCategory("all");
    setCondition("all");
    setMinPrice("");
    setMaxPrice("");
    router.push(pathname);
  };

  const filterKey = searchParams.toString();

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
      <div className={`${open ? "mt-4 grid" : "hidden"} grid-cols-2 gap-4 lg:grid lg:grid-cols-6`} key={filterKey}>
        <div className="space-y-1.5">
          <label className="text-[13px] font-bold text-[#0f1419]">City</label>
          <Select value={city} onValueChange={setCity}>
            <SelectTrigger className="rounded-lg border-[#cfd9de]">
              <SelectValue placeholder="All cities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All cities</SelectItem>
              {SAUDI_CITIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[13px] font-bold text-[#0f1419]">Category</label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="rounded-lg border-[#cfd9de]">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {PRODUCT_CATEGORIES.map((item) => (
                <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[13px] font-bold text-[#0f1419]">Condition</label>
          <Select value={condition} onValueChange={setCondition}>
            <SelectTrigger className="rounded-lg border-[#cfd9de]">
              <SelectValue placeholder="Any condition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any condition</SelectItem>
              {PRODUCT_CONDITIONS.map((item) => (
                <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[13px] font-bold text-[#0f1419]">Min price</label>
          <Input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="rounded-lg border-[#cfd9de]"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[13px] font-bold text-[#0f1419]">Max price</label>
          <Input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="rounded-lg border-[#cfd9de]"
          />
        </div>

        <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-1">
          <button
            type="button"
            onClick={apply}
            className="w-full rounded-full bg-[#0f1419] px-4 py-2 text-[15px] font-bold text-white transition-colors hover:bg-[#272c30]"
          >
            Apply
          </button>
        </div>
      </div>

      <div className={`${open ? "flex" : "hidden"} mt-3 justify-end lg:flex`}>
        <button
          type="button"
          onClick={clearFilters}
          className="rounded-full px-4 py-1.5 text-[13px] font-bold text-[#1d9bf0] transition-colors hover:bg-[#e8f5fd]"
        >
          Clear filters
        </button>
      </div>
    </section>
  );
}
