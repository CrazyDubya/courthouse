import { test, expect } from '@playwright/test';

test.describe('Trial Simulation E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Create a test case for simulation
    await page.click('button:has-text("New Case")');
    await page.fill('input[name="title"]', 'Simulation Test Case');
    await page.selectOption('select[name="type"]', 'criminal');
    await page.fill('textarea[name="summary"]', 'Testing trial simulation');
    await page.click('button:has-text("Create Case")');
  });

  test('should start simulation', async ({ page }) => {
    // Click start simulation button
    await page.click('button:has-text("Start Simulation")');
    
    // Verify simulation is running
    await expect(page.locator('text=Simulation Running')).toBeVisible();
    await expect(page.locator('button:has-text("Stop Simulation")')).toBeVisible();
  });

  test('should pause and resume simulation', async ({ page }) => {
    // Start simulation
    await page.click('button:has-text("Start Simulation")');
    
    // Pause simulation
    await page.click('button:has-text("Pause")');
    await expect(page.locator('text=Paused')).toBeVisible();
    
    // Resume simulation
    await page.click('button:has-text("Resume")');
    await expect(page.locator('text=Simulation Running')).toBeVisible();
  });

  test('should stop simulation', async ({ page }) => {
    // Start simulation
    await page.click('button:has-text("Start Simulation")');
    
    // Stop simulation
    await page.click('button:has-text("Stop Simulation")');
    
    // Verify simulation stopped
    await expect(page.locator('button:has-text("Start Simulation")')).toBeVisible();
    await expect(page.locator('text=Simulation Running')).not.toBeVisible();
  });

  test('should display AI processing indicator', async ({ page }) => {
    // Start simulation
    await page.click('button:has-text("Start Simulation")');
    
    // Wait for AI processing indicator
    await expect(page.locator('text=Processing AI')).toBeVisible({ timeout: 10000 });
  });

  test('should progress through trial phases', async ({ page }) => {
    // Start simulation
    await page.click('button:has-text("Start Simulation")');
    
    // Verify phase progression
    await expect(page.locator('text=Pre-Trial')).toBeVisible();
    
    // Wait for phase to progress (with timeout)
    await expect(page.locator('text=Opening Statements')).toBeVisible({ timeout: 30000 });
  });

  test('should show active speaker during simulation', async ({ page }) => {
    // Start simulation
    await page.click('button:has-text("Start Simulation")');
    
    // Wait for active speaker to appear
    await expect(page.locator('[data-testid="active-speaker"]')).toBeVisible({ timeout: 10000 });
  });

  test('should update transcript in real-time', async ({ page }) => {
    // Start simulation
    await page.click('button:has-text("Start Simulation")');
    
    // Wait for transcript entries to appear
    await expect(page.locator('[data-testid="transcript-entry"]')).toBeVisible({ timeout: 10000 });
    
    // Verify transcript is updating
    const initialCount = await page.locator('[data-testid="transcript-entry"]').count();
    await page.waitForTimeout(5000);
    const updatedCount = await page.locator('[data-testid="transcript-entry"]').count();
    
    expect(updatedCount).toBeGreaterThan(initialCount);
  });

  test('should adjust simulation speed', async ({ page }) => {
    // Start simulation
    await page.click('button:has-text("Start Simulation")');
    
    // Change speed setting
    await page.click('button:has-text("Settings")');
    await page.selectOption('select[name="realtimeSpeed"]', '2');
    await page.click('button:has-text("Apply")');
    
    // Verify speed setting is applied
    const speed = await page.locator('select[name="realtimeSpeed"]').inputValue();
    expect(speed).toBe('2');
  });
});
