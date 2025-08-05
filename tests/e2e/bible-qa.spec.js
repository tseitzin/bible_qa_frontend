import { test, expect } from '@playwright/test';

// Helper function to mock the API
async function mockApi(page, response = { answer: 'Test biblical answer about love and kindness.' }, status = 200, delay = 0) {
  await page.route('**/api/ask', async route => {
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    if (status >= 400) {
      route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify({ detail: response.error || 'Internal server error' })
      });
    } else {
      route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(response)
      });
    }
  });
}

test.describe('Bible Q&A Application', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the main page correctly', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle('Bible Q&A');
    
    // Check main heading
    await expect(page.locator('h1')).toContainText('Bible Q&A');
    
    // Check subtitle
    await expect(page.locator('.app-subtitle')).toContainText('Ask questions about Scripture and receive thoughtful, biblical answers');
    
    // Check that Bible icon is displayed
    await expect(page.locator('.logo-icon')).toBeVisible();
    
    // Check that question form is present
    await expect(page.locator('form')).toBeVisible();
    
    // Check that textarea is present
    await expect(page.locator('textarea')).toBeVisible();
    
    // Check that submit button is present
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    
    // Check footer
    await expect(page.locator('.footer-text')).toContainText('Powered by AI');
  });

  test('should have proper form validation', async ({ page }) => {
    const submitButton = page.locator('button[type="submit"]');
    
    // Submit button should be disabled when textarea is empty
    await expect(submitButton).toBeDisabled();
    
    // Type in textarea
    await page.locator('textarea').fill('What is love?');
    
    // Submit button should now be enabled
    await expect(submitButton).toBeEnabled();
    
    // Clear textarea
    await page.locator('textarea').clear();
    
    // Submit button should be disabled again
    await expect(submitButton).toBeDisabled();
  });

  test('should show character count and respect max length', async ({ page }) => {
    const textarea = page.locator('textarea');
    
    // Type a short message
    await textarea.fill('What is love?');
    
    // Check character count is displayed
    await expect(page.locator('.char-count')).toContainText('13/500');
    
    // Type maximum allowed characters
    const maxText = 'A'.repeat(500);
    await textarea.fill(maxText);
    
    // Check character count shows max
    await expect(page.locator('.char-count')).toContainText('500/500');
    
    // Try to exceed max length - browser should prevent it due to maxlength attribute
    const textValue = await textarea.inputValue();
    expect(textValue.length).toBe(500);
  });

  test('should handle form submission and loading state', async ({ page }) => {
    // Add delay to mock response to capture loading state
    await mockApi(page, {
      answer: 'Love is patient, love is kind. It does not envy, it does not boast, it is not proud. (1 Corinthians 13:4)'
    }, 200, 1000); // 1 second delay

    const textarea = page.locator('textarea');
    const submitButton = page.locator('button[type="submit"]');
    
    // Fill out the form
    await textarea.fill('What does the Bible say about love?');
    
    // Submit the form
    await submitButton.click();
    
    // Check loading message appears
    await expect(page.locator('.loading-message')).toContainText('Searching Scripture...');
    
    // Wait for response and check answer appears
    await expect(page.locator('.answer-display')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.answer-text')).toContainText('Love is patient');
  });

  test('should handle API errors gracefully', async ({ page }) => {
    await mockApi(page, { error: 'Internal server error' }, 500);

    const textarea = page.locator('textarea');
    const submitButton = page.locator('button[type="submit"]');
    
    // Fill and submit form
    await textarea.fill('What is love?');
    await submitButton.click();
    
    // Check error message appears
    await expect(page.locator('.error-message')).toBeVisible();
    await expect(page.locator('.error-title')).toContainText('Something went wrong');
    await expect(page.locator('.error-text')).toContainText('Internal server error');
  });

  test('should clear error messages when dismissed', async ({ page }) => {
    await mockApi(page, { error: 'Test error' }, 500);

    // Trigger error
    await page.locator('textarea').fill('Test question');
    await page.locator('button[type="submit"]').click();
    
    // Wait for error to appear
    await expect(page.locator('.error-message')).toBeVisible();
    
    // Click dismiss button
    await page.locator('.error-dismiss').click();
    
    // Error should be hidden
    await expect(page.locator('.error-message')).not.toBeVisible();
  });

  test('should show copy and share buttons when answer is displayed', async ({ page }) => {
    await mockApi(page, {
      answer: 'Test biblical answer about love and kindness.'
    });

    // Submit question
    await page.locator('textarea').fill('What is love?');
    await page.locator('button[type="submit"]').click();
    
    // Wait for answer to appear
    await expect(page.locator('.answer-display')).toBeVisible();
    
    // Check action buttons are present
    await expect(page.locator('.action-button')).toHaveCount(2);
    await expect(page.locator('.action-button').first()).toContainText('Copy');
    await expect(page.locator('.action-button').last()).toContainText('Share');
  });
});
