import { test, expect } from '@playwright/test';

test.describe('Mobile Responsiveness', () => {
  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Check that main elements are visible and properly sized
    await expect(page.locator('.app-container')).toBeVisible();
    await expect(page.locator('.header-content')).toBeVisible();
    await expect(page.locator('.question-form')).toBeVisible();
    
    // Check that logo and title stack vertically on mobile
    const logo = page.locator('.logo-wrapper');
    const logoStyles = await logo.evaluate(el => getComputedStyle(el).flexDirection);
    expect(logoStyles).toBe('column');
    
    // Check that submit button takes full width on mobile
    const submitButton = page.locator('.submit-button');
    const buttonRect = await submitButton.boundingBox();
    const formRect = await page.locator('.question-form').boundingBox();
    
    // Button should be close to full width of form (within padding)
    expect(buttonRect.width).toBeGreaterThan(formRect.width * 0.8);
  });

  test('should have proper touch targets on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Check that buttons and interactive elements are large enough for touch
    const submitButton = page.locator('button[type="submit"]');
    const buttonRect = await submitButton.boundingBox();
    
    // Minimum touch target size should be 44x44px (iOS/Android guidelines)
    expect(buttonRect.height).toBeGreaterThanOrEqual(44);
    expect(buttonRect.width).toBeGreaterThanOrEqual(44);
    
    // Check textarea is appropriately sized
    const textarea = page.locator('textarea');
    const textareaRect = await textarea.boundingBox();
    expect(textareaRect.height).toBeGreaterThanOrEqual(80); // Should be tall enough for comfortable typing
  });

  test('should handle tablet viewport correctly', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    
    // Check that content is properly centered and sized
    const container = page.locator('.app-container');
    const containerRect = await container.boundingBox();
    
    // Container should not take full width on tablet
    expect(containerRect.width).toBeLessThanOrEqual(800); // max-width constraint
    
    // Elements should still be visible and functional
    await expect(page.locator('.app-title')).toBeVisible();
    await expect(page.locator('textarea')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });
});
