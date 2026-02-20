import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ImageSlider, type SlideItem } from "./image-slider";

function formatPrice(price: number): string {
  if (price >= 1_000_000) return `SAR ${(price / 1_000_000).toFixed(1)}M`;
  if (price >= 1_000) return `SAR ${(price / 1_000).toFixed(0)}K`;
  return `SAR ${price}`;
}

export async function FeaturedSliders() {
  const supabase = await createClient();

  // Fetch 5 random active properties with images
  const { data: properties } = (await supabase
    .from("properties")
    .select("id, title, images, price, city, purpose")
    .eq("status", "active")
    .not("images", "eq", "{}")
    .order("created_at", { ascending: false })
    .limit(10)) as {
    data: Array<{
      id: string;
      title: string;
      images: string[];
      price: number;
      city: string;
      purpose: string;
    }> | null;
  };

  // Fetch 5 random available products with images
  const { data: products } = (await supabase
    .from("products")
    .select("id, title, images, price, city, condition")
    .eq("is_available", true)
    .not("images", "eq", "{}")
    .order("created_at", { ascending: false })
    .limit(10)) as {
    data: Array<{
      id: string;
      title: string;
      images: string[];
      price: number;
      city: string;
      condition: string;
    }> | null;
  };

  // Shuffle and take 5
  const shuffled = <T,>(arr: T[]): T[] => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  const propertySlides: SlideItem[] = shuffled(properties || [])
    .slice(0, 5)
    .filter((p) => p.images && p.images.length > 0)
    .map((p) => ({
      id: p.id,
      title: p.title,
      image: p.images[0],
      href: `/properties/${p.id}`,
      badge: p.purpose === "rent" ? "For Rent" : "For Sale",
      price: formatPrice(p.price),
    }));

  const productSlides: SlideItem[] = shuffled(products || [])
    .slice(0, 5)
    .filter((p) => p.images && p.images.length > 0)
    .map((p) => ({
      id: p.id,
      title: p.title,
      image: p.images[0],
      href: `/products/${p.id}`,
      badge: p.condition,
      price: formatPrice(p.price),
    }));

  if (propertySlides.length === 0 && productSlides.length === 0) return null;

  return (
    <section className="bg-[#0f1419] py-16 sm:py-20">
      <div className="container mx-auto px-6">
        {/* Properties Slider */}
        {propertySlides.length > 0 && (
          <div>
            <div className="mb-8 flex items-end justify-between">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-widest text-[#1d9bf0]">
                  Curated Selection
                </p>
                <h2 className="mt-1 text-[28px] font-extrabold tracking-tight text-white sm:text-[36px]">
                  Featured Properties
                </h2>
              </div>
              <Link
                href="/properties"
                className="group hidden items-center gap-1 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-[13px] font-bold text-white backdrop-blur-sm transition-all hover:border-[#1d9bf0]/50 hover:bg-[#1d9bf0]/10 hover:text-[#1d9bf0] sm:inline-flex"
              >
                View All
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
            <ImageSlider items={propertySlides} />
            <Link
              href="/properties"
              className="mt-6 flex items-center justify-center gap-1 text-[13px] font-bold text-[#1d9bf0] sm:hidden"
            >
              View All Properties
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}

        {/* Products Slider */}
        {productSlides.length > 0 && (
          <div className={propertySlides.length > 0 ? "mt-20" : ""}>
            <div className="mb-8 flex items-end justify-between">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-widest text-[#1d9bf0]">
                  Marketplace
                </p>
                <h2 className="mt-1 text-[28px] font-extrabold tracking-tight text-white sm:text-[36px]">
                  Featured Products
                </h2>
              </div>
              <Link
                href="/products"
                className="group hidden items-center gap-1 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-[13px] font-bold text-white backdrop-blur-sm transition-all hover:border-[#1d9bf0]/50 hover:bg-[#1d9bf0]/10 hover:text-[#1d9bf0] sm:inline-flex"
              >
                View All
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
            <ImageSlider items={productSlides} />
            <Link
              href="/products"
              className="mt-6 flex items-center justify-center gap-1 text-[13px] font-bold text-[#1d9bf0] sm:hidden"
            >
              View All Products
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
