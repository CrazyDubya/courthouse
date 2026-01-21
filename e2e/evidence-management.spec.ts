import { test, expect } from '@playwright/test';

test.describe('Evidence Management E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    
    // Create a test case
    await page.click('button:has-text("New Case")');
    await page.fill('input[name="title"]', 'Evidence Test Case');
    await page.selectOption('select[name="type"]', 'criminal');
    await page.click('button:has-text("Create Case")');
  });

  test('should add evidence to case', async ({ page }) => {
    // Click add evidence button
    await page.click('button:has-text("Add Evidence")');
    
    // Fill evidence form
    await page.fill('input[name="evidenceTitle"]', 'Police Report');
    await page.selectOption('select[name="evidenceType"]', 'document');
    await page.fill('textarea[name="evidenceDescription"]', 'Initial police report');
    await page.fill('input[name="submittedBy"]', 'prosecutor-1');
    await page.check('input[name="admissible"]');
    
    // Submit evidence
    await page.click('button:has-text("Add")');
    
    // Verify evidence appears in list
    await expect(page.locator('text=Police Report')).toBeVisible();
  });

  test('should remove evidence from case', async ({ page }) => {
    // Add evidence first
    await page.click('button:has-text("Add Evidence")');
    await page.fill('input[name="evidenceTitle"]', 'Temporary Evidence');
    await page.selectOption('select[name="evidenceType"]', 'document');
    await page.click('button:has-text("Add")');
    
    // Remove evidence
    await page.click('[data-testid="remove-evidence-button"]');
    await page.click('button:has-text("Confirm")');
    
    // Verify evidence is removed
    await expect(page.locator('text=Temporary Evidence')).not.toBeVisible();
  });

  test('should filter evidence by type', async ({ page }) => {
    // Add multiple evidence items
    await page.click('button:has-text("Add Evidence")');
    await page.fill('input[name="evidenceTitle"]', 'Video Evidence');
    await page.selectOption('select[name="evidenceType"]', 'video');
    await page.click('button:has-text("Add")');
    
    await page.click('button:has-text("Add Evidence")');
    await page.fill('input[name="evidenceTitle"]', 'Document Evidence');
    await page.selectOption('select[name="evidenceType"]', 'document');
    await page.click('button:has-text("Add")');
    
    // Filter by video
    await page.selectOption('select[name="filterType"]', 'video');
    
    // Verify only video evidence is shown
    await expect(page.locator('text=Video Evidence')).toBeVisible();
    await expect(page.locator('text=Document Evidence')).not.toBeVisible();
  });

  test('should mark evidence as inadmissible', async ({ page }) => {
    // Add evidence
    await page.click('button:has-text("Add Evidence")');
    await page.fill('input[name="evidenceTitle"]', 'Contested Evidence');
    await page.selectOption('select[name="evidenceType"]', 'document');
    await page.check('input[name="admissible"]');
    await page.click('button:has-text("Add")');
    
    // Mark as inadmissible
    await page.click('[data-testid="toggle-admissibility"]');
    
    // Verify inadmissible status
    await expect(page.locator('text=Inadmissible')).toBeVisible();
  });

  test('should upload evidence file', async ({ page }) => {
    // Click add evidence
    await page.click('button:has-text("Add Evidence")');
    
    // Upload file
    await page.setInputFiles('input[type="file"]', {
      name: 'evidence.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('test PDF content'),
    });
    
    // Fill other details
    await page.fill('input[name="evidenceTitle"]', 'Uploaded Document');
    await page.click('button:has-text("Add")');
    
    // Verify file is attached
    await expect(page.locator('text=evidence.pdf')).toBeVisible();
  });
});
