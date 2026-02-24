# Urbansaudi — Structure Map

## 1. Project Overview

- **Framework:** Next.js 14 App Router, React 18, TypeScript 5
- **Styling:** Tailwind CSS 3.4 + shadcn/ui (new-york style, CSS variables)
- **Backend:** Supabase (auth, PostgreSQL, storage)
- **State:** next-themes, Zustand (auth-store, notification-store), React Query
- **Key deps:** @supabase/ssr, next-themes, framer-motion, react-hook-form, zod, Resend, Twilio, Upstash Redis (rate limiting), Sentry

## 2. Directory Tree (Key Folders)

```
src/
├── app/
│   ├── page.tsx                    # Home (does not use (public) layout)
│   ├── layout.tsx                  # Root: ThemeProvider, QueryProvider, AuthProvider
│   ├── globals.css
│   ├── (auth)/                     # login, signup, signup/agent, callback, pending-approval
│   ├── (public)/                   # properties, products, maintenance (+ layout)
│   ├── (dashboard)/
│   │   ├── admin/                  # AdminShell, all admin pages
│   │   └── agent/                  # AgentShell, agent/visiting agent pages
│   └── api/                        # 20+ route files (admin, agent, public, webhooks)
├── components/
│   ├── home/                       # hero-section, homepage-nav, theme-toggle, featured-sliders, etc.
│   ├── layout/                     # mobile-nav, admin-shell, agent-shell, sidebar, notification-bell
│   ├── ui/                         # shadcn components
│   ├── property/, product/, visit/, admin/, dashboard/, shared/
├── lib/
│   ├── supabase/                   # client, server, route, admin, middleware
│   ├── validators.ts, utils.ts, sanitize.ts, format.ts, constants.ts
│   ├── resend.ts, twilio.ts, redis.ts, email-templates, whatsapp-templates
│   ├── country-data.ts, slots.ts, admin.ts
├── providers/                      # theme-provider, query-provider, auth-provider, toast-provider
├── config/                         # nav.ts, env.ts, site.ts
├── hooks/                          # use-auth, use-form-submission, use-realtime*, use-toast
├── queries/                        # properties, products, agents, leads, visits, notifications
├── stores/                         # auth-store, notification-store
├── types/                          # database.ts, models.ts, enums.ts
public/                             # images (3d.png, home_hero.png), favicon
```

## 3. Routes and Pages

| Route | File | Layout | Notes |
|-------|------|--------|-------|
| `/` | `app/page.tsx` | Root only | HomepageNav, HeroSection, FeaturedSliders, HowItWorks, Testimonials, MaintenanceServices, JoinTeam, inline footer |
| `/properties` | `(public)/properties/page.tsx` | (public) | List |
| `/properties/[id]` | `(public)/properties/[id]/page.tsx` | (public) | Detail + visit scheduler |
| `/products` | `(public)/products/page.tsx` | (public) | List |
| `/products/[id]` | `(public)/products/[id]/page.tsx` | (public) | Detail + buy request |
| `/maintenance` | `(public)/maintenance/page.tsx` | (public) | Maintenance request form |
| `/login` | `(auth)/login/page.tsx` | (auth) | Supabase signInWithPassword |
| `/signup`, `/signup/agent` | `(auth)/signup/*` | (auth) | Agent signup + POST /api/agents |
| `/callback` | `(auth)/callback/route.ts` | — | Auth callback |
| `/pending-approval` | `(auth)/pending-approval/page.tsx` | (auth) | Post-signup wait |
| `/admin/*` | `(dashboard)/admin/*` | Admin layout | AdminShell, role=admin only |
| `/agent/*` | `(dashboard)/agent/*` | Agent layout | AgentShell, role=agent, approved |

## 4. API Routes

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/api/properties`, `/api/properties/[id]` | Public | List / single property |
| GET | `/api/products` | Public | List products |
| GET/POST | `/api/visits` | Public | Visit slots + create (rate limit via app logic) |
| POST | `/api/leads` | Public | Buy request; rate-limited (3/h) |
| POST | `/api/maintenance` | Public | Maintenance request; rate-limited (3/h) |
| GET | `/api/testimonials` | Public | Testimonials |
| POST | `/api/agents` | Session (post signup) | Agent application |
| GET/POST | `/api/agent/properties` | Agent | Own properties |
| GET/PATCH/DELETE | `/api/agent/properties/[id]` | Agent | Own property CRUD |
| GET/POST | `/api/agent/products` | Agent | Own products |
| GET/PATCH/DELETE | `/api/agent/products/[id]` | Agent | Own product CRUD |
| PATCH | `/api/agent/visits/[id]` | Agent | Update visit |
| * | `/api/admin/*` | Admin | getAdminRouteContext(); CRUD agents, visiting-team, properties, products, visits, leads, maintenance, testimonials |
| GET/PATCH | `/api/notifications` | Admin | Notifications |
| POST | `/api/whatsapp/webhook` | Twilio signature | Delivery status logging |

## 5. State Management

- **Theme:** next-themes (ThemeProvider in root layout; `attribute="class"`, `defaultTheme="light"`, `storageKey="urbansaudi-theme"`). ThemeToggle in home, public, admin, and agent layouts; light/dark and persistence apply site-wide.
- **Auth:** AuthProvider (context) + auth-store (Zustand); middleware updates Supabase session on each request.
- **Notifications:** notification-store + use-realtime-notifications (Supabase realtime).
- **Server state:** React Query (properties, products, leads, visits, notifications).

## 6. Styling System

- **Tailwind** with `globals.css`: CSS variables for `--background`, `--foreground`, `--primary`, `--accent`, `--card`, `--border`, `--radius`, etc.
- **:root** = light theme; **.dark** = dark theme (class on `html`).
- **tailwind.config.ts:** Colors from CSS vars, fontFamily (Inter sans, Outfit display), borderRadius (lg/md/sm), keyframes (fade-in, slide-up), tailwindcss-animate.

## 7. Build and Tooling

- **next.config.mjs:** CSP, HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy; image remotePatterns (Supabase, Unsplash).
- **ESLint:** eslint-config-next.
- **Tests:** Playwright in `/tests`.

## 8. Assets and Env

- **Assets:** `public/images/` (e.g. 3d.png, home_hero.png); Supabase storage for agent-documents and listing images.
- **Env:** `src/config/env.ts` — Zod schema; NEXT_PUBLIC_* for client; server-only (SUPABASE_SERVICE_ROLE_KEY, Upstash, Twilio, Sentry). `.env.local` not committed.
