import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { createAdminClient } from "@/lib/supabase/admin";
import { notifyAdmins, notifyUsers } from "@/lib/admin";
import { buyRequestSchema } from "@/lib/validators";
import { siteConfig } from "@/config/site";
import { buildProductLeadWhatsAppUrl, formatProductLeadWhatsAppBody } from "@/lib/product-lead-whatsapp";
import * as Sentry from "@sentry/nextjs";

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
    Sentry.captureMessage("Rate limit exceeded for lead creation", {
      level: "info",
      contexts: {
        rate_limit: {
          ip,
          limit: limit.limit,
          endpoint: "/api/leads",
        },
      },
    });

    return NextResponse.json(
      { error: "Too many requests. Limit is 3 lead requests per hour. Please try again later." },
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
    Sentry.captureException(err, {
      contexts: {
        request: {
          endpoint: "/api/leads",
          method: "POST",
          error_type: "json_parse_error",
        },
      },
    });
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = buyRequestSchema.safeParse(body);

  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message || "Invalid payload";
    Sentry.captureMessage(`Validation failed for lead creation: ${firstError}`, {
      level: "debug",
      contexts: {
        validation: {
          endpoint: "/api/leads",
          errors: parsed.error.issues.map(e => ({
            path: e.path.join("."),
            message: e.message,
          })),
        },
      },
    });
    return NextResponse.json(
      { error: firstError },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  type ProductSellerRow = {
    id: string;
    title: string;
    agents: {
      profile_id: string;
      profiles: { id: string; phone: string | null } | null;
    } | null;
  };

  const { data: productRow, error: productError } = (await supabase
    .from("products")
    .select(
      `
      id,
      title,
      agents:agent_id (
        profile_id,
        profiles:profile_id ( id, phone )
      )
    `
    )
    .eq("id", parsed.data.product_id)
    .maybeSingle()) as { data: ProductSellerRow | null; error: { message: string } | null };

  if (productError) {
    console.error("[api/leads] product fetch error:", productError);
    return NextResponse.json({ error: "Could not load product" }, { status: 500 });
  }

  if (!productRow) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const sellerPhone = productRow.agents?.profiles?.phone?.trim();
  const sellerProfileId = productRow.agents?.profiles?.id;

  if (!sellerProfileId) {
    return NextResponse.json({ error: "Listing seller profile not found" }, { status: 422 });
  }

  if (!sellerPhone) {
    return NextResponse.json(
      { error: "This listing has no seller WhatsApp on file. Please contact support." },
      { status: 422 }
    );
  }

  const insertPayload = {
    product_id: parsed.data.product_id,
    buyer_name: parsed.data.buyer_name,
    buyer_phone: parsed.data.buyer_phone,
    buyer_email: null as string | null,
    message: null as string | null,
  };

  const { data: inserted, error } = (await supabase
    .from("buy_requests")
    .insert(insertPayload as never)
    .select("id")
    .single()) as {
      data: { id: string } | null;
      error: { message: string } | null;
    };

  if (error) {
    console.error("[api/leads] insert error:", error);
    Sentry.captureException(new Error(error.message), {
      contexts: {
        database: {
          endpoint: "/api/leads",
          table: "buy_requests",
          error: error.message,
        },
      },
    });
    return NextResponse.json({ error: error.message || "Failed to create lead request" }, { status: 500 });
  }

  const leadId = inserted?.id;
  const productUrl = `${siteConfig.url.replace(/\/$/, "")}/products/${parsed.data.product_id}`;
  const whatsappBody = formatProductLeadWhatsAppBody({
    buyerName: parsed.data.buyer_name,
    buyerPhone: parsed.data.buyer_phone,
    productTitle: productRow.title,
    productUrl,
    leadId: leadId ?? "",
  });
  const whatsapp_url = buildProductLeadWhatsAppUrl(sellerPhone, whatsappBody);

  if (!whatsapp_url) {
    return NextResponse.json(
      { error: "Seller phone is not valid for WhatsApp. Please contact support." },
      { status: 422 }
    );
  }

  try {
    await Promise.all([
      notifyAdmins({
        title: "New Product Buy Request",
        body: `A new product inquiry from ${parsed.data.buyer_name} (${parsed.data.buyer_phone}) for "${productRow.title}".`,
        type: "lead_status",
        metadata: { lead_id: leadId, product_id: parsed.data.product_id },
      }),
      notifyUsers({
        userIds: [sellerProfileId],
        title: "New product inquiry",
        body: `${parsed.data.buyer_name} wants to reach you about "${productRow.title}" on WhatsApp.`,
        type: "lead_status",
        metadata: { lead_id: leadId, product_id: parsed.data.product_id },
      }),
    ]);
  } catch (notifyErr) {
    Sentry.captureException(notifyErr instanceof Error ? notifyErr : new Error(String(notifyErr)));
  }

  return NextResponse.json(
    { id: leadId, success: true, whatsapp_url },
    {
      status: 201,
      headers: {
        "X-RateLimit-Limit": String(limit.limit),
        "X-RateLimit-Remaining": String(limit.remaining),
      },
    }
  );
}
