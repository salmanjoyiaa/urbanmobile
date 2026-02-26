import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Building2, MapPin, ExternalLink, Tag, Banknote } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatPhone, formatSAR } from "@/lib/format";
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
  price: number;
  bedrooms: number | null;
  bathrooms: number | null;
  area_sqm: number | null;
  year_built: number | null;
  amenities: string[];
  images: string[];
  property_ref: string | null;
  location_url: string | null;
  office_fee: string | null;
  broker_fee: string | null;
  water_bill_included: string | null;
  security_deposit: string | null;
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
      id, title, description, city, district, address, type, purpose,
      price, bedrooms, bathrooms, area_sqm, year_built, amenities, images,
      property_ref, location_url, office_fee, broker_fee, water_bill_included,
      security_deposit, blocked_dates, cover_image_index, created_at,
      agents:agent_id (
        company_name,
        profiles:profile_id (full_name, phone)
      )
    `
    )
    .eq("id", id)
    .eq("status", "available")
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
  const priceSuffix = PRICE_SUFFIX[property.purpose] || "";
  const propertyId = property.property_ref || property.id.slice(0, 8).toUpperCase();

  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-[24px] font-extrabold text-[#0f1419] sm:text-[28px]">{property.title}</h1>
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-[13px] font-bold text-primary">
            <Tag className="h-3.5 w-3.5" />
            {propertyId}
          </span>
        </div>
        <p className="mt-1 inline-flex items-center gap-1 text-[15px] text-[#536471]">
          <MapPin className="h-4 w-4" />
          {property.city}
          {property.district ? `, ${property.district}` : ""}
          {property.address ? ` — ${property.address}` : ""}
        </p>
        {property.location_url && (
          <a
            href={property.location_url}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-flex items-center gap-1 text-[13px] text-primary hover:underline ml-3"
          >
            <ExternalLink className="h-3.5 w-3.5" /> View on Google Maps
          </a>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <PropertyGallery images={property.images || []} title={property.title} />

          <div className="rounded-2xl border border-[#eff3f4] p-6">
            <h2 className="text-[17px] font-bold text-[#0f1419]">Property details</h2>
            <div className="mt-4 space-y-4">
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

              <div className="grid gap-3 text-[14px] sm:grid-cols-2">
                <p><span className="font-bold text-[#0f1419]">Bedrooms:</span> <span className="text-[#536471]">{property.bedrooms ?? "—"}</span></p>
                <p><span className="font-bold text-[#0f1419]">Bathrooms:</span> <span className="text-[#536471]">{property.bathrooms ?? "—"}</span></p>
                <p><span className="font-bold text-[#0f1419]">Area:</span> <span className="text-[#536471]">{property.area_sqm ? `${property.area_sqm} m²` : "—"}</span></p>
                <p><span className="font-bold text-[#0f1419]">Year built:</span> <span className="text-[#536471]">{property.year_built ?? "—"}</span></p>
                <p><span className="font-bold text-[#0f1419]">Listed:</span> <span className="text-[#536471]">{formatDate(property.created_at)}</span></p>
              </div>

              {(property.office_fee || property.broker_fee || property.water_bill_included || property.security_deposit) && (
                <>
                  <hr className="border-[#eff3f4]" />
                  <div>
                    <p className="mb-2 font-bold text-[#0f1419] flex items-center gap-1.5">
                      <Banknote className="h-4 w-4 text-[#1d9bf0]" /> Fees & Costs
                    </p>
                    <div className="grid gap-2 text-[14px] sm:grid-cols-2">
                      {property.office_fee && (
                        <p><span className="font-medium text-[#0f1419]">Office Fee:</span> <span className="text-[#536471]">SAR {property.office_fee}</span></p>
                      )}
                      {property.broker_fee && (
                        <p><span className="font-medium text-[#0f1419]">Broker Fee:</span> <span className="text-[#536471]">SAR {property.broker_fee}</span></p>
                      )}
                      {property.water_bill_included && (
                        <p><span className="font-medium text-[#0f1419]">Water Bill Included:</span> <span className="text-[#536471]">{property.water_bill_included}</span></p>
                      )}
                      {property.security_deposit && (
                        <p><span className="font-medium text-[#0f1419]">Security Deposit:</span> <span className="text-[#536471]">SAR {property.security_deposit}</span></p>
                      )}
                    </div>
                  </div>
                </>
              )}

              {property.amenities?.length > 0 && (
                <>
                  <hr className="border-[#eff3f4]" />
                  <div>
                    <p className="mb-2 font-bold text-[#0f1419]">Amenities</p>
                    <div className="flex flex-wrap gap-2">
                      {property.amenities.map((item) => (
                        <span key={item} className="rounded-full bg-[#eff3f4] px-3 py-1 text-[13px] font-medium capitalize text-[#536471]">{item.replace(/_/g, " ")}</span>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-[#eff3f4] p-6">
            <h2 className="text-[17px] font-bold text-[#0f1419]">Agent</h2>
            <div className="mt-4 space-y-2 text-[14px]">
              <p className="inline-flex items-center gap-2 font-bold text-[#0f1419]">
                <Building2 className="h-4 w-4 text-[#1d9bf0]" />
                {agentName}
              </p>
              <p className="text-[#536471]">Company: {property.agents?.company_name || "—"}</p>
              <p className="text-[#536471]">Phone: {maskedPhone}</p>
            </div>
          </div>

          <div id="visit-scheduler">
            <VisitScheduler propertyId={property.id} propertyTitle={property.title} />
          </div>

          <AvailabilityCalendar blockedDates={property.blocked_dates || []} />
        </div>
      </div>
    </div>
  );
}
