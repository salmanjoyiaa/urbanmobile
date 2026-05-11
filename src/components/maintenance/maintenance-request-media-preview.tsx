"use client";

import { useState } from "react";
import { Mic, Paperclip, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { isMaintenanceMediaVideoPath } from "@/lib/maintenance-request-paths";

type MaintenanceMediaPreviewButtonProps = {
  requestId: string;
  path: string;
  title: string;
  children: React.ReactNode;
  className?: string;
};

export function MaintenanceMediaPreviewButton({
  requestId,
  path,
  title,
  children,
  className,
}: MaintenanceMediaPreviewButtonProps) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [kind, setKind] = useState<"video" | "audio" | "image">("image");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openPreview = async () => {
    setLoading(true);
    setError(null);
    setUrl(null);
    try {
      const params = new URLSearchParams({ requestId, path });
      const res = await fetch(`/api/maintenance-request-media?${params.toString()}`);
      const data = (await res.json()) as { url?: string; kind?: string; error?: string };
      if (!res.ok) throw new Error(data.error || "Could not load attachment");
      if (!data.url) throw new Error("Missing signed URL");
      setUrl(data.url);
      setKind((data.kind === "video" || data.kind === "audio" ? data.kind : "image") as typeof kind);
      setOpen(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
      setOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={className}
        title={title}
        onClick={openPreview}
        disabled={loading}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : children}
      </Button>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) {
            setUrl(null);
            setError(null);
          }
        }}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          {error && <p className="text-sm text-destructive">{error}</p>}
          {url && kind === "video" && (
            <video src={url} controls className="w-full max-h-[70vh] rounded-md bg-black" playsInline />
          )}
          {url && kind === "audio" && <audio src={url} controls className="w-full" />}
          {url && kind === "image" && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt={title} className="max-h-[70vh] w-auto max-w-full mx-auto rounded-md border" />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

type MaintenanceRequestMediaCellProps = {
  requestId: string;
  audioUrl: string | null | undefined;
  mediaUrls: string[] | null | undefined;
};

export function MaintenanceRequestMediaCell({ requestId, audioUrl, mediaUrls }: MaintenanceRequestMediaCellProps) {
  const urls = mediaUrls?.filter(Boolean) ?? [];
  const hasAudio = Boolean(audioUrl);
  const hasMedia = urls.length > 0;

  if (!hasAudio && !hasMedia) {
    return <span className="text-muted-foreground text-xs">-</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {hasAudio && audioUrl && (
        <MaintenanceMediaPreviewButton
          requestId={requestId}
          path={audioUrl}
          title="Voice message"
          className="p-1.5 h-auto bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-md border-0"
        >
          <Mic className="h-4 w-4" />
        </MaintenanceMediaPreviewButton>
      )}
      {urls.map((p, i) => (
        <MaintenanceMediaPreviewButton
          key={`${p}-${i}`}
          requestId={requestId}
          path={p}
          title={isMaintenanceMediaVideoPath(p) ? `Video ${i + 1}` : `Attachment ${i + 1}`}
          className="p-1.5 h-auto bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-md border-0"
        >
          <Paperclip className="h-4 w-4" />
        </MaintenanceMediaPreviewButton>
      ))}
    </div>
  );
}
