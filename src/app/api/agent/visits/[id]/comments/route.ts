import { NextResponse } from "next/server";
import { z } from "zod";
import { createRouteClient } from "@/lib/supabase/route";

const commentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(2000, "Comment too long"),
});

export async function GET(_request: Request, context: { params: { id: string } }) {
  const supabase = await createRouteClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: visit } = await supabase
    .from("visit_requests")
    .select("id")
    .eq("id", context.params.id)
    .eq("visiting_agent_id", user.id)
    .maybeSingle();

  if (!visit) {
    return NextResponse.json({ error: "Visit not found" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("visit_comments")
    .select("id, content, created_at, author:author_id(full_name)")
    .eq("visit_id", context.params.id)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ comments: data || [] });
}

export async function POST(request: Request, context: { params: { id: string } }) {
  const supabase = await createRouteClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: visit } = await supabase
    .from("visit_requests")
    .select("id")
    .eq("id", context.params.id)
    .eq("visiting_agent_id", user.id)
    .maybeSingle();

  if (!visit) {
    return NextResponse.json({ error: "Visit not found" }, { status: 404 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = commentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid payload" }, { status: 400 });
  }

  const { error } = await supabase.from("visit_comments").insert({
    visit_id: context.params.id,
    author_id: user.id,
    content: parsed.data.content,
  } as never);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
