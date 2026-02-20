/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/ban-ts-comment */
import { Resend } from "resend";
import * as Sentry from "@sentry/nextjs";
import { createAdminClient } from "@/lib/supabase/admin";

const apiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

const resend = apiKey ? new Resend(apiKey) : null;

type SendEmailResult = {
  success: boolean;
  id?: string;
  error?: string;
};

export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<SendEmailResult> {
  const supabase = createAdminClient();

  if (!resend) {
    console.log("[email:skip] Resend not configured");
    Sentry.captureMessage("Resend email service not configured", {
      level: "warning",
      contexts: {
        resend_email: {
          recipient: params.to,
          subject: params.subject,
          configured: !!resend,
        },
      },
    });

    // @ts-expect-error -- notification_logs insert type mismatch
    await supabase.from("notification_logs").insert({
      channel: "email",
      recipient: params.to,
      subject: params.subject,
      content: params.html,
      status: "failed",
      error_message: "Resend is not configured",
    });

    return { success: false, error: "Resend is not configured" };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: `UrbanSaudi <${fromEmail}>`,
      to: params.to,
      subject: params.subject,
      html: params.html,
    });

    if (error) {
      console.error("[email:error]", error);
      Sentry.captureException(new Error(error.message), {
        contexts: {
          resend_email: {
            recipient: params.to,
            subject: params.subject,
            html_length: params.html.length,
            resend_error: error.message,
          },
        },
        level: "error",
      });

      // @ts-expect-error -- notification_logs insert type mismatch
      await supabase.from("notification_logs").insert({
        channel: "email",
        recipient: params.to,
        subject: params.subject,
        content: params.html,
        status: "failed",
        error_message: error.message,
      });

      return { success: false, error: error.message };
    }

    // @ts-expect-error -- notification_logs insert type mismatch
    await supabase.from("notification_logs").insert({
      channel: "email",
      recipient: params.to,
      subject: params.subject,
      content: params.html,
      status: "sent",
      metadata: { resend_id: data?.id },
    });

    return { success: true, id: data?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown email error";
    console.error("[email:error]", message);
    Sentry.captureException(err, {
      contexts: {
        resend_email: {
          recipient: params.to,
          subject: params.subject,
          html_length: params.html.length,
          error_message: message,
        },
      },
      level: "error",
    });

    // @ts-expect-error -- notification_logs insert type mismatch
    await supabase.from("notification_logs").insert({
      channel: "email",
      recipient: params.to,
      subject: params.subject,
      content: params.html,
      status: "failed",
      error_message: message,
    });

    return { success: false, error: message };
  }
}
