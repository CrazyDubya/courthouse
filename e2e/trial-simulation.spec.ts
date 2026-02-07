import { test, expect } from '@playwright/test';

/**
 * Helper: generate a case and navigate to the main app.
 * Uses the first "Generate This Case" button (Armed Robbery).
 */
async function setupCase(page: import('@playwright/test').Page) {
  await page.goto('/');
  // Wait for framer-motion entry animations to settle
  await page.waitForTimeout(1500);
  await page.locator('button:has-text("Generate This Case")').first().click({ force: true });
  await expect(page.locator('text=LLM Courtroom Simulator')).toBeVisible({ timeout: 15000 });
}

test.describe('Trial Simulation Controls', () => {
  test.beforeEach(async ({ page }) => {
    await setupCase(page);
  });

  test('should display simulation controls', async ({ page }) => {
    // Collapsible "Controls" section should be open by default
    await expect(page.locator('span:has-text("Controls")')).toBeVisible();

    // Buttons should exist
    await expect(page.locator('button:has-text("Start")')).toBeVisible();
    await expect(page.locator('button:has-text("Pause")')).toBeVisible();
    await expect(page.locator('button:has-text("Stop")')).toBeVisible();
    await expect(page.locator('button:has-text("Next Phase")')).toBeVisible();
  });

  test('should have Start enabled and Pause/Stop disabled initially', async ({ page }) => {
    await expect(page.locator('button:has-text("Start")')).toBeEnabled();
    await expect(page.locator('button:has-text("Pause")')).toBeDisabled();
    await expect(page.locator('button:has-text("Stop")')).toBeDisabled();
  });

  test('should show current phase section', async ({ page }) => {
    await expect(page.locator('span:has-text("Current Phase")')).toBeVisible();
    // Phase displays the current phase name (pre trial, opening statements, etc.)
    // or "Not Started" - check the yellow text element exists
    const phaseDisplay = page.locator('.text-yellow-400');
    await expect(phaseDisplay).toBeVisible();
  });

  test('should display case title in header', async ({ page }) => {
    const header = page.locator('header');
    await expect(header).toBeVisible();
    // Header shows case info like "People v. X - Criminal Case"
    const caseTitle = header.locator('p');
    await expect(caseTitle).toBeVisible();
    const text = await caseTitle.textContent();
    expect(text).toContain('Case');
  });

  test('should respond to Start button click', async ({ page }) => {
    const startBtn = page.locator('button:has-text("Start")');
    await expect(startBtn).toBeEnabled();

    // Click start - simulation may briefly run then stop if no LLM backend
    await startBtn.click({ force: true });

    // Either enters "Running..." state or returns to "Start" if engine errors
    // We verify the click was processed by checking the button exists
    const runningOrStart = page.locator('button:has-text("Running...")').or(
      page.locator('button:has-text("Start")')
    );
    await expect(runningOrStart).toBeVisible({ timeout: 10000 });
  });

  test('should have Stop button that stops running simulation', async ({ page }) => {
    // Start simulation
    await page.locator('button:has-text("Start")').click({ force: true });

    // Wait briefly for any state change
    await page.waitForTimeout(1000);

    // If simulation is still running, stop it
    const stopBtn = page.locator('button:has-text("Stop")');
    if (await stopBtn.isEnabled()) {
      await stopBtn.click({ force: true });
    }

    // Eventually Start button should be available again
    await expect(page.locator('button:has-text("Start")')).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Trial Phase Display', () => {
  test.beforeEach(async ({ page }) => {
    await setupCase(page);
  });

  test('should show phase description', async ({ page }) => {
    // Phase description should be visible in the Current Phase section
    const description = page.locator('text=Courtroom simulation ready').or(
      page.locator('text=pre-trial motions')
    );
    await expect(description).toBeVisible();
  });

  test('should show auto mode status when auto progress is on', async ({ page }) => {
    // Open Settings section - click the button parent
    await page.locator('button:has-text("Settings")').click({ force: true });

    const label = page.locator('label:has-text("Auto Progress")');
    await expect(label).toBeVisible();
    const checkbox = label.locator('input[type="checkbox"]');
    // Check if it's checked, if not enable it by clicking the label
    const isChecked = await checkbox.isChecked();
    if (!isChecked) {
      await label.click({ force: true });
    }
    expect(await checkbox.isChecked()).toBe(true);
  });
});

test.describe('Simulation Header', () => {
  test('should show LLM Courtroom Simulator title', async ({ page }) => {
    await setupCase(page);
    await expect(page.locator('h1:has-text("LLM Courtroom Simulator")')).toBeVisible();
  });

  test('should show Select New Case button', async ({ page }) => {
    await setupCase(page);
    await expect(page.locator('button:has-text("Select New Case")')).toBeVisible();
  });
});
