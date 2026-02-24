/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/ban-ts-comment */
import twilio from "twilio";
import * as Sentry from "@sentry/nextjs";
import { createAdminClient } from "@/lib/supabase/admin";

type SendResult = {
  success: boolean;
  sid?: string;
  error?: string;
};

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const rawFrom = process.env.TWILIO_WHATSAPP_FROM || "";
const from = rawFrom.replace(/\s+/g, "").startsWith("whatsapp:")
  ? rawFrom.replace(/\s+/g, "")
  : (rawFrom ? `whatsapp:${rawFrom.replace(/\s+/g, "")}` : undefined);

const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isE164Phone(value: string) {
  return /^\+[1-9]\d{7,14}$/.test(value.trim());
}

function normalizeWhatsAppTo(value: string) {
  const trimmed = value.trim();
  return trimmed.startsWith("whatsapp:") ? trimmed : `whatsapp:${trimmed}`;
}

export async function sendWhatsApp(to: string, body: string): Promise<SendResult> {
  const supabase = createAdminClient();

  if (!client || !from) {
    const msg = "Twilio is not configured";
    Sentry.captureMessage(msg, {
      level: "warning",
      contexts: {
        twilio_whatsapp: {
          recipient: to,
          configured: !!client && !!from,
        },
      },
    });

    const { error: logError } = await supabase.from("notification_logs").insert({
      channel: "whatsapp",
      recipient: to,
      content: body,
      subject: null,
      status: "failed",
      error_message: msg,
      metadata: null,
    } as any);
    if (logError) console.error("[twilio:log:error]", logError);

    return { success: false, error: msg };
  }

  const normalizedTo = to.replace(/^whatsapp:/, "").trim();

  if (!isE164Phone(normalizedTo)) {
    const msg = "Recipient phone must be in E.164 format";
    Sentry.captureMessage(msg, {
      level: "warning",
      contexts: {
        twilio_whatsapp: {
          recipient: normalizedTo,
          validation_failed: true,
        },
      },
    });

    const { error: logError } = await supabase.from("notification_logs").insert({
      channel: "whatsapp",
      recipient: normalizedTo,
      content: body,
      subject: null,
      status: "failed",
      error_message: msg,
      metadata: null,
    } as any);
    if (logError) console.error("[twilio:log:error]", logError);

    return { success: false, error: msg };
  }

  let lastError: string | undefined;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const message = await client.messages.create({
        from,
        to: normalizeWhatsAppTo(normalizedTo),
        body,
      });

      const { error: logError } = await supabase.from("notification_logs").insert({
        channel: "whatsapp",
        recipient: normalizedTo,
        content: body,
        subject: null,
        status: "sent",
        error_message: null,
        metadata: { sid: message.sid },
      } as any);
      if (logError) console.error("[twilio:log:error]", logError);

      return { success: true, sid: message.sid };
    } catch (error) {
      lastError = error instanceof Error ? error.message : "Unknown Twilio error";
      if (attempt < 3) {
        await sleep(250 * 2 ** (attempt - 1));
      }
    }
  }

  // Log failure after all retries exhausted
  Sentry.captureException(new Error(lastError || "Failed to send WhatsApp message"), {
    contexts: {
      twilio_whatsapp: {
        recipient: normalizedTo,
        body_length: body.length,
        retry_attempts: 3,
        final_error: lastError,
      },
    },
    level: "error",
  });

  const { error: logError } = await supabase.from("notification_logs").insert({
    channel: "whatsapp",
    recipient: normalizedTo,
    content: body,
    subject: null,
    status: "failed",
    error_message: lastError || "Unknown error",
    metadata: null,
  } as any);
  if (logError) console.error("[twilio:log:error]", logError);

  return { success: false, error: lastError || "Failed to send WhatsApp message" };
}

/** Content variables keyed by placeholder index as string, e.g. { "1": "John", "2": "SJ Villa" } */
export async function sendWhatsAppTemplate(
  to: string,
  contentSid: string,
  contentVariables: Record<string, string>
): Promise<SendResult> {
  const supabase = createAdminClient();

  if (!client || !from) {
    const msg = "Twilio is not configured";
    Sentry.captureMessage(msg, {
      level: "warning",
      contexts: {
        twilio_whatsapp: {
          recipient: to,
          configured: !!client && !!from,
        },
      },
    });
    const { error: logError } = await supabase.from("notification_logs").insert({
      channel: "whatsapp",
      recipient: to,
      content: `[Template ${contentSid}]`,
      subject: null,
      status: "failed",
      error_message: msg,
      metadata: { contentSid },
    } as any);
    if (logError) console.error("[twilio:log:error]", logError);
    return { success: false, error: msg };
  }

  const normalizedTo = to.replace(/^whatsapp:/, "").trim();
  if (!isE164Phone(normalizedTo)) {
    const msg = "Recipient phone must be in E.164 format";
    Sentry.captureMessage(msg, {
      level: "warning",
      contexts: { twilio_whatsapp: { recipient: normalizedTo, validation_failed: true } },
    });
    const { error: logError } = await supabase.from("notification_logs").insert({
      channel: "whatsapp",
      recipient: normalizedTo,
      content: `[Template ${contentSid}]`,
      subject: null,
      status: "failed",
      error_message: msg,
      metadata: { contentSid },
    } as any);
    if (logError) console.error("[twilio:log:error]", logError);
    return { success: false, error: msg };
  }

  let lastError: string | undefined;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const message = await client.messages.create({
        from,
        to: normalizeWhatsAppTo(normalizedTo),
        contentSid,
        contentVariables: JSON.stringify(contentVariables),
      });

      const { error: logError } = await supabase.from("notification_logs").insert({
        channel: "whatsapp",
        recipient: normalizedTo,
        content: `[Template ${contentSid}]`,
        subject: null,
        status: "sent",
        error_message: null,
        metadata: { sid: message.sid, contentSid },
      } as any);
      if (logError) console.error("[twilio:log:error]", logError);
      return { success: true, sid: message.sid };
    } catch (error) {
      lastError = error instanceof Error ? error.message : "Unknown Twilio error";
      if (attempt < 3) await sleep(250 * 2 ** (attempt - 1));
    }
  }

  Sentry.captureException(new Error(lastError || "Failed to send WhatsApp template"), {
    contexts: {
      twilio_whatsapp: {
        recipient: normalizedTo,
        contentSid,
        retry_attempts: 3,
        final_error: lastError,
      },
    },
    level: "error",
  });
  const { error: logError } = await supabase.from("notification_logs").insert({
    channel: "whatsapp",
    recipient: normalizedTo,
    content: `[Template ${contentSid}]`,
    subject: null,
    status: "failed",
    error_message: lastError || "Unknown error",
    metadata: { contentSid },
  } as any);
  if (logError) console.error("[twilio:log:error]", logError);
  return { success: false, error: lastError || "Failed to send WhatsApp template" };
}
