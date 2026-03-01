"use client";

import { useMemo, useState, useRef } from "react";
import { Upload, X, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

type ImageUploaderProps = {
  bucket: "property-images" | "product-images" | "avatars";
  values: string[];
  onChange: (values: string[]) => void;
  maxFiles?: number;
};

function sanitizeName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function isHeif(file: File): boolean {
  const type = file.type.toLowerCase();
  if (type === "image/heic" || type === "image/heif" || type === "image/heic-sequence" || type === "image/heif-sequence") return true;
  const ext = file.name.split(".").pop()?.toLowerCase();
  return ext === "heic" || ext === "heif" || ext === "hif";
}

// Convert HEIC via API backstop if needed
async function convertHeifToJpeg(file: File): Promise<File> {
  const formData = new FormData();
  formData.append("image", file);
  const response = await fetch("/api/convert-heic", { method: "POST", body: formData });
  if (!response.ok) throw new Error("HEIC conversion failed");
  const blob = await response.blob();
  const name = file.name.replace(/\.(heic|heif|hif)$/i, ".jpg");
  return new File([blob], name, { type: "image/jpeg" });
}

// Optimize to WEBP & check resolution
async function optimizeImage(file: File): Promise<File> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        if (img.width < 1200) {
          toast.warning(`Image width is ${img.width}px. 1200px+ is recommended for best quality.`);
        }

        let targetWidth = img.width;
        let targetHeight = img.height;
        const maxDim = 1920;

        if (targetWidth > maxDim || targetHeight > maxDim) {
          const ratio = Math.min(maxDim / targetWidth, maxDim / targetHeight);
          targetWidth = Math.round(targetWidth * ratio);
          targetHeight = Math.round(targetHeight * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(file); // fail safe

        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
        canvas.toBlob(
          (blob) => {
            if (!blob) return resolve(file);
            const name = file.name.split('.').slice(0, -1).join('.') + '.webp';
            resolve(new File([blob], name, { type: "image/webp" }));
          },
          "image/webp",
          0.8
        );
      };
      img.onerror = () => resolve(file);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

export function ImageUploader({ bucket, values, onChange, maxFiles = 20 }: ImageUploaderProps) {
  const supabase = useMemo(() => createClient(), []);
  const [isUploading, setUploading] = useState(false);

  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const handleSort = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    const _values = [...values];
    const draggedItem = _values.splice(dragItem.current, 1)[0];
    _values.splice(dragOverItem.current, 0, draggedItem);
    dragItem.current = null;
    dragOverItem.current = null;
    onChange(_values);
  };

  const upload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (values.length + files.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} photos allowed.`);
      return;
    }

    setUploading(true);
    try {
      const uploaded: string[] = [];

      for (let file of Array.from(files)) {
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name} is larger than 10MB limit.`);
          continue;
        }

        if (isHeif(file)) {
          try {
            file = await convertHeifToJpeg(file);
          } catch {
            toast.error(`Could not convert ${file.name}`);
            continue;
          }
        }

        // Optimize and resize
        file = await optimizeImage(file);

        const path = `${Date.now()}-${sanitizeName(file.name)}`;
        const { error } = await supabase.storage.from(bucket).upload(path, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type || "image/webp",
        });

        if (error) throw new Error(error.message);

        const { data } = supabase.storage.from(bucket).getPublicUrl(path);
        uploaded.push(data.publicUrl);
      }

      onChange([...values, ...uploaded]);
      if (uploaded.length > 0) toast.success("Images uploaded and optimized.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const remove = (index: number) => {
    onChange(values.filter((_, currentIndex) => currentIndex !== index));
  };

  return (
    <div className="space-y-4">
      <label className={`block cursor-pointer rounded-xl border-2 border-dashed p-8 text-center text-sm transition-colors ${isUploading ? "border-muted-foreground/30 bg-muted/20" : "border-muted-foreground/40 hover:bg-muted/40"}`}>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif,.hif"
          multiple
          className="hidden"
          onChange={(event) => upload(event.target.files)}
          disabled={isUploading}
        />
        <Upload className="mx-auto mb-3 h-6 w-6 text-muted-foreground" />
        <div className="font-semibold text-foreground">
          {isUploading ? "Optimizing & Uploading..." : "Click or drag images to upload"}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          JPG, PNG, WEBP, or HEIC up to 10MB each. 1200px+ width recommended. Auto-compressed to WEBP.
        </p>
      </label>

      {values.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
          {values.map((image, index) => (
            <div
              key={`${image}-${index}`}
              className="group relative aspect-square overflow-hidden rounded-xl border bg-muted cursor-move"
              draggable
              onDragStart={() => (dragItem.current = index)}
              onDragEnter={() => (dragOverItem.current = index)}
              onDragEnd={handleSort}
              onDragOver={(e) => e.preventDefault()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt={`Uploaded ${index + 1}`} className="h-full w-full object-cover transition-transform group-hover:scale-105" />

              <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100" />

              <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none">
                <GripVertical className="h-6 w-6 text-white drop-shadow-md" />
              </div>

              <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                {index + 1}
              </div>

              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute right-1.5 top-1.5 h-6 w-6 opacity-0 shadow-md transition-opacity group-hover:opacity-100"
                onClick={(e) => { e.stopPropagation(); remove(index); }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
