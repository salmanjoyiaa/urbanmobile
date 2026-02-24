# Mobile UI QA Checklist

**Viewports to test:** 320px, 360px, 375px, 390px, 414px, 428px (iPhone sizes).  
**Requirements:** ≥44px tap targets, no horizontal overflow, consistent padding, theme toggle works, no flicker.

---

## Checklist by Page

### Home (/)
- [ ] No horizontal scroll at 320–428px
- [ ] Hero: CTAs stack vertically on small screens; gap ≥8px; buttons min-h-11 (44px)
- [ ] HomepageNav: Theme toggle and hamburger aligned; menu opens and closes
- [ ] Featured sliders: Single column or scroll; no overflow
- [ ] How It Works / Testimonials / Maintenance / Join Team: Readable text; cards full-width; spacing px-4 or px-5
- [ ] Footer: Links and text readable; no clipped content
- [ ] Light and dark: Both themes apply; toggle persists after reload

### Public: Properties (/properties)
- [ ] Header: Theme toggle + nav; mobile menu works
- [ ] Filters and grid: Single column on small screens; no overflow
- [ ] Cards: Tap targets for links/buttons ≥44px where applicable

### Public: Products (/products)
- [ ] Same as Properties

### Public: Maintenance (/maintenance)
- [ ] Form: Inputs full-width; labels and helper text not clipped
- [ ] Submit button: min-h-11

### Auth: Login (/login)
- [ ] Form centered; inputs full-width; no overflow
- [ ] Theme: Uses root theme (bg-background, text-foreground)

### Dashboard: Admin & Agent
- [ ] Sidebar collapses to hamburger on small screens (if applicable)
- [ ] Header: Theme toggle visible and works
- [ ] Tables/cards: Horizontal scroll only where needed; no layout break

---

## Fixes Applied (File Paths)

| Area | File(s) | Change |
|------|---------|--------|
| Theme persistence | `src/providers/theme-provider.tsx` | Added `storageKey="urbansaudi-theme"` |
| Public layout theme | `src/app/(public)/layout.tsx` | Replaced hardcoded colors with `bg-background`, `text-foreground`, `border-border`; added ThemeToggle; footer `bg-card` |
| Theme on dashboard | `src/components/layout/admin-shell.tsx`, `agent-shell.tsx` | Added ThemeToggle in header |
| Light primary (blue) | `src/app/globals.css` | `:root` --primary and --ring set to blue (217 91% 60%) |
| Homepage footer | `src/app/page.tsx` | Footer uses `bg-card`, `text-card-foreground`, `text-muted-foreground` |
| Hero touch targets | `src/components/home/hero-section.tsx` | Buttons `min-h-11`, `gap-3` on mobile; reduced-motion support |
| Theme toggle tap target | `src/components/home/theme-toggle.tsx` | Wrapper `min-h-11 min-w-11` for 44px target |
| Mobile nav | `src/components/layout/mobile-nav.tsx` | Uses tokens; py-3.5 for link tap area |

---

## Safe Area & Viewport

- Use `min-h-[100dvh]` where full-viewport height is needed (avoids iOS 100vh issues).
- Bottom-fixed elements: add `pb-safe` or padding-bottom with `env(safe-area-inset-bottom)` if needed (e.g. via Tailwind arbitrary value or CSS variable).
- Header: no explicit safe-area inset in current layout; add if notch overlap is observed on device.

---

## Remaining Issues

- None for core pages after the above fixes. If any device-specific issue is found (e.g. Safari keyboard overlap), document here and add targeted fix.
