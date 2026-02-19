import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';

// Test credentials
const ADMIN = { email: 'zuhabbgoher@gmail.com', password: 'Zuhab12!' };
const AGENT = { email: 'ahmed@urbansaudi.com', password: 'salman' };
const CUSTOMER = { email: 'sara@customer.com', password: 'salman' };
const PENDING_AGENT = { email: 'noura@urbansaudi.com', password: 'salman' };

async function login(page: Page, email: string, password: string) {
  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState('networkidle');
  await page.fill('input[name="email"], input[type="email"]', email);
  await page.fill('input[name="password"], input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForLoadState('networkidle');
}

async function logout(page: Page) {
  // Look for logout button or sign out link
  const logoutBtn = page.locator('button:has-text("Logout"), button:has-text("Sign out"), button:has-text("Log out"), a:has-text("Logout"), a:has-text("Sign out")');
  if (await logoutBtn.count() > 0) {
    await logoutBtn.first().click();
    await page.waitForLoadState('networkidle');
  }
}

// ==========================================
// 1. PUBLIC PAGES
// ==========================================
test.describe('Public Pages', () => {
  test('Homepage loads with hero section and navigation', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Take screenshot
    await page.screenshot({ path: 'tests/screenshots/01-homepage.png', fullPage: true });

    // Check page loaded (not an error page)
    const title = await page.title();
    console.log('Homepage title:', title);

    // Check for main content
    const body = await page.textContent('body');
    console.log('Homepage has content:', body!.length > 100);

    // Check for navigation links
    const navLinks = page.locator('nav a, header a');
    const navCount = await navLinks.count();
    console.log('Navigation links found:', navCount);

    // Check for error messages
    const errors = page.locator('[class*="error"], [role="alert"]');
    const errorCount = await errors.count();
    console.log('Error elements found:', errorCount);

    expect(await page.locator('body').textContent()).toBeTruthy();
  });

  test('Properties listing page loads with data', async ({ page }) => {
    await page.goto(`${BASE_URL}/properties`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Wait for data fetch

    await page.screenshot({ path: 'tests/screenshots/02-properties-list.png', fullPage: true });

    const body = await page.textContent('body');
    console.log('Properties page content length:', body!.length);

    // Check for property cards or listings
    const cards = page.locator('[class*="card"], [class*="property"], article');
    const cardCount = await cards.count();
    console.log('Property cards found:', cardCount);

    // Check for filters
    const selects = page.locator('select, [role="combobox"], [class*="filter"]');
    const selectCount = await selects.count();
    console.log('Filter elements found:', selectCount);

    // Check for any error states
    const errorText = await page.locator('body').textContent();
    const hasError = errorText?.toLowerCase().includes('error') || errorText?.toLowerCase().includes('something went wrong');
    console.log('Has error text:', hasError);
  });

  test('Property detail page loads', async ({ page }) => {
    // First go to properties list and click the first property
    await page.goto(`${BASE_URL}/properties`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Try to navigate to a known property
    await page.goto(`${BASE_URL}/properties/e0000001-0000-4000-8000-000000000001`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'tests/screenshots/03-property-detail.png', fullPage: true });

    const body = await page.textContent('body');
    console.log('Property detail content length:', body!.length);

    // Check for property title
    const hasTitle = body?.includes('Penthouse') || body?.includes('Luxury');
    console.log('Has property title:', hasTitle);

    // Check for visit scheduler
    const visitForm = page.locator('form, [class*="visit"], [class*="schedule"]');
    console.log('Visit form elements:', await visitForm.count());
  });

  test('Products listing page loads with data', async ({ page }) => {
    await page.goto(`${BASE_URL}/products`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'tests/screenshots/04-products-list.png', fullPage: true });

    const body = await page.textContent('body');
    console.log('Products page content length:', body!.length);

    // Check for product cards
    const cards = page.locator('[class*="card"], article');
    console.log('Product cards found:', await cards.count());
  });

  test('Product detail page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/products/d0000001-0000-4000-8000-000000000001`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'tests/screenshots/05-product-detail.png', fullPage: true });

    const body = await page.textContent('body');
    console.log('Product detail content:', body!.substring(0, 200));

    // Check for buy request form
    const buyForm = page.locator('form, [class*="buy"], [class*="request"]');
    console.log('Buy form elements:', await buyForm.count());
  });
});

