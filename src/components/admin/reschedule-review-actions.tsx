"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function RescheduleReviewActions({ visitId }: { visitId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);

  const submit = async (action: "approve" | "reject") => {
    const note = prompt(action === "approve" ? "Approval note (optional):" : "Rejection reason (optional):") || "";
    setLoading(action);
    try {
      const res = await fetch(`/api/admin/visits/${visitId}/reschedule-review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, note }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to review reschedule request");
      toast.success(action === "approve" ? "Reschedule approved" : "Reschedule rejected");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to review reschedule request");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant="outline"
        className="h-7 px-2 text-xs"
        onClick={() => submit("approve")}
        disabled={loading !== null}
      >
        {loading === "approve" ? "Approving..." : "Approve"}
      </Button>
      <Button
        size="sm"
        variant="destructive"
        className="h-7 px-2 text-xs"
        onClick={() => submit("reject")}
        disabled={loading !== null}
      >
        {loading === "reject" ? "Rejecting..." : "Reject"}
      </Button>
    </div>
  );
}
