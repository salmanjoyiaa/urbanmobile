import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminRouteContext } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";

const assignSchema = z.object({
  property_ids: z.array(z.string().uuid()).min(1, "At least one property required"),
});

const unassignSchema = z.object({
  property_id: z.string().uuid(),
});

export async function GET(_request: Request, context: { params: { id: string } }) {
  const admin = await getAdminRouteContext();
  if (admin.error || !admin.profile) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("agent_property_assignments")
    .select("id, property_id, created_at, properties:property_id(id, title)")
    .eq("agent_id", context.params.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ assignments: data || [] });
}

export async function POST(request: Request, context: { params: { id: string } }) {
  const admin = await getAdminRouteContext();
  if (admin.error || !admin.profile) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = assignSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid payload" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const rows = parsed.data.property_ids.map((pid) => ({
    agent_id: context.params.id,
    property_id: pid,
    assigned_by: admin.profile!.id,
  }));

  const { error } = await supabase
    .from("agent_property_assignments")
    .upsert(rows as never[], { onConflict: "agent_id,property_id" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request, context: { params: { id: string } }) {
  const admin = await getAdminRouteContext();
  if (admin.error || !admin.profile) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = unassignSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid payload" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("agent_property_assignments")
    .delete()
    .eq("agent_id", context.params.id)
    .eq("property_id", parsed.data.property_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
