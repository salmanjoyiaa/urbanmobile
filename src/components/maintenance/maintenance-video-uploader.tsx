"use client";

import { useMemo, useState } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const BUCKET = "maintenance-services";
const MAX_BYTES = 50 * 1024 * 1024;

function sanitizeName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

type MaintenanceVideoUploaderProps = {
  values: string[];
  onChange: (values: string[]) => void;
  maxFiles?: number;
};

export function MaintenanceVideoUploader({ values, onChange, maxFiles = 3 }: MaintenanceVideoUploaderProps) {
  const supabase = useMemo(() => createClient(), []);
  const [isUploading, setUploading] = useState(false);

  const upload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (values.length >= maxFiles) {
      toast.error(`Maximum ${maxFiles} videos allowed.`);
      return;
    }

    setUploading(true);
    try {
      const uploaded: string[] = [];

      for (const file of Array.from(files)) {
        if (values.length + uploaded.length >= maxFiles) break;

        if (!file.type.startsWith("video/")) {
          toast.error(`${file.name} is not a video file.`);
          continue;
        }
        if (file.size > MAX_BYTES) {
          toast.error(`${file.name} exceeds the 50MB limit.`);
          continue;
        }

        const path = `${Date.now()}-${sanitizeName(file.name)}`;
        const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type || "video/mp4",
        });

        if (error) throw new Error(error.message);

        const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
        uploaded.push(data.publicUrl);
      }

      if (uploaded.length > 0) {
        onChange([...values, ...uploaded]);
        toast.success("Video uploaded.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const remove = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <label
        className={`block cursor-pointer rounded-xl border-2 border-dashed p-6 text-center text-sm transition-colors ${
          isUploading ? "border-muted-foreground/30 bg-muted/20" : "border-muted-foreground/40 hover:bg-muted/40"
        }`}
      >
        <input
          type="file"
          accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
          multiple={maxFiles > 1}
          className="hidden"
          onChange={(e) => upload(e.target.files)}
          disabled={isUploading || values.length >= maxFiles}
        />
        <Upload className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />
        <div className="font-medium text-foreground">
          {isUploading ? "Uploading…" : "Add listing videos (optional)"}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">MP4, WebM, or MOV up to 50MB each. {values.length}/{maxFiles}.</p>
      </label>

      {values.length > 0 && (
        <div className="space-y-2">
          {values.map((url, index) => (
            <div key={`${url}-${index}`} className="relative rounded-lg border bg-muted overflow-hidden">
              <video src={url} className="w-full max-h-48 object-contain bg-black" controls muted playsInline />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute right-2 top-2 h-8 w-8 shadow-md"
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
