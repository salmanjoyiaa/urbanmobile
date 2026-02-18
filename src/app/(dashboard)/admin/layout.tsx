import { redirect } from "next/navigation";
import { adminNav } from "@/config/nav";
import { Sidebar } from "@/components/layout/sidebar";
import { NotificationBell } from "@/components/layout/notification-bell";
import { createClient } from "@/lib/supabase/server";

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
    .select("role")
    .eq("id", user.id)
    .single()) as { data: { role: string } | null };

  if (!profile || profile.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-muted/20 lg:grid lg:grid-cols-[16rem_1fr]">
      <Sidebar items={adminNav} title="Admin Panel" />
      <div>
        <header className="sticky top-0 z-20 border-b bg-white/95 px-4 py-3 backdrop-blur lg:px-6">
          <div className="flex items-center justify-end">
            <NotificationBell />
          </div>
        </header>
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
