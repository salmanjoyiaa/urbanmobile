"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Zap, Droplets, Thermometer, Wrench, Paintbrush, Sparkles, Star, Hammer, ShieldCheck, TreePine } from "lucide-react";

const SERVICES = [
  {
    icon: Droplets,
    title: "Plumbing",
    desc: "Leaks, pipes, fixtures & water heaters",
    color: "from-blue-50 to-blue-100/60 border-blue-200",
    iconColor: "text-blue-600",
  },
  {
    icon: Zap,
    title: "Electrical",
    desc: "Wiring, outlets, panels & lighting",
    color: "from-amber-50 to-amber-100/60 border-amber-200",
    iconColor: "text-amber-600",
  },
  {
    icon: Thermometer,
    title: "HVAC",
    desc: "AC, heating, ventilation & duct cleaning",
    color: "from-red-50 to-red-100/60 border-red-200",
    iconColor: "text-red-600",
  },
  {
    icon: Wrench,
    title: "Appliance Repair",
    desc: "Fridge, washer, dryer & oven repairs",
    color: "from-purple-50 to-purple-100/60 border-purple-200",
    iconColor: "text-purple-600",
  },
  {
    icon: Paintbrush,
    title: "Painting",
    desc: "Interior & exterior, touch-ups & full jobs",
    color: "from-emerald-50 to-emerald-100/60 border-emerald-200",
    iconColor: "text-emerald-600",
  },
  {
    icon: Sparkles,
    title: "Deep Cleaning",
    desc: "Move-in/out, post-construction & regular",
    color: "from-cyan-50 to-cyan-100/60 border-cyan-200",
    iconColor: "text-cyan-600",
  },
  {
    icon: Hammer,
    title: "Carpentry",
    desc: "Furniture assembly, doors & custom woodwork",
    color: "from-orange-50 to-orange-100/60 border-orange-200",
    iconColor: "text-orange-600",
  },
  {
    icon: ShieldCheck,
    title: "Safety & Security",
    desc: "CCTV, locks, alarms & fire systems",
    color: "from-indigo-50 to-indigo-100/60 border-indigo-200",
    iconColor: "text-indigo-600",
  },
  {
    icon: TreePine,
    title: "Landscaping",
    desc: "Garden, lawn care & outdoor maintenance",
    color: "from-green-50 to-green-100/60 border-green-200",
    iconColor: "text-green-600",
  },
];

const INTERVAL_MS = 3800;

export function MaintenanceSlider() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
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

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(next, INTERVAL_MS);
    return () => clearInterval(timer);
  }, [next, paused]);

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
          <a
            href="https://wa.me/923177779990?text=Hi%2C%20I%20need%20maintenance%20help%20for%20my%20property"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-emerald-500/25 whitespace-nowrap"
          >
            Request via WhatsApp
          </a>
        </div>

        {/* Slider */}
        <div
          className="relative"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div
            ref={trackRef}
            className="flex gap-5 overflow-x-hidden"
            style={{ scrollSnapType: "x mandatory" }}
          >
            {SERVICES.map((service) => (
              <div
                key={service.title}
                className={`flex-none w-[85%] sm:w-[45%] lg:w-[calc(33.333%-14px)] p-6 rounded-2xl bg-gradient-to-br ${service.color} border transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5`}
                style={{ scrollSnapAlign: "start" }}
              >
                <div className="w-12 h-12 rounded-xl bg-white/80 flex items-center justify-center mb-4 shadow-sm">
                  <service.icon className={`h-6 w-6 ${service.iconColor}`} />
                </div>
                <h3 className="font-display font-bold text-gray-900 text-lg mb-2">
                  {service.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {service.desc}
                </p>
              </div>
            ))}
          </div>

          <button
            onClick={prev}
            aria-label="Previous service"
            className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/95 shadow-lg hidden md:flex items-center justify-center hover:bg-white transition-all hover:scale-105 active:scale-95"
          >
            <ChevronLeft className="h-5 w-5 text-gray-800" />
          </button>

          <button
            onClick={next}
            aria-label="Next service"
            className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/95 shadow-lg hidden md:flex items-center justify-center hover:bg-white transition-all hover:scale-105 active:scale-95"
          >
            <ChevronRight className="h-5 w-5 text-gray-800" />
          </button>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2 mt-8">
          {SERVICES.map((_, i) => (
            <button
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
