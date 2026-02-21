import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { z } from "zod";
import { createRouteClient } from "@/lib/supabase/route";
import { createAdminClient } from "@/lib/supabase/admin";
import { notifyAdmins } from "@/lib/admin";

const bodySchema = z.object({
  company_name: z.string().min(2).max(100),
  license_number: z.string().max(50).optional().nullable(),
  document_url: z.string().max(1000).optional().nullable(),
  bio: z.string().max(5000).optional().nullable(),
  agent_type: z.enum(["property", "visiting"]).default("property"),
});

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
    const result = await ratelimit.limit(`agents:${ip}`);
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
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": String(limit.limit),
          "X-RateLimit-Remaining": String(limit.remaining),
        },
      }
    );
  }
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
      .upsert({
        profile_id: user.id,
        agent_type: parsed.data.agent_type,
        company_name: parsed.data.company_name,
        license_number: parsed.data.license_number ?? null,
        document_url: parsed.data.document_url ?? null,
        bio: parsed.data.bio ?? null,
        status: "pending",
      } as never, { onConflict: "profile_id" })
      .select()
      .single();

    if (error) {
      console.error("[api/agents] insert error:", error);
      Sentry.captureException(new Error(error.message), {
        contexts: { database: { table: "agents", error: error.message } },
      });
      return NextResponse.json({ error: "Failed to create agent application" }, { status: 500 });
    }

    // Notify admins of new agent registration
    await notifyAdmins({
      title: "New Agent Application",
      body: `Company ${parsed.data.company_name} has applied to become an agent.`,
      type: "agent_signup",
      metadata: { profile_id: user.id },
    });

    return NextResponse.json({ success: true, agent: data }, { status: 201 });
  } catch (err) {
    console.error("[api/agents] unexpected error:", err);
    Sentry.captureException(err as Error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
