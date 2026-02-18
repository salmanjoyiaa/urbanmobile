import { NextResponse } from "next/server";
import twilio from "twilio";
import { createRouteClient } from "@/lib/supabase/route";

export async function POST(request: Request) {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const signature = request.headers.get("x-twilio-signature");

  if (!authToken || !signature) {
    return NextResponse.json({ error: "Missing Twilio config or signature" }, { status: 403 });
  }

  const formData = await request.formData();
  const payload = Object.fromEntries(formData.entries());

  const isValid = twilio.validateRequest(
    authToken,
    signature,
    request.url,
    payload as Record<string, string>
  );

  if (!isValid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
  }

  const supabase = await createRouteClient();
  await supabase.from("audit_log").insert({
    actor_id: null,
    action: "whatsapp_delivery_status",
    entity_type: "twilio_message",
    entity_id: null,
    metadata: {
      messageSid: payload.MessageSid || null,
      messageStatus: payload.MessageStatus || payload.SmsStatus || null,
      to: payload.To || null,
      from: payload.From || null,
      errorCode: payload.ErrorCode || null,
      errorMessage: payload.ErrorMessage || null,
    },
  } as never);

  return new NextResponse("ok", { status: 200 });
}
