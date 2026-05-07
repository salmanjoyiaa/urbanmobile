"use client";

import { useState, useEffect } from "react";
import { SAUDI_CITIES } from "@/lib/constants";

export function AdminPropertyFilters({
  initialStatus,
  initialCity,
  initialDistrict,
}: {
  initialStatus?: string;
  initialCity?: string;
  initialDistrict?: string;
}) {
  const [city, setCity] = useState(initialCity || "");
  const [districts, setDistricts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (city) {
      setLoading(true);
      fetch(`/api/districts?city=${encodeURIComponent(city)}`)
        .then(res => res.json())
        .then(data => {
          setDistricts(data.districts || []);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setDistricts([]);
    }
  }, [city]);

  return (
    <form className="flex flex-wrap gap-3 items-end" action="/admin/properties" method="get">
      <div>
        <label className="text-xs font-medium text-muted-foreground block mb-1">Status</label>
        <select
          name="status"
          defaultValue={initialStatus || ""}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="available">Available</option>
          <option value="rented">Rented</option>
          <option value="reserved">Reserved</option>
          <option value="sold">Sold</option>
        </select>
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground block mb-1">City</label>
        <select
          name="city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">All Cities</option>
          {SAUDI_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground block mb-1">District</label>
        <select
          name="district"
          defaultValue={initialDistrict || ""}
          disabled={!city || loading || districts.length === 0}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm disabled:opacity-50"
        >
          <option value="">{loading ? "Loading..." : "All Districts"}</option>
          {districts.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      <button
        type="submit"
        className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Filter
      </button>
      <a
        href="/admin/properties"
        className="h-9 rounded-md border border-input bg-background px-4 text-sm font-medium inline-flex items-center hover:bg-muted"
      >
        Reset
      </a>
    </form>
  );
}
