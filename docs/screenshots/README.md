# Homepage screenshots for visual comparison

Screenshots are saved here by the capture script for AI or manual comparison.

## How to generate screenshots

1. Install Playwright browsers (one-time):
   ```bash
   npx playwright install chromium
   ```
2. Run the capture script:
   ```bash
   npm run capture:screenshots
   ```
   This saves:
   - `reference-homepage.png` — https://urbanpropertyestate.vercel.app/
   - `localhost-homepage.png` — only if dev server is running (`npm run dev`)

Screenshots are taken at 1280×720 viewport, full page.
