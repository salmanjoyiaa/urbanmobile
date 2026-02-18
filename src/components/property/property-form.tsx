"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { AMENITIES, LISTING_PURPOSES, PROPERTY_TYPES, SAUDI_CITIES } from "@/lib/constants";
import type { Property } from "@/types/database";
import { ImageUploader } from "@/components/dashboard/image-uploader";
import { PropertyMap } from "@/components/property/property-map";
import { toast } from "sonner";

type PropertyFormProps = {
  mode: "create" | "edit";
  initialData?: Property;
};

type Step = 1 | 2 | 3 | 4;

export function PropertyForm({ mode, initialData }: PropertyFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [isSubmitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [type, setType] = useState(initialData?.type || "apartment");
  const [purpose, setPurpose] = useState(initialData?.purpose || "sale");
  const [price, setPrice] = useState(String(initialData?.price || ""));

  const [city, setCity] = useState(initialData?.city || SAUDI_CITIES[0]);
  const [district, setDistrict] = useState(initialData?.district || "");
  const [address, setAddress] = useState(initialData?.address || "");
  const [latitude, setLatitude] = useState<number | null>(initialData?.latitude || null);
  const [longitude, setLongitude] = useState<number | null>(initialData?.longitude || null);

  const [bedrooms, setBedrooms] = useState(String(initialData?.bedrooms ?? ""));
  const [bathrooms, setBathrooms] = useState(String(initialData?.bathrooms ?? ""));
  const [area, setArea] = useState(String(initialData?.area_sqm ?? ""));
  const [yearBuilt, setYearBuilt] = useState(String(initialData?.year_built ?? ""));
  const [amenities, setAmenities] = useState<string[]>(initialData?.amenities || []);
  const [images, setImages] = useState<string[]>(initialData?.images || []);

  const toggleAmenity = (value: string) => {
    setAmenities((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
    );
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        title,
        description,
        type,
        purpose,
        price: Number(price),
        city,
        district: district || undefined,
        address: address || undefined,
        latitude: latitude ?? undefined,
        longitude: longitude ?? undefined,
        bedrooms: bedrooms ? Number(bedrooms) : undefined,
        bathrooms: bathrooms ? Number(bathrooms) : undefined,
        area_sqm: area ? Number(area) : undefined,
        year_built: yearBuilt ? Number(yearBuilt) : undefined,
        amenities,
        images,
      };

      const endpoint = mode === "create" ? "/api/agent/properties" : `/api/agent/properties/${initialData?.id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "Could not save property");

      toast.success(mode === "create" ? "Property created" : "Property updated");
      router.push("/agent/properties");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === "create" ? "Create Property" : "Edit Property"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-wrap gap-2 text-sm">
          {[1, 2, 3, 4].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setStep(item as Step)}
              className={`rounded-full px-3 py-1 ${step >= item ? "bg-primary text-primary-foreground" : "bg-muted"}`}
            >
              Step {item}
            </button>
          ))}
        </div>

        {step === 1 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label>Title</Label>
              <Input value={title} onChange={(event) => setTitle(event.target.value)} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Description</Label>
              <Textarea value={description} onChange={(event) => setDescription(event.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={(value) => setType(value as typeof type)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PROPERTY_TYPES.map((item) => (
                    <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Purpose</Label>
              <Select value={purpose} onValueChange={(value) => setPurpose(value as typeof purpose)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {LISTING_PURPOSES.map((item) => (
                    <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Price (SAR)</Label>
              <Input type="number" value={price} onChange={(event) => setPrice(event.target.value)} />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>City</Label>
                <Select value={city} onValueChange={(value) => setCity(value as typeof city)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SAUDI_CITIES.map((item) => (
                      <SelectItem key={item} value={item}>{item}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>District</Label>
                <Input value={district} onChange={(event) => setDistrict(event.target.value)} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Address</Label>
                <Input value={address} onChange={(event) => setAddress(event.target.value)} />
              </div>
            </div>

            <PropertyMap
              latitude={latitude}
              longitude={longitude}
              onChange={(coords) => {
                setLatitude(coords.latitude);
                setLongitude(coords.longitude);
              }}
            />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Bedrooms</Label>
                <Input type="number" value={bedrooms} onChange={(event) => setBedrooms(event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Bathrooms</Label>
                <Input type="number" value={bathrooms} onChange={(event) => setBathrooms(event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Area (sqm)</Label>
                <Input type="number" value={area} onChange={(event) => setArea(event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Year built</Label>
                <Input type="number" value={yearBuilt} onChange={(event) => setYearBuilt(event.target.value)} />
              </div>
            </div>

            <div>
              <Label>Amenities</Label>
              <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {AMENITIES.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleAmenity(item)}
                    className={`rounded-md border px-3 py-2 text-left text-sm ${
                      amenities.includes(item) ? "border-primary bg-primary/10" : "hover:bg-muted"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <ImageUploader bucket="property-images" values={images} onChange={setImages} />
        )}

        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => setStep((current) => (Math.max(1, current - 1) as Step))}>
            Back
          </Button>
          {step < 4 ? (
            <Button type="button" onClick={() => setStep((current) => (Math.min(4, current + 1) as Step))}>
              Next
            </Button>
          ) : (
            <Button type="button" onClick={submit} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : mode === "create" ? "Create property" : "Save changes"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
