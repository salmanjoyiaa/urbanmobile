"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogOut, Clock, XCircle, CheckCircle } from "lucide-react";
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

    // If already approved, redirect to agent dashboard
    if (!isLoading && agent?.status === "approved") {
      router.replace("/agent");
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
        toast.success("Your account has been approved!");
        router.replace("/agent");
      }
    }, 7000);

    return () => clearInterval(interval);
  }, [isLoading, profile?.role, agent?.status, router, supabase, user]);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  const status = agent?.status || "pending";
  const isRejected = status === "rejected";

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4">
            {isRejected ? (
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            ) : status === "approved" ? (
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-emerald-500" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
                <Clock className="h-8 w-8 text-amber-500" />
              </div>
            )}
          </div>
          <CardTitle className="text-xl">
            {isRejected ? "Application Rejected" : "Application Under Review"}
          </CardTitle>
          <CardDescription className="mt-2">
            {isRejected
              ? "Unfortunately, your agent application has been rejected. Please contact support for more information."
              : "Your agent account is pending approval from our admin team. We'll notify you once it's approved."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border bg-muted/30 p-4 text-sm">
            <p className="font-medium text-muted-foreground">Current status</p>
            <p className={`mt-1 capitalize font-semibold ${isRejected ? "text-red-600" : "text-amber-600"}`}>
              {status}
            </p>
          </div>

          {!isRejected && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Checking approval status automatically...
            </div>
          )}

          <Button variant="outline" className="w-full" onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
