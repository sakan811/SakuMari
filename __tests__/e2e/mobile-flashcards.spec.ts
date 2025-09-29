import { test, expect } from "@playwright/test";

test.describe("Mobile Flashcard Practice", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.context().addInitScript(() => {
      Object.defineProperty(navigator, 'platform', {
        get: () => 'iPhone',
      });
      Object.defineProperty(navigator, 'userAgent', {
        get: () => 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
      });
    });
  });

  test.describe("Hiragana Practice", () => {
    test("should display properly on mobile screens", async ({ page }) => {
      await page.goto("/hiragana");

      // Wait for kana to load
      await page.waitForSelector('[data-testid="current-kana"]');

      // Main elements should be visible
      await expect(page.getByTestId("current-kana")).toBeVisible();
      await expect(
        page.getByPlaceholder("Type romaji equivalent..."),
      ).toBeVisible();
      await expect(page.getByRole("button", { name: "Submit" })).toBeVisible();
      await expect(page.getByTestId("typing-button")).toBeVisible();
      await expect(page.getByTestId("multiple-choice-button")).toBeVisible();
    });

    test("should handle touch interactions for typing mode", async ({
      page,
    }) => {
      await page.goto("/hiragana");
      await page.waitForSelector('[data-testid="current-kana"]');

      // Type using mobile keyboard simulation
      const input = page.getByPlaceholder("Type romaji equivalent...");
      await input.fill("a");
      await expect(input).toHaveValue("a");

      // Submit via touch
      await page.getByRole("button", { name: "Submit" }).tap();
      await expect(
        page.getByText("Correct!").or(page.getByText("Incorrect!")),
      ).toBeVisible();
    });

    test("should switch to multiple choice mode on mobile", async ({
      page,
    }) => {
      await page.goto("/hiragana");
      await page.waitForSelector('[data-testid="current-kana"]');

      // Switch to multiple choice
      await page.getByTestId("multiple-choice-button").tap();

      // Should hide typing input and show choices
      await expect(
        page.getByPlaceholder("Type romaji equivalent..."),
      ).not.toBeVisible();
      await expect(page.getByText("Tap to select your answer")).toBeVisible();

      // Choice buttons should be large enough for touch
      await page.waitForSelector('[data-testid^="choice-button-"]');
      const choiceButton = page.getByTestId("choice-button-0");
      const box = await choiceButton.boundingBox();
      expect(box?.height).toBeGreaterThanOrEqual(44);
    });

    test("should handle multiple choice selection with touch", async ({
      page,
    }) => {
      await page.goto("/hiragana");
      await page.waitForSelector('[data-testid="current-kana"]');

      // Switch to multiple choice
      await page.getByTestId("multiple-choice-button").tap();
      await expect(page.getByText("Tap to select your answer")).toBeVisible();

      // Wait for choice buttons and tap first one
      await page.waitForSelector('[data-testid^="choice-button-"]');
      const firstChoice = page.getByTestId("choice-button-0");
      await firstChoice.tap();

      // Should be selected
      await expect(firstChoice).toHaveClass(/border-\[#d1622b\]/);

      // Submit answer
      await page.getByRole("button", { name: "Submit" }).tap();
      await expect(
        page.getByText("Correct!").or(page.getByText("Incorrect!")),
      ).toBeVisible();
    });

    test("should navigate to next card on mobile", async ({ page }) => {
      await page.goto("/hiragana");
      await page.waitForSelector('[data-testid="current-kana"]');

      // Answer current card
      await page.getByPlaceholder("Type romaji equivalent...").fill("a");
      await page.getByRole("button", { name: "Submit" }).tap();
      await expect(
        page.getByText("Correct!").or(page.getByText("Incorrect!")),
      ).toBeVisible();

      // Go to next card with touch
      await page.getByRole("button", { name: "Next Card" }).tap();

      // Should show new card
      await expect(page.getByText("Correct!")).not.toBeVisible();
      await expect(page.getByText("Incorrect!")).not.toBeVisible();
      await expect(
        page.getByPlaceholder("Type romaji equivalent..."),
      ).toBeVisible();
    });

    test("should validate empty input on mobile", async ({ page }) => {
      await page.goto("/hiragana");
      await page.waitForSelector('[data-testid="current-kana"]');

      // Try to submit without input using touch
      await page.getByRole("button", { name: "Submit" }).tap();

      // Should show validation error
      await expect(page.getByText("Please enter an answer")).toBeVisible();
    });

    test("should handle keyboard input on mobile", async ({ page }) => {
      await page.goto("/hiragana");
      await page.waitForSelector('[data-testid="current-kana"]');

      // Type answer and press Enter (simulates mobile keyboard)
      const input = page.getByPlaceholder("Type romaji equivalent...");
      await input.fill("a");
      await input.press("Enter");

      // Should show result
      await expect(
        page.getByText("Correct!").or(page.getByText("Incorrect!")),
      ).toBeVisible();

      // Press Enter to go to next card
      await page.keyboard.press("Enter");

      // Should show new card with empty input
      await expect(input).toHaveValue("");
      await expect(input).toBeVisible();
    });

    test("should be usable in landscape orientation", async ({ page }) => {
      await page.setViewportSize({ width: 667, height: 375 });
      await page.goto("/hiragana");
      await page.waitForSelector('[data-testid="current-kana"]');

      // Should still work properly in landscape
      await expect(page.getByTestId("current-kana")).toBeVisible();
      await expect(
        page.getByPlaceholder("Type romaji equivalent..."),
      ).toBeVisible();
      await expect(page.getByRole("button", { name: "Submit" })).toBeVisible();

      // Test interaction
      await page.getByPlaceholder("Type romaji equivalent...").fill("a");
      await page.getByRole("button", { name: "Submit" }).tap();
      await expect(
        page.getByText("Correct!").or(page.getByText("Incorrect!")),
      ).toBeVisible();
    });
  });

  test.describe("Katakana Practice", () => {
    test("should work properly on mobile screens", async ({ page }) => {
      await page.goto("/katakana");
      await page.waitForSelector('[data-testid="current-kana"]');

      // Should display properly
      await expect(page.getByTestId("current-kana")).toBeVisible();
      await expect(
        page.getByPlaceholder("Type romaji equivalent..."),
      ).toBeVisible();
      await expect(page.getByRole("button", { name: "Submit" })).toBeVisible();

      // Test interaction
      await page.getByPlaceholder("Type romaji equivalent...").fill("a");
      await page.getByRole("button", { name: "Submit" }).tap();
      await expect(
        page.getByText("Correct!").or(page.getByText("Incorrect!")),
      ).toBeVisible();
    });

    test("should handle mode switching on mobile", async ({ page }) => {
      await page.goto("/katakana");
      await page.waitForSelector('[data-testid="current-kana"]');

      // Test multiple choice mode
      await page.getByTestId("multiple-choice-button").tap();
      await expect(page.getByText("Tap to select your answer")).toBeVisible();

      // Test typing mode
      await page.getByTestId("typing-button").tap();
      await expect(
        page.getByPlaceholder("Type romaji equivalent..."),
      ).toBeVisible();
    });
  });

  test.describe("Mobile Performance", () => {
    test("should load quickly on mobile", async ({ page }) => {
      const startTime = Date.now();
      await page.goto("/hiragana");
      await page.waitForSelector('[data-testid="current-kana"]');
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(3000); // Should load within 3 seconds
    });

    test("should respond quickly to touch interactions", async ({ page }) => {
      await page.goto("/hiragana");
      await page.waitForSelector('[data-testid="current-kana"]');

      // Test button response time
      const button = page.getByTestId("multiple-choice-button");
      const startTime = Date.now();
      await button.tap();
      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(200); // Should respond within 200ms

      await expect(page.getByText("Tap to select your answer")).toBeVisible();
    });
  });

  test.describe("Mobile Accessibility", () => {
    test("should have proper touch target sizes", async ({ page }) => {
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
    });

    test("should maintain readability on small screens", async ({ page }) => {
      await page.goto("/hiragana");
      await page.waitForSelector('[data-testid="current-kana"]');

      // Check kana character size
      const kanaElement = page.getByTestId("current-kana");
      const kanaBox = await kanaElement.boundingBox();
      expect(kanaBox?.height).toBeGreaterThan(40); // Should be readable

      // Check input field size
      const input = page.getByPlaceholder("Type romaji equivalent...");
      const inputBox = await input.boundingBox();
      expect(inputBox?.height).toBeGreaterThanOrEqual(44);
    });
  });
});
