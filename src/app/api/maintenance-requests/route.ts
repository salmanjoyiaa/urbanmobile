import { NextRequest, NextResponse } from "next/server";
import { maintenanceRequestSchema } from "@/lib/validators";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = maintenanceRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid request" },
        { status: 400 }
      );
    }

    const row = {
      service_id: parsed.data.service_id ?? null,
      agent_id: parsed.data.agent_id ?? null,
      service_type: parsed.data.service_type,
      customer_name: parsed.data.customer_name,
      customer_email: parsed.data.customer_email,
      customer_phone: parsed.data.customer_phone,
      details: parsed.data.details ?? null,
      visit_date: parsed.data.visit_date ?? null,
      visit_time: parsed.data.visit_time ?? null,
      audio_url: parsed.data.audio_url ?? null,
      media_urls: parsed.data.media_urls?.length ? parsed.data.media_urls : [],
      status: "pending" as const,
    };

    const admin = createAdminClient();
    const { error } = await admin.from("maintenance_requests").insert(row as never);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 }
    );
  }
}
