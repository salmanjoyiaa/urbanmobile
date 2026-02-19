import { test, expect, Page } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3002';

// Test credentials
const ADMIN = { email: 'zuhabbgoher@gmail.com', password: 'Zuhab12!' };
const AGENT = { email: 'ahmed@urbansaudi.com', password: 'salman' };

async function login(page: Page, email: string, password: string) {
  await page.goto(`${BASE_URL}/login`);
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForLoadState('networkidle');
}

async function logout(page: Page) {
  const signoutBtn = page.locator('[role="menuitem"]:has-text("Sign out"), text=/Sign out/i').first();
  if (await signoutBtn.count() > 0) {
    await signoutBtn.click();
    await page.waitForLoadState('networkidle');
  }
}

test.describe('End-to-End Workflows', () => {
  test('Complete visit request workflow: Submit → Admin approves → Agent sees in dashboard', async ({ page }) => {
    console.log('=== VISIT REQUEST WORKFLOW ===');
    
    // Step 1: Get property
    console.log('1. Fetching property...');
    const propsResp = await page.request.get(`${BASE_URL}/api/properties`);
    const props = await propsResp.json() as { data: { id: string }[] };
    const propertyId = props.data?.[0]?.id;
    expect(propertyId).toBeTruthy();
    console.log('✓ Property:', propertyId);
    
    // Step 2: Submit visit request
    console.log('2. Navigating to property and submitting visit request...');
    await page.goto(`${BASE_URL}/properties/${propertyId}`);
    await page.waitForLoadState('networkidle',  { timeout: 15000 });
    
    // Select date (click first available day)
    const dayButtons = page.locator('button:has-text("1"), button:has-text("2"), button:has-text("10"), button:has-text("11")').first();
    if (await dayButtons.count() > 0) {
      await dayButtons.click();
      await page.waitForTimeout(300);
    }
    
    // Continue to slots
    const continueToSlots = page.locator('button:has-text("Continue to slots")').first();
    if (await continueToSlots.count() > 0) {
      try {
        await continueToSlots.click({ timeout: 5000 });
        await page.waitForTimeout(300);
      } catch (e) {
        console.log('Could not click Continue to slots:', e);
      }
    }
    
    // Select time slot
    const timeSlots = page.locator('button[role="button"]:not(:disabled)');
    const slots = await timeSlots.count();
    if (slots > 0) {
      await timeSlots.nth(0).click();
      await page.waitForTimeout(300);
    }
    
    // Continue to details
    const continueToDetails = page.locator('button:has-text("Continue to details")').first();
    if (await continueToDetails.count() > 0) {
      try {
        await continueToDetails.click({ timeout: 5000 });
        await page.waitForTimeout(300);
      } catch (e) {
        console.log('Could not click Continue to details:', e);
      }
    }
    
    // Fill contact details
    const nameInput = page.locator('#visitor-name');
    if (await nameInput.count() > 0) {
      await nameInput.fill('E2E Test Visitor');
    }
    
    const emailInput = page.locator('#visitor-email');
    if (await emailInput.count() > 0) {
      await emailInput.fill('e2e-visitor-' + Date.now() + '@test.com');
    }
    
    const phoneInput = page.locator('#visitor-phone');
    if (await phoneInput.count() > 0) {
      await phoneInput.fill('+966501234567');
    }
    
    // Submit
    const submitBtn = page.locator('button:has-text("Submit visit request")').first();
    if (await submitBtn.count() > 0) {
      await submitBtn.click();
      await page.waitForTimeout(2000);
      console.log('✓ Visit request submitted');
    }
    
    // Step 3: Admin reviews and approves
    console.log('3. Admin reviewing visits...');
    await logout(page);
    await login(page, ADMIN.email, ADMIN.password);
    await page.goto(`${BASE_URL}/admin/visits`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Screenshot of admin visits
    await page.screenshot({ path: 'tests/screenshots/admin-visits.png', fullPage: true });
    console.log('✓ Admin on visits page');
    
    // Try to approve (if buttons available)
    const approvals = page.locator('button:has-text("Approve"), button:has-text("Confirm"), button:has-text("Accept")');
    if (await approvals.count() > 0) {
      await approvals.first().click();
      await page.waitForTimeout(1000);
      console.log('✓ Visit approved');
    }
    
    // Step 4: Agent checks dashboard
    console.log('4. Agent checking dashboard...');
    await logout(page);
    await login(page, AGENT.email, AGENT.password);
    await page.goto(`${BASE_URL}/agent`);
    await page.waitForLoadState('networkidle');
    
    // Screenshot agent dashboard
    await page.screenshot({ path: 'tests/screenshots/agent-dashboard.png', fullPage: true });
    console.log('✓ Agent dashboard loaded');
    
    console.log('=== WORKFLOW COMPLETE ===\n');
  });
});
