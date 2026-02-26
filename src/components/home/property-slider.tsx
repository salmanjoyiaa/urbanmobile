"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import Link from "next/link";
import { PropertyCard } from "@/components/property/property-card";

type Property = {
  id: string;
  title: string;
  city: string;
  price: number;
  type: string;
  purpose: string;
  bedrooms: number | null;
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
};

const INTERVAL_MS = 4500;

export function PropertySlider({ properties }: { properties: Property[] }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const total = properties.length;

  const scrollToIndex = useCallback((idx: number) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.children[idx] as HTMLElement;
    if (card) {
      track.scrollTo({ left: card.offsetLeft, behavior: "smooth" });
    }
    setCurrent(idx);
  }, []);

  const next = useCallback(() => {
    scrollToIndex((current + 1) % total);
  }, [current, total, scrollToIndex]);

  const prev = useCallback(() => {
    scrollToIndex((current - 1 + total) % total);
  }, [current, total, scrollToIndex]);

  useEffect(() => {
    if (paused || total <= 1) return;
    const timer = setInterval(next, INTERVAL_MS);
    return () => clearInterval(timer);
  }, [next, paused, total]);

  if (!total) return null;

  return (
    <section className="py-16 lg:py-20 bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display text-3xl font-bold text-foreground mb-1">
              Available Properties
            </h2>
            <p className="text-muted-foreground text-sm">
              Explore verified rentals from our trusted agents
            </p>
          </div>
          <Link
            href="/properties"
            className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            View All
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Slider track */}
        <div
          className="relative"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div
            ref={trackRef}
            className="flex gap-5 overflow-x-auto overflow-y-hidden scrollbar-hide overscroll-x-contain"
            style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
            onScroll={() => {
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
            }}
          >
            {properties.map((property) => (
              <div
                key={property.id}
                className="flex-none w-[85%] sm:w-[45%] lg:w-[calc(33.333%-14px)]"
                style={{ scrollSnapAlign: "start" }}
              >
                <PropertyCard property={property} />
              </div>
            ))}
          </div>

          {/* Left arrow */}
          <button
            onClick={prev}
            aria-label="Previous property"
            className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/95 shadow-lg hidden md:flex items-center justify-center hover:bg-white transition-all hover:scale-105 active:scale-95"
          >
            <ChevronLeft className="h-5 w-5 text-gray-800" />
          </button>

          {/* Right arrow */}
          <button
            onClick={next}
            aria-label="Next property"
            className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/95 shadow-lg hidden md:flex items-center justify-center hover:bg-white transition-all hover:scale-105 active:scale-95"
          >
            <ChevronRight className="h-5 w-5 text-gray-800" />
          </button>
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-2 mt-8">
          {properties.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToIndex(i)}
              aria-label={`Go to property ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current
                  ? "w-6 bg-primary"
                  : "w-2 bg-primary/20 hover:bg-primary/40"
              }`}
            />
          ))}
        </div>

        {/* Mobile view all */}
        <div className="sm:hidden mt-8 text-center">
          <Link
            href="/properties"
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            View All Properties
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
