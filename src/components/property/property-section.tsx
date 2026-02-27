"use client";

import { useState } from "react";
import { PropertyCard } from "./property-card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Property = {
  id: string;
  title: string;
  city: string;
  district?: string | null;
  price: number;
  type: string;
  purpose: string;
  status: string;
  bedrooms: number | null;
  area_sqm: number | null;
  images: string[] | null;
  property_ref?: string | null;
  address?: string | null;
  amenities?: string[] | null;
  building_features?: string[] | null;
  office_fee?: string | null;
  broker_fee?: string | null;
  water_bill_included?: string | null;
  cover_image_index?: number;
  location_url?: string | null;
};

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  available: { label: "Available", className: "bg-green-100 text-green-800 border-green-300" },
  rented: { label: "Rented", className: "bg-blue-100 text-blue-800 border-blue-300" },
  reserved: { label: "Reserved", className: "bg-orange-100 text-orange-800 border-orange-300" },
};

export function PropertySection({
  title,
  status,
  preview,
  all,
  totalCount,
}: {
  title: string;
  status: string;
  preview: Property[];
  all: Property[];
  totalCount: number;
}) {
  const [open, setOpen] = useState(false);
  const badge = STATUS_BADGE[status];

  if (preview.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-[20px] font-extrabold text-foreground">{title}</h2>
          {badge && (
            <Badge className={`capitalize border ${badge.className}`}>
              {totalCount} {badge.label}
            </Badge>
          )}
        </div>
        {totalCount > 10 && (
          <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
            View all ({totalCount})
          </Button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {preview.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{title} ({totalCount})</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 pt-2">
            {all.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
