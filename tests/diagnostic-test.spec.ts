import { test, expect, Page } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3002';

// Test a simple end-to-end flow
test('Simple visit form submission flow', async ({ page }) => {
  console.log('=== SIMPLE E2E TEST ===');
  console.log('BASE_URL:', BASE_URL);
  
  // Get a property
  console.log('1. Fetching properties...');
  const propsResp = await page.request.get(`${BASE_URL}/api/properties`);
  console.log('Properties endpoint status:', propsResp.status());
  
  const props = await propsResp.json() as { data: { id: string }[] };
  const propertyId = props.data?.[0]?.id;
  console.log('Property ID:', propertyId);
  
  if (!propertyId) {
    console.log('No properties found, skipping test');
    return;
  }
  
  // Navigate to property page
  console.log('2. Navigating to property:', `${BASE_URL}/properties/${propertyId}`);
  await page.goto(`${BASE_URL}/properties/${propertyId}`, { waitUntil: 'networkidle', timeout: 15000 });
  console.log('Page loaded');
  
  // Debug: check what's on the page
  const pageTitle = await page.title();
  const bodyText = await page.locator('body').textContent();
  console.log('Page title:', pageTitle);
  console.log('Page body length:', bodyText?.length);
  
  // Find all inputs (including hidden ones)
  const allInputs = page.locator('input');
  console.log('Total inputs found:', await allInputs.count());
  
  // List all input types and their visibility
  for (let i = 0; i < Math.min(await allInputs.count(), 15); i++) {
    const input = allInputs.nth(i);
    const type = await input.getAttribute('type');
    const placeholder = await input.getAttribute('placeholder');
    const id = await input.getAttribute('id');
    const name = await input.getAttribute('name');
    const visible = await input.isVisible();
    console.log(`Input ${i}: type=${type}, placeholder=${placeholder}, id=${id}, name=${name}, visible=${visible}`);
  }
  
  // Look for visit scheduler specifically
  const visitSection = page.locator('text=/Schedule a Visit|Request a Visit|Book a Visit/i');
  console.log('Visit section found:', await visitSection.count());
  
  // Look for calendar
  const calendar = page.locator('[role="button"][aria-label*="day"]');
  console.log('Calendar buttons found:', await calendar.count());
  
  // Look for the step indicator
  const steps = page.locator('text=/Step 1|Step 2|Step 3/i');
  console.log('Steps found:', await steps.count());
  
  // Look for date picker
  const datePicker = page.locator('input[type="date"], [role="button"]:has-text("Select date")');
  console.log('Date picker elements:', await datePicker.count());
  
  // Find all buttons and their text
  const allButtons = page.locator('button');
  console.log('Total buttons found:', await allButtons.count());
  for (let i = 0; i < Math.min(await allButtons.count(), 15); i++) {
    const btn = allButtons.nth(i);
    const text = await btn.textContent();
    const visible = await btn.isVisible();
    console.log(`Button ${i}: "${text?.trim()}", visible=${visible}`);
  }
  
  // Check for divs that might contain form content
  const formLike = page.locator('div[role="dialog"], div.modal, div.visit-scheduler, div.form');
  console.log('Form-like divs:', await formLike.count());
  
  // Try to interact with the visit scheduler
  console.log('4. Interacting with visit scheduler...');
  
  // Find and click a day in the calendar (step 1)
  const calendarDays = page.locator('button[role="button"][aria-label*="[0-9]"]');
  const validDays = page.locator('button:not([disabled])');
  console.log('Valid calendar days:', await validDays.count());
  
  //Try to find a clickable day
  const dayButtons = page.locator('button:has-text("10"), button:has-text("11"), button:has-text("12")');
  if (await dayButtons.count() > 0) {
    console.log('Found day button, clicking...');
    await dayButtons.first().click();
    await page.waitForTimeout(500);
  }
  
  // Try to find "Continue to slots" button
  const continueToSlots = page.locator('button:has-text("Continue to slots")');
  if (await continueToSlots.count() > 0 && await continueToSlots.isEnabled()) {
    console.log('Clicking "Continue to slots"...');
    await continueToSlots.click();
    await page.waitForTimeout(500);
  }
  
  // Select a time slot (step 2)
  const timeSlots = page.locator('button:has-text("09:00"), button:has-text("10:00"), button:has-text("14:00"), button[role="button"]:has(span)');
  if (await timeSlots.count() > 0) {
    console.log('Found time slots:', await timeSlots.count());
    await timeSlots.first().click();
    await page.waitForTimeout(500);
  }
  
  // Click "Continue to details"
  const continueToDetails = page.locator('button:has-text("Continue to details")');
  if (await continueToDetails.count() > 0 && await continueToDetails.isEnabled()) {
    console.log('Clicking "Continue to details"...');
    await continueToDetails.click();
    await page.waitForTimeout(500);
  }
  
  // Now check for inputs - they should be visible on step 3
  const inputsStep3 = page.locator('#visitor-name, #visitor-email, #visitor-phone');
  console.log('Step 3 inputs found:', await inputsStep3.count());
  
  // Try to fill them
  const nameInput = page.locator('#visitor-name');
  if (await nameInput.count() > 0) {
    console.log('Filling name input...');
    await nameInput.fill('Test Visitor', { timeout: 5000 });
    console.log('✓ Name filled');
  }
  
  const emailInput = page.locator('#visitor-email');
  if (await emailInput.count() > 0) {
    console.log('Filling email input...');
    await emailInput.fill('test@example.com');
    console.log('✓ Email filled');
  }
  
  const phoneInput = page.locator('#visitor-phone');
  if (await phoneInput.count() > 0) {
    console.log('Filling phone input...');
    await phoneInput.fill('+966501234567');
    console.log('✓ Phone filled');
  }
  
  // Take a screenshot
  await page.screenshot({ path: 'tests/screenshots/diagnostic.png', fullPage: true });
  console.log('Screenshot saved: tests/screenshots/diagnostic.png');
  
  console.log('=== END TEST ===');
});
