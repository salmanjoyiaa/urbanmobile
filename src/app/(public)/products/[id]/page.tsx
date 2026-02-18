import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MapPin, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatPhone, formatSAR } from "@/lib/format";
import { BuyRequestForm } from "@/components/product/buy-request-form";

type ProductDetail = {
  id: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  city: string;
  price: number;
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

async function getProduct(id: string) {
  const supabase = await createClient();

  const { data } = (await supabase
    .from("products")
    .select(
      `
      id, title, description, category, condition, city, price, images, created_at,
      agents:agent_id (
        company_name,
        profiles:profile_id (full_name, phone)
      )
    `
    )
    .eq("id", id)
    .eq("is_available", true)
    .single()) as { data: ProductDetail | null };

  return data;
}

type PageProps = {
  params: { id: string };
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const product = await getProduct(params.id);

  if (!product) {
    return { title: "Product not found" };
  }

  return {
    title: `${product.title} | Products`,
    description: product.description.slice(0, 140),
    openGraph: {
      images: product.images?.[0] ? [product.images[0]] : undefined,
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const product = await getProduct(params.id);

  if (!product) {
    notFound();
  }

  const agentName = product.agents?.profiles?.full_name || "Verified Agent";
  const maskedPhone = product.agents?.profiles?.phone
    ? formatPhone(product.agents.profiles.phone)
    : "Not provided";

  return (
    <div className="container mx-auto space-y-8 px-4 py-8">
      <div>
        <h1 className="text-3xl font-bold text-navy">{product.title}</h1>
        <p className="mt-2 inline-flex items-center gap-1 text-muted-foreground">
          <MapPin className="h-4 w-4" />
          {product.city}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-lg border bg-muted">
            {product.images?.[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={product.images[0]} alt={product.title} className="aspect-[16/10] w-full object-cover" />
            ) : (
              <div className="flex aspect-[16/10] items-center justify-center text-muted-foreground">
                <Package className="h-6 w-6" />
              </div>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Product details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="capitalize">{product.category}</Badge>
                <Badge variant="outline" className="capitalize">{product.condition.replace("_", " ")}</Badge>
                <Badge>{formatSAR(product.price)}</Badge>
              </div>
              <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{product.description}</p>
              <div className="grid gap-3 text-sm sm:grid-cols-2">
                <p><span className="font-medium">City:</span> {product.city}</p>
                <p><span className="font-medium">Listed:</span> {formatDate(product.created_at)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Seller</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-medium">{agentName}</p>
              <p className="text-muted-foreground">Company: {product.agents?.company_name || "—"}</p>
              <p className="text-muted-foreground">Phone: {maskedPhone}</p>
            </CardContent>
          </Card>

          <BuyRequestForm productId={product.id} productTitle={product.title} />
        </div>
      </div>
    </div>
  );
}
