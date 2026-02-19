# UrbanSaudi - Production Readiness Checklist

Use this checklist to ensure all components are configured before going live.

---

## 🗄️ Database Setup

### Supabase Project
- [ ] Supabase project created (region: Central EU - Frankfurt)
- [ ] Database password saved securely
- [ ] SQL migration executed successfully (`SUPABASE_SETUP.md`)
- [ ] 8 tables verified in Table Editor:
  - [ ] profiles
  - [ ] agents
  - [ ] properties
  - [ ] products
  - [ ] visit_requests
  - [ ] buy_requests
  - [ ] notifications
  - [ ] audit_log

### Storage Buckets
- [ ] **property-images** bucket created (public, 10MB max)
- [ ] **product-images** bucket created (public, 5MB max)
- [ ] **agent-documents** bucket created (private, 5MB max)
- [ ] **avatars** bucket created (public, 2MB max)
- [ ] Storage policies configured for each bucket (see DEPLOYMENT.md Phase 1.4)

### Realtime & Indexes
- [ ] Realtime enabled on `visit_requests` table
- [ ] Realtime enabled on `notifications` table
- [ ] All indexes created (verify with: `SELECT tablename, indexname FROM pg_indexes WHERE schemaname = 'public'`)

### API Keys
- [ ] `NEXT_PUBLIC_SUPABASE_URL` copied from Settings → API
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` copied from Settings → API
- [ ] `SUPABASE_SERVICE_ROLE_KEY` copied (⚠️ keep secret!)

---

## 📦 Redis Cache Setup

### Upstash Account
- [ ] Upstash account created
- [ ] Redis database created (name: `urbansaudi-cache`)
- [ ] Region selected: EU-West-1 (Ireland)
- [ ] TLS enabled
- [ ] Eviction policy: allkeys-lru

### Credentials
- [ ] `UPSTASH_REDIS_REST_URL` copied
- [ ] `UPSTASH_REDIS_REST_TOKEN` copied
- [ ] Free tier limits understood (10K requests/day)

---

## 📱 WhatsApp Notifications

### Twilio Account
- [ ] Twilio account created and verified
- [ ] Phone number verified
- [ ] WhatsApp sandbox connected (for testing)
- [ ] Production WhatsApp Business API requested (if going live)

### Credentials
- [ ] `TWILIO_ACCOUNT_SID` copied from Console
- [ ] `TWILIO_AUTH_TOKEN` copied (⚠️ keep secret!)
- [ ] `TWILIO_WHATSAPP_FROM` set (e.g., `whatsapp:+14155238886`)

### Webhook Configuration (After Vercel Deploy)
- [ ] Webhook URL configured: `https://your-domain.vercel.app/api/whatsapp/webhook`
- [ ] HTTP Method: POST
- [ ] Test webhook with sample message

---

## 🔐 Environment Variables

### Local Development
- [ ] `.env.local` created from `.env.example`
- [ ] All required variables filled:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `UPSTASH_REDIS_REST_URL` (optional)
  - [ ] `UPSTASH_REDIS_REST_TOKEN` (optional)
  - [ ] `TWILIO_ACCOUNT_SID` (optional)
  - [ ] `TWILIO_AUTH_TOKEN` (optional)
  - [ ] `TWILIO_WHATSAPP_FROM` (optional)
  - [ ] `NEXT_PUBLIC_SITE_URL=http://localhost:3000`
  - [ ] `NEXT_PUBLIC_SITE_NAME=UrbanSaudi`
  - [ ] `ADMIN_WHATSAPP_NUMBER=+966XXXXXXXXX`
- [ ] Local build successful: `npm run build`
- [ ] Local server runs: `npm run dev`

### Vercel Production
- [ ] All environment variables added in Vercel dashboard
- [ ] Production site URL updated: `NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app`
- [ ] Variables assigned to correct environments:
  - [x] Production (for live site)
  - [x] Preview (for PR deployments)
  - [ ] Development (for `vercel dev` local testing)

---

## 📤 GitHub Repository

### Code Push
- [ ] Git initialized: `git init`
- [ ] Remote added: `git remote add origin https://github.com/salmanjoyiaa/urbanmobile.git`
- [ ] All changes committed
- [ ] Code pushed to GitHub: `git push -u origin main`
- [ ] Repository visible at: https://github.com/salmanjoyiaa/urbanmobile

