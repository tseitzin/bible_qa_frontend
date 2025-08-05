import { test, expect } from '@playwright/test';

test.describe('Complete User Journey', () => {
  test('should complete a full question-answer workflow', async ({ page }) => {
    // Mock successful API response with delay to capture loading state
    await page.route('**/api/ask', async route => {
      await new Promise(resolve => setTimeout(resolve, 500));
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          answer: 'Love is patient, love is kind. It does not envy, it does not boast, it is not proud. (1 Corinthians 13:4-5)'
        })
      });
    });

    // Step 1: User visits the application
    await page.goto('/');
    
    // Step 2: User sees the welcome message and interface
    await expect(page.locator('h1')).toContainText('Bible Q&A');
    await expect(page.locator('.app-subtitle')).toContainText('Discover biblical wisdom through AI-powered Scripture exploration');
    
    // Step 3: User examines the question form
    const textarea = page.locator('textarea');
    const submitButton = page.locator('button[type="submit"]');
    await expect(textarea).toBeVisible();
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toBeDisabled();
    
    // Step 4: User types a question
    const questionText = 'What does the Bible say about love?';
    await textarea.fill(questionText);
    
    // Step 5: User sees character count
    await expect(page.locator('.char-count')).toContainText(`${questionText.length}/500`);
    
    // Step 6: User sees submit button is now enabled
    await expect(submitButton).toBeEnabled();
    await expect(submitButton).toContainText('Ask Question');
    
    // Step 7: User clicks submit
    await submitButton.click();
    
    // Step 8: User sees loading message
    await expect(page.locator('.loading-message')).toContainText('Searching Scripture...');
    
    // Step 9: User receives answer
    await expect(page.locator('.answer-display')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.answer-text')).toContainText('Love is patient');
    
    // Step 10: User sees action buttons
    await expect(page.locator('.action-button')).toHaveCount(2);
    await expect(page.locator('.action-button').first()).toContainText('Copy');
    await expect(page.locator('.action-button').last()).toContainText('Share');
    
    // Step 11: User can ask another question
    await textarea.fill('Who is Jesus?');
    await expect(submitButton).toBeEnabled();
  });

  test('should handle error recovery gracefully', async ({ page }) => {
    // Mock API error response
    await page.route('**/api/ask', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'Service temporarily unavailable' })
      });
    });

    await page.goto('/');
    
    // User encounters error
    await page.locator('textarea').fill('What is wisdom?');
    await page.locator('button[type="submit"]').click();
    
    // User sees error message
    await expect(page.locator('.error-message')).toBeVisible();
    await expect(page.locator('.error-text')).toContainText('Service temporarily unavailable');
    
    // User dismisses error
    await page.locator('.dismiss-button').click();
    
    // Error should be hidden
    await expect(page.locator('.error-message')).not.toBeVisible();
    
    // User can try again
    await expect(page.locator('button[type="submit"]')).toBeEnabled();
  });

  test('should handle network connectivity issues', async ({ page }) => {
    // Mock network failure
    await page.route('**/api/ask', route => {
      route.abort('failed');
    });

    await page.goto('/');
    
    // User submits question
    await page.locator('textarea').fill('What is faith?');
    await page.locator('button[type="submit"]').click();
    
    // User sees network error
    await expect(page.locator('.error-message')).toBeVisible();
    await expect(page.locator('.error-text')).toContainText('Network Error');
    
    // User can dismiss and retry
    await page.locator('.dismiss-button').click();
    await expect(page.locator('.error-message')).not.toBeVisible();
  });
});
