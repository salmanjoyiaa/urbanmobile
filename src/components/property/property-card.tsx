import Link from "next/link";
import Image from "next/image";
import { MapPin, BedDouble, Maximize, Package, Tag, Bath, UtensilsCrossed } from "lucide-react";

type Property = {
  id: string;
  title: string;
  city: string;
  district?: string | null;
  price: number;
  type: string;
  purpose: string;
  status?: string;
  bedrooms: number | null;
  bathrooms?: number | null;
  kitchens?: number | null;
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
  rental_period?: string | null;
  installments?: string | null;
};

const RENTAL_LABELS: Record<string, string> = {
  short_term: "Short-term",
  mid_term: "Mid-term",
  long_term: "Long-term",
};

const PERIOD_SUFFIX: Record<string, string> = {
  "daily/night": "/night",
  "weekly": "/week",
  "monthly": "/mo",
  "3 months": "/3 months",
  "6 months": "/6 months",
  "yearly": "/yr",
};

const PURPOSE_DEFAULT_SUFFIX: Record<string, string> = {
  short_term: "/night",
  mid_term: "/mo",
  long_term: "/yr",
};

export function PropertyCard({
  property,
  showAmenitiesAndBuildingFeatures = false,
  optimizeImage = true,
}: {
  property: Property;
  showAmenitiesAndBuildingFeatures?: boolean;
  optimizeImage?: boolean;
}) {
  const coverIdx = property.cover_image_index ?? 0;
  const imgSrc = property.images?.[coverIdx] || property.images?.[0] || null;
  const rentalLabel = RENTAL_LABELS[property.purpose] || property.purpose;

  const priceSuffix = property.rental_period
    ? (PERIOD_SUFFIX[property.rental_period.toLowerCase()] || `/${property.rental_period.toLowerCase()}`)
    : (PURPOSE_DEFAULT_SUFFIX[property.purpose] || "");

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
              sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 360px"
              unoptimized={!optimizeImage}
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Package className="h-12 w-12 text-muted-foreground/60" />
            </div>
          )}
          {property.status === "rented" && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden>
              <Image
                src="/images/rented-stamp.png.png"
                alt="Rented"
                width={140}
                height={140}
                className="opacity-90 -rotate-12 drop-shadow-lg"
              />
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
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <p className="text-[15px] font-bold text-blue-600 dark:text-blue-400">
              SAR {property.price.toLocaleString()}<span className="text-[12px] font-medium text-muted-foreground">{priceSuffix}</span>
            </p>
            {property.installments && (
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[12px] font-medium text-primary">
                Installments: {property.installments}
              </span>
            )}
          </div>
          <div className="mt-2 flex items-center gap-3 text-[13px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" /> {property.city}{property.district ? `, ${property.district}` : ""}
            </span>
            {property.bedrooms != null && (
              <span className="flex items-center gap-1">
                <BedDouble className="h-3.5 w-3.5" /> {property.bedrooms}
              </span>
            )}
            {property.bathrooms != null && (
              <span className="flex items-center gap-1">
                <Bath className="h-3.5 w-3.5" /> {property.bathrooms}
              </span>
            )}
            {property.kitchens != null && (
              <span className="flex items-center gap-1">
                <UtensilsCrossed className="h-3.5 w-3.5" /> {property.kitchens}
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
