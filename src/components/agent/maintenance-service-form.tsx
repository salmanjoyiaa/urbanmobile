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
};

export function MaintenanceServiceForm({ mode, initialData }: MaintenanceServiceFormProps) {
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
  const [imageUrl, setImageUrl] = useState(initialData?.images?.[0] || "");
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/cities")
      .then((res) => res.json())
      .then((data) => setCities(data.cities || []))
      .catch(console.error);
  }, []);

  const submit = async () => {
    setSubmitting(true);
    try {
      const images = imageUrl.trim() ? [imageUrl.trim()] : [];
      const payload: Record<string, unknown> = {
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
        provider_type: providerType,
        city: city.trim(),
        images,
      };
      if (price.trim() !== "") {
        payload.price = Number(price);
      }

      const endpoint =
        mode === "create"
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
      router.push("/agent/maintenance-services");
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
        <Input id="ms-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Emergency plumbing" />
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
        <Label htmlFor="ms-img">Image URL (optional)</Label>
        <Input
          id="ms-img"
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://…"
        />
        <p className="text-xs text-muted-foreground">First image shown on your listing. You can add more later.</p>
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
