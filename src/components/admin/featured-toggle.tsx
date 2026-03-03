"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Star, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { updatePropertyFeatured } from "@/app/actions/admin";

export function FeaturedToggle({ id, featured }: { id: string; featured: boolean }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    startTransition(async () => {
      const result = await updatePropertyFeatured(id, !featured);
      if (result.success) {
        toast.success(featured ? "Removed from homepage" : "Added to homepage");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update");
      }
    });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggle}
      disabled={isPending}
      className={featured ? "text-amber-600 hover:bg-amber-50 hover:text-amber-700" : "text-muted-foreground hover:text-foreground"}
      title={featured ? "Remove from homepage" : "Show on homepage"}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Star className={`h-4 w-4 ${featured ? "fill-current" : ""}`} />
      )}
      <span className="sr-only">{featured ? "On homepage" : "Not on homepage"}</span>
    </Button>
  );
}
