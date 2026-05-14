"use client";

import { useState } from "react";
import { MessageCircle, Phone, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRecordProductContact } from "@/queries/product-contact";

type ProductContactActionsProps = {
  productId: string;
  sellerPhone: string | null;
};

type ContactChannel = "whatsapp" | "phone";

const buttonLayoutClass =
  "min-h-11 w-full shrink-0 rounded-lg px-4 py-3 text-base sm:h-10 sm:min-h-0 sm:flex-1 sm:px-6 sm:py-2";

export function ProductContactActions({ productId, sellerPhone }: ProductContactActionsProps) {
  const record = useRecordProductContact(productId);
  const [activeChannel, setActiveChannel] = useState<ContactChannel | null>(null);
  const disabled = !sellerPhone?.trim();
  const requestInFlight = activeChannel !== null;

  const run = async (channel: ContactChannel) => {
    if (disabled) {
      toast.error("Seller phone is not available for this listing.");
      return;
    }
    setActiveChannel(channel);
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
    } finally {
      setActiveChannel(null);
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
          className={buttonLayoutClass}
          disabled={disabled || requestInFlight}
          onClick={() => run("whatsapp")}
        >
          {activeChannel === "whatsapp" ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <MessageCircle className="mr-2 h-4 w-4" />
          )}
          Contact on WhatsApp
        </Button>
        <Button
          type="button"
          size="lg"
          variant="outline"
          className={buttonLayoutClass}
          disabled={disabled || requestInFlight}
          onClick={() => run("phone")}
        >
          {activeChannel === "phone" ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Phone className="mr-2 h-4 w-4" />
          )}
          Call
        </Button>
      </CardContent>
    </Card>
  );
}
