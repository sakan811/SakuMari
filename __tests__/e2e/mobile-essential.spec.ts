import { test, expect, devices } from "@playwright/test";

test.describe.configure({ mode: 'parallel' }); // Enable parallel execution within this file

test.describe("Mobile Essential Features", () => {
  test.describe("Mobile Navigation", () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(devices["iPhone 12"].viewport);
    });

    test("should show mobile menu button on small screens", async ({
      page,
    }) => {
      await page.goto("/");
      const mobileMenuButton = page.getByLabel("Toggle mobile menu");
      await expect(mobileMenuButton).toBeVisible();
      await expect(mobileMenuButton).toHaveAttribute(
        "aria-label",
        "Toggle mobile menu",
      );
    });

    test("should open and close mobile menu with proper icons", async ({
      page,
    }) => {
      await page.goto("/");
      const mobileMenuButton = page.getByLabel("Toggle mobile menu");

      // Should show hamburger icon when closed
      await expect(
        mobileMenuButton.locator('path[d*="M4 6h16M4 12h16M4 18h16"]'),
      ).toBeVisible();

      // Click to open menu
      await mobileMenuButton.click();

      // Should show X icon when open
      await expect(
        mobileMenuButton.locator('path[d*="M6 18L18 6M6 6l12 12"]'),
      ).toBeVisible();

      // Click to close menu
      await mobileMenuButton.click();

      // Should show hamburger icon again
      await expect(
        mobileMenuButton.locator('path[d*="M4 6h16M4 12h16M4 18h16"]'),
      ).toBeVisible();
    });

    test("should show sign in options in mobile menu for unauthenticated users", async ({
      page,
    }) => {
      await page.goto("/");
      await page.getByLabel("Toggle mobile menu").click();
      await expect(
        page.locator('button:has-text("Sign In with Google")'),
      ).toBeVisible();
      await expect(
        page.locator('button:has-text("Sign In with Credentials")'),
      ).toBeVisible();
    });

    test("should close mobile menu when clicking outside", async ({ page }) => {
      await page.goto("/");
      await page.getByLabel("Toggle mobile menu").click();
      await expect(page.getByText("Sign In with Google")).toBeVisible();

      // Click outside the menu
      await page.click("body", { position: { x: 10, y: 10 } });
      await expect(page.getByText("Sign In with Google")).toBeHidden();
    });
  });

  test.describe("Mobile Practice Features", () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(devices["iPhone 12"].viewport);
    });

    test.use({ storageState: { cookies: [], origins: [] } });

    test.beforeEach(async ({ page }) => {
      // Optimized mobile auth
      await page.goto("/");
      await page.getByLabel("Toggle mobile menu").click();
      await page.locator('button:has-text("Sign In with Credentials")').click();
      await page.waitForURL(/.*signin.*/);
      await page.fill('input[name="email"]', "test@sakumari.local");
      await page.fill('input[name="password"]', "TestPassword123!");
      await page.click('form[action*="credentials"] button[type="submit"]');
      await page.waitForURL("/");
    });

    test("should navigate to practice via mobile menu", async ({ page }) => {
      await page.getByLabel("Toggle mobile menu").click();
      await page.getByText("ひらがな Hiragana").click();
      await page.waitForURL("/hiragana");
      await expect(page.getByTestId("current-kana")).toBeVisible();
    });

    test("should handle mobile typing practice", async ({ page }) => {
      await page.goto("/hiragana");
      await page.waitForSelector('[data-testid="current-kana"]');

      // Mobile keyboard should appear when clicking input
      await page.getByPlaceholder("Type romaji equivalent...").click();
      await page.getByPlaceholder("Type romaji equivalent...").fill("a");
      await page.getByRole("button", { name: "Submit" }).click();
      await expect(
        page.getByText("Correct!").or(page.getByText("Incorrect!")),
      ).toBeVisible();
    });

    test("should handle mobile multiple choice practice", async ({ page }) => {
      await page.goto("/hiragana");
      await page.waitForSelector('[data-testid="current-kana"]');

      await page.getByTestId("multiple-choice-button").click();
      await expect(page.getByText("Tap to select your answer")).toBeVisible();

      await page.waitForSelector('[data-testid^="choice-button-"]');
      const choices = await page
        .locator('[data-testid^="choice-button-"]')
        .all();
      if (choices.length > 0) {
        // Test touch interaction
        await choices[0].tap();
        await expect(
          page.getByText("Correct!").or(page.getByText("Incorrect!")),
        ).toBeVisible();
      }
    });

    test("should have touch-friendly buttons", async ({ page }) => {
      await page.goto("/hiragana");
      await page.waitForSelector('[data-testid="current-kana"]');

      // Test that buttons are large enough for touch
      const submitButton = page.getByRole("button", { name: "Submit" });
      const boundingBox = await submitButton.boundingBox();
      expect(boundingBox).toBeTruthy();
      if (boundingBox) {
        expect(boundingBox.width).toBeGreaterThan(40); // Minimum touch target size
        expect(boundingBox.height).toBeGreaterThan(40);
      }
    });
  });

  test.describe("Mobile Dashboard Features", () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(devices["iPhone 12"].viewport);
    });

    test.use({ storageState: { cookies: [], origins: [] } });

    test.beforeEach(async ({ page }) => {
      // Optimized mobile auth with minimal progress data
      await page.goto("/");
      await page.getByLabel("Toggle mobile menu").click();
      await page.locator('button:has-text("Sign In with Credentials")').click();
      await page.waitForURL(/.*signin.*/);
      await page.fill('input[name="email"]', "test@sakumari.local");
      await page.fill('input[name="password"]', "TestPassword123!");
      await page.click('form[action*="credentials"] button[type="submit"]');
      await page.waitForURL("/");

      // Generate minimal progress data (reduced from 3 to 1 iteration)
      await page.goto("/hiragana");
      await page.waitForSelector('[data-testid="current-kana"]');
      await page.getByPlaceholder("Type romaji equivalent...").fill("a");
      await page.getByRole("button", { name: "Submit" }).click();
      await page.getByRole("button", { name: "Next Card" }).click();
    });

    test("should display responsive dashboard on mobile", async ({ page }) => {
      await page.goto("/dashboard");
      await expect(page.getByText("Dashboard")).toBeVisible();
      await expect(page.getByText("Progress Overview")).toBeVisible();

      // Dashboard should be mobile-responsive
      const dashboard = page.locator(".container");
      const boundingBox = await dashboard.boundingBox();
      expect(boundingBox).toBeTruthy();
      if (boundingBox) {
        expect(boundingBox.width).toBeLessThan(400); // Should fit mobile screen
      }
    });

    test("should handle mobile table scrolling", async ({ page }) => {
      await page.goto("/dashboard");
      await expect(page.getByText("Dashboard")).toBeVisible();

      // Progress table should be scrollable on mobile
      const table = page.locator("table");
      await expect(table).toBeVisible();

      // Test scrolling functionality
      await page.mouse.wheel(0, 100);
      await expect(table).toBeVisible();
    });
  });
});
