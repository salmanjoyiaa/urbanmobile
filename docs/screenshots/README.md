# Screenshots and demo media

Use this folder for **readme and marketing assets** (PNG, WebP, or a small **GIF**).

## Homepage capture script

1. Install Playwright browsers (one-time):

   ```bash
   npx playwright install chromium
   ```

2. Run the capture script (from repo root):

   ```bash
   npm run capture:screenshots
   ```

   This can save:

   - `reference-homepage.png` — production reference URL (see `package.json` script target)
   - `localhost-homepage.png` — only if `npm run dev` is running locally

   Viewport is typically **1280×720**, full page.

## Homepage demo GIF (manual)

Add **`homepage-demo.gif`** here when you have a short recording that shows:

- Full homepage scroll (hero, stats, CTAs)
- Entry points for **Property**, **Product**, and **Maintenance** marketplaces
- Partner / login affordances

Keep the file **small enough for git** (compress frames and resolution). For very long or heavy recordings, host the asset elsewhere and link it from the root [README.md](../../README.md).

## Dashboard screenshots (manual only)

**Admin** and **agent** dashboard screenshots are **not** produced by the automated capture script in this repo (sensitive UI, auth, and data). Add those PNGs here yourself when you have approved visuals, then reference them from the main README if desired.
