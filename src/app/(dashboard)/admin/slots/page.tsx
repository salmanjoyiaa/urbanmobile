"use client";

import { useState, useEffect, useCallback } from "react";
import { format, addDays } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { generateDailySlots, formatSlotLabel } from "@/lib/slots";

type BlockedSlot = { id: string; date: string; time: string };

export default function AdminSlotsPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [blocked, setBlocked] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);

  const dateStr = date ? format(date, "yyyy-MM-dd") : "";
  const allSlots = generateDailySlots();

  const fetchBlocked = useCallback(async () => {
    if (!dateStr) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/slots?date=${dateStr}`);
      const data = await res.json();
      const set = new Set<string>();
      (data.blocked || []).forEach((s: BlockedSlot) => set.add(s.time));
      setBlocked(set);
    } catch {
      toast.error("Failed to load blocked slots");
    } finally {
      setLoading(false);
    }
  }, [dateStr]);

  useEffect(() => {
    fetchBlocked();
  }, [fetchBlocked]);

  const toggle = async (time: string) => {
    setToggling(time);
    try {
      const isBlocked = blocked.has(time);
      if (isBlocked) {
        await fetch(`/api/admin/slots?date=${dateStr}&time=${time}`, { method: "DELETE" });
        setBlocked((prev) => { const n = new Set(prev); n.delete(time); return n; });
        toast.success(`Slot ${formatSlotLabel(time)} unblocked`);
      } else {
        await fetch("/api/admin/slots", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date: dateStr, time }),
        });
        setBlocked((prev) => new Set(prev).add(time));
        toast.success(`Slot ${formatSlotLabel(time)} blocked`);
      }
    } catch {
      toast.error("Failed to update slot");
    } finally {
      setToggling(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Visit Hours</h1>
        <p className="text-sm text-muted-foreground">Block or unblock specific visit time slots by date.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[auto_1fr]">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Select Date</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              fromDate={new Date()}
              toDate={addDays(new Date(), 90)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Slots for {dateStr ? format(new Date(`${dateStr}T12:00:00`), "EEEE, MMM d, yyyy") : "—"}
            </CardTitle>
            <CardDescription>Click a slot to toggle block/unblock. Red = blocked.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-8 justify-center">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading...
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {allSlots.map((time) => {
                  const isBlocked = blocked.has(time);
                  const isToggling = toggling === time;
                  return (
                    <Button
                      key={time}
                      variant={isBlocked ? "destructive" : "outline"}
                      className="h-11 text-sm font-medium"
                      disabled={isToggling}
                      onClick={() => toggle(time)}
                    >
                      {isToggling ? <Loader2 className="h-4 w-4 animate-spin" /> : formatSlotLabel(time)}
                    </Button>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
