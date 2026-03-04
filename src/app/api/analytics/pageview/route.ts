import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import crypto from "crypto";

const BOT_USER_AGENT_REGEX =
    /bot|spider|crawler|slurp|headless|facebookexternalhit|whatsapp|preview|curl|wget|python-requests|axios|monitor|uptime|lighthouse/i;

function parseCookieValue(cookieHeader: string | null, key: string): string | null {
    if (!cookieHeader) return null;
    const parts = cookieHeader.split(";").map((part) => part.trim());
    const hit = parts.find((part) => part.startsWith(`${key}=`));
    if (!hit) return null;
    return decodeURIComponent(hit.slice(key.length + 1));
}

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

    if (userAgent && BOT_USER_AGENT_REGEX.test(userAgent)) {
        return NextResponse.json({ success: true, ignored: "bot" });
    }

    // Hash IP for privacy (don't store raw IPs)
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
    const ipHash = crypto.createHash("sha256").update(ip).digest("hex").slice(0, 16);

    const existingVisitorId = parseCookieValue(request.headers.get("cookie"), "uv_id");
    const visitorId = existingVisitorId || crypto.randomUUID();

    const { error } = await supabase.from("page_views").insert({
        page,
        visitor_id: visitorId,
        ip_hash: ipHash,
        user_agent: userAgent,
        referrer,
    } as never);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const response = NextResponse.json({ success: true });

    if (!existingVisitorId) {
        response.cookies.set("uv_id", visitorId, {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            path: "/",
            maxAge: 60 * 60 * 24 * 365,
        });
    }

    return response;
}
