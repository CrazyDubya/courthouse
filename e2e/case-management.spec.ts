import { test, expect } from '@playwright/test';

test.describe('Case Management E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should create a new case', async ({ page }) => {
    // Click "New Case" button
    await page.click('button:has-text("New Case")');
    
    // Fill in case details
    await page.fill('input[name="title"]', 'Test Criminal Case');
    await page.selectOption('select[name="type"]', 'criminal');
    await page.selectOption('select[name="legalSystem"]', 'common-law');
    await page.fill('textarea[name="summary"]', 'Test case for E2E testing');
    
    // Add facts
    await page.click('button:has-text("Add Fact")');
    await page.fill('input[placeholder="Enter a fact"]', 'Defendant was at the scene');
    
    // Add charges
    await page.click('button:has-text("Add Charge")');
    await page.fill('input[placeholder="Enter a charge"]', 'Assault in the first degree');
    
    // Save case
    await page.click('button:has-text("Create Case")');
    
    // Verify case was created
    await expect(page.locator('h1:has-text("Test Criminal Case")')).toBeVisible();
    await expect(page.locator('text=criminal')).toBeVisible();
  });

  test('should load an existing case', async ({ page }) => {
    // Navigate to case list or load functionality
    await page.click('button:has-text("Load Case")');
    
    // Select a case from the list
    await page.click('text=Sample Case');
    
    // Verify case is loaded
    await expect(page.locator('h1:has-text("Sample Case")')).toBeVisible();
  });

  test('should save case to localStorage', async ({ page }) => {
    // Create a new case
    await page.click('button:has-text("New Case")');
    await page.fill('input[name="title"]', 'Auto-Save Test');
    await page.fill('textarea[name="summary"]', 'Testing auto-save functionality');
    await page.click('button:has-text("Create Case")');
    
    // Verify localStorage contains the case
    const localStorageData = await page.evaluate(() => {
      const keys = Object.keys(localStorage);
      const caseKey = keys.find(k => k.startsWith('case-'));
      return caseKey ? localStorage.getItem(caseKey) : null;
    });
    
    expect(localStorageData).toBeTruthy();
    expect(localStorageData).toContain('Auto-Save Test');
  });

  test('should update case details', async ({ page }) => {
    // Load or create a case
    await page.click('button:has-text("New Case")');
    await page.fill('input[name="title"]', 'Update Test Case');
    await page.click('button:has-text("Create Case")');
    
    // Edit case details
    await page.click('button:has-text("Edit Case")');
    await page.fill('input[name="title"]', 'Updated Case Title');
    await page.click('button:has-text("Save Changes")');
    
    // Verify update
    await expect(page.locator('h1:has-text("Updated Case Title")')).toBeVisible();
  });

  test('should handle case validation errors', async ({ page }) => {
    // Try to create a case without required fields
    await page.click('button:has-text("New Case")');
    await page.click('button:has-text("Create Case")');
    
    // Verify error messages
    await expect(page.locator('text=Title is required')).toBeVisible();
  });
});
