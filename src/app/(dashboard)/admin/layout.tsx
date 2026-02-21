import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/layout/admin-shell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = (await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single()) as { data: { role: string; full_name: string } | null };

  if (!profile || profile.role !== "admin") {
    redirect("/");
  }

  return <AdminShell userName={profile?.full_name}>{children}</AdminShell>;
}
