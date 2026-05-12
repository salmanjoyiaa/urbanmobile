"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PhoneInput } from "@/components/ui/phone-input";
import { useCreateLeadRequest } from "@/queries/leads";
import { buyRequestPublicFormSchema, type BuyRequestPublicFormInput, type BuyRequestInput } from "@/lib/validators";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

type BuyRequestFormProps = {
  productId: string;
  productTitle: string;
};

export function BuyRequestForm({ productId, productTitle }: BuyRequestFormProps) {
  const createLead = useCreateLeadRequest();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<BuyRequestPublicFormInput>({
    resolver: zodResolver(buyRequestPublicFormSchema),
    mode: "onTouched",
    defaultValues: {
      buyer_name: "",
      buyer_phone: "",
    },
  });

  const onSubmit = async (values: BuyRequestPublicFormInput) => {
    try {
      const result = await createLead.mutateAsync({
        product_id: productId,
        buyer_name: values.buyer_name,
        buyer_phone: values.buyer_phone,
      } satisfies BuyRequestInput);

      if (result.whatsapp_url) {
        toast.success("Opening WhatsApp…");
        window.location.assign(result.whatsapp_url);
      } else {
        toast.error("Could not open WhatsApp. Please try again.");
      }
    } catch (error) {
      const messageText = error instanceof Error ? error.message : "Could not submit request";
      toast.error(messageText);
    }
  };

  const isLoading = isSubmitting || createLead.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact on WhatsApp</CardTitle>
        <CardDescription>
          We will save your details and open WhatsApp with a message about {productTitle}. The seller and our team are notified.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="buyer-name">Full name</Label>
            <Input
              id="buyer-name"
              {...register("buyer_name")}
              disabled={isLoading}
              placeholder="Your full name"
            />
            {errors.buyer_name && (
              <p className="text-sm text-destructive">{errors.buyer_name.message}</p>
            )}
          </div>
          <Controller
            name="buyer_phone"
            control={control}
            render={({ field }) => (
              <PhoneInput
                label="Your WhatsApp number"
                value={field.value}
                onChange={field.onChange}
                error={errors.buyer_phone}
                disabled={isLoading}
                showHelper={true}
              />
            )}
          />

          <Button type="submit" disabled={isLoading} className="w-full" size="lg">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : (
              "Contact on WhatsApp"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
