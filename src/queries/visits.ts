"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { VisitRequestInput } from "@/lib/validators";

type SlotEntry = {
  time: string;
  label: string;
  available: boolean;
};

export function useVisitSlots(propertyId: string, date: string, enabled = true) {
  return useQuery({
    queryKey: ["visit-slots", propertyId, date],
    enabled: enabled && Boolean(propertyId) && Boolean(date),
    queryFn: async () => {
      const response = await fetch(
        `/api/visits?property_id=${encodeURIComponent(propertyId)}&date=${encodeURIComponent(date)}`,
        {
          method: "GET",
        }
      );

      const result = (await response.json()) as { slots?: SlotEntry[]; error?: string };

      if (!response.ok) {
        throw new Error(result.error || "Could not load slots");
      }

      return result.slots || [];
    },
  });
}

export function useCreateVisitRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: VisitRequestInput) => {
      const response = await fetch("/api/visits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as { success?: boolean; error?: string };

      if (!response.ok) {
        throw new Error(result.error || "Could not submit visit request");
      }

      return result;
    },
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["visit-slots", variables.property_id, variables.visit_date],
      });
    },
  });
}
