"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export default function PendingApprovalPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const { user, profile, agent, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login?redirect=/pending-approval");
      return;
    }

    if (!isLoading && profile?.role !== "agent") {
      router.replace("/");
      return;
    }

    const interval = setInterval(async () => {
      if (!user) return;

      const { data: freshAgent } = await supabase
        .from("agents")
        .select("status")
        .eq("profile_id", user.id)
        .single() as { data: { status: string } | null };

      if (freshAgent?.status === "approved") {
        toast.success("Your account has been approved.");
        router.replace("/agent");
      }
    }, 7000);

    return () => clearInterval(interval);
  }, [isLoading, profile?.role, router, supabase, user]);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Application under review</CardTitle>
        <CardDescription>
          Your agent account is pending approval. This page checks status automatically.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border bg-muted/30 p-4 text-sm">
          <p className="font-medium">Current status</p>
          <p className="mt-1 capitalize text-muted-foreground">{agent?.status || "pending"}</p>
        </div>

        <div className="flex items-center text-sm text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Checking approval status every few seconds...
        </div>

        <Button variant="outline" className="w-full" onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </Button>
      </CardContent>
    </Card>
  );
}
