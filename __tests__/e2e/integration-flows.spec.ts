import { test, expect, devices } from "@playwright/test";

test.describe("Integration Flows", () => {
  test.describe("Complete Learning Session", () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test("should complete full learning session from sign in to progress review", async ({ page }) => {
      // Start from home page
      await page.goto("/");
      await expect(page.getByText("🌸 SakuMari 🌸")).toBeVisible();

      // Sign in
      await page.getByRole("button", { name: "Sign In" }).click();
      await page.waitForURL(/.*signin.*/);
      await page.fill('input[name="email"]', "test@sakumari.local");
      await page.fill('input[name="password"]', "TestPassword123!");
      await page.click('form[action*="credentials"] button[type="submit"]');
      await page.waitForURL("/");

      // Navigate to hiragana practice
      await page.getByText("ひらがな Hiragana").click();
      await page.waitForURL("/hiragana");
      await page.waitForSelector('[data-testid="current-kana"]');

      // Complete practice session
      for (let i = 0; i < 5; i++) {
        await page.waitForSelector('[data-testid="current-kana"]');

        // Practice in typing mode
        await page.getByPlaceholder("Type romaji equivalent...").fill("a");
        await page.getByRole("button", { name: "Submit" }).click();
        await expect(page.getByText("Correct!").or(page.getByText("Incorrect!"))).toBeVisible();

        // Go to next card
        await page.getByRole("button", { name: "Next Card" }).click();
      }

      // Switch to katakana practice
      await page.goto("/katakana");
      await page.waitForSelector('[data-testid="current-kana"]');

      // Complete katakana practice session
      for (let i = 0; i < 3; i++) {
        await page.waitForSelector('[data-testid="current-kana"]');

        // Practice in multiple choice mode
        await page.getByTestId("multiple-choice-button").click();
        await expect(page.getByText("Tap to select your answer")).toBeVisible();

        await page.waitForSelector('[data-testid^="choice-button-"]');
        const firstChoice = page.getByTestId("choice-button-0");
        await firstChoice.click();
        await page.getByRole("button", { name: "Submit" }).click();
        await expect(page.getByText("Correct!").or(page.getByText("Incorrect!"))).toBeVisible();

        // Go to next card
        await page.getByRole("button", { name: "Next Card" }).click();

        // Switch back to typing mode for next iteration
        await page.getByTestId("typing-button").click();
      }

      // Check dashboard for progress
      await page.goto("/dashboard");
      await expect(page.getByText("Dashboard")).toBeVisible();
      await expect(page.getByText("Your Progress")).toBeVisible();

      // Verify practice data is reflected
      await expect(page.getByText("Total Characters Practiced")).toBeVisible();
      await expect(page.getByText("Total Attempts")).toBeVisible();

      // Test filtering to see hiragana progress
      await page.getByTestId("filter-hiragana").click();
      await expect(page.getByTestId("filter-hiragana")).toHaveClass(/bg-\[#d1622b\]/);

      // Test filtering to see katakana progress
      await page.getByTestId("filter-katakana").click();
      await expect(page.getByTestId("filter-katakana")).toHaveClass(/bg-\[#d1622b\]/);
    });

    test("should handle mixed practice modes across different character sets", async ({ page }) => {
      // Login and start practice
      await page.goto("/");
      await page.getByRole("button", { name: "Sign In" }).click();
      await page.waitForURL(/.*signin.*/);
      await page.fill('input[name="email"]', "test@sakumari.local");
      await page.fill('input[name="password"]', "TestPassword123!");
      await page.click('form[action*="credentials"] button[type="submit"]');
      await page.waitForURL("/");

      // Practice hiragana in typing mode
      await page.goto("/hiragana");
      await page.waitForSelector('[data-testid="current-kana"]');

      for (let i = 0; i < 3; i++) {
        await page.getByPlaceholder("Type romaji equivalent...").fill("a");
        await page.getByRole("button", { name: "Submit" }).click();
        await expect(page.getByText("Correct!").or(page.getByText("Incorrect!"))).toBeVisible();
        await page.getByRole("button", { name: "Next Card" }).click();
      }

      // Switch to katakana and use multiple choice
      await page.goto("/katakana");
      await page.waitForSelector('[data-testid="current-kana"]');

      await page.getByTestId("multiple-choice-button").click();
      for (let i = 0; i < 3; i++) {
        await page.waitForSelector('[data-testid^="choice-button-"]');
        const firstChoice = page.getByTestId("choice-button-0");
        await firstChoice.click();
        await page.getByRole("button", { name: "Submit" }).click();
        await expect(page.getByText("Correct!").or(page.getByText("Incorrect!"))).toBeVisible();
        await page.getByRole("button", { name: "Next Card" }).click();
      }

      // Return to hiragana and continue with typing
      await page.goto("/hiragana");
      await page.waitForSelector('[data-testid="current-kana"]');

      for (let i = 0; i < 2; i++) {
        await page.getByPlaceholder("Type romaji equivalent...").fill("i");
        await page.getByRole("button", { name: "Submit" }).click();
        await expect(page.getByText("Correct!").or(page.getByText("Incorrect!"))).toBeVisible();
        await page.getByRole("button", { name: "Next Card" }).click();
      }

      // Verify all progress is tracked
      await page.goto("/dashboard");
      await expect(page.getByText("Dashboard")).toBeVisible();

      // Should show combined progress
      await expect(page.getByText("Total Characters Practiced")).toBeVisible();
      await expect(page.getByText("Total Attempts")).toBeVisible();
    });
  });

  test.describe("Mobile Learning Journey", () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(devices["iPhone 12"].viewport);
    });

    test("should complete mobile learning session with touch interactions", async ({ page }) => {
      // Mobile sign in
      await page.goto("/");
      await expect(page.getByText("🌸 SakuMari 🌸")).toBeVisible();

      // Open mobile menu and sign in
      await page.getByLabel("Toggle mobile menu").tap();
      await page.locator('button:has-text("Sign In with Credentials")').tap();
      await page.waitForURL(/.*signin.*/);
      await page.fill('input[name="email"]', "test@sakumari.local");
      await page.fill('input[name="password"]', "TestPassword123!");
      await page.click('form[action*="credentials"] button[type="submit"]');
      await page.waitForURL("/");

      // Navigate to practice via mobile menu
      await page.getByLabel("Toggle mobile menu").tap();
      await page.getByText("ひらがな Hiragana").tap();
      await page.waitForURL("/hiragana");
      await page.waitForSelector('[data-testid="current-kana"]');

      // Mobile practice session with touch
      for (let i = 0; i < 4; i++) {
        await page.waitForSelector('[data-testid="current-kana"]');

        // Touch typing practice
        await page.getByPlaceholder("Type romaji equivalent...").fill("a");
        await page.getByRole("button", { name: "Submit" }).tap();
        await expect(page.getByText("Correct!").or(page.getByText("Incorrect!"))).toBeVisible();

        // Touch next card
        await page.getByRole("button", { name: "Next Card" }).tap();
      }

      // Switch to multiple choice with touch
      await page.getByTestId("multiple-choice-button").tap();
      for (let i = 0; i < 3; i++) {
        await page.waitForSelector('[data-testid^="choice-button-"]');
        const firstChoice = page.getByTestId("choice-button-0");
        await firstChoice.tap();
        await page.getByRole("button", { name: "Submit" }).tap();
        await expect(page.getByText("Correct!").or(page.getByText("Incorrect!"))).toBeVisible();
        await page.getByRole("button", { name: "Next Card" }).tap();
      }

      // Navigate to dashboard via mobile menu
      await page.getByLabel("Toggle mobile menu").tap();
      await page.getByText("📊 Dashboard").tap();
      await page.waitForURL("/dashboard");

      // Verify mobile dashboard
      await expect(page.getByText("Dashboard")).toBeVisible();
      await expect(page.getByText("Your Progress")).toBeVisible();

      // Test mobile filtering
      await page.getByTestId("filter-hiragana").tap();
      await expect(page.getByTestId("filter-hiragana")).toHaveClass(/bg-\[#d1622b\]/);

      // Test mobile sorting
      await page.getByTestId("sort-character").tap();
      await expect(page.getByTestId("sort-character").getByText("↑").or(page.getByTestId("sort-character").getByText("↓"))).toBeVisible();
    });

    test("should handle orientation changes during learning session", async ({ page }) => {
      // Login in portrait
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto("/");
      await page.getByRole("button", { name: "Sign In" }).click();
      await page.waitForURL(/.*signin.*/);
      await page.fill('input[name="email"]', "test@sakumari.local");
      await page.fill('input[name="password"]', "TestPassword123!");
      await page.click('form[action*="credentials"] button[type="submit"]');
      await page.waitForURL("/");

      // Start practice in portrait
      await page.goto("/hiragana");
      await page.waitForSelector('[data-testid="current-kana"]');

      // Complete some cards in portrait
      for (let i = 0; i < 2; i++) {
        await page.getByPlaceholder("Type romaji equivalent...").fill("a");
        await page.getByRole("button", { name: "Submit" }).click();
        await expect(page.getByText("Correct!").or(page.getByText("Incorrect!"))).toBeVisible();
        await page.getByRole("button", { name: "Next Card" }).click();
      }

      // Switch to landscape during practice
      await page.setViewportSize({ width: 844, height: 390 });

      // Continue practice in landscape
      for (let i = 0; i < 2; i++) {
        await page.waitForSelector('[data-testid="current-kana"]');
        await page.getByPlaceholder("Type romaji equivalent...").fill("i");
        await page.getByRole("button", { name: "Submit" }).click();
        await expect(page.getByText("Correct!").or(page.getByText("Incorrect!"))).toBeVisible();
        await page.getByRole("button", { name: "Next Card" }).click();
      }

      // Switch to dashboard in landscape
      await page.goto("/dashboard");
      await expect(page.getByText("Dashboard")).toBeVisible();

      // Test dashboard interactions in landscape
      await page.getByTestId("filter-hiragana").click();
      await expect(page.getByTestId("filter-hiragana")).toHaveClass(/bg-\[#d1622b\]/);

      // Switch back to portrait
      await page.setViewportSize({ width: 375, height: 667 });
      await expect(page.getByText("Dashboard")).toBeVisible();

      // Continue dashboard interactions in portrait
      await page.getByTestId("filter-katakana").click();
      await expect(page.getByTestId("filter-katakana")).toHaveClass(/bg-\[#d1622b\]/);
    });
  });

  test.describe("Cross-Device Progress Sync", () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test("should maintain progress across different device sizes", async ({ page }) => {
      // Start on desktop
      await page.goto("/");
      await page.getByRole("button", { name: "Sign In" }).click();
      await page.waitForURL(/.*signin.*/);
      await page.fill('input[name="email"]', "test@sakumari.local");
      await page.fill('input[name="password"]', "TestPassword123!");
      await page.click('form[action*="credentials"] button[type="submit"]');
      await page.waitForURL("/");

      // Practice on desktop
      await page.goto("/hiragana");
      await page.waitForSelector('[data-testid="current-kana"]');

      for (let i = 0; i < 3; i++) {
        await page.getByPlaceholder("Type romaji equivalent...").fill("a");
        await page.getByRole("button", { name: "Submit" }).click();
        await expect(page.getByText("Correct!").or(page.getByText("Incorrect!"))).toBeVisible();
        await page.getByRole("button", { name: "Next Card" }).click();
      }

      // Check desktop dashboard
      await page.goto("/dashboard");
      await expect(page.getByText("Dashboard")).toBeVisible();
      await expect(page.getByText("Total Attempts")).toBeVisible();

      // Switch to mobile mid-session
      await page.setViewportSize({ width: 375, height: 667 });

      // Continue practice on mobile
      await page.goto("/hiragana");
      await page.waitForSelector('[data-testid="current-kana"]');

      for (let i = 0; i < 3; i++) {
        await page.getByPlaceholder("Type romaji equivalent...").fill("i");
        await page.getByRole("button", { name: "Submit" }).tap();
        await expect(page.getByText("Correct!").or(page.getByText("Incorrect!"))).toBeVisible();
        await page.getByRole("button", { name: "Next Card" }).tap();
      }

      // Check mobile dashboard
      await page.goto("/dashboard");
      await expect(page.getByText("Dashboard")).toBeVisible();

      // Verify progress is maintained
      await page.getByTestId("filter-hiragana").click();
      await expect(page.getByTestId("filter-hiragana")).toHaveClass(/bg-\[#d1622b\]/);

      // Should show updated progress
      await expect(page.getByText("Total Attempts")).toBeVisible();
    });

    test("should handle practice session interruption and resumption", async ({ page }) => {
      // Login and start session
      await page.goto("/");
      await page.getByRole("button", { name: "Sign In" }).click();
      await page.waitForURL(/.*signin.*/);
      await page.fill('input[name="email"]', "test@sakumari.local");
      await page.fill('input[name="password"]', "TestPassword123!");
      await page.click('form[action*="credentials"] button[type="submit"]');
      await page.waitForURL("/");

      // Start hiragana practice
      await page.goto("/hiragana");
      await page.waitForSelector('[data-testid="current-kana"]');

      // Complete partial session
      for (let i = 0; i < 2; i++) {
        await page.getByPlaceholder("Type romaji equivalent...").fill("a");
        await page.getByRole("button", { name: "Submit" }).click();
        await expect(page.getByText("Correct!").or(page.getByText("Incorrect!"))).toBeVisible();
        await page.getByRole("button", { name: "Next Card" }).click();
      }

      // Navigate away to dashboard (simulate interruption)
      await page.goto("/dashboard");
      await expect(page.getByText("Dashboard")).toBeVisible();

      // Resume practice
      await page.goto("/hiragana");
      await page.waitForSelector('[data-testid="current-kana"]');

      // Continue session
      for (let i = 0; i < 3; i++) {
        await page.getByPlaceholder("Type romaji equivalent...").fill("i");
        await page.getByRole("button", { name: "Submit" }).click();
        await expect(page.getByText("Correct!").or(page.getByText("Incorrect!"))).toBeVisible();
        await page.getByRole("button", { name: "Next Card" }).click();
      }

      // Switch to katakana
      await page.goto("/katakana");
      await page.waitForSelector('[data-testid="current-kana"]');

      // Complete katakana session
      for (let i = 0; i < 2; i++) {
        await page.getByPlaceholder("Type romaji equivalent...").fill("u");
        await page.getByRole("button", { name: "Submit" }).click();
        await expect(page.getByText("Correct!").or(page.getByText("Incorrect!"))).toBeVisible();
        await page.getByRole("button", { name: "Next Card" }).click();
      }

      // Final progress check
      await page.goto("/dashboard");
      await expect(page.getByText("Dashboard")).toBeVisible();

      // Verify all progress is tracked
      await expect(page.getByText("Total Characters Practiced")).toBeVisible();
      await expect(page.getByText("Total Attempts")).toBeVisible();

      // Test filtering shows different character sets
      await page.getByTestId("filter-hiragana").click();
      await expect(page.getByTestId("filter-hiragana")).toHaveClass(/bg-\[#d1622b\]/);

      await page.getByTestId("filter-katakana").click();
      await expect(page.getByTestId("filter-katakana")).toHaveClass(/bg-\[#d1622b\]/);
    });
  });

  test.describe("Multi-Mode Learning Experience", () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test("should switch between learning modes seamlessly", async ({ page }) => {
      // Login
      await page.goto("/");
      await page.getByRole("button", { name: "Sign In" }).click();
      await page.waitForURL(/.*signin.*/);
      await page.fill('input[name="email"]', "test@sakumari.local");
      await page.fill('input[name="password"]', "TestPassword123!");
      await page.click('form[action*="credentials"] button[type="submit"]');
      await page.waitForURL("/");

      // Practice hiragana with multiple modes
      await page.goto("/hiragana");
      await page.waitForSelector('[data-testid="current-kana"]');

      // Start with typing mode
      await page.getByPlaceholder("Type romaji equivalent...").fill("a");
      await page.getByRole("button", { name: "Submit" }).click();
      await expect(page.getByText("Correct!").or(page.getByText("Incorrect!"))).toBeVisible();
      await page.getByRole("button", { name: "Next Card" }).click();

      // Switch to multiple choice
      await page.getByTestId("multiple-choice-button").click();
      await page.waitForSelector('[data-testid^="choice-button-"]');
      const firstChoice = page.getByTestId("choice-button-0");
      await firstChoice.click();
      await page.getByRole("button", { name: "Submit" }).click();
      await expect(page.getByText("Correct!").or(page.getByText("Incorrect!"))).toBeVisible();
      await page.getByRole("button", { name: "Next Card" }).click();

      // Switch back to typing
      await page.getByTestId("typing-button").click();
      await page.getByPlaceholder("Type romaji equivalent...").fill("i");
      await page.getByRole("button", { name: "Submit" }).click();
      await expect(page.getByText("Correct!").or(page.getByText("Incorrect!"))).toBeVisible();
      await page.getByRole("button", { name: "Next Card" }).click();

      // Navigate to katakana and continue mixed mode practice
      await page.goto("/katakana");
      await page.waitForSelector('[data-testid="current-kana"]');

      // Use multiple choice first
      await page.getByTestId("multiple-choice-button").click();
      await page.waitForSelector('[data-testid^="choice-button-"]');
      const katakanaChoice = page.getByTestId("choice-button-0");
      await katakanaChoice.click();
      await page.getByRole("button", { name: "Submit" }).click();
      await expect(page.getByText("Correct!").or(page.getByText("Incorrect!"))).toBeVisible();
      await page.getByRole("button", { name: "Next Card" }).click();

      // Switch to typing
      await page.getByTestId("typing-button").click();
      await page.getByPlaceholder("Type romaji equivalent...").fill("a");
      await page.getByRole("button", { name: "Submit" }).click();
      await expect(page.getByText("Correct!").or(page.getByText("Incorrect!"))).toBeVisible();

      // Check dashboard to verify all progress tracked
      await page.goto("/dashboard");
      await expect(page.getByText("Dashboard")).toBeVisible();
      await expect(page.getByText("Total Attempts")).toBeVisible();
    });
  });
});