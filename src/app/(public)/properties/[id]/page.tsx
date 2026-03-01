import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Building2, MapPin, Tag, Banknote } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatPhone, formatSAR } from "@/lib/format";
import { KITCHEN_FEATURES, UTILITIES_AND_SERVICES } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { PropertyGallery } from "@/components/property/property-gallery";
import { VisitScheduler } from "@/components/visit/visit-scheduler";
import { AvailabilityCalendar } from "@/components/property/availability-calendar";

type PropertyDetail = {
  id: string;
  title: string;
  description: string;
  city: string;
  district: string | null;
  address: string | null;
  type: string;
  purpose: string;
  status: string;
  price: number;
  bedrooms: number | null;
  bathrooms: number | null;
  kitchens: number | null;
  living_rooms: number | null;
  drawing_rooms: number | null;
  dining_areas: number | null;
  area_sqm: number | null;
  year_built: number | null;
  amenities: string[];
  building_features: string[];
  images: string[];
  property_ref: string | null;
  location_url: string | null;
  office_fee: string | null;
  broker_fee: string | null;
  water_bill_included: string | null;
  security_deposit: string | null;
  payment_methods_accepted: string | null;
  rental_period: string | null;
  apartment_features: string[];
  nearby_places: string[];
  blocked_dates: string[];
  cover_image_index: number;
  created_at: string;
  agents: {
    company_name: string | null;
    profiles: {
      full_name: string;
      phone: string | null;
    } | null;
  } | null;
};

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  rented: { label: "Rented", className: "bg-blue-100 text-blue-800 border-blue-300" },
  reserved: { label: "Reserved", className: "bg-orange-100 text-orange-800 border-orange-300" },
};

const PRICE_SUFFIX: Record<string, string> = {
  short_term: "/night",
  long_term: "/yr",
  contract: "/yr",
};

async function getProperty(id: string) {
  const supabase = await createClient();

  const { data } = (await supabase
    .from("properties")
    .select(
      `
      id, title, description, city, district, address, type, purpose, status,
      price, bedrooms, bathrooms, kitchens, living_rooms, drawing_rooms, dining_areas,
      area_sqm, year_built, amenities, building_features, images,
      property_ref, location_url, office_fee, broker_fee, water_bill_included,
      security_deposit, payment_methods_accepted, rental_period,
      apartment_features, nearby_places,
      blocked_dates, cover_image_index, created_at,
      agents:agent_id (
        company_name,
        profiles:profile_id (full_name, phone)
      )
    `
    )
    .eq("id", id)
    .in("status", ["available", "rented", "reserved"])
    .single()) as { data: PropertyDetail | null };

  return data;
}

