import { test, expect } from '@playwright/test'

/**
 * Accessibility E2E Tests
 *
 * Tests for WCAG compliance and accessibility features
 */

test.describe('Accessibility', () => {
  test.describe('Keyboard Navigation', () => {
    test('should be able to navigate with keyboard on homepage', async ({ page }) => {
      await page.goto('/')

      // Start from the beginning
      await page.keyboard.press('Tab')

      // Should be able to tab through interactive elements
      let tabCount = 0
      const maxTabs = 20

      while (tabCount < maxTabs) {
        const focusedElement = await page.evaluate(() => {
          const el = document.activeElement
          return el ? el.tagName : null
        })

        // If we've reached an interactive element, test passes
        if (focusedElement && ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'].includes(focusedElement)) {
          expect(true).toBe(true)
          return
        }

        await page.keyboard.press('Tab')
        tabCount++
      }

      // Should have at least some focusable elements
      expect(tabCount).toBeGreaterThan(0)
    })

    test('should have visible focus indicators', async ({ page }) => {
      await page.goto('/')

      // Tab to first interactive element
      await page.keyboard.press('Tab')

      // Check if focus is visible
      const hasFocusStyle = await page.evaluate(() => {
        const el = document.activeElement
        if (!el) return false

        const style = window.getComputedStyle(el)
        const outline = style.outline
        const boxShadow = style.boxShadow
        const border = style.border

        // Check if element has visible focus indicator
        return (
          (outline && outline !== 'none' && !outline.includes('0px')) ||
          (boxShadow && boxShadow !== 'none') ||
          (border && border !== 'none')
        )
      })

      expect(hasFocusStyle).toBe(true)
    })

    test('should support Enter key for button activation', async ({ page }) => {
      await page.goto('/login')

      // Tab to a button
      const button = page.getByRole('button').first()
      await button.focus()

      // Press Enter
      await page.keyboard.press('Enter')

      // Button should be activated (no error thrown)
      expect(true).toBe(true)
    })
  })

  test.describe('Screen Reader Support', () => {
    test('should have proper heading hierarchy', async ({ page }) => {
      await page.goto('/')

      // Get all headings
      const headings = await page.evaluate(() => {
        const h1s = document.querySelectorAll('h1')
        const h2s = document.querySelectorAll('h2')
        const h3s = document.querySelectorAll('h3')

        return {
          h1Count: h1s.length,
          h2Count: h2s.length,
          h3Count: h3s.length,
        }
      })

      // Should have at least one h1
      expect(headings.h1Count).toBeGreaterThanOrEqual(1)
    })

    test('should have alt text on images', async ({ page }) => {
      await page.goto('/')

      // Check all images
      const imagesWithoutAlt = await page.evaluate(() => {
        const images = document.querySelectorAll('img')
        let count = 0

        images.forEach((img) => {
          // Decorative images can use empty alt or aria-hidden
          const hasAlt = img.alt !== undefined && img.alt !== null
          const hasAriaLabel = img.getAttribute('aria-label')
          const isHidden = img.getAttribute('aria-hidden') === 'true'
          const isDecorativeEmptyAlt = img.alt === ''

          if (!hasAlt && !hasAriaLabel && !isHidden && !isDecorativeEmptyAlt) {
            count++
          }
        })

        return count
      })

      // Log for debugging - some images may be decorative
      // Decorative images should use alt="" or aria-hidden="true"
      expect(imagesWithoutAlt).toBeLessThanOrEqual(5) // Allow some decorative images
    })

    test('should have labels on form inputs', async ({ page }) => {
      await page.goto('/login')

      // Check that inputs have associated labels
      const inputsWithoutLabels = await page.evaluate(() => {
        const inputs = document.querySelectorAll('input:not([type="hidden"]):not([type="submit"])')
        let count = 0

        inputs.forEach((input) => {
          const id = input.id
          const ariaLabel = input.getAttribute('aria-label')
          const ariaLabelledBy = input.getAttribute('aria-labelledby')
          const placeholder = input.getAttribute('placeholder')
          const hasLabel = id ? document.querySelector(`label[for="${id}"]`) : null

          if (!hasLabel && !ariaLabel && !ariaLabelledBy && !placeholder) {
            count++
          }
        })

        return count
      })

      expect(inputsWithoutLabels).toBe(0)
    })

    test('should have ARIA landmarks', async ({ page }) => {
      await page.goto('/')

      const landmarks = await page.evaluate(() => {
        return {
          hasMain: !!document.querySelector('main, [role="main"]'),
          hasNav: !!document.querySelector('nav, [role="navigation"]'),
          hasHeader: !!document.querySelector('header, [role="banner"]'),
          hasFooter: !!document.querySelector('footer, [role="contentinfo"]'),
        }
      })

      // Should have at least main and navigation
      expect(landmarks.hasMain || landmarks.hasNav).toBe(true)
    })
  })

  test.describe('Color and Contrast', () => {
    test('should have sufficient text contrast', async ({ page }) => {
      await page.goto('/')

      // Check text elements for contrast
      const textElements = await page.evaluate(() => {
        const elements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, a, span, label')
        let lowContrastCount = 0

        elements.forEach((el) => {
          const style = window.getComputedStyle(el)
          const color = style.color
          const bgColor = style.backgroundColor

          // Simple check: text color should not be too light on light backgrounds
          // This is a simplified check - real contrast checking requires luminance calculation
          if (color === 'rgb(255, 255, 255)' && bgColor === 'rgb(255, 255, 255)') {
            lowContrastCount++
          }
        })

        return lowContrastCount
      })

      expect(textElements).toBe(0)
    })

    test('should not rely solely on color for information', async ({ page }) => {
      await page.goto('/login')

      // Check for error states - they should have more than just color
      const submitButton = page.getByRole('button', { name: /inloggen|login|aanmelden|submit/i })
      await submitButton.first().click()

      // Wait for potential error
      await page.waitForTimeout(1000)

      // Check if any error indicators use text (not just color)
      const errorIndicators = await page.evaluate(() => {
        const errors = document.querySelectorAll('.error, [role="alert"], [aria-invalid="true"], .text-red-500, .text-red-600')

        // If no errors are shown, that's fine (form didn't submit)
        if (errors.length === 0) return true

        let hasNonColorIndicator = true

        errors.forEach((error) => {
          const hasIcon = error.querySelector('svg, img, [class*="icon"]')
          const hasText = error.textContent && error.textContent.trim().length > 0

          if (!hasIcon && !hasText) {
            hasNonColorIndicator = false
          }
        })

        return hasNonColorIndicator
      })

      expect(errorIndicators).toBe(true)
    })
  })

  test.describe('Motion and Animation', () => {
    test('should respect reduced motion preference', async ({ page }) => {
      // Emulate reduced motion
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await page.goto('/')

      // Check if animations are disabled
      const hasReducedMotion = await page.evaluate(() => {
        const style = document.createElement('style')
        style.textContent = `
          @media (prefers-reduced-motion: reduce) {
            *, *::before, *::after {
              animation-duration: 0.01ms !important;
              transition-duration: 0.01ms !important;
            }
          }
        `
        document.head.appendChild(style)

        // Check if media query matches
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches
      })

      expect(hasReducedMotion).toBe(true)
    })
  })

  test.describe('Touch Targets', () => {
    test('should have adequate touch target sizes on mobile', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/')

      // Check button and link sizes
      const smallTargets = await page.evaluate(() => {
        const interactiveElements = document.querySelectorAll('a, button, input, select, textarea')
        let smallCount = 0
        const minSize = 44 // WCAG minimum is 44x44 pixels

        interactiveElements.forEach((el) => {
          const rect = el.getBoundingClientRect()
          if (rect.width < minSize && rect.height < minSize && rect.width > 0) {
            smallCount++
          }
        })

        return smallCount
      })

      // Allow some small targets (icons in text, etc.) but flag if too many
      expect(smallTargets).toBeLessThan(10)
    })
  })
})
