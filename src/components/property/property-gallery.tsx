"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, ImageOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type PropertyGalleryProps = {
  images: string[];
  title: string;
};

function Lightbox({
  images,
  index,
  onClose,
  onPrev,
  onNext,
}: {
  images: string[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    }
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose, onPrev, onNext]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        className="absolute right-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
        aria-label="Close lightbox"
      >
        <X className="h-5 w-5" />
      </button>

      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
            className="absolute left-3 top-1/2 z-50 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors sm:left-6"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            className="absolute right-3 top-1/2 z-50 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors sm:right-6"
            aria-label="Next image"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      <div className="flex max-h-[85vh] max-w-[90vw] flex-col items-center gap-4" onClick={(e) => e.stopPropagation()}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[index]}
          alt={`Image ${index + 1}`}
          className="max-h-[75vh] max-w-full rounded-lg object-contain"
        />

        <div className="text-center text-sm text-white/70">
          {index + 1} / {images.length}
        </div>

        {images.length > 1 && (
          <div className="flex max-w-[90vw] gap-1.5 overflow-x-auto pb-2">
            {images.map((img, i) => (
              <button
                key={`thumb-${i}`}
                onClick={() => {/* handled by parent */}}
                className={`h-12 w-12 flex-none overflow-hidden rounded border-2 transition-all ${
                  i === index ? "border-white opacity-100" : "border-transparent opacity-50 hover:opacity-80"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function PropertyGallery({ images, title }: PropertyGalleryProps) {
  const safeImages = useMemo(() => images.filter(Boolean), [images]);
  const [index, setIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (safeImages.length === 0) {
    return (
      <div className="flex aspect-[16/10] items-center justify-center rounded-lg border bg-muted text-muted-foreground">
        <ImageOff className="mr-2 h-5 w-5" />
        No images
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
          className="relative cursor-pointer overflow-hidden rounded-lg border bg-muted"
          onClick={() => setLightboxOpen(true)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={current} alt={title} className="aspect-[16/10] w-full object-cover" />

          {safeImages.length > 1 && (
            <>
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="absolute left-3 top-1/2 -translate-y-1/2"
                onClick={(e) => { e.stopPropagation(); prev(); }}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="absolute right-3 top-1/2 -translate-y-1/2"
                onClick={(e) => { e.stopPropagation(); next(); }}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>

        {safeImages.length > 1 && (
          <div className="grid grid-cols-5 gap-2 sm:grid-cols-6">
            {safeImages.map((image, thumbIndex) => (
              <button
                key={`${image}-${thumbIndex}`}
                type="button"
                onClick={() => setIndex(thumbIndex)}
                className={`overflow-hidden rounded-md border ${thumbIndex === index ? "ring-2 ring-gold" : "opacity-80"}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image} alt={`${title} image ${thumbIndex + 1}`} className="aspect-square w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {lightboxOpen && (
        <Lightbox
          images={safeImages}
          index={index}
          onClose={() => setLightboxOpen(false)}
          onPrev={prev}
          onNext={next}
        />
      )}
    </>
  );
}
