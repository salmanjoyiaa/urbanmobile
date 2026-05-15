import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getPublicShareBaseUrl } from "@/config/site";
import { formatDate, formatPhoneFull, formatSAR } from "@/lib/format";
import { PropertyGallery } from "@/components/property/property-gallery";
import { ProductContactActions } from "@/components/product/product-contact-actions";

type ProductDetail = {
  id: string;
  title: string;
  description: string;
  category: string;
  condition: string;
  city: string;
  district: string | null;
  price: number;
  images: string[];
  created_at: string;
  agents: {
    profiles: {
      full_name: string;
      phone: string | null;
    } | null;
  } | null;
};

function absoluteShareUrl(base: string, src: string | undefined): string | undefined {
  if (!src?.trim()) return undefined;
  const s = src.trim();
  if (/^https?:\/\//i.test(s)) return s;
  try {
    return new URL(s.startsWith("/") ? s : `/${s}`, base).href;
  } catch {
    return undefined;
  }
}

async function getProduct(
  supabase: Awaited<ReturnType<typeof createClient>>,
  id: string
) {
  const { data } = (await supabase
    .from("products")
    .select(
      `
      id, title, description, category, condition, city, district, price, images, created_at,
      agents:agent_id (
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
  const supabase = await createClient();
  const product = await getProduct(supabase, params.id);

  if (!product) {
    return { title: "Product not found" };
  }

  const base = getPublicShareBaseUrl();
  const canonicalUrl = `${base}/products/${params.id}`;
  const desc = product.description.slice(0, 200);
  const ogImage = absoluteShareUrl(base, product.images?.[0]);

  return {
    metadataBase: new URL(base),
    title: `${product.title} | Products`,
    description: desc,
    openGraph: {
      type: "website",
      url: canonicalUrl,
      title: product.title,
      description: desc,
      images: ogImage
        ? [
            {
              url: ogImage,
              alt: product.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: product.title,
      description: desc,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const supabase = await createClient();
  const product = await getProduct(supabase, params.id);

  if (!product) {
    notFound();
  }

  const agentName = product.agents?.profiles?.full_name || "Verified Agent";
  const sellerPhoneDisplay = product.agents?.profiles?.phone
    ? formatPhoneFull(product.agents.profiles.phone)
    : "Not provided";

  const locationLine = [product.city, product.district?.trim()].filter(Boolean).join(", ");

  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      <div>
        <h1 className="text-[24px] font-extrabold text-[#0f1419] sm:text-[28px]">{product.title}</h1>
        <p className="mt-1 inline-flex items-center gap-1 text-[15px] text-[#536471]">
          <MapPin className="h-4 w-4" />
          {locationLine}
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
                <p>
                  <span className="font-bold text-[#0f1419]">City:</span>{" "}
                  <span className="text-[#536471]">{product.city}</span>
                </p>
                {product.district?.trim() ? (
                  <p>
                    <span className="font-bold text-[#0f1419]">District:</span>{" "}
                    <span className="text-[#536471]">{product.district.trim()}</span>
                  </p>
                ) : null}
                <p>
                  <span className="font-bold text-[#0f1419]">Listed:</span>{" "}
                  <span className="text-[#536471]">{formatDate(product.created_at)}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-[#eff3f4] p-6">
            <h2 className="text-[17px] font-bold text-[#0f1419]">Seller</h2>
            <div className="mt-4 space-y-2 text-[14px]">
              <p className="font-bold text-[#0f1419]">{agentName}</p>
              <p className="text-[#536471]">Phone: {sellerPhoneDisplay}</p>
            </div>
          </div>

          <ProductContactActions
            productId={product.id}
            sellerPhone={product.agents?.profiles?.phone ?? null}
          />
        </div>
      </div>
    </div>
  );
}
