"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type ModerationActionButtonProps = {
  endpoint: string;
  payload?: Record<string, unknown>;
  method?: "PATCH" | "DELETE" | "POST";
  label: string;
  variant?: "default" | "outline" | "destructive" | "secondary";
};

export function ModerationActionButton({
  endpoint,
  payload,
  method = "PATCH",
  label,
  variant = "outline",
}: ModerationActionButtonProps) {
  const router = useRouter();
  const [isLoading, setLoading] = useState(false);

  const run = async () => {
    if (method === "DELETE" && !confirm("Are you sure you want to delete this record? This cannot be undone.")) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: payload ? JSON.stringify(payload) : undefined,
      });

      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(result.error || "Action failed");
      }

      toast.success(`${label} successful`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Action failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button size="sm" variant={variant} onClick={run} disabled={isLoading}>
      {isLoading ? "..." : label}
    </Button>
  );
}
