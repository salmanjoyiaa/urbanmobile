"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ImageOff, X, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import useEmblaCarousel from "embla-carousel-react";

type MediaItem = { type: "image" | "video"; url: string };

type PropertyGalleryProps = {
  images: string[];
  title: string;
  coverImageIndex?: number;
  imageAltTexts?: Record<string, string>;
  videoUrl?: string | null;
  isVideoFeatured?: boolean;
};

function Lightbox({
  mediaItems,
  initialIndex,
  onClose,
  imageAltTexts,
  title,
}: {
  mediaItems: MediaItem[];
  initialIndex: number;
  onClose: () => void;
  imageAltTexts?: Record<string, string>;
  title: string;
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
      className="fixed inset-0 z-[100] flex flex-col md:flex-row bg-black/95 backdrop-blur-md transition-opacity"
      onClick={onClose}
    >
      <div className="absolute top-0 left-0 right-0 md:right-auto md:w-[calc(100%-280px)] z-[110] flex justify-between items-center p-4">
        <div className="rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-white/90">
          {currentIndex + 1} / {mediaItems.length}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          aria-label="Close lightbox"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Main media area */}
      <div className="flex-1 flex flex-col min-h-0 md:pt-14 pt-14">
        {mediaItems.length > 1 && (
          <>
            <button
              onClick={scrollPrev}
              className="absolute left-3 top-1/2 z-[110] flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:left-6"
              aria-label="Previous media"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={scrollNext}
              className="absolute right-3 md:right-[296px] top-1/2 z-[110] flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:right-6 md:right-[296px]"
              aria-label="Next media"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        <div className="flex-1 overflow-hidden min-h-0" ref={emblaRef} onClick={(e) => e.stopPropagation()}>
          <div className="flex h-full touch-pan-y">
            {mediaItems.map((item, i) => (
              <div className="relative min-w-0 flex-[0_0_100%] h-full flex flex-col items-center justify-center p-4 sm:p-12 md:p-16" key={`lb-${item.url}-${i}`}>
                <div className="relative w-full flex-1 min-h-0 max-h-[70vh]">
                  {item.type === "video" ? (
                    <video src={item.url} controls playsInline className="h-full w-full object-contain" />
                  ) : (
                    <Image
                      src={item.url}
                      alt={imageAltTexts?.[item.url] || `${title} — Photo ${i + 1}`}
                      fill
                      className="object-contain"
                      sizes="(max-width: 1024px) 100vw, calc(100vw - 280px)"
                      unoptimized
                    />
                  )}
                </div>
                {(item.type === "image" && imageAltTexts?.[item.url]) && (
                  <p className="mt-3 text-center text-sm text-white/90 max-w-xl mx-auto px-2">
                    {imageAltTexts[item.url]}
                  </p>
                )}
                {item.type === "video" && (
                   <p className="mt-3 text-center text-sm text-white/90 max-w-xl mx-auto px-2 font-medium">
                     Property Video Walkthrough
                   </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {mediaItems.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 md:right-[280px] z-[110] flex justify-center pb-2 px-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex max-w-[90vw] gap-2 overflow-x-auto scrollbar-hide">
              {mediaItems.map((item, i) => (
                <button
                  key={`lb-thumb-${i}`}
                  onClick={(e) => scrollTo(i, e)}
                  className={`relative h-14 w-14 flex-none overflow-hidden rounded-md border-2 transition-all ${i === currentIndex ? "border-white opacity-100 ring-2 ring-white/50" : "border-transparent opacity-40 hover:opacity-80"
                    }`}
                >
                  {item.type === "video" ? (
                    <div className="h-full w-full bg-black/80 flex items-center justify-center">
                      <PlayCircle className="h-6 w-6 text-white/80" />
                    </div>
                  ) : (
                    <Image src={item.url} alt="Thumbnail" fill className="object-cover" sizes="56px" unoptimized />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Booklet-style photo menu (desktop: right panel) */}
      <div
        className="hidden md:flex flex-col w-[280px] border-l border-white/10 bg-black/50 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-3 border-b border-white/10">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/70">Media catalog</p>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {mediaItems.map((item, i) => (
            <button
              key={`menu-${i}`}
              onClick={(e) => scrollTo(i, e)}
              className={`w-full text-left rounded-lg p-2 transition-colors ${i === currentIndex ? "bg-white/20 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"}`}
            >
              <span className="text-xs font-medium">{item.type === "video" ? "Video Walkthrough" : `Photo ${i + 1}`}</span>
              {(item.type === "image" && imageAltTexts?.[item.url]) && (
                <p className="text-[11px] mt-0.5 line-clamp-2 text-white/80">{imageAltTexts[item.url]}</p>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PropertyGallery({ images, title, coverImageIndex = 0, imageAltTexts, videoUrl, isVideoFeatured }: PropertyGalleryProps) {
  const mediaItems = useMemo<MediaItem[]>(() => {
    const items: MediaItem[] = (images?.filter(Boolean) || []).map(url => ({ type: "image", url }));
    if (videoUrl) {
      if (isVideoFeatured) {
        items.unshift({ type: "video", url: videoUrl });
      } else {
        items.push({ type: "video", url: videoUrl });
      }
    }
    return items;
  }, [images, videoUrl, isVideoFeatured]);

  const startIdx = mediaItems.length > 0 ? Math.min(Math.max(0, coverImageIndex), mediaItems.length - 1) : 0;
  const [index, setIndex] = useState(startIdx);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (mediaItems.length === 0) {
    return (
      <div className="flex aspect-[16/10] items-center justify-center rounded-lg border bg-muted text-muted-foreground">
        <ImageOff className="mr-2 h-5 w-5" />
        No media available
      </div>
    );
  }

  const current = mediaItems[index] || mediaItems[0];
  const prev = () => setIndex((value) => (value - 1 + mediaItems.length) % mediaItems.length);
  const next = () => setIndex((value) => (value + 1) % mediaItems.length);

  return (
    <>
      <div className="space-y-3">
        <div
          className="relative cursor-pointer overflow-hidden rounded-xl border bg-muted group"
          onClick={() => setLightboxOpen(true)}
        >
          <div className="relative aspect-[16/10] w-full bg-black">
            {current.type === "video" ? (
               <video
                 src={current.url}
                 className="h-full w-full object-contain"
                 controls={false} // Hide controls on the preview so click opens lightbox
                 muted
                 autoPlay
                 loop
                 playsInline
                 onClick={() => {
                   // Let the click bubble up to open lightbox
                 }}
               />
            ) : (
              <Image
                src={current.url}
                alt={title}
                fill
                priority
                className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 75vw, 960px"
              />
            )}
          </div>

          <div className="absolute inset-0 bg-black/5 opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none" />

          {current.type === "video" && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="rounded-full bg-black/50 p-4 text-white/90 backdrop-blur-sm transition-transform group-hover:scale-110">
                <PlayCircle className="h-10 w-10" />
              </div>
            </div>
          )}

          {mediaItems.length > 1 && (
            <>
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="absolute left-3 top-1/2 -translate-y-1/2 opacity-90 shadow-sm transition-transform hover:scale-105 z-10"
                onClick={(e) => { e.stopPropagation(); prev(); }}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="absolute right-3 top-1/2 -translate-y-1/2 opacity-90 shadow-sm transition-transform hover:scale-105 z-10"
                onClick={(e) => { e.stopPropagation(); next(); }}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>

              <div className="absolute bottom-3 right-3 rounded-md bg-black/60 px-2 py-1 text-[11px] font-medium text-white backdrop-blur-sm z-10">
                {index + 1} / {mediaItems.length}
              </div>
            </>
          )}
        </div>

        {mediaItems.length > 1 && (
          <div className="grid grid-cols-5 gap-2 sm:grid-cols-6 lg:grid-cols-8">
            {mediaItems.map((item, thumbIndex) => (
              <button
                key={`thumb-${item.url}-${thumbIndex}`}
                type="button"
                onClick={() => setIndex(thumbIndex)}
                className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-all ${thumbIndex === index
                    ? "border-primary opacity-100 ring-2 ring-primary/20"
                    : "border-transparent opacity-70 hover:opacity-100"
                  }`}
              >
                {item.type === "video" ? (
                  <div className="flex h-full w-full flex-col items-center justify-center bg-black/80">
                     <PlayCircle className="h-6 w-6 text-white/80" />
                  </div>
                ) : (
                  <Image
                    src={item.url}
                    alt={`${title} thumbnail ${thumbIndex + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 20vw, 120px"
                    unoptimized
                  />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {lightboxOpen && (
        <Lightbox
          mediaItems={mediaItems}
          initialIndex={index}
          onClose={() => setLightboxOpen(false)}
          imageAltTexts={imageAltTexts}
          title={title}
        />
      )}
    </>
  );
}
