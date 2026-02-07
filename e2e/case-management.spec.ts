import { test, expect } from '@playwright/test';

test.describe('Case Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display case selection page on load', async ({ page }) => {
    await expect(page.locator('h1:has-text("Select Trial Case")')).toBeVisible();
    await expect(
      page.locator('text=Choose from realistic NYC criminal and civil cases')
    ).toBeVisible();
  });

  test('should display Generate Random Case button', async ({ page }) => {
    const btn = page.locator('button:has-text("Generate Random Case")');
    await expect(btn).toBeVisible();
    await expect(btn).toBeEnabled();
  });

  test('should display all case cards', async ({ page }) => {
    // 5 criminal + 5 civil = 10 case cards
    const cards = page.locator('button:has-text("Generate This Case")');
    await expect(cards).toHaveCount(10);
  });

  test('should show criminal case titles', async ({ page }) => {
    await expect(page.locator('h3:has-text("Armed Robbery")')).toBeVisible();
    await expect(page.locator('h3:has-text("Domestic Violence Homicide")')).toBeVisible();
    await expect(page.locator('h3:has-text("Drug Possession")')).toBeVisible();
    await expect(page.locator('h3:has-text("Aggravated Assault")')).toBeVisible();
    await expect(page.locator('h3:has-text("Residential Burglary")')).toBeVisible();
  });

  test('should show civil case titles', async ({ page }) => {
    await expect(page.locator('h3:has-text("Personal Injury")')).toBeVisible();
    await expect(page.locator('h3:has-text("Medical Malpractice")')).toBeVisible();
    await expect(page.locator('h3:has-text("Breach of Contract")')).toBeVisible();
    await expect(page.locator('h3:has-text("Property Dispute")')).toBeVisible();
    await expect(page.locator('h3:has-text("Employment Discrimination")')).toBeVisible();
  });

  test('should filter cases by criminal category', async ({ page }) => {
    const categorySelect = page.locator('select').first();
    await categorySelect.selectOption('criminal');

    // Should show only 5 criminal cases
    const cards = page.locator('button:has-text("Generate This Case")');
    await expect(cards).toHaveCount(5);

    // Civil cases should not be visible
    await expect(page.locator('h3:has-text("Personal Injury")')).not.toBeVisible();
    await expect(page.locator('h3:has-text("Breach of Contract")')).not.toBeVisible();
  });

  test('should filter cases by civil category', async ({ page }) => {
    const categorySelect = page.locator('select').first();
    await categorySelect.selectOption('civil');

    const cards = page.locator('button:has-text("Generate This Case")');
    await expect(cards).toHaveCount(5);

    // Criminal cases should not be visible
    await expect(page.locator('h3:has-text("Armed Robbery")')).not.toBeVisible();
    await expect(page.locator('h3:has-text("Drug Possession")')).not.toBeVisible();
  });

  test('should filter cases by beginner difficulty', async ({ page }) => {
    const difficultySelect = page.locator('select').nth(1);
    await difficultySelect.selectOption('beginner');

    // Beginner cases: Drug Possession, Breach of Contract
    const cards = page.locator('button:has-text("Generate This Case")');
    await expect(cards).toHaveCount(2);
    await expect(page.locator('h3:has-text("Drug Possession")')).toBeVisible();
    await expect(page.locator('h3:has-text("Breach of Contract")')).toBeVisible();
  });

  test('should combine category and difficulty filters', async ({ page }) => {
    const categorySelect = page.locator('select').first();
    const difficultySelect = page.locator('select').nth(1);

    await categorySelect.selectOption('criminal');
    await difficultySelect.selectOption('advanced');

    // Only advanced criminal: Domestic Violence Homicide
    const cards = page.locator('button:has-text("Generate This Case")');
    await expect(cards).toHaveCount(1);
    await expect(page.locator('h3:has-text("Domestic Violence Homicide")')).toBeVisible();
  });

  test('should generate specific case and navigate to main app', async ({ page }) => {
    // Wait for framer-motion animations to settle
    await page.waitForTimeout(1500);

    // Click the first "Generate This Case" button (force due to framer-motion)
    const generateButtons = page.locator('button:has-text("Generate This Case")');
    await generateButtons.first().click({ force: true });

    // Should transition to main app
    await expect(page.locator('text=LLM Courtroom Simulator')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('button:has-text("Select New Case")')).toBeVisible();
  });

  test('should navigate back to case selection', async ({ page }) => {
    // Generate a case first
    await page.waitForTimeout(1500);
    await page.locator('button:has-text("Generate This Case")').first().click({ force: true });
    await expect(page.locator('text=LLM Courtroom Simulator')).toBeVisible({ timeout: 15000 });

    // Wait for 3D scene to stabilize before navigating away
    await page.waitForTimeout(2000);

    // Click "Select New Case" (force to bypass any animation instability)
    await page.locator('button:has-text("Select New Case")').click({ force: true });

    // Should be back on case selection page
    await expect(page.locator('h1:has-text("Select Trial Case")')).toBeVisible({ timeout: 10000 });
  });

  test('should generate random case', async ({ page }) => {
    await page.waitForTimeout(1000);
    await page.locator('button:has-text("Generate Random Case")').click({ force: true });

    // Should transition to main app
    await expect(page.locator('text=LLM Courtroom Simulator')).toBeVisible({ timeout: 15000 });
  });

  test('should show case details on cards', async ({ page }) => {
    // Verify case card content for Armed Robbery
    await expect(page.locator('text=Robbery with deadly weapon')).toBeVisible();
    await expect(page.locator('text=Eyewitness testimony')).toBeVisible();
  });

  test('should show difficulty badges', async ({ page }) => {
    // Target visible span elements, not hidden option elements
    await expect(page.locator('span:text("beginner")').first()).toBeVisible();
    await expect(page.locator('span:text("intermediate")').first()).toBeVisible();
    await expect(page.locator('span:text("advanced")').first()).toBeVisible();
  });

  test('should show category labels', async ({ page }) => {
    // Category labels are in uppercase spans inside cards
    await expect(page.locator('span:text("criminal")').first()).toBeVisible();
    await expect(page.locator('span:text("civil")').first()).toBeVisible();
  });
});
