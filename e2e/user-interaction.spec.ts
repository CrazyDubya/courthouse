import { test, expect } from '@playwright/test';

test.describe('User Interaction E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Create a test case
    await page.click('button:has-text("New Case")');
    await page.fill('input[name="title"]', 'User Interaction Test');
    await page.selectOption('select[name="type"]', 'criminal');
    await page.click('button:has-text("Create Case")');
  });

  test('should select user role', async ({ page }) => {
    // Select user role
    await page.click('button:has-text("Select Role")');
    await page.click('text=Defense Attorney');
    
    // Verify role is selected
    await expect(page.locator('text=You are: Defense Attorney')).toBeVisible();
  });

  test('should submit user input during simulation', async ({ page }) => {
    // Select role
    await page.click('button:has-text("Select Role")');
    await page.click('text=Defense Attorney');
    
    // Start simulation
    await page.click('button:has-text("Start Simulation")');
    
    // Wait for input opportunity
    await page.waitForSelector('textarea[placeholder*="Enter your statement"]', { timeout: 15000 });
    
    // Submit user input
    await page.fill('textarea[placeholder*="Enter your statement"]', 'I object to this line of questioning.');
    await page.click('button:has-text("Submit")');
    
    // Verify input appears in transcript
    await expect(page.locator('text=I object to this line of questioning.')).toBeVisible();
  });

  test('should toggle participant AI control', async ({ page }) => {
    // Toggle AI control for a participant
    await page.click('[data-testid="participant-settings"]');
    await page.click('input[name="aiControlled"]');
    
    // Verify AI control is disabled
    await expect(page.locator('text=Manual Control')).toBeVisible();
  });

  test('should update participant personality', async ({ page }) => {
    // Open participant settings
    await page.click('[data-testid="participant-settings"]');
    
    // Update personality trait
    await page.fill('input[name="assertiveness"]', '8');
    await page.click('button:has-text("Save")');
    
    // Verify personality is updated
    const assertiveness = await page.locator('input[name="assertiveness"]').inputValue();
    expect(assertiveness).toBe('8');
  });
});

test.describe('Transcript Management E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Create and start simulation
    await page.click('button:has-text("New Case")');
    await page.fill('input[name="title"]', 'Transcript Test');
    await page.click('button:has-text("Create Case")');
    await page.click('button:has-text("Start Simulation")');
    
    // Wait for some transcript entries
    await page.waitForTimeout(5000);
  });

  test('should display transcript entries', async ({ page }) => {
    // Verify transcript entries are visible
    await expect(page.locator('[data-testid="transcript-entry"]')).toHaveCount({ minimum: 1 });
  });

  test('should export transcript', async ({ page }) => {
    // Click export button
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Export Transcript")');
    const download = await downloadPromise;
    
    // Verify download occurred
    expect(download.suggestedFilename()).toContain('transcript');
  });

  test('should clear transcript', async ({ page }) => {
    // Clear transcript
    await page.click('button:has-text("Clear Transcript")');
    await page.click('button:has-text("Confirm")');
    
    // Verify transcript is empty
    await expect(page.locator('[data-testid="transcript-entry"]')).toHaveCount(0);
  });

  test('should filter transcript by speaker', async ({ page }) => {
    // Filter by speaker
    await page.selectOption('select[name="filterSpeaker"]', 'Judge');
    
    // Verify only judge entries are shown
    const entries = page.locator('[data-testid="transcript-entry"]');
    const count = await entries.count();
    
    for (let i = 0; i < count; i++) {
      const entry = entries.nth(i);
      await expect(entry).toContainText('Judge');
    }
  });
});

test.describe('UI Responsiveness E2E', () => {
  test('should toggle left sidebar', async ({ page }) => {
    await page.goto('/');
    
    // Toggle left sidebar
    await page.click('[data-testid="toggle-left-sidebar"]');
    
    // Verify sidebar is collapsed
    await expect(page.locator('[data-testid="left-sidebar"]')).toHaveClass(/collapsed/);
    
    // Toggle back
    await page.click('[data-testid="toggle-left-sidebar"]');
    await expect(page.locator('[data-testid="left-sidebar"]')).not.toHaveClass(/collapsed/);
  });

  test('should toggle right sidebar', async ({ page }) => {
    await page.goto('/');
    
    // Toggle right sidebar
    await page.click('[data-testid="toggle-right-sidebar"]');
    
    // Verify sidebar is collapsed
    await expect(page.locator('[data-testid="right-sidebar"]')).toHaveClass(/collapsed/);
  });

  test('should resize sidebars', async ({ page }) => {
    await page.goto('/');
    
    // Get initial width
    const sidebar = page.locator('[data-testid="left-sidebar"]');
    const initialWidth = await sidebar.evaluate(el => el.clientWidth);
    
    // Drag resize handle
    const resizeHandle = page.locator('[data-testid="resize-handle-left"]');
    await resizeHandle.dragTo(resizeHandle, { targetPosition: { x: 50, y: 0 } });
    
    // Verify width changed
    const newWidth = await sidebar.evaluate(el => el.clientWidth);
    expect(newWidth).not.toBe(initialWidth);
  });
});
