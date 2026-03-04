import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import crypto from "crypto";

export async function POST(request: Request) {
    const supabase = createAdminClient();

    let body;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const page = (typeof body.page === "string" ? body.page : "/").slice(0, 255);
    const userAgent = request.headers.get("user-agent")?.slice(0, 500) || null;
    const referrer = body.referrer?.slice(0, 1000) || null;

    // Hash IP for privacy (don't store raw IPs)
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
    const ipHash = crypto.createHash("sha256").update(ip).digest("hex").slice(0, 16);

    const { error } = await supabase.from("page_views").insert({
        page,
        ip_hash: ipHash,
        user_agent: userAgent,
        referrer,
    } as never);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
