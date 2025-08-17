import { test, expect } from '@playwright/test'

test.describe('@smoke App smoke checks', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('@smoke loads home and shows key UI', async ({ page }) => {
    await expect(page.locator('h1.app-title')).toHaveText(/Bible Q&A/i)
    await expect(page.locator('.nav-tab')).toHaveCount(2)
    await expect(page.locator('textarea')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('@smoke can type and enable submit', async ({ page }) => {
    const textarea = page.locator('textarea')
    const submit = page.locator('button[type="submit"]')
    await expect(submit).toBeDisabled()
    await textarea.fill('What is love?')
    await expect(submit).toBeEnabled()
  })

  test('@smoke can open Saved Answers tab', async ({ page }) => {
    await page.getByRole('button', { name: /Saved Answers/i }).click()
    await expect(page.locator('h2', { hasText: 'Saved Answers' })).toBeVisible()
  })
})
