"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
import {
  AMENITIES,
  LISTING_PURPOSES,
  PROPERTY_TYPES,
  SAUDI_CITIES,
  BUILDING_FEATURES,
  APARTMENT_FEATURES,
  RENTAL_PERIODS,
  SECURITY_DEPOSITS,
  NEARBY_PLACES,
} from "@/lib/constants";
import type { Property } from "@/types/database";
import { ImageUploader } from "@/components/dashboard/image-uploader";
import { PropertyMap } from "@/components/property/property-map";
import { toast } from "sonner";
import { Loader2, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";

type PropertyFormProps = {
  mode: "create" | "edit";
  initialData?: Property;
  submitEndpoint?: string;
  redirectPath?: string;
};

type Step = 1 | 2 | 3 | 4 | 5;

export function PropertyForm({ mode, initialData, submitEndpoint, redirectPath }: PropertyFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [isSubmitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [type, setType] = useState(initialData?.type || "apartment");
  const [purpose, setPurpose] = useState(initialData?.purpose || "long_term");
  const [price, setPrice] = useState(String(initialData?.price || ""));

  const [city, setCity] = useState(initialData?.city || SAUDI_CITIES[0]);
  const [district, setDistrict] = useState(initialData?.district || "");
  const [address, setAddress] = useState(initialData?.address || "");
  const [visitingAgentInstructions, setVisitingAgentInstructions] = useState(initialData?.visiting_agent_instructions || "");
  const [visitingAgentImage, setVisitingAgentImage] = useState<string[]>(initialData?.visiting_agent_image ? [initialData.visiting_agent_image] : []);
  const [latitude, setLatitude] = useState<number | null>(initialData?.latitude || null);
  const [longitude, setLongitude] = useState<number | null>(initialData?.longitude || null);

  const [bedrooms, setBedrooms] = useState(String(initialData?.bedrooms ?? ""));
  const [bathrooms, setBathrooms] = useState(String(initialData?.bathrooms ?? ""));
  const [area, setArea] = useState(String(initialData?.area_sqm ?? ""));
  const [yearBuilt, setYearBuilt] = useState(String(initialData?.year_built ?? ""));
  const [amenities, setAmenities] = useState<string[]>(initialData?.amenities || []);
  const [images, setImages] = useState<string[]>(initialData?.images || []);

  const [propertyRef, setPropertyRef] = useState(initialData?.property_ref || "");
  const [buildingFeatures, setBuildingFeatures] = useState<string[]>(initialData?.building_features || []);
  const [apartmentFeatures, setApartmentFeatures] = useState<string[]>(initialData?.apartment_features || []);
  const [locationUrl, setLocationUrl] = useState(initialData?.location_url || "");
  const [rentalPeriod, setRentalPeriod] = useState(initialData?.rental_period || "");
  const [securityDeposit, setSecurityDeposit] = useState(initialData?.security_deposit || "");
  const [nearbyPlaces, setNearbyPlaces] = useState<string[]>(initialData?.nearby_places || []);
  const [driveLink, setDriveLink] = useState(initialData?.drive_link || "");
  const [brokerFee, setBrokerFee] = useState(initialData?.broker_fee || "");
  const [coverImageIndex, setCoverImageIndex] = useState(initialData?.cover_image_index ?? 0);

  const toggleArrayItem = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    value: string
  ) => {
    setter((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
    );
  };
  const toggleAmenity = (value: string) => toggleArrayItem(setAmenities, value);

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
        property_ref: propertyRef || undefined,
        layout: initialData?.layout || undefined,
        building_features: buildingFeatures,
        apartment_features: apartmentFeatures,
        location_url: locationUrl || undefined,
        rental_period: rentalPeriod || undefined,
        office_fee: initialData?.office_fee || undefined,
        water_bill_included: initialData?.water_bill_included || undefined,
        security_deposit: securityDeposit || undefined,
        nearby_places: nearbyPlaces,
        drive_link: driveLink || undefined,
        broker_fee: brokerFee || undefined,
        cover_image_index: coverImageIndex,
        blocked_dates: initialData?.blocked_dates || [],
        visiting_agent_instructions: visitingAgentInstructions || undefined,
        visiting_agent_image: visitingAgentImage[0] || undefined,
      };

      const defaultEndpoint = mode === "create" ? "/api/agent/properties" : `/api/agent/properties/${initialData?.id}`;
      const endpoint = submitEndpoint || defaultEndpoint;
      const method = mode === "create" ? "POST" : "PATCH";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "Could not save property");

      toast.success(
        mode === "create"
          ? "Property submitted for admin approval! Redirecting..."
          : "Property updated successfully! Redirecting..."
      );

      setTimeout(() => {
        router.push(redirectPath || "/agent/properties");
        router.refresh();
      }, 1500);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Something went wrong";
      toast.error(errorMsg);
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
          {[1, 2, 3, 4, 5].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setStep(item as Step)}
              disabled={isSubmitting}
              className={`rounded-full px-3 py-1 transition-colors ${step >= item ? "bg-gold text-navy font-semibold" : "bg-muted text-muted-foreground"} disabled:opacity-50`}
            >
              Step {item}
            </button>
          ))}
        </div>

        {step === 1 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label>Title</Label>
              <Input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                disabled={isSubmitting}
                placeholder="e.g., Beautiful Villa in Riyadh"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Description</Label>
              <Textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                disabled={isSubmitting}
                placeholder="Describe your property in detail..."
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={type} onValueChange={(value) => setType(value as typeof type)} disabled={isSubmitting}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PROPERTY_TYPES.map((item) => (
                    <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Rental Type</Label>
              <Select value={purpose} onValueChange={(value) => setPurpose(value as typeof purpose)} disabled={isSubmitting}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {LISTING_PURPOSES.map((item) => (
                    <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Rental Period</Label>
              <Select value={rentalPeriod} onValueChange={setRentalPeriod} disabled={isSubmitting}>
                <SelectTrigger><SelectValue placeholder="Select period" /></SelectTrigger>
                <SelectContent>
                  {RENTAL_PERIODS.map((item) => (
                    <SelectItem key={item} value={item}>{item}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Property ID / Ref</Label>
              <Input
                value={propertyRef}
                onChange={(event) => setPropertyRef(event.target.value)}
                disabled={isSubmitting}
                placeholder="PROJ-001"
              />
            </div>
            <div className="space-y-2">
              <Label>Security Deposit</Label>
              <Select value={securityDeposit} onValueChange={setSecurityDeposit} disabled={isSubmitting}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  {SECURITY_DEPOSITS.map((item) => (
                    <SelectItem key={item} value={item}>{item}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Broker Fee (SAR)</Label>
              <Input
                value={brokerFee}
                onChange={(event) => setBrokerFee(event.target.value)}
                disabled={isSubmitting}
                placeholder="e.g., 2000"
              />
            </div>
            <div className="space-y-2">
              <Label>Price (SAR / Year)</Label>
              <Input
                type="number"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                disabled={isSubmitting}
                placeholder="0"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>City</Label>
                <Select value={city} onValueChange={(value) => setCity(value as typeof city)} disabled={isSubmitting}>
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
                <Input
                  value={district}
                  onChange={(event) => setDistrict(event.target.value)}
                  disabled={isSubmitting}
                  placeholder="e.g., Al Malaz"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Address</Label>
                <Input
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  disabled={isSubmitting}
                  placeholder="Street name and house number"
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Location (Google Map Link)</Label>
                <Input
                  value={locationUrl}
                  onChange={(event) => setLocationUrl(event.target.value)}
                  disabled={isSubmitting}
                  placeholder="https://maps.google.com/?q=..."
                  type="url"
                />
                <p className="text-xs text-muted-foreground mt-1">This link is masked from the public and only sent upon confirmed visits.</p>
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
                <Input
                  type="number"
                  value={bedrooms}
                  onChange={(event) => setBedrooms(event.target.value)}
                  disabled={isSubmitting}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Bathrooms</Label>
                <Input
                  type="number"
                  value={bathrooms}
                  onChange={(event) => setBathrooms(event.target.value)}
                  disabled={isSubmitting}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Area (sqm)</Label>
                <Input
                  type="number"
                  value={area}
                  onChange={(event) => setArea(event.target.value)}
                  disabled={isSubmitting}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2">
                <Label>Year built</Label>
                <Input
                  type="number"
                  value={yearBuilt}
                  onChange={(event) => setYearBuilt(event.target.value)}
                  disabled={isSubmitting}
                  placeholder="2020"
                />
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
                    disabled={isSubmitting}
                    className={`rounded-md border px-3 py-2 text-left text-sm transition-colors ${amenities.includes(item)
                      ? "border-primary bg-primary/10"
                      : "hover:bg-muted"
                      } disabled:opacity-50`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label>Building Features</Label>
              <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {BUILDING_FEATURES.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleArrayItem(setBuildingFeatures, item)}
                    disabled={isSubmitting}
                    className={`rounded-md border px-3 py-2 text-left text-sm transition-colors ${buildingFeatures.includes(item)
                      ? "border-primary bg-primary/10"
                      : "hover:bg-muted"
                      } disabled:opacity-50`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label>Apartment Features</Label>
              <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {APARTMENT_FEATURES.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleArrayItem(setApartmentFeatures, item)}
                    disabled={isSubmitting}
                    className={`rounded-md border px-3 py-2 text-left text-sm transition-colors ${apartmentFeatures.includes(item)
                      ? "border-primary bg-primary/10"
                      : "hover:bg-muted"
                      } disabled:opacity-50`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label>Nearby Places</Label>
              <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {NEARBY_PLACES.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleArrayItem(setNearbyPlaces, item)}
                    disabled={isSubmitting}
                    className={`rounded-md border px-3 py-2 text-left text-sm transition-colors ${nearbyPlaces.includes(item)
                      ? "border-primary bg-primary/10"
                      : "hover:bg-muted"
                      } disabled:opacity-50`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <ImageUploader bucket="property-images" values={images} onChange={setImages} />

            {images.length > 0 && (
              <div className="space-y-2">
                <Label>Select Cover Photo</Label>
                <p className="text-xs text-muted-foreground">Click an image to set it as the cover photo shown on the homepage.</p>
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                  {images.map((img, idx) => (
                    <button
                      key={img}
                      type="button"
                      onClick={() => setCoverImageIndex(idx)}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        coverImageIndex === idx
                          ? "border-primary ring-2 ring-primary/30"
                          : "border-transparent hover:border-muted-foreground/30"
                      }`}
                    >
                      <Image src={img} alt={`Photo ${idx + 1}`} fill className="object-cover" sizes="120px" />
                      {coverImageIndex === idx && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <CheckCircle2 className="h-6 w-6 text-primary drop-shadow" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label>Drive Link (Additional Photos)</Label>
              <Input
                value={driveLink}
                onChange={(event) => setDriveLink(event.target.value)}
                disabled={isSubmitting}
                placeholder="https://drive.google.com/..."
                type="url"
              />
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-destructive font-semibold">INTERNAL USE ONLY: Visiting Agent Instructions</Label>
              <p className="text-xs text-muted-foreground">This information is shielded from customers. It is routed natively to the internal Visiting Agent tasked with showing this real-estate.</p>
              <Textarea
                value={visitingAgentInstructions}
                onChange={(event) => setVisitingAgentInstructions(event.target.value)}
                disabled={isSubmitting}
                placeholder="Access codes, keys location, specific warnings..."
                rows={5}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Internal Map / Layout Schema (Optional)</Label>
              <ImageUploader bucket="property-images" values={visitingAgentImage} onChange={setVisitingAgentImage} />
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep((current) => (Math.max(1, current - 1) as Step))}
            disabled={isSubmitting || step === 1}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          {step < 5 ? (
            <Button
              type="button"
              onClick={() => {
                if (step === 1 && !title) return toast.error("Title is required");
                if (step === 2 && !address) return toast.error("Address is required");
                setStep((current) => (Math.min(5, current + 1) as Step))
              }}
              disabled={isSubmitting}
            >
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => {
                if (!visitingAgentInstructions) {
                  toast.error("Visiting Agent Instructions are compulsory.");
                  return;
                }
                submit();
              }}
              disabled={isSubmitting}
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                mode === "create" ? "Submit for Approval" : "Save changes"
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
