import { test, expect } from '@playwright/test';
import { setupTestUser, cleanupTestUser } from './helpers/setup';
import { readFileSync } from 'fs';
import { join } from 'path';

test.describe('World Anvil Import', () => {
  let testUser: Awaited<ReturnType<typeof setupTestUser>>;

  test.beforeEach(async () => {
    testUser = await setupTestUser();
  });

  test.afterEach(async () => {
    await cleanupTestUser(testUser);
  });

  test('should successfully import World Anvil ZIP file', async ({ page }) => {
    // Login first
    await page.goto('/');
    await page.getByTestId('button-login').click();
    
    // Wait for auth to complete
    await page.waitForURL('/', { timeout: 10000 });
    
    // Navigate to import page
    await page.goto('/import');
    await page.waitForLoadState('networkidle');
    
    // Upload the ZIP file
    const zipPath = join(process.cwd(), 'attached_assets', 'World-The Green Tide-2025-10-06_1759784760300.zip');
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(zipPath);
    
    // Click upload button
    await page.getByTestId('button-upload').click();
    
    // Wait for import to start
    await expect(page.getByText('Import started')).toBeVisible({ timeout: 5000 });
    
    // Wait for import to complete (give it up to 30 seconds)
    await expect(page.getByText('completed', { exact: false })).toBeVisible({ timeout: 30000 });
    
    console.log('✓ Import completed successfully');
  });
});
