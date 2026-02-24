import Link from "next/link";
import Image from "next/image";
import { MapPin, BedDouble, Maximize, Package } from "lucide-react";

type Property = {
  id: string;
  title: string;
  city: string;
  price: number;
  type: string;
  purpose: string;
  bedrooms: number | null;
  area_sqm: number | null;
  images: string[] | null;
};

const RENTAL_LABELS: Record<string, string> = {
  short_term: "Short-term",
  long_term: "Long-term",
  contract: "Contract",
};

const PRICE_SUFFIX: Record<string, string> = {
  short_term: "/night",
  long_term: "/mo",
  contract: "/yr",
};

export function PropertyCard({ property }: { property: Property }) {
  const imgSrc = property.images?.[0] || null;
  const rentalLabel = RENTAL_LABELS[property.purpose] || property.purpose;
  const priceSuffix = PRICE_SUFFIX[property.purpose] || "";

  return (
    <Link href={`/properties/${property.id}`}>
      <div className="group overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800">
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-800">
          {imgSrc ? (
            <Image
              src={imgSrc}
              alt={property.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Package className="h-12 w-12 text-slate-400 dark:text-slate-500" />
            </div>
          )}
          <div className="absolute left-3 top-3 rounded-full bg-white/90 dark:bg-slate-950/90 px-2.5 py-0.5 text-[12px] font-bold text-slate-900 dark:text-white backdrop-blur-sm">
            {rentalLabel}
          </div>
        </div>
        <div className="p-4">
          <h3 className="truncate text-[15px] font-bold text-slate-900 dark:text-white">
            {property.title}
          </h3>
          <p className="mt-0.5 text-[15px] font-bold text-blue-500 dark:text-blue-400">
            SAR {property.price.toLocaleString()}<span className="text-[12px] font-medium text-slate-600 dark:text-slate-400">{priceSuffix}</span>
          </p>
          <div className="mt-2 flex items-center gap-3 text-[13px] text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> {property.city}
            </span>
            {property.bedrooms != null && (
              <span className="flex items-center gap-1">
                <BedDouble className="h-3.5 w-3.5" /> {property.bedrooms}
              </span>
            )}
            {property.area_sqm != null && (
              <span className="flex items-center gap-1">
                <Maximize className="h-3.5 w-3.5" /> {property.area_sqm}m²
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
