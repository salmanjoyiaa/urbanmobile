"use client";

import { useMemo, useState } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

type VideoUploaderProps = {
  bucket: "property-images" | "product-images" | "avatars"; // We reuse the same bucket for simplicity or create a new one, but let's stick to property-images for now
  value: string | null;
  onChange: (value: string | null) => void;
};

function sanitizeName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export function VideoUploader({ bucket, value, onChange }: VideoUploaderProps) {
  const supabase = useMemo(() => createClient(), []);
  const [isUploading, setUploading] = useState(false);

  const upload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    // Max 100MB limit for video upload
    if (file.size > 100 * 1024 * 1024) {
      toast.error(`${file.name} is larger than 100MB limit.`);
      return;
    }

    setUploading(true);
    try {
      const path = `${Date.now()}-${sanitizeName(file.name)}`;
      const { error } = await supabase.storage.from(bucket).upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type || "video/mp4",
      });

      if (error) throw new Error(error.message);

      const { data } = supabase.storage.from(bucket).getPublicUrl(path);
      onChange(data.publicUrl);
      toast.success("Video uploaded successfully.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const remove = () => {
    onChange(null);
  };

  return (
    <div className="space-y-4">
      {!value ? (
        <label className={`block cursor-pointer rounded-xl border-2 border-dashed p-8 text-center text-sm transition-colors ${isUploading ? "border-muted-foreground/30 bg-muted/20" : "border-muted-foreground/40 hover:bg-muted/40"}`}>
          <input
            type="file"
            accept="video/*,.mp4,.mov,.webm"
            className="hidden"
            onChange={(event) => upload(event.target.files)}
            disabled={isUploading}
          />
          <Upload className="mx-auto mb-3 h-6 w-6 text-muted-foreground" />
          <div className="font-semibold text-foreground">
            {isUploading ? "Uploading..." : "Click or drag a video to upload"}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            MP4, MOV, or WEBM up to 100MB. Recommended for property walk-throughs.
          </p>
        </label>
      ) : (
        <div className="relative aspect-video overflow-hidden rounded-xl border bg-black flex items-center justify-center max-w-sm">
          <video src={value} controls className="h-full w-full object-contain" />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute right-2 top-2 h-8 w-8 shadow-md"
            onClick={(e) => { e.stopPropagation(); remove(); }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
