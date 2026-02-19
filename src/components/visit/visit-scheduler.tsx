"use client";

import { useEffect, useMemo, useState } from "react";
import { addDays, format } from "date-fns";
import { Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SlotGrid } from "@/components/visit/slot-grid";
import { useVisitSlots, useCreateVisitRequest } from "@/queries/visits";
import { useRealtimeSlots } from "@/hooks/use-realtime-slots";
import { isFutureDate, isWeekday } from "@/lib/slots";
import { toast } from "sonner";

type VisitSchedulerProps = {
  propertyId: string;
  propertyTitle: string;
};

export function VisitScheduler({ propertyId, propertyTitle }: VisitSchedulerProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [slot, setSlot] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+966");
  const [message, setMessage] = useState("");

  const dateKey = useMemo(() => (date ? format(date, "yyyy-MM-dd") : ""), [date]);
  const { data: slots = [], isLoading: loadingSlots } = useVisitSlots(propertyId, dateKey, !!dateKey);
  const createVisit = useCreateVisitRequest();

  useRealtimeSlots({
    propertyId,
    date: dateKey,
    enabled: Boolean(dateKey),
  });

  useEffect(() => {
    setSlot(null);
  }, [dateKey]);

  const isDateDisabled = (day: Date) => !isFutureDate(day) || !isWeekday(day);

  const submit = async () => {
    if (!date || !slot) {
      toast.error("Select a date and time slot first.");
      return;
    }

    if (!name || !email || !phone) {
      toast.error("Please fill name, email, and phone.");
      return;
    }

    try {
      await createVisit.mutateAsync({
        property_id: propertyId,
        visitor_name: name,
        visitor_email: email,
        visitor_phone: phone,
        visit_date: dateKey,
        visit_time: slot,
      });

      toast.success("Visit request submitted.");
      setStep(1);
      setDate(undefined);
      setSlot(null);
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
        <CardTitle>Schedule a visit</CardTitle>
        <CardDescription>Book a time for {propertyTitle}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center gap-2 text-sm">
          <div className={`rounded-full px-3 py-1 ${step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted"}`}>1. Date</div>
          <div className={`rounded-full px-3 py-1 ${step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted"}`}>2. Slot</div>
          <div className={`rounded-full px-3 py-1 ${step >= 3 ? "bg-primary text-primary-foreground" : "bg-muted"}`}>3. Contact</div>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(selected) => setDate(selected)}
              disabled={isDateDisabled}
              fromDate={new Date()}
              toDate={addDays(new Date(), 45)}
            />
            <Button disabled={!date} onClick={() => setStep(2)}>
              Continue to slots
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            {loadingSlots ? (
              <div className="flex items-center text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading slots...
              </div>
            ) : (
              <SlotGrid slots={slots} selectedSlot={slot} onSelect={setSlot} />
            )}

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button disabled={!slot} onClick={() => setStep(3)}>
                Continue to details
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="visitor-name">Full name</Label>
              <Input id="visitor-name" value={name} onChange={(event) => setName(event.target.value)} disabled={createVisit.isPending} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="visitor-email">Email</Label>
              <Input id="visitor-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} disabled={createVisit.isPending} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="visitor-phone">Phone (+966...)</Label>
              <Input id="visitor-phone" placeholder="+966XXXXXXXXX" value={phone} onChange={(event) => setPhone(event.target.value)} disabled={createVisit.isPending} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="visitor-message">Message (optional)</Label>
              <Textarea id="visitor-message" value={message} onChange={(event) => setMessage(event.target.value)} disabled={createVisit.isPending} />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button onClick={submit} disabled={createVisit.isPending}>
                {createVisit.isPending ? "Submitting..." : "Submit visit request"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
