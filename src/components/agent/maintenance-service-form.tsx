"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { MaintenanceService } from "@/types/database";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { ImageUploader } from "@/components/dashboard/image-uploader";
import { MaintenanceVideoUploader } from "@/components/maintenance/maintenance-video-uploader";

const SERVICE_CATEGORIES = [
  "Plumbing",
  "Electrical",
  "HVAC",
  "Appliance Repair",
  "Painting",
  "Deep Cleaning",
  "Carpentry",
  "Safety & Security",
  "Landscaping",
];

type MaintenanceServiceFormProps = {
  mode: "create" | "edit";
  initialData?: MaintenanceService;
  /** Admin edits use the service-role PATCH route; agents use /api/agent/... */
  submitTarget?: "agent" | "admin";
};

export function MaintenanceServiceForm({
  mode,
  initialData,
  submitTarget = "agent",
}: MaintenanceServiceFormProps) {
  const router = useRouter();
  const [isSubmitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [category, setCategory] = useState(initialData?.category || SERVICE_CATEGORIES[0]);
  const [providerType, setProviderType] = useState<"single_person" | "company">(
    initialData?.provider_type || "single_person"
  );
  const [price, setPrice] = useState(
    initialData?.price != null && initialData.price !== undefined ? String(initialData.price) : ""
  );
  const [city, setCity] = useState(initialData?.city || "");
  const [images, setImages] = useState<string[]>(initialData?.images ?? []);
  const [videos, setVideos] = useState<string[]>(initialData?.videos ?? []);
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/cities")
      .then((res) => res.json())
      .then((data) => setCities(data.cities || []))
      .catch(console.error);
  }, []);

  const submit = async () => {
    if (submitTarget === "admin" && mode !== "edit") {
      toast.error("Admin form is only used for editing.");
      return;
    }
    if (submitTarget === "admin" && !initialData?.id) {
      toast.error("Missing service id.");
      return;
    }

    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
        provider_type: providerType,
        city: city.trim(),
        images,
        videos,
      };
      if (price.trim() !== "") {
        payload.price = Number(price);
      }

      const endpoint =
        submitTarget === "admin"
          ? `/api/admin/maintenance-services/${initialData!.id}`
          : mode === "create"
            ? "/api/agent/maintenance-services"
            : `/api/agent/maintenance-services/${initialData?.id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "Could not save service");

      toast.success(
        mode === "create" ? "Service created. Redirecting…" : "Service updated. Redirecting…"
      );
      router.push(submitTarget === "admin" ? "/admin/maintenance-services" : "/agent/maintenance-services");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-xl">
      <div className="space-y-2">
        <Label htmlFor="ms-title">Title</Label>
        <Input
          id="ms-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Emergency plumbing"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="ms-desc">Description</Label>
        <Textarea
          id="ms-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          placeholder="Describe what you offer, coverage area, and any guarantees."
        />
      </div>

      <div className="space-y-2">
        <Label>Category</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {SERVICE_CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Provider type</Label>
        <Select
          value={providerType}
          onValueChange={(v) => setProviderType(v as "single_person" | "company")}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="single_person">Individual</SelectItem>
            <SelectItem value="company">Company</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="ms-price">Price (SAR, optional)</Label>
        <Input
          id="ms-price"
          type="number"
          min={0}
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="0"
        />
      </div>

      <div className="space-y-2">
        <Label>City</Label>
        {cities.length > 0 ? (
          <Select value={city} onValueChange={setCity}>
            <SelectTrigger>
              <SelectValue placeholder="Select city" />
            </SelectTrigger>
            <SelectContent>
              {cities.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City" />
        )}
      </div>

      <div className="space-y-2">
        <Label>Listing photos</Label>
        <ImageUploader bucket="maintenance-services" values={images} onChange={setImages} maxFiles={20} />
        <p className="text-xs text-muted-foreground">First image is the primary thumbnail when no video is set.</p>
      </div>

      <div className="space-y-2">
        <Label>Listing videos</Label>
        <MaintenanceVideoUploader values={videos} onChange={setVideos} maxFiles={3} />
      </div>

      <div className="flex gap-3">
        <Button type="button" onClick={submit} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : mode === "create" ? (
            "Create service"
          ) : (
            "Save changes"
          )}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
