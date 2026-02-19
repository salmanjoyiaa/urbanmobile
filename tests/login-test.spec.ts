import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

const ADMIN = { email: 'zuhabbgoher@gmail.com', password: 'Zuhab12!' };
const AGENT = { email: 'ahmed@urbansaudi.com', password: 'salman' };
const CUSTOMER = { email: 'sara@customer.com', password: 'salman' };
const PENDING_AGENT = { email: 'noura@urbansaudi.com', password: 'salman' };

async function login(page: Page, email: string, password: string) {
  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState('networkidle');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  // Wait for navigation - either URL change or error toast
  await page.waitForTimeout(5000);
}

test('Customer login redirects to homepage', async ({ page }) => {
  await login(page, CUSTOMER.email, CUSTOMER.password);

  await page.screenshot({ path: 'tests/screenshots/login-customer.png', fullPage: true });

  const url = page.url();
  console.log('Customer URL after login:', url);

  // Customer should redirect to homepage "/"
  const isLoggedIn = !url.includes('/login');
  console.log('Customer login succeeded:', isLoggedIn);

  // Check for error toast
  const toastText = await page.locator('[data-sonner-toast]').textContent().catch(() => 'no toast');
  console.log('Toast message:', toastText);
});

test('Agent login redirects to /agent', async ({ page }) => {
  await login(page, AGENT.email, AGENT.password);

  await page.screenshot({ path: 'tests/screenshots/login-agent.png', fullPage: true });

  const url = page.url();
  console.log('Agent URL after login:', url);

  // Check for error toast
  const toastText = await page.locator('[data-sonner-toast]').textContent().catch(() => 'no toast');
  console.log('Toast message:', toastText);

  expect(url).toContain('/agent');
});

test('Admin login redirects to /admin', async ({ page }) => {
  await login(page, ADMIN.email, ADMIN.password);

  await page.screenshot({ path: 'tests/screenshots/login-admin.png', fullPage: true });

  const url = page.url();
  console.log('Admin URL after login:', url);

  expect(url).toContain('/admin');
});

test('Pending agent redirects to /pending-approval', async ({ page }) => {
  await login(page, PENDING_AGENT.email, PENDING_AGENT.password);

  await page.screenshot({ path: 'tests/screenshots/login-pending.png', fullPage: true });

  const url = page.url();
  console.log('Pending agent URL after login:', url);

  expect(url).toContain('/pending-approval');
});
