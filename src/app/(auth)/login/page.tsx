"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { loginSchema, type LoginInput } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginInput) => {
    const redirect =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("redirect")
        : null;

    const { data, error } = await supabase.auth.signInWithPassword(values);

    if (error) {
      toast.error(error.message || "Login failed");
      return;
    }

    if (!data.user) {
      toast.error("Could not load your account");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single() as { data: { role: string } | null };

    // Refresh server-side session before navigating so middleware sees the new auth cookies
    router.refresh();

    if (profile?.role === "admin") {
      router.push("/admin");
      return;
    }

    if (profile?.role === "agent") {
      const { data: agent } = await supabase
        .from("agents")
        .select("status")
        .eq("profile_id", data.user.id)
        .single() as { data: { status: string } | null };

      if (agent?.status !== "approved") {
        router.push("/pending-approval");
        return;
      }

      router.push(redirect || "/agent");
      return;
    }

    router.push(redirect || "/");
  };

  return (
    <Card className="border-[#D9C5B2]/40 bg-[#FCF9F2] shadow-xl shadow-[#2A201A]/5">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl font-extrabold text-[#2A201A]">Sign In</CardTitle>
        <CardDescription className="text-[#6B5A4E]">Access your UrbanSaudi account.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full bg-[#2A201A] hover:bg-black text-white rounded-xl h-11" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-[#6B5A4E]">
          Don&apos;t have an account?{" "}
          <Link href="/signup/agent" className="font-bold text-[#2A201A] hover:underline">
            Apply to become an agent
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
