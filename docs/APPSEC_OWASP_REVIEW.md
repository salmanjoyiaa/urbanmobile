# AppSec Report — OWASP Top 10 Aligned

**Project:** urbansaudi  
**Scope:** Full codebase (src/, middleware, next.config, env usage)  
**Date:** 2025

---

## A01 — Broken Access Control

| Finding | Severity | Location | Recommendation |
|--------|----------|----------|-----------------|
| Admin API routes use getAdminRouteContext() | OK | src/lib/admin.ts | No change; ensures 401/403 for non-admin. |
| Agent API routes enforce ownership | OK | e.g. src/app/api/agent/properties/[id]/route.ts | GET/PATCH/DELETE filter by `agent_id` / profile; IDOR risk mitigated. |
| Admin properties/products [id] use local checkAdmin() | Low | src/app/api/admin/properties/[id]/route.ts, admin/products/[id] | Consider using getAdminRouteContext() for consistency; behavior is correct (admin can access any). |
| Middleware role checks | OK | middleware.ts | Public, auth, callback, then protected; admin/agent routes enforce role. |
| Pending-approval redirect | OK | middleware.ts | Unapproved agents redirected to /pending-approval. |

**Verdict:** Access control is correctly enforced. Optional: standardize admin API auth on getAdminRouteContext() everywhere.

---

## A02 — Cryptographic Failures

| Finding | Severity | Location | Recommendation |
|--------|----------|----------|-----------------|
| Env validation | OK | src/config/env.ts | Zod schema for NEXT_PUBLIC_* and server vars; no secrets in client bundle. |
| Service role key server-only | OK | src/lib/supabase/admin.ts | Used only in server-side code (admin client, resend/twilio usage). |
| Twilio webhook signature | OK | src/app/api/whatsapp/webhook/route.ts | Validates x-twilio-signature with TWILIO_AUTH_TOKEN before processing. |
| RESEND_API_KEY not in env schema | Low | src/lib/resend.ts, src/config/env.ts | Add RESEND_API_KEY (optional) to serverEnvSchema for documentation; resend.ts already handles missing key. |

**Verdict:** No critical issues. Optional: add RESEND_API_KEY and RESEND_FROM_EMAIL to server env schema.

---

## A03 — Injection

| Finding | Severity | Location | Recommendation |
|--------|----------|----------|-----------------|
| API request bodies validated with Zod | OK | e.g. src/app/api/leads/route.ts, maintenance/route.ts, api/agents/route.ts | Validators (validators.ts) used; invalid payloads rejected. |
| Supabase queries | OK | All API routes | Parameterized via Supabase client; no raw SQL from user input. |
| sanitize.ts present, not used on all free text | Low | src/lib/sanitize.ts | Used for file names (signup agent, image-uploader). Consider applying sanitizeText/sanitizeHTML to user-supplied description/message fields before DB/email. |
| Email/phone in validators | OK | src/lib/validators.ts | Email regex, length limits; phone normalized. |

**Verdict:** Injection risk is low. Optional: run sanitize on message/details/bio fields before insert.

---

## A04 — Insecure Design

| Finding | Severity | Location | Recommendation |
|--------|----------|----------|-----------------|
| Rate limiting on leads | OK | src/app/api/leads/route.ts | 3 per hour per IP (Upstash or in-memory). |
| Rate limiting on maintenance | OK | src/app/api/maintenance/route.ts | Same. |
| Audit log for sensitive actions | OK | src/lib/admin.ts writeAuditLog | Used by admin agent/visit/lead actions. |
| No rate limit on agent signup | Low | src/app/api/agents/route.ts | Consider rate limit by IP or email to prevent abuse. |

**Verdict:** Design is sound. Optional: add rate limit to POST /api/agents.

---

## A05 — Security Misconfiguration

| Finding | Severity | Location | Recommendation |
|--------|----------|----------|-----------------|
| Security headers | OK | next.config.mjs | HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy. |
| CSP allows 'unsafe-inline' and 'unsafe-eval' | Medium | next.config.mjs line 5 | Tighten when possible: remove 'unsafe-eval'; use nonces or hashes for scripts if feasible with Next.js. |
| frame-ancestors 'none' | OK | next.config.mjs | Prevents clickjacking. |
| Image remotePatterns | OK | next.config.mjs | Limited to Supabase and Unsplash. |

**Verdict:** One medium finding: CSP. Recommend incremental tightening (e.g. remove unsafe-eval first).

---

## A06 — Vulnerable and Outdated Components

| Finding | Severity | Location | Recommendation |
|--------|----------|----------|-----------------|
| npm audit | OK | package.json / lockfile | Run `npm audit`: 0 vulnerabilities reported. |
| Dependencies | Info | package.json | Keep Next.js, Supabase, and other deps updated regularly. |

**Verdict:** No known vulnerable components at review time.

---

## A07 — Identification and Authentication Failures

| Finding | Severity | Location | Recommendation |
|--------|----------|----------|-----------------|
| Session handling | OK | src/lib/supabase/middleware.ts | updateSession refreshes Supabase session; cookies set correctly. |
| Auth callback | OK | src/app/(auth)/callback/route.ts | Exchange code for session. |
| Middleware redirects | OK | middleware.ts | Unauthenticated users sent to /login with redirect param; role-based redirect after login. |
| Agent approval gate | OK | middleware.ts | Agents must be approved before accessing /agent/*. |

**Verdict:** Auth and session design are solid.

---

## A08 — Software and Data Integrity Failures

| Finding | Severity | Location | Recommendation |
|--------|----------|----------|-----------------|
| WhatsApp webhook | OK | src/app/api/whatsapp/webhook/route.ts | Validates Twilio signature; rejects invalid requests. |
| Dependency integrity | OK | package-lock.json | Use lockfile in CI and deploy. |

**Verdict:** No issues identified.

---

## A09 — Security Logging and Monitoring Failures

| Finding | Severity | Location | Recommendation |
|--------|----------|----------|-----------------|
| Sentry | OK | sentry.client.config.ts, sentry.server.config.ts | Errors and rate-limit events captured. |
| Audit log | OK | src/lib/admin.ts | writeAuditLog for admin actions; WhatsApp delivery status logged to audit_log. |
| Notification logs | OK | src/lib/resend.ts, src/lib/twilio.ts | Logs to notification_logs for email/WhatsApp. |

**Verdict:** Logging and monitoring are in place.

---

## A10 — Server-Side Request Forgery (SSRF)

| Finding | Severity | Location | Recommendation |
|--------|----------|----------|-----------------|
| No user-controlled fetch URLs | OK | Codebase | Twilio/Resend/Supabase use fixed env URLs; no user input passed to fetch URL. |

**Verdict:** No SSRF vectors identified.

---

## Summary

| Category | Critical | High | Medium | Low |
|----------|----------|------|--------|-----|
| Count | 0 | 0 | 1 | 3 |

**Recommended actions (priority):**
1. **Medium:** Tighten CSP in next.config.mjs (remove 'unsafe-eval' when possible; consider nonces for scripts).
2. **Low:** Add RESEND_API_KEY (and RESEND_FROM_EMAIL) to server env schema in env.ts.
3. **Low:** Standardize admin API routes on getAdminRouteContext() where a local checkAdmin() is used.
4. **Low:** Optionally sanitize free-text user inputs (message, details, bio) with lib/sanitize before DB/email.
5. **Low:** Optionally rate-limit POST /api/agents.
