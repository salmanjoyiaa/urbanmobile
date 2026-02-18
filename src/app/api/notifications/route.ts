import { NextResponse } from "next/server";
import { z } from "zod";
import { createRouteClient } from "@/lib/supabase/route";

const patchSchema = z.object({
  id: z.string().uuid().optional(),
  ids: z.array(z.string().uuid()).optional(),
  markAll: z.boolean().optional(),
  read: z.boolean().default(true),
});

async function getCurrentUser() {
  const supabase = await createRouteClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, user: null };
  }

  return { supabase, user };
}

export async function GET() {
  const { supabase, user } = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("notifications")
    .select("id, title, body, type, metadata, read, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: data || [] });
}

export async function PATCH(request: Request) {
  const { supabase, user } = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = patchSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid payload" }, { status: 400 });
  }

  const { id, ids, markAll, read } = parsed.data;

  let query = supabase.from("notifications").update({ read } as never).eq("user_id", user.id);

  if (markAll) {
    // keep as-is
  } else if (id) {
    query = query.eq("id", id);
  } else if (ids && ids.length > 0) {
    query = query.in("id", ids);
  } else {
    return NextResponse.json({ error: "Provide id, ids, or markAll=true" }, { status: 400 });
  }

  const { error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
