"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type DeleteItemButtonProps = {
  endpoint: string;
  label: string;
};

export function DeleteItemButton({ endpoint, label }: DeleteItemButtonProps) {
  const router = useRouter();
  const [isLoading, setLoading] = useState(false);

  const remove = async () => {
    const ok = window.confirm(`Delete this ${label}?`);
    if (!ok) return;

    setLoading(true);
    try {
      const response = await fetch(endpoint, { method: "DELETE" });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(result.error || `Could not delete ${label}`);

      toast.success(`${label} deleted`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button size="sm" variant="destructive" onClick={remove} disabled={isLoading}>
      <Trash2 className="mr-1 h-3 w-3" />
      Delete
    </Button>
  );
}
