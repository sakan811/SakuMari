import { test, expect, devices } from "@playwright/test";

test.describe("Core Functionality", () => {
  test.describe("Authentication", () => {
    test("should authenticate with Google OAuth", async ({ page }) => {
      await page.goto("/");

      // Click sign in button
      await page.getByRole("button", { name: "Sign In" }).click();
      await page.waitForURL(/.*signin.*/);

      // Should show Google OAuth option
      await expect(page.getByText("Sign In with Google")).toBeVisible();
    });

    test("should authenticate with credentials provider", async ({ page }) => {
      await page.goto("/");

      // Click sign in button
      await page.getByRole("button", { name: "Sign In" }).click();
      await page.waitForURL(/.*signin.*/);

      // Login with credentials
      await page.fill('input[name="email"]', "test@sakumari.local");
      await page.fill('input[name="password"]', "TestPassword123!");
      await page.click('form[action*="credentials"] button[type="submit"]');

      // Should redirect to home
      await page.waitForURL("/");
      await expect(page.getByText("ひらがな Hiragana Practice")).toBeVisible();
    });

    test("should show sign in options for unauthenticated users", async ({ page }) => {
      await page.goto("/");

      // Should show welcome message
      await expect(page.getByText("Welcome to SakuMari!")).toBeVisible();
      await expect(page.getByText("Sign in with your Google account")).toBeVisible();

      // Should show sign in button
      await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();
    });
  });

  test.describe("Navigation", () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test.beforeEach(async ({ page }) => {
      // Login for authenticated tests
      await page.goto("/");
      await page.getByRole("button", { name: "Sign In" }).click();
      await page.waitForURL(/.*signin.*/);
      await page.fill('input[name="email"]', "test@sakumari.local");
      await page.fill('input[name="password"]', "TestPassword123!");
      await page.click('form[action*="credentials"] button[type="submit"]');
      await page.waitForURL("/");
    });

    test("should navigate desktop navigation", async ({ page }) => {
      // Desktop navigation should be visible
      await expect(page.getByText("ひらがな Hiragana")).toBeVisible();
      await expect(page.getByText("カタカナ Katakana")).toBeVisible();
      await expect(page.getByText("📊 Dashboard")).toBeVisible();

      // Test navigation
      await page.getByText("ひらがな Hiragana").click();
      await page.waitForURL("/hiragana");
      await expect(page.getByPlaceholder("Type romaji equivalent...")).toBeVisible();
    });

    test("should navigate mobile menu", async ({ page }) => {
      // Test with mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      // Mobile menu button should be visible
      const mobileMenuButton = page.getByLabel("Toggle mobile menu");
      await expect(mobileMenuButton).toBeVisible();

      // Open mobile menu
      await mobileMenuButton.click();

      // Should show navigation links
      await expect(page.getByText("ひらがな Hiragana")).toBeVisible();
      await expect(page.getByText("カタカナ Katakana")).toBeVisible();
      await expect(page.getByText("📊 Dashboard")).toBeVisible();

      // Test navigation
      await page.getByText("ひらがな Hiragana").click();
      await page.waitForURL("/hiragana");
      await expect(page.getByPlaceholder("Type romaji equivalent...")).toBeVisible();
    });

    test("should sign out from both desktop and mobile", async ({ page }) => {
      // Test desktop sign out
      await expect(page.getByText("Sign Out")).toBeVisible();
      await page.getByText("Sign Out").click();
      await page.waitForURL("/");
      await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();

      // Re-login for mobile test
      await page.goto("/");
      await page.getByRole("button", { name: "Sign In" }).click();
      await page.waitForURL(/.*signin.*/);
      await page.fill('input[name="email"]', "test@sakumari.local");
      await page.fill('input[name="password"]', "TestPassword123!");
      await page.click('form[action*="credentials"] button[type="submit"]');
      await page.waitForURL("/");

      // Test mobile sign out
      await page.setViewportSize({ width: 375, height: 667 });
      await page.getByLabel("Toggle mobile menu").click();
      await page.getByText("Sign Out").click();
      await page.waitForURL("/");
      await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();
    });
  });

  test.describe("Flashcard Practice", () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test.beforeEach(async ({ page }) => {
      // Login for practice tests
      await page.goto("/");
      await page.getByRole("button", { name: "Sign In" }).click();
      await page.waitForURL(/.*signin.*/);
      await page.fill('input[name="email"]', "test@sakumari.local");
      await page.fill('input[name="password"]', "TestPassword123!");
      await page.click('form[action*="credentials"] button[type="submit"]');
      await page.waitForURL("/");
    });

    test("should practice hiragana in typing mode", async ({ page }) => {
      await page.goto("/hiragana");
      await page.waitForSelector('[data-testid="current-kana"]');

      // Should show typing interface
      await expect(page.getByPlaceholder("Type romaji equivalent...")).toBeVisible();

      // Submit answer
      await page.getByPlaceholder("Type romaji equivalent...").fill("a");
      await page.getByRole("button", { name: "Submit" }).click();

      // Should show result
      await expect(page.getByText("Correct!").or(page.getByText("Incorrect!"))).toBeVisible();
    });

    test("should practice katakana in typing mode", async ({ page }) => {
      await page.goto("/katakana");
      await page.waitForSelector('[data-testid="current-kana"]');

      await page.getByPlaceholder("Type romaji equivalent...").fill("a");
      await page.getByRole("button", { name: "Submit" }).click();

      await expect(page.getByText("Correct!").or(page.getByText("Incorrect!"))).toBeVisible();
    });

    test("should switch between typing and multiple choice modes", async ({ page }) => {
      await page.goto("/hiragana");
      await page.waitForSelector('[data-testid="current-kana"]');

      // Switch to multiple choice
      await page.getByTestId("multiple-choice-button").click();
      await expect(page.getByPlaceholder("Type romaji equivalent...")).not.toBeVisible();
      await expect(page.getByText("Tap to select your answer")).toBeVisible();

      // Switch back to typing
      await page.getByTestId("typing-button").click();
      await expect(page.getByPlaceholder("Type romaji equivalent...")).toBeVisible();
    });

    test("should use multiple choice mode", async ({ page }) => {
      await page.goto("/hiragana");
      await page.waitForSelector('[data-testid="current-kana"]');

      // Switch to multiple choice
      await page.getByTestId("multiple-choice-button").click();
      await expect(page.getByText("Tap to select your answer")).toBeVisible();

      // Select and submit answer
      await page.waitForSelector('[data-testid^="choice-button-"]');
      const firstChoice = page.getByTestId("choice-button-0");
      await firstChoice.click();
      await expect(firstChoice).toHaveClass(/border-\[#d1622b\]/);

      await page.getByRole("button", { name: "Submit" }).click();
      await expect(page.getByText("Correct!").or(page.getByText("Incorrect!"))).toBeVisible();
    });

    test("should validate empty input", async ({ page }) => {
      await page.goto("/hiragana");
      await page.waitForSelector('[data-testid="current-kana"]');

      // Try to submit without input
      await page.getByRole("button", { name: "Submit" }).click();

      // Should show validation error
      await expect(page.getByText("Please enter an answer")).toBeVisible();
    });

    test("should proceed to next card", async ({ page }) => {
      await page.goto("/hiragana");
      await page.waitForSelector('[data-testid="current-kana"]');

      // Answer current card
      await page.getByPlaceholder("Type romaji equivalent...").fill("a");
      await page.getByRole("button", { name: "Submit" }).click();
      await expect(page.getByText("Correct!").or(page.getByText("Incorrect!"))).toBeVisible();

      // Go to next card
      await page.getByRole("button", { name: "Next Card" }).click();

      // Should show new card
      await expect(page.getByText("Correct!")).not.toBeVisible();
      await expect(page.getByText("Incorrect!")).not.toBeVisible();
      await expect(page.getByPlaceholder("Type romaji equivalent...")).toBeVisible();
    });

    test("should work on mobile devices", async ({ page }) => {
      await page.setViewportSize(devices["iPhone 12"].viewport);

      await page.goto("/hiragana");
      await page.waitForSelector('[data-testid="current-kana"]');

      // Test touch interactions
      await page.getByPlaceholder("Type romaji equivalent...").fill("a");
      await page.getByRole("button", { name: "Submit" }).tap();
      await expect(page.getByText("Correct!").or(page.getByText("Incorrect!"))).toBeVisible();

      // Test mode switching on mobile
      await page.getByTestId("multiple-choice-button").tap();
      await expect(page.getByText("Tap to select your answer")).toBeVisible();
    });
  });

  test.describe("Dashboard Features", () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test.beforeEach(async ({ page }) => {
      // Login and generate some practice data
      await page.goto("/");
      await page.getByRole("button", { name: "Sign In" }).click();
      await page.waitForURL(/.*signin.*/);
      await page.fill('input[name="email"]', "test@sakumari.local");
      await page.fill('input[name="password"]', "TestPassword123!");
      await page.click('form[action*="credentials"] button[type="submit"]');
      await page.waitForURL("/");

      // Generate practice data
      await page.goto("/hiragana");
      await page.waitForSelector('[data-testid="current-kana"]');

      for (let i = 0; i < 3; i++) {
        await page.getByPlaceholder("Type romaji equivalent...").fill("a");
        await page.getByRole("button", { name: "Submit" }).click();
        await expect(page.getByText("Correct!").or(page.getByText("Incorrect!"))).toBeVisible();
        await page.getByRole("button", { name: "Next Card" }).click();
      }
    });

    test("should display progress statistics", async ({ page }) => {
      await page.goto("/dashboard");

      await expect(page.getByText("Dashboard")).toBeVisible();
      await expect(page.getByText("Your Progress")).toBeVisible();
      await expect(page.getByText("Total Characters Practiced")).toBeVisible();
      await expect(page.getByText("Average Accuracy")).toBeVisible();
      await expect(page.getByText("Total Attempts")).toBeVisible();
      await expect(page.getByText("Character Progress")).toBeVisible();
    });

    test("should filter by kana type", async ({ page }) => {
      await page.goto("/dashboard");

      // Should show filter buttons
      await expect(page.getByTestId("filter-all")).toBeVisible();
      await expect(page.getByTestId("filter-hiragana")).toBeVisible();
      await expect(page.getByTestId("filter-katakana")).toBeVisible();

      // Test filters
      await page.getByTestId("filter-hiragana").click();
      await expect(page.getByTestId("filter-hiragana")).toHaveClass(/bg-\[#d1622b\]/);

      await page.getByTestId("filter-katakana").click();
      await expect(page.getByTestId("filter-katakana")).toHaveClass(/bg-\[#d1622b\]/);

      await page.getByTestId("filter-all").click();
      await expect(page.getByTestId("filter-all")).toHaveClass(/bg-\[#d1622b\]/);
    });

    test("should sort character data", async ({ page }) => {
      await page.goto("/dashboard");

      // Should show sortable headers
      await expect(page.getByTestId("sort-character")).toBeVisible();
      await expect(page.getByTestId("sort-romaji")).toBeVisible();
      await expect(page.getByTestId("sort-attempts")).toBeVisible();
      await expect(page.getByTestId("sort-correct-attempts")).toBeVisible();
      await expect(page.getByTestId("sort-accuracy")).toBeVisible();

      // Test sorting
      await page.getByTestId("sort-character").click();
      await expect(page.getByTestId("sort-character").getByText("↑").or(page.getByTestId("sort-character").getByText("↓"))).toBeVisible();

      // Test reverse sort
      await page.getByTestId("sort-character").click();
      await expect(page.getByTestId("sort-character").getByText("↑").or(page.getByTestId("sort-character").getByText("↓"))).toBeVisible();
    });

    test("should navigate back to home", async ({ page }) => {
      await page.goto("/dashboard");

      await expect(page.getByText("Back to Home")).toBeVisible();
      await page.getByText("Back to Home").click();

      await page.waitForURL("/");
      await expect(page.getByText("🌸 SakuMari 🌸")).toBeVisible();
    });

    test("should be responsive on mobile", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto("/dashboard");

      await expect(page.getByText("Dashboard")).toBeVisible();
      await expect(page.getByText("Your Progress")).toBeVisible();

      // Filter buttons should work on mobile
      await expect(page.getByTestId("filter-all")).toBeVisible();
      await page.getByTestId("filter-hiragana").click();
      await expect(page.getByTestId("filter-hiragana")).toHaveClass(/bg-\[#d1622b\]/);
    });
  });
});