import twilio from "twilio";

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
    return { success: false, error: "Twilio is not configured" };
  }

  const normalizedTo = to.replace(/^whatsapp:/, "").trim();

  if (!isE164Phone(normalizedTo)) {
    return { success: false, error: "Recipient phone must be in E.164 format" };
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

  return { success: false, error: lastError || "Failed to send WhatsApp message" };
}
