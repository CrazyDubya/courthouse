import { test, expect } from '@playwright/test';

async function setupCase(page: import('@playwright/test').Page) {
  await page.goto('/');
  // Wait for framer-motion entry animations to settle
  await page.waitForTimeout(1500);
  await page.locator('button:has-text("Generate This Case")').first().click({ force: true });
  await expect(page.locator('text=LLM Courtroom Simulator')).toBeVisible({ timeout: 15000 });
}

test.describe('Role Selection', () => {
  test.beforeEach(async ({ page }) => {
    await setupCase(page);
  });

  test('should show Your Role section', async ({ page }) => {
    await expect(page.locator('span:has-text("Your Role")')).toBeVisible();
  });

  test('should have role dropdown with AI Controlled default', async ({ page }) => {
    const roleSelect = page.locator('select').first();
    await expect(roleSelect).toBeVisible();
    // Default is "AI Controlled (Observer)"
    await expect(roleSelect).toHaveValue('');
  });

  test('should allow selecting judge role', async ({ page }) => {
    const roleSelect = page.locator('select').first();
    await roleSelect.selectOption('judge');
    await expect(roleSelect).toHaveValue('judge');
    // Should show role description
    await expect(page.locator('text=Presides over proceedings')).toBeVisible();
  });

  test('should allow selecting prosecutor role', async ({ page }) => {
    const roleSelect = page.locator('select').first();
    await roleSelect.selectOption('prosecutor');
    await expect(roleSelect).toHaveValue('prosecutor');
    await expect(page.locator('text=Represents the state')).toBeVisible();
  });

  test('should allow selecting defense attorney role', async ({ page }) => {
    const roleSelect = page.locator('select').first();
    await roleSelect.selectOption('defense-attorney');
    await expect(roleSelect).toHaveValue('defense-attorney');
    await expect(page.locator('text=Defends the accused')).toBeVisible();
  });

  test('should show role tips for non-observer roles', async ({ page }) => {
    const roleSelect = page.locator('select').first();
    await roleSelect.selectOption('prosecutor');
    await expect(page.locator('text=Present evidence methodically')).toBeVisible();
  });

  test('should show user actions for attorney roles', async ({ page }) => {
    const roleSelect = page.locator('select').first();
    await roleSelect.selectOption('prosecutor');

    // Should show the statement input and Speak button
    await expect(page.locator('input[placeholder="Enter your statement..."]')).toBeVisible();
    await expect(page.locator('button:has-text("Speak")')).toBeVisible();

    // Should show objection controls for attorneys
    await expect(page.locator('button:has-text("Object!")')).toBeVisible();
  });

  test('should not show user actions for observer role', async ({ page }) => {
    // Default is observer - no action buttons
    await expect(page.locator('input[placeholder="Enter your statement..."]')).not.toBeVisible();
    await expect(page.locator('button:has-text("Speak")')).not.toBeVisible();
  });

  test('should not show objection for non-attorney roles', async ({ page }) => {
    const roleSelect = page.locator('select').first();
    await roleSelect.selectOption('witness');

    // Should show statement input but NOT objection button
    await expect(page.locator('input[placeholder="Enter your statement..."]')).toBeVisible();
    await expect(page.locator('button:has-text("Object!")')).not.toBeVisible();
  });
});

test.describe('Simulation Settings', () => {
  test.beforeEach(async ({ page }) => {
    await setupCase(page);
  });

  test('should show Speed section', async ({ page }) => {
    await expect(page.locator('span:has-text("Speed")')).toBeVisible();
  });

  test('should show Settings section', async ({ page }) => {
    await expect(page.locator('span:has-text("Settings")')).toBeVisible();
  });

  test('should toggle Auto Progress setting', async ({ page }) => {
    // Open Settings section using evaluate to dispatch native click
    await page.locator('button:has-text("Settings")').evaluate(el => el.click());

    const autoProgressLabel = page.locator('label:has-text("Auto Progress")');
    await expect(autoProgressLabel).toBeVisible();

    const checkbox = autoProgressLabel.locator('input[type="checkbox"]');
    const initialState = await checkbox.isChecked();

    // Toggle via evaluate to ensure React event fires
    await checkbox.evaluate(el => el.click());
    expect(await checkbox.isChecked()).toBe(!initialState);

    // Toggle back
    await checkbox.evaluate(el => el.click());
    expect(await checkbox.isChecked()).toBe(initialState);
  });

  test('should toggle Enable Objections setting', async ({ page }) => {
    await page.locator('button:has-text("Settings")').evaluate(el => el.click());

    const label = page.locator('label:has-text("Enable Objections")');
    await expect(label).toBeVisible();

    const checkbox = label.locator('input[type="checkbox"]');
    const initialState = await checkbox.isChecked();
    await checkbox.evaluate(el => el.click());
    expect(await checkbox.isChecked()).toBe(!initialState);
  });

  test('should toggle Enable Sidebar Conferences setting', async ({ page }) => {
    await page.locator('button:has-text("Settings")').evaluate(el => el.click());

    const label = page.locator('label:has-text("Enable Sidebar Conferences")');
    await expect(label).toBeVisible();

    const checkbox = label.locator('input[type="checkbox"]');
    const initialState = await checkbox.isChecked();
    await checkbox.evaluate(el => el.click());
    expect(await checkbox.isChecked()).toBe(!initialState);
  });

  test('should show jury size configuration', async ({ page }) => {
    // Open Jury Size section - click the button parent
    await page.locator('button:has-text("Jury Size")').click({ force: true });

    const juryInput = page.locator('input[type="number"]');
    await expect(juryInput).toBeVisible();

    // Default jury size should be between 6 and 12
    const value = parseInt(await juryInput.inputValue());
    expect(value).toBeGreaterThanOrEqual(6);
    expect(value).toBeLessThanOrEqual(12);
  });
});

test.describe('Transcript Viewer', () => {
  test.beforeEach(async ({ page }) => {
    await setupCase(page);
  });

  test('should show Court Transcript heading', async ({ page }) => {
    await expect(page.locator('text=Court Transcript')).toBeVisible();
  });

  test('should show Export Transcript button', async ({ page }) => {
    // Open Export section - click the button parent
    await page.locator('button:has-text("Export")').click({ force: true });
    await expect(page.locator('button:has-text("Export Transcript")')).toBeVisible();
  });
});

test.describe('Collapsible Sections', () => {
  test.beforeEach(async ({ page }) => {
    await setupCase(page);
  });

  test('should have all control panel sections', async ({ page }) => {
    await expect(page.locator('span:has-text("Current Phase")')).toBeVisible();
    await expect(page.locator('span:has-text("Your Role")')).toBeVisible();
    await expect(page.locator('span:has-text("Speed")')).toBeVisible();
    await expect(page.locator('span:has-text("Settings")')).toBeVisible();
    await expect(page.locator('span:has-text("Jury Size")')).toBeVisible();
    await expect(page.locator('span:has-text("Controls")')).toBeVisible();
    await expect(page.locator('span:has-text("Export")')).toBeVisible();
  });

  test('should open collapsed section on click', async ({ page }) => {
    // Speed section is closed by default (defaultOpen={false})
    // Range input should not be visible initially
    await expect(page.locator('input[type="range"]')).not.toBeVisible();

    // Click to open the Speed section
    await page.locator('button:has-text("Speed")').evaluate(el => el.click());

    // Should now show the range input
    await expect(page.locator('input[type="range"]')).toBeVisible();

    // Verify the speed value text appears (e.g. "1x speed")
    await expect(page.locator('text=1x speed')).toBeVisible();
  });
});
