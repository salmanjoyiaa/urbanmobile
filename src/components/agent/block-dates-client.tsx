"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BlockedDatesCalendar } from "@/components/property/blocked-dates-calendar";
import { toast } from "sonner";

type BlockDatesClientProps = {
  propertyId: string;
  propertyTitle: string;
  initialBlockedDates: string[];
};

export function BlockDatesClient({
  propertyId,
  propertyTitle,
  initialBlockedDates,
}: BlockDatesClientProps) {
  const router = useRouter();
  const [blockedDates, setBlockedDates] = useState<string[]>(initialBlockedDates);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/agent/properties/${propertyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blocked_dates: blockedDates }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Failed to save");
      toast.success("Blocked dates updated.");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Block dates</CardTitle>
            <CardDescription>
              {propertyTitle} — Select dates when the property is unavailable for visits.
            </CardDescription>
          </div>
          <Link href="/agent/properties">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to properties
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <BlockedDatesCalendar value={blockedDates} onChange={setBlockedDates} />
        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save blocked dates"
            )}
          </Button>
          <Link href={`/agent/properties/${propertyId}/edit`}>
            <Button variant="outline">Edit property</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
