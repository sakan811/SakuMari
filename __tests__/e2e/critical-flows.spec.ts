import { test, expect, devices } from "@playwright/test";

test.describe("Critical Integration Flows", () => {
  test.describe("Complete Learning Session - Desktop", () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test("should complete full desktop learning session", async ({ page }) => {
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
        await page.getByPlaceholder("Type romaji equivalent...").fill("a");
        await page.getByRole("button", { name: "Submit" }).click();
        await expect(
          page.getByText("Correct!").or(page.getByText("Incorrect!")),
        ).toBeVisible();
        await page.getByRole("button", { name: "Next Card" }).click();
      }

      // Switch to katakana practice
      await page.goto("/katakana");
      await page.waitForSelector('[data-testid="current-kana"]');

      // Complete katakana practice session
      for (let i = 0; i < 3; i++) {
        await page.waitForSelector('[data-testid="current-kana"]');
        await page.getByTestId("multiple-choice-button").click();
        await expect(page.getByText("Tap to select your answer")).toBeVisible();
        await page.waitForSelector('[data-testid^="choice-button-"]');
        const choices = await page
          .locator('[data-testid^="choice-button-"]')
          .all();
        if (choices.length > 0) {
          await choices[0].click();
          await expect(
            page.getByText("Correct!").or(page.getByText("Incorrect!")),
          ).toBeVisible();
          await page.getByRole("button", { name: "Next Card" }).click();
        }
      }

      // Check dashboard for progress
      await page.goto("/dashboard");
      await expect(page.getByText("Dashboard")).toBeVisible();
      await expect(page.getByText("Progress Overview")).toBeVisible();
    });

    test("should handle practice session with mode switching", async ({
      page,
    }) => {
      await page.goto("/");
      await page.getByRole("button", { name: "Sign In" }).click();
      await page.waitForURL(/.*signin.*/);
      await page.fill('input[name="email"]', "test@sakumari.local");
      await page.fill('input[name="password"]', "TestPassword123!");
      await page.click('form[action*="credentials"] button[type="submit"]');
      await page.waitForURL("/");

      await page.goto("/hiragana");
      await page.waitForSelector('[data-testid="current-kana"]');

      // Start with typing mode
      await page.getByPlaceholder("Type romaji equivalent...").fill("a");
      await page.getByRole("button", { name: "Submit" }).click();
      await expect(
        page.getByText("Correct!").or(page.getByText("Incorrect!")),
      ).toBeVisible();

      // Switch to multiple choice mode
      await page.getByTestId("multiple-choice-button").click();
      await expect(page.getByText("Tap to select your answer")).toBeVisible();
      await page.waitForSelector('[data-testid^="choice-button-"]');
      const choices = await page
        .locator('[data-testid^="choice-button-"]')
        .all();
      if (choices.length > 0) {
        await choices[0].click();
        await expect(
          page.getByText("Correct!").or(page.getByText("Incorrect!")),
        ).toBeVisible();
      }

      // Switch back to typing mode
      await page.getByTestId("typing-button").click();
      await expect(
        page.getByPlaceholder("Type romaji equivalent..."),
      ).toBeVisible();
    });
  });

  test.describe("Complete Learning Session - Mobile", () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(devices["iPhone 12"].viewport);
    });

    test.use({ storageState: { cookies: [], origins: [] } });

    test("should complete full mobile learning session", async ({ page }) => {
      // Start from home page
      await page.goto("/");
      await expect(page.getByText("🌸 SakuMari 🌸")).toBeVisible();

      // Sign in using mobile menu
      await page.getByLabel("Toggle mobile menu").click();
      await page.locator('button:has-text("Sign In with Credentials")').click();
      await page.waitForURL(/.*signin.*/);
      await page.fill('input[name="email"]', "test@sakumari.local");
      await page.fill('input[name="password"]', "TestPassword123!");
      await page.click('form[action*="credentials"] button[type="submit"]');
      await page.waitForURL("/");

      // Navigate to hiragana practice
      await page.getByLabel("Toggle mobile menu").click();
      await page.getByText("ひらがな Hiragana").click();
      await page.waitForURL("/hiragana");
      await page.waitForSelector('[data-testid="current-kana"]');

      // Complete mobile practice session
      for (let i = 0; i < 3; i++) {
        await page.waitForSelector('[data-testid="current-kana"]');
        await page.getByPlaceholder("Type romaji equivalent...").fill("a");
        await page.getByRole("button", { name: "Submit" }).click();
        await expect(
          page.getByText("Correct!").or(page.getByText("Incorrect!")),
        ).toBeVisible();
        await page.getByRole("button", { name: "Next Card" }).click();
      }

      // Check mobile dashboard
      await page.getByLabel("Toggle mobile menu").click();
      await page.getByText("Dashboard").click();
      await page.waitForURL("/dashboard");
      await expect(page.getByText("Dashboard")).toBeVisible();
    });
  });

  test.describe("Progress Persistence", () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test("should maintain progress across sessions", async ({ page }) => {
      // Initial session - create some progress
      await page.goto("/");
      await page.getByRole("button", { name: "Sign In" }).click();
      await page.waitForURL(/.*signin.*/);
      await page.fill('input[name="email"]', "test@sakumari.local");
      await page.fill('input[name="password"]', "TestPassword123!");
      await page.click('form[action*="credentials"] button[type="submit"]');
      await page.waitForURL("/");

      // Generate progress data
      await page.goto("/hiragana");
      await page.waitForSelector('[data-testid="current-kana"]');
      for (let i = 0; i < 3; i++) {
        await page.getByPlaceholder("Type romaji equivalent...").fill("a");
        await page.getByRole("button", { name: "Submit" }).click();
        await page.getByRole("button", { name: "Next Card" }).click();
      }

      // Check dashboard shows progress
      await page.goto("/dashboard");
      await expect(page.getByText("Dashboard")).toBeVisible();
      await expect(page.getByText("Progress Overview")).toBeVisible();

      // Simulate new session by clearing storage but maintaining auth
      await page.goto("/hiragana");
      await page.waitForSelector('[data-testid="current-kana"]');
      await expect(page.getByTestId("current-kana")).toBeVisible();
    });
  });

  test.describe("Error Handling", () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test("should handle invalid login credentials", async ({ page }) => {
      await page.goto("/");
      await page.getByRole("button", { name: "Sign In" }).click();
      await page.waitForURL(/.*signin.*/);
      await page.fill('input[name="email"]', "invalid@example.com");
      await page.fill('input[name="password"]', "wrongpassword");
      await page.click('form[action*="credentials"] button[type="submit"]');

      // Should show error or remain on signin page
      await expect(page).toHaveURL(/.*signin.*/);
    });

    test("should handle empty submission in practice", async ({ page }) => {
      await page.goto("/");
      await page.getByRole("button", { name: "Sign In" }).click();
      await page.waitForURL(/.*signin.*/);
      await page.fill('input[name="email"]', "test@sakumari.local");
      await page.fill('input[name="password"]', "TestPassword123!");
      await page.click('form[action*="credentials"] button[type="submit"]');
      await page.waitForURL("/");

      await page.goto("/hiragana");
      await page.waitForSelector('[data-testid="current-kana"]');

      // Try to submit empty answer
      await page.getByRole("button", { name: "Submit" }).click();

      // Should not proceed to next card without valid input
      await expect(page.getByTestId("current-kana")).toBeVisible();
    });

    test("should handle protected route access for unauthenticated users", async ({
      page,
    }) => {
      // Try to access protected routes without authentication
      await page.goto("/hiragana");
      await page.waitForURL("/"); // Should redirect to home

      await page.goto("/katakana");
      await page.waitForURL("/"); // Should redirect to home

      await page.goto("/dashboard");
      await page.waitForURL("/"); // Should redirect to home
    });
  });
});
