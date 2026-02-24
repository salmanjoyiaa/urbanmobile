import { test, expect } from '@playwright/test';

const REFERENCE_URL = 'https://urbanpropertyestate.vercel.app/';
const LOCALHOST = process.env.BASE_URL || 'http://localhost:3000';

test.describe('Reference site (UrbanEstate)', () => {
  test.use({ baseURL: REFERENCE_URL });

  test('opens reference site and captures hero', async ({ page }) => {
    await page.goto(REFERENCE_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await expect(page).toHaveTitle(/UrbanEstate|Premium Rental/i);
    const hero = page.locator('h1').first();
    await expect(hero).toBeVisible({ timeout: 5000 });
    await page.screenshot({ path: 'test-results/reference-home.png', fullPage: false });
  });

  test('reference hero has expected CTAs', async ({ page }) => {
    await page.goto(REFERENCE_URL, { waitUntil: 'domcontentloaded', timeout: 15000 });
    const browseLink = page.getByRole('link', { name: /Browse Properties/i }).first();
    await expect(browseLink).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Localhost (urbansaudi)', () => {
  test.use({ baseURL: LOCALHOST });

  test('opens localhost and captures hero', async ({ page }) => {
    await page.goto(LOCALHOST, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await expect(page).toHaveTitle(/Urban|Real Estate/i);
    const hero = page.locator('h1').first();
    await expect(hero).toBeVisible({ timeout: 5000 });
    await page.screenshot({ path: 'test-results/localhost-home.png', fullPage: false });
  });

  test('localhost hero has Browse Rentals CTA', async ({ page }) => {
    await page.goto(LOCALHOST, { waitUntil: 'domcontentloaded', timeout: 15000 });
    const browseLink = page.getByRole('link', { name: /Browse Rentals/i }).first();
    await expect(browseLink).toBeVisible({ timeout: 5000 });
  });
});
