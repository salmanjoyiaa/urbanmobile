# Urbansaudi — Code Flow Map

## 1. User Journeys

### Homepage → Browse
- User lands on `/` → **HomepageNav** (theme toggle, Property/Visiting Team login links) → **HeroSection** (3D house image, “Browse Rentals” / “Request Maintenance” CTAs) → **FeaturedSliders** (server component; Supabase properties + products) → **HowItWorks**, **Testimonials**, **MaintenanceServices**, **JoinTeam** → inline footer.
- Click “Browse Rentals” → `/properties` (rendered under **(public)** layout: own header/footer; hardcoded colors unless refactored to tokens).

### Homepage → Auth
- “Property Team Login” / “Visiting Team Login” → `/login?type=property|visiting` → Supabase `signInWithPassword` → **middleware** reads `profile.role` → redirect to `/admin`, `/agent`, or `/`.
- Signup: `/signup/agent` → Supabase `signUp` → POST `/api/agents` (agent_type, company, license, document_url) + optional upload to `agent-documents` → redirect to `/pending-approval`.

### Public Flows
- `/properties`, `/products`: Server/client data (Supabase, React Query); filters and listing.
- `/properties/[id]`: Property detail + **VisitScheduler** (POST `/api/visits`).
- `/products/[id]`: Product detail + **BuyRequestForm** (POST `/api/leads`).
- `/maintenance`: **MaintenanceRequestForm** → POST `/api/maintenance` (rate-limited).
- All use **(public)/layout.tsx** (no theme tokens by default; should use `bg-background` / `text-foreground` for full theme support).

### Dashboard Flows
- **Middleware** enforces auth and role: `/admin/*` → role === 'admin'; `/agent/*` → role === 'agent', and agent must be approved (else redirect to `/pending-approval`).
- **Admin:** AdminShell (sidebar from `config/nav.ts` adminNav) → pages load data via `createClient()` in RSC or API; admin API routes use **getAdminRouteContext()**.
- **Agent:** AgentShell (agentNav or visitingAgentNav) → agent API routes use **createRouteClient()** + user; must verify resource ownership (e.g. property belongs to current agent).

## 2. Component Hierarchy (Key)

```
Root (app/layout.tsx)
└── html (suppressHydrationWarning)
    └── body (font-sans, antialiased)
        └── ThemeProvider
            └── NextTopLoader
            └── QueryProvider
                └── AuthProvider
                    └── {children}
                    └── ToastProvider

Home (app/page.tsx)
└── div (min-h-screen, bg-background)
    └── HomepageNav (ThemeToggle inside)
    └── main
        └── HeroSection, FeaturedSliders, HowItWorks, Testimonials, MaintenanceServices, JoinTeam
    └── footer (inline)

Public (app/(public)/layout.tsx)
└── div (hardcoded #FCF9F2 / #2A201A — to be replaced with tokens)
    └── header (MobileNav, logo, nav, CTA)
    └── main
    └── footer

Dashboard admin (app/(dashboard)/admin/layout.tsx)
└── AdminShell (sidebar + main) — no ThemeToggle by default; to be added

Dashboard agent (app/(dashboard)/agent/layout.tsx)
└── AgentShell (sidebar + main) — no ThemeToggle by default; to be added
```

## 3. Data Fetching

- **Server (RSC):** `createClient()` from `@/lib/supabase/server` in layout and page components (e.g. FeaturedSliders, dashboard list pages).
- **Client:** React Query in `queries/*` (useQuery/useMutation); Supabase realtime via `use-realtime*` hooks.
- **API:** Admin routes call **getAdminRouteContext()** (returns supabase + user + profile or 401/403). Public POSTs validate body with **Zod** (validators.ts); leads and maintenance use **Upstash** or in-memory rate limit by IP.

## 4. Critical Flows

- **Session refresh:** **middleware** runs on every request; `updateSession()` from `@/lib/supabase/middleware` refreshes Supabase session and sets cookies.
- **Theme:** ThemeProvider wraps app with `storageKey="urbansaudi-theme"` for persistence. ThemeToggle is present in HomepageNav, (public) layout header, AdminShell, and AgentShell. (public) layout and homepage footer use design tokens (bg-background, text-foreground, bg-card); light/dark apply across all pages.
