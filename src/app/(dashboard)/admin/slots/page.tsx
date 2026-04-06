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
import { VISIT_BOOKING_LEAD_HOURS, VISIT_BOOKING_WINDOW_DAYS } from "@/lib/constants";

type BlockedSlot = { id: string; date: string; time: string };
type Property = { id: string; title: string; status: string; property_ref: string | null };

type VisitHourRow = {
  weekday: number;
  is_open: boolean;
  start_time: string;
  end_time: string;
};

const DEFAULT_PROPERTY_STATUSES = ["available", "rented", "reserved", "sold"];

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
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<Set<string>>(new Set());
  const [applyMode, setApplyMode] = useState<"selected" | "filtered">("selected");
  const [schedule, setSchedule] = useState<VisitHourRow[]>(defaultSchedule());
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [blocked, setBlocked] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [loadingProps, setLoadingProps] = useState(true);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Set<string>>(new Set(DEFAULT_PROPERTY_STATUSES));
  const [bulkDays, setBulkDays] = useState<Set<number>>(new Set([1, 2, 3, 4, 5]));
  const [bulkOpen, setBulkOpen] = useState(true);
  const [bulkStartTime, setBulkStartTime] = useState("08:00");
  const [bulkEndTime, setBulkEndTime] = useState("19:00");
  const [bookingWindowDays, setBookingWindowDays] = useState<number>(VISIT_BOOKING_WINDOW_DAYS);
  const [bookingLeadHours, setBookingLeadHours] = useState<number>(VISIT_BOOKING_LEAD_HOURS);
  const [savingBookingWindow, setSavingBookingWindow] = useState(false);
  const [batchApplying, setBatchApplying] = useState(false);
  const [batchFailures, setBatchFailures] = useState<Array<{ property_id: string; title?: string; reason: string }>>([]);

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
          .select("id, title, status, property_ref")
          .order("title");
        const list = (data || []) as Property[];
        setProperties(list);
        // Don't auto-select — let admin choose explicitly
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
        const merged = WEEK_DAYS.map((day) => {
          const found = rows.find((r) => r.weekday === day.key);
          if (found) {
            return {
              ...found,
              start_time: found.start_time.slice(0, 5),
              end_time: found.end_time.slice(0, 5),
            };
          }
          return {
            weekday: day.key,
            is_open: false,
            start_time: "08:00",
            end_time: "19:00",
          };
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

  useEffect(() => {
    const fetchVisitSettings = async () => {
      try {
        const res = await fetch("/api/admin/visit-settings");
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load booking settings");
        if (typeof data.booking_window_days === "number") {
          setBookingWindowDays(data.booking_window_days);
        }
        if (typeof data.booking_lead_hours === "number") {
          setBookingLeadHours(data.booking_lead_hours);
        }
      } catch {
        // keep fallback
      }
    };

    fetchVisitSettings();
  }, []);

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

  const togglePropertySelection = (propertyId: string) => {
    setSelectedPropertyIds((prev) => {
      const next = new Set(prev);
      if (next.has(propertyId)) {
        next.delete(propertyId);
      } else {
        next.add(propertyId);
      }
      return next;
    });
  };

  const saveSchedule = async () => {
    if (!selectedPropertyId) return;
    setSavingSchedule(true);
    try {
      const normalizedSchedule = schedule.map((row) => ({
        ...row,
        start_time: row.start_time.slice(0, 5),
        end_time: row.end_time.slice(0, 5),
      }));
      const res = await fetch("/api/admin/visit-hours", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ property_id: selectedPropertyId, schedule: normalizedSchedule }),
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

  const toggleStatusFilter = (status: string) => {
    setStatusFilter((prev) => {
      const next = new Set(prev);
      if (next.has(status)) {
        next.delete(status);
      } else {
        next.add(status);
      }
      return next;
    });
  };

  const toggleBulkDay = (weekday: number) => {
    setBulkDays((prev) => {
      const next = new Set(prev);
      if (next.has(weekday)) {
        next.delete(weekday);
      } else {
        next.add(weekday);
      }
      return next;
    });
  };

  const applyBulkDefaults = () => {
    if (bulkDays.size === 0) {
      toast.error("Select at least one day to apply defaults");
      return;
    }
    if (bulkStartTime >= bulkEndTime) {
      toast.error("Start time must be earlier than end time");
      return;
    }

    setSchedule((prev) => prev.map((row) => (
      bulkDays.has(row.weekday)
        ? {
          ...row,
          is_open: bulkOpen,
          start_time: bulkStartTime,
          end_time: bulkEndTime,
        }
        : row
    )));
    toast.success("Default hours applied to selected days");
  };

  const saveBookingWindow = async () => {
    setSavingBookingWindow(true);
    try {
      const safeValue = Math.max(1, Math.min(60, Math.trunc(bookingWindowDays || 1)));
      const safeLeadHours = Math.max(1, Math.min(72, Math.trunc(bookingLeadHours || 1)));
      const res = await fetch("/api/admin/visit-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          booking_window_days: safeValue,
          booking_lead_hours: safeLeadHours,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save booking window");
      setBookingWindowDays(data.booking_window_days);
      setBookingLeadHours(data.booking_lead_hours);
      toast.success("Booking settings updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save booking window");
    } finally {
      setSavingBookingWindow(false);
    }
  };

  const filteredProperties = properties.filter((property) => {
    const matchSearch = search
      ? property.title.toLowerCase().includes(search.toLowerCase())
      : true;
    const matchStatus = statusFilter.size === 0 ? true : statusFilter.has(property.status);
    return matchSearch && matchStatus;
  });

  const batchTargetCount = applyMode === "filtered"
    ? filteredProperties.length
    : selectedPropertyIds.size;

  const selectAllFiltered = () => {
    setSelectedPropertyIds(new Set(filteredProperties.map((property) => property.id)));
  };

  const clearSelected = () => {
    setSelectedPropertyIds(new Set());
  };

  const batchApplySchedule = async () => {
    const targetIds = applyMode === "filtered"
      ? filteredProperties.map((property) => property.id)
      : Array.from(selectedPropertyIds);

    if (targetIds.length === 0) {
      toast.error(applyMode === "filtered"
        ? "No properties match current filters"
        : "Select at least one property for batch apply");
      return;
    }

    setBatchApplying(true);
    setBatchFailures([]);
    try {
      const normalizedSchedule = schedule.map((row) => ({
        ...row,
        start_time: row.start_time.slice(0, 5),
        end_time: row.end_time.slice(0, 5),
      }));
      const res = await fetch("/api/admin/visit-hours/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          property_ids: targetIds,
          schedule: normalizedSchedule,
          status_scope: Array.from(statusFilter),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to apply schedule in bulk");

      const failedList = (data.failed || []) as Array<{ property_id: string; title?: string; reason: string }>;
      setBatchFailures(failedList);

      if (failedList.length > 0) {
        toast.warning(`Updated ${data.updated}/${data.attempted} properties. ${failedList.length} blocked by conflicts.`);
      } else {
        toast.success(`Updated ${data.updated} ${data.updated === 1 ? "property" : "properties"} successfully`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to apply schedule in bulk");
    } finally {
      setBatchApplying(false);
    }
  };

  const selectedProperty = properties.find((p) => p.id === selectedPropertyId);
  const selectedLabel = selectedProperty?.title || "";
  const selectedPropertyRef = selectedProperty?.property_ref || selectedProperty?.id || "N/A";

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
              <div className="flex flex-wrap gap-2">
                {DEFAULT_PROPERTY_STATUSES.map((status) => {
                  const checked = statusFilter.has(status);
                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => toggleStatusFilter(status)}
                      className={`h-8 px-3 rounded-md border text-xs capitalize transition-colors ${checked
                        ? "bg-primary/10 border-primary text-primary"
                        : "bg-background border-input text-muted-foreground"
                        }`}
                    >
                      {status}
                    </button>
                  );
                })}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" size="sm" variant="outline" onClick={selectAllFiltered}>
                  Select All Filtered
                </Button>
                <Button type="button" size="sm" variant="outline" onClick={clearSelected}>
                  Clear Selected
                </Button>
                <span className="text-xs text-muted-foreground self-center">
                  Selected: {selectedPropertyIds.size}
                </span>
              </div>
              <div className="max-h-60 overflow-y-auto rounded-md border p-2 space-y-1">
                {filteredProperties.map((p) => {
                  const checked = selectedPropertyId === p.id;
                  const picked = selectedPropertyIds.has(p.id);
                  return (
                    <div
                      key={p.id}
                      className={`flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors ${checked
                        ? "bg-primary/10 border border-primary text-foreground"
                        : "border border-transparent hover:bg-muted"
                        }`}
                    >
                      <input
                        type="checkbox"
                        checked={picked}
                        onChange={() => togglePropertySelection(p.id)}
                        className="h-4 w-4"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPropertyId(p.id);
                          setBlocked(new Set());
                          setSelectedPropertyIds((prev) => {
                            const next = new Set(prev);
                            next.add(p.id);
                            return next;
                          });
                        }}
                        className="flex min-w-0 flex-1 items-center gap-2 text-left"
                      >
                        <div className="min-w-0">
                          <span className="block truncate">{p.title}</span>
                          <span className="block text-[11px] text-muted-foreground">Property ID: {p.property_ref || p.id}</span>
                        </div>
                        <span className="ml-auto text-xs text-muted-foreground capitalize">{p.status}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
              {selectedPropertyId && (
                <div className="text-sm font-medium text-primary">
                  <p>{selectedLabel}</p>
                  <p className="text-xs text-muted-foreground">Property ID: {selectedPropertyRef}</p>
                </div>
              )}
              {!selectedPropertyId && properties.length > 0 && (
                <div className="rounded-md border border-dashed border-muted-foreground/30 p-4 text-center">
                  <p className="text-sm text-muted-foreground">Click on a property above to view and configure its visit hours.</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Customer Booking Window</CardTitle>
          <CardDescription>Set how far ahead customers can book and how many hours before a visit same-day requests must be made.</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap items-end gap-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Days Ahead</label>
              <input
                type="number"
                min={1}
                max={60}
                value={bookingWindowDays}
                onChange={(e) => setBookingWindowDays(Number(e.target.value || 1))}
                className="h-9 w-32 rounded-md border border-input bg-background px-3 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">Lead Hours</label>
              <input
                type="number"
                min={1}
                max={72}
                value={bookingLeadHours}
                onChange={(e) => setBookingLeadHours(Number(e.target.value || 1))}
                className="h-9 w-32 rounded-md border border-input bg-background px-3 text-sm"
              />
            </div>
            <Button onClick={saveBookingWindow} disabled={savingBookingWindow}>
              {savingBookingWindow ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Save Settings
            </Button>
          </div>
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
                <div className="rounded-md border p-3 space-y-3 bg-muted/20">
                  <div>
                    <p className="text-sm font-medium">Default hours for selected days</p>
                    <p className="text-xs text-muted-foreground">Select days once, set open/start/end once, then apply in one click.</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {WEEK_DAYS.map((day) => {
                      const checked = bulkDays.has(day.key);
                      return (
                        <button
                          key={day.key}
                          type="button"
                          onClick={() => toggleBulkDay(day.key)}
                          className={`h-8 px-3 rounded-md border text-xs transition-colors ${checked
                            ? "bg-primary/10 border-primary text-primary"
                            : "bg-background border-input text-muted-foreground"
                            }`}
                        >
                          {day.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-[110px_1fr_1fr_auto] gap-2 items-center">
                    <label className="inline-flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={bulkOpen}
                        onChange={(e) => setBulkOpen(e.target.checked)}
                      />
                      Open
                    </label>
                    <input
                      type="time"
                      className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                      value={bulkStartTime}
                      onChange={(e) => setBulkStartTime(e.target.value)}
                    />
                    <input
                      type="time"
                      className="h-9 rounded-md border border-input bg-background px-2 text-sm"
                      value={bulkEndTime}
                      onChange={(e) => setBulkEndTime(e.target.value)}
                    />
                    <Button type="button" variant="outline" onClick={applyBulkDefaults}>
                      Apply
                    </Button>
                  </div>
                </div>
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

                <div className="rounded-md border p-3 space-y-3 bg-muted/20">
                  <div>
                    <p className="text-sm font-medium">Batch Apply to Multiple Properties</p>
                    <p className="text-xs text-muted-foreground">Apply current weekly schedule to selected properties or all filtered properties.</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant={applyMode === "selected" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setApplyMode("selected")}
                    >
                      Selected Properties
                    </Button>
                    <Button
                      type="button"
                      variant={applyMode === "filtered" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setApplyMode("filtered")}
                    >
                      All Filtered Properties
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {applyMode === "filtered"
                      ? `Will apply to ${batchTargetCount} filtered ${batchTargetCount === 1 ? "property" : "properties"}.`
                      : `Will apply to ${batchTargetCount} selected ${batchTargetCount === 1 ? "property" : "properties"}.`}
                  </p>
                  <Button type="button" onClick={batchApplySchedule} disabled={batchApplying}>
                    {batchApplying ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Apply Schedule in Bulk
                  </Button>

                  {batchFailures.length > 0 && (
                    <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3">
                      <p className="text-sm font-medium text-destructive mb-2">Blocked properties ({batchFailures.length})</p>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {batchFailures.map((item) => (
                          <div key={`${item.property_id}-${item.reason}`} className="text-xs text-foreground">
                            <span className="font-medium">{item.title || item.property_id}</span>
                            <span className="text-muted-foreground"> — {item.reason}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
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
                toDate={addDays(new Date(), bookingWindowDays)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {selectedLabel} (Property ID: {selectedPropertyRef}) — {dateStr ? format(new Date(`${dateStr}T12:00:00`), "EEEE, MMM d, yyyy") : "—"}
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
