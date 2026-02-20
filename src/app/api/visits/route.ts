import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { createAdminClient } from "@/lib/supabase/admin";
import { notifyAdmins } from "@/lib/admin";
import { cacheAside, cacheDel } from "@/lib/redis";
import { buildAvailabilitySlots, isFutureDate, isWeekday } from "@/lib/slots";
import { visitRequestSchema } from "@/lib/validators";

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
    const result = await ratelimit.limit(`visits:${ip}`);
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

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const propertyId = searchParams.get("property_id");
  const date = searchParams.get("date");

  if (!propertyId || !date) {
    return NextResponse.json({ error: "property_id and date are required" }, { status: 400 });
  }

  const parsedDate = new Date(`${date}T00:00:00`);

  if (!isFutureDate(parsedDate) || !isWeekday(parsedDate)) {
    return NextResponse.json({ slots: [] });
  }

  const cacheKey = `slots:${propertyId}:${date}`;

  try {
    const slots = await cacheAside({
      key: cacheKey,
      ttlSeconds: 30,
      label: "slots:availability",
      fetcher: async () => {
        const { data, error } = (await supabase
          .from("visit_requests")
          .select("visit_time")
          .eq("property_id", propertyId)
          .eq("visit_date", date)
          .in("status", ["pending", "confirmed"])) as {
            data: Array<{ visit_time: string }> | null;
            error: { message: string } | null;
          };

        if (error) {
          throw new Error(error.message);
        }

        const bookedTimes = (data || []).map((entry) => entry.visit_time);
        return buildAvailabilitySlots(bookedTimes);
      },
    });

    return NextResponse.json({ slots });
  } catch {
    return NextResponse.json(
      { error: "Failed to load slots" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = await enforceRateLimit(ip);

  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Limit is 3 visit requests per hour." },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": String(limit.limit),
          "X-RateLimit-Remaining": String(limit.remaining),
        },
      }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const parsed = visitRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid payload" },
      { status: 400 }
    );
  }

  const payload = parsed.data;

  const { data: existing } = (await supabase
    .from("visit_requests")
    .select("id")
    .eq("property_id", payload.property_id)
    .eq("visit_date", payload.visit_date)
    .eq("visit_time", payload.visit_time)
    .in("status", ["pending", "confirmed"])
    .limit(1)) as {
      data: Array<{ id: string }> | null;
    };

  if (existing && existing.length > 0) {
    return NextResponse.json({ error: "This slot is no longer available" }, { status: 409 });
  }

  const { data, error } = (await supabase
    .from("visit_requests")
    .insert(payload as never)
    .select("id")
    .single()) as {
      data: { id: string } | null;
      error: { code?: string; message: string } | null;
    };

  if (error) {
    if ((error as { code?: string }).code === "23505") {
      return NextResponse.json({ error: "This slot is already booked" }, { status: 409 });
    }

    return NextResponse.json({ error: "Failed to submit visit request" }, { status: 500 });
  }

  // Notify admins of new visit request
  await notifyAdmins({
    title: "New Property Visit Request",
    body: `A new visit has been booked by ${payload.visitor_name} for ${payload.visit_date} at ${payload.visit_time}.`,
    type: "visit_request",
    metadata: { visit_id: data?.id, property_id: payload.property_id },
  });

  await cacheDel(`slots:${payload.property_id}:${payload.visit_date}`);

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
