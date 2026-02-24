/**
 * Captures homepage screenshots for visual comparison.
 * Saves reference (urbanpropertyestate.vercel.app) and optionally localhost to docs/screenshots/
 *
 * First-time: npx playwright install chromium
 * Run: npm run capture:screenshots
 * Optional: start dev server first (npm run dev) to also capture localhost.
 */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const REFERENCE_URL = 'https://urbanpropertyestate.vercel.app/';
const LOCALHOST_URL = process.env.BASE_URL || 'http://localhost:3000';
const VIEWPORT = { width: 1280, height: 720 };
const OUT_DIR = path.join(__dirname, '..', 'docs', 'screenshots');

async function main() {
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  const browser = await chromium.launch({
    headless: true,
  });

  const context = await browser.newContext({
    viewport: VIEWPORT,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });

  try {
    const page = await context.newPage();

    // 1. Reference site
    console.log('Capturing reference:', REFERENCE_URL);
    await page.goto(REFERENCE_URL, { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForSelector('h1', { timeout: 10000 }).catch(() => {});
    await page.screenshot({
      path: path.join(OUT_DIR, 'reference-homepage.png'),
      fullPage: true,
    });
    console.log('Saved docs/screenshots/reference-homepage.png');

    // 2. Localhost (optional)
    try {
      console.log('Capturing localhost:', LOCALHOST_URL);
      await page.goto(LOCALHOST_URL, { waitUntil: 'domcontentloaded', timeout: 8000 });
      await page.waitForSelector('h1', { timeout: 5000 }).catch(() => {});
      await page.screenshot({
        path: path.join(OUT_DIR, 'localhost-homepage.png'),
        fullPage: true,
      });
      console.log('Saved docs/screenshots/localhost-homepage.png');
    } catch (e) {
      console.log('Localhost not captured (is dev server running?):', e.message);
    }
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
