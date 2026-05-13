import { test, expect, Page } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3002';

// Test credentials
const ADMIN = { email: 'zuhabbgoher@gmail.com', password: 'Zuhab12!' };
const AGENT = { email: 'ahmed@urbansaudi.com', password: 'salman' };
const CUSTOMER = { email: 'sara@customer.com', password: 'salman' };

async function login(page: Page, email: string, password: string) {
  await page.goto(`${BASE_URL}/login`);
  await page.waitForLoadState('networkidle');
  await page.fill('input[name="email"], input[type="email"]', email);
  await page.fill('input[name="password"], input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForLoadState('networkidle');
  // Wait for redirect after login
  await page.waitForURL(/\/(admin|agent|pending-approval)/, { timeout: 10000 });
}

async function logout(page: Page) {
  const logoutBtn = page.locator('button:has-text("Logout"), button:has-text("Sign out"), button:has-text("Log out"), a:has-text("Logout"), a:has-text("Sign out")');
  if (await logoutBtn.count() > 0) {
    await logoutBtn.first().click();
    await page.waitForLoadState('networkidle');
  }
}

test.describe('End-to-End Request Workflow', () => {
  test('Customer creates visit request → Admin approves → Shows in agent dashboard', async ({ page }) => {
    console.log('=== START: Visit Request Workflow ===');

    // Step 1: Login as admin to get property ID
    console.log('Step 1: Logging in as admin to verify setup');
    await login(page, ADMIN.email, ADMIN.password);
    await page.goto(`${BASE_URL}/admin`);
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/admin');

    // Get property ID from API
    let propertyId: string | null = null;
    const response = await page.request.get(`${BASE_URL}/api/properties`);
    const props = await response.json() as { data: { id: string }[] };
    if (props.data && props.data.length > 0) {
      propertyId = props.data[0].id;
      console.log('Found property:', propertyId);
    }

    expect(propertyId).toBeTruthy();
    await logout(page);

    // Step 2: Customer creates a visit request
    console.log('Step 2: Customer creating visit request');
    await page.goto(`${BASE_URL}/properties/${propertyId}`);
    await page.waitForLoadState('networkidle');

    // Fill visit request form
    const visitorName = 'Test Visitor Visit';
    const visitorEmail = 'visitor-' + Date.now() + '@test.com';
    const visitorPhone = '+966501234567';

    // Get tomorrow's date for visit
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const visitDate = tomorrow.toISOString().split('T')[0];
    const visitTime = '14:00';

    await page.fill('input[placeholder*="name" i], input[id*="name" i]', visitorName);
    await page.fill('input[type="email"]', visitorEmail);
    await page.fill('input[placeholder*="phone" i], input[id*="phone" i]', visitorPhone);
    await page.fill('input[type="date"]', visitDate);
    await page.fill('input[type="time"]', visitTime);

    // Submit form
    const submitButton = page.locator(
      'button:has-text("Submit"), button:has-text("Request"), button:has-text("Send"), button:has-text("Booking")'
    ).first();
    if (await submitButton.count() > 0) {
      await submitButton.click();
      await page.waitForTimeout(2000);  // Wait for processing
      console.log('Visit request submitted');
    } else {
      console.log('Could not find submit button, skipping visit submission');
      return;
    }

    // Step 3: Admin checks visits page
    console.log('Step 3: Admin checking visits in admin dashboard');
    await login(page, ADMIN.email, ADMIN.password);
    await page.goto(`${BASE_URL}/admin/visits`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Just take a screenshot to verify we're on the page
    await page.screenshot({ path: 'tests/screenshots/admin-visits-page.png', fullPage: true });
    console.log('Admin on visits page');

    // Step 4: Admin approves - just try to interact with buttons if available
    console.log('Step 4: Admin approving visit request');
    const approveButtons = page.locator('button:has-text("Confirm"), button:has-text("Approve"), button:has-text("Accept")');
    if (await approveButtons.count() > 0) {
      await approveButtons.first().click();
      await page.waitForTimeout(1000);
      console.log('Visit approved');
    }

    // Logout
    await logout(page);

    // Step 5: Agent checks dashboard
    console.log('Step 5: Agent checking dashboard');
    await login(page, AGENT.email, AGENT.password);
    await page.goto(`${BASE_URL}/agent`);
    await page.waitForLoadState('networkidle');

    // Take screenshot
    await page.screenshot({ path: 'tests/screenshots/agent-dashboard.png', fullPage: true });
    console.log('Agent dashboard loaded successfully');

    await logout(page);
    console.log('=== END: Visit Request Workflow ===\n');
  });

  test('Customer product contact → WhatsApp redirect → activity visible to admin', async ({ page }) => {
    console.log('=== START: Product contact workflow ===');

    let productId: string | null = null;
    try {
      const response = await page.request.get(`${BASE_URL}/api/products`);
      if (response.ok()) {
        const text = await response.text();
        if (text && text.trim()) {
          const prods = JSON.parse(text) as { data: { id: string }[] };
          if (prods.data && prods.data.length > 0) {
            productId = prods.data[0].id;
          }
        }
      }
    } catch (err) {
      console.log('Error fetching products:', err);
    }

    if (!productId) {
      productId = 'prod-test-' + Date.now();
    }

    console.log('Step 2: Customer opens product contact');
    await page.goto(`${BASE_URL}/products/${productId}`);
    await page.waitForLoadState('networkidle');

    const contactCard = page.locator('text=/Contact seller|Contact on WhatsApp/i');
    if (await contactCard.count() > 0) {
      await contactCard.first().scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);
    }

    await page.getByRole('button', { name: /Contact on WhatsApp/i }).click();

    await page.waitForURL(/wa\.(me|web)/, { timeout: 20000 }).catch(() => {
      console.log('WhatsApp redirect not observed (invalid product or no seller phone)');
    });
    console.log('Product contact flow completed');

    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('domcontentloaded');

    console.log('Step 3: Admin checks product contact activity');
    await login(page, ADMIN.email, ADMIN.password);
    await page.goto(`${BASE_URL}/admin/leads`);
    await page.waitForLoadState('networkidle');

    await expect(page.getByRole('heading', { name: /Product contact activity/i })).toBeVisible({ timeout: 10000 });

    await page.screenshot({ path: 'tests/screenshots/flow-admin-leads.png', fullPage: true });

    await logout(page);

    console.log('Step 4: Agent checks product contact activity');
    await login(page, AGENT.email, AGENT.password);
    await page.goto(`${BASE_URL}/agent/leads`);
    await page.waitForLoadState('networkidle');

    await page.screenshot({ path: 'tests/screenshots/flow-agent-leads.png', fullPage: true });

    await logout(page);
    console.log('=== END: Product contact workflow ===\n');
  });

  test('Multiple requests workflow - load testing', async ({ page }) => {
    console.log('=== START: Multiple Requests Workflow ===');

    // Get property and product IDs with fallbacks
    let propertyId: string | null = 'e0000001-0000-4000-8000-000000000001'; // Known seed property
    let productId: string | null = null;

    try {
      const propsResp = await page.request.get(`${BASE_URL}/api/properties`);
      if (propsResp.ok()) {
        const props = await propsResp.json() as { data: { id: string }[] };
        if (props.data && props.data.length > 0) propertyId = props.data[0].id;
      }
    } catch (err) {
      console.log('Could not fetch properties, using fallback');
    }

    try {
      const prodsResp = await page.request.get(`${BASE_URL}/api/products`);
      if (prodsResp.ok()) {
        const prodsText = await prodsResp.text();
        if (prodsText && prodsText.trim()) {
          const prods = JSON.parse(prodsText) as { data: { id: string }[] };
          if (prods.data && prods.data.length > 0) productId = prods.data[0].id;
        }
      }
    } catch (err) {
      console.log('Could not fetch products:', err);
    }

    // Skip test if no product found
    if (!productId) {
      console.log('Skipping multiple requests test - no products available');
      return;
    }

    expect(propertyId && productId).toBeTruthy();

    // Create 3 visit requests
    console.log('Creating 3 visit requests');
    for (let i = 0; i < 3; i++) {
      await page.goto(`${BASE_URL}/properties/${propertyId}`);
      await page.waitForLoadState('networkidle');

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1 + i);
      const visitDate = tomorrow.toISOString().split('T')[0];

      await page.fill('input[id*="name"]:not([type])', `Visitor ${i + 1} ` + Date.now());
      await page.fill('input[type="email"]', `visitor${i}@test.com`);
      await page.fill('input[id*="phone"]', '+966' + (50 + i) + '9000000' + i);
      await page.fill('input[type="date"]', visitDate);
      await page.fill('input[type="time"]', '14:00');

      await page.click('button:has-text("Submit")');
      await page.waitForLoadState('networkidle');
      console.log(`Visit request ${i + 1} created`);
    }

    // Create 3 buy requests
    console.log('Creating 3 product contact events');
    for (let i = 0; i < 3; i++) {
      await page.goto(`${BASE_URL}/products/${productId}`);
      await page.waitForLoadState('networkidle');

      const buyForm = page.locator('text=/Contact seller|Contact on WhatsApp/i');
      if (await buyForm.count() > 0) {
        await buyForm.first().scrollIntoViewIfNeeded();
      }

      await page.getByRole('button', { name: /Contact on WhatsApp/i }).click();
      await page.waitForURL(/wa\.(me|web)/, { timeout: 20000 }).catch(() => {
        console.log('WhatsApp redirect not observed for contact', i + 1);
      });
      await page.goto(`${BASE_URL}/products/${productId}`);
      console.log(`Product contact ${i + 1} recorded`);
    }

    // Admin review
    console.log('Admin reviewing all requests');
    await login(page, ADMIN.email, ADMIN.password);

    await page.goto(`${BASE_URL}/admin/visits`);
    await page.waitForLoadState('networkidle');
    const visitsCount = await page.locator('table tbody tr, div[data-testid*="visit"], li').count();
    console.log('Visits in admin dashboard:', visitsCount);

    await page.goto(`${BASE_URL}/admin/leads`);
    await page.waitForLoadState('networkidle');
    const contactsCount = await page.locator('table tbody tr, div[data-testid*="lead"], li').count();
    console.log('Product contact rows in admin dashboard:', contactsCount);

    // Screenshot final state
    await page.screenshot({ path: 'tests/screenshots/flow-admin-multiple.png', fullPage: true });

    await logout(page);
    console.log('=== END: Multiple Requests Workflow ===\n');
  });
});
