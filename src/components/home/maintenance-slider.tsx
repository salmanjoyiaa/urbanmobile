"use client";

import { useRef, useState, useCallback } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Zap,
  Droplets,
  Thermometer,
  Wrench,
  Paintbrush,
  Sparkles,
  Star,
  Hammer,
  ShieldCheck,
  TreePine,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";

type ServiceItem = {
  icon: LucideIcon;
  title: string;
  desc: string;
  color: string;
  iconColor: string;
  ctaClass: string;
};

const SERVICES: ServiceItem[] = [
  {
    icon: Droplets,
    title: "Plumbing",
    desc: "Leaks, pipes, fixtures & water heaters",
    color: "from-blue-50 to-blue-100/60 border-blue-200/80",
    iconColor: "text-blue-600",
    ctaClass: "text-blue-700 group-hover:text-blue-800",
  },
  {
    icon: Zap,
    title: "Electrical",
    desc: "Wiring, outlets, panels & lighting",
    color: "from-amber-50 to-amber-100/60 border-amber-200/80",
    iconColor: "text-amber-600",
    ctaClass: "text-amber-800 group-hover:text-amber-900",
  },
  {
    icon: Thermometer,
    title: "HVAC",
    desc: "AC, heating, ventilation & duct cleaning",
    color: "from-red-50 to-red-100/60 border-red-200/80",
    iconColor: "text-red-600",
    ctaClass: "text-red-700 group-hover:text-red-800",
  },
  {
    icon: Wrench,
    title: "Appliance Repair",
    desc: "Fridge, washer, dryer & oven repairs",
    color: "from-purple-50 to-purple-100/60 border-purple-200/80",
    iconColor: "text-purple-600",
    ctaClass: "text-purple-700 group-hover:text-purple-800",
  },
  {
    icon: Paintbrush,
    title: "Painting",
    desc: "Interior & exterior, touch-ups & full jobs",
    color: "from-emerald-50 to-emerald-100/60 border-emerald-200/80",
    iconColor: "text-emerald-600",
    ctaClass: "text-emerald-700 group-hover:text-emerald-800",
  },
  {
    icon: Sparkles,
    title: "Deep Cleaning",
    desc: "Move-in/out, post-construction & regular",
    color: "from-cyan-50 to-cyan-100/60 border-cyan-200/80",
    iconColor: "text-cyan-600",
    ctaClass: "text-cyan-700 group-hover:text-cyan-800",
  },
  {
    icon: Hammer,
    title: "Carpentry",
    desc: "Furniture assembly, doors & custom woodwork",
    color: "from-orange-50 to-orange-100/60 border-orange-200/80",
    iconColor: "text-orange-600",
    ctaClass: "text-orange-700 group-hover:text-orange-800",
  },
  {
    icon: ShieldCheck,
    title: "Safety & Security",
    desc: "CCTV, locks, alarms & fire systems",
    color: "from-indigo-50 to-indigo-100/60 border-indigo-200/80",
    iconColor: "text-indigo-600",
    ctaClass: "text-indigo-700 group-hover:text-indigo-800",
  },
  {
    icon: TreePine,
    title: "Landscaping",
    desc: "Garden, lawn care & outdoor maintenance",
    color: "from-green-50 to-green-100/60 border-green-200/80",
    iconColor: "text-green-600",
    ctaClass: "text-green-700 group-hover:text-green-800",
  },
];

export function MaintenanceSlider() {
  const [current, setCurrent] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const total = SERVICES.length;

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

  return (
    <section className="py-16 lg:py-20 bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium mb-3 border border-emerald-200">
              <Star className="h-3.5 w-3.5" />
              24-Hour Response Guarantee
            </div>
            <h2 className="font-display text-3xl font-bold text-foreground mb-1">
              Maintenance Services
            </h2>
            <p className="text-muted-foreground text-sm">
              Professional repairs and upkeep for every part of your property
            </p>
          </div>
          <Link
            href="/maintenance"
            className="inline-flex items-center gap-2 self-start px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-emerald-500/25 whitespace-nowrap"
          >
            <Wrench className="h-5 w-5 shrink-0" />
            Explore Services
          </Link>
        </div>

        {/* Slider */}
        <div className="relative">
          <div
            ref={trackRef}
            className="flex touch-pan-x gap-5 overflow-x-auto overflow-y-hidden scrollbar-hide overscroll-x-contain"
            style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
            onScroll={syncCurrentFromScroll}
          >
            {SERVICES.map((service) => (
              <Link
                key={service.title}
                href={`/maintenance?category=${encodeURIComponent(service.title)}`}
                aria-label={`Browse ${service.title} providers on the marketplace`}
                className={`group flex-none w-[85%] sm:w-[45%] lg:w-[calc(33.333%-14px)] flex flex-col min-h-[260px] sm:min-h-[280px] p-6 sm:p-7 rounded-2xl bg-gradient-to-br ${service.color} border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background`}
                style={{ scrollSnapAlign: "start" }}
              >
                <div className="relative mb-5 shrink-0">
                  <div
                    className="pointer-events-none absolute -inset-1 rounded-3xl bg-gradient-to-br from-white/60 to-white/0 opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-100"
                    aria-hidden
                  />
                  <div className="relative flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-white/95 shadow-md ring-1 ring-black/[0.06]">
                    <service.icon className={`h-7 w-7 sm:h-8 sm:w-8 ${service.iconColor}`} strokeWidth={1.5} />
                  </div>
                </div>
                <h3 className="font-display font-bold text-gray-900 text-lg sm:text-xl mb-2 tracking-tight">
                  {service.title}
                </h3>
                <p className="text-gray-600/95 text-sm leading-relaxed mb-5 flex-grow">
                  {service.desc}
                </p>
                <span
                  className={`mt-auto inline-flex items-center gap-2 text-sm font-semibold transition-colors ${service.ctaClass}`}
                >
                  Browse providers
                  <ArrowRight className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden />
                </span>
              </Link>
            ))}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              prev();
            }}
            aria-label="Previous service"
            className="absolute left-1 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 shadow-lg transition-all hover:bg-white hover:scale-105 active:scale-95 sm:h-10 sm:w-10 md:-left-4"
          >
            <ChevronLeft className="h-5 w-5 text-gray-800" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              next();
            }}
            aria-label="Next service"
            className="absolute right-1 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 shadow-lg transition-all hover:bg-white hover:scale-105 active:scale-95 sm:h-10 sm:w-10 md:-right-4"
          >
            <ChevronRight className="h-5 w-5 text-gray-800" />
          </button>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {SERVICES.map((_, i) => (
            <button
              type="button"
              key={i}
              onClick={() => scrollToIndex(i)}
              aria-label={`Go to service ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current ? "w-6 bg-primary" : "w-2 bg-primary/20 hover:bg-primary/40"
              }`}
            />
          ))}
        </div>

        {/* Trust bar */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-sm text-muted-foreground">
          {[
            { icon: ShieldCheck, text: "Licensed & Insured" },
            { icon: Star, text: "4.9★ Customer Rating" },
            { icon: Wrench, text: "All Types Covered" },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-2">
              <item.icon className="h-4 w-4 text-emerald-500" />
              <span className="font-medium">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
