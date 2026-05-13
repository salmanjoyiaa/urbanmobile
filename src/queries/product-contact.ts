"use client";

import { useMutation } from "@tanstack/react-query";

export type ProductContactChannel = "whatsapp" | "phone";

export function useRecordProductContact(productId: string) {
  return useMutation({
    mutationFn: async (channel: ProductContactChannel) => {
      const response = await fetch(`/api/products/${productId}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel }),
      });

      const result = (await response.json()) as {
        success?: boolean;
        error?: string;
        whatsapp_url?: string;
        tel_url?: string;
      };

      if (!response.ok) {
        throw new Error(result.error || "Could not record contact");
      }

      return result;
    },
  });
}
