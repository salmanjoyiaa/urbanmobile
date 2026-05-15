"use client";

import { useRef, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import Link from "next/link";
import { ProductCard } from "@/components/product/product-card";

type Product = {
  id: string;
  title: string;
  price: number;
  category: string;
  condition: string;
  images: string[] | null;
};

export function ProductSlider({ products }: { products: Product[] }) {
  const [current, setCurrent] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const total = products.length;

  const scrollToIndex = useCallback((idx: number) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.children[idx] as HTMLElement;
    if (card) track.scrollTo({ left: card.offsetLeft, behavior: "smooth" });
    setCurrent(idx);
  }, []);

  const next = useCallback(() => scrollToIndex((current + 1) % total), [current, total, scrollToIndex]);
  const prev = useCallback(() => scrollToIndex((current - 1 + total) % total), [current, total, scrollToIndex]);

  const syncCurrentFromScroll = useCallback(() => {
    const track = trackRef.current;
    if (!track || total === 0) return;
    const scrollLeft = track.scrollLeft;
    const trackCenter = scrollLeft + track.clientWidth / 2;
    let nearest = 0;
    let nearestDist = Infinity;
    for (let i = 0; i < track.children.length; i++) {
      const el = track.children[i] as HTMLElement;
      const center = el.offsetLeft + el.offsetWidth / 2;
      const dist = Math.abs(center - trackCenter);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = i;
      }
    }
    setCurrent((prev) => (prev !== nearest ? nearest : prev));
  }, [total]);

  if (!total) return null;

  return (
    <section className="py-16 lg:py-20 bg-secondary/30 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display text-3xl font-bold text-foreground mb-1">
              Products &amp; Household Items
            </h2>
            <p className="text-muted-foreground text-sm">
              Quality used items from trusted agents
            </p>
          </div>
          <Link
            href="/products"
            className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            View All
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Track */}
        <div className="relative">
          <div
            ref={trackRef}
            className="flex touch-pan-x gap-5 overflow-x-auto overflow-y-hidden scrollbar-hide overscroll-x-contain"
            style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
            onScroll={syncCurrentFromScroll}
          >
            {products.map((product) => (
              <div
                key={product.id}
                className="flex-none w-[85%] sm:w-[45%] lg:w-[calc(33.333%-14px)]"
                style={{ scrollSnapAlign: "start" }}
              >
                <ProductCard product={product} optimizeImage={false} />
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={prev}
            aria-label="Previous product"
            className="absolute left-1 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 shadow-lg transition-all hover:bg-white hover:scale-105 active:scale-95 sm:h-10 sm:w-10 md:-left-4"
          >
            <ChevronLeft className="h-5 w-5 text-gray-800" />
          </button>

          <button
            type="button"
            onClick={next}
            aria-label="Next product"
            className="absolute right-1 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 shadow-lg transition-all hover:bg-white hover:scale-105 active:scale-95 sm:h-10 sm:w-10 md:-right-4"
          >
            <ChevronRight className="h-5 w-5 text-gray-800" />
          </button>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {products.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => scrollToIndex(i)}
              aria-label={`Go to product ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current ? "w-6 bg-primary" : "w-2 bg-primary/20 hover:bg-primary/40"
              }`}
            />
          ))}
        </div>

        {/* Mobile view all */}
        <div className="sm:hidden mt-8 text-center">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            View All Products
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
