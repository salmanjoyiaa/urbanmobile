import * as Sentry from "@sentry/nextjs";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN ?? "https://927a788f5b5aeb2e807ac22f9bca56fb@o4510909724753920.ingest.de.sentry.io/4510909753000016";

Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  tracesSampleRate: 1.0,
  integrations: [Sentry.replayIntegration()],
  enableLogs: true,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  sendDefaultPii: true,
});
