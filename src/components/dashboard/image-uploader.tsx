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
  if (type === "image/heic" || type === "image/heif") return true;
  const ext = file.name.split(".").pop()?.toLowerCase();
  return ext === "heic" || ext === "heif";
}

async function convertHeifToJpeg(file: File): Promise<File> {
  const heic2any = (await import("heic2any")).default;
  const blob = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.85 }) as Blob;
  const name = file.name.replace(/\.(heic|heif)$/i, ".jpg");
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
          file = await convertHeifToJpeg(file);
        }

        const path = `${Date.now()}-${sanitizeName(file.name)}`;
        const { error } = await supabase.storage.from(bucket).upload(path, file, {
          cacheControl: "3600",
          upsert: false,
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
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
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
