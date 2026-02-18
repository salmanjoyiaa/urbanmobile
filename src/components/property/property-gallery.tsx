"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import { Button } from "@/components/ui/button";

type PropertyGalleryProps = {
  images: string[];
  title: string;
};

export function PropertyGallery({ images, title }: PropertyGalleryProps) {
  const safeImages = useMemo(() => images.filter(Boolean), [images]);
  const [index, setIndex] = useState(0);

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
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-lg border bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={current} alt={title} className="aspect-[16/10] w-full object-cover" />

        {safeImages.length > 1 && (
          <>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="absolute left-3 top-1/2 -translate-y-1/2"
              onClick={prev}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="absolute right-3 top-1/2 -translate-y-1/2"
              onClick={next}
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
  );
}
