"use client";

import { useState } from "react";
import { addDays } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { isFutureDate } from "@/lib/slots";

function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

type AvailabilityCalendarProps = {
  blockedDates: string[];
};

export function AvailabilityCalendar({ blockedDates }: AvailabilityCalendarProps) {
  const [month, setMonth] = useState(new Date());
  const blockedSet = new Set(blockedDates || []);

  const isBlocked = (date: Date) => blockedSet.has(toDateStr(date));
  const isAvailable = (date: Date) =>
    isFutureDate(date) && !blockedSet.has(toDateStr(date));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Availability at a glance</CardTitle>
        <CardDescription>
          Green = available to book · Red = blocked by property agent
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <Calendar
          mode="single"
          month={month}
          onMonthChange={setMonth}
          fromDate={new Date()}
          toDate={addDays(new Date(), 60)}
          disabled={() => true}
          modifiers={{
            blocked: isBlocked,
            available: isAvailable,
          }}
          modifiersClassNames={{
            blocked: "availability-blocked",
            available: "availability-available",
          }}
          className="rounded-lg border-0 p-0 [&_.availability-blocked]:bg-red-500 [&_.availability-blocked]:text-white [&_.availability-blocked]:font-semibold [&_.availability-available]:bg-green-600 [&_.availability-available]:text-white [&_.availability-available]:font-medium"
        />
        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-4 w-4 rounded bg-green-600" aria-hidden />
            Available
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-4 w-4 rounded bg-red-500" aria-hidden />
            Blocked by property agent
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
