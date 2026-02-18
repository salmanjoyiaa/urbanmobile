# UrbanSaudi - Production Deployment Guide

Complete guide to deploy UrbanSaudi real estate platform to production on Vercel with Supabase backend.

---

## 📋 Prerequisites

Before deployment, ensure you have:
- **GitHub Account** with repository ready
- **Vercel Account** (free tier works)
- **Supabase Account** (free tier works)
- **Upstash Account** for Redis (free tier: 10K requests/day)
- **Twilio Account** for WhatsApp Business API (pay-as-you-go)
- **Sentry Account** (optional, for error monitoring)

---

## 🚀 Deployment Checklist

### Phase 1: Database Setup (Supabase)

#### 1.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Choose organization, project name: `urbansaudi`, region: **Central EU** (Frankfurt - closest to Saudi Arabia)
3. **Generate database password** and save securely
4. Wait 2-3 minutes for provisioning

#### 1.2 Run Database Migration
1. Open **SQL Editor** in Supabase Dashboard
2. Copy entire contents of `supabase/migrations/00001_initial_schema.sql` (433 lines)
3. Paste into SQL Editor → Click **Run**
4. Verify: Check **Table Editor** → should show 8 tables:
   - `profiles`
   - `agents`
   - `properties`
   - `products`
   - `visit_requests`
   - `buy_requests`
   - `notifications`
   - `audit_log`

#### 1.3 Create Storage Buckets
1. Navigate to **Storage** → **+ New Bucket**
2. Create bucket: `agent-documents`
   - Public: ❌ No
   - Allowed MIME types: `application/pdf,image/jpeg,image/png`
   - Maximum file size: `5 MB`
3. Create bucket: `property-images`
   - Public: ✅ Yes
   - Allowed MIME types: `image/jpeg,image/png,image/webp`
   - Maximum file size: `10 MB`
4. Create bucket: `product-images`
   - Public: ✅ Yes
   - Allowed MIME types: `image/jpeg,image/png,image/webp`
   - Maximum file size: `5 MB`

#### 1.4 Configure Storage Policies
Copy and paste each policy in **Storage** → Bucket → **Policies**:

**For `agent-documents`:**
```sql
-- Allow authenticated users to upload their own documents
CREATE POLICY "Users upload own documents"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'agent-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow agents to read their own documents
CREATE POLICY "Agents read own documents"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'agent-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow admins to read all documents
CREATE POLICY "Admins read all documents"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'agent-documents' AND 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
```

**For `property-images` and `product-images`:**
```sql
-- Anyone can view public images
CREATE POLICY "Public images are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'property-images'); -- Change to 'product-images' for products bucket

-- Only agents can upload images
CREATE POLICY "Agents can upload images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'property-images' AND -- Change to 'product-images' for products bucket
  EXISTS (SELECT 1 FROM agents WHERE profile_id = auth.uid() AND status = 'approved')
);

-- Agents can delete their own images
CREATE POLICY "Agents can delete own images"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'property-images' AND -- Change to 'product-images' for products bucket
  EXISTS (
    SELECT 1 FROM agents a
    WHERE a.profile_id = auth.uid()
  )
);
```

#### 1.5 Enable Realtime
1. Go to **Database** → **Replication**
2. Find tables: `visit_requests`, `notifications`
3. Toggle **Realtime** ON for both tables
4. Click **Save**

#### 1.6 Get API Keys
1. Navigate to **Settings** → **API**
2. Copy and save:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public**: `eyJhbGc...` (public client key)
   - **service_role**: `eyJhbGc...` (secret server key - never expose to client!)

---

### Phase 2: Redis Setup (Upstash)

