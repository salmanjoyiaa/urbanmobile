"use client";

import { useState, useEffect, useCallback } from "react";
import { format, addDays } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Check } from "lucide-react";
import { generateDailySlots, formatSlotLabel } from "@/lib/slots";
import { createClient } from "@/lib/supabase/client";

type BlockedSlot = { id: string; date: string; time: string };
type Property = { id: string; title: string };

export default function AdminSlotsPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [blocked, setBlocked] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [loadingProps, setLoadingProps] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const dateStr = date ? format(date, "yyyy-MM-dd") : "";
  const allSlots = generateDailySlots();
  const selectedCount = selectedIds.size;

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase
          .from("properties")
          .select("id, title")
          .order("title");
        setProperties(data || []);
      } catch {
        toast.error("Failed to load properties");
      } finally {
        setLoadingProps(false);
      }
    };
    fetchProperties();
  }, []);

  const toggleProperty = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setBlocked(new Set());
  };

  const selectAll = () => {
    if (selectedIds.size === properties.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(properties.map((p) => p.id)));
    }
    setBlocked(new Set());
  };

  const primaryId = Array.from(selectedIds)[0];

  const fetchBlocked = useCallback(async () => {
    if (!dateStr || !primaryId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/slots?date=${dateStr}&property_id=${primaryId}`);
      const data = await res.json();
      const set = new Set<string>();
      (data.blocked || []).forEach((s: BlockedSlot) => set.add(s.time));
      setBlocked(set);
    } catch {
      toast.error("Failed to load blocked slots");
    } finally {
      setLoading(false);
    }
  }, [dateStr, primaryId]);

  useEffect(() => {
    fetchBlocked();
  }, [fetchBlocked]);

  const toggle = async (time: string) => {
    if (selectedCount === 0) return;
    setToggling(time);
    try {
      const isBlocked = blocked.has(time);
      const ids = Array.from(selectedIds);

      if (isBlocked) {
        await Promise.all(
          ids.map((pid) =>
            fetch(`/api/admin/slots?date=${dateStr}&time=${time}&property_id=${pid}`, { method: "DELETE" })
          )
        );
        setBlocked((prev) => { const n = new Set(prev); n.delete(time); return n; });
        toast.success(`${formatSlotLabel(time)} unblocked for ${ids.length} ${ids.length === 1 ? "property" : "properties"}`);
      } else {
        await Promise.all(
          ids.map((pid) =>
            fetch("/api/admin/slots", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ date: dateStr, time, property_id: pid }),
            })
          )
        );
        setBlocked((prev) => new Set(prev).add(time));
        toast.success(`${formatSlotLabel(time)} blocked for ${ids.length} ${ids.length === 1 ? "property" : "properties"}`);
      }
    } catch {
      toast.error("Failed to update slot");
    } finally {
      setToggling(null);
    }
  };

  const filteredProperties = search
    ? properties.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()))
    : properties;

  const selectedLabel =
    selectedCount === 0
      ? ""
      : selectedCount === 1
        ? properties.find((p) => p.id === primaryId)?.title || ""
        : `${selectedCount} properties selected`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Visit Hours</h1>
        <p className="text-sm text-muted-foreground">
          Select one or more properties, then block or unblock visit time slots by date.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Select Properties</CardTitle>
          <CardDescription>Choose one or more properties to manage visit hours. Blocking applies to all selected.</CardDescription>
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
                <Button variant="outline" size="sm" onClick={selectAll}>
                  {selectedIds.size === properties.length ? "Deselect all" : "Select all"}
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-60 overflow-y-auto rounded-md border p-2">
                {filteredProperties.map((p) => {
                  const checked = selectedIds.has(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => toggleProperty(p.id)}
                      className={`flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                        checked
                          ? "bg-primary/10 border border-primary text-foreground"
                          : "border border-transparent hover:bg-muted"
                      }`}
                    >
                      <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                        checked ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/30"
                      }`}>
                        {checked && <Check className="h-3 w-3" />}
                      </span>
                      <span className="truncate">{p.title}</span>
                    </button>
                  );
                })}
              </div>
              {selectedCount > 0 && (
                <p className="text-sm font-medium text-primary">{selectedLabel}</p>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {selectedCount > 0 && (
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
                Click a slot to toggle block/unblock{selectedCount > 1 ? " for all selected properties" : ""}. Red = blocked.
              </CardDescription>
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
      )}
    </div>
  );
}
