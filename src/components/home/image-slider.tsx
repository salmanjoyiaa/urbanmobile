"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { cn } from "@/lib/utils";

export type SlideItem = {
  id: string;
  title: string;
  image: string;
  href: string;
  badge?: string;
  price?: string;
};

type ImageSliderProps = {
  items: SlideItem[];
};

export function ImageSlider({ items }: ImageSliderProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      skipSnaps: false,
      dragFree: false,
    },
    [
      Autoplay({
        delay: 4000,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
      }),
    ]
  );

  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi]
  );

  if (items.length === 0) return null;

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-2xl" ref={emblaRef}>
        <div className="flex touch-pan-y">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="relative min-w-0 shrink-0 grow-0 basis-[85%] pl-4 first:pl-0 sm:basis-[45%] lg:basis-[32%]"
            >
              <Link href={item.href} className="group block">
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 85vw, (max-width: 1024px) 45vw, 32vw"
                    className={cn(
                      "object-cover transition-all duration-700 group-hover:scale-110",
                      selectedIndex === index ? "scale-105" : "scale-100"
                    )}
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Badge */}
                  {item.badge && (
                    <div className="absolute left-3 top-3">
                      <span className="rounded-full bg-[#1d9bf0] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-lg">
                        {item.badge}
                      </span>
                    </div>
                  )}

                  {/* Content overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-[15px] font-bold leading-snug text-white drop-shadow-md line-clamp-2 sm:text-[16px]">
                      {item.title}
                    </h3>
                    {item.price && (
                      <p className="mt-1 text-[14px] font-semibold text-[#1d9bf0]">
                        {item.price}
                      </p>
                    )}
                  </div>

                  {/* Hover glow */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 ring-2 ring-[#1d9bf0]/50 transition-opacity duration-300 group-hover:opacity-100" />
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Dot indicators */}
      <div className="mt-6 flex items-center justify-center gap-2">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              selectedIndex === index
                ? "w-8 bg-[#1d9bf0]"
                : "w-1.5 bg-white/30 hover:bg-white/50"
            )}
          />
        ))}
      </div>
    </div>
  );
}
