/**
 * Signed URLs for `maintenance-media` (private bucket). Requires production bucket
 * from migration 00039_maintenance_marketplace.sql and matching NEXT_PUBLIC_SUPABASE_URL.
 */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isMaintenanceMediaVideoPath } from "@/lib/maintenance-request-paths";

const BUCKET = "maintenance-media";
const SIGNED_TTL = 120;

function isSafeMaintenanceMediaPath(path: string): boolean {
  if (!path || path.length > 512) return false;
  if (!path.startsWith("requests/")) return false;
  if (path.includes("..") || path.includes("//")) return false;
  return true;
}

export async function GET(request: NextRequest) {
  try {
    const requestId = request.nextUrl.searchParams.get("requestId");
    const path = request.nextUrl.searchParams.get("path");

    if (!requestId || !path) {
      return NextResponse.json({ error: "requestId and path are required" }, { status: 400 });
    }

    if (!isSafeMaintenanceMediaPath(path)) {
      return NextResponse.json({ error: "Invalid path" }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = (await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()) as { data: { role: string } | null };

    const { data: row, error: rowError } = (await supabase
      .from("maintenance_requests")
      .select(
        "id, agent_id, audio_url, media_urls, service_id, maintenance_services!maintenance_requests_service_id_fkey(agent_id)"
      )
      .eq("id", requestId)
      .single()) as {
      data: {
        id: string;
        agent_id: string | null;
        audio_url: string | null;
        media_urls: string[] | null;
        service_id: string | null;
        maintenance_services: { agent_id: string } | null;
      } | null;
      error: { message: string } | null;
    };

    if (rowError || !row) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    const allowedPaths = new Set<string>();
    if (row.audio_url) allowedPaths.add(row.audio_url);
    for (const p of row.media_urls || []) allowedPaths.add(p);
    if (!allowedPaths.has(path)) {
      return NextResponse.json({ error: "Path does not belong to this request" }, { status: 403 });
    }

    let authorized = profile?.role === "admin";

    if (!authorized) {
      const { data: agent } = (await supabase
        .from("agents")
        .select("id, agent_type, status")
        .eq("profile_id", user.id)
        .single()) as { data: { id: string; agent_type: string; status: string } | null };

      if (!agent || agent.status !== "approved" || agent.agent_type !== "maintenance") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      const serviceAgentId = row.maintenance_services?.agent_id ?? null;
      if (row.agent_id && row.agent_id === agent.id) authorized = true;
      if (!authorized && serviceAgentId && serviceAgentId === agent.id) authorized = true;
    }

    if (!authorized) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const admin = createAdminClient();
    const { data: signed, error: signError } = await admin.storage
      .from(BUCKET)
      .createSignedUrl(path, SIGNED_TTL);

    if (signError || !signed?.signedUrl) {
      return NextResponse.json(
        { error: signError?.message || "Could not sign URL (check bucket exists and path is valid)" },
        { status: 502 }
      );
    }

    return NextResponse.json({
      url: signed.signedUrl,
      kind: isMaintenanceMediaVideoPath(path) ? "video" : path.endsWith(".webm") ? "audio" : "image",
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Internal error" },
      { status: 500 }
    );
  }
}
