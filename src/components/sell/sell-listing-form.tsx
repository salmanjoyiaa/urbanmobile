"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  productSchema,
  signupSchema,
  SELL_LISTING_DRAFT_STORAGE_KEY,
  sellListingDraftSchema,
} from "@/lib/validators";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { PhoneInput } from "@/components/ui/phone-input";
import { PRODUCT_CATEGORIES, PRODUCT_CONDITIONS } from "@/lib/constants";
import { toast } from "sonner";
import { COUNTRIES } from "@/lib/country-data";
import {
  convertHeifToJpeg,
  isHeif,
  optimizeImage,
  sanitizeStorageFileName,
} from "@/components/dashboard/image-uploader";

const sellAccountSchema = z.object({
  full_name: signupSchema.shape.full_name,
  email: signupSchema.shape.email,
  password: signupSchema.shape.password,
  phone: z.string().regex(/^\+\d{10,15}$/, "WhatsApp must be in format +966XXXXXXXXX"),
});

async function uploadListingImages(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  files: File[]
) {
  const uploaded: string[] = [];

  for (let file of Array.from(files)) {
    if (file.size > 10 * 1024 * 1024) {
      throw new Error(`${file.name} is larger than 10MB.`);
    }
    if (isHeif(file)) {
      file = await convertHeifToJpeg(file);
    }
    file = await optimizeImage(file);
    const path = `${userId}/${Date.now()}-${sanitizeStorageFileName(file.name)}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || "image/webp",
    });
    if (error) throw new Error(error.message);
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    uploaded.push(data.publicUrl);
  }
  return uploaded;
}

export function SellListingForm() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [selectedCountry, setSelectedCountry] = useState("SA");

  const [sellerSession, setSellerSession] = useState<"loading" | "none" | "seller">("loading");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<(typeof PRODUCT_CATEGORIES)[number]["value"]>("furniture");
  const [condition, setCondition] = useState<(typeof PRODUCT_CONDITIONS)[number]["value"]>("good");
  const [price, setPrice] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const [showAccount, setShowAccount] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const urls = imageFiles.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [imageFiles]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || cancelled) {
        if (!cancelled) setSellerSession("none");
        return;
      }
      const { data: profile } = (await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single()) as { data: { role: string } | null };
      if (profile?.role !== "agent") {
        if (!cancelled) setSellerSession("none");
        return;
      }
      const { data: agent } = (await supabase
        .from("agents")
        .select("agent_type, status")
        .eq("profile_id", user.id)
        .single()) as { data: { agent_type: string; status: string } | null };
      if (agent?.agent_type === "seller" && agent?.status === "approved") {
        if (!cancelled) setSellerSession("seller");
      } else if (!cancelled) setSellerSession("none");
    })();
    return () => {
      cancelled = true;
    };
  }, [supabase]);

  const onPickImages = (list: FileList | null) => {
    if (!list?.length) return;
    const next = [...imageFiles, ...Array.from(list)];
    if (next.length > 20) {
      toast.error("Maximum 20 photos.");
      return;
    }
    setImageFiles(next);
  };

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sellerSession === "seller") return;

    const listingParsed = productSchema.safeParse({
      title,
      description,
      category,
      condition,
      price: Number(price),
      city,
      district: district.trim() || null,
      images: [],
    });
    if (!listingParsed.success) {
      toast.error(listingParsed.error.issues[0]?.message || "Check your listing details.");
      return;
    }

    if (!showAccount) {
      toast.message("Scroll to the account section and fill your details, or tap “Continue” below.");
      return;
    }

    const accountParsed = sellAccountSchema.safeParse({
      full_name: fullName,
      email,
      password,
      phone,
    });
    if (!accountParsed.success) {
      toast.error(accountParsed.error.issues[0]?.message || "Check your account details.");
      return;
    }

    const acc = accountParsed.data;

    setIsSubmitting(true);
    try {
      const {
        data: { user: existingUser },
      } = await supabase.auth.getUser();
      if (existingUser) {
        const { data: profile } = (await supabase
          .from("profiles")
          .select("role")
          .eq("id", existingUser.id)
          .single()) as { data: { role: string } | null };
        if (profile?.role === "agent") {
          const { data: agent } = (await supabase
            .from("agents")
            .select("agent_type, status")
            .eq("profile_id", existingUser.id)
            .single()) as { data: { agent_type: string; status: string } | null };
          if (agent?.agent_type === "seller" && agent?.status === "approved") {
            if (imageFiles.length === 0) {
              toast.error("Add at least one photo to publish.");
              return;
            }
            const urls = await uploadListingImages(supabase, existingUser.id, imageFiles);
            const res = await fetch("/api/agent/products", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...listingParsed.data,
                images: urls,
              }),
            });
            const json = (await res.json()) as { error?: string; id?: string };
            if (!res.ok) throw new Error(json.error || "Could not create listing");
            toast.success("Listing published.");
            router.push(json.id ? `/products/${json.id}` : "/agent/products");
            return;
          }
        }
        toast.error("You are signed in with an account that cannot list products here. Sign out and try again, or use the agent dashboard.");
        return;
      }

      const meta: Record<string, unknown> = {
        full_name: acc.full_name,
        phone: acc.phone,
        role: "agent",
        agent_type: "seller",
        license_number: null,
      };

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: acc.email,
        password: acc.password,
        options: { data: meta },
      });

      if (signUpError) {
        toast.error(signUpError.message || "Sign up failed");
        return;
      }

      const userId = signUpData.user?.id;
      if (!userId) {
        toast.error("Signup succeeded but user id is missing. Please try again.");
        return;
      }

      const session = await supabase.auth.getSession();
      const hasSession = Boolean(session?.data?.session);

      if (!hasSession) {
        const afterRes = await fetch("/api/agents/after-signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            email: acc.email,
            agent_type: "seller",
            company_name: null,
            license_number: null,
            document_url: null,
            bio: null,
          }),
        });
        const afterJson = (await afterRes.json().catch(() => ({}))) as { error?: string };
        if (!afterRes.ok) {
          throw new Error(afterJson.error || "Could not complete seller registration.");
        }

        const draftCandidate = {
          title: listingParsed.data.title,
          description: listingParsed.data.description,
          category: listingParsed.data.category,
          condition: listingParsed.data.condition,
          price: String(price),
          city: listingParsed.data.city,
          district: listingParsed.data.district ?? null,
        };
        const draftParsed = sellListingDraftSchema.safeParse(draftCandidate);
        if (draftParsed.success) {
          sessionStorage.setItem(SELL_LISTING_DRAFT_STORAGE_KEY, JSON.stringify(draftParsed.data));
        }

        toast.success(
          "Verify your email, then sign in to upload photos and publish. Your listing text is saved for when you return."
        );
        window.location.href = "/login?redirect=/agent/products/new";
        return;
      }

      const agentRes = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agent_type: "seller",
          company_name: null,
          license_number: null,
          document_url: null,
          bio: null,
        }),
      });
      const agentJson = (await agentRes.json().catch(() => ({}))) as { error?: string };
      if (!agentRes.ok) {
        throw new Error(agentJson.error || "Could not activate seller account.");
      }

      if (imageFiles.length === 0) {
        toast.message("Add at least one product photo to publish.");
        return;
      }

      const urls = await uploadListingImages(supabase, userId, imageFiles);
      const productRes = await fetch("/api/agent/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...listingParsed.data,
          images: urls,
        }),
      });
      const productJson = (await productRes.json()) as { error?: string; id?: string };
      if (!productRes.ok) throw new Error(productJson.error || "Could not create listing");

      toast.success("Your listing is live.");
      router.push(productJson.id ? `/products/${productJson.id}` : "/agent/products");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (sellerSession === "loading") {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (sellerSession === "seller") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>You are already signed in as a seller</CardTitle>
          <CardDescription>Add a new product from your dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/agent/products/new">Create product</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <form className="space-y-8" onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Your listing</CardTitle>
          <CardDescription>Describe what you are selling. No payment required.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sell-title">Title</Label>
            <Input
              id="sell-title"
              value={title}
              onChange={(ev) => setTitle(ev.target.value)}
              maxLength={255}
              placeholder="e.g., Modern dining table"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sell-desc">Description</Label>
            <Textarea
              id="sell-desc"
              value={description}
              onChange={(ev) => setDescription(ev.target.value)}
              rows={4}
              maxLength={5000}
              placeholder="Condition, dimensions, what is included…"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as typeof category)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_CATEGORIES.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Condition</Label>
              <Select value={condition} onValueChange={(v) => setCondition(v as typeof condition)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_CONDITIONS.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="sell-price">Price (SAR)</Label>
              <Input
                id="sell-price"
                type="number"
                min={0}
                value={price}
                onChange={(ev) => setPrice(ev.target.value)}
                placeholder="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sell-city">City</Label>
              <Input
                id="sell-city"
                value={city}
                onChange={(ev) => setCity(ev.target.value)}
                maxLength={100}
                placeholder="e.g., Riyadh"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sell-district">District (optional)</Label>
            <Input
              id="sell-district"
              value={district}
              onChange={(ev) => setDistrict(ev.target.value)}
              maxLength={150}
              placeholder="Neighborhood or district"
            />
          </div>

          <div className="space-y-2">
            <Label>Photos</Label>
            <p className="text-sm text-muted-foreground">
              If you must confirm your email before signing in, you will re-select photos after login. Your text details are saved automatically.
            </p>
            <Input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif,.hif"
              multiple
              onChange={(ev) => {
                onPickImages(ev.target.files);
                ev.target.value = "";
              }}
            />
            {previews.length > 0 && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {previews.map((src, index) => (
                  <div key={src} className="relative aspect-square overflow-hidden rounded-lg border bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" className="h-full w-full object-cover" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute right-1 top-1 h-7 px-2 text-xs"
                      onClick={() => removeImage(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {!showAccount && (
            <Button type="button" variant="secondary" onClick={() => setShowAccount(true)}>
              Continue — create your free account
            </Button>
          )}
        </CardContent>
      </Card>

      {showAccount && (
        <Card>
          <CardHeader>
            <CardTitle>Free seller account</CardTitle>
            <CardDescription>Same email and password you will use to sign in and manage listings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sell-name">Full name</Label>
              <Input id="sell-name" value={fullName} onChange={(ev) => setFullName(ev.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sell-email">Email</Label>
              <Input id="sell-email" type="email" value={email} onChange={(ev) => setEmail(ev.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sell-password">Password</Label>
              <Input
                id="sell-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(ev) => setPassword(ev.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Country</Label>
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <PhoneInput
              label="WhatsApp number (required)"
              value={phone}
              onChange={setPhone}
              onCountryChange={setSelectedCountry}
              selectedCountry={selectedCountry}
              showHelper
            />

            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Working…
                </>
              ) : (
                "Create account & publish listing"
              )}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link className="font-medium text-primary underline" href="/login?redirect=/agent/products/new">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      )}
    </form>
  );
}
