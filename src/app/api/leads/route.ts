import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { buyRequestSchema } from "@/lib/validators";
import type { Database } from "@/types/database";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

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
    const result = await ratelimit.limit(`leads:${ip}`);
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
      { error: "Too many requests. Limit is 3 lead requests per hour." },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": String(limit.limit),
          "X-RateLimit-Remaining": String(limit.remaining),
        },
      }
    );
  }

  const body = await request.json();
  const parsed = buyRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid payload" },
      { status: 400 }
    );
  }

  const { data, error } = (await supabase
    .from("buy_requests")
    .insert(parsed.data as never)
    .select("id")
    .single()) as {
    data: { id: string } | null;
    error: { message: string } | null;
  };

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

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
