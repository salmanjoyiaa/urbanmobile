"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ImageOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import useEmblaCarousel from "embla-carousel-react";

type PropertyGalleryProps = {
  images: string[];
  title: string;
  coverImageIndex?: number;
};

function Lightbox({
  images,
  initialIndex,
  onClose,
}: {
  images: string[];
  initialIndex: number;
  onClose: () => void;
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ startIndex: initialIndex, loop: true });
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") emblaApi?.scrollPrev();
      if (e.key === "ArrowRight") emblaApi?.scrollNext();
    }
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [emblaApi, onClose]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCurrentIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    emblaApi?.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback((index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    emblaApi?.scrollTo(index);
  }, [emblaApi]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-md transition-opacity"
      onClick={onClose}
    >
      <div className="absolute top-0 z-50 flex w-full justify-between items-center p-4">
        <div className="rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-white/90">
          {currentIndex + 1} / {images.length}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          aria-label="Close lightbox"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {images.length > 1 && (
        <>
          <button
            onClick={scrollPrev}
            className="absolute left-3 top-1/2 z-50 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:left-6"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={scrollNext}
            className="absolute right-3 top-1/2 z-50 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-6"
            aria-label="Next image"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      <div className="flex-1 overflow-hidden" ref={emblaRef} onClick={(e) => e.stopPropagation()}>
        <div className="flex h-full touch-pan-y">
          {images.map((img, i) => (
            <div className="relative min-w-0 flex-[0_0_100%] h-full flex items-center justify-center p-4 sm:p-12 md:p-16" key={`lb-${img}-${i}`}>
              <div className="relative w-full h-full max-h-[85vh]">
                <Image
                  src={img}
                  alt={`Gallery image ${i + 1}`}
                  fill
                  className="object-contain"
                  sizes="100vw"
                  quality={90}
                  priority={i === initialIndex}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {images.length > 1 && (
        <div className="absolute bottom-4 left-0 w-full z-50 flex justify-center pb-2 px-4" onClick={(e) => e.stopPropagation()}>
          <div className="flex max-w-[90vw] gap-2 overflow-x-auto scrollbar-hide">
            {images.map((img, i) => (
              <button
                key={`lb-thumb-${i}`}
                onClick={(e) => scrollTo(i, e)}
                className={`relative h-14 w-14 flex-none overflow-hidden rounded-md border-2 transition-all ${i === currentIndex ? "border-white opacity-100 ring-2 ring-white/50" : "border-transparent opacity-40 hover:opacity-80"
                  }`}
              >
                <Image src={img} alt="Thumbnail" fill className="object-cover" sizes="56px" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function PropertyGallery({ images, title, coverImageIndex = 0 }: PropertyGalleryProps) {
  const safeImages = useMemo(() => images?.filter(Boolean) || [], [images]);
  const startIdx = safeImages.length > 0 ? Math.min(Math.max(0, coverImageIndex), safeImages.length - 1) : 0;
  const [index, setIndex] = useState(startIdx);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (safeImages.length === 0) {
    return (
      <div className="flex aspect-[16/10] items-center justify-center rounded-lg border bg-muted text-muted-foreground">
        <ImageOff className="mr-2 h-5 w-5" />
        No images available
      </div>
    );
  }

  const current = safeImages[index] || safeImages[0];
  const prev = () => setIndex((value) => (value - 1 + safeImages.length) % safeImages.length);
  const next = () => setIndex((value) => (value + 1) % safeImages.length);

  return (
    <>
      <div className="space-y-3">
        <div
          className="relative cursor-pointer overflow-hidden rounded-xl border bg-muted group"
          onClick={() => setLightboxOpen(true)}
        >
          <div className="relative aspect-[16/10] w-full">
            <Image
              src={current}
              alt={title}
              fill
              priority
              className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
            />
          </div>

          <div className="absolute inset-0 bg-black/5 opacity-0 transition-opacity group-hover:opacity-100" />

          {safeImages.length > 1 && (
            <>
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="absolute left-3 top-1/2 -translate-y-1/2 opacity-90 shadow-sm transition-transform hover:scale-105"
                onClick={(e) => { e.stopPropagation(); prev(); }}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="absolute right-3 top-1/2 -translate-y-1/2 opacity-90 shadow-sm transition-transform hover:scale-105"
                onClick={(e) => { e.stopPropagation(); next(); }}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>

              <div className="absolute bottom-3 right-3 rounded-md bg-black/60 px-2 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
                {index + 1} / {safeImages.length}
              </div>
            </>
          )}
        </div>

        {safeImages.length > 1 && (
          <div className="grid grid-cols-5 gap-2 sm:grid-cols-6 lg:grid-cols-8">
            {safeImages.map((image, thumbIndex) => (
              <button
                key={`thumb-${image}-${thumbIndex}`}
                type="button"
                onClick={() => setIndex(thumbIndex)}
                className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-all ${thumbIndex === index
                    ? "border-primary opacity-100 ring-2 ring-primary/20"
                    : "border-transparent opacity-70 hover:opacity-100"
                  }`}
              >
                <Image
                  src={image}
                  alt={`${title} thumbnail ${thumbIndex + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 20vw, 10vw"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {lightboxOpen && (
        <Lightbox
          images={safeImages}
          initialIndex={index}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}
