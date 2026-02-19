import twilio from "twilio";
import * as Sentry from "@sentry/nextjs";

type SendResult = {
  success: boolean;
  sid?: string;
  error?: string;
};

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const from = process.env.TWILIO_WHATSAPP_FROM;

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

  return { success: false, error: lastError || "Failed to send WhatsApp message" };
}
