import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { upsertAgentRowAndSetAgentRole } from "@/lib/server/agent-application";
import { enforceAgentSignupRateLimit, getClientIp } from "@/lib/server/agent-rate-limit";

const bodySchema = z
  .object({
    user_id: z.string().uuid(),
    email: z.string().email(),
    agent_type: z.enum(["property", "visiting", "seller", "maintenance"]),
    company_name: z.string().min(2).max(100).optional().nullable(),
    license_number: z.string().max(50).optional().nullable(),
    document_url: z.string().max(1000).optional().nullable(),
    bio: z.string().max(5000).optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.agent_type === "property" || data.agent_type === "visiting") {
      const c = (data.company_name ?? "").trim();
      if (c.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Company name is required",
          path: ["company_name"],
        });
      }
    }
  });

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = await enforceAgentSignupRateLimit(ip, "agents-after-signup");

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
    return NextResponse.json({ error: first }, { status: 400 });
  }

  const admin = createAdminClient();

  try {
    const { data: userData, error: userErr } = await admin.auth.admin.getUserById(parsed.data.user_id);
    if (userErr || !userData.user) {
      return NextResponse.json({ error: "Invalid user" }, { status: 400 });
    }

    const authEmail = userData.user.email?.toLowerCase().trim();
    const bodyEmail = parsed.data.email.toLowerCase().trim();
    if (!authEmail || authEmail !== bodyEmail) {
      return NextResponse.json({ error: "Email does not match this account" }, { status: 403 });
    }

    const companyTrim =
      parsed.data.agent_type === "property" || parsed.data.agent_type === "visiting"
        ? (parsed.data.company_name ?? "").trim()
        : null;

    const agentStatus = parsed.data.agent_type === "seller" ? "approved" : "pending";

    const result = await upsertAgentRowAndSetAgentRole(admin, {
      profileId: parsed.data.user_id,
      agent_type: parsed.data.agent_type,
      company_name: companyTrim && companyTrim.length > 0 ? companyTrim : null,
      license_number: parsed.data.license_number ?? null,
      document_url: parsed.data.document_url ?? null,
      bio: parsed.data.bio ?? null,
      status: agentStatus,
    });

    if (!result.ok) {
      console.error("[api/agents/after-signup] error:", result.error);
      Sentry.captureException(new Error(result.error));
      return NextResponse.json({ error: "Failed to create agent application" }, { status: 500 });
    }

    return NextResponse.json({ success: true, agent: result.agent }, { status: 201 });
  } catch (err) {
    console.error("[api/agents/after-signup] unexpected error:", err);
    Sentry.captureException(err as Error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
