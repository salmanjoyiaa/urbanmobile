"use client";

import { useState, useEffect, useCallback } from "react";
import { format, addDays } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { generateSlotsInTimeframe, formatSlotLabel } from "@/lib/slots";
import { createClient } from "@/lib/supabase/client";

type BlockedSlot = { id: string; date: string; time: string };
type Property = { id: string; title: string; status: string };

type VisitHourRow = {
  weekday: number;
  is_open: boolean;
  start_time: string;
  end_time: string;
};

const WEEK_DAYS = [
  { key: 0, label: "Sunday" },
  { key: 1, label: "Monday" },
  { key: 2, label: "Tuesday" },
  { key: 3, label: "Wednesday" },
  { key: 4, label: "Thursday" },
  { key: 5, label: "Friday" },
  { key: 6, label: "Saturday" },
] as const;

const defaultSchedule = (): VisitHourRow[] =>
  WEEK_DAYS.map((day) => ({
    weekday: day.key,
    is_open: day.key >= 1 && day.key <= 5,
    start_time: "08:00",
    end_time: "19:00",
  }));

export default function AdminSlotsPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("");
  const [schedule, setSchedule] = useState<VisitHourRow[]>(defaultSchedule());
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [blocked, setBlocked] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [loadingProps, setLoadingProps] = useState(true);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const dateStr = date ? format(date, "yyyy-MM-dd") : "";

  const selectedSchedule = date
    ? schedule.find((item) => item.weekday === date.getDay())
    : null;

  const allSlots = selectedSchedule?.is_open
    ? generateSlotsInTimeframe(selectedSchedule.start_time, selectedSchedule.end_time)
    : [];

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("properties")
          .select("id, title, status")
          .order("title");
        const list = (data || []) as Property[];
        setProperties(list);
        if (list.length > 0) {
          setSelectedPropertyId(list[0].id);
        }
      } catch {
        toast.error("Failed to load properties");
      } finally {
        setLoadingProps(false);
      }
    };
    fetchProperties();
  }, []);

  const fetchSchedule = useCallback(async () => {
    if (!selectedPropertyId) return;
    setLoadingSchedule(true);
    try {
      const res = await fetch(`/api/admin/visit-hours?property_id=${selectedPropertyId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load schedule");

      const rows = (data.schedule || []) as VisitHourRow[];
      if (rows.length === 0) {
        setSchedule(defaultSchedule());
      } else {
        const merged = WEEK_DAYS.map((day) => rows.find((r) => r.weekday === day.key) || {
          weekday: day.key,
          is_open: false,
          start_time: "08:00",
          end_time: "19:00",
        });
        setSchedule(merged);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load schedule");
    } finally {
      setLoadingSchedule(false);
    }
  }, [selectedPropertyId]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  const fetchBlocked = useCallback(async () => {
    if (!dateStr || !selectedPropertyId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/slots?date=${dateStr}&property_id=${selectedPropertyId}`);
      const data = await res.json();
      const set = new Set<string>();
      (data.blocked || []).forEach((s: BlockedSlot) => set.add(s.time));
      setBlocked(set);
    } catch {
      toast.error("Failed to load blocked slots");
    } finally {
      setLoading(false);
    }
  }, [dateStr, selectedPropertyId]);

  useEffect(() => {
    fetchBlocked();
  }, [fetchBlocked]);

  const toggle = async (time: string) => {
    if (!selectedPropertyId) return;
    setToggling(time);
    try {
      const isBlocked = blocked.has(time);

      if (isBlocked) {
        await fetch(`/api/admin/slots?date=${dateStr}&time=${time}&property_id=${selectedPropertyId}`, { method: "DELETE" });
        setBlocked((prev) => { const n = new Set(prev); n.delete(time); return n; });
        toast.success(`${formatSlotLabel(time)} unblocked`);
      } else {
        await fetch("/api/admin/slots", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date: dateStr, time, property_id: selectedPropertyId }),
        });
        setBlocked((prev) => new Set(prev).add(time));
        toast.success(`${formatSlotLabel(time)} blocked`);
      }
    } catch {
      toast.error("Failed to update slot");
    } finally {
      setToggling(null);
    }
  };

  const updateScheduleRow = (weekday: number, patch: Partial<VisitHourRow>) => {
    setSchedule((prev) => prev.map((row) => row.weekday === weekday ? { ...row, ...patch } : row));
  };

  const saveSchedule = async () => {
    if (!selectedPropertyId) return;
    setSavingSchedule(true);
    try {
      const res = await fetch("/api/admin/visit-hours", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ property_id: selectedPropertyId, schedule }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save schedule");
      toast.success("Visit hours updated");
      fetchBlocked();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save schedule");
    } finally {
      setSavingSchedule(false);
    }
  };

  const filteredProperties = search
    ? properties.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()))
    : properties;

  const selectedLabel = properties.find((p) => p.id === selectedPropertyId)?.title || "";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Visit Hours</h1>
        <p className="text-sm text-muted-foreground">
          Select a property and configure open days, start/end hours, and date-level blocked slots.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Select Property</CardTitle>
          <CardDescription>Choose a property to manage visit days and hours.</CardDescription>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          {loadingProps ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading properties...
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Search properties..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex h-9 w-full max-w-sm rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
              <div className="max-h-60 overflow-y-auto rounded-md border p-2 space-y-1">
                {filteredProperties.map((p) => {
                  const checked = selectedPropertyId === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setSelectedPropertyId(p.id);
                        setBlocked(new Set());
                      }}
                      className={`flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors ${checked
                          ? "bg-primary/10 border border-primary text-foreground"
                          : "border border-transparent hover:bg-muted"
                        }`}
                    >
                      <span className="truncate">{p.title}</span>
                      <span className="ml-auto text-xs text-muted-foreground capitalize">{p.status}</span>
                    </button>
                  );
                })}
              </div>
              {selectedPropertyId && (
                <p className="text-sm font-medium text-primary">{selectedLabel}</p>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {selectedPropertyId && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Weekly Visit Schedule</CardTitle>
            <CardDescription>
              Set open/closed day status and visit hours. Customer slots will be generated every 20 minutes within the selected timeframe.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {loadingSchedule ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading schedule...
              </div>
            ) : (
              <div className="space-y-2">
                {schedule.map((row) => (
                  <div key={row.weekday} className="grid grid-cols-1 sm:grid-cols-[180px_110px_1fr_1fr] gap-2 items-center rounded-md border p-2">
                    <div className="text-sm font-medium">{WEEK_DAYS.find((d) => d.key === row.weekday)?.label}</div>
                    <label className="inline-flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={row.is_open}
                        onChange={(e) => updateScheduleRow(row.weekday, { is_open: e.target.checked })}
                      />
                      Open
                    </label>
                    <input
                      type="time"
                      className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                      value={row.start_time.slice(0, 5)}
                      disabled={!row.is_open}
                      onChange={(e) => updateScheduleRow(row.weekday, { start_time: e.target.value })}
                    />
                    <input
                      type="time"
                      className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                      value={row.end_time.slice(0, 5)}
                      disabled={!row.is_open}
                      onChange={(e) => updateScheduleRow(row.weekday, { end_time: e.target.value })}
                    />
                  </div>
                ))}
                <Button onClick={saveSchedule} disabled={savingSchedule}>
                  {savingSchedule ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Save Weekly Schedule
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {selectedPropertyId && (
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
                {selectedLabel} — {dateStr ? format(new Date(`${dateStr}T12:00:00`), "EEEE, MMM d, yyyy") : "—"}
              </CardTitle>
              <CardDescription>
                Click a slot to toggle block/unblock for this date. Red = blocked.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground py-8 justify-center">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading...
                </div>
              ) : !selectedSchedule?.is_open ? (
                <p className="text-sm text-muted-foreground">This day is closed in weekly schedule. Mark it as open above to allow booking.</p>
              ) : allSlots.length === 0 ? (
                <p className="text-sm text-muted-foreground">No slots available for configured timeframe. Adjust start/end time.</p>
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
      )}
    </div>
  );
}
