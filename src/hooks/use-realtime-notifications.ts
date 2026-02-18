"use client";

import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useRealtime } from "@/hooks/use-realtime";
import { toast } from "sonner";

export function useRealtimeNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const onChange = useCallback(
    (payload: { eventType: string; new: Record<string, unknown> }) => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });

      if (payload.eventType === "INSERT") {
        const title = String(payload.new?.title || "New notification");
        const body = String(payload.new?.body || "");
        toast.info(title, { description: body || undefined });
      }
    },
    [queryClient]
  );

  useRealtime({
    channel: `notifications-${user?.id || "guest"}`,
    table: "notifications",
    filter: user?.id ? `user_id=eq.${user.id}` : undefined,
    enabled: Boolean(user?.id),
    onChange,
  });
}
