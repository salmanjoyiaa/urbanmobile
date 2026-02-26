"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";

type BlockedDatesCalendarProps = {
  value: string[];
  onChange?: (dates: string[]) => void;
  readOnly?: boolean;
};

function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function BlockedDatesCalendar({
  value,
  onChange,
  readOnly = false,
}: BlockedDatesCalendarProps) {
  const [month, setMonth] = useState(new Date());

  const blockedSet = new Set(value);
  const selectedDates = value.map(parseDate);

  const handleDayClick = (day: Date) => {
    if (readOnly || !onChange) return;
    const str = toDateStr(day);
    const next = blockedSet.has(str)
      ? value.filter((d) => d !== str)
      : [...value, str];
    onChange(next.sort());
  };

  return (
    <div className="space-y-2">
      {!readOnly && (
        <p className="text-xs text-muted-foreground">
          Click dates to block/unblock them. Blocked dates appear highlighted.
        </p>
      )}
      <Calendar
        mode="multiple"
        selected={selectedDates}
        onDayClick={readOnly ? undefined : handleDayClick}
        month={month}
        onMonthChange={setMonth}
        disabled={readOnly ? undefined : { before: new Date() }}
        className="rounded-lg border p-3"
      />
      {readOnly && blockedSet.size > 0 && (
        <p className="text-xs text-muted-foreground">
          {blockedSet.size} date{blockedSet.size > 1 ? "s" : ""} blocked
        </p>
      )}
    </div>
  );
}
