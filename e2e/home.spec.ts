import { test, expect } from '@playwright/test'

/**
 * Home Page E2E Tests
 */

test.describe('Home Page', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/')

    // Should have a title
    await expect(page).toHaveTitle(/Liefde|Dating/i)
  })

  test('should have navigation links', async ({ page }) => {
    await page.goto('/')

    // Check for common navigation elements
    const nav = page.locator('nav, header')
    await expect(nav).toBeVisible()
  })

  test('should have login/register buttons for unauthenticated users', async ({ page }) => {
    await page.goto('/')

    // Look for login or register buttons/links
    const authLinks = page.getByRole('link', { name: /login|inloggen|registrer|aanmelden/i })
    const authButtons = page.getByRole('button', { name: /login|inloggen|registrer|aanmelden/i })

    // At least one should be visible
    const hasAuthLink = await authLinks.first().isVisible().catch(() => false)
    const hasAuthButton = await authButtons.first().isVisible().catch(() => false)

    expect(hasAuthLink || hasAuthButton).toBe(true)
  })

  test('should be responsive', async ({ page }) => {
    await page.goto('/')

    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page.locator('body')).toBeVisible()

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(page.locator('body')).toBeVisible()

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 })
    await expect(page.locator('body')).toBeVisible()
  })
})