### Security Checks
- [ ] `.env.local` **NOT** in repository (should be in `.gitignore`)
- [ ] No hardcoded secrets in code (use environment variables)
- [ ] `.gitignore` includes: `.env`, `.env*.local`, `.vercel`, `node_modules`

---

## 🚀 Vercel Deployment

### Project Setup
- [ ] Vercel account connected to GitHub
- [ ] Project imported from GitHub (`salmanjoyiaa/urbanmobile`)
- [ ] Framework preset: Next.js (auto-detected)
- [ ] Root directory: `./`
- [ ] Build command: `npm run build`
- [ ] Install command: `npm install`

### Environment Variables in Vercel
- [ ] All 13 environment variables added
- [ ] Secret variables marked (don't use in client-side code):
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `TWILIO_AUTH_TOKEN`
  - `UPSTASH_REDIS_REST_TOKEN`
- [ ] Public variables prefixed with `NEXT_PUBLIC_`

### Deployment
- [ ] Initial deployment successful (build passed)
- [ ] Deployment URL accessible: `https://urbanmobile-xxxxx.vercel.app`
- [ ] No build errors in Vercel logs
- [ ] No runtime errors in Function logs

---

## 🔧 Post-Deployment Configuration

### Supabase Updates
- [ ] Site URL updated: `https://your-vercel-domain.vercel.app`
- [ ] Redirect URLs added:
  - `https://your-vercel-domain.vercel.app/auth/callback`
  - `http://localhost:3000/auth/callback` (for local dev)

### Twilio Webhook Update
- [ ] Webhook URL updated to production domain
- [ ] Test webhook delivery from Twilio Console

### Admin User Creation
- [ ] First user signed up via app (`https://your-domain.vercel.app/signup`)
- [ ] User promoted to admin via Supabase SQL Editor:
  ```sql
  UPDATE profiles SET role = 'admin' 
  WHERE email = 'admin@urbansaudi.com';
  ```
- [ ] Admin dashboard accessible: `/admin`

---

## ✅ Feature Testing

### Authentication Flow
- [ ] User signup works (customer role)
- [ ] Email verification sent (check Supabase Auth logs)
- [ ] Login works
- [ ] Logout works
- [ ] Password reset works (if implemented)

### Agent Workflow
- [ ] Agent signup flow completes
- [ ] Agent pending approval page shows
- [ ] Admin sees new agent in `/admin/agents`
- [ ] Admin approves agent
- [ ] Agent receives WhatsApp approval (if Twilio connected)
- [ ] Agent dashboard loads: `/agent`
- [ ] Agent can create property with images
- [ ] Agent can create product with images
- [ ] Property appears on public browse page

### Customer Workflow
- [ ] Properties browse page loads (`/properties`)
- [ ] Filters work (city, type, price, bedrooms)
- [ ] Property detail page shows all info
- [ ] Visit scheduler opens
- [ ] Date picker works
- [ ] Slot grid shows available times
- [ ] Visit request submits successfully
- [ ] Admin sees visit request in `/admin/visits`
- [ ] Admin confirms visit
- [ ] Customer receives WhatsApp confirmation (if Twilio connected)

### Admin Workflow
- [ ] Admin dashboard loads: `/admin`
- [ ] Stats cards show correct counts
- [ ] Agent approval/rejection works
- [ ] Visit confirmation/cancellation works
- [ ] Buy request confirmation works
- [ ] Audit log shows all admin actions

### Realtime Features
- [ ] Open property in two browser tabs
- [ ] Book slot in tab 1 → slot disappears in tab 2 (within 2s)
- [ ] Admin confirms visit → notification bell lights up for customer
- [ ] Notification onClick navigates to correct page

### Performance & Caching
- [ ] Check Upstash metrics for cache hits
- [ ] Properties list cached (verify via Vercel logs: "Cache hit")
- [ ] Visit slots cached
- [ ] Cache invalidates on new booking
- [ ] Page loads under 2 seconds (check Vercel Analytics)

---

## 🔍 Monitoring Setup

### Vercel Analytics
- [ ] Analytics tab shows page views
- [ ] Web Vitals tracked (LCP, FID, CLS)
- [ ] No 500 errors in Function logs

### Supabase Monitoring
- [ ] Database size under free tier limit (500 MB)
- [ ] API requests under rate limits
- [ ] Storage usage under free tier limit (1 GB)
- [ ] No slow queries (Database → Logs)

### Upstash Monitoring
- [ ] Request count under 10K/day
- [ ] Cache hit rate > 70%
- [ ] Memory usage stable

### Twilio Monitoring
- [ ] WhatsApp messages delivered successfully (Monitor → Logs)
- [ ] Error rate < 5%
- [ ] Billing alerts configured (if on paid plan)

### Sentry (Optional)
- [ ] Sentry project created
- [ ] DSN added to `NEXT_PUBLIC_SENTRY_DSN`
- [ ] Client-side errors tracked
- [ ] Server-side errors tracked
- [ ] Source maps uploaded (automatic via `@sentry/nextjs`)

---

## 🛡️ Security Validation

### Secrets Management
- [ ] No secrets exposed in client-side code
- [ ] `SUPABASE_SERVICE_ROLE_KEY` only used server-side
- [ ] `TWILIO_AUTH_TOKEN` only used server-side
- [ ] Environment variables not logged or exposed

### Row Level Security
- [ ] Agents can only see own properties/products
- [ ] Customers cannot access admin/agent dashboards
- [ ] RLS policies tested with multiple user roles
- [ ] Admin can access all data

### API Security
- [ ] All API routes validate authentication
- [ ] Agent endpoints derive `agent_id` server-side (never from client)
- [ ] Rate limiting active on visit/lead endpoints (3/hour)
- [ ] Webhook signatures validated (Twilio HMAC)

### Headers & CSP
- [ ] HSTS enabled (check response headers)
- [ ] X-Frame-Options: DENY
- [ ] X-Content-Type-Options: nosniff
- [ ] CSP configured (next.config.mjs)
- [ ] HTTPS enforced (Vercel default)

---

## 📊 Pre-Launch Checklist

### Performance
- [ ] Lighthouse score > 90 for Performance
- [ ] First Contentful Paint < 1.8s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Total Blocking Time < 300ms
- [ ] Images optimized (use Next.js Image component)

### SEO (if applicable)
- [ ] Meta tags set in layout.tsx
- [ ] Open Graph tags configured
- [ ] Sitemap generated (optional: add sitemap.xml)
- [ ] robots.txt configured (optional)

### Accessibility
- [ ] Forms have proper labels
- [ ] Buttons have descriptive text
- [ ] Color contrast meets WCAG AA standards
- [ ] Keyboard navigation works

### Mobile Responsiveness
- [ ] Test on mobile viewport (iPhone, Android)
- [ ] Touch targets > 44x44px
- [ ] No horizontal scroll
- [ ] Forms usable on mobile

---

## 🚦 Go-Live Checklist

### Final Checks
- [ ] All critical bugs fixed
- [ ] All user flows tested end-to-end
- [ ] Backup database (Supabase: Settings → Database → Backups)
- [ ] Verify rate limits appropriate for expected traffic
- [ ] Monitor logs during first 24 hours
- [ ] Have rollback plan ready (previous deployment in Vercel)

### Communication
- [ ] Admin WhatsApp number configured
- [ ] Admin receives agent signup notifications
- [ ] Customers receive visit confirmations
- [ ] Email templates reviewed (if using email notifications)

### Documentation
- [ ] README.md updated with project overview
- [ ] DEPLOYMENT.md available for future deployments
- [ ] Environment variables documented
- [ ] Admin credentials saved securely (password manager)

---

## 📞 Support Contacts

### Service Providers
- **Supabase Support**: https://supabase.com/support
- **Vercel Support**: https://vercel.com/support
- **Twilio Support**: https://www.twilio.com/help/contact
- **Upstash Support**: https://upstash.com/docs

### Troubleshooting
- Check Vercel Function logs for API errors
- Check Supabase Database logs for query issues
- Check Twilio Console for WhatsApp delivery failures
- Check browser console for client-side errors
- Review DEPLOYMENT.md Troubleshooting section

---

**✅ When all boxes are checked, you're ready for production!**

Last updated: December 2024