type PageProps = {
  params: { id: string };
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const property = await getProperty(params.id);

  if (!property) {
    return {
      title: "Property not found",
    };
  }

  return {
    title: `${property.title} | Properties`,
    description: property.description.slice(0, 140),
    openGraph: {
      images: property.images?.[0] ? [property.images[0]] : undefined,
    },
  };
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const property = await getProperty(params.id);

  if (!property) {
    notFound();
  }

  const agentName = property.agents?.profiles?.full_name || "Verified Agent";
  const maskedPhone = property.agents?.profiles?.phone
    ? formatPhone(property.agents.profiles.phone)
    : "Not provided";

  let priceSuffix = PRICE_SUFFIX[property.purpose] || "";
  if (property.rental_period) {
    const period = property.rental_period.toLowerCase();
    if (period === "daily") priceSuffix = "/night";
    else if (period === "weekly") priceSuffix = "/week";
    else if (period === "monthly") priceSuffix = "/mo";
    else if (period === "yearly") priceSuffix = "/yr";
    else priceSuffix = `/${period}`;
  }

  const propertyId = property.property_ref || property.id.slice(0, 8).toUpperCase();
  const isAvailable = property.status === "available";
  const statusBadge = STATUS_BADGE[property.status];

  const roomCounts = [
    { label: "Bedroom", value: property.bedrooms },
    { label: "Bathroom", value: property.bathrooms },
    { label: "Kitchen", value: property.kitchens },
    { label: "Living Room", value: property.living_rooms },
    { label: "Dining Area", value: property.dining_areas },
    { label: "Drawing Room", value: property.drawing_rooms },
  ].filter((entry): entry is { label: string; value: number } => entry.value != null);

  const kitchenFeaturesSet = new Set<string>(KITCHEN_FEATURES as unknown as string[]);
  const utilitiesSet = new Set<string>(UTILITIES_AND_SERVICES as unknown as string[]);
  const kitchenFeatures = (property.amenities || []).filter((a) => kitchenFeaturesSet.has(a));
  const utilitiesFeatures = (property.amenities || []).filter((a) => utilitiesSet.has(a));
  const otherAmenities = (property.amenities || []).filter((a) => !kitchenFeaturesSet.has(a) && !utilitiesSet.has(a));

  return (
    <div className="container mx-auto space-y-6 px-4 py-6 sm:py-8 max-w-7xl">
      <div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <h1 className="text-[22px] font-extrabold text-[#0f1419] sm:text-[28px] leading-tight">{property.title}</h1>
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[12px] font-bold text-primary whitespace-nowrap">
            <Tag className="h-3 w-3" />
            {propertyId}
          </span>
          {statusBadge && (
            <Badge className={`capitalize border ${statusBadge.className}`}>
              {statusBadge.label}
            </Badge>
          )}
        </div>
        <p className="mt-1.5 inline-flex items-center gap-1.5 text-[14px] text-[#536471]">
          <MapPin className="h-4 w-4 shrink-0" />
          <span>{property.city}{property.district ? `, ${property.district}` : ""}{property.address ? ` — ${property.address}` : ""}</span>
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-5">
          <PropertyGallery images={property.images || []} title={property.title} coverImageIndex={property.cover_image_index} />

          <div className="rounded-2xl border border-[#eff3f4] p-5 sm:p-6">
            <h2 className="text-[16px] font-bold text-[#0f1419]">Property details</h2>
            <div className="mt-3 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-[#cfd9de] px-3 py-1 text-[13px] font-medium capitalize text-[#0f1419]">{property.type}</span>
                <span className="rounded-full border border-[#cfd9de] px-3 py-1 text-[13px] font-medium text-[#0f1419]">
                  {property.purpose === "short_term" ? "Short-term" : property.purpose === "long_term" ? "Long-term" : property.purpose === "contract" ? "Contract" : property.purpose}
                </span>
                <span className="rounded-full bg-[#1d9bf0] px-3 py-1 text-[13px] font-bold text-white">
                  {formatSAR(property.price)}{priceSuffix}
                </span>
              </div>

              <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-[#536471]">
                {property.description}
              </p>

              <hr className="border-[#eff3f4]" />

              <p className="text-[14px]"><span className="font-bold text-[#0f1419]">Property ID:</span> <span className="text-[#536471]">{propertyId}</span></p>

              {(roomCounts.length > 0 || property.area_sqm != null || property.year_built != null) && (
                <>
                  <hr className="border-[#eff3f4]" />
                  <div>
                    <p className="mb-2 font-bold text-[#0f1419]">Basic Features</p>
                    <div className="grid gap-3 text-[14px] sm:grid-cols-2">
                      {roomCounts.map(({ label, value }) => (
                        <p key={label}><span className="font-bold text-[#0f1419]">{label}:</span> <span className="text-[#536471]">{value}</span></p>
                      ))}
                      {property.area_sqm != null && <p><span className="font-bold text-[#0f1419]">Area:</span> <span className="text-[#536471]">{property.area_sqm} sqm</span></p>}
                      {property.year_built != null && <p><span className="font-bold text-[#0f1419]">Year Built:</span> <span className="text-[#536471]">{property.year_built}</span></p>}
                    </div>
                  </div>
                </>
              )}

              {kitchenFeatures.length > 0 && (
                <>
                  <hr className="border-[#eff3f4]" />
                  <div>
                    <p className="mb-2 font-bold text-[#0f1419]">Kitchen Features</p>
                    <div className="flex flex-wrap gap-2">
                      {kitchenFeatures.map((item) => (
                        <span key={item} className="rounded-full bg-[#eff3f4] px-3 py-1 text-[13px] font-medium text-[#536471]">{item}</span>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {(property.apartment_features?.length ?? 0) > 0 && (
                <>
                  <hr className="border-[#eff3f4]" />
                  <div>
                    <p className="mb-2 font-bold text-[#0f1419]">Apartment Features</p>
                    <div className="flex flex-wrap gap-2">
                      {property.apartment_features.map((item) => (
                        <span key={item} className="rounded-full bg-[#eff3f4] px-3 py-1 text-[13px] font-medium capitalize text-[#536471]">{item.replace(/_/g, " ")}</span>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {(((property.building_features || []).length > 0) || otherAmenities.length > 0) && (
                <>
                  <hr className="border-[#eff3f4]" />
                  <div>
                    <p className="mb-2 font-bold text-[#0f1419]">Building Features</p>
                    <div className="flex flex-wrap gap-2">
                      {[...(property.building_features || []), ...otherAmenities].map((item) => (
                        <span key={item} className="rounded-full bg-[#eff3f4] px-3 py-1 text-[13px] font-medium capitalize text-[#536471]">{item.replace(/_/g, " ")}</span>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {utilitiesFeatures.length > 0 && (
                <>
                  <hr className="border-[#eff3f4]" />
                  <div>
                    <p className="mb-2 font-bold text-[#0f1419]">Utilities & Services</p>
                    <div className="flex flex-wrap gap-2">
                      {utilitiesFeatures.map((item) => (
                        <span key={item} className="rounded-full bg-[#eff3f4] px-3 py-1 text-[13px] font-medium text-[#536471]">{item}</span>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {(property.nearby_places?.length ?? 0) > 0 && (
                <>
                  <hr className="border-[#eff3f4]" />
                  <div>
                    <p className="mb-2 font-bold text-[#0f1419]">Surroundings & Location Benefits</p>
                    <div className="flex flex-wrap gap-2">
                      {property.nearby_places.map((item) => (
                        <span key={item} className="rounded-full bg-[#eff3f4] px-3 py-1 text-[13px] font-medium capitalize text-[#536471]">{item.replace(/_/g, " ")}</span>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {(property.payment_methods_accepted || property.office_fee || property.broker_fee || property.security_deposit || property.rental_period) && (
                <>
                  <hr className="border-[#eff3f4]" />
                  <div>
                    <p className="mb-2 font-bold text-[#0f1419] flex items-center gap-1.5">
                      <Banknote className="h-4 w-4 text-[#1d9bf0]" /> Fees & Costs
                    </p>
                    <div className="grid gap-2 text-[14px] sm:grid-cols-2">
                      {property.rental_period && (
                        <p className="sm:col-span-2"><span className="font-medium text-[#0f1419]">Rental period:</span> <span className="text-[#536471]">{property.rental_period}</span></p>
                      )}
                      {property.payment_methods_accepted && (
                        <p className="sm:col-span-2"><span className="font-medium text-[#0f1419]">Payment methods accepted:</span> <span className="text-[#536471]">{property.payment_methods_accepted}</span></p>
                      )}
                      {property.office_fee && (
                        <p><span className="font-medium text-[#0f1419]">Office Fee:</span> <span className="text-[#536471]">SAR {property.office_fee}</span></p>
                      )}
                      {property.broker_fee && (
                        <p><span className="font-medium text-[#0f1419]">Service Fee:</span> <span className="text-[#536471]">SAR {property.broker_fee}</span></p>
                      )}
                      {property.security_deposit && (
                        <p><span className="font-medium text-[#0f1419]">Security Deposit:</span> <span className="text-[#536471]">SAR {property.security_deposit}</span></p>
                      )}
                    </div>
                  </div>
                </>
              )}

              {property.location_url && (
                <>
                  <hr className="border-[#eff3f4]" />
                  <a
                    href={property.location_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#0f1419] px-5 py-2.5 text-[14px] font-semibold text-white transition-all hover:bg-[#0f1419]/85 active:scale-[0.98]"
                  >
                    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    View on Google Maps
                  </a>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl border border-[#eff3f4] p-5">
            <h2 className="text-[15px] font-bold text-[#0f1419]">Agent</h2>
            <div className="mt-3 space-y-1.5 text-[14px]">
              <p className="inline-flex items-center gap-2 font-bold text-[#0f1419]">
                <Building2 className="h-4 w-4 text-[#1d9bf0]" />
                {agentName}
              </p>
              {property.agents?.company_name && (
                <p className="text-[#536471]">Company: {property.agents.company_name}</p>
              )}
              {property.agents?.profiles?.phone && (
                <p className="text-[#536471]">Phone: {maskedPhone}</p>
              )}
            </div>
          </div>

          {isAvailable ? (
            <>
              <div id="visit-scheduler">
                <VisitScheduler propertyId={property.id} propertyTitle={property.title} />
              </div>
              <AvailabilityCalendar blockedDates={property.blocked_dates || []} />
            </>
          ) : (
            <div className="rounded-2xl border border-[#eff3f4] p-5 text-center">
              <p className="text-[15px] font-bold text-[#0f1419]">This property is currently {property.status}</p>
              <p className="mt-1 text-[13px] text-[#536471]">Visit scheduling is not available for {property.status} properties.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
