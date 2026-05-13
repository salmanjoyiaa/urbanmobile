import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPublicShareBaseUrl } from "@/config/site";
import {
  buildProductLeadWhatsAppUrl,
  buildTelUrl,
  formatProductContactWhatsAppBody,
} from "@/lib/product-lead-whatsapp";
import * as Sentry from "@sentry/nextjs";

const bodySchema = z.object({
  channel: z.enum(["whatsapp", "phone"]),
});

const redisEnabled =
  Boolean(process.env.UPSTASH_REDIS_REST_URL) && Boolean(process.env.UPSTASH_REDIS_REST_TOKEN);

const ratelimit = redisEnabled
  ? new Ratelimit({
      redis: new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
      }),
      limiter: Ratelimit.fixedWindow(20, "1 h"),
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
    const result = await ratelimit.limit(`product-contact:${ip}`);
    return { allowed: result.success, limit: result.limit, remaining: result.remaining };
  }

  const now = Date.now();
  const entry = memoryHits.get(ip);
  const max = 20;

  if (!entry || entry.resetAt < now) {
    memoryHits.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 });
    return { allowed: true, limit: max, remaining: max - 1 };
  }

  if (entry.count >= max) {
    return { allowed: false, limit: max, remaining: 0 };
  }

  entry.count += 1;
  return { allowed: true, limit: max, remaining: Math.max(max - entry.count, 0) };
}

type ProductSellerRow = {
  id: string;
  title: string;
  is_available: boolean;
  agents: {
    profiles: { phone: string | null } | null;
  } | null;
};

export async function POST(request: NextRequest, context: { params: { id: string } }) {
  const productId = context.params.id;
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
          "Retry-After": "3600",
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
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid payload" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: productRow, error: productError } = (await supabase
    .from("products")
    .select(
      `
      id,
      title,
      is_available,
      agents:agent_id (
        profiles:profile_id ( phone )
      )
    `
    )
    .eq("id", productId)
    .maybeSingle()) as { data: ProductSellerRow | null; error: { message: string } | null };

  if (productError) {
    console.error("[api/products/contact] product fetch error:", productError);
    return NextResponse.json({ error: "Could not load product" }, { status: 500 });
  }

  if (!productRow || !productRow.is_available) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const sellerPhone = productRow.agents?.profiles?.phone?.trim();
  if (!sellerPhone) {
    return NextResponse.json(
      { error: "This listing has no seller phone on file." },
      { status: 422 }
    );
  }

  const { error: insertError } = await supabase.from("product_contact_events").insert({
    product_id: productId,
    channel: parsed.data.channel,
  } as never);

  if (insertError) {
    console.error("[api/products/contact] insert error:", insertError);
    Sentry.captureException(new Error(insertError.message));
    return NextResponse.json({ error: "Could not record contact" }, { status: 500 });
  }

  const productUrl = `${getPublicShareBaseUrl()}/products/${productId}`;

  if (parsed.data.channel === "whatsapp") {
    const message = formatProductContactWhatsAppBody({
      productTitle: productRow.title,
      productUrl,
    });
    const whatsapp_url = buildProductLeadWhatsAppUrl(sellerPhone, message);
    if (!whatsapp_url) {
      return NextResponse.json({ error: "Invalid seller phone for WhatsApp." }, { status: 422 });
    }
    return NextResponse.json(
      { success: true, whatsapp_url },
      {
        status: 201,
        headers: {
          "X-RateLimit-Limit": String(limit.limit),
          "X-RateLimit-Remaining": String(limit.remaining),
        },
      }
    );
  }

  const tel_url = buildTelUrl(sellerPhone);
  if (!tel_url) {
    return NextResponse.json({ error: "Invalid seller phone for calling." }, { status: 422 });
  }

  return NextResponse.json(
    { success: true, tel_url },
    {
      status: 201,
      headers: {
        "X-RateLimit-Limit": String(limit.limit),
        "X-RateLimit-Remaining": String(limit.remaining),
      },
    }
  );
}
