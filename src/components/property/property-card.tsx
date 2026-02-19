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

export function PropertyCard({ property }: { property: Property }) {
  const imgSrc = property.images?.[0] || null;

  return (
    <Link href={`/properties/${property.id}`}>
      <div className="group overflow-hidden rounded-2xl border border-[#eff3f4] bg-white transition-colors hover:bg-[#f7f9f9]">
        <div className="relative aspect-[4/3] overflow-hidden bg-[#f7f9f9]">
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
              <Package className="h-12 w-12 text-[#cfd9de]" />
            </div>
          )}
          <div className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-0.5 text-[12px] font-bold capitalize text-[#0f1419] backdrop-blur-sm">
            {property.purpose}
          </div>
        </div>
        <div className="p-4">
          <h3 className="truncate text-[15px] font-bold text-[#0f1419]">
            {property.title}
          </h3>
          <p className="mt-0.5 text-[15px] font-bold text-[#1d9bf0]">
            SAR {property.price.toLocaleString()}
          </p>
          <div className="mt-2 flex items-center gap-3 text-[13px] text-[#536471]">
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
