import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { z } from "zod";
import { createRouteClient } from "@/lib/supabase/route";
import { createAdminClient } from "@/lib/supabase/admin";

const bodySchema = z.object({
  company_name: z.string().min(2).max(100),
  license_number: z.string().max(50).optional().nullable(),
  document_url: z.string().max(1000).optional().nullable(),
  bio: z.string().max(5000).optional().nullable(),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch (err) {
    Sentry.captureException(err);
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message || "Invalid payload";
    Sentry.captureMessage(`Invalid agent payload: ${first}`);
    return NextResponse.json({ error: first }, { status: 400 });
  }

  const supabase = await createRouteClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Use admin client to perform the insert (server-side, service role)
  const admin = createAdminClient();

  try {
    const { data, error } = await admin
      .from("agents")
      .insert({
        profile_id: user.id,
        company_name: parsed.data.company_name,
        license_number: parsed.data.license_number ?? null,
        document_url: parsed.data.document_url ?? null,
        bio: parsed.data.bio ?? null,
        status: "pending",
      } as never)
      .select()
      .single();

    if (error) {
      console.error("[api/agents] insert error:", error);
      Sentry.captureException(new Error(error.message), {
        contexts: { database: { table: "agents", error: error.message } },
      });
      return NextResponse.json({ error: error.message || "Failed to create agent" }, { status: 500 });
    }

    return NextResponse.json({ success: true, agent: data }, { status: 201 });
  } catch (err) {
    console.error("[api/agents] unexpected error:", err);
    Sentry.captureException(err as Error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
