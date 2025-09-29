import { test, expect } from "@playwright/test";

test.describe("Mobile Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
  });

  test.describe("Unauthenticated User", () => {
    test("should show mobile menu button on small screens", async ({ page }) => {
      await page.goto("/");

      const mobileMenuButton = page.getByLabel("Toggle mobile menu");
      await expect(mobileMenuButton).toBeVisible();
      await expect(mobileMenuButton).toHaveAttribute("aria-label", "Toggle mobile menu");
    });

    test("should open mobile menu with hamburger icon", async ({ page }) => {
      await page.goto("/");

      const mobileMenuButton = page.getByLabel("Toggle mobile menu");

      // Should show hamburger icon when closed
      await expect(mobileMenuButton.locator('path[d*="M4 6h16M4 12h16M4 18h16"]')).toBeVisible();

      // Click to open menu
      await mobileMenuButton.click();

      // Should show X icon when open
      await expect(mobileMenuButton.locator('path[d*="M6 18L18 6M6 6l12 12"]')).toBeVisible();
    });

    test("should show sign in options in mobile menu", async ({ page }) => {
      await page.goto("/");

      // Open mobile menu
      await page.getByLabel("Toggle mobile menu").click();

      // Should show sign in options
      await expect(page.getByText("Sign In with Google")).toBeVisible();
      await expect(page.getByText("Sign In with Credentials")).toBeVisible();

      // Should show "or" separator
      await expect(page.getByText("or")).toBeVisible();
    });

    test("should close mobile menu when clicking outside", async ({ page }) => {
      await page.goto("/");

      // Open mobile menu
      await page.getByLabel("Toggle mobile menu").click();
      await expect(page.getByText("Sign In with Google")).toBeVisible();

      // Click outside menu area
      await page.locator("body").click({ position: { x: 10, y: 10 } });

      // Menu should be closed
      await expect(page.getByText("Sign In with Google")).not.toBeVisible();
      await expect(page.getByLabel("Toggle mobile menu").locator('path[d*="M4 6h16M4 12h16M4 18h16"]')).toBeVisible();
    });
  });

  test.describe("Authenticated User", () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test.beforeEach(async ({ page }) => {
      // Login via credentials provider
      await page.goto("/");
      await page.getByRole("button", { name: "Sign In" }).click();
      await page.waitForURL(/.*signin.*/);
      await page.fill('input[name="email"]', "test@sakumari.local");
      await page.fill('input[name="password"]', "TestPassword123!");
      await page.click('form[action*="credentials"] button[type="submit"]');
      await page.waitForURL("/");
    });

    test("should show navigation links in mobile menu", async ({ page }) => {
      // Open mobile menu
      await page.getByLabel("Toggle mobile menu").click();

      // Should show navigation links
      await expect(page.getByText("ひらがな Hiragana")).toBeVisible();
      await expect(page.getByText("カタカナ Katakana")).toBeVisible();
      await expect(page.getByText("📊 Dashboard")).toBeVisible();

      // Should show user info
      await expect(page.getByText("Test User")).toBeVisible();

      // Should show sign out button
      await expect(page.getByText("Sign Out")).toBeVisible();
    });

    test("should navigate to hiragana practice from mobile menu", async ({ page }) => {
      // Open mobile menu
      await page.getByLabel("Toggle mobile menu").click();

      // Click hiragana link
      await page.getByText("ひらがな Hiragana").click();

      // Should navigate to hiragana page
      await page.waitForURL("/hiragana");
      await expect(page.getByPlaceholder("Type romaji equivalent...")).toBeVisible();

      // Mobile menu should be closed
      await expect(page.getByText("ひらがな Hiragana", { exact: false })).not.toBeVisible();
    });

    test("should navigate to katakana practice from mobile menu", async ({ page }) => {
      // Open mobile menu
      await page.getByLabel("Toggle mobile menu").click();

      // Click katakana link
      await page.getByText("カタカナ Katakana").click();

      // Should navigate to katakana page
      await page.waitForURL("/katakana");
      await expect(page.getByPlaceholder("Type romaji equivalent...")).toBeVisible();
    });

    test("should navigate to dashboard from mobile menu", async ({ page }) => {
      // Open mobile menu
      await page.getByLabel("Toggle mobile menu").click();

      // Click dashboard link
      await page.getByText("📊 Dashboard").click();

      // Should navigate to dashboard page
      await page.waitForURL("/dashboard");
      await expect(page.getByText("Dashboard")).toBeVisible();
    });

    test("should sign out from mobile menu", async ({ page }) => {
      // Open mobile menu
      await page.getByLabel("Toggle mobile menu").click();

      // Click sign out button
      await page.getByText("Sign Out").click();

      // Should redirect to home and show sign in button
      await page.waitForURL("/");
      await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();

      // Should not show authenticated content
      await expect(page.getByText("ひらがな Hiragana Practice")).not.toBeVisible();
    });

    test("should close mobile menu after navigation", async ({ page }) => {
      // Open mobile menu
      await page.getByLabel("Toggle mobile menu").click();
      await expect(page.getByText("ひらがな Hiragana")).toBeVisible();

      // Navigate to dashboard
      await page.getByText("📊 Dashboard").click();
      await page.waitForURL("/dashboard");

      // Mobile menu should be closed
      await expect(page.getByText("ひらがな Hiragana")).not.toBeVisible();

      // Should show hamburger icon again
      await expect(page.getByLabel("Toggle mobile menu").locator('path[d*="M4 6h16M4 12h16M4 18h16"]')).toBeVisible();
    });

    test("should maintain mobile menu state across page loads", async ({ page }) => {
      // Open mobile menu
      await page.getByLabel("Toggle mobile menu").click();
      await expect(page.getByText("ひらがな Hiragana")).toBeVisible();

      // Navigate away and back
      await page.goto("/hiragana");
      await page.waitForURL("/hiragana");
      await page.goto("/");
      await page.waitForURL("/");

      // Mobile menu should be closed after navigation
      await expect(page.getByText("ひらがな Hiragana")).not.toBeVisible();
    });
  });

  test.describe("Mobile Navigation Accessibility", () => {
    test("should have proper touch targets", async ({ page }) => {
      await page.goto("/");

      // Mobile menu button should have minimum size
      const menuButton = page.getByLabel("Toggle mobile menu");
      const box = await menuButton.boundingBox();
      expect(box?.width).toBeGreaterThanOrEqual(44);
      expect(box?.height).toBeGreaterThanOrEqual(44);

      // Open menu
      await menuButton.click();

      // Navigation links should have minimum size
      const hiraganaLink = page.getByText("ひらがな Hiragana");
      const hiraganaBox = await hiraganaLink.boundingBox();
      expect(hiraganaBox?.height).toBeGreaterThanOrEqual(44);
    });

    test("should handle mobile orientation changes", async ({ page }) => {
      await page.goto("/");

      // Test portrait mode
      await page.setViewportSize({ width: 375, height: 667 });
      let menuButton = page.getByLabel("Toggle mobile menu");
      await expect(menuButton).toBeVisible();

      // Test landscape mode
      await page.setViewportSize({ width: 667, height: 375 });
      menuButton = page.getByLabel("Toggle mobile menu");
      await expect(menuButton).toBeVisible();

      // Open menu in landscape
      await menuButton.click();
      await expect(page.getByText("Sign In with Google")).toBeVisible();
    });
  });

  test.describe("Mobile Navigation Performance", () => {
    test("should open and close menu quickly", async ({ page }) => {
      await page.goto("/");

      const menuButton = page.getByLabel("Toggle mobile menu");

      // Measure menu open time
      const startTime = Date.now();
      await menuButton.click();
      await expect(page.getByText("Sign In with Google")).toBeVisible();
      const openTime = Date.now() - startTime;
      expect(openTime).toBeLessThan(500); // Should open within 500ms

      // Measure menu close time
      const closeStartTime = Date.now();
      await menuButton.click();
      await expect(page.getByText("Sign In with Google")).not.toBeVisible();
      const closeTime = Date.now() - closeStartTime;
      expect(closeTime).toBeLessThan(500); // Should close within 500ms
    });
  });
});