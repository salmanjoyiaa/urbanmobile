"use client";

import { useEffect, useMemo, useState } from "react";
import { addDays, format } from "date-fns";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { PhoneInput } from "@/components/ui/phone-input";
import { SlotGrid } from "@/components/visit/slot-grid";
import { useVisitSlots, useCreateVisitRequest } from "@/queries/visits";
import { useRealtimeSlots } from "@/hooks/use-realtime-slots";
import { isFutureDate, isWeekday } from "@/lib/slots";
import { SuccessState } from "@/components/ui/success-state";
import { toast } from "sonner";

const contactSchema = z.object({
  visitor_name: z.string().min(2, "Name must be at least 2 characters").max(100),
  visitor_email: z.string().min(1, "Email is required").email("Valid email is required"),
  visitor_phone: z.string().regex(/^\+\d{10,15}$/, "Invalid phone number format"),
  visitor_message: z.string().max(5000).optional(),
});

type ContactInput = z.infer<typeof contactSchema>;

type VisitSchedulerProps = {
  propertyId: string;
  propertyTitle: string;
};

export function VisitScheduler({ propertyId, propertyTitle }: VisitSchedulerProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [slot, setSlot] = useState<string | null>(null);

  const dateKey = useMemo(() => (date ? format(date, "yyyy-MM-dd") : ""), [date]);
  const { data: slots = [], isLoading: loadingSlots } = useVisitSlots(propertyId, dateKey, !!dateKey);
  const availableSlots = useMemo(() => slots.filter((s) => s.available), [slots]);
  const createVisit = useCreateVisitRequest();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset: resetForm,
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    mode: "onTouched",
    defaultValues: {
      visitor_name: "",
      visitor_email: "",
      visitor_phone: "",
      visitor_message: "",
    },
  });

  useRealtimeSlots({
    propertyId,
    date: dateKey,
    enabled: Boolean(dateKey),
  });

  useEffect(() => {
    setSlot(null);
  }, [dateKey]);

  const isDateDisabled = (day: Date) => !isFutureDate(day) || !isWeekday(day);

  const onContactSubmit = async (values: ContactInput) => {
    if (!date || !slot) {
      toast.error("Select a date and time slot first.");
      return;
    }

    try {
      await createVisit.mutateAsync({
        property_id: propertyId,
        visitor_name: values.visitor_name,
        visitor_email: values.visitor_email,
        visitor_phone: values.visitor_phone,
        visit_date: dateKey,
        visit_time: slot,
      });

      toast.success("Visit request submitted.");
      setStep(4);
    } catch (error) {
      const messageText = error instanceof Error ? error.message : "Could not submit request";
      toast.error(messageText);
    }
  };

  const reset = () => {
    setStep(1);
    setDate(undefined);
    setSlot(null);
    resetForm();
  };

  if (step === 4) {
    return (
      <Card>
        <CardContent className="pt-6">
          <SuccessState
            title="Visit Scheduled!"
            description={`Your visit for ${propertyTitle} has been requested. The agent will confirm shortly.`}
            actionLabel="Book Another"
            actionHref="#"
            className="p-0"
          />
          <div className="mt-6 text-center">
            <Button variant="outline" onClick={reset}>
              Schedule another visit
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

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
            <p className="text-sm text-muted-foreground">
              We&apos;re open Mon–Fri. Select a day to see available times.
            </p>
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
            {date && (
              <p className="text-base font-semibold text-foreground">
                {format(date, "EEEE, MMM d, yyyy")}
              </p>
            )}
            {loadingSlots ? (
              <div className="flex items-center text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading slots...
              </div>
            ) : availableSlots.length === 0 && slots.length > 0 ? (
              <p className="text-sm text-muted-foreground">
                No slots available on this day. Try another date.
              </p>
            ) : availableSlots.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No slots available. Select a weekday to see times.
              </p>
            ) : (
              <SlotGrid slots={availableSlots} selectedSlot={slot} onSelect={setSlot} />
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
          <form onSubmit={handleSubmit(onContactSubmit)} className="space-y-4">
            {date && slot && (
              <p className="text-sm font-medium text-muted-foreground">
                You&apos;re booking: {format(date, "EEEE, MMM d")} at {slot.slice(0, 5)}
              </p>
            )}
            <div className="space-y-2">
              <Label htmlFor="visitor-name">Full name</Label>
              <Input id="visitor-name" {...register("visitor_name")} disabled={createVisit.isPending} />
              {errors.visitor_name && (
                <p className="text-sm text-destructive">{errors.visitor_name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="visitor-email">Email</Label>
              <Input id="visitor-email" type="email" {...register("visitor_email")} disabled={createVisit.isPending} />
              {errors.visitor_email && (
                <p className="text-sm text-destructive">{errors.visitor_email.message}</p>
              )}
            </div>
            <Controller
              name="visitor_phone"
              control={control}
              render={({ field }) => (
                <PhoneInput
                  label="WhatsApp Number"
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.visitor_phone}
                  disabled={createVisit.isPending}
                  showHelper={true}
                />
              )}
            />
            <div className="space-y-2">
              <Label htmlFor="visitor-message">Message (optional)</Label>
              <Textarea id="visitor-message" {...register("visitor_message")} disabled={createVisit.isPending} />
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button type="submit" disabled={createVisit.isPending}>
                {createVisit.isPending ? "Submitting..." : "Submit visit request"}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
