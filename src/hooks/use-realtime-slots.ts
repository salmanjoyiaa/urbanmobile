"use client";

import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRealtime } from "@/hooks/use-realtime";

type VisitPayload = {
  visit_date?: string;
  property_id?: string;
};

export function useRealtimeSlots(params: {
  propertyId: string;
  date: string;
  enabled?: boolean;
}) {
  const { propertyId, date, enabled = true } = params;
  const queryClient = useQueryClient();

  const onChange = useCallback(
    (payload: { new: VisitPayload; old: VisitPayload }) => {
      const candidate = payload.new || payload.old;
      if (!candidate) return;

      if (candidate.property_id === propertyId && candidate.visit_date === date) {
        queryClient.invalidateQueries({
          queryKey: ["visit-slots", propertyId, date],
        });
      }
    },
    [date, propertyId, queryClient]
  );

  useRealtime({
    channel: `visit-slots-${propertyId}-${date}`,
    table: "visit_requests",
    filter: `property_id=eq.${propertyId}`,
    enabled: enabled && Boolean(propertyId) && Boolean(date),
    onChange,
  });
}
