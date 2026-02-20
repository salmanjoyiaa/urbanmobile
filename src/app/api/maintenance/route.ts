import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { createAdminClient } from "@/lib/supabase/admin";
import { maintenanceRequestSchema } from "@/lib/validators";
import { notifyAdmins } from "@/lib/admin";
import * as Sentry from "@sentry/nextjs";

const supabase = createAdminClient();

const redisEnabled =
    Boolean(process.env.UPSTASH_REDIS_REST_URL) &&
    Boolean(process.env.UPSTASH_REDIS_REST_TOKEN);

const ratelimit = redisEnabled
    ? new Ratelimit({
        redis: new Redis({
            url: process.env.UPSTASH_REDIS_REST_URL!,
            token: process.env.UPSTASH_REDIS_REST_TOKEN!,
        }),
        limiter: Ratelimit.fixedWindow(3, "1 h"),
        analytics: true,
    })
    : null;

const memoryHits = new Map<string, { count: number; resetAt: number }>();

function getClientIp(request: NextRequest) {
    const forwarded = request.headers.get("x-forwarded-for");
    return forwarded?.split(",")[0]?.trim() || "local";
}

async function enforceRateLimit(ip: string) {
    if (ratelimit) {
        const result = await ratelimit.limit(`maintenance:${ip}`);
        return { allowed: result.success, limit: result.limit, remaining: result.remaining };
    }

    const now = Date.now();
    const entry = memoryHits.get(ip);

    if (!entry || entry.resetAt < now) {
        memoryHits.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 });
        return { allowed: true, limit: 3, remaining: 2 };
    }

    if (entry.count >= 3) {
        return { allowed: false, limit: 3, remaining: 0 };
    }

    entry.count += 1;
    return { allowed: true, limit: 3, remaining: Math.max(3 - entry.count, 0) };
}

export async function POST(request: NextRequest) {
    const ip = getClientIp(request);
    const limit = await enforceRateLimit(ip);

    if (!limit.allowed) {
        return NextResponse.json(
            { error: "Too many requests. Limit is 3 maintenance requests per hour. Please try again later." },
            {
                status: 429,
                headers: {
                    "X-RateLimit-Limit": String(limit.limit),
                    "X-RateLimit-Remaining": String(limit.remaining),
                    "Retry-After": "3600",
                },
            }
        );
    }

    let body;
    try {
        body = await request.json();
    } catch (err) {
        Sentry.captureException(err);
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = maintenanceRequestSchema.safeParse(body);

    if (!parsed.success) {
        const firstError = parsed.error.issues[0]?.message || "Invalid payload";
        Sentry.captureMessage(`Validation failed for maintenance creation: ${firstError}`);
        return NextResponse.json(
            { error: firstError },
            { status: 400 }
        );
    }

    const { data, error } = (await supabase
        .from("maintenance_requests")
        .insert(parsed.data as never)
        .select("id")
        .single()) as {
            data: { id: string } | null;
            error: { message: string } | null;
        };

    if (error) {
        console.error("[api/maintenance] insert error:", error);
        Sentry.captureException(new Error(error.message));
        return NextResponse.json({ error: error.message || "Failed to submit request" }, { status: 500 });
    }

    // Notify admins of new maintenance request
    await notifyAdmins({
        title: "New Maintenance Request",
        body: `A new ${parsed.data.service_type} request has been submitted by ${parsed.data.customer_name}.`,
        type: "maintenance_request",
        metadata: { maintenance_id: data?.id, service_type: parsed.data.service_type },
    });

    return NextResponse.json(
        { id: data?.id, success: true },
        {
            status: 201,
            headers: {
                "X-RateLimit-Limit": String(limit.limit),
                "X-RateLimit-Remaining": String(limit.remaining),
            },
        }
    );
}
