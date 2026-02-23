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
    <div className="relative w-full overflow-hidden">
      <div className="overflow-hidden rounded-3xl pb-4 sm:pb-0" ref={emblaRef}>
        <div className="flex touch-pan-y -ml-4 sm:-ml-5">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="relative min-w-0 shrink-0 grow-0 basis-[90%] pl-4 sm:pl-5 sm:basis-[48%] lg:basis-[32%]"
            >
              <Link href={item.href} className="group block h-full">
                <div className="relative aspect-[4/5] sm:aspect-[4/3] overflow-hidden rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] bg-white">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 90vw, (max-width: 1024px) 48vw, 32vw"
                    className={cn(
                      "object-cover transition-transform duration-700 ease-in-out group-hover:scale-110",
                      selectedIndex === index ? "scale-[1.02]" : "scale-100"
                    )}
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-x-0 bottom-0 h-3/5 bg-gradient-to-t from-[#2A201A]/95 via-[#2A201A]/40 to-transparent transition-opacity duration-300 pointer-events-none" />

                  {/* Badge */}
                  {item.badge && (
                    <div className="absolute left-4 top-4">
                      <span className="inline-flex rounded-full bg-white/90 backdrop-blur-md px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.1em] text-[#2A201A] shadow-sm">
                        {item.badge}
                      </span>
                    </div>
                  )}

                  {/* Content overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 lg:p-6 transform transition-transform duration-500 group-hover:-translate-y-1">
                    <h3 className="text-[17px] sm:text-[18px] font-extrabold leading-tight text-white mb-1.5 line-clamp-2 drop-shadow-md">
                      {item.title}
                    </h3>
                    {item.price && (
                      <p className="text-[15px] sm:text-[16px] font-bold text-[#E5D2C1]">
                        {item.price}
                      </p>
                    )}
                  </div>

                  {/* Hover glow highlight */}
                  <div className="absolute inset-0 rounded-3xl border-2 border-white/0 transition-all duration-300 group-hover:border-white/20" />
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
                ? "w-8 bg-[#2A201A]"
                : "w-1.5 bg-[#D9C5B2] hover:bg-[#B69780]"
            )}
          />
        ))}
      </div>
    </div>
  );
}
