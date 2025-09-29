import { test, expect, devices } from "@playwright/test";

test.describe("Mobile Responsive Features", () => {
  test.describe("Mobile Navigation", () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(devices["iPhone 12"].viewport);
    });

    test("should show mobile menu button on small screens", async ({ page }) => {
      await page.goto("/");

      const mobileMenuButton = page.getByLabel("Toggle mobile menu");
      await expect(mobileMenuButton).toBeVisible();
      await expect(mobileMenuButton).toHaveAttribute("aria-label", "Toggle mobile menu");
    });

    test("should open and close mobile menu with proper icons", async ({ page }) => {
      await page.goto("/");

      const mobileMenuButton = page.getByLabel("Toggle mobile menu");

      // Should show hamburger icon when closed
      await expect(mobileMenuButton.locator('path[d*="M4 6h16M4 12h16M4 18h16"]')).toBeVisible();

      // Click to open menu
      await mobileMenuButton.click();

      // Should show X icon when open
      await expect(mobileMenuButton.locator('path[d*="M6 18L18 6M6 6l12 12"]')).toBeVisible();

      // Click to close menu
      await mobileMenuButton.click();

      // Should show hamburger icon again
      await expect(mobileMenuButton.locator('path[d*="M4 6h16M4 12h16M4 18h16"]')).toBeVisible();
    });

    test("should show sign in options in mobile menu for unauthenticated users", async ({ page }) => {
      await page.goto("/");

      // Open mobile menu
      await page.getByLabel("Toggle mobile menu").click();

      // Should show sign in options
      await expect(page.locator('button:has-text("Sign In with Google")')).toBeVisible();
      await expect(page.locator('button:has-text("Sign In with Credentials")')).toBeVisible();
      await expect(page.getByText("or")).toBeVisible();
    });

    test("should close mobile menu when clicking outside", async ({ page }) => {
      await page.goto("/");

      // Open mobile menu
      await page.getByLabel("Toggle mobile menu").click();
      await expect(page.locator('button:has-text("Sign In with Google")')).toBeVisible();

      // Click outside menu area
      await page.locator("body").click({ position: { x: 10, y: 10 } });

      // Menu should be closed
      await expect(page.locator('button:has-text("Sign In with Google")')).not.toBeVisible();
    });

    test("should show navigation links for authenticated users", async ({ page }) => {
      // Login first
      await page.goto("/");
      await page.getByRole("button", { name: "Sign In" }).click();
      await page.waitForURL(/.*signin.*/);
      await page.fill('input[name="email"]', "test@sakumari.local");
      await page.fill('input[name="password"]', "TestPassword123!");
      await page.click('form[action*="credentials"] button[type="submit"]');
      await page.waitForURL("/");

      // Open mobile menu
      await page.getByLabel("Toggle mobile menu").click();

      // Should show navigation links
      await expect(page.getByText("ひらがな Hiragana")).toBeVisible();
      await expect(page.getByText("カタカナ Katakana")).toBeVisible();
      await expect(page.getByText("📊 Dashboard")).toBeVisible();
      await expect(page.getByText("Test User")).toBeVisible();
      await expect(page.getByText("Sign Out")).toBeVisible();
    });

    test("should navigate from mobile menu and close automatically", async ({ page }) => {
      // Login first
      await page.goto("/");
      await page.getByRole("button", { name: "Sign In" }).click();
      await page.waitForURL(/.*signin.*/);
      await page.fill('input[name="email"]', "test@sakumari.local");
      await page.fill('input[name="password"]', "TestPassword123!");
      await page.click('form[action*="credentials"] button[type="submit"]');
      await page.waitForURL("/");

      // Open mobile menu
      await page.getByLabel("Toggle mobile menu").click();
      await expect(page.getByText("ひらがな Hiragana")).toBeVisible();

      // Navigate to dashboard
      await page.getByText("📊 Dashboard").click();
      await page.waitForURL("/dashboard");

      // Mobile menu should be closed
      await expect(page.getByText("ひらがな Hiragana")).not.toBeVisible();
    });
  });

  test.describe("Touch Interactions", () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(devices["iPhone 12"].viewport);

      // Login for touch tests
      await page.goto("/");
      await page.getByRole("button", { name: "Sign In" }).click();
      await page.waitForURL(/.*signin.*/);
      await page.fill('input[name="email"]', "test@sakumari.local");
      await page.fill('input[name="password"]', "TestPassword123!");
      await page.click('form[action*="credentials"] button[type="submit"]');
      await page.waitForURL("/");
    });

    test("should handle touch input in typing mode", async ({ page }) => {
      await page.goto("/hiragana");
      await page.waitForSelector('[data-testid="current-kana"]');

      // Type using touch
      const input = page.getByPlaceholder("Type romaji equivalent...");
      await input.fill("a");
      await expect(input).toHaveValue("a");

      // Submit via touch
      await page.getByRole("button", { name: "Submit" }).tap();
      await expect(page.getByText("Correct!").or(page.getByText("Incorrect!"))).toBeVisible();
    });

    test("should handle touch selection in multiple choice mode", async ({ page }) => {
      await page.goto("/hiragana");
      await page.waitForSelector('[data-testid="current-kana"]');

      // Switch to multiple choice
      await page.getByTestId("multiple-choice-button").tap();
      await expect(page.getByText("Tap to select your answer")).toBeVisible();

      // Select choice with touch
      await page.waitForSelector('[data-testid^="choice-button-"]');
      const firstChoice = page.getByTestId("choice-button-0");
      await firstChoice.tap();
      await expect(firstChoice).toHaveClass(/border-\[#d1622b\]/);

      // Submit with touch
      await page.getByRole("button", { name: "Submit" }).tap();
      await expect(page.getByText("Correct!").or(page.getByText("Incorrect!"))).toBeVisible();
    });

    test("should navigate between cards with touch", async ({ page }) => {
      await page.goto("/hiragana");
      await page.waitForSelector('[data-testid="current-kana"]');

      // Answer current card with touch
      await page.getByPlaceholder("Type romaji equivalent...").fill("a");
      await page.getByRole("button", { name: "Submit" }).tap();
      await expect(page.getByText("Correct!").or(page.getByText("Incorrect!"))).toBeVisible();

      // Go to next card with touch
      await page.getByRole("button", { name: "Next Card" }).tap();

      // Should show new card
      await expect(page.getByText("Correct!")).not.toBeVisible();
      await expect(page.getByText("Incorrect!")).not.toBeVisible();
      await expect(page.getByPlaceholder("Type romaji equivalent...")).toBeVisible();
    });

    test("should handle dashboard interactions with touch", async ({ page }) => {
      // Generate some practice data first
      await page.goto("/hiragana");
      await page.waitForSelector('[data-testid="current-kana"]');

      for (let i = 0; i < 2; i++) {
        await page.getByPlaceholder("Type romaji equivalent...").fill("a");
        await page.getByRole("button", { name: "Submit" }).tap();
        await expect(page.getByText("Correct!").or(page.getByText("Incorrect!"))).toBeVisible();
        await page.getByRole("button", { name: "Next Card" }).tap();
      }

      // Test dashboard touch interactions
      await page.goto("/dashboard");

      // Test filter buttons
      await page.getByTestId("filter-hiragana").tap();
      await expect(page.getByTestId("filter-hiragana")).toHaveClass(/bg-\[#d1622b\]/);

      // Test sorting
      await page.getByTestId("sort-character").tap();
      await expect(page.getByTestId("sort-character").getByText("↑").or(page.getByTestId("sort-character").getByText("↓"))).toBeVisible();
    });
  });

  test.describe("Orientation Handling", () => {
    test.beforeEach(async ({ page }) => {
      // Login for orientation tests
      await page.goto("/");
      await page.getByRole("button", { name: "Sign In" }).click();
      await page.waitForURL(/.*signin.*/);
      await page.fill('input[name="email"]', "test@sakumari.local");
      await page.fill('input[name="password"]', "TestPassword123!");
      await page.click('form[action*="credentials"] button[type="submit"]');
      await page.waitForURL("/");
    });

    test("should handle home page orientation changes", async ({ page }) => {
      // Test portrait mode
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto("/");
      await expect(page.getByText("🌸 SakuMari 🌸")).toBeVisible();

      // Switch to landscape
      await page.setViewportSize({ width: 667, height: 375 });

      // Should still display properly
      await expect(page.getByText("🌸 SakuMari 🌸")).toBeVisible();
      await expect(page.getByText("Japanese Kana Flashcard App")).toBeVisible();

      // Menu button should still be accessible
      const menuButton = page.getByLabel("Toggle mobile menu");
      await expect(menuButton).toBeVisible();
      const menuBox = await menuButton.boundingBox();
      if (menuBox) {
        expect(menuBox.height).toBeGreaterThanOrEqual(44);
      }
    });

    test("should handle flashcard practice orientation changes", async ({ page }) => {
      // Test portrait mode
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto("/hiragana");
      await page.waitForSelector('[data-testid="current-kana"]');

      // Switch to landscape
      await page.setViewportSize({ width: 844, height: 390 }); // iPhone 12 landscape

      // Should still work properly in landscape
      await expect(page.getByTestId("current-kana")).toBeVisible();
      await expect(page.getByPlaceholder("Type romaji equivalent...")).toBeVisible();
      await expect(page.getByRole("button", { name: "Submit" })).toBeVisible();

      // Test interaction in landscape
      await page.getByPlaceholder("Type romaji equivalent...").fill("a");
      await page.getByRole("button", { name: "Submit" }).tap();
      await expect(page.getByText("Correct!").or(page.getByText("Incorrect!"))).toBeVisible();
    });

    test("should handle dashboard orientation changes", async ({ page }) => {
      // Generate some practice data first
      await page.goto("/hiragana");
      await page.waitForSelector('[data-testid="current-kana"]');

      for (let i = 0; i < 2; i++) {
        await page.getByPlaceholder("Type romaji equivalent...").fill("a");
        await page.getByRole("button", { name: "Submit" }).click();
        await expect(page.getByText("Correct!").or(page.getByText("Incorrect!"))).toBeVisible();
        await page.getByRole("button", { name: "Next Card" }).click();
      }

      // Test orientation changes
      await page.goto("/dashboard");

      // Portrait mode
      await page.setViewportSize({ width: 375, height: 667 });
      await expect(page.getByText("Dashboard")).toBeVisible();

      // Landscape mode
      await page.setViewportSize({ width: 667, height: 375 });
      await expect(page.getByText("Dashboard")).toBeVisible();

      // Test interaction in landscape
      await page.getByTestId("filter-hiragana").click();
      await expect(page.getByTestId("filter-hiragana")).toHaveClass(/bg-\[#d1622b\]/);
    });
  });

  test.describe("Mobile Accessibility", () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize(devices["iPhone 12"].viewport);
    });

    test("should have proper touch target sizes for navigation", async ({ page }) => {
      await page.goto("/");

      // Check menu button touch target size
      const menuButton = page.getByLabel("Toggle mobile menu");
      const menuBox = await menuButton.boundingBox();
      expect(menuBox?.width).toBeGreaterThanOrEqual(44);
      expect(menuBox?.height).toBeGreaterThanOrEqual(44);

      // Open menu and check navigation links
      await menuButton.click();
      await page.locator('button:has-text("Sign In with Google")').isVisible();

      // Check sign in button sizes
      const signInButton = page.locator('button:has-text("Sign In with Google")').first();
      const signInBox = await signInButton.boundingBox();
      expect(signInBox?.height).toBeGreaterThanOrEqual(44);
    });

    test("should have proper touch target sizes for flashcard elements", async ({ page }) => {
      // Login for flashcard tests
      await page.goto("/");
      await page.getByRole("button", { name: "Sign In" }).click();
      await page.waitForURL(/.*signin.*/);
      await page.fill('input[name="email"]', "test@sakumari.local");
      await page.fill('input[name="password"]', "TestPassword123!");
      await page.click('form[action*="credentials"] button[type="submit"]');
      await page.waitForURL("/");

      await page.goto("/hiragana");
      await page.waitForSelector('[data-testid="current-kana"]');

      // Check submit button size
      const submitButton = page.getByRole("button", { name: "Submit" });
      const submitBox = await submitButton.boundingBox();
      expect(submitBox?.height).toBeGreaterThanOrEqual(44);
      expect(submitBox?.width).toBeGreaterThanOrEqual(44);

      // Check mode switch buttons
      const typingButton = page.getByTestId("typing-button");
      const typingBox = await typingButton.boundingBox();
      expect(typingBox?.height).toBeGreaterThanOrEqual(44);

      const multipleChoiceButton = page.getByTestId("multiple-choice-button");
      const multipleChoiceBox = await multipleChoiceButton.boundingBox();
      expect(multipleChoiceBox?.height).toBeGreaterThanOrEqual(44);

      // Check multiple choice buttons
      await page.getByTestId("multiple-choice-button").click();
      await page.waitForSelector('[data-testid^="choice-button-"]');
      const choiceButton = page.getByTestId("choice-button-0");
      const choiceBox = await choiceButton.boundingBox();
      expect(choiceBox?.height).toBeGreaterThanOrEqual(44);
    });

    test("should maintain readability on small screens", async ({ page }) => {
      await page.goto("/");

      // Check main heading
      const heading = page.getByText("🌸 SakuMari 🌸");
      const headingBox = await heading.boundingBox();
      expect(headingBox?.height).toBeGreaterThan(20);

      // Check subtitle text
      const subtitleText = page.getByText("Japanese Kana Flashcard App");
      const subtitleBox = await subtitleText.boundingBox();
      expect(subtitleBox?.height).toBeGreaterThan(15);

      // Check flashcard readability
      await page.goto("/hiragana");
      await page.waitForSelector('[data-testid="current-kana"]');

      const kanaElement = page.getByTestId("current-kana");
      const kanaBox = await kanaElement.boundingBox();
      expect(kanaBox?.height).toBeGreaterThan(40);

      const input = page.getByPlaceholder("Type romaji equivalent...");
      const inputBox = await input.boundingBox();
      expect(inputBox?.height).toBeGreaterThanOrEqual(44);
    });
  });
});