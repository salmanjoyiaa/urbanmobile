"use client";

import { useMutation } from "@tanstack/react-query";
import type { BuyRequestInput } from "@/lib/validators";

export function useCreateLeadRequest() {
  return useMutation({
    mutationFn: async (payload: BuyRequestInput) => {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as { success?: boolean; error?: string };

      if (!response.ok) {
        throw new Error(result.error || "Could not submit buy request");
      }

      return result;
    },
  });
}
