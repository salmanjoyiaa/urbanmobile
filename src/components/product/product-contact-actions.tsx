"use client";

import { MessageCircle, Phone, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRecordProductContact } from "@/queries/product-contact";

type ProductContactActionsProps = {
  productId: string;
  sellerPhone: string | null;
};

export function ProductContactActions({ productId, sellerPhone }: ProductContactActionsProps) {
  const record = useRecordProductContact(productId);
  const busy = record.isPending;
  const disabled = !sellerPhone?.trim();

  const run = async (channel: "whatsapp" | "phone") => {
    if (disabled) {
      toast.error("Seller phone is not available for this listing.");
      return;
    }
    try {
      const result = await record.mutateAsync(channel);
      if (channel === "whatsapp" && result.whatsapp_url) {
        toast.success("Opening WhatsApp…");
        window.location.assign(result.whatsapp_url);
      } else if (channel === "phone" && result.tel_url) {
        window.location.assign(result.tel_url);
      } else {
        toast.error("Could not open link. Please try again.");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact seller</CardTitle>
        <CardDescription>
          Reach the seller directly. Each action is counted for seller and admin analytics only — no customer details are
          stored.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 sm:flex-row">
        <Button
          type="button"
          size="lg"
          className="flex-1"
          disabled={disabled || busy}
          onClick={() => run("whatsapp")}
        >
          {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MessageCircle className="mr-2 h-4 w-4" />}
          Contact on WhatsApp
        </Button>
        <Button
          type="button"
          size="lg"
          variant="outline"
          className="flex-1"
          disabled={disabled || busy}
          onClick={() => run("phone")}
        >
          {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Phone className="mr-2 h-4 w-4" />}
          Call
        </Button>
      </CardContent>
    </Card>
  );
}
