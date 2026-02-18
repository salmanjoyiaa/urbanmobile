import { redirect } from "next/navigation";
import { agentNav } from "@/config/nav";
import { Sidebar } from "@/components/layout/sidebar";
import { createClient } from "@/lib/supabase/server";

export default async function AgentLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-muted/20 lg:grid lg:grid-cols-[16rem_1fr]">
      <Sidebar items={agentNav} title="Agent Panel" />
      <main className="p-4 lg:p-6">{children}</main>
    </div>
  );
}
