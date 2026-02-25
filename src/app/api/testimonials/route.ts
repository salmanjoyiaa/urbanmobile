import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("testimonials")
    .select("id, name, role, content, rating, avatar_url")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    return NextResponse.json({ error: "Failed to load testimonials" }, { status: 500 });
  }

  return NextResponse.json({ testimonials: data || [] });
}
