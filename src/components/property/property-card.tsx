import Link from "next/link";
import Image from "next/image";
import { MapPin, BedDouble, Maximize, Package, Tag } from "lucide-react";

type Property = {
  id: string;
  title: string;
  city: string;
  district?: string | null;
  price: number;
  type: string;
  purpose: string;
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

const RENTAL_LABELS: Record<string, string> = {
  short_term: "Short-term",
  long_term: "Long-term",
  contract: "Contract",
};

const PRICE_SUFFIX: Record<string, string> = {
  short_term: "/night",
  long_term: "/yr",
  contract: "/yr",
};

export function PropertyCard({ property, showAmenitiesAndBuildingFeatures = false }: { property: Property; showAmenitiesAndBuildingFeatures?: boolean }) {
  const coverIdx = property.cover_image_index ?? 0;
  const imgSrc = property.images?.[coverIdx] || property.images?.[0] || null;
  const rentalLabel = RENTAL_LABELS[property.purpose] || property.purpose;
  const priceSuffix = PRICE_SUFFIX[property.purpose] || "";
  const propertyId = property.property_ref || property.id.slice(0, 8).toUpperCase();

  return (
    <Link href={`/properties/${property.id}`}>
      <div className="group overflow-hidden rounded-2xl border border-border bg-background dark:bg-card transition-all duration-300 hover:bg-background/90 dark:hover:bg-card/90 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted dark:bg-muted/50">
          {imgSrc ? (
            <Image
              src={imgSrc}
              alt={property.title}
              fill
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Package className="h-12 w-12 text-muted-foreground/60" />
            </div>
          )}
          <div className="absolute left-3 top-3 rounded-full bg-background/90 dark:bg-card/90 px-2.5 py-0.5 text-[12px] font-bold text-foreground backdrop-blur-sm">
            {rentalLabel}
          </div>
          <div className="absolute right-3 top-3 rounded-full bg-primary/90 px-2.5 py-0.5 text-[11px] font-bold text-white backdrop-blur-sm flex items-center gap-1">
            <Tag className="h-3 w-3" />
            {propertyId}
          </div>
        </div>
        <div className="p-3 sm:p-4">
          <h3 className="line-clamp-2 text-[15px] font-bold leading-snug text-foreground">
            {property.title}
          </h3>
          <p className="mt-1 text-[15px] font-bold text-blue-600 dark:text-blue-400">
            SAR {property.price.toLocaleString()}<span className="text-[12px] font-medium text-muted-foreground">{priceSuffix}</span>
          </p>
          <div className="mt-2 flex items-center gap-3 text-[13px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> {property.city}{property.district ? `, ${property.district}` : ""}
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

          {property.address && (
            <p className="mt-1.5 text-[12px] text-muted-foreground truncate">
              {property.address}
            </p>
          )}

          {showAmenitiesAndBuildingFeatures && property.amenities && property.amenities.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              <span className="sr-only">Amenities:</span>
              {property.amenities.slice(0, 4).map((item) => (
                <span key={item} className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  {item.replace(/_/g, " ")}
                </span>
              ))}
              {property.amenities.length > 4 && (
                <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  +{property.amenities.length - 4}
                </span>
              )}
            </div>
          )}

          {showAmenitiesAndBuildingFeatures && property.building_features && property.building_features.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              <span className="w-full text-[11px] font-semibold text-muted-foreground mb-0.5">Building:</span>
              {property.building_features.slice(0, 4).map((item) => (
                <span key={item} className="rounded-full bg-secondary/80 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  {item.replace(/_/g, " ")}
                </span>
              ))}
              {property.building_features.length > 4 && (
                <span className="rounded-full bg-secondary/80 px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                  +{property.building_features.length - 4}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
