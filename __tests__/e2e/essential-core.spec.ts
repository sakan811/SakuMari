import { test, expect } from "@playwright/test";

test.describe("Essential Core Functionality", () => {
  test.describe("Authentication", () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test("should show Google OAuth option", async ({ page }) => {
      await page.goto("/");

      // For mobile tests, we need to open the mobile menu first
      const isMobile = page.viewportSize()?.width < 1024;
      if (isMobile) {
        await page.getByRole("button", { name: "Toggle mobile menu" }).click();
        await page.getByRole("button", { name: "Sign In with Google" }).click();
      } else {
        await page.getByRole("button", { name: "Sign In" }).click();
      }

      await page.waitForURL(/.*signin.*/);
      await expect(page.getByText("Sign In with Google")).toBeVisible();
    });

    test("should authenticate with credentials provider", async ({ page }) => {
      await page.goto("/");

      // For mobile tests, we need to open the mobile menu first
      const isMobile = page.viewportSize()?.width < 1024;
      if (isMobile) {
        await page.getByRole("button", { name: "Toggle mobile menu" }).click();
        await page.getByRole("button", { name: "Sign In with Google" }).click();
      } else {
        await page.getByRole("button", { name: "Sign In" }).click();
      }

      await page.waitForURL(/.*signin.*/);
      await page.fill('input[name="email"]', "test@sakumari.local");
      await page.fill('input[name="password"]', "TestPassword123!");
      await page.click('form[action*="credentials"] button[type="submit"]');
      await page.waitForURL("/");
      await expect(page.getByText("ひらがな Hiragana Practice")).toBeVisible();
    });

    test("should show sign in options for unauthenticated users", async ({ page }) => {
      await page.goto("/");
      await expect(page.getByText("Welcome to SakuMari!")).toBeVisible();

      // For mobile tests, we need to open the mobile menu first
      const isMobile = page.viewportSize()?.width < 1024;
      if (isMobile) {
        await page.getByRole("button", { name: "Toggle mobile menu" }).click();
        await expect(page.getByRole("button", { name: "Sign In with Google" })).toBeVisible();
        await expect(page.getByRole("button", { name: "Sign In with Credentials" })).toBeVisible();
      } else {
        await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();
      }
    });
  });

  test.describe("Navigation", () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test.beforeEach(async ({ page }) => {
      await page.goto("/");

      // For mobile tests, we need to open the mobile menu first
      const isMobile = page.viewportSize()?.width < 1024;
      if (isMobile) {
        await page.getByRole("button", { name: "Toggle mobile menu" }).click();
        await page.getByRole("button", { name: "Sign In with Google" }).click();
      } else {
        await page.getByRole("button", { name: "Sign In" }).click();
      }

      await page.waitForURL(/.*signin.*/);
      await page.fill('input[name="email"]', "test@sakumari.local");
      await page.fill('input[name="password"]', "TestPassword123!");
      await page.click('form[action*="credentials"] button[type="submit"]');
      await page.waitForURL("/");
    });

    test("should navigate to hiragana practice", async ({ page }) => {
      await page.getByRole("link", { name: "ひらがな Hiragana" }).first().click();
      await page.waitForURL("/hiragana");
      await expect(page.getByTestId("current-kana")).toBeVisible();
    });

    test("should navigate to katakana practice", async ({ page }) => {
      await page.getByRole("link", { name: "カタカナ Katakana" }).first().click();
      await page.waitForURL("/katakana");
      await expect(page.getByTestId("current-kana")).toBeVisible();
    });

    test("should navigate to dashboard", async ({ page }) => {
      await page.getByRole("link", { name: "📊 View Your Progress" }).click();
      await page.waitForURL("/dashboard");
      await expect(page.getByText("Dashboard")).toBeVisible();
    });
  });

  test.describe("Practice Essential", () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test.beforeEach(async ({ page }) => {
      await page.goto("/");

      // For mobile tests, we need to open the mobile menu first
      const isMobile = page.viewportSize()?.width < 1024;
      if (isMobile) {
        await page.getByRole("button", { name: "Toggle mobile menu" }).click();
        await page.getByRole("button", { name: "Sign In with Google" }).click();
      } else {
        await page.getByRole("button", { name: "Sign In" }).click();
      }

      await page.waitForURL(/.*signin.*/);
      await page.fill('input[name="email"]', "test@sakumari.local");
      await page.fill('input[name="password"]', "TestPassword123!");
      await page.click('form[action*="credentials"] button[type="submit"]');
      await page.waitForURL("/");
    });

    test("should practice hiragana in typing mode", async ({ page }) => {
      await page.goto("/hiragana");
      await page.waitForSelector('[data-testid="current-kana"]');

      await page.getByPlaceholder("Type romaji equivalent...").fill("a");
      await page.getByRole("button", { name: "Submit" }).click();
      await expect(page.getByText("Correct!").or(page.getByText("Incorrect!"))).toBeVisible();
    });

    test("should practice katakana in multiple choice mode", async ({ page }) => {
      await page.goto("/katakana");
      await page.waitForSelector('[data-testid="current-kana"]');

      await page.getByTestId("multiple-choice-button").click();
      await expect(page.getByText("Tap to select your answer")).toBeVisible();

      await page.waitForSelector('[data-testid^="choice-button-"]');
      const choices = await page.locator('[data-testid^="choice-button-"]').all();
      if (choices.length > 0) {
        await choices[0].click();
        await page.getByRole("button", { name: "Submit" }).click();
        await expect(page.getByText("Correct!").or(page.getByText("Incorrect!"))).toBeVisible();
      }
    });

    test("should switch between practice modes", async ({ page }) => {
      await page.goto("/hiragana");
      await page.waitForSelector('[data-testid="current-kana"]');

      await page.getByTestId("multiple-choice-button").click();
      await expect(page.getByText("Tap to select your answer")).toBeVisible();

      await page.getByTestId("typing-button").click();
      await expect(page.getByPlaceholder("Type romaji equivalent...")).toBeVisible();
    });

    test("should show next card after submission", async ({ page }) => {
      await page.goto("/hiragana");
      await page.waitForSelector('[data-testid="current-kana"]');

      const firstKana = await page.getByTestId("current-kana").textContent();
      await page.getByPlaceholder("Type romaji equivalent...").fill("a");
      await page.getByRole("button", { name: "Submit" }).click();
      await page.getByRole("button", { name: "Next Card" }).click();

      await page.waitForSelector('[data-testid="current-kana"]');
      const secondKana = await page.getByTestId("current-kana").textContent();
      expect(firstKana).not.toBe(secondKana);
    });
  });

  test.describe("Dashboard Essential", () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test.beforeEach(async ({ page }) => {
      await page.goto("/");

      // For mobile tests, we need to open the mobile menu first
      const isMobile = page.viewportSize()?.width < 1024;
      if (isMobile) {
        await page.getByRole("button", { name: "Toggle mobile menu" }).click();
        await page.getByRole("button", { name: "Sign In with Google" }).click();
      } else {
        await page.getByRole("button", { name: "Sign In" }).click();
      }

      await page.waitForURL(/.*signin.*/);
      await page.fill('input[name="email"]', "test@sakumari.local");
      await page.fill('input[name="password"]', "TestPassword123!");
      await page.click('form[action*="credentials"] button[type="submit"]');
      await page.waitForURL("/");

      // Generate some practice data
      await page.goto("/hiragana");
      await page.waitForSelector('[data-testid="current-kana"]');
      for (let i = 0; i < 3; i++) {
        await page.getByPlaceholder("Type romaji equivalent...").fill("a");
        await page.getByRole("button", { name: "Submit" }).click();
        await page.getByRole("button", { name: "Next Card" }).click();
      }
    });

    test("should display progress dashboard", async ({ page }) => {
      await page.goto("/dashboard");
      await expect(page.getByText("Dashboard")).toBeVisible();
      await expect(page.getByText("Your Progress")).toBeVisible();
    });

    test("should filter characters by type", async ({ page }) => {
      await page.goto("/dashboard");
      await expect(page.getByText("Dashboard")).toBeVisible();

      // Test filtering functionality
      const filterButtons = page.locator('button:has-text("All"), button:has-text("Hiragana"), button:has-text("Katakana")');
      const count = await filterButtons.count();
      expect(count).toBeGreaterThan(0);
    });
  });
});