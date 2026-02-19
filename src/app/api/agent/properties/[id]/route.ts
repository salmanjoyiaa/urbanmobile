import { NextResponse } from "next/server";
import { propertySchema } from "@/lib/validators";
import { createRouteClient } from "@/lib/supabase/route";

async function getApprovedAgent() {
  const supabase = await createRouteClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, agentId: null as string | null, error: "Unauthorized", status: 401 };
  }

  const { data: agent } = (await supabase
    .from("agents")
    .select("id, status")
    .eq("profile_id", user.id)
    .single()) as { data: { id: string; status: string } | null };

  if (!agent || agent.status !== "approved") {
    return { supabase, agentId: null as string | null, error: "Agent not approved", status: 403 };
  }

  return { supabase, agentId: agent.id, error: null, status: 200 };
}

export async function GET(_request: Request, context: { params: { id: string } }) {
  const { supabase, agentId, error, status } = await getApprovedAgent();
  if (!agentId) return NextResponse.json({ error }, { status });

  const { data, error: queryError } = (await supabase
    .from("properties")
    .select("*")
    .eq("id", context.params.id)
    .eq("agent_id", agentId)
    .single()) as { data: Record<string, unknown> | null; error: { message: string } | null };

  if (queryError) return NextResponse.json({ error: queryError.message }, { status: 404 });
  return NextResponse.json({ data });
}

export async function PATCH(request: Request, context: { params: { id: string } }) {
  const { supabase, agentId, error, status } = await getApprovedAgent();
  if (!agentId) return NextResponse.json({ error }, { status });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const parsed = propertySchema.partial().safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid payload" }, { status: 400 });
  }

  const { error: updateError } = await supabase
    .from("properties")
    .update(parsed.data as never)
    .eq("id", context.params.id)
    .eq("agent_id", agentId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(_request: Request, context: { params: { id: string } }) {
  const { supabase, agentId, error, status } = await getApprovedAgent();
  if (!agentId) return NextResponse.json({ error }, { status });

  const { error: deleteError } = await supabase
    .from("properties")
    .delete()
    .eq("id", context.params.id)
    .eq("agent_id", agentId);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
