/**
 * Common test helpers for e2e tests
 */

/**
 * Mock a successful API response
 */
export async function mockSuccessfulApiResponse(page, answer) {
  await page.route('**/api/**', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ answer })
    });
  });
}

/**
 * Mock an API error response
 */
export async function mockApiError(page, error, statusCode = 500) {
  await page.route('**/api/**', route => {
    route.fulfill({
      status: statusCode,
      contentType: 'application/json',
      body: JSON.stringify({ error })
    });
  });
}

/**
 * Fill and submit a question
 */
export async function askQuestion(page, question) {
  await page.locator('textarea').fill(question);
  await page.locator('button[type="submit"]').click();
}

/**
 * Wait for answer to appear
 */
export async function waitForAnswer(page) {
  await page.waitForSelector('.answer-display', { state: 'visible' });
}

/**
 * Wait for error message to appear
 */
export async function waitForError(page) {
  await page.waitForSelector('.error-message', { state: 'visible' });
}

/**
 * Dismiss error message
 */
export async function dismissError(page) {
  await page.locator('.error-message button').click();
}

/**
 * Check if element is in viewport
 */
export async function isInViewport(page, selector) {
  return await page.locator(selector).evaluate(el => {
    const rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= window.innerHeight &&
      rect.right <= window.innerWidth
    );
  });
}
