"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreateLeadRequest } from "@/queries/leads";
import { toast } from "sonner";

type BuyRequestFormProps = {
  productId: string;
  productTitle: string;
};

export function BuyRequestForm({ productId, productTitle }: BuyRequestFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const createLead = useCreateLeadRequest();

  const submit = async () => {
    if (!name || !email || !phone) {
      toast.error("Please fill name, email, and phone.");
      return;
    }

    try {
      await createLead.mutateAsync({
        product_id: productId,
        buyer_name: name,
        buyer_email: email,
        buyer_phone: phone,
        message: message || undefined,
      });

      toast.success("Buy request submitted.");
      setName("");
      setEmail("");
      setPhone("");
      setMessage("");
    } catch (error) {
      const messageText = error instanceof Error ? error.message : "Could not submit request";
      toast.error(messageText);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request to buy</CardTitle>
        <CardDescription>Send your interest for {productTitle}.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="buyer-name">Full name</Label>
          <Input id="buyer-name" value={name} onChange={(event) => setName(event.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="buyer-email">Email</Label>
          <Input
            id="buyer-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="buyer-phone">Phone (+966...)</Label>
          <Input id="buyer-phone" value={phone} onChange={(event) => setPhone(event.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="buyer-message">Message (optional)</Label>
          <Textarea
            id="buyer-message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
        </div>

        <Button onClick={submit} disabled={createLead.isPending} className="w-full">
          {createLead.isPending ? "Submitting..." : "Submit buy request"}
        </Button>
      </CardContent>
    </Card>
  );
}
