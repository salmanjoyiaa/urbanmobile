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
import { PRODUCT_CATEGORIES, PRODUCT_CONDITIONS, SAUDI_CITIES } from "@/lib/constants";
import type { Product } from "@/types/database";
import { ImageUploader } from "@/components/dashboard/image-uploader";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

type ProductFormProps = {
  mode: "create" | "edit";
  initialData?: Product;
};

export function ProductForm({ mode, initialData }: ProductFormProps) {
  const router = useRouter();
  const [isSubmitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [category, setCategory] = useState(initialData?.category || "furniture");
  const [condition, setCondition] = useState(initialData?.condition || "good");
  const [price, setPrice] = useState(String(initialData?.price || ""));
  const [city, setCity] = useState(initialData?.city || SAUDI_CITIES[0]);
  const [images, setImages] = useState<string[]>(initialData?.images || []);

  const submit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        title,
        description,
        category,
        condition,
        price: Number(price),
        city,
        images,
      };

      const endpoint = mode === "create" ? "/api/agent/products" : `/api/agent/products/${initialData?.id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || "Could not save product");

      toast.success(
        mode === "create" 
          ? "Product created successfully! Redirecting..." 
          : "Product updated successfully! Redirecting..."
      );
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push("/agent/products");
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
        <CardTitle>{mode === "create" ? "Create Product" : "Edit Product"}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Title</Label>
          <Input 
            value={title} 
            onChange={(event) => setTitle(event.target.value)}
            disabled={isSubmitting}
            placeholder="e.g., Modern Dining Table Set"
          />
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea 
            value={description} 
            onChange={(event) => setDescription(event.target.value)}
            disabled={isSubmitting}
            placeholder="Describe your product in detail..."
            rows={4}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={(value) => setCategory(value as typeof category)} disabled={isSubmitting}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PRODUCT_CATEGORIES.map((item) => (
                  <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Condition</Label>
            <Select value={condition} onValueChange={(value) => setCondition(value as typeof condition)} disabled={isSubmitting}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {PRODUCT_CONDITIONS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Price (SAR)</Label>
            <Input 
              type="number" 
              value={price} 
              onChange={(event) => setPrice(event.target.value)}
              disabled={isSubmitting}
              placeholder="0"
            />
          </div>
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
        </div>

        <ImageUploader 
          bucket="product-images" 
          values={images} 
          onChange={setImages}
        />

        <Button 
          type="button" 
          onClick={submit} 
          disabled={isSubmitting}
          size="lg"
          className="w-full"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            mode === "create" ? "Create product" : "Save changes"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
