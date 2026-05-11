"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Wrench, Edit, Trash2, PauseCircle, PlayCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Service = {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number | null;
  status: string;
  images?: string[] | null;
  videos?: string[] | null;
};

export function MaintenanceServiceCard({ service }: { service: Service }) {
  const router = useRouter();
  const [pauseBusy, setPauseBusy] = useState(false);

  const togglePaused = async () => {
    const next = service.status === "active" ? "inactive" : "active";
    try {
      setPauseBusy(true);
      const res = await fetch(`/api/agent/maintenance-services/${service.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error || "Update failed");
      toast.success(next === "inactive" ? "Listing paused (hidden from marketplace)" : "Listing resumed");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    } finally {
      setPauseBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this service? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/agent/maintenance-services/${service.id}`, { method: "DELETE" });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(json.error || "Delete failed");
      toast.success("Service removed");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  };

  return (
    <div className="bg-card border rounded-xl overflow-hidden flex flex-col">
      {service.videos && service.videos.length > 0 ? (
        <video
          src={service.videos[0]}
          className="w-full h-40 object-cover"
          muted
          playsInline
          preload="metadata"
        />
      ) : service.images && service.images.length > 0 ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={service.images[0]} alt={service.title} className="w-full h-40 object-cover" />
      ) : (
        <div className="w-full h-40 bg-muted flex items-center justify-center">
          <Wrench className="w-8 h-8 text-muted-foreground/30" />
        </div>
      )}
      <div className="p-5 flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-semibold text-lg line-clamp-1">{service.title}</h3>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">{service.category}</span>
          </div>
          <span
            className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${
              service.status === "active"
                ? "bg-emerald-100 text-emerald-700"
                : service.status === "suspended"
                  ? "bg-muted text-muted-foreground"
                  : "bg-amber-100 text-amber-800"
            }`}
          >
            {service.status}
          </span>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 mt-2 flex-grow">{service.description}</p>
        <div className="flex justify-between items-center mt-4 pt-4 border-t">
          <span className="font-bold text-sm">SAR {service.price ?? "N/A"}</span>
          <div className="flex gap-2">
            {(service.status === "active" || service.status === "inactive") && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-amber-700 hover:text-amber-800 hover:bg-amber-50"
                type="button"
                title={service.status === "active" ? "Pause listing" : "Resume listing"}
                aria-label={service.status === "active" ? "Pause listing" : "Resume listing"}
                onClick={togglePaused}
                disabled={pauseBusy}
              >
                {pauseBusy ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : service.status === "active" ? (
                  <PauseCircle className="w-4 h-4" />
                ) : (
                  <PlayCircle className="w-4 h-4" />
                )}
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50" asChild>
              <Link href={`/agent/maintenance-services/${service.id}/edit`} aria-label="Edit service">
                <Edit className="w-4 h-4" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
              type="button"
              aria-label="Delete service"
              onClick={handleDelete}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
