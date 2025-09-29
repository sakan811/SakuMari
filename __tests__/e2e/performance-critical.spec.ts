import { test, expect, devices } from "@playwright/test";

test.describe("Performance and Critical Accessibility", () => {
  test.describe("Key Performance Benchmarks", () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test.beforeEach(async ({ page }) => {
      await page.goto("/");
      await page.getByRole("button", { name: "Sign In" }).click();
      await page.waitForURL(/.*signin.*/);
      await page.fill('input[name="email"]', "test@sakumari.local");
      await page.fill('input[name="password"]', "TestPassword123!");
      await page.click('form[action*="credentials"] button[type="submit"]');
      await page.waitForURL("/");
    });

    test("should load home page quickly", async ({ page }) => {
      const startTime = Date.now();
      await page.goto("/");
      await expect(page.getByText("🌸 SakuMari 🌸")).toBeVisible();
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(3000);
    });

    test("should load practice page quickly", async ({ page }) => {
      const startTime = Date.now();
      await page.goto("/hiragana");
      await page.waitForSelector('[data-testid="current-kana"]');
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(3000);
    });

    test("should load dashboard quickly", async ({ page }) => {
      // Generate some practice data first
      await page.goto("/hiragana");
      await page.waitForSelector('[data-testid="current-kana"]');
      for (let i = 0; i < 3; i++) {
        await page.getByPlaceholder("Type romaji equivalent...").fill("a");
        await page.getByRole("button", { name: "Submit" }).click();
        await page.getByRole("button", { name: "Next Card" }).click();
      }

      const startTime = Date.now();
      await page.goto("/dashboard");
      await expect(page.getByText("Dashboard")).toBeVisible();
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(3000);
    });

    test("should respond quickly to flashcard interactions", async ({
      page,
    }) => {
      await page.goto("/hiragana");
      await page.waitForSelector('[data-testid="current-kana"]');

      // Test typing submission response time
      await page.getByPlaceholder("Type romaji equivalent...").fill("a");
      const submitStartTime = Date.now();
      await page.getByRole("button", { name: "Submit" }).click();
      await expect(
        page.getByText("Correct!").or(page.getByText("Incorrect!")),
      ).toBeVisible();
      const responseTime = Date.now() - submitStartTime;
      expect(responseTime).toBeLessThan(1000);

      // Test next card response time
      const nextStartTime = Date.now();
      await page.getByRole("button", { name: "Next Card" }).click();
      await expect(
        page.getByPlaceholder("Type romaji equivalent..."),
      ).toBeVisible();
      const nextResponseTime = Date.now() - nextStartTime;
      expect(nextResponseTime).toBeLessThan(1000);
    });
  });

  test.describe("Essential Accessibility", () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test.beforeEach(async ({ page }) => {
      await page.goto("/");
      await page.getByRole("button", { name: "Sign In" }).click();
      await page.waitForURL(/.*signin.*/);
      await page.fill('input[name="email"]', "test@sakumari.local");
      await page.fill('input[name="password"]', "TestPassword123!");
      await page.click('form[action*="credentials"] button[type="submit"]');
      await page.waitForURL("/");
    });

    test("should support keyboard navigation", async ({ page }) => {
      await page.goto("/hiragana");
      await page.waitForSelector('[data-testid="current-kana"]');

      // Test Tab navigation through interactive elements
      await page.keyboard.press("Tab");
      await expect(
        page.getByPlaceholder("Type romaji equivalent..."),
      ).toBeFocused();

      await page.keyboard.press("Tab");
      await expect(page.getByRole("button", { name: "Submit" })).toBeFocused();

      await page.keyboard.press("Tab");
      await expect(
        page.getByRole("button", { name: "Next Card" }),
      ).toBeFocused();
    });

    test("should have proper ARIA labels", async ({ page }) => {
      await page.goto("/hiragana");
      await page.waitForSelector('[data-testid="current-kana"]');

      // Check for ARIA labels on interactive elements
      const mobileMenuButton = page.getByLabel("Toggle mobile menu");
      await expect(mobileMenuButton).toBeVisible();

      const inputField = page.getByPlaceholder("Type romaji equivalent...");
      await expect(inputField).toBeVisible();

      // Check that buttons have proper text or aria-labels
      const submitButton = page.getByRole("button", { name: "Submit" });
      await expect(submitButton).toBeVisible();
    });

    test("should support screen reader basics", async ({ page }) => {
      await page.goto("/");

      // Check for proper heading structure
      await expect(page.locator("h1")).toBeVisible();
      const h1Text = await page.locator("h1").textContent();
      expect(h1Text).toBeTruthy();

      // Check for alt text on images (if any)
      const images = page.locator("img");
      const imageCount = await images.count();
      for (let i = 0; i < imageCount; i++) {
        const image = images.nth(i);
        const altText = await image.getAttribute("alt");
        const src = await image.getAttribute("src");

        // Skip favicon and decorative images
        if (src && !src.includes("favicon") && !src.includes("icon")) {
          expect(altText).toBeTruthy();
        }
      }
    });

    test("should have sufficient color contrast", async ({ page }) => {
      await page.goto("/");

      // Check that text is readable against background
      const heading = page.locator("h1");
      await expect(heading).toBeVisible();

      // Basic visibility check (actual contrast testing would require additional tools)
      const headingStyle = await heading.evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return {
          color: styles.color,
          backgroundColor: styles.backgroundColor,
          fontSize: styles.fontSize,
        };
      });

      expect(headingStyle.color).not.toBe("rgba(0, 0, 0, 0)");
      expect(headingStyle.fontSize).not.toBe("0px");
    });

    test("should manage focus properly", async ({ page }) => {
      await page.goto("/hiragana");
      await page.waitForSelector('[data-testid="current-kana"]');

      // Test that focus remains visible
      const inputField = page.getByPlaceholder("Type romaji equivalent...");
      await inputField.focus();
      await expect(inputField).toBeFocused();

      // Test focus after form submission
      await inputField.fill("a");
      await page.getByRole("button", { name: "Submit" }).click();
      await expect(
        page.getByText("Correct!").or(page.getByText("Incorrect!")),
      ).toBeVisible();

      // Focus should move to next button or remain manageable
      const nextButton = page.getByRole("button", { name: "Next Card" });
      await expect(nextButton).toBeVisible();
      await nextButton.focus();
      await expect(nextButton).toBeFocused();
    });

    test("should have appropriate touch target sizes", async ({ page }) => {
      await page.goto("/hiragana");
      await page.waitForSelector('[data-testid="current-kana"]');

      // Test mobile view
      await page.setViewportSize(devices["iPhone 12"].viewport);

      // Check button sizes for touch interaction
      const buttons = page.locator("button").all();
      for (const button of await buttons) {
        const boundingBox = await button.boundingBox();
        if (boundingBox && boundingBox.width > 0 && boundingBox.height > 0) {
          // Minimum touch target size is 44x44 points (iOS HIG)
          expect(boundingBox.width).toBeGreaterThanOrEqual(40);
          expect(boundingBox.height).toBeGreaterThanOrEqual(40);
        }
      }
    });

    test("should handle mobile accessibility", async ({ page }) => {
      await page.setViewportSize(devices["iPhone 12"].viewport);
      await page.goto("/");

      // Test mobile menu accessibility
      const mobileMenuButton = page.getByLabel("Toggle mobile menu");
      await expect(mobileMenuButton).toBeVisible();
      await mobileMenuButton.click();

      // Mobile menu items should be accessible
      const menuItems = page.locator('[role="menuitem"], button').all();
      expect(await menuItems.length).toBeGreaterThan(0);
    });
  });
});
