import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Building2, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatPhone, formatSAR } from "@/lib/format";
import { PropertyGallery } from "@/components/property/property-gallery";
import { VisitScheduler } from "@/components/visit/visit-scheduler";

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
  created_at: string;
  agents: {
    company_name: string | null;
    profiles: {
      full_name: string;
      phone: string | null;
    } | null;
  } | null;
};

async function getProperty(id: string) {
  const supabase = await createClient();

  const { data } = (await supabase
    .from("properties")
    .select(
      `
      id, title, description, city, district, address, type, purpose,
      price, bedrooms, bathrooms, area_sqm, year_built, amenities, images, created_at,
      agents:agent_id (
        company_name,
        profiles:profile_id (full_name, phone)
      )
    `
    )
    .eq("id", id)
    .eq("status", "active")
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

  return (
    <div className="container mx-auto space-y-8 px-4 py-8">
      <div>
        <h1 className="text-3xl font-bold text-navy">{property.title}</h1>
        <p className="mt-2 inline-flex items-center gap-1 text-muted-foreground">
          <MapPin className="h-4 w-4" />
          {property.city}
          {property.district ? `, ${property.district}` : ""}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <PropertyGallery images={property.images || []} title={property.title} />

          <Card>
            <CardHeader>
              <CardTitle>Property details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="capitalize">{property.type}</Badge>
                <Badge variant="outline" className="capitalize">{property.purpose}</Badge>
                <Badge>{formatSAR(property.price)}</Badge>
              </div>

              <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                {property.description}
              </p>

              <Separator />

              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <p><span className="font-medium">Bedrooms:</span> {property.bedrooms ?? "—"}</p>
                <p><span className="font-medium">Bathrooms:</span> {property.bathrooms ?? "—"}</p>
                <p><span className="font-medium">Area:</span> {property.area_sqm ? `${property.area_sqm} m²` : "—"}</p>
                <p><span className="font-medium">Year built:</span> {property.year_built ?? "—"}</p>
                <p><span className="font-medium">Address:</span> {property.address || "—"}</p>
                <p><span className="font-medium">Listed:</span> {formatDate(property.created_at)}</p>
              </div>

              {property.amenities?.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="mb-2 font-medium">Amenities</p>
                    <div className="flex flex-wrap gap-2">
                      {property.amenities.map((item) => (
                        <Badge key={item} variant="secondary">{item}</Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Agent</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="inline-flex items-center gap-2 font-medium">
                <Building2 className="h-4 w-4" />
                {agentName}
              </p>
              <p className="text-muted-foreground">Company: {property.agents?.company_name || "—"}</p>
              <p className="text-muted-foreground">Phone: {maskedPhone}</p>
            </CardContent>
          </Card>

          <div id="visit-scheduler">
            <VisitScheduler propertyId={property.id} propertyTitle={property.title} />
          </div>
        </div>
      </div>
    </div>
  );
}