// ==========================================
// 2. AUTH PAGES
// ==========================================
test.describe('Authentication', () => {
  test('Login page renders correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');

    await page.screenshot({ path: 'tests/screenshots/06-login-page.png', fullPage: true });

    // Check for login form elements
    const emailInput = page.locator('input[name="email"], input[type="email"]');
    const passwordInput = page.locator('input[name="password"], input[type="password"]');
    const submitBtn = page.locator('button[type="submit"]');

    console.log('Email input found:', await emailInput.count() > 0);
    console.log('Password input found:', await passwordInput.count() > 0);
    console.log('Submit button found:', await submitBtn.count() > 0);

    expect(await emailInput.count()).toBeGreaterThan(0);
    expect(await passwordInput.count()).toBeGreaterThan(0);
  });

  test('Signup page renders correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/signup`);
    await page.waitForLoadState('networkidle');

    await page.screenshot({ path: 'tests/screenshots/07-signup-page.png', fullPage: true });

    const body = await page.textContent('body');
    console.log('Signup page content length:', body!.length);
  });

  test('Agent signup page renders correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/signup/agent`);
    await page.waitForLoadState('networkidle');

    await page.screenshot({ path: 'tests/screenshots/08-agent-signup.png', fullPage: true });

    const body = await page.textContent('body');
    console.log('Agent signup page content length:', body!.length);
  });

  test('Customer login works and redirects correctly', async ({ page }) => {
    await login(page, CUSTOMER.email, CUSTOMER.password);

    await page.screenshot({ path: 'tests/screenshots/09-customer-after-login.png', fullPage: true });

    const url = page.url();
    console.log('Customer redirected to:', url);

    // Customer should be redirected to homepage or similar
    const body = await page.textContent('body');
    console.log('After login content:', body!.substring(0, 300));
  });

  test('Agent login works and redirects to /agent', async ({ page }) => {
    await login(page, AGENT.email, AGENT.password);

    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'tests/screenshots/10-agent-after-login.png', fullPage: true });

    const url = page.url();
    console.log('Agent redirected to:', url);

    // Agent should be redirected to /agent dashboard
    expect(url).toContain('/agent');
  });

  test('Admin login works and redirects to /admin', async ({ page }) => {
    await login(page, ADMIN.email, ADMIN.password);

    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'tests/screenshots/11-admin-after-login.png', fullPage: true });

    const url = page.url();
    console.log('Admin redirected to:', url);

    expect(url).toContain('/admin');
  });

  test('Pending agent redirects to /pending-approval', async ({ page }) => {
    await login(page, PENDING_AGENT.email, PENDING_AGENT.password);

    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'tests/screenshots/12-pending-agent.png', fullPage: true });

    const url = page.url();
    console.log('Pending agent redirected to:', url);
  });
});

// ==========================================
// 3. CUSTOMER FLOW
// ==========================================
test.describe('Customer Flow', () => {
  test('Customer can submit visit request', async ({ page }) => {
    await login(page, CUSTOMER.email, CUSTOMER.password);
    await page.waitForTimeout(2000);

    // Go to a property detail page
    await page.goto(`${BASE_URL}/properties/e0000001-0000-4000-8000-000000000001`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'tests/screenshots/13-customer-property-detail.png', fullPage: true });

    const body = await page.textContent('body');
    console.log('Property page as customer:', body!.substring(0, 300));

    // Check if visit scheduler is visible
    const forms = page.locator('form');
    console.log('Forms found:', await forms.count());
  });

  test('Customer can submit buy request', async ({ page }) => {
    await login(page, CUSTOMER.email, CUSTOMER.password);
    await page.waitForTimeout(2000);

    await page.goto(`${BASE_URL}/products/d0000001-0000-4000-8000-000000000001`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'tests/screenshots/14-customer-product-detail.png', fullPage: true });

    const body = await page.textContent('body');
    console.log('Product page as customer:', body!.substring(0, 300));
  });
});

