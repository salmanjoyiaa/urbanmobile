# Hero Headline Animation — Reusable Guide

## Overview
Two-part staggered headline with **slide-up fade-in** on the first line and a **gradient shimmer** on the second line.

**Stack:** React + Framer Motion (`motion/react`) + Tailwind CSS

---

## 1. CSS Keyframe (add to [globals.css](file:///d:/Vibe/demo/src/app/globals.css))

```css
@keyframes shimmer {
  0% { background-position: 200% center; }
  100% { background-position: -200% center; }
}
```

---

## 2. Component Code

```tsx
"use client";

import { motion } from "motion/react";

export function AnimatedHeadline() {
  return (
    <div className="space-y-1">
      {/* Line 1 — slide-up fade-in */}
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="text-5xl font-extrabold tracking-tight text-stone-900 sm:text-6xl lg:text-7xl lg:leading-[1.08]"
      >
        Replace your spreadsheets{" "}
      </motion.h1>

      {/* Line 2 — slide-up + gradient shimmer */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.35 }}
      >
        <span
          className="text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl lg:leading-[1.08]
            bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500
            bg-clip-text text-transparent
            bg-[length:200%_auto]
            animate-[shimmer_3s_ease-in-out_infinite]"
        >
          and fragmented tools.
        </span>
      </motion.div>
    </div>
  );
}
```

---

## 3. How It Works

| Effect | Technique |
|--------|-----------|
| **Slide-up fade-in** | Framer Motion `initial={{ opacity: 0, y: 30 }}` → `animate={{ opacity: 1, y: 0 }}` |
| **Stagger** | Line 1 has `delay: 0.15`, Line 2 has `delay: 0.35` (200ms gap) |
| **Gradient text** | `bg-gradient-to-r` + `bg-clip-text` + `text-transparent` |
| **Shimmer loop** | `bg-[length:200%_auto]` makes the gradient twice as wide, `animate-[shimmer_3s_...]` slides it infinitely |

## 4. Customization

- **Colors:** Change `from-rose-600 via-rose-500 to-amber-500` to any gradient
- **Speed:** Change `3s` in `animate-[shimmer_3s_...]` (lower = faster)
- **Stagger gap:** Adjust the `delay` values on each `motion.div`
- **Easing:** `ease-in-out` for smooth, `linear` for constant speed

## 5. Dependencies

```bash
npm install motion
```

> `motion/react` is the Framer Motion v11+ import path. For older versions use `framer-motion`.
