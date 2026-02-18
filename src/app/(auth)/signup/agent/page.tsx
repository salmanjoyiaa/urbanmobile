"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { agentSignupSchema, type AgentSignupInput } from "@/lib/validators";
import type { Database } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export default function AgentSignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AgentSignupInput>({
    resolver: zodResolver(agentSignupSchema),
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
      phone: "",
      company_name: "",
      license_number: "",
    },
  });

  const onSubmit = async (values: AgentSignupInput) => {
    const fileInput = document.getElementById("document") as HTMLInputElement | null;
    const documentFile = fileInput?.files?.[0];

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          full_name: values.full_name,
          phone: values.phone || null,
          role: "agent",
        },
      },
    });

    if (signUpError) {
      toast.error(signUpError.message || "Agent signup failed");
      return;
    }

    const userId = signUpData.user?.id;

    if (!userId) {
      toast.error("Signup succeeded but user id is missing. Please sign in and retry.");
      router.push("/login");
      return;
    }

    let documentPath: string | null = null;

    if (documentFile) {
      const path = `agent-documents/${userId}/${Date.now()}-${sanitizeFileName(documentFile.name)}`;
      const { error: uploadError } = await supabase.storage
        .from("agent-documents")
        .upload(path, documentFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        toast.error(uploadError.message || "Failed to upload document");
        return;
      }

      documentPath = path;
    }

    const payload: Database["public"]["Tables"]["agents"]["Insert"] = {
      profile_id: userId,
      company_name: values.company_name,
      license_number: values.license_number || null,
      document_url: documentPath,
      bio: null,
      status: "pending",
    };

    const { error: agentInsertError } = await (supabase
      .from("agents") as never as {
      insert: (
        values: Database["public"]["Tables"]["agents"]["Insert"]
      ) => Promise<{ error: { message?: string } | null }>;
    }).insert(payload);

    if (agentInsertError) {
      toast.error(agentInsertError.message || "Failed to submit agent profile");
      return;
    }

    toast.success("Agent application submitted. Awaiting admin approval.");
    router.push("/pending-approval");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agent registration</CardTitle>
        <CardDescription>
          Submit your profile and license details. You&apos;ll be redirected once approved.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="full_name">Full name</Label>
            <Input id="full_name" {...register("full_name")} />
            {errors.full_name && (
              <p className="text-sm text-destructive">{errors.full_name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="company_name">Company name</Label>
            <Input id="company_name" {...register("company_name")} />
            {errors.company_name && (
              <p className="text-sm text-destructive">{errors.company_name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="license_number">License number</Label>
            <Input id="license_number" {...register("license_number")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register("email")} />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone (+966...)</Label>
            <Input id="phone" placeholder="+9665XXXXXXXX" {...register("phone")} />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" {...register("password")} />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="document">License document (optional)</Label>
            <Input id="document" type="file" accept=".pdf,.jpg,.jpeg,.png" />
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting application...
              </>
            ) : (
              "Submit application"
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-navy hover:underline">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