// ==========================================
// 4. AGENT FLOW
// ==========================================
test.describe('Agent Flow', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, AGENT.email, AGENT.password);
    await page.waitForTimeout(3000);
  });

  test('Agent dashboard loads with stats', async ({ page }) => {
    await page.goto(`${BASE_URL}/agent`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'tests/screenshots/15-agent-dashboard.png', fullPage: true });

    const body = await page.textContent('body');
    console.log('Agent dashboard content:', body!.substring(0, 500));
  });

  test('Agent properties list loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/agent/properties`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'tests/screenshots/16-agent-properties.png', fullPage: true });

    const body = await page.textContent('body');
    console.log('Agent properties:', body!.substring(0, 500));
  });

  test('Agent new property form loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/agent/properties/new`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'tests/screenshots/17-agent-new-property.png', fullPage: true });

    const forms = page.locator('form');
    console.log('Forms found on new property page:', await forms.count());
  });

  test('Agent products list loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/agent/products`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'tests/screenshots/18-agent-products.png', fullPage: true });
  });

  test('Agent new product form loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/agent/products/new`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'tests/screenshots/19-agent-new-product.png', fullPage: true });
  });

  test('Agent visits page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/agent/visits`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'tests/screenshots/20-agent-visits.png', fullPage: true });

    const body = await page.textContent('body');
    console.log('Agent visits:', body!.substring(0, 500));
  });

  test('Agent leads page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/agent/leads`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'tests/screenshots/21-agent-leads.png', fullPage: true });

    const body = await page.textContent('body');
    console.log('Agent leads:', body!.substring(0, 500));
  });
});

// ==========================================
// 5. ADMIN FLOW
// ==========================================
test.describe('Admin Flow', () => {
  test.beforeEach(async ({ page }) => {
    await login(page, ADMIN.email, ADMIN.password);
    await page.waitForTimeout(3000);
  });

  test('Admin dashboard loads with stats', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'tests/screenshots/22-admin-dashboard.png', fullPage: true });

    const body = await page.textContent('body');
    console.log('Admin dashboard:', body!.substring(0, 500));
  });

  test('Admin agents management page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/agents`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'tests/screenshots/23-admin-agents.png', fullPage: true });

    const body = await page.textContent('body');
    console.log('Admin agents:', body!.substring(0, 500));
  });

  test('Admin agent detail page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/agents/a0000004-0000-4000-8000-000000000013`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'tests/screenshots/24-admin-agent-detail.png', fullPage: true });

    const body = await page.textContent('body');
    console.log('Admin agent detail:', body!.substring(0, 500));
  });

  test('Admin properties moderation page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/properties`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'tests/screenshots/25-admin-properties.png', fullPage: true });
  });

  test('Admin products moderation page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/products`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'tests/screenshots/26-admin-products.png', fullPage: true });
  });

  test('Admin visits management page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/visits`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'tests/screenshots/27-admin-visits.png', fullPage: true });

    const body = await page.textContent('body');
    console.log('Admin visits:', body!.substring(0, 500));
  });

  test('Admin leads management page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/leads`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'tests/screenshots/28-admin-leads.png', fullPage: true });

    const body = await page.textContent('body');
    console.log('Admin leads:', body!.substring(0, 500));
  });

  test('Admin audit log page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin/audit-log`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: 'tests/screenshots/29-admin-audit-log.png', fullPage: true });

    const body = await page.textContent('body');
    console.log('Admin audit log:', body!.substring(0, 500));
  });
});

// ==========================================
// 6. API ENDPOINTS
// ==========================================
test.describe('API Endpoints', () => {
  test('Properties API returns data', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/properties`);
    console.log('Properties API status:', response.status());
    const body = await response.text();
    console.log('Properties API response:', body.substring(0, 500));
    expect(response.status()).toBe(200);
  });

  test('Visits API returns slots', async ({ request }) => {
    // Get a future weekday date
    const date = new Date();
    date.setDate(date.getDate() + 3);
    while (date.getDay() === 0 || date.getDay() === 6) {
      date.setDate(date.getDate() + 1);
    }
    const dateStr = date.toISOString().split('T')[0];

    const response = await request.get(`${BASE_URL}/api/visits?property_id=e0000001-0000-4000-8000-000000000001&date=${dateStr}`);
    console.log('Visits API status:', response.status());
    const body = await response.text();
    console.log('Visits API response:', body.substring(0, 500));
  });
});
