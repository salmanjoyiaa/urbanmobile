"use client";

import { useMemo, useState } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

type ImageUploaderProps = {
  bucket: "property-images" | "product-images";
  values: string[];
  onChange: (values: string[]) => void;
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

function convertViaCanvas(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) { URL.revokeObjectURL(url); reject(new Error("Canvas not supported")); return; }
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          if (!blob) { reject(new Error("Canvas export failed")); return; }
          const name = file.name.replace(/\.(heic|heif|hif)$/i, ".jpg");
          resolve(new File([blob], name, { type: "image/jpeg" }));
        },
        "image/jpeg",
        0.85,
      );
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Browser cannot render HEIF")); };
    img.src = url;
  });
}

function convertViaImageBitmap(file: File): Promise<File> {
  return createImageBitmap(file).then((bitmap) => {
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) { bitmap.close(); throw new Error("Canvas not supported"); }
    ctx.drawImage(bitmap, 0, 0);
    bitmap.close();
    return new Promise<File>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) { reject(new Error("Canvas export failed")); return; }
          const name = file.name.replace(/\.(heic|heif|hif)$/i, ".jpg");
          resolve(new File([blob], name, { type: "image/jpeg" }));
        },
        "image/jpeg",
        0.85,
      );
    });
  });
}

async function convertHeifToJpeg(file: File): Promise<File> {
  try {
    return await convertViaCanvas(file);
  } catch { /* try next */ }

  try {
    return await convertViaImageBitmap(file);
  } catch { /* try heic2any */ }

  const heic2any = (await import("heic2any")).default;
  const result = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.85 });
  const blob = Array.isArray(result) ? result[0] : result;
  const name = file.name.replace(/\.(heic|heif|hif)$/i, ".jpg");
  return new File([blob], name, { type: "image/jpeg" });
}

export function ImageUploader({ bucket, values, onChange }: ImageUploaderProps) {
  const supabase = useMemo(() => createClient(), []);
  const [isUploading, setUploading] = useState(false);

  const upload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const uploaded: string[] = [];

      for (let file of Array.from(files)) {
        if (isHeif(file)) {
          try {
            file = await convertHeifToJpeg(file);
          } catch (convErr) {
            const msg =
              convErr instanceof Error ? convErr.message :
              typeof convErr === "object" && convErr && "message" in convErr ? String((convErr as { message: unknown }).message) :
              "Unknown error";
            console.error("HEIF conversion failed:", msg, convErr);
            const isUnsupported =
              /format not supported|ERR_LIBHEIF/i.test(msg);
            toast.error(
              isUnsupported
                ? `${file.name}: This format isn't supported. Save as JPEG first (e.g. iPhone: Settings > Camera > Most Compatible).`
                : `Could not convert ${file.name} — ${msg}`,
            );
            continue;
          }
        }

        const path = `${Date.now()}-${sanitizeName(file.name)}`;
        const { error } = await supabase.storage.from(bucket).upload(path, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type || "image/jpeg",
        });

        if (error) {
          throw new Error(error.message);
        }

        const { data } = supabase.storage.from(bucket).getPublicUrl(path);
        uploaded.push(data.publicUrl);
      }

      onChange([...values, ...uploaded]);
      toast.success("Images uploaded");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed";
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  const remove = (index: number) => {
    onChange(values.filter((_, currentIndex) => currentIndex !== index));
  };

  return (
    <div className="space-y-3">
      <label className="block cursor-pointer rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground hover:bg-muted/40">
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif,.hif"
          multiple
          className="hidden"
          onChange={(event) => upload(event.target.files)}
          disabled={isUploading}
        />
        <Upload className="mx-auto mb-2 h-5 w-5" />
        {isUploading ? "Uploading..." : "Click to upload images"}
      </label>

      {values.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {values.map((image, index) => (
            <div key={`${image}-${index}`} className="relative overflow-hidden rounded-md border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt={`Uploaded ${index + 1}`} className="aspect-square w-full object-cover" />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute right-1 top-1 h-7 w-7"
                onClick={() => remove(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
