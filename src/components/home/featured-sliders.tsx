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

  // Fetch 5 random available properties with images
  const { data: properties } = (await supabase
    .from("properties")
    .select("id, title, images, price, city, purpose")
    .eq("status", "available")
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
      badge: p.purpose === "short_term" ? "Short-term" : p.purpose === "long_term" ? "Long-term" : p.purpose === "contract" ? "Contract" : "Rental",
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
    <div className="w-full">
      {/* Properties Slider */}
      {propertySlides.length > 0 && (
        <div>
          <div className="mb-8 flex items-end justify-between">
            <div className="text-center sm:text-left mx-auto sm:mx-0">
              <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-primary mb-2">
                Affordable Rentals
              </p>
              <h2 className="text-[32px] font-extrabold tracking-tight text-foreground sm:text-[40px] leading-[1.1]">
                Featured Rentals
              </h2>
            </div>
            <Link
              href="/properties"
              className="group hidden items-center gap-1 rounded-2xl border-2 border-border bg-transparent px-6 py-2.5 text-[14px] font-bold text-foreground transition-all hover:border-foreground hover:bg-primary hover:text-primary-foreground sm:inline-flex"
            >
              View All
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <ImageSlider items={propertySlides} />
          <Link
            href="/properties"
            className="mt-6 flex items-center justify-center gap-1 text-[13px] font-bold text-accent hover:text-primary sm:hidden transition-colors"
          >
            View All Properties
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {/* Products Slider */}
      {productSlides.length > 0 && (
        <div className={propertySlides.length > 0 ? "mt-24" : ""}>
          <div className="mb-8 flex items-end justify-between">
            <div className="text-center sm:text-left mx-auto sm:mx-0">
              <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-primary mb-2">
                Affordable Essentials
              </p>
              <h2 className="text-[32px] font-extrabold tracking-tight text-foreground sm:text-[40px] leading-[1.1]">
                Featured Products
              </h2>
            </div>
            <Link
              href="/products"
              className="group hidden items-center gap-1 rounded-2xl border-2 border-border bg-transparent px-6 py-2.5 text-[14px] font-bold text-foreground transition-all hover:border-foreground hover:bg-primary hover:text-primary-foreground sm:inline-flex"
            >
              View All
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <ImageSlider items={productSlides} />
          <Link
            href="/products"
            className="mt-6 flex items-center justify-center gap-1 text-[13px] font-bold text-accent hover:text-primary sm:hidden transition-colors"
          >
            View All Products
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
