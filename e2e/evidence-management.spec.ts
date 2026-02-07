import { test, expect } from '@playwright/test';

async function setupCase(page: import('@playwright/test').Page) {
  await page.goto('/');
  // Wait for framer-motion entry animations to settle
  await page.waitForTimeout(1500);
  await page.locator('button:has-text("Generate This Case")').first().click({ force: true });
  await expect(page.locator('text=LLM Courtroom Simulator')).toBeVisible({ timeout: 15000 });
}

test.describe('Main App Layout', () => {
  test.beforeEach(async ({ page }) => {
    await setupCase(page);
  });

  test('should display header with title', async ({ page }) => {
    const header = page.locator('header');
    await expect(header).toBeVisible();
    await expect(header.locator('h1:has-text("LLM Courtroom Simulator")')).toBeVisible();
  });

  test('should display case information in header', async ({ page }) => {
    // Case type should be shown (Criminal or Civil)
    const caseInfo = page.locator('header p');
    await expect(caseInfo).toBeVisible();
    const text = await caseInfo.textContent();
    expect(text).toMatch(/Case$/);
  });

  test('should show left sidebar with controls', async ({ page }) => {
    await expect(page.locator('text=Simulation Controls')).toBeVisible();
  });

  test('should show right sidebar with transcript', async ({ page }) => {
    await expect(page.locator('text=Court Transcript')).toBeVisible();
  });

  test('should render 3D courtroom canvas', async ({ page }) => {
    // Three.js creates a canvas element
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Economic Valuation', () => {
  test.beforeEach(async ({ page }) => {
    await setupCase(page);
  });

  test('should show Economic Valuation section', async ({ page }) => {
    await expect(page.locator('span:has-text("Economic Valuation")')).toBeVisible();
  });

  test('should toggle valuation panel', async ({ page }) => {
    // Open Economic Valuation section via evaluate
    await page.locator('button:has-text("Economic Valuation")').evaluate(el => el.click());

    // Should show "Show Valuation" button
    const valuationBtn = page.locator('button:has-text("Show Valuation")');
    await expect(valuationBtn).toBeVisible();

    // Click to show valuation via evaluate
    await valuationBtn.evaluate(el => el.click());

    // Modal overlay should appear with the EconomicValuationDashboard
    // The button text should change to "Hide Valuation"
    await expect(page.locator('button:has-text("Hide Valuation")')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('LLM Status Indicator', () => {
  test.beforeEach(async ({ page }) => {
    await setupCase(page);
  });

  test('should display LLM Agents indicator', async ({ page }) => {
    await expect(page.locator('text=LLM Agents')).toBeVisible();
  });
});

test.describe('Navigation Flow', () => {
  test('should complete full navigation cycle', async ({ page }) => {
    await page.goto('/');

    // 1. Start on case selection
    await expect(page.locator('h1:has-text("Select Trial Case")')).toBeVisible();

    // 2. Generate a case
    await page.waitForTimeout(1500);
    await page.locator('button:has-text("Generate This Case")').first().click({ force: true });
    await expect(page.locator('text=LLM Courtroom Simulator')).toBeVisible({ timeout: 15000 });

    // 3. Go back to case selection (wait for 3D scene to stabilize)
    await page.waitForTimeout(2000);
    await page.locator('button:has-text("Select New Case")').click({ force: true });
    await expect(page.locator('h1:has-text("Select Trial Case")')).toBeVisible({ timeout: 10000 });

    // 4. Generate random case
    await page.waitForTimeout(1500);
    await page.locator('button:has-text("Generate Random Case")').click({ force: true });
    await expect(page.locator('text=LLM Courtroom Simulator')).toBeVisible({ timeout: 15000 });

    // 5. Verify controls are present
    await expect(page.locator('button:has-text("Start")')).toBeVisible();
  });

  test('should maintain app state after returning to case selection', async ({ page }) => {
    await page.goto('/');

    // Generate case
    await page.waitForTimeout(1500);
    await page.locator('button:has-text("Generate This Case")').first().click({ force: true });
    await expect(page.locator('text=LLM Courtroom Simulator')).toBeVisible({ timeout: 15000 });

    // Go back (wait for 3D scene to stabilize)
    await page.waitForTimeout(2000);
    await page.locator('button:has-text("Select New Case")').click({ force: true });

    // Generate different case (second card)
    await page.waitForTimeout(1500);
    await page.locator('button:has-text("Generate This Case")').nth(1).click({ force: true });
    await expect(page.locator('text=LLM Courtroom Simulator')).toBeVisible({ timeout: 15000 });

    // Verify new case loaded
    await expect(page.locator('header')).toBeVisible();
  });
});

test.describe('Responsive Layout', () => {
  test('should show full layout on desktop', async ({ page }) => {
    await setupCase(page);

    // All three columns should be visible
    await expect(page.locator('text=Simulation Controls')).toBeVisible();
    await expect(page.locator('canvas')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Court Transcript')).toBeVisible();
  });
});
