import { NextResponse } from "next/server";
import { productSchema } from "@/lib/validators";
import { createRouteClient } from "@/lib/supabase/route";
import type { Database } from "@/types/database";

async function getApprovedAgentId() {
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

export async function GET() {
  const { supabase, agentId, error, status } = await getApprovedAgentId();
  if (!agentId) return NextResponse.json({ error }, { status });

  const { data, error: queryError } = (await supabase
    .from("products")
    .select("*")
    .eq("agent_id", agentId)
    .order("created_at", { ascending: false })) as {
    data: Database["public"]["Tables"]["products"]["Row"][] | null;
    error: { message: string } | null;
  };

  if (queryError) {
    return NextResponse.json({ error: queryError.message }, { status: 500 });
  }

  return NextResponse.json({ data: data || [] });
}

export async function POST(request: Request) {
  const { supabase, agentId, error, status } = await getApprovedAgentId();
  if (!agentId) return NextResponse.json({ error }, { status });

  const body = await request.json();
  const parsed = productSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid payload" }, { status: 400 });
  }

  const payload: Database["public"]["Tables"]["products"]["Insert"] = {
    ...parsed.data,
    agent_id: agentId,
    is_available: true,
  };

  const { data, error: insertError } = (await supabase
    .from("products")
    .insert(payload as never)
    .select("id")
    .single()) as {
    data: { id: string } | null;
    error: { message: string } | null;
  };

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, id: data?.id }, { status: 201 });
}
