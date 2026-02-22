"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreateLeadRequest } from "@/queries/leads";
import { buyRequestSchema, type BuyRequestInput } from "@/lib/validators";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { SuccessState } from "@/components/ui/success-state";

type BuyRequestFormProps = {
  productId: string;
  productTitle: string;
};

export function BuyRequestForm({ productId, productTitle }: BuyRequestFormProps) {
  const [isSuccess, setIsSuccess] = useState(false);
  const createLead = useCreateLeadRequest();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<BuyRequestInput>({
    resolver: zodResolver(buyRequestSchema),
    mode: "onTouched",
    defaultValues: {
      product_id: productId,
      buyer_name: "",
      buyer_email: "",
      buyer_phone: "",
      message: "",
    },
  });

  const onSubmit = async (values: BuyRequestInput) => {
    try {
      await createLead.mutateAsync({
        product_id: productId,
        buyer_name: values.buyer_name,
        buyer_email: values.buyer_email,
        buyer_phone: values.buyer_phone,
        message: values.message || undefined,
      });

      toast.success("Buy request submitted successfully!");
      setIsSuccess(true);
      reset();
    } catch (error) {
      const messageText = error instanceof Error ? error.message : "Could not submit request";
      toast.error(messageText);
    }
  };

  const isLoading = isSubmitting || createLead.isPending;

  if (isSuccess) {
    return (
      <Card>
        <CardContent className="pt-6">
          <SuccessState
            title="Request Sent!"
            description={`Your interest in ${productTitle} has been sent to the seller.`}
            actionLabel="Browse More"
            actionHref="/products"
            className="p-0"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request to buy</CardTitle>
        <CardDescription>Send your interest for {productTitle}.</CardDescription>
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
          <div className="space-y-2">
            <Label htmlFor="buyer-email">Email</Label>
            <Input
              id="buyer-email"
              type="email"
              {...register("buyer_email")}
              disabled={isLoading}
              placeholder="your@email.com"
            />
            {errors.buyer_email && (
              <p className="text-sm text-destructive">{errors.buyer_email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="buyer-phone">WhatsApp Number</Label>
            <Input
              id="buyer-phone"
              {...register("buyer_phone")}
              disabled={isLoading}
              placeholder="05XXX or +923XXX"
            />
            {errors.buyer_phone && (
              <p className="text-sm text-destructive">{errors.buyer_phone.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="buyer-message">Message (optional)</Label>
            <Textarea
              id="buyer-message"
              {...register("message")}
              disabled={isLoading}
              placeholder="Tell the seller more about your interest..."
              rows={3}
            />
            {errors.message && (
              <p className="text-sm text-destructive">{errors.message.message}</p>
            )}
          </div>

          <Button type="submit" disabled={isLoading} className="w-full" size="lg">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit buy request"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
