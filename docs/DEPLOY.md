# Deployment Guide — Urbansaudi → theurbanpropertyestate

**Target repo:** https://github.com/salmanjoyiaa/theurbanpropertyestate  
**Preferred host:** Vercel (Next.js)

---

## 1. Prerequisites

- Node.js 18+
- Git
- Vercel account (or other host)
- Supabase project (URL + anon key + service role key)
- Optional: Upstash Redis, Twilio (WhatsApp), Resend (email), Sentry

---

## 2. Local Git and Push to GitHub

If the target repo **theurbanpropertyestate** already exists and you have access:

```bash
cd d:\Vibe\urbansaudi
git remote -v
# If origin points to another repo, add the deploy remote:
git remote add deploy https://github.com/salmanjoyiaa/theurbanpropertyestate.git
# Or rename: git remote rename origin current; git remote add origin https://github.com/salmanjoyiaa/theurbanpropertyestate.git

git add .
git commit -m "chore: theme, docs, and mobile QA"
git push deploy main
# Or: git push -u deploy main
```

If the target repo **does not exist** or you do not have push access:

1. Create a new repository on GitHub named `theurbanpropertyestate` (or fork/clone and use your own).
2. Add it as a remote and push:

```bash
git remote add deploy https://github.com/YOUR_USER/theurbanpropertyestate.git
git push -u deploy main
```

---

## 3. Environment Variables

Set these in **Vercel → Project → Settings → Environment Variables** (or equivalent):

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (server-only) |
| `NEXT_PUBLIC_SITE_URL` | Yes | Production URL (e.g. https://theurbanpropertyestate.vercel.app) |
| `NEXT_PUBLIC_SITE_NAME` | No | Default: UrbanSaudi |
| `UPSTASH_REDIS_REST_URL` | No | For rate limiting (leads/maintenance) |
| `UPSTASH_REDIS_REST_TOKEN` | No | For rate limiting |
| `TWILIO_ACCOUNT_SID` | No | WhatsApp webhook |
| `TWILIO_AUTH_TOKEN` | No | WhatsApp webhook signature validation |
| `TWILIO_WHATSAPP_FROM` | No | WhatsApp sender |
| `RESEND_API_KEY` | No | Email (Resend) |
| `RESEND_FROM_EMAIL` | No | From address |
| `NEXT_PUBLIC_SENTRY_DSN` / `SENTRY_DSN` | No | Sentry (optional) |

---

## 4. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in.
2. **Import** the GitHub repo `theurbanpropertyestate` (or connect existing).
3. Framework preset: **Next.js** (auto-detected).
4. Root directory: leave default.
5. Add all environment variables from the table above (Production, Preview, Development as needed).
6. Deploy. Vercel will run `next build`.

---

## 5. Post-Deploy Checks

- [ ] Homepage loads; theme toggle works (light/dark); preference persists on reload.
- [ ] Navigate to /properties, /products, /maintenance — same theme and no layout issues.
- [ ] Login/signup and dashboard: theme consistent; admin and agent see ThemeToggle.
- [ ] No console errors; no 404s for main routes.
- [ ] Mobile: test one narrow width (e.g. 375px) for overflow and tap targets.

---

## 6. Optional: Custom Domain

In Vercel → Project → Settings → Domains, add your domain and follow DNS instructions.
