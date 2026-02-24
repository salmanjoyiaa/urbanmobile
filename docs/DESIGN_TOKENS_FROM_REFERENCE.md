# Design Tokens — Extracted from urbanpropertyestate (Reference)

**Source:** [urbanpropertyestate](https://github.com/salmanjoyiaa/urbanpropertyestate) — Next.js 14, Tailwind, shadcn/ui.  
**Purpose:** Align urbansaudi LIGHT theme with reference blue/white look; keep existing dark theme.

**Reference layout applied:** Homepage now matches reference (urbanpropertyestate.vercel.app): dark blue header, dark blue/purple hero gradient, white hero text and inverted CTAs (white primary, dark blue secondary), cream sections for Featured Sliders and Maintenance, white for How It Works and Testimonials, dark blue band for Join Team and footer. Maintenance CTA kept blue (reference uses green; optional).

---

## What to Copy/Adapt (LIGHT theme)

### CSS variables — :root (light)

Reference uses the same base HSL scheme as urbansaudi. For an explicit **blue/white** LIGHT theme:

| Token | Reference (neutral) | Urbansaudi LIGHT (blue/white) |
|-------|---------------------|-------------------------------|
| --background | 0 0% 100% | 0 0% 100% (keep) |
| --foreground | 222 47% 11% | 222 47% 11% or 220 20% 12% |
| --primary | 222 47% 11% | **224 76% 24%** (dark blue; reference hero/nav use blue/purple, not green) |
| --primary-foreground | 210 40% 98% | 0 0% 100% |
| --ring | 222 47% 11% | Same as primary (blue) |
| --secondary, --muted | 210 40% 96% | Keep |
| --border, --input | 214 32% 91% | Keep |
| --radius | 0.75rem | Keep |

Use these in `src/app/globals.css` under `:root`. Keep existing `.dark` block for dark mode.

### Tailwind

- **Colors:** Already mapped from CSS vars in tailwind.config.ts; no structural change.
- **Fonts:** Inter (sans), Outfit (display) — already in use.
- **Border radius:** lg = var(--radius), md/sm = calc(...) — already in use.
- **Keyframes:** fade-in, slide-up — already present.

### Typography

- **Font weights:** Use font-semibold for nav, font-bold for CTAs, font-black for hero headline (match reference).
- **Sizes:** Headings (text-3xl, text-4xl, etc.); body (text-base, text-sm); labels (text-sm font-medium).
- **Letter spacing:** tracking-tight for headlines; tracking-wide for labels/uppercase.

### Layout and spacing

- **Containers:** max-w-[1400px], mx-auto, px-5 sm:px-6 lg:px-12.
- **Sections:** pb-16, lg:pb-24; gap-6 lg:gap-4 for hero columns.
- **Cards:** bg-card, border border-border, rounded-xl or var(--radius), shadow-sm.
- **Buttons:** Primary = bg-primary text-primary-foreground; secondary = border-2 border-primary. Min height for touch: min-h-11 (44px).

### Reference-specific tokens (applied)

- **--footer-bg** (224 72% 18%): Used for header, Join Team band, and footer in light theme.
- **--section-cream** (40 25% 97%): Used for Featured Sliders and Maintenance sections; utility `.bg-section-cream` in globals.css; dark mode override to dark bg.
- **Hero (light):** `.bg-hero-light` = dark blue/purple gradient (224 60% 18% → 230 50% 22% → 224 45% 28%); hero text white; primary CTA white bg + primary text, secondary CTA primary bg + white text.

### Component styling

- **Buttons:** Rounded (rounded-xl, rounded-2xl), px-5 py-2.5 or h-14 for hero CTAs.
- **Inputs:** Use border, ring, and input tokens (shadcn Input already uses them).
- **Cards:** bg-card, text-card-foreground, consistent padding.

---

## What NOT to Copy

- ChatWidget, CartProvider, CartDrawer (reference-only; not for urbansaudi).
- AI voice / orb components and related CSS (wordFadeIn, orbPulse, orbGlow, audioBounce, scrollbar-hide for subtitles).
- Voice agent flows (STT/TTS, use-voice-agent, hero-voice-agent, voice-orb, etc.).

---

## Implementation checklist (urbansaudi)

1. **globals.css:** Set `:root` --primary (and --ring) to dark blue HSL (reference hero uses dark blue/purple; green is only in maintenance section). Keep --background white and neutrals for muted/border.
2. **Homepage:** Use only tokens (bg-background, text-foreground, bg-primary, etc.); no hardcoded hex for main UI.
3. **Public layout:** Replace #FCF9F2 / #2A201A / #D9C5B2 with bg-background, text-foreground, border-border.
4. **Footer (home + public):** Use bg-card or a dedicated footer token and text-foreground/muted-foreground.
5. **Theme toggle:** Present in all layouts (home, public header, admin shell, agent shell) so light/dark works everywhere.