#### 2.1 Create Redis Database
1. Go to [upstash.com](https://upstash.com) → **Console** → **+ Create Database**
2. Name: `urbansaudi-cache`
3. Type: **Regional**
4. Region: **EU-West-1** (Ireland - closest to EU/Middle East)
5. TLS: ✅ Enabled
6. Eviction: **allkeys-lru** (auto-remove old cache)

#### 2.2 Get Redis Credentials
1. Open database → **REST API** tab
2. Copy:
   - **UPSTASH_REDIS_REST_URL**: `https://xxxxx.upstash.io`
   - **UPSTASH_REDIS_REST_TOKEN**: `AXX...`

---

### Phase 3: WhatsApp Setup (Twilio)

#### 3.1 Create Twilio Account
1. Go to [twilio.com](https://www.twilio.com) → **Sign Up**
2. Verify email and phone number
3. Navigate to **Console Dashboard**

#### 3.2 Set Up WhatsApp Sandbox (Development/Testing)
1. Go to **Messaging** → **Try it out** → **Send a WhatsApp message**
2. Follow instructions to connect your WhatsApp to sandbox
3. Send `join <sandbox-code>` to Twilio sandbox number
4. **Note:** Sandbox has limitations:
   - Only pre-approved numbers can receive messages
   - 24-hour session window
   - Limited message templates

#### 3.3 Production WhatsApp (Recommended)
For production, request access to **Twilio WhatsApp Business API**:
1. Go to **Messaging** → **WhatsApp** → **Senders**
2. Click **Request Access** to WhatsApp Business API
3. Fill out business profile (requires Facebook Business Manager)
4. Wait 1-5 business days for approval
5. Once approved, you get a dedicated WhatsApp Business number

#### 3.4 Get Twilio Credentials
1. Go to **Console** → **Account Info**
2. Copy:
   - **Account SID**: `ACxxxxxxx`
   - **Auth Token**: Click **Show** → copy token
   - **WhatsApp From Number**: `whatsapp:+14155238886` (sandbox) or `whatsapp:+966XXXXXXXX` (production)

#### 3.5 Configure Webhook (After Vercel Deployment)
1. Go to **Messaging** → **WhatsApp** → **Sandbox Settings** (or your WhatsApp number)
2. Set **Status Callback URL**: `https://your-vercel-domain.vercel.app/api/whatsapp/webhook`
3. HTTP Method: **POST**
4. Save

---

### Phase 4: Environment Variables

#### 4.1 Create Local `.env.local`
Copy `.env.example` to `.env.local` and fill with real values:

```bash
# Supabase (from Phase 1.6)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Upstash Redis (from Phase 2.2)
UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=AXX...

# Twilio WhatsApp (from Phase 3.4)
TWILIO_ACCOUNT_SID=ACxxxxxxx
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

# App Settings
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=UrbanSaudi

# Admin WhatsApp (for agent signup notifications)
ADMIN_WHATSAPP_NUMBER=+966500000000

# Sentry (optional - leave empty if not using)
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_DSN=
```

#### 4.2 Test Locally
```bash
npm install
npm run dev
```

Visit `http://localhost:3000` → Test:
- ✅ User signup/login
- ✅ Agent registration flow
- ✅ Property browsing
- ✅ Visit scheduling

---

### Phase 5: GitHub Setup

#### 5.1 Initialize Git Repository
```bash
cd d:\Vibe\urbansaudi
git init
git add .
git commit -m "Initial commit: UrbanSaudi real estate platform"
```

#### 5.2 Push to GitHub
```bash
git remote add origin https://github.com/salmanjoyiaa/urbanmobile.git
git branch -M main
git push -u origin main
```

**Note:** If repository already exists and has content:
```bash
git pull origin main --allow-unrelated-histories
git push -u origin main
```

#### 5.3 Verify Push
1. Visit `https://github.com/salmanjoyiaa/urbanmobile`
2. Check all files are present
3. Verify `.env.local` is **NOT** pushed (should be in `.gitignore`)

---

### Phase 6: Vercel Deployment

#### 6.1 Connect GitHub to Vercel
1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Click **Import Git Repository**
3. Select `salmanjoyiaa/urbanmobile`
4. Click **Import**

#### 6.2 Configure Build Settings
- **Framework Preset**: Next.js
- **Root Directory**: `./` (default)
- **Build Command**: `npm run build` (default)
- **Output Directory**: `.next` (default)
- **Install Command**: `npm install` (default)
- **Node.js Version**: 20.x (default)

#### 6.3 Add Environment Variables
Click **Environment Variables** → Add each variable:

| Variable | Value | Environment |
|----------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxx.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGc...` | Production, Preview, Development |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGc...` (⚠️ secret!) | Production, Preview |
| `UPSTASH_REDIS_REST_URL` | `https://xxxxx.upstash.io` | Production, Preview |
| `UPSTASH_REDIS_REST_TOKEN` | `AXX...` | Production, Preview |
| `TWILIO_ACCOUNT_SID` | `ACxxxxxxx` | Production, Preview |
| `TWILIO_AUTH_TOKEN` | `your-auth-token` (⚠️ secret!) | Production, Preview |
| `TWILIO_WHATSAPP_FROM` | `whatsapp:+14155238886` | Production, Preview |
| `NEXT_PUBLIC_SITE_URL` | `https://your-domain.vercel.app` | Production |
| `NEXT_PUBLIC_SITE_NAME` | `UrbanSaudi` | Production, Preview, Development |
| `ADMIN_WHATSAPP_NUMBER` | `+966500000000` | Production |
| `NEXT_PUBLIC_SENTRY_DSN` | (leave empty or add Sentry DSN) | Production, Preview |
| `SENTRY_DSN` | (leave empty or add Sentry DSN) | Production, Preview |

**Important:**
- Click **Production** for live site variables
- Click **Preview** for git branch deployments
- Click **Development** for local `vercel dev`

#### 6.4 Deploy
1. Click **Deploy**
2. Wait 2-4 minutes for build
3. Vercel will show deployment URL: `https://urbanmobile-xxxxx.vercel.app`

#### 6.5 Configure Custom Domain (Optional)
1. Go to **Settings** → **Domains**
2. Add your domain: `urbansaudi.com`
3. Update DNS records as shown by Vercel
4. Update `NEXT_PUBLIC_SITE_URL` to `https://urbansaudi.com`
5. Redeploy: **Deployments** → Latest → **...** → **Redeploy**

---

### Phase 7: Post-Deployment Setup

#### 7.1 Update Twilio Webhook URL
1. Go to Twilio Console → **Messaging** → **WhatsApp**
2. Update **Status Callback URL**: `https://your-vercel-domain.vercel.app/api/whatsapp/webhook`
3. Save

#### 7.2 Update Supabase Redirect URLs
1. Go to Supabase Dashboard → **Authentication** → **URL Configuration**
2. Add to **Redirect URLs**:
   ```
   https://your-vercel-domain.vercel.app/auth/callback
   http://localhost:3000/auth/callback
   ```
3. Set **Site URL**: `https://your-vercel-domain.vercel.app`

#### 7.3 Create First Admin User
Since no admin exists initially, use Supabase SQL Editor:

```sql
-- 1. Sign up user via app UI first
-- 2. Get user ID from auth.users table
SELECT id, email FROM auth.users WHERE email = 'admin@urbansaudi.com';

-- 3. Update user role to admin
UPDATE profiles 
SET role = 'admin' 
WHERE id = 'user-uuid-from-above';

-- Verify
SELECT email, role FROM profiles WHERE role = 'admin';
```

#### 7.4 Test Production Features

**Test Agent Workflow:**
1. ✅ Sign up as agent with license/company details
2. ✅ Check admin WhatsApp receives new agent notification
3. ✅ Login as admin → approve agent
4. ✅ Check agent WhatsApp receives approval message
5. ✅ Agent creates property with images
6. ✅ Verify property appears on public browse page

**Test Customer Workflow:**
1. ✅ Browse properties (check Redis cache logs in Vercel)
2. ✅ Schedule visit → verify realtime slot updates
3. ✅ Admin confirms visit
4. ✅ Customer receives WhatsApp confirmation
5. ✅ Submit buy request
6. ✅ Admin confirms buy request
7. ✅ Customer receives WhatsApp confirmation

**Test Realtime Features:**
1. ✅ Open property in two browser tabs
2. ✅ Book visit slot in tab 1
3. ✅ Verify slot disappears in tab 2 within 2 seconds
4. ✅ Login as admin → confirm visit
5. ✅ Notification bell lights up for customer instantly

---

## 🔧 Troubleshooting

### Build Failures on Vercel

**Error: `Module not found: Can't resolve '@/...'`**
- Check `tsconfig.json` has correct path aliases
- Ensure all imports use `@/` prefix consistently

**Error: `NEXT_PUBLIC_SUPABASE_URL is undefined`**
- Verify environment variables are added in Vercel dashboard
- Redeploy after adding variables

**Error: Type errors during build**
- Run `npm run build` locally first
- Fix all TypeScript errors before pushing

### Supabase Connection Issues

**Error: `Invalid API key`**
- Check `NEXT_PUBLIC_SUPABASE_ANON_KEY` matches Supabase dashboard
- Ensure no extra spaces in environment variable

**Error: `Row Level Security policy violation`**
- Verify RLS policies exist for table
- Check user authentication state
- Review policy logic in SQL migration

### WhatsApp Not Sending

**Messages not received:**
- Verify phone numbers use E.164 format: `+966XXXXXXXXX`
- Check Twilio console → **Monitor** → **Logs** for errors
- Ensure recipient has joined sandbox (for sandbox mode)
- Verify `TWILIO_WHATSAPP_FROM` matches your Twilio number

**Webhook not firing:**
- Check webhook URL is HTTPS (Vercel provides HTTPS by default)
- Verify webhook URL in Twilio matches deployed URL
- Check Vercel logs: **Deployments** → **Functions** → `/api/whatsapp/webhook`

### Redis Caching Issues

**Cache not working:**
- Check Upstash dashboard → **Database** → **Metrics** for request count
- Verify `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are correct
- Check Vercel logs for Redis connection errors
- App will work without Redis (degrades to no caching)

### Realtime Not Updating

**Slot updates not appearing:**
- Verify Realtime is enabled on `visit_requests` table in Supabase
- Check browser console for Realtime connection errors
- Ensure user has active network connection
- Test with two browser tabs side by side

---

## 📊 Monitoring & Maintenance

### Vercel Analytics
1. Go to **Analytics** tab in Vercel
2. Monitor: Page views, Web Vitals (LCP, FID, CLS), unique visitors
3. Free tier: Last 24 hours data

### Supabase Logs
1. **Database** → **Logs** → SQL queries, slow queries
2. **Auth** → **Logs** → Login attempts, failures
3. **Storage** → **Logs** → Upload errors

### Upstash Metrics
1. **Database** → **Metrics**
2. Monitor: Request count, hit rate, memory usage
3. Free tier: 10K requests/day (resets daily)

### Twilio Usage
1. **Monitor** → **Usage**
2. Track: WhatsApp message count, delivery rates
3. Set up billing alerts for overage

### Sentry Error Tracking (Optional)
1. Create project at [sentry.io](https://sentry.io)
2. Copy DSN → Add to `NEXT_PUBLIC_SENTRY_DSN` in Vercel
3. Redeploy
4. View errors: **Issues** → Real-time error reports with stack traces

---

## 🔐 Security Checklist

- ✅ **Never expose** `SUPABASE_SERVICE_ROLE_KEY` to client
- ✅ **Never expose** `TWILIO_AUTH_TOKEN` to client
- ✅ All API routes use server-side auth validation
- ✅ RLS policies enforce access control on all tables
- ✅ Rate limiting enabled on visit/lead submission (3 requests/hour)
- ✅ HTTPS enforced (Vercel default)
- ✅ CSP headers configured in `next.config.mjs`
- ✅ Agent IDs derived server-side, never from client input
- ✅ Webhook signatures validated (Twilio HMAC)
- ✅ File uploads restricted by MIME type and size
- ✅ Phone numbers validated to E.164 format

---

## 🚦 Production Readiness Checklist

### Pre-Launch
- [ ] All environment variables configured in Vercel
- [ ] Database migration executed successfully
- [ ] Storage buckets created with correct policies
- [ ] Realtime enabled on required tables
- [ ] Twilio webhook URL updated to production domain
- [ ] Supabase redirect URLs include production domain
- [ ] At least one admin user created manually
- [ ] Test all user flows end-to-end
- [ ] Test WhatsApp notifications on real phone numbers
- [ ] Verify Redis caching working (check Upstash metrics)
- [ ] Check Vercel build logs for warnings

### Post-Launch
- [ ] Monitor Vercel Analytics for traffic patterns
- [ ] Set up Supabase billing alerts (if using paid features)
- [ ] Set up Twilio billing alerts for WhatsApp usage
- [ ] Monitor Upstash request count (10K limit on free tier)
- [ ] Back up database weekly via Supabase (automatic on Pro plan)
- [ ] Review audit logs in admin dashboard weekly
- [ ] Test realtime features across geo-distributed users
- [ ] Add custom domain (if not using `vercel.app`)
- [ ] Configure CDN caching for image optimization
- [ ] Enable Sentry for production error tracking

---

## 📚 Additional Resources

- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Upstash Redis**: https://docs.upstash.com/redis
- **Twilio WhatsApp**: https://www.twilio.com/docs/whatsapp
- **TanStack Query**: https://tanstack.com/query/latest/docs/react

---

## 🆘 Support

For deployment issues:
1. Check Vercel build logs: **Deployments** → Click deployment → **Building** section
2. Check runtime logs: **Deployments** → **Functions** → Select function
3. Test locally with production env vars: Create `.env.production.local`
4. Review error messages in browser console (Network tab, Console tab)

Common commands:
```bash
# Local development
npm run dev

# Production build test
npm run build
npm run start

# Check environment variables
vercel env ls

# View deployment logs
vercel logs your-deployment-url

# Redeploy without code changes
vercel --prod
```

---

**Deployment complete!** 🎉 Your UrbanSaudi platform is now live at `https://your-domain.vercel.app`
