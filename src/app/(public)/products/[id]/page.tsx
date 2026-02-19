import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MapPin, Package } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatPhone, formatSAR } from "@/lib/format";
import { PropertyGallery } from "@/components/property/property-gallery";
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
    <div className="container mx-auto space-y-6 px-4 py-8">
      <div>
        <h1 className="text-[24px] font-extrabold text-[#0f1419] sm:text-[28px]">{product.title}</h1>
        <p className="mt-1 inline-flex items-center gap-1 text-[15px] text-[#536471]">
          <MapPin className="h-4 w-4" />
          {product.city}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <PropertyGallery images={product.images || []} title={product.title} />

          <div className="rounded-2xl border border-[#eff3f4] p-6">
            <h2 className="text-[17px] font-bold text-[#0f1419]">Product details</h2>
            <div className="mt-4 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-[#cfd9de] px-3 py-1 text-[13px] font-medium capitalize text-[#0f1419]">{product.category}</span>
                <span className="rounded-full border border-[#cfd9de] px-3 py-1 text-[13px] font-medium capitalize text-[#0f1419]">{product.condition.replace("_", " ")}</span>
                <span className="rounded-full bg-[#1d9bf0] px-3 py-1 text-[13px] font-bold text-white">{formatSAR(product.price)}</span>
              </div>
              <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-[#536471]">{product.description}</p>
              <hr className="border-[#eff3f4]" />
              <div className="grid gap-3 text-[14px] sm:grid-cols-2">
                <p><span className="font-bold text-[#0f1419]">City:</span> <span className="text-[#536471]">{product.city}</span></p>
                <p><span className="font-bold text-[#0f1419]">Listed:</span> <span className="text-[#536471]">{formatDate(product.created_at)}</span></p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-[#eff3f4] p-6">
            <h2 className="text-[17px] font-bold text-[#0f1419]">Seller</h2>
            <div className="mt-4 space-y-2 text-[14px]">
              <p className="font-bold text-[#0f1419]">{agentName}</p>
              <p className="text-[#536471]">Company: {product.agents?.company_name || "—"}</p>
              <p className="text-[#536471]">Phone: {maskedPhone}</p>
            </div>
          </div>

          <BuyRequestForm productId={product.id} productTitle={product.title} />
        </div>
      </div>
    </div>
  );
}
